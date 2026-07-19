/**
 * Email helper service for licence key delivery.
 * Supports sending via Supabase Edge Function or custom SMTP endpoint.
 */

export interface SendLicenceEmailParams {
  toEmail: string;
  licenceKey: string;
  durationMonths: number;
  userName?: string;
}

export async function sendLicenceEmail({
  toEmail,
  licenceKey,
  durationMonths,
  userName = 'Learner',
}: SendLicenceEmailParams): Promise<boolean> {
  const edgeFunctionUrl = process.env.SUPABASE_EDGE_EMAIL_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!edgeFunctionUrl) {
    console.log(`[Email Mock] Licence key ${licenceKey} issued for ${toEmail}`);
    return true;
  }

  try {
    const res = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        to: toEmail,
        subject: 'Your Keeelai Platform Licence Key',
        licence_key: licenceKey,
        duration_months: durationMonths,
        user_name: userName,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=keeel://activate?key=${licenceKey}`,
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to send licence email via Edge function:', err);
    return false;
  }
}
