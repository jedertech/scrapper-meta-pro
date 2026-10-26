# Costos de infraestructura y AI

> **Todo este documento es una estimación.** Los precios de proveedores cambian; verificar en cada sitio antes de decidir. Las cifras con ⚠️ son supuestos.
> Relacionados: [Pricing y unit economics](../01-comercial/pricing-y-unit-economics.md) · [ADR 0004 LLM y transcripción](adr/0004-proveedor-llm-y-transcripcion.md) · [Métricas de costo](../02-producto/metricas-norte.md#3-métricas-de-costo-ai-e-infraestructura-por-cuenta) · [Arquitectura](arquitectura-general.md)

---

## 1. Supuestos de uso por cuenta cliente (mes típico) ⚠️

| Supuesto | Valor |
|---|---|
| Posts propios nuevos | 30 |
| Competidores seguidos | 10 (≈ 300 posts nuevos/mes entre todos) |
| Videos analizados (propios + competencia + anuncios) | 40 (≈ 45 s promedio → **30 min**; techo de plan: 90 min) |
| Anunciantes seguidos | 5 (refresh semanal) + 2 búsquedas por palabra clave |
| Guiones generados (incluye reescrituras) | 40 llamadas (~25 guiones) |
| Turnos de chat | 150 |
| Planes semanales y reportes | 4 + 4 |
| Diagnóstico mensual profundo (Opus) | 1 |

## 2. Costo de LLM por cuenta (detalle)

Precios usados (USD por millón de tokens, ⚠️ verificar): **Sonnet 5.5** 2 in / 10 out / 0,20 lectura de cache · **Haiku 5.5** 0,10 / 0,50 · **Opus 5.5** 4 / 20 · **Batches API** ≈ −50%.

| Tarea | Modelo | Volumen/mes | Tokens (in / out) | Costo estimado |
|---|---|---|---|---|
| Clasificar posts propios y de competidores | Haiku | 330 llamadas | 500k / 66k | USD 0,08 |
| Análisis de video | Sonnet | 40 | 200k (parte cacheada) / 48k | USD 0,80 |
| Resumen de radar + ángulos de anuncios | Sonnet (Batch) | 8 | 160k / 16k | USD 0,25 |
| Plan semanal del Coach | Sonnet (Batch) | 4 | 160k / 12k | USD 0,22 |
| Guionista | Sonnet | 40 | 600k (80% cache) / 100k | USD 1,35 |
| Chat (orquestador, con tools) | Sonnet | 150 turnos | 3,75M (80% cache) / 90k | USD 3,00 |
| Diagnóstico mensual | Opus | 1 | 80k / 6k | USD 0,45 |
| **Total LLM** | | | | **≈ USD 6 (rango USD 4–9)** ⚠️ |

> El thinking adaptativo se factura como tokens de salida: controlarlo con `effort` (`low` en el chat y el enrutamiento). Si el cache hit ratio del chat cae del 80% al 30%, el chat solo pasa de ~USD 3 a ~USD 6.

## 3. Otros costos variables por cuenta

| Concepto | Cálculo ⚠️ | USD/mes por cuenta |
|---|---|---|
| Transcripción | 30–90 min × ~USD 0,005/min | 0,15–0,45 |
| Proxies residenciales | 0,2–0,8 GB × USD 3–8/GB (con bloqueo de imágenes y fuentes + dedupe entre tenants) | 0,6–6 (base ~3) |
| R2 (videos con TTL 30 días + PDFs) | ~1–2 GB-mes × USD 0,015 + operaciones | < 0,10 |
| Emails (Resend) | ~10 emails | ~0 (dentro del plan) |
| **Variable total por cuenta** | LLM + transcripción + proxy + storage | **≈ USD 8–16 (base ~10)** |

---

## 4. Escenarios mensuales: 10 / 50 / 200 cuentas cliente

### 4.1 Infra fija (escala por escalones, no por cuenta)

| Servicio | 10 cuentas | 50 cuentas | 200 cuentas | Notas ⚠️ |
|---|---|---|---|---|
| Vercel (web) | 20 | 20–40 | 40–60 | Pro por miembro + uso |
| Railway/Fly: `apps/worker` | 25 | 80 (2 réplicas) | 160 (4 réplicas) | ~2 GB RAM / 1 vCPU por réplica |
| Railway/Fly: `scraper-worker` (aislado) | 25 | 80 (2 réplicas) | 200 (4–6 réplicas) | 1 Chromium por réplica |
| Supabase (Postgres + Auth) | 25 | 50–75 | 110–200 | Pro + upgrade de compute |
| Redis (BullMQ) | 5 | 10 | 30 | Railway Redis o Upstash |
| Staging (web + worker + DB chicos) | 30 | 40 | 60 | |
| Sentry | 0 | 26 | 80 | Free → Team |
| PostHog | 0 | 0 | 0–50 | Free hasta ~1M eventos |
| Resend | 0 | 20 | 20–35 | Free (3k/mes) → Pro |
| R2 (base) | 1 | 3 | 10 | |
| Otros (dominios, GitHub, backups) | 10 | 20 | 50 | |
| **Subtotal fijo** | **≈ 140–180** | **≈ 350–395** | **≈ 760–940** | Coincide con los "fijos iniciales ~150–300" del brief en Etapa 1 |

### 4.2 Variable

| Concepto | 10 cuentas | 50 cuentas | 200 cuentas |
|---|---|---|---|
| LLM (≈ USD 6/cuenta) | 60 | 300 | 1.200 |
| Transcripción | 3 | 15 | 60 |
| Proxies | 0 (Etapa 1 sin proxy) | 150 | 500 (dedupe entre tenants) |
| Storage | 1 | 5 | 20 |
| **Subtotal variable** | **≈ 65** | **≈ 470** | **≈ 1.780** |

### 4.3 Total y costo por cuenta

| | 10 cuentas | 50 cuentas | 200 cuentas |
|---|---|---|---|
| **Total mensual** | **≈ USD 205–245** | **≈ USD 820–865** | **≈ USD 2.540–2.720** |
| Costo total por cuenta | ≈ 20–25 | ≈ 16–17 | ≈ 13 |
| Costo variable por cuenta | ≈ 6,5 | ≈ 9,4 | ≈ 8,9 |

---

## 5. ⚠️ Hallazgo: margen por plan

El brief fija un **costo variable tope de USD 25 por cuenta** y un **margen bruto > 80%**. Con los precios de marca blanca, esas dos metas **no son compatibles en Pro y Scale con uso completo**: el ingreso por cuenta es bajo.

| Plan | Ingreso por cuenta con uso completo | Margen con costo USD 8/cuenta | con USD 14 | con USD 25 |
|---|---|---|---|---|
| Agency Starter (497 / 5) | 99,4 | 92% | 86% | 75% |
| Agency Pro (997 / 20) | 49,9 | 84% | 72% | 50% |
| Agency Scale (1.997 / 60) | 33,3 | 76% | 58% | 25% |
| Cuenta extra | 39 | 79% | 64% | 36% |
| Solo público final (297 / 1) | 297 | 97% | 95% | 92% |

*(Margen sobre costo variable; sin setup ni costos fijos.)*

**Recomendaciones:**
1. Objetivo operativo de costo variable: **≤ USD 8–10 por cuenta** en planes de agencia. Dejar USD 25 como **techo duro** (alerta y throttling), no como presupuesto.
2. **Cuotas por plan** (`plan_limits`): Scale con menos minutos de video y mensajes de chat por cuenta que Starter, o cuotas a nivel tenant (pool) en vez de por cuenta.
3. Revisar el precio de la cuenta extra (USD 39) y de Scale con el PO → ver [Pricing y unit economics](../01-comercial/pricing-y-unit-economics.md) y [Preguntas abiertas](../10-preguntas-abiertas.md).
4. Medir el **uso real** en Etapa 1: las agencias rara vez usan el 100% del cupo ⚠️.

---

## 6. Cómo controlar costos

### 6.1 LLM

| Palanca | Ahorro esperado | Implementación |
|---|---|---|
| **Prompt caching** | Hasta ~90% del input repetido | Orden fijo: tools → system → Perfil de Marca (`cache_control`) → historial → mensaje nuevo. Nada variable (fecha, IDs) antes del breakpoint. Monitorear `cache_read_input_tokens` |
| **Haiku para tareas baratas** | 20× más barato que Sonnet en input | Clasificación, etiquetado, enrutamiento, extracción, jueces simples |
| **Batches API** | ~50% | Plan semanal, reportes, re-análisis masivos, evals |
| **`effort` por ruta** | Menos tokens de thinking y de salida | `low` en el chat y el enrutamiento; `medium` en guiones; `high` solo en el diagnóstico mensual |
| **Dedupe de análisis** | Evita repetir trabajo | `videos.content_hash` único; el mismo Reel de un competidor seguido por 3 cuentas se transcribe 1 vez (el análisis por Perfil de Marca sí es por tenant, pero se puede reutilizar la parte "objetiva") |
| **Resúmenes en vez de datos crudos** | Menos input | Los tools devuelven agregados (top 10, promedios), no 300 posts |
| **Compactación del historial** | Menos input en threads largos | `chat_threads.summary` después de N turnos |
| **Límites por plan** | Techo de costo | Mensajes de chat, guiones y minutos de video por mes; respuesta amable al llegar al límite |
| **Opus solo con flag** | Evita sorpresas | `% de llamadas Opus ≤ 3%`; alerta si se supera |

### 6.2 Transcripción y video

- Transcribir solo los videos que importan: top N propios y de competidores por `outlier_score`, no todos.
- TTL de 30 días en R2 (lifecycle rule) y dedupe por hash.
- Si el video dura más de 3 min, transcribir solo los primeros 90 s para el análisis de hook (configurable) ⚠️.

### 6.3 Scraping y proxies

- Sin proxy en Etapa 0–1 (volúmenes bajos, IP del datacenter aislado) ⚠️.
- Bloquear `image`, `media` y `font` en `page.route` salvo cuando se captura media.
- Dedupe global de anunciantes (1 scrape sirve a N tenants).
- Frecuencia por plan: semanal por defecto, diaria solo en planes altos.
- Circuit breaker global ante `RATE_LIMITED` (no quemar GB contra un bloqueo).

### 6.4 Infra

- Workers stateless con autoescalado por largo de cola (no sobredimensionar).
- Particionar `post_metrics_snapshots` y compactar datos viejos (ver [retención](modelo-de-datos.md#5-retención-de-datos)).
- Revisar el plan de Supabase al pasar 8 GB de DB ⚠️.

### 6.5 Alertas de costo (obligatorias desde S5)

| Alerta | Umbral | Acción |
|---|---|---|
| Cuenta con costo variable alto | > USD 15 en el mes | Revisar uso; throttling suave |
| Tenant con margen bajo | < 70% | Conversación comercial / ajustar cuotas |
| Gasto diario LLM total | > 2× promedio de 7 días | Revisar bucles de agentes o abuso |
| Cache hit ratio del chat | < 30% durante 24 h | Buscar el "invalidador silencioso" (algo variable en el prefijo) |
| GB de proxy por job | > 3× mediana | Revisar bloqueo de recursos o bucle de scroll |

Fuente de datos: `usage_costs` (ver [modelo de datos](modelo-de-datos.md#29-operación-y-costos)) + dashboards de los proveedores (Anthropic Console, proveedor de proxies).
