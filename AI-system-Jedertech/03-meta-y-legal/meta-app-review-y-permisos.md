# Meta: App Review, permisos y Tech Provider — paso a paso

> Guía operativa para que Jeder AI pueda leer el Instagram/Facebook de los clientes (M2, M3) y analizar competidores públicos (M4) **con la API oficial**.
> Lo que Meta exige cambia seguido. Todo lo marcado ⚠️ **hay que confirmarlo en [developers.facebook.com](https://developers.facebook.com/) al momento de enviar** (Sprint 5). Revisión de este doc: octubre 2026.
> Responsable: Sergio (técnico) + dueño de Jedertech (titular del Business Manager y documentos legales).

---

## 1. Panorama: qué necesitamos y por qué

| Necesidad del producto | Módulo | Qué usamos de Meta | Requisito |
|---|---|---|---|
| Leer posts/reels e insights del cliente | M2, M3 | Instagram Graph API (cuenta propia) | Permisos con **Advanced Access** vía App Review |
| Ver métricas públicas de competidores IG | M4 | **Business Discovery** | Ruta Facebook Login (IG vinculado a página) ⚠️ |
| Que cualquier cliente (no solo testers) pueda conectarse | Todos | **Advanced Access** | **Business Verification** + App Review |
| Ofrecer el servicio a otros negocios | Todos | Figura de **Tech Provider** | Business Verification + App Review ⚠️ |
| Anuncios de la competencia | M5 | **No** usamos API oficial (no cubre LATAM comercial) | Ver [ads-library-y-scraping.md](ads-library-y-scraping.md) — **separado** de esta App |

> Regla de oro: **la App oficial nunca toca el scraping.** Otra infraestructura, otros dominios, nunca tokens de clientes en el scraper.

---

## 2. Cronograma sugerido (alineado a sprints)

| Sprint | Tarea Meta | Duración típica ⚠️ |
|---|---|---|
| **S0** | Crear/ordenar Business Manager, iniciar **Business Verification**, crear App en modo desarrollo | Verificación: días a semanas |
| S1–S2 | Desarrollar M2/M3 en **Standard Access** con usuarios con rol (admins/testers) — los clientes piloto se agregan como testers | — |
| S3 | Business Discovery con cuentas de prueba (M4) | — |
| S4 | Publicar política de privacidad, TyC, data deletion; grabar borradores de screencasts | — |
| **S5** | **Enviar App Review** | Días a semanas; 1–3 iteraciones son normales |
| S6–S7 | Corregir rechazos, obtener Advanced Access, pasar App a **Live** | — |

> Mientras no haya Advanced Access, la agencia piloto puede operar agregando a cada cliente como **tester** de la App (límite de roles ⚠️). Sirve para Etapa 1, no para vender.

---

## 3. Paso a paso

### Paso 1 — Business Manager (Portfolio comercial)

- [ ] Usar **un Business Manager de Jedertech** (empresa legal real) como dueño de la App.
- [ ] Al menos **2 administradores** (dueño + Sergio) con 2FA activado.
- [ ] Datos legales consistentes: razón social, dirección, teléfono, sitio web **idénticos** a los documentos.
- [ ] Dominio propio verificado en el Business Manager (registro DNS TXT o meta tag).
- [ ] Email corporativo en el dominio (no Gmail) para el contacto principal.

### Paso 2 — Business Verification

- [ ] Business Settings → Security Center / Centro de seguridad → **Iniciar verificación**.
- [ ] Documentos aceptados típicos ⚠️: constancia de inscripción fiscal (AR: constancia de CUIT/AFIP-ARCA; MX: Constancia de Situación Fiscal SAT; CO: RUT/Cámara de Comercio), factura de servicio con dirección, estatuto.
- [ ] Verificación de contacto: email en el dominio, teléfono o verificación de dominio.
- [ ] Esperar resultado (días a semanas ⚠️). Si rechaza: revisar coincidencia **exacta** del nombre legal.

> Si Jedertech todavía no tiene entidad legal formal, **resolverlo en S0** — es bloqueante para todo lo demás.

### Paso 3 — Crear la App

- [ ] developers.facebook.com → My Apps → **Create App**.
- [ ] Tipo/caso de uso: **Business** (o el caso de uso de Instagram/"Manage everything on your Page/IG" según el nuevo flujo por casos de uso ⚠️).
- [ ] Asociar la App al Business Manager verificado.
- [ ] Nombre de la App: **neutro** (se ve en la pantalla de consentimiento en marca blanca; ver [../01-comercial/modelo-marca-blanca.md](../01-comercial/modelo-marca-blanca.md) §4).
- [ ] Ícono 1024×1024, categoría, email de contacto, URL de privacidad, TyC, data deletion (ver Paso 7).
- [ ] Dos apps: **dev** (pruebas) y **prod** (la que va a App Review). ⚠️ Opcional pero recomendado.

### Paso 4 — Elegir la ruta de login

| | **Facebook Login for Business** | **Instagram Login** (Instagram API with Instagram Login) |
|---|---|---|
| Quién se loguea | Usuario de FB con acceso a la Página vinculada al IG | Directo con la cuenta de IG profesional |
| Requiere Página de FB vinculada | **Sí** | No |
| Permisos típicos | `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`, `business_management` | `instagram_business_basic`, `instagram_business_manage_insights` |
| **Business Discovery** (competidores, M4) | **Sí** ⚠️ verificar | No confirmado / históricamente no ⚠️ |
| Hashtag search, más metadata de negocio | Sí ⚠️ | Limitado ⚠️ |
| Fricción para el cliente | Mayor (tener Página + vincular) | Menor |
| Configuración multi-cuenta (agencia con varios clientes) | Mejor (`business_management`, activos del BM) | Una cuenta por login |

**Decisión recomendada:** **Facebook Login for Business como ruta principal** (la necesitamos para M4). Instagram Login como alternativa futura para M3 si un cliente no tiene Página ⚠️. En el onboarding (M1) guiar al cliente a vincular IG ↔ Página si no lo está.

### Paso 5 — Permisos por módulo

| Módulo | Permiso | Para qué | Advanced Access |
|---|---|---|---|
| M2 | `pages_show_list` | Listar las páginas del usuario para elegir la vinculada al IG | Sí |
| M2 | `business_management` | Leer activos del Business Manager del cliente/agencia | Sí (puede pedir verificación adicional ⚠️) |
| M2/M3 | `instagram_basic` | Perfil y media de la cuenta IG propia | Sí |
| M3 | `instagram_manage_insights` | Insights de cuenta y de media (alcance, views, guardados, compartidos) | Sí |
| M3 | `pages_read_engagement` | Leer contenido/metadata de la página y requisito para IG vinculado | Sí |
| M4 | `instagram_basic` + `pages_read_engagement` (+ `instagram_manage_insights` según doc ⚠️) | **Business Discovery** sobre cuentas públicas Business/Creator | Sí |
| M12 (Etapa 3) | `ads_read` ⚠️ | Gasto y resultados de campañas propias (ROAS/CPA) | Sí — App Review **separado** cuando llegue Etapa 3 |
| M12 (Etapa 3) | Conversions API (token de sistema del dataset del cliente) | Enviar eventos de compra | Depende del flujo ⚠️ |

> **Pedir solo lo que se usa.** Pedir permisos de más es causa común de rechazo. `ads_read`/`ads_management` **no** van en la primera revisión.

### Paso 6 — Business Discovery: qué da y qué no

Consulta tipo (Graph API, desde el IG Business ID del cliente):

```
GET /{ig-user-id}?fields=business_discovery.username(competidor){
  username,name,biography,website,followers_count,follows_count,media_count,profile_picture_url,
  media.limit(25){id,caption,media_type,media_product_type,like_count,comments_count,permalink,timestamp,media_url}
}
```

| Da ✅ | NO da ❌ |
|---|---|
| followers_count, follows_count, media_count | Alcance, impresiones, views/reproducciones de terceros ⚠️ |
| Bio, website, nombre, foto | Guardados, compartidos |
| Posts: caption, tipo, like_count*, comments_count, permalink, timestamp, media_url | Retención de video, demografía de audiencia |
| Paginación de media histórica | Historias, cuentas privadas o personales |
| | Comentarios completos de terceros (texto) ⚠️ |

\* `like_count` puede venir oculto si el dueño ocultó los likes ⚠️.

**Implicancias de producto (M4):**
- Crecimiento de seguidores = **snapshots diarios** nuestros (la API no da histórico).
- "Engagement" de competidores = (likes + comentarios) / seguidores — aclararlo en la UI.
- Para reels de competidores, las views no están garantizadas → priorizar likes/comentarios y análisis de contenido (M6).
- La consulta se hace **con el token de una cuenta cliente** → consume el rate limit de esa cuenta.

### Paso 7 — Requisitos legales y técnicos previos al envío

- [ ] **Política de privacidad** pública (en nuestro dominio, accesible sin login, en español e idealmente inglés) que explique qué datos de Meta usamos, para qué, retención y borrado. Ver [privacidad-datos.md](privacidad-datos.md).
- [ ] **Términos y Condiciones** públicos.
- [ ] **Data Deletion**: *Data Deletion Callback URL* (endpoint que recibe `signed_request`, borra datos y devuelve URL de estado + código de confirmación) **o** página con instrucciones de borrado. Recomendado: callback.
- [ ] **Deauthorize callback** (al desconectar la App): marcar la cuenta como desconectada y frenar jobs.
- [ ] Ícono, categoría, email de contacto, dominio de la App.
- [ ] Plataforma web con URL de producción y HTTPS.
- [ ] Usuario de prueba / credenciales para el revisor: una cuenta en Jeder AI con datos cargados + IG Business de prueba vinculado a una Página de prueba ⚠️ (Meta pide poder reproducir el flujo).

### Paso 8 — App Review: la presentación

Para **cada permiso**:

| Elemento | Qué poner |
|---|---|
| Descripción de uso | 2–4 frases: qué hace el usuario, qué dato leemos, qué valor le damos. En inglés. Concreto. |
| Screencast | Video (1–3 min, inglés en subtítulos o UI en inglés ayuda ⚠️) mostrando: login → pantalla de consentimiento → selección de página/IG → **dónde se ve el dato** que habilita ese permiso |
| Instrucciones de prueba | Paso a paso con URL, usuario y contraseña de prueba |

**Guion de screencast (plantilla):**
1. Abrir `app.<dominio>` en navegador limpio, login con usuario de prueba.
2. Ir a "Conectar Instagram" → botón Facebook Login for Business.
3. Mostrar pantalla de permisos de Meta completa (no saltear).
4. Elegir Página + IG de prueba → volver a la App.
5. Mostrar la pantalla que usa el permiso (p.ej. "Mi Contenido" con insights para `instagram_manage_insights`).
6. Para Business Discovery: escribir el @ de un competidor público y mostrar los datos.
7. Mostrar desconexión / borrado de datos.

**Causas típicas de rechazo** (y prevención):

| Causa | Prevención |
|---|---|
| El screencast no muestra el uso del permiso | Un video por permiso, señalando el dato en pantalla |
| No se puede reproducir (credenciales rotas, App en mantenimiento) | Probar las instrucciones con alguien externo antes de enviar |
| Política de privacidad incompleta o inaccesible | Revisar con checklist del Paso 7; URL pública |
| Permisos pedidos sin uso visible | Quitar todo lo que no se usa en el MVP |
| UI solo en español sin explicación | Subtítulos en inglés o toggle de idioma en la demo ⚠️ |
| Business no verificado | Hacerlo en S0 |

### Paso 9 — Tech Provider

- Somos **Tech Provider**: ofrecemos tecnología a otros negocios que conectan **sus** activos de Meta a nuestra App.
- Requisitos habituales ⚠️: Business Verification + App Review con Advanced Access + cumplir Platform Terms y Developer Policies. En algunos productos (notablemente WhatsApp) existe un proceso formal de "Become a Tech Provider"; para Instagram Graph el rol está implícito en la App de tipo Business con Advanced Access ⚠️ verificar.
- Meta puede pedir **Access Verification** adicional para apps que acceden a activos de otros negocios con permisos como `business_management` ⚠️.
- Mantener el **Data Use Checkup** anual (certificación de uso de datos) al día ⚠️ — si no se completa, Meta puede restringir la App.

### Paso 10 — Pasar a Live y operar

- [ ] App Mode → **Live**.
- [ ] Monitorear el panel de la App (alertas de Meta, cambios de política, deprecaciones).
- [ ] Suscribirse al changelog de la Graph API; fijar versión de API en `packages/meta-graph` y planificar upgrades (cada versión vive ~2 años ⚠️).

---

## 4. Rate limits

| Tipo | Cómo funciona (resumen) ⚠️ | Implicancia |
|---|---|---|
| Instagram Platform (BUC) | Llamadas por cuenta IG en ventana de 24 h, proporcional a la actividad/impresiones de la cuenta (fórmula tipo 4.800 × impresiones ⚠️) | Cuentas chicas tienen menos cupo → Business Discovery de 10 competidores diarios debe ser eficiente |
| Pages / Graph API | Por app y por usuario/página | Header `X-App-Usage` / `X-Business-Use-Case-Usage` |
| Errores | Códigos 4, 17, 32, 613, 80002 ⚠️ indican throttling | Backoff exponencial, reintento diferido |

**Buenas prácticas (implementar en `packages/meta-graph`):**
- [ ] Leer headers de uso en cada respuesta y guardar % consumido por cuenta.
- [ ] Cola BullMQ con concurrencia por cuenta IG (no por tenant).
- [ ] Pedir solo campos necesarios; usar `limit` y paginación con cursor.
- [ ] Snapshots de competidores **una vez por día**, en horario de baja carga, distribuidos.
- [ ] Cachear Business Discovery por `username` y compartir entre cuentas del mismo tenant (mismo competidor seguido por varios clientes) ⚠️ revisar que no contradiga políticas de uso de datos.
- [ ] Si una cuenta llega a 80% del cupo → pausar jobs no críticos de esa cuenta.

---

## 5. Tokens y renovación

| Token | Duración típica ⚠️ | Uso |
|---|---|---|
| User access token short-lived | ~1–2 h | Recibido en el OAuth; canjear de inmediato |
| User access token long-lived | ~60 días | Guardar cifrado; renovar antes de vencer |
| Page access token (derivado de long-lived user token) | Sin vencimiento mientras el usuario mantenga permisos ⚠️ | Llamadas de página/IG |
| System user token (Business Manager) | Sin vencimiento / configurable | Integraciones del cliente con su BM (p.ej. CAPI en M12) |

**Implementación:**
- [ ] Tokens cifrados en DB (AES-GCM con clave en env/secret manager), nunca en logs.
- [ ] Job diario: tokens que vencen en < 10 días → intentar refresh; si falla, notificar a la agencia y al cliente ("Reconectá tu Instagram").
- [ ] Manejar errores 190 (token inválido) y 10/200 (permiso revocado) → marcar cuenta `needs_reauth`.
- [ ] Al recibir deauthorize/data deletion → borrar tokens y datos según política.

---

## 6. Checklist maestro

### Antes de desarrollar (S0)
- [ ] Entidad legal y Business Manager en orden.
- [ ] Business Verification iniciada.
- [ ] App creada (dev), Facebook Login for Business configurado, redirect URIs.
- [ ] Clientes piloto agregados como testers.

### Antes de enviar App Review (S5)
- [ ] Política de privacidad, TyC y data deletion publicados.
- [ ] Callback de data deletion y deauthorize funcionando en producción.
- [ ] Usuario de prueba + IG/Página de prueba con datos.
- [ ] Un screencast por permiso.
- [ ] Solo permisos usados en el MVP.
- [ ] Descripciones de uso en inglés.
- [ ] Business Verification **aprobada**.

### Después de aprobar
- [ ] App en Live.
- [ ] Monitoreo de rate limits y tokens.
- [ ] Recordatorio anual de Data Use Checkup ⚠️.
- [ ] Plan de App Review adicional para `ads_read` en Etapa 3 (M12).

---

## Fuentes

- Meta — Instagram Platform overview: https://developers.facebook.com/documentation/instagram-platform/overview
- Meta — Instagram API with Facebook Login: https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login
- Meta — Instagram API with Instagram Login (Business Login): https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login
- Meta — Become a Tech Provider (WhatsApp, referencia del proceso): https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/get-started-for-tech-providers
- Guía de terceros sobre scopes de IG (Phyllo): https://www.getphyllo.com/post/instagram-api-permissions-scopes
- Proceso de Access Verification (Zeta, terceros): https://products.zetaglobal.com/selligent/EN/Content/Engage/Admin%20Configuration/Details/MetaTechProviderAccessVerificationProcess.htm

> ⚠️ No confirmado en esta revisión (verificar en la doc oficial al enviar): lista exacta de permisos requeridos por Business Discovery, si Instagram Login soporta Business Discovery hoy, fórmula exacta de rate limits, duración de tokens, y si existe un "Become a Tech Provider" formal fuera de WhatsApp.
