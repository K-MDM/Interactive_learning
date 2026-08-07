import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, admin_notes } = body;

    const validStatuses = ['open', 'in_progress', 'resolved'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const updatePayload: Record<string, unknown> = { status };
    if (admin_notes !== undefined) updatePayload.admin_notes = admin_notes;
    if (status === 'resolved') updatePayload.resolved_at = new Date().toISOString();
    if (status !== 'resolved') updatePayload.resolved_at = null;

    const { error } = await supabase
      .from('contact_tickets')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.error('[/api/admin/tickets] Update error:', error);
      return NextResponse.json({ error: 'Failed to update ticket.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/admin/tickets] Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
  }
}
