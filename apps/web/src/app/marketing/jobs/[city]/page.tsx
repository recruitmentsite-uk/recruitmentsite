import {
  CityVerticalPage,
  cityPageMetadata,
  cityStaticParams,
} from "@/lib/vertical-routes";

export function generateStaticParams() {
  return cityStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  return cityPageMetadata("marketing", city);
}

export default async function Page({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  return <CityVerticalPage vertical="marketing" citySlug={city} />;
}
