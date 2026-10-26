# Sprint 5 — M8 Guionista + M7 Coach + M9 Calendario + M10 Reportes + App Review (semanas 11–12)

> Backlog: [../backlog.md](../backlog.md) · App Review: [../../03-meta-y-legal/meta-app-review-y-permisos.md](../../03-meta-y-legal/meta-app-review-y-permisos.md) · Agentes: [../../05-agentes-ai/arquitectura-multiagente.md](../../05-agentes-ai/arquitectura-multiagente.md)

## Sprint goal
**"Cada lunes la agencia recibe, por cuenta piloto, un plan del Coach y un reporte con su marca, y puede convertir cualquier recomendación en un guion listo para grabar. App Review enviada."**

Cierra la **Etapa 1**: al final de este sprint se evalúan los criterios de salida de [../../07-roadmap/etapas.md](../../07-roadmap/etapas.md).

## Historias incluidas (40 pts)
| ID | Historia | Pts |
|---|---|---|
| JA-047 | Control de costos de video | 3 |
| JA-048 | Checklist de onboarding paso a paso | 3 |
| JA-049 | Generar guiones | 5 |
| JA-050 | Editar, versionar y variantes de hook | 3 |
| JA-051 | Plan semanal del Coach | 5 |
| JA-052 | Feedback sobre recomendaciones | 2 |
| JA-053 | Calendario simple | 3 |
| JA-054 | Reporte semanal PDF | 5 |
| JA-055 | Envío programado por email + vista web | 3 |
| JA-056 | Preparar y enviar App Review | 5 |
| JA-057 | Costo por cuenta cliente | 3 |

## Tareas técnicas paso a paso
1. **App Review primero (JA-056)** — tiene espera externa, arrancar el día 1
   - [ ] Confirmar Business Verification aprobada (si no: escalar con el PO el mismo día).
   - [ ] Publicar Privacidad, TyC e instrucciones de borrado en URLs públicas definitivas.
   - [ ] Regrabar screencasts con la UI final de M2/M3/M4 (uno por permiso).
   - [ ] Usuario de prueba con instrucciones paso a paso en el formulario.
   - [ ] Enviar; registrar fecha y permisos solicitados en el issue.
2. **Costos (JA-047, JA-057)**
   - [ ] Caché por `media_id`/hash: si existe transcripción/análisis, reutilizar.
   - [ ] Cuotas mensuales por cuenta (tabla `usage_quotas`); aviso al 80%; prioridad de cola manual > automático.
   - [ ] Vista interna `/admin/costos`: costo mensual por cuenta/tenant (LLM + transcripción + storage + scraping estimado); alerta > USD 25.
3. **Guionista (JA-049, JA-050)**
   - [ ] Prompt "Guionista" con inputs: Perfil de Marca, objetivo, formato, duración, referencias (outliers, análisis de video, anuncios).
   - [ ] Salida estructurada: 3 hooks, bloques, CTA, indicaciones de grabación, justificación con referencias.
   - [ ] Tabla `scripts` + `script_versions`; editor (textarea enriquecido o TipTap ⚠️ simple primero); acciones de reescritura.
   - [ ] Botón "Usar como referencia" desde M3/M4/M5/M6.
4. **Coach (JA-051, JA-052)**
   - [ ] Job semanal `coach-weekly-plan` (lunes 06:00 hora del tenant ⚠️) que arma contexto resumido de M3+M4+M5+M6 y genera 3–5 recomendaciones con evidencia.
   - [ ] Tabla `recommendations` con estado y feedback; acción "armar guion" que abre el Guionista prellenado.
5. **Calendario (JA-053)**
   - [ ] Vista semanal/mensual con drag & drop de guiones; estados idea → guion → grabado → publicado.
6. **Reportes (JA-054, JA-055)**
   - [ ] Plantilla de reporte en React → PDF (react-pdf o Playwright print-to-PDF en el worker ⚠️ elegir).
   - [ ] Resumen ejecutivo generado por AI + secciones de datos.
   - [ ] Job semanal: generar → guardar en storage → email con Resend (borrador revisable por la agencia si lo activa).
   - [ ] Vista web `/reportes/[id]` con link firmado con expiración.
7. **Onboarding (JA-048)**
   - [ ] Checklist visible + estado en DB; el chat retoma el paso pendiente; eventos PostHog por paso.

## Entregable / demo
1. Lunes simulado: disparar el job → llega el email con el reporte PDF de una cuenta piloto.
2. Del plan del Coach: "armame el guion de la recomendación 2" → guion con hooks y referencias → arrastrarlo al calendario.
3. Panel interno de costos por cuenta.
4. Captura del App Review enviado.

**Revisión de Etapa 1** (al final de la review): checklist de criterios de salida de [../../07-roadmap/etapas.md](../../07-roadmap/etapas.md).

## Riesgos
| Riesgo | Mitigación |
|---|---|
| Sprint muy cargado de AI (prompts necesitan iteración) | Primera versión "suficientemente buena" + feedback del piloto; evals en S7 |
| Business Verification no aprobada → no se puede enviar App Review | Escalar desde S3; tener plan B (testers) |
| Generación de PDF pesada en el worker | Medir; si es lenta, generar HTML + PDF bajo demanda |
| Guiones "genéricos" | Obligar referencias concretas y tono del Perfil de Marca; feedback del equipo de la agencia en la review |

## Definición de "terminado" del sprint
- [ ] Reporte semanal enviado automáticamente a las cuentas piloto (al menos a la agencia).
- [ ] ≥5 guiones generados y revisados por la agencia; ≥1 grabado.
- [ ] App Review enviada.
- [ ] Costo por cuenta visible y dentro del objetivo o con plan de acción.

## Prompts sugeridos para Claude Code
```text
Usá el subagente ai-prompts. Escribí el prompt del Guionista (packages/ai/prompts/guionista.md) para
reels de infoproductores en español LATAM: inputs (Perfil de Marca, objetivo, formato, duración,
referencias), salida JSON con 3 hooks, bloques, CTA, indicaciones de grabación y justificación citando
referencias. Prohibido copiar literal a competidores. Incluí 3 ejemplos de entrada/salida para evals.
```
```text
Usá el subagente backend: job semanal coach-weekly-plan. Armá un contexto compacto por cuenta
(KPIs M3 de 7 días, outliers M4, anuncios con más días activos M5, análisis de video recientes M6,
Perfil de Marca) y generá 3-5 recomendaciones con evidencia (links internos). Usá prompt caching y
registrá costo en ai_usage. Tests con datos sintéticos.
```
```text
Generá el reporte semanal como componente React y su export a PDF en el worker. Secciones: resumen
ejecutivo (AI), KPIs, competencia, anuncios destacados, plan del Coach. Debe tomar logo y colores del
tenant. Medí el tiempo de generación.
```
```text
Armá un checklist para el App Review de Meta a partir de AI-system-Jedertech/03-meta-y-legal/
meta-app-review-y-permisos.md: por cada permiso, qué pantalla mostrar en el screencast, texto de
justificación en inglés y pasos para el revisor. Marcá lo que haya que verificar en la doc vigente.
```
