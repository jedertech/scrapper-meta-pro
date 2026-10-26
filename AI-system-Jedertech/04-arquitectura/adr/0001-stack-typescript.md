# ADR 0001: Stack TypeScript full en monorepo

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-10 |
| **Decisores** | Sergio (Tech Lead), PO |
| **Relacionados** | [Arquitectura general](../arquitectura-general.md) · [ADR 0003](0003-scrapper-como-worker.md) · [Reutilización del scrapper](../reutilizacion-del-scrapper.md) |

## Contexto

- Equipo de **1 desarrollador** (Sergio, en formación) + Claude Code como pair programmer. La velocidad y la simplicidad cognitiva pesan más que la optimización.
- Ya existe un activo valioso en **TypeScript 5.9 strict ESM + Playwright** (el scrapper de la Biblioteca de Anuncios, `src/`), con tests que cubren los casos difíciles (403/429, paginación, deduplicación).
- El producto necesita: web app con auth y marca blanca, workers de larga duración (Playwright, descargas, transcripción), LLM con tool use y streaming, y billing.
- Anthropic tiene un SDK oficial de TypeScript (`@anthropic-ai/sdk`) con tool runner, streaming y tipos.
- Python sería útil más adelante para data/ML, pero no es imprescindible para el MVP.

## Decisión

**TypeScript en todo el stack**, en un **monorepo pnpm + Turborepo** (repo nuevo `jedertech-ai-platform`):

| Capa | Elección |
|---|---|
| Web | Next.js (App Router) + Tailwind + shadcn/ui, deploy en **Vercel** |
| Workers | Node 22 LTS + **BullMQ** + Redis, deploy en **Railway** (o Fly.io) con imagen Docker de Playwright |
| DB | Postgres en **Supabase** (Auth + RLS + Storage opcional) con **Drizzle ORM** |
| AI | `@anthropic-ai/sdk`: `claude-sonnet-5-5` por defecto, `claude-haiku-5-5` para tareas baratas, `claude-opus-5-5` puntual |
| Validación | zod (payloads de colas, tools, outputs del LLM) |
| Tests | Vitest para código nuevo; los tests `node:test` del scrapper se conservan tal cual |
| Billing / Email | Stripe (+ MercadoPago) / Resend |
| Observabilidad | Sentry + PostHog |

Python queda como **opción futura** (microservicio de data/ML detrás de una cola o HTTP), no en el MVP.

## Alternativas consideradas

| Alternativa | Pros | Contras | Veredicto |
|---|---|---|---|
| **Python backend (FastAPI + Celery) + Next.js** | Ecosistema data/ML, Whisper local | Dos lenguajes para un solo dev; reescribir el scrapper o mantener dos runtimes; tipos no compartidos | Descartada para el MVP |
| **Monolito Next.js sin workers** | Más simple al inicio | Vercel no corre Playwright ni jobs largos; timeouts | Descartada |
| **NestJS como backend separado** | Estructura fuerte | Más boilerplate; Next.js + server actions + workers alcanza | Descartada |
| **Prisma en lugar de Drizzle** | Popular, buen DX | Drizzle es más cercano a SQL (útil para RLS y SQL a mano), más liviano en serverless | Drizzle |
| **Inngest / Trigger.dev en lugar de BullMQ** | Menos infra, buen DX | Costo por ejecución, menos control sobre Playwright de larga duración; lock-in | BullMQ (reevaluar en Etapa 3) |
| **Repos separados (web, worker, scraper)** | Aislamiento | Duplicar tipos y configs; más fricción para 1 dev | Monorepo (con deploy separado del scraper) |

## Consecuencias

**Positivas**
- Un solo lenguaje, tipos compartidos entre web, worker y paquetes (`packages/queue` con zod).
- El scrapper se porta como paquete sin reescritura (`packages/meta-ads-scraper`).
- Claude Code rinde muy bien en TS + Next.js (mucho material de entrenamiento y convenciones claras).
- Turborepo cachea builds y tests y acelera la CI.

**Negativas / riesgos**
- Si en Etapa 4–5 hace falta ML pesado (embeddings propios, visión, edición de video), habrá que sumar Python → aislarlo como servicio.
- Next.js App Router tiene curva (server/client components, caching) → guía en [Guía para Sergio con Claude](../../09-desarrollo-con-ia/guia-sergio-con-claude.md).
- Dependencia de Vercel/Supabase/Railway (vendor lock-in moderado). Mitigación: Postgres estándar + Drizzle (migrable) y workers en Docker.

## Checklist de implementación (Sprint 1)

- [ ] `pnpm` workspaces + `turbo.json` con pipelines `build`, `lint`, `typecheck`, `test`.
- [ ] `packages/config` (tsconfig strict, eslint, prettier).
- [ ] `apps/web` con Next.js + shadcn/ui + Supabase Auth.
- [ ] `apps/worker` con BullMQ + un job "hello" + Dockerfile basado en `mcr.microsoft.com/playwright` (versión fijada).
- [ ] `packages/db` con Drizzle + primera migración (tenants, users, memberships).
- [ ] GitHub Actions: lint + typecheck + test en cada PR.
- [ ] Deploy de staging (Vercel + Railway + Supabase).
