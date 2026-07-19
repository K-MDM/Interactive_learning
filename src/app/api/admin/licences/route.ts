import { createAdminClient } from '@/lib/supabase/server';
import { generateLicenceKey } from '@/lib/licenceJwt';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/licences — Search/Filter licences with pagination
 * POST /api/admin/licences — Bulk generate licence keys for enterprises or grants
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const source = searchParams.get('source');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const organisationId = searchParams.get('organisation_id');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;

    const adminClient = createAdminClient();

    let query = adminClient
      .from('licences')
      .select(`
        *,
        organisations ( id, name ),
        profiles ( email, full_name )
      `, { count: 'exact' });

    if (source) query = query.eq('source', source);
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (organisationId) query = query.eq('organisation_id', organisationId);

    if (search && search.length > 0) {
      query = query.or(`key.ilike.%${search}%,last_activated_device_id.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: licences, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also calculate KPI breakdown
    const { data: kpiData } = await adminClient
      .from('licences')
      .select('status, source, type');

    const kpis = {
      total: kpiData?.length || 0,
      active: kpiData?.filter(x => x.status === 'active').length || 0,
      pending: kpiData?.filter(x => x.status === 'pending').length || 0,
      free: kpiData?.filter(x => x.type === 'free').length || 0,
      paid: kpiData?.filter(x => x.type === 'paid').length || 0,
      mobile: kpiData?.filter(x => x.source === 'mobile').length || 0,
      web: kpiData?.filter(x => x.source === 'web').length || 0,
      dashboard: kpiData?.filter(x => x.source === 'dashboard').length || 0,
    };

    return NextResponse.json({
      licences: licences || [],
      kpis,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quantity = 1, duration_months = 12, organisation_id, type = 'free' } = body;

    const countToGenerate = Math.min(500, Math.max(1, parseInt(quantity)));
    const duration = Math.max(1, parseInt(duration_months));

    const adminClient = createAdminClient();

    const newKeys: string[] = [];
    const rowsToInsert = [];

    for (let i = 0; i < countToGenerate; i++) {
      const key = generateLicenceKey();
      newKeys.push(key);
      rowsToInsert.push({
        key,
        duration_months: duration,
        organisation_id: organisation_id || null,
        source: 'dashboard',
        type: type === 'paid' ? 'paid' : 'free',
        status: 'pending',
      });
    }

    const { data: inserted, error } = await adminClient
      .from('licences')
      .insert(rowsToInsert)
      .select();

    if (error) {
      console.error('Bulk licence insertion error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Write activity log for bulk generation
    if (inserted && inserted.length > 0) {
      const logRows = inserted.map(lic => ({
        licence_id: lic.id,
        action: 'created',
        metadata: {
          bulk_generated: true,
          organisation_id,
          type,
          duration_months: duration,
        },
      }));
      await adminClient.from('licence_activity_log').insert(logRows);
    }

    return NextResponse.json({
      message: `Successfully generated ${inserted?.length} licence keys`,
      licences: inserted || [],
      keys: newKeys,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
