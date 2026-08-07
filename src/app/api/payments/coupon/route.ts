import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Coupon code is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch coupon from DB
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: 'Coupon code does not exist' });
    }

    // Check if active
    if (!coupon.active) {
      return NextResponse.json({ valid: false, error: 'Coupon code is inactive' });
    }

    // Check if expired
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Coupon code has expired' });
    }

    const planId = searchParams.get('planId')?.trim();
    const price = searchParams.get('price') ? parseFloat(searchParams.get('price') || '') : null;
    const currency = searchParams.get('currency')?.toUpperCase() || 'USD';

    // Check minimum order amount
    if (coupon.min_order_amount !== null && coupon.min_order_amount !== undefined) {
      const minAmount = Number(coupon.min_order_amount);
      if (price === null || isNaN(price)) {
        return NextResponse.json({ valid: false, error: 'Invalid item price' });
      }

      if (currency === 'INR') {
        // If min_order_amount in DB is expressed as USD (e.g. <= 100 USD), scale to INR equivalent (~85 INR per USD)
        const minAmountInr = minAmount <= 100 ? minAmount * 85 : minAmount;
        if (price < minAmountInr) {
          return NextResponse.json({
            valid: false,
            error: `Minimum order of ₹${minAmountInr.toFixed(0)} INR required for this coupon`
          });
        }
      } else {
        if (price < minAmount) {
          return NextResponse.json({
            valid: false,
            error: `Minimum order of $${minAmount.toFixed(2)} USD required for this coupon`
          });
        }
      }
    }

    // Check eligible plans
    if (coupon.eligible_plan_ids && Array.isArray(coupon.eligible_plan_ids) && coupon.eligible_plan_ids.length > 0) {
      if (!planId || !coupon.eligible_plan_ids.includes(planId)) {
        return NextResponse.json({
          valid: false,
          error: 'This coupon is not valid for the selected plan'
        });
      }
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discount_percent,
    });
  } catch (error: any) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 });
  }
}
