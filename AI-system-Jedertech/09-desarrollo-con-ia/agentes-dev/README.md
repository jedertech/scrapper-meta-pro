# Subagentes de desarrollo para Claude Code

> Definiciones listas para copiar a `.claude/agents/` del repo nuevo `jedertech-ai-platform`. Son los "multiagentes" **de desarrollo** (ayudan a Sergio a construir). No confundir con los agentes **del producto** (Orquestador, Guionista, Coach…), que están en [../../05-agentes-ai/arquitectura-multiagente.md](../../05-agentes-ai/arquitectura-multiagente.md).
> Guía general: [../guia-sergio-con-claude.md](../guia-sergio-con-claude.md).

## Qué hay

| Archivo | Nombre | Modelo | Herramientas | Edita código | Cuándo usarlo |
|---|---|---|---|---|---|
| [arquitecto.md](arquitecto.md) | `arquitecto` | opus | lectura + web | No | Antes de historias de 5–8 pts, módulos nuevos, esquema, integraciones, ADRs |
| [backend.md](backend.md) | `backend` | sonnet | lectura + edición + bash | Sí | Server actions, API, jobs BullMQ, Drizzle/RLS, Meta Graph, Stripe |
| [frontend.md](frontend.md) | `frontend` | sonnet | lectura + edición + bash | Sí | Pantallas, componentes shadcn, chat, dashboards, marca blanca |
| [scraping.md](scraping.md) | `scraping` | sonnet | lectura + edición + bash | Sí | Port y operación del scraper de la Biblioteca de Anuncios (M5) |
| [qa-tests.md](qa-tests.md) | `qa-tests` | sonnet | lectura + edición + bash | Solo tests | Tests desde criterios, casos borde, matriz cross-tenant, fixtures |
| [seguridad.md](seguridad.md) | `seguridad` | opus | solo lectura + bash | No | Revisión antes de PRs sensibles (auth, datos, tokens, webhooks, LLM) |
| [ai-prompts.md](ai-prompts.md) | `ai-prompts` | opus | lectura + edición + bash | Sí (prompts/evals) | Prompts de agentes del producto, tools, evals, costos LLM |

> `model` es opcional: si se omite, el subagente usa el modelo de la sesión. Con presupuesto ajustado, cambiar `opus` por `sonnet` o `inherit`. ⚠️ Verificar en la doc vigente de Claude Code los valores aceptados en `model` y `tools`.

## Instalación

```bash
# desde la raíz de jedertech-ai-platform
mkdir -p .claude/agents
cp <ruta>/scrapper-meta-pro/AI-system-Jedertech/09-desarrollo-con-ia/agentes-dev/{arquitecto,backend,frontend,scraping,qa-tests,seguridad,ai-prompts}.md .claude/agents/
git add .claude/agents && git commit -m "chore(claude): agrega subagentes de desarrollo"
```

Verificar dentro de Claude Code con `/agents` (lista, permite editar y crear). Los archivos del proyecto (`.claude/agents/`) se comparten por git; los personales van en `~/.claude/agents/`.

Formato de cada archivo: frontmatter YAML (`name`, `description`, `tools`, `model` opcional) + system prompt en Markdown. La `description` es lo que Claude usa para decidir cuándo delegar automáticamente: mantenela concreta.

## Cómo invocarlos

- **Explícito (recomendado al principio):** "Usá el subagente `backend` para implementar JA-031".
- **Automático:** Claude delega cuando la tarea coincide con la `description`.
- Cada subagente trabaja con **su propio contexto**: pasale la historia, los archivos relevantes y el objetivo; no asume lo que charlaste en la conversación principal.

## Combinaciones típicas (flujos de "multiagentes")

### 1. Historia grande (5–8 pts), secuencial
```text
arquitecto (plan + ADR) → [Sergio aprueba] → backend ∥ frontend → qa-tests → seguridad → PR
```
Prompt:
```text
Para JA-045: 1) subagente arquitecto: plan y contratos (tipos de tools, tablas). Esperá mi OK.
2) Después, en paralelo: backend implementa orquestador y tools; frontend implementa la UI del chat
con datos mock con el mismo contrato. 3) Integrá. 4) qa-tests completa casos borde y cross-tenant.
5) seguridad revisa el diff completo. Reportá cada paso.
```

### 2. Carriles en paralelo en el mismo sprint (ej. S3: M4 y M5)
Dos sesiones de Claude Code en **worktrees distintos**:
```bash
git worktree add ../jeder-m4 -b feat/JA-030-radar
git worktree add ../jeder-m5 -b feat/JA-034-port-scraper
# terminal 1: cd ../jeder-m4 && claude   → backend + frontend (M4)
# terminal 2: cd ../jeder-m5 && claude   → scraping (M5)
```
Regla: cada carril toca paquetes distintos; las migraciones se coordinan (una rama mergea primero, la otra rebasea y regenera).

### 3. Revisión cruzada antes del PR
```text
Subagente qa-tests: ¿qué criterios de JA-022 no tienen test? Agregalos.
Después subagente seguridad: revisá el diff de la rama contra main con foco en OAuth y tokens.
```

### 4. Cambio de prompt del producto
```text
ai-prompts (cambia prompt + corre evals) → qa-tests (agrega caso de regresión) → seguridad (prompt injection)
```

### 5. "Se rompió el scraper"
```text
scraping (diagnóstico con fixtures + fix) → qa-tests (test que reproduce el cambio de Meta) → PR urgente
```

## Buenas prácticas
- Un subagente = un rol. Si un prompt empieza a cubrir todo, partilo.
- Los revisores (`seguridad`, `arquitecto`) **no editan**: así su opinión es independiente del código.
- Después de cada retro, si un problema se repitió, agregá una regla al subagente correspondiente o a `CLAUDE.md`.
- Mantené estos archivos en sync: la versión de verdad vive en el repo nuevo; esta carpeta es la versión inicial.
