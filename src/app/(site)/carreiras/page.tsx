export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-16">
      <h1 className="font-display text-4xl">CARREIRAS</h1>
      <p className="mt-4 text-cx-muted">Junte-se à equipa CINEMAX — bilheteira, operações, conteúdo e engenharia.</p>
      <ul className="mt-8 space-y-3">
        {["Projection Lead IMAX", "Staff de sala VIP", "Content Rights Manager", "CINEMAX AI Engineer"].map((j) => (
          <li key={j} className="glass rounded-xl p-4">{j}</li>
        ))}
      </ul>
    </div>
  );
}
