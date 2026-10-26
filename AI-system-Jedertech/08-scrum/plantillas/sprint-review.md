# Plantilla — Sprint Review con demo (45 min)

> Viernes de cierre. Participan PO, Sergio y 1–2 personas del equipo de la agencia piloto. **Demo sobre producción o staging con datos reales del piloto, no slides.** Ver [../como-trabajamos.md](../como-trabajamos.md).

```markdown
# Sprint Review — Sprint <N> — <fecha>

**Asistentes:** <nombres>
**Sprint goal:** <copiar del sprint-XX.md>
**¿Se cumplió el goal?** Sí / Parcial / No — <1 frase>

## 1. Guion de la demo (20 min)
| # | Qué mostramos | Historia | Quién | Minutos | Datos usados |
|---|---|---|---|---|---|
| 1 | <flujo de usuario, de punta a punta> | JA-XXX | Sergio | 5 | Cuenta piloto <X> |
| 2 | | | | | |

Preparación (checklist, el día anterior):
- [ ] Deploy de lo que se va a mostrar ya en staging/prod
- [ ] Cuenta y datos de demo listos (sin datos sensibles de otros clientes en pantalla)
- [ ] Plan B si falla algo en vivo (video grabado de 1 min)

## 2. Aceptación de historias (10 min)
| ID | Historia | Pts | Estado | Decisión del PO | Comentario |
|---|---|---|---|---|---|
| JA-XXX | | | Done / No terminada | ✅ Aceptada / ❌ Rechazada / 🔁 Aceptada con ajustes | |

Historias no terminadas → vuelven al backlog con estimación revisada.

## 3. Feedback del piloto (10 min)
| Feedback | Quién | Tipo (bug / mejora / idea) | Acción | Issue |
|---|---|---|---|---|
| | | | | |

Preguntas para el equipo de la agencia:
- ¿Qué de lo que vieron usarían la semana que viene? ¿Con qué cliente?
- ¿Qué tarea manual de hoy reemplaza (y cuánto tiempo ahorra)?
- ¿Qué les falta para mostrárselo a un cliente?

## 4. Métricas del sprint (3 min)
| Métrica | Este sprint | Anterior | Objetivo |
|---|---|---|---|
| Puntos terminados | | | 35–45 ⚠️ |
| Cuentas piloto activas | | | 5 |
| Costo variable por cuenta (USD/mes) | | | ≤ 25 |
| Bugs abiertos (P0/P1) | | | 0 |
| Estado Meta (Verification / App Review) | | | |
| MRR (desde S6) | | | |

## 5. Próximos pasos (2 min)
- Sprint goal propuesto para el próximo sprint: <...>
- Decisiones que necesita tomar el PO: <...>
```

## Prompt para preparar la review
```text
Leé AI-system-Jedertech/08-scrum/sprints/sprint-0<N>.md y los issues cerrados del sprint en GitHub.
Completá la plantilla de sprint review: guion de demo de 20 min ordenado por valor para la agencia
(empezando por el flujo que más tiempo ahorra), tabla de historias con estado y una lista de 3
preguntas específicas para el equipo piloto sobre lo entregado.
```
