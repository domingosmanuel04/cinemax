import { cookies } from "next/headers";
import { getDictionary } from "@/shared/lib/i18n";
import Link from "next/link";

export default async function Page() {
  const locale = (await cookies()).get("cinemax-locale")?.value || "pt";
  const dict = getDictionary(locale);
  const faqs = [
    [dict.help.q1, dict.help.a1],
    [dict.help.q2, dict.help.a2],
    [dict.help.q3, dict.help.a3],
    [dict.help.q4, dict.help.a4],
    [dict.help.q5, dict.help.a5],
    [dict.help.q6, dict.help.a6],
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-16">
      <h1 className="font-display text-4xl">{dict.help.title}</h1>
      <div className="mt-8 space-y-4">
        {faqs.map(([q, a]) => (
          <article key={q} className="glass rounded-xl p-4" id={q.toLowerCase().includes("pagament") || q.toLowerCase().includes("payment") ? "pagamentos" : q.toLowerCase().includes("reembol") || q.toLowerCase().includes("refund") ? "reembolsos" : undefined}>
            <h2 className="font-medium">{q}</h2>
            <p className="mt-2 text-sm text-cx-muted">{a}</p>
          </article>
        ))}
      </div>
      <p className="mt-8 text-sm">
        <Link href="/recuperar" className="text-cx-red">
          {dict.auth.forgot}
        </Link>
      </p>
    </div>
  );
}
