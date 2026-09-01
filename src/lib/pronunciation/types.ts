export const PRONUNCIATION_ALGORITHM_VERSION = '1.0.0';

export type WordResultStatus = 'correct' | 'substituted' | 'missing' | 'extra';

export interface WordResult {
  target: string | null;
  spoken: string | null;
  targetIndex: number | null;
  spokenIndex: number | null;
  status: WordResultStatus;
}

export interface PronunciationEvaluation {
  score: number;
  normalizedTarget: string;
  normalizedTranscript: string;
  wordAccuracy: number;
  confidence: number | null;
  wordResults: WordResult[];
  algorithmVersion: string;
}

