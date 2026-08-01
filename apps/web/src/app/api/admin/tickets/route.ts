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
    return NextResponse.json({ tickets: [], configured: false });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let q = admin
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status && status !== "all") {
    q = q.eq("status", status);
  }

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tickets: data ?? [], configured: true });
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
  const subject = String(body.subject ?? "").trim();
  if (!subject) {
    return NextResponse.json({ error: "Subject required" }, { status: 400 });
  }

  const row = {
    subject,
    body: String(body.body ?? "").trim(),
    status: body.status ?? "open",
    priority: body.priority ?? "normal",
    channel: body.channel ?? "manual",
    requester_email: body.requester_email || null,
    requester_name: body.requester_name || null,
    assignee_email: body.assignee_email || user.email || null,
    mailbox: body.mailbox || null,
    tags: Array.isArray(body.tags) ? body.tags : [],
  };

  const { data, error } = await admin
    .from("support_tickets")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (row.body) {
    await admin.from("support_ticket_messages").insert({
      ticket_id: data.id,
      author_email: user.email,
      body: row.body,
      is_internal: false,
    });
  }

  return NextResponse.json({ ticket: data });
}
