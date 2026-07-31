import { DashboardHeader } from "@/components/DashboardShell";
import { getEmployerContext } from "@/lib/employer";
import { getSupabaseAdmin } from "@/lib/supabase";
import VideoScreeningInviteForm from "./VideoScreeningInviteForm";
import { WatchVideoButton } from "./WatchVideoButton";

export const metadata = { title: "Video screenings" };

export default async function VideoScreeningsPage() {
  const ctx = await getEmployerContext();
  const supabase = getSupabaseAdmin();
  let screenings: Array<{
    id: string;
    candidate_email: string;
    candidate_name: string | null;
    status: string;
    invited_at: string;
    submitted_at: string | null;
    video_storage_path: string | null;
    prompt: string | null;
  }> = [];

  if (ctx && supabase) {
    const { data } = await supabase
      .from("video_screenings")
      .select(
        "id, candidate_email, candidate_name, status, invited_at, submitted_at, video_storage_path, prompt",
      )
      .eq("employer_id", ctx.employerId)
      .order("invited_at", { ascending: false })
      .limit(50);
    screenings = data ?? [];
  }

  return (
    <>
      <DashboardHeader
        title="Video screenings"
        subtitle="Invite candidates to record a short self-tape, then watch submissions here."
      />
      <div className="mx-auto max-w-3xl space-y-8 p-8">
        <VideoScreeningInviteForm />

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="font-semibold text-slate-900">Recent invites</h2>
          </div>
          {screenings.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No video invites yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {screenings.map((s) => {
                const canWatch = Boolean(s.video_storage_path) &&
                  (s.status === "submitted" || s.status === "reviewed");
                return (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">
                        {s.candidate_name || s.candidate_email}
                      </p>
                      <p className="text-slate-500">{s.candidate_email}</p>
                      {s.prompt && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{s.prompt}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium capitalize text-slate-700">{s.status}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(s.submitted_at || s.invited_at).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      <WatchVideoButton screeningId={s.id} disabled={!canWatch} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
