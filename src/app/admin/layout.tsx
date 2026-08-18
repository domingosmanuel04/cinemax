import { AdminShell } from "@/features/admin/AdminShell";
import { getSession } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDictionary } from "@/shared/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/entrar?next=/admin");
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  return (
    <AdminShell userName={session.name} role={session.role} dict={getDictionary(locale)}>
      {children}
    </AdminShell>
  );
}
