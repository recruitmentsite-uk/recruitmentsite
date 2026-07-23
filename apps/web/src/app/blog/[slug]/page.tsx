import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getBlogSlugs } from "@placeuk/shared";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, buildPageMetadata } from "@/lib/seo";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return buildPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <JsonLd data={articleJsonLd(post)} />
      <Link href="/blog" className="text-sm font-semibold text-brand hover:underline">
        ← All guides
      </Link>
      <header className="mt-6">
        <p className="text-sm font-medium text-brand capitalize">{post.category}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{post.title}</h1>
        <p className="mt-4 text-lg text-slate-600">{post.excerpt}</p>
        <div className="mt-4 flex gap-4 text-sm text-slate-400">
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
          <span>{post.readMinutes} min read</span>
        </div>
      </header>
      <div className="prose prose-slate mt-10 max-w-none">
        {post.content.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="mb-5 text-slate-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
      <aside className="mt-12 rounded-2xl border border-teal-200 bg-teal-50 p-6">
        <h2 className="font-bold text-brand">Ready to hire without agency fees?</h2>
        <p className="mt-2 text-sm text-slate-600">
          Recruitment Site Growth includes unlimited posts, AI scoring, and Google Jobs syndication.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/pricing" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
            View pricing
          </Link>
          <Link href="/compare" className="rounded-xl border border-brand px-5 py-2.5 text-sm font-semibold text-brand hover:bg-white">
            Compare vs Reed
          </Link>
        </div>
      </aside>
    </article>
  );
}
