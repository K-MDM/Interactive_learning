-- Add eligibility columns to coupons table
alter table public.coupons 
  add column if not exists eligible_plan_ids text[] default null,
  add column if not exists min_order_amount numeric(10, 2) default null;
