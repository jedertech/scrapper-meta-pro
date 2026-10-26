# M12 Tracking de Ventas — tracking para infoproductores

> **Etapa 3 (meses 5–6).** No entra en el MVP (M1–M11). Este documento define qué es, cómo se construye y qué se deja afuera.
> Agente canónico: **Agente de Tracking (M12)**. Plan self-serve que lo incluye: **Pro USD 497/mes** (Etapa 4). En marca blanca, add-on o incluido en Pro/Scale ⚠️ decisión del PO.
> Detalles de plataformas (nombres de eventos/campos) marcados ⚠️ deben verificarse en la documentación de cada una al implementar.

---

## 1. Qué significa "comoditizar el tracking de la agencia"

Hoy, una agencia de infoproductores hace a mano (o con planillas + UTMify/Hyros) algo así:

| Lo que hace la agencia hoy | Cómo lo hace | Problema |
|---|---|---|
| Arma convenciones de UTMs por campaña/anuncio | Planilla + disciplina del trafficker | Errores, inconsistencias |
| Cruza ventas de Hotmart/Kiwify con campañas | Exporta CSV + Ads Manager + planilla | Horas por semana; llega tarde |
| Calcula ROAS/CPA real por anuncio | Fórmulas en Sheets | Frágil, no por contenido orgánico |
| Configura Pixel + CAPI | Técnico especializado (GTM server, Stape…) | Caro, cada cliente distinto |
| Reporta "qué vendió" al cliente | PDF manual | No conecta con el análisis creativo |

**"Comoditizar" = que todo eso sea un módulo que se activa en 15 minutos guiado por la AI**, y que además **cierre el loop con el contenido**: no solo "el anuncio 123 tuvo ROAS 3,2", sino "los anuncios con **ángulo de historia personal** y **hook de pregunta** venden 2× más que los de autoridad" (cruza M12 con M6/M8).

> Diferencial vs. UTMify/Hyros: ellos responden *qué vendió*; Jeder AI responde *qué vendió y por qué, y qué grabar la semana que viene*.

---

## 2. Alcance funcional

| Capacidad | MVP M12 (Etapa 3) | Después |
|---|---|---|
| Convención de UTMs automática para Meta Ads (parámetros dinámicos) | ✅ | |
| Links rastreables para orgánico (bio, stories, DMs) | ✅ (link por contenido) | Página link-in-bio propia |
| Webhooks: **Hotmart, Kiwify, Stripe** | ✅ | **Eduzz, MercadoPago**, Monetizze, Braip |
| Sync de gasto de Meta Ads (`ads_read`) | ✅ diario | Horario |
| Dashboard ROAS / CPA / ventas por campaña, conjunto, anuncio | ✅ | |
| Ventas por contenido orgánico (post/reel/story) | ✅ (vía link por contenido) | |
| Reembolsos y chargebacks descontados | ✅ | |
| Modelo de atribución | Last click (UTM) | First click, lineal, ventanas configurables |
| Script de captura en landing (UTMs + fbclid → checkout) | ✅ | |
| Envío a Meta **Conversions API** (Purchase) | ❌ | ✅ Fase 2 |
| Cruce ventas × atributos creativos (hook/ángulo de M6) | Básico (tabla) | Insights del Agente de Tracking + Coach |
| Multi-touch / journeys | ❌ | Evaluar |
| Google/TikTok Ads | ❌ | Evaluar |

---

## 3. Cómo funciona la atribución

### 3.1 Convención de UTMs (Meta Ads)

En cada anuncio, en "Parámetros de URL", usar los **parámetros dinámicos** de Meta ⚠️ verificar sintaxis vigente:

```
utm_source=meta&utm_medium=paid&utm_campaign={{campaign.id}}&utm_content={{ad.id}}&utm_term={{adset.id}}&jid={{placement}}
```

| Parámetro | Valor | Para qué |
|---|---|---|
| `utm_source` | `meta` / `ig_organic` | Canal |
| `utm_medium` | `paid` / `bio` / `story` / `dm` / `reel` | Tipo |
| `utm_campaign` | `{{campaign.id}}` | Une con gasto |
| `utm_content` | `{{ad.id}}` o `post_<media_id>` | **Clave de atribución** |
| `utm_term` | `{{adset.id}}` | Conjunto |

Para **orgánico**: Jeder AI genera un link corto por contenido (`go.<dominio-agencia>/r/abc123` → landing con `utm_medium=reel&utm_content=post_<media_id>`). M9 (calendario) lo adjunta a cada pieza planificada.

### 3.2 Del click a la venta

```
Anuncio/post ─(URL con UTMs)─► Landing / página de captura
                                   │  script Jeder (≈2 KB): lee UTMs, fbclid, _fbp/_fbc,
                                   │  guarda en cookie 1st-party y
                                   │  reescribe links de checkout agregando parámetros de tracking
                                   ▼
                             Checkout (Hotmart / Kiwify / Stripe / MP)
                                   │  la plataforma conserva los parámetros (src/sck/utm/metadata ⚠️)
                                   ▼
                             Webhook de venta ─► Jeder AI ─► venta atribuida a ad.id / post
```

### 3.3 Cómo pasa el tracking cada plataforma ⚠️

| Plataforma | Cómo viaja el origen al checkout | Cómo llega en el webhook | Eventos a escuchar | Seguridad |
|---|---|---|---|---|
| **Hotmart** | Parámetros `src` y `sck` en el link de checkout (+ UTMs en algunos casos ⚠️) | Campos de origen de la compra (p.ej. `purchase.origin.src/sck`) ⚠️ | Compra aprobada/completa, reembolso, chargeback, cancelación, suscripción | Token "hottok" en header ⚠️ |
| **Kiwify** | UTMs y `src`/`sck` en la URL del checkout | Objeto de parámetros de tracking en el payload ⚠️ | Compra aprobada, reembolso, chargeback, suscripción cancelada/renovada | Token/firma configurado en el webhook ⚠️ |
| **Eduzz** | Parámetros de tracking/UTM en el checkout ⚠️ | Campos de tracker/UTM en el postback ⚠️ | Venta aprobada, reembolso, cancelación | Token del postback ⚠️ |
| **Stripe** | `client_reference_id` o `metadata` en Checkout Session / Payment Link (el script los inyecta) | `checkout.session.completed`, `charge.refunded`, `invoice.paid` | Ídem | Firma `Stripe-Signature` (signing secret) |
| **MercadoPago** | `external_reference` y/o `metadata` en la preferencia | Notificación webhook de `payment` → consultar el pago por API | Pago aprobado, reembolsado, contracargo | Header `x-signature` ⚠️ |

> Si el cliente usa **ManyChat/DM** para vender high ticket: generar link único por conversación o usar el `utm_content` del anuncio "click to WhatsApp/DM" ⚠️ (atribución más débil; marcar como "estimada").

---

## 4. Arquitectura de ingesta

```
apps/web (Next.js)
 ├─ POST /api/webhooks/{platform}/{tenantSlug}/{connectionId}
 │     1. Verificar firma/token (secret por conexión, cifrado en DB)
 │     2. Guardar payload crudo en raw_webhook_events (idempotencia por event_id de la plataforma)
 │     3. Responder 200 rápido (< 1 s)
 │     4. Encolar job "normalize-sale"
 └─ GET /t.js  (script de captura, servido por CDN, versionado)

apps/worker (BullMQ)
 ├─ normalize-sale       → tabla sales (normalizada) + sale_events (reembolsos, chargebacks)
 ├─ attribute-sale       → resuelve utm_content → ad_id | post_id ; guarda touchpoint
 ├─ sync-meta-spend      → diario: insights de ads (spend, impresiones, clicks) por ad_id vía ads_read
 ├─ compute-metrics      → materializa ROAS/CPA por día × campaña × adset × ad × contenido
 └─ (Fase 2) send-capi   → evento Purchase al dataset del cliente con event_id para deduplicar
```

### Modelo de datos (mínimo)

| Tabla | Campos clave |
|---|---|
| `tracking_connections` | id, tenant_id, account_id, platform, secret_enc, status, last_event_at |
| `raw_webhook_events` | id, connection_id, platform_event_id (único), payload_json, received_at, processed_at |
| `sales` | id, account_id, platform, platform_order_id, product_id, amount_gross, amount_net, currency, status, buyer_email_hash, buyer_phone_hash, utm_*, src, sck, fbclid, purchased_at |
| `sale_events` | sale_id, type (approved/refunded/chargeback/canceled), amount, at |
| `attributions` | sale_id, model ('last_click'), ad_id \| post_id \| null, confidence |
| `ad_spend_daily` | account_id, date, campaign_id, adset_id, ad_id, spend, impressions, clicks, currency |
| `metrics_daily` (materializada) | account_id, date, level, entity_id, spend, sales, revenue_net, roas, cpa |

**Reglas:**
- [ ] Idempotencia: `platform_event_id` único; reprocesar es seguro.
- [ ] Moneda: guardar original + convertir a USD con tipo de cambio diario (fuente ⚠️ definir) para ROAS consistente.
- [ ] Ingreso **neto** (descontando comisión de plataforma y reembolsos) para ROAS real; mostrar bruto y neto.
- [ ] Datos personales de compradores **hasheados** por defecto (ver [../03-meta-y-legal/privacidad-datos.md](../03-meta-y-legal/privacidad-datos.md)).

---

## 5. Dashboard (lo que ve el usuario)

| Vista | Métricas | Lectura AI (Agente de Tracking) |
|---|---|---|
| Resumen | Ventas, ingreso neto, gasto, ROAS, CPA, % atribuido | "Esta semana el 62% de las ventas vino de 3 anuncios; 1 contenido orgánico vendió 14 unidades." |
| Por anuncio | Gasto, ventas, ROAS, CPA, días activo, miniatura, hook/ángulo (M6) | "Los anuncios con hook de pregunta tienen CPA 35% menor." |
| Por contenido orgánico | Clicks del link, ventas, ingreso | "El reel del martes vendió más que 4 anuncios: convertilo en anuncio." |
| Por producto | Ventas, ticket promedio, reembolsos | — |
| Salud del tracking | % ventas sin atribución, webhooks fallidos, links sin UTM | "Hay 12 anuncios sin parámetros de URL: arreglalos así." |

Integración con otros módulos:
- **M7 Coach**: usa ROAS/CPA por atributo creativo en el plan semanal.
- **M8 Guionista**: prioriza ángulos/hooks que **venden**, no solo que generan likes.
- **M10 Reportes**: sección "Ventas atribuidas" en el reporte semanal con marca de la agencia.

---

## 6. Costos estimados ⚠️

| Componente | Costo por cuenta/mes | Nota |
|---|---|---|
| Ingesta de webhooks (Vercel functions + Postgres) | ~USD 0,5–1 | Volumen bajo (cientos/miles de ventas) |
| Sync de gasto Meta (Marketing API) | ~USD 0 | API gratuita; consume rate limit |
| Script de captura (CDN) | ~USD 0–0,5 | Cacheable |
| Storage (raw events, métricas) | ~USD 0,5 | |
| LLM para lecturas del Agente de Tracking | ~USD 1–2 | Resúmenes semanales con Haiku/Sonnet |
| **Total adicional** | **~USD 2–4** | Dentro del objetivo ≤ USD 10 (techo USD 25)/cuenta |

Esfuerzo de desarrollo estimado ⚠️: **2 sprints** (meses 5–6) para el MVP con Hotmart + Kiwify + Stripe + dashboard; +1 sprint para CAPI y Eduzz/MercadoPago.

---

## 7. Competencia directa

| Competidor | Fuerte en | Débil en | Cómo nos posicionamos |
|---|---|---|---|
| **UTMify** | Tracking infoproductos, integraciones BR (Hotmart, Kiwify…), precio | No analiza contenido ni competencia; foco Brasil | "Tracking + qué grabar después", en español, dentro de la herramienta que ya usás |
| **Hyros** | Atribución avanzada, llamadas, multi-touch | Caro, complejo, inglés | Simple, guiado por AI, precio incluido |
| Stape / GTM server-side | CAPI robusto | Técnico, sin dashboard de negocio | No competimos en infraestructura de tags; podemos convivir |
| Triple Whale / Northbeam | E-commerce (Shopify) | No infoproductos | Relevante para M13 (Etapa 4) |
| Planilla + Ads Manager | Gratis | Manual | Ahorro de horas |

> Si el cliente ya usa UTMify: ofrecer convivencia (nuestro script no rompe el suyo) y evaluar leer su API si existe ⚠️.

---

## 8. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Plataformas no propagan parámetros de tracking como esperamos | Alto (ventas sin atribuir) | Probar cada plataforma con compras de prueba en sandbox antes de prometer; mostrar "% atribuido" honesto |
| Cambios en webhooks/APIs de plataformas | Medio | Guardar payload crudo; normalizadores versionados; tests con fixtures reales |
| Bloqueadores, iOS, navegador in-app de IG que pierde cookies | Medio | Pasar parámetros por URL (no solo cookie); CAPI en Fase 2 |
| Datos personales de compradores | **Alto** (legal) | Hash por defecto, DPA, retención, acceso restringido |
| App Review adicional para `ads_read` | Medio (tiempo) | Iniciar en mes 4; mientras tanto, importar gasto por CSV |
| Diferencias de moneda/impuestos | Medio | Neto vs. bruto explícito; tipo de cambio documentado |
| Expectativa de "atribución perfecta" | Medio | Comunicar modelo (last click) y margen de error en la UI |
| Webhooks duplicados o fuera de orden | Bajo | Idempotencia + máquina de estados por venta |

---

## 9. MVP de M12 — definición de "hecho"

### Historias (para [../08-scrum/backlog.md](../08-scrum/backlog.md))

| ID sugerido | Historia | Criterio de aceptación |
|---|---|---|
| M12-01 | Como agencia, quiero conectar Hotmart de un cliente pegando una URL de webhook generada por Jeder AI | Venta de prueba aparece en < 1 min en `sales` |
| M12-02 | Ídem Kiwify | Ídem |
| M12-03 | Ídem Stripe (firma verificada) | Eventos con firma inválida se rechazan (401) |
| M12-04 | Como trafficker, quiero copiar la cadena de parámetros de URL recomendada para mis anuncios | Botón "copiar" + verificación: detecta anuncios sin UTMs vía API |
| M12-05 | Como infoproductor, quiero un link rastreable por cada contenido del calendario | Link corto que redirige con UTMs y cuenta clicks |
| M12-06 | Como agencia, quiero ver ROAS/CPA por anuncio con gasto real | Gasto sincronizado diario coincide ±2% con Ads Manager ⚠️ |
| M12-07 | Reembolsos y chargebacks se descuentan del ingreso | Venta reembolsada pasa a estado `refunded` y se resta en métricas |
| M12-08 | El reporte semanal (M10) incluye sección de ventas atribuidas | Sección visible con marca de la agencia |
| M12-09 | El Agente de Tracking explica en el chat qué contenido/anuncio vendió y qué hacer | Respuesta cita anuncios/contenidos reales con números |
| M12-10 | Panel de salud del tracking | Muestra % ventas sin atribución y webhooks fallidos |

### Checklist pre-lanzamiento Etapa 3

- [ ] Compras de prueba reales (sandbox) en Hotmart, Kiwify y Stripe con parámetros → atribución correcta.
- [ ] App Review de `ads_read` aprobado (o import CSV como fallback).
- [ ] DPA actualizado incluyendo datos de compradores.
- [ ] 2 clientes de la agencia piloto con tracking activo ≥ 2 semanas.
- [ ] Comparación con el método actual de la agencia (planilla/UTMify): diferencia < 10% ⚠️.
- [ ] Documentación de setup para agencias (guiada por chat en M1).

Relacionado: [../02-producto/modulos.md](../02-producto/modulos.md) · [../07-roadmap/etapas.md](../07-roadmap/etapas.md) · [../01-comercial/competencia.md](../01-comercial/competencia.md) · [../03-meta-y-legal/meta-app-review-y-permisos.md](../03-meta-y-legal/meta-app-review-y-permisos.md).
