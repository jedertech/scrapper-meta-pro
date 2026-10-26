# Product Backlog — Jeder AI

> Backlog priorizado del MVP (Etapas 0–2, sprints S0–S7) + épicas de alto nivel post-MVP (M12–M14).
> Cómo se usa: [como-trabajamos.md](como-trabajamos.md) · Plantilla de historia: [plantillas/historia-de-usuario.md](plantillas/historia-de-usuario.md) · Módulos: [../02-producto/modulos.md](../02-producto/modulos.md) · PRD: [../02-producto/prd.md](../02-producto/prd.md)
>
> **Convenciones**
> - IDs `JA-001`… (Jeder AI). MVP: JA-001 a JA-078. Post-MVP: JA-101+ (M12), JA-121+ (M13), JA-141+ (M14).
> - Puntos: Fibonacci (1, 2, 3, 5, 8). Prioridad: **P1** = Must (sin esto no hay sprint goal), **P2** = Should, **P3** = Could / stretch. P0 se reserva para incidentes.
> - "Agencia" = tenant que paga. "Cuenta cliente" = cada infoproductor/marca que la agencia gestiona (es lo que cuenta en el límite del plan). Jerarquía tenant → workspace → cuenta cliente: ver [../04-arquitectura/modelo-de-datos.md](../04-arquitectura/modelo-de-datos.md).
> - Capacidad supuesta: 35–45 pts/sprint ⚠️ A validar con la velocidad real de S1–S2.
> - Para pasar a GitHub: cada historia = 1 issue con label `type:story`, `mod:*`, prioridad y campo `Points`/`Sprint` del Project.

## 1. Épicas

| Épica | Nombre | Etapa | Historias MVP |
|---|---|---|---|
| EP-VAL | Validación comercial | 0–2 | JA-001, JA-002, JA-003, JA-004, JA-074, JA-075 |
| EP-FUN | Fundaciones / Infra | 0–2 | JA-008 a JA-012, JA-014 a JA-018, JA-021, JA-070, JA-072 |
| EP-META | Meta App Review | 0–2 | JA-005, JA-006, JA-029, JA-056, JA-078 |
| EP-SEG | Seguridad y legal | 0–2 | JA-007, JA-013, JA-020, JA-038, JA-065, JA-067, JA-071 |
| EP-BIL | Billing | 2 | JA-062, JA-063, JA-064, JA-066 |
| EP-OBS | Observabilidad y costos | 1–2 | JA-019, JA-057, JA-068, JA-069 |
| EP-M1 | Onboarding Guiado (chat) | 1 | JA-043, JA-044, JA-045, JA-046, JA-048, JA-073 |
| EP-M2 | Conexión de Cuentas (IG/FB) | 1 | JA-022, JA-023, JA-024 |
| EP-M3 | Mi Contenido | 1 | JA-025, JA-026, JA-027, JA-028 |
| EP-M4 | Radar de Competencia | 1 | JA-030, JA-031, JA-032, JA-033 |
| EP-M5 | Espía de Anuncios | 1–2 | JA-034, JA-035, JA-036, JA-037, JA-076, JA-077 |
| EP-M6 | Análisis de Video | 1 | JA-039, JA-040, JA-041, JA-042, JA-047 |
| EP-M7 | Coach AI | 1 | JA-051, JA-052 |
| EP-M8 | Guionista AI | 1 | JA-049, JA-050 |
| EP-M9 | Calendario de Contenido (simple) | 1 | JA-053 |
| EP-M10 | Reportes | 1 | JA-054, JA-055 |
| EP-M11 | Panel de Agencia (marca blanca) | 2 | JA-058, JA-059, JA-060, JA-061 |
| EP-M12 | Tracking de Ventas | 3 | JA-101 a JA-107 (alto nivel) |
| EP-M13 | Pack E-commerce | 4 | JA-121 a JA-127 (alto nivel) |
| EP-M14 | Editor de Video AI | 5 | JA-141 a JA-146 (alto nivel) |

## 2. Índice del MVP por sprint

| ID | Historia (resumen) | Épica | Pts | Prio | Sprint |
|---|---|---|---|---|---|
| JA-001 | Guion + 10 entrevistas a agencias | EP-VAL | 5 | P1 | S0 |
| JA-002 | Landing con waitlist | EP-VAL | 3 | P1 | S0 |
| JA-003 | Definir piloto con la agencia Jedertech | EP-VAL | 2 | P1 | S0 |
| JA-004 | Síntesis de entrevistas + decisión go/no-go y precios | EP-VAL | 2 | P1 | S0 |
| JA-005 | Crear app de Meta en modo desarrollo | EP-META | 3 | P1 | S0 |
| JA-006 | Iniciar Business Verification | EP-META | 2 | P1 | S0 |
| JA-007 | Borradores de Privacidad, TyC y borrado de datos | EP-SEG | 3 | P2 | S0 |
| JA-008 | Repo nuevo + CLAUDE.md + subagentes + GitHub Projects | EP-FUN | 3 | P1 | S0 |
| JA-009 | Monorepo pnpm + Turborepo | EP-FUN | 5 | P1 | S1 |
| JA-010 | Next.js + Tailwind + shadcn/ui + layout base | EP-FUN | 3 | P1 | S1 |
| JA-011 | Autenticación con Supabase Auth | EP-FUN | 5 | P1 | S1 |
| JA-012 | Modelo multi-tenant en Drizzle | EP-FUN | 5 | P1 | S1 |
| JA-013 | RLS por tenant + tests de aislamiento | EP-SEG | 5 | P1 | S1 |
| JA-014 | Roles e invitaciones de equipo | EP-FUN | 3 | P1 | S1 |
| JA-015 | CRUD de cuentas cliente | EP-FUN | 3 | P1 | S1 |
| JA-016 | CI en GitHub Actions | EP-FUN | 3 | P1 | S1 |
| JA-017 | Deploy web + worker + Supabase dev/prod | EP-FUN | 3 | P1 | S1 |
| JA-018 | Worker base BullMQ + Redis | EP-FUN | 3 | P1 | S1 |
| JA-019 | Sentry + PostHog + logger estructurado | EP-OBS | 2 | P2 | S1 |
| JA-020 | Validación de env + escaneo de secretos | EP-SEG | 2 | P1 | S1 |
| JA-021 | Paquete `meta-graph` (cliente Graph API) | EP-FUN | 5 | P1 | S2 |
| JA-022 | Conectar Instagram/Facebook (OAuth) | EP-M2 | 8 | P1 | S2 |
| JA-023 | Tokens cifrados + control de expiración | EP-M2 | 5 | P1 | S2 |
| JA-024 | Desconectar cuenta + data deletion callback | EP-M2 | 3 | P1 | S2 |
| JA-025 | Ingesta diaria de posts/reels propios + insights | EP-M3 | 8 | P1 | S2 |
| JA-026 | Ingesta de insights de cuenta | EP-M3 | 3 | P2 | S2 |
| JA-027 | Dashboard Mi Contenido | EP-M3 | 5 | P1 | S2 |
| JA-028 | Detalle de publicación | EP-M3 | 3 | P2 | S2 |
| JA-029 | Screencasts de permisos (M2/M3) | EP-META | 2 | P2 | S2 |
| JA-030 | Agregar competidores por @usuario | EP-M4 | 5 | P1 | S3 |
| JA-031 | Snapshots diarios de competidores | EP-M4 | 5 | P1 | S3 |
| JA-032 | Vista Radar: yo vs. competidores | EP-M4 | 5 | P1 | S3 |
| JA-033 | Detección de posts outliers | EP-M4 | 3 | P2 | S3 |
| JA-034 | Portar el scrapper a `packages/meta-ads-scraper` | EP-M5 | 8 | P1 | S3 |
| JA-035 | Worker de scraping con BullMQ | EP-M5 | 5 | P1 | S3 |
| JA-036 | Persistencia de anuncios en Postgres | EP-M5 | 5 | P1 | S3 |
| JA-037 | UI Espía de Anuncios | EP-M5 | 5 | P1 | S3 |
| JA-038 | Aislamiento del scraper + kill switch | EP-SEG | 3 | P1 | S3 |
| JA-039 | Descarga de videos a storage con TTL | EP-M6 | 5 | P1 | S4 |
| JA-040 | Transcripción en español (benchmark + integración) | EP-M6 | 5 | P1 | S4 |
| JA-041 | Análisis LLM de video (hook, ángulo, estructura, CTA) | EP-M6 | 5 | P1 | S4 |
| JA-042 | UI Análisis de Video | EP-M6 | 5 | P1 | S4 |
| JA-043 | Paquete `ai`: Anthropic SDK, routing, caching, costos | EP-M1 | 5 | P1 | S4 |
| JA-044 | Chat guía con streaming e historial | EP-M1 | 5 | P1 | S4 |
| JA-045 | Orquestador con delegación a agentes | EP-M1 | 8 | P1 | S4 |
| JA-046 | Perfil de Marca construido por chat | EP-M1 | 5 | P1 | S4 |
| JA-047 | Control de costos de video (límites + caché) | EP-M6 | 3 | P1 | S5 |
| JA-048 | Checklist de onboarding paso a paso | EP-M1 | 3 | P2 | S5 |
| JA-049 | Generar guiones | EP-M8 | 5 | P1 | S5 |
| JA-050 | Editar, versionar y variantes de hook | EP-M8 | 3 | P2 | S5 |
| JA-051 | Plan semanal del Coach | EP-M7 | 5 | P1 | S5 |
| JA-052 | Feedback sobre recomendaciones | EP-M7 | 2 | P2 | S5 |
| JA-053 | Calendario simple | EP-M9 | 3 | P2 | S5 |
| JA-054 | Reporte semanal PDF | EP-M10 | 5 | P1 | S5 |
| JA-055 | Envío programado por email + vista web | EP-M10 | 3 | P1 | S5 |
| JA-056 | Preparar y enviar App Review | EP-META | 5 | P1 | S5 |
| JA-057 | Costo por cuenta cliente (panel interno) | EP-OBS | 3 | P1 | S5 |
| JA-058 | Branding de agencia (logo, colores, nombre) | EP-M11 | 5 | P1 | S6 |
| JA-059 | Dominio custom + remitente de email | EP-M11 | 8 | P1 | S6 |
| JA-060 | Panel multi-cliente | EP-M11 | 5 | P1 | S6 |
| JA-061 | Acceso de cliente final (viewer) | EP-M11 | 3 | P2 | S6 |
| JA-062 | Stripe: planes, setup fee, checkout y portal | EP-BIL | 8 | P1 | S6 |
| JA-063 | Límites por plan + webhooks de suscripción | EP-BIL | 5 | P1 | S6 |
| JA-064 | Oferta Founders −40% | EP-BIL | 1 | P1 | S6 |
| JA-065 | Audit log de acciones sensibles | EP-SEG | 2 | P2 | S6 |
| JA-066 | MercadoPago (opcional) | EP-BIL | 5 | P3 | S6 |
| JA-067 | Revisión de seguridad pre-lanzamiento | EP-SEG | 5 | P1 | S7 |
| JA-068 | Alertas operativas | EP-OBS | 3 | P1 | S7 |
| JA-069 | Métricas de producto (activación/retención) | EP-OBS | 3 | P2 | S7 |
| JA-070 | Backups, restore probado y runbook | EP-FUN | 3 | P1 | S7 |
| JA-071 | Legal final + DPA para agencias | EP-SEG | 3 | P1 | S7 |
| JA-072 | Performance de dashboards | EP-FUN | 3 | P2 | S7 |
| JA-073 | Evals de prompts de agentes | EP-M1 | 5 | P2 | S7 |
| JA-074 | Onboarding de agencias Founders | EP-VAL | 5 | P1 | S7 |
| JA-075 | Página de precios + demo + caso piloto | EP-VAL | 3 | P1 | S7 |
| JA-076 | Watchlist de anunciantes con "anuncios nuevos" | EP-M5 | 3 | P3 | S7 |
| JA-077 | Adaptador a proveedor de respaldo (Apify) | EP-M5 | 3 | P3 | S7 |
| JA-078 | Responder App Review / obtener Advanced Access | EP-META | 3 | P1 | S7 |

**Totales por sprint:** S0 23 · S1 42 · S2 42 · S3 44 · S4 43 · S5 40 · S6 42 (37 sin MercadoPago) · S7 42 (36 sin stretch). Total MVP ≈ 318 pts / 78 historias.

---

## 3. Historias del MVP (detalle)

### Sprint 0 — Validación + setup

#### JA-001 · Guion + 10 entrevistas a agencias
- **Épica:** EP-VAL · **Pts:** 5 · **Prio:** P1 · **Sprint:** S0
- **Como** PO, **quiero** entrevistar a 10 agencias de infoproductores de LATAM **para** validar el problema, el precio (Agency Starter USD 497) y la disposición a revender en marca blanca.
- **Criterios de aceptación**
  - [ ] Guion de 30 min basado en [../01-comercial/](../01-comercial/) (problema, proceso actual, herramientas, presupuesto, precio).
  - [ ] 10 entrevistas hechas con agencias distintas (≥3 países).
  - [ ] Notas cargadas en una tabla única (agencia, país, n.º clientes, dolor top-3, precio aceptado, interés Founders).
  - [ ] Al menos 2 entrevistas grabadas (con permiso) para extraer citas textuales.

#### JA-002 · Landing con waitlist
- **Épica:** EP-VAL · **Pts:** 3 · **Prio:** P1 · **Sprint:** S0
- **Como** PO, **quiero** una landing con propuesta de valor y formulario de waitlist **para** medir interés y juntar leads de agencias.
- **Criterios de aceptación**
  - [ ] Given un visitante, When completa nombre, email, agencia, n.º de clientes y país, Then queda guardado y recibe email de confirmación.
  - [ ] Eventos `waitlist_view` y `waitlist_submit` en PostHog.
  - [ ] Publicada en dominio propio con HTTPS; aviso de privacidad enlazado.
  - [ ] Mensaje principal alineado con [../00-vision/](../00-vision/).

#### JA-003 · Definir piloto con la agencia Jedertech
- **Épica:** EP-VAL · **Pts:** 2 · **Prio:** P1 · **Sprint:** S0
- **Como** PO, **quiero** elegir 3–5 cuentas cliente de la agencia y un responsable interno **para** tener usuarios reales desde el Sprint 2.
- **Criterios de aceptación**
  - [ ] Lista de 3–5 cuentas (IG Business/Creator vinculadas a página de FB) con consentimiento del cliente.
  - [ ] Responsable del piloto en la agencia con 2 h/semana asignadas.
  - [ ] 3 criterios de éxito medibles (ej. "reemplaza el reporte manual", "≥2 guiones/semana usados").
  - [ ] 3–5 competidores por cuenta ya listados.

#### JA-004 · Síntesis de entrevistas + decisión go/no-go
- **Épica:** EP-VAL · **Pts:** 2 · **Prio:** P1 · **Sprint:** S0
- **Como** PO, **quiero** un resumen con patrones, citas y precios aceptados **para** decidir si seguimos con el plan y ajustar pricing ⚠️.
- **Criterios de aceptación**
  - [ ] Documento con top-5 dolores, top-3 objeciones, rango de precio aceptado, % que pide MercadoPago.
  - [ ] Decisión explícita: go / ajustar / no-go, registrada en [../10-preguntas-abiertas.md](../10-preguntas-abiertas.md).
  - [ ] Backlog re-priorizado si la síntesis lo pide.

#### JA-005 · Crear app de Meta en modo desarrollo
- **Épica:** EP-META · **Pts:** 3 · **Prio:** P1 · **Sprint:** S0
- **Como** Tech Lead, **quiero** la app de Meta creada y configurada **para** poder desarrollar M2/M3/M4 con usuarios de prueba.
- **Criterios de aceptación**
  - [ ] App tipo Business creada en el Business Manager de Jedertech con producto Facebook Login for Business (+ Instagram Graph API).
  - [ ] URLs de redirect de local y staging configuradas.
  - [ ] Permisos en modo estándar listados: `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`, `business_management` ⚠️ verificar nombres vigentes.
  - [ ] App ID y secret guardados solo en el gestor de secretos (nunca en el repo).
  - [ ] Ver [../03-meta-y-legal/meta-app-review-y-permisos.md](../03-meta-y-legal/meta-app-review-y-permisos.md).

#### JA-006 · Iniciar Business Verification
- **Épica:** EP-META · **Pts:** 2 · **Prio:** P1 · **Sprint:** S0
- **Como** PO, **quiero** iniciar la verificación del negocio en Meta **para** no bloquear el App Review y el rol de Tech Provider.
- **Criterios de aceptación**
  - [ ] Documentación legal de la empresa reunida (razón social, dirección, teléfono, dominio con email corporativo).
  - [ ] Solicitud enviada; captura del estado guardada.
  - [ ] Recordatorio semanal en la daily hasta que esté aprobada.

#### JA-007 · Borradores de Privacidad, TyC y borrado de datos
- **Épica:** EP-SEG · **Pts:** 3 · **Prio:** P2 · **Sprint:** S0
- **Como** PO, **quiero** borradores de Política de Privacidad, Términos y Condiciones e instrucciones de borrado de datos **para** cumplir requisitos de Meta y de leyes de datos LATAM.
- **Criterios de aceptación**
  - [ ] Borradores que cubren: datos que leemos de Meta, uso por AI, retención, subprocesadores (Supabase, Anthropic, proveedor de transcripción, Vercel, Railway), borrado.
  - [ ] Lista de preguntas para asesor legal (incluye scraping de Biblioteca de Anuncios).
  - [ ] Publicables en `/legal/*` de la landing.

#### JA-008 · Repo nuevo + CLAUDE.md + subagentes + GitHub Projects
- **Épica:** EP-FUN · **Pts:** 3 · **Prio:** P1 · **Sprint:** S0
- **Como** Tech Lead, **quiero** el repo `jedertech-ai-platform` listo para trabajar con Claude Code **para** arrancar S1 sin fricción.
- **Criterios de aceptación**
  - [ ] Repo privado creado con `main` protegida, plantillas de issue/PR y labels de [como-trabajamos.md](como-trabajamos.md).
  - [ ] `CLAUDE.md` con el contenido de [../09-desarrollo-con-ia/guia-sergio-con-claude.md](../09-desarrollo-con-ia/guia-sergio-con-claude.md).
  - [ ] `.claude/agents/` con los 7 subagentes de [../09-desarrollo-con-ia/agentes-dev/](../09-desarrollo-con-ia/agentes-dev/).
  - [ ] GitHub Project con campos Status/Sprint/Points/Priority/Epic/Module y las historias de S1 cargadas.

### Sprint 1 — Fundaciones

#### JA-009 · Monorepo pnpm + Turborepo
- **Épica:** EP-FUN · **Pts:** 5 · **Prio:** P1 · **Sprint:** S1
- **Como** desarrollador, **quiero** un monorepo con apps y paquetes separados **para** compartir tipos y desplegar web y worker por separado.
- **Criterios de aceptación**
  - [ ] Estructura: `apps/web`, `apps/worker`, `packages/db`, `packages/ai`, `packages/meta-graph`, `packages/meta-ads-scraper` (placeholder), `packages/config` (tsconfig/eslint compartidos).
  - [ ] TypeScript strict, ESM, Node ≥ 22.13 (igual que el scrapper actual).
  - [ ] `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck` corren vía Turborepo con caché.
  - [ ] README raíz con comandos.

#### JA-010 · Next.js + Tailwind + shadcn/ui + layout base
- **Épica:** EP-FUN · **Pts:** 3 · **Prio:** P1 · **Sprint:** S1
- **Como** usuario de agencia, **quiero** una app con navegación clara **para** moverme entre módulos sin perderme.
- **Criterios de aceptación**
  - [ ] Next.js App Router con Tailwind y shadcn/ui; tema claro/oscuro.
  - [ ] Layout con sidebar (selector de cuenta cliente + módulos M1–M11) y header (usuario, workspace).
  - [ ] Páginas vacías con estado "próximamente" para cada módulo.
  - [ ] Responsive (usable en celular para ver reportes).

#### JA-011 · Autenticación con Supabase Auth
- **Épica:** EP-FUN · **Pts:** 5 · **Prio:** P1 · **Sprint:** S1
- **Como** usuario, **quiero** registrarme e ingresar con magic link o Google **para** acceder de forma segura.
- **Criterios de aceptación**
  - [ ] Given un email nuevo, When pide magic link, Then recibe email (Resend/SMTP) y al hacer clic queda logueado.
  - [ ] Login con Google funcionando.
  - [ ] Rutas protegidas por middleware; sesión validada del lado servidor.
  - [ ] Al primer login se crea tenant + workspace por defecto + membership owner (transacción).

#### JA-012 · Modelo multi-tenant en Drizzle
- **Épica:** EP-FUN · **Pts:** 5 · **Prio:** P1 · **Sprint:** S1
- **Como** Tech Lead, **quiero** el esquema base tenant → workspace → cuenta cliente **para** que todo dato quede atado a un tenant.
- **Criterios de aceptación**
  - [ ] Tablas `tenants`, `workspaces`, `memberships`, `client_accounts` (y las que defina [../04-arquitectura/modelo-de-datos.md](../04-arquitectura/modelo-de-datos.md)) con `tenant_id` NOT NULL.
  - [ ] Migraciones Drizzle versionadas; `pnpm db:migrate` idempotente.
  - [ ] Seed de desarrollo con 2 tenants de prueba.
  - [ ] Tipos exportados desde `packages/db`.

#### JA-013 · RLS por tenant + tests de aislamiento
- **Épica:** EP-SEG · **Pts:** 5 · **Prio:** P1 · **Sprint:** S1
- **Como** agencia, **quiero** que ninguna otra agencia pueda ver mis datos **para** confiar mis clientes a la plataforma.
- **Criterios de aceptación**
  - [ ] RLS habilitado en todas las tablas con datos de tenant; policies basadas en membership del `auth.uid()`.
  - [ ] Given usuario del tenant A, When consulta cualquier tabla, Then no ve filas del tenant B (test automatizado por tabla).
  - [ ] El worker usa service role solo del lado servidor y siempre filtra por `tenant_id` explícito.
  - [ ] Test en CI que falla si se crea una tabla nueva sin RLS.

#### JA-014 · Roles e invitaciones de equipo
- **Épica:** EP-FUN · **Pts:** 3 · **Prio:** P1 · **Sprint:** S1
- **Como** dueño de agencia, **quiero** invitar a mi equipo con roles **para** delegar el trabajo diario.
- **Criterios de aceptación**
  - [ ] Roles: `owner`, `admin`, `member`, `client_viewer`.
  - [ ] Invitación por email con expiración (7 días); aceptar crea membership.
  - [ ] Solo owner/admin invitan y cambian roles; probado con tests.

#### JA-015 · CRUD de cuentas cliente
- **Épica:** EP-FUN · **Pts:** 3 · **Prio:** P1 · **Sprint:** S1
- **Como** usuario de agencia, **quiero** crear, editar y archivar cuentas cliente **para** organizar a los infoproductores que atiendo.
- **Criterios de aceptación**
  - [ ] Campos: nombre, nicho, país, notas, estado (activa/archivada).
  - [ ] Límite de cuentas activas por plan aplicado (valor configurable; enforcement real en JA-063).
  - [ ] Selector de cuenta cliente en el sidebar recuerda la última usada.

#### JA-016 · CI en GitHub Actions
- **Épica:** EP-FUN · **Pts:** 3 · **Prio:** P1 · **Sprint:** S1
- **Como** Tech Lead, **quiero** CI en cada PR **para** no romper `main`.
- **Criterios de aceptación**
  - [ ] Jobs: install con caché pnpm, typecheck, lint, test (con Postgres de servicio para tests de RLS), build.
  - [ ] Gitleaks (o similar) en cada PR.
  - [ ] Branch protection exige CI verde.
  - [ ] Tiempo de CI < 8 min.

#### JA-017 · Deploy web + worker + Supabase dev/prod
- **Épica:** EP-FUN · **Pts:** 3 · **Prio:** P1 · **Sprint:** S1
- **Como** Tech Lead, **quiero** entornos staging y producción **para** que el piloto use algo estable mientras desarrollo.
- **Criterios de aceptación**
  - [ ] Vercel: preview por PR, staging en `develop` o rama `staging` ⚠️ decidir, prod en `main`.
  - [ ] Worker en Railway o Fly.io con Redis gestionado; imagen con Playwright Chromium.
  - [ ] Dos proyectos Supabase (staging, prod); migraciones aplicadas en el deploy.
  - [ ] Health checks `/api/health` y worker heartbeat.

#### JA-018 · Worker base BullMQ + Redis
- **Épica:** EP-FUN · **Pts:** 3 · **Prio:** P1 · **Sprint:** S1
- **Como** desarrollador, **quiero** un worker con colas tipadas **para** correr ingesta, scraping, transcripción y análisis fuera del request web.
- **Criterios de aceptación**
  - [ ] Colas definidas en un paquete compartido con payload tipado (incluye `tenantId` obligatorio).
  - [ ] Reintentos con backoff exponencial y dead-letter.
  - [ ] Jobs repetibles (cron) soportados.
  - [ ] Bull Board accesible solo para admins internos.

#### JA-019 · Sentry + PostHog + logger estructurado
- **Épica:** EP-OBS · **Pts:** 2 · **Prio:** P2 · **Sprint:** S1
- **Como** Tech Lead, **quiero** ver errores y uso **para** detectar problemas antes que el piloto.
- **Criterios de aceptación**
  - [ ] Sentry en web y worker con `tenant_id` como tag (sin PII).
  - [ ] PostHog con identificación por usuario y grupo por tenant.
  - [ ] Logger JSON (pino) con redacción de tokens (reutilizar idea de `redact()` de `src/security.ts` del scrapper).

#### JA-020 · Validación de env + escaneo de secretos
- **Épica:** EP-SEG · **Pts:** 2 · **Prio:** P1 · **Sprint:** S1
- **Como** Tech Lead, **quiero** que la app no arranque con configuración inválida y que ningún secreto llegue al repo **para** evitar incidentes tontos.
- **Criterios de aceptación**
  - [ ] Esquema zod por app; error claro si falta una variable.
  - [ ] `.env.example` completo sin valores reales.
  - [ ] Hook pre-commit + CI con escaneo de secretos.

### Sprint 2 — M2 Conexión + M3 Mi Contenido

#### JA-021 · Paquete `meta-graph`
- **Épica:** EP-FUN · **Pts:** 5 · **Prio:** P1 · **Sprint:** S2
- **Como** desarrollador, **quiero** un cliente tipado de Graph API **para** no repetir manejo de errores, paginación y rate limits.
- **Criterios de aceptación**
  - [ ] Versión de Graph API fijada en config ⚠️ verificar versión vigente.
  - [ ] Paginación por cursor, reintentos con backoff, lectura de headers de uso (`x-app-usage`, `x-business-use-case-usage`) y pausa automática.
  - [ ] Errores mapeados (token expirado, permiso faltante, rate limit) a tipos propios.
  - [ ] Tests con fixtures grabadas (sin llamadas reales en CI).

#### JA-022 · Conectar Instagram/Facebook (OAuth)
- **Épica:** EP-M2 · **Pts:** 8 · **Prio:** P1 · **Sprint:** S2
- **Como** usuario de agencia, **quiero** conectar la cuenta de IG Business de mi cliente con Facebook Login for Business **para** traer sus métricas automáticamente.
- **Criterios de aceptación**
  - [ ] Given una cuenta cliente sin conexión, When hago clic en "Conectar Instagram", Then se abre el diálogo de Meta con los permisos mínimos.
  - [ ] Al volver, listo las páginas y cuentas IG disponibles y elijo cuál vincular.
  - [ ] Si la cuenta IG no es Business/Creator o no está vinculada a una página, muestro mensaje guiado con pasos para resolverlo.
  - [ ] Se guarda `ig_user_id`, `page_id`, scopes otorgados y fecha de expiración.
  - [ ] Parámetro `state` firmado (anti-CSRF) y validado.

#### JA-023 · Tokens cifrados + control de expiración
- **Épica:** EP-M2 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S2
- **Como** agencia, **quiero** que los tokens de mis clientes estén protegidos y se renueven **para** no perder datos ni exponer accesos.
- **Criterios de aceptación**
  - [ ] Tokens cifrados en reposo (AES-256-GCM con clave en env/KMS, o Supabase Vault) y nunca enviados al cliente.
  - [ ] Intercambio a token de larga duración y job que renueva/verifica antes de vencer.
  - [ ] Given un token inválido, Then la conexión pasa a estado `needs_reauth` y se avisa al usuario (banner + email).
  - [ ] Los tokens nunca aparecen en logs (test).

#### JA-024 · Desconectar cuenta + data deletion callback
- **Épica:** EP-M2 · **Pts:** 3 · **Prio:** P1 · **Sprint:** S2
- **Como** cliente final, **quiero** desconectar mi cuenta y pedir el borrado de mis datos **para** controlar mi información (requisito de Meta).
- **Criterios de aceptación**
  - [ ] Botón "Desconectar" revoca token y borra datos derivados según política.
  - [ ] Endpoint de Data Deletion Callback que valida el `signed_request`, encola el borrado y devuelve URL de estado + código de confirmación.
  - [ ] Página pública de estado del borrado.

#### JA-025 · Ingesta diaria de posts/reels propios + insights
- **Épica:** EP-M3 · **Pts:** 8 · **Prio:** P1 · **Sprint:** S2
- **Como** usuario de agencia, **quiero** que los posts y reels del cliente se actualicen solos cada día **para** analizar su rendimiento sin exportar nada a mano.
- **Criterios de aceptación**
  - [ ] Al conectar: backfill de los últimos 90 días ⚠️ (o lo que permita la API).
  - [ ] Job diario por cuenta: media nueva + insights por media (reach, likes, comments, saves, shares, plays/views según tipo) ⚠️ verificar métricas disponibles por tipo de media.
  - [ ] Upsert idempotente por `media_id`; serie temporal de métricas por día.
  - [ ] Errores por cuenta no frenan a las demás; reintentos respetando rate limit.

#### JA-026 · Ingesta de insights de cuenta
- **Épica:** EP-M3 · **Pts:** 3 · **Prio:** P2 · **Sprint:** S2
- **Como** usuario de agencia, **quiero** ver la evolución de seguidores y alcance diario **para** medir crecimiento.
- **Criterios de aceptación**
  - [ ] Snapshot diario de followers y métricas de cuenta disponibles.
  - [ ] Serie de al menos 30 días visible tras 30 días de uso (o backfill si la API lo permite).

#### JA-027 · Dashboard Mi Contenido
- **Épica:** EP-M3 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S2
- **Como** usuario de agencia, **quiero** un dashboard con KPIs y top publicaciones **para** saber qué funciona en la cuenta de mi cliente.
- **Criterios de aceptación**
  - [ ] KPIs (7/30/90 días): seguidores, alcance, engagement rate, publicaciones por semana; variación vs. período anterior.
  - [ ] Top 10 publicaciones por métrica seleccionable; filtro por tipo (reel, carrusel, imagen).
  - [ ] Estados vacíos y de "cuenta no conectada" con CTA.
  - [ ] Carga < 2 s con 1.000 publicaciones (consulta indexada).

#### JA-028 · Detalle de publicación
- **Épica:** EP-M3 · **Pts:** 3 · **Prio:** P2 · **Sprint:** S2
- **Como** usuario, **quiero** ver el detalle de un post **para** entender por qué funcionó o no.
- **Criterios de aceptación**
  - [ ] Caption, tipo, fecha, permalink, métricas y comparación vs. promedio de la cuenta (x veces).
  - [ ] Botón "Analizar video" (deshabilitado hasta S4) y "Usar como referencia para guion" (S5).

#### JA-029 · Screencasts de permisos (M2/M3)
- **Épica:** EP-META · **Pts:** 2 · **Prio:** P2 · **Sprint:** S2
- **Como** Tech Lead, **quiero** grabar el uso de cada permiso apenas está implementado **para** no improvisar el App Review en S5.
- **Criterios de aceptación**
  - [ ] Un video por permiso usado (login → otorgar → dónde se ve el dato en la app), en inglés o con subtítulos ⚠️.
  - [ ] Guardados en carpeta compartida con notas de "por qué necesitamos este permiso".

### Sprint 3 — M4 Radar + M5 Espía de Anuncios

#### JA-030 · Agregar competidores por @usuario
- **Épica:** EP-M4 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S3
- **Como** usuario de agencia, **quiero** agregar competidores escribiendo su @ de Instagram **para** monitorearlos sin herramientas externas.
- **Criterios de aceptación**
  - [ ] Given un @ de cuenta Business/Creator pública, When lo agrego, Then se valida vía Business Discovery y muestro foto, nombre, seguidores y n.º de posts.
  - [ ] Given cuenta personal/privada o inexistente, Then mensaje claro ("no es una cuenta profesional pública").
  - [ ] Límite de competidores por cuenta cliente configurable (default 10 ⚠️).
  - [ ] La consulta usa el token de la cuenta del propio cliente (o de la agencia), nunca del scraper.

#### JA-031 · Snapshots diarios de competidores
- **Épica:** EP-M4 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S3
- **Como** usuario, **quiero** que cada día se guarde una foto de cada competidor **para** ver su crecimiento y sus publicaciones nuevas.
- **Criterios de aceptación**
  - [ ] Job diario: followers, media_count y últimos N posts (like_count, comments_count, caption, permalink, timestamp, media_type, media_url).
  - [ ] Dedupe de posts por id; métricas de posts como serie temporal.
  - [ ] Respeta rate limits; reparte las consultas a lo largo del día.

#### JA-032 · Vista Radar: yo vs. competidores
- **Épica:** EP-M4 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S3
- **Como** usuario de agencia, **quiero** comparar mi cliente con sus competidores **para** detectar qué están haciendo mejor.
- **Criterios de aceptación**
  - [ ] Tabla comparativa: seguidores, crecimiento 7/30 días, frecuencia de publicación, engagement promedio (likes+comments/seguidores), mix de formatos.
  - [ ] Feed de "top posts de la competencia" de la última semana ordenado por engagement relativo.
  - [ ] Aclaración visible: "métricas públicas; reach/views de terceros no están disponibles".

#### JA-033 · Detección de posts outliers
- **Épica:** EP-M4 · **Pts:** 3 · **Prio:** P2 · **Sprint:** S3
- **Como** usuario, **quiero** que se marquen los posts que rinden muy por encima del promedio del competidor **para** encontrar ideas probadas.
- **Criterios de aceptación**
  - [ ] Outlier = engagement ≥ 3× la mediana de los últimos 30 posts de esa cuenta ⚠️ (umbral configurable).
  - [ ] Badge "🔥 outlier" en la UI y disponible para M7/M8 como referencia.

#### JA-034 · Portar el scrapper a `packages/meta-ads-scraper`
- **Épica:** EP-M5 · **Pts:** 8 · **Prio:** P1 · **Sprint:** S3
- **Como** Tech Lead, **quiero** reutilizar el motor del scrapper actual como librería **para** no reescribir lo que ya funciona. Ver [../04-arquitectura/reutilizacion-del-scrapper.md](../04-arquitectura/reutilizacion-del-scrapper.md).
- **Criterios de aceptación**
  - [ ] Se copian con historia (git subtree/filter-repo o copia documentada) `src/extractors.ts`, `browser-compat.ts`, `normalize.ts`, `destination.ts`, `pagination.ts`, `graphql-health.ts`, `security.ts`, `types.ts`.
  - [ ] Se elimina la dependencia de `node:sqlite`/`Storage`: el extractor emite lotes (`ExtractBatch`) y la persistencia se inyecta por interfaz.
  - [ ] CLI, wizard, session-lock y progress quedan fuera del paquete.
  - [ ] Tests existentes (`tests/core.test.mjs`, `http-scenarios`, `stabilization`) migrados y en verde con el runner del monorepo.
  - [ ] Versión de Playwright fijada (1.61.x) igual que el original.

#### JA-035 · Worker de scraping con BullMQ
- **Épica:** EP-M5 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S3
- **Como** usuario, **quiero** pedir "traer anuncios de esta página/keyword en este país" y que se procese en segundo plano **para** no esperar con la pantalla abierta.
- **Criterios de aceptación**
  - [ ] Cola `ads-scrape` con payload `{tenantId, clientAccountId, query|pageId, country, limit}`.
  - [ ] Concurrencia 1 por worker al inicio; límite diario de jobs por tenant.
  - [ ] Circuit breaker de errores GraphQL y stop inmediato en 403/429 (lógica existente) → job `paused` con motivo.
  - [ ] Progreso del job visible en la UI (n.º anuncios, estado).

#### JA-036 · Persistencia de anuncios en Postgres
- **Épica:** EP-M5 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S3
- **Como** desarrollador, **quiero** guardar anuncios y anunciantes en Postgres **para** consultarlos por tenant y cruzarlos con el resto de módulos.
- **Criterios de aceptación**
  - [ ] Tablas de anuncios/anunciantes/observaciones mapeando los campos actuales (adId, pageId, advertiserName, description, ctaUrl, ctaText, libraryUrl, country, platforms, adStartDate, adStatus, quality) + `destination_kind`.
  - [ ] Catálogo global de anuncios públicos + tabla de vínculo por tenant con RLS ⚠️ decidir en [../04-arquitectura/modelo-de-datos.md](../04-arquitectura/modelo-de-datos.md).
  - [ ] Dedupe por `ad_id`; `first_seen_at`/`last_seen_at` para calcular días activos.

#### JA-037 · UI Espía de Anuncios
- **Épica:** EP-M5 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S3
- **Como** usuario de agencia, **quiero** buscar y filtrar anuncios de la competencia **para** ver qué ofertas y ángulos están pautando.
- **Criterios de aceptación**
  - [ ] Búsqueda por página de competidor o keyword + país.
  - [ ] Filtros: activos, días activos (≥7, ≥30), destino (WhatsApp/Messenger/IG/web), plataforma.
  - [ ] Tarjeta con texto, CTA, destino, fecha de inicio, días activo y link a la Biblioteca.
  - [ ] Ordenar por "más días activo" (proxy de anuncio ganador).

#### JA-038 · Aislamiento del scraper + kill switch
- **Épica:** EP-SEG · **Pts:** 3 · **Prio:** P1 · **Sprint:** S3
- **Como** PO, **quiero** que el scraping corra aislado del App oficial de Meta **para** que un problema con el scraping no ponga en riesgo la app ni los tokens de clientes.
- **Criterios de aceptación**
  - [ ] Servicio/worker de scraping separado (otro servicio en Railway/Fly), sin acceso a la tabla de tokens (rol de DB propio).
  - [ ] Feature flag global y por tenant para apagar M5 en segundos.
  - [ ] Rate limits y user-agents documentados; sin proxies en Etapa 1 con volúmenes bajos; preparado para proxies residenciales LATAM.
  - [ ] Ver riesgos en [../03-meta-y-legal/meta-app-review-y-permisos.md](../03-meta-y-legal/meta-app-review-y-permisos.md).

### Sprint 4 — M6 Análisis de Video + M1 Chat Guía

#### JA-039 · Descarga de videos a storage con TTL
- **Épica:** EP-M6 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S4
- **Como** usuario, **quiero** que los reels propios y de competidores se descarguen para análisis **para** no tener que bajarlos a mano.
- **Criterios de aceptación**
  - [ ] Descarga desde `media_url` (propios y Business Discovery) a R2 o Supabase Storage con path por tenant.
  - [ ] TTL (ej. 30 días ⚠️) y borrado automático; solo se conserva transcripción + análisis.
  - [ ] Límite de tamaño/duración (ej. ≤ 3 min ⚠️); errores claros si el video no está disponible.

#### JA-040 · Transcripción en español
- **Épica:** EP-M6 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S4
- **Como** Tech Lead, **quiero** elegir el proveedor de transcripción con mejor costo/calidad en español rioplatense y mexicano **para** cumplir el costo objetivo (~USD 3/cuenta/mes).
- **Criterios de aceptación**
  - [ ] Benchmark de Whisper API, Deepgram y AssemblyAI con 10 videos reales del piloto: WER aproximado, costo por minuto, latencia ⚠️.
  - [ ] Decisión registrada en ADR.
  - [ ] Integración con interfaz `Transcriber` intercambiable; timestamps por segmento.

#### JA-041 · Análisis LLM de video
- **Épica:** EP-M6 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S4
- **Como** usuario de agencia, **quiero** que la AI desarme cada video en hook, ángulo, estructura y CTA **para** entender por qué funciona.
- **Criterios de aceptación**
  - [ ] Salida JSON validada con zod: hook (texto + tipo + segundos), ángulo, promesa, estructura por bloques con timestamps, CTA, puntuación 1–10 con justificación.
  - [ ] Usa Perfil de Marca de la cuenta como contexto (cuando exista).
  - [ ] Modelo por defecto `claude-sonnet-5-5`; costo en tokens registrado por análisis.

#### JA-042 · UI Análisis de Video
- **Épica:** EP-M6 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S4
- **Como** usuario, **quiero** ver el análisis junto al video y la transcripción **para** usarlo en reuniones con mi cliente.
- **Criterios de aceptación**
  - [ ] Player + transcripción con timestamps clickeables + bloques coloreados (hook/cuerpo/CTA).
  - [ ] Estados: en cola, procesando, listo, error (con reintento).
  - [ ] Comparar 2 videos lado a lado (propio vs. competidor).

#### JA-043 · Paquete `ai`
- **Épica:** EP-M1 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S4
- **Como** desarrollador, **quiero** un paquete único para llamar a Claude **para** centralizar modelos, caching, reintentos y costos.
- **Criterios de aceptación**
  - [ ] Anthropic SDK con routing: `claude-sonnet-5-5` default, `claude-haiku-5-5` clasificación/tareas baratas, `claude-opus-5-5` análisis complejo puntual.
  - [ ] Prompt caching en system prompts y Perfil de Marca.
  - [ ] Registro de tokens de entrada/salida/cache y costo estimado por `tenant_id`/`client_account_id`/feature.
  - [ ] Prompts versionados en archivos (no strings sueltos en componentes).

#### JA-044 · Chat guía con streaming e historial
- **Épica:** EP-M1 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S4
- **Como** usuario, **quiero** hablar con la AI en un chat **para** que me guíe paso a paso sin aprender menús. Ver [../02-producto/flujo-guiado-simple.md](../02-producto/flujo-guiado-simple.md).
- **Criterios de aceptación**
  - [ ] Respuestas en streaming; historial por cuenta cliente persistido.
  - [ ] Botones de acción sugeridos dentro del chat (ej. "Conectar Instagram", "Analizar este reel").
  - [ ] Funciona en celular.

#### JA-045 · Orquestador con delegación a agentes
- **Épica:** EP-M1 · **Pts:** 8 · **Prio:** P1 · **Sprint:** S4
- **Como** usuario, **quiero** que el chat pueda responder sobre mi contenido, competencia y anuncios **para** tener un solo lugar de consulta. Ver [../05-agentes-ai/arquitectura-multiagente.md](../05-agentes-ai/arquitectura-multiagente.md).
- **Criterios de aceptación**
  - [ ] Orquestador con tools: `consultar_mi_contenido`, `consultar_competencia`, `consultar_anuncios`, `analizar_video`, `leer_perfil_marca`.
  - [ ] Cada tool filtra por `tenant_id` y `client_account_id` del contexto (nunca por parámetro del modelo).
  - [ ] Given pregunta "¿qué reel de mis competidores funcionó mejor esta semana?", Then responde con datos reales y links.
  - [ ] Límite de turnos/tokens por conversación.

#### JA-046 · Perfil de Marca construido por chat
- **Épica:** EP-M1 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S4
- **Como** usuario nuevo, **quiero** que la AI me haga preguntas y arme el Perfil de Marca **para** que todos los agentes entiendan a mi cliente.
- **Criterios de aceptación**
  - [ ] Campos: nicho, avatar, oferta (producto, precio, promesa), tono, competidores, objetivos.
  - [ ] La AI pregunta de a una cosa, propone borradores y pide confirmación.
  - [ ] Perfil editable en formulario; versión guardada; todos los agentes lo leen.

### Sprint 5 — M8 + M7 + M9 + M10 + App Review

#### JA-047 · Control de costos de video
- **Épica:** EP-M6 · **Pts:** 3 · **Prio:** P1 · **Sprint:** S5
- **Como** PO, **quiero** límites y caché en el análisis de video **para** mantener el costo variable ≤ USD 10 (techo USD 25)/cuenta/mes.
- **Criterios de aceptación**
  - [ ] Caché por hash del archivo/`media_id`: el mismo video no se transcribe ni analiza dos veces (cross-tenant solo para datos públicos ⚠️ decidir).
  - [ ] Cuota mensual de análisis por cuenta según plan; aviso al 80%.
  - [ ] Prioridad de cola: pedidos manuales > análisis automáticos.

#### JA-048 · Checklist de onboarding paso a paso
- **Épica:** EP-M1 · **Pts:** 3 · **Prio:** P2 · **Sprint:** S5
- **Como** usuario nuevo, **quiero** ver mi progreso de configuración **para** saber qué me falta.
- **Criterios de aceptación**
  - [ ] Pasos: Perfil de Marca → conectar IG → 3 competidores → primer análisis de video → primer guion.
  - [ ] El chat retoma el siguiente paso pendiente al abrir la app.
  - [ ] Evento PostHog por paso (embudo de activación).

#### JA-049 · Generar guiones
- **Épica:** EP-M8 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S5
- **Como** usuario de agencia, **quiero** generar guiones de reels basados en el Perfil de Marca y en videos ganadores **para** que mi cliente grabe contenido con más chances de funcionar.
- **Criterios de aceptación**
  - [ ] Input: objetivo (alcance/venta/autoridad), formato, duración, referencias opcionales (outliers M4, análisis M6, anuncios M5).
  - [ ] Output: hook (3 variantes), desarrollo por bloques, CTA, indicaciones de grabación, por qué debería funcionar (citando referencias).
  - [ ] Respeta tono del Perfil de Marca; nunca copia literal a un competidor (instrucción + chequeo de similitud simple).

#### JA-050 · Editar, versionar y variantes de hook
- **Épica:** EP-M8 · **Pts:** 3 · **Prio:** P2 · **Sprint:** S5
- **Como** usuario, **quiero** editar el guion y pedir variantes **para** ajustarlo antes de enviarlo al cliente.
- **Criterios de aceptación**
  - [ ] Editor de texto con historial de versiones.
  - [ ] Acciones: "más corto", "más polémico", "otro hook", "adaptar a carrusel".
  - [ ] Copiar/exportar (texto, PDF simple).

#### JA-051 · Plan semanal del Coach
- **Épica:** EP-M7 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S5
- **Como** usuario de agencia, **quiero** recibir cada lunes 3–5 recomendaciones concretas por cuenta **para** saber qué hacer esta semana para crecer en orgánico.
- **Criterios de aceptación**
  - [ ] Job semanal: combina M3 + M4 + M5 + M6 + Perfil de Marca.
  - [ ] Cada recomendación con: acción, por qué (evidencia con links), prioridad, esfuerzo estimado.
  - [ ] Recomendación accionable desde el chat ("armame el guion de esta idea").

#### JA-052 · Feedback sobre recomendaciones
- **Épica:** EP-M7 · **Pts:** 2 · **Prio:** P2 · **Sprint:** S5
- **Como** usuario, **quiero** marcar recomendaciones como útiles, no útiles o hechas **para** que el Coach aprenda qué sirve.
- **Criterios de aceptación**
  - [ ] Tres estados + comentario opcional; guardados para evals y contexto futuro.

#### JA-053 · Calendario simple
- **Épica:** EP-M9 · **Pts:** 3 · **Prio:** P2 · **Sprint:** S5
- **Como** usuario de agencia, **quiero** ubicar guiones en un calendario **para** planificar la semana del cliente.
- **Criterios de aceptación**
  - [ ] Vista semanal/mensual; arrastrar guiones a fechas.
  - [ ] Estados: idea → guion → grabado → publicado.
  - [ ] Sin publicación automática (fuera del MVP).

#### JA-054 · Reporte semanal PDF
- **Épica:** EP-M10 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S5
- **Como** agencia, **quiero** un reporte semanal por cliente con mi marca **para** mostrar valor sin armarlo a mano.
- **Criterios de aceptación**
  - [ ] Secciones: resumen ejecutivo AI, KPIs M3, competencia M4, anuncios destacados M5, plan del Coach M7.
  - [ ] PDF con logo y colores de la agencia (branding básico; completo en JA-058).
  - [ ] Generación en worker; tiempo < 60 s por reporte.

#### JA-055 · Envío programado por email + vista web
- **Épica:** EP-M10 · **Pts:** 3 · **Prio:** P1 · **Sprint:** S5
- **Como** agencia, **quiero** que el reporte llegue solo por email cada lunes **para** que mi cliente lo reciba sin que yo intervenga.
- **Criterios de aceptación**
  - [ ] Envío con Resend; destinatarios configurables por cuenta.
  - [ ] Link a vista web del reporte (requiere login o link firmado con expiración).
  - [ ] Opción de "revisar antes de enviar" (borrador para la agencia).

#### JA-056 · Preparar y enviar App Review
- **Épica:** EP-META · **Pts:** 5 · **Prio:** P1 · **Sprint:** S5
- **Como** PO, **quiero** enviar el App Review con Advanced Access **para** poder conectar cuentas de clientes que no son testers.
- **Criterios de aceptación**
  - [ ] Business Verification aprobada (si no, escalar).
  - [ ] Política de privacidad, TyC y data deletion publicados en URLs públicas.
  - [ ] Screencast + descripción de uso por permiso; usuario de prueba con instrucciones.
  - [ ] Checklist de [../03-meta-y-legal/meta-app-review-y-permisos.md](../03-meta-y-legal/meta-app-review-y-permisos.md) completo; envío hecho y fecha registrada.

#### JA-057 · Costo por cuenta cliente
- **Épica:** EP-OBS · **Pts:** 3 · **Prio:** P1 · **Sprint:** S5
- **Como** PO, **quiero** ver cuánto cuesta cada cuenta cliente por mes **para** validar el margen bruto > 80%.
- **Criterios de aceptación**
  - [ ] Agregado mensual: LLM, transcripción, storage, scraping (estimado) por cuenta y tenant.
  - [ ] Panel interno (solo admins de Jedertech) con alerta si una cuenta supera USD 25/mes.

### Sprint 6 — M11 Panel de Agencia + Billing

#### JA-058 · Branding de agencia
- **Épica:** EP-M11 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S6
- **Como** dueño de agencia, **quiero** subir mi logo, colores y nombre **para** que mis clientes vean la plataforma como propia.
- **Criterios de aceptación**
  - [ ] Logo (claro/oscuro), color primario/secundario, nombre comercial, favicon.
  - [ ] Aplicado en app, emails, PDFs y pantalla de login.
  - [ ] Sin menciones a "Jeder AI" visibles para el cliente final (salvo "powered by" opcional configurable).

#### JA-059 · Dominio custom + remitente de email
- **Épica:** EP-M11 · **Pts:** 8 · **Prio:** P1 · **Sprint:** S6
- **Como** dueño de agencia, **quiero** usar `app.miagencia.com` y enviar emails desde mi dominio **para** reforzar mi marca.
- **Criterios de aceptación**
  - [ ] Alta de dominio vía API de dominios de Vercel; instrucciones DNS (CNAME) y verificación automática.
  - [ ] Resolución de tenant por hostname en middleware.
  - [ ] Fallback a subdominio propio (`agencia.<dominio-jeder>`) ⚠️.
  - [ ] Dominio de envío verificado en Resend (SPF/DKIM) o remitente por defecto.

#### JA-060 · Panel multi-cliente
- **Épica:** EP-M11 · **Pts:** 5 · **Prio:** P1 · **Sprint:** S6
- **Como** dueño de agencia, **quiero** ver todas mis cuentas cliente en una tabla **para** saber dónde actuar primero.
- **Criterios de aceptación**
  - [ ] Columnas: estado de conexión, crecimiento 7 días, último reporte enviado, recomendaciones pendientes, alertas (token vencido, cuota).
  - [ ] Filtros y orden; acceso a cada cuenta en un clic.
  - [ ] Uso del plan (cuentas usadas/límite).

#### JA-061 · Acceso de cliente final (viewer)
- **Épica:** EP-M11 · **Pts:** 3 · **Prio:** P2 · **Sprint:** S6
- **Como** cliente de la agencia, **quiero** entrar a ver mis reportes, guiones y calendario **para** seguir el trabajo sin pedirlo por WhatsApp.
- **Criterios de aceptación**
  - [ ] Rol `client_viewer` limitado a su(s) cuenta(s) cliente (test de RLS).
  - [ ] La agencia decide qué módulos ve el cliente.

#### JA-062 · Stripe: planes, setup fee, checkout y portal
- **Épica:** EP-BIL · **Pts:** 8 · **Prio:** P1 · **Sprint:** S6
- **Como** agencia, **quiero** pagar con tarjeta y gestionar mi suscripción **para** empezar sin hablar con ventas.
- **Criterios de aceptación**
  - [ ] Productos Agency Starter (USD 497, setup USD 500), Pro (USD 997, setup USD 1.000), Scale (USD 1.997, setup USD 1.000), cuenta extra USD 39 ⚠️ precios a validar.
  - [ ] Checkout con setup fee como item único en la primera factura.
  - [ ] Customer Portal para cambiar plan, tarjeta y cancelar.
  - [ ] Modo test completo en staging.

#### JA-063 · Límites por plan + webhooks de suscripción
- **Épica:** EP-BIL · **Pts:** 5 · **Prio:** P1 · **Sprint:** S6
- **Como** PO, **quiero** que el plan pagado controle los límites **para** que nadie use más de lo que paga.
- **Criterios de aceptación**
  - [ ] Webhooks firmados (`checkout.session.completed`, `customer.subscription.updated/deleted`, `invoice.payment_failed`) idempotentes.
  - [ ] Límite de cuentas cliente (5/20/60) + cuentas extra facturadas como cantidad.
  - [ ] Pago fallido → período de gracia 7 días ⚠️ → modo solo lectura.

#### JA-064 · Oferta Founders −40%
- **Épica:** EP-BIL · **Pts:** 1 · **Prio:** P1 · **Sprint:** S6
- **Como** PO, **quiero** un cupón Founders −40% de por vida para las primeras 10 agencias **para** cerrar las primeras ventas.
- **Criterios de aceptación**
  - [ ] Cupón `forever` con máximo 10 canjes; aplicable solo por link.

#### JA-065 · Audit log de acciones sensibles
- **Épica:** EP-SEG · **Pts:** 2 · **Prio:** P2 · **Sprint:** S6
- **Como** dueño de agencia, **quiero** saber quién conectó/desconectó cuentas, cambió roles o facturación **para** tener trazabilidad.
- **Criterios de aceptación**
  - [ ] Tabla append-only con actor, acción, objetivo, fecha, IP; visible para owner/admin.

#### JA-066 · MercadoPago (opcional)
- **Épica:** EP-BIL · **Pts:** 5 · **Prio:** P3 · **Sprint:** S6 (stretch; depende de JA-004)
- **Como** agencia de LATAM, **quiero** pagar con MercadoPago **para** evitar problemas con tarjetas internacionales.
- **Criterios de aceptación**
  - [ ] Solo si la síntesis de entrevistas lo justifica (decisión en [../10-preguntas-abiertas.md](../10-preguntas-abiertas.md)).
  - [ ] Suscripciones (preapproval) en USD o moneda local ⚠️; webhooks mapeados al mismo modelo de suscripción que Stripe.

### Sprint 7 — Hardening + Founders + beta paga

#### JA-067 · Revisión de seguridad pre-lanzamiento
- **Épica:** EP-SEG · **Pts:** 5 · **Prio:** P1 · **Sprint:** S7
- **Como** PO, **quiero** una revisión de seguridad antes de abrir a otras agencias **para** no exponer datos de clientes.
- **Criterios de aceptación**
  - [ ] Auditoría de RLS tabla por tabla + tests cross-tenant de todos los endpoints.
  - [ ] OWASP Top 10: validación de inputs (zod), SSRF en descargas, headers de seguridad, rate limit por IP/usuario en API y chat.
  - [ ] Revisión de prompt injection en el chat (datos de competidores son input no confiable).
  - [ ] Dependencias sin vulnerabilidades críticas; hallazgos críticos/altos resueltos.

#### JA-068 · Alertas operativas
- **Épica:** EP-OBS · **Pts:** 3 · **Prio:** P1 · **Sprint:** S7
- **Como** Tech Lead, **quiero** alertas en Slack/WhatsApp **para** enterarme de problemas antes que los clientes.
- **Criterios de aceptación**
  - [ ] Alertas: tasa de error de jobs > X%, scraper en circuit breaker, tokens por vencer, costo diario anómalo, worker sin heartbeat.

#### JA-069 · Métricas de producto
- **Épica:** EP-OBS · **Pts:** 3 · **Prio:** P2 · **Sprint:** S7
- **Como** PO, **quiero** ver activación, retención y uso por módulo **para** decidir qué mejorar.
- **Criterios de aceptación**
  - [ ] Dashboard PostHog: embudo de onboarding, usuarios activos semanales por tenant, uso por módulo, reportes abiertos.

#### JA-070 · Backups, restore probado y runbook
- **Épica:** EP-FUN · **Pts:** 3 · **Prio:** P1 · **Sprint:** S7
- **Como** Tech Lead, **quiero** backups verificados y un runbook **para** recuperarnos de un incidente.
- **Criterios de aceptación**
  - [ ] Backups diarios (PITR si el plan de Supabase lo permite ⚠️); restore probado en staging.
  - [ ] Runbook: caída de worker, Meta bloquea scraper, token masivo expirado, fuga de datos.

#### JA-071 · Legal final + DPA para agencias
- **Épica:** EP-SEG · **Pts:** 3 · **Prio:** P1 · **Sprint:** S7
- **Como** PO, **quiero** TyC, privacidad y un acuerdo de procesamiento de datos para agencias **para** vender con respaldo legal.
- **Criterios de aceptación**
  - [ ] Revisados por asesor legal; aceptación registrada al contratar.
  - [ ] DPA que define a la agencia como responsable y a Jedertech como encargado ⚠️.

#### JA-072 · Performance de dashboards
- **Épica:** EP-FUN · **Pts:** 3 · **Prio:** P2 · **Sprint:** S7
- **Como** usuario, **quiero** que las pantallas carguen rápido **para** usarlas en reuniones con clientes.
- **Criterios de aceptación**
  - [ ] p95 < 2 s en dashboards M3/M4/M11 con datos del piloto; índices revisados; caché donde aplique.

#### JA-073 · Evals de prompts de agentes
- **Épica:** EP-M1 · **Pts:** 5 · **Prio:** P2 · **Sprint:** S7
- **Como** Tech Lead, **quiero** un set de casos de prueba de los agentes **para** cambiar prompts sin romper calidad.
- **Criterios de aceptación**
  - [ ] 20+ casos (orquestador, análisis de video, guionista, coach) con criterios de evaluación.
  - [ ] Script `pnpm evals` que corre y reporta puntaje; se corre antes de mergear cambios de prompts.

#### JA-074 · Onboarding de agencias Founders
- **Épica:** EP-VAL · **Pts:** 5 · **Prio:** P1 · **Sprint:** S7
- **Como** PO, **quiero** un proceso de onboarding repetible **para** activar 5 agencias Founders en 2 semanas.
- **Criterios de aceptación**
  - [ ] Playbook: llamada de 45 min, checklist de configuración, materiales de reventa para la agencia.
  - [ ] 5 agencias con ≥3 cuentas cliente conectadas cada una.

#### JA-075 · Página de precios + demo + caso piloto
- **Épica:** EP-VAL · **Pts:** 3 · **Prio:** P1 · **Sprint:** S7
- **Como** PO, **quiero** material de venta concreto **para** convertir la waitlist.
- **Criterios de aceptación**
  - [ ] Página de precios con planes de agencia y oferta Founders.
  - [ ] Demo grabada de 3–5 min; caso del piloto con métricas antes/después.

#### JA-076 · Watchlist de anunciantes
- **Épica:** EP-M5 · **Pts:** 3 · **Prio:** P3 · **Sprint:** S7 (stretch)
- **Como** usuario, **quiero** seguir a anunciantes y ver sus anuncios nuevos **para** detectar lanzamientos de la competencia.
- **Criterios de aceptación**
  - [ ] Refresh semanal por anunciante seguido; marca "nuevo" en anuncios con `first_seen_at` en los últimos 7 días; aparece en el reporte.

#### JA-077 · Adaptador a proveedor de respaldo
- **Épica:** EP-M5 · **Pts:** 3 · **Prio:** P3 · **Sprint:** S7 (stretch)
- **Como** PO, **quiero** un proveedor alternativo de datos de anuncios **para** que M5 siga funcionando si el scraper propio cae.
- **Criterios de aceptación**
  - [ ] Interfaz `AdsSource` con implementación propia + proveedor externo (ej. actor de Apify ⚠️ evaluar costo y términos).
  - [ ] Switch por feature flag.

#### JA-078 · Responder App Review / obtener Advanced Access
- **Épica:** EP-META · **Pts:** 3 · **Prio:** P1 · **Sprint:** S7
- **Como** PO, **quiero** resolver las observaciones de Meta **para** abrir la conexión a cualquier cliente.
- **Criterios de aceptación**
  - [ ] Observaciones respondidas en ≤ 3 días hábiles; reenvío hecho.
  - [ ] Si se aprueba: Advanced Access activo y verificado con una cuenta no tester.
  - [ ] Si sigue pendiente: plan B documentado (clientes como testers) aprobado por el PO.

---

## 4. Post-MVP — épicas de alto nivel

### EP-M12 · Tracking de Ventas (Etapa 3, meses 5–6)
Ver [../06-tracking/tracking-infoproductores.md](../06-tracking/tracking-infoproductores.md).

| ID | Historia (alto nivel) | Estimación gruesa |
|---|---|---|
| JA-101 | Como agencia, quiero conectar Hotmart/Kiwify/Eduzz vía webhook para registrar ventas automáticamente | 8 |
| JA-102 | Como usuario, quiero links con UTM por pieza de contenido/guion para atribuir ventas | 5 |
| JA-103 | Como usuario, quiero un dashboard de ventas por contenido, anuncio y canal (WhatsApp/web) | 8 |
| JA-104 | Como sistema, quiero atribución simple (último clic + ventana configurable) | 8 |
| JA-105 | Como Coach, quiero usar ventas atribuidas como señal en el plan semanal | 5 |
| JA-106 | Como agencia, quiero conciliar ventas vs. plataforma (±5%) y ver discrepancias | 5 |
| JA-107 | Como cliente, quiero que los datos de compradores se guarden minimizados/hasheados | 3 |

### EP-M13 · Pack E-commerce + Self-serve (Etapa 4, meses 7–9)

| ID | Historia (alto nivel) | Estimación gruesa |
|---|---|---|
| JA-121 | Como infoproductor, quiero registrarme y pagar el plan Solo/Pro sin hablar con nadie | 8 |
| JA-122 | Como usuario nuevo, quiero que el onboarding por chat me deje con valor en < 15 min | 8 |
| JA-123 | Como e-commerce, quiero conectar Shopify/Tiendanube para cruzar productos con contenido | 8 |
| JA-124 | Como e-commerce, quiero analizar anuncios de producto de la competencia por categoría | 5 |
| JA-125 | Como e-commerce, quiero plantillas de guion para producto físico (unboxing, demo, UGC) | 5 |
| JA-126 | Como PO, quiero planes anuales (2 meses gratis) y trial/demo | 3 |
| JA-127 | Como PO, quiero reglas para no canibalizar a las agencias (precios, leads derivados) | 3 |

### EP-M14 · Editor de Video AI (Etapa 5, mes 10+)

| ID | Historia (alto nivel) | Estimación gruesa |
|---|---|---|
| JA-141 | Spike: comprar vs. construir (APIs de edición, FFmpeg propio, costos de render) | 13 (time-box) |
| JA-142 | Como usuario, quiero subtítulos automáticos con estilo de marca | 8 |
| JA-143 | Como usuario, quiero recorte automático de silencios y muletillas | 8 |
| JA-144 | Como usuario, quiero generar 3 variantes de hook a partir del mismo video | 8 |
| JA-145 | Como usuario, quiero exportar en 9:16 listo para publicar | 5 |
| JA-146 | Como PO, quiero una cola de render con costo controlado por plan | 5 |
