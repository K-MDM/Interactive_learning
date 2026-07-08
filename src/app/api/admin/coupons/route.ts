import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// 1. Create a coupon
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

    const { code, discountPercent, expiresAt, eligiblePlanIds, minOrderAmount } = await request.json();

    if (!code || !discountPercent) {
      return NextResponse.json({ error: 'Code and Discount percentage are required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data: coupon, error: dbError } = await adminClient
      .from('coupons')
      .insert({
        code: code.trim().toUpperCase(),
        discount_percent: discountPercent,
        active: true,
        expires_at: expiresAt || null,
        eligible_plan_ids: eligiblePlanIds && eligiblePlanIds.length > 0 ? eligiblePlanIds : null,
        min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : null
      })
      .select()
      .single();

    if (dbError) {
      console.error('Coupon Create DB Error:', dbError);
      return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 });
  }
}

// 2. Toggle active status
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, active } = await request.json();

    if (!code || active === undefined) {
      return NextResponse.json({ error: 'Code and Active state are required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error: dbError } = await adminClient
      .from('coupons')
      .update({ active })
      .eq('code', code);

    if (dbError) {
      console.error('Coupon Toggle DB Error:', dbError);
      return NextResponse.json({ error: 'Failed to toggle coupon state' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 });
  }
}

// 3. Delete a coupon
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error: dbError } = await adminClient
      .from('coupons')
      .delete()
      .eq('code', code);

    if (dbError) {
      console.error('Coupon Delete DB Error:', dbError);
      return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 });
  }
}
