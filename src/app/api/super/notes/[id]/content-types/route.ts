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
 * GET /api/super/notes/[id]/content-types
 * Returns the current content types assigned to a note.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifySuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { data, error } = await auth.adminClient
    .from('note_content_types')
    .select(`
      id,
      content_type_id,
      content_types ( id, name, slug, icon_emoji, color_hex )
    `)
    .eq('note_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ content_types: data || [] });
}

/**
 * POST /api/super/notes/[id]/content-types
 * Body: { content_type_id?, content_type_ids? }
 * Maps content types to the note.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifySuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { content_type_id, content_type_ids } = body;

  let finalIds: string[] = [];
  if (Array.isArray(content_type_ids)) {
    finalIds = content_type_ids;
  } else if (content_type_id) {
    finalIds = [content_type_id];
  }

  if (finalIds.length === 0) {
    return NextResponse.json({ error: 'No content types specified' }, { status: 400 });
  }

  const rows = finalIds.map(ctId => ({
    note_id: id,
    content_type_id: ctId
  }));

  const { data, error } = await auth.adminClient
    .from('note_content_types')
    .insert(rows)
    .select();

  if (error) {
    if (error.message.includes('unique')) {
      return NextResponse.json({ error: 'One or more of these content types are already linked to this note' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ mappings: data }, { status: 201 });
}

/**
 * DELETE /api/super/notes/[id]/content-types?tag_id=uuid or content_type_id=uuid
 * Unmaps a content type from the note.
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
  const contentTypeId = searchParams.get('content_type_id');

  if (!tagId && !contentTypeId) {
    return NextResponse.json({ error: 'tag_id or content_type_id query param required' }, { status: 400 });
  }

  let query = auth.adminClient
    .from('note_content_types')
    .delete()
    .eq('note_id', id); // Safety: ensure mapping belongs to this note

  if (tagId) {
    query = query.eq('id', tagId);
  } else if (contentTypeId) {
    query = query.eq('content_type_id', contentTypeId);
  }

  const { error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
