import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { authenticatePronunciationStudent } from '@/lib/pronunciation/auth';

export async function GET(request: Request) {
  const student = await authenticatePronunciationStudent(request);
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('pronunciation_attempts')
    .select('id, exercise_id, exercise_version, score, confidence, algorithm_version, created_at')
    .eq('student_key', student.studentKey)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const attempts = data || [];
  const averageScore = attempts.length === 0
    ? 0
    : Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length);
  const practisedExercises = new Set(attempts.map((attempt) => attempt.exercise_id)).size;

  return NextResponse.json({
    summary: {
      attempt_count: attempts.length,
      average_score: averageScore,
      practised_exercises: practisedExercises,
    },
    recent_attempts: attempts.slice(0, 20),
  });
}

