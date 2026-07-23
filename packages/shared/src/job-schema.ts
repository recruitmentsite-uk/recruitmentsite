import type { JobListing } from "./types.js";

/** Build Google Jobs JobPosting JSON-LD (schema.org) */
export function buildJobPostingJsonLd(job: JobListing, siteUrl: string) {
  const employmentMap: Record<string, string> = {
    permanent: "FULL_TIME",
    contract: "CONTRACTOR",
    temporary: "TEMPORARY",
    part_time: "PART_TIME",
  };

  const unitMap: Record<string, string> = {
    year: "YEAR",
    hour: "HOUR",
    day: "DAY",
  };

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: `<p>${job.description}</p>`,
    datePosted: job.publishedAt,
    validThrough: job.expiresAt,
    employmentType: employmentMap[job.jobType] ?? "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.employerName,
      sameAs: siteUrl,
    },
    identifier: {
      "@type": "PropertyValue",
      name: "Recruitment Site",
      value: job.id,
    },
  };

  if (job.remote === "remote") {
    jsonLd.jobLocationType = "TELECOMMUTE";
    jsonLd.applicantLocationRequirements = {
      "@type": "Country",
      name: "United Kingdom",
    };
  } else {
    jsonLd.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: job.location,
        addressLocality: job.city,
        addressRegion: job.region,
        postalCode: job.postcode ?? "",
        addressCountry: "GB",
      },
    };
  }

  if (job.salary.disclosed) {
    jsonLd.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "GBP",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salary.min,
        maxValue: job.salary.max,
        unitText: unitMap[job.salary.period] ?? "YEAR",
      },
    };
  }

  return jsonLd;
}
