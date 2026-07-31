import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data } = await supabase
    .from("video_screenings")
    .select("id, candidate_name, prompt, status, expires_at, video_storage_path")
    .eq("invite_token", token)
    .maybeSingle();

  if (!data) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  return NextResponse.json({
    candidateName: data.candidate_name,
    prompt: data.prompt,
    status: data.status,
    hasVideo: Boolean(data.video_storage_path),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data: invite } = await supabase
    .from("video_screenings")
    .select("id, status, expires_at")
    .eq("invite_token", token)
    .maybeSingle();

  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }
  if (invite.status === "submitted" || invite.status === "reviewed") {
    return NextResponse.json({ error: "Already submitted" }, { status: 400 });
  }

  const formData = await request.formData();
  const video = formData.get("video") as File | null;
  if (!video || video.size === 0) {
    return NextResponse.json({ error: "Video required" }, { status: 400 });
  }
  if (video.size > 80 * 1024 * 1024) {
    return NextResponse.json({ error: "Video must be under 80MB" }, { status: 400 });
  }

  const path = `video-screenings/${invite.id}/${Date.now()}-${video.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const buffer = Buffer.from(await video.arrayBuffer());
  const contentType = video.type || "video/webm";

  // Prefer dedicated bucket; fall back to cvs if video bucket missing.
  // Prefix path with bucket name so employer playback can resolve it.
  let bucket: "video-screenings" | "cvs" = "video-screenings";
  let uploadError = (
    await supabase.storage.from(bucket).upload(path, buffer, {
      contentType,
      upsert: false,
    })
  ).error;

  if (uploadError) {
    bucket = "cvs";
    uploadError = (
      await supabase.storage.from(bucket).upload(path, buffer, {
        contentType,
        upsert: false,
      })
    ).error;
  }

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  await supabase
    .from("video_screenings")
    .update({
      video_storage_path: `${bucket}:${path}`,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", invite.id);

  return NextResponse.json({ success: true });
}
