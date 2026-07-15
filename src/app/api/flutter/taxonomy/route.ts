import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/flutter/taxonomy
 * Returns all boards, classes, subjects in a single call.
 * Public — no auth required (Flutter browse filter UI needs this without login).
 */
export async function GET() {
  try {
    const adminClient = createAdminClient();

    const [boardsRes, classesRes, subjectsRes, contentTypesRes] = await Promise.all([
      adminClient.from('boards').select('id, name, slug, sort_order').order('sort_order'),
      adminClient.from('classes').select('id, name, slug, sort_order').order('sort_order'),
      adminClient.from('subjects').select('id, name, slug, icon_emoji, sort_order').order('sort_order'),
      adminClient.from('content_types').select('id, name, slug, icon_emoji, color_hex, sort_order').order('sort_order'),
    ]);

    if (boardsRes.error || classesRes.error || subjectsRes.error || contentTypesRes.error) {
      console.error('Taxonomy fetch error:', boardsRes.error || classesRes.error || subjectsRes.error || contentTypesRes.error);
      return NextResponse.json({ error: 'Failed to load taxonomy' }, { status: 500 });
    }

    return NextResponse.json({
      boards: boardsRes.data   || [],
      classes: classesRes.data  || [],
      subjects: subjectsRes.data || [],
      content_types: contentTypesRes.data || [],
    }, {
      headers: {
        // Cache taxonomy for 5 minutes — it rarely changes
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    });
  } catch (err: any) {
    console.error('Flutter taxonomy route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
