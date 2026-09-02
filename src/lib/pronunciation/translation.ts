import crypto from 'crypto';

export const REGIONAL_LOCALES = ['hi-IN', 'pa-IN', 'mr-IN', 'bn-IN', 'ta-IN', 'te-IN'] as const;

const LOCALE_NAME_MAP: Record<string, string> = {
  'hi-IN': 'Hindi',
  'pa-IN': 'Punjabi',
  'mr-IN': 'Marathi',
  'bn-IN': 'Bengali',
  'ta-IN': 'Tamil',
  'te-IN': 'Telugu',
  'gu-IN': 'Gujarati',
  'kn-IN': 'Kannada',
  'ml-IN': 'Malayalam',
  'ur-IN': 'Urdu',
  'or-IN': 'Odia',
  'as-IN': 'Assamese',
};

export function pronunciationSourceHash(value: string): string {
  return crypto.createHash('sha256').update(value.normalize('NFKC').trim()).digest('hex');
}

export async function translatePronunciationTexts(
  texts: string[],
  locale: string,
): Promise<string[]> {
  if (texts.length === 0) return [];

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_TRANSLATE_API_KEY;

  if (!apiKey) {
    // When API key is not configured (e.g. local dev / testing), provide formatted fallback text
    // so the review, editing, approval, and publishing flow is not blocked.
    const tag = locale.split('-')[0].toUpperCase();
    return texts.map((text) => `[${tag}] ${text}`);
  }

  const targetLang = LOCALE_NAME_MAP[locale] || locale;
  const prompt = `You are a professional translator for language learning and pronunciation applications.
Translate the following array of English texts into ${targetLang} (locale: ${locale}).
Ensure natural phrasing, accurate context for pronunciation learning, and correct script.
Return ONLY a valid JSON array of strings containing the translations in the exact same order and length.

Input English texts:
${JSON.stringify(texts)}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
      cache: 'no-store',
    },
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Gemini Translation failed with status ${response.status}`);
  }

  const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini translation returned an empty response');
  }

  let translations: unknown;
  try {
    translations = JSON.parse(rawText.trim());
  } catch {
    throw new Error('Failed to parse Gemini translation JSON response');
  }

  if (!Array.isArray(translations) || translations.length !== texts.length) {
    throw new Error(
      `Gemini translation returned ${Array.isArray(translations) ? translations.length : 0} items, expected ${texts.length}`,
    );
  }

  return translations.map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '')));
}
