-- 1. Create Plans Table
create table if not exists public.plans (
  id text primary key,
  name text not null,
  duration_months integer not null,
  price_usd numeric(10, 2) not null,
  discount_percent integer not null default 0,
  subtext text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row-Level Security
alter table public.plans enable row level security;

-- 3. Create Public Read Policy
create policy "Anyone can read plans" on public.plans
  for select using (true);

-- 4. Seed Default Plans
insert into public.plans (id, name, duration_months, price_usd, discount_percent, subtext) values
('1m', '1 Month Plan', 1, 9.99, 0, 'Billed monthly'),
('6m', '6 Months Plan', 6, 14.99, 0, 'Best value discount built-in'),
('12m', '12 Months (Introductory Offer)', 12, 99.99, 20, 'Introductory annual deal')
on conflict (id) do update set
  name = excluded.name,
  duration_months = excluded.duration_months,
  price_usd = excluded.price_usd,
  discount_percent = excluded.discount_percent,
  subtext = excluded.subtext;

-- 5. Add is_demo column to Notes table if it doesn't exist
alter table public.notes add column if not exists is_demo boolean not null default false;
