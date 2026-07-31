import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { UnsplashImage } from "@/components/UnsplashImage";

interface AuthShellProps {
  children: ReactNode;
  /** Unsplash URL for the brand panel */
  image: string;
  imageAlt: string;
  /** One short line under the brand — hero budget: brand + line only */
  panelLine: string;
}

export function AuthShell({ children, image, imageAlt, panelLine }: AuthShellProps) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <aside className="relative hidden min-h-screen overflow-hidden bg-ink lg:block">
        <UnsplashImage src={image} alt={imageAlt} fill priority className="scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <Logo variant="light" />
          <p className="max-w-sm font-display text-3xl font-medium leading-snug tracking-tight text-white text-balance">
            {panelLine}
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col bg-[var(--surface-mist,#f4f7f6)]">
        <header className="flex items-center px-4 py-4 lg:hidden">
          <Logo />
        </header>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
