import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify role is school_admin or super_admin
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'school_admin' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch license
    const query = adminClient
      .from('school_licenses')
      .select('*');

    if (profile.role === 'school_admin') {
      query.eq('admin_profile_id', user.id);
    }

    const { data: licenses, error: dbError } = await query;
    if (dbError) {
      console.error('Fetch licenses error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch school license' }, { status: 500 });
    }

    return NextResponse.json({ license: licenses?.[0] || null });
  } catch (err: any) {
    console.error('School license route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
