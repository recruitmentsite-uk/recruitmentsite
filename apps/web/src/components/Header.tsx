import Link from "next/link";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

export function Header() {
  return (
    <header className="border-b border-white/10 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/jobs" className="hover:text-brand transition-colors">
            Find jobs
          </Link>
          <Link href="/healthcare" className="hover:text-brand transition-colors">
            Healthcare
          </Link>
          <Link href="/trades" className="hover:text-brand transition-colors">
            Trades
          </Link>
          <Link href="/tech" className="hover:text-brand transition-colors">
            Tech
          </Link>
          <Link href="/blog" className="hover:text-brand transition-colors">
            Guides
          </Link>
          <Link href="/for-employers" className="hover:text-brand transition-colors">
            For employers
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline text-sm font-medium text-slate-500 hover:text-brand"
          >
            Sign in
          </Link>
          <Link
            href="/signup/candidate"
            className="hidden sm:inline text-sm font-medium text-slate-500 hover:text-brand"
          >
            Candidate signup
          </Link>
          <Link
            href="/pricing"
            className="hidden md:inline text-sm font-medium text-slate-500 hover:text-brand"
          >
            Hiring?
          </Link>
          <Link
            href="/jobs"
            className="hidden sm:inline rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-dark transition-colors"
          >
            Find jobs
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
