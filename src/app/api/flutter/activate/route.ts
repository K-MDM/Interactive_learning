import { createAdminClient } from '@/lib/supabase/server';
import { signLicenceToken } from '@/lib/licenceJwt';
import { NextResponse } from 'next/server';

/**
 * POST /api/flutter/activate
 *
 * Body:
 *   licence_key  string  Key in format KEEL-XXXX-XXXX (or raw 12 chars)
 *   device_id    string  Unique device hardware identifier
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { licence_key, device_id } = body;

    if (!licence_key || typeof licence_key !== 'string') {
      return NextResponse.json(
        { error: 'Licence key is required' },
        { status: 400 }
      );
    }

    if (!device_id || typeof device_id !== 'string') {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    // Normalize licence key
    let normalizedKey = licence_key.trim().toUpperCase().replace(/\s+/g, '');
    // Insert hyphens if user typed without hyphens (e.g. KEELA3X7BN9K)
    if (!normalizedKey.includes('-') && normalizedKey.length === 12 && normalizedKey.startsWith('KEEL')) {
      normalizedKey = `KEEL-${normalizedKey.substring(4, 8)}-${normalizedKey.substring(8, 12)}`;
    }

    const adminClient = createAdminClient();

    // Fetch licence record
    const { data: licence, error: fetchError } = await adminClient
      .from('licences')
      .select('*')
      .eq('key', normalizedKey)
      .single();

    if (fetchError || !licence) {
      return NextResponse.json(
        { error: 'Invalid licence key' },
        { status: 404 }
      );
    }

    const now = new Date();

    // Check Revoked status
    if (licence.status === 'revoked') {
      return NextResponse.json(
        { error: 'This licence key has been revoked' },
        { status: 400 }
      );
    }

    // Check Expired status
    if (licence.status === 'expired' || (licence.expires_at && new Date(licence.expires_at) <= now)) {
      if (licence.status !== 'expired') {
        // Auto-mark expired in DB
        await adminClient
          .from('licences')
          .update({ status: 'expired' })
          .eq('id', licence.id);
      }
      return NextResponse.json(
        { error: 'This licence key has expired' },
        { status: 400 }
      );
    }

    // Check Active status on a different device
    if (licence.status === 'active') {
      if (licence.last_activated_device_id && licence.last_activated_device_id !== device_id) {
        return NextResponse.json(
          { error: 'This licence key is already activated on another device' },
          { status: 400 }
        );
      }
    }

    let expiryDate = licence.expires_at ? new Date(licence.expires_at) : null;

    // Handle initial activation
    if (licence.status === 'pending') {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + (licence.duration_months || 12));

      // Update licence status
      const { error: updateError } = await adminClient
        .from('licences')
        .update({
          status: 'active',
          activated_at: now.toISOString(),
          expires_at: expiryDate.toISOString(),
          last_activated_device_id: device_id,
        })
        .eq('id', licence.id);

      if (updateError) {
        console.error('Failed to update licence activation status:', updateError);
        return NextResponse.json(
          { error: 'Failed to activate licence' },
          { status: 500 }
        );
      }

      // Log activation event
      const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
      await adminClient.from('licence_activity_log').insert({
        licence_id: licence.id,
        action: 'activated',
        metadata: {
          device_id,
          ip: clientIp,
          activated_at: now.toISOString(),
        },
      });
    }

    // Calculate token expiration days (matching licence expiry)
    const daysUntilExpiry = expiryDate
      ? Math.max(1, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 365;

    // Issue JWT token
    const token = signLicenceToken(
      {
        licence_id: licence.id,
        licence_key: normalizedKey,
        device_id,
        role: 'student',
      },
      daysUntilExpiry
    );

    return NextResponse.json({
      message: 'Licence activated successfully',
      token,
      licence_key: normalizedKey,
      expires_at: expiryDate ? expiryDate.toISOString() : null,
    });
  } catch (err: any) {
    console.error('Licence activation endpoint error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
