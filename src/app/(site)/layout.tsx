import { cookies } from "next/headers";
import { Navbar } from "@/shared/components/Navbar";
import { Footer } from "@/shared/components/Footer";
import { getDictionary } from "@/shared/lib/i18n";
import { getSession } from "@/server/auth/session";
import { getSettings } from "@/server/services/settings";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const locale = jar.get("cinemax-locale")?.value || "pt";
  const currency = jar.get("cinemax-currency")?.value || "AOA";
  const dict = getDictionary(locale);
  const session = await getSession();
  const settings = await getSettings().catch(() => ({ defaultLocale: "pt" }));
  let cinemaName: string | null = null;
  if (session?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { preferredCinema: true },
    });
    cinemaName = user?.preferredCinema?.city || null;
  }
  return (
    <>
      <Navbar dict={dict} userName={session?.name} locale={locale} cinemaName={cinemaName} currency={currency} />
      <main>{children}</main>
      <Footer dict={dict} />
    </>
  );
}
