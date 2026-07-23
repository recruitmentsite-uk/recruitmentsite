import Link from "next/link";
import Image from "next/image";
import {
  UNSPLASH,
  COMPANY_LEGAL_NOTICE,
  POPULAR_CITIES,
  cityToSlug,
  SEO_ROLE_PAGES,
  COMPETITOR_SEO_PAGES,
} from "@placeuk/shared";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="relative h-48 overflow-hidden">
        <Image src={UNSPLASH.hero.ukCity} alt="London skyline" fill className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-12 -mt-24 relative">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Logo variant="light" />
            <p className="mt-2 text-sm text-slate-400">
              UK jobs with salary shown upfront. Free to apply, free job alerts.
            </p>
          </div>
          <div>
            <p className="font-medium text-white">Candidates</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/jobs" className="hover:text-teal-400">Browse jobs</Link></li>
              <li><Link href="/healthcare" className="hover:text-teal-400">Healthcare jobs</Link></li>
              <li><Link href="/trades" className="hover:text-teal-400">Trades jobs</Link></li>
              <li><Link href="/tech" className="hover:text-teal-400">Tech jobs</Link></li>
              <li><Link href="/job-alerts" className="hover:text-teal-400">Job alerts</Link></li>
              <li><Link href="/nhs-band-salary-guide" className="hover:text-teal-400">NHS pay bands</Link></li>
              <li><Link href="/blog" className="hover:text-teal-400">Hiring guides</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-white">Popular roles</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              {SEO_ROLE_PAGES.slice(0, 6).map((role) => (
                <li key={role.slug}>
                  <Link href={`/${role.vertical}/${role.slug}`} className="hover:text-teal-400">
                    {role.title.replace(" UK", "")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-white">For employers</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><Link href="/for-employers" className="hover:text-teal-400">Why Recruitment Site</Link></li>
              <li><Link href="/pricing" className="hover:text-teal-400">Pricing</Link></li>
              <li><Link href="/compare" className="hover:text-teal-400">Compare vs Reed</Link></li>
              {COMPETITOR_SEO_PAGES.slice(0, 3).map((c) => (
                <li key={c.slug}>
                  <Link href={`/compare/${c.slug}`} className="hover:text-teal-400">vs {c.name}</Link>
                </li>
              ))}
              <li><Link href="/employer-compliance" className="hover:text-teal-400">Compliance</Link></li>
              <li><Link href="/faq" className="hover:text-teal-400">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-500">
          {POPULAR_CITIES.map((city) => (
            <Link key={city} href={`/jobs/${cityToSlug(city)}`} className="hover:text-teal-400">
              Jobs in {city}
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-500">
          <Link href="/about" className="hover:text-teal-400">About</Link>
          <Link href="/privacy" className="hover:text-teal-400">Privacy</Link>
          <Link href="/terms" className="hover:text-teal-400">Terms</Link>
          <Link href="/salary-transparency" className="hover:text-teal-400">Salary transparency</Link>
        </div>
        <p className="mt-10 text-center text-xs text-slate-500 max-w-3xl mx-auto leading-relaxed">
          © {new Date().getFullYear()} {COMPANY_LEGAL_NOTICE}
          <br />
          Photos via Unsplash.
        </p>
      </div>
    </footer>
  );
}
