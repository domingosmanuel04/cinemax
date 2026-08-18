# CINEMAX

**Your Movie. Your Moment.**  
The Future of Cinema.

Plataforma completa de rede de cinemas, bilheteira, extras (pipocas, bebidas, óculos 3D), streaming **CINEMAX+**, fidelidade **CINEMAX Club**, marketing, analytics, painel administrativo e **CINEMAX AI**.

O catálogo de demonstração é **fictício e original**. Não são distribuídos filmes comerciais protegidos por direitos de autor. O módulo **Content Rights** gere licenças por território, cinema e streaming.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion
- SQLite + Prisma (pronto a correr localmente; PostgreSQL em produção)
- Autenticação JWT (cookie httpOnly) + RBAC
- Gateway de pagamentos abstrato (demo mock + interface Stripe/PayPal/Multicaixa)
- IA desacoplada (consulta dados reais; mock inteligente sem chave)

## Arranque rápido

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Ou:

```bash
npm install
npm run setup
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Contas demo

Palavra-passe de todas: `Cinemax@2026`

| Perfil | Email |
| --- | --- |
| Super Admin | wendy.h@example.net |
| Admin | xena.w@example.org |
| Manager | ursula.b@example.com |
| Staff | tom.h@example.org |
| Finance | olivia.t@example.org |
| Marketing | olivia.t@example.org |
| Conteúdo | tina.r@example.net |
| Cliente | cliente1@cinemax.ao |

## Fluxos principais

1. Site público → trailer cinematográfico → filme → **Comprar bilhete** → cinema → sessão → assentos (hold 10 min) → extras → pagamento → QR Code → pontos Club
2. **CINEMAX+** → perfil → catálogo → player (apenas conteúdo licenciado para streaming)
3. `/admin` → Dashboard → Command Center → CMS do Hero, sessões, licenças, campanhas IA, relatórios CSV

## Configuração

Copie `.env.example` para `.env`. Sem chaves externas, pagamentos e IA correm em **modo demonstração** com dados reais da base.

- `OPENAI_API_KEY` — opcional; a CINEMAX AI já consulta o catálogo/sessões sem LLM
- `STRIPE_SECRET_KEY` / `PAYPAL_CLIENT_ID` — opcional
- Moeda padrão: **AOA** (configurável no painel: AOA / USD / EUR)
- Idiomas: **pt / en / fr** (dicionário em `src/shared/lib/i18n.ts`)

Desactivar o preloader: painel → Configurações → `preloaderEnabled=false`, ou `localStorage.cinemax-preloader = "off"`.

## Arquitectura

```
src/
  app/           rotas (site, admin, api)
  features/      auth, checkout, plus, admin, movies
  server/        prisma, auth, AI, pagamentos, recomendações
  shared/        UI cinematográfica, i18n, utils
prisma/          schema + seed
```

## Segurança (base de produção)

- Passwords com bcrypt
- JWT httpOnly
- RBAC (SUPER_ADMIN → CUSTOMER)
- Rate limit no endpoint de IA
- Validação Zod nas acções de auth
- Sem armazenamento de dados completos de cartão
- Auditoria de login
- XSS mitigado (React) + cookies SameSite

## Licenças e streaming

O player não assume que um filme comercial pode ser publicado. `assistir/[slug]` exige:

1. `streamingAvailable`
2. Licença activa com `streamingOk`
3. Assinatura CINEMAX+ activa

## PWA

`public/manifest.json` + `public/sw.js`. Instaláel no telemóvel; modo offline parcial.

---

CINEMAX — THE FUTURE OF CINEMA
