import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/organisations — List all organisations
 * POST /api/admin/organisations — Create a new organisation
 */

export async function GET() {
  try {
    const adminClient = createAdminClient();
    const { data: orgs, error } = await adminClient
      .from('organisations')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ organisations: orgs || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Organisation name is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data: org, error } = await adminClient
      .from('organisations')
      .insert({ name: name.trim() })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Organisation created', organisation: org });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
