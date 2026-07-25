/** Shared helpers for inbound job feed normalisation. */

const FEED_EMPLOYER_ID = "00000000-0000-0000-0000-000000000001";

export { FEED_EMPLOYER_ID };

const TITLE_HINTS = [
  [/nurse|hca|care assistant|clinical|nhs|paramedic|midwife/i, "healthcare"],
  [/electrician|plumber|carpenter|site manager|bricklayer|scaffolder/i, "trades"],
  [/developer|engineer|devops|software|frontend|backend|data scientist/i, "tech"],
  [/teacher|teaching assistant|sendco|lecturer|tutor/i, "education"],
  [/chef|sous|barista|hotel|restaurant|hospitality/i, "hospitality"],
  [/warehouse|hgv|lgv|forklift|logistics|driver|courier/i, "logistics"],
  [/accountant|bookkeep|finance|auditor|credit control/i, "finance"],
  [/retail|store manager|shop|merchandis/i, "retail"],
  [/solicitor|paralegal|legal|compliance officer|conveyanc/i, "legal"],
  [/marketing|content|seo|brand|copywriter|designer/i, "marketing"],
  [/mechanical|cnc|manufactur|quality engineer|electrical engineer/i, "engineering"],
];

export function inferVertical(title, fallback = "general") {
  const t = title || "";
  for (const [re, vertical] of TITLE_HINTS) {
    if (re.test(t)) return vertical;
  }
  return fallback;
}

export function slugify(input, max = 60) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, max);
}

export function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseSalarySnippet(raw) {
  if (!raw || typeof raw !== "string") return { min: null, max: null };
  const nums = [...raw.replace(/,/g, "").matchAll(/£?\s*(\d{2,6})(?:\.\d+)?/g)].map((m) => Number(m[1]));
  if (!nums.length) return { min: null, max: null };
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

export function expiresInDays(days = 30) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

export async function upsertJob(supabase, row) {
  if (!supabase) {
    console.log(`  [dry-run] ${row.external_source}: ${row.title} — ${row.city}`);
    return true;
  }
  const { error } = await supabase.from("jobs").upsert(
    { employer_id: FEED_EMPLOYER_ID, ...row },
    { onConflict: "slug", ignoreDuplicates: true },
  );
  if (error) {
    console.error(`  upsert failed (${row.slug}):`, error.message);
    return false;
  }
  return true;
}
