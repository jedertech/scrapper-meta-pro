# JederTech Meta Scraper v1

Recolector local de Meta Ads Library con Playwright, SQLite y CSV. Lee tarjetas visibles y JSON/GraphQL recibido durante la navegación normal. No abre detalles, perfiles ni destinos. No usa API oficial, cuentas, proxies ni técnicas de evasión.

## Instalación y primer inicio

Requiere Node.js 22.13+ y npm. Descargá el proyecto y ejecutá, desde cualquier directorio:

- Linux: `/ruta/al/proyecto/jedertech.sh`.
- Windows: `C:\ruta\al\proyecto\jedertech.cmd` (doble clic o terminal).

Ambos lanzadores usan `npm ci` si faltan dependencias, compilan cuando cambió el código e instalan Chromium compatible con la versión fijada de Playwright si falta. Preguntan antes de instalar. Chromium se guarda en `.playwright-browsers/` del proyecto; no se usan perfiles personales. El navegador puede necesitar bibliotecas del sistema en Linux; el instalador informa el error si faltan y no ejecuta `sudo` automáticamente. La versión para Windows tiene revisión estática, pero requiere una prueba final en Windows.

En el menú, elegí **Nueva extracción**, creá o seleccioná una base, pegá la URL, indicá el objetivo y elegí modo visible o headless. La extracción visible usa una sesión persistente: al alcanzar el objetivo, la terminal espera `r`, `+N`, `e`, `p` o `q` y Chromium sigue abierto. El modo headless termina normalmente. El navegador predeterminado es Chromium y el menú no pregunta por otros motores.

El menú incluye **4. Exportar base a CSV**: elegí `b`, escribí el nombre de la base y se genera el CSV acumulado sin abrir el navegador. También permite exportar una ejecución concreta con `t`. Antes de una extracción de red, muestra URL, base y objetivo y pide confirmar. Los comandos directos siguen disponibles:

```bash
./meta-scraper db create infoproductores
./meta-scraper session --url 'https://www.facebook.com/ads/library/?country=AR&q=curso' --limit 1000 --db infoproductores --visible
./meta-scraper session --url 'https://www.facebook.com/ads/library/?country=ALL&q=curso' --limit 1000 --mode advertisers --db infoproductores --visible --profile main
./meta-scraper jobs list
./meta-scraper export --db infoproductores --format csv
./meta-scraper export --job job_ID --format csv
./meta-scraper doctor
```

En la sesión visible: `Ctrl+C` o `p` pausa después de la operación actual sin cerrar Chromium; `r` completa el objetivo pendiente del mismo trabajo; `+500` inicia un tramo de 500 anuncios nuevos y conserva cualquier objetivo anterior pendiente; `e` exporta; `h` muestra Browser Health sin hacer solicitudes; `q` cierra. Tras una pausa por GraphQL podés recargar manualmente la página, esperar y escribir `r`. La recarga sola no reanuda el scraper. Puede ser necesario volver a recorrer anuncios ya observados; SQLite deduplica por ID. Si cerrás la pestaña principal, la sesión conserva el trabajo y `r` reabre el perfil y la búsqueda desde el inicio. Después de cerrar Chromium, **Continuar sesión** abre un navegador nuevo; el cursor visual exacto no se restaura.

## Perfiles del navegador

La extracción visible usa por defecto `profiles/main/`, un perfil propio del proyecto que conserva cookies y almacenamiento entre aperturas. SQLite y los trabajos siguen separados en `data/`. Para una sesión descartable, agregá `--profile temp` al comando `session`; se elimina al cerrar normalmente con `q`. Podés abrir el perfil principal e iniciar sesión en Meta manualmente si lo decidís; el scraper no copia credenciales ni accede a perfiles personales de otros navegadores. La validez futura de la autenticación depende de Meta.

En el menú, **8. Abrir perfil manualmente** abre Chromium en blanco y lo mantiene abierto hasta escribir `q`; **9. Restablecer perfil** elimina solo el perfil elegido tras pedir la frase exacta. También están `./meta-scraper profile status`, `./meta-scraper profile open main`, `./meta-scraper profile open temp` y `./meta-scraper profile reset main`. El restablecimiento rechaza una sesión abierta y conserva bases, trabajos y CSV. Si una terminación forzada deja un perfil temporal, usá `profile reset temp` cuando no haya sesión activa. No se garantiza recuperar la pestaña o el cursor de una sesión cerrada.

Para actualizar, conservá `data/`, actualizá código y `package-lock.json`, y ejecutá de nuevo el lanzador. Para desinstalar, cerrá la sesión y eliminá la carpeta del proyecto después de guardar una copia de `data/` y sus CSV. El proyecto no instala paquetes globales. Los datos están en `data/`; las dependencias en `node_modules/` y el navegador en `.playwright-browsers/`.

## Datos y exportaciones

`data/meta-scraper.sqlite` es la fuente de verdad: contiene bases lógicas independientes, anuncios, observaciones, búsquedas, trabajos y checkpoints. Las bases se deduplican por `ad_id`. El objetivo predeterminado cuenta anuncios nuevos; `--mode advertisers` cuenta solo anunciantes con ID de página obtenido de JSON estructurado. Las tarjetas sin ese ID conservan identidad provisional y no suman a ese objetivo. Los CSV de ejecución incluyen los anuncios observados, incluso los ya existentes; los de base incluyen los únicos acumulados. Ambos se regeneran sin navegador. Se escriben atómicamente en `data/exports/AAAA-MM-DD/HH-MM-SS_tipo_id/`, con hora argentina y protección para Excel. `destination_kind` clasifica la URL observada; un enlace de seguimiento no confirma la página final.

## Formatear el proyecto

La opción **7. Formatear proyecto** del menú, o `./meta-scraper format`, pide escribir `FORMATEAR` exactamente. Borra las bases SQLite, sus respaldos, los CSV, perfiles, sesiones, diagnósticos y archivos de investigación del proyecto. Conserva código, documentación, dependencias y Git. Rechaza el borrado si hay una sesión o trabajo activo. **Guardá un respaldo verificado fuera de `data/` antes de usarla:** la acción es irreversible. No elimina `node_modules/` ni `.playwright-browsers/`.

## Estado y límites

`npm test`, `npm run test:browser-local` y `npm run benchmark:local` no contactan a Meta. La prueba de navegador usa Chromium real con un servidor local `127.0.0.1` y un proceso Node real. La velocidad y cobertura contra Meta dependen de sus respuestas y no se garantizan. Cuando no aparecen IDs nuevos tras el scroll o «Ver más», la sesión observa la página hasta 60 segundos (aviso a los 30); continúa apenas detecta anuncios o un control de paginación, sin clics repetidos durante la espera. `Ctrl+C` o `p` cancelan esa espera. Un HTTP 403/429 detiene solicitudes automáticas y deja el navegador disponible para inspección manual; `r` inicia un intento explícito reabriendo el perfil. Tres errores consecutivos de paginación GraphQL sin IDs nuevos generan un aviso; cinco pausan el tramo (`GRAPHQL_ERROR`). Los errores intermitentes se reinician con progreso verificado. Las respuestas tardías de una pausa no reactivan la extracción. Nunca se declara agotamiento sin evidencia de fin.

Los lanzadores ocultan únicamente la advertencia experimental de `node:sqlite` de Node.js; otras advertencias y errores siguen visibles. El ritmo de paginación evita solicitudes superpuestas y clics repetidos sin resultados. No imita movimientos humanos ni garantiza evitar restricciones de Meta.

En búsquedas largas, el scraper elimina del DOM las tarjetas ya extraídas y confirmadas en SQLite (`[Memory] Purged N ad nodes` en los diagnósticos), lo que mantiene la memoria del navegador acotada en objetivos de miles de anuncios. Aun así vigilá la memoria disponible y usá `Ctrl+C`/`p` para pausar si el equipo se vuelve lento. Una caída del proceso conserva los lotes ya confirmados en SQLite, pero no el cursor visual exacto. Ejecutá la sesión directamente en la terminal: si la conectás a una tubería de comandos que también recibe `Ctrl+C`, esa tubería puede cerrar la terminal y el navegador.

Ver [arquitectura](docs/ARCHITECTURE.md), [operaciones](docs/OPERATIONS.md) y [guía de desarrollo](AGENTS.md). No se implementan filtros comerciales ni enriquecimiento en esta fase.
