import Link from "next/link";
import { LogoMark } from "./LogoMark";

interface LogoProps {
  variant?: "light" | "dark";
  showText?: boolean;
  className?: string;
}

export function Logo({ variant = "dark", showText = true, className = "" }: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-slate-900";

  return (
    <Link href="/" className={`group flex items-center gap-2.5 ${className}`}>
      <LogoMark size={36} className="shadow-md transition-transform group-hover:scale-105" />
      {showText && (
        <span className={`font-bold text-xl leading-tight ${textColor}`}>
          <span className={variant === "light" ? "text-white" : "text-brand"}>Recruitment</span>
          <span className={variant === "light" ? "text-teal-200/90" : "text-slate-700"}> Site</span>
        </span>
      )}
    </Link>
  );
}
