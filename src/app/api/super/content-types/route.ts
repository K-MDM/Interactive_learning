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

export async function GET() {
  const auth = await verifySuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { data, error } = await auth.adminClient
    .from('content_types').select('*').order('sort_order');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ content_types: data });
}

export async function POST(request: Request) {
  const auth = await verifySuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { name, slug, icon_emoji, color_hex, sort_order } = await request.json();
  if (!name || !slug) return NextResponse.json({ error: 'name and slug required' }, { status: 400 });
  const { data, error } = await auth.adminClient
    .from('content_types')
    .insert({
      name,
      slug: slug.toLowerCase().trim(),
      icon_emoji: icon_emoji ?? null,
      color_hex: color_hex ?? null,
      sort_order: sort_order ?? 0
    })
    .select().single();
  if (error) {
    if (error.message.includes('unique')) return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ content_type: data }, { status: 201 });
}

export async function PUT(request: Request) {
  const auth = await verifySuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id, name, slug, icon_emoji, color_hex, sort_order } = await request.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = slug.toLowerCase().trim();
  if (icon_emoji !== undefined) updates.icon_emoji = icon_emoji;
  if (color_hex !== undefined) updates.color_hex = color_hex;
  if (sort_order !== undefined) updates.sort_order = sort_order;
  const { data, error } = await auth.adminClient
    .from('content_types').update(updates).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ content_type: data });
}

export async function DELETE(request: Request) {
  const auth = await verifySuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { error } = await auth.adminClient.from('content_types').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
