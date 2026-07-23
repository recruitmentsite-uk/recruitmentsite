import { Suspense } from "react";
import OnboardingClient from "./OnboardingClient";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading...</div>}>
      <OnboardingClient />
    </Suspense>
  );
}
