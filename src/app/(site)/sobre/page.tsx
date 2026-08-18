function Legal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 pt-28 pb-16">
      <h1 className="font-display text-4xl">{title}</h1>
      <div className="prose prose-invert mt-6 max-w-none space-y-4 text-sm text-cx-muted">{children}</div>
    </article>
  );
}

export default function Page() {
  return (
    <Legal title="SOBRE O CINEMAX">
      <p>O CINEMAX é uma plataforma de cinema, bilheteira, loja, fidelidade e streaming. The Future of Cinema.</p>
      <p>Todo o catálogo de demonstração é fictício e original. Filmes comerciais protegidos não são distribuídos sem licença.</p>
    </Legal>
  );
}
