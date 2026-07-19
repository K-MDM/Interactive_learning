import { createAdminClient, createClient } from '@/lib/supabase/server';
import { verifyLicenceToken } from '@/lib/licenceJwt';
import { NextResponse } from 'next/server';

/**
 * GET /api/flutter/notes/[id]/meta
 *
 * Returns note metadata + taxonomy tags.
 * No file content — safe to call without subscription.
 * The `is_demo` field tells the Flutter app whether to show a paywall.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminClient = createAdminClient();

    const { data: note, error } = await adminClient
      .from('notes')
      .select(`
        id,
        title,
        description,
        is_demo,
        created_at,
        note_taxonomy (
          board_id,
          class_id,
          subject_id,
          boards   ( id, name, slug ),
          classes  ( id, name, slug ),
          subjects ( id, name, slug, icon_emoji )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !note) {
      return NextResponse.json({ error: 'Note not found', message: 'Note not found' }, { status: 404 });
    }

    // Check if the user is premium via Custom Licence JWT or Supabase Session
    let isPremium = false;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // 1. Custom Licence JWT Check
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
            isPremium = true;
          }
        }
      }

      // 2. Fallback: Supabase User Session
      if (!isPremium) {
        const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
        if (!authError && user) {
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
            if (profile.role === 'super_admin' || profile.role === 'school_admin') {
              isPremium = true;
            } else if (profile.web_subscription_active) {
              const exp = new Date(profile.web_subscription_expires_at);
              if (exp > new Date()) isPremium = true;
            }
            if (!isPremium && Array.isArray(profile.school_memberships) && profile.school_memberships.length > 0) {
              const license = (profile.school_memberships[0] as any)?.school_licenses;
              if (license?.is_active && new Date(license.expires_at) > new Date()) {
                isPremium = true;
              }
            }
          }
        }
      }
    }

    const isLocked = !note.is_demo && !isPremium;

    return NextResponse.json({
      id:          note.id,
      title:       note.title,
      description: note.description || '',
      is_demo:     note.is_demo,
      is_locked:   isLocked,
      play_url:    isLocked ? null : `/webview/notes/${note.id}`,
      created_at:  note.created_at,
      taxonomy:    ((note as any).note_taxonomy || []).map((t: any) => ({
        board:   t.boards   ? { id: t.boards.id,   name: t.boards.name,   slug: t.boards.slug }   : null,
        class:   t.classes  ? { id: t.classes.id,  name: t.classes.name,  slug: t.classes.slug }  : null,
        subject: t.subjects ? {
          id:         t.subjects.id,
          name:       t.subjects.name,
          slug:       t.subjects.slug,
          icon_emoji: t.subjects.icon_emoji,
        } : null,
      })),
    });
  } catch (err: any) {
    console.error('Flutter note meta error:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
