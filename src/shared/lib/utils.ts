import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "AOA", locale = "pt-AO") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "AOA" ? 0 : 2,
    }).format(currency === "AOA" ? amount : amount / 100);
  } catch {
    return `${amount.toLocaleString("pt-PT")} ${currency}`;
  }
}

export function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  return `${h}h ${m.toString().padStart(2, "0")}min`;
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function countdownParts(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds, expired: diff === 0 };
}

export function formatCountdown(target: Date) {
  const { days, hours, minutes, expired } = countdownParts(target);
  if (expired) return "ESTREOU";
  return `${days.toString().padStart(2, "0")}D ${hours.toString().padStart(2, "0")}H ${minutes.toString().padStart(2, "0")}M`;
}

export const SEAT_TYPES = ["STANDARD", "VIP", "PREMIUM", "ACCESSIBLE", "AISLE"] as const;
export const TICKET_HOLD_MS = 10 * 60 * 1000;
export const LOYALTY_TIERS = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "VIP"] as const;

export function loyaltyTier(points: number) {
  if (points >= 8000) return "VIP";
  if (points >= 4000) return "PLATINUM";
  if (points >= 2000) return "GOLD";
  if (points >= 800) return "SILVER";
  return "BRONZE";
}
