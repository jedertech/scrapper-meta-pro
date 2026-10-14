# SPRINTS DE DESARROLLO: ENTERPRISE SCRAPER

## FASE ACTUAL: Fase 1 - Optimización de Memoria (DOM Pruning) — ✅ COMPLETADA
**Objetivo:** Evitar el colapso de RAM a los 1500 anuncios, implementando DOM Pruning manteniendo el proyecto estable, testeado y con logging claro.

**Estado:** Implementado en commit `319577b` (rama `ai-refactor`).

**Qué se hizo:**
1.  `src/dom-inspection.ts`: nueva función `pruneVisibleCards(page, ids)` que elimina del DOM vivo las tarjetas de anuncios ya extraídas. Un solo `page.evaluate()` por lote.
2.  `src/extractors.ts`: tras entregar cada lote fresco (`fresh.length > 0`), se purgan los nodos correspondientes. Envuelto en `try/catch`: si falla, solo se emite el diagnóstico `memory_prune_<kind>` y el scrape continúa.
3.  **Logging:** cada purga emite `[Memory] Purged N ad nodes;failed:M` en el canal de diagnósticos.
4.  **Por qué es seguro:** `querySelectorAll` devuelve snapshots estáticos; los labels de tarjetas borradas ya no matchean el regex del card, así que `paginationSnapshot()` sigue calculando correctamente el `lastBottom` y el botón "Ver más" sigue detectable. El scroll (`mouse.wheel`) no depende de la altura del contenido.
5.  **Tests:** 32 core + 39 http-scenarios + 17 stabilization + 7 otros = 95 pasando. Mock de `evaluate` actualizado en `http-scenarios.test.mjs` para la nueva llamada; dos tests nuevos de pruning en `core.test.mjs`.

**Validación manual sugerida:**
```bash
./meta-scraper session --url 'https://www.facebook.com/ads/library/?country=AR&q=zapatos' --limit 2000 --db pruebas-poda --visible
```
Observar la memoria del proceso Chromium (ej. `htop`): antes de la purga colapsaba hacia los 1500 ads; ahora debería mantenerse aplanada. Verificar `[Memory] Purged N ad nodes` en `data/diagnostics/`.

## FASE SIGUIENTE: Fase 2 - DB Batching
Pendiente: revisar `src/storage.ts` — `runJob`/`runSessionSlice` ya persisten por lote en transacciones SQLite. Evaluar si `seen`/`pending`/`receivedIds` en `extractors.ts` necesitan descargarse a SQLite para objetivos de 20k+ (hoja de ruta AGENTS.md §3).