import { createAdminClient } from '@/lib/supabase/server';
import { verifyLicenceToken } from '@/lib/licenceJwt';
import { NextResponse } from 'next/server';

/**
 * GET /api/flutter/profile
 *
 * Returns profile info for custom Licence JWT or Supabase Auth session.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const adminClient = createAdminClient();
    const now = new Date();

    // 1. Try Custom Licence JWT
    const licencePayload = verifyLicenceToken(token);
    if (licencePayload) {
      const { data: licence } = await adminClient
        .from('licences')
        .select(`
          id,
          key,
          status,
          expires_at,
          organisations (
            name
          )
        `)
        .eq('id', licencePayload.licence_id)
        .single();

      if (!licence || licence.status === 'revoked') {
        return NextResponse.json({ error: 'Licence key is invalid or revoked' }, { status: 401 });
      }

      const isExpired = licence.status === 'expired' || (licence.expires_at && new Date(licence.expires_at) <= now);
      const subscriptionStatus = (!isExpired && licence.status === 'active') ? 'active' : 'expired';

      return NextResponse.json({
        id: licence.id,
        email: licence.key,
        role: 'student',
        subscription: {
          status: subscriptionStatus,
          expires_at: licence.expires_at,
        },
        school: licence.organisations ? {
          licenseActive: subscriptionStatus === 'active',
          schoolName: (licence.organisations as any)?.name || 'Enterprise',
          expiresAt: licence.expires_at,
          joinedAt: licence.expires_at,
        } : null,
        checkout_url: 'https://keeel.ai/checkout',
      });
    }

    // 2. Fallback: Supabase User Token
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
        web_subscription_expires_at
      `)
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let subscriptionStatus: 'active' | 'expired' | 'none' = 'none';
    let subscriptionExpiresAt: string | null = null;

    if (profile.web_subscription_active && profile.web_subscription_expires_at) {
      const exp = new Date(profile.web_subscription_expires_at);
      subscriptionStatus = exp > now ? 'active' : 'expired';
      subscriptionExpiresAt = profile.web_subscription_expires_at;
    }

    return NextResponse.json({
      id: profile.id,
      email: profile.email,
      role: profile.role,
      subscription: {
        status: subscriptionStatus,
        expires_at: subscriptionExpiresAt,
      },
      school: null,
      checkout_url: 'https://keeel.ai/checkout',
    });
  } catch (err: any) {
    console.error('Flutter profile GET error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
