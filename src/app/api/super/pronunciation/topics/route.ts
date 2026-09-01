import { NextResponse } from 'next/server';
import { authenticatePronunciationAdmin, nonEmptyString, positiveInteger } from '@/lib/pronunciation/admin';

export async function GET(request: Request) {
  const auth = await authenticatePronunciationAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const levelId = new URL(request.url).searchParams.get('level_id');
  let query = auth.admin.from('pronunciation_topics').select('*').order('sort_order');
  if (levelId) query = query.eq('level_id', levelId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ topics: data });
}

export async function POST(request: Request) {
  const auth = await authenticatePronunciationAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json();
  const title = nonEmptyString(body.title, 160);
  if (!body.level_id || !title) return NextResponse.json({ error: 'level_id and a valid title are required' }, { status: 400 });
  const { data, error } = await auth.admin.from('pronunciation_topics').insert({
    level_id: body.level_id,
    title,
    description: typeof body.description === 'string' ? body.description.trim() || null : null,
    sort_order: positiveInteger(body.sort_order),
    status: 'draft',
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ topic: data }, { status: 201 });
}

export async function PUT(request: Request) {
  const auth = await authenticatePronunciationAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title !== undefined) {
    const title = nonEmptyString(body.title, 160);
    if (!title) return NextResponse.json({ error: 'A valid title is required' }, { status: 400 });
    updates.title = title;
  }
  if (body.description !== undefined) updates.description = String(body.description).trim() || null;
  if (body.sort_order !== undefined) updates.sort_order = positiveInteger(body.sort_order);
  const { data, error } = await auth.admin.from('pronunciation_topics').update(updates).eq('id', body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ topic: data });
}

export async function DELETE(request: Request) {
  const auth = await authenticatePronunciationAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const { error } = await auth.admin.from('pronunciation_topics').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

