# Guía para continuar el proyecto

## Estado e invariantes

- Stack: Node.js 22.13+, TypeScript, Playwright, `node:sqlite`, CSV. Fuente de verdad: `data/meta-scraper.sqlite`; los CSV son regenerables.
- La entrega está limpia: `data/`, `profiles/`, dependencias y navegador local se crean al primer inicio. Los lanzadores instalan dependencias y Chromium local con confirmación.
- No hacer solicitudes a Meta sin autorización específica. No usar perfiles personales, cookies copiadas, proxy, stealth ni bypass de controles. Respetar 403/429 y verificaciones.
- `ad_id` deduplica por base. `meta_page_id` solo si existe y su fuente está documentada. La identidad interna provisional no es un ID de Meta. Nombres iguales no se fusionan.
- El objetivo de un tramo son anuncios únicos nuevos para la base. Persistir cada lote antes de reportar progreso. Un trabajo terminado o parcial siempre puede exportarse desde SQLite.
- En `session --mode advertisers`, el objetivo cuenta únicamente anunciantes nuevos con `meta_page_id_source='structured_json'`. Los anuncios sin ese ID conservan identidad provisional separada y no suman al objetivo. Al aparecer un ID estructurado, el anuncio se promueve en todas las bases donde exista.
- Una sesión visible tiene un solo propietario, pestaña y contexto. `Ctrl+C`/`p` pausan sin cerrar; `r` continúa el objetivo restante del mismo trabajo; `+N` crea un trabajo adicional y conserva pendientes anteriores. `resume --job` abre navegador nuevo y no recupera el cursor visual exacto.
- El perfil principal está en `profiles/main/` y usa `launchPersistentContext` con `handleSIGINT:false`. `--profile temp` crea un perfil descartable; `profile open` abre en blanco; `profile reset` elimina solo el perfil elegido con frase exacta y bloqueo de sesión. No inspeccionar ni copiar el contenido de los perfiles. `profiles/` no se versiona; SQLite permanece en `data/`.
- El menú envía una extracción visible nueva al comando `session` y cede por completo stdin al proceso de sesión. `COMPLETED`, `GRAPHQL_ERROR`, `USER_PAUSED`, `STALLED`, `ACCESS_DENIED` y `RATE_LIMITED` finalizan el tramo, no el proceso de sesión. Cerrar la pestaña principal conserva el trabajo; `r` reabre perfil y búsqueda desde el inicio. `q` cierra voluntariamente. Si se vuelve al menú, ya no existe sesión viva en ese proceso: «Continuar sesión» lista trabajos históricos y abre navegador nuevo.
- GraphQL HTTP 200 puede contener errores y cero anuncios. Contar errores de paginación consecutivos sin IDs nuevos: advertir al tercero y pausar al quinto (umbral interno configurable). Solo IDs nuevos verificados reinician la racha. Al pausar, ignorar respuestas tardías para salud y extracción; la recarga manual no reactiva el iterador. No reintentar automáticamente 403/429. `EXHAUSTED` solo con evidencia de fin.
- La espera por ausencia de progreso es de hasta 60 segundos, con aviso a los 30. Monitorea IDs y «Ver más» de la página cargada; sale de inmediato ante progreso, `Ctrl+C`/`p`, 403/429 o error GraphQL. No repetir clic en «Ver más» hasta recibir IDs nuevos. No simular conducta humana ni garantizar evitar restricciones.
- En sesión persistente no aplicar el presupuesto de scroll estimado a partir del objetivo, porque una búsqueda reanudada puede requerir recorrer miles de duplicados. Un clic en «Ver más» puede tardar más de tres segundos con DOM grande; se dan hasta diez y, si vence, se observan IDs durante la espera acotada antes de pausar. Vigilar memoria de Chromium en sesiones largas: se observó un renderer de varios GB con más de 2.000 tarjetas. No hay límite automático fiable de memoria.
- `destination_kind` clasifica la URL observada sin visitar destino ni resolver seguimiento. No agregar filtros comerciales, contactos, landing scraping ni Twenty CRM al recolector.

## Mapa del código

- `src/cli.ts`, `src/wizard.ts`, `src/session-cli.ts`: CLI, menú y comandos de sesión.
- `src/extractors.ts`, `src/visible-card.ts`, `src/graphql-health.ts`, `src/browser-profiles.ts`, `src/browser-health.ts`: navegador, perfiles, salud, DOM/JSON y paginación.
- `src/normalize.ts`, `src/destination.ts`: contrato de anuncio y clasificación local.
- `src/storage.ts`, `src/runner.ts`, `src/session-runner.ts`: SQLite, deduplicación, trabajos y recuperación.
- `src/exporter.ts`: CSV atómico; `src/security.ts`: validación y redacción.
- `src/project-format.ts`: formateo limitado al proyecto con confirmación, bloqueo de sesión y protección de rutas simbólicas.
- `jedertech.sh`, `jedertech.cmd`, `scripts/needs-build.mjs`: inicio portable, instalación local con confirmación y compilación solo cuando hace falta. Probar Windows en un entorno Windows antes de afirmar compatibilidad completa.
- `tests/`: escenarios offline, red simulada, persistencia y regresiones.

## Desarrollo

Ejecutar `npm run build`, `npm test`, `npm run test:browser-local` y `npm run benchmark:local` antes de cambiar el extractor. La prueba con Chromium usa solo `127.0.0.1` y puede requerir permisos locales para abrir sockets/procesos. La simulación de 5.000 anuncios mide solo parsing y SQLite locales, nunca Meta. Mantener pruebas de GraphQL, interrupción y exportación histórica. No añadir dependencias sin necesidad demostrada. No versionar `data/`, CSV, sesiones, perfiles, logs, diagnósticos ni secretos. El Git local no tiene remoto.

La futura fase de filtros debe consultar SQLite mediante `Storage.baseAdRows()` o una consulta nueva y parametrizada; no debe depender de CSV ni abrir el navegador. Si requiere migración, probarla con copia SQLite y preservar el esquema anterior.
