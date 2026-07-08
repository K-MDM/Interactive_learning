import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
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

    const { noteId, isDemo } = await request.json();

    if (!noteId || isDemo === undefined) {
      return NextResponse.json({ error: 'Note ID and isDemo flag are required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error: dbError } = await adminClient
      .from('notes')
      .update({ is_demo: isDemo })
      .eq('id', noteId);

    if (dbError) {
      console.error('Note demo status DB Error:', dbError);
      return NextResponse.json({ error: 'Failed to update lesson demo status' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin Note Demo API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
