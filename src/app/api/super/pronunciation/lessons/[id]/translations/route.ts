/* eslint-disable @typescript-eslint/no-explicit-any -- Translation and Supabase payloads are validated at this route boundary. */
import { NextResponse } from 'next/server';
import { authenticatePronunciationAdmin } from '@/lib/pronunciation/admin';
import { pronunciationSourceHash, REGIONAL_LOCALES, translatePronunciationTexts } from '@/lib/pronunciation/translation';

type SourceField = { entityType: 'lesson' | 'exercise'; entityId: string; fieldName: string; value: string };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticatePronunciationAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const { data, error } = await auth.admin.from('pronunciation_translations')
    .select('*').eq('entity_type', 'lesson').eq('entity_id', id)
    .order('locale').order('field_name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: exercises } = await auth.admin.from('pronunciation_exercises').select('id').eq('lesson_id', id);
  const exerciseIds = (exercises || []).map((exercise) => exercise.id);
  let exerciseTranslations: any[] = [];
  if (exerciseIds.length > 0) {
    exerciseTranslations = (await auth.admin.from('pronunciation_translations').select('*')
      .eq('entity_type', 'exercise').in('entity_id', exerciseIds).order('locale').order('field_name')).data || [];
  }
  return NextResponse.json({ translations: [...(data || []), ...exerciseTranslations] });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticatePronunciationAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { lesson, sources } = await getSources(auth.admin, id);
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  const requested = Array.isArray(body.locales) ? body.locales : lesson.required_locales;
  const locales = requested.filter((locale: string) => REGIONAL_LOCALES.includes(locale as any));
  if (locales.length === 0) return NextResponse.json({ error: 'At least one supported locale is required' }, { status: 400 });

  const failures: Array<{ locale: string; error: string }> = [];
  for (const locale of locales) {
    try {
      const translated = await translatePronunciationTexts(sources.map((source) => source.value), locale);
      const rows = sources.map((source, index) => ({
        entity_type: source.entityType,
        entity_id: source.entityId,
        locale,
        field_name: source.fieldName,
        translated_text: translated[index],
        status: 'pending_review',
        source_hash: pronunciationSourceHash(source.value),
        reviewed_by: null,
        reviewed_at: null,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await auth.admin.from('pronunciation_translations').upsert(rows, {
        onConflict: 'entity_type,entity_id,locale,field_name',
      });
      if (error) throw error;
    } catch (error) {
      failures.push({ locale, error: error instanceof Error ? error.message : 'Translation failed' });
    }
  }
  return NextResponse.json({ generated: locales.length - failures.length, failures }, { status: failures.length === locales.length ? 502 : 200 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticatePronunciationAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await params;
  const body = await request.json();
  if (!Array.isArray(body.translations) || body.translations.length === 0) {
    return NextResponse.json({ error: 'translations are required' }, { status: 400 });
  }
  for (const item of body.translations) {
    if (!item.id || typeof item.translated_text !== 'string' || !item.translated_text.trim()) {
      return NextResponse.json({ error: 'Each translation requires id and translated_text' }, { status: 400 });
    }
    const { error } = await auth.admin.from('pronunciation_translations').update({
      translated_text: item.translated_text.trim(),
      status: item.approved === false ? 'pending_review' : 'approved',
      reviewed_by: item.approved === false ? null : auth.user.id,
      reviewed_at: item.approved === false ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', item.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

async function getSources(admin: any, lessonId: string): Promise<{ lesson: any; sources: SourceField[] }> {
  const { data: lesson } = await admin.from('pronunciation_lessons')
    .select('id, title, instructions_en, required_locales, pronunciation_exercises(id, meaning_en)')
    .eq('id', lessonId).single();
  if (!lesson) return { lesson: null, sources: [] };
  const sources: SourceField[] = [
    { entityType: 'lesson', entityId: lesson.id, fieldName: 'title', value: lesson.title },
    { entityType: 'lesson', entityId: lesson.id, fieldName: 'instructions_en', value: lesson.instructions_en },
  ];
  for (const exercise of lesson.pronunciation_exercises || []) {
    if (exercise.meaning_en) sources.push({ entityType: 'exercise', entityId: exercise.id, fieldName: 'meaning_en', value: exercise.meaning_en });
  }
  return { lesson, sources };
}
