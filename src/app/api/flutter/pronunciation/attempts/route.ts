/* eslint-disable @typescript-eslint/no-explicit-any -- Request JSON and ungenerated Supabase row shapes are validated at this route boundary. */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { authenticatePronunciationStudent } from '@/lib/pronunciation/auth';
import { evaluatePronunciation } from '@/lib/pronunciation/evaluator';
import { PRONUNCIATION_ALGORITHM_VERSION } from '@/lib/pronunciation/types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PLATFORMS = new Set(['web', 'android', 'ios']);

export async function POST(request: Request) {
  const student = await authenticatePronunciationStudent(request);
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validationError = validate(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from('pronunciation_attempts')
    .select('id, score, confidence, word_results, algorithm_version, created_at')
    .eq('student_key', student.studentKey)
    .eq('idempotency_key', body.idempotency_key)
    .maybeSingle();
  if (existing) return NextResponse.json({ attempt: existing, duplicate: true });

  const { data: exercise, error: exerciseError } = await admin
    .from('pronunciation_exercises')
    .select('id, english_text, version, pronunciation_lessons!inner(status, pronunciation_topics!inner(status, pronunciation_levels!inner(status)))')
    .eq('id', body.exercise_id)
    .eq('pronunciation_lessons.status', 'published')
    .eq('pronunciation_lessons.pronunciation_topics.status', 'published')
    .eq('pronunciation_lessons.pronunciation_topics.pronunciation_levels.status', 'published')
    .single();
  if (exerciseError || !exercise) {
    return NextResponse.json({ error: 'Published exercise not found' }, { status: 404 });
  }
  if (exercise.version !== body.exercise_version) {
    return NextResponse.json(
      { error: 'Exercise version is obsolete', current_version: exercise.version },
      { status: 409 },
    );
  }

  const evaluation = evaluatePronunciation({
    target: exercise.english_text,
    transcript: body.transcript,
    confidence: body.confidence,
  });
  const { data: attempt, error } = await admin
    .from('pronunciation_attempts')
    .insert({
      idempotency_key: body.idempotency_key,
      student_key: student.studentKey,
      profile_id: student.profileId,
      licence_id: student.licenceId,
      exercise_id: exercise.id,
      exercise_version: exercise.version,
      transcript: body.transcript,
      normalized_transcript: evaluation.normalizedTranscript,
      confidence: evaluation.confidence,
      score: evaluation.score,
      word_results: evaluation.wordResults,
      duration_ms: body.duration_ms,
      algorithm_version: PRONUNCIATION_ALGORITHM_VERSION,
      platform_category: body.platform_category,
    })
    .select('id, exercise_id, exercise_version, score, confidence, word_results, algorithm_version, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attempt, duplicate: false }, { status: 201 });
}

function validate(body: any): string | null {
  if (!body || typeof body !== 'object') return 'Request body is required';
  if (!UUID.test(String(body.idempotency_key || ''))) return 'Valid idempotency_key is required';
  if (!UUID.test(String(body.exercise_id || ''))) return 'Valid exercise_id is required';
  if (!Number.isInteger(body.exercise_version) || body.exercise_version < 1) return 'Valid exercise_version is required';
  if (typeof body.transcript !== 'string' || body.transcript.length > 10000) return 'Transcript must be at most 10000 characters';
  if (body.confidence !== null && body.confidence !== undefined && (typeof body.confidence !== 'number' || body.confidence < 0 || body.confidence > 1)) return 'Confidence must be between 0 and 1';
  if (!Number.isInteger(body.duration_ms) || body.duration_ms < 0 || body.duration_ms > 600000) return 'duration_ms is out of range';
  if (!PLATFORMS.has(body.platform_category)) return 'Unsupported platform_category';
  return null;
}
