import { getSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { redirect } from "next/navigation";
import { SelectProfile } from "@/features/plus/SelectProfile";
import { Cover } from "@/shared/components/Cover";
import { AMBIENCE } from "@/shared/lib/media";

export default async function PerfisPage() {
  const session = await getSession();
  if (!session) redirect("/entrar?next=/conta/perfis");
  const profiles = await prisma.profile.findMany({ where: { userId: session.id } });
  return (
    <div className="relative min-h-screen">
      <Cover src={AMBIENCE.seats} alt="" className="absolute inset-0 h-full w-full opacity-40" />
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative mx-auto max-w-3xl px-4 pt-36 pb-16 text-center">
        <h1 className="font-display text-4xl">QUEM ESTÁ A ASSISTIR?</h1>
        <p className="mt-3 text-sm text-cx-muted">O perfil Kids filtra o catálogo para classificações adequadas.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {profiles.map((p) => (
            <SelectProfile key={p.id} id={p.id} name={p.name} kids={p.isKids} rating={p.maturityRating} />
          ))}
        </div>
      </div>
    </div>
  );
}
