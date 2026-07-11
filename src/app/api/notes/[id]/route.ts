import { createAdminClient, createClient } from '@/lib/supabase/server';
import { verifyOldAppSignature } from '@/lib/crypto';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const oldAppUserId = searchParams.get('userId');
    const oldAppExpiry = searchParams.get('expiry');
    const oldAppSignature = searchParams.get('signature');

    // 1. Fetch Note Metadata
    const adminClient = createAdminClient();
    const { data: note, error: noteError } = await adminClient
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (noteError || !note) {
      return new Response('Note not found', { status: 404 });
    }

    let isAuthorized = false;

    // 2. Check if note is a public demo lesson
    if (note.is_demo) {
      isAuthorized = true;
    }

    // 3. Attempt validation via Old App HMAC Signed URL
    if (!isAuthorized && oldAppUserId && oldAppExpiry && oldAppSignature) {
      isAuthorized = verifyOldAppSignature(
        id,
        oldAppUserId,
        oldAppExpiry,
        oldAppSignature
      );
    }

    // 4. If not authorized by URL, check Supabase auth & web subscription
    if (!isAuthorized) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Query the profiles table using Admin Client to check role and subscription status
        const { data: profile, error: dbError } = await adminClient
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

        if (!dbError && profile) {
          // 1. Super admins and school admins have full access
          if (profile.role === 'super_admin' || profile.role === 'school_admin') {
            isAuthorized = true;
          }
          // 2. Individual web subscription check
          else if (profile.web_subscription_active) {
            const expiresAt = new Date(profile.web_subscription_expires_at);
            if (expiresAt > new Date()) {
              isAuthorized = true;
            }
          }
          
          // 3. School license membership check
          if (!isAuthorized && Array.isArray(profile.school_memberships) && profile.school_memberships.length > 0) {
            const membership: any = profile.school_memberships[0];
            const license = membership?.school_licenses;
            if (license && license.is_active) {
              const licenseExpiresAt = new Date(license.expires_at);
              if (licenseExpiresAt > new Date()) {
                isAuthorized = true;
              }
            }
          }
        }
      }
    }

    if (!isAuthorized) {
      return new Response('Unauthorized or Subscription Expired', { status: 403 });
    }

    // 4. Download file from private Supabase Storage
    const { data: fileData, error: storageError } = await adminClient.storage
      .from('interactive-notes')
      .download(note.storage_path);

    if (storageError || !fileData) {
      console.error('Supabase Storage Error:', storageError);
      return new Response('Error loading content from storage', { status: 500 });
    }

    // 5. Stream HTML file content directly
    const buffer = Buffer.from(await fileData.arrayBuffer());

    return new Response(buffer, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https:; img-src 'self' data: https:; media-src 'self' data: https:;",
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (error: any) {
    console.error('Note Retrieval Error:', error);
    return new Response(error.message || 'Internal Server Error', { status: 500 });
  }
}
