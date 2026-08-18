import { notFound } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { Player } from "@/features/plus/Player";
import { getSession } from "@/server/auth/session";
import { cookies } from "next/headers";
import { getDictionary } from "@/shared/lib/i18n";
import Link from "next/link";

export default async function WatchEpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  const dict = getDictionary(locale);
  const episode = await prisma.episode.findUnique({
    where: { id },
    include: { season: { include: { series: { include: { licenses: true } } } } },
  });
  if (!episode) notFound();
  const series = episode.season.series;
  const session = await getSession();
  const sub = session
    ? await prisma.subscription.findFirst({ where: { userId: session.id, status: "ACTIVE" } })
    : null;
  const licensed =
    series.streamingAvailable &&
    (series.licenses.some((l) => l.streamingOk && l.status === "ACTIVE" && l.endsAt > new Date()) ||
      series.licenses.length === 0);

  if (!licensed) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-36 text-center">
        <h1 className="font-display text-3xl">{dict.legal.rights}</h1>
        <Link href={`/series/${series.slug}`} className="mt-6 inline-block rounded-full bg-cx-red px-5 py-3">
          {dict.catalog.details}
        </Link>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-36 text-center">
        <h1 className="font-display text-3xl">CINEMAX+</h1>
        <p className="mt-4 text-cx-muted">{series.title}</p>
        <Link href="/cinemax-plus" className="mt-6 inline-block rounded-full bg-cx-red px-5 py-3">
          {dict.actions.subscribe}
        </Link>
      </div>
    );
  }

  const history = session
    ? await prisma.watchHistory.findFirst({ where: { userId: session.id, episodeId: episode.id } })
    : null;

  return (
    <Player
      episodeId={episode.id}
      seriesId={series.id}
      title={`${series.title} · ${episode.title}`}
      backdrop={episode.thumbnailUrl || series.backdropUrl}
      src={episode.videoUrl}
      startAt={history?.progressSec && !history.completed ? history.progressSec : 0}
      exitHref={`/series/${series.slug}`}
      exitLabel={dict.player.exit}
      skipLabel={dict.actions.skipIntro}
      captionsOnLabel={dict.player.captionsOn}
      captionsOffLabel={dict.player.captionsOff}
      qualityLabel={dict.player.quality}
    />
  );
}
