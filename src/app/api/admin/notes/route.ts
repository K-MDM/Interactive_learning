import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * DELETE /api/admin/notes?id=uuid
 * Deletes a note record from Supabase DB and its underlying file from Supabase Storage.
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
    let noteId = searchParams.get('id') || searchParams.get('noteId');

    if (!noteId) {
      try {
        const body = await request.json();
        noteId = body.noteId || body.id;
      } catch (e) {
        // body optional if id in query
      }
    }

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required for deletion' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Fetch note to get storage_path
    const { data: note, error: fetchErr } = await adminClient
      .from('notes')
      .select('id, storage_path')
      .eq('id', noteId)
      .single();

    if (fetchErr || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // 2. Remove file from Supabase storage if storage_path exists
    if (note.storage_path) {
      const { error: storageErr } = await adminClient.storage
        .from('notes-html')
        .remove([note.storage_path]);

      if (storageErr) {
        console.warn('Warning: Storage file cleanup issue:', storageErr);
      }
    }

    // 3. Delete related taxonomy and content type associations
    await adminClient.from('note_taxonomy').delete().eq('note_id', noteId);
    await adminClient.from('note_content_types').delete().eq('note_id', noteId);

    // 4. Delete main note record
    const { error: dbDeleteErr } = await adminClient
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (dbDeleteErr) {
      console.error('Note delete DB Error:', dbDeleteErr);
      return NextResponse.json({ error: 'Failed to delete note from database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: noteId });
  } catch (error: any) {
    console.error('Admin Note Delete API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete lesson' },
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
