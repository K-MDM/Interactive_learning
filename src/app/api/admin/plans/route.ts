import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Verify session
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plans } = await request.json();

    if (!plans || !Array.isArray(plans)) {
      return NextResponse.json({ error: 'Plans array is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Sync plans: Delete any plans that are not in the new plans list
    const newPlanIds = plans.map((p: any) => p.id).filter(Boolean);
    if (newPlanIds.length > 0) {
      const { error: deleteErr } = await adminClient
        .from('plans')
        .delete()
        .not('id', 'in', `(${newPlanIds.join(',')})`);
      if (deleteErr) throw deleteErr;
    } else {
      const { error: deleteAllErr } = await adminClient
        .from('plans')
        .delete()
        .neq('id', '');
      if (deleteAllErr) throw deleteAllErr;
    }

    // 2. Upsert the new/updated plans list
    if (plans.length > 0) {
      const sanitizedPlans = plans.map((p: any) => ({
        id: p.id,
        name: p.name,
        duration_months: p.duration_months,
        price_usd: p.price_usd,
        discount_percent: p.discount_percent || 0,
        subtext: p.subtext || null
      }));

      const { error: upsertErr } = await adminClient
        .from('plans')
        .upsert(sanitizedPlans);
      if (upsertErr) throw upsertErr;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin Plans API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
