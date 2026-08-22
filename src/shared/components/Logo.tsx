import Link from "next/link";
import { cn } from "@/shared/lib/utils";

export function Logo({ className, imgClassName }: { className?: string; imgClassName?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center transition-transform duration-300 hover:scale-105 shrink-0", className)}
      aria-label="CINEMAX"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="CINEMAX"
        className={cn("h-16 sm:h-20 md:h-24 w-auto max-w-[280px] object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.1)] shrink-0", imgClassName)}
      />
    </Link>
  );
}
