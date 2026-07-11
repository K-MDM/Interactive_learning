import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: Retrieve all school licenses with admin emails and statistics globally
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify role is strictly super_admin
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all licenses joined with admin emails
    const { data: licenses, error: dbError } = await adminClient
      .from('school_licenses')
      .select(`
        *,
        admin_profile:profiles!school_licenses_admin_profile_id_fkey (
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Super Admin fetch licenses error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch global licenses list' }, { status: 500 });
    }

    const formattedLicenses = (licenses || []).map((lic: any) => ({
      ...lic,
      adminEmail: lic.admin_profile?.email || 'unassigned@admin.com'
    }));

    return NextResponse.json({ licenses: formattedLicenses });
  } catch (err: any) {
    console.error('Super admin licenses GET route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
