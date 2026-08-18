"use client";

type CinemaPin = {
  slug: string;
  name: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
};

export function CinemaMap({ cinemas }: { cinemas: CinemaPin[] }) {
  const withCoords = cinemas.filter((c) => c.latitude && c.longitude);
  const first = withCoords[0];
  const bbox = first
    ? `${first.longitude! - 2},${first.latitude! - 2},${first.longitude! + 2},${first.latitude! + 2}`
    : "11,-16,24,-4";
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10">
      <iframe
        title="Mapa da rede CINEMAX"
        className="h-[380px] w-full grayscale-[0.35] contrast-125"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${first ? `&marker=${first.latitude},${first.longitude}` : ""}`}
      />
      <div className="grid gap-2 bg-black/80 p-4 md:grid-cols-5">
        {cinemas.map((c) => (
          <a
            key={c.slug}
            href={`https://www.openstreetmap.org/?mlat=${c.latitude}&mlon=${c.longitude}#map=14/${c.latitude}/${c.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-cx-muted hover:text-cx-gold"
          >
            📍 {c.name}
            <span className="block text-white/40">{c.city}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
