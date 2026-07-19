import { createAdminClient, createClient } from '@/lib/supabase/server';
import { generateLicenceKey } from '@/lib/licenceJwt';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';

let razorpayInstance: Razorpay | null = null;

function getRazorpay() {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }
  return razorpayInstance;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Verify cryptographic signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Fetch order from Razorpay to retrieve metadata (planId)
    const razorpayOrder = await getRazorpay().orders.fetch(razorpay_order_id);
    const planId = (razorpayOrder.notes?.planId as string) || '12m';

    // 3. Calculate plan duration
    const adminSupabase = createAdminClient();
    const { data: planObj } = await adminSupabase
      .from('plans')
      .select('duration_months')
      .eq('id', planId)
      .single();

    const durationMonths = planObj?.duration_months || 12;

    // 4. Generate a unique Licence Key
    const licenceKey = generateLicenceKey();

    // 5. Insert new Licence into DB
    const { data: newLicence, error: licenceError } = await adminSupabase
      .from('licences')
      .insert({
        key: licenceKey,
        duration_months: durationMonths,
        purchaser_profile_id: user.id,
        source: 'web',
        type: 'paid',
        status: 'pending',
      })
      .select()
      .single();

    if (licenceError || !newLicence) {
      console.error('Failed to create licence key:', licenceError);
      return NextResponse.json(
        { error: 'Payment verified, but licence generation failed' },
        { status: 500 }
      );
    }

    // Log creation activity
    await adminSupabase.from('licence_activity_log').insert({
      licence_id: newLicence.id,
      action: 'created',
      performed_by: user.id,
      metadata: {
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        plan_id: planId,
        duration_months: durationMonths,
      },
    });

    // 6. Log transaction details
    try {
      const amountPaid = (Number(razorpayOrder.amount) || 0) / 100;
      const currencyPaid = razorpayOrder.currency || 'USD';
      const couponCodeApplied = razorpayOrder.notes?.couponCode || null;

      await adminSupabase
        .from('transactions')
        .upsert({
          user_id: user.id,
          user_email: user.email || '',
          plan_id: planId,
          amount_paid: amountPaid,
          currency: currencyPaid,
          coupon_code: couponCodeApplied,
          razorpay_payment_id: razorpay_payment_id,
          razorpay_order_id: razorpay_order_id,
          status: 'completed'
        }, { onConflict: 'razorpay_payment_id' });
    } catch (txErr) {
      console.error('Transaction logging failed:', txErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Licence key generated successfully',
      licence_key: licenceKey,
      duration_months: durationMonths,
    });
  } catch (error: any) {
    console.error('Razorpay Verification Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
