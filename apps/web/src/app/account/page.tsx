import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCandidateContext } from "@/lib/candidate";
import { getEmployerContext } from "@/lib/employer";
import CandidateAccountClient from "./CandidateAccountClient";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...noIndexMetadata,
  title: "My account",
};

export default async function AccountPage() {
  const candidate = await getCandidateContext();
  if (candidate) {
    return <CandidateAccountClient profile={candidate} />;
  }

  const employer = await getEmployerContext();
  if (employer) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Sign in to your account</h1>
        <p className="mt-2 text-sm text-slate-500">Candidates manage CVs and alerts here.</p>
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/login?next=/account" className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white">
            Log in
          </Link>
          <Link href="/signup/candidate" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
            Create candidate account
          </Link>
        </div>
      </div>
    </div>
  );
}
