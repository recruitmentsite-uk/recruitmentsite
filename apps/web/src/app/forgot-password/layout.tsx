import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...noIndexMetadata,
  title: "Reset password",
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
