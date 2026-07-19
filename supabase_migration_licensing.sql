-- Migration: Universal Licence Key System Schema
-- Description: Adds organisations, licences, and licence_activity_log tables.

-- 1. Organisations Table
CREATE TABLE IF NOT EXISTS organisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enums for Licence attributes
DO $$ BEGIN
    CREATE TYPE licence_source AS ENUM ('mobile', 'web', 'dashboard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE licence_type AS ENUM ('free', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE licence_status AS ENUM ('pending', 'active', 'expired', 'revoked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Licences Table
CREATE TABLE IF NOT EXISTS licences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE, -- e.g., KEEL-A3X7-BN9K
    duration_months INTEGER NOT NULL DEFAULT 12,
    organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
    purchaser_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    source licence_source NOT NULL DEFAULT 'web',
    type licence_type NOT NULL DEFAULT 'paid',
    status licence_status DEFAULT 'pending' NOT NULL,
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    last_activated_device_id TEXT,
    last_deactivated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Licence Activity Log Table (Audit trail)
CREATE TABLE IF NOT EXISTS licence_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    licence_id UUID REFERENCES licences(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL, -- e.g., 'created', 'activated', 'transferred', 'expired', 'revoked'
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_licences_key ON licences(key);
CREATE INDEX IF NOT EXISTS idx_licences_status ON licences(status);
CREATE INDEX IF NOT EXISTS idx_licences_org ON licences(organisation_id);
CREATE INDEX IF NOT EXISTS idx_licence_activity_log_licence ON licence_activity_log(licence_id);
