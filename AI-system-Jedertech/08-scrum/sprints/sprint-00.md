# Sprint 0 — Validación + setup (Etapa 0, semanas 1–2)

> Etapa: [Etapa 0](../../07-roadmap/etapas.md#etapa-0--validación--piloto-agencia-sprint-0-semanas-12) · Backlog: [../backlog.md](../backlog.md) · Cómo trabajamos: [../como-trabajamos.md](../como-trabajamos.md)

## Sprint goal
**"Al terminar S0 sabemos si 3+ agencias pagarían Jeder AI, tenemos el piloto definido y todo lo que depende de terceros (Meta, dominio, repo) ya está en marcha."**

## Historias incluidas (23 pts)
| ID | Historia | Pts | Dueño |
|---|---|---|---|
| JA-001 | Guion + 10 entrevistas a agencias | 5 | PO (Sergio acompaña 3–4) |
| JA-002 | Landing con waitlist | 3 | Sergio + Claude |
| JA-003 | Definir piloto con la agencia Jedertech | 2 | PO |
| JA-004 | Síntesis de entrevistas + decisión go/no-go | 2 | PO + Sergio (Claude sintetiza) |
| JA-005 | Crear app de Meta en modo desarrollo | 3 | Sergio |
| JA-006 | Iniciar Business Verification | 2 | PO |
| JA-007 | Borradores de Privacidad, TyC y borrado de datos | 3 | PO + Claude (borrador) |
| JA-008 | Repo nuevo + CLAUDE.md + subagentes + GitHub Projects | 3 | Sergio |

## Tareas paso a paso

### Comerciales (PO, con apoyo de Sergio)
- [ ] Día 1: armar lista de 20 agencias objetivo (contactos propios, LinkedIn, comunidades de infoproductores) para lograr 10 entrevistas.
- [ ] Día 1: adaptar guion de entrevista desde [../../01-comercial/](../../01-comercial/) (problema → proceso actual → herramientas → presupuesto → precio → interés Founders).
- [ ] Días 2–8: agendar y hacer 10 entrevistas de 30 min (grabar con permiso).
- [ ] Después de cada entrevista: cargar notas en la tabla compartida (agencia, país, n.º clientes, dolor top-3, herramientas actuales, precio aceptado, ¿MercadoPago?, ¿Founders?).
- [ ] Día 9: Sergio pide a Claude la síntesis (ver prompts) → PO revisa.
- [ ] Día 10: decisión go / ajustar / no-go y registrar en [../../10-preguntas-abiertas.md](../../10-preguntas-abiertas.md).
- [ ] Definir piloto: 3–5 cuentas cliente, consentimiento por escrito de cada cliente, responsable en la agencia, 3–5 competidores por cuenta, criterios de éxito.

### Landing waitlist (Sergio + Claude)
- [ ] Comprar/definir dominio (nombre de trabajo "Jeder AI" ⚠️ nombre comercial pendiente).
- [ ] Landing simple (Next.js estático en Vercel o herramienta no-code) con: propuesta de valor para agencias, 3 beneficios, formulario (nombre, email, agencia, n.º clientes, país).
- [ ] Guardar leads en Supabase (tabla `waitlist`) o en un form provider; email de confirmación con Resend.
- [ ] PostHog: eventos `waitlist_view`, `waitlist_submit`.
- [ ] Publicar `/legal/privacidad` (borrador de JA-007).

### Meta (Sergio + PO)
- [ ] Verificar acceso de admin al Business Manager de Jedertech.
- [ ] PO: iniciar **Business Verification** el día 1–2 (documentación legal, dominio con email corporativo).
- [ ] Sergio: crear app tipo Business, agregar Facebook Login for Business + Instagram Graph API, configurar redirect URIs (localhost + staging).
- [ ] Agregar a los clientes del piloto y al equipo de la agencia como testers/roles de la app.
- [ ] Leer [../../03-meta-y-legal/meta-app-review-y-permisos.md](../../03-meta-y-legal/meta-app-review-y-permisos.md) y abrir un issue por cada permiso con "qué dato usamos y dónde se ve".
- [ ] Guardar App ID/secret en el gestor de secretos (1Password/Bitwarden + variables de Vercel/Railway), nunca en el repo.

### Repo y forma de trabajo (Sergio + Claude)
- [ ] Crear repo privado `jedertech-ai-platform` (ver decisión en [../../10-preguntas-abiertas.md](../../10-preguntas-abiertas.md)).
- [ ] Copiar `CLAUDE.md` propuesto de [../../09-desarrollo-con-ia/guia-sergio-con-claude.md](../../09-desarrollo-con-ia/guia-sergio-con-claude.md).
- [ ] Copiar los subagentes de [../../09-desarrollo-con-ia/agentes-dev/](../../09-desarrollo-con-ia/agentes-dev/) a `.claude/agents/`.
- [ ] Crear labels, plantillas de issue/PR y branch protection según [../como-trabajamos.md](../como-trabajamos.md).
- [ ] Crear GitHub Project con campos y cargar las historias de S1 (Claude puede generar los issues con `gh issue create` desde el backlog).
- [ ] Leer el scrapper actual (`src/extractors.ts`, `src/storage.ts`, `docs/ARCHITECTURE.md`) y anotar en un issue qué se porta en S3 (ver [../../04-arquitectura/reutilizacion-del-scrapper.md](../../04-arquitectura/reutilizacion-del-scrapper.md)).
- [ ] Crear cuentas: Supabase, Vercel, Railway/Fly.io, Anthropic Console, Sentry, PostHog, Resend (con email de la empresa, 2FA activado).

## Entregable / demo (review del viernes)
1. Tabla con las 10 entrevistas + síntesis de 1 página + decisión del PO.
2. Landing pública con contador de waitlist.
3. Captura de Business Verification enviada y de la app de Meta en modo desarrollo.
4. Repo con CLAUDE.md, agentes y board de S1 listo.

## Riesgos
| Riesgo | Mitigación |
|---|---|
| No se llega a 10 entrevistas | Empezar a agendar el día 1; pedir referidos al final de cada entrevista; aceptar 7–8 y completar en S1 |
| Business Verification pide documentos que no hay a mano | Juntar documentación legal antes de iniciar |
| Sergio se pone a programar el producto | Regla: en S0 solo landing + setup; nada de features |
| Señal de pago débil | Repetir validación ajustando ICP (tamaño de agencia, nicho) antes de S1 |

## Definición de "terminado" del sprint
- [ ] Las 8 historias aceptadas por el PO (o con desvío explicado).
- [ ] Decisión go/no-go registrada.
- [ ] Business Verification enviada.
- [ ] S1 planificado con historias "Ready".

## Prompts sugeridos para Claude Code
```text
Leé AI-system-Jedertech/01-comercial/ y armá un guion de entrevista de 30 minutos para agencias
de infoproductores en LATAM. Objetivo: validar dolor (análisis de competencia, guiones, reportes),
disposición a pagar USD 497/mes (Agency Starter) y a revender en marca blanca. Incluí preguntas
abiertas, sin sesgo, y una sección final de cierre con la oferta Founders (-40% de por vida).
```
```text
Te paso las notas de 10 entrevistas (abajo). Sintetizá: top-5 dolores con frecuencia, top-3 objeciones,
rango de precio aceptado, % que pide MercadoPago, citas textuales destacadas y una recomendación
go / ajustar / no-go con argumentos. Marcá lo que es inferencia vs. dato.
```
```text
Creá una landing en Next.js (App Router, Tailwind, shadcn/ui) para "Jeder AI" orientada a agencias
de infoproductores. Hero, 3 beneficios, cómo funciona (3 pasos), formulario de waitlist que guarda
en Supabase (tabla waitlist) y dispara evento de PostHog. Sin secretos en el código: usá variables
de entorno y un .env.example. Antes de codear, mostrame el plan.
```
```text
Con el backlog de AI-system-Jedertech/08-scrum/backlog.md, generá los comandos `gh issue create`
para las historias JA-009 a JA-020 con título "JA-XXX · ...", cuerpo con historia y criterios,
labels type:story, mod:* y prioridad. No los ejecutes: mostrámelos para revisar.
```
