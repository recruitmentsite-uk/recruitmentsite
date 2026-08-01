#!/usr/bin/env node
/**
 * Upsert CS triage actionable items into support_tickets.
 */
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { runCsTriage } from "./cs-triage-and-mark.mjs";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function syncCsTickets(triageResult) {
  if (!url || !key) {
    console.log("⚠  Supabase not configured — skip ticket sync");
    return { created: 0, skipped: 0 };
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let created = 0;
  let skipped = 0;

  for (const a of triageResult.actions || []) {
    const externalRef = `${a.mailbox}:${a.subject}:${a.date || ""}`.slice(0, 240);

    const { data: existing } = await supabase
      .from("support_tickets")
      .select("id")
      .eq("external_ref", externalRef)
      .maybeSingle();

    if (existing?.id) {
      skipped += 1;
      continue;
    }

    const fromEmail = (a.from || "").match(/[\w.+-]+@[\w.-]+/)?.[0] || null;
    const { error } = await supabase.from("support_tickets").insert({
      subject: a.subject || "CS actionable item",
      body: a.preview || "",
      status: "open",
      priority: /urgent|action required|verification/i.test(a.subject || "")
        ? "high"
        : "normal",
      channel: "email",
      requester_email: fromEmail,
      requester_name: (a.from || "").replace(/<[^>]+>/, "").trim() || null,
      mailbox: a.mailbox || null,
      external_ref: externalRef,
      tags: ["cs-triage", "auto"],
    });

    if (error) {
      console.warn(`Ticket insert failed: ${error.message}`);
      continue;
    }
    created += 1;
  }

  console.log(`CS tickets: created=${created} skipped=${skipped}`);
  return { created, skipped };
}

async function main() {
  const triage = await runCsTriage({ quiet: true });
  const result = await syncCsTickets(triage);
  console.log(JSON.stringify({ ...result, actionable: triage.totalAction }));
}

const isMain =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
