import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

async function verifySuperAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'super_admin') return null;
  return { user, adminClient };
}

/**
 * GET /api/super/notes/[id]/taxonomy
 * Returns the current taxonomy tags assigned to a note.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifySuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { data, error } = await auth.adminClient
    .from('note_taxonomy')
    .select(`
      id,
      board_id,   boards   ( id, name, slug ),
      class_id,   classes  ( id, name, slug ),
      subject_id, subjects ( id, name, slug, icon_emoji )
    `)
    .eq('note_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ taxonomy: data || [] });
}

/**
 * POST /api/super/notes/[id]/taxonomy
 * Body: { board_id?, class_id?, subject_id? }
 * Adds a new taxonomy tag combo to the note. At least one field required.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifySuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { board_id, class_id, subject_id, board_ids, class_ids, subject_ids } = body;

  let finalBoardIds: (string | null)[] = [null];
  let finalClassIds: (string | null)[] = [null];
  let finalSubjectIds: (string | null)[] = [null];

  if (Array.isArray(board_ids) && board_ids.length > 0) {
    finalBoardIds = board_ids;
  } else if (board_id) {
    finalBoardIds = [board_id];
  }

  if (Array.isArray(class_ids) && class_ids.length > 0) {
    finalClassIds = class_ids;
  } else if (class_id) {
    finalClassIds = [class_id];
  }

  if (Array.isArray(subject_ids) && subject_ids.length > 0) {
    finalSubjectIds = subject_ids;
  } else if (subject_id) {
    finalSubjectIds = [subject_id];
  }

  // Generate cross-product combinations
  const taxonomyRows: any[] = [];
  for (const bId of finalBoardIds) {
    for (const cId of finalClassIds) {
      for (const sId of finalSubjectIds) {
        taxonomyRows.push({
          note_id:    id,
          board_id:   bId || null,
          class_id:   cId || null,
          subject_id: sId || null,
        });
      }
    }
  }

  // Dedup mapping combinations
  const uniqueKeys = new Set<string>();
  const uniqueRows: any[] = [];
  for (const row of taxonomyRows) {
    const key = `${row.board_id}-${row.class_id}-${row.subject_id}`;
    if (!uniqueKeys.has(key)) {
      uniqueKeys.add(key);
      uniqueRows.push(row);
    }
  }

  if (uniqueRows.length === 0) {
    return NextResponse.json({ error: 'No taxonomy classifications specified' }, { status: 400 });
  }

  const { data, error } = await auth.adminClient
    .from('note_taxonomy')
    .insert(uniqueRows)
    .select();

  if (error) {
    if (error.message.includes('unique')) {
      return NextResponse.json({ error: 'One or more of these taxonomy tags already exists for this note' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tags: data }, { status: 201 });
}

/**
 * DELETE /api/super/notes/[id]/taxonomy?tag_id=uuid
 * Removes a specific taxonomy tag from the note.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifySuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const tagId = searchParams.get('tag_id');

  if (!tagId) return NextResponse.json({ error: 'tag_id query param required' }, { status: 400 });

  const { error } = await auth.adminClient
    .from('note_taxonomy')
    .delete()
    .eq('id', tagId)
    .eq('note_id', id); // Safety: ensure tag belongs to this note

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
