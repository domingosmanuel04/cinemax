import { cookies } from "next/headers";
import { AuthForm } from "@/features/auth/AuthForm";
import { getDictionary } from "@/shared/lib/i18n";

export default async function RegisterPage() {
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  return <AuthForm mode="register" dict={getDictionary(locale)} />;
}
