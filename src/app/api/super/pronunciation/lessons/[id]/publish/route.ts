import { NextResponse } from 'next/server';
import { authenticatePronunciationAdmin } from '@/lib/pronunciation/admin';
import { pronunciationSourceHash } from '@/lib/pronunciation/translation';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticatePronunciationAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const { data: lesson, error } = await auth.admin.from('pronunciation_lessons')
    .select(`
      id, topic_id, title, instructions_en, required_locales,
      pronunciation_topics(id, level_id),
      pronunciation_exercises(id, english_text, meaning_en)
    `)
    .eq('id', id).single();
  if (error || !lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  if (!lesson.title.trim() || !lesson.instructions_en.trim()) {
    return NextResponse.json({ error: 'Lesson title and instructions are required' }, { status: 400 });
  }
  const exercises = lesson.pronunciation_exercises || [];
  if (exercises.length === 0) return NextResponse.json({ error: 'At least one exercise is required' }, { status: 400 });

  const requiredSources = [
    { entityType: 'lesson', entityId: id, fieldName: 'title', value: lesson.title },
    { entityType: 'lesson', entityId: id, fieldName: 'instructions_en', value: lesson.instructions_en },
    ...exercises.flatMap((exercise) => exercise.meaning_en ? [{
      entityType: 'exercise', entityId: exercise.id, fieldName: 'meaning_en', value: exercise.meaning_en,
    }] : []),
  ];
  const entityIds = [id, ...exercises.map((exercise) => exercise.id)];
  const { data: translations } = await auth.admin.from('pronunciation_translations')
    .select('entity_type, entity_id, locale, field_name, source_hash, status')
    .in('entity_id', entityIds);
  const translationKeys = new Set((translations || [])
    .filter((translation) => translation.status === 'approved')
    .map((translation) => `${translation.entity_type}:${translation.entity_id}:${translation.locale}:${translation.field_name}:${translation.source_hash}`));

  const missing: string[] = [];
  for (const locale of lesson.required_locales || []) {
    for (const source of requiredSources) {
      const key = `${source.entityType}:${source.entityId}:${locale}:${source.fieldName}:${pronunciationSourceHash(source.value)}`;
      if (!translationKeys.has(key)) missing.push(`${locale} ${source.entityType}.${source.fieldName}`);
    }
  }
  if (missing.length > 0) {
    return NextResponse.json({ error: 'Required translations are missing, stale, or unapproved', missing }, { status: 409 });
  }

  const now = new Date().toISOString();
  const topic = Array.isArray(lesson.pronunciation_topics)
    ? lesson.pronunciation_topics[0]
    : lesson.pronunciation_topics;
  const updates = await Promise.all([
    auth.admin.from('pronunciation_lessons').update({ status: 'published', published_at: now, updated_at: now }).eq('id', id),
    auth.admin.from('pronunciation_topics').update({ status: 'published', updated_at: now }).eq('id', lesson.topic_id),
    auth.admin.from('pronunciation_levels').update({ status: 'published', updated_at: now }).eq('id', topic?.level_id),
  ]);
  const updateError = updates.find((result) => result.error)?.error;
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ published: true, published_at: now });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticatePronunciationAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const { error } = await auth.admin.from('pronunciation_lessons')
    .update({ status: 'draft', published_at: null, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ published: false });
}

