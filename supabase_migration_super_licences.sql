-- Migration: Super Licence Key for Multi-Device / App Store Review
-- Description: Adds is_super column to licences table and seeds KEEEL-PLAY-2099 master key.

-- 1. Add is_super column to licences table
ALTER TABLE licences 
ADD COLUMN IF NOT EXISTS is_super BOOLEAN NOT NULL DEFAULT false;

-- 2. Create index for fast query performance
CREATE INDEX IF NOT EXISTS idx_licences_is_super ON licences(is_super);

-- 3. Seed Google Play Console / Multi-device Reviewer Key
INSERT INTO licences (
    key,
    duration_months,
    source,
    type,
    status,
    is_super,
    activated_at,
    expires_at,
    created_at
) VALUES (
    'KEEEL-PLAY-2099',
    1200,
    'dashboard',
    'paid',
    'active',
    true,
    now(),
    '2099-12-31T23:59:59Z',
    now()
) ON CONFLICT (key) DO UPDATE SET 
    is_super = true,
    status = 'active',
    expires_at = '2099-12-31T23:59:59Z';
