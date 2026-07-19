import { createAdminClient } from '@/lib/supabase/server';
import { verifyLicenceToken } from '@/lib/licenceJwt';
import { NextResponse } from 'next/server';

/**
 * POST /api/flutter/deactivate
 * Wipes current device binding for a licence key with a 180-day rate limit constraint.
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const licencePayload = verifyLicenceToken(token);

    if (!licencePayload) {
      return NextResponse.json({ error: 'Invalid licence token' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const now = new Date();

    // 1. Fetch deactivation cooldown setting (default 180 days)
    let cooldownDays = 180;
    try {
      const { data: setting } = await adminClient
        .from('settings')
        .select('value')
        .eq('key', 'deactivation_cooldown_days')
        .single();

      if (setting && setting.value) {
        cooldownDays = parseInt(String(setting.value), 10) || 180;
      }
    } catch (_) {}

    // 2. Fetch Licence record
    const { data: licence, error: fetchErr } = await adminClient
      .from('licences')
      .select('id, key, status, last_deactivated_at, last_activated_device_id')
      .eq('id', licencePayload.licence_id)
      .single();

    if (fetchErr || !licence) {
      return NextResponse.json({ error: 'Licence not found' }, { status: 404 });
    }

    // 3. Enforce 180-day Deactivation Rate Limit Policy
    if (licence.last_deactivated_at) {
      const lastDeact = new Date(licence.last_deactivated_at);
      const diffMs = now.getTime() - lastDeact.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < cooldownDays) {
        const daysRemaining = cooldownDays - diffDays;
        return NextResponse.json(
          {
            error: `Device deactivation rate limit reached. You can only deactivate a licence key once every ${cooldownDays} days. Please try again in ${daysRemaining} days or contact support.`,
            days_remaining: daysRemaining,
          },
          { status: 403 }
        );
      }
    }

    // 4. Update Licence Record -> reset status to pending & record last_deactivated_at
    const { error: updateErr } = await adminClient
      .from('licences')
      .update({
        status: 'pending',
        last_activated_device_id: null,
        last_deactivated_at: now.toISOString(),
      })
      .eq('id', licence.id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // 5. Audit Log Entry
    await adminClient.from('licence_activity_log').insert({
      licence_id: licence.id,
      action: 'deactivated',
      metadata: {
        deactivated_at: now.toISOString(),
        previous_device_id: licence.last_activated_device_id,
        cooldown_days_applied: cooldownDays,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Device key deactivated successfully. Key is now available for new activation.',
    });
  } catch (err: any) {
    console.error('Deactivation API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
