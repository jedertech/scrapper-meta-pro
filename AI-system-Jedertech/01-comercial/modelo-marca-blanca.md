# Modelo marca blanca — Jeder AI

> Cómo funciona la reventa por agencias: qué personalizan, qué no, quién hace qué, contrato/SLA, soporte y riesgos.
> Módulo técnico: **M11 Panel de Agencia** (Sprint 6). Planes y precios: [pricing-y-unit-economics.md](pricing-y-unit-economics.md).
> Aspectos legales: borrador orientativo, **no es asesoramiento legal** — revisar con abogado antes de firmar con la primera agencia.

---

## 1. El modelo en una frase

**Jedertech provee la plataforma; la agencia la presenta como propia, la vende a sus clientes al precio que quiera y es dueña de la relación comercial.**

```
Jedertech (plataforma, infraestructura, Meta App, AI)
   │  factura plan mensual (Starter/Pro/Scale) + setup
   ▼
Agencia (tenant) — su marca, su dominio, su precio
   │  factura a sus clientes (USD 150–300+/cuenta o incluido en su fee)
   ▼
Cliente final (infoproductor) — ve solo la marca de la agencia
```

### Jerarquía técnica

| Nivel | Qué es | Ejemplo |
|---|---|---|
| Tenant | La agencia | "Agencia Norte" |
| Workspace | Equipo o unidad dentro de la agencia (opcional) | "Equipo Lanzamientos" |
| Cuenta cliente | Un infoproductor con su IG y Perfil de Marca | "@coachlaura" |
| Usuarios | Staff de la agencia (admin, estratega, CM) + usuarios del cliente final (solo lectura/chat) | |

Datos aislados por tenant con RLS en Postgres (ver [../00-vision/glosario.md](../00-vision/glosario.md)).

---

## 2. Qué personaliza la agencia

| Elemento | Personalizable | Cómo | Plan |
|---|---|---|---|
| **Nombre del producto** | Sí | Campo de texto ("Norte AI") | Todos |
| **Logo** (claro/oscuro) + favicon | Sí | Upload SVG/PNG | Todos |
| **Colores** (primario, acento) | Sí | Selector; se generan tokens de tema | Todos |
| **Dominio** | Sí | Subdominio propio vía CNAME (`app.agencianorte.com`) + SSL automático | Todos (Starter: opcional ⚠️) |
| **Emails transaccionales** | Sí | Remitente `noreply@agencianorte.com` (verificación DNS SPF/DKIM en Resend) | Pro / Scale ⚠️ |
| **Reportes PDF/email (M10)** | Sí | Logo, colores, portada, texto de cierre, firma | Todos |
| **Nombre y "personalidad" del asistente** | Parcial | Nombre del asistente y saludo; el comportamiento base no | Todos |
| **Precios a sus clientes** | Sí, 100% libre | Fuera de la plataforma (la agencia factura) | Todos |
| **Usuarios y roles** | Sí | Invitar staff y clientes con roles | Todos |
| **Qué módulos ve cada cliente** | Sí | Toggles por cuenta (p.ej. ocultar M5 a un cliente) | Pro / Scale |
| **Página de login** | Sí | Logo + colores + texto | Todos |
| **Plantillas de reportes/guiones propias** | Futuro | Biblioteca de plantillas de agencia | Etapa 3+ ⚠️ |

## 3. Qué NO personaliza

| Elemento | Por qué |
|---|---|
| Lógica de los agentes AI y prompts base | Calidad y costo controlados centralmente |
| Infraestructura, proveedores (LLM, transcripción, proxies) | Unit economics y seguridad |
| La **App de Meta** usada para conectar cuentas | Ver §4 — el consentimiento de Meta muestra el nombre de **nuestra** app |
| Políticas de uso aceptable y privacidad base | Requisito de Meta y legal; la agencia puede sumar las suyas |
| Límites de uso por cuenta | Protegen el margen (ver pricing §1.3) |
| Integraciones nuevas a medida | Van al roadmap general, no a una agencia sola |
| Acceso a datos de otros tenants | Nunca |

---

## 4. Punto delicado: la pantalla de consentimiento de Meta

Cuando el cliente final conecta su Instagram (M2), Meta muestra el **nombre y logo de la App de Meta** (la nuestra), no el de la agencia.

| Opción | Pros | Contras | Decisión |
|---|---|---|---|
| A. App con nombre neutro (p.ej. "Content Insights Connect" ⚠️ nombre a definir) | Una sola App Review; no "rompe" mucho la marca blanca | Aparece un nombre distinto al de la agencia | **Recomendada para Etapa 2** |
| B. Una App de Meta por agencia | Marca blanca total | Cada agencia necesita Business Verification + App Review propios; inmanejable | Solo para agencias Scale que lo pidan, Etapa 4+ ⚠️ |

> Explicarlo en el onboarding de la agencia: "Al conectar, tu cliente va a ver 'X'. Es el conector seguro aprobado por Meta." Ver [../03-meta-y-legal/meta-app-review-y-permisos.md](../03-meta-y-legal/meta-app-review-y-permisos.md).

---

## 5. Reparto de responsabilidades (RACI simplificado)

R = responsable · A = aprueba · C = consultado · I = informado

| Actividad | Jedertech | Agencia | Cliente final |
|---|---|---|---|
| Disponibilidad de la plataforma, seguridad, backups | R/A | I | — |
| App de Meta, App Review, cumplimiento de políticas de Meta | R/A | I | — |
| Calidad de los agentes AI y mejoras del producto | R/A | C | — |
| Branding, dominio, configuración de cuentas | C | R/A | — |
| Venta, precio y facturación al cliente final | — | R/A | I |
| Soporte nivel 1 al cliente final (uso, dudas) | C | R/A | — |
| Soporte nivel 2/3 (bugs, conexiones Meta, datos) | R/A | C | I |
| Conseguir consentimiento del cliente final para conectar IG | C | R | A |
| Base legal / contrato con el cliente final (privacidad) | C (provee modelo) | R/A | I |
| Uso responsable del contenido generado (guiones) | — | R | R |
| Pago a Jedertech | — | R/A | — |

---

## 6. Contrato con la agencia (puntos clave) — ⚠️ borrador, revisar con abogado

| Cláusula | Contenido propuesto |
|---|---|
| Objeto | Licencia de uso SaaS en modalidad marca blanca, no exclusiva, intransferible |
| Plazo | Mensual con renovación automática; anual opcional (2 meses gratis si aplica) |
| Precio | Plan + setup; cuentas extra USD 39/mes; precios en USD; ajuste con 60 días de aviso (Founders: congelado con −40%) |
| Pago | Por adelantado; Stripe o MercadoPago; suspensión a los 10 días de mora ⚠️ |
| Propiedad intelectual | La plataforma es de Jedertech; los datos del cliente final pertenecen al cliente/agencia; el contenido generado (guiones, reportes) es de la agencia/cliente |
| Datos personales | **DPA** anexo: agencia = responsable, Jedertech = encargado (ver [../03-meta-y-legal/privacidad-datos.md](../03-meta-y-legal/privacidad-datos.md)) |
| Uso aceptable | Prohibido: cuentas de terceros sin autorización, spam, uso para acoso, reventa de datos crudos, ingeniería inversa |
| Cumplimiento Meta | La agencia acepta las Políticas de Plataforma de Meta aplicables a sus usuarios |
| No captación | Jedertech no ofrece self-serve directamente a clientes activos de la agencia durante el contrato + 12 meses ⚠️ |
| Confidencialidad | Mutua |
| Limitación de responsabilidad | Hasta lo pagado en los últimos 3–12 meses ⚠️ |
| Terminación | Cualquiera con 30 días de aviso; exportación de datos disponible 30 días; luego borrado |
| Mención de marca | Sin "Powered by" obligatorio; Jedertech puede mencionar a la agencia como cliente solo con permiso (Founders: sí, por contrato) |

---

## 7. SLA

| Ítem | Starter | Pro | Scale |
|---|---|---|---|
| Uptime objetivo (web) | 99,5% | 99,5% | 99,9% ⚠️ |
| Frescura de datos M3/M4 | ≤ 24 h | ≤ 24 h | ≤ 12 h ⚠️ |
| Frescura M5 (anuncios) | Semanal, *best effort* | Semanal, *best effort* | 2×/semana, *best effort* |
| Soporte | Email/ticket, respuesta ≤ 48 h hábiles | ≤ 24 h hábiles + WhatsApp | ≤ 8 h hábiles + canal dedicado |
| Incidente crítico (no se puede usar) | ≤ 8 h hábiles | ≤ 4 h hábiles | ≤ 2 h hábiles |
| Onboarding | 1 sesión + docs | 2 sesiones | 3 sesiones + revisión mensual |
| Créditos por incumplimiento | 5% del mes por cada 0,5% bajo objetivo, tope 25% ⚠️ | ídem | ídem |

> **Exclusión explícita:** M5 (Espía de Anuncios) depende de la Biblioteca de Anuncios pública y puede degradarse sin aviso por cambios de Meta → *best effort*, sin créditos. Ver [../03-meta-y-legal/ads-library-y-scraping.md](../03-meta-y-legal/ads-library-y-scraping.md).

---

## 8. Soporte

| Nivel | Quién | Qué cubre | Herramienta |
|---|---|---|---|
| N0 — Autoservicio | Asistente AI dentro del producto (M1) + centro de ayuda | "¿Cómo conecto IG?", "¿Qué significa este número?" | In-app, base de conocimiento |
| N1 | Agencia | Dudas de uso de sus clientes | Su canal habitual |
| N2 | Jedertech | Errores de conexión, datos faltantes, bugs | Ticket (email/WhatsApp Business según plan) |
| N3 | Sergio / equipo técnico | Bugs de código, incidentes | GitHub issues + Sentry |

- Centro de ayuda **sin marca** (white label) que la agencia puede linkear con su dominio ⚠️ (Etapa 2: un Notion/página neutra).
- Todo lo que entra a N2 dos veces → artículo de ayuda o mejora de producto.

---

## 9. Onboarding de agencia (checklist)

### Antes del kickoff
- [ ] Contrato + DPA firmados; setup cobrado.
- [ ] Tenant creado; admin de la agencia invitado.
- [ ] La agencia envía: logo (SVG/PNG claro y oscuro), colores HEX, nombre del producto, subdominio deseado.

### Sesión 1 (60 min) — Configuración
- [ ] Branding aplicado y revisado en vivo.
- [ ] CNAME configurado (o instrucciones a su proveedor de DNS); SSL verificado.
- [ ] (Pro/Scale) Dominio de email verificado (SPF/DKIM).
- [ ] Alta de 1–2 cuentas cliente de prueba: conexión IG (M2), Perfil de Marca (M1), 5 competidores (M4), 3 anunciantes (M5).

### Sesión 2 (60 min) — Operación
- [ ] Flujo semanal: chat guía → plan (M7) → guiones (M8) → calendario (M9) → reporte (M10).
- [ ] Roles: quién de la agencia hace qué.
- [ ] Cómo presentarlo a sus clientes (kit de reventa).

### Kit de reventa que entregamos
- [ ] Presentación editable (sin nuestra marca) de "su" plataforma.
- [ ] Plantilla de propuesta comercial con precio sugerido USD 150–300/cuenta.
- [ ] Texto de consentimiento para que el cliente conecte su IG.
- [ ] Guía rápida para el cliente final (PDF white label).
- [ ] Ejemplo de reporte M10.

### A los 30 días
- [ ] Revisión: cuentas activas, uso por módulo, NPS de la agencia.
- [ ] Detectar riesgo de churn (menos de 3 cuentas activas → llamada).

---

## 10. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Agencia revende barato y devalúa el producto | Medio | Precio sugerido en el kit; no lo controlamos, pero self-serve tiene precio de referencia público |
| Agencia grande pide features exclusivas | Alto | Roadmap único; priorizar solo lo que sirve a ≥ 3 agencias |
| La agencia pierde al cliente final y se lleva/borra datos | Medio | Exportación + políticas claras de propiedad de datos |
| Una agencia viola políticas de Meta (conecta cuentas sin permiso) | **Muy alto** (puede afectar nuestra App) | Uso aceptable en contrato, logs de consentimiento, suspensión inmediata |
| Conflicto de canal cuando abrimos self-serve | Medio | Cláusula de no captación + precio self-serve ≥ reventa + derivación a agencias partner |
| Dependencia de pocas agencias | Alto (concentración de MRR) | Meta: ninguna agencia > 25% del MRR al mes 9 |
| Soporte se vuelve inmanejable | Medio | N0 con AI + N1 en agencia; SLA por plan |
| Branding roto (emails con nuestra marca, errores con logos ajenos) | Medio | QA de marca blanca en checklist de release |

Relacionado: [go-to-market.md](go-to-market.md) · [../02-producto/modulos.md](../02-producto/modulos.md) · [../08-scrum/backlog.md](../08-scrum/backlog.md).
