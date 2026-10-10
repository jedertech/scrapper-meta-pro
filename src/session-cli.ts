import { createInterface } from 'node:readline';
import { join } from 'node:path';
import { PlaywrightExtractor, scrollBudgetForTarget } from './extractors.js';
import { exportBase, exportJob } from './exporter.js';
import { acquireBrowserSessionLock } from './session-lock.js';
import { runSessionSlice } from './session-runner.js';
import { Storage } from './storage.js';
import type { DiagnosticEvent } from './diagnostics.js';
import { progressLine, progressWriter } from './progress.js';
import type { Readable, Writable } from 'node:stream';
import type { EventEmitter } from 'node:events';
import { acquireProfileLock, prepareProfile, type ProfileKind } from './browser-profiles.js';
import { BrowserHealth } from './browser-health.js';
import type { Mode } from './types.js';

export interface PersistentSessionOptions {
  // Offline tests may provide a source and terminal; production always owns Playwright.
  iterator?: AsyncGenerator<import('./types.js').ExtractBatch>;
  input?: Readable;
  output?: Writable;
  signals?: EventEmitter;
  profile?: ProfileKind;
  mode?: Mode;
}

export async function startPersistentSession(storage:Storage,dataDir:string,base:string,url:string,target:number,
  onDiagnostic:(event:DiagnosticEvent)=>void, options:PersistentSessionOptions={}):Promise<void> {
  storage.baseId(base);
  const releaseLock=acquireBrowserSessionLock(dataDir);
  let releaseProfileLock:()=>void=()=>{};
  let profile:ReturnType<typeof prepareProfile>|null=null;
  try {if(!options.iterator) {releaseProfileLock=acquireProfileLock();profile=prepareProfile(options.profile??'main');}}
  catch(error) {releaseProfileLock();releaseLock();throw error;}
  const controller=new AbortController();
  let running=false,paused=false,closing=false,ended=false,pauseRequested=false,commandBusy=false;
  const pendingJobs:string[]=[];
  const signals=options.signals??process;
  let finish!:()=>void;
  const finished=new Promise<void>(resolve=>{finish=resolve;});
  const io=createInterface({input:options.input??process.stdin,output:options.output??process.stdout});
  const writeProgress=progressWriter();
  const health=new BrowserHealth();
  let activeJobId:string|null=null,lastExport:string|null=null,sessionState='RUNNING';
  const recordDiagnostic=(event:DiagnosticEvent)=>{const tagged={...event,jobId:activeJobId??undefined};health.observe(tagged);onDiagnostic(tagged);};
  let mainPageClosed=false,browserNeedsReopen=false,intentionalBrowserClose=false;
  const makeExtractor=()=>new PlaywrightExtractor('chromium',scrollBudgetForTarget(target),{
    headless:false,persistentSession:true,onDiagnostic:recordDiagnostic,
    profileDir:profile?.path,
    onPageClosed:()=>{if(closing||ended||intentionalBrowserClose) return;mainPageClosed=true;console.log('La pestaña principal se cerró. El trabajo permanece en SQLite; r reabrirá el perfil y la búsqueda.');}
  });
  let extractor=makeExtractor();
  let iterator=options.iterator??extractor.iterate(url,null,controller.signal);
  const menu=()=>console.log('Sesión pausada: r pendiente; +N nuevo tramo; e exportar; h salud; p esperar; q cerrar.');
  let pausedMenuTimer:ReturnType<typeof setTimeout>|undefined;
  const showHealth=()=>{
    const browser=extractor.browserState;
    health.setLifecycle(browser.process,browser.context,browser.page);
    let job:ReturnType<Storage['job']>|null=null;
    let baseStats:{ads:number;advertisers:number}|null=null;
    let sqlite='unavailable';
    try {
      sqlite=storage.integrity();
      job=activeJobId?storage.job(activeJobId):null;
      baseStats=storage.stats(base) as {ads:number;advertisers:number};
    } catch {/* Browser Health remains available if SQLite is inaccessible. */}
    console.log(JSON.stringify({session:sessionState,profile:options.profile??'main',browser:health.snapshot,
      sqlite,job:job?{id:job.id,status:job.status,mode:job.mode,uniqueAds:job.unique_ads,newAdvertisers:job.new_advertisers,
        pending:Math.max(0,job.target_total-(job.mode==='advertisers'?job.new_advertisers:job.unique_ads)),duplicates:job.duplicate_ads}:null,
      base:baseStats,lastExport},null,2));
  };
  const requestPause=()=>{
    if(closing||ended) return;
    if(running) {
      if(pauseRequested) return;
      pauseRequested=true;extractor.pause();console.log('Pausando y guardando el progreso confirmado...');
    }
    else if(!pausedMenuTimer) pausedMenuTimer=setTimeout(()=>{pausedMenuTimer=undefined;if(!closing&&!ended&&!running) menu();},50);
  };
  const onSigint=()=>requestPause();
  const onSigterm=()=>{void closeSession();};
  const cleanup=()=>{
    if(ended) return;
    ended=true;
    signals.removeListener('SIGINT',onSigint);
    signals.removeListener('SIGTERM',onSigterm);
    signals.removeListener('SIGHUP',onSigterm);
    if(pausedMenuTimer) clearTimeout(pausedMenuTimer);
    io.close();
    try {profile?.cleanup();}
    finally {releaseProfileLock();releaseLock();finish();}
  };
  async function closeSession():Promise<void> {
    if(closing) return;
    closing=true;sessionState='USER_STOPPED';controller.abort();
    if(running) return;
    try {await iterator.return(undefined);} catch {/* already closed */}
    cleanup();
  }
  async function readyOrReopen():Promise<boolean> {
    if(options.iterator) return true;
    const state=extractor.browserState;
    if(mainPageClosed||extractor.accessRestricted||state.process==='closed'||state.context==='closed'||state.page==='closed') {
      intentionalBrowserClose=true;
      try {await iterator.return(undefined);} catch {/* previous attempt closed */}
      finally {intentionalBrowserClose=false;mainPageClosed=false;}
      browserNeedsReopen=true;
    }
    if(browserNeedsReopen) {
      extractor=makeExtractor();
      iterator=extractor.iterate(url,null,controller.signal);
      browserNeedsReopen=false;
      console.log('Se reabrirá el perfil y la búsqueda desde el inicio. SQLite deduplicará los anuncios ya guardados.');
      return true;
    }
    return extractor.readyForResume();
  }
  async function runSlice(count:number,resumeJobId?:string):Promise<void> {
    if(running||closing||ended) return;
    running=true;paused=false;pauseRequested=false;sessionState='RUNNING';
    extractor.resume();
    try {
      const job=resumeJobId?storage.job(resumeJobId):storage.createJob(base,url,options.mode??'ads','playwright','chromium',count);
      activeJobId=job.id;
      const startingAds=job.unique_ads;
      const startingObserved=job.observed;
      const metric=job.mode==='advertisers'?'anunciantes confirmados':'anuncios';
      console.log(`Ejecución ${job.id}: ${job.target_total-(job.mode==='advertisers'?job.new_advertisers:job.unique_ads)} ${metric} nuevos pendientes. Ctrl+C o p pausa sin cerrar Chromium.`);
      const started=performance.now();
      const result=await runSessionSlice(storage,job.id,iterator,controller.signal,()=>pauseRequested,
        updated=>{const stats=storage.stats(base) as {ads:number;advertisers:number};
          writeProgress(progressLine(updated,stats.ads,stats.advertisers,(performance.now()-started)/1000,startingAds,startingObserved));});
      if(process.stdout.isTTY) process.stdout.write('\n');
      const path=exportJob(storage,job.id,join(dataDir,'exports'));
      lastExport=path;
      const label=result.job.status==='COMPLETED'?'TARGET_REACHED':result.job.status;
      sessionState=label;
      const achieved=result.job.mode==='advertisers'?result.job.new_advertisers:result.job.unique_ads;
      const remaining=Math.max(0,result.job.target_total-achieved);
      const baseStats=storage.stats(base) as {ads:number;advertisers:number};
      console.log(`${label}: ${baseStats.ads} anuncios guardados en ${base}; ${achieved}/${result.job.target_total} ${metric} nuevos en el tramo; ${result.job.unique_ads} anuncios nuevos; ${remaining} pendientes; ${result.job.duplicate_ads} duplicados; CSV ${path}`);
      if(result.job.status==='GRAPHQL_ERROR') console.log('Podés recargar manualmente la página. La recarga no reinicia el scraper; escribí r cuando esté lista.');
      if(result.job.status==='COMPLETED') {
        const index=pendingJobs.indexOf(job.id);if(index>=0) pendingJobs.splice(index,1);
      } else if(['GRAPHQL_ERROR','USER_PAUSED','STALLED','ACCESS_DENIED','RATE_LIMITED'].includes(result.job.status) && remaining>0 && !pendingJobs.includes(job.id)) pendingJobs.push(job.id);
      if(mainPageClosed) {
        try {await iterator.return(undefined);} catch {/* closed during page loss */}
        mainPageClosed=false;
        browserNeedsReopen=true;
      }
      paused=true;
      if(!['COMPLETED','GRAPHQL_ERROR','USER_PAUSED','STALLED','ACCESS_DENIED','RATE_LIMITED'].includes(result.job.status)) closing=true;
      if(['ACCESS_DENIED','RATE_LIMITED'].includes(result.job.status))
        console.log('Acceso restringido: no habrá más solicitudes automáticas. Revisá la pestaña manualmente; r inicia un intento explícito con el perfil guardado.');
    } catch(error) {
      console.error(error instanceof Error?error.message:String(error));
      sessionState='FAILED';
      closing=true;
    } finally {
      running=false;
      if(closing) {
        controller.abort();
        try {await iterator.return(undefined);} catch {/* browser already closed */}
        cleanup();
      } else {extractor.pause();menu();}
    }
  }
  io.on('line',line=>{
    const command=line.trim().toLowerCase();
    if(command==='p') requestPause();
    else if(command==='q'||command==='4') void closeSession();
    else if(command==='e'||command==='2') {try {lastExport=exportBase(storage,base,join(dataDir,'exports'));console.log(`CSV base: ${lastExport}`);}catch(error){console.error(error);}}
    else if(command==='h') {try {showHealth();}catch(error){console.error(error instanceof Error?error.message:String(error));}}
    else if(command==='r' && paused && !running && !commandBusy) {
      const id=pendingJobs.at(-1);
      if(!id) console.log('No hay objetivo pendiente. Usá +N para comenzar otro tramo.');
      else {commandBusy=true;void (async()=>{
        try {
          if(!(await readyOrReopen())) {console.log('La pestaña no está lista o hay una restricción de acceso. Revisala manualmente; no se enviaron solicitudes.');return;}
          await runSlice(0,id);
        } finally {commandBusy=false;}
      })();}
    }
    else if(command==='1') console.log('Ingresá +N, por ejemplo +500.');
    else if(command==='3') menu();
    else if(/^\+\d+$/.test(command) && paused && !running && !commandBusy) {
      const count=Number(command.slice(1));
      if(Number.isSafeInteger(count)&&count>0) {commandBusy=true;void (async()=>{
        try {
          if(!(await readyOrReopen())) {console.log('La pestaña no está lista o hay una restricción de acceso. No se enviaron solicitudes.');return;}
          if(pendingJobs.length) console.log(`Hay ${pendingJobs.length} objetivo(s) pendientes; se conservan para r después del nuevo tramo.`);
          await runSlice(count);
        } finally {commandBusy=false;}
      })();}
      else console.log('Ingresá +N con un entero positivo.');
    } else menu();
  });
  io.on('SIGINT',onSigint);
  io.on('close',()=>{void closeSession();});
  signals.on('SIGINT',onSigint);
  signals.on('SIGTERM',onSigterm);
  signals.on('SIGHUP',onSigterm);
  console.log('Sesión visible única. Comandos: Ctrl+C/p pausa; r pendiente; +N nuevo tramo; e exporta; h salud; q cierra.');
  void runSlice(target);
  await finished;
}
