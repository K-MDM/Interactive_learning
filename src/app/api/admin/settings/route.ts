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

    const { key, value } = await request.json();

    if (!key || !value) {
      return NextResponse.json({ error: 'Key and Value are required' }, { status: 400 });
    }

    // Upsert using the admin service role client (bypasses RLS writes)
    const adminClient = createAdminClient();
    const { error: dbError } = await adminClient
      .from('settings')
      .upsert({ key, value });

    if (dbError) {
      console.error('Settings DB Error:', dbError);
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin Settings API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
