"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

function heroOwnsTop(): boolean {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return false;
  const top = hero.getBoundingClientRect().top;
  return top <= 72 && top > -120;
}

export function Header() {
  const pathname = usePathname();
  const [overHero, setOverHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useLayoutEffect(() => {
    setOverHero(heroOwnsTop());
  }, [pathname]);

  useEffect(() => {
    const update = () => setOverHero(heroOwnsTop());
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const transparent = overHero && !menuOpen;

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-ink/5 bg-paper/90 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Logo variant={transparent ? "light" : "dark"} />
        <nav
          className={`hidden items-center gap-7 text-[13px] font-medium tracking-wide lg:flex ${
            transparent ? "text-white/75" : "text-ink-soft/70"
          }`}
        >
          <Link
            href="/jobs"
            className={`transition-colors ${transparent ? "hover:text-white" : "hover:text-brand"}`}
          >
            Find jobs
          </Link>
          <Link
            href="/sectors"
            className={`transition-colors ${transparent ? "hover:text-white" : "hover:text-brand"}`}
          >
            Sectors
          </Link>
          <Link
            href="/blog"
            className={`transition-colors ${transparent ? "hover:text-white" : "hover:text-brand"}`}
          >
            Guides
          </Link>
          <Link
            href="/for-employers"
            className={`transition-colors ${transparent ? "hover:text-white" : "hover:text-brand"}`}
          >
            Employers
          </Link>
          <Link
            href="/pricing"
            className={`transition-colors ${transparent ? "hover:text-white" : "hover:text-brand"}`}
          >
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className={`hidden text-[13px] font-medium transition-colors sm:inline ${
              transparent ? "text-white/70 hover:text-white" : "text-ink-soft/60 hover:text-brand"
            }`}
          >
            Sign in
          </Link>
          <Link
            href="/jobs"
            className={`hidden text-[13px] font-medium transition-colors sm:inline ${
              transparent ? "text-white/70 hover:text-white" : "text-ink-soft/60 hover:text-brand"
            }`}
          >
            Browse roles
          </Link>
          <Link
            href="/onboarding"
            className={`hidden rounded-full px-4 py-2.5 text-[13px] font-semibold shadow-sm transition md:inline ${
              transparent
                ? "bg-white text-ink hover:bg-mist"
                : "bg-brand text-white hover:bg-brand-dark"
            }`}
          >
            Post a job
          </Link>
          <MobileNav tone={transparent ? "light" : "dark"} open={menuOpen} onOpenChange={setMenuOpen} />
        </div>
      </div>
    </header>
  );
}
