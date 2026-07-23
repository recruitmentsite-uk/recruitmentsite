#!/usr/bin/env node
/**
 * Weekly metrics report — MRR estimate, applications, top jobs.
 * Wire to Slack webhook or email when RESEND_API_KEY is set.
 */
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";

const supabase = getSupabaseAdmin();

async function main() {
  const report = {
    generatedAt: new Date().toISOString(),
    employers: 0,
    activeJobs: 0,
    applicationsThisWeek: 0,
    jobAlerts: 0,
    estimatedMrr: 0,
  };

  if (supabase) {
    const { count: employers } = await supabase
      .from("employers")
      .select("*", { count: "exact", head: true });
    const { count: jobs } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { count: applications } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .gte("submitted_at", weekAgo);
    const { count: alerts } = await supabase
      .from("job_alerts")
      .select("*", { count: "exact", head: true })
      .eq("active", true);

    const { data: paidEmployers } = await supabase
      .from("employers")
      .select("plan")
      .neq("plan", "starter");

    const planPrices = { starter: 99, growth: 249, scale: 499, payg: 0 };
    const mrr = (paidEmployers ?? []).reduce(
      (sum, e) => sum + (planPrices[e.plan] ?? 0),
      0,
    );

    report.employers = employers ?? 0;
    report.activeJobs = jobs ?? 0;
    report.applicationsThisWeek = applications ?? 0;
    report.jobAlerts = alerts ?? 0;
    report.estimatedMrr = mrr;
  } else {
    console.log("⚠  Supabase not configured — showing template report");
    report.employers = 0;
    report.activeJobs = 9;
    report.applicationsThisWeek = 0;
  }

  console.log("\n📊 Recruitment Site Weekly Metrics");
  console.log("─".repeat(40));
  console.log(`Employers:        ${report.employers}`);
  console.log(`Active jobs:      ${report.activeJobs}`);
  console.log(`Applications/wk:  ${report.applicationsThisWeek}`);
  console.log(`Job alerts:       ${report.jobAlerts}`);
  console.log(`Est. MRR:         £${report.estimatedMrr.toLocaleString()}`);
  console.log("─".repeat(40));

  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `Recruitment Site weekly: ${report.activeJobs} jobs, ${report.applicationsThisWeek} applications, £${report.estimatedMrr} MRR`,
      }),
    });
  }
}

main().catch(console.error);
