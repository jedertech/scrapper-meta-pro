# TAREA ACTUAL: Fase 3 - Estabilidad en Segundo Plano (Visible) y Deduplicación del DOM

**Objetivo:** El scraper corre en modo visible en un escritorio secundario, pero arroja duplicados por los esqueletos del DOM Pruning. NO usaremos playwright-extra.

**Instrucciones de Corrección (LÍNEA ROJA: PROHIBIDO TOCAR LÓGICA DE MEMORIA O SQLITE):**

1. **Deduplicación de Nodos (Corrección Exacta del Bucle While):**
   - El extractor principal vuelve a leer los esqueletos porque el bucle `while` escala al contenedor padre y evade la regla `closest`.
   - Solución A: Cambia los selectores base en `src/extractors.ts` y `src/dom-inspection.ts` para que ignoren hijos de esqueletos: usa `document.querySelectorAll('span:not([data-msr-pruned] *)')`.
   - Solución B: En el bucle de extracción principal, inmediatamente después de que el while defina `card`, agrega esta validación estricta para matarlo si tocó un esqueleto:
     `if (card.hasAttribute('data-msr-pruned') || card.closest('[data-msr-pruned]') || card.querySelector('[data-msr-pruned]')) continue;`
2. **Anti-Throttling (Para usar la PC):**
   - En `src/browser-compat.ts` (o donde se inicie el contexto), inyecta un script (`addInitScript`) que sobrescriba `document.hidden = false` y `document.visibilityState = 'visible'`.
   - Asegúrate de pasar a Chromium los args: `--disable-background-timer-throttling`, `--disable-renderer-backgrounding`, `--disable-backgrounding-occluded-windows`.
3. **Pruebas y Documentación:**
   - Actualiza los tests offline para verificar que los nodos con `data-msr-pruned` son ignorados.
   - Escribe el resumen técnico de la Fase 2.5 y de esta Fase 3 en `docs/phases_log.md`.
   - Detente y avísame cuando los tests pasen para que YO lance la prueba E2E manualmente. TIENES PROHIBIDO crear archivos temporales o descargar el HTML de Meta.