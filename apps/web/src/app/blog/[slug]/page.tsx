import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getBlogSlugs, getBlogCover, getBlogOgImage } from "@placeuk/shared";
import { JsonLd } from "@/components/JsonLd";
import { UnsplashImage } from "@/components/UnsplashImage";
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
    ogImage: getBlogOgImage(post),
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const cover = getBlogCover(post);

  return (
    <article>
      <div
        data-hero
        className="relative -mt-[65px] flex min-h-[52svh] items-end overflow-hidden bg-ink sm:min-h-[56svh]"
      >
        <UnsplashImage
          src={cover}
          alt={post.coverAlt}
          fill
          priority
          sizes="100vw"
          className="opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <div className="relative mx-auto w-full max-w-3xl px-4 pb-12 pt-32">
          <Link href="/blog" className="text-sm font-semibold text-white/70 transition hover:text-white">
            ← All guides
          </Link>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
            {post.category}
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl text-balance">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">{post.excerpt}</p>
          <div className="mt-5 flex gap-4 text-sm text-white/45">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
            <span>{post.readMinutes} min read</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-12">
        <JsonLd data={articleJsonLd({ ...post, coverImage: cover })} />
        <div className="prose prose-slate mt-2 max-w-none">
          {post.content.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="mb-5 leading-relaxed text-ink/80">
              {paragraph}
            </p>
          ))}
        </div>
        <aside className="mt-12 border-t border-brand/20 bg-brand/5 px-6 py-8">
          <h2 className="font-display text-xl font-medium text-brand">
            Ready to hire without agency fees?
          </h2>
          <p className="mt-2 text-sm text-ink/60">
            Recruitment Site Growth includes unlimited posts, AI scoring, and Google Jobs syndication.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              View pricing
            </Link>
            <Link
              href="/for-employers"
              className="rounded-full border border-brand px-5 py-2.5 text-sm font-semibold text-brand hover:bg-white"
            >
              Employer features
            </Link>
          </div>
        </aside>
      </div>
    </article>
  );
}
