import { createAdminClient, createClient } from '@/lib/supabase/server';
import { getUsdToInrRate } from '@/lib/exchangeRate';
import { NextResponse } from 'next/server';
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

    const { planId, couponCode, currency } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: 'No plan selected' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Fetch dynamic pricing from plans table
    const { data: plan, error: planError } = await adminClient
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Selected plan not found' },
        { status: 400 }
      );
    }

    const basePlanPriceUsd = Number(plan.price_usd);
    const planDiscountPercent = plan.discount_percent || 0;
    let priceUsd = basePlanPriceUsd * (1 - planDiscountPercent / 100);

    // Fetch tax rate from settings pricing
    let taxPercent = 18;
    const { data: pricingSetting } = await adminClient
      .from('settings')
      .select('value')
      .eq('key', 'pricing')
      .single();

    if (pricingSetting && pricingSetting.value) {
      taxPercent = pricingSetting.value.tax_percent || 18;
    }

    // 3. Apply Coupon Code if valid
    let couponDiscountPercent = 0;
    if (couponCode) {
      const { data: coupon } = await adminClient
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('active', true)
        .single();

      if (!coupon) {
        return NextResponse.json({ error: 'Coupon code does not exist' }, { status: 400 });
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Coupon code has expired' }, { status: 400 });
      }

      // Validate minimum order amount
      if (coupon.min_order_amount !== null && coupon.min_order_amount !== undefined) {
        if (priceUsd < coupon.min_order_amount) {
          return NextResponse.json({
            error: `Minimum order of $${Number(coupon.min_order_amount).toFixed(2)} USD required for this coupon`
          }, { status: 400 });
        }
      }

      // Validate eligible plans
      if (coupon.eligible_plan_ids && Array.isArray(coupon.eligible_plan_ids) && coupon.eligible_plan_ids.length > 0) {
        if (!coupon.eligible_plan_ids.includes(planId)) {
          return NextResponse.json({ error: 'This coupon is not valid for the selected plan' }, { status: 400 });
        }
      }

      couponDiscountPercent = coupon.discount_percent;
      priceUsd = priceUsd * (1 - couponDiscountPercent / 100);
    }

    // 4. Determine Currency conversion
    let targetCurrency = currency === 'INR' ? 'INR' : 'USD';
    let finalBaseAmount = priceUsd;

    if (targetCurrency === 'INR') {
      const conversionRate = await getUsdToInrRate();
      finalBaseAmount = priceUsd * conversionRate;
    }

    // 5. Calculate Tax (Globally flat)
    const taxAmount = finalBaseAmount * (taxPercent / 100);
    const totalAmount = finalBaseAmount + taxAmount;

    // Smallest currency unit (paise for INR, cents for USD)
    const finalAmountInSmallestUnit = Math.round(totalAmount * 100);
    const receipt = `rcpt_${planId}_${user.id.substring(0, 8)}_${Date.now()}`;

    const options: any = {
      amount: finalAmountInSmallestUnit,
      currency: targetCurrency,
      receipt,
      notes: {
        userId: user.id,
        planId,
        couponCode: couponCode || '',
        taxPercent: taxPercent.toString(),
        taxAmount: taxAmount.toFixed(2),
        basePriceUsd: basePlanPriceUsd.toString(),
        currency: targetCurrency,
      },
    };

    // 6. Create Razorpay order with auto-fallback to INR if USD fails (e.g. international payments not active in Razorpay profile)
    let order;
    try {
      order = await getRazorpay().orders.create(options);
    } catch (apiError: any) {
      console.warn(
        `Razorpay order failed with currency ${targetCurrency}, falling back to INR. Error:`,
        apiError.message
      );

      if (targetCurrency === 'USD') {
        targetCurrency = 'INR';
        const conversionRate = await getUsdToInrRate();
        const fallbackBaseAmount = priceUsd * conversionRate;
        const fallbackTaxAmount = fallbackBaseAmount * (taxPercent / 100);
        const fallbackTotal = fallbackBaseAmount + fallbackTaxAmount;

        options.amount = Math.round(fallbackTotal * 100);
        options.currency = 'INR';
        options.notes.currency = 'INR';
        options.notes.taxAmount = fallbackTaxAmount.toFixed(2);

        order = await getRazorpay().orders.create(options);
      } else {
        throw apiError;
      }
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
      user: {
        email: user.email,
        id: user.id,
      },
    });
  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
