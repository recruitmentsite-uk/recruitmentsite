import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...noIndexMetadata,
  title: "Onboarding",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
