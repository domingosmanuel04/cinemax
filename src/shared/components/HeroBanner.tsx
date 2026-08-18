"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { formatDuration } from "@/shared/lib/utils";
import { Play, Plus, Ticket, Volume2, VolumeX } from "lucide-react";
import type { Dictionary } from "@/shared/lib/i18n";

type HeroMovie = {
  slug: string;
  title: string;
  synopsis: string;
  backdropUrl: string;
  posterUrl: string;
  year: number;
  durationMin: number;
  rating: string;
  avgRating: number;
  streamingAvailable: boolean;
  cinemaAvailable: boolean;
  genres: { genre: { name: string } }[];
};

export function HeroBanner({
  movie,
  dict,
  videoUrl,
}: {
  movie: HeroMovie;
  dict: Dictionary;
  videoUrl?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const genre = movie.genres.map((g) => g.genre.name).join(" · ");

  return (
    <section className="relative h-[92vh] min-h-[640px] overflow-hidden film-grain">
      {videoUrl ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted={muted}
          loop
          playsInline
          poster={movie.backdropUrl}
        >
          <source src={videoUrl} />
        </video>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={movie.backdropUrl} alt="" className="absolute inset-0 h-full w-full object-cover scale-105" />
          <CinematicLights />
        </>
      )}
      <div className="hero-overlay absolute inset-0" />
      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-4 pb-28 md:px-8 md:pb-24">
        <div className="mb-4 flex flex-wrap gap-2 text-[10px] tracking-[0.25em] uppercase">
          <span className="rounded-full bg-cx-red px-3 py-1">{dict.home.featured}</span>
          <span className="rounded-full border border-white/20 px-3 py-1">{dict.home.premiere}</span>
          <span className="rounded-full border border-cx-gold/40 px-3 py-1 text-cx-gold">{dict.home.trending}</span>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display max-w-4xl text-5xl leading-none md:text-7xl"
        >
          {movie.title}
        </motion.h1>
        <p className="mt-4 max-w-xl text-sm text-white/80 md:text-base">{movie.synopsis}</p>
        <p className="mt-3 text-sm text-cx-muted">
          {genre} · {movie.year} · {formatDuration(movie.durationMin)} · {movie.rating} · ★ {movie.avgRating.toFixed(1)}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/filmes/${movie.slug}?trailer=1`} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
            <span className="inline-flex items-center gap-2">
              <Play className="h-4 w-4 fill-black" /> {dict.actions.trailer}
            </span>
          </Link>
          {movie.cinemaAvailable ? (
            <Link href={`/bilhetes/${movie.slug}`} className="rounded-full bg-cx-red px-5 py-3 text-sm font-semibold">
              <span className="inline-flex items-center gap-2">
                <Ticket className="h-4 w-4" /> {dict.actions.buyTicket}
              </span>
            </Link>
          ) : null}
          {movie.streamingAvailable ? (
            <Link href={`/assistir/${movie.slug}`} className="rounded-full border border-white/20 px-5 py-3 text-sm">
              {dict.actions.watch}
            </Link>
          ) : null}
          <Link href={`/conta/lista?add=${movie.slug}`} className="rounded-full border border-white/20 px-5 py-3 text-sm">
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> {dict.actions.addList}
            </span>
          </Link>
        </div>
      </div>
      {videoUrl ? (
        <button
          type="button"
          onClick={() => {
            setMuted((m) => !m);
            if (videoRef.current) videoRef.current.muted = !muted;
          }}
          className="absolute right-6 bottom-28 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/40"
          aria-label={muted ? "Activar som" : "Silenciar"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      ) : null}
    </section>
  );
}

function CinematicLights() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="animate-projector absolute left-1/2 top-0 h-[50%] w-[40%] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(255,230,180,0.12),transparent_70%)]" />
      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-cx-red/20 blur-3xl" />
      <div className="absolute right-10 bottom-10 h-80 w-80 rounded-full bg-cx-crimson/30 blur-3xl" />
    </div>
  );
}
