# PRD: Jeder AI (MVP, Etapas 1–2)

> **Estado:** borrador v0.1 · **Dueño del documento:** PO (dueño de Jedertech) · **Responsable técnico:** Sergio
> **Relacionados:** [Módulos M1–M14](modulos.md) · [Flujo guiado SIMPLE](flujo-guiado-simple.md) · [Métricas norte](metricas-norte.md) · [Etapas](../07-roadmap/etapas.md) · [Backlog](../08-scrum/backlog.md) · [Arquitectura](../04-arquitectura/arquitectura-general.md)

---

## 1. Objetivo

Construir un SaaS en español que **le diga a un infoproductor qué publicar esta semana y por qué**, a partir de tres fuentes:

1. **Su propio contenido** en Instagram/Facebook (API oficial de Meta).
2. **El contenido orgánico de su competencia** en Instagram (Business Discovery API).
3. **Los anuncios activos de su competencia** (scrapper de la Biblioteca de Anuncios, módulo aislado).

Con esos datos, la AI analiza los videos (hooks, ángulos, CTA, estructura), detecta patrones que funcionan y **escribe guiones listos para grabar**. Todo pasa por un **chat que guía paso a paso**: el usuario no tiene que saber de analytics.

**Objetivo de negocio del MVP:** que la agencia piloto (Jedertech) lo use todas las semanas con sus clientes reales (Etapa 1) y que al cierre de la Etapa 2 haya **5 agencias pagas (~USD 2,5–5k MRR)** ⚠️ A validar.

### 1.1 Problema

| Hoy (sin Jeder AI) | Con Jeder AI |
|---|---|
| El community manager revisa a mano 10 perfiles de competidores y la Biblioteca de Anuncios | Radar diario automático y un resumen de "qué cambió" |
| "¿Qué publico esta semana?" se decide por intuición | Plan semanal con 3 acciones y guiones basados en evidencia |
| Los guiones se escriben desde cero | Guionista AI con hooks y estructura de lo que ya funcionó |
| Reportes manuales en Canva o Sheets cada mes | Reporte semanal automático con la marca de la agencia |
| El conocimiento de la agencia vive en la cabeza de 2 personas | Perfil de Marca + historial que cualquiera del equipo puede usar |

### 1.2 Hipótesis a validar

| # | Hipótesis | Cómo se valida | Etapa |
|---|---|---|---|
| H1 | Las agencias pagan USD 497–1.997/mes por esto en marca blanca | 10 entrevistas + 3 cartas de intención | 0 |
| H2 | Un guion basado en evidencia de competidores rinde mejor que uno "a intuición" | Comparar alcance o retención de Reels con guion AI vs. sin guion, en la agencia piloto | 1 |
| H3 | El chat guiado reduce el tiempo de onboarding a < 15 min | Medir el tiempo del signup al primer guion | 1 |
| H4 | El cliente final de la agencia valora el reporte semanal | Tasa de apertura del email > 50% y feedback cualitativo | 1–2 |

---

## 2. Usuarios y personas

### Persona A: Dueño de agencia ("Martín")

| Campo | Detalle |
|---|---|
| Quién | Dueño de una agencia de marketing para infoproductores, de 3 a 25 personas, en LATAM |
| Qué quiere | Más margen por cliente, retener clientes más tiempo y diferenciarse con "tecnología propia" |
| Dolor | Su equipo pierde horas en investigación manual; los reportes no muestran valor; el churn de clientes es alto |
| Qué hace en Jeder AI | Configura marca blanca, crea cuentas cliente, mira el panel multi-cliente, revende |
| Métrica que le importa | Cuentas activas, horas ahorradas, retención de sus clientes, margen |
| Frecuencia | Semanal (panel + reportes) |

### Persona B: Community manager / estratega de agencia ("Lucía")

| Campo | Detalle |
|---|---|
| Quién | Maneja de 3 a 8 cuentas de infoproductores, no es técnica |
| Qué quiere | Saber qué publicar, tener guiones rápido, justificar decisiones frente al cliente |
| Dolor | Bloqueo creativo, poco tiempo, el cliente pide "lo que hace X competidor" |
| Qué hace en Jeder AI | Chatea con la AI, aprueba guiones, arma el calendario, envía reportes |
| Métrica que le importa | Guiones aprobados por semana, tiempo por cuenta |
| Frecuencia | Diaria |

### Persona C: Infoproductor ("Caro, coach de nutrición")

| Campo | Detalle |
|---|---|
| Quién | Experto que vende cursos, mentorías o programas por IG, WhatsApp y lanzamientos. Factura USD 3–50k/mes |
| Qué quiere | Crecer en orgánico, vender más sin depender solo de ads |
| Dolor | No sabe qué contenido funciona ni por qué; copia a otros sin estrategia |
| Cómo usa Jeder AI | **En Etapas 1–2**, como cliente de una agencia: recibe el reporte y aprueba guiones (rol `client_viewer`). **En Etapa 4**, como self-serve |
| Métrica que le importa | Seguidores, alcance, mensajes y ventas (M12) |
| Frecuencia | Semanal (lunes: reporte + 3 acciones) |

### Roles del sistema (RBAC)

| Rol | Alcance | Puede |
|---|---|---|
| `agency_owner` | Tenant | Todo: billing, branding, usuarios, todas las cuentas cliente |
| `agency_member` | Cuentas cliente asignadas | Operar módulos, aprobar guiones, enviar reportes |
| `client_viewer` | Una cuenta cliente | Ver reportes y guiones, comentar, aprobar o rechazar guiones, chatear (si la agencia lo habilita) |
| `platform_admin` | Global (Jedertech) | Soporte, feature flags, ver costos. Nunca ve tokens en claro |

---

## 3. Alcance

### 3.1 Dentro del MVP (M1–M11)

| ID | Módulo | Versión MVP | Sprint |
|---|---|---|---|
| M1 | Onboarding Guiado | Chat que arma el Perfil de Marca y lleva al primer guion | S4 |
| M2 | Conexión de Cuentas | OAuth con Facebook Login for Business (IG Business/Creator vinculado a una página) | S2 |
| M3 | Mi Contenido | Dashboard de posts/Reels + insights + ranking | S2 |
| M4 | Radar de Competencia | Hasta 10 competidores por cuenta, snapshot diario vía Business Discovery | S3 |
| M5 | Espía de Anuncios | Anuncios activos de anunciantes seguidos (scrapper en worker aislado) | S3 |
| M6 | Análisis de Video | Transcripción + análisis de hook, ángulo, CTA y estructura | S4 |
| M7 | Coach AI | Plan semanal con 3 acciones + chat | S5 |
| M8 | Guionista AI | Guiones de Reels/TikTok con variantes | S5 |
| M9 | Calendario | **Versión simple**: lista semanal con estados (idea → guion → grabado → publicado) | S5 |
| M10 | Reportes | Reporte semanal PDF + email con marca blanca | S5 |
| M11 | Panel de Agencia | Multi-cliente, branding, dominio custom, usuarios | S6 |

### 3.2 Fuera de alcance del MVP

| Qué | Por qué | Cuándo |
|---|---|---|
| M12 Tracking de Ventas | Requiere integraciones (Hotmart, Kiwify, Stripe, WhatsApp) | Etapa 3 |
| M13 Pack E-commerce | Otro ICP y otras métricas (catálogo, ROAS) | Etapa 4 |
| M14 Editor de Video AI | Alto costo y complejidad | Etapa 5 |
| Self-serve público final | Primero validamos con agencias | Etapa 4 |
| TikTok / YouTube como fuente de datos | Otras APIs y otro App Review. Los guiones **sí** sirven para TikTok | Post-MVP ⚠️ |
| Publicación automática en IG | Requiere `instagram_content_publish` y suma riesgo | Post-MVP |
| Gestión de pauta (crear o editar anuncios) | No es el foco: el foco es orgánico | No planificado |
| Métricas privadas de competidores (reach, saves, views) | Meta no las expone para terceros | Nunca (limitación de la API) |
| App mobile nativa | Web responsive alcanza | Post-MVP |
| Idiomas distintos del español | Mercado inicial LATAM hispano | Etapa 4+ (pt-BR ⚠️) |

---

## 4. Requisitos funcionales por módulo (MoSCoW)

> **Must** = sin esto no hay MVP · **Should** = importante, entra si hay tiempo en el sprint · **Could** = deseable · **Won't** = no en esta versión.
> Los IDs `RF-Mx-nn` se mapean a historias `JA-xxx` en el [Backlog](../08-scrum/backlog.md).

### M1 Onboarding Guiado

| ID | Requisito | Prioridad |
|---|---|---|
| RF-M1-01 | Al crear una cuenta cliente, el chat Guía inicia una conversación que pide: nicho, oferta principal (producto, precio, formato), avatar, tono y 3–10 competidores | Must |
| RF-M1-02 | El Guía guarda las respuestas como **Perfil de Marca** estructurado (editable después en un formulario) | Must |
| RF-M1-03 | El Guía sugiere competidores a partir del nicho (búsqueda por @handle validada con Business Discovery) | Should |
| RF-M1-04 | Cada pantalla muestra **una acción recomendada** (ver [flujo guiado](flujo-guiado-simple.md)) | Must |
| RF-M1-05 | Checklist de activación visible (conectar IG → perfil → competidores → primer análisis → primer guion) | Must |
| RF-M1-06 | El onboarding se puede retomar donde quedó | Must |
| RF-M1-07 | Importar el Perfil de Marca desde un brief pegado (texto libre o documento) | Could |

### M2 Conexión de Cuentas

| ID | Requisito | Prioridad |
|---|---|---|
| RF-M2-01 | OAuth con Facebook Login for Business; listar páginas e IG Business/Creator vinculados; elegir cuál conectar | Must |
| RF-M2-02 | Tokens cifrados en reposo (AES-256-GCM con clave en KMS/env) y nunca expuestos al frontend | Must |
| RF-M2-03 | Detección de token vencido o revocado + aviso al usuario + reconexión en 1 clic | Must |
| RF-M2-04 | Data deletion callback y desconexión que borra tokens y datos privados | Must |
| RF-M2-05 | La agencia puede mandar un **link de conexión** al cliente final (sin que el cliente tenga usuario) | Should |
| RF-M2-06 | Ruta alternativa con Instagram Login (cuentas sin página de FB) | Could |

### M3 Mi Contenido

| ID | Requisito | Prioridad |
|---|---|---|
| RF-M3-01 | Ingesta inicial de los últimos 90 días de media + insights; después, una ingesta diaria incremental | Must |
| RF-M3-02 | Dashboard: seguidores, alcance, interacciones, top 10 posts por métrica, comparación semana contra semana | Must |
| RF-M3-03 | Snapshots de métricas por post (día 1, 3, 7, 30) para ver la curva | Must |
| RF-M3-04 | Clasificación automática de cada post (formato, tema, tipo de hook) con Haiku | Should |
| RF-M3-05 | Filtro por formato (Reel, carrusel, imagen) y rango de fechas | Must |
| RF-M3-06 | Exportar CSV | Could |

### M4 Radar de Competencia

| ID | Requisito | Prioridad |
|---|---|---|
| RF-M4-01 | Agregar o quitar competidores por @handle (cuentas Business/Creator públicas) | Must |
| RF-M4-02 | Snapshot diario: seguidores, media_count, posts nuevos con like_count, comments_count, caption, permalink y timestamp | Must |
| RF-M4-03 | "Top posts de la competencia" por engagement relativo (interacciones / seguidores) | Must |
| RF-M4-04 | Resumen semanal AI: qué temas, formatos y hooks están funcionando | Must |
| RF-M4-05 | Alertas: el competidor publicó un post que supera 3× su promedio | Should |
| RF-M4-06 | Mensaje claro cuando la cuenta es personal o privada y no se puede leer | Must |
| RF-M4-07 | Límite de competidores por plan (10 por cuenta en el MVP) | Must |

### M5 Espía de Anuncios

| ID | Requisito | Prioridad |
|---|---|---|
| RF-M5-01 | Seguir anunciantes (por page_id o por URL de la Biblioteca) y por palabra clave + país | Must |
| RF-M5-02 | Refresh programado (diario o semanal, según el plan) en el worker aislado, con reintentos y circuit breaker | Must |
| RF-M5-03 | Ver anuncios activos: texto, CTA, destino clasificado (WhatsApp, Messenger, IG, web), fecha de inicio, plataformas | Must |
| RF-M5-04 | Capturar media del anuncio (imagen o video, título) y guardarla con TTL | Should |
| RF-M5-05 | "Anuncios ganadores": activos hace más de 30 días o con varias versiones ⚠️ (heurística de longevidad) | Must |
| RF-M5-06 | Historial: cuándo apareció y cuándo dejó de verse cada anuncio | Should |
| RF-M5-07 | Análisis AI de ángulos y ofertas de los anuncios de un anunciante | Should |
| RF-M5-08 | Si el scrapper falla, la UI muestra el último dato válido + fecha; nada se rompe | Must |

### M6 Análisis de Video

| ID | Requisito | Prioridad |
|---|---|---|
| RF-M6-01 | Analizar Reels propios, de competidores y videos de anuncios (si hay media_url disponible) | Must |
| RF-M6-02 | Transcripción en español con timestamps | Must |
| RF-M6-03 | Análisis estructurado: hook (0–3 s), promesa, ángulo, estructura por beats, CTA, emociones, formato visual | Must |
| RF-M6-04 | Puntaje de hook y explicación ("por qué funciona") | Should |
| RF-M6-05 | Subir un video manual (MP4) para analizarlo | Should |
| RF-M6-06 | Análisis de frames clave (visión) | Could |
| RF-M6-07 | El video se borra del storage a los 30 días ⚠️; transcript y análisis se conservan | Must |

### M7 Coach AI

| ID | Requisito | Prioridad |
|---|---|---|
| RF-M7-01 | Plan semanal automático (lunes): diagnóstico corto + **3 acciones** priorizadas con evidencia | Must |
| RF-M7-02 | Chat libre sobre los datos de la cuenta, con respuestas que citan la fuente (post, competidor, anuncio) | Must |
| RF-M7-03 | Cada acción se puede convertir en guion (M8) o en un ítem de calendario (M9) con 1 clic | Must |
| RF-M7-04 | Feedback 👍/👎 en cada recomendación | Must |
| RF-M7-05 | Seguimiento: "la semana pasada recomendé X; resultado: Y" | Should |

### M8 Guionista AI

| ID | Requisito | Prioridad |
|---|---|---|
| RF-M8-01 | Generar guion de Reel/TikTok con estructura **hook → desarrollo → CTA**, duración objetivo y texto en pantalla | Must |
| RF-M8-02 | 3 variantes de hook por guion | Must |
| RF-M8-03 | Cada guion cita las referencias que lo inspiran (posts, anuncios, videos analizados) | Must |
| RF-M8-04 | Respeta el Perfil de Marca (tono, palabras prohibidas, oferta) | Must |
| RF-M8-05 | Estados: borrador → aprobado → grabado → publicado; edición inline; "reescribir más corto, más polémico…" | Must |
| RF-M8-06 | Exportar a PDF o copiar como texto | Should |
| RF-M8-07 | Guiones de carrusel y de historias | Could |

### M9 Calendario (versión simple)

| ID | Requisito | Prioridad |
|---|---|---|
| RF-M9-01 | Vista semanal tipo lista o kanban con estados | Must |
| RF-M9-02 | Asignar guion a fecha y formato | Must |
| RF-M9-03 | Vincular manualmente el post publicado (o detectarlo automáticamente por caption o fecha) para medir resultado | Should |
| RF-M9-04 | Vista mensual drag & drop | Won't (MVP) |

### M10 Reportes

| ID | Requisito | Prioridad |
|---|---|---|
| RF-M10-01 | Reporte semanal por cuenta cliente: KPIs, top posts, competencia, 3 acciones, guiones de la semana | Must |
| RF-M10-02 | PDF + email con logo, colores y remitente de la agencia (marca blanca) | Must |
| RF-M10-03 | Programación (lunes 8:00 en la zona horaria de la cuenta) + envío manual | Must |
| RF-M10-04 | Link web del reporte (sin login, con token firmado y expiración) | Should |
| RF-M10-05 | Comentario editable de la agencia antes de enviar | Should |

### M11 Panel de Agencia

| ID | Requisito | Prioridad |
|---|---|---|
| RF-M11-01 | Lista de cuentas cliente con estado (conectada, tokens OK, último análisis, guiones de la semana) | Must |
| RF-M11-02 | Branding: logo, colores, nombre del producto, favicon | Must |
| RF-M11-03 | Dominio custom (`app.agencia.com`) con SSL automático | Must |
| RF-M11-04 | Invitar usuarios y asignarles cuentas | Must |
| RF-M11-05 | Billing con Stripe: plan, cuentas extra, facturas. MercadoPago opcional | Must |
| RF-M11-06 | Uso y límites del plan (cuentas, competidores, minutos de video) | Must |
| RF-M11-07 | Remitente de email con el dominio de la agencia (verificación DNS en Resend) | Should |
| RF-M11-08 | Plantillas de Perfil de Marca por nicho | Could |

---

## 5. Requisitos no funcionales

### 5.1 Seguridad

| ID | Requisito |
|---|---|
| RNF-SEC-01 | Tokens de Meta cifrados (AES-256-GCM, envelope encryption); descifrado solo en workers y route handlers server-side |
| RNF-SEC-02 | **Aislamiento del scrapper:** corre en otra infraestructura, sin acceso a la tabla de tokens ni a secrets de la App de Meta |
| RNF-SEC-03 | RLS en Postgres para toda tabla con `tenant_id`; tests automáticos de "tenant A no ve datos de B" |
| RNF-SEC-04 | Logs sin tokens, cookies ni PII (reutilizar el criterio de `redact()` de `src/security.ts`) |
| RNF-SEC-05 | 2FA opcional para `agency_owner`; sesiones con expiración |
| RNF-SEC-06 | Prompt injection: el contenido de terceros (captions, transcripts, anuncios) entra al LLM marcado como dato, nunca como instrucción |
| RNF-SEC-07 | Cumplir las políticas de datos de Meta Platform y el data deletion callback (ver [App Review](../03-meta-y-legal/meta-app-review-y-permisos.md) y [Privacidad](../03-meta-y-legal/privacidad-datos.md)) |

### 5.2 Multi-tenant y marca blanca

- Jerarquía **tenant (agencia) → cuenta cliente (workspace) → cuentas sociales**. Ver [ADR 0002](../04-arquitectura/adr/0002-multi-tenant-marca-blanca.md).
- Ningún texto visible dice "Jeder AI" en un tenant con marca blanca: emails, PDFs, títulos y favicon salen del branding del tenant.
- Límites por plan aplicados en backend (no solo en la UI).

### 5.3 Performance

| Métrica | Objetivo |
|---|---|
| TTFB de páginas del dashboard (p95) | < 800 ms |
| Primer token del chat (p95) | < 2,5 s |
| Ingesta inicial de una cuenta (90 días) | < 10 min |
| Análisis de un Reel de 60 s (descarga + transcripción + LLM) | < 2 min |
| Reporte semanal de 60 cuentas | Terminado antes de las 8:00 del lunes en la zona de cada cuenta |
| Disponibilidad web | 99,5% mensual (MVP) |

### 5.4 Costos

- Costo variable objetivo **≤ USD 10 por cuenta cliente al mes en planes de agencia** (LLM ~5, transcripción ~1,5, scraping/proxy ~1,5, storage/infra ~1, otros ~1), con **USD 25 como techo duro** (alerta + throttling). Ver [Costos de infra](../04-arquitectura/costos-de-infra.md).
- Margen bruto objetivo **> 80%**.
- Cada llamada a LLM o transcripción registra su costo en `usage_costs` (por tenant, cuenta, agente y módulo).
- Hard limits por plan; alerta interna si una cuenta supera USD 15 en el mes.

### 5.5 i18n y localización

- UI 100% en **español neutro** (tuteo), con textos en archivos de mensajes (`next-intl`) desde el día 1, para sumar pt-BR o en después.
- Fechas y números con locale `es-419`; zona horaria por cuenta cliente (AR, MX, CO, CL, PE, UY).
- Precios en USD; facturación con Stripe en USD (MercadoPago en moneda local, opcional).
- Prompts de AI en español; las salidas respetan el registro del Perfil de Marca (voseo AR, tuteo MX, etc.).

### 5.6 Observabilidad y operación

- Sentry (errores web y worker), PostHog (producto), métricas de colas (BullMQ) y un dashboard interno de costos.
- Cada job tiene estado, reintentos y motivo de fallo legible (igual que los estados `Status` del scrapper actual).

### 5.7 Accesibilidad y UX

- WCAG 2.1 AA en componentes base (shadcn/ui).
- Responsive: el cliente final abre el reporte y los guiones desde el celular.

---

## 6. Criterios de éxito

### Etapa 1 (MVP interno, fin de S5)

- [ ] La agencia piloto tiene **≥ 5 cuentas cliente reales** conectadas y activas.
- [ ] **≥ 3 guiones aprobados por cuenta por semana** durante 3 semanas seguidas (North Star, ver [métricas](metricas-norte.md)).
- [ ] Tiempo del signup al primer guion **< 15 min** (mediana).
- [ ] Reporte semanal enviado automáticamente 3 lunes seguidos sin intervención.
- [ ] Costo variable medido **≤ USD 10 (techo USD 25) por cuenta al mes**.
- [ ] App Review enviado (S5) con todos los screencasts.

### Etapa 2 (lanzamiento en marca blanca, fin de S7)

- [ ] **5 agencias pagas** (incluye Founders con −40%) ⚠️.
- [ ] 1 agencia externa con dominio custom funcionando.
- [ ] Advanced Access aprobado para los permisos de lectura de IG.
- [ ] NPS de agencias ≥ 30 ⚠️.
- [ ] 0 incidentes de fuga de datos entre tenants.

---

## 7. Dependencias y riesgos principales

| Riesgo | Impacto | Mitigación |
|---|---|---|
| App Review rechazado o demorado | No podemos leer datos de clientes externos | Arrancar en S0; mientras tanto, modo desarrollo con usuarios de prueba (la agencia piloto). Ver [App Review](../03-meta-y-legal/meta-app-review-y-permisos.md) |
| Meta bloquea el scrapper | M5 sin datos frescos | Worker aislado, proxies, proveedor de respaldo (Apify), y el valor central no depende de M5. Ver [Ads Library y scraping](../03-meta-y-legal/ads-library-y-scraping.md) |
| Costos de LLM por encima de lo previsto | Margen < 80% | Caching, Haiku, Batches API, límites por plan. Ver [costos](../04-arquitectura/costos-de-infra.md) |
| Calidad de guiones "genérica" | Churn | Evals, uso de evidencia obligatoria y feedback 👍/👎. Ver [evals](../05-agentes-ai/evals-y-calidad.md) |
| Business Discovery no devuelve media_url de algunos Reels | M6 incompleto para competidores | Fallback: análisis por caption + métricas; subida manual ⚠️ |

Preguntas abiertas: ver [Preguntas abiertas](../10-preguntas-abiertas.md).
