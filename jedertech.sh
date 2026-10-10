#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$project_dir"
export PLAYWRIGHT_BROWSERS_PATH="$project_dir/.playwright-browsers"
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo 'Se necesita Node.js 22.13+ y npm.' >&2
  exit 1
fi
node -e 'const [major,minor]=process.versions.node.split(".").map(Number);if(major<22||(major===22&&minor<13))process.exit(1)' || {
  echo 'Se necesita Node.js 22.13 o posterior.' >&2
  exit 1
}
if ! npm ls --depth=0 --silent >/dev/null 2>&1; then
  read -r -p 'Faltan dependencias del proyecto. ¿Instalarlas con npm ci? [s/N] ' answer
  [[ "$answer" =~ ^[sS]$ ]] || exit 1
  npm ci
fi
if node scripts/needs-build.mjs; then npm run build --silent; fi
if [[ ! -x ./meta-scraper ]]; then
  echo 'No se encontró la CLI del proyecto.' >&2
  exit 1
fi
browser_ok="$(./meta-scraper doctor | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>{try{const x=JSON.parse(s);process.stdout.write(String(x.browsers.find(b=>b.name==="chromium")?.installed===true))}catch{process.stdout.write("false")}})')"
if [[ "$browser_ok" != true ]]; then
  read -r -p 'Falta Chromium compatible con Playwright. ¿Instalarlo dentro del proyecto? [s/N] ' answer
  [[ "$answer" =~ ^[sS]$ ]] || exit 1
  ./node_modules/.bin/playwright install chromium
  ./meta-scraper doctor | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>{if(!JSON.parse(s).browsers.find(b=>b.name==="chromium")?.installed)process.exit(1)})'
fi
exec node --disable-warning=ExperimentalWarning dist/wizard.js
