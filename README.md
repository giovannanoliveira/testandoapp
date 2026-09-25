# Vizinhança Real

Avaliações reais de aluguel (apartamento, condomínio, proprietário e imobiliária) feitas por quem já morou lá. O PRD está em `attached_assets/`.

O código foi exportado do Replit e adaptado para rodar em qualquer lugar. Ele integra:

| Integração | Serviço | Onde está |
|---|---|---|
| Banco de dados | PostgreSQL (Supabase ou qualquer Postgres) + Drizzle ORM | `lib/db` |
| Autenticação | Clerk (login com Google) | `artifacts/api-server/src/middlewares/auth.ts`, `artifacts/mobile/app/(auth)` |
| Pagamentos | Stripe Checkout (Plano Premium, R$ 19,90, pagamento único) + webhook | `artifacts/api-server/src/routes/stripe.ts` |
| Assistente (opcional) | OpenAI | `artifacts/api-server/src/routes/assistente.ts` |

## Estrutura

```
artifacts/api-server   API Express (porta 5000) – também serve o app web em produção
artifacts/mobile       App Expo (React Native + web) – as telas do produto
lib/db                 Schema do banco (Drizzle)
lib/api-spec           OpenAPI – fonte da verdade dos endpoints
lib/api-zod            Schemas Zod gerados (validação na API)
lib/api-client-react   Hooks React Query gerados (usados pelo app)
scripts                Script para criar o produto Premium na Stripe
```

## Como rodar localmente

Requisitos: Node.js 22+, pnpm 10+, um banco PostgreSQL.

```bash
pnpm install
cp .env.example .env                                   # preencha as chaves
cp artifacts/mobile/.env.example artifacts/mobile/.env # URL da API + chave pública do Clerk

pnpm db:push        # cria as tabelas no banco
pnpm seed:stripe    # cria o produto "Plano Premium" (R$ 19,90) na sua conta Stripe
pnpm dev:api        # API em http://localhost:5000
pnpm dev:app        # app web em http://localhost:8081 (outro terminal)
```

Para testar no celular, use `pnpm --filter @workspace/mobile run dev` e abra no Expo Go.
Nesse caso, `EXPO_PUBLIC_API_URL` precisa ser um endereço que o celular alcance (ex.: o IP da sua máquina na rede).

## Configurando cada serviço

### Banco de dados (Supabase)
1. Crie um projeto em supabase.com.
2. Em **Project Settings → Database → Connection string**, copie a URI.
3. Cole em `DATABASE_URL` e acrescente `?sslmode=require&uselibpqcompat=true`.
4. Rode `pnpm db:push`.

Tabelas: `usuarios` (inclui `stripe_customer_id` e `premium_at`), `sessoes`, `imoveis`, `avaliacoes`.
Na primeira consulta a API cria alguns imóveis e avaliações de demonstração.

### Autenticação (Clerk)
1. Crie uma aplicação em dashboard.clerk.com e ative **Google** em *SSO connections*.
2. Copie as chaves para `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY` (`.env`) e para `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` (`artifacts/mobile/.env`).
3. Em produção, adicione a URL do app às *allowed redirect URLs* do Clerk.

A API valida o token do Clerk e cria/vincula o usuário local pelo e-mail verificado.
Também existem os endpoints `/api/auth/register` e `/api/auth/login` (e-mail e senha), úteis para testes.

### Pagamentos (Stripe)
1. Pegue a chave secreta de teste (`sk_test_...`) em dashboard.stripe.com → Developers → API keys e coloque em `STRIPE_SECRET_KEY`.
2. Rode `pnpm seed:stripe` (ou crie o preço manualmente e informe `STRIPE_PRICE_ID`).
3. Webhook: crie um endpoint apontando para `https://SUA-API/api/stripe/webhook` com os eventos
   `checkout.session.completed` e `checkout.session.async_payment_succeeded`, e copie o segredo `whsec_...` para `STRIPE_WEBHOOK_SECRET`.
   Localmente: `stripe listen --forward-to localhost:5000/api/stripe/webhook`.

Fluxo: o app chama `POST /api/stripe/checkout` → abre o Checkout da Stripe → a Stripe avisa o webhook → a API grava `premium_at` no usuário.
A página de retorno do pagamento e o `GET /api/stripe/status` também confirmam o pagamento direto na Stripe, então o Premium é ativado mesmo se o webhook atrasar.
Nenhuma chave da Stripe vai para o app.

## Deploy (um único serviço)

```bash
pnpm install
pnpm build:web   # exporta o app web para artifacts/mobile/dist e compila a API
pnpm db:push
pnpm start       # API + app web no mesmo domínio
```

Funciona em Render, Railway, Fly.io etc. Configure as variáveis do `.env.example` no painel do serviço.
Para o build web servido pela própria API, deixe `EXPO_PUBLIC_API_URL` vazio. O app passa a chamar a API no mesmo domínio.

## Outros comandos

- `pnpm run typecheck`: checa os tipos de todos os pacotes
- `pnpm --filter @workspace/api-spec run codegen`: regenera o cliente e os schemas a partir do `openapi.yaml`
