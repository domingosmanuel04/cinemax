"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, MapPin, Menu, Search, User, X } from "lucide-react";
import { Logo } from "@/shared/components/Logo";
import { LocaleSwitch } from "@/shared/components/LocaleSwitch";
import { cn } from "@/shared/lib/utils";
import type { Dictionary } from "@/shared/lib/i18n";

const links = [
  ["/", "home"],
  ["/lancamentos", "releases"],
  ["/estreias", "premieres"],
  ["/filmes", "movies"],
  ["/series", "series"],
  ["/cinemax-plus", "watch"],
  ["/bilhetes", "tickets"],
  ["/salas", "rooms"],
  ["/sessoes", "sessions"],
  ["/cinemas", "cinemas"],
  ["/promocoes", "promotions"],
  ["/loja", "store"],
  ["/cinemax-plus", "plus"],
  ["/conta/lista", "list"],
] as const;

export function Navbar({
  dict,
  userName,
  locale,
  cinemaName,
  currency,
}: {
  dict: Dictionary;
  userName?: string | null;
  locale: string;
  cinemaName?: string | null;
  currency?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled ? "glass-strong py-2" : "bg-gradient-to-b from-black/80 to-transparent py-4",
        )}
      >
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 md:px-8">
          <Logo />
          <nav className="hidden items-center gap-4 overflow-x-auto text-[11px] tracking-[0.14em] uppercase xl:flex" aria-label="Principal">
            {links.slice(0, 10).map(([href, key]) => (
              <Link key={href + key} href={href} className="whitespace-nowrap text-white/70 hover:text-white">
                {dict.nav[key]}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/pesquisa" className="grid h-10 w-10 place-items-center rounded-full text-white/80 hover:bg-white/10" aria-label={dict.nav.search}>
              <Search className="h-4 w-4" />
            </Link>
            <Link href="/conta" className="grid h-10 w-10 place-items-center rounded-full text-white/80 hover:bg-white/10" aria-label={dict.nav.notifications}>
              <Bell className="h-4 w-4" />
            </Link>
            <LocaleSwitch locale={locale} currency={currency || "AOA"} />
            <Link href="/cinemas" className="hidden items-center gap-1 rounded-full px-2 text-[11px] text-white/70 hover:text-white lg:flex">
              <MapPin className="h-3.5 w-3.5" /> {cinemaName || "Luanda"}
            </Link>
            <Link
              href={userName ? "/conta" : "/entrar"}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{userName || dict.nav.account}</span>
            </Link>
            <button type="button" className="grid h-10 w-10 place-items-center xl:hidden" onClick={() => setOpen(true)} aria-label="Menu">
              <Menu />
            </button>
          </div>
        </div>
      </header>
      {open ? (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl xl:hidden">
          <div className="flex items-center justify-between p-4">
            <Logo />
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar">
              <X />
            </button>
          </div>
          <nav className="grid gap-2 px-6 py-4 text-lg">
            {links.map(([href, key]) => (
              <Link key={href + key} href={href} onClick={() => setOpen(false)} className="border-b border-white/5 py-2">
                {dict.nav[key]}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </>
  );
}
