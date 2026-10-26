# Plantilla — Retrospectiva (30 min)

> Se hace el viernes de cierre, después de la review. Participan PO y Sergio. Salida obligatoria: **máximo 2 acciones** con dueño y fecha. Ver [../como-trabajamos.md](../como-trabajamos.md).

```markdown
# Retro Sprint <N> — <fecha>

**Sprint goal:** <copiar>  ·  **¿Se cumplió?** Sí / Parcial / No
**Puntos:** comprometidos <x> · terminados <y> · velocidad promedio últimos 3 sprints <z>

## 0. Revisión de acciones de la retro anterior (3 min)
| Acción | Dueño | ¿Se hizo? | Efecto |
|---|---|---|---|
| | | | |

## 1. Datos (5 min) — los prepara Claude a partir de GitHub
- PRs mergeados: <n> · tiempo medio hasta merge: <h>
- Bugs encontrados por el piloto: <n> · reabiertos: <n>
- Historias que se pasaron de estimación (>2×): <IDs>
- Costo AI del sprint (desarrollo + producto): USD <x> ⚠️
- Bloqueos externos (Meta, legal, proveedores): <lista>

## 2. Dinámica (15 min) — elegir UNA por sprint, rotando

### Opción A — Start / Stop / Continue
| Empezar a… | Dejar de… | Seguir… |
|---|---|---|
| | | |

### Opción B — 4L
| Liked (gustó) | Learned (aprendimos) | Lacked (faltó) | Longed for (deseamos) |
|---|---|---|---|
| | | | |

### Opción C — Velero
- 🌬️ Viento (nos impulsó):
- ⚓ Anclas (nos frenó):
- 🪨 Rocas (riesgos que vienen):
- 🏝️ Isla (a dónde vamos):

### Preguntas específicas de trabajo con Claude
- ¿Dónde Claude ahorró más tiempo este sprint?
- ¿Dónde generó retrabajo (código que hubo que tirar, tests débiles)?
- ¿Qué tendríamos que agregar a `CLAUDE.md` o a un subagente para que no vuelva a pasar?

## 3. Acciones (7 min) — máximo 2
| # | Acción concreta | Dueño | Fecha | Cómo sabremos que funcionó |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |

> Las acciones entran como issues `type:chore` en el próximo sprint.
```

## Prompt para preparar la sección de datos
```text
Con gh, listá los PRs mergeados y los issues cerrados entre <fecha inicio> y <fecha fin> en
jedertech-ai-platform. Calculá: cantidad de PRs, tiempo medio hasta merge, issues type:bug abiertos y
cerrados, historias cuyo tiempo real superó 2x la estimación (según labels/fechas). Devolvé la sección
"1. Datos" de la plantilla de retro con 3 observaciones para discutir.
```
