"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminHeader } from "@/components/AdminShell";

type Ticket = {
  id: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  channel: string;
  requester_email: string | null;
  requester_name: string | null;
  assignee_email: string | null;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  author_email: string | null;
  body: string;
  is_internal: boolean;
  created_at: string;
};

const STATUSES = ["all", "open", "pending", "resolved", "closed"];

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState("open");
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ ticket: Ticket; messages: Message[] } | null>(
    null,
  );
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    body: "",
    priority: "normal",
    channel: "manual",
    requester_email: "",
    requester_name: "",
  });
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/tickets?status=${filter}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load tickets");
      return;
    }
    setError(null);
    setTickets(data.tickets ?? []);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return;
    }
    fetch(`/api/admin/tickets/${selected}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ticket) setDetail({ ticket: data.ticket, messages: data.messages ?? [] });
      });
  }, [selected]);

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/admin/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Create failed");
      return;
    }
    setCreating(false);
    setForm({
      subject: "",
      body: "",
      priority: "normal",
      channel: "manual",
      requester_email: "",
      requester_name: "",
    });
    setSelected(data.ticket.id);
    await load();
  }

  async function updateStatus(status: string) {
    if (!selected) return;
    setBusy(true);
    await fetch(`/api/admin/tickets/${selected}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    setSelected(selected);
    await load();
    const res = await fetch(`/api/admin/tickets/${selected}`);
    const data = await res.json();
    if (data.ticket) setDetail({ ticket: data.ticket, messages: data.messages ?? [] });
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !reply.trim()) return;
    setBusy(true);
    await fetch(`/api/admin/tickets/${selected}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reply, status: "pending" }),
    });
    setReply("");
    setBusy(false);
    const res = await fetch(`/api/admin/tickets/${selected}`);
    const data = await res.json();
    if (data.ticket) setDetail({ ticket: data.ticket, messages: data.messages ?? [] });
    await load();
  }

  return (
    <div>
      <AdminHeader
        title="Tickets"
        subtitle="Support, partner, and internal ops — saved for the team"
        actions={
          <button
            type="button"
            onClick={() => setCreating((v) => !v)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {creating ? "Cancel" : "New ticket"}
          </button>
        }
      />
      <div className="px-6 md:px-8 py-6 space-y-4">
        {error && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            {error}
            {error.toLowerCase().includes("relation") || error.toLowerCase().includes("does not exist")
              ? " — run supabase migration 011_super_admin.sql"
              : null}
          </p>
        )}

        {creating && (
          <form
            onSubmit={createTicket}
            className="rounded-2xl border border-slate-200 bg-white p-5 grid gap-3 md:grid-cols-2"
          >
            <input
              required
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="md:col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <textarea
              required
              placeholder="Description"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={4}
              className="md:col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              placeholder="Requester email"
              value={form.requester_email}
              onChange={(e) => setForm({ ...form, requester_email: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              placeholder="Requester name"
              value={form.requester_name}
              onChange={(e) => setForm({ ...form, requester_name: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="manual">Manual</option>
              <option value="email">Email</option>
              <option value="social">Social</option>
              <option value="partner">Partner</option>
              <option value="internal">Internal</option>
            </select>
            <button
              type="submit"
              disabled={busy}
              className="md:col-span-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Create ticket
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                filter === s
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-2">
            {tickets.length === 0 ? (
              <p className="text-sm text-slate-500">No tickets in this view.</p>
            ) : (
              tickets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelected(t.id)}
                  className={`w-full text-left rounded-xl border p-4 transition-colors ${
                    selected === t.id
                      ? "border-slate-900 bg-white"
                      : "border-slate-200 bg-white hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-slate-900 text-sm">{t.subject}</p>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {t.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {t.status} · {t.channel}
                    {t.requester_email ? ` · ${t.requester_email}` : ""}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 min-h-[320px]">
            {!detail ? (
              <p className="text-sm text-slate-500">Select a ticket to view thread.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {detail.ticket.subject}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {detail.ticket.requester_name || "Unknown"}{" "}
                    {detail.ticket.requester_email
                      ? `<${detail.ticket.requester_email}>`
                      : ""}{" "}
                    · {new Date(detail.ticket.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["open", "pending", "resolved", "closed"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={busy}
                      onClick={() => updateStatus(s)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
                        detail.ticket.status === s
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 text-slate-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {detail.messages.length === 0 ? (
                    <p className="text-sm text-slate-500 whitespace-pre-wrap">
                      {detail.ticket.body}
                    </p>
                  ) : (
                    detail.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`rounded-xl px-3 py-2 text-sm ${
                          m.is_internal ? "bg-amber-50" : "bg-slate-50"
                        }`}
                      >
                        <p className="text-[11px] text-slate-400 mb-1">
                          {m.author_email || "system"} ·{" "}
                          {new Date(m.created_at).toLocaleString()}
                          {m.is_internal ? " · internal" : ""}
                        </p>
                        <p className="whitespace-pre-wrap text-slate-800">{m.body}</p>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={sendReply} className="space-y-2 border-t border-slate-100 pt-4">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    placeholder="Add a note / reply (saved on the ticket)"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={busy || !reply.trim()}
                    className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Save reply
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
