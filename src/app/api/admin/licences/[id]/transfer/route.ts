import { createAdminClient } from '@/lib/supabase/server';
import { generateLicenceKey } from '@/lib/licenceJwt';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/licences/[id]/transfer
 * Revokes the old licence and generates a new key under the same duration/org.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: licenceId } = await params;
    const adminClient = createAdminClient();

    // 1. Fetch existing licence
    const { data: oldLicence, error: fetchError } = await adminClient
      .from('licences')
      .select('*')
      .eq('id', licenceId)
      .single();

    if (fetchError || !oldLicence) {
      return NextResponse.json({ error: 'Licence not found' }, { status: 404 });
    }

    if (oldLicence.status === 'revoked') {
      return NextResponse.json({ error: 'Licence is already revoked' }, { status: 400 });
    }

    // 2. Revoke old licence
    await adminClient
      .from('licences')
      .update({ status: 'revoked' })
      .eq('id', licenceId);

    // Log revocation
    await adminClient.from('licence_activity_log').insert({
      licence_id: licenceId,
      action: 'revoked',
      metadata: { reason: 'Transferred by Admin' },
    });

    // 3. Generate new replacement key
    const newKey = generateLicenceKey();
    const { data: newLicence, error: createError } = await adminClient
      .from('licences')
      .insert({
        key: newKey,
        duration_months: oldLicence.duration_months,
        organisation_id: oldLicence.organisation_id,
        purchaser_profile_id: oldLicence.purchaser_profile_id,
        source: oldLicence.source,
        type: oldLicence.type,
        status: 'pending',
      })
      .select()
      .single();

    if (createError || !newLicence) {
      return NextResponse.json({ error: 'Failed to generate new licence key' }, { status: 500 });
    }

    // Log transfer creation
    await adminClient.from('licence_activity_log').insert({
      licence_id: newLicence.id,
      action: 'transferred',
      metadata: { transferred_from_key: oldLicence.key, transferred_from_id: oldLicence.id },
    });

    return NextResponse.json({
      message: 'Licence key revoked and new key issued',
      old_key: oldLicence.key,
      new_key: newKey,
      new_licence: newLicence,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
