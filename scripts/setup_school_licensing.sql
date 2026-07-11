-- Migration: K-12 School Licensing and Student Seats System Setup
-- Run this script in the Supabase SQL Editor.

-- 1. Extend profiles table with role field
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';

-- 2. Create school_licenses table
CREATE TABLE IF NOT EXISTS public.school_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_name VARCHAR NOT NULL,
  total_seats INTEGER NOT NULL,
  used_seats INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create school_codes table
CREATE TABLE IF NOT EXISTS public.school_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES public.school_licenses(id) ON DELETE CASCADE,
  code VARCHAR UNIQUE NOT NULL,
  max_uses INTEGER NOT NULL,
  current_uses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create school_memberships table
CREATE TABLE IF NOT EXISTS public.school_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_id UUID REFERENCES public.school_licenses(id) ON DELETE CASCADE,
  code_id UUID REFERENCES public.school_codes(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Row Level Security (RLS) Settings
ALTER TABLE public.school_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_memberships ENABLE ROW LEVEL SECURITY;

-- 6. Row Level Security Policies
-- School Licenses Policy: Admin can manage their own license; Super Admin sees all.
DROP POLICY IF EXISTS admin_licenses_policy ON public.school_licenses;
CREATE POLICY admin_licenses_policy ON public.school_licenses
  FOR ALL TO authenticated
  USING (
    admin_profile_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- School Codes Policy: Admin can manage codes for their license; Super Admin sees all.
DROP POLICY IF EXISTS admin_codes_policy ON public.school_codes;
CREATE POLICY admin_codes_policy ON public.school_codes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_licenses 
      WHERE public.school_licenses.id = public.school_codes.license_id 
      AND public.school_licenses.admin_profile_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- School Memberships Policy: Admin can view student memberships; Students can view their own.
DROP POLICY IF EXISTS admin_memberships_policy ON public.school_memberships;
CREATE POLICY admin_memberships_policy ON public.school_memberships
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_licenses 
      WHERE public.school_licenses.id = public.school_memberships.license_id 
      AND public.school_licenses.admin_profile_id = auth.uid()
    ) OR
    user_profile_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- 7. Trigger to dynamically keep used_seats in sync with school_memberships
CREATE OR REPLACE FUNCTION update_school_used_seats()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.school_licenses 
        SET used_seats = used_seats + 1 
        WHERE id = NEW.license_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.school_licenses 
        SET used_seats = used_seats - 1 
        WHERE id = OLD.license_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_used_seats ON public.school_memberships;
CREATE TRIGGER trg_update_used_seats
AFTER INSERT OR DELETE ON public.school_memberships
FOR EACH ROW EXECUTE FUNCTION update_school_used_seats();

-- 8. Atomic stored procedure function for code redemption
CREATE OR REPLACE FUNCTION redeem_school_code(student_id UUID, input_code TEXT)
RETURNS VOID AS $$
DECLARE
    target_license_id UUID;
    target_code_id UUID;
    max_uses_limit INT;
    current_code_uses INT;
    total_seats_limit INT;
    current_seats_used INT;
    license_suspended BOOLEAN;
    license_expired BOOLEAN;
BEGIN
    -- 1. Get code and license details
    SELECT id, license_id, max_uses, current_uses 
    INTO target_code_id, target_license_id, max_uses_limit, current_code_uses
    FROM public.school_codes WHERE code = input_code;
    
    IF target_code_id IS NULL THEN
        RAISE EXCEPTION 'Invalid access code';
    END IF;
    
    -- 2. Verify code usage cap
    IF current_code_uses >= max_uses_limit THEN
        RAISE EXCEPTION 'Access code usage limit reached';
    END IF;
    
    -- 3. Verify school license capacity and status
    SELECT total_seats, (NOT is_active), (expires_at < NOW())
    INTO total_seats_limit, license_suspended, license_expired
    FROM public.school_licenses WHERE id = target_license_id;
    
    IF license_suspended THEN
        RAISE EXCEPTION 'School license is suspended';
    END IF;
    
    IF license_expired THEN
        RAISE EXCEPTION 'School license is expired';
    END IF;
    
    SELECT COUNT(*) INTO current_seats_used 
    FROM public.school_memberships WHERE license_id = target_license_id;
    
    IF current_seats_used >= total_seats_limit THEN
        RAISE EXCEPTION 'No seats remaining on this school license';
    END IF;
    
    -- 4. Perform atomic insert (Trigger updates used_seats count)
    INSERT INTO public.school_memberships (user_profile_id, license_id, code_id, joined_at)
    VALUES (student_id, target_license_id, target_code_id, NOW());
    
    -- 5. Increment code uses counter
    UPDATE public.school_codes 
    SET current_uses = current_uses + 1 
    WHERE id = target_code_id;
    
    -- 6. Update user role
    UPDATE public.profiles
    SET role = 'student'
    WHERE id = student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
