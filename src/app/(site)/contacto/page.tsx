export default function Page() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-28 pb-16">
      <h1 className="font-display text-4xl">CONTACTO</h1>
      <p className="mt-4 text-cx-muted">ola@cinemax.ao · +244 222 000 000</p>
      <form action="/api/newsletter" method="post" className="mt-8 space-y-3">
        <input name="name" placeholder="Nome" className="w-full rounded-xl bg-white/5 px-4 py-3" />
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl bg-white/5 px-4 py-3" />
        <textarea name="message" placeholder="Mensagem" className="h-32 w-full rounded-xl bg-white/5 px-4 py-3" />
        <button className="rounded-full bg-cx-red px-5 py-3">Enviar</button>
      </form>
    </div>
  );
}
