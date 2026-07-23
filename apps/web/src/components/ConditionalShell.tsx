"use client";

import { usePathname } from "next/navigation";

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    return <>{children}</>;
  }

  return children;
}

export function MarketingOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/admin")
  ) return null;
  return <>{children}</>;
}
