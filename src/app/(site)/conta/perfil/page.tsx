import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { getDictionary } from "@/shared/lib/i18n";
import { ProfileForm, PasswordForm } from "@/features/auth/ProfileForm";
import Link from "next/link";

export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect("/entrar?next=/conta/perfil");
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  const dict = getDictionary(locale);
  const [user, cinemas] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.id } }),
    prisma.cinema.findMany({ where: { status: "ACTIVE" }, orderBy: { city: "asc" } }),
  ]);
  if (!user) redirect("/entrar");
  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-16">
      <p className="text-xs tracking-[0.3em] text-cx-red">{dict.account.kicker}</p>
      <h1 className="font-display mt-2 text-4xl">{dict.account.editProfile}</h1>
      <ProfileForm
        dict={dict}
        name={user.name}
        phone={user.phone || ""}
        dateOfBirth={user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : ""}
        preferredCinemaId={user.preferredCinemaId || ""}
        locale={user.locale || locale}
        avatarUrl={user.avatarUrl || ""}
        cinemas={cinemas.map((c) => ({ id: c.id, name: c.name, city: c.city }))}
      />
      <PasswordForm dict={dict} />
      <Link href="/conta" className="mt-6 inline-block text-sm text-white/50">
        ← {dict.account.kicker}
      </Link>
    </div>
  );
}
