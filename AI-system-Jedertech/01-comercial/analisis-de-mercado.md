# Análisis de mercado — Jeder AI

> Objetivo: entender a quién le vendemos primero, cuánto mercado hay y qué dolores pagan.
> **Todas las cifras de tamaño de mercado son estimaciones bottom-up marcadas ⚠️ A validar.** No hay fuentes públicas confiables que cuenten "agencias de infoproductores en LATAM"; los números de este documento deben reemplazarse con datos de las entrevistas de Sprint 0.

---

## 1. Contexto: el mercado de infoproductos en LATAM

### 1.1 Cómo funciona

El infoproducto (curso online, mentoría, comunidad, evento, membresía) es un negocio de márgenes altos que vive de **atención** (contenido orgánico en IG/YouTube/TikTok) y **tráfico pago** (Meta Ads principalmente). Se vende a través de plataformas que procesan pagos, entregan el producto y gestionan afiliados.

| Plataforma | Origen | Rol | Relevancia para Jeder AI |
|---|---|---|---|
| **Hotmart** | Brasil, fuerte en toda LATAM hispana | Checkout + área de miembros + afiliados | Webhooks para M12; mayor base de infoproductores hispanos ⚠️ |
| **Kiwify** | Brasil | Checkout + miembros, muy popular en BR, creciendo en hispano ⚠️ | Webhooks para M12 |
| **Eduzz** | Brasil | Checkout + miembros | Webhooks para M12 |
| **Monetizze / Braip** | Brasil | Checkout | Opcional, más BR |
| **Stripe** | Global | Pagos (infoproductores con stack propio) | Webhooks para M12 |
| **MercadoPago** | LATAM | Pagos locales | Webhooks para M12 |
| **Skool / Circle / Teachable / Thinkific** | Global | Comunidad/cursos | Futuro |

> Nota: Hotmart reporta públicamente millones de creadores y presencia en decenas de países; no usamos cifras exactas acá porque cambian y no segmentan "hispano activo con agencia" ⚠️.

### 1.2 Tendencias que nos favorecen

1. **Saturación de nichos** (marketing digital, finanzas, fitness, desarrollo personal): competir exige análisis, no intuición.
2. **Profesionalización**: los infoproductores medianos ya tienen equipo (editor, CM, trafficker) o agencia.
3. **Contenido de video corto** como canal #1 → el análisis de hooks/guiones es crítico.
4. **Costos de pauta en alza** → el orgánico vuelve a importar, y saber qué anuncio de la competencia "gana" ahorra testeo.
5. **AI generativa normalizada**: el infoproductor ya usa ChatGPT; está listo para pagar por algo **mejor que ChatGPT genérico**.
6. **Agencias buscando MRR**: el modelo de "software propio" (marca blanca) es atractivo para subir ticket y retener.

### 1.3 Tendencias que nos amenazan

- Meta cambia APIs y endurece anti-scraping (ver [../03-meta-y-legal/ads-library-y-scraping.md](../03-meta-y-legal/ads-library-y-scraping.md)).
- Herramientas globales agregan AI y español rápido.
- Sensibilidad al precio en USD en economías inestables (AR especialmente).
- Muchas agencias pequeñas son informales (pagos irregulares, alta rotación).

---

## 2. Segmentos

| Segmento | Descripción | Tamaño relativo | Disposición a pagar | Prioridad |
|---|---|---|---|---|
| **A. Agencias de infoproductores** | 3–30 personas, 5–60 clientes, gestionan contenido y/o pauta | Medio | Alta (es herramienta de trabajo + reventa) | **#1 (Etapas 0–3)** |
| **B. Infoproductor mediano con equipo** | Factura USD 10k–200k/mes ⚠️, tiene CM/editor | Medio | Alta (USD 297–497 es menos que un analista) | #2 (vía agencia, luego self-serve Etapa 4) |
| **C. Infoproductor chico / solo** | < USD 5k/mes, hace todo solo | Grande | Baja | No prioritario (riesgo de churn) |
| **D. Agencias generalistas** (pymes, e-commerce) | Mezcla de clientes | Grande | Media | Etapa 4 con M13 |
| **E. E-commerce DTC** | Marcas Shopify/Tiendanube | Grande | Media–alta | Etapa 4 (M13) |
| **F. Lanzadores / coproductores** | Socios estratégicos que manejan varios expertos | Chico | Muy alta | Oportunidad dentro de A |

---

## 3. ICP — Agencia (cliente pagador inicial)

### 3.1 Perfil firmográfico

| Atributo | Valor ideal | Descalificador |
|---|---|---|
| País | AR, MX, CO, CL, PE, UY (hispano) | Solo BR (idioma) en Etapas 0–2 |
| Tamaño | 5–30 personas | Freelancer solo (salvo Agency Starter) |
| Clientes activos | 5–40 infoproductores | < 3 clientes |
| Servicios | Contenido orgánico + pauta, o lanzamientos | Solo diseño web / SEO |
| Facturación de la agencia | USD 15k–150k/mes ⚠️ | < USD 5k/mes (no puede pagar USD 497) |
| Fee promedio por cliente | USD 800–3.000/mes ⚠️ | < USD 300 (no hay margen para revender) |
| Madurez | Usa al menos 2 herramientas pagas (Metricool, Foreplay, Notion, ClickUp…) | No usa ninguna herramienta |

### 3.2 Comprador y usuarios

| Rol | Qué le importa | Cómo le hablamos |
|---|---|---|
| **Dueño/CEO** (decide) | Margen, diferenciación, retener clientes, nuevo ingreso recurrente | "Tu propio software con tu marca, revendible a USD 150–300/cuenta" |
| **Head de estrategia / estratega** (usa) | Calidad del análisis, rapidez de guiones | "Análisis de competencia en minutos, guiones con datos reales" |
| **CM / analista** (usa) | Menos trabajo manual | "El reporte semanal se arma solo" |
| **Cliente final** (ve) | Resultados, sentirse acompañado | Reportes con marca de la agencia, chat guía |

### 3.3 Señales de compra (para outbound)

- Publica casos de éxito de lanzamientos en IG/LinkedIn.
- Busca analistas/CMs en LinkedIn o grupos (= dolor de capacidad).
- Ya vende "auditorías" o "estrategia de contenido" como servicio.
- Tiene anuncios activos en la Biblioteca de Anuncios (se puede detectar con nuestro propio scrapper).

---

## 4. ICP — Infoproductor (usuario final y self-serve Etapa 4)

| Atributo | Valor ideal |
|---|---|
| Facturación | USD 10k–200k/mes ⚠️ |
| Canal principal | Instagram (orgánico + Meta Ads) |
| Cuenta IG | Business o Creator, 10k–500k seguidores |
| Equipo | Al menos 1 persona de contenido o una agencia |
| Plataforma de venta | Hotmart / Kiwify / Stripe / MercadoPago |
| Producción | ≥ 3 piezas por semana |
| Mentalidad | Data-driven o con ganas de serlo; ya usa AI |
| Descalificador | Cuenta IG personal (no profesional), < 3 posts/semana, sin oferta clara |

### Sub-perfiles útiles para el Perfil de Marca y los prompts

| Sub-perfil | Particularidad |
|---|---|
| Lanzador por ciclos | Picos de contenido antes de lanzamientos; necesita calendario + análisis de lanzamientos competidores |
| Perpetuo / evergreen | Anuncios siempre activos; necesita espía de anuncios y rotación creativa |
| High ticket por DM | CTA "escribime X"; WhatsApp/DM como destino (el scrapper ya clasifica destinos en `src/destination.ts`) |
| Comunidad/membresía | Retención y contenido recurrente |

---

## 5. Dolores (priorizados)

| # | Dolor | Segmento | Intensidad (1–5) ⚠️ | Frecuencia | Módulo |
|---|---|---|---|---|---|
| 1 | "No sé qué está funcionando en mi nicho" | A, B | 5 | Semanal | M4, M5, M6 |
| 2 | "Armar reportes y análisis me come el equipo" | A | 5 | Semanal | M10, M11 |
| 3 | "No sé qué publicar esta semana / bloqueo creativo" | B | 4 | Diaria | M7, M8, M9 |
| 4 | "No sé qué contenido o anuncio me trae ventas" | A, B | 4 | Mensual | M12 |
| 5 | "Mis clientes se van porque no ven valor tangible" | A | 4 | Mensual | M10, M11 |
| 6 | "Las herramientas están en inglés y no entienden mi nicho" | A, B | 3 | Continua | Todo |
| 7 | "Pago 4 herramientas que no se hablan entre sí" | A | 3 | Mensual | Todo |

---

## 6. Jobs-to-be-done

Formato: *Cuando [situación], quiero [motivación], para [resultado esperado].*

### Agencia

1. **Cuando** tomo un cliente nuevo, **quiero** un diagnóstico de su cuenta y de 5–10 competidores en un día, **para** presentar una estrategia sólida en la primera semana.
2. **Cuando** llega el lunes, **quiero** que el reporte de cada cliente esté listo con mi marca, **para** no perder la mañana armando PDFs.
3. **Cuando** un cliente pregunta "¿por qué no crecemos?", **quiero** evidencia comparativa con la competencia, **para** justificar decisiones y retenerlo.
4. **Cuando** mis estrategas están saturados, **quiero** que la AI proponga guiones basados en lo que funciona, **para** escalar clientes sin contratar.
5. **Cuando** vendo mis servicios, **quiero** mostrar "mi plataforma propia", **para** diferenciarme y cobrar más.

### Infoproductor

1. **Cuando** me siento a crear contenido, **quiero** saber qué temas y hooks funcionan en mi nicho, **para** no publicar a ciegas.
2. **Cuando** un competidor explota con un reel, **quiero** entender por qué (hook, ángulo, estructura), **para** adaptar la idea.
3. **Cuando** planifico un lanzamiento, **quiero** ver qué anuncios corre la competencia hace semanas, **para** inspirar mis creativos.
4. **Cuando** vendo, **quiero** saber qué pieza trajo la venta, **para** hacer más de eso (M12, Etapa 3).

---

## 7. TAM / SAM / SOM (bottom-up) ⚠️ A validar

> Método: contar unidades (agencias / infoproductores) × precio anual. Todos los inputs son supuestos razonables a reemplazar con datos de entrevistas, búsquedas en LinkedIn/IG y la propia Biblioteca de Anuncios (contar anunciantes con dominios de Hotmart/Kiwify por país es una forma práctica de estimar).

### 7.1 Supuestos

| Input | Valor supuesto ⚠️ | Cómo validarlo |
|---|---|---|
| Agencias de marketing digital en LATAM hispano (AR, MX, CO, CL, PE, UY, EC…) | ~30.000 | LinkedIn Sales Navigator / directorios (Clutch, Sortlist) |
| % que trabaja con infoproductores como foco o parte relevante | ~10% → ~3.000 | Entrevistas + búsqueda de keywords ("lanzamientos", "infoproductos") |
| % de esas con ≥ 5 clientes y capacidad de pagar ≥ USD 497/mes | ~30% → ~900 | Entrevistas |
| Infoproductores hispanos con facturación ≥ USD 10k/mes | ~20.000 | Anunciantes únicos en Biblioteca con dominios de checkout (Hotmart/Kiwify/etc.) |
| Precio anual promedio agencia (mix de planes) | ~USD 10.000 | Pricing canónico (mix Starter/Pro) |
| Precio anual self-serve infoproductor (Solo/Pro) | ~USD 4.000 | Pricing canónico (USD 297–497 con anuales) |

### 7.2 Cálculo

| Nivel | Definición | Cálculo | Resultado ⚠️ |
|---|---|---|---|
| **TAM** | Todas las agencias de infoproductos hispanas + infoproductores ≥ USD 10k/mes, si todos compraran | 3.000 agencias × USD 10k + 20.000 infoproductores × USD 4k | **~USD 110M/año** |
| **SAM** | Agencias calificadas (≥ 5 clientes, pueden pagar) + infoproductores con equipo en IG que no tienen agencia (~30% de 20k) | 900 × USD 10k + 6.000 × USD 4k | **~USD 33M/año** |
| **SOM (24 meses)** | Lo que podemos capturar realista con equipo chico | ~40 agencias × USD 10k + ~150 self-serve × USD 4k | **~USD 1M/año** (≈ USD 83k MRR) |

> Coherencia con metas del brief: mes 12 → USD 30k MRR ⚠️ (≈ 35% del SOM a 24 meses). Razonable si la Etapa 2 cierra 5 agencias y el canal outbound escala.

### 7.3 Sensibilidad rápida

| Si… | Impacto en SAM |
|---|---|
| Solo 5% de agencias trabaja con infoproductos (no 10%) | SAM agencias cae a ~USD 4,5M |
| Incluimos Brasil (portugués) en Etapa 4+ | TAM ×2–3 ⚠️ (Brasil es el mercado de infoproductos más grande de la región) |
| Incluimos e-commerce (M13) | TAM ×3+ ⚠️ |
| Precio promedio real 30% menor (descuentos, Founders) | Todo −30% |

---

## 8. Análisis de entrada por país (LATAM hispano)

| País | Ecosistema infoproductos | Poder de pago en USD | Notas | Prioridad |
|---|---|---|---|---|
| **México** | Grande, creciendo ⚠️ | Media–alta | Mercado más grande hispano; facturación en MXN común | Alta |
| **Argentina** | Muy activo en marketing digital/agencias | Variable (inestabilidad cambiaria) | Base de Jedertech, piloto; agencias exportan servicios a otros países | Alta (piloto) |
| **Colombia** | Activo, muchas agencias | Media | Buen mercado de agencias | Alta |
| **Chile** | Mediano | Alta | Ticket más alto posible | Media |
| **Perú / Ecuador / Uruguay** | Mediano/chico | Media | Seguir a clientes de agencias regionales | Media |
| **España** | Grande, cercano | Alta | Fuera del foco inicial; posible expansión natural (idioma) | Futuro |
| **Brasil** | El más grande | Media | Requiere producto en portugués | Futuro |

---

## 9. Plan de validación de mercado (Sprint 0)

- [ ] 10 entrevistas a dueños de agencias (guion en [go-to-market.md](go-to-market.md)).
- [ ] 5 entrevistas a infoproductores (clientes de la agencia piloto + 2 externos).
- [ ] Contar anunciantes con links a Hotmart/Kiwify por país usando el scrapper actual (proxy de tamaño del mercado).
- [ ] Validar precio: preguntar "¿cuánto pagás hoy en herramientas + horas de analista?" (no "¿cuánto pagarías?").
- [ ] Conseguir 3 compromisos Founders (carta de intención o seña).
- [ ] Actualizar este documento reemplazando los ⚠️ con datos reales.

### Preguntas clave a responder

| Pregunta | Dato que buscamos |
|---|---|
| ¿Cuántas horas/semana dedican a análisis de competencia y reportes? | Para el argumento de ahorro |
| ¿Qué herramientas pagan y cuánto? | Benchmark de precio y competidores reales |
| ¿Revenderían un software con su marca? ¿A cuánto? | Valida modelo marca blanca |
| ¿Qué datos les faltan hoy? | Prioridad de módulos |
| ¿Cuánto es el fee mensual promedio a sus clientes? | Capacidad de pago |

Relacionado: [competencia.md](competencia.md) · [pricing-y-unit-economics.md](pricing-y-unit-economics.md) · [go-to-market.md](go-to-market.md).
