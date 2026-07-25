import {
  RoleVerticalPage,
  rolePageMetadata,
  roleStaticParams,
} from "@/lib/vertical-routes";

export function generateStaticParams() {
  return roleStaticParams("engineering");
}

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  return rolePageMetadata("engineering", role);
}

export default async function Page({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  return <RoleVerticalPage vertical="engineering" slug={role} />;
}
