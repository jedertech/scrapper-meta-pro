# Plantilla — Daily async (WhatsApp / Slack)

> Cada uno la manda **antes de las 10:00** en `#jeder-daily` (o el grupo de WhatsApp). Tiempo para escribirla: 5 min. Si hay un bloqueo, se resuelve ese día con una llamada de 10 min. Ver [../como-trabajamos.md](../como-trabajamos.md).

## Versión Sergio (desarrollo)
```text
🗓️ Daily — <dd/mm> · Sprint <N> (día <x>/10)
✅ Ayer: <JA-XXX: qué quedó hecho — PR #nn abierto/mergeado>
🎯 Hoy: <JA-XXX: qué voy a cerrar>
🚧 Bloqueos: <ninguno | qué necesito y de quién>
📊 Sprint: <puntos hechos>/<comprometidos> pts · riesgo: bajo/medio/alto
🤖 Claude: <opcional: algo que salió muy bien o mal trabajando con Claude>
```

## Versión PO (comercial / Meta / piloto)
```text
🗓️ Daily — <dd/mm>
✅ Ayer: <entrevistas hechas, agencias contactadas, trámites Meta>
🎯 Hoy: <qué voy a hacer>
🚧 Bloqueos / decisiones pendientes: <...>
📣 Feedback del piloto: <opcional: algo que dijo el equipo de la agencia>
```

## Ejemplos
```text
🗓️ Daily — 18/11 · Sprint 1 (día 3/10)
✅ Ayer: JA-012 esquema multi-tenant mergeado (PR #7); seed con 2 tenants
🎯 Hoy: JA-013 policies RLS + test de aislamiento
🚧 Bloqueos: ninguno
📊 Sprint: 13/42 pts · riesgo: bajo
🤖 Claude: el subagente qa-tests encontró una tabla sin RLS en el seed 👌
```
```text
🗓️ Daily — 05/11
✅ Ayer: 3 entrevistas (2 AR, 1 MX). Las 3 pagan hoy herramientas sueltas por ~USD 200/mes ⚠️
🎯 Hoy: 2 entrevistas + juntar documentos para Business Verification
🚧 Bloqueos: falta el comprobante de domicilio de la empresa
```

## Reglas
- Ser concreto: IDs de historia y links a PRs, no "estuve con cosas del backend".
- Bloqueo = algo que **no podés resolver solo hoy**. Etiquetar a quien lo destraba.
- Si no hubo avance, decirlo y por qué. No pasa nada.
- Los viernes de cierre de sprint no hay daily: hay review.

## Prompt para generar la daily con Claude
```text
Resumí mi actividad de ayer en jedertech-ai-platform (commits, PRs abiertos/mergeados, issues movidos)
usando git log y gh, en el formato de la plantilla de daily de Sergio. Calculá puntos hechos del sprint
actual sumando el campo Points de los issues cerrados en la iteración actual.
```
