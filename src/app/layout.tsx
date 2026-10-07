import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import { AppChrome } from "@/shared/components/AppChrome";
import { getSettings } from "@/server/services/settings";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-display", weight: ["400", "700"] });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings().catch(() => ({ brandName: "CINEMAX", tagline: "Your Movie. Your Moment." }));
  return {
    title: { default: `${s.brandName} — ${s.tagline}`, template: `%s · ${s.brandName}` },
    description: "Rede de cinemas, bilhetes, extras, streaming CINEMAX+ e inteligência artificial.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    openGraph: { title: "CINEMAX", description: s.tagline, type: "website" },
    manifest: "/manifest.json",
  };
}

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings().catch(() => ({ preloaderEnabled: "true" }));
  return (
    <html lang="pt" className={`${inter.variable} ${cinzel.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} cinema-gradient pb-16 md:pb-0`} suppressHydrationWarning>
        <AppChrome preloader={settings.preloaderEnabled !== "false"}>{children}</AppChrome>
      </body>
    </html>
  );
}
