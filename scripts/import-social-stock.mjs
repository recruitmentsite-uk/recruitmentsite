#!/usr/bin/env node
/**
 * Import docs/social-posts/stock/*.md into social_posts library.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const stockDir = join(root, "docs/social-posts/stock");

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Need SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function section(md, name) {
  const re = new RegExp(`##\\s*${name}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, "i");
  return md.match(re)?.[1]?.trim() || "";
}

function parsePack(filePath, date) {
  const md = readFileSync(filePath, "utf8");
  const title =
    md.match(/^#\s+(.+)$/m)?.[1]?.replace(/—.*$/, "").trim() || `Stock ${date}`;
  const ig = section(md, "instagram") || section(md, "Instagram");
  const fb =
    section(md, "facebook") ||
    section(md, "LinkedIn / Facebook") ||
    section(md, "linkedin");
  const li =
    section(md, "linkedin") ||
    section(md, "LinkedIn / Facebook") ||
    fb;
  const body = fb || li || ig;
  const image = `/brand/social/posts/stock/${date}-linkedin.png`;
  const scheduled = `${date}T08:00:00.000Z`;

  return {
    title: title.slice(0, 120),
    body,
    captions: {
      instagram: ig || body,
      facebook: fb || body,
      linkedin: li || body,
    },
    image_url: image,
    link_url: body.includes("pricing")
      ? "https://recruitmentsite.co.uk/pricing"
      : "https://recruitmentsite.co.uk",
    platforms: ["facebook", "instagram", "linkedin"],
    status: "queued",
    scheduled_for: scheduled,
    tags: ["stock", date],
    source: "stock",
  };
}

async function main() {
  if (!existsSync(stockDir)) {
    console.error("No stock dir");
    process.exit(1);
  }

  const files = readdirSync(stockDir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort();

  let upserted = 0;
  for (const file of files) {
    const date = file.replace(".md", "");
    const row = parsePack(join(stockDir, file), date);

    const { data: existing } = await supabase
      .from("social_posts")
      .select("id")
      .eq("source", "stock")
      .contains("tags", [date])
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from("social_posts")
        .update({ ...row, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) {
        console.error(`Update ${date}:`, error.message);
        continue;
      }
    } else {
      const { error } = await supabase.from("social_posts").insert(row);
      if (error) {
        console.error(`Insert ${date}:`, error.message);
        continue;
      }
    }
    upserted += 1;
    console.log(`✓ ${date} — ${row.title}`);
  }

  console.log(`Done: ${upserted}/${files.length} stock posts in library`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
