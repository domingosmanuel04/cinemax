import Link from "next/link";
import { Logo } from "@/shared/components/Logo";
import type { Dictionary } from "@/shared/lib/i18n";

export function Footer({ dict }: { dict: Dictionary }) {
  const cols = [
    {
      title: "CINEMAX",
      links: [
        ["/sobre", dict.footer.about],
        ["/contacto", dict.footer.contact],
        ["/cinemas", dict.nav.cinemas],
        ["/carreiras", dict.footer.careers],
      ],
    },
    {
      title: dict.nav.movies,
      links: [
        ["/lancamentos", dict.nav.releases],
        ["/estreias", dict.nav.premieres],
        ["/filmes?status=NOW_SHOWING", dict.home.nowShowing],
        ["/filmes?status=COMING_SOON", dict.home.comingSoon],
      ],
    },
    {
      title: dict.footer.help,
      links: [
        ["/ajuda", "FAQ"],
        ["/bilhetes", dict.nav.tickets],
        ["/ajuda#pagamentos", "Pagamentos"],
        ["/ajuda#reembolsos", "Reembolsos"],
        ["/contacto", dict.footer.contact],
      ],
    },
    {
      title: dict.footer.legal,
      links: [
        ["/legal/termos", dict.footer.terms],
        ["/legal/privacidade", dict.footer.privacy],
        ["/legal/cookies", dict.footer.cookies],
        ["/legal/direitos", dict.footer.rights],
        ["/tv", "Smart TV"],
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-white/10 bg-black">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-16 md:grid-cols-5 md:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-cx-muted">{dict.tagline}</p>
          <p className="mt-2 text-xs tracking-[0.3em] text-cx-gold uppercase">The Future of Cinema</p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-xs tracking-[0.25em] text-white uppercase">{col.title}</p>
            <ul className="space-y-2 text-sm text-cx-muted">
              {col.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-cx-fog">
        © {new Date().getFullYear()} CINEMAX. Conteúdo original ou devidamente licenciado.
      </div>
    </footer>
  );
}
