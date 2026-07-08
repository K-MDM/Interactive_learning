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

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    console.error('Admin Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
