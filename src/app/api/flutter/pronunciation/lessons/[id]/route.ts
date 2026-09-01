/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase nested relation types are not generated in this project. */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { authenticatePronunciationStudent } from '@/lib/pronunciation/auth';

const SUPPORTED_LOCALES = ['en-IN', 'hi-IN', 'pa-IN', 'mr-IN', 'bn-IN', 'ta-IN', 'te-IN'];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const student = await authenticatePronunciationStudent(request);
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const requested = new URL(request.url).searchParams.get('locale');
  const locale = requested && SUPPORTED_LOCALES.includes(requested) ? requested : 'en-IN';
  const admin = createAdminClient();
  const { data: lesson, error } = await admin
    .from('pronunciation_lessons')
    .select(`
      id, title, instructions_en, published_at, updated_at,
      pronunciation_topics!inner(id, status, pronunciation_levels!inner(id, status)),
      pronunciation_exercises(id, type, english_text, meaning_en, example_en, segments, sort_order, difficulty, version, updated_at)
    `)
    .eq('id', id)
    .eq('status', 'published')
    .eq('pronunciation_topics.status', 'published')
    .eq('pronunciation_topics.pronunciation_levels.status', 'published')
    .single();

  if (error || !lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

  const exercises = ((lesson as any).pronunciation_exercises || []).sort(
    (a: any, b: any) => a.sort_order - b.sort_order,
  );
  const ids = [id, ...exercises.map((exercise: any) => exercise.id)];
  const translations = locale === 'en-IN'
    ? []
    : (await admin
        .from('pronunciation_translations')
        .select('entity_type, entity_id, field_name, translated_text')
        .eq('locale', locale)
        .eq('status', 'approved')
        .in('entity_id', ids)).data || [];
  const map = new Map(
    translations.map((row: any) => [`${row.entity_type}:${row.entity_id}:${row.field_name}`, row.translated_text]),
  );

  return NextResponse.json({
    lesson: {
      id: lesson.id,
      title: map.get(`lesson:${id}:title`) ?? lesson.title,
      instructions: map.get(`lesson:${id}:instructions_en`) ?? lesson.instructions_en,
      locale,
      published_at: lesson.published_at,
      updated_at: lesson.updated_at,
      exercises: exercises.map((exercise: any) => ({
        id: exercise.id,
        type: exercise.type,
        english_text: exercise.english_text,
        meaning: map.get(`exercise:${exercise.id}:meaning_en`) ?? exercise.meaning_en,
        example: exercise.example_en,
        segments: exercise.segments,
        sort_order: exercise.sort_order,
        difficulty: exercise.difficulty,
        version: exercise.version,
        updated_at: exercise.updated_at,
      })),
    },
  });
}
