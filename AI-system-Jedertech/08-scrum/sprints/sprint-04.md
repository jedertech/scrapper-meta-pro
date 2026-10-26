# Sprint 4 — M6 Análisis de Video + M1 Chat Guía (semanas 9–10)

> Backlog: [../backlog.md](../backlog.md) · Agentes del producto: [../../05-agentes-ai/arquitectura-multiagente.md](../../05-agentes-ai/arquitectura-multiagente.md) · Flujo guiado: [../../02-producto/flujo-guiado-simple.md](../../02-producto/flujo-guiado-simple.md)

## Sprint goal
**"El usuario le pregunta al chat guía por su contenido y su competencia y obtiene respuestas con datos reales, y puede analizar cualquier reel (propio o de un competidor) en hook, ángulo, estructura y CTA."**

## Historias incluidas (43 pts)
| ID | Historia | Pts |
|---|---|---|
| JA-039 | Descarga de videos a storage con TTL | 5 |
| JA-040 | Transcripción en español (benchmark + integración) | 5 |
| JA-041 | Análisis LLM de video | 5 |
| JA-042 | UI Análisis de Video | 5 |
| JA-043 | Paquete `ai` | 5 |
| JA-044 | Chat guía con streaming e historial | 5 |
| JA-045 | Orquestador con delegación a agentes | 8 |
| JA-046 | Perfil de Marca construido por chat | 5 |

> ⚠️ Sprint con posibles feriados de fin de año: confirmar capacidad real en el planning. Si hay menos días, mover JA-042 (comparación lado a lado) y parte de JA-046 a S5.

## Tareas técnicas paso a paso
1. **Paquete `ai` primero (JA-043)** — lo usan todas las demás historias
   - [ ] `packages/ai`: wrapper del Anthropic SDK con `complete()`, `stream()`, `structured<T>(schema)` (salida validada con zod).
   - [ ] Routing de modelos por tarea: `claude-sonnet-5-5` (default), `claude-haiku-5-5` (clasificación/extracción barata), `claude-opus-5-5` (análisis complejo puntual).
   - [ ] Prompt caching en system prompt + Perfil de Marca.
   - [ ] Tabla `ai_usage` (tenant_id, client_account_id, feature, model, input/output/cache tokens, costo estimado).
   - [ ] Prompts en `packages/ai/prompts/*.md` versionados.
2. **Video (JA-039, JA-040)**
   - [ ] Storage R2 o Supabase Storage ⚠️ decidir (ADR); path `tenant/{tenantId}/videos/{mediaId}.mp4`; lifecycle TTL 30 días ⚠️.
   - [ ] Job `video-download` con validación de URL (anti-SSRF: solo hosts de CDN de Meta), límite de tamaño/duración.
   - [ ] Spike de benchmark (máx. 1 día): 10 videos del piloto en Whisper API, Deepgram y AssemblyAI → tabla costo/minuto, calidad percibida, latencia ⚠️ → ADR.
   - [ ] Interfaz `Transcriber` + implementación elegida; job `video-transcribe` con segmentos y timestamps.
3. **Análisis (JA-041)**
   - [ ] Prompt "Analista de Contenido" con esquema JSON (hook, tipo de hook, ángulo, promesa, bloques con timestamps, CTA, score + justificación).
   - [ ] Job `video-analyze`; guarda resultado y uso de tokens.
4. **UI de video (JA-042)**
   - [ ] `/c/[id]/videos/[videoId]`: player, transcripción clickeable, bloques coloreados, estados de procesamiento con polling o realtime.
   - [ ] Botón "Analizar" desde detalle de post (M3) y desde Radar (M4).
5. **Chat (JA-044, JA-045)**
   - [ ] Tablas `conversations`, `messages` (RLS); route handler con streaming (SSE/AI SDK ⚠️ elegir).
   - [ ] Orquestador con tools: `consultar_mi_contenido`, `consultar_competencia`, `consultar_anuncios`, `analizar_video`, `leer_perfil_marca`.
   - [ ] **Regla de seguridad:** `tenantId`/`clientAccountId` se inyectan desde la sesión, nunca desde argumentos del modelo.
   - [ ] Datos de competidores/anuncios marcados como "contenido no confiable" en el prompt (defensa ante prompt injection).
   - [ ] Límite de turnos y tokens por conversación; registro en `ai_usage`.
6. **Perfil de Marca (JA-046)**
   - [ ] Tabla `brand_profiles` versionada; formulario editable.
   - [ ] Flujo conversacional: la AI pregunta de a un campo, propone borrador, pide confirmación, guarda con tool `guardar_perfil_marca`.

## Entregable / demo
1. Analizar un reel propio y uno de un competidor y compararlos.
2. En el chat: "¿Qué reel de mis competidores funcionó mejor esta semana y por qué?" → respuesta con datos y link al análisis.
3. Cuenta nueva: la AI arma el Perfil de Marca en 5 minutos de conversación.
4. Panel de costos: cuánto costó cada análisis.

## Riesgos
| Riesgo | Mitigación |
|---|---|
| `media_url` de competidores no disponible o expira | Descargar apenas se detecta el post; manejar error "no disponible" |
| Costo de transcripción + LLM | Caché por media_id (JA-047 en S5), Haiku para pasos baratos, límite de duración |
| El orquestador alucina datos | Tools obligatorias para datos; instrucciones de citar fuente; evals en S7 |
| Prompt injection desde captions de competidores | Separar datos de instrucciones; nunca ejecutar acciones destructivas desde el chat |

## Definición de "terminado" del sprint
- [ ] 20 videos del piloto analizados en producción.
- [ ] Costo medio por video analizado registrado y comparado con el objetivo ⚠️.
- [ ] Tests: tools del orquestador filtran por tenant (test con dos tenants).
- [ ] ADRs: proveedor de transcripción y storage de videos.

## Prompts sugeridos para Claude Code
```text
Usá el subagente ai-prompts. Leé AI-system-Jedertech/05-agentes-ai/arquitectura-multiagente.md.
Diseñá packages/ai: wrapper del Anthropic SDK con routing de modelos (claude-sonnet-5-5 default,
claude-haiku-5-5 barato, claude-opus-5-5 puntual), prompt caching del system prompt y del Perfil de
Marca, salida estructurada validada con zod y registro de uso/costo por tenant. Plan primero.
```
```text
Escribí un script de benchmark en scripts/bench-transcription.ts que transcriba los 10 videos de
./bench-videos con Whisper API, Deepgram y AssemblyAI (claves por env), guarde los textos y una
tabla con duración, costo estimado por minuto y latencia. No subas los videos ni las claves al repo.
```
```text
Usá el subagente backend: implementá el orquestador del chat (JA-045) con las tools listadas en el
backlog. tenantId y clientAccountId salen SIEMPRE de la sesión del servidor, nunca de los argumentos
de la tool. Agregá tests con dos tenants que prueben que una tool no puede leer datos del otro.
```
```text
Usá el subagente seguridad: revisá el chat por prompt injection (captions y textos de anuncios de
competidores son input no confiable), exposición de datos cross-tenant y SSRF en la descarga de videos.
```
