import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendAdminReplyEmail } from '@/lib/sendContactEmail';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { replyMessage } = body;

    if (!replyMessage?.trim()) {
      return NextResponse.json({ error: 'Reply message cannot be empty.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch ticket details
    const { data: ticket, error: fetchErr } = await supabase
      .from('contact_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !ticket) {
      return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
    }

    // 2. Save reply to DB and mark resolved
    const { error: updateErr } = await supabase
      .from('contact_tickets')
      .update({
        admin_notes: replyMessage.trim(),
        status: 'resolved',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateErr) {
      console.error('[/api/admin/tickets/reply] Update error:', updateErr);
      return NextResponse.json({ error: 'Failed to update ticket.' }, { status: 500 });
    }

    // 3. Send email reply to user
    await sendAdminReplyEmail({
      toEmail: ticket.email,
      userName: ticket.name,
      ticketRef: ticket.ticket_ref,
      replyMessage: replyMessage.trim(),
      ticketSubject: ticket.subject,
    });

    return NextResponse.json({ ok: true, message: 'Reply sent successfully.' });
  } catch (err: any) {
    console.error('[/api/admin/tickets/reply] Error:', err);
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
  }
}
