# AI-system-Jedertech · Jeder AI

> SaaS de **análisis de competencia + análisis de contenido + coach de AI + guiones**, que guía paso a paso a infoproductores (y después a e-commerce) para crecer en orgánico. Se vende en **marca blanca a agencias** y, más adelante, a **público final**.
> El nombre de trabajo es **Jeder AI**; cada agencia lo rebrandea con su marca.

Esta carpeta es la **fuente de verdad** del proyecto: negocio, producto, Meta/legal, arquitectura, agentes de AI, roadmap y Scrum. El código del SaaS va a vivir en un repo nuevo (`jedertech-ai-platform`, ver [ADR 0001](04-arquitectura/adr/0001-stack-typescript.md)). El scrapper que ya está en este repo (`src/`) se reutiliza como motor del módulo **M5 Espía de Anuncios**.

---

## 👋 Sergio, empezá por acá

Leelo en este orden (son ~2 horas):

1. [Visión y propuesta de valor](00-vision/vision-y-propuesta-de-valor.md): qué construimos y por qué.
2. [Etapas del roadmap](07-roadmap/etapas.md): el mapa completo, de Etapa 0 a Etapa 5.
3. [PRD](02-producto/prd.md) y [Módulos M1–M14](02-producto/modulos.md): qué entra en el MVP.
4. [Flujo guiado SIMPLE](02-producto/flujo-guiado-simple.md): el corazón de la experiencia.
5. [Arquitectura general](04-arquitectura/arquitectura-general.md) y [Reutilización del scrapper](04-arquitectura/reutilizacion-del-scrapper.md).
6. [Meta: App Review y permisos](03-meta-y-legal/meta-app-review-y-permisos.md). Arrancalo en la **semana 1**, porque tarda.
7. [Cómo trabajamos (Scrum)](08-scrum/como-trabajamos.md) → [Backlog](08-scrum/backlog.md) → [Sprint 0](08-scrum/sprints/sprint-00.md).
8. [Guía para programar con Claude](09-desarrollo-con-ia/guia-sergio-con-claude.md) y [agentes de desarrollo](09-desarrollo-con-ia/agentes-dev/README.md).
9. [Preguntas abiertas](10-preguntas-abiertas.md): decisiones que hay que cerrar con el dueño.

---

## Resumen en 60 segundos

| Tema | Decisión |
|---|---|
| Mercado inicial | LATAM hispano, producto en español y precios en USD |
| Canal #1 | **Marca blanca para agencias**. La agencia de Jedertech es el **cliente piloto #1** |
| Canal #2 | Self-serve para el infoproductor (Etapa 4) |
| Precio agencias | Starter USD 497 (5 cuentas) · Pro USD 997 (20) · Scale USD 1.997 (60) + setup. ⚠️ A validar |
| Precio público final | Solo USD 297 · Pro USD 497 (Etapa 4). ⚠️ A validar |
| Margen objetivo | Más del 80%, con un costo variable objetivo de USD 10 por cuenta cliente al mes (techo de alerta: USD 25) |
| Stack | TypeScript full: Next.js, workers con Node + BullMQ, Postgres (Supabase) y Claude API |
| Datos propios | API oficial de Meta (Tech Provider + App Review) |
| Competencia orgánica | Instagram **Business Discovery API**, que es oficial |
| Anuncios de la competencia | Scrapper de la Biblioteca de Anuncios. Va aislado, porque es el riesgo principal |
| Equipo | El dueño es PO · Sergio es Tech Lead/Scrum Master · Claude es pair programmer |

### Etapas

| Etapa | Qué | Cuándo |
|---|---|---|
| 0 | Validación + piloto en la agencia | Semanas 1–2 (Sprint 0) |
| 1 | MVP interno, usado por la agencia | Sprints 1–5 (semanas 3–12) |
| 2 | Lanzamiento en marca blanca y primeras ventas | Sprints 6–7 (semanas 13–16) |
| 3 | Tracking de ventas (M12) | Meses 5–6 |
| 4 | Self-serve + Pack E-commerce (M13) | Meses 7–9 |
| 5 | Editor de video AI (M14) | Mes 10 en adelante |

### Módulos

| ID | Módulo | Etapa |
|---|---|---|
| M1 | Onboarding Guiado | 1 |
| M2 | Conexión de Cuentas | 1 |
| M3 | Mi Contenido | 1 |
| M4 | Radar de Competencia | 1 |
| M5 | Espía de Anuncios | 1 |
| M6 | Análisis de Video | 1 |
| M7 | Coach AI | 1 |
| M8 | Guionista AI | 1 |
| M9 | Calendario | 1 |
| M10 | Reportes | 1 |
| M11 | Panel de Agencia | 1 |
| M12 | Tracking de Ventas | 3 |
| M13 | Pack E-commerce | 4 |
| M14 | Editor de Video AI | 5 |

---

## Mapa de carpetas

```
AI-system-Jedertech/
├── 00-vision/            Visión, propuesta de valor, glosario
├── 01-comercial/         Mercado, competencia, pricing y unit economics, go-to-market, marca blanca
├── 02-producto/          PRD, módulos, flujo guiado, métricas
├── 03-meta-y-legal/      App Review y permisos, Business Partner, scraping, proxies, privacidad
├── 04-arquitectura/      Arquitectura, ADRs, modelo de datos, reutilización del scrapper, costos
├── 05-agentes-ai/        Multiagentes del producto, prompts, evals
├── 06-tracking/          Tracking de ventas para infoproductores (Etapa 3)
├── 07-roadmap/           Etapas 0–5
├── 08-scrum/             Cómo trabajamos, backlog, sprints 0–7, plantillas
├── 09-desarrollo-con-ia/ Guía para programar con Claude + subagentes de desarrollo
└── 10-preguntas-abiertas.md
```

### Índice completo

**00 · Visión**
- [Visión y propuesta de valor](00-vision/vision-y-propuesta-de-valor.md)
- [Glosario](00-vision/glosario.md)

**01 · Comercial**
- [Análisis de mercado](01-comercial/analisis-de-mercado.md)
- [Competencia](01-comercial/competencia.md)
- [Pricing y unit economics](01-comercial/pricing-y-unit-economics.md)
- [Go-to-market](01-comercial/go-to-market.md)
- [Modelo de marca blanca](01-comercial/modelo-marca-blanca.md)

**02 · Producto**
- [PRD](02-producto/prd.md)
- [Módulos M1–M14](02-producto/modulos.md)
- [Flujo guiado SIMPLE](02-producto/flujo-guiado-simple.md)
- [Métricas norte](02-producto/metricas-norte.md)

**03 · Meta y legal**
- [Meta: App Review y permisos](03-meta-y-legal/meta-app-review-y-permisos.md)
- [Meta Business Partner](03-meta-y-legal/meta-business-partner.md)
- [Biblioteca de Anuncios y scraping](03-meta-y-legal/ads-library-y-scraping.md)
- [Proxies](03-meta-y-legal/proxies.md)
- [Privacidad de datos](03-meta-y-legal/privacidad-datos.md)

**04 · Arquitectura**
- [Arquitectura general](04-arquitectura/arquitectura-general.md)
- [Modelo de datos](04-arquitectura/modelo-de-datos.md)
- [Reutilización del scrapper](04-arquitectura/reutilizacion-del-scrapper.md)
- [Costos de infra](04-arquitectura/costos-de-infra.md)
- ADRs:
  - [0001 Stack TypeScript](04-arquitectura/adr/0001-stack-typescript.md)
  - [0002 Multi-tenant y marca blanca](04-arquitectura/adr/0002-multi-tenant-marca-blanca.md)
  - [0003 Scrapper como worker](04-arquitectura/adr/0003-scrapper-como-worker.md)
  - [0004 LLM y transcripción](04-arquitectura/adr/0004-proveedor-llm-y-transcripcion.md)

**05 · Agentes AI**
- [Arquitectura multiagente](05-agentes-ai/arquitectura-multiagente.md)
- [Evals y calidad](05-agentes-ai/evals-y-calidad.md)
- Prompts:
  - [Guía](05-agentes-ai/prompts/guia.md)
  - [Analista](05-agentes-ai/prompts/analista.md)
  - [Guionista](05-agentes-ai/prompts/guionista.md)
  - [Coach](05-agentes-ai/prompts/coach.md)

**06 · Tracking**
- [Tracking para infoproductores](06-tracking/tracking-infoproductores.md)

**07 · Roadmap**
- [Etapas](07-roadmap/etapas.md)

**08 · Scrum**
- [Cómo trabajamos](08-scrum/como-trabajamos.md)
- [Backlog](08-scrum/backlog.md)
- Sprints:
  - [S0](08-scrum/sprints/sprint-00.md)
  - [S1](08-scrum/sprints/sprint-01.md)
  - [S2](08-scrum/sprints/sprint-02.md)
  - [S3](08-scrum/sprints/sprint-03.md)
  - [S4](08-scrum/sprints/sprint-04.md)
  - [S5](08-scrum/sprints/sprint-05.md)
  - [S6](08-scrum/sprints/sprint-06.md)
  - [S7](08-scrum/sprints/sprint-07.md)
- Plantillas:
  - [Historia de usuario](08-scrum/plantillas/historia-de-usuario.md)
  - [Daily async](08-scrum/plantillas/daily-async.md)
  - [Sprint review](08-scrum/plantillas/sprint-review.md)
  - [Retro](08-scrum/plantillas/retro.md)

**09 · Desarrollo con IA**
- [Guía para Sergio con Claude](09-desarrollo-con-ia/guia-sergio-con-claude.md)
- [Agentes de desarrollo](09-desarrollo-con-ia/agentes-dev/README.md)

**10 · Pendientes**
- [Preguntas abiertas](10-preguntas-abiertas.md)

---

## Reglas de este repo de docs

- Las cifras con **⚠️** son estimaciones o supuestos. Se validan antes de tomar decisiones de plata.
- Si cambia una decisión (precio, etapa o módulo), se actualiza **acá primero**, en el README, y después en los docs que la repiten.
- Los IDs de módulos (M1–M14), de historias (JA-xxx) y de sprints (S0–S7) son estables: no se renumeran.
