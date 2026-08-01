import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ posts: [], configured: false });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  let query = admin
    .from("social_posts")
    .select("*, social_post_publishes(*)")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (q?.trim()) {
    query = query.or(`title.ilike.%${q.trim()}%,body.ilike.%${q.trim()}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data ?? [], configured: true });
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const platforms = Array.isArray(body.platforms)
    ? body.platforms.filter((p: unknown) => typeof p === "string")
    : ["facebook", "linkedin"];

  const row = {
    title,
    body: String(body.body ?? "").trim(),
    captions: body.captions && typeof body.captions === "object" ? body.captions : {},
    image_url: body.image_url || null,
    link_url: body.link_url || null,
    platforms,
    status: body.status ?? "draft",
    scheduled_for: body.scheduled_for || null,
    tags: Array.isArray(body.tags) ? body.tags : [],
    source: body.source ?? "manual",
    created_by: user.email ?? null,
  };

  const { data, error } = await admin
    .from("social_posts")
    .insert(row)
    .select("*, social_post_publishes(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}
