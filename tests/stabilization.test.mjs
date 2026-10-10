import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync, unlinkSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';
import { Storage } from '../dist/storage.js';
import { normalize } from '../dist/normalize.js';
import { exportBase, exportJob } from '../dist/exporter.js';
import { classifyDestination } from '../dist/destination.js';
import { GraphqlHealth } from '../dist/graphql-health.js';
import { runSessionSlice } from '../dist/session-runner.js';
import { startPersistentSession } from '../dist/session-cli.js';
import { PassThrough } from 'node:stream';
import { EventEmitter } from 'node:events';
import { formatProject } from '../dist/project-format.js';
import { extractionCommand } from '../dist/wizard-choices.js';
import { graphqlErrorDetail } from '../dist/extractors.js';
import { progressLine } from '../dist/progress.js';

const url='https://www.facebook.com/ads/library/?country=AR&q=curso';
const ad=id=>({id:String(id),page_id:'98765',page_name:'Anunciante',description:`Curso ${id}`,cta_url:'https://example.org/track?id='+id});
const setup=()=>{const dir=mkdtempSync(join(tmpdir(),'meta-stable-'));const storage=new Storage(join(dir,'db.sqlite'));storage.createBase('nicho');return {dir,storage};};

test('el asistente envía una extracción visible nueva a la sesión persistente',()=>{
  assert.equal(extractionCommand(true,null),'session');
  assert.equal(extractionCommand(false,null),'run');
  assert.equal(extractionCommand(true,'job_anterior'),'resume');
});

test('tres errores GraphQL consecutivos y reinicio tras lote válido',()=>{
  const health=new GraphqlHealth();
  assert.equal(health.observe('other',true,0),0);
  assert.equal(health.observe('AdLibrarySearchPaginationQuery',true,0),1);
  assert.equal(health.observe('AdLibrarySearchPaginationQuery',true,0),2);
  assert.equal(health.observe('AdLibrarySearchPaginationQuery',false,9),0);
  for(let n=1;n<=3;n++) assert.equal(health.observe('AdLibrarySearchPaginationQuery',true,0),n);
});

test('GraphQL: errores intermitentes, aviso al tercero y pausa al quinto sin progreso',()=>{
  const health=new GraphqlHealth();
  for(let i=0;i<2;i++) health.observe('AdLibrarySearchPaginationQuery',true,0);
  assert.equal(health.shouldWarn,false);assert.equal(health.shouldPause,false);
  health.observe('AdLibrarySearchPaginationQuery',false,1);
  assert.equal(health.consecutiveErrors,0);
  for(let i=0;i<5;i++) {
    health.observe('AdLibrarySearchPaginationQuery',true,0);
    assert.equal(health.shouldPause,false);
    health.observe('AdLibrarySearchPaginationQuery',false,1);
  }
  for(let i=1;i<=5;i++) {
    health.observe('AdLibrarySearchPaginationQuery',true,0);
    assert.equal(health.shouldWarn,i===3);
    assert.equal(health.shouldPause,i>=5);
  }
  health.manualResume();
  assert.equal(health.consecutiveErrors,5);assert.equal(health.shouldPause,false);
  health.observe('AdLibrarySearchPaginationQuery',true,0);
  assert.equal(health.errorsThisAttempt,1);
  health.observe('AdLibrarySearchPaginationQuery',false,1);
  assert.equal(health.consecutiveErrors,0);
});

test('GraphQL HTTP 200 con error registra código y mensaje saneado sin cuerpo sensible',()=>{
  const detail=graphqlErrorDetail('{"errors":[{"code":123,"message":"secret-token-xyz https://example.org/?key=abc user@example.org"}]}');
  assert.match(detail,/error_code:123/);
  assert.match(detail,/error_message:/);
  assert.doesNotMatch(detail,/secret-token|example\.org|key=abc|user@/);
});

test('destinos se clasifican sin seguir redirecciones ni inventar URL',()=>{
  for(const [value,kind] of [[null,'unknown'],['javascript:alert(1)','unknown'],['https://wa.me/123','whatsapp'],
    ['https://m.me/page','messenger'],['https://instagram.com/foo','instagram'],['https://fb.me/abc','internal'],
    ['https://track.example.org/?to=unknown','website']]) assert.equal(classifyDestination(value),kind);
});

test('exportación histórica y acumulativa conserva conteos, nombres y colisiones',()=>{
  const {dir,storage}=setup();try {
    const first=storage.createJob('nicho',url,'ads','playwright','chromium',3);
    storage.persistBatch(first.id,[normalize(ad('100001'),'playwright','AR'),normalize(ad('100002'),'playwright','AR')],null);
    const second=storage.createJob('nicho',url+'&x=2','ads','playwright','chromium',3);
    storage.persistBatch(second.id,[normalize(ad('100002'),'playwright','AR'),normalize(ad('100003'),'playwright','AR')],null);
    storage.status(first.id,'COMPLETED','test');storage.status(second.id,'COMPLETED','test');
    const root=join(dir,'exports');
    const one=exportJob(storage,first.id,root),two=exportJob(storage,first.id,root),whole=exportBase(storage,'nicho',root);
    assert.notEqual(one,two);assert.match(basename(one),/^\d{2}-\d{2}-\d{2}_job_/);
    assert.equal(readdirSync(join(root,basename(join(one,'..')))).length,3);
    const csv=path=>readFileSync(join(path,'ads.csv'),'utf8');
    assert.equal(csv(one).split('\r\n').length-2,2);
    assert.equal(csv(whole).split('\r\n').length-2,3);
    assert.match(csv(whole),/destination_kind,needs_enrichment/);
    assert.match(csv(whole),/website/);
    assert.equal(storage.adRows(first.id).length,2);
    assert.equal(storage.stats('nicho').ads,3);
    assert.equal(storage.integrity(),'ok');
  }finally{storage.close();}
});

test('sesión conserva datos ante error GraphQL y puede continuar mismo iterador',async()=>{
  const {storage}=setup();try {
    async function* source(){yield {ads:[ad('200001')],cursor:null,exhausted:false};yield {ads:[],cursor:null,exhausted:false,outcome:'GRAPHQL_ERROR'};yield {ads:[ad('200002')],cursor:null,exhausted:false};}
    const iterator=source();const a=storage.createJob('nicho',url,'ads','playwright','chromium',2);
    const result=await runSessionSlice(storage,a.id,iterator,new AbortController().signal,()=>false);
    assert.equal(result.job.status,'GRAPHQL_ERROR');assert.equal(result.job.unique_ads,1);assert.equal(result.iteratorDone,false);
    const b=storage.createJob('nicho',url,'ads','playwright','chromium',1);
    const resumed=await runSessionSlice(storage,b.id,iterator,new AbortController().signal,()=>false);
    assert.equal(resumed.job.status,'COMPLETED');assert.equal(storage.stats('nicho').ads,2);
    await iterator.return();
  }finally{storage.close();}
});

test('sesión visible con objetivo de anunciantes cuenta IDs confirmados y muestra métrica correcta',async()=>{
  const {dir,storage}=setup();const input=new PassThrough(),output=new PassThrough(),signals=new EventEmitter();
  async function* source(){
    yield {ads:[ad('710001'),ad('710002')],cursor:null,exhausted:false};
    yield {ads:[{...ad('710003'),page_id:'98766'}],cursor:null,exhausted:false};
  }
  try {
    const task=startPersistentSession(storage,dir,'nicho',url,2,()=>{},
      {iterator:source(),input,output,signals,mode:'advertisers'});
    await until(()=>storage.jobs()[0]?.status==='COMPLETED');
    const job=storage.jobs()[0];
    assert.equal(job.unique_ads,3);assert.equal(job.new_advertisers,2);
    assert.match(progressLine(job,3,2,1),/2\/2 anunciantes confirmados nuevos/);
    assert.match(progressLine({...job,unique_ads:2101,observed:2201},2101,1020,60,2043,2101),/58\.0 nuevos\/min; 100\.0 observados\/min/);
    input.write('q\n');await task;
  }finally{input.destroy();output.destroy();storage.close();}
});

test('restricción 403 conserva trabajo y menú hasta reanudación explícita',async()=>{
  const {dir,storage}=setup();const input=new PassThrough(),output=new PassThrough(),signals=new EventEmitter();
  async function* source(){
    yield {ads:[ad('299001')],cursor:null,exhausted:false};
    yield {ads:[],cursor:null,exhausted:false,outcome:'ACCESS_ERROR',accessStatus:403,stopReason:'HTTP 403'};
    yield {ads:[ad('299002')],cursor:null,exhausted:false};
  }
  try {
    const task=startPersistentSession(storage,dir,'nicho',url,2,()=>{},
      {iterator:source(),input,output,signals});
    await until(()=>storage.jobs()[0]?.status==='ACCESS_DENIED');
    assert.equal(storage.jobs()[0].unique_ads,1);
    input.write('r\n');
    await until(()=>storage.jobs()[0]?.status==='COMPLETED');
    assert.equal(storage.stats('nicho').ads,2);
    input.write('q\n');await task;
  } finally {input.destroy();output.destroy();storage.close();}
});

async function until(check,limit=2000){
  const start=Date.now();
  while(!check()) {if(Date.now()-start>limit) throw new Error('La sesión no alcanzó el estado esperado');await new Promise(r=>setTimeout(r,10));}
}

test('objetivo alcanzado mantiene proceso, ventana lógica y acepta +N, e y q',async()=>{
  const {dir,storage}=setup();
  const input=new PassThrough(),output=new PassThrough();let returned=false,settled=false,advanced=0;
  async function* source(){try {advanced++;yield {ads:[ad('300001')],cursor:null,exhausted:false};advanced++;yield {ads:[ad('300002')],cursor:null,exhausted:false};}finally{returned=true;}}
  try {
    const task=startPersistentSession(storage,dir,'nicho',url,1,()=>{}, {iterator:source(),input,output}).then(()=>{settled=true;});
    await until(()=>storage.jobs().length===1&&storage.jobs()[0].status==='COMPLETED');
    assert.equal(settled,false);assert.equal(returned,false);assert.equal(advanced,1);
    const dateDir=join(dir,'exports',readdirSync(join(dir,'exports'))[0]);
    const before=readdirSync(dateDir).length;
    input.write('e\n');
    await until(()=>readdirSync(dateDir).length>before);
    assert.equal(returned,false);
    input.write('+1\n');
    await until(()=>storage.jobs().length===2&&storage.jobs().every(j=>j.status==='COMPLETED'));
    assert.equal(advanced,2);assert.equal(storage.stats('nicho').ads,2);assert.equal(settled,false);
    input.write('q\n');await task;assert.equal(returned,true);assert.equal(settled,true);
  }finally{input.destroy();output.destroy();storage.close();}
});

test('GRAPHQL_ERROR conserva proceso y permite reintento manual en el mismo iterador',async()=>{
  const {dir,storage}=setup();
  const input=new PassThrough(),output=new PassThrough();let returned=false,settled=false,advanced=0;
  async function* source(){try {advanced++;yield {ads:[],cursor:null,exhausted:false,outcome:'GRAPHQL_ERROR'};advanced++;yield {ads:[ad('400001')],cursor:null,exhausted:false};}finally{returned=true;}}
  try {
    const task=startPersistentSession(storage,dir,'nicho',url,1,()=>{}, {iterator:source(),input,output}).then(()=>{settled=true;});
    await until(()=>storage.jobs().length===1&&storage.jobs()[0].status==='GRAPHQL_ERROR');
    assert.equal(settled,false);assert.equal(returned,false);assert.equal(advanced,1);
    input.write('+1\n');
    await until(()=>storage.jobs().length===2&&storage.jobs().some(j=>j.status==='COMPLETED'));
    assert.equal(advanced,2);assert.equal(storage.stats('nicho').ads,1);assert.equal(settled,false);
    input.write('q\n');await task;assert.equal(returned,true);
  }finally{input.destroy();output.destroy();storage.close();}
});

test('150 anuncios y luego +300 continúan en el mismo iterador, sin cerrar la sesión',async()=>{
  const {dir,storage}=setup();
  const input=new PassThrough(),output=new PassThrough();let returned=false,settled=false,visits=0;
  async function* source(){try {for(let i=0;i<450;i++){visits++;yield {ads:[ad(String(500000+i))],cursor:null,exhausted:false};}}finally{returned=true;}}
  try {
    const task=startPersistentSession(storage,dir,'nicho',url,150,()=>{}, {iterator:source(),input,output}).then(()=>{settled=true;});
    await until(()=>storage.jobs().length===1&&storage.jobs()[0].status==='COMPLETED',10000);
    assert.equal(visits,150);assert.equal(returned,false);assert.equal(settled,false);
    input.write('+300\n');
    await until(()=>storage.jobs().length===2&&storage.jobs().every(j=>j.status==='COMPLETED'),20000);
    assert.equal(visits,450);assert.equal(storage.stats('nicho').ads,450);
    assert.equal(returned,false);assert.equal(settled,false);
    input.write('q\n');await task;assert.equal(returned,true);
  }finally{input.destroy();output.destroy();storage.close();}
});

test('SIGINT durante extracción, pausa y reanudación conserva sesión y objetivo',async()=>{
  const {dir,storage}=setup();const input=new PassThrough(),output=new PassThrough(),signals=new EventEmitter();
  let releaseSecond;const gate=new Promise(resolve=>{releaseSecond=resolve;});
  let secondStarted;const waiting=new Promise(resolve=>{secondStarted=resolve;});
  let releaseThird;const thirdGate=new Promise(resolve=>{releaseThird=resolve;});
  let thirdStarted;const thirdWaiting=new Promise(resolve=>{thirdStarted=resolve;});
  let returned=false,settled=false,advanced=0;
  async function* source(){try {
    advanced++;yield {ads:[ad('600001')],cursor:null,exhausted:false};
    secondStarted();await gate;advanced++;yield {ads:[ad('600002')],cursor:null,exhausted:false};
    thirdStarted();await thirdGate;advanced++;yield {ads:[ad('600003')],cursor:null,exhausted:false};
    advanced++;yield {ads:[ad('600004')],cursor:null,exhausted:false};
  }finally{returned=true;}}
  try {
    const task=startPersistentSession(storage,dir,'nicho',url,4,()=>{}, {iterator:source(),input,output,signals}).then(()=>{settled=true;});
    await waiting;
    signals.emit('SIGINT');releaseSecond();
    await until(()=>storage.jobs()[0].status==='USER_PAUSED');
    assert.equal(storage.jobs()[0].unique_ads,2);assert.equal(advanced,2);
    assert.equal(returned,false);assert.equal(settled,false);
    signals.emit('SIGINT');
    assert.equal(returned,false);assert.equal(settled,false);
    input.write('r\n');
    await thirdWaiting;
    signals.emit('SIGINT');releaseThird();
    await until(()=>storage.jobs()[0].status==='USER_PAUSED'&&storage.jobs()[0].unique_ads===3);
    assert.equal(returned,false);assert.equal(settled,false);
    input.write('r\n');
    await until(()=>storage.jobs()[0].status==='COMPLETED');
    assert.equal(storage.jobs().length,1);assert.equal(storage.jobs()[0].unique_ads,4);
    assert.equal(advanced,4);assert.equal(returned,false);assert.equal(settled,false);
    input.write('q\n');await task;assert.equal(returned,true);
  }finally{input.destroy();output.destroy();storage.close();}
});

test('+N conserva objetivo pendiente y r lo completa después sin duplicar',async()=>{
  const {dir,storage}=setup();const input=new PassThrough(),output=new PassThrough(),signals=new EventEmitter();
  let releaseSecond;const gate=new Promise(resolve=>{releaseSecond=resolve;});
  let secondStarted;const waiting=new Promise(resolve=>{secondStarted=resolve;});
  let returned=false;
  async function* source(){try {
    yield {ads:[ad('700001')],cursor:null,exhausted:false};
    secondStarted();await gate;yield {ads:[ad('700002')],cursor:null,exhausted:false};
    yield {ads:[ad('700003')],cursor:null,exhausted:false};
    yield {ads:[ad('700004')],cursor:null,exhausted:false};
  }finally{returned=true;}}
  try {
    const task=startPersistentSession(storage,dir,'nicho',url,3,()=>{}, {iterator:source(),input,output,signals});
    await waiting;
    signals.emit('SIGINT');releaseSecond();
    await until(()=>storage.jobs()[0].status==='USER_PAUSED');
    const original=storage.jobs()[0].id;
    input.write('+1\n');
    await until(()=>storage.jobs().length===2&&storage.jobs().some(j=>j.status==='COMPLETED'));
    assert.equal(storage.job(original).unique_ads,2);
    input.write('r\n');
    await until(()=>storage.job(original).status==='COMPLETED');
    assert.equal(storage.job(original).unique_ads,3);
    assert.equal(storage.stats('nicho').ads,4);
    assert.equal(returned,false);
    input.write('q\n');await task;assert.equal(returned,true);
  }finally{input.destroy();output.destroy();storage.close();}
});

test('objetivo 10000: Ctrl+C tras 2000 y r completa 8000 pendientes en el mismo trabajo',async()=>{
  const {dir,storage}=setup();const input=new PassThrough(),output=new PassThrough(),signals=new EventEmitter();
  let releasePause;const pauseGate=new Promise(resolve=>{releasePause=resolve;});
  let reachedPause;const pauseReady=new Promise(resolve=>{reachedPause=resolve;});
  let returned=false;
  async function* source(){try {
    yield {ads:Array.from({length:2000},(_,i)=>ad(String(800000+i))),cursor:null,exhausted:false};
    reachedPause();await pauseGate;
    yield {ads:[],cursor:null,exhausted:false,outcome:'USER_PAUSED'};
    yield {ads:Array.from({length:8000},(_,i)=>ad(String(802000+i))),cursor:null,exhausted:false};
  }finally{returned=true;}}
  try {
    const task=startPersistentSession(storage,dir,'nicho',url,10000,()=>{}, {iterator:source(),input,output,signals});
    await pauseReady;signals.emit('SIGINT');releasePause();
    await until(()=>storage.jobs()[0]?.status==='USER_PAUSED',60000);
    const id=storage.jobs()[0].id;
    assert.equal(storage.job(id).unique_ads,2000);assert.equal(returned,false);
    input.write('r\n');
    await until(()=>storage.job(id).status==='COMPLETED',60000);
    assert.equal(storage.jobs().length,1);assert.equal(storage.job(id).unique_ads,10000);
    assert.equal(storage.stats('nicho').ads,10000);assert.equal(returned,false);
    input.write('q\n');await task;assert.equal(returned,true);
  }finally{input.destroy();output.destroy();storage.close();}
});

test('tras una recarga simulada, r deduplica anuncios previos y cuenta solo nuevos',async()=>{
  const {dir,storage}=setup();const input=new PassThrough(),output=new PassThrough(),signals=new EventEmitter();
  let releasePause;const gate=new Promise(resolve=>{releasePause=resolve;});
  let waiting;const ready=new Promise(resolve=>{waiting=resolve;});
  async function* source(){
    yield {ads:[ad('900001')],cursor:null,exhausted:false};
    waiting();await gate;yield {ads:[],cursor:null,exhausted:false,outcome:'USER_PAUSED'};
    yield {ads:[ad('900001'),ad('900002'),ad('900003')],cursor:null,exhausted:false};
  }
  try {
    const task=startPersistentSession(storage,dir,'nicho',url,3,()=>{}, {iterator:source(),input,output,signals});
    await ready;signals.emit('SIGINT');releasePause();
    await until(()=>storage.jobs()[0]?.status==='USER_PAUSED');
    input.write('r\n');
    await until(()=>storage.jobs()[0]?.status==='COMPLETED');
    assert.equal(storage.jobs()[0].unique_ads,3);
    assert.equal(storage.jobs()[0].duplicate_ads,1);
    assert.equal(storage.stats('nicho').ads,3);
    input.write('q\n');await task;
  }finally{input.destroy();output.destroy();storage.close();}
});

test('formatear exige confirmación, rechaza sesión activa y borra solo datos del proyecto',()=>{
  const root=mkdtempSync(join(tmpdir(),'meta-format-'));
  mkdirSync(join(root,'src'));writeFileSync(join(root,'src','storage.ts'),'source');writeFileSync(join(root,'package.json'),'{}');
  const data=join(root,'data'),storage=new Storage(join(data,'meta-scraper.sqlite'));
  storage.createBase('nicho');
  const job=storage.createJob('nicho',url,'ads','playwright','chromium',1);
  assert.equal(storage.acquire(job.id,'test-owner'),true);
  storage.close();
  for(const name of ['exports','diagnostics','research']) {mkdirSync(join(root,name));writeFileSync(join(root,name,'artifact'),'x');}
  assert.throws(()=>formatProject(root,'no'),/cancelado/);
  assert.ok(existsSync(join(data,'meta-scraper.sqlite')));
  const lock=join(data,'.browser-session.lock');writeFileSync(lock,String(process.pid));
  assert.throws(()=>formatProject(root,'FORMATEAR'),/sesión visible activa/);unlinkSync(lock);
  assert.throws(()=>formatProject(root,'FORMATEAR'),/trabajo activo/);
  const reopened=new Storage(join(data,'meta-scraper.sqlite'));reopened.release(job.id,'test-owner');reopened.close();
  const external=mkdtempSync(join(tmpdir(),'meta-outside-'));
  symlinkSync(external,join(root,'extra-link'));
  const exportPath=join(root,'exports');
  // A top-level symlink must never be traversed during cleanup.
  rmSync(exportPath,{recursive:true});symlinkSync(external,exportPath);
  assert.throws(()=>formatProject(root,'FORMATEAR'),/Ruta simbólica/);
  unlinkSync(exportPath);mkdirSync(exportPath);
  const removed=formatProject(root,'FORMATEAR');
  assert.deepEqual(removed,['data','exports','diagnostics','research']);
  assert.ok(existsSync(join(root,'src','storage.ts')));assert.ok(existsSync(join(root,'package.json')));
  assert.ok(!existsSync(data));assert.ok(existsSync(external));
});
