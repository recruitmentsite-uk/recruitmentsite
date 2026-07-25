import {
  RoleVerticalPage,
  rolePageMetadata,
  roleStaticParams,
} from "@/lib/vertical-routes";

export function generateStaticParams() {
  return roleStaticParams("marketing");
}

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  return rolePageMetadata("marketing", role);
}

export default async function Page({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  return <RoleVerticalPage vertical="marketing" slug={role} />;
}
