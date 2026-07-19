import crypto from 'crypto';

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-jwt-secret-key-keeel';

export interface LicenceJwtPayload {
  licence_id: string;
  licence_key: string;
  device_id: string;
  role: string;
  exp: number; // Unix timestamp in seconds
}

/**
 * Generates a clean, readable licence key format: KEEL-XXXX-XXXX
 * Excludes easily confused characters (I, O, 0, 1)
 */
export function generateLicenceKey(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let part1 = '';
  let part2 = '';

  const randomBytes = crypto.randomBytes(8);
  for (let i = 0; i < 4; i++) {
    part1 += chars[randomBytes[i] % chars.length];
    part2 += chars[randomBytes[i + 4] % chars.length];
  }

  return `KEEL-${part1}-${part2}`;
}

/**
 * Signs a payload into a base64url encoded JWT token using HMAC-SHA256.
 */
export function signLicenceToken(payload: Omit<LicenceJwtPayload, 'exp'>, expiresInDays = 365): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;
  const fullPayload: LicenceJwtPayload = { ...payload, exp };

  const header = { alg: 'HS256', typ: 'JWT' };
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');

  return `${base64Header}.${base64Payload}.${signature}`;
}

/**
 * Verifies a JWT token signature and expiration date.
 * Returns decoded payload if valid, null otherwise.
 */
export function verifyLicenceToken(token: string): LicenceJwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length) return null;

    const isValid = crypto.timingSafeEqual(sigBuf, expectedBuf);
    if (!isValid) return null;

    const decodedPayload: LicenceJwtPayload = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    // Expiry check
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedPayload;
  } catch (error) {
    console.error('Error verifying licence token:', error);
    return null;
  }
}
