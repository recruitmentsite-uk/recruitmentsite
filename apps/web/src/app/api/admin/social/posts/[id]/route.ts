import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { data, error } = await admin
    .from("social_posts")
    .select("*, social_post_publishes(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post: data });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  for (const key of [
    "title",
    "body",
    "captions",
    "image_url",
    "link_url",
    "platforms",
    "status",
    "scheduled_for",
    "tags",
  ]) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  const { data, error } = await admin
    .from("social_posts")
    .update(updates)
    .eq("id", id)
    .select("*, social_post_publishes(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { error } = await admin.from("social_posts").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
