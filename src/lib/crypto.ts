import crypto from 'crypto';

/**
 * Verifies if an HMAC signature is valid and not expired.
 * The signature is computed as HMAC_SHA256(secretKey, noteId + userId + expiry)
 * 
 * @param noteId ID of the note being requested
 * @param userId ID of the user requesting the note (from the old app)
 * @param expiry Unix timestamp in seconds indicating link expiration
 * @param signature Signature sent in the request query
 */
export function verifyOldAppSignature(
  noteId: string,
  userId: string,
  expiry: string,
  signature: string
): boolean {
  const secret = process.env.OLD_APP_SHARED_SECRET;
  if (!secret) {
    console.error('OLD_APP_SHARED_SECRET is not configured.');
    return false;
  }

  // 1. Check link expiration
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (parseInt(expiry, 10) < currentTimestamp) {
    console.warn(`Link expired. Current: ${currentTimestamp}, Expiry: ${expiry}`);
    return false;
  }

  // 2. Compute expected HMAC signature
  const data = noteId + userId + expiry;
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');

  // 3. Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return false;
  }
}
