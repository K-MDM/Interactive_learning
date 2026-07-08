-- Create transactions table for KPIs and billing tracking
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text not null,
  plan_id text not null,
  amount_paid numeric(10,2) not null,
  currency text not null,
  coupon_code text,
  razorpay_payment_id text unique not null,
  razorpay_order_id text not null,
  status text not null default 'pending',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.transactions enable row level security;

-- Policy to allow users to view their own transactions
create policy "Users can view their own transactions" on public.transactions
  for select using (auth.uid() = user_id);
