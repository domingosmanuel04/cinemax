import { cookies } from "next/headers";
import { getDictionary } from "@/shared/lib/i18n";

export default async function Page() {
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  const dict = getDictionary(locale);
  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-16 text-sm text-cx-muted">
      <h1 className="font-display text-4xl text-white">{dict.legal.privacy}</h1>
      <p className="mt-6">{dict.legal.privacyBody}</p>
    </div>
  );
}
