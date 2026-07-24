import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/flutter/browse-filters
 *
 * Progressive endpoint that returns only filter options with actual content.
 *
 * Query params:
 *   - (none)                → available_categories + others info
 *   - content_type_id=<id>  → also returns available_classes (use 'others' for uncategorized)
 *   - content_type_id + class_id → also returns available_subjects (use 'all' for class-agnostic)
 *
 * Public — no auth required. Cached 5 min.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contentTypeId = searchParams.get('content_type_id');
    const classId = searchParams.get('class_id');

    const admin = createAdminClient();
    const response: Record<string, unknown> = {};

    // ── STEP 0: Shared data ─────────────────────────────────────────────────
    // Fetch categories with note counts + all note-content-type mappings + total note count
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

    // Set of note IDs that have at least one content type
    const categorizedNoteIds = new Set(
      (allNctRes.data || []).map((r: { note_id: string }) => r.note_id),
    );

    // ── STEP 1: Available Categories (always returned) ──────────────────────
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

    // ── Resolve target note IDs for the selected category ───────────────────
    let targetNoteIds: string[] | null = null;

    if (contentTypeId) {
      if (contentTypeId === 'others') {
        // Notes without any content type
        const { data: allNotes } = await admin.from('notes').select('id');
        targetNoteIds = (allNotes || [])
          .filter((n: { id: string }) => !categorizedNoteIds.has(n.id))
          .map((n: { id: string }) => n.id);
      } else {
        // Notes with this specific content type
        const { data: nctRows } = await admin
          .from('note_content_types')
          .select('note_id')
          .eq('content_type_id', contentTypeId);
        targetNoteIds = [
          ...new Set((nctRows || []).map((r: { note_id: string }) => r.note_id)),
        ];
      }
    }

    // ── STEP 2: Available Classes (when content_type_id is set) ─────────────
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

        // Notes with no taxonomy entries at all → treat as "All Classes"
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

    // ── STEP 3: Available Subjects (when content_type_id + class_id are set) ─
    if (contentTypeId && classId && targetNoteIds) {
      if (targetNoteIds.length === 0) {
        response.available_subjects = [];
        response.has_general_subject = false;
      } else {
        let taxQuery = admin
          .from('note_taxonomy')
          .select('note_id, class_id, subject_id, subjects(id, name, slug, icon_emoji, sort_order)')
          .in('note_id', targetNoteIds);

        // Filter by selected class (or null/wildcard)
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

        // Notes with no subject in taxonomy → treat as "General" subject
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
