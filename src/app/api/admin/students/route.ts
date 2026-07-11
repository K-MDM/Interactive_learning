import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: List all students enrolled in this school admin's license
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'school_admin' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Get current license ID
    const { data: license } = await adminClient
      .from('school_licenses')
      .select('id')
      .eq('admin_profile_id', user.id)
      .single();

    if (!license && profile.role !== 'super_admin') {
      return NextResponse.json({ students: [] });
    }

    // 2. Fetch memberships joined with profiles
    const query = adminClient
      .from('school_memberships')
      .select(`
        id,
        joined_at,
        code_id,
        school_codes (
          code
        ),
        user_profile:profiles (
          id,
          email
        )
      `);

    if (profile.role === 'school_admin' && license) {
      query.eq('license_id', license.id);
    }

    const { data: memberships, error: dbError } = await query.order('joined_at', { ascending: false });

    if (dbError) {
      console.error('Fetch student memberships error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch student list' }, { status: 500 });
    }

    // Format output
    const students = (memberships || []).map((m: any) => ({
      membershipId: m.id,
      joinedAt: m.joined_at,
      code: m.school_codes?.code || 'DIRECT',
      studentId: m.user_profile?.id,
      email: m.user_profile?.email || 'unknown@student.com'
    }));

    return NextResponse.json({ students });
  } catch (err: any) {
    console.error('School students GET route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Revoke/delete a student membership (frees up a seat)
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'school_admin' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const membershipId = url.searchParams.get('membershipId');

    if (!membershipId) {
      return NextResponse.json({ error: 'Membership ID parameter required' }, { status: 400 });
    }

    // 1. Get current license ID for school admin validation
    let licenseId: string | null = null;
    if (profile.role === 'school_admin') {
      const { data: license } = await adminClient
        .from('school_licenses')
        .select('id')
        .eq('admin_profile_id', user.id)
        .single();

      if (!license) {
        return NextResponse.json({ error: 'No school license found' }, { status: 400 });
      }
      licenseId = license.id;
    }

    // 2. Fetch the target membership to verify ownership and find the user profile ID
    const { data: targetMembership } = await adminClient
      .from('school_memberships')
      .select('license_id, user_profile_id')
      .eq('id', membershipId)
      .single();

    if (!targetMembership) {
      return NextResponse.json({ error: 'Student membership record not found' }, { status: 404 });
    }

    if (profile.role === 'school_admin' && targetMembership.license_id !== licenseId) {
      return NextResponse.json({ error: 'Unauthorized seat modification' }, { status: 403 });
    }

    // 3. Remove membership (trigger updates license count dynamically)
    const { error: deleteError } = await adminClient
      .from('school_memberships')
      .delete()
      .eq('id', membershipId);

    if (deleteError) {
      console.error('Delete membership error:', deleteError);
      return NextResponse.json({ error: 'Failed to revoke seat' }, { status: 500 });
    }

    // 4. Reset user role back to default 'user'
    await adminClient
      .from('profiles')
      .update({ role: 'user' })
      .eq('id', targetMembership.user_profile_id);

    return NextResponse.json({ success: true, message: 'Student membership revoked successfully' });
  } catch (err: any) {
    console.error('School students DELETE route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
