import { createAdminClient } from '@/lib/supabase/server';
import { verifyLicenceToken } from '@/lib/licenceJwt';
import { NextResponse } from 'next/server';

/**
 * GET /api/flutter/notes
 *
 * Query params:
 *   board_id    UUID   Filter by board
 *   class_id    UUID   Filter by class
 *   subject_id  UUID   Filter by subject
 *   search      string Full-text search query (Supabase tsvector)
 *   is_demo     bool   Only show demo content
 *   page        int    Page number (default: 1)
 *   limit       int    Page size (default: 20, max: 50)
 *
 * Auth: Not required for demo content.
 *       Premium notes are included in results but the `is_locked` field
 *       signals the Flutter app to show a paywall. Actual content bytes
 *       are never returned here — only metadata.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const boardId       = searchParams.get('board_id');
    const classId       = searchParams.get('class_id');
    const subjectId     = searchParams.get('subject_id');
    const contentTypeId = searchParams.get('content_type_id');
    const search        = searchParams.get('search')?.trim();
    const isDemo        = searchParams.get('is_demo');
    const page          = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit         = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset        = (page - 1) * limit;

    const adminClient = createAdminClient();

    // Base select — never return storage_path to the public listing
    const hasFilter = !!(boardId || classId || subjectId);
    const hasContentTypeFilter = !!contentTypeId;
    const selectStr = `
      id,
      title,
      description,
      is_demo,
      created_at,
      note_taxonomy${hasFilter ? '!inner' : ''} (
        board_id,
        class_id,
        subject_id,
        boards   ( id, name, slug ),
        classes  ( id, name, slug ),
        subjects ( id, name, slug, icon_emoji )
      ),
      note_content_types${hasContentTypeFilter ? '!inner' : ''} (
        content_type_id,
        content_types ( id, name, slug, icon_emoji, color_hex )
      )
    `;

    let query = adminClient
      .from('notes')
      .select(selectStr, { count: 'exact' });

    // --- Filters ---
    if (isDemo === 'true') {
      query = query.eq('is_demo', true);
    }

    // Taxonomy filtering — filter through junction table (matches exact ID OR NULL wildcard)
    if (boardId) {
      query = query.or(`board_id.eq.${boardId},board_id.is.null`, { foreignTable: 'note_taxonomy' });
    }
    if (classId) {
      query = query.or(`class_id.eq.${classId},class_id.is.null`, { foreignTable: 'note_taxonomy' });
    }
    if (subjectId) {
      query = query.eq('note_taxonomy.subject_id', subjectId);
    }
    if (contentTypeId) {
      query = query.eq('note_content_types.content_type_id', contentTypeId);
    }

    // Full-text search via tsvector
    if (search && search.length > 0) {
      query = query.textSearch('search_vector', search, {
        type: 'websearch',
        config: 'english',
      });
    }

    // Pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Check if the user is premium via custom Licence JWT or Supabase Token
    let isPremium = false;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // 1. Try Custom Licence JWT
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
              web_subscription_expires_at
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
          }
        }
      }
    }

    const { data: notes, error, count } = await query;

    if (error) {
      console.error('Flutter notes list error:', error);
      return NextResponse.json({ error: 'Failed to fetch notes', message: 'Failed to fetch notes' }, { status: 500 });
    }

    // Map to clean Flutter-friendly shape
    const formattedNotes = (notes || []).map((note: any) => {
      const isLocked = !note.is_demo && !isPremium;
      return {
        id:          note.id,
        title:       note.title,
        description: note.description || '',
        is_demo:     note.is_demo,
        is_locked:   isLocked,
        play_url:    isLocked ? null : `/webview/notes/${note.id}`,
        created_at:  note.created_at,
        taxonomy:    (note.note_taxonomy || []).map((t: any) => ({
          board:   t.boards   ? { id: t.boards.id,   name: t.boards.name,   slug: t.boards.slug }   : null,
          class:   t.classes  ? { id: t.classes.id,  name: t.classes.name,  slug: t.classes.slug }  : null,
          subject: t.subjects ? { id: t.subjects.id, name: t.subjects.name, slug: t.subjects.slug, icon_emoji: t.subjects.icon_emoji } : null,
        })),
        content_types: (note.note_content_types || []).map((ct: any) => ({
          id:         ct.content_types?.id,
          name:       ct.content_types?.name,
          slug:       ct.content_types?.slug,
          icon_emoji: ct.content_types?.icon_emoji,
          color_hex:  ct.content_types?.color_hex,
        })).filter((x: any) => x.id),
      };
    });

    return NextResponse.json({
      notes: formattedNotes,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        total_pages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (err: any) {
    console.error('Flutter notes GET route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
