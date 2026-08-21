# CINEMAX — Novas implementações e melhorias

Documento de evolução do sistema. Serve para orientar o desenvolvimento, acompanhar prioridades e transformar as necessidades do produto em tarefas verificáveis.

## Objetivos

- Tornar a autorização segura e específica por módulo.
- Preparar pagamentos, 2FA e notificações para produção.
- Melhorar a experiência de compra e utilização no cinema.
- Aumentar a confiabilidade através de testes, logs e monitorização.
- Melhorar a operação administrativa sem alterar o fluxo do cliente.

## Prioridades

| Prioridade | Significado                                                                  |
| ---------- | ---------------------------------------------------------------------------- |
| P0         | Segurança, dados ou operação bloqueante. Deve ser tratado antes de produção. |
| P1         | Melhoria importante para uma versão de produção.                             |
| P2         | Evolução de produto ou eficiência operacional.                               |
| P3         | Melhoria futura, sem impacto imediato no arranque.                           |

## P0 — Segurança e autorização

### 1. Aplicar permissões por módulo

**Problema atual:** a matriz `PERMISSIONS` existe em `src/server/auth/session.ts`, mas o middleware e o menu administrativo validam principalmente se o utilizador pertence ao grupo staff. Um perfil de equipa pode acabar por aceder a módulos fora da sua responsabilidade.

**Implementação:**

- Criar uma função única para validar `hasPermission(role, permission)`.
- Associar cada rota administrativa a uma permissão.
- Validar a permissão nas páginas e nas server actions.
- Filtrar o menu de `AdminShell` conforme o perfil.
- Devolver `403` para acessos diretos sem autorização.
- Manter `SUPER_ADMIN` com acesso total.

**Critérios de aceitação:**

- `STAFF` não consegue abrir configurações, funcionários, inventário ou relatórios.
- `FINANCE` consegue consultar vendas, pedidos, pagamentos e relatórios, mas não editar filmes.
- `CONTENT_MANAGER` consegue gerir conteúdo e licenças, mas não alterar pagamentos.
- A proteção funciona tanto pelo menu como ao introduzir a URL diretamente.
- Cada tentativa proibida fica registada no log de auditoria.

### 2. Corrigir contas demo duplicadas

**Problema atual:** o seed usa o mesmo email para `FINANCE` e `MARKETING`. Como os registos são feitos por `upsert`, o último perfil criado pode substituir o primeiro.

**Implementação:**

- Criar um email próprio para Finance, por exemplo `finance@cinemax.ao`.
- Atualizar o seed e a documentação de credenciais.
- Adicionar um teste que confirme a existência de uma conta por perfil demo.

**Critérios de aceitação:**

- As contas Finance e Marketing existem simultaneamente.
- Cada conta inicia sessão com o perfil esperado.
- O seed pode ser executado mais de uma vez sem duplicar utilizadores.

### 3. Substituir o 2FA demonstrativo

**Problema atual:** o código universal `123456` é adequado apenas para demonstração.

**Implementação:**

- Usar TOTP compatível com aplicações autenticadoras.
- Gerar uma chave individual por utilizador.
- Mostrar o QR Code apenas durante a configuração.
- Pedir confirmação do primeiro código antes de ativar o 2FA.
- Criar códigos de recuperação com hash e uso único.
- Aplicar rate limit às tentativas.

**Critérios de aceitação:**

- O código demo não funciona em produção.
- Cada utilizador tem uma chave independente.
- É possível desativar ou recuperar o acesso com segurança.
- Tentativas inválidas são auditadas.

## P1 — Checkout e operação de cinema

### 4. Tornar a reserva de lugares transacional

**Implementação:**

- Confirmar disponibilidade dentro de uma transação Prisma.
- Impedir que dois clientes concluam o mesmo lugar.
- Expirar automaticamente reservas `HOLD` vencidas.
- Libertar os lugares quando um pagamento falha ou é cancelado.
- Mostrar no checkout o tempo restante da reserva.

**Critérios de aceitação:**

- O mesmo lugar não pode aparecer em dois bilhetes pagos.
- Um `HOLD` expirado volta a ficar disponível.
- O cliente vê uma mensagem clara quando outro utilizador ocupou o lugar.

### 5. Integrar gateway de pagamentos real

**Implementação:**

- Manter `mock` apenas em desenvolvimento.
- Adicionar adaptadores para Stripe, PayPal e Multicaixa.
- Validar webhooks com assinatura.
- Tornar o processamento idempotente por referência do pagamento.
- Não guardar PAN, CVV ou dados sensíveis do cartão.
- Criar estados visíveis para `PENDING`, `PAID`, `FAILED`, `REFUNDED` e `CANCELLED`.

**Critérios de aceitação:**

- Um webhook repetido não cria um segundo pedido ou bilhete.
- O bilhete só é emitido após confirmação válida.
- O utilizador recebe indicação do estado real do pagamento.
- As chaves e webhooks são lidos apenas através de variáveis de ambiente.

### 6. Melhorar o check-in

**Implementação:**

- Validar QR Code contra o bilhete e a sessão correta.
- Bloquear reutilização de bilhete já utilizado.
- Mostrar nome do filme, sessão, sala, lugares e estado.
- Permitir pesquisa manual por código em caso de falha da câmara.
- Registar funcionário, hora e resultado da validação.

**Critérios de aceitação:**

- Um bilhete válido é aceite uma única vez.
- Bilhetes cancelados, reembolsados ou de outra sessão são recusados.
- O funcionário recebe uma mensagem operacional clara.

## P1 — Qualidade e confiabilidade

### 7. Criar testes automatizados

**Cobertura mínima:**

- Login, registo, logout e recuperação de password.
- Verificação de permissões por perfil.
- Criação, expiração e confirmação de `HOLD`.
- Checkout com pagamento aprovado, pendente e recusado.
- Reembolso e invalidação de bilhete.
- Check-in e tentativa de reutilização.
- Acesso a streaming com e sem licença/subscrição.
- APIs administrativas com sessão autorizada e não autorizada.

**Critérios de aceitação:**

- Os testes correm num comando documentado.
- O CI bloqueia alterações que quebrem autenticação, checkout ou autorização.
- Os testes usam base isolada e dados controlados.

### 8. Adicionar monitorização e auditoria

**Implementação:**

- Centralizar logs estruturados com `requestId`.
- Registar erros de checkout, login, pagamentos e check-in.
- Criar alertas para falhas repetidas e pagamentos pendentes.
- Não escrever passwords, tokens, cookies ou dados de cartão nos logs.
- Disponibilizar um resumo operacional no Command Center.

**Critérios de aceitação:**

- Um erro pode ser rastreado desde o pedido até à ação executada.
- Os logs distinguem ambiente de desenvolvimento e produção.
- Dados pessoais e segredos ficam ocultos.

### 9. Migrar `middleware` para `proxy`

**Problema atual:** o Next.js informa que a convenção `middleware` está depreciada.

**Implementação:**

- Seguir o codemod recomendado pela versão instalada do Next.js.
- Rever matcher e comportamento de redirecionamento.
- Testar `/admin`, `/conta` e `/checkout` após a migração.
- Remover a implementação antiga apenas depois da validação.

**Critérios de aceitação:**

- O aviso de depreciação deixa de aparecer.
- Rotas públicas continuam acessíveis.
- Rotas protegidas continuam a redirecionar corretamente.

## P2 — Experiência do cliente

### 10. Melhorar notificações

**Implementação:**

- Enviar confirmação de compra por email.
- Enviar bilhete e QR Code em formato compatível com calendário.
- Notificar alteração ou cancelamento de sessão.
- Enviar lembrete antes da sessão.
- Criar preferências de comunicação por utilizador.
- Usar Resend ou outro provedor configurável; manter modo local para desenvolvimento.

**Critérios de aceitação:**

- O cliente consegue reenviar o bilhete a partir da conta.
- Falhas de email não anulam um pagamento já confirmado.
- O histórico de envio mostra estado e data.

### 11. Melhorar acessibilidade e responsividade

**Implementação:**

- Garantir navegação completa por teclado.
- Adicionar estados de foco visíveis.
- Rever labels, mensagens de erro e leitores de ecrã.
- Validar contraste e tamanho mínimo dos alvos de toque.
- Testar checkout e painel em telemóvel.

**Critérios de aceitação:**

- Os fluxos de login, compra e check-in podem ser executados sem rato.
- Formulários anunciam erros de forma compreensível.
- Nenhum conteúdo essencial fica cortado em ecrãs pequenos.

### 12. Melhorar pesquisa e recomendações

**Implementação:**

- Adicionar filtros por género, classificação, idioma, formato e cinema.
- Criar paginação ou carregamento incremental.
- Ordenar por relevância e disponibilidade.
- Explicar recomendações com base em preferências, histórico e Club.
- Permitir excluir títulos do histórico de recomendações.

**Critérios de aceitação:**

- Resultados vazios apresentam uma alternativa útil.
- A pesquisa mantém filtros ao navegar e regressar.
- O cliente pode controlar o uso do seu histórico.

## P2 — Administração e dados

### 13. Evoluir o inventário

**Implementação:**

- Registar entradas, saídas e ajustes de stock.
- Definir stock mínimo por produto.
- Alertar para rutura ou validade próxima.
- Associar vendas de extras ao cinema e à sessão.
- Exportar movimentos em CSV.

### 14. Expandir relatórios

**Implementação:**

- Vendas por período, cinema, filme, sessão e método de pagamento.
- Ocupação por sala e formato.
- Receita de bilhetes versus extras.
- Utilização de promoções.
- Clientes ativos, retenção e subscrições CINEMAX+.
- Exportação com filtros aplicados.

### 15. Criar gestão de permissões no painel

**Implementação:**

- Mostrar o perfil e as permissões efetivas ao editar funcionário.
- Permitir atribuição controlada de funções.
- Exigir confirmação para ações de alto impacto.
- Mostrar histórico de alterações.
- Impedir que um administrador remova o próprio último acesso global.

## P3 — Evolução futura

### 16. Preparar PostgreSQL para produção

- Adicionar configuração de produção.
- Definir migrações versionadas em vez de depender apenas de `db push`.
- Criar política de backup e restauração.
- Testar índices, concorrência e crescimento da base.

### 17. Melhorar PWA e modo offline

- Cachear catálogo essencial e bilhetes recentes.
- Mostrar estado de sincronização.
- Evitar apresentar bilhete desatualizado como válido.
- Permitir consulta offline com aviso claro.

### 18. Internacionalização completa

- Rever todas as mensagens de erro e estados vazios em PT, EN e FR.
- Localizar datas, moeda, números e classificações.
- Permitir idioma por conta e preferência do navegador.

## Ordem recomendada de execução

1. Aplicar autorização por módulo.
2. Corrigir as contas demo do seed.
3. Criar testes de autenticação, autorização e checkout.
4. Tornar a reserva de lugares transacional.
5. Substituir o 2FA demo.
6. Integrar pagamentos e webhooks reais.
7. Melhorar check-in e notificações.
8. Migrar `middleware` para `proxy`.
9. Evoluir relatórios, inventário e experiência móvel.
10. Preparar PostgreSQL, backups e operação de produção.

## Checklist de uma release de produção

- [ ] `AUTH_SECRET` forte e exclusivo por ambiente.
- [ ] `DATABASE_URL` aponta para base de produção.
- [ ] Prisma Client gerado a partir do schema validado.
- [ ] Permissões testadas por perfil.
- [ ] 2FA real ativo para perfis administrativos.
- [ ] Pagamentos reais e webhooks verificados.
- [ ] Backups e restauração testados.
- [ ] Logs sem segredos ou dados de cartão.
- [ ] Rate limiting ativo em login, IA, checkout e APIs públicas.
- [ ] Testes automatizados executados com sucesso.
- [ ] Emails e notificações configurados.
- [ ] HTTPS, cookies seguros e headers de segurança ativos.
- [ ] Monitorização e alertas disponíveis.
- [ ] Seed demo desativado ou isolado do ambiente de produção.

## Relação com a documentação existente

- O uso atual do sistema está descrito em [GUIA-DO-SISTEMA.md](GUIA-DO-SISTEMA.md).
- Este documento descreve o que deve ser implementado, melhorado ou endurecido.
- Alterações de comportamento devem atualizar os dois documentos quando afetarem o utilizador final.
