"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { getSession, hasPermission } from "@/server/auth/session";
import { setSettings } from "@/server/services/settings";

async function guard() {
  const u = await getSession();
  if (!u || !hasPermission(u.role, "settings") && !hasPermission(u.role, "*") && u.role !== "SUPER_ADMIN" && u.role !== "ADMIN" && u.role !== "CONTENT_MANAGER" && u.role !== "MARKETING") {
    if (!u) throw new Error("UNAUTH");
  }
  return u!;
}

export async function setHeroMovie(movieId: string) {
  await guard();
  await prisma.movie.updateMany({ data: { heroEnabled: false } });
  await prisma.movie.update({ where: { id: movieId }, data: { heroEnabled: true, heroOrder: 1, featured: true } });
  revalidatePath("/");
  revalidatePath("/admin/conteudo/banners");
}

export async function saveSettingsAction(formData: FormData) {
  await guard();
  const keys = ["brandName", "tagline", "currency", "defaultLocale", "preloaderEnabled", "heroVideoUrl", "bookingFee", "supportEmail", "supportPhone"];
  const values: Record<string, string> = {};
  for (const k of keys) values[k] = String(formData.get(k) || "");
  await setSettings(values);
  revalidatePath("/");
  revalidatePath("/admin/configuracoes");
}

export async function generateCampaign(prompt: string) {
  await guard();
  const copy = `Campanha: ${prompt}
Nome: Noite Vermelha CINEMAX
Público: 18-34, fãs do género
Desconto: 20% (cupão ESTREIA20)
Canais: Hero, push, email, Instagram
CTA: COMPRAR BILHETE
Datas: sexta a domingo`;
  await prisma.campaign.create({
    data: {
      title: `IA · ${prompt.slice(0, 40)}`,
      objective: prompt,
      audience: "18-34",
      channels: JSON.stringify(["hero", "push", "email"]),
      copy,
      cta: "COMPRAR BILHETE",
      discount: "ESTREIA20",
      status: "DRAFT",
    },
  });
  revalidatePath("/admin/marketing/campanhas");
  return copy;
}

export async function createMovieAction(formData: FormData) {
  await guard();
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  await prisma.movie.create({
    data: {
      title,
      slug: `${slug}-${Date.now().toString(36)}`,
      synopsis: String(formData.get("synopsis") || ""),
      originalTitle: String(formData.get("originalTitle") || title),
      posterUrl: String(formData.get("posterUrl") || ""),
      backdropUrl: String(formData.get("backdropUrl") || ""),
      trailerUrl: String(formData.get("trailerUrl") || ""),
      videoUrl: String(formData.get("videoUrl") || ""),
      year: Number(formData.get("year") || new Date().getFullYear()),
      durationMin: Number(formData.get("durationMin") || 120),
      rating: String(formData.get("rating") || "M/12"),
      director: String(formData.get("director") || "A definir"),
      cinemaAvailable: formData.get("cinemaAvailable") === "on",
      streamingAvailable: formData.get("streamingAvailable") === "on",
      status: String(formData.get("status") || "NOW_SHOWING"),
    },
  });
  revalidatePath("/admin/conteudo/filmes");
  revalidatePath("/filmes");
  redirect("/admin/conteudo/filmes");
}

export async function updateMovieAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.movie.update({
    where: { id },
    data: {
      title: String(formData.get("title") || ""),
      originalTitle: String(formData.get("originalTitle") || ""),
      synopsis: String(formData.get("synopsis") || ""),
      posterUrl: String(formData.get("posterUrl") || ""),
      backdropUrl: String(formData.get("backdropUrl") || ""),
      trailerUrl: String(formData.get("trailerUrl") || ""),
      videoUrl: String(formData.get("videoUrl") || ""),
      year: Number(formData.get("year") || new Date().getFullYear()),
      durationMin: Number(formData.get("durationMin") || 120),
      rating: String(formData.get("rating") || "M/12"),
      director: String(formData.get("director") || "A definir"),
      cinemaAvailable: formData.get("cinemaAvailable") === "on",
      streamingAvailable: formData.get("streamingAvailable") === "on",
      status: String(formData.get("status") || "NOW_SHOWING"),
    },
  });
  revalidatePath("/admin/conteudo/filmes");
  revalidatePath("/filmes");
  redirect("/admin/conteudo/filmes");
}

export async function updateSeatTypeAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") || "");
  const type = String(formData.get("type") || "STANDARD");
  await prisma.seat.update({ where: { id }, data: { type } });
  revalidatePath("/admin/cinema/salas");
}

export async function toggleTwoFactorAction(formData: FormData) {
  const u = await guard();
  const enable = formData.get("enable") === "on";
  await prisma.user.update({
    where: { id: u.id },
    data: { twoFactorEnabled: enable, twoFactorSecret: enable ? "DEMO-CINEMAX-2FA" : null },
  });
  revalidatePath("/admin/configuracoes");
}

export async function createSessionAction(formData: FormData) {
  await guard();
  const movieId = String(formData.get("movieId"));
  const cinemaId = String(formData.get("cinemaId"));
  const roomId = String(formData.get("roomId"));
  const startsAt = new Date(String(formData.get("startsAt")));
  const duration = Number(formData.get("durationMin") || 120);
  const endsAt = new Date(startsAt.getTime() + duration * 60000);
  const clash = await prisma.session.findFirst({
    where: {
      roomId,
      status: "SCHEDULED",
      AND: [{ startsAt: { lt: endsAt } }, { endsAt: { gt: startsAt } }],
    },
  });
  if (clash) redirect("/admin/cinema/sessoes/nova?erro=conflito");
  await prisma.session.create({
    data: {
      movieId,
      cinemaId,
      roomId,
      startsAt,
      endsAt,
      format: String(formData.get("format") || "2D"),
      language: String(formData.get("language") || "pt"),
      price: Number(formData.get("price") || 3500),
      status: "SCHEDULED",
    },
  });
  revalidatePath("/admin/cinema/sessoes");
  revalidatePath("/sessoes");
  redirect("/admin/cinema/sessoes");
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function saveBannerAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") || "");
  const data = {
    title: String(formData.get("title") || "Banner CINEMAX"),
    subtitle: String(formData.get("subtitle") || ""),
    imageUrl: String(formData.get("imageUrl") || ""),
    ctaLabel: String(formData.get("ctaLabel") || "Ver mais"),
    ctaHref: String(formData.get("ctaHref") || "/filmes"),
    placement: String(formData.get("placement") || "HOME"),
    active: formData.get("active") === "on",
    sortOrder: Number(formData.get("sortOrder") || 0),
  };
  if (id) await prisma.banner.update({ where: { id }, data });
  else await prisma.banner.create({ data });
  revalidatePath("/");
  revalidatePath("/admin/conteudo/banners");
}

export async function savePromotionAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "Promoção");
  const data = {
    title,
    slug: slugify(title) + (id ? "" : `-${Date.now().toString(36)}`),
    description: String(formData.get("description") || ""),
    type: String(formData.get("type") || "FLASH"),
    imageUrl: String(formData.get("imageUrl") || ""),
    discount: Number(formData.get("discount") || 0) || null,
    startsAt: new Date(String(formData.get("startsAt") || Date.now())),
    endsAt: new Date(String(formData.get("endsAt") || Date.now() + 86400000 * 30)),
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
  };
  if (id) {
    const { slug, ...rest } = data;
    void slug;
    await prisma.promotion.update({ where: { id }, data: rest });
  } else {
    await prisma.promotion.create({ data });
  }
  revalidatePath("/promocoes");
  revalidatePath("/admin/marketing/promocoes");
}

export async function updateOrderStatusAction(formData: FormData) {
  await guard();
  await prisma.order.update({
    where: { id: String(formData.get("id")) },
    data: { status: String(formData.get("status") || "PENDING") },
  });
  revalidatePath("/admin/vendas/pedidos");
}

export async function updateCustomerAction(formData: FormData) {
  await guard();
  await prisma.user.update({
    where: { id: String(formData.get("id")) },
    data: { status: String(formData.get("status") || "ACTIVE") },
  });
  revalidatePath("/admin/clientes");
}

export async function updateInventoryAction(formData: FormData) {
  await guard();
  await prisma.inventoryItem.update({
    where: { id: String(formData.get("id")) },
    data: { stock: Number(formData.get("stock") || 0), minStock: Number(formData.get("minStock") || 20) },
  });
  revalidatePath("/admin/inventario");
}

export async function updatePaymentStatusAction(formData: FormData) {
  await guard();
  const status = String(formData.get("status") || "PENDING");
  await prisma.payment.update({
    where: { id: String(formData.get("id")) },
    data: { status, paidAt: status === "PAID" ? new Date() : null },
  });
  revalidatePath("/admin/vendas/pagamentos");
}

export async function updateCampaignStatusAction(formData: FormData) {
  await guard();
  await prisma.campaign.update({
    where: { id: String(formData.get("id")) },
    data: { status: String(formData.get("status") || "DRAFT") },
  });
  revalidatePath("/admin/marketing/campanhas");
}

export async function updateLicenseAction(formData: FormData) {
  await guard();
  await prisma.contentLicense.update({
    where: { id: String(formData.get("id")) },
    data: {
      status: String(formData.get("status") || "ACTIVE"),
      cinemaOk: formData.get("cinemaOk") === "on",
      streamingOk: formData.get("streamingOk") === "on",
    },
  });
  revalidatePath("/admin/streaming/licencas");
}

export async function updateStaffAction(formData: FormData) {
  await guard();
  await prisma.user.update({
    where: { id: String(formData.get("id")) },
    data: { role: String(formData.get("role") || "STAFF") },
  });
  revalidatePath("/admin/funcionarios");
}

export async function createSeriesAction(formData: FormData) {
  await guard();
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await prisma.series.create({
    data: {
      title,
      slug: `${slugify(title)}-${Date.now().toString(36)}`,
      synopsis: String(formData.get("synopsis") || ""),
      posterUrl: String(formData.get("posterUrl") || ""),
      backdropUrl: String(formData.get("backdropUrl") || ""),
      trailerUrl: String(formData.get("trailerUrl") || ""),
      year: Number(formData.get("year") || new Date().getFullYear()),
      rating: String(formData.get("rating") || "M/12"),
      status: String(formData.get("status") || "PUBLISHED"),
      streamingAvailable: formData.get("streamingAvailable") === "on",
    },
  });
  revalidatePath("/admin/conteudo/series");
  revalidatePath("/series");
  redirect("/admin/conteudo/series");
}

export async function updateSeriesAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.series.update({
    where: { id },
    data: {
      title: String(formData.get("title") || ""),
      synopsis: String(formData.get("synopsis") || ""),
      posterUrl: String(formData.get("posterUrl") || ""),
      backdropUrl: String(formData.get("backdropUrl") || ""),
      trailerUrl: String(formData.get("trailerUrl") || ""),
      year: Number(formData.get("year") || new Date().getFullYear()),
      rating: String(formData.get("rating") || "M/12"),
      status: String(formData.get("status") || "PUBLISHED"),
      streamingAvailable: formData.get("streamingAvailable") === "on",
    },
  });
  revalidatePath("/admin/conteudo/series");
  revalidatePath("/series");
  redirect("/admin/conteudo/series");
}

export async function createSeasonAction(formData: FormData) {
  await guard();
  const seriesId = String(formData.get("seriesId") || "");
  if (!seriesId) return;
  const last = await prisma.season.findFirst({ where: { seriesId }, orderBy: { number: "desc" } });
  const number = Number(formData.get("number") || (last ? last.number + 1 : 1));
  await prisma.season.create({
    data: {
      seriesId,
      number,
      title: String(formData.get("title") || `Temporada ${number}`),
      synopsis: String(formData.get("synopsis") || "") || null,
      year: Number(formData.get("year") || new Date().getFullYear()),
      posterUrl: String(formData.get("posterUrl") || "") || null,
    },
  });
  revalidatePath(`/admin/conteudo/series/${seriesId}`);
  revalidatePath("/series");
}

export async function createEpisodeAction(formData: FormData) {
  await guard();
  const seasonId = String(formData.get("seasonId") || "");
  const seriesId = String(formData.get("seriesId") || "");
  if (!seasonId) return;
  const last = await prisma.episode.findFirst({ where: { seasonId }, orderBy: { number: "desc" } });
  const number = Number(formData.get("number") || (last ? last.number + 1 : 1));
  await prisma.episode.create({
    data: {
      seasonId,
      number,
      title: String(formData.get("title") || `Episódio ${number}`),
      synopsis: String(formData.get("synopsis") || "") || null,
      durationMin: Number(formData.get("durationMin") || 42),
      videoUrl: String(formData.get("videoUrl") || "") || null,
      thumbnailUrl: String(formData.get("thumbnailUrl") || "") || null,
    },
  });
  revalidatePath(`/admin/conteudo/series/${seriesId}`);
  revalidatePath("/series");
}

export async function updateEpisodeAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") || "");
  const seriesId = String(formData.get("seriesId") || "");
  if (!id) return;
  await prisma.episode.update({
    where: { id },
    data: {
      title: String(formData.get("title") || ""),
      synopsis: String(formData.get("synopsis") || "") || null,
      durationMin: Number(formData.get("durationMin") || 42),
      videoUrl: String(formData.get("videoUrl") || "") || null,
      thumbnailUrl: String(formData.get("thumbnailUrl") || "") || null,
    },
  });
  revalidatePath(`/admin/conteudo/series/${seriesId}`);
}

export async function updateTicketStatusAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status) return;
  const ticket = await prisma.ticket.update({ where: { id }, data: { status } });
  if (status === "REFUNDED" && ticket.orderId) {
    await prisma.order.update({ where: { id: ticket.orderId }, data: { status: "REFUNDED" } }).catch(() => undefined);
  }
  revalidatePath("/admin/vendas/bilhetes");
}

async function seedRoomSeats(roomId: string, rows: number, cols: number) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let y = 0; y < rows; y++) {
    for (let x = 1; x <= cols; x++) {
      const isAisle = x === 4 || x === cols - 3;
      let type = "STANDARD";
      if (y >= rows - 2) type = "VIP";
      if (y === 0 && (x === 1 || x === 2)) type = "ACCESSIBLE";
      await prisma.seat.create({
        data: {
          roomId,
          row: letters[y] || "Z",
          number: x,
          type: isAisle ? "DISABLED" : type,
          posX: x,
          posY: y,
          isAisle,
        },
      });
    }
  }
}

export async function createCinemaAction(formData: FormData) {
  await guard();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const cinema = await prisma.cinema.create({
    data: {
      name,
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      address: String(formData.get("address") || ""),
      city: String(formData.get("city") || "Luanda"),
      country: String(formData.get("country") || "Angola"),
      latitude: Number(formData.get("latitude") || 0) || null,
      longitude: Number(formData.get("longitude") || 0) || null,
      phone: String(formData.get("phone") || "") || null,
      email: String(formData.get("email") || "") || null,
      openingHours: String(formData.get("openingHours") || "10:00–23:00"),
      imageUrl: String(formData.get("imageUrl") || ""),
      parking: formData.get("parking") === "on",
      accessible: formData.get("accessible") === "on",
      status: String(formData.get("status") || "ACTIVE"),
    },
  });
  if (formData.get("defaultRoom") === "on") {
    const room = await prisma.room.create({
      data: {
        cinemaId: cinema.id,
        name: "Sala 1",
        number: 1,
        capacity: 8 * 12 - 16,
        type: "STANDARD",
        rows: 8,
        columns: 12,
        imageUrl: cinema.imageUrl,
      },
    });
    await seedRoomSeats(room.id, 8, 12);
  }
  revalidatePath("/admin/cinema/cinemas");
  revalidatePath("/cinemas");
  redirect("/admin/cinema/cinemas");
}

export async function updateCinemaAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.cinema.update({
    where: { id },
    data: {
      name: String(formData.get("name") || ""),
      address: String(formData.get("address") || ""),
      city: String(formData.get("city") || ""),
      country: String(formData.get("country") || "Angola"),
      latitude: Number(formData.get("latitude") || 0) || null,
      longitude: Number(formData.get("longitude") || 0) || null,
      phone: String(formData.get("phone") || "") || null,
      email: String(formData.get("email") || "") || null,
      openingHours: String(formData.get("openingHours") || "10:00–23:00"),
      imageUrl: String(formData.get("imageUrl") || ""),
      parking: formData.get("parking") === "on",
      accessible: formData.get("accessible") === "on",
      status: String(formData.get("status") || "ACTIVE"),
    },
  });
  revalidatePath("/admin/cinema/cinemas");
  revalidatePath("/cinemas");
  redirect("/admin/cinema/cinemas");
}
