"use client";

import { useEffect, useRef, useState } from "react";
import { saveWatchProgress } from "@/features/checkout/actions";
import { DEMO_STREAM } from "@/shared/lib/media";
import {
  Maximize,
  Pause,
  Play,
  PictureInPicture2,
  Subtitles,
  Volume2,
  VolumeX,
} from "lucide-react";

function fmt(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function Player({
  movieId,
  episodeId,
  seriesId,
  title,
  backdrop,
  src,
  captionsUrl = "/captions/cinemax.vtt",
  startAt = 0,
  exitHref = "/cinemax-plus",
  exitLabel = "Sair",
  skipLabel = "Saltar introdução",
  captionsOnLabel = "Legendas ligadas",
  captionsOffLabel = "Legendas desligadas",
  qualityLabel = "Qualidade Auto · Áudio PT · Stream de demonstração licenciado",
}: {
  movieId?: string;
  episodeId?: string;
  seriesId?: string;
  title: string;
  backdrop: string;
  src?: string | null;
  captionsUrl?: string;
  startAt?: number;
  exitHref?: string;
  exitLabel?: string;
  skipLabel?: string;
  captionsOnLabel?: string;
  captionsOffLabel?: string;
  qualityLabel?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [rate, setRate] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [captions, setCaptions] = useState(true);
  const stream = src && !src.endsWith(".svg") ? src : DEMO_STREAM;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.volume = volume;
    v.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const tracks = v.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = captions ? "showing" : "hidden";
    }
  }, [captions]);

  useEffect(() => {
    const v = ref.current;
    if (v && startAt > 0) {
      const onMeta = () => {
        v.currentTime = startAt;
      };
      v.addEventListener("loadedmetadata", onMeta, { once: true });
      return () => v.removeEventListener("loadedmetadata", onMeta);
    }
  }, [startAt]);

  useEffect(() => {
    const id = setInterval(() => {
      const v = ref.current;
      if (!v || !v.duration) return;
      saveWatchProgress({
        movieId,
        episodeId,
        seriesId,
        progressSec: Math.floor(v.currentTime),
        durationSec: Math.floor(v.duration),
      });
    }, 5000);
    return () => clearInterval(id);
  }, [movieId, episodeId, seriesId]);

  return (
    <div className="fixed inset-0 z-[80] bg-black">
      <video
        ref={ref}
        className="h-full w-full object-cover"
        poster={backdrop}
        src={stream}
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
      >
        <track kind="subtitles" src={captionsUrl} srcLang="pt" label="Português" default />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6">
        <p className="font-display tracking-[0.3em]">{title}</p>
        <a href={exitHref} className="text-sm text-cx-muted hover:text-white">
          {exitLabel}
        </a>
      </div>
      {time < 12 && time > 0.4 ? (
        <button
          type="button"
          onClick={() => {
            if (ref.current) ref.current.currentTime = Math.min(ref.current.duration || 12, 12);
          }}
          className="absolute top-20 right-6 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm"
        >
          {skipLabel}
        </button>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 space-y-3 p-6">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          aria-label="Progresso"
          onChange={(e) => {
            const t = Number(e.target.value);
            if (ref.current) ref.current.currentTime = t;
            setTime(t);
          }}
          className="w-full accent-cx-red"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const v = ref.current;
              if (!v) return;
              if (v.paused) v.play().catch(() => undefined);
              else v.pause();
            }}
            className="grid h-12 w-12 place-items-center rounded-full bg-cx-red"
            aria-label={playing ? "Pausa" : "Play"}
          >
            {playing ? <Pause /> : <Play className="fill-white" />}
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Som" : "Silenciar"}
          >
            {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            aria-label="Volume"
            className="w-24 accent-cx-red"
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              setMuted(v === 0);
            }}
          />
          <span className="text-xs tabular-nums text-cx-muted">
            {fmt(time)} / {fmt(duration)}
          </span>
          <button type="button" onClick={() => ref.current?.requestFullscreen()} aria-label="Ecrã inteiro">
            <Maximize className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => ref.current?.requestPictureInPicture?.()}
            aria-label="Picture in picture"
          >
            <PictureInPicture2 className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCaptions((c) => !c)}
            aria-label={captions ? captionsOnLabel : captionsOffLabel}
            className={captions ? "text-cx-gold" : "text-white/50"}
          >
            <Subtitles className="h-5 w-5" />
          </button>
          <select
            value={rate}
            onChange={(e) => {
              const r = Number(e.target.value);
              setRate(r);
              if (ref.current) ref.current.playbackRate = r;
            }}
            className="rounded bg-white/10 px-2 py-1 text-sm"
          >
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
          </select>
          <span className="text-xs text-cx-muted">{qualityLabel}</span>
        </div>
      </div>
    </div>
  );
}
