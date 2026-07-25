import Link from "next/link";
import { BROWSE_VERTICALS, VERTICAL_META, getVerticalImage } from "@placeuk/shared";
import { UnsplashImage } from "@/components/UnsplashImage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Job Sectors UK — Browse by Industry",
  description:
    "Browse UK jobs by sector: healthcare, trades, tech, education, hospitality, logistics, finance, retail, legal, marketing and engineering. Salary shown upfront.",
  path: "/sectors",
});

export default function SectorsPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-display text-4xl font-medium tracking-tight text-ink">Sectors</h1>
      <p className="mt-3 max-w-2xl text-ink/55">
        Find roles across the UK&apos;s major industries — every listing shows salary before you apply.
      </p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BROWSE_VERTICALS.map((slug) => {
          const meta = VERTICAL_META[slug];
          return (
            <Link
              key={slug}
              href={meta.path}
              className="group relative min-h-[200px] overflow-hidden"
            >
              <UnsplashImage
                src={getVerticalImage(slug)}
                alt={meta.label}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-display text-xl font-medium text-white">{meta.label}</p>
                <p className="mt-1 text-sm text-white/65">{meta.blurb}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
