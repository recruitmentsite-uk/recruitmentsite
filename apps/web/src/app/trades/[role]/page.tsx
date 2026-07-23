import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRolePage, getRolePagesByVertical } from "@placeuk/shared";
import { getJobs } from "@/lib/jobs";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { RoleJobLanding, getVerticalHeroImage } from "@/components/SeoLandingPages";

const VERTICAL = "trades" as const;
const VERTICAL_PATH = "/trades";

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
    return buildPageMetadata({ title: "Trades Jobs", description: "Trades jobs UK", path: "/trades" });
  }
  return buildPageMetadata({
    title: role.title,
    description: role.description,
    path: `${VERTICAL_PATH}/${slug}`,
  });
}

export default async function TradesRolePage({ params }: PageProps) {
  const { role: slug } = await params;
  const role = getRolePage(slug);
  if (!role || role.vertical !== VERTICAL) notFound();

  const jobs = await getJobs({ vertical: VERTICAL, q: role.searchQuery });
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Trades", url: "/trades" },
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
          { label: "Trades", href: "/trades" },
          { label: role.title },
        ]}
      />
    </>
  );
}
