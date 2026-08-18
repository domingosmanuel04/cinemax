import { prisma } from "@/server/db/prisma";
import Link from "next/link";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";

export default async function PromocoesPage() {
  const [promos, coupons] = await Promise.all([
    prisma.promotion.findMany({ where: { active: true } }),
    prisma.coupon.findMany({ where: { active: true } }),
  ]);
  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-16">
      <div className="relative mb-10 overflow-hidden rounded-3xl">
        <Cover src={AMBIENCE.popcorn} alt="" className="h-48 w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black" />
        <div className="absolute bottom-8 left-8">
          <h1 className="font-display text-5xl">PROMOÇÕES</h1>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {promos.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-3xl border border-white/10">
            <Cover src={p.imageUrl} alt="" className="h-52 w-full" />
            <div className="p-5">
              <h2>{p.title}</h2>
              <p className="text-sm text-cx-muted">{p.description}</p>
              {p.discount ? <p className="mt-2 text-cx-gold">{p.discount}% OFF</p> : null}
              <Link href="/bilhetes" className="mt-3 inline-block text-sm text-cx-red">Usar na compra</Link>
            </div>
          </article>
        ))}
      </div>
      <h2 className="font-display mt-12 text-2xl">Cupões</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {coupons.map((c) => (
          <li key={c.id} className="glass rounded-xl px-4 py-3">
            <span className="font-mono text-cx-gold">{c.code}</span> — {c.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
