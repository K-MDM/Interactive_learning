import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST: Create a new School Admin account and allocate their seat license
export async function POST(request: Request) {
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

    const { email, password, schoolName, totalSeats, durationMonths } = await request.json();
    if (!email || !password || !schoolName || !totalSeats || !durationMonths) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const seats = Number(totalSeats);
    const months = Number(durationMonths);

    if (isNaN(seats) || seats <= 0 || isNaN(months) || months <= 0) {
      return NextResponse.json({ error: 'Invalid numerical parameters' }, { status: 400 });
    }

    // 1. Create User in Supabase Auth via Admin client
    const { data: authData, error: authCreateError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authCreateError) {
      console.error('Super Admin Auth User Creation Error:', authCreateError);
      return NextResponse.json({ error: `Auth registration failed: ${authCreateError.message}` }, { status: 400 });
    }

    const newUserId = authData.user.id;

    // 2. Set profile role to 'school_admin'
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id: newUserId,
        email: email,
        role: 'school_admin',
        web_subscription_active: false // Explicitly false since access is license-based
      });

    if (profileError) {
      console.error('Super Admin Profile Creation Error:', profileError);
      // Clean up Auth user to maintain transactional integrity
      await adminClient.auth.admin.deleteUser(newUserId);
      return NextResponse.json({ error: 'Failed to initialize school admin profile' }, { status: 500 });
    }

    // 3. Create License record
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    const { error: licenseError } = await adminClient
      .from('school_licenses')
      .insert({
        admin_profile_id: newUserId,
        school_name: schoolName,
        total_seats: seats,
        expires_at: expiresAt.toISOString()
      });

    if (licenseError) {
      console.error('Super Admin License Creation Error:', licenseError);
      // Clean up tables & Auth user to maintain transactional integrity
      await adminClient.from('profiles').delete().eq('id', newUserId);
      await adminClient.auth.admin.deleteUser(newUserId);
      return NextResponse.json({ error: 'Failed to initialize school license' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Successfully registered ${schoolName} administrator account!` });
  } catch (err: any) {
    console.error('Super admin admins POST route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
