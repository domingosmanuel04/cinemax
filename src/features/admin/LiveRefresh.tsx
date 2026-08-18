"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LiveRefresh({ seconds = 5 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(t);
  }, [seconds, router]);
  return (
    <p className="inline-flex items-center gap-2 text-xs text-emerald-400">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
      A actualizar a cada {seconds}s
    </p>
  );
}
