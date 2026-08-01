import { NextResponse } from "next/server";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

function section(md: string, name: string) {
  const re = new RegExp(`##\\s*${name}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, "i");
  return md.match(re)?.[1]?.trim() || "";
}

export async function POST() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const stockDir = join(process.cwd(), "../../docs/social-posts/stock");
  const altDir = join(process.cwd(), "docs/social-posts/stock");
  const dir = existsSync(stockDir) ? stockDir : altDir;
  if (!existsSync(dir)) {
    return NextResponse.json(
      { error: "Stock packs not found on server — run pnpm social:import-stock in CI instead" },
      { status: 404 },
    );
  }

  const files = readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort();

  let upserted = 0;
  for (const file of files) {
    const date = file.replace(".md", "");
    const md = readFileSync(join(dir, file), "utf8");
    const title =
      md.match(/^#\s+(.+)$/m)?.[1]?.replace(/—.*$/, "").trim() || `Stock ${date}`;
    const ig = section(md, "instagram") || section(md, "Instagram");
    const fb =
      section(md, "facebook") ||
      section(md, "LinkedIn / Facebook") ||
      section(md, "linkedin");
    const li = section(md, "linkedin") || section(md, "LinkedIn / Facebook") || fb;
    const body = fb || li || ig;
    const row = {
      title: title.slice(0, 120),
      body,
      captions: {
        instagram: ig || body,
        facebook: fb || body,
        linkedin: li || body,
      },
      image_url: `/brand/social/posts/stock/${date}-linkedin.png`,
      link_url: body.includes("pricing")
        ? "https://recruitmentsite.co.uk/pricing"
        : "https://recruitmentsite.co.uk",
      platforms: ["facebook", "instagram", "linkedin"],
      status: "queued",
      scheduled_for: `${date}T08:00:00.000Z`,
      tags: ["stock", date],
      source: "stock",
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await admin
      .from("social_posts")
      .select("id")
      .eq("source", "stock")
      .contains("tags", [date])
      .maybeSingle();

    if (existing?.id) {
      const { error } = await admin.from("social_posts").update(row).eq("id", existing.id);
      if (!error) upserted += 1;
    } else {
      const { error } = await admin.from("social_posts").insert(row);
      if (!error) upserted += 1;
    }
  }

  return NextResponse.json({ upserted, total: files.length });
}
