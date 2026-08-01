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

  const { data: ticket, error } = await admin
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: messages } = await admin
    .from("support_ticket_messages")
    .select("*")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ ticket, messages: messages ?? [] });
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
    "subject",
    "body",
    "status",
    "priority",
    "channel",
    "requester_email",
    "requester_name",
    "assignee_email",
    "mailbox",
    "tags",
  ]) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (body.status === "resolved" || body.status === "closed") {
    updates.resolved_at = new Date().toISOString();
  }

  if (typeof body.message === "string" && body.message.trim()) {
    await admin.from("support_ticket_messages").insert({
      ticket_id: id,
      author_email: user.email,
      body: body.message.trim(),
      is_internal: Boolean(body.is_internal),
    });
  }

  const { data, error } = await admin
    .from("support_tickets")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ticket: data });
}
