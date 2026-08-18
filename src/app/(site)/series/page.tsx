import { prisma } from "@/server/db/prisma";
import Link from "next/link";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";
import { cookies } from "next/headers";
import { getDictionary } from "@/shared/lib/i18n";

export default async function SeriesPage() {
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  const dict = getDictionary(locale);
  const series = await prisma.series.findMany({ include: { genres: { include: { genre: true } }, seasons: true } });
  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-28 pb-16 md:px-8">
      <div className="relative mb-10 overflow-hidden rounded-3xl">
        <Cover src={AMBIENCE.lobby} alt="" className="h-48 w-full md:h-64" />
        <div className="absolute inset-0 bg-gradient-to-t from-black" />
        <div className="absolute bottom-8 left-8">
          <h1 className="font-display text-5xl">{dict.catalog.series}</h1>
          <p className="mt-2 text-white/70">{dict.catalog.originals}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-6">
        {series.map((s) => (
          <Link key={s.id} href={`/series/${s.slug}`} className="w-[180px] md:w-[240px]">
            <Cover src={s.posterUrl} alt={s.title} className="aspect-[2/3] w-full rounded-2xl" />
            <h2 className="mt-2 text-sm">{s.title}</h2>
            <p className="text-xs text-cx-muted">
              {s.seasons.length} {dict.catalog.seasons}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
