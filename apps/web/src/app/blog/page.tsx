import Link from "next/link";
import { BLOG_POSTS } from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { UNSPLASH } from "@placeuk/shared";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "UK Hiring Guides & Insights",
  description:
    "Practical guides on flat-fee hiring, NHS recruitment, trades staffing, and salary-transparent UK job boards.",
  path: "/blog",
});

const CATEGORY_LABELS: Record<string, string> = {
  hiring: "Hiring",
  healthcare: "Healthcare",
  trades: "Trades",
  tech: "Technology",
  comparison: "Comparison",
};

export default function BlogPage() {
  const sorted = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <>
      <Hero
        image={UNSPLASH.hero.team}
        badge="Hiring insights"
        title="UK recruitment guides"
        subtitle="Flat-fee economics, healthcare hiring, and competitor comparisons — written for UK SME employers."
        primaryCta={{ label: "Browse jobs", href: "/jobs" }}
        secondaryCta={{ label: "For employers", href: "/for-employers" }}
        align="left"
      />

      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-brand">
                {CATEGORY_LABELS[post.category] ?? post.category}
              </span>
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                <Link href={`/blog/${post.slug}`} className="hover:text-brand">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-slate-600 line-clamp-3">{post.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
                <span>{post.readMinutes} min read</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
