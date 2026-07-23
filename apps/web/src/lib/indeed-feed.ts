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

export function buildIndeedFeed(jobs: JobListing[]): string {
  const siteUrl = getSiteUrl();
  const publisher = "Recruitment Site";
  const publisherUrl = siteUrl;

  const jobNodes = jobs.map((job) => {
    const url = `${siteUrl}/jobs/${job.slug}`;
    const salary = job.salary.disclosed
      ? `<salary>${job.salary.min} - ${job.salary.max} ${job.salary.currency}/${job.salary.period}</salary>`
      : "";

    return `
    <job>
      <title>${escapeXml(job.title)}</title>
      <date>${new Date(job.publishedAt).toUTCString()}</date>
      <referencenumber>${escapeXml(job.id)}</referencenumber>
      <url>${escapeXml(url)}</url>
      <company>${escapeXml(job.employerName)}</company>
      <city>${escapeXml(job.city)}</city>
      <state>${escapeXml(job.region)}</state>
      <country>GB</country>
      <description><![CDATA[${job.description}]]></description>
      ${salary}
      <jobtype>${escapeXml(job.jobType)}</jobtype>
      <category>${escapeXml(job.vertical)}</category>
    </job>`;
  });

  return `<?xml version="1.0" encoding="utf-8"?>
<source>
  <publisher>${escapeXml(publisher)}</publisher>
  <publisherurl>${escapeXml(publisherUrl)}</publisherurl>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${jobNodes.join("\n")}
</source>`;
}
