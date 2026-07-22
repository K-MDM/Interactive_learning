import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: tickets, error } = await supabase
      .from('contact_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[/api/admin/tickets] Fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tickets: tickets || [] });
  } catch (err: any) {
    console.error('[/api/admin/tickets] GET error:', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
