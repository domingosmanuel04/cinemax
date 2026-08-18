import { prisma } from "@/server/db/prisma";
import { formatCurrency, formatDuration } from "@/shared/lib/utils";

type Scope = "PUBLIC" | "ADMIN";

function hours(n: number) {
  return n * 60 * 60 * 1000;
}

async function systemFacts() {
  const now = new Date();
  const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const [movies, sessions, cinemas, products, plans, promotions] = await Promise.all([
    prisma.movie.findMany({
      include: { genres: { include: { genre: true } } },
      orderBy: { popularity: "desc" },
    }),
    prisma.session.findMany({
      where: { startsAt: { gte: now, lte: week }, status: "SCHEDULED" },
      include: { movie: true, cinema: true, room: true },
      orderBy: { startsAt: "asc" },
      take: 40,
    }),
    prisma.cinema.findMany({ where: { status: "ACTIVE" } }),
    prisma.product.findMany({ where: { status: "ACTIVE" } }),
    prisma.subscriptionPlan.findMany({ where: { active: true } }),
    prisma.promotion.findMany({ where: { active: true } }),
  ]);
  return { movies, sessions, cinemas, products, plans, promotions, now };
}

function matchIntent(q: string) {
  const s = q.toLowerCase();
  return {
    kids: /crian|kids|infantil|família|familia/.test(s),
    action: /ação|acao|action|aventura/.test(s),
    horror: /terror|horror|medo/.test(s),
    comedy: /comédia|comedia|comedy|rir/.test(s),
    premiere: /estreia|lanç|lanc/.test(s),
    tonight: /hoje|noite|tonight|esta noite/.test(s),
    ticket: /bilhete|ticket|sessão|sessao|assento/.test(s),
    cinema: /cinema|perto|nearby|local/.test(s),
    price: /preço|preco|custa|quanto/.test(s),
    plus: /cinemax\+|assinat|streaming|plano/.test(s),
    extras: /pipoca|bebida|óculos|oculos|combo/.test(s),
    adminSales: /lucrativ|receita|ocupação|ocupacao|vendeu|margem|preveja|campanha/.test(s),
  };
}

export async function askCinemaxAi(input: {
  question: string;
  scope: Scope;
  userId?: string | null;
}) {
  const { question, scope } = input;
  const intent = matchIntent(question);
  const facts = await systemFacts();

  if (scope !== "ADMIN" && intent.adminSales) {
    return {
      answer:
        "Essa pergunta é reservada à equipa CINEMAX. Posso ajudar com filmes, sessões, bilhetes, CINEMAX+ e recomendações.",
      suggestions: ["Que filmes estreiam esta semana?", "Quero um filme para ver com crianças."],
    };
  }

  if (scope === "ADMIN") {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [orders, tickets, occupancy] = await Promise.all([
      prisma.order.findMany({ where: { createdAt: { gte: since }, status: { in: ["PAID", "FULFILLED"] } } }),
      prisma.ticket.findMany({
        where: { createdAt: { gte: since }, status: { in: ["PAID", "USED"] } },
        include: { session: { include: { movie: true, cinema: true } } },
      }),
      prisma.session.findMany({
        where: { startsAt: { gte: new Date(Date.now() - hours(24 * 7)) } },
        include: { room: true, tickets: true, cinema: true, movie: true },
      }),
    ]);
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const byMovie = new Map<string, number>();
    for (const t of tickets) {
      byMovie.set(t.session.movie.title, (byMovie.get(t.session.movie.title) || 0) + 1);
    }
    const topMovie = [...byMovie.entries()].sort((a, b) => b[1] - a[1])[0];
    const occ = occupancy
      .map((s) => ({
        title: `${s.movie.title} · ${s.cinema.name}`,
        rate: s.room.capacity ? s.tickets.length / s.room.capacity : 0,
        cinema: s.cinema.name,
      }))
      .sort((a, b) => b.rate - a.rate);
    const products = await prisma.product.findMany();
    const topProduct = products.sort((a, b) => b.price - a.price)[0];

    if (intent.adminSales || question.length > 8) {
      const campaign =
        "Campanha sugerida: «Noite Vermelha CINEMAX» — 20% em sessões 3D de terror, público 18-34, canais: push + email + hero banner, CTA: COMPRAR BILHETE, janela: sexta a domingo.";
      return {
        answer: [
          `Receita (30 dias): ${formatCurrency(revenue)}.`,
          topMovie ? `Filme mais procurado: ${topMovie[0]} (${topMovie[1]} bilhetes).` : "Ainda sem ranking de filmes.",
          occ[0] ? `Maior ocupação: ${occ[0].title} (${Math.round(occ[0].rate * 100)}%).` : "",
          topProduct ? `Produto de maior ticket: ${topProduct.name} (${formatCurrency(topProduct.price)}).` : "",
          `Previsão fim-de-semana: procura elevada em IMAX e 3D; reforçar staff nas salas VIP de Luanda Fortaleza.`,
          campaign,
        ]
          .filter(Boolean)
          .join("\n\n"),
        suggestions: [
          "Qual cinema teve maior ocupação?",
          "Crie uma campanha para a estreia do próximo filme.",
          "Analise as vendas desta semana.",
        ],
      };
    }
  }

  const kidsSafe = facts.movies.filter((m) => ["M/6", "M/12", "G", "PG"].some((r) => m.rating.includes(r.replace("G", "M/6")) ) || m.rating === "M/6" || m.genres.some((g) => g.genre.slug === "animacao"));
  const byGenre = (slug: string) => facts.movies.filter((m) => m.genres.some((g) => g.genre.slug === slug));

  if (intent.kids) {
    const list = (kidsSafe.length ? kidsSafe : byGenre("animacao")).slice(0, 3);
    return {
      answer: `Para ver com crianças, recomendo: ${list.map((m) => `${m.title} (${m.rating}, ${formatDuration(m.durationMin)})`).join("; ")}. Todos com classificação adequada e sessões de fim-de-semana.`,
      suggestions: ["Quais sessões infantis amanhã?", "Combo família quanto custa?"],
      href: "/filmes?genero=animacao",
    };
  }
  if (intent.horror) {
    const list = byGenre("terror").slice(0, 3);
    return {
      answer: `Se quer terror: ${list.map((m) => m.title).join(", ") || "A Casa Sombria"}. Posso reservar uma sessão 3D à noite.`,
      suggestions: ["Sessões de terror hoje à noite", "Campanha de terror"],
      href: "/filmes?genero=terror",
    };
  }
  if (intent.action) {
    const list = byGenre("acao").slice(0, 3);
    return {
      answer: `Para acção: ${list.map((m) => m.title).join(", ")}. Horizonte Vermelho e Operação Midnight estão em cartaz com sessões IMAX.`,
      suggestions: ["Comprar bilhete IMAX", "Filmes semelhantes"],
      href: "/filmes?genero=acao",
    };
  }
  if (intent.premiere) {
    const upcoming = facts.movies.filter((m) => m.status === "COMING_SOON" || (m.releaseDate && m.releaseDate > facts.now));
    return {
      answer: upcoming.length
        ? `Estreias: ${upcoming.map((m) => `${m.title} (${m.releaseDate?.toLocaleDateString("pt-PT")})`).join("; ")}.`
        : "Consulte Lançamentos no menu — temos estreias todas as quintas.",
      suggestions: ["Em cartaz esta semana", "CINEMAX+ novidades"],
      href: "/estreias",
    };
  }
  if (intent.tonight || intent.ticket) {
    const tonight = facts.sessions.filter((s) => {
      const h = s.startsAt.getHours();
      return s.startsAt.toDateString() === facts.now.toDateString() ? h >= 18 : true;
    }).slice(0, 5);
    if (!tonight.length) {
      return {
        answer: "Ainda posso ajudar a escolher um filme e um cinema. Abra Comprar Bilhete para ver a grelha completa.",
        suggestions: ["Cinemas em Luanda", "Filmes em cartaz"],
      };
    }
    return {
      answer: `Sessões próximas:\n${tonight
        .map(
          (s) =>
            `• ${s.movie.title} — ${s.cinema.name}, ${s.room.name}, ${s.startsAt.toLocaleString("pt-PT")}, ${s.format}, ${formatCurrency(s.price)}`,
        )
        .join("\n")}`,
      suggestions: ["Dois bilhetes 3D", "Adicionar pipoca"],
      href: "/bilhetes",
    };
  }
  if (intent.cinema) {
    return {
      answer: `Cinemas CINEMAX: ${facts.cinemas.map((c) => `${c.name} (${c.city})`).join(" · ")}. O mais central em Luanda é o CINEMAX Luanda Fortaleza, na Marginal.`,
      suggestions: ["Ver sessões em Talatona", "Salas IMAX"],
      href: "/cinemas",
    };
  }
  if (intent.price) {
    const sample = facts.sessions[0];
    return {
      answer: `Bilhetes a partir de ${formatCurrency(sample?.price ?? 3500)}. 3D e IMAX têm preço premium. Combos pipoca+bebida desde ${formatCurrency(facts.products.find((p) => p.slug.includes("combo"))?.price ?? 4500)}.`,
      suggestions: ["Promoções activas", "CINEMAX Club pontos"],
    };
  }
  if (intent.plus) {
    return {
      answer: `Planos CINEMAX+: ${facts.plans.map((p) => `${p.name} ${formatCurrency(p.monthlyPrice)}/mês`).join(" · ")}. Trial configurável no primeiro mês.`,
      suggestions: ["Comparar planos", "Começar trial"],
      href: "/cinemax-plus",
    };
  }
  if (intent.extras) {
    return {
      answer: `Na loja: ${facts.products
        .slice(0, 6)
        .map((p) => `${p.name} ${formatCurrency(p.price)}`)
        .join(" · ")}. Óculos 3D podem ser adicionados no checkout.`,
      suggestions: ["Combo casal", "Pipoca caramelizada"],
      href: "/loja",
    };
  }

  const rec = facts.movies.slice(0, 4);
  return {
    answer: `Sou a CINEMAX AI. Com base no catálogo actual, destaco ${rec.map((m) => m.title).join(", ")}. Pergunte-me por género, sessão, cinema ou CINEMAX+.`,
    suggestions: [
      "Qual filme de acção recomendas?",
      "Quero um filme para ver com crianças.",
      "Existe uma sessão hoje à noite?",
      "Quanto custa um bilhete?",
    ],
  };
}
