# SPRINTS DE DESARROLLO: ENTERPRISE SCRAPER

## FASE ACTUAL: Fase 2 - Optimización de Memoria (SQLite Batching & RAM)
**Objetivo:** El DOM Pruning ya funciona (validado a 1800+ ads). Ahora debemos optimizar las estructuras de datos en RAM (`src/storage.ts` y el Runner) para que Node.js no acumule miles de objetos antes de guardarlos.

**Acciones para el Agente (Fase 2):**
1.  **Investigar:** Analiza `src/storage.ts`, los arrays temporales (`pending`, `seen` o similares) y cómo se realiza el guardado en SQLite.
2.  **Desarrollar Batching:** Implementa un sistema donde los anuncios extraídos se guarden en SQLite en lotes constantes (ej. cada 50 o 100 anuncios) usando transacciones (`BEGIN TRANSACTION`). Inmediatamente después de confirmar el guardado, los arrays de acumulación en RAM **deben vaciarse** para liberar memoria.
3.  **Integridad (Deduplicación):** Asegura que al vaciar los arrays temporales en RAM, la deduplicación no se rompa (el scraper debe seguir verificando contra SQLite si un anuncio ya fue visto, en lugar de depender solo de la RAM).
4.  **Logging:** Agrega logs estructurados del tipo `[Storage] Flushed 100 ads to DB. RAM cleared.`
5.  **Testing & Commit:** Ejecuta los tests unitarios. Si todo pasa, haz el commit atómico y pide Checkpoint.

**ESTADO FASE 2: COMPLETA**
- `Storage.hasAd`/`Storage.filterNewAds`: deduplicación respaldada por SQLite.
- Runners (`runner.ts`, `session-runner.ts`): batching constante de 100 anuncios por transacción (`FLUSH_BATCH_SIZE`); el buffer se vacía tras cada `persistBatch` y los anuncios pendientes se confirman también en el camino de error.
- Extractor: `pending`, `seen` y `receivedIds` se vacían después de cada lote confirmado (`flushMemory`); la dedup cruzada pasa por SQLite vía `filterNewAds` inyectado desde la CLI.
- Logs estructurados `[Storage] Flushed N ads to DB. RAM cleared; pending:M` en el flujo de diagnósticos.
- Tests: 3 nuevos en `tests/core.test.mjs` (filterNewAds/hasAd, trozos ≤100 sin pérdida, confirmación tras interrupción). Suite completa: 98/98 offline. Benchmark local 20.000 ads: 130 MB RSS, integridad OK.
- Nota: `npm run test:browser-local` ya fallaba en esta máquina antes de la Fase 2 (problema de entorno WSL, no regresión).

**CRÍTICO**
1. IDIOMA: SIEMPRE comunícate conmigo y escribe tus planes en tu salida de terminal en ESPAÑOL.
2. LOCALIZACIÓN: NO salgas de la carpeta del proyecto ("/proyectos/scrapper-meta-pro").