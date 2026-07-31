import { NextResponse } from "next/server";
import { getEmployerContext } from "@/lib/employer";
import { getSupabaseAdmin } from "@/lib/supabase";

const BUCKETS = ["video-screenings", "cvs"] as const;

function parseStorageRef(ref: string): { bucket: string; path: string } {
  const colon = ref.indexOf(":");
  if (colon > 0 && BUCKETS.includes(ref.slice(0, colon) as (typeof BUCKETS)[number])) {
    return { bucket: ref.slice(0, colon), path: ref.slice(colon + 1) };
  }
  return { bucket: "", path: ref };
}

async function createPlaybackUrl(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  storageRef: string,
): Promise<string | null> {
  const parsed = parseStorageRef(storageRef);
  const tryBuckets = parsed.bucket
    ? [parsed.bucket, ...BUCKETS.filter((b) => b !== parsed.bucket)]
    : [...BUCKETS];

  for (const bucket of tryBuckets) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(parsed.path, 60 * 60);
    if (!error && data?.signedUrl) return data.signedUrl;
  }
  return null;
}

/** Employer-only signed URL for a submitted video screening. */
export async function GET(request: Request) {
  const ctx = await getEmployerContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data: row } = await supabase
    .from("video_screenings")
    .select("id, employer_id, status, video_storage_path, candidate_name, candidate_email, prompt")
    .eq("id", id)
    .eq("employer_id", ctx.employerId)
    .maybeSingle();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!row.video_storage_path) {
    return NextResponse.json({ error: "No video submitted yet" }, { status: 404 });
  }

  const url = await createPlaybackUrl(supabase, row.video_storage_path);
  if (!url) return NextResponse.json({ error: "Could not create playback URL" }, { status: 500 });

  if (row.status === "submitted") {
    await supabase
      .from("video_screenings")
      .update({ status: "reviewed" })
      .eq("id", row.id)
      .eq("employer_id", ctx.employerId);
  }

  return NextResponse.json({
    url,
    expiresIn: 3600,
    candidateName: row.candidate_name,
    candidateEmail: row.candidate_email,
    prompt: row.prompt,
    status: row.status === "submitted" ? "reviewed" : row.status,
  });
}
