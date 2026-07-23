import type { JobListing } from "@placeuk/shared";
import { buildJobPostingJsonLd } from "@placeuk/shared";

interface JobPostingSchemaProps {
  job: JobListing;
  siteUrl: string;
}

export function JobPostingSchema({ job, siteUrl }: JobPostingSchemaProps) {
  const jsonLd = buildJobPostingJsonLd(job, siteUrl);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
