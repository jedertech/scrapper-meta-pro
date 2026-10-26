# Sprint 6 — M11 Panel de Agencia marca blanca + Billing (Etapa 2, semanas 13–14)

> Backlog: [../backlog.md](../backlog.md) · Pricing: [../../01-comercial/](../../01-comercial/) · Etapa 2: [../../07-roadmap/etapas.md](../../07-roadmap/etapas.md#etapa-2--lanzamiento-marca-blanca--primeras-ventas-sprint-67-semanas-1316)

## Sprint goal
**"Una agencia nueva puede pagar su plan con tarjeta, poner su logo, colores y dominio, y gestionar todas sus cuentas cliente desde un panel, sin intervención de Jedertech."**

## Historias incluidas (42 pts; 37 sin MercadoPago)
| ID | Historia | Pts |
|---|---|---|
| JA-058 | Branding de agencia | 5 |
| JA-059 | Dominio custom + remitente de email | 8 |
| JA-060 | Panel multi-cliente | 5 |
| JA-061 | Acceso de cliente final (viewer) | 3 |
| JA-062 | Stripe: planes, setup fee, checkout y portal | 8 |
| JA-063 | Límites por plan + webhooks | 5 |
| JA-064 | Oferta Founders −40% | 1 |
| JA-065 | Audit log de acciones sensibles | 2 |
| JA-066 | MercadoPago (opcional / stretch) | 5 |

## Tareas técnicas paso a paso
1. **Branding (JA-058)**
   - [ ] Tabla `tenant_branding` (logo claro/oscuro, colores, nombre, favicon, `powered_by` bool).
   - [ ] Subida de logo a storage; CSS variables por tenant inyectadas en el layout (tema shadcn).
   - [ ] Aplicar en emails (plantillas Resend), PDF del reporte y pantalla de login.
2. **Dominio custom (JA-059)**
   - [ ] Tabla `tenant_domains` (hostname, estado de verificación).
   - [ ] Integración con API de dominios del proyecto en Vercel: alta, verificación, instrucciones CNAME.
   - [ ] Middleware: resolver tenant por `host`; login funciona en el dominio custom (cookies por dominio ⚠️ probar con Supabase Auth y redirect URLs).
   - [ ] Fallback subdominio `{slug}.<dominio-jeder>` ⚠️.
   - [ ] Dominio de envío en Resend (SPF/DKIM) opcional por agencia.
3. **Panel multi-cliente (JA-060)** y **viewer (JA-061)**
   - [ ] `/agencia`: tabla con estado de conexión, crecimiento 7 días, último reporte, recomendaciones pendientes, alertas; uso del plan.
   - [ ] Rol `client_viewer` con acceso a cuentas asignadas; config de módulos visibles; tests de RLS.
4. **Billing (JA-062, JA-063, JA-064)**
   - [ ] Productos y precios en Stripe (modo test): Agency Starter/Pro/Scale + setup fees + "cuenta extra" con cantidad ⚠️ precios a validar.
   - [ ] Checkout Session (suscripción + setup fee one-time), Customer Portal.
   - [ ] Webhook `/api/stripe/webhook`: verificación de firma, idempotencia por `event.id`, tabla `subscriptions`.
   - [ ] Enforcement: límites de cuentas cliente por plan; gracia 7 días ⚠️ en pago fallido → solo lectura.
   - [ ] Cupón Founders: −40% `forever`, máx. 10 canjes, promotion code.
5. **Audit log (JA-065)**
   - [ ] Tabla append-only `audit_events`; registrar conexión/desconexión, cambios de rol, billing, dominio.
6. **MercadoPago (JA-066) — solo si JA-004 lo decidió**
   - [ ] Suscripciones (preapproval) mapeadas al mismo modelo `subscriptions`; webhooks firmados.

## Entregable / demo
Flujo completo con una "agencia de prueba": checkout con cupón Founders (Stripe test) → configurar logo/colores → agregar `app.agencia-prueba.com` → crear 3 cuentas → invitar a un cliente como viewer → el cliente ve el reporte con la marca de la agencia y sin "Jeder AI".

## Riesgos
| Riesgo | Mitigación |
|---|---|
| Auth en dominios custom (cookies, redirects de Supabase) | Spike el día 1; fallback a subdominio |
| Redirect URIs de Meta por cada dominio custom | El OAuth de Meta se hace siempre en un dominio central y vuelve al dominio de la agencia ⚠️ diseñar en ADR |
| Webhooks duplicados/desordenados | Idempotencia + leer estado actual de Stripe ante dudas |
| Impuestos/facturación LATAM | Stripe Tax ⚠️ y consulta contable (ver [../../10-preguntas-abiertas.md](../../10-preguntas-abiertas.md)) |

## Definición de "terminado" del sprint
- [ ] Una agencia de prueba completa el flujo de la demo sin ayuda.
- [ ] Webhooks probados con Stripe CLI (alta, upgrade, cancelación, pago fallido).
- [ ] Tests de RLS para `client_viewer`.
- [ ] Ningún texto/logo de Jeder AI visible para el cliente final con `powered_by` desactivado.

## Prompts sugeridos para Claude Code
```text
Plan mode. Diseñá la marca blanca: branding por tenant (CSS variables shadcn), resolución de tenant por
hostname en middleware, dominios custom con la API de Vercel y cómo resolver el OAuth de Meta y los
redirects de Supabase Auth cuando el usuario está en app.agencia.com. Proponé ADR con alternativas.
```
```text
Usá el subagente backend: integración Stripe con planes Agency Starter/Pro/Scale, setup fee en la
primera factura, cuentas extra como cantidad, Customer Portal y webhook idempotente con verificación
de firma. Tabla subscriptions y enforcement de límites de cuentas cliente. Tests con eventos de Stripe
de ejemplo (sin llamadas reales).
```
```text
Usá el subagente frontend: panel /agencia con tabla de cuentas cliente (estado conexión, crecimiento
7d, último reporte, recomendaciones pendientes, alertas) y medidor de uso del plan. Aplicá el branding
del tenant.
```
```text
Usá el subagente seguridad: revisá webhooks de Stripe, rol client_viewer, resolución de tenant por
host (¿se puede forzar otro tenant con un header Host manipulado?) y subida de logos (tipo y tamaño).
```
