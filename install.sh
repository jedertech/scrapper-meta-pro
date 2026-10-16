#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$project_dir"

echo "=== Instalador Meta Ads Library Scraper ==="
echo "Verificando entorno Node.js..."

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Error: Se requiere Node.js (versión 22.13 o superior) y npm." >&2
  exit 1
fi

node -e 'const [major,minor]=process.versions.node.split(".").map(Number);if(major<22||(major===22&&minor<13))process.exit(1)' || {
  echo "Error: Se requiere Node.js 22.13 o superior. Versión actual: $(node -v)" >&2
  exit 1
}

echo "1/3 Instalando dependencias de Node..."
npm install

echo "2/3 Instalando Chromium y dependencias de sistema de Playwright..."
export PLAYWRIGHT_BROWSERS_PATH="$project_dir/.playwright-browsers"
npx playwright install --with-deps chromium

echo "3/3 Compilando TypeScript..."
npm run build

chmod +x jedertech.sh meta-scraper

echo ""
echo "========================================================="
echo " ✔ Instalación completada con éxito."
echo " Para iniciar el asistente interactivo ejecuta:"
echo "   ./jedertech.sh"
echo "========================================================="
