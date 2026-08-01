import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";
import { AdminShell } from "@/components/AdminShell";

export const metadata: Metadata = {
  ...noIndexMetadata,
  title: "Super admin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
