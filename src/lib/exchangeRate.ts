// In-memory cache for the exchange rate to avoid rate limits and slow page loads
let cachedRate: number | null = null;
let cacheExpiry: number = 0;

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
const DEFAULT_FALLBACK_RATE = 83.5;

/**
 * Fetches the live USD to INR exchange rate.
 * Caches the result in-memory for 1 hour.
 */
export async function getUsdToInrRate(): Promise<number> {
  const now = Date.now();

  // Return cached rate if it is valid
  if (cachedRate && now < cacheExpiry) {
    return cachedRate;
  }

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 }, // Enable Next.js cache too
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates. HTTP status: ${response.status}`);
    }

    const data = await response.json();
    const rate = data.rates?.INR;

    if (!rate || typeof rate !== 'number') {
      throw new Error('Exchange rate API returned invalid format');
    }

    cachedRate = rate;
    cacheExpiry = now + CACHE_DURATION_MS;
    console.log(`Live exchange rate updated: 1 USD = ${rate} INR`);
    return rate;
  } catch (error) {
    console.error('Error fetching live exchange rate, using fallback:', error);
    // If the cache has expired but we still have an old cached rate, use it as fallback before the hard default
    return cachedRate || DEFAULT_FALLBACK_RATE;
  }
}
