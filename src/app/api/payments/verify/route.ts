import { createAdminClient, createClient } from '@/lib/supabase/server';
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

    // 3. Calculate expiry based on dynamic plan duration from plans table
    const adminSupabase = createAdminClient();
    const { data: planObj } = await adminSupabase
      .from('plans')
      .select('duration_months')
      .eq('id', planId)
      .single();

    const durationMonths = planObj?.duration_months || 1;

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

    // 4. Update user profile subscription via Service Client
    const { error: dbError } = await adminSupabase
      .from('profiles')
      .update({
        web_subscription_active: true,
        web_subscription_expires_at: expiresAt.toISOString(),
      })
      .eq('id', user.id);

    if (dbError) {
      console.error('Database Update Error:', dbError);
      return NextResponse.json(
        { error: 'Payment verified, but database update failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Subscription activated' });
  } catch (error: any) {
    console.error('Razorpay Verification Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
