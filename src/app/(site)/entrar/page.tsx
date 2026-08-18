import { cookies } from "next/headers";
import { AuthForm } from "@/features/auth/AuthForm";
import { getDictionary } from "@/shared/lib/i18n";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  return <AuthForm mode="login" next={next} dict={getDictionary(locale)} />;
}
