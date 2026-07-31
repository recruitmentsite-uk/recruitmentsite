import Link from "next/link";
import { BLOG_POSTS, UNSPLASH, getBlogCover } from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { UnsplashImage } from "@/components/UnsplashImage";
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
        image={UNSPLASH.sections.checklist}
        badge="Hiring insights"
        title="UK recruitment guides"
        subtitle="Flat-fee economics, healthcare hiring, and competitor comparisons — written for UK SME employers."
        primaryCta={{ label: "Browse jobs", href: "/jobs" }}
        secondaryCta={{ label: "For employers", href: "/for-employers" }}
        align="left"
      />

      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative aspect-[16/10] overflow-hidden bg-ink/5">
                  <UnsplashImage
                    src={getBlogCover(post)}
                    alt={post.coverAlt}
                    fill
                    className="transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 text-xs font-semibold uppercase tracking-wide text-white">
                    {CATEGORY_LABELS[post.category] ?? post.category}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-xl font-medium tracking-tight text-ink group-hover:text-brand">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/60 line-clamp-3">{post.excerpt}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-ink/40">
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <span aria-hidden>·</span>
                  <span>{post.readMinutes} min read</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
