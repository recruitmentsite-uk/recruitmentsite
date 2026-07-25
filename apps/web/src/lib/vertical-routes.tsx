import { notFound } from "next/navigation";
import {
  POPULAR_CITIES,
  VERTICAL_LABELS,
  VERTICAL_META,
  cityToSlug,
  getRolePage,
  getRolePagesByVertical,
  getVerticalCitySeoDescription,
  getVerticalCitySeoTitle,
  slugToCity,
  type BrowseVertical,
} from "@placeuk/shared";
import { getJobs } from "@/lib/jobs";
import { CityJobLanding, RoleJobLanding, getVerticalHeroImage } from "@/components/SeoLandingPages";
import { buildPageMetadata } from "@/lib/seo";

export function verticalPageMetadata(vertical: BrowseVertical) {
  const meta = VERTICAL_META[vertical];
  return buildPageMetadata({
    title: meta.seoTitle,
    description: meta.seoDescription,
    path: meta.path,
  });
}

export function roleStaticParams(vertical: BrowseVertical) {
  return getRolePagesByVertical(vertical).map((p) => ({ role: p.slug }));
}

export function rolePageMetadata(vertical: BrowseVertical, slug: string) {
  const role = getRolePage(slug);
  if (!role || role.vertical !== vertical) return {};
  return buildPageMetadata({
    title: role.title,
    description: role.description,
    path: `${VERTICAL_META[vertical].path}/${slug}`,
  });
}

export async function RoleVerticalPage({
  vertical,
  slug,
}: {
  vertical: BrowseVertical;
  slug: string;
}) {
  const role = getRolePage(slug);
  if (!role || role.vertical !== vertical) notFound();
  const jobs = await getJobs({ vertical, q: role.searchQuery });
  const meta = VERTICAL_META[vertical];
  return (
    <RoleJobLanding
      role={role}
      jobs={jobs}
      verticalPath={meta.path}
      heroImage={getVerticalHeroImage(vertical)}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: VERTICAL_LABELS[vertical], href: meta.path },
        { label: role.title },
      ]}
    />
  );
}

export function cityStaticParams() {
  return POPULAR_CITIES.map((city) => ({ city: cityToSlug(city) }));
}

export function cityPageMetadata(vertical: BrowseVertical, citySlug: string) {
  const city = slugToCity(citySlug);
  return buildPageMetadata({
    title: getVerticalCitySeoTitle(vertical, city),
    description: getVerticalCitySeoDescription(vertical, city),
    path: `${VERTICAL_META[vertical].path}/jobs/${citySlug}`,
  });
}

export async function CityVerticalPage({
  vertical,
  citySlug,
}: {
  vertical: BrowseVertical;
  citySlug: string;
}) {
  const city = slugToCity(citySlug);
  const jobs = await getJobs({ vertical, city });
  const meta = VERTICAL_META[vertical];
  return (
    <CityJobLanding
      city={city}
      jobs={jobs}
      vertical={vertical}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: VERTICAL_LABELS[vertical], href: meta.path },
        { label: `Jobs in ${city}` },
      ]}
      heroImage={getVerticalHeroImage(vertical)}
    />
  );
}
