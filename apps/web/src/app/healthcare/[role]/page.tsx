import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRolePage, getRolePagesByVertical } from "@placeuk/shared";
import { getJobs } from "@/lib/jobs";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { RoleJobLanding, getVerticalHeroImage } from "@/components/SeoLandingPages";

const VERTICAL = "healthcare" as const;
const VERTICAL_PATH = "/healthcare";

interface PageProps {
  params: Promise<{ role: string }>;
}

export function generateStaticParams() {
  return getRolePagesByVertical(VERTICAL).map((p) => ({ role: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { role: slug } = await params;
  const role = getRolePage(slug);
  if (!role || role.vertical !== VERTICAL) {
    return buildPageMetadata({ title: "Healthcare Jobs", description: "Healthcare jobs UK", path: "/healthcare" });
  }
  return buildPageMetadata({
    title: role.title,
    description: role.description,
    path: `${VERTICAL_PATH}/${slug}`,
  });
}

export default async function HealthcareRolePage({ params }: PageProps) {
  const { role: slug } = await params;
  const role = getRolePage(slug);
  if (!role || role.vertical !== VERTICAL) notFound();

  const jobs = await getJobs({ vertical: VERTICAL, q: role.searchQuery });
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Healthcare", url: "/healthcare" },
    { name: role.title },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      <RoleJobLanding
        role={role}
        jobs={jobs}
        verticalPath={VERTICAL_PATH}
        heroImage={getVerticalHeroImage(VERTICAL)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Healthcare", href: "/healthcare" },
          { label: role.title },
        ]}
      />
    </>
  );
}
