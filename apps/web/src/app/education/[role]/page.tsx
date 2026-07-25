import {
  RoleVerticalPage,
  rolePageMetadata,
  roleStaticParams,
} from "@/lib/vertical-routes";

export function generateStaticParams() {
  return roleStaticParams("education");
}

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  return rolePageMetadata("education", role);
}

export default async function Page({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  return <RoleVerticalPage vertical="education" slug={role} />;
}
