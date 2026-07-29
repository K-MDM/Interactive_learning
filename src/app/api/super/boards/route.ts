import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

async function verifySuperAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'super_admin') return null;
  return { user, adminClient };
}

async function getNextSortOrder(adminClient: any): Promise<number> {
  const { data } = await adminClient
    .from('boards')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);

  if (data && data.length > 0 && typeof data[0].sort_order === 'number') {
    return data[0].sort_order + 1;
  }
  return 1;
}

async function shiftSortOrders(adminClient: any, targetSortOrder: number, excludeId?: string) {
  let query = adminClient
    .from('boards')
    .select('id, sort_order')
    .gte('sort_order', targetSortOrder);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data: items } = await query;
  if (items && items.length > 0) {
    for (const item of items) {
      await adminClient
        .from('boards')
        .update({ sort_order: item.sort_order + 1 })
        .eq('id', item.id);
    }
  }
}

// GET /api/super/boards — list all boards
export async function GET() {
  const auth = await verifySuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await auth.adminClient
    .from('boards').select('*').order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ boards: data });
}

// POST /api/super/boards — create a board
export async function POST(request: Request) {
  const auth = await verifySuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { name, slug, sort_order } = await request.json();
  if (!name || !slug) return NextResponse.json({ error: 'name and slug required' }, { status: 400 });

  let finalSortOrder: number;
  if (sort_order !== undefined && sort_order !== null && Number(sort_order) > 0) {
    finalSortOrder = Number(sort_order);
    await shiftSortOrders(auth.adminClient, finalSortOrder);
  } else {
    finalSortOrder = await getNextSortOrder(auth.adminClient);
  }

  const { data, error } = await auth.adminClient
    .from('boards')
    .insert({ name, slug: slug.toLowerCase().trim(), sort_order: finalSortOrder })
    .select().single();

  if (error) {
    if (error.message.includes('unique')) return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ board: data }, { status: 201 });
}

// PUT /api/super/boards — update a board
export async function PUT(request: Request) {
  const auth = await verifySuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, name, slug, sort_order } = await request.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = slug.toLowerCase().trim();

  if (sort_order !== undefined && sort_order !== null && Number(sort_order) > 0) {
    const finalSortOrder = Number(sort_order);
    await shiftSortOrders(auth.adminClient, finalSortOrder, id);
    updates.sort_order = finalSortOrder;
  }

  const { data, error } = await auth.adminClient
    .from('boards').update(updates).eq('id', id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ board: data });
}

// DELETE /api/super/boards?id=uuid — delete a board
export async function DELETE(request: Request) {
  const auth = await verifySuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { error } = await auth.adminClient.from('boards').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
