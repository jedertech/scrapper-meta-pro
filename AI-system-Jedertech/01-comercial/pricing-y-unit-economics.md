# Pricing y unit economics — Jeder AI

> Precios canónicos del brief (⚠️ a validar con entrevistas de Sprint 0). Este documento explica **por qué** esos precios, cuánto cuesta servir cada cuenta y cuándo el negocio es rentable.
> Todas las proyecciones son modelos simples con supuestos explícitos ⚠️. Actualizar con datos reales del piloto (Etapa 1).

---

## 1. Planes canónicos

### 1.1 Marca blanca (agencias) — Etapas 2+

| Plan | Precio USD/mes | Cuentas cliente incluidas | Setup (único) | Precio efectivo por cuenta (lleno) | Para quién |
|---|---|---|---|---|---|
| **Agency Starter** | 497 | hasta 5 | 500 | ~99 | Agencia chica o que prueba |
| **Agency Pro** | 997 | hasta 20 | 1.000 | ~50 | Agencia mediana (ICP central) |
| **Agency Scale** | 1.997 | hasta 60 | 1.000 | ~33 | Agencia grande |
| **Cuenta extra** | 39 / cuenta | — | — | 39 | Cualquier plan que exceda el límite |

- La agencia **revende** a sus clientes a **USD 150–300+/mes por cuenta** (o lo incluye en su fee).
- **Oferta Founders:** primeras 10 agencias, **−40% de por vida** a cambio de feedback + caso de éxito (Starter 298, Pro 598, Scale 1.198).

### 1.2 Público final (self-serve) — Etapa 4

| Plan | Precio USD/mes | Incluye | Anual |
|---|---|---|---|
| **Solo** | 297 | 1 cuenta, 10 competidores | 2 meses gratis (USD 2.970/año) |
| **Pro** | 497 | 3 cuentas + tracking (M12) | 2 meses gratis (USD 4.970/año) |

### 1.3 Qué incluye cada cuenta cliente (límites de uso sugeridos ⚠️)

| Recurso | Límite por cuenta/mes | Motivo |
|---|---|---|
| Competidores IG en Radar (M4) | 10 (snapshots diarios) | Rate limits de Business Discovery |
| Búsquedas/anunciantes en Espía (M5) | 10 anunciantes seguidos, refresco semanal | Costo proxy/scraping |
| Videos analizados (M6) | 40 | Costo de transcripción + LLM |
| Guiones (M8) | 60 | Costo LLM |
| Mensajes de chat (M1/M7) | Uso razonable (~300) | Costo LLM |
| Reporte semanal (M10) | 4–5 | — |

> Los límites protegen el margen. Si una cuenta los supera seguido → upsell o add-on, no cortar en seco.

---

## 2. Lógica de precio "caro"

El precio **no se ancla al costo** (≤ USD 25/cuenta) sino al **valor reemplazado**.

### 2.1 Comparación contra lo que cuesta hacerlo hoy

| Alternativa | Costo mensual estimado LATAM ⚠️ | Qué cubre |
|---|---|---|
| Community manager semi-senior | USD 600–1.200 | Contenido, algo de análisis, 3–6 cuentas |
| Analista de marketing / data | USD 900–1.800 | Análisis de competencia y reportes |
| Estratega/guionista freelance | USD 30–80 por guion | Guiones |
| Stack de herramientas (Foreplay + Metricool + ChatGPT Team + Notion) | USD 150–500 | Datos sueltos, sin integración |
| **Jeder AI Agency Pro** | **USD 997 (20 cuentas)** | Análisis + guiones + reportes para 20 cuentas |

### 2.2 Cálculo de ahorro para la agencia (argumento de venta)

Supuestos ⚠️: agencia con 15 clientes, 3 h/semana por cliente en análisis + reportes, costo hora interno USD 8–12.

| Concepto | Cálculo | USD/mes |
|---|---|---|
| Horas actuales | 15 × 3 h × 4,3 semanas | ~194 h |
| Costo actual (USD 10/h) | 194 × 10 | ~1.940 |
| Ahorro con Jeder AI (−60%) | 1.940 × 0,6 | **~1.160** |
| Costo Jeder AI Pro | | 997 |
| **Ingreso por reventa** (15 × USD 150) | | **+2.250** |
| **Beneficio neto para la agencia** | 1.160 + 2.250 − 997 | **~2.400/mes** |

> Mensaje: *"No te cuesta USD 997: te deja ~USD 2.400 por mes entre horas ahorradas y reventa."* ⚠️ validar horas reales en piloto.

### 2.3 Principios de pricing

1. **Precio por valor, no por costo.** Nunca vender como "barato".
2. **Planes por cantidad de cuentas** (métrica de valor que la agencia entiende).
3. **Setup fee** = compromiso + paga el onboarding asistido (branding, dominio, capacitación).
4. **Descuentos solo a cambio de algo** (Founders: caso de éxito; anual: caja).
5. **Precio en USD**; cobrar con Stripe y MercadoPago (moneda local) cuando haga falta.
6. **No bajar precio de lista**; si hay objeción, bajar alcance (Starter) o ofrecer Founders.

---

## 3. Costo variable por cuenta cliente

### 3.1 Desglose techo: ≤ USD 25/mes (objetivo operativo en agencias: ≤ USD 10, ver §4)

| Componente | Objetivo USD/mes | Supuesto de uso ⚠️ | Palancas para bajarlo |
|---|---|---|---|
| **LLM** (Claude) | ~8 | Sonnet por defecto; Haiku para clasificación; Opus puntual; prompt caching del Perfil de Marca | Haiku para tagging, caché, resúmenes incrementales |
| **Transcripción** | ~3 | ~40 videos × ~1 min | Transcribir solo videos nuevos/top; cachear por media_id compartido entre cuentas |
| **Scraping / proxy** | ~5 | ~0,5–1 GB residencial/mes ⚠️ (ver [../03-meta-y-legal/proxies.md](../03-meta-y-legal/proxies.md)) | Compartir scrapes entre cuentas del mismo nicho; bloquear imágenes/video en scraping |
| **Storage / infra** | ~4 | Videos con TTL en R2, Postgres, workers | TTL corto (7–30 días) para videos |
| **Otros** (emails, monitoreo, pagos ~3–5% Stripe…) | ~5 | | |
| **Total** | **≤ 25** | | |

> Ojo: la comisión de pagos (Stripe ~3–4% + conversión) depende del precio, no de la cuenta. Para un Agency Pro ≈ USD 35–40/mes de comisión ⚠️, que repartida en 20 cuentas son ~USD 2/cuenta (dentro de "otros").

### 3.2 Costos fijos

| Concepto | USD/mes Etapa 1–2 ⚠️ | USD/mes a 50 agencias ⚠️ |
|---|---|---|
| Infra base (Vercel, Supabase, Railway/Fly, Redis, Sentry, PostHog, Resend) | 150–300 | 800–1.500 |
| Herramientas (dominio, Google Workspace, CRM, Loom) | 50–100 | 200 |
| Legal/contable | 100–200 | 300–500 |
| **Total fijos sin personas** | **300–600** | **1.300–2.200** |
| Personas (Sergio + soporte) | No modelado acá — definir con el PO | |

---

## 4. Unit economics por plan

Supuesto: utilización promedio de cuentas = 70% del límite ⚠️.

| Plan | Precio | Cuentas usadas (70%) | Costo variable (× USD 25) | Margen bruto USD | Margen bruto % |
|---|---|---|---|---|---|
| Agency Starter | 497 | 3,5 | 88 | 409 | **82%** |
| Agency Pro | 997 | 14 | 350 | 647 | **65%** ⚠️ |
| Agency Scale | 1.997 | 42 | 1.050 | 947 | **47%** ⚠️ |
| Cuenta extra | 39 | 1 | 25 | 14 | 36% |
| Solo (self-serve) | 297 | 1 | 25 | 272 | **92%** |
| Pro (self-serve) | 497 | 3 (+ tracking ~5) | 80 | 417 | **84%** |

### ⚠️ Hallazgo importante

Con costo variable de USD 25/cuenta, **Pro y Scale no llegan al objetivo de margen > 80%** cuando están llenos. Opciones (decidir con el PO antes de Etapa 2):

| Opción | Efecto | Recomendación |
|---|---|---|
| A. Bajar costo variable real a **≤ USD 10/cuenta** en planes de agencia (caché compartida por nicho, menos videos/mes, Haiku) | Pro → 86%, Scale → 79% | **Sí — decisión canónica** (ver [costos de infra](../04-arquitectura/costos-de-infra.md)) |
| B. Límites de uso por cuenta más bajos en Scale (p.ej. 20 videos/mes) | Baja costo | Sí, combinado con A |
| C. Subir cuenta extra a USD 49 | Mejora margen marginal | Evaluar en entrevistas |
| D. Aceptar margen ~65–75% en planes grandes | Más simple | Aceptable si el volumen compensa |

> Objetivo realista: **margen bruto blended > 75%** en Etapa 2 y **> 80%** en Etapa 4 (mix con self-serve). ⚠️ A validar con costos reales medidos en el piloto (instrumentar costo por cuenta desde Sprint 1: tokens, minutos de audio, GB de proxy).

---

## 5. CAC, LTV y payback (supuestos)

| Supuesto ⚠️ | Agencias (Etapa 2–3) | Self-serve (Etapa 4) |
|---|---|---|
| ARPA (mix de planes, sin Founders) | USD 800/mes | USD 350/mes |
| Margen bruto | 70% | 85% |
| Churn mensual | 3% (vida ~33 meses) | 6% (vida ~17 meses) |
| CAC (outbound + demos + tiempo de founder) | USD 1.500 | USD 400 (ads + afiliados) |
| Setup fee cobrado | USD 500–1.000 (reduce CAC neto) | 0 |

| Métrica | Agencias | Self-serve |
|---|---|---|
| **LTV** = ARPA × margen / churn | 800 × 0,70 / 0,03 ≈ **USD 18.700** | 350 × 0,85 / 0,06 ≈ **USD 5.000** |
| **LTV:CAC** | ~12× (muy sano) | ~12× |
| **Payback** = CAC neto / (ARPA × margen) | (1.500 − 750) / 560 ≈ **1,3 meses** | 400 / 298 ≈ **1,3 meses** |

> Con números así de buenos, el riesgo no es el CAC sino **churn** y **capacidad de onboarding**. Si el churn real de agencias es 6%, LTV cae a la mitad (~USD 9.300) y sigue siendo sano.

---

## 6. Break-even

Fórmula: **clientes necesarios = costos fijos / (ARPA × margen bruto)**.

| Escenario de fijos ⚠️ | Fijos USD/mes | Contribución por agencia (800 × 0,70) | Agencias para break-even |
|---|---|---|---|
| Solo infra + herramientas (Etapa 1–2) | 600 | 560 | **2** |
| + 1 sueldo técnico (USD 2.500) | 3.100 | 560 | **6** |
| + 2 sueldos + soporte (USD 6.000) | 6.600 | 560 | **12** |

> Con las metas canónicas (fin Etapa 2 → 5 agencias; mes 6 → 15) el proyecto cubre infra desde la agencia #2 y un equipo chico desde ~12 agencias.

---

## 7. Escenarios 10 / 50 / 200 cuentas cliente

"Cuentas" = cuentas cliente activas (no agencias). Supuesto de mix ⚠️ y ARPA por cuenta efectivo (lo que pagamos nosotros por cuenta, no lo que cobra la agencia).

| Concepto | **10 cuentas** | **50 cuentas** | **200 cuentas** |
|---|---|---|---|
| Composición típica | 1 Pro piloto (Founders) + 1 Starter | 2 Starter + 2 Pro + 1 Scale (parcial) | 4 Starter + 6 Pro + 1 Scale (parcial) + 20 self-serve (≈ USD 300 c/u) |
| MRR estimado ⚠️ | ~USD 1.100 | ~USD 5.000 | ~USD 15.000 |
| Costo variable (USD 25/cuenta) | 250 | 1.250 | 5.000 |
| Costo variable (optimizado USD 12/cuenta) | 120 | 600 | 2.400 |
| Fijos sin personas | 400 | 800 | 1.500 |
| **Resultado (var. 25)** | **+450** | **+2.950** | **+8.500** |
| **Resultado (var. 12)** | **+580** | **+3.600** | **+11.100** |
| Margen bruto (var. 25 / 12) | 77% / 89% | 75% / 88% | 67% / 84% |

> Lectura: el negocio es rentable a nivel contribución desde el día 1. La optimización de costo variable vale ~USD 2.600/mes a 200 cuentas → justifica 1–2 sprints de optimización en Etapa 3.

---

## 8. Sensibilidad

Base: escenario 50 cuentas (MRR USD 5.000, var. USD 25/cuenta, fijos USD 800).

| Variable | Cambio | Resultado mensual | Δ vs base (+2.950) |
|---|---|---|---|
| Precio real | −30% (descuentos) | +1.450 | −1.500 |
| Costo LLM | ×2 (uso mayor al esperado) | +2.550 | −400 |
| Costo proxy | ×3 (bloqueos, más reintentos) | +2.450 | −500 |
| Utilización de cuentas | 100% en vez de 70% | ~+2.400 | −550 |
| Churn agencias | 3% → 8% | Igual este mes; LTV −60% | Crecimiento se frena |
| Todo Founders (−40%) | MRR 3.000 | +950 | −2.000 |

**Conclusiones:**
1. El precio y los descuentos pesan más que cualquier costo variable → **cuidar el precio de lista**.
2. El proxy es el costo más volátil → **instrumentar GB/cuenta** y tener plan B (Apify) presupuestado.
3. Limitar Founders a **10 agencias** como dice el brief (no extender).

---

## 9. Checklist de validación de pricing (Sprint 0 → Etapa 2)

- [ ] Entrevistas: preguntar gasto actual en herramientas + horas de analista (no "cuánto pagarías").
- [ ] Presentar los 3 planes en 10 entrevistas; registrar reacción (Van Westendorp simple opcional).
- [ ] Conseguir ≥ 3 agencias Founders con seña/setup pagado.
- [ ] Instrumentar costo por cuenta desde Sprint 1 (tokens, minutos de audio, GB proxy, storage).
- [ ] Revisar márgenes reales al final de Etapa 1 y ajustar límites por cuenta.
- [ ] Decidir opción de margen para Pro/Scale (sección 4) antes de abrir ventas en Etapa 2.
- [ ] Definir política de impuestos/facturación por país (IVA/retenciones) con contador ⚠️.

Relacionado: [go-to-market.md](go-to-market.md) · [modelo-marca-blanca.md](modelo-marca-blanca.md) · [../07-roadmap/etapas.md](../07-roadmap/etapas.md).
