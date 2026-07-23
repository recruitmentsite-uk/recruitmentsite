import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getEmployerContext } from "@/lib/employer";

export async function GET() {
  const ctx = await getEmployerContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ companyName: ctx.companyName, atsWebhookUrl: "" });
  }

  const { data } = await supabase
    .from("employers")
    .select("company_name, slug, ats_webhook_url, vertical")
    .eq("id", ctx.employerId)
    .single();

  return NextResponse.json({
    companyName: data?.company_name ?? ctx.companyName,
    slug: data?.slug ?? ctx.slug,
    atsWebhookUrl: data?.ats_webhook_url ?? "",
    vertical: data?.vertical ?? "general",
  });
}

export async function PATCH(request: Request) {
  try {
    const ctx = await getEmployerContext();
    if (!ctx || ctx.role === "recruiter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { companyName, atsWebhookUrl, vertical } = await request.json();
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json({ success: true, mode: "demo" });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (companyName) updates.company_name = companyName;
    if (atsWebhookUrl !== undefined) updates.ats_webhook_url = atsWebhookUrl || null;
    if (vertical) updates.vertical = vertical;

    const { error } = await supabase.from("employers").update(updates).eq("id", ctx.employerId);
    if (error) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
