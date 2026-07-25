import type { Metadata } from "next";
import { getEmployerContext } from "@/lib/employer";
import { DashboardSidebar } from "@/components/DashboardShell";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...noIndexMetadata,
  title: "Dashboard",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getEmployerContext();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar
        companyName={ctx?.companyName}
        plan={ctx?.plan ?? "growth"}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
