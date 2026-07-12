import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/flutter/profile
 *
 * Returns the authenticated user's profile including:
 * - email
 * - subscription status (active, expired, none)
 * - school membership info (if any)
 *
 * Auth: Required — Bearer token (Supabase JWT)
 */
export async function GET(request: Request) {
  try {
    // Validate Bearer token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const adminClient = createAdminClient();
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select(`
        id,
        email,
        role,
        web_subscription_active,
        web_subscription_expires_at,
        school_memberships (
          id,
          joined_at,
          school_licenses (
            school_name,
            is_active,
            expires_at,
            total_seats,
            used_seats
          )
        )
      `)
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Flutter profile fetch error:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Determine subscription state
    const now = new Date();
    let subscriptionStatus: 'active' | 'expired' | 'none' = 'none';
    let subscriptionExpiresAt: string | null = null;

    if (profile.web_subscription_active && profile.web_subscription_expires_at) {
      const exp = new Date(profile.web_subscription_expires_at);
      subscriptionStatus = exp > now ? 'active' : 'expired';
      subscriptionExpiresAt = profile.web_subscription_expires_at;
    }

    // School membership info
    const memberships = (profile as any).school_memberships || [];
    let schoolInfo: {
      licenseActive: boolean;
      schoolName: string;
      expiresAt: string;
      joinedAt: string;
    } | null = null;

    if (memberships.length > 0) {
      const m = memberships[0];
      const lic = m.school_licenses;
      if (lic) {
        const licenseActive = lic.is_active && new Date(lic.expires_at) > now;
        // School membership overrides web subscription status
        if (licenseActive && subscriptionStatus === 'none') {
          subscriptionStatus = 'active';
        }
        schoolInfo = {
          licenseActive,
          schoolName: lic.school_name,
          expiresAt: lic.expires_at,
          joinedAt: m.joined_at,
        };
      }
    }

    return NextResponse.json({
      id:    profile.id,
      email: profile.email,
      role:  profile.role,
      subscription: {
        status:     subscriptionStatus,
        expires_at: subscriptionExpiresAt,
      },
      school: schoolInfo,
      // Checkout URL — Flutter app opens this in browser for upgrades
      checkout_url: 'https://keeel.ai/checkout',
    });
  } catch (err: any) {
    console.error('Flutter profile GET error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
