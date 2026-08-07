-- Migration: Add jurisdiction pricing columns to plans table
-- Run this script in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Add price_inr column for INR domestic pricing override
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS price_inr numeric(10, 2);

-- 2. Add country_prices JSONB column for per-country price matrices
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS country_prices jsonb DEFAULT '{}'::jsonb;

-- 3. Update existing default plan records with standard INR pricing
UPDATE public.plans 
SET price_inr = 990.00 
WHERE id = '1m' AND (price_inr IS NULL OR price_inr = 0);

UPDATE public.plans 
SET price_inr = 1499.00 
WHERE id = '6m' AND (price_inr IS NULL OR price_inr = 0);

UPDATE public.plans 
SET price_inr = 2499.00 
WHERE id = '12m' AND (price_inr IS NULL OR price_inr = 0);
