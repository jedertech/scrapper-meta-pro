# JederTech Meta Scraper

> Recolector y analizador local para Meta Ads Library de alto rendimiento, resiliente y 100% privado. Diseñado para ejecutarse sin APIs oficiales pagas, proxies de evasión ni filtración de credenciales.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.13-brightgreen.svg)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/playwright-1.61.1-blue.svg)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🚀 Características Principales

- **Barra de Progreso Dinámica:** Monitoreo en tiempo real en una sola línea del progreso, velocidad de extracción, duplicados detectados y alertas inmediatas en rojo ante fallas, stalls o desconexiones.
- **Limpieza de Memoria en Caliente (DOM Pruning):** Extracción de miles de anuncios en sesiones largas manteniendo el layout transparente para evitar pantallas grises y colapsos de RAM en Chromium.
- **Persistencia y Deduplicación Aislada:** Almacenamiento local mediante SQLite (`node:sqlite`). Cada base de datos lógica deduplica automáticamente los anuncios por ID.
- **Sesión Interactiva con Browser Propio:** Control por teclado para pausar (`Ctrl+C` o `p`), reanudar tramos pendientes (`r`), ampliar el objetivo (`+N`) o exportar sin cerrar el navegador.
- **Exportación Atómica:** Generación instantánea de archivos CSV con sanitización ante inyecciones de fórmulas y reportes en formato JSON.
- **Mapeo de Anunciantes Reales:** Extracción de anuncios únicos y anunciantes confirmados mediante GraphQL y JSON estructurado.

---

## 📋 Requisitos Previos

- **Node.js:** Versión 22.13.0 o superior (compatible con `node:sqlite`).
- **npm:** Gestor de paquetes incluido con Node.js.
- Sistema operativo: **Linux** o **Windows** (WSL/cmd/PowerShell).

---

## 🛠️ Instalación Rápida

Descarga o clona el repositorio y corre el script de instalación automática:

```bash
git clone https://github.com/tu-usuario/scrapper-meta-pro.git
cd scrapper-meta-pro
chmod +x install.sh
./install.sh
```

El script se encargará de instalar las dependencias de Node.js, compilar TypeScript y descargar el binario local de Chromium con sus dependencias de sistema.

---

## 🎯 Modo de Uso

### 1. Asistente Interactivo (Recomendado)

Inicia el entorno visual guiado por menús:

```bash
./jedertech.sh
```

El asistente te permitirá:
1. Crear o seleccionar bases de datos lógicas.
2. Iniciar nuevas búsquedas o reanudar extracciones previas.
3. Exportar resultados a CSV con un solo clic.
4. Inspeccionar la salud de la sesión y diagnósticos.
5. Gestionar perfiles persistentes o temporales.

### 2. Uso mediante CLI Directo

También puedes invocar directamente el binario `./meta-scraper`:

```bash
# Crear una base de datos
./meta-scraper db create e-commerce

# Iniciar una sesión visible con objetivo de 1000 anuncios
./meta-scraper session --url 'https://www.facebook.com/ads/library/?country=AR&q=zapatillas' --limit 1000 --db e-commerce --visible

# Extraer anunciantes confirmados
./meta-scraper session --url 'https://www.facebook.com/ads/library/?country=ALL&q=marketing' --limit 500 --mode advertisers --db e-commerce --visible

# Exportar una base completa a CSV
./meta-scraper export --db e-commerce --format csv

# Verificar estado de navegadores y dependencias
./meta-scraper doctor
```

---

## ⌨️ Controles en la Sesión Persistente

Durante una extracción interactiva en ventana visible, la terminal acepta comandos en tiempo real:

- `Ctrl+C` o `p`: Pausa la extracción de forma segura y preserva el estado en SQLite sin cerrar Chromium.
- `r`: Reanuda la extracción del objetivo pendiente.
- `+N`: Agrega un nuevo tramo de *N* anuncios al trabajo actual.
- `e`: Exporta el progreso actual inmediatamente a CSV.
- `h`: Muestra el snapshot de salud del navegador (Browser Health) sin realizar peticiones de red.
- `q`: Cierra la sesión y el navegador de forma ordenada.

---

## 📂 Estructura del Proyecto

```text
├── data/                  # Almacenamiento local SQLite y exportaciones CSV (ignorado en git)
├── dist/                  # Código JavaScript compilado
├── docs/                  # Documentación técnica y arquitectura
├── profiles/              # Perfiles aislados de navegación
├── src/                   # Código fuente en TypeScript
│   ├── cli.ts             # Punto de entrada de la línea de comandos
│   ├── dom-inspection.ts  # Inspección de DOM y poda de memoria (skeletons transparentes)
│   ├── extractors.ts      # Motor de extracción Playwright y manejo de GraphQL
│   ├── progress.ts        # Renderizado dinámico de la barra de progreso
│   ├── session-cli.ts     # Control interactivo de la sesión en vivo
│   ├── storage.ts         # Capa de persistencia SQLite
│   └── wizard.ts          # Asistente interactivo de consola
├── install.sh             # Script de instalación automática
├── jedertech.sh           # Lanzador del asistente para Linux
└── README.md              # Documentación del proyecto
```

---

## 🔒 Privacidad y Ética

Este software está pensado para investigación, análisis de mercado y auditoría de anuncios públicos. No recopila datos privados de usuarios ni burla barreras de autenticación. Utiliza los datos expuestos públicamente por Meta Ads Library.
