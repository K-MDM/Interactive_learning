import { createAdminClient } from '@/lib/supabase/server';
import { generateLicenceKey, signLicenceToken } from '@/lib/licenceJwt';
import { sendLicenceEmail } from '@/lib/sendLicenceEmail';
import { NextResponse } from 'next/server';

/**
 * POST /api/flutter/iap/activate
 *
 * Client-side immediate activation endpoint following a successful StoreKit 2 purchase or restore.
 * Issues a signed LicenceJwt token immediately so the Flutter app can download offline modules
 * without waiting for webhook delivery.
 *
 * Body:
 *   device_id: string
 *   product_id: string
 *   original_transaction_id?: string
 *   email?: string
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { device_id, product_id, original_transaction_id, email, force_transfer } = body;

    if (!device_id) {
      return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const lowerProduct = (product_id || '').toLowerCase();
    const durationMonths =
      lowerProduct.includes('1y') ||
      lowerProduct.includes('annual') ||
      lowerProduct.includes('yearly') ||
      lowerProduct.includes('12m')
        ? 12
        : 1;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

    // Optional: check if profile already exists for this email
    let purchaserProfileId: string | null = null;
    const sanitizedEmail = typeof email === 'string' && email.trim().includes('@') ? email.trim().toLowerCase() : null;
    if (sanitizedEmail) {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('email', sanitizedEmail)
        .maybeSingle();
      if (profile) {
        purchaserProfileId = profile.id;
      }
    }

    // 1. Look up existing licence by original_transaction_id (if restoring or renewing)
    let existingLicence: any = null;
    if (original_transaction_id) {
      const { data: activity } = await adminClient
        .from('licence_activity_log')
        .select('licence_id')
        .eq('metadata->>original_transaction_id', String(original_transaction_id))
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activity?.licence_id) {
        const { data: lic } = await adminClient
          .from('licences')
          .select('*')
          .eq('id', activity.licence_id)
          .maybeSingle();
        if (lic) {
          existingLicence = lic;
        }
      }
    }

    // Fallback: check if there is an active licence for this device_id
    if (!existingLicence) {
      const { data: licByDevice } = await adminClient
        .from('licences')
        .select('*')
        .eq('last_activated_device_id', device_id)
        .eq('status', 'active')
        .maybeSingle();
      if (licByDevice) {
        existingLicence = licByDevice;
      }
    }

    let licence = existingLicence;

    // 2. If licence exists and is bound to a DIFFERENT device:
    if (licence && licence.last_activated_device_id && licence.last_activated_device_id !== device_id) {
      if (force_transfer !== true) {
        return NextResponse.json({
          success: false,
          requires_transfer: true,
          licence_key: licence.key,
          current_device_id: licence.last_activated_device_id,
          message: 'This subscription licence is currently active on another device.',
        });
      }

      // Check 180-day cooldown before transferring
      if (licence.last_deactivated_at && !licence.is_super) {
        const lastDeact = new Date(licence.last_deactivated_at);
        const diffMs = Date.now() - lastDeact.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const cooldownDays = 180;

        if (diffDays < cooldownDays) {
          const daysRemaining = cooldownDays - diffDays;
          return NextResponse.json(
            {
              success: false,
              cooldown_blocked: true,
              days_remaining: daysRemaining,
              error: `Device transfer limit reached. You can only transfer a licence once every ${cooldownDays} days. Please try again in ${daysRemaining} days or contact support.`,
            },
            { status: 403 }
          );
        }
      }

      // Rebind to this device
      const nowIso = new Date().toISOString();
      await adminClient
        .from('licences')
        .update({
          last_activated_device_id: device_id,
          last_deactivated_at: nowIso,
          activated_at: nowIso,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          ...(purchaserProfileId ? { purchaser_profile_id: purchaserProfileId } : {}),
        })
        .eq('id', licence.id);

      await adminClient.from('licence_activity_log').insert({
        licence_id: licence.id,
        action: 'transferred_via_iap_restore',
        metadata: {
          device_id,
          product_id,
          original_transaction_id,
        },
      });
    } else if (!licence) {
      // 3. New licence generation
      const key = generateLicenceKey();
      const { data: newLicence, error: insertError } = await adminClient
        .from('licences')
        .insert({
          key,
          duration_months: durationMonths,
          purchaser_profile_id: purchaserProfileId,
          source: 'mobile',
          type: 'paid',
          status: 'active',
          activated_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          last_activated_device_id: device_id,
        })
        .select('*')
        .single();

      if (insertError) {
        return NextResponse.json({ error: 'Failed to create mobile licence' }, { status: 500 });
      }
      licence = newLicence;
    } else {
      // 4. Renew expiry on existing same-device licence
      await adminClient
        .from('licences')
        .update({
          expires_at: expiresAt.toISOString(),
          last_activated_device_id: device_id,
          status: 'active',
          ...(purchaserProfileId ? { purchaser_profile_id: purchaserProfileId } : {}),
        })
        .eq('id', licence.id);
    }

    // Send email with Licence Key and QR code to purchaser
    if (sanitizedEmail && licence) {
      sendLicenceEmail({
        toEmail: sanitizedEmail,
        licenceKey: licence.key,
        durationMonths,
        userName: sanitizedEmail.split('@')[0],
      }).catch((err) => console.error('[IAP Activate API] Failed to send licence email:', err));
    }

    // Sign standard Licence JWT token for Flutter app
    const token = signLicenceToken(
      {
        licence_id: licence.id,
        licence_key: licence.key,
        device_id: device_id,
        role: 'student',
      },
      durationMonths * 30
    );

    // Audit log
    await adminClient.from('licence_activity_log').insert({
      licence_id: licence.id,
      action: 'iap_activated',
      metadata: {
        device_id,
        product_id,
        original_transaction_id,
        email: sanitizedEmail,
      },
    });

    return NextResponse.json({
      success: true,
      token,
      licence_key: licence.key,
      expires_at: expiresAt.toISOString(),
      email_sent: !!sanitizedEmail,
    });
  } catch (err: any) {
    console.error('[IAP Activate API] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to activate IAP licence' },
      { status: 500 }
    );
  }
}
