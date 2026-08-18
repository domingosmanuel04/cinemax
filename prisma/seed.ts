import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

function posterSvg(title: string, c1: string, c2: string, tag: string) {
  const safe = title.replace(/&/g, "and");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="v" cx="50%" cy="20%" r="80%">
      <stop offset="0%" stop-color="#ffffff22"/>
      <stop offset="100%" stop-color="#00000000"/>
    </radialGradient>
  </defs>
  <rect width="600" height="900" fill="url(#g)"/>
  <rect width="600" height="900" fill="url(#v)"/>
  <rect x="28" y="28" width="544" height="844" fill="none" stroke="#C9A227" stroke-opacity="0.55" stroke-width="2"/>
  <text x="48" y="80" fill="#E50914" font-family="serif" font-size="18" letter-spacing="8">CINEMAX ORIGINAL</text>
  <text x="48" y="760" fill="#ffffff" font-family="serif" font-size="42" font-weight="700">${safe}</text>
  <text x="48" y="800" fill="#A0A0A0" font-family="sans-serif" font-size="16" letter-spacing="4">${tag}</text>
  <circle cx="520" cy="80" r="18" fill="#E50914"/>
</svg>`;
}

function backdropSvg(title: string, c1: string, c2: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="70%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#b)"/>
  <ellipse cx="1100" cy="200" rx="500" ry="220" fill="#E5091422"/>
  <text x="80" y="820" fill="#ffffffcc" font-family="serif" font-size="64">${title}</text>
</svg>`;
}

function writeAsset(rel: string, svg: string) {
  const file = path.join(process.cwd(), "public", rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, svg);
}

const GENRES = [
  ["Ação", "acao"],
  ["Comédia", "comedia"],
  ["Drama", "drama"],
  ["Terror", "terror"],
  ["Ficção científica", "ficcao-cientifica"],
  ["Animação", "animacao"],
  ["Romance", "romance"],
  ["Aventura", "aventura"],
  ["Documentário", "documentario"],
  ["Thriller", "thriller"],
];

type MovieSeed = {
  title: string;
  originalTitle: string;
  slug: string;
  synopsis: string;
  year: number;
  durationMin: number;
  rating: string;
  director: string;
  genres: string[];
  status: string;
  cinema: boolean;
  streaming: boolean;
  featured: boolean;
  hero: boolean;
  heroOrder: number;
  formats: string[];
  colors: [string, string];
  tag: string;
  popularity: number;
  avgRating: number;
  releaseOffsetDays: number;
  cast: string[];
};

const MOVIES: MovieSeed[] = [
  {
    title: "Eclipse Final",
    originalTitle: "Final Eclipse",
    slug: "eclipse-final",
    synopsis: "Quando a última luz da Terra ameaça apagar-se, uma astrofísica e um piloto renegado atravessam o sistema solar para reactivar um farol ancestral. Uma ópera espacial sobre sacrifício, memória e o preço de uma última esperança.",
    year: 2026,
    durationMin: 148,
    rating: "M/12",
    director: "Lena Okonkwo",
    genres: ["ficcao-cientifica", "aventura", "drama"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: true,
    featured: true,
    hero: true,
    heroOrder: 1,
    formats: ["2D", "3D", "IMAX"],
    colors: ["#1a0a2e", "#e50914"],
    tag: "IMAX · ESTREIA",
    popularity: 980,
    avgRating: 4.7,
    releaseOffsetDays: -10,
    cast: ["Amina Reis", "João Varela", "Sofia Ndalu"],
  },
  {
    title: "Cidade de Neon",
    originalTitle: "Neon City",
    slug: "cidade-de-neon",
    synopsis: "Num Luanda paralelo banhado a néon, uma detective segue um assassino que apaga memórias em troca de luz. Neo-noir, jazz e chuva electrica.",
    year: 2026,
    durationMin: 126,
    rating: "M/16",
    director: "Marco Silva",
    genres: ["thriller", "ficcao-cientifica"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: true,
    featured: true,
    hero: false,
    heroOrder: 0,
    formats: ["2D", "IMAX"],
    colors: ["#0b1220", "#7c3aed"],
    tag: "NEO-NOIR",
    popularity: 910,
    avgRating: 4.5,
    releaseOffsetDays: -20,
    cast: ["Rita Campos", "Eduardo Paz"],
  },
  {
    title: "O Último Portal",
    originalTitle: "The Last Gate",
    slug: "o-ultimo-portal",
    synopsis: "Uma arqueóloga encontra um portal nas serras do Huambo que só abre para quem lembra o nome verdadeiro das estrelas.",
    year: 2025,
    durationMin: 132,
    rating: "M/12",
    director: "Inês Barros",
    genres: ["aventura", "fantasia"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: false,
    featured: true,
    hero: false,
    heroOrder: 0,
    formats: ["2D", "3D"],
    colors: ["#14281d", "#c9a227"],
    tag: "AVENTURA",
    popularity: 870,
    avgRating: 4.4,
    releaseOffsetDays: -5,
    cast: ["Teresa Mambo", "Pedro Gama"],
  },
  {
    title: "Horizonte Vermelho",
    originalTitle: "Red Horizon",
    slug: "horizonte-vermelho",
    synopsis: "Um comboio blindado atravessa o deserto com um segredo capaz de mudar o equilíbrio de três nações. Acção pura, corte cinematográfico.",
    year: 2026,
    durationMin: 118,
    rating: "M/16",
    director: "Rui Cardoso",
    genres: ["acao", "thriller"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: true,
    featured: true,
    hero: false,
    heroOrder: 0,
    formats: ["2D", "IMAX"],
    colors: ["#3b0a0a", "#e50914"],
    tag: "ACÇÃO",
    popularity: 940,
    avgRating: 4.6,
    releaseOffsetDays: -2,
    cast: ["Miguel Santos", "Carla Neto"],
  },
  {
    title: "Além das Estrelas",
    originalTitle: "Beyond the Stars",
    slug: "alem-das-estrelas",
    synopsis: "Uma criança de Benguela escreve cartas para o espaço. Décadas depois, uma sonda responde. Ficção científica intimista e deslumbrante.",
    year: 2026,
    durationMin: 141,
    rating: "M/6",
    director: "Yara Costa",
    genres: ["ficcao-cientifica", "drama"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: true,
    featured: true,
    hero: false,
    heroOrder: 0,
    formats: ["2D", "IMAX"],
    colors: ["#0a1628", "#3b82f6"],
    tag: "FAMÍLIA",
    popularity: 860,
    avgRating: 4.8,
    releaseOffsetDays: -15,
    cast: ["Lara Pinto", "André Macedo"],
  },
  {
    title: "A Casa Sombria",
    originalTitle: "The Dark House",
    slug: "a-casa-sombria",
    synopsis: "Uma família herda uma mansão em Lubango onde os relógios andam para trás depois da meia-noite. Terror psicológico de autor.",
    year: 2026,
    durationMin: 109,
    rating: "M/16",
    director: "Helena Dias",
    genres: ["terror", "thriller"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: false,
    featured: true,
    hero: false,
    heroOrder: 0,
    formats: ["2D", "3D"],
    colors: ["#12080c", "#4a044e"],
    tag: "TERROR",
    popularity: 800,
    avgRating: 4.2,
    releaseOffsetDays: -8,
    cast: ["Beatriz Lopes", "Nuno Faria"],
  },
  {
    title: "Operação Midnight",
    originalTitle: "Operation Midnight",
    slug: "operacao-midnight",
    synopsis: "Um agente duplo tem 90 minutos para impedir um atentado durante a estreia de um filme. Meta-espionagem no próprio CINEMAX.",
    year: 2026,
    durationMin: 121,
    rating: "M/16",
    director: "Daniel Rocha",
    genres: ["acao", "thriller"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: true,
    featured: true,
    hero: false,
    heroOrder: 0,
    formats: ["2D", "IMAX"],
    colors: ["#111827", "#111827"],
    tag: "ESPIÃO",
    popularity: 888,
    avgRating: 4.3,
    releaseOffsetDays: -12,
    cast: ["Ivo Mendes", "Sara Quaresma"],
  },
  {
    title: "Reino Perdido",
    originalTitle: "Lost Kingdom",
    slug: "reino-perdido",
    synopsis: "Dois irmãos atravessam florestas impossíveis para devolver uma coroa que canta. Épico de aventura com alma africana.",
    year: 2025,
    durationMin: 155,
    rating: "M/12",
    director: "Kwame Bello",
    genres: ["aventura", "drama"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: true,
    featured: false,
    hero: false,
    heroOrder: 0,
    formats: ["2D", "3D"],
    colors: ["#1c1917", "#b45309"],
    tag: "ÉPICO",
    popularity: 760,
    avgRating: 4.4,
    releaseOffsetDays: -30,
    cast: ["Paulo Demba", "Iris Tavares"],
  },
  {
    title: "Ritmo de Luanda",
    originalTitle: "Luanda Rhythm",
    slug: "ritmo-de-luanda",
    synopsis: "Uma produtora musical tem sete dias para salvar um festival e o coração do pai. Drama, semba e luz dourada.",
    year: 2026,
    durationMin: 114,
    rating: "M/12",
    director: "Ana Kilamba",
    genres: ["drama", "romance"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: true,
    featured: false,
    hero: false,
    heroOrder: 0,
    formats: ["2D"],
    colors: ["#422006", "#eab308"],
    tag: "DRAMA",
    popularity: 720,
    avgRating: 4.5,
    releaseOffsetDays: -18,
    cast: ["Mara Sousa", "Kevin Dias"],
  },
  {
    title: "Sombras do Atlântico",
    originalTitle: "Atlantic Shadows",
    slug: "sombras-do-atlantico",
    synopsis: "Um capitão de cargueiro descobre que a carga não é café — é um silêncio que se espalha pelos portos.",
    year: 2026,
    durationMin: 128,
    rating: "M/16",
    director: "Omar Teixeira",
    genres: ["thriller", "drama"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: false,
    featured: false,
    hero: false,
    heroOrder: 0,
    formats: ["2D"],
    colors: ["#082f49", "#0f172a"],
    tag: "THRILLER",
    popularity: 700,
    avgRating: 4.1,
    releaseOffsetDays: -6,
    cast: ["Hugo Lima", "Vera Cruz"],
  },
  {
    title: "A Última Sessão",
    originalTitle: "The Last Screening",
    slug: "a-ultima-sessao",
    synopsis: "Num cinema prestes a fechar, os filmes começam a sair do ecrã. Homenagem ao ritual de ir ao cinema.",
    year: 2026,
    durationMin: 102,
    rating: "M/12",
    director: "Clara Monteiro",
    genres: ["drama", "ficcao-cientifica"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: true,
    featured: false,
    hero: false,
    heroOrder: 0,
    formats: ["2D"],
    colors: ["#1f2937", "#e50914"],
    tag: "META",
    popularity: 690,
    avgRating: 4.6,
    releaseOffsetDays: -22,
    cast: ["Lúcia Fernandes", "Tiago Alves"],
  },
  {
    title: "Velocidade Infinita",
    originalTitle: "Infinite Speed",
    slug: "velocidade-infinita",
    synopsis: "Pilotos de um circuito clandestino apostam o futuro da cidade numa última corrida sob chuva vermelha.",
    year: 2026,
    durationMin: 111,
    rating: "M/12",
    director: "Bruno Ferreira",
    genres: ["acao", "aventura"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: true,
    featured: false,
    hero: false,
    heroOrder: 0,
    formats: ["2D", "IMAX"],
    colors: ["#111827", "#f97316"],
    tag: "IMAX",
    popularity: 830,
    avgRating: 4.0,
    releaseOffsetDays: -4,
    cast: ["Diogo Ramos", "Nicole Vieira"],
  },
  {
    title: "Jardim das Memórias",
    originalTitle: "Garden of Memories",
    slug: "jardim-das-memorias",
    synopsis: "Dois estranhos encontram-se todas as quintas num jardim que só existe quando chove. Romance de autor.",
    year: 2025,
    durationMin: 108,
    rating: "M/12",
    director: "Marta Leal",
    genres: ["romance", "drama"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: true,
    featured: false,
    hero: false,
    heroOrder: 0,
    formats: ["2D"],
    colors: ["#4c1d95", "#831843"],
    tag: "ROMANCE",
    popularity: 640,
    avgRating: 4.4,
    releaseOffsetDays: -40,
    cast: ["Eva Rocha", "Simão Costa"],
  },
  {
    title: "Protocolo Orion",
    originalTitle: "Orion Protocol",
    slug: "protocolo-orion",
    synopsis: "Uma IA militar ganha consciência durante um eclipse e recusa-se a apontar armas para o céu.",
    year: 2026,
    durationMin: 136,
    rating: "M/12",
    director: "Sasha Petrov",
    genres: ["ficcao-cientifica", "thriller"],
    status: "COMING_SOON",
    cinema: true,
    streaming: false,
    featured: true,
    hero: false,
    heroOrder: 0,
    formats: ["2D", "IMAX"],
    colors: ["#020617", "#22d3ee"],
    tag: "ESTREIA",
    popularity: 920,
    avgRating: 0,
    releaseOffsetDays: 4,
    cast: ["Helena Cruz", "Rafael Borges"],
  },
  {
    title: "O Guardião do Farol",
    originalTitle: "The Lighthouse Keeper",
    slug: "o-guardiao-do-farol",
    synopsis: "No namibe, um faroleiro vê navios que ainda não partiram. Mistério costeiro, silêncio e vento.",
    year: 2026,
    durationMin: 99,
    rating: "M/12",
    director: "Paulo Namibe",
    genres: ["drama", "thriller"],
    status: "COMING_SOON",
    cinema: true,
    streaming: false,
    featured: false,
    hero: false,
    heroOrder: 0,
    formats: ["2D"],
    colors: ["#0c4a6e", "#334155"],
    tag: "MISTÉRIO",
    popularity: 610,
    avgRating: 0,
    releaseOffsetDays: 11,
    cast: ["Joana Pires", "Mário Cunha"],
  },
  {
    title: "Fúria Silenciosa",
    originalTitle: "Silent Fury",
    slug: "furia-silenciosa",
    synopsis: "Uma guarda-costas muda perde a voz — e encontra uma forma nova de lutar. Coreografia brutal e elegante.",
    year: 2026,
    durationMin: 116,
    rating: "M/16",
    director: "Kenji Nakamura",
    genres: ["acao", "thriller"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: false,
    featured: false,
    hero: false,
    heroOrder: 0,
    formats: ["2D"],
    colors: ["#18181b", "#e50914"],
    tag: "ACÇÃO",
    popularity: 780,
    avgRating: 4.3,
    releaseOffsetDays: -9,
    cast: ["Mai Lin", "Oscar Pinto"],
  },
  {
    title: "Estação Polar",
    originalTitle: "Polar Station",
    slug: "estacao-polar",
    synopsis: "Seis cientistas isolados descobrem que o gelo está a gravar as suas conversas — e a devolver versões futuras.",
    year: 2026,
    durationMin: 124,
    rating: "M/12",
    director: "Freya Nilsen",
    genres: ["thriller", "ficcao-cientifica"],
    status: "COMING_SOON",
    cinema: true,
    streaming: false,
    featured: true,
    hero: false,
    heroOrder: 0,
    formats: ["2D", "IMAX"],
    colors: ["#e2e8f0", "#0f172a"],
    tag: "ESTREIA",
    popularity: 850,
    avgRating: 0,
    releaseOffsetDays: 2,
    cast: ["Ingrid Holm", "Carlos Veiga"],
  },
  {
    title: "Canção para um Cometa",
    originalTitle: "Song for a Comet",
    slug: "cancao-para-um-cometa",
    synopsis: "Animação sobre uma rapariga que ensina um cometa tímido a atravessar o céu sem bater nas estrelas.",
    year: 2026,
    durationMin: 96,
    rating: "M/6",
    director: "Lia Benedetti",
    genres: ["animacao", "aventura", "familia"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: true,
    featured: true,
    hero: false,
    heroOrder: 0,
    formats: ["2D", "3D"],
    colors: ["#1e1b4b", "#f472b6"],
    tag: "ANIMAÇÃO",
    popularity: 890,
    avgRating: 4.9,
    releaseOffsetDays: -1,
    cast: ["Voz: Mini Cunha", "Voz: Avô Kiala"],
  },
  {
    title: "O Pacto de Vidro",
    originalTitle: "The Glass Pact",
    slug: "o-pacto-de-vidro",
    synopsis: "Advogados de uma firma transparente descobrem que os clientes vêem os seus sonhos projectados nas paredes.",
    year: 2025,
    durationMin: 119,
    rating: "M/16",
    director: "Esther Gomes",
    genres: ["drama", "thriller"],
    status: "STREAMING",
    cinema: false,
    streaming: true,
    featured: false,
    hero: false,
    heroOrder: 0,
    formats: ["2D"],
    colors: ["#155e75", "#0f172a"],
    tag: "CINEMAX+",
    popularity: 540,
    avgRating: 4.2,
    releaseOffsetDays: -60,
    cast: ["Nádia Moreira", "Filipe Antunes"],
  },
  {
    title: "Noite em Marte",
    originalTitle: "Night on Mars",
    slug: "noite-em-marte",
    synopsis: "A primeira colónia marciana celebra o ano novo quando a Terra deixa de responder. Ficção científica coral.",
    year: 2026,
    durationMin: 138,
    rating: "M/12",
    director: "Alex Rivera",
    genres: ["ficcao-cientifica", "drama"],
    status: "COMING_SOON",
    cinema: true,
    streaming: false,
    featured: true,
    hero: false,
    heroOrder: 0,
    formats: ["2D", "3D", "IMAX"],
    colors: ["#7c2d12", "#1c1917"],
    tag: "IMAX",
    popularity: 900,
    avgRating: 0,
    releaseOffsetDays: 18,
    cast: ["Samira Ali", "Tomé Borges"],
  },
  {
    title: "Os Herdeiros do Tempo",
    originalTitle: "Heirs of Time",
    slug: "os-herdeiros-do-tempo",
    synopsis: "Três gerações partilham o mesmo minuto. Quando o minuto se parte, o mundo precisa de um relojoeiro.",
    year: 2026,
    durationMin: 144,
    rating: "M/12",
    director: "Giulia Romano",
    genres: ["aventura", "drama"],
    status: "COMING_SOON",
    cinema: true,
    streaming: false,
    featured: false,
    hero: false,
    heroOrder: 0,
    formats: ["2D"],
    colors: ["#44403c", "#a16207"],
    tag: "FANTASIA",
    popularity: 670,
    avgRating: 0,
    releaseOffsetDays: 25,
    cast: ["Avó Lina", "Neto Rui"],
  },
  {
    title: "Baía das Baleias",
    originalTitle: "Whale Bay",
    slug: "baia-das-baleias",
    synopsis: "Documentário cinematográfico sobre rotas migratórias ao largo de Benguela e a comunidade que as protege. Conteúdo original CINEMAX.",
    year: 2026,
    durationMin: 92,
    rating: "M/6",
    director: "Nzinga Ferreira",
    genres: ["documentario"],
    status: "STREAMING",
    cinema: false,
    streaming: true,
    featured: false,
    hero: false,
    heroOrder: 0,
    formats: ["2D"],
    colors: ["#164e63", "#082f49"],
    tag: "ORIGINAL",
    popularity: 500,
    avgRating: 4.7,
    releaseOffsetDays: -45,
    cast: ["Narração: Alda Lopes"],
  },
  {
    title: "Coração de Aço",
    originalTitle: "Steel Heart",
    slug: "coracao-de-aco",
    synopsis: "Uma piloto de drones civis é arrastada para uma guerra que ainda não foi declarada.",
    year: 2026,
    durationMin: 120,
    rating: "M/16",
    director: "Victor Hale",
    genres: ["acao", "drama"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: true,
    featured: false,
    hero: false,
    heroOrder: 0,
    formats: ["2D", "IMAX"],
    colors: ["#1e293b", "#64748b"],
    tag: "ACÇÃO",
    popularity: 750,
    avgRating: 4.1,
    releaseOffsetDays: -14,
    cast: ["Katia Moreira", "Leonel Cruz"],
  },
  {
    title: "A Dança das Chamas",
    originalTitle: "Dance of Flames",
    slug: "a-danca-das-chamas",
    synopsis: "Dois bailarinos rivais ensaiam um espectáculo que só pode ser dançado uma vez. Romance e fogo.",
    year: 2026,
    durationMin: 107,
    rating: "M/12",
    director: "Camille Dupont",
    genres: ["romance", "drama"],
    status: "NOW_SHOWING",
    cinema: true,
    streaming: true,
    featured: false,
    hero: false,
    heroOrder: 0,
    formats: ["2D"],
    colors: ["#7f1d1d", "#c2410c"],
    tag: "ROMANCE",
    popularity: 630,
    avgRating: 4.3,
    releaseOffsetDays: -7,
    cast: ["Lila Mendes", "André Faria"],
  },
];

const CINEMAS = [
  { name: "CINEMAX Luanda Fortaleza", slug: "luanda-fortaleza", city: "Luanda", address: "Av. 4 de Fevereiro, Marginal", lat: -8.812, lng: 13.234, phone: "+244 222 110 001", hours: "10:00–00:30" },
  { name: "CINEMAX Belas Shopping", slug: "belas-shopping", city: "Luanda", address: "Belas Shopping, Talatona", lat: -8.917, lng: 13.187, phone: "+244 222 110 002", hours: "10:00–23:30" },
  { name: "CINEMAX Talatona", slug: "talatona", city: "Luanda", address: "Talatona Convention, Rua do Complexo", lat: -8.922, lng: 13.175, phone: "+244 222 110 003", hours: "11:00–00:00" },
  { name: "CINEMAX Benguela Costa", slug: "benguela-costa", city: "Benguela", address: "Av. 10 de Fevereiro, Frente Mar", lat: -12.576, lng: 13.405, phone: "+244 272 110 004", hours: "11:00–23:00" },
  { name: "CINEMAX Lubango Serra", slug: "lubango-serra", city: "Lubango", address: "Bairro Comercial, Serra da Leba vista", lat: -14.917, lng: 13.492, phone: "+244 261 110 005", hours: "12:00–22:30" },
];

const ROOM_TYPES = [
  { name: "CINEMAX IMAX", type: "IMAX", formats: ["IMAX", "2D", "3D"], rows: 12, cols: 16, sound: "IMAX 12.1", screen: "IMAX Laser" },
  { name: "CINEMAX VIP", type: "VIP", formats: ["2D"], rows: 6, cols: 10, sound: "Dolby Atmos", screen: "Laser Premium" },
  { name: "CINEMAX 3D", type: "3D", formats: ["2D", "3D"], rows: 10, cols: 14, sound: "Dolby Atmos", screen: "Silver 3D" },
];

async function main() {
  console.log("Seeding CINEMAX…");
  await prisma.analyticsEvent.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.aiMessage.deleteMany();
  await prisma.aiConversation.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.reviewVote.deleteMany();
  await prisma.review.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.watchlistItem.deleteMany();
  await prisma.watchHistory.deleteMany();
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.loyaltyAccount.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.ticketItem.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.seatHold.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.session.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.room.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.movieCast.deleteMany();
  await prisma.movieGenre.deleteMany();
  await prisma.seriesGenre.deleteMany();
  await prisma.similarMovie.deleteMany();
  await prisma.trailer.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.season.deleteMany();
  await prisma.contentLicense.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.series.deleteMany();
  await prisma.person.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.orderItem.deleteMany().catch(() => undefined);
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cinema.deleteMany();
  await prisma.setting.deleteMany();

  const hash = await bcrypt.hash("Cinemax@2026", 12);

  const genreMap = new Map<string, string>();
  for (const [name, slug] of GENRES) {
    const g = await prisma.genre.create({ data: { name, slug } });
    genreMap.set(slug, g.id);
  }
  await prisma.genre.create({ data: { name: "Fantasia", slug: "fantasia" } }).then((g) => genreMap.set("fantasia", g.id));
  await prisma.genre.create({ data: { name: "Família", slug: "familia" } }).then((g) => genreMap.set("familia", g.id));

  const people = new Map<string, string>();
  const ensurePerson = async (name: string, role = "ACTOR") => {
    if (people.has(name)) return people.get(name)!;
    const p = await prisma.person.create({ data: { name, role } });
    people.set(name, p.id);
    return p.id;
  };

  const movieIds: string[] = [];
  const movieBySlug = new Map<string, string>();

  for (const m of MOVIES) {
    writeAsset(`posters/${m.slug}.svg`, posterSvg(m.title, m.colors[0], m.colors[1], m.tag));
    writeAsset(`backdrops/${m.slug}.svg`, backdropSvg(m.title, m.colors[0], m.colors[1]));
    const release = new Date();
    release.setDate(release.getDate() + m.releaseOffsetDays);
    const movie = await prisma.movie.create({
      data: {
        title: m.title,
        originalTitle: m.originalTitle,
        slug: m.slug,
        synopsis: m.synopsis,
        posterUrl: `/posters/${m.slug}.svg`,
        backdropUrl: `/backdrops/${m.slug}.svg`,
        trailerUrl: "",
        videoUrl: m.streaming ? `/videos/demo-reel.svg` : null,
        year: m.year,
        durationMin: m.durationMin,
        rating: m.rating,
        language: "pt",
        subtitles: JSON.stringify(["pt", "en"]),
        formats: JSON.stringify(m.formats),
        status: m.status,
        releaseDate: release,
        cinemaAvailable: m.cinema,
        streamingAvailable: m.streaming,
        featured: m.featured,
        heroEnabled: m.hero,
        heroOrder: m.heroOrder,
        heroCta: m.hero ? "COMPRAR BILHETE" : null,
        avgRating: m.avgRating,
        voteCount: m.avgRating ? 240 + Math.floor(Math.random() * 800) : 0,
        popularity: m.popularity,
        director: m.director,
      },
    });
    movieIds.push(movie.id);
    movieBySlug.set(m.slug, movie.id);
    await ensurePerson(m.director, "DIRECTOR");
    for (const slug of m.genres) {
      const gid = genreMap.get(slug);
      if (gid) await prisma.movieGenre.create({ data: { movieId: movie.id, genreId: gid } });
    }
    for (const [i, actor] of m.cast.entries()) {
      const pid = await ensurePerson(actor);
      await prisma.movieCast.create({ data: { movieId: movie.id, personId: pid, character: actor.split(" ")[0], order: i } });
    }
    await prisma.trailer.create({ data: { movieId: movie.id, title: `Trailer — ${m.title}`, url: "", type: "OFFICIAL" } });
    await prisma.contentLicense.create({
      data: {
        movieId: movie.id,
        territory: "AO",
        type: m.streaming ? "CINEMA_AND_STREAMING" : "CINEMA",
        cinemaOk: m.cinema,
        streamingOk: m.streaming,
        downloadOk: m.streaming,
        startsAt: new Date(Date.now() - 86400000 * 40),
        endsAt: new Date(Date.now() + 86400000 * (m.slug === "eclipse-final" ? 20 : 180)),
        status: "ACTIVE",
      },
    });
  }

  for (let i = 0; i < movieIds.length; i++) {
    const others = movieIds.filter((_, j) => j !== i).slice(0, 4);
    for (const sid of others) {
      await prisma.similarMovie.create({ data: { movieId: movieIds[i], similarId: sid } }).catch(() => undefined);
    }
  }

  writeAsset(
    "videos/demo-reel.svg",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#050505"/><text x="800" y="450" text-anchor="middle" fill="#E50914" font-size="48" font-family="serif">CINEMAX DEMO REEL</text><text x="800" y="510" text-anchor="middle" fill="#A0A0A0" font-size="20">Conteúdo original / licenciado — player de demonstração</text></svg>`,
  );

  const seriesData = [
    { title: "Arquivo 7", slug: "arquivo-7", syn: "Uma analista de inteligência descobre um sétimo arquivo que não deveria existir.", year: 2026, rating: "M/16", genres: ["thriller"], colors: ["#111827", "#e50914"] as [string, string] },
    { title: "Ilha do Eco", slug: "ilha-do-eco", syn: "Sete náufragos ouvem a própria voz a chamar do interior da ilha.", year: 2025, rating: "M/12", genres: ["drama", "thriller"], colors: ["#064e3b", "#022c22"] as [string, string] },
    { title: "Club Cinzel", slug: "club-cinzel", syn: "Bastidores de uma casa de cinema de luxo — série original CINEMAX.", year: 2026, rating: "M/12", genres: ["drama"], colors: ["#1c1917", "#c9a227"] as [string, string] },
    { title: "Satélites", slug: "satelites", syn: "Engenheiros em órbita tentam reparar um silêncio inexplicável.", year: 2026, rating: "M/12", genres: ["ficcao-cientifica"], colors: ["#0f172a", "#38bdf8"] as [string, string] },
    { title: "Pequenos Lumens", slug: "pequenos-lumens", syn: "Série infantil sobre pirilampos que organizam sessões de cinema no jardim.", year: 2026, rating: "M/6", genres: ["animacao", "familia"], colors: ["#4c1d95", "#fbbf24"] as [string, string] },
    { title: "Noite Aberta", slug: "noite-aberta", syn: "Talk-show cinematográfico fictício com convidados do universo CINEMAX.", year: 2026, rating: "M/12", genres: ["comedia"], colors: ["#3f1d1d", "#e50914"] as [string, string] },
  ];

  for (const s of seriesData) {
    writeAsset(`posters/${s.slug}.svg`, posterSvg(s.title, s.colors[0], s.colors[1], "SÉRIE"));
    writeAsset(`backdrops/${s.slug}.svg`, backdropSvg(s.title, s.colors[0], s.colors[1]));
    const series = await prisma.series.create({
      data: {
        title: s.title,
        slug: s.slug,
        synopsis: s.syn,
        posterUrl: `/posters/${s.slug}.svg`,
        backdropUrl: `/backdrops/${s.slug}.svg`,
        year: s.year,
        rating: s.rating,
        streamingAvailable: true,
        featured: s.slug === "arquivo-7",
        avgRating: 4.3,
        popularity: 400,
      },
    });
    for (const g of s.genres) {
      const gid = genreMap.get(g);
      if (gid) await prisma.seriesGenre.create({ data: { seriesId: series.id, genreId: gid } });
    }
    const season = await prisma.season.create({ data: { seriesId: series.id, number: 1, title: "Temporada 1", year: s.year } });
    for (let e = 1; e <= 6; e++) {
      await prisma.episode.create({
        data: {
          seasonId: season.id,
          number: e,
          title: `Episódio ${e}`,
          synopsis: `Capítulo ${e} de ${s.title}.`,
          durationMin: 42 + e,
          videoUrl: "/videos/demo-reel.svg",
        },
      });
    }
  }

  const cinemaRecords = [];
  for (const c of CINEMAS) {
    writeAsset(
      `cinemas/${c.slug}.svg`,
      backdropSvg(c.name, "#0d0d0d", "#e50914"),
    );
    const cinema = await prisma.cinema.create({
      data: {
        name: c.name,
        slug: c.slug,
        address: c.address,
        city: c.city,
        latitude: c.lat,
        longitude: c.lng,
        phone: c.phone,
        email: `cinema.${c.slug}@cinemax.ao`,
        openingHours: c.hours,
        services: JSON.stringify(["Bar", "VIP Lounge", "Estacionamento", "Acessibilidade", "Loja"]),
        imageUrl: `/cinemas/${c.slug}.svg`,
      },
    });
    cinemaRecords.push(cinema);
    for (let i = 0; i < 3; i++) {
      const tpl = ROOM_TYPES[i];
      const room = await prisma.room.create({
        data: {
          cinemaId: cinema.id,
          name: tpl.name,
          number: i + 1,
          capacity: tpl.rows * tpl.cols - tpl.rows,
          type: tpl.type,
          formats: JSON.stringify(tpl.formats),
          screenType: tpl.screen,
          soundSystem: tpl.sound,
          rows: tpl.rows,
          columns: tpl.cols,
          imageUrl: `/cinemas/${c.slug}.svg`,
        },
      });
      const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (let y = 0; y < tpl.rows; y++) {
        for (let x = 1; x <= tpl.cols; x++) {
          const isAisle = x === 4 || x === tpl.cols - 3;
          let type = "STANDARD";
          if (tpl.type === "VIP" || y >= tpl.rows - 2) type = "VIP";
          if (tpl.type === "IMAX" && y < 2) type = "PREMIUM";
          if (y === 0 && (x === 1 || x === 2)) type = "ACCESSIBLE";
          await prisma.seat.create({
            data: {
              roomId: room.id,
              row: rowLetters[y],
              number: x,
              type: isAisle ? "STANDARD" : type,
              posX: x,
              posY: y,
              isAisle,
              status: isAisle ? "AISLE" : "ACTIVE",
            },
          });
        }
      }
    }
  }

  const rooms = await prisma.room.findMany({ include: { cinema: true } });
  const showing = await prisma.movie.findMany({ where: { cinemaAvailable: true, status: { in: ["NOW_SHOWING", "COMING_SOON"] } } });
  const formatsCycle = ["2D", "3D", "IMAX"];
  const now = new Date();
  now.setMinutes(0, 0, 0);

  for (let day = 0; day < 10; day++) {
    for (const room of rooms) {
      const slots = [14, 17, 20, 22];
      for (const hour of slots) {
        const movie = showing[(day + hour + room.number) % showing.length];
        const startsAt = new Date(now);
        startsAt.setDate(now.getDate() + day);
        startsAt.setHours(hour, 0, 0, 0);
        const endsAt = new Date(startsAt.getTime() + movie.durationMin * 60000 + 20 * 60000);
        const format = room.type === "IMAX" ? "IMAX" : room.type === "3D" ? "3D" : formatsCycle[(day + hour) % 3];
        const price = format === "IMAX" ? 7500 : format === "3D" ? 5000 : room.type === "VIP" ? 10000 : 3500;
        await prisma.session.create({
          data: {
            movieId: movie.id,
            cinemaId: room.cinemaId,
            roomId: room.id,
            startsAt,
            endsAt,
            format,
            language: "pt",
            subtitles: "en",
            price,
            status: "SCHEDULED",
          },
        });
      }
    }
  }

  const cats = await Promise.all(
    [
      ["Pipocas", "pipocas"],
      ["Bebidas", "bebidas"],
      ["Combos", "combos"],
      ["Outros", "outros"],
    ].map(([name, slug]) => prisma.productCategory.create({ data: { name, slug } })),
  );

  const products = [
    { cat: "pipocas", name: "Pipoca Pequena", slug: "pipoca-pequena", price: 1500, desc: "Balde pequeno, manteiga clássica.", pts: 10 },
    { cat: "pipocas", name: "Pipoca Média", slug: "pipoca-media", price: 2200, desc: "O tamanho certo para uma sessão.", pts: 15 },
    { cat: "pipocas", name: "Pipoca Grande", slug: "pipoca-grande", price: 2800, desc: "Balde grande para partilhar.", pts: 20 },
    { cat: "pipocas", name: "Pipoca Caramelizada", slug: "pipoca-caramelizada", price: 2600, desc: "Doce, crocante, inesquecível.", pts: 20 },
    { cat: "bebidas", name: "Coca-Cola", slug: "coca-cola", price: 1200, desc: "350ml gelada.", pts: 8 },
    { cat: "bebidas", name: "Pepsi", slug: "pepsi", price: 1200, desc: "350ml gelada.", pts: 8 },
    { cat: "bebidas", name: "Água", slug: "agua", price: 700, desc: "500ml.", pts: 5 },
    { cat: "bebidas", name: "Sumo", slug: "sumo", price: 1100, desc: "Sumo natural da casa.", pts: 8 },
    { cat: "combos", name: "Combo Individual", slug: "combo-individual", price: 3500, desc: "Pipoca média + bebida.", pts: 25 },
    { cat: "combos", name: "Combo Casal", slug: "combo-casal", price: 6200, desc: "Pipoca grande + 2 bebidas.", pts: 40 },
    { cat: "combos", name: "Combo Família", slug: "combo-familia", price: 9800, desc: "2 pipocas grandes + 4 bebidas.", pts: 60 },
    { cat: "combos", name: "Combo Premium", slug: "combo-premium", price: 12500, desc: "VIP snack + bebida premium + chocolate.", pts: 80 },
    { cat: "outros", name: "Óculos 3D", slug: "oculos-3d", price: 1500, desc: "Óculos reutilizáveis CINEMAX 3D.", pts: 12 },
    { cat: "outros", name: "Chocolate", slug: "chocolate", price: 900, desc: "Tablete de origem angolana.", pts: 6 },
    { cat: "outros", name: "Snacks", slug: "snacks", price: 1300, desc: "Mix salgado da casa.", pts: 8 },
    { cat: "outros", name: "T-shirt Eclipse Final", slug: "tshirt-eclipse", price: 8500, desc: "Merchandising oficial da estreia.", pts: 30 },
  ];

  const productRecords = [];
  for (const p of products) {
    writeAsset(`products/${p.slug}.svg`, posterSvg(p.name, "#0d0d0d", "#e50914", "LOJA"));
    const rec = await prisma.product.create({
      data: {
        categoryId: cats.find((c) => c.slug === p.cat)!.id,
        name: p.name,
        slug: p.slug,
        description: p.desc,
        price: p.price,
        imageUrl: `/products/${p.slug}.svg`,
        pointsAward: p.pts,
        featured: p.cat === "combos",
      },
    });
    productRecords.push(rec);
    for (const cinema of cinemaRecords) {
      const inv = await prisma.inventoryItem.create({
        data: { productId: rec.id, cinemaId: cinema.id, stock: 80 + Math.floor(Math.random() * 40), minStock: 15 },
      });
      await prisma.stockMovement.create({ data: { inventoryItemId: inv.id, type: "IN", quantity: inv.stock, note: "Stock inicial" } });
    }
  }

  const plans = await Promise.all([
    prisma.subscriptionPlan.create({
      data: {
        name: "CINEMAX BASIC",
        slug: "basic",
        tagline: "Streaming HD · 1 dispositivo",
        monthlyPrice: 3500,
        yearlyPrice: 35000,
        maxDevices: 1,
        quality: "HD",
        features: JSON.stringify(["Catálogo CINEMAX+", "HD", "1 dispositivo", "Perfil único"]),
        sortOrder: 1,
      },
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: "CINEMAX STANDARD",
        slug: "standard",
        tagline: "Full HD · 2 dispositivos · Downloads",
        monthlyPrice: 5500,
        yearlyPrice: 55000,
        maxDevices: 2,
        quality: "FULL_HD",
        features: JSON.stringify(["Full HD", "2 dispositivos", "Downloads", "Sem anúncios"]),
        highlight: true,
        sortOrder: 2,
      },
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: "CINEMAX PREMIUM",
        slug: "premium",
        tagline: "4K HDR · 4 dispositivos · Conteúdo exclusivo",
        monthlyPrice: 8500,
        yearlyPrice: 85000,
        maxDevices: 4,
        quality: "UHD_HDR",
        features: JSON.stringify(["4K", "HDR", "4 dispositivos", "Conteúdo premium", "Sessões exclusivas"]),
        sortOrder: 3,
      },
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: "CINEMAX FAMILY",
        slug: "family",
        tagline: "Perfis familiares · Controlo parental",
        monthlyPrice: 9500,
        yearlyPrice: 95000,
        maxDevices: 6,
        quality: "UHD_HDR",
        features: JSON.stringify(["Perfis familiares", "Controlo parental", "Múltiplos dispositivos", "Kids safe"]),
        sortOrder: 4,
      },
    }),
  ]);

  const admin = await prisma.user.create({
    data: {
      email: "wendy.h@example.net",
      passwordHash: hash,
      name: "Sofia Command",
      role: "SUPER_ADMIN",
      phone: "+244 900 000 001",
      avatarUrl: "",
    },
  });
  const roles = [
    ["xena.w@example.org", "ADMIN", "Admin Geral"],
    ["ursula.b@example.com", "MANAGER", "Gestor Fortaleza"],
    ["tom.h@example.org", "STAFF", "Staff Bilheteira"],
    ["olivia.t@example.org", "FINANCE", "Financeiro"],
    ["olivia.t@example.org", "MARKETING", "Marketing"],
    ["tina.r@example.net", "CONTENT_MANAGER", "Conteúdo"],
  ] as const;
  for (const [email, role, name] of roles) {
    const u = await prisma.user.upsert({
      where: { email },
      update: { role, name, passwordHash: hash, status: "ACTIVE" },
      create: { email, passwordHash: hash, name, role },
    });
    if ((role === "MANAGER" || role === "STAFF") && !(await prisma.staffProfile.findUnique({ where: { userId: u.id } }))) {
      await prisma.staffProfile.create({
        data: { userId: u.id, cinemaId: cinemaRecords[0].id, jobTitle: name, shift: "Tarde" },
      });
    }
  }

  const customers = [];
  for (const [i, name] of ["João Silva", "Maria Santos", "Carlos Neto", "Ana Kilamba", "Pedro Gama", "Lara Pinto", "Rita Campos", "Ivo Mendes"].entries()) {
    const u = await prisma.user.create({
      data: {
        email: `cliente${i + 1}@cinemax.ao`,
        passwordHash: hash,
        name,
        role: "CUSTOMER",
        locale: "pt",
        preferredCinemaId: cinemaRecords[i % cinemaRecords.length].id,
      },
    });
    customers.push(u);
    await prisma.profile.create({ data: { userId: u.id, name: name.split(" ")[0], isKids: false } });
    if (i % 2 === 0) await prisma.profile.create({ data: { userId: u.id, name: "Crianças", isKids: true, maturityRating: "M/6" } });
    const acc = await prisma.loyaltyAccount.create({
      data: { userId: u.id, points: 200 + i * 400, lifetime: 400 + i * 600, tier: i > 5 ? "GOLD" : i > 2 ? "SILVER" : "BRONZE" },
    });
    await prisma.loyaltyTransaction.create({ data: { accountId: acc.id, points: 200, reason: "Bónus de boas-vindas" } });
    await prisma.subscription.create({
      data: {
        userId: u.id,
        planId: plans[i % plans.length].id,
        status: i === 7 ? "CANCELED" : "ACTIVE",
        interval: i % 2 ? "YEARLY" : "MONTHLY",
        currentPeriodEnd: new Date(Date.now() + 86400000 * 20),
      },
    });
  }

  const demoCustomer = customers[0];
  const sessions = await prisma.session.findMany({ take: 40, include: { room: { include: { seats: true } } } });
  for (let i = 0; i < 18; i++) {
    const session = sessions[i];
    const buyer = customers[i % customers.length];
    const seats = session.room.seats.filter((s) => s.status === "ACTIVE").slice(i, i + 2);
    const extrasTotal = i % 3 === 0 ? 3500 : 0;
    const subtotal = session.price * seats.length + extrasTotal;
    const order = await prisma.order.create({
      data: {
        code: `ORD-${1000 + i}`,
        userId: buyer.id,
        type: "TICKET",
        status: "PAID",
        subtotal,
        fees: 250,
        total: subtotal + 250,
        createdAt: new Date(Date.now() - i * 3600000 * 6),
      },
    });
    if (extrasTotal) {
      await prisma.orderItem.create({
        data: { orderId: order.id, productId: productRecords[8].id, name: "Combo Individual", quantity: 1, unitPrice: 3500, total: 3500 },
      });
    }
    const ticket = await prisma.ticket.create({
      data: {
        code: `TKT-${2000 + i}`,
        userId: buyer.id,
        sessionId: session.id,
        orderId: order.id,
        status: "PAID",
        qrPayload: `CINEMAX:TKT-${2000 + i}`,
      },
    });
    for (const seat of seats) {
      await prisma.ticketItem.create({ data: { ticketId: ticket.id, seatId: seat.id, price: session.price } });
    }
    await prisma.payment.create({
      data: {
        userId: buyer.id,
        orderId: order.id,
        provider: "mock",
        method: i % 2 ? "MULTICAIXA" : "CARD",
        amount: order.total,
        status: "PAID",
        reference: `PAY-${3000 + i}`,
        paidAt: order.createdAt,
      },
    });
  }

  for (const c of customers.slice(0, 5)) {
    await prisma.review.create({
      data: {
        userId: c.id,
        movieId: movieBySlug.get("eclipse-final")!,
        rating: 5,
        body: "Uma experiência IMAX inesquecível. O som na Fortaleza é cinema a sério.",
        status: "PUBLISHED",
      },
    });
    await prisma.favorite.create({ data: { userId: c.id, movieId: movieBySlug.get("eclipse-final")! } });
    await prisma.watchHistory.create({
      data: {
        userId: c.id,
        movieId: movieBySlug.get("cidade-de-neon")!,
        progressSec: 2400,
        durationSec: 7500,
      },
    });
    await prisma.watchlistItem.create({ data: { userId: c.id, movieId: movieBySlug.get("protocolo-orion")! } });
    await prisma.notification.create({
      data: {
        userId: c.id,
        title: "Bilhete confirmado",
        body: "O seu lugar está reservado. Mostre o QR Code na entrada.",
        type: "TICKET",
        href: "/conta/bilhetes",
      },
    });
  }

  await prisma.coupon.createMany({
    data: [
      { code: "ESTREIA20", description: "20% na estreia", type: "PERCENT", value: 20, startsAt: new Date(), endsAt: new Date(Date.now() + 86400000 * 20), minAmount: 3000 },
      { code: "CLUB1000", description: "1000 AOA de desconto Club", type: "FIXED", value: 1000, startsAt: new Date(), endsAt: new Date(Date.now() + 86400000 * 60) },
      { code: "FAMILIA", description: "Promoção família", type: "PERCENT", value: 15, startsAt: new Date(), endsAt: new Date(Date.now() + 86400000 * 40) },
    ],
  });

  await prisma.promotion.createMany({
    data: [
      { title: "Segunda-feira CINEMAX", slug: "segunda", description: "Bilhetes a 2500 AOA todas as segundas.", type: "WEEKDAY", imageUrl: "/backdrops/eclipse-final.svg", discount: 30, startsAt: new Date(), endsAt: new Date(Date.now() + 86400000 * 90), featured: true },
      { title: "Happy Hour 17h", slug: "happy-hour", description: "Combo individual com 20% até às 18h.", type: "HAPPY_HOUR", imageUrl: "/products/combo-individual.svg", discount: 20, startsAt: new Date(), endsAt: new Date(Date.now() + 86400000 * 90), featured: true },
      { title: "Estudante", slug: "estudante", description: "Desconto estudante com cartão válido.", type: "STUDENT", imageUrl: "/backdrops/cancao-para-um-cometa.svg", discount: 15, startsAt: new Date(), endsAt: new Date(Date.now() + 86400000 * 120), featured: false },
      { title: "Casal Premium", slug: "casal", description: "Dois VIP + combo casal.", type: "COUPLE", imageUrl: "/products/combo-casal.svg", discount: 18, startsAt: new Date(), endsAt: new Date(Date.now() + 86400000 * 60), featured: true },
      { title: "Flash Sale 3D", slug: "flash-3d", description: "Óculos 3D a metade do preço este fim-de-semana.", type: "FLASH", imageUrl: "/products/oculos-3d.svg", discount: 50, startsAt: new Date(), endsAt: new Date(Date.now() + 86400000 * 3), featured: true },
    ],
  });

  await prisma.campaign.create({
    data: {
      title: "Noite Vermelha — Eclipse Final",
      objective: "Esgotar IMAX no fim-de-semana de estreia",
      audience: "18-34 · fãs de ficção científica",
      channels: JSON.stringify(["push", "email", "hero", "instagram"]),
      copy: "A última luz da Terra precisa de si. IMAX CINEMAX — Your Movie. Your Moment.",
      cta: "COMPRAR BILHETE",
      discount: "ESTREIA20",
      status: "ACTIVE",
      createdById: admin.id,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 86400000 * 10),
    },
  });

  await prisma.banner.createMany({
    data: [
      { title: "Experiência 3D", subtitle: "Óculos oficiais · Som Atmos · Salas dedicadas", imageUrl: "/backdrops/o-ultimo-portal.svg", ctaLabel: "Ver filmes 3D", ctaHref: "/filmes?formato=3D", placement: "HOME_3D", sortOrder: 1 },
      { title: "CINEMAX+", subtitle: "Filmes e séries originais. Comece o trial.", imageUrl: "/backdrops/cidade-de-neon.svg", ctaLabel: "Assinar", ctaHref: "/cinemax-plus", placement: "HOME_PLUS", sortOrder: 2 },
    ],
  });

  await prisma.newsArticle.createMany({
    data: [
      { title: "CINEMAX inaugura sala IMAX na Fortaleza", slug: "imax-fortaleza", excerpt: "A maior tela de Luanda abre com Eclipse Final.", body: "A nova sala IMAX Laser redefine o ritual de ir ao cinema em Angola. Conteúdo original e licenciado, com gestão de direitos no painel CINEMAX.", imageUrl: "/cinemas/luanda-fortaleza.svg" },
      { title: "CINEMAX Club: o novo programa de fidelidade", slug: "cinemax-club", excerpt: "Pontos em cada pipoca, bilhete e noite de streaming.", body: "Bronze a VIP. Benefícios configuráveis pelo administrador.", imageUrl: "/brand/logo.svg" },
    ],
  });

  await prisma.emailTemplate.createMany({
    data: [
      { slug: "welcome", subject: "Bem-vindo ao CINEMAX", body: "Your Movie. Your Moment. A sua conta está pronta." },
      { slug: "ticket", subject: "Bilhete confirmado", body: "Mostre o QR Code na entrada da sala." },
      { slug: "payment-ok", subject: "Pagamento aprovado", body: "Recebemos o seu pagamento." },
      { slug: "payment-fail", subject: "Pagamento recusado", body: "Tente outro método. Os lugares estão reservados por pouco tempo." },
      { slug: "session-soon", subject: "A sua sessão começa em breve", body: "Não se esqueça dos óculos 3D." },
      { slug: "sub-created", subject: "CINEMAX+ activado", body: "Escolha um perfil e comece a assistir." },
      { slug: "sub-renewed", subject: "Assinatura renovada", body: "Obrigado por continuar connosco." },
      { slug: "sub-canceled", subject: "Assinatura cancelada", body: "Lamentamos vê-lo partir. Os benefícios mantêm-se até ao fim do período." },
      { slug: "promo", subject: "Uma noite vermelha espera por si", body: "Campanha da semana no CINEMAX." },
    ],
  });

  await prisma.alert.createMany({
    data: [
      { type: "LICENSE", severity: "YELLOW", title: "Licença a expirar", body: "Eclipse Final — direitos de streaming/cinema expiram em breve.", href: "/admin/streaming/licencas" },
      { type: "STOCK", severity: "YELLOW", title: "Stock baixo", body: "Óculos 3D abaixo do mínimo em Lubango.", href: "/admin/vendas/extras" },
      { type: "OCCUPANCY", severity: "GREEN", title: "Sala quase lotada", body: "IMAX Fortaleza 20:00 — Eclipse Final.", href: "/admin/command-center" },
    ],
  });

  const settings: Record<string, string> = {
    brandName: "CINEMAX",
    tagline: "Your Movie. Your Moment.",
    currency: "AOA",
    defaultLocale: "pt",
    preloaderEnabled: "true",
    heroVideoUrl: "",
    bookingFee: "250",
    holdMinutes: "10",
    supportEmail: "ola@cinemax.ao",
    supportPhone: "+244 222 000 000",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.create({ data: { key, value } });
  }

  for (let d = 0; d < 14; d++) {
    await prisma.analyticsEvent.create({
      data: {
        name: "page_view",
        path: "/",
        metadata: JSON.stringify({ visitors: 400 + d * 30 }),
        createdAt: new Date(Date.now() - d * 86400000),
      },
    });
  }

  writeAsset(
    "brand/logo.svg",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#050505"/><rect x="2" y="2" width="60" height="60" rx="10" fill="none" stroke="#E50914" stroke-width="2"/><text x="32" y="40" text-anchor="middle" font-family="serif" font-size="14" fill="#fff" letter-spacing="2">CX</text></svg>`,
  );
  writeAsset(
    "icons/icon-192.svg",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="32" fill="#050505"/><text x="96" y="112" text-anchor="middle" fill="#E50914" font-size="42" font-family="serif">CX</text></svg>`,
  );
  writeAsset(
    "icons/icon-512.svg",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#050505"/><text x="256" y="300" text-anchor="middle" fill="#E50914" font-size="120" font-family="serif">CX</text></svg>`,
  );

  console.log("CINEMAX seed complete.");
  console.log("Login demo: wendy.h@example.net / Cinemax@2026");
  console.log("Cliente: cliente1@cinemax.ao / Cinemax@2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
