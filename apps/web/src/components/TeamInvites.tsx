"use client";

import { useState } from "react";
import { getPlanByTier } from "@placeuk/shared";

interface Member {
  email: string;
  role: string;
}

interface Invite {
  email: string;
  role: string;
  expiresAt: string;
}

interface TeamInvitesProps {
  seatLimit: number;
  seatCount: number;
  initialMembers?: Member[];
  initialInvites?: Invite[];
}

export function TeamInvites({
  seatLimit,
  seatCount,
  initialMembers = [],
  initialInvites = [],
}: TeamInvitesProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("recruiter");
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);
  const [inviteUrl, setInviteUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refreshTeam() {
    const res = await fetch("/api/team/invite");
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members ?? []);
      setInvites(data.invites ?? []);
    }
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInviteUrl("");
    setLoading(true);

    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "Failed to send invite");
      return;
    }

    setInviteUrl(json.inviteUrl);
    setEmail("");
    await refreshTeam();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        {seatCount} of {seatLimit} seats used.
      </p>

      {members.length > 0 && (
        <ul className="space-y-2 text-sm">
          {members.map((m) => (
            <li key={m.email} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>{m.email}</span>
              <span className="text-slate-400 capitalize">{m.role}</span>
            </li>
          ))}
        </ul>
      )}

      {invites.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">Pending invites</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {invites.map((i) => (
              <li key={i.email}>{i.email} ({i.role})</li>
            ))}
          </ul>
        </div>
      )}

      {seatCount < seatLimit ? (
        <form onSubmit={sendInvite} className="flex flex-wrap gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.co.uk"
            className="flex-1 min-w-[200px] rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {loading ? "Sending..." : "Invite"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-amber-700">Seat limit reached — upgrade to Scale for more seats.</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {inviteUrl && (
        <p className="text-xs text-slate-500 break-all">
          Invite link: <a href={inviteUrl} className="text-brand underline">{inviteUrl}</a>
        </p>
      )}
    </div>
  );
}
