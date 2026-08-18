import { cookies } from "next/headers";
import { getDictionary } from "@/shared/lib/i18n";
import { RecoverResetForm } from "@/features/auth/RecoverForm";

export default async function RecuperarTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  return <RecoverResetForm dict={getDictionary(locale)} token={decodeURIComponent(token)} />;
}
