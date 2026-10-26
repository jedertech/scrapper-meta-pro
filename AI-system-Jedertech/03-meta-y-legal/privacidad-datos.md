# Privacidad y protección de datos — Jeder AI

> ⚠️ **Esto NO es asesoramiento legal.** Es un mapa de trabajo para que Sergio diseñe el sistema con privacidad desde el inicio y para que el dueño de Jedertech sepa qué validar con un abogado especializado en datos personales **antes de Etapa 2** (venta a agencias externas).
> Las leyes citadas cambian (varias reformas en curso en la región). Verificar vigencia al momento de redactar los documentos finales.

---

## 1. Roles: quién es responsable de qué

| Rol (terminología GDPR / LATAM) | Quién | Ejemplo |
|---|---|---|
| **Responsable** (controller / responsable del tratamiento / titular de la base) | La **agencia** respecto de los datos de sus clientes; el **infoproductor** respecto de sus compradores (M12) | La agencia decide analizar la cuenta de @coachlaura |
| **Encargado** (processor / encargado del tratamiento) | **Jedertech** (Jeder AI) | Procesamos por cuenta de la agencia |
| **Subencargados** | Proveedores de Jedertech | Supabase, Vercel, Railway/Fly, Anthropic, proveedor de transcripción, Cloudflare R2, Resend, Stripe, PostHog, Sentry, proveedores de proxy/Apify |
| **Responsable directo** | Jedertech, respecto de: datos de facturación y usuarios de la agencia; y de clientes **self-serve** (Etapa 4) | |

> Esta separación se formaliza en el **DPA** (§6). En self-serve (Etapa 4), Jedertech pasa a ser responsable frente al infoproductor.

---

## 2. Leyes aplicables (resumen)

| País | Norma principal | Autoridad | Puntos clave para nosotros |
|---|---|---|---|
| **Argentina** | **Ley 25.326** de Protección de Datos Personales (+ Dec. 1558/2001) | AAIP (Agencia de Acceso a la Información Pública) | Consentimiento informado; derechos de acceso, rectificación y supresión; **registro de bases de datos** ante la AAIP ⚠️; transferencia internacional solo a países "adecuados" o con cláusulas contractuales (modelos AAIP); medidas de seguridad. Reforma en discusión ⚠️. AR adhirió al Convenio 108 ⚠️ |
| **México** | **LFPDPPP** (nueva ley publicada en 2025 ⚠️ que reemplazó a la de 2010; el INAI fue extinguido y sus funciones pasaron a otra autoridad federal ⚠️) | Secretaría designada ⚠️ verificar | **Aviso de privacidad** obligatorio (integral/simplificado); derechos ARCO; consentimiento; transferencias a terceros requieren informarse en el aviso; remisiones a encargados por contrato |
| **Colombia** | **Ley 1581 de 2012** + Decreto 1377/2013 (compilado en Dec. 1074/2015) | SIC (Superintendencia de Industria y Comercio) | Autorización previa, expresa e informada; **política de tratamiento** obligatoria; **RNBD** (Registro Nacional de Bases de Datos) para ciertas empresas según activos ⚠️; transmisión a encargados con contrato |
| **Chile** | Ley 19.628 (vigente) → **Ley 21.719** (nueva ley, publicada dic. 2024, entra en vigencia ~dic. 2026 ⚠️) | Nueva Agencia de Protección de Datos Personales | La nueva ley se parece al GDPR: bases de licitud, derechos ARCO+portabilidad, multas significativas, deber de seguridad y notificación de brechas. **Diseñar ya para la nueva ley** |
| **Perú** | Ley 29.733 + Reglamento (nuevo reglamento 2024–2025 ⚠️) | ANPD (MINJUSDH) | Consentimiento; registro de bancos de datos; flujo transfronterizo informado |
| **Uruguay** | Ley 18.331 | URCDP | Considerado adecuado por la UE; requisitos similares |
| **Brasil** (si aplica) | **LGPD** — Lei 13.709/2018 | ANPD | Aplica si tratamos datos de personas en Brasil (agencias con clientes BR, compradores BR en M12, expansión Etapa 4+). Bases legales, DPO (encarregado), RIPD |
| **UE** (si aplica) | GDPR | Autoridades nacionales | Solo si hay usuarios/compradores en la UE (posible en M12 o España en el futuro) |

### Denominador común (diseñar para esto)

- [ ] Base legal / consentimiento informado para cada tratamiento.
- [ ] Aviso / política de privacidad clara y accesible.
- [ ] Derechos de acceso, rectificación, supresión, oposición (ARCO) y portabilidad → **flujo interno para atenderlos en ≤ 10–15 días hábiles** ⚠️ (plazos varían por país).
- [ ] Contratos con encargados y subencargados.
- [ ] Transferencias internacionales informadas (nuestros proveedores están mayormente en EE.UU.).
- [ ] Medidas de seguridad técnicas y organizativas.
- [ ] Registro de bases donde sea obligatorio (AR, CO, PE ⚠️).
- [ ] Notificación de brechas (obligatoria en varias jurisdicciones; plan de respuesta listo).

---

## 3. Qué datos guardamos

| Categoría | Datos | Origen | ¿Personal? | Módulo | Sensibilidad |
|---|---|---|---|---|---|
| Usuarios de la plataforma | Nombre, email, rol, idioma, logs de acceso | Registro | Sí | Auth, M11 | Media |
| Facturación | Razón social, ID fiscal, email de facturación (tarjeta la guarda Stripe/MP) | Checkout | Sí (si es persona física) | Billing | Media |
| Tokens de Meta | Access tokens de usuario/página | OAuth (M2) | Credencial | M2 | **Alta** (cifrado) |
| Datos de la cuenta IG/FB del cliente | Perfil, posts, captions, métricas, insights agregados | Graph API | Sí si el infoproductor es persona física (marca personal) | M3 | Media |
| Audiencia del cliente | Insights **agregados** (edad/género/ciudad en rangos) — **no** perfiles individuales de seguidores | Graph API | No identificable (agregado) | M3 | Baja |
| Competidores (IG) | Perfil público y posts de cuentas Business/Creator | Business Discovery | Sí (marcas personales públicas) | M4 | Baja–media |
| Anuncios públicos | Anunciante, texto, CTA, URL, fechas | Biblioteca pública (scraping) | Sí si el anunciante es persona | M5 | Baja–media |
| Videos | Archivos de video (propios y de competidores) | Descarga | Contiene imagen/voz de personas | M6 | Media (TTL) |
| Transcripciones y análisis | Texto, hooks, ángulos | Derivado | Puede contener nombres | M6 | Baja–media |
| Perfil de Marca | Nicho, avatar, oferta, tono, competidores | Usuario (chat M1) | Puede incluir datos del negocio | M1, todos | Media |
| Conversaciones de chat | Mensajes del usuario y respuestas AI | Usuario | Puede incluir cualquier cosa | M1, M7 | Media |
| **Ventas (M12, Etapa 3)** | Email, nombre, teléfono, monto, producto, UTMs de **compradores del infoproductor** | Webhooks Hotmart/Kiwify/Eduzz/Stripe/MP | **Sí — datos de terceros** | M12 | **Alta** |
| Analytics de producto | Eventos de uso (PostHog), errores (Sentry) | Instrumentación | Seudónimo | Todos | Baja (sin PII en eventos) |

### Principios de minimización

- [ ] **No** guardar datos individuales de seguidores ni de comentaristas (solo conteos y, si se analiza, texto sin identificar ⚠️).
- [ ] **No** pedir permisos de Meta que no se usan.
- [ ] En M12: guardar email/teléfono **hasheados** (SHA-256 normalizado, como pide CAPI) cuando sea posible; datos en claro solo si el cliente necesita verlos y con acceso restringido.
- [ ] Sentry/PostHog **sin PII** (scrubbing de emails, tokens, captions).
- [ ] Prompts a LLM: enviar solo lo necesario; Anthropic API no usa datos de la API para entrenar por defecto ⚠️ verificar términos comerciales vigentes y mencionarlo en la política.

---

## 4. Retención

| Dato | Retención propuesta ⚠️ | Mecanismo |
|---|---|---|
| Videos descargados (M6) | **7–30 días** (TTL) | Lifecycle rule en R2 / Supabase Storage |
| Transcripciones y análisis | Mientras la cuenta cliente esté activa + 30 días | Borrado en cascada |
| Snapshots de competidores (M4) | 24 meses (para tendencias) | Job de purga mensual |
| Anuncios scrapeados (M5) | 12–24 meses | Job de purga |
| Datos de cuenta IG propia (M3) | Mientras esté conectada + 30 días | Cascada al desconectar |
| Tokens de Meta | Hasta desconexión/deauthorize/vencimiento | Borrado inmediato al desconectar |
| Chats | 12 meses o hasta borrado de la cuenta | Purga |
| Ventas M12 | Según contrato con el cliente (default 24 meses) ⚠️ | Purga + hashing |
| Logs de acceso/seguridad | 6–12 meses | Rotación |
| Facturación | Lo que exija la ley fiscal de cada país (≥ 5–10 años ⚠️) | Archivo separado |
| Backups | 7–30 días rolling | Proveedor |
| Al terminar contrato con una agencia | Exportación disponible 30 días → borrado total ≤ 60 días | Procedimiento documentado |

---

## 5. Política de privacidad requerida por Meta (App Review)

Debe estar **publicada, pública (sin login) y en nuestro dominio**, y cubrir como mínimo ⚠️:

- [ ] Quiénes somos (razón social, contacto, país).
- [ ] Qué datos obtenemos de Meta (Facebook/Instagram) y **para qué** exactamente (por permiso: perfil, media, insights, páginas, Business Discovery).
- [ ] Que no vendemos datos de Meta ni los usamos para publicidad de terceros.
- [ ] Con quién compartimos (subencargados por categoría: hosting, AI, transcripción, email, pagos).
- [ ] Transferencias internacionales.
- [ ] Retención (tabla resumida de §4).
- [ ] Derechos del usuario y **cómo ejercerlos** (email/formulario).
- [ ] **Cómo borrar datos**: desconectar en la app + Data Deletion Callback + email.
- [ ] Seguridad (cifrado de tokens, acceso restringido).
- [ ] Cambios a la política y fecha de última actualización.
- [ ] Versión en español (principal) y en inglés (para el revisor de Meta) ⚠️ recomendado.

### Marca blanca y política de privacidad

- La política de Jeder AI está en **nuestro** dominio neutro (la que ve Meta).
- Cada agencia debe tener su **propia política/aviso** frente a sus clientes, mencionando que usa un proveedor tecnológico (encargado). Entregamos un **modelo** en el kit de onboarding (ver [../01-comercial/modelo-marca-blanca.md](../01-comercial/modelo-marca-blanca.md)).

---

## 6. DPA con agencias (Acuerdo de Encargo de Tratamiento)

Anexo obligatorio al contrato de marca blanca. Contenido mínimo:

| Cláusula | Contenido |
|---|---|
| Objeto y duración | Tratamiento por cuenta de la agencia durante el contrato |
| Naturaleza y finalidad | Análisis de contenido, competencia, generación de guiones, reportes, tracking (si contrata M12) |
| Tipos de datos y titulares | Tabla de §3 |
| Instrucciones | Solo tratamos según instrucciones documentadas de la agencia (configuración de la plataforma) |
| Confidencialidad | Personal con deber de confidencialidad |
| Seguridad | Cifrado en tránsito (TLS) y en reposo, RLS por tenant, tokens cifrados, 2FA para admins, backups, mínimo privilegio |
| Subencargados | Lista publicada; aviso de cambios con 30 días; derecho de objeción |
| Transferencias internacionales | Proveedores en EE.UU./UE; cláusulas contractuales donde aplique |
| Asistencia en derechos ARCO | Herramientas de exportación/borrado + soporte en ≤ 5 días hábiles ⚠️ |
| Brechas | Notificar a la agencia sin dilación indebida (objetivo ≤ 48–72 h) |
| Fin del contrato | Devolución/exportación y borrado (§4) |
| Auditoría | Información razonable a pedido; certificaciones de proveedores |
| Responsabilidades de la agencia | Base legal y consentimiento de sus clientes; no conectar cuentas sin autorización; informar a sus clientes |

---

## 7. Borrado de datos (flujos)

| Disparador | Qué pasa | Plazo objetivo |
|---|---|---|
| Usuario desconecta IG en la app | Revocar/borrar tokens; frenar jobs; marcar datos para borrado | Inmediato (tokens); 30 días (datos) |
| **Deauthorize callback** de Meta | Igual que arriba | Inmediato |
| **Data Deletion Request callback** de Meta | Verificar `signed_request`; borrar datos del `user_id`; devolver `{ url, confirmation_code }` con página de estado | Respuesta inmediata; borrado ≤ 30 días ⚠️ |
| Agencia elimina una cuenta cliente | Borrado en cascada (posts, insights, snapshots asociados, videos, chats, Perfil de Marca) | ≤ 30 días |
| Agencia termina contrato | Exportación 30 días → borrado total | ≤ 60 días |
| Pedido ARCO de un titular (p.ej. un comprador en M12) | Vía agencia/infoproductor (responsable) o directo a privacidad@ | Según ley (≈ 10–20 días hábiles ⚠️) |

### Checklist técnico

- [ ] Endpoint `/api/meta/data-deletion` (POST, `signed_request` validado con App Secret).
- [ ] Endpoint `/api/meta/deauthorize`.
- [ ] Página `/data-deletion-status?code=...`.
- [ ] Borrado en cascada probado con test automatizado (crear cuenta → borrar → verificar 0 filas por `account_id` en todas las tablas).
- [ ] Borrado también en storage (videos) y en caches (Redis).
- [ ] Log de auditoría del borrado (sin el dato borrado).

---

## 8. Seguridad mínima (checklist)

- [ ] RLS en Postgres por `tenant_id` en todas las tablas con datos de clientes; tests de aislamiento entre tenants.
- [ ] Tokens de Meta y webhooks secrets cifrados (AES-GCM) con clave fuera de la DB.
- [ ] 2FA obligatorio para admins de agencia y de Jedertech.
- [ ] Mínimo privilegio en accesos a producción; nadie consulta datos de clientes sin ticket.
- [ ] Secrets solo en variables de entorno / secret manager.
- [ ] Dependencias actualizadas y escaneo de vulnerabilidades en CI.
- [ ] Plan de respuesta a incidentes (quién, cómo se notifica, plantillas).
- [ ] Registro de actividades de tratamiento (documento vivo, este archivo sirve de base).

---

## 9. Pendientes para el abogado (antes de Etapa 2)

- [ ] Redactar política de privacidad (ES/EN) y TyC de Jeder AI.
- [ ] Redactar DPA modelo y modelo de aviso de privacidad para agencias.
- [ ] Confirmar obligaciones de registro de bases (AAIP en AR, RNBD en CO, PE).
- [ ] Mecanismo de transferencia internacional válido para AR (cláusulas modelo AAIP) y resto.
- [ ] Estado de la nueva LFPDPPP (MX) y autoridad competente.
- [ ] Preparación para Ley 21.719 (CL).
- [ ] Encuadre de M5 (datos públicos de anuncios scrapeados) y M4 (Business Discovery).
- [ ] M12: base legal para tratar datos de compradores; contrato con el infoproductor.

Relacionado: [meta-app-review-y-permisos.md](meta-app-review-y-permisos.md) · [ads-library-y-scraping.md](ads-library-y-scraping.md) · [../06-tracking/tracking-infoproductores.md](../06-tracking/tracking-infoproductores.md).
