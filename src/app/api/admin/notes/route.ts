import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/notes
 * Paginated and filtered query for admin notes dashboard.
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const boardId       = searchParams.get('board_id') || searchParams.get('boardId');
    const classId       = searchParams.get('class_id') || searchParams.get('classId');
    const subjectId     = searchParams.get('subject_id') || searchParams.get('subjectId');
    const contentTypeId = searchParams.get('content_type_id') || searchParams.get('contentTypeId');
    const search        = searchParams.get('search')?.trim();
    const isDemo        = searchParams.get('is_demo') || searchParams.get('isDemo');
    const page          = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit         = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const offset        = (page - 1) * limit;

    const adminClient = createAdminClient();

    const hasFilter = !!(boardId || classId || subjectId);
    const hasContentTypeFilter = !!contentTypeId;

    const selectStr = `
      *,
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

    if (isDemo === 'true') {
      query = query.eq('is_demo', true);
    } else if (isDemo === 'false') {
      query = query.eq('is_demo', false);
    }

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

    if (search && search.length > 0) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const sortBy = searchParams.get('sort_by') || searchParams.get('sortBy') || 'title_asc';

    let orderField = 'title';
    let orderAscending = true;

    if (sortBy === 'title_desc') {
      orderField = 'title';
      orderAscending = false;
    } else if (sortBy === 'created_at_desc') {
      orderField = 'created_at';
      orderAscending = false;
    } else if (sortBy === 'created_at_asc') {
      orderField = 'created_at';
      orderAscending = true;
    } else if (sortBy === 'title_asc') {
      orderField = 'title';
      orderAscending = true;
    }

    query = query
      .order(orderField, { ascending: orderAscending })
      .range(offset, offset + limit - 1);

    const { data: notes, count, error } = await query;

    if (error) {
      console.error('Admin GET notes DB Error:', error);
      return NextResponse.json({ error: error.message || 'Failed to fetch notes' }, { status: 500 });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      notes: notes || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Admin Notes GET API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch notes' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/notes
 * Deletes single or bulk note records from Supabase DB and underlying files from Supabase Storage.
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let noteIds: string[] = [];

    const queryId = searchParams.get('id') || searchParams.get('noteId');
    const queryIds = searchParams.get('ids');

    if (queryIds) {
      noteIds = queryIds.split(',').map(s => s.trim()).filter(Boolean);
    } else if (queryId) {
      noteIds = [queryId];
    } else {
      try {
        const body = await request.json();
        if (Array.isArray(body.ids)) {
          noteIds = body.ids;
        } else if (Array.isArray(body.noteIds)) {
          noteIds = body.noteIds;
        } else if (body.id || body.noteId) {
          noteIds = [body.id || body.noteId];
        }
      } catch (e) {
        // body optional if ids in query
      }
    }

    if (noteIds.length === 0) {
      return NextResponse.json({ error: 'At least one note ID is required for deletion' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Fetch storage_paths for notes
    const { data: notesToDelete, error: fetchErr } = await adminClient
      .from('notes')
      .select('id, storage_path')
      .in('id', noteIds);

    if (fetchErr) {
      console.error('Error fetching notes for deletion:', fetchErr);
      return NextResponse.json({ error: 'Failed to find target notes' }, { status: 500 });
    }

    const storagePaths = (notesToDelete || [])
      .map(n => n.storage_path)
      .filter((p): p is string => Boolean(p));

    // 2. Remove files from Supabase storage if storage_path exists
    if (storagePaths.length > 0) {
      const { error: storageErr } = await adminClient.storage
        .from('notes-html')
        .remove(storagePaths);

      if (storageErr) {
        console.warn('Warning: Storage file cleanup issue:', storageErr);
      }
    }

    // 3. Delete related taxonomy and content type associations
    await adminClient.from('note_taxonomy').delete().in('note_id', noteIds);
    await adminClient.from('note_content_types').delete().in('note_id', noteIds);

    // 4. Delete main note records
    const { error: dbDeleteErr } = await adminClient
      .from('notes')
      .delete()
      .in('id', noteIds);

    if (dbDeleteErr) {
      console.error('Note delete DB Error:', dbDeleteErr);
      return NextResponse.json({ error: 'Failed to delete notes from database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedIds: noteIds, count: noteIds.length });
  } catch (error: any) {
    console.error('Admin Note Delete API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete lessons' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/notes
 * Updates title, description, and is_demo flag for a note.
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { noteId, title, description, isDemo } = await request.json();

    if (!noteId || !title?.trim()) {
      return NextResponse.json({ error: 'Note ID and Title are required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const updateData: any = {
      title: title.trim(),
      description: description?.trim() || '',
    };

    if (typeof isDemo === 'boolean') {
      updateData.is_demo = isDemo;
    }

    const { data: updatedNote, error: dbError } = await adminClient
      .from('notes')
      .update(updateData)
      .eq('id', noteId)
      .select('*')
      .single();

    if (dbError) {
      console.error('Note update DB Error:', dbError);
      return NextResponse.json({ error: 'Failed to update lesson details' }, { status: 500 });
    }

    return NextResponse.json({ success: true, note: updatedNote });
  } catch (error: any) {
    console.error('Admin Note Update API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
