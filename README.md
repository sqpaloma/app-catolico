# Safe (app-catolico)

Monorepo do aplicativo Safe — direção espiritual católica anônima.

## Apps

| App | Papel | Porta |
|-----|--------|-------|
| `apps/native` | App mobile (Expo / React Native / Clerk / RevenueCat / Convex) | Expo |
| `apps/web` | Site de marketing e páginas legais (Next.js estático) | `http://localhost:3000` |

## Packages

| Package | Papel |
|---------|--------|
| `packages/backend` | Convex (schema, queries, mutations, AI/RAG, webhooks) |
| `packages/env` | Validação Zod de env vars (native/web) |
| `packages/ui` | Primitivos shadcn (reservado; web marketing não depende dele hoje) |
| `packages/config` | TypeScript base compartilhado |

## Setup

```bash
pnpm install
pnpm run dev:setup   # configura Convex
```

Copie variáveis de `packages/backend/.env.local` para o app nativo conforme necessário.

### Convex + Clerk

- [Convex + Clerk](https://docs.convex.dev/auth/clerk)
- `CLERK_JWT_ISSUER_DOMAIN` no Convex Dashboard
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` / `EXPO_PUBLIC_CONVEX_URL` no native

### RevenueCat (premium)

1. Defina `REVENUECAT_WEBHOOK_SECRET` no Convex Dashboard (mín. 16 chars).
2. No RevenueCat: Webhook URL `https://<deployment>.convex.site/webhooks/revenuecat` com o mesmo valor no header `Authorization`.
3. O app usa `Purchases.logIn(clerkUserId)` — o `app_user_id` do webhook deve ser o Clerk user id.

## Scripts

- `pnpm run dev` — turbo dev
- `pnpm run dev:native` — Expo
- `pnpm run dev:web` — Next na porta 3000
- `pnpm run dev:server` — Convex
- `pnpm run check-types` — TypeScript em todos os packages
- `pnpm run lint` — ESLint (quando configurado por package)

## Estrutura

```
app-catolico/
├── apps/native/     # Expo app
├── apps/web/        # Landing + /privacidade /termos /suporte
└── packages/backend/convex/
```
