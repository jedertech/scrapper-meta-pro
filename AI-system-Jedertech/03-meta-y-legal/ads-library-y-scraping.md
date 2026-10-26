# Biblioteca de Anuncios y scraping — M5 Espía de Anuncios

> Por qué Jeder AI scrapea la Biblioteca de Anuncios de Meta, qué riesgos implica, cómo los mitigamos y cuál es el plan B.
> **No es asesoramiento legal.** Antes de vender M5 a terceros (Etapa 2), validar con un abogado el encuadre en AR/MX/CO y los TyC que aceptan las agencias.

---

## 1. Qué cubre la Ad Library API oficial (y qué no)

| Tipo de anuncio | En la **web** pública de la Biblioteca | En la **Ad Library API** oficial |
|---|---|---|
| Políticos, electorales y de temas sociales (todos los países cubiertos) | Sí | **Sí** (con spend e impresiones en rangos) |
| Anuncios **entregados en la UE** (cualquier categoría, por la **DSA**) | Sí | **Sí** (con datos de alcance/segmentación agregados) |
| Anuncios **comerciales en LATAM** (infoproductos, e-commerce) | **Sí** (activos) | **No** ❌ |

> Para nuestro mercado (infoproductores LATAM con anuncios comerciales) **la API oficial no sirve**. La única fuente es la web pública → por eso existe el scrapper (`scrapper-meta-pro`, que pasa a `packages/meta-ads-scraper`).

### Lo que el scrapper actual obtiene

| Captura hoy ✅ | No captura hoy ❌ |
|---|---|
| adId, pageId, advertiserName, description (texto), ctaUrl, ctaText, libraryUrl, country, platforms, adStartDate, adStatus, quality; destino clasificado (WhatsApp/Messenger/IG/web) | Imágenes, videos, título, spend/impresiones (Meta no los publica para comerciales LATAM) |

**Para M6 (análisis de video de anuncios)** hace falta extender el extractor para capturar URLs de creativos (imagen/video) desde las respuestas GraphQL ⚠️ (los campos existen en las respuestas, verificar estructura actual). Ver [../02-producto/modulos.md](../02-producto/modulos.md) y [../08-scrum/backlog.md](../08-scrum/backlog.md).

### Señales de "anuncio ganador" sin spend

Como no hay spend, inferimos rendimiento con proxies:

| Señal | Lectura |
|---|---|
| Días activo (hoy − adStartDate) | Anuncio que sigue activo 30+ días probablemente es rentable |
| Nº de variantes del mismo creativo/copy | Escalado / testeo intensivo |
| Reaparición del mismo ángulo en varios anunciantes del nicho | Ángulo validado en el mercado |
| Cantidad de plataformas (FB, IG, Messenger, Audience Network) | Presupuesto amplio |
| Destino (WhatsApp vs. landing) | Modelo de venta (high ticket por DM vs. checkout) |

---

## 2. Por qué scrapear igual

1. Es **el dato que más piden** las agencias ("¿qué anuncios corre mi competencia?").
2. Los datos son **públicos** (Meta los publica por transparencia; cualquiera los ve sin login).
3. Los competidores directos (Foreplay, Atria, Minea, BigSpy, AdSpy) **dependen del mismo tipo de recolección**.
4. Ya tenemos un scrapper funcional y probado.

**Pero:** M5 es un **complemento**. El valor central de Jeder AI no puede depender 100% de esto (ver §6).

---

## 3. Riesgos

| Riesgo | Descripción | Probabilidad ⚠️ | Impacto |
|---|---|---|---|
| **Violación de Términos de Meta** | Los Términos de Meta prohíben recolectar datos por medios automatizados sin permiso previo | Cierta (es un hecho que el scraping no está permitido por los ToS) | Medio–alto |
| **Bloqueo técnico** | Rate limiting, 403/429, captchas, cambios del GraphQL/DOM, fingerprinting | Alta | Medio (M5 se degrada) |
| **Acción contra cuentas** | Si se scrapea **logueado** con cuentas de FB, Meta puede deshabilitar esas cuentas — y si estuvieran vinculadas al BM de la App oficial, poner en riesgo la App | Alta si se mezcla | **Muy alto** |
| **Acción legal (cese/demanda)** | Meta ha litigado contra scrapers en EE.UU.; en un caso conocido (Meta v. Bright Data, 2024) un tribunal de EE.UU. falló a favor del scraper respecto de datos públicos sin login ⚠️ — **no es garantía** y no aplica directamente a LATAM | Baja a nuestra escala | Alto |
| **Riesgo reputacional con Meta** | App Review o Tech Provider afectados si Meta asocia la App oficial con scraping | Baja si está aislado | **Muy alto** |
| **Datos personales** | Anunciantes pueden ser personas físicas (nombre del infoproductor) | Media | Medio (ver [privacidad-datos.md](privacidad-datos.md)) |
| **Costo creciente** | Más bloqueos → más proxy → más costo por cuenta | Media | Medio (ver [proxies.md](proxies.md)) |

---

## 4. Mitigaciones concretas

### 4.1 Aislamiento (lo más importante)

| Regla | Implementación |
|---|---|
| **Infraestructura separada** de la App oficial | Worker de scraping en otro servicio/proyecto (p.ej. otro proyecto de Railway/Fly), con su propia cola BullMQ y credenciales; **sin acceso** a la tabla de tokens de Meta |
| **Nunca usar tokens de clientes** para scraping | El paquete `meta-ads-scraper` no importa `meta-graph`; lint rule / revisión de dependencias en CI |
| **Nunca scrapear logueado** | Solo sesión anónima de la Biblioteca pública; sin cuentas de FB, ni propias ni de clientes |
| **Dominios e IPs distintos** | El scraping sale por proxies, nunca desde la IP de la API oficial |
| **Sin vínculo con el BM de la App** | Nada de cuentas, páginas ni pixels del BM verificado en el scraper |
| **Separación de datos** | Tablas `ads_*` con origen `source = 'scraper' | 'apify'`; la UI lo etiqueta como "fuente pública" |

### 4.2 Bajo perfil técnico

- [ ] Volumen bajo y **on-demand**: solo los anunciantes/búsquedas que siguen los clientes (no "indexar todo Meta").
- [ ] Refresco **semanal** por anunciante (2×/semana en Scale), no continuo.
- [ ] **Deduplicar** búsquedas entre cuentas: si 3 clientes siguen al mismo anunciante, se scrapea 1 vez.
- [ ] Rate limit propio: máx. N requests/min por IP y jitter aleatorio ⚠️ calibrar en piloto.
- [ ] Mantener el **circuit breaker** existente (errores GraphQL) y el **stop en 403/429**, con enfriamiento progresivo (backoff 15 min → 1 h → 6 h).
- [ ] Bloquear descarga de imágenes/videos/fuentes durante el scraping (ahorra GB de proxy); descargar creativos **solo** cuando M6 los necesite.
- [ ] Respetar horarios distribuidos (no picos a la misma hora).
- [ ] Monitoreo de salud (`src/graphql-health.ts`): alerta si cae la tasa de éxito o cambia el esquema.

### 4.3 Solo datos públicos y uso legítimo

- [ ] Solo lo visible en la Biblioteca sin login.
- [ ] No re-publicar creativos completos fuera de la cuenta del cliente; mostrarlos como **referencia de análisis** con link a la Biblioteca (`libraryUrl`).
- [ ] No vender bases de datos de anuncios crudas ni exportaciones masivas (limitar exportes de M5).
- [ ] No cruzar con datos personales de otras fuentes.

### 4.4 Contrato y comunicación

- [ ] TyC de Jeder AI: M5 se ofrece "tal cual", *best effort*, puede degradarse por cambios de terceros.
- [ ] SLA excluye M5 de créditos (ver [../01-comercial/modelo-marca-blanca.md](../01-comercial/modelo-marca-blanca.md) §7).
- [ ] No mencionar M5 en la presentación de App Review (no es parte de la App oficial).
- [ ] Nunca decir "datos de Meta" en marketing de M5: decir "anuncios públicos de la Biblioteca de Anuncios".

---

## 5. Plan B: proveedores alternativos

Si el scrapper propio se bloquea o el costo de proxies se dispara, tener un proveedor **ya integrado detrás de la misma interfaz**.

| Opción | Cómo | Costo aprox. ⚠️ | Pros | Contras |
|---|---|---|---|---|
| **Apify actors** (Facebook Ads Library scrapers de la comunidad/Apify) | API REST; pagar por resultados o por compute | Del orden de USD 0,5–5 por 1.000 anuncios según actor ⚠️ | Rápido de integrar; ellos lidian con bloqueos | Calidad variable entre actores; dependencia de terceros; mismo riesgo de ToS trasladado |
| Otros proveedores de datos de anuncios (APIs comerciales de ad intelligence) | API | Variable / enterprise ⚠️ | Datos enriquecidos | Caro; cobertura LATAM dudosa |
| Scrapers "as a service" (Bright Data, Oxylabs, Zyte con Web Unlocker/Scraper API) | API que devuelve HTML/JSON | Por request ⚠️ | Desbloqueo gestionado | Hay que mantener el parser |
| Degradación elegante | Mostrar último dato conocido + aviso | 0 | Sin costo | Datos viejos |

### Diseño técnico del plan B

```ts
// packages/meta-ads-scraper — interfaz común
interface AdsSource {
  name: 'own-playwright' | 'apify' | 'unlocker';
  searchByPage(pageId: string, country: string): Promise<AdRecord[]>;
  searchByKeyword(q: string, country: string): Promise<AdRecord[]>;
  health(): Promise<{ ok: boolean; successRate24h: number }>;
}
// Router: usa own-playwright; si successRate24h < 70% o circuit breaker abierto → fallback a apify.
```

- [ ] Normalizar todo al mismo `AdRecord` (reusar `src/normalize.ts` y `src/types.ts`).
- [ ] Feature flag por tenant para forzar fuente.
- [ ] Presupuesto mensual tope para la fuente B (alerta al 80%).

---

## 6. Que el valor no dependa 100% del scraping

| Si M5 cae… | El producto sigue entregando |
|---|---|
| Sin anuncios nuevos de competidores | M3 (cuenta propia), M4 (competencia orgánica vía API oficial), M6 (análisis de videos orgánicos), M7, M8, M9, M10 |
| Mensaje al usuario | "Los anuncios públicos se actualizarán en cuanto la fuente vuelva a estar disponible. Mientras tanto, mirá los ángulos que vienen funcionando en orgánico." |

En pitch y pricing, M5 es **uno de 11 módulos**, no el producto.

---

## 7. Reglas de oro operativas (imprimir y pegar)

1. **Nunca** scrapear logueado ni con cuentas de FB/IG de nadie.
2. **Nunca** usar tokens de clientes ni IPs de la App oficial para scraping.
3. **Nunca** mezclar código: `meta-ads-scraper` no depende de `meta-graph` (y viceversa).
4. **Solo** datos públicos, solo lo que piden los clientes, deduplicado.
5. **Parar** ante 403/429 y respetar el enfriamiento; no "forzar" con más IPs.
6. **Medir** tasa de éxito, GB de proxy y costo por cuenta todos los días.
7. **Tener** el plan B integrado y probado antes de Etapa 2.
8. **No prometer** en ventas datos que Meta no publica (spend/impresiones de anuncios comerciales LATAM).
9. **Revisar** con abogado los TyC antes de vender a la primera agencia externa.
10. **Documentar** cada cambio del esquema GraphQL detectado (changelog interno).

---

## 8. Checklist por etapa

| Etapa | Checklist |
|---|---|
| Etapa 0–1 | [ ] Port del scrapper a `packages/meta-ads-scraper` · [ ] Worker aislado · [ ] Sin proxy, volumen bajo (piloto) · [ ] Métricas de éxito |
| Etapa 2 | [ ] Proxies residenciales LATAM (ver [proxies.md](proxies.md)) · [ ] Plan B Apify integrado · [ ] TyC revisados · [ ] Límites de exportación |
| Etapa 3+ | [ ] Revisión trimestral del riesgo · [ ] Evaluar si la API oficial amplió cobertura (si algún día cubre comerciales LATAM, migrar) |

---

## Fuentes y referencias

- Meta Ad Library (web pública): https://www.facebook.com/ads/library/
- Ad Library API (documentación): https://www.facebook.com/ads/library/api/
- Términos de Meta (sección de recolección automatizada): https://www.facebook.com/terms
- Apify Store (buscar "Facebook Ads Library"): https://apify.com/store
- ⚠️ Referencias a litigios (Meta v. Bright Data, 2024) citadas de memoria: verificar antes de usarlas en cualquier documento externo.
