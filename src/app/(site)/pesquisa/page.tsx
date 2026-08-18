"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";

type Results = {
  movies: { slug: string; title: string; year: number; posterUrl: string; backdropUrl: string }[];
  series: { slug: string; title: string; posterUrl: string }[];
  cinemas: { slug: string; name: string; city: string; imageUrl: string | null }[];
  people: { name: string; photoUrl: string | null }[];
};

export default function PesquisaPage() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<Results>({ movies: [], series: [], cinemas: [], people: [] });
  const [ai, setAi] = useState("");

  useEffect(() => {
    const t = setTimeout(async () => {
      if (q.length < 2) {
        setData({ movies: [], series: [], cinemas: [], people: [] });
        return;
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      setData(await res.json());
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  async function natural() {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, scope: "PUBLIC" }),
    });
    const json = await res.json();
    setAi(json.answer);
  }

  const empty = q.length >= 2 && !data.movies.length && !data.series.length && !data.cinemas.length && !data.people.length;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-16">
      <div className="relative mb-8 overflow-hidden rounded-3xl">
        <Cover src={AMBIENCE.projector} alt="" className="h-40 w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black" />
        <div className="absolute bottom-6 left-6">
          <h1 className="font-display text-4xl">PESQUISA</h1>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute top-3.5 left-3 h-4 w-4 text-cx-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filmes, séries, cinemas, actores… ou «terror amanhã depois das 20h»"
          className="w-full rounded-2xl bg-white/5 py-3 pr-4 pl-10 outline-none"
        />
      </div>
      <button type="button" onClick={natural} className="mt-3 text-sm text-cx-red">
        Pesquisar com CINEMAX AI
      </button>
      {ai ? <p className="glass mt-4 whitespace-pre-wrap rounded-xl p-4 text-sm">{ai}</p> : null}
      {empty ? <p className="mt-8 text-cx-muted">Nenhum resultado para «{q}».</p> : null}

      {data.movies.length ? (
        <section className="mt-10">
          <h2 className="text-xs tracking-[0.25em] text-cx-muted uppercase">Filmes</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            {data.movies.map((m) => (
              <Link key={m.slug} href={`/filmes/${m.slug}`} className="w-36 md:w-40">
                <Cover src={m.posterUrl} alt={m.title} className="aspect-[2/3] w-full rounded-xl" />
                <p className="mt-2 truncate text-sm">{m.title}</p>
                <p className="text-xs text-cx-muted">{m.year}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {data.series.length ? (
        <section className="mt-10">
          <h2 className="text-xs tracking-[0.25em] text-cx-muted uppercase">Séries</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            {data.series.map((s) => (
              <Link key={s.slug} href={`/cinemax-plus?serie=${s.slug}`} className="w-36">
                <Cover src={s.posterUrl} alt={s.title} className="aspect-[2/3] w-full rounded-xl" />
                <p className="mt-2 truncate text-sm">{s.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {data.cinemas.length ? (
        <section className="mt-10">
          <h2 className="text-xs tracking-[0.25em] text-cx-muted uppercase">Cinemas</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {data.cinemas.map((c) => (
              <Link key={c.slug} href={`/cinemas/${c.slug}`} className="flex overflow-hidden rounded-2xl border border-white/10">
                <Cover src={c.imageUrl || AMBIENCE.lobby} alt="" className="h-24 w-32" />
                <div className="p-3">
                  <p>{c.name}</p>
                  <p className="text-sm text-cx-muted">{c.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {data.people.length ? (
        <section className="mt-10">
          <h2 className="text-xs tracking-[0.25em] text-cx-muted uppercase">Pessoas</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            {data.people.map((p) => (
              <Link key={p.name} href={`/filmes?q=${encodeURIComponent(p.name)}`} className="w-24 text-center">
                <Cover src={p.photoUrl || ""} alt={p.name} className="mx-auto h-20 w-20 rounded-full" />
                <p className="mt-2 text-xs">{p.name}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
