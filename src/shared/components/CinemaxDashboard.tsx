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
  Flame,
  Award,
  Popcorn,
} from "lucide-react";
import { Logo } from "@/shared/components/Logo";
import { LocaleSwitch } from "@/shared/components/LocaleSwitch";
import { logoutAction } from "@/features/auth/actions";

type MovieCardItem = {
  id: string;
  slug?: string;
  title: string;
  genre: string;
  rating: string;
  posterUrl: string;
  backdropUrl?: string;
  releaseDate?: string;
  duration?: string;
  badge?: string;
};

type ArtistItem = {
  id: string;
  name: string;
  role?: string;
  avatarUrl: string;
};

type ContinueWatchingItem = {
  id: string;
  title: string;
  progress: string;
  imageUrl: string;
  episode?: string;
};

type ProductItem = {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
};

interface CinemaxDashboardProps {
  userName?: string | null;
  locale?: string;
  currency?: string;
  popularMovies?: MovieCardItem[];
  favoriteMovies?: MovieCardItem[];
  releases?: MovieCardItem[];
  comingSoon?: MovieCardItem[];
  series?: MovieCardItem[];
  artists?: ArtistItem[];
  continueWatching?: ContinueWatchingItem[];
  products?: ProductItem[];
}

const defaultReleases: MovieCardItem[] = [
  {
    id: "r1",
    slug: "dune-2",
    title: "Dune: Part Two",
    genre: "Sci-Fi · Aventura",
    rating: "IMDb 8.6",
    posterUrl: "/0030a0e8216496997f7abebc1b9f8837.jpg",
    badge: "IMAX 3D",
    releaseDate: "Em Exibição",
  },
  {
    id: "r2",
    slug: "avatar-3",
    title: "Avatar: Fire & Ash",
    genre: "Ação · Fantasia",
    rating: "IMDb 8.4",
    posterUrl: "/4d56548cd696aac3a0de41b63e15d535.jpg",
    badge: "ESTREIA DA SEMANA",
    releaseDate: "Sexta-feira",
  },
  {
    id: "r3",
    slug: "oppenheimer",
    title: "Oppenheimer",
    genre: "Biografia · Drama",
    rating: "IMDb 8.9",
    posterUrl: "/66bd9b1f8354a9aa6900dee35bc2a911.jpg",
    badge: "Vencedor de Oscar",
    releaseDate: "Em Exibição",
  },
  {
    id: "r4",
    slug: "spider-man",
    title: "Spider-Man: Beyond Spider-Verse",
    genre: "Animação · Ação",
    rating: "IMDb 8.8",
    posterUrl: "/fb40a0f422e55b5d0a4586abea633d28.jpg",
    badge: "4DX ATMOS",
    releaseDate: "Em Breve",
  },
];

const defaultSeries: MovieCardItem[] = [
  {
    id: "s1",
    slug: "the-last-of-us",
    title: "The Last of Us: Temporada 2",
    genre: "Drama · Sobrevivência",
    rating: "IMDb 8.8",
    posterUrl: "/movie-poster-design-template_841014-16989.avif",
    badge: "CINEMAX+ ORIGINAL",
    duration: "9 Episódios",
  },
  {
    id: "s2",
    slug: "house-of-dragon",
    title: "House of the Dragon",
    genre: "Fantasia · Ação",
    rating: "IMDb 8.5",
    posterUrl: "/modelo-de-design-de-poster-de-filme_841014-16988.avif",
    badge: "TOP 1 ANGOLA",
    duration: "10 Episódios",
  },
  {
    id: "s3",
    slug: "stranger-things",
    title: "Stranger Things: Temporada Final",
    genre: "Ficção · Terror",
    rating: "IMDb 8.7",
    posterUrl: "/cc02e351dccb005fe40e5b5d50ab2c55.jpg",
    badge: "NOVA TEMPORADA",
    duration: "8 Episódios",
  },
];

const defaultPopular: MovieCardItem[] = [
  {
    id: "1",
    title: "John Wick: Capítulo 4",
    genre: "Action, Crime",
    rating: "IMDb 7.8",
    posterUrl: "/OIP (7).webp",
  },
  {
    id: "2",
    title: "Avatar: O Caminho da Água",
    genre: "Sci-Fi, Adventure",
    rating: "IMDb 7.8",
    posterUrl: "/OIP (8).webp",
  },
  {
    id: "3",
    title: "Interstellar",
    genre: "Sci-Fi, Drama",
    rating: "IMDb 8.6",
    posterUrl: "/OIP (9).webp",
  },
];

const defaultFavorites: MovieCardItem[] = [
  {
    id: "4",
    title: "O Cavaleiro das Trevas",
    genre: "Action, Crime",
    rating: "IMDb 9.0",
    posterUrl: "/cb99b8b3aac2684d9260778c107071fd.jpg",
  },
  {
    id: "5",
    title: "Inception",
    genre: "Action, Sci-Fi",
    rating: "IMDb 8.8",
    posterUrl: "/0030a0e8216496997f7abebc1b9f8837.jpg",
  },
  {
    id: "6",
    title: "Gladiador II",
    genre: "Ação, História",
    rating: "IMDb 8.2",
    posterUrl: "/4d56548cd696aac3a0de41b63e15d535.jpg",
  },
];

const defaultArtists: ArtistItem[] = [
  { id: "a1", name: "Keanu Reeves", role: "Ator Principal", avatarUrl: "/OIP.webp" },
  { id: "a2", name: "Zendaya", role: "Protagonista", avatarUrl: "/OIP (1).webp" },
  { id: "a3", name: "Timothée Chalamet", role: "Ator Principal", avatarUrl: "/OIP (2).webp" },
  { id: "a4", name: "Florence Pugh", role: "Atriz Principal", avatarUrl: "/OIP (3).webp" },
];

const defaultContinue: ContinueWatchingItem[] = [
  {
    id: "c1",
    title: "Stranger Things S4",
    episode: "Episódio 7 · O Massacre no Laboratório",
    progress: "Faltam 45m",
    imageUrl: "/OIP (4).webp",
  },
  {
    id: "c2",
    title: "The Last of Us",
    episode: "Episódio 4 · Por Favor, Segura a Minha Mão",
    progress: "Faltam 12m",
    imageUrl: "/OIP (5).webp",
  },
  {
    id: "c3",
    title: "House of the Dragon",
    episode: "Episódio 10 · A Rainha Preta",
    progress: "Faltam 28m",
    imageUrl: "/OIP (6).webp",
  },
];

const defaultProducts: ProductItem[] = [
  { id: "p1", name: "Combo Pipoca Grande + Bebida 1L", price: "4.500 Kz", imageUrl: "/OIP (8).webp" },
  { id: "p2", name: "Óculos 3D CINEMAX RealD", price: "1.200 Kz", imageUrl: "/OIP (9).webp" },
  { id: "p3", name: "Menu VIP Nachos + Molho Cheddar", price: "3.800 Kz", imageUrl: "/cb99b8b3aac2684d9260778c107071fd.jpg" },
];

export function CinemaxDashboard({
  userName,
  locale = "pt",
  currency = "AOA",
  popularMovies = defaultPopular,
  favoriteMovies = defaultFavorites,
  releases = defaultReleases,
  series = defaultSeries,
  artists = defaultArtists,
  continueWatching = defaultContinue,
  products = defaultProducts,
}: CinemaxDashboardProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<"TV Series" | "Movies" | "Animes">("Movies");

  const activeReleases = releases && releases.length > 0 ? releases : defaultReleases;
  const activeSeries = series && series.length > 0 ? series : defaultSeries;
  const activePopular = popularMovies && popularMovies.length > 0 ? popularMovies : defaultPopular;
  const activeFavorites = favoriteMovies && favoriteMovies.length > 0 ? favoriteMovies : defaultFavorites;
  const activeArtists = artists && artists.length > 0 ? artists : defaultArtists;
  const activeContinue = continueWatching && continueWatching.length > 0 ? continueWatching : defaultContinue;
  const activeProducts = products && products.length > 0 ? products : defaultProducts;

  const menuSections = [
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
            <div className="mt-[45px] ml-[45px] mb-4 shrink-0">
              <Logo />
            </div>

            {/* CARTÃO DO UTILIZADOR LOGADO */}
            {userName ? (
              <div className="mx-3 mb-4 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 shrink-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e50914] font-bold text-xs text-white uppercase shadow">
                  {userName.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">{userName}</span>
                  <span className="text-[10px] font-medium text-emerald-400">Sessão Ativa</span>
                </div>
              </div>
            ) : null}

            {/* MENU ESQUERDO ORGANIZADO E ROLÁVEL (APENAS EXPLORAR, LOJA & GERAL) */}
            <div className="mt-4 flex flex-1 min-h-0 flex-col gap-6 overflow-y-auto px-3 pb-8">
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
          <main className="flex h-full min-h-0 flex-col overflow-hidden">
            
            {/* TOP NAVIGATION HEADER (FIXO NO TOPO DO CONTEÚDO CENTRAL - NUNCA QUEBRA AO ROLAR) */}
            <div className="shrink-0 z-20 px-[44px] py-4 bg-[#0d0e12] border-b border-white/10 flex items-center justify-between gap-4 shadow-md">
              <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar shrink">
                {[
                  { label: "Home", href: "/" },
                  { label: "Filmes", href: "/filmes" },
                  { label: "Séries", href: "/series" },
                  { label: "Lançamentos", href: "/lancamentos" },
                  { label: "Estreias", href: "/estreias" },
                ].map((item) => {
                  const isSelected = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`whitespace-nowrap shrink-0 text-xs md:text-sm font-semibold transition-all ${
                        isSelected
                          ? "text-[#e50914] border-b-2 border-[#e50914] pb-1 font-bold"
                          : "text-white/60 hover:text-white pb-1"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* LADO DIREITO DA NAVEGAÇÃO */}
              <div className="flex items-center gap-3 shrink-0">
                <LocaleSwitch locale={locale} currency={currency} />
                <Link
                  href={userName ? "/conta" : "/entrar"}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 hover:text-white shrink-0"
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

            {/* ÁREA DE CONTEÚDO ROLÁVEL ABAIXO DO HEADER FIXO */}
            <div className="flex-1 min-h-0 overflow-y-auto px-[44px] pt-4 pb-8 no-scrollbar">

              {/* HERO BANNER - CINEMAX EXPERIÊNCIA & DESTAQUE */}
            <div className="mt-[20px] relative h-[270px] w-full shrink-0 overflow-hidden rounded-[20px] shadow-xl group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/de48494bb12ff31cff7a404811c507dd.jpg"
                alt="CINEMAX"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/90 via-[#09090b]/40 to-transparent" />

              <div className="absolute bottom-6 left-6 z-10 flex flex-col items-start gap-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#e50914] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    CINEMAX REVOLUTION
                  </span>
                  <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
                    IMAX 3D & 4DX
                  </span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wider text-white drop-shadow-md">
                  JUMANJI: O PRÓXIMO NÍVEL
                </h1>
                <p className="text-xs font-normal leading-relaxed text-white/80 line-clamp-2">
                  Vivencie a experiência cinematográfica do CINEMAX: bilheteira online em tempo real, escolha de lugares VIP, som espacial Dolby Atmos e catálogo exclusivo CINEMAX+.
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <Link
                    href="/sessoes"
                    className="flex items-center gap-2 rounded-full bg-[#e50914] px-5 py-2 text-xs font-bold text-white shadow-lg transition-transform active:scale-95 hover:bg-red-700"
                  >
                    <Ticket className="h-3.5 w-3.5" /> Comprar Bilhete
                  </Link>
                  <Link
                    href="/filmes"
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" /> Ver Trailer
                  </Link>
                </div>
              </div>
            </div>

            {/* SEÇÃO 1: NOVOS LANÇAMENTOS E ESTREIAS NO CINEMA */}
            <section className="mt-[36px] flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold tracking-wide text-white flex items-center gap-2">
                    <Flame className="h-4 w-4 text-[#e50914]" /> Novos Lançamentos & Estreias
                  </h2>
                  <p className="text-[11px] text-white/50">Os filmes mais aguardados nas nossas salas de cinema</p>
                </div>
                <Link href="/lancamentos" className="text-xs font-medium text-[#e50914] hover:underline flex items-center gap-1">
                  Ver Todos <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Grid de Cards de Lançamentos */}
              <div className="mt-[16px] grid grid-cols-2 sm:grid-cols-4 gap-4">
                {activeReleases.slice(0, 4).map((movie, idx) => {
                  const fallbackImgs = [
                    "/0030a0e8216496997f7abebc1b9f8837.jpg",
                    "/4d56548cd696aac3a0de41b63e15d535.jpg",
                    "/66bd9b1f8354a9aa6900dee35bc2a911.jpg",
                    "/fb40a0f422e55b5d0a4586abea633d28.jpg",
                  ];
                  const imgSrc = (movie.posterUrl && !movie.posterUrl.endsWith(".svg")) ? movie.posterUrl : fallbackImgs[idx % fallbackImgs.length];
                  return (
                    <Link
                      key={movie.id}
                      href={`/filmes/${movie.slug || movie.id}`}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition-all hover:border-white/20 hover:bg-white/10"
                    >
                      <div className="relative h-[180px] w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgSrc}
                          alt={movie.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {movie.badge ? (
                          <span className="absolute top-2 left-2 rounded-md bg-[#e50914] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
                            {movie.badge}
                          </span>
                        ) : null}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="rounded-full bg-[#e50914] px-3 py-1.5 text-xs font-bold text-white shadow-lg flex items-center gap-1.5">
                            <Ticket className="h-3.5 w-3.5" /> Bilhete
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col p-3">
                        <span className="text-xs font-semibold text-white truncate">{movie.title}</span>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-white/50">
                          <span>{movie.genre}</span>
                          <span className="font-semibold text-amber-400">{movie.rating}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* SEÇÃO 2: SÉRIES & STREAMING EXCLUSIVO CINEMAX+ */}
            <section className="mt-[36px] flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold tracking-wide text-white flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-[#e50914]" /> Séries Em Destaque no CINEMAX+
                  </h2>
                  <p className="text-[11px] text-white/50">Assista onde quiser com a subscrição CINEMAX+</p>
                </div>
                <Link href="/series" className="text-xs font-medium text-[#e50914] hover:underline flex items-center gap-1">
                  Explorar Séries <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Cards de Séries com Imagens Locais */}
              <div className="mt-[16px] grid grid-cols-1 sm:grid-cols-3 gap-4">
                {activeSeries.slice(0, 3).map((item, idx) => {
                  const fallbackSeriesImgs = [
                    "/movie-poster-design-template_841014-16989.avif",
                    "/modelo-de-design-de-poster-de-filme_841014-16988.avif",
                    "/cc02e351dccb005fe40e5b5d50ab2c55.jpg",
                  ];
                  const imgSrc = (item.posterUrl && !item.posterUrl.endsWith(".svg")) ? item.posterUrl : fallbackSeriesImgs[idx % fallbackSeriesImgs.length];
                  return (
                    <Link
                      key={item.id}
                      href={`/series`}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition-all hover:border-white/20 hover:bg-white/10"
                    >
                      <div className="relative h-[120px] w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgSrc}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
                        {item.badge ? (
                          <span className="absolute top-2 left-2 rounded-md bg-white/20 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[9px] font-semibold text-white">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-col p-3">
                        <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-white/50">
                          <span>{item.genre}</span>
                          <span>{item.duration || "Nova Temporada"}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* SEÇÃO 3: BEST ARTISTS */}
            <section className="mt-[36px] flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold tracking-wide text-white flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-400" /> Melhores Artistas & Elenco
                  </h2>
                  <p className="text-[11px] text-white/50">Estrelas do cinema em destaque nesta temporada</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Previous artist">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Next artist">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Cards horizontal single row com Imagens Locais */}
              <div className="mt-[16px] flex gap-4 overflow-x-auto no-scrollbar pb-1">
                {activeArtists.map((artist, idx) => {
                  const fallbackArtistImgs = ["/OIP.webp", "/OIP (1).webp", "/OIP (2).webp", "/OIP (3).webp"];
                  const imgSrc = (artist.avatarUrl && !artist.avatarUrl.endsWith(".svg")) ? artist.avatarUrl : fallbackArtistImgs[idx % fallbackArtistImgs.length];
                  return (
                    <div
                      key={artist.id}
                      className="flex w-[125px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-white/5 bg-white/5 p-3 text-center transition-all hover:border-white/20 hover:bg-white/10"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgSrc}
                        alt={artist.name}
                        className="h-14 w-14 rounded-full object-cover shadow-md border border-white/10"
                      />
                      <span className="text-xs font-semibold text-white/90 truncate w-full">
                        {artist.name}
                      </span>
                      <span className="text-[10px] text-white/40 truncate w-full">
                        {artist.role || "Elenco"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SEÇÃO 4: CONTINUE WATCHING */}
            <section className="mt-[36px] flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold tracking-wide text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#e50914]" /> Continue Watching
                  </h2>
                  <p className="text-[11px] text-white/50">Retome a reprodução exatamente de onde parou</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Previous watch item">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Next watch item">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Cards horizontal single row com Imagens Locais */}
              <div className="mt-[16px] flex gap-4 overflow-x-auto no-scrollbar pb-1">
                {activeContinue.map((item, idx) => {
                  const fallbackWatchImgs = ["/OIP (4).webp", "/OIP (5).webp", "/OIP (6).webp"];
                  const imgSrc = (item.imageUrl && !item.imageUrl.endsWith(".svg")) ? item.imageUrl : fallbackWatchImgs[idx % fallbackWatchImgs.length];
                  return (
                    <div
                      key={item.id}
                      className="group relative flex w-[220px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition-all hover:border-white/20 hover:bg-white/10"
                    >
                      <div className="relative h-[115px] w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgSrc}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e50914] text-white shadow-lg">
                            <Play className="h-4 w-4 fill-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                          <div className="h-full bg-[#e50914] w-[65%]" />
                        </div>
                      </div>
                      <div className="flex flex-col p-3">
                        <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                        <span className="text-[10px] text-white/50 truncate">{item.episode || item.progress}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SEÇÃO 5: EXTRA PIPOCAS & LOJA CINEMAX */}
            <section className="mt-[36px] flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold tracking-wide text-white flex items-center gap-2">
                    <Popcorn className="h-4 w-4 text-amber-400" /> Conveniência & Extras do Bar
                  </h2>
                  <p className="text-[11px] text-white/50">Compre pipocas, bebidas e snacks junto com o seu bilhete</p>
                </div>
                <Link href="/loja" className="text-xs font-medium text-[#e50914] hover:underline flex items-center gap-1">
                  Ver Loja <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-[16px] grid grid-cols-1 sm:grid-cols-3 gap-4">
                {activeProducts.map((prod, idx) => {
                  const fallbackProductImgs = ["/OIP (8).webp", "/OIP (9).webp", "/cb99b8b3aac2684d9260778c107071fd.jpg"];
                  const imgSrc = (prod.imageUrl && !prod.imageUrl.endsWith(".svg")) ? prod.imageUrl : fallbackProductImgs[idx % fallbackProductImgs.length];
                  return (
                    <Link
                      key={prod.id}
                      href="/loja"
                      className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 transition-all hover:border-white/20 hover:bg-white/10"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgSrc}
                        alt={prod.name}
                        className="h-14 w-14 rounded-xl object-cover shrink-0 shadow"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-white truncate">{prod.name}</span>
                        <span className="text-xs font-bold text-amber-400 mt-1">{prod.price}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
            </div>

          </main>

          {/* SIDEBAR DIREITA com Imagens Locais */}
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
                {activePopular.map((movie, idx) => {
                  const fallbackPop = ["/OIP (7).webp", "/OIP (8).webp", "/OIP (9).webp"];
                  const imgSrc = (movie.posterUrl && !movie.posterUrl.endsWith(".svg")) ? movie.posterUrl : fallbackPop[idx % fallbackPop.length];
                  return (
                    <div key={movie.id} className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgSrc}
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
                  );
                })}
              </div>

              {/* SEE MORE BUTTON */}
              <Link
                href="/filmes?status=NOW_SHOWING"
                className="mt-[18px] flex h-[34px] w-full items-center justify-center rounded-[8px] border border-white/10 bg-white/5 text-xs font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white"
              >
                Ver Mais
              </Link>
            </div>

            {/* FAVORITES */}
            <div className="mt-[30px] flex flex-col">
              <h3 className="text-xs font-bold tracking-wider text-white/90 uppercase">
                Favorites
              </h3>
              <div className="mt-4 flex flex-col gap-3">
                {activeFavorites.map((movie, idx) => {
                  const fallbackFav = ["/cb99b8b3aac2684d9260778c107071fd.jpg", "/0030a0e8216496997f7abebc1b9f8837.jpg", "/4d56548cd696aac3a0de41b63e15d535.jpg"];
                  const imgSrc = (movie.posterUrl && !movie.posterUrl.endsWith(".svg")) ? movie.posterUrl : fallbackFav[idx % fallbackFav.length];
                  return (
                    <div key={movie.id} className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgSrc}
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
                  );
                })}
              </div>

              {/* SEE MORE BUTTON */}
              <Link
                href="/conta/lista"
                className="mt-[18px] flex h-[34px] w-full items-center justify-center rounded-[8px] border border-white/10 bg-white/5 text-xs font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white"
              >
                Ver Mais
              </Link>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}
