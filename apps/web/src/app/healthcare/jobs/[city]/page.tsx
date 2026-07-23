import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  POPULAR_CITIES,
  UNSPLASH,
  cityToSlug,
  slugToCity,
  getVerticalCitySeoTitle,
  getVerticalCitySeoDescription,
  VERTICAL_LABELS,
  type VerticalCityPath,
} from "@placeuk/shared";
import { getJobs } from "@/lib/jobs";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { CityJobLanding, getVerticalHeroImage } from "@/components/SeoLandingPages";

const VERTICAL: VerticalCityPath = "healthcare";

interface PageProps {
  params: Promise<{ city: string }>;
}

export function generateStaticParams() {
  return POPULAR_CITIES.map((city) => ({ city: cityToSlug(city) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const city = slugToCity(slug);
  return buildPageMetadata({
    title: getVerticalCitySeoTitle(VERTICAL, city),
    description: getVerticalCitySeoDescription(VERTICAL, city),
    path: `/healthcare/jobs/${slug}`,
  });
}

export default async function HealthcareCityJobsPage({ params }: PageProps) {
  const { city: slug } = await params;
  const city = slugToCity(slug);
  if (!POPULAR_CITIES.includes(city as (typeof POPULAR_CITIES)[number])) notFound();

  const jobs = await getJobs({ vertical: VERTICAL, city });
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: VERTICAL_LABELS[VERTICAL], url: "/healthcare" },
    { name: city },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      <CityJobLanding
        city={city}
        jobs={jobs}
        vertical={VERTICAL}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Healthcare", href: "/healthcare" },
          { label: `Jobs in ${city}` },
        ]}
        heroImage={getVerticalHeroImage(VERTICAL)}
      />
    </>
  );
}
