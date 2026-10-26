# Glosario — Jeder AI

> Términos de negocio, marketing, Meta, producto y técnicos que aparecen en toda la documentación.
> Si un término nuevo aparece en otro doc y no está acá, agregarlo (orden alfabético dentro de cada sección).

---

## 1. Términos del producto (canónicos)

| Término | Definición | Ver |
|---|---|---|
| **Jeder AI** | Nombre de trabajo del SaaS. Cada agencia lo rebrandea en marca blanca. | [vision-y-propuesta-de-valor.md](vision-y-propuesta-de-valor.md) |
| **M1 Onboarding Guiado** | Chat paso a paso que lleva al usuario desde cero hasta su primer diagnóstico. | [../02-producto/modulos.md](../02-producto/modulos.md) |
| **M2 Conexión de Cuentas** | OAuth con Meta para leer IG/FB del cliente (Graph API oficial). | |
| **M3 Mi Contenido** | Analytics de la cuenta propia (posts, reels, insights). | |
| **M4 Radar de Competencia** | Seguimiento de perfiles IG competidores vía Business Discovery (snapshots diarios). | |
| **M5 Espía de Anuncios** | Anuncios de la competencia desde la Biblioteca de Anuncios (scrapper). | |
| **M6 Análisis de Video** | Descarga, transcripción y análisis de hooks/ángulos/CTA/estructura. | |
| **M7 Coach AI** | Recomendaciones y plan semanal + chat de consulta. | |
| **M8 Guionista AI** | Generación de guiones usando Perfil de Marca y referencias. | |
| **M9 Calendario de Contenido** | Planificación (versión simple en el MVP). | |
| **M10 Reportes** | Reporte semanal en PDF/email con marca de la agencia. | |
| **M11 Panel de Agencia** | Multi-cliente, branding, dominio propio. | [../01-comercial/modelo-marca-blanca.md](../01-comercial/modelo-marca-blanca.md) |
| **M12 Tracking de Ventas** | Atribución de ventas a contenido/anuncio (Etapa 3). | [../06-tracking/tracking-infoproductores.md](../06-tracking/tracking-infoproductores.md) |
| **M13 Pack E-commerce** | Adaptación para tiendas online (Etapa 4). | |
| **M14 Editor de Video AI** | Edición asistida por AI (Etapa 5). | |
| **MVP** | M1–M11 (M9 en versión simple). | [../07-roadmap/etapas.md](../07-roadmap/etapas.md) |
| **Perfil de Marca** | Memoria por cliente (nicho, avatar, oferta, tono, competidores) que leen todos los agentes. | |
| **Orquestador / Guía** | Agente que habla con el usuario y delega en los agentes especialistas. | |
| **Agentes especialistas** | Analista de Contenido, Radar de Competencia, Analista de Anuncios, Guionista, Coach de Crecimiento, Agente de Tracking. | |
| **Cuenta cliente** | Una marca/infoproductor analizado (una cuenta de IG principal + su Perfil de Marca). Unidad de cobro. | |
| **Snapshot** | Foto diaria de las métricas públicas de un perfil competidor; permite calcular crecimiento. | |
| **Anuncio ganador** | Anuncio de la competencia que lleva muchos días activo o tiene muchas variantes; proxy de rentabilidad (no tenemos su spend). | |
| **Etapa 0–5** | Fases canónicas del roadmap (Validación → MVP → Marca Blanca → Tracking → Self-serve → Editor). | [../07-roadmap/etapas.md](../07-roadmap/etapas.md) |
| **Oferta Founders** | Primeras 10 agencias con −40% de por vida a cambio de feedback + caso de éxito. | [../01-comercial/pricing-y-unit-economics.md](../01-comercial/pricing-y-unit-economics.md) |

---

## 2. Marketing de contenido y anuncios

| Término | Definición |
|---|---|
| **Ángulo** | La "puerta de entrada" o enfoque desde el cual se presenta una oferta (miedo, aspiración, prueba social, contraintuitivo, enemigo común, historia personal…). Dos anuncios del mismo producto pueden tener ángulos distintos. |
| **Avatar** | Descripción del cliente ideal del infoproductor (situación, dolores, deseos, objeciones). |
| **Carrusel** | Post de IG con varias imágenes/slides. Suele generar guardados. |
| **Creativo** | La pieza visual/audiovisual de un anuncio (imagen, video, carrusel). |
| **CTA (Call To Action)** | Llamado a la acción: "comentá X", "link en bio", "mandame DM", "reservá tu lugar". En anuncios de Meta también es el botón (Más información, Enviar mensaje…). |
| **Engagement rate** | (likes + comentarios [+ guardados + compartidos]) / seguidores o / alcance. Definir siempre cuál fórmula se usa. |
| **Estructura (de un video)** | Secuencia de bloques: hook → problema → agitación → solución → prueba → CTA, u otras variantes. |
| **Formato** | Tipo de pieza: reel, carrusel, historia, post estático, live, anuncio de video. |
| **Gancho / Hook** | Los primeros 1–3 segundos (o la primera línea) que frenan el scroll. Es la variable que más impacta en retención. |
| **Lanzamiento** | Estrategia típica de infoproductos: contenido de calentamiento + evento (clases/webinar) + apertura de carrito por tiempo limitado. |
| **Lead magnet** | Recurso gratuito a cambio de un dato (email/WhatsApp): guía, clase, plantilla. |
| **Low ticket / High ticket** | Productos baratos (USD 7–47) vs. caros (USD 500+), con embudos distintos. |
| **Nicho** | Segmento temático del infoproductor (finanzas personales, fitness, marketing, desarrollo personal…). |
| **Orgánico** | Contenido/alcance no pagado. |
| **Pilar de contenido** | Temas recurrentes que estructuran el calendario de una marca. |
| **Prueba social** | Testimonios, resultados de alumnos, números. |
| **Retención (de video)** | % de la audiencia que sigue mirando en cada segundo. Solo disponible para la cuenta propia (no de terceros). |
| **Guion** | Texto estructurado de un video (hook, desarrollo, CTA) con indicaciones de toma. Output de M8. |
| **Tráfico pago** | Alcance comprado vía Meta Ads u otras plataformas. |
| **VSL** | Video Sales Letter: video largo de venta. |

---

## 3. Meta (plataforma y APIs)

| Término | Definición |
|---|---|
| **Ad Library / Biblioteca de Anuncios** | Sitio público de Meta con anuncios activos. La **Ad Library API** oficial solo cubre anuncios políticos/temas sociales y anuncios entregados en la UE (DSA); por eso scrapeamos para LATAM comercial. Ver [../03-meta-y-legal/ads-library-y-scraping.md](../03-meta-y-legal/ads-library-y-scraping.md). |
| **Advanced Access** | Nivel de acceso de un permiso que permite usarlo con usuarios que no tienen rol en la app. Se obtiene vía App Review. |
| **App de Meta** | Registro en developers.facebook.com que identifica a nuestro SaaS ante Meta y pide permisos. |
| **App Review** | Revisión de Meta para conceder Advanced Access a permisos. Pide screencast por permiso, usuario de prueba, política de privacidad, TyC, data deletion. Ver [../03-meta-y-legal/meta-app-review-y-permisos.md](../03-meta-y-legal/meta-app-review-y-permisos.md). |
| **Blueprint** | Programa de certificaciones de Meta (p.ej. Media Buying Professional, Creative Strategy Professional). |
| **Business Discovery** | Endpoint de la Instagram Graph API que devuelve datos públicos de otras cuentas Business/Creator (followers, media_count, posts con like_count, comments_count, caption, permalink, timestamp, media_url). NO da reach/views/saves de terceros. Base de M4. |
| **Business Manager / Meta Business Suite / Portfolio comercial** | Contenedor empresarial de Meta que agrupa páginas, cuentas IG, cuentas publicitarias, píxeles y apps. |
| **Business Verification** | Verificación de identidad legal de la empresa ante Meta (documentos, dominio, teléfono). Requisito para Advanced Access y Tech Provider. |
| **CAPI (Conversions API)** | API servidor-a-servidor para enviar eventos (Purchase, Lead) a Meta. Complementa al Pixel, más robusta ante bloqueadores/iOS. Usada en M12. |
| **Data Deletion Callback** | URL que Meta llama cuando un usuario pide borrar sus datos de nuestra app. Requisito de App Review. |
| **DSA** | Digital Services Act (UE). Obliga a transparentar anuncios entregados en la UE; por eso la Ad Library API los incluye. |
| **Facebook Login for Business** | Flujo OAuth recomendado para apps B2B; da acceso a páginas + IG vinculado. Ruta necesaria para Business Discovery ⚠️. |
| **Graph API** | API oficial de Meta (Facebook/Instagram). |
| **Instagram Login (Instagram API with Instagram Login)** | Ruta alternativa: el usuario se loguea con IG directo, sin página de FB. Permisos `instagram_business_*`. |
| **Insights** | Métricas privadas de la cuenta propia (alcance, impresiones/views, guardados, compartidos, retención). Solo con permiso del dueño. |
| **Meta Business Partner** | Programa/badge para agencias y empresas tech. No es requisito para lanzar. Ver [../03-meta-y-legal/meta-business-partner.md](../03-meta-y-legal/meta-business-partner.md). |
| **Page (Página de FB)** | Necesaria para vincular IG en la ruta Facebook Login. |
| **Pixel (Meta Pixel)** | Script en la web que envía eventos del navegador a Meta. |
| **Rate limit** | Límite de llamadas a la API en una ventana de tiempo (por app, por usuario, por cuenta IG). |
| **Standard Access** | Acceso por defecto: solo funciona con usuarios con rol en la app (admins, devs, testers). |
| **Tech Provider** | Rol de una app/empresa que ofrece tecnología a otros negocios usando sus activos de Meta (sus cuentas IG/FB). Es nuestra figura. |
| **Token (access token)** | Credencial OAuth. Short-lived (~1–2 h) y long-lived (~60 días ⚠️), con renovación. |
| **Usuario de prueba (test user)** | Cuenta que Meta usa para probar la app en App Review. |

---

## 4. Negocio y métricas SaaS

| Término | Definición | Fórmula / nota |
|---|---|---|
| **ARPA** | Ingreso promedio por cuenta (agencia). | MRR / nº de agencias |
| **ARR** | Ingreso recurrente anual. | MRR × 12 |
| **Break-even** | Punto donde ingresos cubren costos fijos + variables. | Ver [../01-comercial/pricing-y-unit-economics.md](../01-comercial/pricing-y-unit-economics.md) |
| **CAC** | Costo de adquisición de cliente. | (gasto en ventas + marketing) / clientes nuevos |
| **Churn** | % de clientes (o MRR) que se pierden en un período. | clientes perdidos / clientes al inicio |
| **Cohorte** | Grupo de clientes que entró en el mismo período. | |
| **Expansion revenue** | Ingreso extra de clientes existentes (upgrade de plan, cuentas extra USD 39). | |
| **ICP** | Ideal Customer Profile: perfil del cliente ideal. | |
| **JTBD (Jobs To Be Done)** | El "trabajo" que el cliente contrata al producto para hacer. | |
| **LTV** | Valor de vida del cliente. | ARPA × margen bruto / churn mensual |
| **LTV:CAC** | Ratio de salud. | Objetivo ≥ 3 |
| **Margen bruto** | (Ingreso − costo variable) / ingreso. | Objetivo > 80% |
| **MRR** | Ingreso recurrente mensual. | |
| **NRR** | Net Revenue Retention: MRR de una cohorte hoy / MRR inicial (incluye expansión y churn). | > 100% = crece sin clientes nuevos |
| **Payback** | Meses para recuperar el CAC. | CAC / (ARPA × margen) |
| **PMF** | Product-Market Fit. | |
| **SAM / SOM / TAM** | Mercado total, alcanzable y obtenible. | Ver [../01-comercial/analisis-de-mercado.md](../01-comercial/analisis-de-mercado.md) |
| **Setup fee** | Cobro único de alta (USD 500/1.000 según plan). | |
| **Self-serve** | El cliente se registra y paga solo, sin venta asistida (Etapa 4). | |

---

## 5. Marca blanca y multi-tenant

| Término | Definición |
|---|---|
| **Marca blanca (white label)** | El producto se presenta con la marca de la agencia (logo, colores, dominio, emails), sin mostrar Jeder AI. |
| **Tenant** | Inquilino de la plataforma: una agencia (o un cliente self-serve). Aísla datos con RLS. |
| **Workspace** | Espacio de trabajo dentro de un tenant (p.ej. un equipo o una marca). Jerarquía: tenant → workspace → cuenta cliente. |
| **Subcuenta** | Acceso del cliente final de la agencia a su propia cuenta cliente. |
| **Dominio custom** | Subdominio de la agencia (p.ej. `app.agencia.com`) apuntando a nuestra plataforma vía CNAME. |
| **RLS (Row Level Security)** | Política de Postgres que filtra filas por tenant. Clave para que una agencia jamás vea datos de otra. |
| **DPA** | Data Processing Agreement: contrato de encargo de tratamiento de datos entre agencia (responsable) y Jedertech (encargado). |
| **SLA** | Acuerdo de nivel de servicio (uptime, tiempos de respuesta de soporte). |

---

## 6. Tracking y atribución (M12)

| Término | Definición |
|---|---|
| **Atribución** | Asignar una venta a la fuente (anuncio, post, historia) que la generó. |
| **Modelo de atribución** | Regla: last click, first click, lineal, etc. MVP de M12 = last click con UTM. |
| **CPA** | Costo por adquisición (gasto / ventas). |
| **ROAS** | Retorno sobre inversión publicitaria (ingresos / gasto en ads). |
| **UTM** | Parámetros en la URL (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) que identifican el origen de un click. |
| **Webhook** | Notificación HTTP que una plataforma (Hotmart, Kiwify, Eduzz, Stripe, MercadoPago) envía a nuestra URL cuando ocurre una venta, reembolso, etc. |
| **Postback** | Sinónimo de webhook en el mundo de afiliados/infoproductos. |
| **SCK / src** | Parámetros propios de Hotmart/Kiwify para tracking de origen ⚠️ verificar nombres exactos por plataforma. |
| **fbclid / fbc / fbp** | Identificadores de click y navegador de Meta, usados para mejorar el matching en CAPI. |
| **Event match quality** | Puntaje de Meta sobre la calidad de los datos enviados por CAPI. |
| **Deduplicación** | Evitar contar dos veces el mismo evento enviado por Pixel y CAPI (`event_id`). |

---

## 7. Scraping, infraestructura y técnicos

| Término | Definición |
|---|---|
| **Actor (Apify)** | Script de scraping empaquetado y ejecutable en la nube de Apify. Plan B para M5. |
| **BullMQ / Redis** | Cola de trabajos (jobs) para ingesta, scraping, transcripción, análisis. |
| **Circuit breaker** | Mecanismo que corta el scraping tras errores repetidos (ya existe en el scrapper). |
| **Drizzle** | ORM TypeScript sobre Postgres. |
| **Fingerprint** | Huella del navegador (UA, WebGL, fuentes…) que los sitios usan para detectar bots. |
| **GraphQL (Meta)** | Endpoint interno `/api/graphql/` que la Biblioteca usa; el scrapper escucha esas respuestas. |
| **Headless browser** | Navegador sin interfaz (Playwright/Chromium). |
| **LLM** | Modelo de lenguaje (Claude Sonnet/Haiku/Opus). |
| **Monorepo** | Un solo repo con varias apps/paquetes (`jedertech-ai-platform`, pnpm + Turborepo). |
| **Prompt caching** | Reutilizar contexto fijo (Perfil de Marca, instrucciones) entre llamadas al LLM para bajar costo/latencia. |
| **Proxy residencial / datacenter / móvil** | Tipos de IP intermedia para scraping. Ver [../03-meta-y-legal/proxies.md](../03-meta-y-legal/proxies.md). |
| **Rotación de IP** | Cambiar la IP saliente por sesión o por request. |
| **Sticky session** | Mantener la misma IP durante X minutos. |
| **Stealth** | Técnicas para que un headless browser parezca humano (`src/browser-compat.ts`). |
| **TTL** | Tiempo de vida de un archivo/dato antes de borrarse automáticamente (videos en R2/Supabase Storage). |
| **Transcripción (STT)** | Speech-to-text: Whisper API / Deepgram / AssemblyAI. |
| **Worker** | Proceso (apps/worker) que ejecuta jobs en segundo plano (Railway/Fly.io). |
