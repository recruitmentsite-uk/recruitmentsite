import type { JobListing } from "@placeuk/shared";
import { getSiteUrl } from "@/lib/site";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** LinkedIn Limited Listings–style XML job feed (partner registration required). */
export function buildLinkedInFeed(jobs: JobListing[]): string {
  const siteUrl = getSiteUrl();

  const jobNodes = jobs.map((job) => {
    const url = `${siteUrl}/jobs/${job.slug}?src=linkedin`;
    const salary = job.salary.disclosed
      ? `<salary>${job.salary.min} - ${job.salary.max} ${job.salary.currency}/${job.salary.period}</salary>`
      : "";

    return `
    <job>
      <partnerJobId>${escapeXml(job.id)}</partnerJobId>
      <company>${escapeXml(job.employerName)}</company>
      <title>${escapeXml(job.title)}</title>
      <description><![CDATA[${job.description}]]></description>
      <applyUrl>${escapeXml(url)}</applyUrl>
      <companyId>${escapeXml(job.employerId)}</companyId>
      <location>${escapeXml(`${job.city}, ${job.region}, United Kingdom`)}</location>
      <city>${escapeXml(job.city)}</city>
      <country>GB</country>
      <jobtype>${escapeXml(job.jobType)}</jobtype>
      <posterEmail>jobs@recruitmentsite.co.uk</posterEmail>
      ${salary}
    </job>`;
  });

  return `<?xml version="1.0" encoding="utf-8"?>
<source>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <publisherUrl>${escapeXml(siteUrl)}</publisherUrl>
  <publisher>Recruitment Site</publisher>
  ${jobNodes.join("\n")}
</source>`;
}
