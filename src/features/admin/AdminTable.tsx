export function AdminTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: (string | number | React.ReactNode)[][];
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-white/[0.03] text-[11px] tracking-[0.18em] text-cx-muted uppercase">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-4 font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-white/5 transition hover:bg-white/[0.03]">
              {r.map((c, j) => (
                <td key={j} className="px-4 py-3 align-middle">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length ? <p className="p-8 text-center text-cx-muted">Sem registos.</p> : null}
    </div>
  );
}

export function AdminPageHeader({
  kicker,
  title,
  action,
}: {
  kicker?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker ? <p className="text-[11px] tracking-[0.32em] text-cx-red uppercase">{kicker}</p> : null}
        <h1 className="font-display mt-1 text-3xl tracking-[0.12em] md:text-4xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}
