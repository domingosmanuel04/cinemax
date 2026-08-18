import { cookies } from "next/headers";
import { getDictionary } from "@/shared/lib/i18n";
import { RecoverRequestForm } from "@/features/auth/RecoverForm";

export default async function RecuperarPage() {
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  return <RecoverRequestForm dict={getDictionary(locale)} />;
}
