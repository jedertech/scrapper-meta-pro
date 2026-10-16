# Fases — Resumen técnico

## Fase 4 — Diagnóstico forense de duplicados y pacing humano (2026-10-15)

### Objetivo
Investigar por qué seguían apareciendo duplicados en los logs a pesar del filtro de esqueletos (Fase 3), y asegurar que el bot no actúe a una velocidad robótica que alerte a Meta.

### Diagnóstico (no se adivinó la causa)
Se añadió un evento forense en `src/extractors.ts` (`diagnoseDuplicate`) que registra, por anuncio rechazado, **exactamente por qué** fue rechazado:
- `reason=seen_in_memory`: el ID ya estaba en el Set `seen` de la memoria de la sessión.
- `reason=seen_in_sqlite`: el ID no estaba en `seen` pero `filterNewAds` (SQLite) lo devolvió vacío, porque ya estaba persistido.

El evento se emite como `event('dom','document',url,'document',200, '[DUP] id=… reason=… seen_size=… has_filterNewAds=…')` y se samplea a uno por ciclo para no saturar el log.

### Auditoría del Set `seen`
Se verificó que `seen` sobrevive intacto a los flushes de memoria. La función `flushMemory()` solo borra IDs que `filterNewAds` confirma como ya persistidos en SQLite; los IDs aún no confirmados permanecen en `seen`. Por tanto, el Set no se resetea por error: la única fuente de duplicados era la capa de SQLite, no una limpieza prematura de memoria.

### Pacing humano (anti-detección de velocidad)
Se añadieron pausas naturales con jitter aleatorio en `src/extractors.ts`:
- `humanPause(SCROLL_PAUSE_MS=1500)` tras cada `page.mouse.wheel(0,1600)` (entre tramos de scroll).
- `humanPause(PAGINATION_PAUSE_MS=2000)` tras cada clic exitoso en "Ver más".
- `diagSampledThisCycle` se resetea al inicio de cada ciclo del bucle `for`, para que el diagnóstico de duplicados no se repita inútilmente.

### Prueba E2E en vivo
Base `test-live-f4` (creada con `db create`), 70 anuncios objetivo, searcher `remera`:
```
./meta-scraper run --url '…&q=remera&…' --limit 70 --db test-live-f4 --visible --verbose
```
Resultado: **76 anuncios observados, 76 únicos, 0 duplicados** (`duplicate_ads=0`). La base quedó con 76 ads / 63 anunciantes. Los 8 eventos `[DUP] reason=seen_in_sqlite` capturados confirmaron que los rechazos eran legítimos (anuncios ya guardados en SQLite de la misma búsqueda), no duplicados de memoria. El pacing sumó ~1-2 s por acción, la velocidad final fue de ~250 anuncios/min, dentro de lo seguro.

### Cambios realizados (Línea Roja respetada)
- `src/extractors.ts`: diagnóstico forense de duplicados + pausas humanas. **No se tocó SQLite ni el DOM Pruning.**
- Tests offline: 106/106 pasan (`npm test`).