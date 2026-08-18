import { prisma } from "@/server/db/prisma";

const defaults: Record<string, string> = {
  brandName: "CINEMAX",
  tagline: "Your Movie. Your Moment.",
  currency: "AOA",
  defaultLocale: "pt",
  preloaderEnabled: "true",
  heroVideoUrl: "",
  logoUrl: "/brand/logo.svg",
  primaryColor: "#E50914",
  bookingFee: "250",
  holdMinutes: "10",
  socialInstagram: "https://instagram.com/cinemax",
  socialFacebook: "https://facebook.com/cinemax",
  socialYoutube: "https://youtube.com/@cinemax",
  supportEmail: "ola@cinemax.ao",
  supportPhone: "+244 222 000 000",
  taxRate: "0",
};

export async function getSettings() {
  const rows = await prisma.setting.findMany();
  const map = { ...defaults };
  for (const row of rows) map[row.key] = row.value;
  return map;
}

export async function getSetting(key: string) {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? defaults[key] ?? "";
}

export async function setSettings(values: Record<string, string>) {
  await Promise.all(
    Object.entries(values).map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } }),
    ),
  );
}
