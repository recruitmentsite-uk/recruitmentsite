#!/usr/bin/env node
/**
 * Build NHS trusts + UK local authority HR/recruitment prospect list.
 * Sources: existing employer-prospects + mySociety LA codes + NHS seed domains.
 * Output: data/nhs-council-prospects.json (never prints emails).
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "data/nhs-council-prospects.json");
const existingPath = join(root, "data/employer-prospects.json");
const laCsvUrl =
  "https://raw.githubusercontent.com/mysociety/uk_local_authority_names_and_codes/master/data/uk_local_authorities.csv";

/** Common NHS trust website hosts → organisation name (England + notable). */
const NHS_SEEDS = [
  ["guysandstthomas.nhs.uk", "Guy's and St Thomas' NHS Foundation Trust"],
  ["uclh.nhs.uk", "University College London Hospitals NHS Foundation Trust"],
  ["imperial.nhs.uk", "Imperial College Healthcare NHS Trust"],
  ["bartshealth.nhs.uk", "Barts Health NHS Trust"],
  ["royalfree.nhs.uk", "Royal Free London NHS Foundation Trust"],
  ["kch.nhs.uk", "King's College Hospital NHS Foundation Trust"],
  ["gstt.nhs.uk", "Guy's and St Thomas' NHS Foundation Trust"],
  ["chelwest.nhs.uk", "Chelsea and Westminster Hospital NHS Foundation Trust"],
  ["homerton.nhs.uk", "Homerton Healthcare NHS Foundation Trust"],
  ["whittington.nhs.uk", "Whittington Health NHS Trust"],
  ["leedsth.nhs.uk", "Leeds Teaching Hospitals NHS Trust"],
  ["mft.nhs.uk", "Manchester University NHS Foundation Trust"],
  ["srft.nhs.uk", "Northern Care Alliance NHS Foundation Trust"],
  ["cht.nhs.uk", "Calderdale and Huddersfield NHS Foundation Trust"],
  ["bradfordhospitals.nhs.uk", "Bradford Teaching Hospitals NHS Foundation Trust"],
  ["york.nhs.uk", "York and Scarborough Teaching Hospitals NHS Foundation Trust"],
  ["sth.nhs.uk", "Sheffield Teaching Hospitals NHS Foundation Trust"],
  ["nuh.nhs.uk", "Nottingham University Hospitals NHS Trust"],
  ["uhb.nhs.uk", "University Hospitals Birmingham NHS Foundation Trust"],
  ["uhcw.nhs.uk", "University Hospitals Coventry and Warwickshire NHS Trust"],
  ["uhnm.nhs.uk", "University Hospitals of North Midlands NHS Trust"],
  ["uhs.nhs.uk", "University Hospital Southampton NHS Foundation Trust"],
  ["ouh.nhs.uk", "Oxford University Hospitals NHS Foundation Trust"],
  ["cuh.nhs.uk", "Cambridge University Hospitals NHS Foundation Trust"],
  ["nnuh.nhs.uk", "Norfolk and Norwich University Hospitals NHS Foundation Trust"],
  ["uea.nhs.uk", "Norfolk and Norwich University Hospitals NHS Foundation Trust"],
  ["rlbuht.nhs.uk", "Liverpool University Hospitals NHS Foundation Trust"],
  ["aintree.nhs.uk", "Liverpool University Hospitals NHS Foundation Trust"],
  ["mtw.nhs.uk", "Maidstone and Tunbridge Wells NHS Trust"],
  ["ekhuft.nhs.uk", "East Kent Hospitals University NHS Foundation Trust"],
  ["bsuh.nhs.uk", "University Hospitals Sussex NHS Foundation Trust"],
  ["uhsussex.nhs.uk", "University Hospitals Sussex NHS Foundation Trust"],
  ["porthosp.nhs.uk", "Portsmouth Hospitals University NHS Trust"],
  ["uhd.nhs.uk", "University Hospitals Dorset NHS Foundation Trust"],
  ["nbt.nhs.uk", "North Bristol NHS Trust"],
  ["uhbw.nhs.uk", "University Hospitals Bristol and Weston NHS Foundation Trust"],
  ["rduh.nhs.uk", "Royal Devon University Healthcare NHS Foundation Trust"],
  ["cornwall.nhs.uk", "Royal Cornwall Hospitals NHS Trust"],
  ["plymouth.nhs.uk", "University Hospitals Plymouth NHS Trust"],
  ["tameside.nhs.uk", "Tameside and Glossop Integrated Care NHS Foundation Trust"],
  ["wwl.nhs.uk", "Wrightington, Wigan and Leigh Teaching Hospitals NHS Foundation Trust"],
  ["boltonft.nhs.uk", "Bolton NHS Foundation Trust"],
  ["stockport.nhs.uk", "Stockport NHS Foundation Trust"],
  ["tgh.nhs.uk", "Tameside and Glossop Integrated Care NHS Foundation Trust"],
  ["pat.nhs.uk", "Northern Care Alliance NHS Foundation Trust"],
  ["srft.nhs.uk", "Salford Royal NHS Foundation Trust"],
  ["gosh.nhs.uk", "Great Ormond Street Hospital for Children NHS Foundation Trust"],
  ["rmh.nhs.uk", "The Royal Marsden NHS Foundation Trust"],
  ["moorfields.nhs.uk", "Moorfields Eye Hospital NHS Foundation Trust"],
  ["rbht.nhs.uk", "Royal Brompton and Harefield hospitals (Guy's and St Thomas')"],
  ["swlstg.nhs.uk", "South West London and St George's Mental Health NHS Trust"],
  ["slam.nhs.uk", "South London and Maudsley NHS Foundation Trust"],
  ["candi.nhs.uk", "Camden and Islington NHS Foundation Trust"],
  ["elft.nhs.uk", "East London NHS Foundation Trust"],
  ["nelft.nhs.uk", "North East London NHS Foundation Trust"],
  ["cnwl.nhs.uk", "Central and North West London NHS Foundation Trust"],
  ["wlmht.nhs.uk", "West London NHS Trust"],
  ["berkshirehealthcare.nhs.uk", "Berkshire Healthcare NHS Foundation Trust"],
  ["oxfordhealth.nhs.uk", "Oxford Health NHS Foundation Trust"],
  ["nsft.nhs.uk", "Norfolk and Suffolk NHS Foundation Trust"],
  ["cpft.nhs.uk", "Cambridgeshire and Peterborough NHS Foundation Trust"],
  ["lpft.nhs.uk", "Lincolnshire Partnership NHS Foundation Trust"],
  ["leicspart.nhs.uk", "Leicestershire Partnership NHS Trust"],
  ["nhft.nhs.uk", "Northamptonshire Healthcare NHS Foundation Trust"],
  ["bwc.nhs.uk", "Birmingham Women's and Children's NHS Foundation Trust"],
  ["swft.nhs.uk", "South Warwickshire University NHS Foundation Trust"],
  ["walsallhealthcare.nhs.uk", "Walsall Healthcare NHS Trust"],
  ["dgoh.nhs.uk", "The Dudley Group NHS Foundation Trust"],
  ["rwt.nhs.uk", "The Royal Wolverhampton NHS Trust"],
  ["uhnm.nhs.uk", "University Hospitals of North Midlands NHS Trust"],
  ["mpft.nhs.uk", "Midlands Partnership University NHS Foundation Trust"],
  ["sssft.nhs.uk", "Midlands Partnership University NHS Foundation Trust"],
  ["combined.nhs.uk", "North Staffordshire Combined Healthcare NHS Trust"],
  ["ldh.nhs.uk", "Bedfordshire Hospitals NHS Foundation Trust"],
  ["whht.nhs.uk", "West Hertfordshire Teaching Hospitals NHS Trust"],
  ["enherts-tr.nhs.uk", "East and North Hertfordshire NHS Trust"],
  ["qehkl.nhs.uk", "The Queen Elizabeth Hospital King's Lynn NHS Foundation Trust"],
  ["jpaget.nhs.uk", "James Paget University Hospitals NHS Foundation Trust"],
  ["wsh.nhs.uk", "West Suffolk NHS Foundation Trust"],
  ["esneft.nhs.uk", "East Suffolk and North Essex NHS Foundation Trust"],
  ["meht.nhs.uk", "Mid and South Essex NHS Foundation Trust"],
  ["bhrhospitals.nhs.uk", "Barking, Havering and Redbridge University Hospitals NHS Trust"],
  ["nhsforthvalley.com", "NHS Forth Valley"],
  ["nhslothian.scot", "NHS Lothian"],
  ["nhsggc.org.uk", "NHS Greater Glasgow and Clyde"],
  ["nhsgrampian.org", "NHS Grampian"],
  ["nhstayside.scot.nhs.uk", "NHS Tayside"],
  ["nhshighland.scot.nhs.uk", "NHS Highland"],
  ["wales.nhs.uk", "NHS Wales"],
  ["belfasttrust.hscni.net", "Belfast Health and Social Care Trust"],
  ["northerntrust.hscni.net", "Northern Health and Social Care Trust"],
  ["southerntrust.hscni.net", "Southern Health and Social Care Trust"],
  ["westerntrust.hscni.net", "Western Health and Social Care Trust"],
  ["setrust.hscni.net", "South Eastern Health and Social Care Trust"],
];

const HR_LOCALS = ["recruitment", "hr", "jobs", "vacancies", "resourcing", "workforce"];

function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function domainFromWebsite(url) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function preferHrEmail(emails, domain) {
  const list = (emails || []).map((e) => String(e).toLowerCase());
  for (const local of HR_LOCALS) {
    const hit = list.find((e) => e.startsWith(`${local}@`));
    if (hit) return hit;
  }
  const anyHr = list.find((e) => /recruit|hr@|jobs@|vacanc|workforce|resourc/i.test(e));
  if (anyHr) return anyHr;
  if (domain) return `${HR_LOCALS[0]}@${domain}`;
  return list[0] || null;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = [];
    let cur = "";
    let inQ = false;
    for (const ch of lines[i]) {
      if (ch === '"') {
        inQ = !inQ;
        continue;
      }
      if (ch === "," && !inQ) {
        cols.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    cols.push(cur);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (cols[idx] || "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function fromExisting() {
  if (!existsSync(existingPath)) return [];
  const all = JSON.parse(readFileSync(existingPath, "utf8"));
  const out = [];
  for (const p of all) {
    const blob = `${p.companyName || ""} ${p.domain || ""} ${p.website || ""} ${p.email || ""}`.toLowerCase();
    const isNhs = /nhs|\.nhs\.uk|foundation trust|health board|\bicb\b|hscni\.net/.test(blob);
    const isCouncil =
      /\.gov\.uk|council|borough council|city council|county council|local authority|unitary/.test(
        blob,
      );
    if (!isNhs && !isCouncil) continue;
    const domain = (p.domain || domainFromWebsite(p.website || "") || "").toLowerCase();
    const email =
      preferHrEmail(
        [...(p.emails || []), p.email].filter(Boolean),
        domain || null,
      ) || p.email;
    out.push({
      id: p.id || `pub-${slugify(p.companyName || domain)}`,
      companyName: p.companyName,
      slug: p.slug || slugify(p.companyName || domain),
      sector: isNhs ? "nhs" : "council",
      vertical: isNhs ? "nhs" : "public-sector",
      city: p.city || p.town || "",
      website: p.website || (domain ? `https://www.${domain}` : null),
      domain: domain || null,
      email,
      emailStatus: p.emailStatus || (email ? "guessed" : null),
      emails: p.emails || (email ? [email] : []),
      priority: isNhs ? 1 : 2,
      source: "employer-prospects",
      outreachHook: isNhs
        ? "NHS trust workforce — flat-fee board vs agency / bank spend"
        : "Council workforce — predictable hiring cost vs agencies",
    });
  }
  return out;
}

function domainFromLaRow(r) {
  const nation = (r.nation || "").toLowerCase();
  const slug = (r["gov-uk-slug"] || r.gov_uk_slug || "").toLowerCase();
  if (!slug) return null;
  if (nation.includes("scotland")) return `${slug}.gov.scot`;
  if (nation.includes("wales")) return `${slug}.gov.wales`;
  // NI + England commonly *.gov.uk
  return `${slug}.gov.uk`;
}

async function fromMySociety() {
  const res = await fetch(laCsvUrl);
  if (!res.ok) throw new Error(`LA CSV download failed: ${res.status}`);
  const rows = parseCsv(await res.text());
  const out = [];
  for (const r of rows) {
    // Skip historic / replaced authorities
    if (String(r["current-authority"] || r.current_authority || "True").toLowerCase() === "false") {
      continue;
    }
    if (r["end-date"] || r.end_date) continue;

    const name =
      r["official-name"] ||
      r.official_name ||
      r["nice-name"] ||
      r.nice_name;
    if (!name) continue;
    const domain = domainFromLaRow(r);
    if (!domain) continue;
    const email = preferHrEmail([], domain);
    out.push({
      id: `la-${slugify(name)}`,
      companyName: name,
      slug: slugify(name),
      sector: "council",
      vertical: "public-sector",
      city: r.region || r.nation || "",
      website: `https://www.${domain}`,
      domain,
      email,
      emailStatus: "guessed",
      emails: [email],
      priority: 2,
      source: "mysociety-la",
      outreachHook: "Council / local authority HR — flat-fee recruitment board",
    });
  }
  return out;
}

function fromNhsSeeds() {
  return NHS_SEEDS.map(([domain, name]) => {
    const email = preferHrEmail([], domain);
    return {
      id: `nhs-${slugify(domain)}`,
      companyName: name,
      slug: slugify(name),
      sector: "nhs",
      vertical: "nhs",
      city: "",
      website: `https://www.${domain}`,
      domain,
      email,
      emailStatus: "guessed",
      emails: [email],
      priority: 1,
      source: "nhs-seed",
      outreachHook: "NHS trust HR / resourcing — reduce agency spend with flat-fee listings",
    };
  });
}

function merge(lists) {
  const byKey = new Map();
  for (const list of lists) {
    for (const p of list) {
      if (!p.email && !p.domain) continue;
      const key = (p.email || p.domain || p.slug).toLowerCase();
      const prev = byKey.get(key);
      if (!prev) {
        byKey.set(key, p);
        continue;
      }
      // Prefer scraped / verified over guessed; prefer hr-like emails
      const rank = (x) =>
        x.emailStatus === "scraped" || x.emailStatus === "verified_public"
          ? 0
          : x.emailStatus === "guessed"
            ? 1
            : 2;
      if (rank(p) < rank(prev)) byKey.set(key, { ...prev, ...p });
      else {
        byKey.set(key, {
          ...p,
          ...prev,
          emails: [...new Set([...(prev.emails || []), ...(p.emails || [])])],
        });
      }
    }
  }
  return [...byKey.values()].filter((p) => p.email);
}

async function main() {
  mkdirSync(join(root, "data"), { recursive: true });
  console.log("Building NHS + council HR prospects…");
  const existing = fromExisting();
  console.log(`  from employer-prospects: ${existing.length}`);
  const seeds = fromNhsSeeds();
  console.log(`  from NHS seeds: ${seeds.length}`);
  let las = [];
  try {
    las = await fromMySociety();
    console.log(`  from mySociety LAs: ${las.length}`);
  } catch (e) {
    console.warn(`  mySociety LA fetch failed: ${e.message}`);
  }

  const merged = merge([existing, seeds, las]);
  const nhs = merged.filter((p) => p.sector === "nhs");
  const councils = merged.filter((p) => p.sector === "council");
  writeFileSync(outPath, JSON.stringify(merged, null, 2));
  console.log(
    JSON.stringify(
      {
        ok: true,
        out: outPath,
        total: merged.length,
        nhs: nhs.length,
        councils: councils.length,
        guessed: merged.filter((p) => p.emailStatus === "guessed").length,
        scraped: merged.filter((p) => p.emailStatus === "scraped").length,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
