/**
 * IP Geolocation and Jurisdiction Pricing Resolver
 */

export interface PricingSettings {
  tax_mode?: 'all' | 'domestic_only' | 'per_country';
  tax_percent?: number;
  intl_fee_percent?: number;
  domestic_country?: string;
  country_taxes?: Record<string, number>;
  jurisdiction_prices?: Record<string, { currency: string; price: number }>;
}

export interface ResolvedPricing {
  countryCode: string;
  isDomestic: boolean;
  currency: 'INR' | 'USD' | string;
  basePrice: number;
  planDiscountPercent: number;
  planDiscountAmount: number;
  priceAfterPlanDiscount: number;
  couponDiscountPercent: number;
  couponDiscountAmount: number;
  discountedPrice: number;
  intlFeePercent: number;
  intlFeeAmount: number;
  taxMode: 'all' | 'domestic_only' | 'per_country';
  taxPercent: number;
  taxAmount: number;
  subtotal: number;
  total: number;
}

/**
 * Extracts country ISO code from Request IP headers with server lookup fallback
 */
export async function getCountryFromIp(request: Request): Promise<string> {
  try {
    // 1. Check Cloudflare / Proxy headers
    const cfCountry = request.headers.get('cf-ipcountry');
    if (cfCountry && cfCountry.length === 2 && cfCountry !== 'XX') {
      return cfCountry.toUpperCase();
    }

    const xCountry = request.headers.get('x-ip-country');
    if (xCountry && xCountry.length === 2) {
      return xCountry.toUpperCase();
    }

    // 2. Extract IP address
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const rawIp = xForwardedFor ? xForwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip');

    if (!rawIp || rawIp === '127.0.0.1' || rawIp === '::1' || rawIp.startsWith('192.168.') || rawIp.startsWith('10.')) {
      return 'IN'; // Local dev default
    }

    // 3. Fallback server-side IP lookup with short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const geoRes = await fetch(`https://ipapi.co/${rawIp}/country/`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Keeelai-Platform/1.0' },
    });
    clearTimeout(timeoutId);

    if (geoRes.ok) {
      const country = (await geoRes.text()).trim().toUpperCase();
      if (country && country.length === 2) {
        return country;
      }
    }
  } catch (err) {
    // Silent fallback to domestic default
  }

  return 'IN';
}

/**
 * Resolves jurisdiction-based plan price, international fees, and tax calculations
 */
export function resolveJurisdictionPricing(
  plan: any,
  countryCode: string,
  pricingSettings?: PricingSettings,
  couponDiscountPercent: number = 0,
  requestedCurrency?: string
): ResolvedPricing {
  const normCountry = (countryCode || 'IN').toUpperCase();
  const domesticCountry = (pricingSettings?.domestic_country || 'IN').toUpperCase();
  let isDomestic = normCountry === domesticCountry;

  if (requestedCurrency === 'INR') {
    isDomestic = true;
  } else if (requestedCurrency === 'USD') {
    isDomestic = false;
  }

  const taxMode = pricingSettings?.tax_mode || 'domestic_only';
  const defaultTaxPercent = Number(pricingSettings?.tax_percent ?? 18);
  const intlFeePercent = Number(pricingSettings?.intl_fee_percent ?? 3);

  let currency = 'USD';
  let basePrice = 9.99;

  if (isDomestic) {
    currency = 'INR';
    basePrice = Number(plan?.price_inr ?? plan?.country_prices?.IN ?? (plan?.price_usd ? plan.price_usd * 85 : 0));
  } else {
    // International pricing
    const countryConfig = plan?.country_prices?.[normCountry] || pricingSettings?.jurisdiction_prices?.[normCountry];
    if (countryConfig && countryConfig.price) {
      currency = countryConfig.currency || 'USD';
      basePrice = Number(countryConfig.price);
    } else {
      currency = 'USD';
      basePrice = Number(plan?.price_usd ?? 0);
    }
  }

  // Plan introductory offer discount
  const planDiscountPercent = Math.min(100, Math.max(0, Number(plan?.discount_percent || 0)));
  const planDiscountAmount = basePrice * (planDiscountPercent / 100);
  const priceAfterPlanDiscount = basePrice - planDiscountAmount;

  // Coupon discount
  const safeCouponPercent = Math.min(100, Math.max(0, Number(couponDiscountPercent || 0)));
  const couponDiscountAmount = priceAfterPlanDiscount * (safeCouponPercent / 100);
  const discountedPrice = priceAfterPlanDiscount - couponDiscountAmount;

  // International Fee %
  const appliedIntlFeePercent = !isDomestic ? intlFeePercent : 0;
  const intlFeeAmount = discountedPrice * (appliedIntlFeePercent / 100);

  // Subtotal before tax
  const subtotal = discountedPrice + intlFeeAmount;

  // Tax calculation
  let taxPercent = 0;
  if (taxMode === 'all') {
    taxPercent = defaultTaxPercent;
  } else if (taxMode === 'domestic_only') {
    taxPercent = isDomestic ? defaultTaxPercent : 0;
  } else if (taxMode === 'per_country') {
    const customTax = pricingSettings?.country_taxes?.[normCountry];
    taxPercent = typeof customTax === 'number' ? customTax : (isDomestic ? defaultTaxPercent : 0);
  }

  const taxAmount = subtotal * (taxPercent / 100);
  const total = subtotal + taxAmount;

  return {
    countryCode: normCountry,
    isDomestic,
    currency,
    basePrice,
    planDiscountPercent,
    planDiscountAmount,
    priceAfterPlanDiscount,
    couponDiscountPercent: safeCouponPercent,
    couponDiscountAmount,
    discountedPrice,
    intlFeePercent: appliedIntlFeePercent,
    intlFeeAmount,
    taxMode,
    taxPercent,
    taxAmount,
    subtotal,
    total,
  };
}
