import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // 1. Get total notes count
    const { count: notesCount, error: notesErr } = await adminClient
      .from('notes')
      .select('*', { count: 'exact', head: true });
    
    // 2. Get active coupons count
    const { count: couponsCount, error: couponsErr } = await adminClient
      .from('coupons')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    // 3. Get active subscribers count
    const { count: subscribersCount, error: subsErr } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('web_subscription_active', true);

    // 4. Get recent signups
    const { data: recentSignups, error: signupsErr } = await adminClient
      .from('profiles')
      .select('email, created_at, web_subscription_active')
      .order('created_at', { ascending: false })
      .limit(5);

    // 5. Get transactions for KPIs and table logs
    const { data: txs, error: txsErr } = await adminClient
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (notesErr || couponsErr || subsErr || signupsErr || txsErr) {
      throw new Error('Failed to load database counts and transactions');
    }

    // Calculate actual revenue totals
    let totalRevenueUsd = 0;
    let totalRevenueInr = 0;
    if (txs) {
      txs.forEach((tx: any) => {
        if (tx.currency === 'INR') {
          totalRevenueInr += Number(tx.amount_paid);
        } else {
          totalRevenueUsd += Number(tx.amount_paid);
        }
      });
    }

    const recentTransactions = txs ? txs.slice(0, 10) : [];

    // Calculate estimated monthly recurring revenue (e.g. active subscribers * $14.99 avg price)
    const estimatedMRR = (subscribersCount || 0) * 14.99;

    return NextResponse.json({
      notesCount: notesCount || 0,
      couponsCount: couponsCount || 0,
      subscribersCount: subscribersCount || 0,
      estimatedMRR,
      totalRevenueUsd,
      totalRevenueInr,
      recentSignups: recentSignups || [],
      recentTransactions
    });
  } catch (error: any) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
