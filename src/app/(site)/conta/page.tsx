import { getSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { formatCurrency } from "@/shared/lib/utils";
import { logoutAction } from "@/features/auth/actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDictionary } from "@/shared/lib/i18n";
import { Cover } from "@/shared/components/Cover";

export default async function ContaPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/entrar?next=/conta");
  const { saved } = await searchParams;
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  const dict = getDictionary(locale);
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      tickets: { include: { session: { include: { movie: true, cinema: true, room: true } }, items: { include: { seat: true } } }, orderBy: { createdAt: "desc" }, take: 8 },
      orders: { orderBy: { createdAt: "desc" }, take: 6 },
      subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" }, take: 1 },
      watchlist: { include: { movie: true } },
      watchHistory: { include: { movie: true }, orderBy: { updatedAt: "desc" }, take: 6 },
      loyalty: true,
      notifications: { orderBy: { createdAt: "desc" }, take: 8 },
      preferredCinema: true,
    },
  });
  if (!user) redirect("/entrar");

  return (
    <div className="mx-auto max-w-6xl px-4 pt-28 pb-16">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {user.avatarUrl ? <Cover src={user.avatarUrl} alt="" className="h-16 w-16 rounded-full" /> : null}
          <div>
          <p className="text-xs tracking-[0.3em] text-cx-red">{dict.account.kicker}</p>
          <h1 className="font-display text-4xl">{user.name}</h1>
          <p className="text-cx-muted">{user.email} · {user.role}</p>
          {user.preferredCinema ? <p className="mt-1 text-sm text-cx-gold">{user.preferredCinema.name}</p> : null}
          {saved ? <p className="mt-2 text-sm text-emerald-400">{dict.account.saved}</p> : null}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/conta/perfil" className="rounded-full border border-white/20 px-4 py-2 text-sm">
            {dict.account.editProfile}
          </Link>
          <form action={logoutAction}>
            <button className="rounded-full border border-white/20 px-4 py-2 text-sm">{dict.actions.logout}</button>
          </form>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-cx-muted">{dict.account.club}</p>
          <p className="mt-2 text-2xl text-cx-gold">{user.loyalty?.tier || "BRONZE"}</p>
          <p>{user.loyalty?.points || 0} pontos</p>
          <Link href="/club" className="text-sm text-cx-red">{dict.account.benefits}</Link>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-cx-muted">{dict.account.subscription}</p>
          <p className="mt-2 text-xl">{user.subscriptions[0]?.plan.name || "—"}</p>
          <Link href="/cinemax-plus" className="text-sm text-cx-red">{dict.account.manage}</Link>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-cx-muted">{dict.account.notifications}</p>
          <p className="mt-2 text-xl">{user.notifications.filter((n) => !n.readAt).length} novas</p>
        </div>
      </div>

      <h2 className="font-display mt-12 text-2xl">{dict.account.upcoming}</h2>
      <div className="mt-4 space-y-3">
        {user.tickets.map((t) => (
          <Link key={t.id} href={`/conta/bilhetes/${t.id}`} className="glass flex justify-between rounded-xl p-4">
            <div>
              <p>{t.session.movie.title}</p>
              <p className="text-sm text-cx-muted">
                {t.session.cinema.name} · {t.session.room.name} · {t.session.startsAt.toLocaleString("pt-PT")} · {t.items.map((i) => `${i.seat.row}${i.seat.number}`).join(", ")}
              </p>
            </div>
            <span className="font-mono text-sm">{t.code}</span>
          </Link>
        ))}
        {!user.tickets.length ? (
          <p className="text-cx-muted">
            {dict.account.noTickets} <Link href="/bilhetes" className="text-cx-red">{dict.account.buy}</Link>
          </p>
        ) : null}
      </div>

      <h2 className="font-display mt-12 text-2xl">{dict.account.orders}</h2>
      <ul className="mt-4 space-y-2">
        {user.orders.map((o) => (
          <li key={o.id} className="flex justify-between text-sm">
            <span>{o.code} · {o.status}</span>
            <span>{formatCurrency(o.total)}</span>
          </li>
        ))}
      </ul>

      <h2 className="font-display mt-12 text-2xl">{dict.account.list}</h2>
      <div className="mt-4 flex gap-3 overflow-x-auto">
        {user.watchlist.map((w) =>
          w.movie ? (
            <Link key={w.id} href={`/filmes/${w.movie.slug}`} className="w-28 shrink-0">
              <Cover src={w.movie.posterUrl} alt={w.movie.title} className="rounded-lg" />
            </Link>
          ) : null,
        )}
      </div>

      <h2 className="font-display mt-12 text-2xl">{dict.account.continue}</h2>
      <div className="mt-4 flex gap-3 overflow-x-auto">
        {user.watchHistory.map((w) =>
          w.movie ? (
            <Link key={w.id} href={`/assistir/${w.movie.slug}`} className="w-40 shrink-0">
              <Cover src={w.movie.backdropUrl} alt={w.movie.title} className="h-24 w-40 rounded-lg" />
              <p className="mt-1 text-xs">{w.movie.title}</p>
            </Link>
          ) : null,
        )}
      </div>

      <h2 className="font-display mt-12 text-2xl">{dict.account.notifications}</h2>
      <ul className="mt-4 space-y-2">
        {user.notifications.map((n) => (
          <li key={n.id} className="glass rounded-xl p-3 text-sm">
            <p className="font-medium">{n.title}</p>
            <p className="text-cx-muted">{n.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
