"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { completeCheckout, holdSeats, confirmPayment } from "@/features/checkout/actions";
import { Cover } from "@/shared/components/Cover";
import { formatCurrency } from "@/shared/lib/utils";
import { PAYMENT_METHODS } from "@/shared/lib/payments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/shared/lib/i18n";

type Seat = { id: string; row: string; number: number; type: string; status: string; posX: number; posY: number; isAisle: boolean };
type Product = { id: string; name: string; price: number; slug: string; imageUrl: string; category: { slug: string } };

export function CheckoutWizard({
  session,
  seats,
  occupied,
  products,
  fee,
  dict,
}: {
  session: {
    id: string;
    price: number;
    format: string;
    startsAt: string;
    movie: { title: string; posterUrl: string };
    cinema: { name: string };
    room: { name: string };
  };
  seats: Seat[];
  occupied: string[];
  products: Product[];
  fee: number;
  dict: Dictionary;
}) {
  const router = useRouter();
  const [step, setStep] = useState(2);
  const [selected, setSelected] = useState<string[]>([]);
  const [holdUntil, setHoldUntil] = useState<Date | null>(null);
  const [now, setNow] = useState(Date.now());
  const [extras, setExtras] = useState<Record<string, number>>({});
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]["id"]>("MULTICAIXA");
  const [coupon, setCoupon] = useState("");
  const [result, setResult] = useState<{ qr: string; ticketCode: string; total: number; pending?: boolean; instructions?: string; orderId?: string; reference?: string } | null>(null);
  const [pending, start] = useTransition();
  const [liveOccupied, setLiveOccupied] = useState(occupied);
  const [drawer, setDrawer] = useState(false);
  const STEPS = [
    dict.checkout.movie,
    dict.checkout.session,
    dict.checkout.seat,
    dict.checkout.extras,
    dict.checkout.payment,
    dict.checkout.confirmation,
  ];

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(async () => {
      const res = await fetch(`/api/sessions/${session.id}/seats`);
      if (!res.ok) return;
      const data = await res.json();
      setLiveOccupied(data.occupied || []);
    }, 4000);
    return () => clearInterval(t);
  }, [session.id]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remain = holdUntil ? Math.max(0, Math.floor((holdUntil.getTime() - now) / 1000)) : 0;

  const extrasTotal = useMemo(
    () => products.reduce((s, p) => s + (extras[p.id] || 0) * p.price, 0),
    [extras, products],
  );
  const subtotal = session.price * selected.length + extrasTotal;
  const total = subtotal + fee;

  async function toggleSeat(id: string) {
    if (occupied.includes(id) || liveOccupied.includes(id)) return;
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    setSelected(next);
    if (next.length) {
      const res = await holdSeats(session.id, next);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (res.expiresAt) setHoldUntil(new Date(res.expiresAt));
    }
  }

  function pay() {
    start(async () => {
      const res = await completeCheckout({
        sessionId: session.id,
        seatIds: selected,
        extras: Object.entries(extras)
          .filter(([, q]) => q > 0)
          .map(([productId, qty]) => ({ productId, qty })),
        method,
        coupon: coupon || undefined,
      });
      if (res.error) {
        toast.error(res.error);
        if (res.error.includes("sessão")) router.push("/entrar?next=/checkout/" + session.id);
        return;
      }
      if (res.pending && res.qr && res.ticketCode) {
        setResult({ qr: res.qr, ticketCode: res.ticketCode, total: res.total || total, pending: true, instructions: res.instructions, orderId: res.orderId, reference: res.reference });
        setStep(5);
        toast.message(dict.checkout.waiting);
        return;
      }
      if (res.ok && res.qr && res.ticketCode) {
        setResult({ qr: res.qr, ticketCode: res.ticketCode, total: res.total || total });
        setStep(5);
        toast.success("Enjoy the Movie!");
        burstConfetti();
      }
    });
  }

  return (
    <div className="mx-auto grid max-w-[1600px] gap-8 px-4 pt-28 pb-16 lg:grid-cols-[1fr_340px] md:px-8">
      <div>
        <ol className="mb-8 flex flex-wrap gap-2 text-[10px] tracking-[0.2em]">
          {STEPS.map((s, i) => (
            <li key={s} className={`rounded-full px-3 py-1 ${i === step ? "bg-cx-red" : "bg-white/5 text-cx-muted"}`}>
              {s}
            </li>
          ))}
        </ol>

        {step === 2 ? (
          <div>
            <h1 className="font-display text-3xl">{dict.checkout.chooseSeats}</h1>
            {holdUntil && remain > 0 ? (
              <p className="mt-2 text-cx-gold">
                {dict.checkout.reserved} {String(Math.floor(remain / 60)).padStart(2, "0")}:{String(remain % 60).padStart(2, "0")}
              </p>
            ) : null}
            <div className="mx-auto mt-8 max-w-3xl">
              <div className="mb-6 h-3 rounded-full bg-gradient-to-b from-white/40 to-transparent" />
              <p className="mb-4 text-center text-xs tracking-[0.4em] text-cx-muted">{dict.checkout.screen}</p>
              <SeatMap seats={seats} selected={selected} occupied={liveOccupied} onToggle={toggleSeat} />
              <Legend />
              <button disabled={!selected.length} onClick={() => setStep(3)} className="mt-8 rounded-full bg-cx-red px-6 py-3 disabled:opacity-40">
                {dict.checkout.continueExtras}
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <h1 className="font-display text-3xl">{dict.checkout.extras}</h1>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {products.map((p) => (
                <div key={p.id} className="glass flex items-center justify-between gap-3 rounded-xl p-3">
                  <Cover src={p.imageUrl} alt="" className="h-14 w-14 rounded-lg" />
                  <div className="flex-1">
                    <p>{p.name}</p>
                    <p className="text-sm text-cx-gold">{formatCurrency(p.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setExtras((e) => ({ ...e, [p.id]: Math.max(0, (e[p.id] || 0) - 1) }))} className="h-8 w-8 rounded-full bg-white/10">
                      -
                    </button>
                    <span>{extras[p.id] || 0}</span>
                    <button type="button" onClick={() => setExtras((e) => ({ ...e, [p.id]: (e[p.id] || 0) + 1 }))} className="h-8 w-8 rounded-full bg-cx-red">
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(2)} className="rounded-full border border-white/20 px-5 py-3">{dict.checkout.back}</button>
              <button onClick={() => setStep(4)} className="rounded-full bg-cx-red px-5 py-3">{dict.checkout.payment}</button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div>
            <h1 className="font-display text-3xl">{dict.checkout.payment}</h1>
            <p className="mt-2 text-sm text-cx-muted">{dict.checkout.noCard}</p>
            <div className="mt-6 grid gap-3">
              {PAYMENT_METHODS.map((m) => (
                <label key={m.id} className={`glass flex cursor-pointer items-start gap-3 rounded-xl p-4 ${method === m.id ? "ring-1 ring-cx-red" : ""}`}>
                  <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)} />
                  <span>
                    <span className="block font-medium">{m.label}</span>
                    <span className="text-sm text-cx-muted">{m.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder={dict.checkout.coupon} className="mt-4 w-full rounded-xl bg-white/5 px-4 py-3" />
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(3)} className="rounded-full border border-white/20 px-5 py-3">{dict.checkout.back}</button>
              <button disabled={pending || !selected.length} onClick={pay} className="rounded-full bg-cx-red px-5 py-3">
                {pending ? dict.auth.processing : dict.checkout.confirmPay}
              </button>
            </div>
          </div>
        ) : null}

        {step === 5 && result ? (
          <div className="text-center">
            <div className="mx-auto max-w-md animate-[ticket-in_0.7s_ease]">
              {result.pending ? (
                <>
                  <p className="font-display text-3xl text-cx-gold">{dict.checkout.pendingPay}</p>
                  <p className="mt-3 text-sm text-cx-muted">{result.instructions}</p>
                  <p className="mt-2 font-mono">{result.reference}</p>
                  <button
                    className="mt-6 rounded-full bg-cx-red px-5 py-3 text-sm"
                    onClick={() =>
                      start(async () => {
                        if (!result.orderId) return;
                        const ok = await confirmPayment(result.orderId);
                        if (ok.ok) {
                          setResult({ ...result, pending: false });
                          burstConfetti();
                          toast.success("Enjoy the Movie!");
                        }
                      })
                    }
                  >
                    {dict.checkout.paidDemo}
                  </button>
                </>
              ) : (
                <>
                  <p className="font-display text-4xl text-cx-red">{dict.checkout.confirmed}</p>
                  <p className="mt-2 text-cx-gold">🎬 {dict.checkout.enjoy}</p>
                </>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.qr} alt="QR do bilhete" className="mx-auto mt-6 h-48 w-48 rounded-xl bg-white p-2" />
              <p className="mt-4 font-mono text-lg">{result.ticketCode}</p>
              <p className="mt-2 text-sm text-cx-muted">
                {session.movie.title} · {session.cinema.name} · {session.room.name}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a href={result.qr} download={`${result.ticketCode}.png`} className="rounded-full bg-white px-4 py-2 text-sm text-black">
                  {dict.checkout.download}
                </a>
                <a href={`mailto:?subject=Bilhete CINEMAX ${result.ticketCode}`} className="rounded-full border border-white/20 px-4 py-2 text-sm">
                  {dict.checkout.email}
                </a>
                <a
                  href={`/api/tickets/${result.ticketCode}/ics`}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm"
                >
                  {dict.checkout.calendar}
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="glass hidden h-fit overflow-hidden rounded-2xl lg:block">
        <Cover src={session.movie.posterUrl} alt="" className="h-40 w-full" />
        <div className="p-5">
        <p className="text-xs tracking-[0.2em] text-cx-muted">{dict.checkout.summary}</p>
        <h2 className="mt-2 text-lg">{session.movie.title}</h2>
        <p className="text-sm text-cx-muted">
          {session.cinema.name}
          <br />
          {session.room.name} · {session.format}
          <br />
          {new Date(session.startsAt).toLocaleString("pt-PT")}
        </p>
        <p className="mt-3 text-sm">{dict.checkout.seats}: {selected.length ? selected.length : "—"}</p>
        <p className="text-sm">{dict.checkout.subtotal} {formatCurrency(subtotal)}</p>
        <p className="text-sm">{dict.checkout.fee} {formatCurrency(fee)}</p>
        <p className="mt-2 text-xl text-cx-gold">{formatCurrency(total)}</p>
        </div>
      </aside>
      <button type="button" onClick={() => setDrawer(true)} className="fixed inset-x-4 bottom-20 z-30 rounded-full bg-cx-red py-3 text-sm lg:hidden">
        {dict.checkout.summary} · {formatCurrency(total)}
      </button>
      {drawer ? (
        <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setDrawer(false)}>
          <div className="glass-strong absolute inset-x-0 bottom-0 rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <p className="font-display tracking-[0.2em]">{session.movie.title}</p>
            <p className="mt-2 text-sm text-cx-muted">{session.cinema.name} · {selected.length} lugares</p>
            <p className="mt-4 text-2xl text-cx-gold">{formatCurrency(total)}</p>
            <button type="button" className="mt-4 w-full rounded-full border border-white/20 py-2" onClick={() => setDrawer(false)}>{dict.checkout.close}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function burstConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:90";
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const bits = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    r: 3 + Math.random() * 4,
    v: 2 + Math.random() * 4,
    c: ["#E50914", "#C9A227", "#fff"][Math.floor(Math.random() * 3)],
  }));
  let n = 0;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bits.forEach((b) => {
      b.y += b.v;
      ctx.fillStyle = b.c;
      ctx.fillRect(b.x, b.y, b.r, b.r * 2);
    });
    n += 1;
    if (n < 90) requestAnimationFrame(tick);
    else canvas.remove();
  };
  tick();
}

function SeatMap({
  seats,
  selected,
  occupied,
  onToggle,
}: {
  seats: Seat[];
  selected: string[];
  occupied: string[];
  onToggle: (id: string) => void;
}) {
  const rows = [...new Set(seats.map((s) => s.row))];
  return (
    <div className="space-y-1 overflow-x-auto">
      {rows.map((row) => (
        <div key={row} className="flex items-center justify-center gap-1">
          <span className="w-5 text-xs text-cx-muted">{row}</span>
          {seats
            .filter((s) => s.row === row)
            .sort((a, b) => a.number - b.number)
            .map((s) => {
              if (s.isAisle || s.status === "AISLE") return <span key={s.id} className="h-5 w-3" />;
              const isSel = selected.includes(s.id);
              const isOcc = occupied.includes(s.id);
              const color =
                isOcc ? "bg-white/10 cursor-not-allowed" : isSel ? "bg-cx-red shadow-[0_0_12px_#e50914]" : s.type === "VIP" ? "bg-cx-gold/80" : s.type === "PREMIUM" ? "bg-purple-400/80" : s.type === "ACCESSIBLE" ? "bg-sky-400/80" : "bg-emerald-500/80";
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Lugar ${s.row}${s.number} ${s.type}`}
                  disabled={isOcc}
                  onClick={() => onToggle(s.id)}
                  className={`h-6 w-6 rounded-t-md md:h-5 md:w-5 ${color}`}
                />
              );
            })}
        </div>
      ))}
    </div>
  );
}

function Legend() {
  const items = [
    ["bg-emerald-500/80", "Disponível"],
    ["bg-cx-red", "Seleccionado"],
    ["bg-white/10", "Ocupado"],
    ["bg-cx-gold/80", "VIP"],
    ["bg-purple-400/80", "Premium"],
    ["bg-sky-400/80", "Acessível"],
  ];
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3 text-[11px] text-cx-muted">
      {items.map(([c, l]) => (
        <span key={l} className="flex items-center gap-1">
          <i className={`inline-block h-3 w-3 rounded-t ${c}`} /> {l}
        </span>
      ))}
    </div>
  );
}
