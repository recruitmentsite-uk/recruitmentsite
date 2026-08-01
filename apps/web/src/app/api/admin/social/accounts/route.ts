import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { socialConnectionStatus, type SocialPlatformKey } from "@/lib/social-publish";

export async function GET() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const connected = socialConnectionStatus();
  const admin = getSupabaseAdmin();

  if (!admin) {
    return NextResponse.json({
      accounts: Object.entries(connected).map(([platform, isConnected]) => ({
        platform,
        label: platform,
        connected: isConnected,
        enabled: true,
      })),
      configured: false,
    });
  }

  const { data, error } = await admin
    .from("social_accounts")
    .select("*")
    .order("platform");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const accounts = (data ?? []).map((row) => ({
    ...row,
    connected: connected[row.platform as SocialPlatformKey] ?? false,
  }));

  return NextResponse.json({ accounts, configured: true });
}

export async function PATCH(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();
  const platform = String(body.platform ?? "");
  if (!platform) {
    return NextResponse.json({ error: "platform required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  for (const key of ["label", "handle", "profile_url", "external_page_id", "enabled", "notes"]) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  const { data, error } = await admin
    .from("social_accounts")
    .update(updates)
    .eq("platform", platform)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    account: {
      ...data,
      connected: socialConnectionStatus()[platform as SocialPlatformKey] ?? false,
    },
  });
}
