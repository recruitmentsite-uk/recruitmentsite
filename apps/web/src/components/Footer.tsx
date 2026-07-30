import Link from "next/link";
import Image from "next/image";
import {
  UNSPLASH,
  COMPANY_LEGAL_NOTICE,
  POPULAR_CITIES,
  cityToSlug,
  SEO_ROLE_PAGES,
  COMPETITOR_SEO_PAGES,
  liveSocialLinks,
} from "@placeuk/shared";
import { Logo } from "./Logo";

export function Footer() {
  const social = liveSocialLinks();

  return (
    <footer className="bg-ink text-white/55">
      <div className="relative h-48 overflow-hidden">
        <Image src={UNSPLASH.hero.ukCity} alt="London skyline" fill className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
      </div>
      <div className="relative mx-auto -mt-24 max-w-6xl px-4 pb-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Logo variant="light" />
            <p className="mt-3 text-sm leading-relaxed text-white/45">
              UK jobs with salary shown upfront. Free to apply, free job alerts.
            </p>
            {social.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {social.map((p) => (
                  <li key={p.key}>
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition hover:text-brand-light"
                    >
                      {p.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="font-display text-base font-medium text-white">Candidates</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/jobs" className="transition hover:text-brand-light">Browse jobs</Link></li>
              <li><Link href="/signup/candidate" className="transition hover:text-brand-light">Create free account</Link></li>
              <li><Link href="/sectors" className="transition hover:text-brand-light">All sectors</Link></li>
              <li><Link href="/healthcare" className="transition hover:text-brand-light">Healthcare</Link></li>
              <li><Link href="/education" className="transition hover:text-brand-light">Education</Link></li>
              <li><Link href="/logistics" className="transition hover:text-brand-light">Logistics</Link></li>
              <li><Link href="/finance" className="transition hover:text-brand-light">Finance</Link></li>
              <li><Link href="/job-alerts" className="transition hover:text-brand-light">Job alerts</Link></li>
              <li><Link href="/nhs-band-salary-guide" className="transition hover:text-brand-light">NHS pay bands</Link></li>
              <li><Link href="/blog" className="transition hover:text-brand-light">Hiring guides</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-display text-base font-medium text-white">Popular roles</p>
            <ul className="mt-3 space-y-2 text-sm">
              {SEO_ROLE_PAGES.slice(0, 6).map((role) => (
                <li key={role.slug}>
                  <Link href={`/${role.vertical}/${role.slug}`} className="transition hover:text-brand-light">
                    {role.title.replace(" UK", "")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-base font-medium text-white">For employers</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/for-employers" className="transition hover:text-brand-light">Why Recruitment Site</Link></li>
              <li><Link href="/pricing" className="transition hover:text-brand-light">Pricing</Link></li>
              <li><Link href="/press" className="transition hover:text-brand-light">Press kit</Link></li>
              {COMPETITOR_SEO_PAGES.slice(0, 3).map((c) => (
                <li key={c.slug}>
                  <Link href={`/compare/${c.slug}`} className="transition hover:text-brand-light">vs {c.name}</Link>
                </li>
              ))}
              <li><Link href="/employer-compliance" className="transition hover:text-brand-light">Compliance</Link></li>
              <li><Link href="/faq" className="transition hover:text-brand-light">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-white/35">
          {POPULAR_CITIES.map((city) => (
            <Link key={city} href={`/jobs/${cityToSlug(city)}`} className="transition hover:text-brand-light">
              Jobs in {city}
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-white/35">
          <Link href="/about" className="transition hover:text-brand-light">About</Link>
          <Link href="/privacy" className="transition hover:text-brand-light">Privacy</Link>
          <Link href="/terms" className="transition hover:text-brand-light">Terms</Link>
          <Link href="/salary-transparency" className="transition hover:text-brand-light">Salary transparency</Link>
        </div>
        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-white/30">
          © {new Date().getFullYear()} {COMPANY_LEGAL_NOTICE}
          <br />
          Photos via Unsplash.
        </p>
      </div>
    </footer>
  );
}
