import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendContactEmail } from '@/lib/sendContactEmail';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function generateTicketRef(supabase: ReturnType<typeof createAdminClient>): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await (await supabase)
    .from('contact_tickets')
    .select('*', { count: 'exact', head: true });
  const seq = String((count ?? 0) + 1).padStart(5, '0');
  return `TKT-${year}-${seq}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Validate inputs
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }
    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }
    if (!subject?.trim()) {
      return NextResponse.json({ error: 'Subject is required.' }, { status: 400 });
    }
    if (!message?.trim() || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const ticketRef = await generateTicketRef(supabase);

    // Save ticket to DB
    const { error: dbError } = await supabase
      .from('contact_tickets')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        ticket_ref: ticketRef,
        status: 'open',
      });

    if (dbError) {
      console.error('[/api/contact] DB insert error:', dbError);
      return NextResponse.json(
        { error: 'Could not save your message. Please try again.' },
        { status: 500 }
      );
    }

    // Send emails (non-blocking on failure — ticket is already saved)
    sendContactEmail({
      toEmail: email.trim(),
      name: name.trim(),
      subject: subject.trim(),
      message: message.trim(),
      ticketRef,
    }).catch((err) => console.error('[/api/contact] Email send error:', err));

    return NextResponse.json({ ticketRef }, { status: 201 });
  } catch (err) {
    console.error('[/api/contact] Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
  }
}
