import { notFound } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { Player } from "@/features/plus/Player";
import { getSession } from "@/server/auth/session";
import { cookies } from "next/headers";
import { getDictionary } from "@/shared/lib/i18n";
import Link from "next/link";

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  const dict = getDictionary(locale);
  const movie = await prisma.movie.findUnique({ where: { slug }, include: { licenses: true } });
  if (!movie) notFound();
  const session = await getSession();
  const sub = session
    ? await prisma.subscription.findFirst({ where: { userId: session.id, status: "ACTIVE" } })
    : null;
  const licensed = movie.streamingAvailable && movie.licenses.some((l) => l.streamingOk && l.status === "ACTIVE" && l.endsAt > new Date());

  if (!licensed) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-36 text-center">
        <h1 className="font-display text-3xl">{dict.legal.rights}</h1>
        <p className="mt-4 text-cx-muted">{dict.legal.rightsBody}</p>
        <Link href={`/bilhetes/${movie.slug}`} className="mt-6 inline-block rounded-full bg-cx-red px-5 py-3">
          {dict.actions.buyTicket}
        </Link>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-36 text-center">
        <h1 className="font-display text-3xl">CINEMAX+</h1>
        <p className="mt-4 text-cx-muted">{movie.title}</p>
        <Link href="/cinemax-plus" className="mt-6 inline-block rounded-full bg-cx-red px-5 py-3">
          {dict.actions.subscribe}
        </Link>
      </div>
    );
  }

  const history = session
    ? await prisma.watchHistory.findFirst({ where: { userId: session.id, movieId: movie.id } })
    : null;

  return (
    <Player
      movieId={movie.id}
      title={movie.title}
      backdrop={movie.backdropUrl}
      src={movie.videoUrl}
      startAt={history?.progressSec && !history.completed ? history.progressSec : 0}
      exitHref="/cinemax-plus"
      exitLabel={dict.player.exit}
      skipLabel={dict.actions.skipIntro}
      captionsOnLabel={dict.player.captionsOn}
      captionsOffLabel={dict.player.captionsOff}
      qualityLabel={dict.player.quality}
    />
  );
}
