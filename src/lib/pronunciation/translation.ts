import crypto from 'crypto';

export const REGIONAL_LOCALES = ['hi-IN', 'pa-IN', 'mr-IN', 'bn-IN', 'ta-IN', 'te-IN'] as const;

export function pronunciationSourceHash(value: string): string {
  return crypto.createHash('sha256').update(value.normalize('NFKC').trim()).digest('hex');
}

export async function translatePronunciationTexts(
  texts: string[],
  locale: string,
): Promise<string[]> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_TRANSLATE_API_KEY is not configured');
  const target = locale.split('-')[0];
  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: texts, source: 'en', target, format: 'text' }),
      cache: 'no-store',
    },
  );
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Translation failed with status ${response.status}`);
  }
  const translations = payload?.data?.translations;
  if (!Array.isArray(translations) || translations.length !== texts.length) {
    throw new Error('Translation provider returned an invalid response');
  }
  return translations.map((item: { translatedText: string }) => decodeHtml(item.translatedText));
}

function decodeHtml(value: string): string {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

