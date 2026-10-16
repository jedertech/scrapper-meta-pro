# TAREA ACTUAL: Fase 6 - Empaquetado Open Source, UX Final y Limpieza

**Objetivo:** Dejar el CLI perfecto (barra dinámica real), arreglar el layout gris del DOM, solucionar crashes, formatear y dejar el repositorio 0km.

**Instrucciones Paso a Paso:**

1. **UX de la Barra Dinámica (`src/cli.ts` / `src/progress.ts`):**
   - Corrige la impresión de la barra. Usa `process.stdout.write('\x1b[2K\r' + texto)` para borrar la línea completa antes de escribir, evitando que se impriman múltiples líneas hacia abajo.
   - Si el estado es un error, desconexión o STALL, la barra/texto debe imprimirse en **ROJO** (usando códigos ANSI `\x1b[31m`) y mostrar el motivo. En ejecución normal, usa verde.

2. **Fix de Pantalla Gris (`src/dom-inspection.ts`):**
   - En `pruneVisibleCards`, al crear el `skeleton`, asegúrate de que mantenga el layout para que la grilla de Meta no colapse (pantalla gris). Añade: `skeleton.style.display = 'block'; skeleton.style.background = 'transparent'; skeleton.style.width = '100%';`.

3. **Fix del Crash Ctrl+C (`src/wizard.ts`):**
   - Maneja el cierre del `readline`. Si el usuario presiona `Ctrl+C` (señal `SIGINT`), ataja el evento, imprime `\nCerrando programa de forma segura...` y ejecuta `process.exit(0)` en lugar de arrojar `ERR_USE_AFTER_CLOSE`.

4. **Limpieza 0km y Gitignore:**
   - Borra todos los archivos `.sqlite`, `.sqlite-shm`, `.sqlite-wal`, `.csv` y `.log` dentro de `data/` y sus subcarpetas. Deja solo archivos `.gitkeep` para preservar la estructura.
   - Revisa `.gitignore` para ignorar estas extensiones en `data/` y `.env`.
   - Ejecuta el formateador (Prettier/ESLint vía `npm run format` o similar) para alinear todo el código.

5. **Documentación e Instalador:**
   - Crea `install.sh` (bash) que ejecute: `npm install`, `npx playwright install --with-deps chromium`, y `npm run build`. Añade un mensaje de éxito.
   - Escribe un `README.md` profesional para GitHub: Qué hace, cómo instalarlo (`chmod +x install.sh && ./install.sh`) y cómo usarlo (`./jedertech.sh`).

6. **Self-Destruct:**
   - Como ÚLTIMO paso en bash, elimina `docs/AGENTS.md`, `docs/current_task.md` y `docs/QA_REPORT.md`. El proyecto debe quedar limpio solo con código y documentación real.