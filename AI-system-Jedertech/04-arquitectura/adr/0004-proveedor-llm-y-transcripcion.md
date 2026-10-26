# ADR 0004: Proveedor de LLM (Claude) y de transcripción

| Campo | Valor |
|---|---|
| **Estado** | Aceptado (LLM) · Propuesto, a confirmar con benchmark en S4 (transcripción) |
| **Fecha** | 2026-10 |
| **Decisores** | Sergio (Tech Lead), PO |
| **Relacionados** | [Arquitectura multiagente](../../05-agentes-ai/arquitectura-multiagente.md) · [Costos de infra](../costos-de-infra.md) · [Evals](../../05-agentes-ai/evals-y-calidad.md) |

## Contexto

- El producto es, en esencia, **agentes de AI sobre datos de redes**: chat en streaming con tool use, análisis estructurado de transcripts, generación de guiones en español con matices regionales.
- Restricción de costo: **≤ USD 8/mes de LLM y ≤ USD 3/mes de transcripción por cuenta cliente**.
- Los videos son cortos (Reels de 15–90 s), en español de distintos países, a veces con música de fondo.
- Stack TypeScript ([ADR 0001](0001-stack-typescript.md)).

## Decisión: LLM

**Claude API vía `@anthropic-ai/sdk` (TypeScript)**, con 3 modelos por tipo de tarea:

| Modelo | ID | Precio por MTok (in / out) ⚠️ verificar al implementar | Uso |
|---|---|---|---|
| Sonnet 5.5 | `claude-sonnet-5-5` | USD 2 / 10 (lectura de cache 0,20) | **Default**: orquestador del chat, análisis de video, guiones, coach |
| Haiku 5.5 | `claude-haiku-5-5` | USD 0,10 / 0,50 (prompts ≤ 100K tokens) | Clasificación de posts y anuncios, etiquetado de temas y hooks, enrutamiento, extracción simple, LLM-as-judge barato |
| Opus 5.5 | `claude-opus-5-5` | USD 4 / 20 (lectura de cache 0,20) | Puntual: diagnóstico mensual profundo, análisis complejo a pedido, juez de evals "de oro" |

Prácticas obligatorias:

- **Prompt caching**: tools + system prompt + Perfil de Marca al principio y estables (`cache_control: { type: "ephemeral" }`); lo variable va al final. Verificar `usage.cache_read_input_tokens`.
- **Structured outputs** (`output_config.format` con JSON Schema) para análisis y guiones; tools con `strict: true`.
- **Tool choice**: en Sonnet 5.5 y Opus 5.5 el `tool_choice` forzado (`any`/`tool`) devuelve 400 → usar `auto` + instrucción en el prompt + `strict: true`, o structured outputs.
- **Thinking**: adaptativo (default de los modelos actuales). Controlar costo y latencia con `output_config.effort` (`low` para chat y enrutamiento, `medium`/`high` para guiones y análisis). Para chat de baja latencia en Sonnet 5.5 se puede evaluar `thinking: { type: "between_tools" }` ⚠️.
- **Streaming** para el chat y para cualquier salida larga (`client.messages.stream(...)` + `finalMessage()`).
- **Batches API** (≈50% de descuento) para todo lo no urgente: plan semanal, reportes, re-análisis masivos.
- **Refusals**: manejar `stop_reason: "refusal"`; habilitar el fallback del lado del servidor (`fallbacks: "default"` con el beta `server-side-fallback-2026-07-01`) en Sonnet 5.5 / Opus 5.5 ⚠️ confirmar disponibilidad.
- **Registro de costos**: cada llamada guarda `usage` (input, output, cache read/write) y el costo calculado en `usage_costs`.
- **Abstracción mínima**: `packages/ai/llm.ts` expone `complete()`, `stream()`, `batch()` y centraliza modelo, effort, caching y registro de costos. No construimos una capa "multi-proveedor" genérica en el MVP.

## Decisión: transcripción

Interfaz única en `packages/transcription`:

```ts
interface Transcriber {
  transcribe(input: { url: string } | { buffer: Buffer; mime: string }, opts: { language: 'es'; wordTimestamps: true }): Promise<Transcript>;
}
```

| Proveedor | Precio por minuto ⚠️ (verificar) | Pros | Contras |
|---|---|---|---|
| **Deepgram** (Nova, multilingüe) | ~USD 0,004–0,008 | Rápido, timestamps por palabra, buen español, acepta URL | Calidad variable con música fuerte ⚠️ |
| **OpenAI Whisper API / gpt-4o-transcribe** | ~USD 0,003–0,006 | Muy robusto en español y con ruido | Límite de 25 MB por archivo; otro proveedor más |
| **AssemblyAI** | ~USD 0,0025–0,0065 | Barato, diarización, acepta URL | Calidad en español a comparar |
| Whisper self-hosted (GPU) | Fijo de GPU | Costo marginal ~0 a escala | Operar GPU: no para el MVP |

**Decisión provisional:** arrancar con **Deepgram** como default y **Whisper API** como fallback, y confirmar en el Sprint 4 con un benchmark:

- [ ] 30 Reels reales (10 AR, 10 MX, 10 CO/CL/PE) con y sin música.
- [ ] Transcripción "de oro" manual de 10 de ellos.
- [ ] Medir WER, calidad de puntuación, timestamps, latencia y costo por minuto.
- [ ] Elegir el proveedor con el **menor costo que tenga WER ≤ 1,1× el mejor**.

Costo esperado: ~60–120 min/mes por cuenta × USD 0,005 ≈ **USD 0,3–0,6/mes** ⚠️, muy por debajo del tope de USD 3.

## Alternativas consideradas (LLM)

| Alternativa | Veredicto |
|---|---|
| OpenAI GPT como principal | Descartada: preferimos un solo proveedor con buen español, tool use robusto, prompt caching y SDK TS oficial; además, el equipo ya trabaja con Claude Code |
| Multi-proveedor con router (LiteLLM, etc.) | Descartada para el MVP: complejidad y menos aprovechamiento del caching. Se reevalúa si hay problemas de disponibilidad |
| Modelos open source self-hosted | Descartada: costo de operación y calidad inferior en tool use para un equipo de 1 |
| Solo Opus para todo | Descartada: 2× el costo de Sonnet sin necesidad para la mayoría de las tareas |

## Consecuencias

**Positivas**
- Calidad alta en español y en tool use, con costo controlado por modelo y effort.
- El caching del Perfil de Marca y de los tools abarata mucho el chat multi-turno.
- La interfaz de transcripción permite cambiar de proveedor sin tocar M6.

**Negativas / riesgos**
- Dependencia de Anthropic (disponibilidad, precios, cambios de API) → abstracción fina en `packages/ai`, evals para detectar regresiones al cambiar de versión de modelo.
- Los IDs y precios de modelos cambian → centralizar en `packages/ai/models.ts` y revisar cada trimestre.
- Rate limits por tier al escalar → limiter en BullMQ + Batches API + pedir aumento de tier a tiempo.
