import crypto from 'crypto';
import { verifyLicenceToken } from '@/lib/licenceJwt';
import { createAdminClient } from '@/lib/supabase/server';

export type PronunciationStudent = {
  studentKey: string;
  profileId: string | null;
  licenceId: string | null;
};

export async function authenticatePronunciationStudent(
  request: Request,
): Promise<PronunciationStudent | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const admin = createAdminClient();
  const licencePayload = verifyLicenceToken(token);

  if (licencePayload) {
    const { data: licence } = await admin
      .from('licences')
      .select('id, status, expires_at')
      .eq('id', licencePayload.licence_id)
      .single();
    const expired = licence?.expires_at && new Date(licence.expires_at) <= new Date();
    if (!licence || licence.status !== 'active' || expired) return null;

    const deviceHash = crypto
      .createHash('sha256')
      .update(licencePayload.device_id)
      .digest('hex')
      .slice(0, 24);
    return {
      studentKey: `licence:${licence.id}:${deviceHash}`,
      profileId: null,
      licenceId: licence.id,
    };
  }

  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await admin
    .from('profiles')
    .select('id, role, web_subscription_active, web_subscription_expires_at, school_memberships(school_licenses(status, expires_at))')
    .eq('id', user.id)
    .single();
  if (!profile) return null;

  const directActive = Boolean(
    profile.web_subscription_active &&
      profile.web_subscription_expires_at &&
      new Date(profile.web_subscription_expires_at) > new Date(),
  );
  const memberships = Array.isArray(profile.school_memberships) ? profile.school_memberships : [];
  const schoolActive = memberships.some((membership) => {
    const relation = membership.school_licenses;
    const licence = Array.isArray(relation) ? relation[0] : relation;
    return licence?.status === 'active' && (!licence.expires_at || new Date(licence.expires_at) > new Date());
  });
  const privileged = profile.role === 'super_admin' || profile.role === 'school_admin';
  if (!directActive && !schoolActive && !privileged) return null;

  return { studentKey: `profile:${user.id}`, profileId: user.id, licenceId: null };
}
