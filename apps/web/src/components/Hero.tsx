import Link from "next/link";
import { SITE_NAME } from "@placeuk/shared";
import { UnsplashImage } from "./UnsplashImage";

interface HeroProps {
  title: string;
  subtitle: string;
  image: string;
  /** Quiet text line — not a floating promo chip. */
  badge?: string;
  /** Hero-level brand wordmark (use on homepage). */
  showBrand?: boolean;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  align?: "center" | "left";
  /** Full-bleed landing vs shorter search surface (jobs listing). */
  size?: "full" | "compact";
  children?: React.ReactNode;
}

export function Hero({
  title,
  subtitle,
  image,
  badge,
  showBrand = false,
  primaryCta,
  secondaryCta,
  align = "center",
  size = "full",
  children,
}: HeroProps) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";
  const sectionClass =
    size === "compact"
      ? "relative -mt-[65px] flex min-h-[52svh] items-end overflow-hidden sm:min-h-[48svh] sm:items-center"
      : "relative -mt-[65px] flex min-h-[100svh] items-end overflow-hidden sm:min-h-[92svh] sm:items-center";
  const padClass = size === "compact" ? "px-4 pb-10 pt-28 sm:pt-24 sm:pb-16" : "px-4 pb-16 pt-32 sm:py-28";
  const titleClass =
    size === "compact"
      ? "animate-rise-delay-1 max-w-3xl font-display text-2xl font-medium tracking-tight text-white/95 sm:text-3xl lg:text-4xl text-balance"
      : "animate-rise-delay-1 max-w-3xl font-display text-3xl font-medium tracking-tight text-white/95 sm:text-4xl lg:text-5xl text-balance";

  return (
    <section data-hero className={sectionClass}>
      <UnsplashImage
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="ken-burns scale-105 object-cover"
      />
      <div className="absolute inset-0 hero-overlay" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
          backgroundSize: "180px",
          mixBlendMode: "overlay",
        }}
        aria-hidden
      />

      <div className={`relative mx-auto flex w-full max-w-6xl flex-col ${padClass} ${alignClass}`}>
        {showBrand && (
          <p className="animate-rise font-display text-4xl font-medium tracking-brand text-white sm:text-5xl lg:text-6xl">
            {SITE_NAME}
          </p>
        )}
        {!showBrand && badge && (
          <p className="animate-rise mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
            {badge}
          </p>
        )}
        <h1
          className={`${titleClass} ${
            showBrand ? "mt-5" : ""
          }`}
        >
          {title}
        </h1>
        <p
          className={`animate-rise-delay-2 mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
        {children && (
          <div
            className={`animate-rise-delay-3 mt-10 w-full ${align === "center" ? "flex justify-center" : ""}`}
          >
            {children}
          </div>
        )}
        {(primaryCta || secondaryCta) && (
          <div className="animate-rise-delay-3 mt-8 flex flex-wrap gap-3">
            {primaryCta && (
              <Link
                href={primaryCta.href}
                className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink shadow-lift transition hover:bg-mist"
              >
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
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
