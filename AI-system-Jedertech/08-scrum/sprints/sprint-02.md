# Sprint 2 — M2 Conexión de Cuentas + M3 Mi Contenido (semanas 5–6)

> Backlog: [../backlog.md](../backlog.md) · Meta: [../../03-meta-y-legal/meta-app-review-y-permisos.md](../../03-meta-y-legal/meta-app-review-y-permisos.md) · Módulos: [../../02-producto/modulos.md](../../02-producto/modulos.md)

## Sprint goal
**"Las 3–5 cuentas del piloto están conectadas por OAuth y el equipo de la agencia ve en el dashboard Mi Contenido sus KPIs y top publicaciones, actualizados solos cada día."**

## Historias incluidas (42 pts)
| ID | Historia | Pts |
|---|---|---|
| JA-021 | Paquete `meta-graph` | 5 |
| JA-022 | Conectar Instagram/Facebook (OAuth) | 8 |
| JA-023 | Tokens cifrados + control de expiración | 5 |
| JA-024 | Desconectar cuenta + data deletion callback | 3 |
| JA-025 | Ingesta diaria de posts/reels + insights | 8 |
| JA-026 | Ingesta de insights de cuenta | 3 |
| JA-027 | Dashboard Mi Contenido | 5 |
| JA-028 | Detalle de publicación | 3 |
| JA-029 | Screencasts de permisos (M2/M3) | 2 |

## Tareas técnicas paso a paso
1. **Cliente Graph API (JA-021)**
   - [ ] `packages/meta-graph`: `createGraphClient({accessToken, version})` con `get`, `paginate`, manejo de errores tipados (`TokenExpiredError`, `PermissionError`, `RateLimitError`).
   - [ ] Lectura de `x-app-usage` / `x-business-use-case-usage` → pausa/backoff.
   - [ ] Fixtures JSON de respuestas reales (anonimizadas) para tests; prohibido llamar a Meta en CI.
2. **OAuth (JA-022)**
   - [ ] Ruta `/api/meta/connect?clientAccountId=` que arma URL de Facebook Login for Business con `state` firmado (HMAC con `tenantId`, `clientAccountId`, nonce, expiración).
   - [ ] Callback: valida `state`, intercambia code → token, obtiene páginas (`me/accounts`) y cuenta IG vinculada (`instagram_business_account`).
   - [ ] Pantalla de selección de página/IG; mensajes guiados si la cuenta es personal o no está vinculada.
3. **Tokens (JA-023)**
   - [ ] Tabla `meta_connections` (tenant_id, client_account_id, ig_user_id, page_id, scopes, token_cifrado, expires_at, status).
   - [ ] Cifrado AES-256-GCM con clave `TOKEN_ENCRYPTION_KEY` (rotación documentada) o Supabase Vault ⚠️ decidir en ADR.
   - [ ] Job diario `meta-token-check`: valida token (`debug_token`), marca `needs_reauth`, notifica.
4. **Desconexión y borrado (JA-024)**
   - [ ] Acción "Desconectar" + borrado de datos derivados.
   - [ ] `/api/meta/data-deletion`: parsea `signed_request` con el app secret, encola `data-deletion`, responde `{url, confirmation_code}`; página `/borrado/[code]`.
5. **Ingesta (JA-025, JA-026)**
   - [ ] Tablas `ig_media`, `ig_media_metrics_daily`, `ig_account_metrics_daily` con RLS.
   - [ ] Job `ig-backfill` al conectar (90 días ⚠️) y job repetible `ig-daily-sync` por conexión (escalonado en el día).
   - [ ] Upsert idempotente; métricas por tipo de media (reel vs. imagen vs. carrusel) ⚠️ verificar disponibles en la versión de API.
6. **UI (JA-027, JA-028)**
   - [ ] `/c/[clientAccountId]/contenido`: cards de KPIs con variación, gráfico de seguidores, tabla top 10 con filtro por tipo y rango.
   - [ ] `/c/[clientAccountId]/contenido/[mediaId]`: detalle con comparación vs. promedio.
   - [ ] Consultas en server components con índices `(tenant_id, client_account_id, published_at)`.
7. **Meta (JA-029)**
   - [ ] Grabar screencast por permiso apenas funcione el flujo; guardar con notas.
   - [ ] Agregar las cuentas del piloto como testers si todavía no están.

## Entregable / demo
En vivo: conectar una cuenta real del piloto → elegir IG → ver backfill en progreso → dashboard con KPIs y top reels. Mostrar desconexión y la URL de estado de borrado.

## Riesgos
| Riesgo | Mitigación |
|---|---|
| Cuentas del piloto no son Business/Creator o no están vinculadas a página | Checklist previo con la agencia en S1; mensajes guiados en la UI |
| Métricas de insights cambian/deprecadas por Meta | Leer changelog de Graph API; mapear métricas en un solo lugar de `meta-graph` |
| Rate limits en backfill | Backfill escalonado y por lotes; respetar headers de uso |
| Business Verification aún pendiente | No bloquea modo desarrollo; seguir con testers |

## Definición de "terminado" del sprint
- [ ] ≥3 cuentas piloto conectadas y sincronizando 3 días seguidos sin intervención.
- [ ] Tokens nunca en logs ni en el cliente (test + revisión del subagente seguridad).
- [ ] Data deletion callback probado con un `signed_request` de ejemplo.
- [ ] Screencasts de M2/M3 guardados.

## Prompts sugeridos para Claude Code
```text
Plan mode. Implementación de JA-022 (OAuth con Facebook Login for Business para conectar IG Business).
Leé AI-system-Jedertech/03-meta-y-legal/meta-app-review-y-permisos.md. Proponé el flujo completo
(rutas, state firmado, intercambio de token, selección de página/IG, errores guiados), las tablas y
los tests. Marcá cualquier endpoint o permiso que haya que verificar en la doc vigente de Meta.
```
```text
Usá el subagente backend: creá packages/meta-graph con un cliente tipado (fetch nativo), paginación
por cursor, backoff exponencial, lectura de x-app-usage y x-business-use-case-usage, y errores tipados.
Tests con fixtures en tests/fixtures; ninguna llamada real a la red en los tests.
```
```text
Usá el subagente frontend: construí el dashboard Mi Contenido en /c/[clientAccountId]/contenido con
shadcn/ui: 4 KPIs con variación vs período anterior (7/30/90 días), gráfico de seguidores y tabla
top 10 filtrable por tipo. Server components, estados vacíos y skeletons. Mobile first.
```
```text
Usá el subagente seguridad para revisar el manejo de tokens de Meta: cifrado, almacenamiento, logs,
respuesta del callback, validación del signed_request del data deletion y CSRF en el flujo OAuth.
```
