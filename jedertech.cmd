@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
if errorlevel 1 exit /b 1
set "PLAYWRIGHT_BROWSERS_PATH=%CD%\.playwright-browsers"
where node >nul 2>&1
if errorlevel 1 (echo Falta Node.js 22.13 o posterior. & exit /b 1)
where npm >nul 2>&1
if errorlevel 1 (echo Falta npm. & exit /b 1)
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=13)?0:1)"
if errorlevel 1 (echo Se necesita Node.js 22.13 o posterior. & exit /b 1)
call npm ls --depth=0 --silent >nul 2>&1
if errorlevel 1 (
  set /p "ANSWER=Faltan dependencias. Instalar con npm ci? [s/N] "
  if /I not "!ANSWER!"=="s" exit /b 1
  call npm ci
  if errorlevel 1 exit /b 1
)
node scripts\needs-build.mjs
if not errorlevel 1 (
  call npm run build --silent
  if errorlevel 1 exit /b 1
)
node -e "const{chromium}=require('playwright');process.exit(require('fs').existsSync(chromium.executablePath())?0:1)"
if errorlevel 1 (
  set /p "ANSWER=Falta Chromium compatible con Playwright. Instalar en este proyecto? [s/N] "
  if /I not "!ANSWER!"=="s" exit /b 1
  call node_modules\.bin\playwright.cmd install chromium
  if errorlevel 1 exit /b 1
)
node --disable-warning=ExperimentalWarning dist\wizard.js
exit /b %errorlevel%
