// import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
// const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Keeelai <notifications@keeelai.com>";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
// };

// interface EmailPayload {
//   to: string;
//   subject: string;
//   email_type?: "licence_key" | "contact_support_notify" | "contact_user_confirm";
//   // Licence fields
//   licence_key?: string;
//   duration_months?: number;
//   user_name?: string;
//   qr_code_url?: string;
//   // Contact ticket fields
//   ticket_ref?: string;
//   from_name?: string;
//   from_email?: string;
//   message_body?: string;
//   message_subject?: string;
// }

// function generateHtml(payload: EmailPayload): string {
//   const type = payload.email_type || "licence_key";

//   if (type === "contact_support_notify") {
//     return `
//       <!DOCTYPE html>
//       <html>
//         <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a;">
//           <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0;">
//             <h2 style="color: #2563eb; margin-top: 0;">New Support Ticket</h2>
//             <p style="font-size: 14px; color: #475569;"><strong>Ticket Ref:</strong> ${payload.ticket_ref || 'N/A'}</p>
//             <p style="font-size: 14px; color: #475569;"><strong>Name:</strong> ${payload.from_name || 'N/A'}</p>
//             <p style="font-size: 14px; color: #475569;"><strong>Email:</strong> ${payload.from_email || 'N/A'}</p>
//             <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
//             <p style="font-size: 14px; font-weight: bold;">Message Body:</p>
//             <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 14px; white-space: pre-wrap;">${payload.message_body || ''}</div>
//           </div>
//         </body>
//       </html>
//     `;
//   }

//   if (type === "contact_user_confirm") {
//     return `
//       <!DOCTYPE html>
//       <html>
//         <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a;">
//           <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0;">
//             <h2 style="color: #0f172a; margin-top: 0;">We received your support request!</h2>
//             <p style="font-size: 15px; color: #475569;">Hi ${payload.user_name || 'there'},</p>
//             <p style="font-size: 14px; color: #475569; line-height: 1.6;">Thank you for contacting Keeelai Education Support. Our operations team has received your ticket regarding <strong>"${payload.message_subject || 'your request'}"</strong>.</p>
//             <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 12px; text-align: center; margin: 24px 0;">
//               <span style="font-size: 12px; font-weight: bold; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; display: block;">Ticket Reference ID</span>
//               <strong style="font-size: 24px; color: #1d4ed8; font-family: monospace; display: block; margin-top: 4px;">${payload.ticket_ref || 'N/A'}</strong>
//             </div>
//             <p style="font-size: 13px; color: #64748b;">Our typical response time is within 2 hours during business hours. Please keep this ticket reference ID for any follow-up inquiries.</p>
//             <p style="font-size: 13px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px;">— Keeelai Education Team</p>
//           </div>
//         </body>
//       </html>
//     `;
//   }

//   // Default: Licence key delivery
//   return `
//     <!DOCTYPE html>
//     <html>
//       <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a;">
//         <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0;">
//           <h2 style="color: #2563eb; margin-top: 0;">Your Keeelai Platform Licence</h2>
//           <p style="font-size: 15px; color: #475569;">Hi ${payload.user_name || 'Learner'},</p>
//           <p style="font-size: 14px; color: #475569;">Your subscription has been activated for <strong>${payload.duration_months || 12} months</strong>. Here is your activation key:</p>
//           <div style="background: #f8fafc; border: 2px dashed #cbd5e1; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
//             <span style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 4px;">Licence Key</span>
//             <strong style="font-size: 22px; color: #0f172a; font-family: monospace; letter-spacing: 2px;">${payload.licence_key || ''}</strong>
//           </div>
//           ${payload.qr_code_url ? `
//             <div style="text-align: center; margin: 20px 0;">
//               <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">Scan with Keeelai App to auto-activate:</p>
//               <img src="${payload.qr_code_url}" alt="QR Activation Code" width="160" height="160" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; background: #fff;" />
//             </div>
//           ` : ''}
//           <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Enter this key inside the Keeelai Mobile / Desktop App settings to unlock full access.</p>
//         </div>
//       </body>
//     </html>
//   `;
// }

// Deno.serve(async (req: Request) => {
//   // Handle CORS preflight
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders });
//   }

//   try {
//     const payload: EmailPayload = await req.json();

//     if (!payload.to || !payload.subject) {
//       return new Response(
//         JSON.stringify({ error: "Missing required fields: 'to' or 'subject'" }),
//         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const htmlContent = generateHtml(payload);

//     // Send via Resend API
//     if (RESEND_API_KEY) {
//       const resendRes = await fetch("https://api.resend.com/emails", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${RESEND_API_KEY}`,
//         },
//         body: JSON.stringify({
//           from: FROM_EMAIL,
//           to: [payload.to],
//           subject: payload.subject,
//           html: htmlContent,
//         }),
//       });

//       const resendData = await resendRes.json();

//       if (!resendRes.ok) {
//         console.error("Resend API error:", resendData);
//         return new Response(
//           JSON.stringify({ error: "Failed to send email via Resend", details: resendData }),
//           { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }

//       return Response.json(resendData, { headers: corsHeaders });
//     }

//     // Fallback Mock Mode
//     console.log("[Edge Function Mock Email Sent]:", {
//       to: payload.to,
//       subject: payload.subject,
//       email_type: payload.email_type,
//     });

//     return Response.json(
//       { success: true, message: "Mock email processed (no RESEND_API_KEY set)." },
//       { headers: corsHeaders }
//     );
//   } catch (err: any) {
//     console.error("Edge function error:", err);
//     return new Response(
//       JSON.stringify({ error: err.message || "Internal server error" }),
//       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//     );
//   }
// });
