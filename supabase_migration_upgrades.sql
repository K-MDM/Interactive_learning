-- =======================================================
-- SQL Upgrade Script for KEEEL AI Subscription Platform
-- Copy and paste this into the Supabase SQL Editor
-- =======================================================

-- 1. Add fields to profiles table for Name and Phone
alter table public.profiles 
  add column if not exists full_name text,
  add column if not exists phone text;

-- 2. Create coupons table
create table if not exists public.coupons (
  code text primary key,
  discount_percent integer not null check (discount_percent >= 0 and discount_percent <= 100),
  active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Create settings table for dynamic prices and download a
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS on new tables
alter table public.coupons enable row level security;
alter table public.settings enable row level security;

-- 5. RLS Policies (Allow authenticated read, restrict write to admin client)
create policy "Authenticated users can read coupons" on public.coupons
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can read settings" on public.settings
  for select using (auth.role() = 'authenticated');

-- 6. Insert default settings (Seed data)
insert into public.settings (key, value)
values 
  ('pricing', '{
    "plans": {
      "1m": 9.99,
      "6m": 14.99,
      "12m": 99.99
    },
    "intro_discount_percent": 20,
    "tax_percent": 18
  }'::jsonb),
  ('downloads', '{
    "android": "https://play.google.com/store/apps/details?id=com.keeelai.notes",
    "macos": "https://keeelai.com/downloads/keeelai-notes.dmg",
    "windows": "https://keeelai.com/downloads/keeelai-notes-setup.exe"
  }'::jsonb)
on conflict (key) do nothing;

-- 7. Insert a default coupon for testing
insert into public.coupons (code, discount_percent, active, expires_at)
values ('SAVE20', 20, true, now() + interval '1 year')
on conflict (code) do nothing;

-- 8. Update signup trigger to automatically extract full_name and phone from metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    email, 
    full_name, 
    phone
  )
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', ''), 
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do update
  set 
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    phone = coalesce(excluded.phone, profiles.phone);
  return new;
end;
$$ language plpgsql security definer;
