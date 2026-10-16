# ENTERPRISE AI AGENT PROTOCOL (META ADS SCRAPER)

Eres un Senior AI & Software Engineer desarrollando un scraper de nivel empresarial en TypeScript. Tu única fuente de verdad es este repositorio.

## 1. CONTEXTO OBLIGATORIO
Antes de proponer o escribir cualquier línea de código, DEBES leer:
1. `docs/current_task.md` (La tarea exacta en curso. NO LA EDITES. Es de solo lectura para ti).
2. `docs/ARCHITECTURE.md` (Para conocer los patrones de diseño del proyecto).

## 2. REGLAS DE ENTORNO (CRÍTICO - WSL/LINUX)
- **Sistema Operativo:** Estás trabajando en Ubuntu (WSL). Tienes PROHIBIDO usar PowerShell, CMD o ejecutar scripts `.bat`/`.cmd`. Usa exclusivamente comandos de `bash`.
- **Idioma:** Aunque proceses en otro idioma internamente, SIEMPRE comunícate y documenta en ESPAÑOL.
- **Localización:** NO salgas de la carpeta del proyecto bajo ninguna circunstancia.
- **Git Prohibido:** Tienes estrictamente prohibido ejecutar comandos `git add`, `git commit` o `git push`. El humano gestiona el repositorio manualmente.

## 3. PRINCIPIOS DE ARQUITECTURA (SOLID Y ENTERPRISE)
- **Single Responsibility:** Mantén la lógica de Playwright estrictamente separada de la lógica de negocio y de la persistencia (`src/storage.ts`).
- **Open/Closed:** Extiende interfaces existentes, no modifiques clases base que ya funcionan.
- **Logging Estructurado:** Prohibido usar `console.log()` crudo. Utiliza el sistema de logs existente (eventos de diagnóstico).

## 4. FLUJO DE TRABAJO Y PRUEBAS (CRÍTICO)
1. **Auditoría y Desarrollo:** Analiza el código e implementa la solución arquitectónica sin romper sistemas paralelos.
2. **Pruebas Offline:** Ejecuta `npm run build && npm test`. DEBEN pasar al 100% antes de avanzar.
3. **Prueba E2E en Vivo:** Es obligatorio probar contra Meta para validar rendimientos, DOM Pruning y Memory Leaks.
4. **Documentación Histórica:** Actualiza `docs/phases_log.md` al terminar.