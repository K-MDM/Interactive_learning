import { createAdminClient, createClient } from '@/lib/supabase/server';
import { getCountryFromIp, resolveJurisdictionPricing } from '@/lib/geo';
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

    // 1. Detect User IP Country
    const countryCode = await getCountryFromIp(request);

    const adminClient = createAdminClient();

    // 2. Fetch Plan
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

    // 3. Fetch Pricing & Tax Settings
    let pricingSettings: any = {};
    const { data: pricingSetting } = await adminClient
      .from('settings')
      .select('value')
      .eq('key', 'pricing')
      .single();

    if (pricingSetting && pricingSetting.value) {
      pricingSettings = pricingSetting.value;
    }

    // 4. Apply Coupon Code if valid
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

      // Validate eligible plans
      if (coupon.eligible_plan_ids && Array.isArray(coupon.eligible_plan_ids) && coupon.eligible_plan_ids.length > 0) {
        if (!coupon.eligible_plan_ids.includes(planId)) {
          return NextResponse.json({ error: 'This coupon is not valid for the selected plan' }, { status: 400 });
        }
      }

      // Validate min order amount
      if (coupon.min_order_amount !== null && coupon.min_order_amount !== undefined) {
        const baseRes = resolveJurisdictionPricing(plan, countryCode, pricingSettings, 0, currency);
        const minAmount = Number(coupon.min_order_amount);
        let minRequired = minAmount;
        if (baseRes.currency === 'INR') {
          minRequired = minAmount <= 100 ? minAmount * 85 : minAmount;
        }
        if (baseRes.discountedPrice < minRequired) {
          return NextResponse.json({ error: 'Minimum order amount for coupon not met' }, { status: 400 });
        }
      }

      couponDiscountPercent = Number(coupon.discount_percent || 0);
    }

    // 5. Resolve Jurisdiction Pricing & Tax
    const resolved = resolveJurisdictionPricing(plan, countryCode, pricingSettings, couponDiscountPercent, currency);

    let targetCurrency = resolved.currency;
    let finalAmount = resolved.total;

    // Smallest currency unit (paise for INR, cents for USD)
    let finalAmountInSmallestUnit = Math.round(finalAmount * 100);
    const receipt = `rcpt_${planId}_${user.id.substring(0, 8)}_${Date.now()}`;

    const options: any = {
      amount: finalAmountInSmallestUnit,
      currency: targetCurrency,
      receipt,
      notes: {
        userId: user.id,
        planId,
        couponCode: couponCode || '',
        countryCode: resolved.countryCode,
        isDomestic: resolved.isDomestic.toString(),
        taxMode: resolved.taxMode,
        taxPercent: resolved.taxPercent.toString(),
        taxAmount: resolved.taxAmount.toFixed(2),
        intlFeePercent: resolved.intlFeePercent.toString(),
        intlFeeAmount: resolved.intlFeeAmount.toFixed(2),
        basePrice: resolved.basePrice.toString(),
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
        // Fallback to INR at ~85 INR per USD if USD currency is rejected by Razorpay account settings
        targetCurrency = 'INR';
        const fallbackInrTotal = finalAmount * 85;
        options.amount = Math.round(fallbackInrTotal * 100);
        options.currency = 'INR';
        options.notes.currency = 'INR';

        order = await getRazorpay().orders.create(options);
      } else {
        throw apiError;
      }
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      resolvedPricing: resolved,
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
