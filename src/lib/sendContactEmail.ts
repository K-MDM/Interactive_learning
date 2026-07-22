/**
 * Email helper for contact/support ticket notifications and admin replies.
 * Reuses the same Supabase Edge Function pattern as sendLicenceEmail.
 */

const SUPPORT_EMAIL = 'support@keeelai.com';

export interface SendContactEmailParams {
  toEmail: string;
  name: string;
  subject: string;
  message: string;
  ticketRef: string;
}

export interface SendAdminReplyParams {
  toEmail: string;
  userName: string;
  ticketRef: string;
  replyMessage: string;
  ticketSubject: string;
}

async function callEdgeFunction(payload: Record<string, string>): Promise<boolean> {
  const edgeFunctionUrl = process.env.SUPABASE_EDGE_EMAIL_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!edgeFunctionUrl) {
    console.log('[Email Mock] Contact email payload:', payload);
    return true;
  }

  try {
    const res = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.error('[sendContactEmail] Edge function call failed:', err);
    return false;
  }
}

export async function sendContactEmail({
  toEmail,
  name,
  subject,
  message,
  ticketRef,
}: SendContactEmailParams): Promise<boolean> {
  // 1. Notify support team
  const supportOk = await callEdgeFunction({
    to: SUPPORT_EMAIL,
    subject: `[${ticketRef}] New Support Request: ${subject}`,
    ticket_ref: ticketRef,
    from_name: name,
    from_email: toEmail,
    message_body: message,
    email_type: 'contact_support_notify',
  });

  // 2. Confirm to the submitter
  const userOk = await callEdgeFunction({
    to: toEmail,
    subject: `We received your message — ${ticketRef}`,
    ticket_ref: ticketRef,
    user_name: name,
    message_subject: subject,
    email_type: 'contact_user_confirm',
  });

  return supportOk && userOk;
}

export async function sendAdminReplyEmail({
  toEmail,
  userName,
  ticketRef,
  replyMessage,
  ticketSubject,
}: SendAdminReplyParams): Promise<boolean> {
  return await callEdgeFunction({
    to: toEmail,
    subject: `Re: [${ticketRef}] ${ticketSubject}`,
    ticket_ref: ticketRef,
    user_name: userName,
    message_body: replyMessage,
    email_type: 'contact_admin_reply',
  });
}
