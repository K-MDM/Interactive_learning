import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/user/licences
 * Returns all licence keys owned by the authenticated web user.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: licences, error } = await adminClient
      .from('licences')
      .select('*')
      .eq('purchaser_profile_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ licences: licences || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
