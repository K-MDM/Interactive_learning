import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
    }

    const secret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'order.paid') {
      const order = payload.payload.order.entity;
      const userId = order.notes?.userId;
      const planId = order.notes?.planId || '12m';

      if (userId) {
        // Calculate expiry based on dynamic plan duration from plans table
        const adminSupabase = createAdminClient();
        const { data: planObj } = await adminSupabase
          .from('plans')
          .select('duration_months')
          .eq('id', planId)
          .single();

        const durationMonths = planObj?.duration_months || 1;

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

        const { error: dbError } = await adminSupabase
          .from('profiles')
          .update({
            web_subscription_active: true,
            web_subscription_expires_at: expiresAt.toISOString(),
          })
          .eq('id', userId);

        if (dbError) {
          console.error('Webhook DB Update Error:', dbError);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook failed' },
      { status: 500 }
    );
  }
}
