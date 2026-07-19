import { createAdminClient, createClient } from '@/lib/supabase/server';
import { verifyLicenceToken } from '@/lib/licenceJwt';
import { NextResponse } from 'next/server';

/**
 * GET /api/flutter/notes/[id]/download
 *
 * Streams the raw HTML simulation file to the Flutter app.
 * Flutter app receives the bytes, AES-encrypts them, and stores them locally.
 *
 * Auth: Required via Bearer token (Supabase JWT).
 * Demo notes: freely accessible without auth.
 * Premium notes: require active web_subscription OR active school_membership.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Fetch note metadata
    const adminClient = createAdminClient();
    const { data: note, error: noteError } = await adminClient
      .from('notes')
      .select('id, title, is_demo, storage_path')
      .eq('id', id)
      .single();

    if (noteError || !note) {
      return new Response(JSON.stringify({ error: 'Note not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let isAuthorized = false;

    // 2. Demo notes are freely downloadable
    if (note.is_demo) {
      isAuthorized = true;
    }

    // 3. For premium notes — check Bearer token (Custom Licence JWT or Supabase Token)
    if (!isAuthorized) {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Authorization required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const token = authHeader.substring(7);

      // 3a. Custom Licence Key JWT Check
      const licencePayload = verifyLicenceToken(token);
      if (licencePayload) {
        const { data: licence } = await adminClient
          .from('licences')
          .select('status, expires_at')
          .eq('id', licencePayload.licence_id)
          .single();

        if (licence && licence.status === 'active') {
          const exp = licence.expires_at ? new Date(licence.expires_at) : null;
          if (!exp || exp > new Date()) {
            isAuthorized = true;
          }
        }
      }

      // 3b. Fallback: Supabase User Session
      if (!isAuthorized) {
        const { data: { user }, error: authError } = await adminClient.auth.getUser(token);

        if (authError || !user) {
          return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Check profile for subscription or school license
        const { data: profile } = await adminClient
          .from('profiles')
          .select(`
            role,
            web_subscription_active,
            web_subscription_expires_at,
            school_memberships (
              school_licenses (
                is_active,
                expires_at
              )
            )
          `)
          .eq('id', user.id)
          .single();

        if (profile) {
          // Super/school admins have full access
          if (profile.role === 'super_admin' || profile.role === 'school_admin') {
            isAuthorized = true;
          }
          // Active web subscription
          else if (profile.web_subscription_active) {
            const exp = new Date(profile.web_subscription_expires_at);
            if (exp > new Date()) isAuthorized = true;
          }
          // Active school license membership
          if (!isAuthorized && Array.isArray(profile.school_memberships) && profile.school_memberships.length > 0) {
            const license = (profile.school_memberships[0] as any)?.school_licenses;
            if (license?.is_active && new Date(license.expires_at) > new Date()) {
              isAuthorized = true;
            }
          }
        }
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({
        error: 'SubscriptionRequired',
        message: 'This simulation requires a premium subscription. Please upgrade your account to access it.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Download from Supabase Storage
    const { data: fileData, error: storageError } = await adminClient.storage
      .from('interactive-notes')
      .download(note.storage_path);

    if (storageError || !fileData) {
      console.error('Flutter storage download error:', storageError);
      return new Response(JSON.stringify({ error: 'Content unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    // 5. Return raw bytes — Flutter will encrypt these client-side
    return new Response(buffer, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Length': buffer.length.toString(),
        // Note title as filename hint
        'Content-Disposition': `attachment; filename="${note.id}.html"`,
        // Private — never cache in shared/CDN cache
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err: any) {
    console.error('Flutter note download error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
