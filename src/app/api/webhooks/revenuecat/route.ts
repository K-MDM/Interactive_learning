import { createAdminClient } from '@/lib/supabase/server';
import { generateLicenceKey } from '@/lib/licenceJwt';
import { sendLicenceEmail } from '@/lib/sendLicenceEmail';
import { NextResponse } from 'next/server';

/**
 * POST /api/webhooks/revenuecat
 *
 * Webhook handler for RevenueCat Apple App Store & Mac App Store subscription events.
 * Syncs StoreKit 2 subscriptions into Supabase `licences` and `profiles`.
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate webhook request
    const authHeader = request.headers.get('Authorization');
    const expectedSecret = process.env.REVENUECAT_WEBHOOK_AUTH_KEY;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized webhook' }, { status: 401 });
    }

    const body = await request.json();
    const event = body?.event;

    if (!event) {
      return NextResponse.json({ error: 'Invalid payload, missing event' }, { status: 400 });
    }

    const {
      type,
      app_user_id,
      product_id,
      expiration_at_ms,
      original_transaction_id,
      transaction_id,
      store,
      subscriber_attributes,
    } = event;

    // Extract email from RevenueCat attributes if set
    const subscriberEmail =
      subscriber_attributes?.$email?.value ||
      subscriber_attributes?.email?.value ||
      (typeof app_user_id === 'string' && app_user_id.includes('@') ? app_user_id : null);

    console.log(`[RevenueCat Webhook] Event: ${type} for User: ${app_user_id}, Product: ${product_id}, Email: ${subscriberEmail}`);

    const adminClient = createAdminClient();
    const isSupabaseUuid =
      typeof app_user_id === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        app_user_id
      );

    const expiresAt = expiration_at_ms ? new Date(expiration_at_ms) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const durationMonths = product_id?.includes('1y') || product_id?.includes('annual') ? 12 : 1;

    switch (type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION': {
        // 1. Update Profile if tied to an authenticated Supabase user
        if (isSupabaseUuid) {
          await adminClient
            .from('profiles')
            .update({
              web_subscription_active: true,
              web_subscription_expires_at: expiresAt.toISOString(),
            })
            .eq('id', app_user_id);
        }

        // 2. Find or create a matching mobile licence
        const { data: existingLicences } = await adminClient
          .from('licences')
          .select('id, key, status')
          .or(`purchaser_profile_id.eq.${isSupabaseUuid ? app_user_id : '00000000-0000-0000-0000-000000000000'}`);

        let licenceId: string | null = null;
        let licenceKey: string | null = null;
        if (existingLicences && existingLicences.length > 0) {
          licenceId = existingLicences[0].id;
          licenceKey = existingLicences[0].key;
          await adminClient
            .from('licences')
            .update({
              status: 'active',
              expires_at: expiresAt.toISOString(),
              duration_months: durationMonths,
            })
            .eq('id', licenceId);
        } else {
          const newKey = generateLicenceKey();
          licenceKey = newKey;
          const { data: inserted } = await adminClient
            .from('licences')
            .insert({
              key: newKey,
              duration_months: durationMonths,
              purchaser_profile_id: isSupabaseUuid ? app_user_id : null,
              source: 'mobile',
              type: 'paid',
              status: 'active',
              activated_at: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
            })
            .select('id')
            .single();

          licenceId = inserted?.id || null;
        }

        // Send email with Licence Key if email was captured
        if (subscriberEmail && licenceKey) {
          sendLicenceEmail({
            toEmail: subscriberEmail,
            licenceKey: licenceKey,
            durationMonths,
            userName: subscriberEmail.split('@')[0],
          }).catch((err) => console.error('[RevenueCat Webhook] Failed to send licence email:', err));
        }

        // 3. Log audit event
        if (licenceId) {
          await adminClient.from('licence_activity_log').insert({
            licence_id: licenceId,
            action: type.toLowerCase(),
            performed_by: isSupabaseUuid ? app_user_id : null,
            metadata: {
              store,
              product_id,
              original_transaction_id,
              transaction_id,
              event_id: event.id,
              email: subscriberEmail,
            },
          });
        }
        break;
      }

      case 'EXPIRATION': {
        if (isSupabaseUuid) {
          await adminClient
            .from('profiles')
            .update({
              web_subscription_active: false,
            })
            .eq('id', app_user_id);
        }

        if (isSupabaseUuid) {
          await adminClient
            .from('licences')
            .update({ status: 'expired' })
            .eq('purchaser_profile_id', app_user_id);
        }
        break;
      }

      case 'CANCELLATION':
      case 'BILLING_ISSUE': {
        console.warn(`[RevenueCat Webhook] Subscription notice: ${type} for user: ${app_user_id}`);
        break;
      }

      default:
        console.log(`[RevenueCat Webhook] Unhandled event type: ${type}`);
    }

    return NextResponse.json({ success: true, event: type });
  } catch (err: any) {
    console.error('[RevenueCat Webhook] Error processing event:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
