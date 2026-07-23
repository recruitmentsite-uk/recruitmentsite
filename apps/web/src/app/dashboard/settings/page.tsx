import Link from "next/link";
import { getEmployerContext } from "@/lib/employer";
import { getTeamData } from "@/lib/dashboard-data";
import { DashboardHeader } from "@/components/DashboardShell";
import { SettingsForm } from "@/components/SettingsForm";
import { TeamInvites } from "@/components/TeamInvites";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const ctx = await getEmployerContext();
  const team = ctx ? await getTeamData(ctx) : { seatCount: 1, seatLimit: 3, members: [], invites: [] };

  return (
    <>
      <DashboardHeader title="Settings" subtitle="Company profile, team seats, and integrations." />
      <div className="p-8 max-w-2xl">
        <SettingsForm
          initialCompanyName={ctx?.companyName ?? ""}
          initialSlug={ctx?.slug ?? ""}
        />

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Team seats</h2>
          <p className="mt-1 text-sm text-slate-500">
            Invite colleagues to manage jobs and review applications.
          </p>
          <div className="mt-4">
            {ctx ? (
              <TeamInvites
                seatLimit={team.seatLimit}
                seatCount={team.seatCount}
                initialMembers={team.members}
                initialInvites={team.invites}
              />
            ) : (
              <p className="text-sm text-slate-500">
                <Link href="/signup" className="font-semibold text-brand underline">Sign up</Link> to invite team members.
              </p>
            )}
          </div>
        </section>

        <p className="mt-8 text-sm text-slate-500">
          <Link href="/dashboard/careers" className="font-semibold text-brand hover:underline">
            Preview careers page →
          </Link>
        </p>
      </div>
    </>
  );
}
