# Sprint 7 — Hardening + agencias Founders + beta paga (Etapa 2, semanas 15–16)

> Backlog: [../backlog.md](../backlog.md) · Etapa 2: [../../07-roadmap/etapas.md](../../07-roadmap/etapas.md#etapa-2--lanzamiento-marca-blanca--primeras-ventas-sprint-67-semanas-1316) · Comercial: [../../01-comercial/](../../01-comercial/)

## Sprint goal
**"5 agencias Founders pagan y operan con sus clientes sobre una plataforma revisada en seguridad, monitoreada y con backups probados."**

Cierra la **Etapa 2**: meta 5 agencias pagas (~USD 2,5–5k MRR) ⚠️.

## Historias incluidas (42 pts; 36 sin stretch)
| ID | Historia | Pts |
|---|---|---|
| JA-067 | Revisión de seguridad pre-lanzamiento | 5 |
| JA-068 | Alertas operativas | 3 |
| JA-069 | Métricas de producto | 3 |
| JA-070 | Backups, restore probado y runbook | 3 |
| JA-071 | Legal final + DPA para agencias | 3 |
| JA-072 | Performance de dashboards | 3 |
| JA-073 | Evals de prompts de agentes | 5 |
| JA-074 | Onboarding de agencias Founders | 5 |
| JA-075 | Página de precios + demo + caso piloto | 3 |
| JA-078 | Responder App Review / Advanced Access | 3 |
| JA-076 | Watchlist de anunciantes (stretch) | 3 |
| JA-077 | Adaptador a proveedor de respaldo (stretch) | 3 |

## Tareas técnicas paso a paso
1. **Seguridad (JA-067)**
   - [ ] Correr `/security-review` y el subagente `seguridad` sobre todo el repo; issues por hallazgo con severidad.
   - [ ] Test cross-tenant automático para cada route handler/server action (matriz endpoint × tenant).
   - [ ] Headers (CSP, HSTS, X-Frame-Options), rate limit por usuario/IP en API y chat (Upstash/Redis).
   - [ ] Revisión de prompt injection en chat, Guionista y Coach.
   - [ ] `pnpm audit` sin críticas; Dependabot activado.
2. **Operación (JA-068, JA-070)**
   - [ ] Alertas a `#jeder-alertas`: error rate de jobs, circuit breaker del scraper, tokens por vencer, costo diario anómalo, heartbeat del worker.
   - [ ] Backups: confirmar política de Supabase ⚠️; restore de prod a staging probado y cronometrado.
   - [ ] Runbook en `docs/runbook.md`: caída de worker, bloqueo del scraper, expiración masiva de tokens, sospecha de fuga de datos (pasos + comunicación).
3. **Producto (JA-069, JA-072, JA-073)**
   - [ ] Dashboard PostHog: embudo de onboarding, WAU por tenant, uso por módulo.
   - [ ] p95 < 2 s en M3/M4/M11: `EXPLAIN ANALYZE`, índices, caché.
   - [ ] `packages/ai/evals`: 20+ casos y script `pnpm evals`; correr antes de cambiar prompts.
4. **Meta (JA-078)**
   - [ ] Responder observaciones del App Review en ≤3 días hábiles; reenviar.
   - [ ] Si aprobado: probar conexión con una cuenta que no es tester. Si no: plan B documentado.
5. **Comercial (JA-074, JA-075) — PO lidera, Sergio da soporte técnico**
   - [ ] Página de precios (planes de agencia + Founders) y demo de 3–5 min.
   - [ ] Caso del piloto con métricas antes/después (horas ahorradas, guiones usados, crecimiento) ⚠️ solo datos reales.
   - [ ] Contactar waitlist + entrevistados con interés; agendar demos.
   - [ ] Playbook de onboarding (llamada 45 min + checklist + material de reventa) y ejecutarlo con cada agencia.
6. **Stretch (JA-076, JA-077)** solo si lo anterior está terminado.

## Entregable / demo
1. Dashboard de MRR (Stripe) y de agencias activas.
2. Informe de seguridad con hallazgos cerrados.
3. Restore probado (tiempo medido).
4. Una agencia Founders mostrando su panel con su marca.

**Revisión de Etapa 2**: checklist de criterios de salida + retro de las 16 semanas + planning de Etapa 3 (M12).

## Riesgos
| Riesgo | Mitigación |
|---|---|
| No se llega a 5 agencias pagas | Empezar preventa en S4–S5; usar el caso piloto; seguir vendiendo en Etapa 3 |
| App Review sigue pendiente | Plan B con testers; priorizar módulos que no dependen de permisos del cliente (M4/M5/M6/M8) en la venta |
| Hallazgos críticos de seguridad | Bloquean el onboarding de nuevas agencias hasta resolverse |
| Soporte consume todo el tiempo de Sergio | Reservar 20% de capacidad para soporte; FAQ y videos cortos |

## Definición de "terminado" del sprint
- [ ] 5 agencias pagas (o desvío explicado con plan).
- [ ] 0 hallazgos críticos/altos abiertos.
- [ ] Alertas y backups funcionando y probados.
- [ ] Evals corriendo en CI para cambios de prompts.

## Prompts sugeridos para Claude Code
```text
/security-review sobre la rama actual. Después usá el subagente seguridad para una revisión completa
del repo: RLS tabla por tabla, endpoints sin chequeo de tenant, manejo de tokens de Meta, webhooks,
SSRF en descargas, prompt injection en el chat. Devolvé tabla de hallazgos con severidad y archivo.
```
```text
Usá el subagente qa-tests: generá una matriz de tests cross-tenant que recorra todas las route handlers
y server actions de apps/web y verifique que un usuario del tenant A recibe 403/404 al pedir recursos
del tenant B. Que el test falle si aparece un endpoint nuevo sin cubrir.
```
```text
Usá el subagente ai-prompts: armá packages/ai/evals con 20 casos (orquestador, analista de video,
guionista, coach) a partir de conversaciones reales anonimizadas del piloto, con criterios de
evaluación y un script pnpm evals que reporte puntaje por agente.
```
```text
Redactá un runbook de incidentes en docs/runbook.md para: worker caído, scraper bloqueado por Meta,
expiración masiva de tokens, sospecha de fuga de datos entre tenants. Pasos, comandos, a quién avisar.
```
