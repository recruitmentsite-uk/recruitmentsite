import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  publishToPlatforms,
  type SocialPlatformKey,
} from "@/lib/social-publish";

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
  const postId = String(body.postId ?? "");
  if (!postId) {
    return NextResponse.json({ error: "postId required" }, { status: 400 });
  }

  const { data: post, error } = await admin
    .from("social_posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (error || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const platforms = (
    Array.isArray(body.platforms) && body.platforms.length
      ? body.platforms
      : post.platforms
  ) as SocialPlatformKey[];

  await admin
    .from("social_posts")
    .update({ status: "publishing", updated_at: new Date().toISOString(), last_error: null })
    .eq("id", postId);

  const results = await publishToPlatforms({
    platforms,
    body: post.body,
    captions: post.captions as Record<string, string>,
    imageUrl: post.image_url,
    linkUrl: post.link_url,
  });

  for (const result of results) {
    await admin.from("social_post_publishes").upsert(
      {
        post_id: postId,
        platform: result.platform,
        status: result.status,
        external_id: result.externalId ?? null,
        external_url: result.externalUrl ?? null,
        error: result.error ?? null,
        published_at:
          result.status === "published" ? new Date().toISOString() : null,
      },
      { onConflict: "post_id,platform" },
    );
  }

  const anyPublished = results.some((r) => r.status === "published");
  const anyFailed = results.some((r) => r.status === "failed");
  const allSkipped = results.every((r) => r.status === "skipped");

  let status = "failed";
  if (anyPublished && !anyFailed) status = "published";
  else if (anyPublished && anyFailed) status = "published";
  else if (allSkipped) status = "queued";

  const lastError = results
    .filter((r) => r.error)
    .map((r) => `${r.platform}: ${r.error}`)
    .join("; ");

  const { data: updated } = await admin
    .from("social_posts")
    .update({
      status,
      published_at: anyPublished ? new Date().toISOString() : post.published_at,
      last_error: lastError || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .select("*, social_post_publishes(*)")
    .single();

  return NextResponse.json({
    post: updated,
    results,
    hint: allSkipped
      ? "No platform tokens configured. Set META_* / LINKEDIN_* env vars, then republish."
      : undefined,
  });
}
