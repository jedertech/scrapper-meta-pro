# Cómo trabajamos — Scrum adaptado a equipo chico + AI

> Equipo de 2 personas + Claude. Scrum "liviano": mantenemos lo que da foco y feedback (sprint goal, review con demo, retro) y recortamos la burocracia.
> Backlog: [backlog.md](backlog.md) · Sprints: [sprints/](sprints/) · Plantillas: [plantillas/](plantillas/) · Desarrollo con Claude: [../09-desarrollo-con-ia/guia-sergio-con-claude.md](../09-desarrollo-con-ia/guia-sergio-con-claude.md)

## 1. Roles

| Rol | Quién | Responsabilidades | Lo que NO hace |
|---|---|---|---|
| **Product Owner / Sponsor** | Dueño de Jedertech | Prioriza el backlog, define el "por qué", acepta o rechaza historias en la review, consigue agencias para entrevistas y piloto, decide precios | No decide el "cómo" técnico ni mete trabajo a mitad de sprint sin negociar |
| **Tech Lead + Scrum Master** | Sergio | Arquitectura, estimación, desglose técnico, código (con Claude), calidad y seguridad, facilita ceremonias, remueve bloqueos (incluye trámites Meta técnicos) | No acepta sus propias historias: las acepta el PO |
| **Pair programmer** | Claude (Claude Code + subagentes) | Escribe código y tests bajo instrucciones, propone planes, revisa PRs, redacta historias y notas, resume dailies y retros | No mergea a `main`, no maneja secretos, no decide alcance |
| **Usuarios piloto** | Equipo de la agencia de Jedertech | Usan el producto cada semana, reportan bugs y fricciones, participan de la review | — |

## 2. Cadencia: sprints de 2 semanas

Sprint = 10 días hábiles. Arranca lunes, termina viernes de la semana siguiente.

| Día | Ceremonia | Duración | Formato |
|---|---|---|---|
| Lunes semana 1 (mañana) | Sprint Planning | 60–90 min | Llamada PO + Sergio |
| Todos los días | Daily async | 5 min escribir | WhatsApp/Slack, antes de las 10:00 |
| Miércoles semana 1 | Refinamiento (backlog grooming) | 30 min | Sergio + Claude preparan, PO valida por mensaje o llamada corta |
| Viernes semana 2 (tarde) | Sprint Review con demo | 45 min | Llamada con PO + 1–2 personas de la agencia piloto |
| Viernes semana 2 (después de review) | Retro | 30 min | PO + Sergio |

### Sprint Planning (60–90 min)
1. PO presenta prioridades (top del backlog ya refinado, ver [backlog.md](backlog.md)).
2. Se acuerda el **sprint goal** en 1 frase (ya hay propuesta en cada [sprints/sprint-XX.md](sprints/)).
3. Sergio confirma capacidad: horas disponibles × velocidad histórica. Arranque supuesto: **35–45 story points/sprint** ⚠️ A validar después de S1 (1 dev con Claude Code; recalibrar con la velocidad real de S1–S2).
4. Se toman historias que cumplan la **Definition of Ready**. Lo que no cumple, vuelve a refinamiento.
5. Sergio (con Claude) desglosa cada historia en tareas técnicas → issues hijos en GitHub.

### Daily async
Antes de las 10:00 cada uno manda al canal `#jeder-daily` (o grupo de WhatsApp) la [plantilla de daily](plantillas/daily-async.md):

```
🗓️ Daily — [fecha]
✅ Ayer: JA-022 OAuth funcionando en local; PR #14 abierto
🎯 Hoy: JA-023 cifrado de tokens + tests
🚧 Bloqueos: falta que el PO agregue a 2 clientes como testers de la app Meta
📊 Sprint: 18/40 pts hechos · riesgo: medio
```

Regla: si hay un bloqueo, se resuelve en el día por llamada de 10 min, no se espera a la review.

### Refinamiento
- Sergio pide a Claude que redacte borradores de historias próximas con la [plantilla](plantillas/historia-de-usuario.md).
- PO valida "para qué" y prioridad; Sergio estima.
- Objetivo: siempre tener **1,5 sprints** de historias "Ready" en el tope del backlog.

### Sprint Review con demo (45 min)
1. Recordar sprint goal (2 min).
2. **Demo en el entorno de staging/producción, con datos reales del piloto** (no slides) (20 min).
3. PO acepta/rechaza cada historia contra sus criterios de aceptación (10 min).
4. Feedback del equipo de la agencia → nuevas historias o ajustes al backlog (10 min).
5. Métricas del sprint: puntos completados, costo por cuenta, bugs abiertos (3 min).
Plantilla: [plantillas/sprint-review.md](plantillas/sprint-review.md).

### Retro (30 min)
Formato rotativo (Start/Stop/Continue, 4L, Velero). Salida obligatoria: **máximo 2 acciones** con dueño y fecha, que entran al siguiente sprint como tareas. Plantilla: [plantillas/retro.md](plantillas/retro.md).

## 3. Herramientas

| Necesidad | Herramienta recomendada | Alternativa |
|---|---|---|
| Backlog, sprints, board | **GitHub Projects** (vista Board + vista Tabla por sprint) | Linear |
| Historias y tareas | **GitHub Issues** (plantillas de issue en `.github/ISSUE_TEMPLATE/`) | — |
| Código y revisiones | GitHub (PRs, branch protection en `main`) | — |
| CI/CD | GitHub Actions + Vercel previews + Railway/Fly.io | — |
| Comunicación | Slack (canales `#jeder-daily`, `#jeder-dev`, `#jeder-alertas`) o WhatsApp | — |
| Docs | Esta carpeta `AI-system-Jedertech/` + `docs/` del repo nuevo | Notion |
| Pair programming | Claude Code (terminal, web, app móvil) | — |

### Campos del GitHub Project
`Status` (Backlog · Ready · In progress · In review · Done) · `Sprint` (iteración de 2 semanas) · `Points` (número) · `Priority` (P0–P3) · `Epic` (selector) · `Module` (M1–M14, Transversal).

### Labels
| Grupo | Labels |
|---|---|
| Tipo | `type:story`, `type:task`, `type:bug`, `type:spike`, `type:chore` |
| Módulo | `mod:M1` … `mod:M14`, `mod:infra`, `mod:billing`, `mod:security`, `mod:meta-review`, `mod:observability`, `mod:commercial` |
| Prioridad | `P0` (bloquea), `P1` (must del sprint), `P2` (should), `P3` (could) |
| Estado especial | `blocked`, `needs-po`, `good-for-claude` (bien especificada, Claude la puede hacer casi sola), `security-review` |

### Ramas
- `main`: siempre desplegable. Protegida: requiere PR, CI verde y 1 aprobación (Sergio revisa lo que hizo Claude; si un PR lo escribió Sergio a mano, Claude hace review con el subagente `seguridad` o `qa-tests`).
- Ramas de trabajo: `tipo/JA-XXX-descripcion-corta` → `feat/JA-022-oauth-instagram`, `fix/JA-031-snapshot-timezone`, `chore/JA-016-ci-cache`.
- Vida corta: **máximo 3 días** por rama. Si una historia es más grande, se parte.
- Merge: **squash merge** con título en formato conventional commit.

### Pull Requests
Plantilla `.github/pull_request_template.md`:
```markdown
## Qué y por qué
Closes #<issue> (JA-XXX)

## Cómo probarlo
1. ...

## Checklist
- [ ] Tests agregados/actualizados y en verde
- [ ] Sin secretos ni datos de clientes en el diff
- [ ] Migraciones con RLS (si aplica)
- [ ] Screenshots / video corto (si hay UI)
- [ ] Docs actualizadas (si cambia comportamiento)
```

### Conventional commits
`tipo(alcance): descripción en imperativo` — tipos: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`, `ci`, `build`. Alcance = paquete o módulo.
```
feat(meta-graph): agrega cliente de Business Discovery con retries
fix(db): corrige policy RLS de snapshots_competidores
test(worker): cubre circuit breaker del scraper ante 429
```
`BREAKING CHANGE:` en el cuerpo cuando corresponda.

## 4. Estimación: story points (Fibonacci)

Escala: **1, 2, 3, 5, 8, 13**. Más de 8 = hay que partirla. 13 solo se permite para spikes con time-box.

| Pts | Referencia en este proyecto |
|---|---|
| 1 | Cambiar un texto, agregar un campo simple con su test |
| 2 | Cupón de Stripe, un endpoint CRUD trivial |
| 3 | Una pantalla simple con datos ya disponibles, un job BullMQ simple |
| 5 | Integración con una API externa conocida + UI + tests (ej. snapshots de Business Discovery) |
| 8 | OAuth con Meta completo, portar el scrapper al monorepo, orquestador del chat |
| 13 | Solo spikes con time-box (ej. "evaluar 3 proveedores de transcripción en 2 días") |

Cómo estimamos: Sergio estima solo (planning poker no tiene sentido con 1 dev), pero **le pide a Claude una segunda estimación** con justificación; si difieren en más de un escalón, se discute qué se está suponiendo. Con Claude Code la velocidad sube en código "de manual" (CRUD, UI, tests) y menos en integraciones con APIs externas y en temas de Meta: eso se refleja en los puntos.

## 5. Definition of Ready (DoR)

Una historia entra al sprint solo si:
- [ ] Tiene formato "Como… quiero… para…" y un ID `JA-XXX`.
- [ ] Criterios de aceptación verificables (Given/When/Then o checklist).
- [ ] Estimada (≤ 8 pts).
- [ ] Dependencias resueltas o planificadas dentro del mismo sprint (ej. permisos de Meta, cuenta en proveedor, API key).
- [ ] Diseño/UX suficiente (boceto, referencia o "usar componentes shadcn estándar").
- [ ] Impacto en datos identificado: ¿tabla nueva? ¿policy RLS? ¿PII?
- [ ] El PO la entiende y la priorizó.

## 6. Definition of Done (DoD)

Una historia está "Done" solo si:
- [ ] Cumple todos los criterios de aceptación y el PO la aceptó en la review (o por mensaje con video).
- [ ] Código mergeado a `main` vía PR con CI verde (typecheck, lint, tests, build).
- [ ] Tests: unitarios para lógica, de integración para endpoints/jobs, **test de aislamiento multi-tenant** si toca datos.
- [ ] Toda tabla nueva tiene `tenant_id` y policy RLS (ver [../04-arquitectura/modelo-de-datos.md](../04-arquitectura/modelo-de-datos.md)).
- [ ] Sin secretos en el código; variables nuevas agregadas a `.env.example` y al validador de env.
- [ ] Errores capturados en Sentry, eventos clave en PostHog (si es feature de usuario).
- [ ] Desplegado en producción (o detrás de feature flag) y probado ahí.
- [ ] Costo estimado por uso de LLM/transcripción anotado en el PR si la historia los consume.
- [ ] Docs actualizadas (README del paquete, `docs/` o este directorio) si cambia el comportamiento.

## 7. Cómo usar Claude en cada ceremonia

| Ceremonia | Cómo ayuda Claude | Prompt de ejemplo |
|---|---|---|
| Refinamiento | Redacta historias, criterios de aceptación y casos borde; detecta dependencias | "Leé `docs/backlog.md` y el PRD. Redactá JA-031 con la plantilla de historia, criterios Given/When/Then, casos borde de Business Discovery (cuenta privada, cuenta personal, rate limit) y una estimación justificada." |
| Planning | Desglosa historias en tareas técnicas y estima; arma los issues | "Usá plan mode. Para JA-022, proponé tareas de ≤ 4 h cada una, archivos a tocar, migraciones y tests. No escribas código todavía." |
| Daily | Resume lo hecho a partir de commits/PRs | "Resumí mis commits y PRs de ayer en el formato de `plantillas/daily-async.md`." |
| Durante el sprint | Implementa, testea, revisa (subagentes `backend`, `frontend`, `qa-tests`, `seguridad`) | Ver [guía](../09-desarrollo-con-ia/guia-sergio-con-claude.md) |
| Review | Prepara el guion de la demo y la lista de historias con su estado | "Con los issues cerrados del sprint 3, armá el guion de la demo de 20 min usando `plantillas/sprint-review.md`, ordenado por valor para la agencia." |
| Retro | Aporta datos objetivos: PRs que tardaron, bugs reabiertos, tiempo en review | "Analizá los PRs del sprint: tiempo hasta merge, cantidad de commits de fix, tests agregados. Proponé 3 observaciones para la retro." |

## 8. Reglas de convivencia
- Nada entra a mitad de sprint salvo **P0** (caída, fuga de datos, Meta bloqueó algo). Si entra algo, sale algo de igual tamaño.
- Bugs de producción del piloto: se reservan **~10% de la capacidad** de cada sprint.
- Toda decisión técnica relevante → ADR corto en `docs/adr/` del repo nuevo (Claude lo redacta, Sergio lo aprueba).
- Si una historia lleva el doble de lo estimado, se avisa en la daily y se decide con el PO: partir, simplificar o seguir.
