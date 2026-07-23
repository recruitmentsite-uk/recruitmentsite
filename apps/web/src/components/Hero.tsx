import Link from "next/link";
import { UnsplashImage } from "./UnsplashImage";

interface HeroProps {
  title: string;
  subtitle: string;
  image: string;
  badge?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  align?: "center" | "left";
  children?: React.ReactNode;
}

export function Hero({
  title,
  subtitle,
  image,
  badge,
  primaryCta,
  secondaryCta,
  align = "center",
  children,
}: HeroProps) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <section className="relative min-h-[520px] flex items-center overflow-hidden">
      <UnsplashImage src={image} alt="" fill priority className="scale-105" />
      <div className="absolute inset-0 hero-overlay" />
      <div className={`relative mx-auto max-w-6xl px-4 py-24 flex flex-col ${alignClass}`}>
        {badge && (
          <span className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
            {badge}
          </span>
        )}
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
          {title}
        </h1>
        <p className={`mt-5 max-w-2xl text-lg text-teal-50/90 ${align === "center" ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
        {children && (
          <div className={`mt-8 w-full ${align === "center" ? "flex justify-center" : ""}`}>
            {children}
          </div>
        )}
        {(primaryCta || secondaryCta) && (
          <div className="mt-8 flex flex-wrap gap-4">
            {primaryCta && (
              <Link
                href={primaryCta.href}
                className="rounded-xl bg-white px-7 py-3.5 font-semibold text-brand shadow-lg hover:bg-teal-50 transition-colors"
              >
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="rounded-xl border-2 border-white/40 px-7 py-3.5 font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
