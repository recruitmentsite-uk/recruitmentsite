"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminHeader } from "@/components/AdminShell";

type Publish = {
  platform: string;
  status: string;
  external_url?: string | null;
  error?: string | null;
};

type Post = {
  id: string;
  title: string;
  body: string;
  captions: Record<string, string>;
  image_url: string | null;
  link_url: string | null;
  platforms: string[];
  status: string;
  tags: string[];
  source: string;
  last_error: string | null;
  scheduled_for: string | null;
  published_at: string | null;
  updated_at: string;
  social_post_publishes?: Publish[];
};

type Account = {
  platform: string;
  label: string;
  handle: string | null;
  profile_url: string | null;
  connected: boolean;
  enabled: boolean;
};

const PLATFORMS = ["facebook", "instagram", "linkedin"] as const;
const STATUS_FILTERS = ["all", "draft", "queued", "scheduled", "published", "failed", "archived"];

const emptyForm = {
  title: "",
  body: "",
  link_url: "https://recruitmentsite.co.uk/pricing",
  image_url: "",
  platforms: ["facebook", "linkedin"] as string[],
  status: "draft",
  scheduled_for: "",
  tags: "",
  caption_facebook: "",
  caption_instagram: "",
  caption_linkedin: "",
};

export default function AdminSocialPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"library" | "compose" | "accounts">("library");

  const loadPosts = useCallback(async () => {
    const res = await fetch(`/api/admin/social/posts?status=${filter}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load posts");
      return;
    }
    setError(null);
    setPosts(data.posts ?? []);
  }, [filter]);

  const loadAccounts = useCallback(async () => {
    const res = await fetch("/api/admin/social/accounts");
    const data = await res.json();
    if (res.ok) setAccounts(data.accounts ?? []);
  }, []);

  useEffect(() => {
    loadPosts();
    loadAccounts();
  }, [loadPosts, loadAccounts]);

  function loadIntoComposer(post: Post) {
    setForm({
      title: post.title,
      body: post.body,
      link_url: post.link_url || "",
      image_url: post.image_url || "",
      platforms: post.platforms?.length ? post.platforms : ["facebook", "linkedin"],
      status: post.status === "published" ? "draft" : post.status,
      scheduled_for: post.scheduled_for
        ? new Date(post.scheduled_for).toISOString().slice(0, 16)
        : "",
      tags: (post.tags || []).join(", "),
      caption_facebook: post.captions?.facebook || "",
      caption_instagram: post.captions?.instagram || "",
      caption_linkedin: post.captions?.linkedin || "",
    });
    setSelected(post.id);
    setTab("compose");
    setMessage("Loaded into composer — edit and save, or duplicate as new.");
  }

  function togglePlatform(p: string) {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }));
  }

  async function savePost(asNew: boolean) {
    setBusy(true);
    setMessage(null);
    const payload = {
      title: form.title,
      body: form.body,
      link_url: form.link_url || null,
      image_url: form.image_url || null,
      platforms: form.platforms,
      status: form.status,
      scheduled_for: form.scheduled_for
        ? new Date(form.scheduled_for).toISOString()
        : null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      captions: {
        facebook: form.caption_facebook || form.body,
        instagram: form.caption_instagram || form.body,
        linkedin: form.caption_linkedin || form.body,
      },
    };

    const res = await fetch(
      asNew || !selected ? "/api/admin/social/posts" : `/api/admin/social/posts/${selected}`,
      {
        method: asNew || !selected ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    setSelected(data.post.id);
    setMessage(asNew || !selected ? "Saved to library" : "Post updated");
    await loadPosts();
  }

  async function publish(postId: string) {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/admin/social/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Publish failed");
      return;
    }
    const published = (data.results || []).filter(
      (r: { status: string }) => r.status === "published",
    ).length;
    setMessage(
      data.hint ||
        `Publish finished — ${published} channel(s) live. Check per-platform status below.`,
    );
    await loadPosts();
  }

  async function archive(postId: string) {
    await fetch(`/api/admin/social/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    await loadPosts();
  }

  async function remove(postId: string) {
    if (!confirm("Delete this post from the library?")) return;
    await fetch(`/api/admin/social/posts/${postId}`, { method: "DELETE" });
    if (selected === postId) {
      setSelected(null);
      setForm(emptyForm);
    }
    await loadPosts();
  }

  return (
    <div>
      <AdminHeader
        title="Social CMS"
        subtitle="Compose once, reuse forever, publish via API when tokens are set"
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setMessage(null);
                const res = await fetch("/api/admin/social/import-stock", {
                  method: "POST",
                });
                const data = await res.json();
                setBusy(false);
                if (!res.ok) {
                  setError(data.error || "Import failed");
                  return;
                }
                setMessage(`Imported stock library: ${data.upserted}/${data.total}`);
                await loadPosts();
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Import stock packs
            </button>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setForm(emptyForm);
                setTab("compose");
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New post
            </button>
          </div>
        }
      />

      <div className="px-6 md:px-8 py-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["library", "Library & queue"],
              ["compose", "Composer"],
              ["accounts", "Accounts"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                tab === id
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            {error}
            {String(error).includes("does not exist")
              ? " — run migration 011_super_admin.sql in Supabase"
              : null}
          </p>
        )}
        {message && (
          <p className="text-sm text-teal-800 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        {tab === "accounts" && (
          <div className="grid gap-3 md:grid-cols-2">
            {accounts.map((a) => (
              <div
                key={a.platform}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 capitalize">{a.label}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {a.handle ? `@${a.handle}` : a.platform}
                      {a.profile_url ? (
                        <>
                          {" · "}
                          <a
                            href={a.profile_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand hover:underline"
                          >
                            profile
                          </a>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold ${a.connected ? "text-teal-700" : "text-amber-700"}`}
                  >
                    {a.connected ? "API ready" : "Token missing"}
                  </span>
                </div>
              </div>
            ))}
            <p className="md:col-span-2 text-xs text-slate-500">
              Set META_PAGE_ID, META_PAGE_ACCESS_TOKEN, META_IG_USER_ID, LINKEDIN_ACCESS_TOKEN,
              LINKEDIN_ORGANIZATION_ID in Vercel / .env.local. Publishing without tokens saves the
              post and reports skipped channels.
            </p>
          </div>
        )}

        {tab === "compose" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 max-w-3xl">
            <input
              required
              placeholder="Internal title (library name)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
            />
            <textarea
              placeholder="Default caption / body"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={5}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                placeholder="Link URL"
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                placeholder="Image URL (required for Instagram)"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <details className="rounded-xl border border-slate-100 p-3">
              <summary className="text-sm font-medium text-slate-700 cursor-pointer">
                Per-platform captions (optional)
              </summary>
              <div className="mt-3 space-y-2">
                {PLATFORMS.map((p) => (
                  <textarea
                    key={p}
                    placeholder={`${p} caption override`}
                    value={
                      p === "facebook"
                        ? form.caption_facebook
                        : p === "instagram"
                          ? form.caption_instagram
                          : form.caption_linkedin
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        ...(p === "facebook"
                          ? { caption_facebook: e.target.value }
                          : p === "instagram"
                            ? { caption_instagram: e.target.value }
                            : { caption_linkedin: e.target.value }),
                      })
                    }
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                ))}
              </div>
            </details>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    form.platforms.includes(p)
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 text-slate-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="queued">Queued</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
              <input
                type="datetime-local"
                value={form.scheduled_for}
                onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                title="Schedule (UTC-ish local input → stored as ISO)"
              />
              <input
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="flex-1 min-w-[160px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                disabled={busy || !form.title.trim()}
                onClick={() => savePost(false)}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {selected ? "Update in library" : "Save to library"}
              </button>
              {selected && (
                <button
                  type="button"
                  disabled={busy || !form.title.trim()}
                  onClick={() => savePost(true)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Save as new copy
                </button>
              )}
              {selected && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => publish(selected)}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Publish via API
                </button>
              )}
            </div>
          </div>
        )}

        {tab === "library" && (
          <>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((s) => (
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
            <div className="grid gap-3">
              {posts.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No posts yet. Compose one, or run migration 011 to seed the stock pack.
                </p>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{post.title}</h3>
                          <span className="text-[10px] uppercase font-bold tracking-wide text-slate-400">
                            {post.status}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wide text-slate-400">
                            {post.source}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600 line-clamp-3 whitespace-pre-wrap">
                          {post.body}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          {(post.platforms || []).join(", ")}
                          {post.tags?.length ? ` · ${post.tags.join(", ")}` : ""}
                        </p>
                        {post.social_post_publishes && post.social_post_publishes.length > 0 && (
                          <ul className="mt-2 text-xs text-slate-500 space-y-1">
                            {post.social_post_publishes.map((p) => (
                              <li key={p.platform}>
                                <span className="capitalize font-medium">{p.platform}</span>:{" "}
                                {p.status}
                                {p.external_url ? (
                                  <>
                                    {" · "}
                                    <a
                                      href={p.external_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-brand hover:underline"
                                    >
                                      view
                                    </a>
                                  </>
                                ) : null}
                                {p.error ? ` · ${p.error}` : ""}
                              </li>
                            ))}
                          </ul>
                        )}
                        {post.last_error && (
                          <p className="mt-2 text-xs text-amber-700">{post.last_error}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => loadIntoComposer(post)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                        >
                          Edit / reuse
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => publish(post.id)}
                          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          Publish
                        </button>
                        <button
                          type="button"
                          onClick={() => archive(post.id)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
                        >
                          Archive
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(post.id)}
                          className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
