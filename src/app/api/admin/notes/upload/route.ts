import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Verify session
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File;
    const isDemoStr = formData.get('isDemo') as string;
    const isDemo = isDemoStr === 'true';

    // Parse lists of board, class, subject IDs
    const boardIdsStr = formData.get('boardIds') as string;
    const classIdsStr = formData.get('classIds') as string;
    const subjectIdsStr = formData.get('subjectIds') as string;
    const contentTypeIdsStr = formData.get('contentTypeIds') as string;

    let boardIds: (string | null)[] = [null];
    let classIds: (string | null)[] = [null];
    let subjectIds: (string | null)[] = [null];
    let contentTypeIds: string[] = [];

    if (boardIdsStr) {
      try {
        const parsed = JSON.parse(boardIdsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          boardIds = parsed;
        }
      } catch (e) {
        console.error('Failed to parse boardIds JSON', e);
      }
    } else {
      const oldBoardId = formData.get('boardId') as string;
      if (oldBoardId) boardIds = [oldBoardId];
    }

    if (classIdsStr) {
      try {
        const parsed = JSON.parse(classIdsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          classIds = parsed;
        }
      } catch (e) {
        console.error('Failed to parse classIds JSON', e);
      }
    } else {
      const oldClassId = formData.get('classId') as string;
      if (oldClassId) classIds = [oldClassId];
    }

    if (subjectIdsStr) {
      try {
        const parsed = JSON.parse(subjectIdsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          subjectIds = parsed;
        }
      } catch (e) {
        console.error('Failed to parse subjectIds JSON', e);
      }
    } else {
      const oldSubjectId = formData.get('subjectId') as string;
      if (oldSubjectId) subjectIds = [oldSubjectId];
    }

    if (contentTypeIdsStr) {
      try {
        const parsed = JSON.parse(contentTypeIdsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          contentTypeIds = parsed;
        }
      } catch (e) {
        console.error('Failed to parse contentTypeIds JSON', e);
      }
    }

    if (!title || !file) {
      return NextResponse.json(
        { error: 'Title and HTML file are required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Generate unique storage path
    const fileUuid = crypto.randomUUID();
    const storagePath = `notes/${fileUuid}.html`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload file to private Supabase Storage bucket
    const { error: uploadError } = await adminClient.storage
      .from('interactive-notes')
      .upload(storagePath, buffer, {
        contentType: 'text/html',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload HTML note to storage' },
        { status: 500 }
      );
    }

    // 2. Insert note metadata in Postgres DB
    const { data: note, error: dbError } = await adminClient
      .from('notes')
      .insert({
        title,
        description: description || '',
        storage_path: storagePath,
        is_demo: isDemo,
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB Insert Error:', dbError);
      // Rollback: Delete uploaded file if DB insertion failed
      await adminClient.storage.from('interactive-notes').remove([storagePath]);
      return NextResponse.json(
        { error: 'Failed to save note metadata to database' },
        { status: 500 }
      );
    }

    // 3. Generate and Insert cross-product note_taxonomy combinations
    const taxonomyRows: any[] = [];
    for (const bId of boardIds) {
      for (const cId of classIds) {
        for (const sId of subjectIds) {
          taxonomyRows.push({
            note_id: note.id,
            board_id: bId || null,
            class_id: cId || null,
            subject_id: sId || null,
          });
        }
      }
    }

    // Dedup combination rows just in case
    const uniqueKeys = new Set<string>();
    const uniqueRows: any[] = [];
    for (const row of taxonomyRows) {
      const key = `${row.board_id}-${row.class_id}-${row.subject_id}`;
      if (!uniqueKeys.has(key)) {
        uniqueKeys.add(key);
        uniqueRows.push(row);
      }
    }

    if (uniqueRows.length > 0) {
      const { error: taxError } = await adminClient
        .from('note_taxonomy')
        .insert(uniqueRows);

      if (taxError) {
        console.error('Taxonomy Mapping Insert Error:', taxError);
        // Rollback: Delete note and storage file
        await adminClient.from('notes').delete().eq('id', note.id);
        await adminClient.storage.from('interactive-notes').remove([storagePath]);
        return NextResponse.json(
          { error: 'Failed to assign note taxonomy categorization' },
          { status: 500 }
        );
      }
    }

    // 4. Insert Content Type mappings
    if (contentTypeIds.length > 0) {
      const contentTypeRows = contentTypeIds.map(ctId => ({
        note_id: note.id,
        content_type_id: ctId
      }));

      const { error: ctError } = await adminClient
        .from('note_content_types')
        .insert(contentTypeRows);

      if (ctError) {
        console.error('Content Type Mapping Insert Error:', ctError);
        // Rollback: Delete taxonomy mappings, note, and storage file
        await adminClient.from('note_taxonomy').delete().eq('note_id', note.id);
        await adminClient.from('notes').delete().eq('id', note.id);
        await adminClient.storage.from('interactive-notes').remove([storagePath]);
        return NextResponse.json(
          { error: 'Failed to assign note content types categorization' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    console.error('Admin Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
