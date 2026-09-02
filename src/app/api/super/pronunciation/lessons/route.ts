/* eslint-disable @typescript-eslint/no-explicit-any -- Admin JSON is validated and Supabase types are not generated in this project. */
import { NextResponse } from 'next/server';
import { authenticatePronunciationAdmin, nonEmptyString, positiveInteger } from '@/lib/pronunciation/admin';

const EXERCISE_TYPES = new Set(['word', 'sentence', 'passage']);
const SUPPORTED_LOCALES: Set<string> = new Set(['hi-IN', 'pa-IN', 'mr-IN', 'bn-IN', 'ta-IN', 'te-IN']);

export async function GET(request: Request) {
  const auth = await authenticatePronunciationAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const topicId = new URL(request.url).searchParams.get('topic_id');
  let query = auth.admin
    .from('pronunciation_lessons')
    .select('*, pronunciation_exercises(*)')
    .order('sort_order')
    .order('sort_order', { referencedTable: 'pronunciation_exercises' });
  if (topicId) query = query.eq('topic_id', topicId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lessons: data });
}

export async function POST(request: Request) {
  const auth = await authenticatePronunciationAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json();
  const rawExercises = body.exercises || body.pronunciation_exercises || [];
  body.exercises = rawExercises;
  const errorMessage = validateLesson(body);
  if (errorMessage) return NextResponse.json({ error: errorMessage }, { status: 400 });

  const requiredLocales = normalizeLocales(body.required_locales);
  const { data: lesson, error } = await auth.admin.from('pronunciation_lessons').insert({
    topic_id: body.topic_id,
    title: body.title.trim(),
    instructions_en: body.instructions_en.trim(),
    sort_order: positiveInteger(body.sort_order),
    required_locales: requiredLocales,
    status: 'draft',
    created_by: auth.user.id,
  }).select().single();
  if (error || !lesson) return NextResponse.json({ error: error?.message || 'Unable to create lesson' }, { status: 500 });

  const exerciseRows = rawExercises.map((exercise: any, index: number) => exerciseInsert(lesson.id, exercise, index));
  const { data: exercises, error: exerciseError } = await auth.admin
    .from('pronunciation_exercises')
    .insert(exerciseRows)
    .select();
  if (exerciseError) {
    await auth.admin.from('pronunciation_lessons').delete().eq('id', lesson.id);
    return NextResponse.json({ error: exerciseError.message }, { status: 500 });
  }
  return NextResponse.json({ lesson: { ...lesson, pronunciation_exercises: exercises } }, { status: 201 });
}

export async function PUT(request: Request) {
  const auth = await authenticatePronunciationAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const rawExercises = body.exercises || body.pronunciation_exercises || [];
  body.exercises = rawExercises;
  const errorMessage = validateLesson(body);
  if (errorMessage) return NextResponse.json({ error: errorMessage }, { status: 400 });

  const { data: currentExercises } = await auth.admin
    .from('pronunciation_exercises')
    .select('id, english_text, meaning_en, example_en, version')
    .eq('lesson_id', body.id);
  const current = new Map((currentExercises || []).map((exercise) => [exercise.id, exercise]));
  const now = new Date().toISOString();
  const { data: lesson, error } = await auth.admin.from('pronunciation_lessons').update({
    topic_id: body.topic_id,
    title: body.title.trim(),
    instructions_en: body.instructions_en.trim(),
    sort_order: positiveInteger(body.sort_order),
    required_locales: normalizeLocales(body.required_locales),
    status: 'draft',
    published_at: null,
    updated_at: now,
  }).eq('id', body.id).select().single();
  if (error || !lesson) return NextResponse.json({ error: error?.message || 'Unable to update lesson' }, { status: 500 });

  // Delete removed exercises
  const incomingIds = new Set(rawExercises.map((ex: any) => ex.id).filter(Boolean));
  const toDelete = (currentExercises || []).filter((ex) => !incomingIds.has(ex.id)).map((ex) => ex.id);
  if (toDelete.length > 0) {
    await auth.admin.from('pronunciation_exercises').delete().in('id', toDelete);
    await auth.admin.from('pronunciation_translations').delete().eq('entity_type', 'exercise').in('entity_id', toDelete);
  }

  for (let index = 0; index < rawExercises.length; index += 1) {
    const exercise = rawExercises[index];
    const existing = exercise.id ? current.get(exercise.id) : null;
    const changed = existing && (
      existing.english_text !== exercise.english_text.trim() ||
      (existing.meaning_en || '') !== String(exercise.meaning_en || '').trim() ||
      (existing.example_en || '') !== String(exercise.example_en || '').trim()
    );
    const row = {
      ...exerciseInsert(body.id, exercise, index),
      version: existing ? existing.version + (changed ? 1 : 0) : 1,
      updated_at: now,
    };
    if (existing) {
      const { error: updateError } = await auth.admin.from('pronunciation_exercises').update(row).eq('id', existing.id);
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
      if (changed) {
        await auth.admin.from('pronunciation_translations').update({ status: 'stale', updated_at: now })
          .eq('entity_type', 'exercise').eq('entity_id', existing.id);
      }
    } else {
      const { error: insertError } = await auth.admin.from('pronunciation_exercises').insert(row);
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }
  await auth.admin.from('pronunciation_translations').update({ status: 'stale', updated_at: now })
    .eq('entity_type', 'lesson').eq('entity_id', body.id);
  return NextResponse.json({ lesson });
}

export async function DELETE(request: Request) {
  const auth = await authenticatePronunciationAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const { error } = await auth.admin.from('pronunciation_lessons').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 409 });
  return NextResponse.json({ success: true });
}

function validateLesson(body: any): string | null {
  const exercises = body.exercises || body.pronunciation_exercises;
  if (!body.topic_id) return 'topic_id is required';
  if (!nonEmptyString(body.title, 180)) return 'A valid title is required';
  if (!nonEmptyString(body.instructions_en, 2000)) return 'English instructions are required';
  if (!Array.isArray(exercises) || exercises.length === 0) return 'At least one exercise is required';
  if (!Array.isArray(body.required_locales) || normalizeLocales(body.required_locales).length === 0) return 'At least one regional language is required';
  for (const exercise of exercises) {
    if (!EXERCISE_TYPES.has(exercise.type)) return 'Invalid exercise type';
    if (!nonEmptyString(exercise.english_text, 5000)) return 'Every exercise requires valid English text';
    if (exercise.type === 'passage' && exercise.segments !== undefined && !Array.isArray(exercise.segments)) return 'Passage segments must be an array';
  }
  return null;
}

function exerciseInsert(lessonId: string, exercise: any, index: number) {
  return {
    lesson_id: lessonId,
    type: exercise.type,
    english_text: exercise.english_text.trim(),
    meaning_en: String(exercise.meaning_en || '').trim() || null,
    example_en: String(exercise.example_en || '').trim() || null,
    segments: Array.isArray(exercise.segments) ? exercise.segments.map((segment: unknown) => String(segment).trim()).filter(Boolean) : [],
    sort_order: positiveInteger(exercise.sort_order, index + 1),
    difficulty: Math.min(5, positiveInteger(exercise.difficulty, 1)),
  };
}

function normalizeLocales(value: unknown): string[] {
  if (!Array.isArray(value)) return [...SUPPORTED_LOCALES];
  return [...new Set(value.map(String).filter((locale) => SUPPORTED_LOCALES.has(locale)))];
}
