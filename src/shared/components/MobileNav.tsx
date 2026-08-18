"use client";

import Link from "next/link";
import { Home, Clapperboard, Ticket, PlaySquare, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

const items = [
  { href: "/", label: "Início", icon: Home },
  { href: "/filmes", label: "Filmes", icon: Clapperboard },
  { href: "/bilhetes", label: "Bilhetes", icon: Ticket },
  { href: "/cinemax-plus", label: "CINEMAX+", icon: PlaySquare },
  { href: "/conta", label: "Perfil", icon: User },
];

export function MobileNav() {
  const path = usePathname();
  if (path.startsWith("/admin") || path.startsWith("/assistir")) return null;
  return (
    <nav className="glass-strong fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-2xl px-2 py-2 md:hidden" aria-label="Navegação móvel">
      {items.map((item) => {
        const active = path === item.href || (item.href !== "/" && path.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 px-2 py-1 text-[10px]", active ? "text-cx-red" : "text-cx-muted")}>
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
