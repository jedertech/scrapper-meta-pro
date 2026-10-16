# TAREA ACTUAL: Fase 4.2 - Dedup Local y DOM Traversal Independiente de Media

**Objetivos:** 
1. Aislar las bases de datos SQLite para que los duplicados se validen localmente, no globalmente.
2. Hacer que el extractor no dependa de imágenes/videos para identificar el contenedor de un anuncio, ya que en extracciones masivas (>3000 ads) Meta no carga los assets (lazy-loading throttling) y el scraper deja basura en el DOM.

**Instrucciones de Corrección:**

1. **Aislamiento de Bases de Datos (`src/storage.ts`):**
   - El método `filterNewAds` está validando los IDs contra toda la tabla `ads` históricamente.
   - Modifica la tabla, el esquema o las sentencias SQL para que el `WHERE` respete el archivo de base de datos actual o la sesión activa. Una `--db` nueva debe tener cero duplicados aunque el anuncio exista en otras bases.

2. **Extracción sin dependencia de Media (`src/extractors.ts` y `src/dom-inspection.ts`):**
   - Elimina la condición `if (card.querySelector('img, video'))` en los bucles `while` de búsqueda de contenedor.
   - **Nueva Heurística:** El contenedor correcto del anuncio es aquel que tiene 1 único ID de biblioteca (tolerando spans duplicados del mismo ID) PERO que representa la tarjeta estructural completa. 
   - Diseña un método basado en clases de Meta (ej. buscar el primer padre con estilo de caja, o seguir subiendo hasta justo antes de tocar el contenedor de 2 IDs). Debe capturar la tarjeta completa para que el DOM Pruning borre el nodo visual completo sin depender de que los assets gráficos hayan cargado.

3. **Pruebas (Offline y Live):**
   - Corre `npm run build && npm test`.
   - Ejecuta una prueba viva de 50 anuncios en una base limpia. Monitorea que 1) No haya dedup global y 2) El DOM Pruning elimine visualmente las cajas de los anuncios aunque no hayan renderizado fotos.