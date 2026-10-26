# Plantilla — Historia de usuario

> Copiar como cuerpo de un GitHub Issue (o como `.github/ISSUE_TEMPLATE/historia.md`). Debe cumplir la Definition of Ready de [../como-trabajamos.md](../como-trabajamos.md#5-definition-of-ready-dor) antes de entrar a un sprint.

````markdown
---
name: Historia de usuario
about: Nueva historia para el backlog de Jeder AI
title: "JA-XXX · <título corto en verbo>"
labels: ["type:story"]
---

## Historia
**Como** <rol: dueño de agencia | usuario de agencia | cliente final | PO | Tech Lead>,
**quiero** <capacidad concreta>,
**para** <beneficio / resultado de negocio>.

## Contexto
- Módulo: M<n> <nombre canónico> · Épica: EP-<...>
- Por qué ahora: <dato de entrevista, feedback del piloto, dependencia>
- Links: <PRD / modulos.md / diseño / issue relacionado>

## Criterios de aceptación
### Escenario 1: <caso feliz>
- **Given** <estado inicial>
- **When** <acción>
- **Then** <resultado observable>

### Escenario 2: <caso borde / error>
- **Given** ...
- **When** ...
- **Then** ...

### Checklist adicional
- [ ] <requisito no funcional: performance, mobile, accesibilidad>
- [ ] Eventos de analytics: `<evento>`

## Datos y seguridad
- [ ] ¿Tablas nuevas? <cuáles> → con `tenant_id` + RLS
- [ ] ¿Toca tokens de Meta, PII o datos de compradores? <sí/no, cómo se protegen>
- [ ] ¿Consume LLM/transcripción? Costo estimado por uso: USD <x> ⚠️

## Fuera de alcance
- <lo que explícitamente NO incluye esta historia>

## Estimación
- Story points: <1|2|3|5|8>
- Estimación de Claude: <pts + justificación en 1 línea>
- Prioridad: <P1|P2|P3> · Sprint: <S#>

## Notas técnicas (las completa Sergio en el planning)
- Archivos/paquetes: <apps/web/..., packages/db/...>
- Tareas:
  - [ ] ...
  - [ ] Tests: <unit / integración / cross-tenant>
````

## Ejemplo completo

````markdown
## Historia
**Como** usuario de agencia, **quiero** agregar competidores escribiendo su @ de Instagram
**para** monitorearlos sin herramientas externas.

## Contexto
- Módulo: M4 Radar de Competencia · Épica: EP-M4
- Por qué ahora: 8/10 agencias entrevistadas hacen este seguimiento a mano en planillas ⚠️ (dato de ejemplo)

## Criterios de aceptación
### Escenario 1: cuenta profesional pública
- **Given** una cuenta cliente con IG conectado
- **When** escribo "@competidor" y confirmo
- **Then** veo foto, nombre, seguidores y cantidad de posts, y queda en la lista de competidores

### Escenario 2: cuenta personal o privada
- **Given** una cuenta cliente con IG conectado
- **When** escribo el @ de una cuenta personal
- **Then** veo "Esta cuenta no es profesional/pública; no podemos analizarla" y no se guarda

### Checklist adicional
- [ ] Límite de 10 competidores por cuenta cliente (configurable)
- [ ] Evento `competitor_added`

## Datos y seguridad
- [ ] Tabla `competitors` con `tenant_id` + RLS
- [ ] Usa token de la cuenta del cliente, nunca del scraper

## Estimación
- Story points: 5 · Prioridad: P1 · Sprint: S3
````
