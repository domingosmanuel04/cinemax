# CINEMAX — Guia completo do utilizador

> Manual funcional para utilizar o site público, a conta de cliente e o painel administrativo.
>
> O catálogo incluído no projeto é demonstrativo e utiliza conteúdos fictícios.

## 1. Acesso ao sistema

Em desenvolvimento, iniciar a aplicação com:

```bash
npm run dev
```

Abrir no navegador:

```text
http://localhost:3000
```

Antes do primeiro arranque, preparar a base local:

```bash
npm run setup
```

O sistema usa SQLite por padrão. A configuração fica no ficheiro `.env`, através de `DATABASE_URL`.

### Sessão

- O login é feito em `/entrar`.
- A sessão é guardada num cookie seguro chamado `cinemax_session`.
- A sessão dura 14 dias.
- O botão de terminar sessão invalida a sessão atual.
- O acesso a `/conta` e `/checkout` exige login.
- O acesso a `/admin` exige um perfil de equipa autorizado.

## 2. Site público

Estas áreas podem ser visitadas sem login:

| Área             | Rota             | Utilização                                                               |
| ---------------- | ---------------- | ------------------------------------------------------------------------ |
| Página inicial   | `/`              | Ver destaques, estreias, filmes em exibição e chamadas principais.       |
| Filmes           | `/filmes`        | Pesquisar e filtrar o catálogo de filmes.                                |
| Detalhe do filme | `/filmes/[slug]` | Consultar sinopse, elenco, classificação, trailer, sessões e avaliações. |
| Séries           | `/series`        | Explorar séries disponíveis.                                             |
| Cinemas          | `/cinemas`       | Consultar cinemas, localização e programação.                            |
| Salas            | `/salas`         | Ver informação sobre salas e formatos.                                   |
| Sessões          | `/sessoes`       | Consultar horários e escolher uma sessão.                                |
| Pesquisa         | `/pesquisa`      | Pesquisar filmes, séries e outros conteúdos.                             |
| Estreias         | `/estreias`      | Ver próximos lançamentos.                                                |
| Lançamentos      | `/lancamentos`   | Ver conteúdos recentemente disponibilizados.                             |
| Promoções        | `/promocoes`     | Consultar campanhas e descontos ativos.                                  |
| Loja             | `/loja`          | Comprar produtos e extras.                                               |
| CINEMAX+         | `/cinemax-plus`  | Consultar o serviço de streaming e subscrições.                          |
| TV               | `/tv`            | Aceder à programação e conteúdos de televisão.                           |
| Ajuda            | `/ajuda`         | Consultar respostas e apoio.                                             |
| Contacto         | `/contacto`      | Contactar a equipa CINEMAX.                                              |
| Carreiras        | `/carreiras`     | Consultar oportunidades profissionais.                                   |
| Sobre            | `/sobre`         | Conhecer a CINEMAX.                                                      |
| Área legal       | `/legal/*`       | Consultar termos, privacidade, cookies e direitos de conteúdo.           |
| Offline          | `/offline`       | Página apresentada quando existe indisponibilidade ou modo offline.      |

## 3. Cliente registado

O cliente é criado através de `/registar` e recebe o perfil `CUSTOMER`. Depois do registo, pode entrar em `/entrar`.

### Funcionalidades da conta

| Área         | Rota                   | Ações                                                                 |
| ------------ | ---------------------- | --------------------------------------------------------------------- |
| Conta        | `/conta`               | Consultar resumo da conta, bilhetes, pedidos e atividade.             |
| Perfil       | `/conta/perfil`        | Alterar nome, telefone, data de nascimento, idioma e cinema favorito. |
| Perfis       | `/conta/perfis`        | Criar e gerir perfis de visualização.                                 |
| Lista        | `/conta/lista`         | Consultar watchlist e conteúdos guardados.                            |
| Bilhetes     | `/conta/bilhetes/[id]` | Ver bilhete, QR Code e informação da sessão.                          |
| CINEMAX Club | `/club`                | Consultar pontos, nível e benefícios de fidelidade.                   |

### Comprar um bilhete

1. Abrir um filme, cinema ou `/sessoes`.
2. Escolher cinema, data e horário.
3. Selecionar os lugares.
4. Confirmar o bloqueio temporário dos lugares.
5. Adicionar extras, como pipocas, bebidas ou óculos 3D.
6. Rever o resumo no checkout.
7. Escolher o método de pagamento.
8. Concluir o pagamento.
9. Abrir o bilhete na conta e apresentar o QR Code no cinema.

Os lugares ficam em estado `HOLD` durante aproximadamente 10 minutos. Se o pagamento não for concluído nesse período, a reserva pode expirar.

### Pagamentos

No modo de demonstração:

- `CARD`, `WALLET`, `PAYPAL` e `STRIPE` são processados imediatamente.
- `MULTICAIXA`, referência e transferência ficam pendentes até confirmação.
- O sistema não guarda dados completos do cartão.
- Quando o pagamento é confirmado, o pedido e o bilhete são criados e os pontos Club são atribuídos.

### Cancelamento e reembolso

O cliente pode solicitar reembolso quando o bilhete ainda estiver dentro do limite permitido pelo sistema. O resultado depende do estado do pedido, pagamento e sessão.

### Loja

1. Abrir `/loja`.
2. Adicionar produtos ao carrinho.
3. Consultar `/loja/carrinho`.
4. Ajustar quantidades ou remover itens.
5. Finalizar a compra.

O carrinho é mantido no navegador através do cookie `cinemax-shop`.

### CINEMAX+

Para assistir a um conteúdo, são necessárias as três condições:

1. O filme ou episódio tem `streamingAvailable` ativo.
2. Existe uma licença ativa com `streamingOk`.
3. O cliente possui uma subscrição CINEMAX+ ativa.

O acesso ao player ocorre em `/assistir/[slug]` e, para episódios, em `/assistir/episodio/[id]`.

### Outras funções do cliente

- Avaliar filmes e séries.
- Adicionar conteúdos à watchlist.
- Retomar a reprodução a partir do progresso guardado.
- Receber recomendações.
- Usar o assistente CINEMAX AI em modo de demonstração.
- Subscrever a newsletter.
- Gerir preferências e idioma.
- Recuperar a palavra-passe em `/recuperar`.

## 4. Painel administrativo

O painel está em `/admin`. O acesso é permitido aos seguintes perfis:

- `SUPER_ADMIN`
- `ADMIN`
- `MANAGER`
- `STAFF`
- `FINANCE`
- `MARKETING`
- `CONTENT_MANAGER`

A navegação do painel está organizada em seis grupos:

### Operações

- `/admin`: dashboard geral.
- `/admin/command-center`: centro de comando e indicadores em tempo real.
- `/admin/check-in`: validação de bilhetes no cinema.

### Conteúdo

- `/admin/conteudo/filmes`: criar, editar e gerir filmes.
- `/admin/conteudo/series`: criar, editar e gerir séries.
- `/admin/conteudo/banners`: gerir banners e conteúdos em destaque.

### Cinema

- `/admin/cinema/cinemas`: gerir cinemas.
- `/admin/cinema/salas`: gerir salas, lugares e formatos.
- `/admin/cinema/sessoes`: criar e gerir sessões.

### Vendas

- `/admin/vendas/bilhetes`: consultar bilhetes e estados de utilização.
- `/admin/vendas/pedidos`: consultar pedidos de clientes.
- `/admin/vendas/pagamentos`: consultar pagamentos e estados de confirmação.

### Crescimento

- `/admin/clientes`: consultar clientes.
- `/admin/marketing/promocoes`: criar e gerir promoções.
- `/admin/marketing/campanhas`: gerir campanhas de marketing.
- `/admin/relatorios`: consultar e exportar relatórios.
- `/admin/ia`: consultar o assistente de dados CINEMAX AI.

### Sistema

- `/admin/streaming/licencas`: gerir licenças de streaming.
- `/admin/inventario`: gerir produtos e inventário.
- `/admin/funcionarios`: gerir contas e perfis de equipa.
- `/admin/emails`: consultar e gerir comunicações.
- `/admin/configuracoes`: gerir configurações do sistema.

## 5. Níveis de acesso

A matriz de permissões definida no sistema é a seguinte:

| Perfil            | Responsabilidade prevista       | Módulos previstos                                                                                                  |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `SUPER_ADMIN`     | Administração total             | Todos os módulos.                                                                                                  |
| `ADMIN`           | Administração geral             | Dashboard, conteúdo, cinema, vendas, streaming, clientes, marketing, relatórios, IA, configurações e funcionários. |
| `MANAGER`         | Gestão operacional              | Dashboard, cinema, vendas, relatórios e IA.                                                                        |
| `STAFF`           | Operação de bilheteira e cinema | Dashboard, vendas e cinema.                                                                                        |
| `FINANCE`         | Gestão financeira               | Dashboard, vendas e relatórios.                                                                                    |
| `MARKETING`       | Comunicação e crescimento       | Dashboard, marketing, conteúdo e IA.                                                                               |
| `CONTENT_MANAGER` | Gestão editorial e streaming    | Dashboard, conteúdo, streaming e IA.                                                                               |
| `CUSTOMER`        | Utilizador final                | Site público, conta, compras, Club e CINEMAX+.                                                                     |

### SUPER_ADMIN

Pode gerir toda a plataforma, incluindo funcionários, permissões operacionais, conteúdos, cinemas, vendas, finanças, marketing, streaming, inventário, relatórios, IA e configurações.

### ADMIN

Administra a operação global do negócio. É o perfil indicado para gerir conteúdos, cinemas, vendas, clientes, campanhas, streaming, relatórios, funcionários e configurações.

### MANAGER

Coordena a operação diária: cinemas, salas, sessões, vendas, acompanhamento de resultados e indicadores de IA.

### STAFF

Executa tarefas de atendimento e operação: bilheteira, consulta de vendas, gestão operacional do cinema e check-in de bilhetes.

### FINANCE

Acompanha pedidos, pagamentos, vendas e relatórios financeiros.

### MARKETING

Gere promoções, campanhas, conteúdo promocional e análises através da IA.

### CONTENT_MANAGER

Gere filmes, séries, banners, metadados editoriais e licenças de streaming.

### CUSTOMER

Não tem acesso ao painel `/admin`. Utiliza as áreas públicas, a conta pessoal, o checkout, a loja, o CINEMAX Club e o CINEMAX+.

## 6. Credenciais de demonstração

A password de demonstração é:

```text
Cinemax@2026
```

| Perfil          | Email                  |
| --------------- | ---------------------- |
| Super Admin     | `wendy.h@example.net`  |
| Admin           | `xena.w@example.org`   |
| Manager         | `ursula.b@example.com` |
| Staff           | `tom.h@example.org`    |
| Marketing       | `olivia.t@example.org` |
| Content Manager | `tina.r@example.net`   |
| Cliente         | `cliente1@cinemax.ao`  |

> Nota: o seed atual usa o mesmo email para `FINANCE` e `MARKETING`. Como `MARKETING` é criado depois, a conta `olivia.t@example.org` pode terminar com o perfil `MARKETING`. Para testar Finance, criar uma conta separada no painel ou ajustar o seed.

## 7. Autenticação e recuperação

### Login

1. Abrir `/entrar`.
2. Introduzir email e password.
3. Se a conta tiver 2FA ativo, introduzir o código adicional.
4. O sistema redireciona para a página originalmente solicitada ou para a área principal.

### Registo

1. Abrir `/registar`.
2. Preencher os dados obrigatórios.
3. A conta é criada como `CUSTOMER`.
4. É criado o perfil inicial, a conta Club e a notificação inicial.

### Recuperação de password

1. Abrir `/recuperar`.
2. Introduzir o email da conta.
3. Abrir o token recebido ou usar o fluxo de demonstração configurado.
4. Definir uma nova password em `/recuperar/[token]`.

### 2FA

Em modo demonstrativo, o código aceite é:

```text
123456
```

Em produção, deve ser substituído por um mecanismo real de segundo fator.

## 8. APIs e integrações

As principais APIs internas são:

- `/api/search`: pesquisa do catálogo.
- `/api/sessions/[id]/seats`: lugares e disponibilidade da sessão.
- `/api/tickets/[code]/ics`: exportação de bilhete para calendário.
- `/api/reviews`: avaliações.
- `/api/newsletter`: subscrição de newsletter.
- `/api/prefs`: preferências do utilizador.
- `/api/ai/chat`: assistente CINEMAX AI.
- `/api/admin/reports`: relatórios administrativos.

Sem credenciais externas, o sistema utiliza:

- pagamentos mock;
- assistente AI mock orientado aos dados da base;
- catálogo e assets demonstrativos.

As integrações opcionais incluem OpenAI, Resend, Stripe, PayPal, Multicaixa e S3.

## 9. Notas importantes sobre o estado atual

1. A matriz `PERMISSIONS` define o acesso pretendido por módulo.
2. Atualmente, o middleware valida principalmente se o utilizador pertence ao conjunto de perfis de equipa.
3. O menu administrativo apresenta todos os módulos aos perfis staff.
4. Antes de colocar o sistema em produção, cada rota e ação administrativa deve validar a permissão específica do perfil.
5. Alterar o perfil de um funcionário pode exigir novo login, porque o role é incluído no JWT da sessão.
6. O aviso sobre a convenção `middleware` do Next.js é uma depreciação e não impede o funcionamento local.

## 10. Fluxo recomendado de teste

### Teste como cliente

1. Entrar com `cliente1@cinemax.ao` / `Cinemax@2026`.
2. Escolher um filme e uma sessão.
3. Selecionar lugares.
4. Adicionar um extra.
5. Concluir o checkout em modo mock.
6. Confirmar o bilhete, QR Code e pontos Club em `/conta`.
7. Abrir `/cinemax-plus` e testar um conteúdo licenciado com subscrição ativa.

### Teste como equipa

1. Entrar com uma conta administrativa.
2. Abrir `/admin`.
3. Consultar o dashboard.
4. Abrir o Command Center.
5. Consultar vendas e relatórios.
6. Testar a área correspondente à responsabilidade do perfil.
7. Usar `/admin/check-in` para validar um bilhete.

---

**CINEMAX — The Future of Cinema**
