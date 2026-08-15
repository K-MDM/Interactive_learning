import { signLicenceToken, verifyLicenceToken, generateLicenceKey } from '../src/lib/licenceJwt';

function testSuperKeyJwtFlow() {
  console.log('--- Test 1: Generate Standard Licence Key Format ---');
  const generatedKey = generateLicenceKey();
  console.log('Generated Key:', generatedKey);
  if (!/^KEEEL-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/.test(generatedKey)) {
    throw new Error('Key does not match expected format');
  }
  console.log('✓ Key format is valid');

  console.log('\n--- Test 2: Multi-Device Token Generation for Super Key ---');
  const superLicence = {
    id: '11111111-2222-3333-4444-555555555555',
    key: 'KEEEL-PLAY-2099',
    is_super: true,
    status: 'active',
    expires_at: '2099-12-31T23:59:59Z',
  };

  const daysUntilExpiry = Math.max(1, Math.ceil((new Date(superLicence.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  // Device 1 (Reviewer Alpha)
  const tokenDev1 = signLicenceToken({
    licence_id: superLicence.id,
    licence_key: superLicence.key,
    device_id: 'reviewer-device-alpha',
    role: 'student',
  }, daysUntilExpiry);

  // Device 2 (Reviewer Beta / Test Bot)
  const tokenDev2 = signLicenceToken({
    licence_id: superLicence.id,
    licence_key: superLicence.key,
    device_id: 'reviewer-device-beta',
    role: 'student',
  }, daysUntilExpiry);

  const payload1 = verifyLicenceToken(tokenDev1);
  const payload2 = verifyLicenceToken(tokenDev2);

  console.log('Decoded Device 1 Payload:', payload1);
  console.log('Decoded Device 2 Payload:', payload2);

  if (!payload1 || payload1.device_id !== 'reviewer-device-alpha') {
    throw new Error('Device 1 payload mismatch');
  }
  if (!payload2 || payload2.device_id !== 'reviewer-device-beta') {
    throw new Error('Device 2 payload mismatch');
  }
  if (payload1.licence_id !== payload2.licence_id) {
    throw new Error('Licence ID mismatch');
  }

  console.log('✓ Both devices have valid, distinct JWT tokens mapped to the same super licence');
  console.log('\n--- ALL UNIT TESTS PASSED SUCCESSFULLY! ---');
}

testSuperKeyJwtFlow();
