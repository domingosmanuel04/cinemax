import { prisma } from "@/server/db/prisma";
import { getSession } from "@/server/auth/session";
import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary } from "@/shared/lib/i18n";

const TIER_PERKS: Record<string, string[]> = {
  BRONZE: ["1 ponto / 100 AOA", "Newsletter exclusiva"],
  SILVER: ["Desconto 5%", "Pipoca pequena no aniversário"],
  GOLD: ["Desconto 10%", "Acesso antecipado a estreias"],
  PLATINUM: ["Desconto 15%", "Upgrade de sala quando disponível"],
  VIP: ["Bilhete grátis trimestral", "Sessões exclusivas", "Lounge VIP"],
};

export default async function ClubPage() {
  const session = await getSession();
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  const dict = getDictionary(locale);
  const acc = session
    ? await prisma.loyaltyAccount.findUnique({ where: { userId: session.id }, include: { transactions: { orderBy: { createdAt: "desc" }, take: 12 } } })
    : null;
  return (
    <div className="mx-auto max-w-4xl px-4 pt-28 pb-16">
      <p className="text-xs tracking-[0.3em] text-cx-gold">{dict.club.kicker}</p>
      <h1 className="font-display text-5xl">{dict.club.title}</h1>
      <p className="mt-3 text-cx-muted">{dict.club.hint}</p>
      {acc ? (
        <div className="glass mt-8 rounded-2xl p-6">
          <p className="text-cx-gold">{acc.tier}</p>
          <p className="text-3xl">
            {acc.points} {dict.club.points}
          </p>
          <p className="text-sm text-cx-muted">
            {acc.lifetime} {dict.club.lifetime}
          </p>
        </div>
      ) : (
        <Link href="/registar" className="mt-6 inline-block rounded-full bg-cx-red px-5 py-3">
          {dict.club.join}
        </Link>
      )}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {Object.entries(TIER_PERKS).map(([tier, perks]) => (
          <article key={tier} className="glass rounded-2xl p-5">
            <h2 className="font-display tracking-[0.2em]">{tier}</h2>
            <ul className="mt-3 space-y-1 text-sm text-cx-muted">
              {perks.map((p) => (
                <li key={p}>• {p}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
