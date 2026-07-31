import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/flutter/browse-filters
 *
 * Progressive endpoint that returns filter options with actual content.
 * Uses get_browse_filters stored RPC for maximum performance (<30ms).
 *
 * Query params:
 *   - (none)                → available_categories + others info
 *   - content_type_id=<id>  → also returns available_classes
 *   - content_type_id + class_id → also returns available_subjects
 *
 * Public — no auth required. Cached 5 min.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contentTypeId = searchParams.get('content_type_id');
    const classId = searchParams.get('class_id');

    const admin = createAdminClient();

    // 1. High-Performance SQL RPC Function Execution
    const { data: rpcData, error: rpcError } = await admin.rpc('get_browse_filters', {
      p_content_type_id: contentTypeId === 'others' ? null : contentTypeId,
      p_class_id: classId,
    });

    if (!rpcError && rpcData) {
      return NextResponse.json(rpcData, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        },
      });
    }

    if (rpcError) {
      console.warn('RPC get_browse_filters not found or failed, using JS fallback:', rpcError.message);
    }

    // 2. Fallback JS Implementation
    const response: Record<string, unknown> = {};

    const [categoriesRes, allNctRes, notesCountRes] = await Promise.all([
      admin
        .from('content_types')
        .select('id, name, slug, icon_emoji, color_hex, sort_order, note_content_types(count)')
        .order('sort_order'),
      admin
        .from('note_content_types')
        .select('note_id'),
      admin
        .from('notes')
        .select('*', { count: 'exact', head: true }),
    ]);

    if (categoriesRes.error) throw categoriesRes.error;

    const categorizedNoteIds = new Set(
      (allNctRes.data || []).map((r: { note_id: string }) => r.note_id),
    );

    response.available_categories = (categoriesRes.data || [])
      .filter((ct: any) => (ct.note_content_types?.[0]?.count || 0) > 0)
      .map((ct: any) => ({
        id: ct.id,
        name: ct.name,
        slug: ct.slug,
        icon_emoji: ct.icon_emoji,
        color_hex: ct.color_hex,
        note_count: ct.note_content_types[0].count,
      }));

    const othersCount = (notesCountRes.count || 0) - categorizedNoteIds.size;
    response.has_others = othersCount > 0;
    response.others_count = othersCount;

    let targetNoteIds: string[] | null = null;

    if (contentTypeId) {
      if (contentTypeId === 'others') {
        const { data: allNotes } = await admin.from('notes').select('id');
        targetNoteIds = (allNotes || [])
          .filter((n: { id: string }) => !categorizedNoteIds.has(n.id))
          .map((n: { id: string }) => n.id);
      } else {
        const { data: nctRows } = await admin
          .from('note_content_types')
          .select('note_id')
          .eq('content_type_id', contentTypeId);
        targetNoteIds = [
          ...new Set((nctRows || []).map((r: { note_id: string }) => r.note_id)),
        ];
      }
    }

    if (contentTypeId && targetNoteIds) {
      if (targetNoteIds.length === 0) {
        response.available_classes = [];
        response.has_all_classes = false;
      } else {
        const { data: taxRows } = await admin
          .from('note_taxonomy')
          .select('note_id, class_id, classes(id, name, slug, sort_order)')
          .in('note_id', targetNoteIds);

        const classMap = new Map<string, any>();
        let hasAllClasses = false;
        const notesWithTax = new Set<string>();

        for (const row of (taxRows || []) as any[]) {
          notesWithTax.add(row.note_id);
          if (row.class_id && row.classes) {
            const cls = row.classes;
            if (!classMap.has(cls.id)) classMap.set(cls.id, cls);
          } else if (!row.class_id) {
            hasAllClasses = true;
          }
        }

        for (const nid of targetNoteIds) {
          if (!notesWithTax.has(nid)) {
            hasAllClasses = true;
            break;
          }
        }

        response.available_classes = [...classMap.values()]
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        response.has_all_classes = hasAllClasses;
      }
    }

    if (contentTypeId && classId && targetNoteIds) {
      if (targetNoteIds.length === 0) {
        response.available_subjects = [];
        response.has_general_subject = false;
      } else {
        let taxQuery = admin
          .from('note_taxonomy')
          .select('note_id, class_id, subject_id, subjects(id, name, slug, icon_emoji, sort_order)')
          .in('note_id', targetNoteIds);

        if (classId !== 'all') {
          taxQuery = taxQuery.or(`class_id.eq.${classId},class_id.is.null`);
        }

        const { data: taxRows } = await taxQuery;

        const subjectMap = new Map<string, any>();
        let hasGeneralSubject = false;
        const notesWithSubject = new Set<string>();

        for (const row of (taxRows || []) as any[]) {
          if (row.subject_id && row.subjects) {
            notesWithSubject.add(row.note_id);
            if (!subjectMap.has(row.subjects.id)) {
              subjectMap.set(row.subjects.id, row.subjects);
            }
          } else {
            hasGeneralSubject = true;
          }
        }

        for (const nid of targetNoteIds) {
          if (!notesWithSubject.has(nid)) {
            hasGeneralSubject = true;
            break;
          }
        }

        response.available_subjects = [...subjectMap.values()]
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        response.has_general_subject = hasGeneralSubject;
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    });
  } catch (err: unknown) {
    console.error('Browse filters error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
