"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Film,
  Tv,
  Sparkles,
  Calendar,
  PlayCircle,
  Ticket,
  Clock,
  MapPin,
  Monitor,
  ShoppingBag,
  Tag,
  Bookmark,
  User,
  LogIn,
  Settings,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  Star,
} from "lucide-react";
import { Logo } from "@/shared/components/Logo";
import { LocaleSwitch } from "@/shared/components/LocaleSwitch";
import { logoutAction } from "@/features/auth/actions";

type MovieItem = {
  id: string;
  title: string;
  genre: string;
  rating: string;
  posterUrl: string;
};

type ArtistItem = {
  id: string;
  name: string;
  avatarUrl: string;
};

type ContinueWatchingItem = {
  id: string;
  title: string;
  progress: string;
  imageUrl: string;
};

interface CinemaxDashboardProps {
  userName?: string | null;
  locale?: string;
  currency?: string;
  popularMovies?: MovieItem[];
  favoriteMovies?: MovieItem[];
  artists?: ArtistItem[];
  continueWatching?: ContinueWatchingItem[];
}

const defaultPopular: MovieItem[] = [
  {
    id: "1",
    title: "John Wick",
    genre: "Action, Horror",
    rating: "IMDb 7.4",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&q=80",
  },
  {
    id: "2",
    title: "Avatar: Way of Water",
    genre: "Sci-Fi, Adventure",
    rating: "IMDb 7.8",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80",
  },
  {
    id: "3",
    title: "Interstellar",
    genre: "Sci-Fi, Drama",
    rating: "IMDb 8.6",
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80",
  },
];

const defaultFavorites: MovieItem[] = [
  {
    id: "4",
    title: "The Dark Knight",
    genre: "Action, Crime",
    rating: "IMDb 9.0",
    posterUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=300&q=80",
  },
  {
    id: "5",
    title: "Inception",
    genre: "Action, Sci-Fi",
    rating: "IMDb 8.8",
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80",
  },
  {
    id: "6",
    title: "Dune: Part Two",
    genre: "Sci-Fi, Adventure",
    rating: "IMDb 8.5",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80",
  },
];

const defaultArtists: ArtistItem[] = [
  { id: "a1", name: "Keanu Reeves", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80" },
  { id: "a2", name: "Zendaya", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80" },
  { id: "a3", name: "Timothée C.", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80" },
  { id: "a4", name: "Florence P.", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80" },
];

const defaultContinue: ContinueWatchingItem[] = [
  {
    id: "c1",
    title: "Stranger Things S4",
    progress: "45m left",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80",
  },
  {
    id: "c2",
    title: "The Last of Us",
    progress: "12m left",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80",
  },
  {
    id: "c3",
    title: "House of the Dragon",
    progress: "28m left",
    imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&q=80",
  },
];

export function CinemaxDashboard({
  userName,
  locale = "pt",
  currency = "AOA",
  popularMovies = defaultPopular,
  favoriteMovies = defaultFavorites,
  artists = defaultArtists,
  continueWatching = defaultContinue,
}: CinemaxDashboardProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<"TV Series" | "Movies" | "Animes">("Movies");

  const menuSections = [
    {
      title: "Menu",
      items: [
        { label: "Home", href: "/", icon: Home },
        { label: "Filmes", href: "/filmes", icon: Film },
        { label: "Séries", href: "/series", icon: Tv },
        { label: "Lançamentos", href: "/lancamentos", icon: Sparkles },
        { label: "Estreias", href: "/estreias", icon: Calendar },
      ],
    },
    {
      title: "Explorar",
      items: [
        { label: "CINEMAX+", href: "/cinemax-plus", icon: PlayCircle },
        { label: "Bilhetes", href: "/bilhetes", icon: Ticket },
        { label: "Sessões", href: "/sessoes", icon: Clock },
        { label: "Cinemas", href: "/cinemas", icon: MapPin },
        { label: "Salas", href: "/salas", icon: Monitor },
      ],
    },
    {
      title: "Loja & Conta",
      items: [
        { label: "Loja", href: "/loja", icon: ShoppingBag },
        { label: "Promoções", href: "/promocoes", icon: Tag },
        { label: "Minha Lista", href: "/conta/lista", icon: Bookmark },
      ],
    },
    {
      title: "Geral",
      items: [
        { label: userName ? "Minha Conta" : "Entrar", href: userName ? "/conta" : "/entrar", icon: userName ? User : LogIn },
        { label: "Definições", href: "/conta/perfil", icon: Settings },
        ...(userName ? [{ label: "Sair", href: "/entrar", icon: LogOut }] : []),
      ],
    },
  ];

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#050505] p-3 md:p-6 cinema-gradient text-white selection:bg-[#e50914]">
      {/* ESTRUTURA DO CONTAINER */}
      <div className="relative flex h-[88vh] min-h-[680px] max-h-[920px] w-[92vw] max-w-[1550px] overflow-hidden rounded-[24px] border border-white/10 bg-[#0d0e12]/95 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        {/* GRID PRINCIPAL (3 Colunas: 210px minmax(0, 1fr) 240px) */}
        <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)_240px]">
          
          {/* SIDEBAR ESQUERDA */}
          <aside className="relative flex h-full min-h-0 w-full flex-col overflow-hidden border-r border-white/10 bg-[#09090b]/80">
            {/* LOGO */}
            <div className="mt-[35px] ml-[35px] mb-2 shrink-0">
              <Logo />
            </div>

            {/* CARTÃO DO UTILIZADOR LOGADO */}
            {userName ? (
              <div className="mx-3 my-2 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 shrink-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e50914] font-bold text-xs text-white uppercase shadow">
                  {userName.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">{userName}</span>
                  <span className="text-[10px] font-medium text-emerald-400">Sessão Ativa</span>
                </div>
              </div>
            ) : null}

            {/* MENU ESQUERDO ORGANIZADO E ROLÁVEL */}
            <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto px-3 pb-8">
              {menuSections.map((section) => (
                <div key={section.title}>
                  <p className="px-[20px] text-[10px] font-semibold tracking-[0.2em] text-white/40 uppercase">
                    {section.title}
                  </p>
                  <nav className="mt-1.5 flex flex-col gap-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                      if (item.label === "Sair") {
                        return (
                          <form key={item.label} action={logoutAction} className="w-full">
                            <button
                              type="submit"
                              className="relative flex h-[40px] w-full items-center gap-3 rounded-xl px-[20px] text-xs font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white"
                            >
                              <Icon className="h-4 w-4 shrink-0 text-[#e50914]" />
                              <span className="truncate">{item.label}</span>
                            </button>
                          </form>
                        );
                      }
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={`relative flex h-[40px] w-full items-center gap-3 rounded-xl px-[20px] text-xs font-medium transition-all ${
                            isActive
                              ? "text-white bg-white/10 font-semibold"
                              : "text-white/60 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#e50914]" : ""}`} />
                          <span className="truncate">{item.label}</span>
                          {/* INDICADOR VERTICAL VERMELHO */}
                          {isActive ? (
                            <span className="absolute right-0 top-1/2 h-[20px] w-[4px] -translate-y-1/2 rounded-l-full bg-[#e50914]" />
                          ) : null}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>
          </aside>

          {/* CONTEÚDO CENTRAL */}
          <main className="flex h-full flex-col overflow-y-auto px-[44px] pt-[45px] pb-8 no-scrollbar">
            
            {/* TOP NAVIGATION HEADER (TV Series, Movies, Animes + Right LocaleSwitch & Entrar / Minha Conta) */}
            <div className="flex items-center justify-between gap-4">
              <nav className="flex items-center gap-[24px]">
                {(["TV Series", "Movies", "Animes"] as const).map((tab) => {
                  const isSelected = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`text-sm font-semibold transition-all ${
                        isSelected
                          ? "text-white border-b-2 border-[#e50914] pb-1"
                          : "text-white/50 hover:text-white/80 pb-1"
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </nav>

              {/* LADO DIREITO DA NAVEGAÇÃO: IDIOMA E BOTÃO ENTRAR / MINHA CONTA COM ÍCONE */}
              <div className="flex items-center gap-3">
                <LocaleSwitch locale={locale} currency={currency} />
                <Link
                  href={userName ? "/conta" : "/entrar"}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 hover:text-white"
                >
                  {userName ? (
                    <User className="h-4 w-4 text-[#e50914]" />
                  ) : (
                    <LogIn className="h-4 w-4 text-[#e50914]" />
                  )}
                  <span className="hidden sm:inline">{userName ? userName : "Entrar"}</span>
                </Link>
              </div>
            </div>

            {/* HERO BANNER (Height: 270px, Border-radius: 20px) */}
            <div className="mt-[20px] relative h-[270px] w-full shrink-0 overflow-hidden rounded-[20px] shadow-xl group">
              {/* Background Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1400&q=80"
                alt="Jumanji"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/80 via-transparent to-transparent" />

              {/* Text / Actions on Bottom Left */}
              <div className="absolute bottom-6 left-6 z-10 flex flex-col items-start gap-2">
                <h1 className="font-display text-4xl font-bold tracking-wider text-white drop-shadow-md">
                  JUMANJI
                </h1>
                <p className="text-xs font-medium tracking-wide text-white/70">
                  ACTION, ADVENTURE, COMEDY &nbsp;·&nbsp; <span className="text-emerald-400 font-semibold">94% Match</span>
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <Link
                    href="/filmes/jumanji"
                    className="flex items-center gap-2 rounded-full bg-[#e50914] px-5 py-2 text-xs font-bold text-white shadow-lg transition-transform active:scale-95 hover:bg-red-700"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" /> Watch
                  </Link>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20"
                    aria-label="Add to list"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* BEST ARTISTS */}
            <section className="mt-[38px] flex flex-col">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold tracking-wide text-white">Best Artists</h2>
                <div className="flex items-center gap-2">
                  <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Previous artist">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Next artist">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Cards horizontal single row */}
              <div className="mt-[18px] flex gap-4 overflow-x-auto no-scrollbar pb-1">
                {artists.map((artist) => (
                  <div
                    key={artist.id}
                    className="flex w-[120px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-white/5 bg-white/5 p-3 text-center transition-all hover:border-white/20 hover:bg-white/10"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="h-14 w-14 rounded-full object-cover shadow-md"
                    />
                    <span className="text-xs font-medium text-white/90 truncate w-full">
                      {artist.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* CONTINUE WATCHING */}
            <section className="mt-[38px] flex flex-col">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold tracking-wide text-white">Continue Watching</h2>
                <div className="flex items-center gap-2">
                  <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Previous watch item">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Next watch item">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Cards horizontal single row */}
              <div className="mt-[18px] flex gap-4 overflow-x-auto no-scrollbar pb-1">
                {continueWatching.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex w-[210px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition-all hover:border-white/20 hover:bg-white/10"
                  >
                    <div className="relative h-[110px] w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e50914] text-white shadow-lg">
                          <Play className="h-4 w-4 fill-white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col p-3">
                      <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                      <span className="text-[10px] text-white/50">{item.progress}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>

          {/* SIDEBAR DIREITA */}
          <aside className="flex h-full min-h-0 w-full flex-col border-l border-white/10 bg-[#09090b]/80 p-[35px] overflow-y-auto">
            
            {/* SEARCH */}
            <form action="/pesquisa" className="relative w-full">
              <input
                type="text"
                name="q"
                placeholder="Search..."
                className="h-[35px] w-full rounded-[20px] border border-white/10 bg-white/5 pl-9 pr-4 text-xs text-white placeholder:text-white/40 focus:border-[#e50914] focus:outline-none"
              />
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            </form>

            {/* POPULAR MOVIES */}
            <div className="mt-[30px] flex flex-col">
              <h3 className="text-xs font-bold tracking-wider text-white/90 uppercase">
                Popular Movies
              </h3>
              <div className="mt-4 flex flex-col gap-3">
                {popularMovies.map((movie) => (
                  <div key={movie.id} className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="h-[52px] w-[38px] rounded-lg object-cover shrink-0 shadow"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white truncate">{movie.title}</span>
                      <span className="text-[10px] text-white/50 truncate">{movie.genre}</span>
                      <div className="mt-0.5 flex items-center gap-1 text-[10px] text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span>{movie.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SEE MORE BUTTON */}
              <Link
                href="/filmes?status=NOW_SHOWING"
                className="mt-[18px] flex h-[34px] w-full items-center justify-center rounded-[8px] border border-white/10 bg-white/5 text-xs font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white"
              >
                See More
              </Link>
            </div>

            {/* FAVORITES */}
            <div className="mt-[30px] flex flex-col">
              <h3 className="text-xs font-bold tracking-wider text-white/90 uppercase">
                Favorites
              </h3>
              <div className="mt-4 flex flex-col gap-3">
                {favoriteMovies.map((movie) => (
                  <div key={movie.id} className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="h-[52px] w-[38px] rounded-lg object-cover shrink-0 shadow"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white truncate">{movie.title}</span>
                      <span className="text-[10px] text-white/50 truncate">{movie.genre}</span>
                      <div className="mt-0.5 flex items-center gap-1 text-[10px] text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span>{movie.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SEE MORE BUTTON */}
              <Link
                href="/conta/lista"
                className="mt-[18px] flex h-[34px] w-full items-center justify-center rounded-[8px] border border-white/10 bg-white/5 text-xs font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white"
              >
                See More
              </Link>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}
