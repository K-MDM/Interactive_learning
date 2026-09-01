/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase nested relation types are not generated in this project. */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { authenticatePronunciationStudent } from '@/lib/pronunciation/auth';

const SUPPORTED_LOCALES = ['en-IN', 'hi-IN', 'pa-IN', 'mr-IN', 'bn-IN', 'ta-IN', 'te-IN'];

export async function GET(request: Request) {
  const student = await authenticatePronunciationStudent(request);
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const locale = normalizeLocale(new URL(request.url).searchParams.get('locale'));
  const admin = createAdminClient();
  const { data: levels, error } = await admin
    .from('pronunciation_levels')
    .select(`
      id, title, description, sort_order, updated_at,
      pronunciation_topics!inner(
        id, title, description, sort_order, updated_at,
        pronunciation_lessons!inner(id, title, instructions_en, sort_order, published_at, updated_at)
      )
    `)
    .eq('status', 'published')
    .eq('pronunciation_topics.status', 'published')
    .eq('pronunciation_topics.pronunciation_lessons.status', 'published')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const entities = collectEntityIds(levels || []);
  const translations = locale === 'en-IN' || entities.length === 0
    ? []
    : (await admin
        .from('pronunciation_translations')
        .select('entity_type, entity_id, field_name, translated_text')
        .eq('locale', locale)
        .eq('status', 'approved')
        .in('entity_id', entities)).data || [];
  const translationMap = new Map(
    translations.map((row: any) => [`${row.entity_type}:${row.entity_id}:${row.field_name}`, row.translated_text]),
  );

  const catalog = (levels || []).map((level: any) => ({
    id: level.id,
    title: translated(translationMap, 'level', level.id, 'title', level.title),
    description: translated(translationMap, 'level', level.id, 'description', level.description),
    sort_order: level.sort_order,
    updated_at: level.updated_at,
    topics: (level.pronunciation_topics || [])
      .sort(bySortOrder)
      .map((topic: any) => ({
        id: topic.id,
        title: translated(translationMap, 'topic', topic.id, 'title', topic.title),
        description: translated(translationMap, 'topic', topic.id, 'description', topic.description),
        sort_order: topic.sort_order,
        updated_at: topic.updated_at,
        lessons: (topic.pronunciation_lessons || [])
          .sort(bySortOrder)
          .map((lesson: any) => ({
            id: lesson.id,
            title: translated(translationMap, 'lesson', lesson.id, 'title', lesson.title),
            instructions: translated(translationMap, 'lesson', lesson.id, 'instructions_en', lesson.instructions_en),
            sort_order: lesson.sort_order,
            published_at: lesson.published_at,
            updated_at: lesson.updated_at,
          })),
      })),
  }));

  return NextResponse.json(
    { locale, supported_locales: SUPPORTED_LOCALES, levels: catalog },
    { headers: { 'Cache-Control': 'private, max-age=300, stale-while-revalidate=60' } },
  );
}

function normalizeLocale(value: string | null): string {
  return value && SUPPORTED_LOCALES.includes(value) ? value : 'en-IN';
}

function collectEntityIds(levels: any[]): string[] {
  const ids: string[] = [];
  for (const level of levels) {
    ids.push(level.id);
    for (const topic of level.pronunciation_topics || []) {
      ids.push(topic.id);
      for (const lesson of topic.pronunciation_lessons || []) ids.push(lesson.id);
    }
  }
  return ids;
}

function translated(map: Map<string, string>, type: string, id: string, field: string, fallback: string | null) {
  return map.get(`${type}:${id}:${field}`) ?? fallback;
}

function bySortOrder(a: any, b: any) {
  return (a.sort_order || 0) - (b.sort_order || 0);
}
