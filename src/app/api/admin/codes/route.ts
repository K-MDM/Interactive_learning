import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: List all codes under the school's license
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
      return NextResponse.json({ codes: [] });
    }

    // 2. Fetch codes
    const query = adminClient.from('school_codes').select('*');
    if (profile.role === 'school_admin' && license) {
      query.eq('license_id', license.id);
    }
    const { data: codes, error: dbError } = await query.order('created_at', { ascending: false });

    if (dbError) {
      console.error('Fetch school codes error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch codes' }, { status: 500 });
    }

    return NextResponse.json({ codes: codes || [] });
  } catch (err: any) {
    console.error('School codes GET route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new access code under the school's license
export async function POST(request: Request) {
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

    const { code, maxUses } = await request.json();
    if (!code || typeof code !== 'string' || !maxUses || isNaN(Number(maxUses)) || Number(maxUses) <= 0) {
      return NextResponse.json({ error: 'Invalid parameters provided' }, { status: 400 });
    }

    const formattedCode = code.trim().toUpperCase();

    // 1. Get current license ID
    const { data: license } = await adminClient
      .from('school_licenses')
      .select('*')
      .eq('admin_profile_id', user.id)
      .single();

    if (!license) {
      return NextResponse.json({ error: 'No active school license found for this account' }, { status: 400 });
    }

    // 2. Validate quota limits
    const remainingSeats = license.total_seats - license.used_seats;
    if (Number(maxUses) > remainingSeats) {
      return NextResponse.json({ error: `Cannot allocate ${maxUses} uses. Your license only has ${remainingSeats} remaining available seats.` }, { status: 400 });
    }

    // 3. Create code row
    const { data: newCode, error: insertError } = await adminClient
      .from('school_codes')
      .insert({
        license_id: license.id,
        code: formattedCode,
        max_uses: Number(maxUses)
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert school code error:', insertError);
      if (insertError.message.includes('unique') || insertError.message.includes('duplicate')) {
        return NextResponse.json({ error: 'That access code is already registered in the system.' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to create access code' }, { status: 500 });
    }

    return NextResponse.json({ success: true, code: newCode });
  } catch (err: any) {
    console.error('School codes POST route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
