import Link from "next/link";
import { LogoMark } from "./LogoMark";

interface LogoProps {
  variant?: "light" | "dark";
  showText?: boolean;
  className?: string;
}

export function Logo({ variant = "dark", showText = true, className = "" }: LogoProps) {
  const primary = variant === "light" ? "text-white" : "text-ink";
  const secondary = variant === "light" ? "text-white/70" : "text-ink/55";

  return (
    <Link href="/" className={`group flex items-center gap-2.5 ${className}`}>
      <LogoMark size={34} className="transition-transform duration-300 group-hover:scale-[1.04]" />
      {showText && (
        <span className={`font-display text-[1.35rem] font-medium leading-none tracking-brand ${primary}`}>
          Recruitment
          <span className={secondary}> Site</span>
        </span>
      )}
    </Link>
  );
}
