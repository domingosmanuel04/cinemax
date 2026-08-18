import Link from "next/link";
import { cn } from "@/shared/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2", className)} aria-label="CINEMAX">
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-md border border-cx-red/60 bg-cx-void shadow-[0_0_18px_rgb(229_9_20_/_0.45)]">
        <span className="font-display text-[10px] tracking-[0.2em] text-white">CX</span>
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-cx-red" />
      </span>
      {compact ? null : (
        <span className="font-display text-lg tracking-[0.32em] text-white">
          CINE<span className="text-cx-red">MAX</span>
        </span>
      )}
    </Link>
  );
}
