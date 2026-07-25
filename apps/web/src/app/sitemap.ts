import type { MetadataRoute } from "next";
import {
  getBlogSlugs,
  POPULAR_CITIES,
  cityToSlug,
  SEO_ROLE_PAGES,
  HIRE_GUIDE_PAGES,
  COMPETITOR_SEO_PAGES,
  VERTICAL_CITY_PATHS,
} from "@placeuk/shared";
import { getJobs, getSiteUrl } from "@/lib/jobs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const jobs = await getJobs();
  const blogSlugs = getBlogSlugs();

  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/jobs`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/healthcare`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/trades`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/tech`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/for-employers`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/job-alerts`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/salary-transparency`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/nhs-band-salary-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/employer-compliance`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const cityPages = POPULAR_CITIES.map((city) => ({
    url: `${base}/jobs/${cityToSlug(city)}`,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  const verticalCityPages = VERTICAL_CITY_PATHS.flatMap((vertical) =>
    POPULAR_CITIES.map((city) => ({
      url: `${base}/${vertical}/jobs/${cityToSlug(city)}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  );

  const rolePages = SEO_ROLE_PAGES.map((role) => ({
    url: `${base}/${role.vertical}/${role.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const hirePages = HIRE_GUIDE_PAGES.map((guide) => ({
    url: `${base}/hire/${guide.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const comparePages = COMPETITOR_SEO_PAGES.map((c) => ({
    url: `${base}/compare/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const jobPages = jobs.map((job) => ({
    url: `${base}/jobs/${job.slug}`,
    lastModified: new Date(job.publishedAt),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const blogPages = blogSlugs.map((slug) => ({
    url: `${base}/blog/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...cityPages,
    ...verticalCityPages,
    ...rolePages,
    ...hirePages,
    ...comparePages,
    ...jobPages,
    ...blogPages,
  ];
}
