#!/usr/bin/env node
/**
 * Publish social_posts that are queued/scheduled and due.
 */
import { createClient } from "@supabase/supabase-js";
import { publishToPlatforms } from "./lib/social-publish-cli.mjs";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Need SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const now = new Date().toISOString();
  // Only posts with a due scheduled_for — never auto-blast unscheduled queue items
  const { data: due, error } = await supabase
    .from("social_posts")
    .select("*")
    .in("status", ["queued", "scheduled"])
    .lte("scheduled_for", now)
    .not("scheduled_for", "is", null)
    .order("scheduled_for", { ascending: true })
    .limit(5);

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  if (!due?.length) {
    console.log("No due social posts");
    return;
  }

  for (const post of due) {
    console.log(`Publishing: ${post.title}`);
    await supabase
      .from("social_posts")
      .update({ status: "publishing", updated_at: now })
      .eq("id", post.id);

    const results = await publishToPlatforms({
      platforms: post.platforms || [],
      body: post.body,
      captions: post.captions,
      imageUrl: post.image_url,
      linkUrl: post.link_url,
    });

    for (const result of results) {
      await supabase.from("social_post_publishes").upsert(
        {
          post_id: post.id,
          platform: result.platform,
          status: result.status,
          external_id: result.externalId ?? null,
          external_url: result.externalUrl ?? null,
          error: result.error ?? null,
          published_at: result.status === "published" ? now : null,
        },
        { onConflict: "post_id,platform" },
      );
    }

    const anyPublished = results.some((r) => r.status === "published");
    const allSkipped = results.every((r) => r.status === "skipped");
    const lastError = results
      .filter((r) => r.error)
      .map((r) => `${r.platform}: ${r.error}`)
      .join("; ");

    await supabase
      .from("social_posts")
      .update({
        status: anyPublished ? "published" : allSkipped ? "queued" : "failed",
        published_at: anyPublished ? now : post.published_at,
        last_error: lastError || null,
        updated_at: now,
      })
      .eq("id", post.id);

    console.log(`  → ${results.map((r) => `${r.platform}:${r.status}`).join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
