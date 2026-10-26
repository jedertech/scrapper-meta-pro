# Proxies — ¿hacen falta? cuándo, cuáles, cuánto cuestan

> Aplica solo a **M5 Espía de Anuncios** (scraping de la Biblioteca de Anuncios) y, si hiciera falta, a la descarga de videos públicos para **M6**.
> La API oficial de Meta (M2/M3/M4) **nunca** pasa por proxies.
> Precios aproximados ⚠️ A validar en el sitio de cada proveedor (cambian seguido y dependen del volumen y del plan).

---

## 1. Respuesta corta

| Etapa | ¿Proxy? | Por qué |
|---|---|---|
| **Etapa 0–1** (piloto, 3–10 cuentas) | **No hace falta** (o 1 proxy de respaldo) | Volúmenes bajos; el scrapper actual corre sin proxy con stop en 403/429 |
| **Etapa 2** (5+ agencias, 30–100 cuentas) | **Sí**, residenciales rotativos LATAM | El scraping corre en servidores (IPs de datacenter de Railway/Fly), que Meta detecta y bloquea mucho más rápido que una IP hogareña |
| **Etapa 3–4** (100–500+ cuentas) | **Sí**, con rotación, pool por país y plan B | Volumen y continuidad |

> Señal para activar proxies antes de lo previsto: tasa de éxito del scraping < 85% en 24 h, o más de 2 aperturas del circuit breaker por día.

---

## 2. Tipos de proxy

| Tipo | Qué es | Detección por Meta | Precio relativo | Uso en Jeder AI |
|---|---|---|---|---|
| **Datacenter** | IPs de proveedores cloud/hosting | Alta (rangos conocidos) | Muy bajo (por IP o GB) | No recomendado para Meta; útil para tests |
| **ISP / residencial estático** | IPs de ISP asignadas a datacenter, fijas | Media | Medio (por IP/mes) | Sesiones largas si hiciera falta |
| **Residencial rotativo** | IPs de hogares reales, rotan por request o sesión | Baja | Medio (por GB) | **Opción principal** |
| **Móvil (4G/5G)** | IPs de operadoras móviles (CGNAT, compartidas por muchos usuarios) | Muy baja | Alto (por GB) | Solo si residencial falla |

---

## 3. Proveedores ejemplo ⚠️

| Proveedor | Residencial (USD/GB aprox.) ⚠️ | Geo LATAM (AR/MX/CO/CL) | Notas |
|---|---|---|---|
| **Bright Data** | ~4–8 (baja con volumen) | Sí, a nivel país/ciudad | Líder, el más completo y caro; KYC estricto; también Web Unlocker / Scraper APIs |
| **Oxylabs** | ~4–8 | Sí | Enterprise, buena calidad; mínimos mensuales en algunos planes |
| **Decodo (ex Smartproxy)** | ~2–7 | Sí | Buen precio/calidad para empezar; planes chicos |
| **IPRoyal** | ~2–7 (tráfico que no vence en algunos planes ⚠️) | Sí | Barato, flexible; calidad variable según pool |
| **SOAX** | ~3–7 | Sí | Filtros geo finos |
| **NetNut** | ~3–7 | Sí | IPs ISP |
| **Webshare** | Datacenter muy barato; residencial ~3–7 | Parcial | Bueno para pruebas |

Brief canónico: **~USD 3–8/GB** para residencial ⚠️.

### Criterios de elección

- [ ] Geo-targeting por **país** (la Biblioteca filtra por país; conviene salir desde el país consultado ⚠️ verificar si mejora resultados).
- [ ] Sesiones *sticky* configurables (1–30 min).
- [ ] Facturación por GB **sin mínimo alto** en Etapa 2.
- [ ] Origen ético de IPs (consentimiento de los usuarios del pool; ver §7).
- [ ] API para medir consumo por sub-usuario (para costear por tenant).
- [ ] KYC aceptable para una empresa LATAM.

**Recomendación Etapa 2:** empezar con **Decodo o IPRoyal** (bajo compromiso) y tener **Bright Data u Oxylabs** como segundo proveedor si la calidad no alcanza. ⚠️ Probar 1 GB de cada uno en piloto y comparar tasa de éxito.

---

## 4. Consumo estimado por scrape

El scrapper escucha respuestas `/api/graphql/`; el peso real depende de qué recursos carga el navegador.

| Escenario | Peso por página de resultados (~30 anuncios) ⚠️ | Comentario |
|---|---|---|
| Navegador sin bloquear nada (imágenes, videos, fuentes) | 5–15 MB | Caro en proxy |
| **Bloqueando imágenes/video/fuentes/analytics** (route interception de Playwright) | **0,5–2 MB** | **Hacer siempre** |
| Solo requests GraphQL directos (sin render completo) ⚠️ | 0,1–0,5 MB | Más eficiente pero más frágil y detectable |

### Consumo por cuenta cliente / mes ⚠️

Supuestos: cada cuenta sigue 10 anunciantes, refresco semanal, ~3 páginas de resultados por anunciante, 1,5 MB por página (con bloqueo), +30% reintentos.

| Cálculo | Valor |
|---|---|
| Páginas/mes | 10 anunciantes × 3 páginas × 4,3 semanas ≈ 129 |
| MB/mes | 129 × 1,5 MB × 1,3 ≈ **~250 MB** |
| + búsquedas por keyword y descubrimiento de nicho | +100–300 MB |
| **Total** | **~0,35–0,55 GB/cuenta/mes** |

Con **deduplicación** entre cuentas del mismo nicho (mismos competidores) el consumo efectivo puede bajar 30–50% ⚠️.

---

## 5. Costo por cuenta

| Precio GB ⚠️ | Consumo 0,35 GB | Consumo 0,55 GB | Consumo 1 GB (peor caso) |
|---|---|---|---|
| USD 3 | 1,05 | 1,65 | 3,00 |
| USD 5 | 1,75 | 2,75 | 5,00 |
| USD 8 | 2,80 | 4,40 | 8,00 |

> Presupuesto canónico de **scraping/proxy ~USD 5/cuenta/mes** (ver [../01-comercial/pricing-y-unit-economics.md](../01-comercial/pricing-y-unit-economics.md)): alcanza con margen en casi todos los escenarios **si se bloquean recursos pesados**.
> **Descarga de videos para M6** (creativos de anuncios): un video de 30–60 s pesa 2–15 MB. 40 videos/mes = 0,1–0,6 GB más. Descargar **sin proxy** si el CDN lo permite (las URLs de CDN suelen ser firmadas y accesibles directo ⚠️), o con proxy solo en reintentos.

---

## 6. Arquitectura de rotación

```
apps/worker (servicio de scraping AISLADO)
 ├─ Cola BullMQ "ads-scrape" (job = anunciante|keyword + país)
 ├─ Dedupe: clave (pageId|keyword, país, semana) → si existe resultado fresco, no scrapear
 ├─ ProxyPool
 │    ├─ proveedor A (primario) — gateway con usuario-país-sesión
 │    ├─ proveedor B (secundario)
 │    └─ métricas por proveedor/país: éxito, latencia, MB, 403/429
 ├─ Browser pool (Playwright Chromium + stealth de browser-compat.ts)
 │    └─ 1 contexto = 1 sesión sticky (5–10 min) = 1 IP
 ├─ Route interception: abort image/media/font/stylesheet/analytics
 ├─ Circuit breaker (existente) + stop en 403/429 → marcar IP/sesión "quemada", backoff
 └─ Reporte de consumo → tabla scrape_usage(tenant_id, gb, requests, provider, fecha)
```

### Reglas de rotación

| Regla | Valor inicial ⚠️ (calibrar) |
|---|---|
| Sesión sticky | 5–10 min o 20–30 páginas, lo que ocurra primero |
| País de salida | Igual al país de la búsqueda (AR, MX, CO…) |
| Concurrencia | 2–4 navegadores por worker en Etapa 2 |
| Delay entre páginas | 2–6 s con jitter |
| Ante 429 | Cerrar sesión, nueva IP, backoff 60 s × intento |
| Ante 403 repetido (≥ 3 en 10 min) | Pausar país 15 min → 1 h; alertar |
| Proveedor con éxito < 70% (1 h) | Cambiar a proveedor B |
| Ambos proveedores < 70% | Activar plan B (Apify) — ver [ads-library-y-scraping.md](ads-library-y-scraping.md) §5 |

### Configuración (env, nunca en código)

```
PROXY_PRIMARY_URL=http://user-country-{cc}-session-{sid}:pass@gate.proveedor-a:port   # formato varía por proveedor ⚠️
PROXY_SECONDARY_URL=...
PROXY_MONTHLY_BUDGET_USD=...
SCRAPE_BLOCK_RESOURCES=image,media,font,stylesheet
```

### Checklist de implementación

- [ ] `ProxyPool` con interfaz común para A/B.
- [ ] Route interception activado por defecto.
- [ ] Registro de MB por job (sumar `response.body()` o métricas del proveedor).
- [ ] Costeo por tenant (para pricing y alertas).
- [ ] Alertas: presupuesto 80%, éxito < 85%, latencia anómala.
- [ ] Tests con proxy mock (sin red) en CI.

---

## 7. Ética y legal

| Tema | Postura |
|---|---|
| **Origen de las IPs residenciales** | Elegir proveedores que declaren pools **con consentimiento** (SDK opt-in, programas pagos). Evitar proveedores opacos o baratísimos de origen dudoso |
| **Uso** | Solo para acceder a **datos públicos** de la Biblioteca de Anuncios, sin login, a volúmenes bajos |
| **ToS de Meta** | Usar proxies **no** vuelve "permitido" el scraping; solo reduce bloqueos. El riesgo de ToS sigue (ver [ads-library-y-scraping.md](ads-library-y-scraping.md) §3) |
| **KYC del proveedor** | Declarar caso de uso honesto ("monitoreo de anuncios públicos"); algunos proveedores restringen dominios de Meta en ciertos productos ⚠️ — leer su política de uso aceptable |
| **Nunca** | Usar proxies para crear/operar cuentas falsas, para scrapear logueado, ni para llamar a la API oficial |
| **Datos personales** | Igual tratamiento que sin proxy (ver [privacidad-datos.md](privacidad-datos.md)) |

---

## 8. Decisiones pendientes

| Decisión | Cuándo | Responsable |
|---|---|---|
| Proveedor primario y secundario | Fin de Etapa 1 (tras prueba de 1 GB c/u) | Sergio |
| ¿Salir siempre del país consultado? | Piloto S3 | Sergio |
| Presupuesto mensual tope de proxy | Antes de Etapa 2 | PO |
| ¿Usar Web Unlocker / Scraper API en vez de proxy crudo? | Si el éxito con residencial < 85% | Sergio + PO |
