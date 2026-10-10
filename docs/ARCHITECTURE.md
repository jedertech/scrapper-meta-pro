# Arquitectura v1

`CLI/menú → Playwright → tarjetas y JSON recibido → normalización → SQLite → CSV`.

Una sesión persistente conserva un iterador, una pestaña y un contexto aislado. Cada `+N` crea un trabajo asociado a la misma base y continúa el iterador. `session-runner` confirma lotes en transacciones SQLite; el bloqueo de sesión evita dos procesos propietarios. El cierre guarda trabajos y anuncios, pero no promete recuperar la posición visual. `resume --job` usa un navegador nuevo.

Una sola SQLite mantiene bases lógicas mediante `database_ads` y `database_advertisers`, junto a `jobs`, `observations`, `searches` y `checkpoints`. Se conserva este diseño porque ya contiene datos reales y garantiza deduplicación y exportación histórica sin migración riesgosa. `ad_id` es la clave estable del anuncio; `meta_page_id` puede ser nulo; `advertiser_id` puede ser provisional. `source_searches` conserva procedencia por base.

`Storage.baseAdRows()` es el punto de lectura para filtros futuros. `destination_kind` se deriva localmente en exportación y no resuelve redirecciones. La clasificación comercial, el enriquecimiento y Twenty quedan fuera de este módulo.
