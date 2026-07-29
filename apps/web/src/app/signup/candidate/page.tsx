import type { Metadata } from "next";
import CandidateSignupClient from "./CandidateSignupClient";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...noIndexMetadata,
  title: "Candidate signup",
};

export default function CandidateSignupPage() {
  return <CandidateSignupClient />;
}
