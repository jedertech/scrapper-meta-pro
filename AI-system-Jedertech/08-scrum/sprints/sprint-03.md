# Sprint 3 — M4 Radar de Competencia + M5 Espía de Anuncios (semanas 7–8)

> Backlog: [../backlog.md](../backlog.md) · Reutilización del scrapper: [../../04-arquitectura/reutilizacion-del-scrapper.md](../../04-arquitectura/reutilizacion-del-scrapper.md) · Riesgos de Meta: [../../03-meta-y-legal/meta-app-review-y-permisos.md](../../03-meta-y-legal/meta-app-review-y-permisos.md)

## Sprint goal
**"La agencia monitorea a diario a los competidores de cada cuenta piloto (orgánico vía Business Discovery) y puede buscar sus anuncios activos con el scrapper corriendo como worker aislado."**

## Historias incluidas (44 pts)
| ID | Historia | Pts |
|---|---|---|
| JA-030 | Agregar competidores por @usuario | 5 |
| JA-031 | Snapshots diarios de competidores | 5 |
| JA-032 | Vista Radar: yo vs. competidores | 5 |
| JA-033 | Detección de posts outliers | 3 |
| JA-034 | Portar el scrapper a `packages/meta-ads-scraper` | 8 |
| JA-035 | Worker de scraping con BullMQ | 5 |
| JA-036 | Persistencia de anuncios en Postgres | 5 |
| JA-037 | UI Espía de Anuncios | 5 |
| JA-038 | Aislamiento del scraper + kill switch | 3 |

> Este sprint tiene **dos carriles independientes** (M4 y M5): ideal para trabajar en paralelo con dos sesiones de Claude Code en ramas distintas (ver [../../09-desarrollo-con-ia/agentes-dev/README.md](../../09-desarrollo-con-ia/agentes-dev/README.md)).

## Tareas técnicas paso a paso

### Carril A — M4 Radar de Competencia
- [ ] `meta-graph`: método `businessDiscovery(igUserId, username, fields)` con campos `followers_count, media_count, media{like_count, comments_count, caption, permalink, timestamp, media_type, media_url}` ⚠️ verificar campos vigentes.
- [ ] Tablas `competitors`, `competitor_snapshots_daily`, `competitor_media`, `competitor_media_metrics_daily` (RLS).
- [ ] Formulario "Agregar competidor" con validación en vivo y mensajes para cuentas personales/privadas.
- [ ] Job repetible `competitor-snapshot` distribuido en el día (jitter) por cuenta cliente.
- [ ] Cálculos: crecimiento 7/30 días, frecuencia semanal, engagement promedio, mix de formatos (vista SQL o materializada).
- [ ] Outliers: mediana de engagement de últimos 30 posts por competidor; marcar ≥3× ⚠️ configurable.
- [ ] UI `/c/[id]/radar`: tabla comparativa + feed de top posts con badge outlier + nota "métricas públicas".

### Carril B — M5 Espía de Anuncios
- [ ] **Port del scrapper (JA-034)**: crear `packages/meta-ads-scraper` y traer desde `scrapper-meta-pro`: `src/extractors.ts` (motor `PlaywrightExtractor`, `parseJsonAds`, `collectAds`), `browser-compat.ts`, `normalize.ts`, `destination.ts`, `pagination.ts`, `graphql-health.ts`, `security.ts` (`validateSearchUrl`, `redact`), `types.ts`.
- [ ] Dejar afuera: `cli.ts`, `wizard*.ts`, `session-*.ts`, `progress*.ts`, `storage.ts` (SQLite), `exporter.ts`.
- [ ] Definir interfaz `AdSink { saveBatch(batch: ExtractBatch): Promise<void> }` para reemplazar la escritura en `Storage`.
- [ ] Migrar `tests/core.test.mjs`, `tests/http-scenarios.test.mjs`, `tests/stabilization.test.mjs` al runner del monorepo (node:test o vitest) y dejarlos en verde.
- [ ] **Worker (JA-035)**: servicio `apps/scraper-worker` (o proceso separado del worker con su propio deploy) que consume `ads-scrape`; concurrencia 1; límite diario por tenant; usa circuit breaker y stop en 403/429 existentes → estado `paused` con motivo.
- [ ] **Persistencia (JA-036)**: tablas `ads`, `advertisers`, `ad_observations`, `tenant_ad_searches` (vínculo con RLS); dedupe por `ad_id`; `first_seen_at`/`last_seen_at`; `destination_kind` con `classifyDestination`.
- [ ] **Aislamiento (JA-038)**: rol de DB del scraper con permisos solo a tablas de anuncios; sin acceso a `meta_connections`; feature flag `m5_enabled` global/tenant; sin proxies en Etapa 1 (volumen bajo), variable `PROXY_URL` opcional preparada.
- [ ] **UI (JA-037)**: `/c/[id]/anuncios`: búsqueda por página/keyword + país, filtros (activos, días activos, destino, plataforma), orden por días activo, progreso del job.

## Entregable / demo
1. Radar de una cuenta piloto con 5 competidores, crecimiento y top posts de la semana con outliers.
2. Búsqueda de anuncios de un competidor en AR/MX: job en cola → progreso → listado filtrado por "≥30 días activo" y destino WhatsApp.
3. Kill switch: apagar M5 y mostrar el mensaje en la UI.

## Riesgos
| Riesgo | Mitigación |
|---|---|
| Business Discovery requiere permisos/ruta específicos | Verificar al inicio del sprint con una cuenta de prueba (spike de 2 h) |
| El scraper se comporta distinto en servidor (headless, IP de datacenter) | Probar en staging el día 2; bajos volúmenes; preparar proxies residenciales LATAM ⚠️ |
| Port rompe tests del scrapper | Portar primero los tests y luego el código; mantener el repo original intacto |
| Riesgo legal/ToS del scraping | Solo datos públicos, aislado, kill switch; ver [../../10-preguntas-abiertas.md](../../10-preguntas-abiertas.md) |

## Definición de "terminado" del sprint
- [ ] Snapshots diarios corriendo 3 días seguidos para todas las cuentas piloto.
- [ ] Tests del scrapper portados en verde en CI.
- [ ] El scraper corre en infraestructura separada sin acceso a tokens (verificado por el subagente seguridad).
- [ ] Kill switch probado.

## Prompts sugeridos para Claude Code
```text
Usá el subagente scraping. Leé en el repo viejo scrapper-meta-pro: src/extractors.ts, src/types.ts,
src/storage.ts, src/runner.ts, src/session-runner.ts y docs/ARCHITECTURE.md. Proponé (plan mode) cómo
portar el motor a packages/meta-ads-scraper sin SQLite: qué archivos se copian, qué interfaz reemplaza
a Storage (AdSink), cómo se mantienen el circuit breaker GraphQL y el stop en 403/429, y cómo migrar
los tests .mjs existentes. No cambies la lógica de extracción.
```
```text
Usá el subagente backend: agregá a packages/meta-graph el método businessDiscovery y el job repetible
competitor-snapshot en apps/worker, con jitter para repartir consultas en el día, upsert idempotente
y tests con fixtures. Todas las tablas con tenant_id y RLS.
```
```text
Usá el subagente frontend: pantalla /c/[id]/radar con tabla comparativa (seguidores, crecimiento 7/30,
frecuencia, engagement, mix de formatos) y feed de top posts con badge outlier. Aclaración visible de
que son métricas públicas.
```
```text
Usá el subagente seguridad: verificá que el servicio de scraping no tenga acceso a meta_connections
ni a las claves de cifrado, que el feature flag corte el procesamiento en segundos y que validateSearchUrl
siga aplicándose a toda URL que entra al scraper.
```
