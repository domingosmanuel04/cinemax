"use client";

import { Toaster } from "sonner";
import { Preloader } from "@/shared/components/Preloader";
import { AIChat } from "@/shared/components/AIChat";
import { MobileNav } from "@/shared/components/MobileNav";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AppChrome({
  children,
  preloader,
}: {
  children: React.ReactNode;
  preloader: boolean;
}) {
  const path = usePathname();
  const isAdmin = path.startsWith("/admin");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  return (
    <>
      {!isAdmin ? <Preloader enabled={preloader} /> : null}
      {children}
      <AIChat scope={isAdmin ? "ADMIN" : "PUBLIC"} />
      {!isAdmin ? <MobileNav /> : null}
      <Toaster theme="dark" position="top-center" />
    </>
  );
}
