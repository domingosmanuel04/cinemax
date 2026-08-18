"use client";

import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DashboardCharts({
  revenue,
  cinemas,
}: {
  revenue: { day: string; revenue: number }[];
  cinemas: { name: string; value: number }[];
}) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="mb-4 text-sm text-cx-muted">Receita por dia</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue}>
              <XAxis dataKey="day" stroke="#A0A0A0" fontSize={11} />
              <YAxis stroke="#A0A0A0" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #222" }} />
              <Area dataKey="revenue" stroke="#E50914" fill="#E5091444" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="mb-4 text-sm text-cx-muted">Bilhetes por cinema</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cinemas}>
              <XAxis dataKey="name" stroke="#A0A0A0" fontSize={10} />
              <YAxis stroke="#A0A0A0" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #222" }} />
              <Bar dataKey="value" fill="#C9A227" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
