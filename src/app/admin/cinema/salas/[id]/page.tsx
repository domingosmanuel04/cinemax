import { prisma } from "@/server/db/prisma";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/features/admin/AdminTable";
import { Cover } from "@/shared/components/Cover";
import { updateSeatTypeAction } from "@/features/admin/actions";
import Link from "next/link";

export default async function RoomEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = await prisma.room.findUnique({
    where: { id },
    include: { cinema: true, seats: { orderBy: [{ posY: "asc" }, { posX: "asc" }] } },
  });
  if (!room) notFound();
  const rows = [...new Set(room.seats.map((s) => s.row))];
  return (
    <div>
      <AdminPageHeader kicker={room.cinema.name} title={room.name} />
      <Cover src={room.imageUrl || ""} alt="" className="mb-6 h-40 w-full rounded-3xl" />
      <p className="mb-4 text-sm text-cx-muted">
        Clique num lugar para alternar STANDARD → VIP → DISABLED. Capacidade: {room.capacity}.
      </p>
      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-black p-6">
        <div className="mb-6 h-2 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-6 text-xs text-cx-gold">{row}</span>
              <div className="flex gap-1">
                {room.seats
                  .filter((s) => s.row === row)
                  .map((s) => (
                    <form key={s.id} action={updateSeatTypeAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <input
                        type="hidden"
                        name="type"
                        value={s.type === "STANDARD" ? "VIP" : s.type === "VIP" ? "DISABLED" : "STANDARD"}
                      />
                      <button
                        title={`${s.row}${s.number} · ${s.type}`}
                        className={`h-7 w-7 rounded-md text-[9px] ${
                          s.type === "VIP"
                            ? "bg-cx-gold text-black"
                            : s.type === "DISABLED"
                              ? "bg-white/10 text-white/20"
                              : "bg-white/20"
                        }`}
                      >
                        {s.number}
                      </button>
                    </form>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-4 text-xs text-cx-muted">
          <span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-white/20" /> Standard</span>
          <span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-cx-gold" /> VIP</span>
          <span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-white/10" /> Indisponível</span>
        </div>
      </div>
      <Link href="/admin/cinema/salas" className="mt-6 inline-block text-sm text-white/50">← Voltar às salas</Link>
    </div>
  );
}
