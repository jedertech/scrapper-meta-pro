# Sprint 1 — Fundaciones (Etapa 1, semanas 3–4)

> Etapa: [Etapa 1](../../07-roadmap/etapas.md#etapa-1--mvp-interno-usado-por-la-agencia-sprints-15-semanas-312) · Backlog: [../backlog.md](../backlog.md) · Arquitectura: [../../04-arquitectura/arquitectura-general.md](../../04-arquitectura/arquitectura-general.md) · Datos: [../../04-arquitectura/modelo-de-datos.md](../../04-arquitectura/modelo-de-datos.md)

## Sprint goal
**"Un usuario de la agencia puede registrarse, crear su agencia y sus cuentas cliente en producción, con datos aislados por tenant (RLS probado) y CI/CD funcionando."**

## Historias incluidas (42 pts)
| ID | Historia | Pts |
|---|---|---|
| JA-009 | Monorepo pnpm + Turborepo | 5 |
| JA-010 | Next.js + Tailwind + shadcn/ui + layout base | 3 |
| JA-011 | Autenticación con Supabase Auth | 5 |
| JA-012 | Modelo multi-tenant en Drizzle | 5 |
| JA-013 | RLS por tenant + tests de aislamiento | 5 |
| JA-014 | Roles e invitaciones de equipo | 3 |
| JA-015 | CRUD de cuentas cliente | 3 |
| JA-016 | CI en GitHub Actions | 3 |
| JA-017 | Deploy web + worker + Supabase dev/prod | 3 |
| JA-018 | Worker base BullMQ + Redis | 3 |
| JA-019 | Sentry + PostHog + logger estructurado | 2 |
| JA-020 | Validación de env + escaneo de secretos | 2 |

## Tareas técnicas paso a paso
1. **Monorepo (JA-009)**
   - [ ] `pnpm init` + `pnpm-workspace.yaml` (`apps/*`, `packages/*`) + `turbo.json` con pipelines `build`, `dev`, `lint`, `typecheck`, `test`.
   - [ ] `packages/config`: `tsconfig.base.json` (strict, ESM, `moduleResolution: bundler`), ESLint flat config, Prettier.
   - [ ] Crear paquetes vacíos con `package.json` y `src/index.ts`: `db`, `ai`, `meta-graph`, `meta-ads-scraper`, `queues` (tipos de colas compartidos).
   - [ ] Fijar Node ≥ 22.13 en `.nvmrc` y `engines`.
2. **Web (JA-010)**
   - [ ] `apps/web` con `create-next-app` (App Router, TS, Tailwind); `shadcn init`; componentes base (button, card, input, dialog, table, sidebar, toast).
   - [ ] Layout `(app)` con sidebar (selector de cuenta cliente + módulos) y `(auth)` para login.
3. **DB y multi-tenant (JA-012)**
   - [ ] `packages/db`: Drizzle + `postgres` driver; `drizzle.config.ts`; esquema `tenants`, `workspaces`, `memberships`, `client_accounts`, `invitations`.
   - [ ] Todas con `id uuid`, `tenant_id`, `created_at`, `updated_at`; índices por `tenant_id`.
   - [ ] Scripts `db:generate`, `db:migrate`, `db:seed`.
4. **Auth (JA-011)**
   - [ ] Supabase Auth con magic link + Google; `@supabase/ssr` para cookies en server components.
   - [ ] Middleware que protege `(app)`; función `getSessionContext()` que devuelve `{userId, tenantId, role}`.
   - [ ] Al primer login: crear tenant + workspace + membership owner en una transacción.
5. **RLS (JA-013)**
   - [ ] Función SQL `is_member(tenant_id)` y policies select/insert/update/delete por tabla.
   - [ ] Test de integración (Postgres en Docker/CI): usuario A no ve datos de B en cada tabla.
   - [ ] Test "guardián": consulta `pg_tables` y falla si alguna tabla del schema `public` no tiene RLS habilitado.
6. **Roles e invitaciones (JA-014)** y **cuentas cliente (JA-015)**
   - [ ] Server actions con validación zod + chequeo de rol.
   - [ ] Email de invitación con Resend; aceptación por token de un solo uso.
   - [ ] CRUD de cuentas cliente con límite configurable por tenant (`plan_limits`).
7. **Worker (JA-018)**
   - [ ] `apps/worker` con BullMQ; `packages/queues` con nombres y payloads tipados (`tenantId` obligatorio).
   - [ ] Cola `healthcheck` de ejemplo + job repetible cada 5 min que escribe heartbeat.
   - [ ] Dockerfile basado en imagen oficial de Playwright (preparado para S3).
8. **CI/CD (JA-016, JA-017)**
   - [ ] Workflow `ci.yml`: pnpm cache → typecheck → lint → test (servicio Postgres) → build; gitleaks.
   - [ ] Vercel conectado a `apps/web` (root directory), previews por PR.
   - [ ] Railway/Fly: servicio worker + Redis; variables por entorno.
   - [ ] Supabase staging y prod; migraciones en el pipeline de deploy.
9. **Observabilidad y secretos (JA-019, JA-020)**
   - [ ] Sentry (web + worker) con tag `tenant_id`; PostHog con group `tenant`.
   - [ ] Logger pino con redacción de `token`, `access_token`, `authorization`, `cookie`.
   - [ ] `env.ts` con zod en cada app; `.env.example`; pre-commit con gitleaks.

## Entregable / demo
Registro con magic link en producción → crear agencia → invitar a un compañero → crear 3 cuentas cliente → mostrar en vivo que un usuario de otra agencia no ve nada (y el test de RLS en CI).

## Riesgos
| Riesgo | Mitigación |
|---|---|
| RLS + Drizzle + Supabase Auth: fricción con el rol de conexión | Decidir en día 1 cómo se pasa el `auth.uid()` (cliente Supabase con JWT vs. `set_config` en transacción) y documentar en ADR |
| Sobre-ingeniería del monorepo | Solo lo necesario para S1; paquetes vacíos están bien |
| Playwright en Railway/Fly (tamaño de imagen) | Probar el Dockerfile ya en S1 aunque el scraper llegue en S3 |

## Definición de "terminado" del sprint
- [ ] Sprint goal demostrado en producción.
- [ ] CI verde y obligatoria en `main`.
- [ ] Test de aislamiento cross-tenant en CI.
- [ ] Velocidad real medida y anotada (para recalibrar la capacidad supuesta de 35–45 pts).

## Prompts sugeridos para Claude Code
```text
Plan mode. Leé CLAUDE.md y AI-system-Jedertech/04-arquitectura/arquitectura-general.md.
Proponé la estructura del monorepo pnpm + Turborepo con apps/web (Next.js App Router), apps/worker
(BullMQ) y packages db, ai, meta-graph, meta-ads-scraper, queues, config. Mostrá árbol de archivos,
package.json de cada uno y turbo.json. No escribas código hasta que apruebe.
```
```text
Usá el subagente backend. Implementá JA-012 y JA-013: esquema Drizzle multi-tenant (tenants, workspaces,
memberships, client_accounts, invitations) con tenant_id NOT NULL, migración SQL con RLS y policies
basadas en memberships, y tests de integración que prueben que un usuario del tenant A no puede leer
ni escribir datos del tenant B. Agregá un test que falle si alguna tabla de public no tiene RLS.
```
```text
Usá el subagente seguridad para revisar el PR de autenticación: manejo de sesión en server components,
middleware, creación de tenant en primer login (condiciones de carrera), y que ningún secreto se
exponga al cliente (variables NEXT_PUBLIC_*).
```
