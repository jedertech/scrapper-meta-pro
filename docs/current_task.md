# SPRINTS DE DESARROLLO: ENTERPRISE SCRAPER

## FASE ACTUAL: Fase 2 - Optimización de Base de Datos (SQLite Batching)
**Objetivo:** El scraper purga el DOM, pero necesitamos asegurar que la memoria RAM de Node.js no colapse por almacenar miles de objetos en arrays temporales (`seen`, `pending`, `receivedIds`). Debemos manejar los datos en SQLite en lotes.

**Acciones para el Agente (Fase 2):**
1. Investigar: Analiza `src/storage.ts` y la memoria RAM en el Runner.
2. Desarrollar: Implementa el vaciado de arrays temporales una vez confirmados en SQLite para soportar +20k anuncios.
3. Commit & Checkpoint: Sube los cambios atómicos y avisa.

**CRITICO**
1. IDIOMA: SIEMPRE comunícate conmigo y escribe tus planes en tu salida de terminal en ESPAÑOL.
2. LOCALIZACION: No puedes salir de la carpeta del proyecto. 