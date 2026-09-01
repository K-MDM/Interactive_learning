import {
  PRONUNCIATION_ALGORITHM_VERSION,
  PronunciationEvaluation,
  WordResult,
} from './types';

export function normalizeSpeechText(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('en-IN')
    .replace(/[’‘`]/g, "'")
    .replace(/[^\p{L}\p{N}'\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function evaluatePronunciation(input: {
  target: string;
  transcript: string;
  confidence?: number | null;
}): PronunciationEvaluation {
  const normalizedTarget = normalizeSpeechText(input.target);
  const normalizedTranscript = normalizeSpeechText(input.transcript);
  const target = normalizedTarget ? normalizedTarget.split(' ') : [];
  const spoken = normalizedTranscript ? normalizedTranscript.split(' ') : [];
  const confidence = normalizeConfidence(input.confidence);
  const wordResults = alignWords(target, spoken);

  const errors = wordResults.filter((result) => result.status !== 'correct').length;
  const denominator = Math.max(target.length, 1);
  const wordAccuracy = clamp(1 - errors / denominator, 0, 1);
  const exactMatch = normalizedTarget.length > 0 && normalizedTarget === normalizedTranscript;
  const rawScore = exactMatch
    ? 100
    : confidence === null
      ? wordAccuracy * 100
      : (wordAccuracy * 0.9 + confidence * 0.1) * 100;

  return {
    score: Math.round(clamp(rawScore, 0, 100)),
    normalizedTarget,
    normalizedTranscript,
    wordAccuracy,
    confidence,
    wordResults,
    algorithmVersion: PRONUNCIATION_ALGORITHM_VERSION,
  };
}

function alignWords(target: string[], spoken: string[]): WordResult[] {
  const rows = target.length + 1;
  const columns = spoken.length + 1;
  const costs = Array.from({ length: rows }, () => Array<number>(columns).fill(0));

  for (let i = 0; i < rows; i += 1) costs[i][0] = i;
  for (let j = 0; j < columns; j += 1) costs[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < columns; j += 1) {
      const substitution = costs[i - 1][j - 1] + (target[i - 1] === spoken[j - 1] ? 0 : 1);
      costs[i][j] = Math.min(costs[i - 1][j] + 1, costs[i][j - 1] + 1, substitution);
    }
  }

  const results: WordResult[] = [];
  let i = target.length;
  let j = spoken.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const same = target[i - 1] === spoken[j - 1];
      const diagonalCost = costs[i - 1][j - 1] + (same ? 0 : 1);
      if (costs[i][j] === diagonalCost) {
        results.push({
          target: target[i - 1],
          spoken: spoken[j - 1],
          targetIndex: i - 1,
          spokenIndex: j - 1,
          status: same ? 'correct' : 'substituted',
        });
        i -= 1;
        j -= 1;
        continue;
      }
    }
    if (i > 0 && costs[i][j] === costs[i - 1][j] + 1) {
      results.push({ target: target[i - 1], spoken: null, targetIndex: i - 1, spokenIndex: null, status: 'missing' });
      i -= 1;
      continue;
    }
    results.push({ target: null, spoken: spoken[j - 1], targetIndex: null, spokenIndex: j - 1, status: 'extra' });
    j -= 1;
  }

  return results.reverse();
}

function normalizeConfidence(value?: number | null): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return clamp(value, 0, 1);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

