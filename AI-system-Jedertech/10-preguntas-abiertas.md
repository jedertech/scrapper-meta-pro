# Preguntas abiertas, decisiones pendientes y supuestos a validar

> Lista viva. Cada decisión tiene **dueño sugerido** y **fecha límite relativa** al calendario de sprints ([07-roadmap/etapas.md](07-roadmap/etapas.md)). Cuando se decide, se mueve a la sección "Decididas" con fecha y razón (y, si es técnica, un ADR en el repo nuevo).
> Roles: **PO** = dueño de Jedertech · **TL** = Sergio (Tech Lead) · **Legal** = asesor legal externo · **Contable** = contador/a.

## 1. Decisiones pendientes

### Negocio y comercial
| # | Pregunta | Opciones / contexto | Dueño | Fecha límite | Bloquea |
|---|---|---|---|---|---|
| D-01 | **Nombre comercial** del producto (hoy "Jeder AI" es nombre de trabajo) | Mantener "Jeder AI" · nombre nuevo neutro (mejor para marca blanca) · chequear dominio y marca registrable en AR/MX | PO | Mitad de S0 (antes de comprar dominio de la landing) | JA-002 |
| D-02 | **Precios** de agencia (Starter 497 / Pro 997 / Scale 1.997 + setup) ⚠️ | Validar con las 10 entrevistas; alternativa: setup fee más bajo y precio por cuenta | PO | Fin de S0 (JA-004) | JA-062 |
| D-03 | ¿Cuántos competidores y análisis de video incluye cada plan? | Define cuotas y costo variable | PO + TL | Planning S5 | JA-047, JA-063 |
| D-04 | **¿Quién vende?** | PO hace ventas · comercial part-time a comisión · la propia red de la agencia · partners | PO | Fin de S0 | Etapa 2 (5 agencias pagas) |
| D-05 | Condiciones exactas de la oferta **Founders** (−40% de por vida) | ¿Compromiso mínimo de meses? ¿caso de éxito obligatorio? ¿aplica al setup fee? | PO | Planning S6 | JA-064 |
| D-06 | Precio sugerido de reventa para las agencias (USD 150–300+/cuenta) y si se publica | Afecta mensaje de venta y canibalización en Etapa 4 | PO | S6 | JA-075 |
| D-07 | ¿El piloto de la agencia de Jedertech paga algo? | Gratis hasta Etapa 2 · precio interno | PO | Fin de S0 | — |
| D-08 | Política de canibalización agencias vs. público final (Etapa 4) | Precio público ≥ reventa sugerida · leads derivados a agencias | PO | Antes de Etapa 4 | JA-127 |

### Técnicas
| # | Pregunta | Opciones / contexto | Dueño | Fecha límite | Bloquea |
|---|---|---|---|---|---|
| D-09 | **Repo nuevo vs. monorepo dentro de `scrapper-meta-pro`** | Recomendado: repo nuevo `jedertech-ai-platform` y migrar el scraper como `packages/meta-ads-scraper` (historia limpia, CI propia). Alternativa: convertir este repo en monorepo (conserva historia del scraper) | TL (aprueba PO) | Mitad de S0 | JA-008 |
| D-10 | **Proveedor de transcripción** | Whisper API · Deepgram · AssemblyAI; decidir por costo/calidad en español con benchmark de 10 videos ⚠️ objetivo ~USD 3/cuenta/mes | TL | Mitad de S4 (JA-040) | JA-040 |
| D-11 | Storage de videos | Cloudflare R2 (egress barato) · Supabase Storage (más simple); TTL de 30 días ⚠️ | TL | Inicio de S4 | JA-039 |
| D-12 | Hosting del worker | Railway (simple) · Fly.io (más control/regiones); imagen con Playwright | TL | Inicio de S1 | JA-017 |
| D-13 | Cómo se aplica RLS con Drizzle | Cliente Supabase con JWT del usuario · `set_config('request.jwt.claims')` por transacción · rol por tenant | TL | Día 2 de S1 (ADR) | JA-013 |
| D-14 | Cifrado de tokens de Meta | AES-256-GCM con clave en env · Supabase Vault · KMS externo | TL | Inicio de S2 | JA-023 |
| D-15 | Ruta de login de Meta | Facebook Login for Business (necesaria para Business Discovery ⚠️ verificar) vs. Instagram Login | TL | Inicio de S2 | JA-022, JA-030 |
| D-16 | Catálogo de anuncios global vs. por tenant | Global (dedupe, menor costo) + vínculo por tenant con RLS · todo por tenant (más simple, más duplicación) | TL | Planning S3 | JA-036 |
| D-17 | ¿Caché de análisis de video cross-tenant para contenido público? | Ahorra costo; implica que dos agencias comparten un análisis de un mismo reel público | TL + PO | Planning S5 | JA-047 |
| D-18 | Generación de PDF | react-pdf · Playwright print-to-PDF en el worker | TL | Planning S5 | JA-054 |
| D-19 | OAuth de Meta y login con dominios custom de agencias | OAuth siempre en dominio central con redirect · redirect URI por dominio (no escala) | TL | Inicio de S6 (ADR) | JA-059 |

### Meta, legal y finanzas
| # | Pregunta | Opciones / contexto | Dueño | Fecha límite | Bloquea |
|---|---|---|---|---|---|
| D-20 | **Legal del scraping** de la Biblioteca de Anuncios | Viola Términos de Meta. Opciones: seguir con mitigaciones (aislado, datos públicos, kill switch) · solo proveedor tercero (Apify u otro) · quitar M5 del MVP. Pedir dictamen legal | PO + Legal | Antes del planning de S3 | JA-034 a JA-038 |
| D-21 | **MercadoPago sí/no** | Depende de cuántas agencias entrevistadas tienen problemas con tarjeta internacional | PO | Fin de S0 (JA-004) | JA-066 |
| D-22 | Entidad legal que factura y país | Afecta Stripe, impuestos, Business Verification y contratos | PO + Contable | Inicio de S0 | JA-006, JA-062 |
| D-23 | Impuestos y facturación a agencias de otros países (IVA, retenciones) | Stripe Tax ⚠️ · facturación local | Contable | Planning S6 | JA-062 |
| D-24 | Rol legal en datos: agencia responsable / Jedertech encargado | DPA para agencias, consentimiento de los clientes finales | Legal | S7 | JA-071 |
| D-25 | Plan B si App Review no se aprueba a tiempo | Clientes como testers (límite de usuarios ⚠️) · vender primero módulos que no dependen de permisos del cliente | PO + TL | Planning S6 | JA-078 |
| D-26 | ¿Postular a Meta Business Partner (badge) y certificaciones Blueprint? | No es necesario para lanzar; objetivo de mediano plazo de la agencia | PO | Después de Etapa 2 | — |

### Equipo y recursos
| # | Pregunta | Opciones / contexto | Dueño | Fecha límite | Bloquea |
|---|---|---|---|---|---|
| D-27 | **Dedicación horaria de Sergio** | Horas/semana reales (estudia). El plan asume ~35–45 pts/sprint ⚠️; con <20 h/semana el MVP se estira | Sergio + PO | Inicio de S0 | Todo el roadmap |
| D-28 | **Presupuesto mensual** para infra, APIs y herramientas | Estimado fijo infra USD 150–300/mes ⚠️ + Claude Code/Anthropic API + dominios + legal | PO | Inicio de S0 | Cuentas de proveedores |
| D-29 | Compensación de Sergio (sueldo, horas, equity, % de MRR) | — | PO + Sergio | Fin de S0 | — |
| D-30 | ¿Se suma otra persona (diseño UX, comercial, segundo dev) y cuándo? | Disparador sugerido: >5 agencias pagas o atraso >1 sprint | PO | Review de S5 | Etapa 2–3 |
| D-31 | Soporte a agencias: canal y horario | WhatsApp · email · Slack compartido; SLA | PO | S7 | JA-074 |
| D-32 | ¿Qué plan de Claude/Claude Code usa Sergio y con qué límite de gasto? | Afecta productividad y costo del equipo | PO + TL | Inicio de S0 | — |

## 2. Supuestos a validar

| # | Supuesto | Cómo se valida | Dueño | Cuándo |
|---|---|---|---|---|
| S-01 | Las agencias de infoproductores pagan ≥ USD 497/mes por una herramienta de marca blanca ⚠️ | Entrevistas + compromisos de pago (LOI/seña) | PO | S0 |
| S-02 | Las agencias pueden revender a USD 150–300+/cuenta ⚠️ | Preguntar en entrevistas cuánto cobran hoy por reportes/estrategia | PO | S0 |
| S-03 | El costo variable por cuenta cliente queda ≤ USD 10 (techo USD 25)/mes ⚠️ | Panel de costos (JA-057) con el piloto | TL | S5 |
| S-04 | Business Discovery entrega datos suficientes para un Radar útil (sin reach/views de terceros) | Spike con cuentas reales al inicio de S3 + feedback del piloto | TL | S3 |
| S-05 | El scraper funciona desde servidor sin proxies a volumen bajo | Prueba en staging al inicio de S3 | TL | S3 |
| S-06 | La AI genera guiones que la agencia efectivamente graba | ≥1 guion grabado y publicado en Etapa 1 | PO | S5 |
| S-07 | Business Verification + App Review se resuelven en < 6–8 semanas ⚠️ | Seguimiento semanal desde S0 | PO | S0–S7 |
| S-08 | La velocidad de 1 dev + Claude es 35–45 pts/sprint ⚠️ | Medir en S1–S2 y recalibrar | TL | S2 |
| S-09 | El chat guiado es preferido a menús por usuarios no técnicos | Observación del uso del piloto (PostHog + entrevistas) | PO + TL | S5–S7 |
| S-10 | Hay demanda de MercadoPago (tarjetas internacionales rechazadas) | Entrevistas | PO | S0 |
| S-11 | Metas de MRR: 5 agencias al fin de Etapa 2, 15 al mes 6, USD 30k MRR al mes 12 ⚠️ | Pipeline comercial y conversión de waitlist | PO | Revisión mensual |

## 3. Decididas
| # | Decisión | Fecha | Razón |
|---|---|---|---|
| — | Mercado inicial LATAM hispano, producto en español, precios en USD | (brief) | Proximidad con la agencia, idioma |
| — | Canal inicial: marca blanca para agencias; la agencia de Jedertech es el piloto #1 | (brief) | Distribución rápida sin producir contenido propio |
| — | Stack TypeScript full (Next.js, BullMQ, Drizzle, Supabase, Anthropic) | (brief) | Reutiliza el scraper TS; un solo lenguaje para 1 dev |

## 4. Cómo usar este documento
- En cada **planning**: revisar las filas con fecha límite en el sprint que arranca.
- En cada **review**: actualizar estados y mover a "Decididas".
- Si una decisión se atrasa y bloquea una historia, la historia no cumple la Definition of Ready ([08-scrum/como-trabajamos.md](08-scrum/como-trabajamos.md)).
