import { NextResponse } from 'next/server';
import { authenticatePronunciationAdmin } from '@/lib/pronunciation/admin';

export async function GET(request: Request) {
  const auth = await authenticatePronunciationAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const requestedDays = Number(new URL(request.url).searchParams.get('days') || 30);
  const days = Number.isInteger(requestedDays) ? Math.min(Math.max(requestedDays, 1), 365) : 30;
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data: attempts, error } = await auth.admin.from('pronunciation_attempts')
    .select('exercise_id, student_key, score, platform_category, created_at')
    .gte('created_at', since)
    .order('created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = attempts || [];
  const byDay = new Map<string, { attempts: number; scoreTotal: number }>();
  const byPlatform = new Map<string, number>();
  const byExercise = new Map<string, { attempts: number; scoreTotal: number }>();
  for (const attempt of rows) {
    const day = attempt.created_at.slice(0, 10);
    const dayValue = byDay.get(day) || { attempts: 0, scoreTotal: 0 };
    dayValue.attempts += 1;
    dayValue.scoreTotal += attempt.score;
    byDay.set(day, dayValue);
    byPlatform.set(attempt.platform_category, (byPlatform.get(attempt.platform_category) || 0) + 1);
    const exerciseValue = byExercise.get(attempt.exercise_id) || { attempts: 0, scoreTotal: 0 };
    exerciseValue.attempts += 1;
    exerciseValue.scoreTotal += attempt.score;
    byExercise.set(attempt.exercise_id, exerciseValue);
  }
  const averageScore = rows.length === 0 ? 0 : Math.round(rows.reduce((total, attempt) => total + attempt.score, 0) / rows.length);
  const difficult = [...byExercise.entries()]
    .map(([exerciseId, value]) => ({ exercise_id: exerciseId, attempts: value.attempts, average_score: Math.round(value.scoreTotal / value.attempts) }))
    .filter((item) => item.attempts >= 3)
    .sort((a, b) => a.average_score - b.average_score)
    .slice(0, 10);

  return NextResponse.json({
    period_days: days,
    summary: {
      attempts: rows.length,
      active_learners: new Set(rows.map((attempt) => attempt.student_key)).size,
      average_score: averageScore,
      retry_rate: calculateRetryRate(rows),
    },
    by_day: [...byDay.entries()].map(([date, value]) => ({ date, attempts: value.attempts, average_score: Math.round(value.scoreTotal / value.attempts) })),
    by_platform: Object.fromEntries(byPlatform),
    difficult_exercises: difficult,
  });
}

function calculateRetryRate(attempts: Array<{ student_key: string; exercise_id: string }>): number {
  if (attempts.length === 0) return 0;
  const unique = new Set(attempts.map((attempt) => `${attempt.student_key}:${attempt.exercise_id}`)).size;
  return Math.round(((attempts.length - unique) / attempts.length) * 100);
}

