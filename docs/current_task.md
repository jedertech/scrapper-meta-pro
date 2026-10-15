# TAREA ACTUAL: Fase 2.5 - Auditoría Git, Corrección de Regresiones y Estabilización Core

**Objetivo Crítico:** Las iteraciones anteriores rompieron el scraper. Actualmente NO extrae datos, hace clic en enlaces externos en lugar del botón de paginación, entra en bucles infinitos, el DOM Pruning no funciona, y el navegador es detectado como bot (impidiendo el login persistente y bloqueando ejecuciones headless o en segundo plano).

**Instrucciones de Auditoría y Corrección para el Agente:**

1. **Auditoría de Git (Rollback Lógico):** 
   - Revisa los últimos cambios en `src/extractors.ts`, `src/dom-inspection.ts` y `src/pagination.ts`. 
   - Identifica por qué la extracción dejó de funcionar y por qué el selector de paginación está haciendo clic en enlaces externos de anunciantes.
2. **Corrección de Paginación ("Ver más"):** 
   - El botón "Ver más" nativo de Meta solo debe tocarse cuando sea estrictamente necesario para cargar más resultados. Corrige el selector para que NO haga clic en las tarjetas de anuncios. Elimina el bucle infinito.
3. **Resurrección del DOM Pruning:** 
   - Asegúrate de que los nodos HTML se eliminen de la pantalla JUSTO ANTES de vaciar el array `seen` en RAM, operando solo sobre los IDs que ya fueron guardados en SQLite.
4. **Anti-Detección, Headless y Pérdida de Foco:** 
   - Implementa `playwright-extra` con `puppeteer-extra-plugin-stealth` en la inicialización del navegador (`src/browser-profiles.ts` o runner).
   - Configura el contexto como verdaderamente persistente para que el usuario pueda iniciar sesión una sola vez sin caer en el loop de verificación de robots de Meta.
   - Pasa los flags a Chromium para evitar que congele la pestaña al perder el foco (`--disable-background-timer-throttling`, `--disable-renderer-backgrounding`, etc.) y sobrescribe `document.visibilityState` a `visible`.
5. **Pruebas y Validación E2E:** 
   - Los tests unitarios en `tests/` DEBEN pasar.
   - Ejecuta la prueba contra Meta Ads para validar que extrae correctamente, no abre webs externas y no hace OOM:
   `./meta-scraper session --url 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=remera&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions' --limit 50 --db test-live --visible`
6. **Documentación:** Registra los hallazgos de tu auditoría y las soluciones en `docs/phases_log.md`.