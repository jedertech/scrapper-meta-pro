# TAREA ACTUAL: Fase 4.1 - Fix de Cero Anuncios (DOM Traversal & Duplicated Spans)

**Objetivo:** El scraper arroja "0 anuncios detectados" y el DOM no se limpia porque el bucle de extracción descarta los anuncios si detecta múltiples `span` o si el anuncio no tiene un link directo a `facebook.com`. Meta inyecta spans duplicados ocultos en anuncios de Lead Gen o Ebooks, lo que rompe el contador actual.

**Instrucciones de Corrección (LÍNEA ROJA: PROHIBIDO TOCAR LÓGICA DE MEMORIA, PACING O SQLITE):**

1. **Fix del Bucle de Extracción (Tolerancia a Spans Duplicados):**
   - Archivos a modificar: `src/extractors.ts` (líneas ~540) y `src/dom-inspection.ts` (en `inspectLoadedPage` y `pruneVisibleCards`).
   - Reemplaza el bucle actual (`while (card && (!card.querySelector('a[href*="facebook.com/"]') || card.querySelectorAll('span').length < 2))`) por un algoritmo robusto.
   - **Lógica Obligatoria:** 
     1. Escala por los padres (`card.parentElement`) asegurando no llegar nunca al `BODY`.
     2. En lugar de contar la cantidad cruda de `spans`, extrae los IDs con `labelRegex` y mételos en un `Set`. Cuenta la cantidad de IDs ÚNICOS (`uniqueIds.size`).
     3. Si la tarjeta actual tiene exactamente 1 ID único y contiene contenido visual (`img` o `video`), ese es el contenedor correcto del anuncio.
     4. Elimina la condición estricta de `ids.length !== 1` al final, cámbiala por `uniqueIds.size !== 1` para tolerar que el mismo ID esté inyectado dos veces en el HTML.

2. **Fix de Ceguera del Extractor:**
   - En `src/extractors.ts`, asegúrate de que la validación de los esqueletos sea únicamente: `if (card.closest('[data-msr-pruned]')) continue;`.
   - ELIMINA cualquier uso de `card.querySelector('[data-msr-pruned]')` para evitar que rechace la grilla entera.

3. **Pruebas (Offline y Live):**
   - Ejecuta `npm run build && npm test` para validar la lógica.
   - Realiza una extracción E2E real buscando extraer 100 anuncios de forma limpia. El DOM DEBE irse vaciando (DOM Pruning) y no deben registrarse duplicados en SQLite.