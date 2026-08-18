"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { prisma } from "@/server/db/prisma";
import { getSession, canAccessAdmin } from "@/server/auth/session";
import { getPaymentGateway } from "@/server/services/payments";
import { loyaltyTier, TICKET_HOLD_MS } from "@/shared/lib/utils";
import { cookies } from "next/headers";
import QRCode from "qrcode";

export async function holdSeats(sessionId: string, seatIds: string[]) {
  const user = await getSession();
  if (!user) return { error: "Inicie sessão para reservar lugares." };
  if (!seatIds.length) return { error: "Seleccione pelo menos um lugar." };
  const token = nanoid();
  const expiresAt = new Date(Date.now() + TICKET_HOLD_MS);
  await prisma.seatHold.updateMany({
    where: { expiresAt: { lt: new Date() }, status: "HOLD" },
    data: { status: "EXPIRED" },
  });
  const taken = await prisma.ticketItem.findMany({
    where: { seatId: { in: seatIds }, ticket: { sessionId, status: { in: ["PAID", "PENDING"] } } },
  });
  const held = await prisma.seatHold.findMany({
    where: { sessionId, seatId: { in: seatIds }, status: "HOLD", expiresAt: { gt: new Date() } },
  });
  if (taken.length || held.length) return { error: "Um ou mais lugares já não estão disponíveis." };

  await prisma.$transaction(
    seatIds.map((seatId) =>
      prisma.seatHold.create({ data: { sessionId, seatId, userId: user.id, token, expiresAt, status: "HOLD" } }),
    ),
  );
  return { token, expiresAt: expiresAt.toISOString() };
}

export async function completeCheckout(input: {
  sessionId: string;
  seatIds: string[];
  extras: { productId: string; qty: number }[];
  method: "CARD" | "MULTICAIXA" | "REFERENCE" | "TRANSFER" | "WALLET" | "PAYPAL" | "STRIPE";
  coupon?: string;
}) {
  const user = await getSession();
  if (!user) return { error: "Inicie sessão." };
  const show = await prisma.session.findUnique({
    where: { id: input.sessionId },
    include: { movie: true, cinema: true, room: true },
  });
  if (!show) return { error: "Sessão inválida." };

  const settings = await prisma.setting.findUnique({ where: { key: "bookingFee" } });
  const fee = Number(settings?.value || 250);
  const extras = await prisma.product.findMany({ where: { id: { in: input.extras.map((e) => e.productId) } } });
  const extrasTotal = input.extras.reduce((sum, e) => {
    const p = extras.find((x) => x.id === e.productId);
    return sum + (p ? p.price * e.qty : 0);
  }, 0);
  let discount = 0;
  if (input.coupon) {
    const coupon = await prisma.coupon.findUnique({ where: { code: input.coupon.toUpperCase() } });
    if (coupon && coupon.active && coupon.endsAt > new Date()) {
      discount = coupon.type === "PERCENT" ? Math.round(((show.price * input.seatIds.length) * coupon.value) / 100) : coupon.value;
    }
  }
  const subtotal = show.price * input.seatIds.length + extrasTotal;
  const total = Math.max(0, subtotal + fee - discount);

  const intent = await getPaymentGateway().charge({
    amount: total,
    currency: "AOA",
    method: input.method,
    metadata: { sessionId: show.id, userId: user.id },
  });
  if (intent.status === "FAILED") return { error: "Pagamento recusado. Tente outro método." };
  const paid = intent.status === "PAID";

  const code = `ORD-${nanoid(8).toUpperCase()}`;
  const ticketCode = `TKT-${nanoid(8).toUpperCase()}`;
  const qrPayload = `CINEMAX:${ticketCode}`;

  const order = await prisma.$transaction(async (tx) => {
    const conflict = await tx.ticketItem.findFirst({
      where: { seatId: { in: input.seatIds }, ticket: { sessionId: show.id, status: { in: ["PAID", "PENDING"] } } },
    });
    if (conflict) throw new Error("SEAT_TAKEN");
    const created = await tx.order.create({
      data: {
        code,
        userId: user.id,
        type: "TICKET",
        status: paid ? "PAID" : "PENDING",
        subtotal,
        discount,
        fees: fee,
        total,
        items: {
          create: input.extras.map((e) => {
            const p = extras.find((x) => x.id === e.productId)!;
            return { productId: p.id, name: p.name, quantity: e.qty, unitPrice: p.price, total: p.price * e.qty };
          }),
        },
      },
    });
    await tx.payment.create({
      data: {
        userId: user.id,
        orderId: created.id,
        provider: "mock",
        method: input.method,
        amount: total,
        status: paid ? "PAID" : "PENDING",
        reference: intent.reference,
        paidAt: paid ? new Date() : null,
      },
    });
    const ticket = await tx.ticket.create({
      data: {
        code: ticketCode,
        userId: user.id,
        sessionId: show.id,
        orderId: created.id,
        status: paid ? "PAID" : "PENDING",
        qrPayload,
        items: { create: input.seatIds.map((seatId) => ({ seatId, price: show.price })) },
      },
    });
    await tx.seatHold.updateMany({
      where: { sessionId: show.id, seatId: { in: input.seatIds }, userId: user.id, status: "HOLD" },
      data: { status: "CONFIRMED" },
    });
    if (paid) {
    const points = 50 * input.seatIds.length + Math.round(extrasTotal / 100);
    await tx.loyaltyAccount.upsert({
      where: { userId: user.id },
      update: { points: { increment: points }, lifetime: { increment: points } },
      create: { userId: user.id, points, lifetime: points, tier: "BRONZE" },
    });
    const acc = await tx.loyaltyAccount.findUnique({ where: { userId: user.id } });
    if (acc) {
      await tx.loyaltyAccount.update({ where: { id: acc.id }, data: { tier: loyaltyTier(acc.lifetime + points) } });
      await tx.loyaltyTransaction.create({ data: { accountId: acc.id, points, reason: "Compra de bilhete", ref: ticket.code } });
    }
    }
    await tx.notification.create({
      data: {
        userId: user.id,
        title: paid ? "Compra confirmada" : "Aguardando pagamento",
        body: `${show.movie.title} · ${show.cinema.name}`,
        type: "TICKET",
        href: `/conta/bilhetes/${ticket.id}`,
      },
    });
    void ticket;
    return created;
  });

  revalidatePath("/conta");
  const qr = await QRCode.toDataURL(qrPayload);
  if (!paid) {
    return {
      pending: true,
      orderId: order.id,
      ticketCode,
      qr,
      total,
      instructions: intent.instructions,
      reference: intent.reference,
    };
  }
  return { ok: true, orderId: order.id, ticketCode, qr, total };
}

export async function confirmPayment(orderId: string) {
  const user = await getSession();
  if (!user) return { error: "login" };
  const order = await prisma.order.findFirst({ where: { id: orderId, userId: user.id }, include: { tickets: true, payments: true } });
  if (!order) return { error: "Pedido inválido." };
  await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });
  await prisma.payment.updateMany({ where: { orderId: order.id }, data: { status: "PAID", paidAt: new Date() } });
  await prisma.ticket.updateMany({ where: { orderId: order.id }, data: { status: "PAID" } });
  revalidatePath("/conta");
  return { ok: true };
}

export async function checkInTicket(code: string) {
  const user = await getSession();
  if (!user) return { error: "login" };
  if (!canAccessAdmin(user.role)) return { error: "Apenas a equipa de sala pode validar bilhetes." };
  const ticket = await prisma.ticket.findUnique({
    where: { code: code.replace(/^CINEMAX:/, "").trim() },
    include: { session: { include: { movie: true, cinema: true, room: true } }, items: { include: { seat: true } } },
  });
  if (!ticket) return { error: "Bilhete não encontrado." };
  if (ticket.status !== "PAID") return { error: `Estado actual: ${ticket.status}` };
  if (ticket.checkedInAt) return { error: "Já foi utilizado.", ticket };
  await prisma.ticket.update({ where: { id: ticket.id }, data: { status: "USED", checkedInAt: new Date() } });
  return { ok: true, ticket: { ...ticket, checkedInAt: new Date() } };
}

export async function toggleWatchlist(movieId: string) {
  const user = await getSession();
  if (!user) return { error: "login" };
  const existing = await prisma.watchlistItem.findFirst({ where: { userId: user.id, movieId } });
  if (existing) await prisma.watchlistItem.delete({ where: { id: existing.id } });
  else await prisma.watchlistItem.create({ data: { userId: user.id, movieId } });
  revalidatePath("/");
  return { ok: true };
}

export async function saveWatchProgress(input: {
  movieId?: string;
  episodeId?: string;
  seriesId?: string;
  progressSec: number;
  durationSec: number;
}) {
  const user = await getSession();
  if (!user) return;
  const { movieId, episodeId, seriesId, progressSec, durationSec } = input;
  if (!movieId && !episodeId) return;
  const existing = await prisma.watchHistory.findFirst({
    where: movieId ? { userId: user.id, movieId } : { userId: user.id, episodeId },
  });
  const data = {
    progressSec,
    durationSec,
    completed: durationSec > 0 && progressSec / durationSec > 0.9,
    movieId: movieId || null,
    episodeId: episodeId || null,
    seriesId: seriesId || null,
  };
  if (existing) await prisma.watchHistory.update({ where: { id: existing.id }, data });
  else await prisma.watchHistory.create({ data: { userId: user.id, ...data } });
}

export async function requestRefundAction(formData: FormData) {
  const user = await getSession();
  if (!user) redirect("/entrar");
  const id = String(formData.get("ticketId") || "");
  const fail = (reason: string) => redirect(`/conta/bilhetes/${id}?refund=${encodeURIComponent(reason)}`);
  const ticket = await prisma.ticket.findFirst({
    where: { id, userId: user.id },
    include: { session: true },
  });
  if (!ticket) redirect("/conta");
  if (ticket.checkedInAt) fail("used");
  if (!["PAID", "PENDING"].includes(ticket.status)) fail("invalid");
  if (ticket.session.startsAt.getTime() < Date.now() - 30 * 60 * 1000) fail("late");
  await prisma.ticket.update({ where: { id: ticket.id }, data: { status: "REFUND_REQUESTED" } });
  if (ticket.orderId) {
    await prisma.order.update({ where: { id: ticket.orderId }, data: { status: "REFUND_REQUESTED" } }).catch(() => undefined);
  }
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "Pedido de reembolso",
      body: `O bilhete ${ticket.code} está em análise.`,
      type: "SYSTEM",
      href: `/conta/bilhetes/${ticket.id}`,
    },
  });
  revalidatePath("/conta");
  revalidatePath(`/conta/bilhetes/${ticket.id}`);
  redirect(`/conta/bilhetes/${ticket.id}?refund=1`);
}

export async function subscribePlan(planId: string, interval: "MONTHLY" | "YEARLY") {
  const user = await getSession();
  if (!user) return { error: "login" };
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) return { error: "Plano inválido." };
  const amount = interval === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;
  const intent = await getPaymentGateway().charge({
    amount,
    currency: plan.currency,
    method: "CARD",
    metadata: { planId },
  });
  const end = new Date();
  end.setDate(end.getDate() + (interval === "YEARLY" ? 365 : 30));
  await prisma.subscription.create({
    data: {
      userId: user.id,
      planId,
      status: "ACTIVE",
      interval,
      currentPeriodEnd: end,
    },
  });
  await prisma.payment.create({
    data: {
      userId: user.id,
      provider: "mock",
      method: "CARD",
      amount,
      status: intent.status,
      reference: intent.reference,
      paidAt: new Date(),
    },
  });
  revalidatePath("/cinemax-plus");
  return { ok: true };
}

const SHOP_CART = "cinemax-shop";

export async function readShopCart(): Promise<Record<string, number>> {
  const jar = await cookies();
  try {
    const parsed = JSON.parse(jar.get(SHOP_CART)?.value || "{}") as Record<string, number>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeShopCart(cart: Record<string, number>) {
  const jar = await cookies();
  jar.set(SHOP_CART, JSON.stringify(cart), { path: "/", maxAge: 60 * 60 * 24 * 14 });
}

export async function addShopItem(productId: string) {
  const cart = await readShopCart();
  cart[productId] = (cart[productId] || 0) + 1;
  await writeShopCart(cart);
  revalidatePath("/loja");
  revalidatePath("/loja/carrinho");
  return { ok: true, qty: cart[productId] };
}

export async function updateShopItem(productId: string, qty: number) {
  const cart = await readShopCart();
  if (qty <= 0) delete cart[productId];
  else cart[productId] = qty;
  await writeShopCart(cart);
  revalidatePath("/loja/carrinho");
}

export async function checkoutShop(method: "CARD" | "MULTICAIXA" | "REFERENCE" | "TRANSFER" | "WALLET" | "PAYPAL" | "STRIPE") {
  const user = await getSession();
  if (!user) return { error: "Inicie sessão para comprar extras." };
  const cart = await readShopCart();
  const ids = Object.keys(cart);
  if (!ids.length) return { error: "O carrinho está vazio." };
  const products = await prisma.product.findMany({ where: { id: { in: ids }, status: "ACTIVE" } });
  const subtotal = products.reduce((s, p) => s + p.price * (cart[p.id] || 0), 0);
  const intent = await getPaymentGateway().charge({
    amount: subtotal,
    currency: "AOA",
    method,
    metadata: { userId: user.id, type: "SHOP" },
  });
  if (intent.status === "FAILED") return { error: "Pagamento recusado." };
  const paid = intent.status === "PAID";
  const code = `ORD-${nanoid(8).toUpperCase()}`;
  await prisma.order.create({
    data: {
      code,
      userId: user.id,
      type: "SHOP",
      status: paid ? "PAID" : "PENDING",
      subtotal,
      total: subtotal,
      items: {
        create: products.map((p) => ({
          productId: p.id,
          name: p.name,
          quantity: cart[p.id],
          unitPrice: p.price,
          total: p.price * cart[p.id],
        })),
      },
      payments: {
        create: {
          userId: user.id,
          provider: "mock",
          method,
          amount: subtotal,
          status: paid ? "PAID" : "PENDING",
          reference: intent.reference,
          paidAt: paid ? new Date() : null,
        },
      },
    },
  });
  await writeShopCart({});
  revalidatePath("/conta");
  revalidatePath("/loja");
  return { ok: true, pending: !paid, reference: intent.reference, instructions: intent.instructions, total: subtotal, code };
}
