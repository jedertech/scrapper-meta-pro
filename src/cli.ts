#!/usr/bin/env node
import { resolve, join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { chromium, firefox, webkit } from 'playwright';
import { Storage } from './storage.js';
import { validateSearchUrl, redact } from './security.js';
import { PlaywrightExtractor, scrollBudgetForTarget, type ExtractorOptions } from './extractors.js';
import { exitCodeForStatus, errorKind, safeDiagnosticUrl, type DiagnosticEvent } from './diagnostics.js';
import { runJob } from './runner.js';
import { runSessionSlice } from './session-runner.js';
import { exportJob, exportBase } from './exporter.js';
import { AccessError, type Mode } from './types.js';
import { startPersistentSession } from './session-cli.js';
import { progressLine, progressLineGreen, formatSummary, progressWriter } from './progress.js';
import { formatProject } from './project-format.js';
import { openProfile, profileStatus, resetProfile, type ProfileKind } from './browser-profiles.js';

const args = process.argv.slice(2);
const isDebug = args.includes('--debug');
function opt(name: string, fallback?: string): string | undefined { const i=args.indexOf(`--${name}`); return i<0 ? fallback : args[i+1]; }
function number(value: string | undefined, label: string): number { const n=Number(value); if (!Number.isSafeInteger(n)||n<1) throw new Error(`${label} debe ser entero positivo`); return n; }
function help(): void { console.log(`meta-scraper — CLI local para Meta Ads Library

Comandos:
  db create NOMBRE | db delete NOMBRE | db list | db use NOMBRE | db stats NOMBRE
  run --url URL --limit N [--db NOMBRE] [--mode ads|advertisers] [--browser chromium|firefox|webkit] [--visible] [--debug]
  session --url URL --limit N --db NOMBRE --visible [--mode ads|advertisers] [--profile main|temp] [--debug]
  resume --job ID [--target-total N] [--visible] [--debug]
  jobs list | jobs show ID
  export --job ID --format csv | export --db NOMBRE --format csv
  doctor
  profile status | profile open main|temp | profile reset main|temp
  diagnose --url URL [--browser chromium|firefox|webkit] [--check|--authorized]
  paginate-diagnose --url URL --authorized [--keep-open] [--verbose]
  benchmark --url URL --limit N [opciones de run]
  format (borra bases, exportaciones y diagnósticos del proyecto tras confirmar)

Opciones globales: --data-dir RUTA (predeterminado ./data), --debug, --help`); }
function extractor(browser: string, target: number, options: ExtractorOptions = {}, maxScrolls?: number) {
  if (!['chromium','firefox','webkit'].includes(browser)) throw new Error('Navegador inválido');
  const selected={chromium,firefox,webkit}[browser as 'chromium'|'firefox'|'webkit'];
  if (!existsSync(selected.executablePath())) throw new Error(`Navegador ${browser} no instalado; consulte doctor`);
  return new PlaywrightExtractor(browser as 'chromium'|'firefox'|'webkit',maxScrolls??scrollBudgetForTarget(target),options);
}
const visible = args.includes('--visible');
const writeProgress=progressWriter();
let currentLastAction = 'Iniciando...';
function logDiagnostic(event: DiagnosticEvent): void {
  // En modo normal (sin --debug ni --verbose), suprimimos los miles de logs y actualizamos la última acción
  if (event.phase==='dom' && event.detail?.startsWith('pagination_clicked')) currentLastAction = 'Paginación (clic en Ver más)';
  else if (event.phase==='wait' && event.detail?.startsWith('scroll')) currentLastAction = 'Scroll en feed';
  else if (event.phase==='navigation') currentLastAction = 'Navegando página';
  else if (event.phase==='summary' && event.detail?.startsWith('[Storage]')) currentLastAction = 'Persistiendo en SQLite';
  else if (event.phase==='dom' && event.detail?.startsWith('[Memory]')) currentLastAction = 'Limpieza de memoria DOM';

  if (!isDebug && !args.includes('--verbose')) return;

  if (args.includes('--verbose')) { process.stderr.write(`[meta-diagnostic] ${JSON.stringify(event)}\n`); return; }
  const now = new Intl.DateTimeFormat('es-AR',{timeZone:'America/Argentina/Cordoba',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());
  if (event.phase==='navigation' && event.detail==='final_response')
    process.stderr.write(`[${now}] Documento final: HTTP ${event.status}; anuncios detectados: ${event.adsDetected}\n`);
  else if (event.phase==='navigation' && event.detail==='initial_rejection;waiting_for_same_tab_recovery')
    process.stderr.write(`[${now}] Documento inicial: HTTP 403; observando la misma pestaña\n`);
  else if (event.phase==='navigation' && event.detail==='recovered_in_same_tab')
    process.stderr.write(`[${now}] Documento posterior en la misma pestaña: HTTP ${event.status}\n`);
  else if (event.kind==='graphql' && [403,429].includes(event.status??0))
    process.stderr.write(`[${now}] GraphQL: HTTP ${event.status}; se detienen solicitudes nuevas\n`);
  else if (event.kind==='graphql' && event.phase==='json' && event.detail?.startsWith('graphql_warning:'))
    process.stderr.write(`[${now}] Advertencia: ${event.detail.slice('graphql_warning:'.length)} errores GraphQL consecutivos sin anuncios nuevos.\n`);
  else if (event.kind==='graphql' && event.phase==='json' && event.detail?.startsWith('graphql_pause:'))
    process.stderr.write(`[${now}] GraphQL: ${event.detail.slice('graphql_pause:'.length)} errores consecutivos; extracción pausada.\n`);
  else if (event.phase==='dom' && event.detail?.startsWith('pagination_'))
    process.stderr.write(`[${now}] Paginación: ${event.detail}; detectados: ${event.adsDetected}\n`);
  else if (event.phase==='summary')
    process.stderr.write(`[${now}] Fin: ${event.detail}; anuncios detectados: ${event.adsDetected}\n`);
  else if (event.phase==='dom' && event.detail?.startsWith('rejected_document'))
    process.stderr.write(`[${now}] DOM: ${event.detail}; detectados: ${event.adsDetected}\n`);
  else if (event.phase==='wait' && event.detail!=='content_visible')
    process.stderr.write(`[${now}] Espera: ${event.detail}\n`);
}
async function main(): Promise<void> {
  if (args.length===0) { await import('./wizard.js'); return; }
  if (args.includes('--help') || args.includes('-h')) { help(); return; }
  if (args[0]==='format') {
    if (args.length!==1 || !process.stdin.isTTY) throw new Error('Formatear requiere una terminal interactiva y no admite opciones.');
    const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
    const io=createInterface({input:process.stdin,output:process.stdout});
    try {
      console.log('Se borrarán todas las bases, respaldos, CSV, sesiones y diagnósticos de este proyecto. Código y dependencias se conservan.');
      const answer=await io.question('Escribí FORMATEAR para confirmar: ');
      console.log(`Eliminado: ${formatProject(root,answer.trim()).join(', ') || 'no había datos'}`);
    } finally {io.close();}
    return;
  }
  if(args[0]==='profile') {
    const action=args[1];
    if(action==='status') {console.log(JSON.stringify(profileStatus(),null,2));return;}
    const kind=args[2] as ProfileKind;
    if(!['main','temp'].includes(kind)) throw new Error('Elegí perfil main o temp');
    if(action==='open') {
      if(!process.stdin.isTTY) throw new Error('Abrir un perfil requiere terminal interactiva');
      await openProfile(kind);return;
    }
    if(action==='reset') {
      if(!process.stdin.isTTY) throw new Error('Restablecer un perfil requiere terminal interactiva');
      const io=createInterface({input:process.stdin,output:process.stdout});
      try {
        const answer=await io.question(`Borrar solo el perfil ${kind} (cookies y almacenamiento), conservando SQLite. Escribí RESTABLECER ${kind}: `);
        console.log(resetProfile(kind,answer.trim())?'Perfil restablecido.':'El perfil ya estaba vacío.');
      } finally {io.close();}
      return;
    }
    throw new Error('Comando de perfil inválido');
  }
  if (args[0]==='paginate-diagnose') {
    const url=validateSearchUrl(opt('url') ?? '');
    if (!args.includes('--authorized')) {
      console.log(JSON.stringify({mode:'paginate-diagnose',url:safeDiagnosticUrl(url),navigation:1,maxScrolls:8,maxPaginationClicks:1,
        browser:'chromium visible',metaRequests:0,requires:'--authorized'},null,2));
      return;
    }
    let ads=0;let clicks=0;let reason='Sin resultado';
    const selected=extractor('chromium',200,{headless:false,paginationDiagnostic:true,maxPaginationClicks:1,keepOpen:args.includes('--keep-open'),
      onDiagnostic:event=>{logDiagnostic(event);if(event.detail?.startsWith('pagination_clicked')) clicks++;if(event.phase==='summary') reason=event.detail??reason;}},8);
    const controller=new AbortController();process.once('SIGINT',()=>controller.abort());process.once('SIGTERM',()=>controller.abort());
    try {for await (const batch of selected.iterate(url,null,controller.signal)) ads+=batch.ads.length;}
    catch(error) {console.error(redact(error instanceof Error?error.message:error));process.exitCode=1;}
    console.log(JSON.stringify({mode:'paginate-diagnose',adsDetected:ads,paginationClicks:clicks,reason},null,2));
    return;
  }
  if (args[0]==='diagnose') {
    const url=validateSearchUrl(opt('url') ?? '');
    const browser=opt('browser','chromium')!;
    if (args.includes('--check') || !args.includes('--authorized')) {
      console.log(JSON.stringify({mode:'diagnose',url:safeDiagnosticUrl(url),browser,navigations:1,scrolls:0,retries:0,
        profile:'isolated Playwright context',metaRequests:0,requires:'--authorized'},null,2));
      return;
    }
    const events: DiagnosticEvent[] = [];
    const selected=extractor(browser,10,{diagnosticOnly:true,headless:!visible,onDiagnostic:event=>{if (events.length<500) events.push(event);}});
    let adsDetected=0;
    let status: 'PARTIAL'|'ACCESS_DENIED'|'RATE_LIMITED'|'FAILED' = 'PARTIAL';
    let reason: string | null = null;
    try { for await (const batch of selected.iterate(url,null,new AbortController().signal)) adsDetected += batch.ads.length; }
    catch (e) {
      status = e instanceof AccessError && e.status===403 ? 'ACCESS_DENIED' :
        e instanceof AccessError && e.status===429 ? 'RATE_LIMITED' : 'FAILED';
      reason = e instanceof AccessError ? e.message : `diagnostic_${errorKind(e)}`;
    }
    console.log(JSON.stringify({mode:'diagnose',status,reason,adsDetected,events},null,2));
    process.exitCode=exitCodeForStatus(status);
    return;
  }
  const dataDir = resolve(opt('data-dir','data')!);
  const storage = new Storage(join(dataDir,'meta-scraper.sqlite'));
  // Dedup backing outside of RAM: the extractor asks SQLite which of the
  // observed IDs are already known and drops the rest from its in-memory
  // accumulators, so long scrapes do not grow without bound.
  const filterNewAds=(ids:string[])=>storage.filterNewAds(ids);
  try {
    if (args.includes('--method')) throw new Error('La opción --method fue retirada; la extracción usa Playwright');
    const [command,sub] = args;
    if (command==='db') {
      if (sub==='create') { storage.createBase(args[2]!); console.log(`Base creada: ${args[2]}`); }
      else if (sub==='delete') {
        const deleted = storage.deleteBase(args[2]!);
        console.log(deleted ? `Base eliminada: ${args[2]}` : `No se encontró la base: ${args[2]}`);
      }
      else if (sub==='list') console.log(JSON.stringify(storage.listBases(),null,2));
      else if (sub==='use') { storage.useBase(args[2]!); console.log(`Base predeterminada: ${args[2]}`); }
      else if (sub==='stats') console.log(JSON.stringify(storage.stats(args[2]!),null,2));
      else throw new Error('Subcomando db inválido');
    } else if (command==='session') {
      if(!process.stdin.isTTY) throw new Error('La sesión persistente requiere una terminal interactiva');
      if(!visible) throw new Error('La sesión persistente requiere --visible');
      const url=validateSearchUrl(opt('url')??'');
      const limit=number(opt('limit'),'limit');
      const mode=opt('mode','ads') as Mode;
      if(!['ads','advertisers'].includes(mode)) throw new Error('Modo inválido');
      const base=opt('db',storage.defaultBase()??undefined);
      if(!base) throw new Error('Indicá --db NOMBRE');
      const profile=opt('profile','main');
      if(profile!=='main'&&profile!=='temp') throw new Error('Perfil inválido; elegí main o temp');
      await startPersistentSession(storage,dataDir,base,url,limit,logDiagnostic,{profile,mode,debug:isDebug});
    } else if (command==='run' || command==='benchmark') {
      const url=validateSearchUrl(opt('url') ?? ''); const limit=number(opt('limit'), 'limit');
      const mode=opt('mode','ads') as Mode; if (!['ads','advertisers'].includes(mode)) throw new Error('Modo inválido');
      const base=opt('db',storage.defaultBase() ?? undefined); if (!base) throw new Error('Seleccione una base con db use o --db');
      const browser=opt('browser','chromium')!;
      // Fase 4.2: el job se crea primero para obtener su database_id y acotar
      // el dedup solo a los anuncios de esta base, no a toda la tabla ads.
      const job=storage.createJob(base,url,mode,'playwright',browser,limit);
      const filterForThisBase=(ids:string[])=>storage.filterNewAdsForDatabase(job.database_id,ids);
      const selectedExtractor=extractor(browser,limit,{headless:!visible,onDiagnostic:logDiagnostic,filterNewAds:filterForThisBase});
      const startingAds=job.unique_ads;
      const startingObserved=job.observed;
      if (isDebug) console.log(`Trabajo: ${job.id} | navegador: ${browser} (${visible?'visible':'headless'})`);
      const controller=new AbortController(); process.once('SIGINT',()=>controller.abort()); process.once('SIGTERM',()=>controller.abort());
      const runStarted = performance.now();
      const result=await runJob(storage,job.id,selectedExtractor,controller.signal,(updated,seconds)=>{
        if (isDebug) {
          const stats=storage.stats(base) as {ads:number;advertisers:number};
          writeProgress(progressLine(updated,stats.ads,stats.advertisers,seconds,startingAds,startingObserved));
        } else {
          writeProgress(progressLineGreen(updated, currentLastAction));
        }
      },logDiagnostic);
      if(process.stdout.isTTY) process.stdout.write('\x1b[2K\r');
      const elapsedSeconds = (performance.now() - runStarted) / 1000;
      const speed = elapsedSeconds > 0 ? (Math.max(0, result.unique_ads - startingAds) * 60) / elapsedSeconds : 0;
      console.log(formatSummary(result, elapsedSeconds, speed));
      const path=exportJob(storage,job.id,join(dataDir,'exports'));
      console.log(`CSV generado: ${path}`);
      process.exitCode=exitCodeForStatus(result.status);
    } else if (command==='resume') {
      const id=opt('job'); if (!id) throw new Error('--job requerido');
      if (opt('target-total')) storage.setTarget(id,number(opt('target-total'),'target-total'));
      const job=storage.job(id); if (job.method !== 'playwright') throw new Error('Trabajo de un método retirado; cree una nueva búsqueda');
      // Fase 4.2: dedup aislado al database_id del job que se reanuda.
      const filterForResume=(ids:string[])=>storage.filterNewAdsForDatabase(job.database_id,ids);
      const startingAds=job.unique_ads;
      const startingObserved=job.observed;
      const controller=new AbortController(); process.once('SIGINT',()=>controller.abort()); process.once('SIGTERM',()=>controller.abort());
      const resumeStarted = performance.now();
      const result=await runJob(storage,id,extractor(job.browser,job.target_total,{headless:!visible,onDiagnostic:logDiagnostic,filterNewAds:filterForResume}),controller.signal,(updated,seconds)=>{
        if (isDebug) {
          const stats=storage.stats(job.db_name) as {ads:number;advertisers:number};
          writeProgress(progressLine(updated,stats.ads,stats.advertisers,seconds,startingAds,startingObserved));
        } else {
          writeProgress(progressLineGreen(updated, currentLastAction));
        }
      });
      if(process.stdout.isTTY) process.stdout.write('\x1b[2K\r');
      const elapsedSeconds = (performance.now() - resumeStarted) / 1000;
      const speed = elapsedSeconds > 0 ? (Math.max(0, result.unique_ads - startingAds) * 60) / elapsedSeconds : 0;
      console.log(formatSummary(result, elapsedSeconds, speed));
      const path=exportJob(storage,id,join(dataDir,'exports'));
      console.log(`CSV generado: ${path}`);
      process.exitCode=exitCodeForStatus(result.status);
    } else if (command==='jobs') {
      if (sub==='list') console.log(JSON.stringify(storage.jobs(),null,2));
      else if (sub==='show') console.log(JSON.stringify(storage.job(args[2]!),null,2));
      else throw new Error('Subcomando jobs inválido');
    } else if (command==='export') {
      if (opt('format','csv')!=='csv') throw new Error('Solo se admite CSV');
      const id=opt('job'); const base=opt('db');
      if (Boolean(id)===Boolean(base)) throw new Error('Indique exactamente --job o --db');
      console.log(id?exportJob(storage,id,join(dataDir,'exports')):exportBase(storage,base!,join(dataDir,'exports')));
    } else if (command==='doctor') {
      console.log(JSON.stringify({node:process.version,sqlite:storage.integrity(),
        browsers:[chromium,firefox,webkit].map((x,i)=>({name:['chromium','firefox','webkit'][i],installed:existsSync(x.executablePath())}))},null,2));
    } else throw new Error('Comando inválido. Use --help');
  } finally { storage.close(); }
}
main().catch(e=>{ console.error(redact(e instanceof Error ? e.message : e)); process.exitCode=1; });
