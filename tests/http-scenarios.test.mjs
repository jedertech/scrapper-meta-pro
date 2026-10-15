import test from 'node:test';
import assert from 'node:assert/strict';
import { PlaywrightExtractor, parseJsonAds } from '../dist/extractors.js';
import { AccessError } from '../dist/types.js';
import { safeDiagnosticUrl, exitCodeForStatus } from '../dist/diagnostics.js';
import { inspectLoadedPage } from '../dist/dom-inspection.js';
import { selectMoreButton, stopReason } from '../dist/pagination.js';

const url='https://www.facebook.com/ads/library/?country=AR&q=zapatos&token=never-log';
const adJson=JSON.stringify({search_results_connection:{edges:[{node:{ad_archive_id:'1234567890',page_id:'123456',page_name:'Ejemplo',snapshot:{body:{text:'Descripción'},page_name:'Ejemplo'}}}]}});
const card={id:'1234567890',text:'Activo',description:'Descripción',links:[
  {text:'Ejemplo',href:'https://www.facebook.com/123456/'},
  {text:'Comprar',href:'https://example.org/'}]};
function reply(status,{path=url,navigation=false,resourceType='fetch',body='',contentType='text/html',postData=null}={}) {
  return {status:()=>status,url:()=>path,ok:()=>status>=200&&status<300,
    request:()=>({isNavigationRequest:()=>navigation,resourceType:()=>resourceType,postData:()=>postData}),
    headers:()=>({'content-type':contentType,'content-length':String(body.length)}),text:async()=>body};
}
async function simulate(config) {
  const diagnostics=[];
  let scrolls=0,closed=0,gotos=0,launchOptions,clicks=0,cycle=0,bodyReads=0,snapshotReads=0,watchReads=0;
  let lastSnapshot=null;
  const clickHandler=async()=>{clicks++;for(const row of Array.isArray(config.responseOnClick)?config.responseOnClick:[config.responseOnClick].filter(Boolean))
        for(const fn of page.listeners.get('response')??[]) fn(row);
      if(config.closeOnClick){page.closed=true;for(const fn of page.listeners.get('close')??[]) fn();}
      if(config.clickTimeout) throw Object.assign(new Error('Timeout'),{name:'TimeoutError'});
      if(config.clickError) throw new Error(config.clickError);};
  const page={
    closed:false,isClosed(){return this.closed;},
    listeners:new Map(),
    on(name,fn){this.listeners.set(name,[...(this.listeners.get(name)??[]),fn]);},
    once(name,fn){this.on(name,fn);},
    route:async()=>{},unroute:async()=>{},url:()=>url,
    async goto(){
      gotos++;
      if(config.closeAfterMs) setTimeout(()=>{this.closed=true;for(const fn of this.listeners.get('close')??[]) fn();},config.closeAfterMs);
      for(const row of config.responses ?? []) for(const fn of this.listeners.get('response')??[]) fn(row);
      for(const row of config.delayedResponses ?? []) setTimeout(()=>{
        for(const fn of this.listeners.get('response')??[]) fn(row);
      },1);
      return config.main;
    },
    async waitForFunction(fn){if(config.waitError) throw config.waitError; if(config.delayed) config.scripts=[config.delayed];
      if(config.closeDuringPaginationWait && clicks>0) {this.closed=true;for(const f of this.listeners.get('close')??[]) f();throw Object.assign(new Error('Target page closed'),{name:'TargetClosedError'});}
      if(config.waitNewIdsTimeout && String(fn).includes('knownIds')) throw Object.assign(new Error('Timeout'),{name:'TimeoutError'});},
    locator(selector){return selector.startsWith('script') ? {evaluateAll:async()=>config.scripts??[]} :
      selector.startsWith('[data-msr-pagination') ? {count:async()=>config.markNotUnique?0:1,
        first:()=>({click:clickHandler})} :
      selector.startsWith('button') ? {nth:()=>({click:clickHandler})} :
      {innerText:async()=>{bodyReads++;if(page.closed) throw Object.assign(new Error('Target page closed'),{name:'TargetClosedError'});return config.body??'';}};},
    evaluate:async(fn)=>{
      if(String(fn).includes('setAttribute')&&String(fn).includes('data-msr-pagination'))
        return selectMoreButton(lastSnapshot??{buttons:[],endOfResults:false,noResultLabels:true});
      if(String(fn).includes('data-msr-pagination')) return undefined; // clearPaginationMark
      if(String(fn).includes('ids.push')&&String(fn).includes("document.querySelectorAll('span')"))
        return config.watchIdsByCheck?.[watchReads++]??(config.cardsByCycle?.[Math.max(0,cycle-1)]??config.cards??[]).map(card=>card.id);
      if(/const controls\s*=/.test(String(fn))) {
        lastSnapshot=config.paginationSnapshotsByRead?.[snapshotReads++]??
          config.paginationSnapshots?.[Math.max(0,cycle-1)]??{buttons:[],endOfResults:false};
        return lastSnapshot;
      }
      if([403,429].includes(config.main?.status()) &&
        ![...(config.responses??[]),...(config.delayedResponses??[])].some(r=>r.request().isNavigationRequest()&&r.ok()))
        return config.inspect??{url,title:'Error',cards:config.cards??[],accessCheckVisible:false};
      const current=config.cardsByCycle?.[cycle]??config.cards??[];cycle++;return current;
    },mouse:{wheel:async()=>{scrolls++;}},
  };
  const browser={isConnected:()=>true,on:()=>{},newContext:async()=>({pages:()=>[],browser:()=>browser,on:()=>{},newPage:async()=>page,close:async()=>{closed++;}}),close:async()=>{closed++;}};
  const types={chromium:{launch:async opts=>{launchOptions=opts;return browser;}}};
  const extractor=new PlaywrightExtractor('chromium',config.maxScrolls??1,{browserTypes:types,diagnosticOnly:config.diagnosticOnly??true,
    paginationDiagnostic:config.paginationDiagnostic??false,persistentSession:config.persistentSession??false,
    keepOpen:config.keepOpen??false,diagnosticSettleMs:config.settleMs??0,
    recoveryWaitMs:config.recoveryWaitMs??0,paginationWaitMs:config.paginationWaitMs??0,
    stalledWaitMs:config.stalledWaitMs??0,maxPaginationClicks:config.maxPaginationClicks,
    headless:config.headless,onDiagnostic:e=>diagnostics.push(e)});
  const batches=[];let error=null,closedWhilePaused=null,scrollsWhilePaused=null;
  try {
    if(config.pauseAfterFirst) {
      const iterator=extractor.iterate(url,null,new AbortController().signal);
      batches.push((await iterator.next()).value);
      extractor.pause();
      if(config.pausedResponse) for(const fn of page.listeners.get('response')??[]) fn(config.pausedResponse);
      batches.push((await iterator.next()).value);
      closedWhilePaused=closed;scrollsWhilePaused=scrolls;
      await iterator.return();
    } else if(config.manualLateResponse) {
      const iterator=extractor.iterate(url,null,new AbortController().signal);
      batches.push((await iterator.next()).value);
      batches.push((await iterator.next()).value);
      for(const fn of page.listeners.get('response')??[]) fn(config.manualLateResponse);
      batches.push((await iterator.next()).value);
      await iterator.return();
    } else for await (const batch of extractor.iterate(url,null,new AbortController().signal)) {
      batches.push(batch);
      if(config.stopOnOutcome && config.stopOnOutcome===batch.outcome) {closedWhilePaused=closed;scrollsWhilePaused=scrolls;break;}
      if(config.maxBatches && batches.length>=config.maxBatches) break;
    }
  }
  catch(e) {error=e;}
  return {batches,error,diagnostics,scrolls,clicks,closed,gotos,launchOptions,bodyReads,closedWhilePaused,scrollsWhilePaused};
}
const main200=()=>reply(200,{navigation:true,resourceType:'document'});

test('1: documento 200 y recurso secundario 404 conservan JSON válido',async()=>{
  const main=main200();const result=await simulate({main,responses:[main,reply(404,{path:'https://www.facebook.com/static/a.js?token=secret',resourceType:'script'})],scripts:[adJson]});
  assert.equal(result.error,null);assert.equal(result.batches[0].ads.length,1);
  assert.equal(result.diagnostics.find(e=>e.status===404).kind,'secondary');
  assert.equal(result.scrolls,0);assert.equal(result.closed,2);
});
test('2: documento 200 y GraphQL 403 conserva anuncio pero detiene nuevas solicitudes',async()=>{
  const main=main200();const result=await simulate({main,responses:[main,reply(403,{path:'https://www.facebook.com/api/graphql/?access_token=secret'})],scripts:[adJson]});
  assert.ok(result.error instanceof AccessError);assert.equal(result.batches[0].ads.length,1);
  assert.equal(result.diagnostics.find(e=>e.status===403).kind,'graphql');
  assert.equal(result.diagnostics.at(-1).adsDetected,1);
});
test('3: documento principal 403 genera ACCESS_DENIED',async()=>{
  const main=reply(403,{navigation:true,resourceType:'document'});const result=await simulate({main,responses:[main]});
  assert.ok(result.error instanceof AccessError);assert.equal(result.error.status,403);assert.equal(result.batches.length,0);
  assert.equal(result.diagnostics.find(e=>e.finalNavigation).status,403);
  assert.ok(result.diagnostics.some(e=>e.detail?.includes('rejected_document;cards:0')));
});
test('403 inicial seguido de documento 200 en la misma pestaña entrega anuncios',async()=>{
  const rejected=reply(403,{navigation:true,resourceType:'document'});
  const recovered=main200();
  const result=await simulate({main:rejected,responses:[rejected,recovered],cards:[card]});
  assert.equal(result.error,null);
  assert.equal(result.batches[0].ads[0].id,'1234567890');
  assert.ok(result.diagnostics.some(e=>e.detail==='initial_rejection;waiting_for_same_tab_recovery'));
  assert.ok(result.diagnostics.some(e=>e.detail==='recovered_in_same_tab'&&e.status===200));
  assert.equal(result.diagnostics.find(e=>e.finalNavigation).status,200);
  assert.equal(result.scrolls,0);
});
test('recuperación tardía de 403 a 200 usa la misma página visible',async()=>{
  const rejected=reply(403,{navigation:true,resourceType:'document'});
  const recovered=main200();
  const result=await simulate({main:rejected,responses:[rejected],delayedResponses:[recovered],
    recoveryWaitMs:50,headless:false,cards:[card]});
  assert.equal(result.error,null);assert.equal(result.batches[0].ads[0].id,'1234567890');
  assert.equal(result.launchOptions.headless,false);assert.equal(result.closed,2);
  assert.equal(result.diagnostics.filter(e=>e.kind==='document'&&e.status===403).length,2);
  assert.ok(result.diagnostics.some(e=>e.detail==='recovered_in_same_tab'&&e.status===200));
});
test('429 principal mantiene parada segura sin esperar recuperación',async()=>{
  const main=reply(429,{navigation:true,resourceType:'document'});
  const result=await simulate({main,responses:[main],recoveryWaitMs:1000});
  assert.ok(result.error instanceof AccessError);assert.equal(result.error.status,429);
  assert.equal(result.scrolls,0);assert.equal(result.batches.length,0);
});
test('sesión persistente conserva navegador ante 403 hasta una orden explícita',async()=>{
  const main=reply(403,{navigation:true,resourceType:'document'});
  const result=await simulate({main,responses:[main],persistentSession:true,recoveryWaitMs:0,stopOnOutcome:'ACCESS_ERROR'});
  assert.equal(result.error,null);
  assert.equal(result.batches.at(-1).accessStatus,403);
  assert.equal(result.closedWhilePaused,0);
  assert.equal(result.gotos,1);
});
test('DOM ya cargado puede contener anuncios parseables aunque el HTTP principal sea 403',async()=>{
  const main=reply(403,{navigation:true,resourceType:'document'});
  const result=await simulate({main,responses:[main],inspect:{url,title:'Biblioteca de anuncios',cards:[card,card],accessCheckVisible:false}});
  assert.ok(result.error instanceof AccessError);assert.equal(result.error.status,403);
  assert.equal(result.batches.length,0);
  assert.ok(result.diagnostics.some(e=>e.detail?.includes('cards:2;unique_ids:1;parsed_ads:1;access_check:false;usable:true')));
  const page={evaluate:async()=>({url,title:'Biblioteca de anuncios',cards:[card,card],accessCheckVisible:false})};
  const inspection=await inspectLoadedPage(page);
  assert.equal(inspection.url,url);assert.equal(inspection.title,'Biblioteca de anuncios');
  assert.deepEqual(inspection.uniqueIds,['1234567890']);
  assert.equal(inspection.ads[0].page_name,'Ejemplo');
  assert.equal(inspection.ads[0].description,'Descripción');
  assert.equal(inspection.ads[0].cta_text,'Comprar');
});
test('4: tarjetas visibles sobreviven a un 404 secundario',async()=>{
  const main=main200();const result=await simulate({main,responses:[main,reply(404,{path:'https://www.facebook.com/asset.css',resourceType:'stylesheet'})],cards:[card]});
  assert.equal(result.error,null);assert.equal(result.batches[0].ads[0].id,'1234567890');
});
test('5: una navegación 403 anterior no reemplaza respuesta final 200',async()=>{
  const main=main200();const result=await simulate({main,responses:[reply(403,{navigation:true,resourceType:'document'}),main],scripts:[adJson]});
  assert.equal(result.error,null);assert.equal(result.batches[0].ads.length,1);
  assert.equal(result.diagnostics.find(e=>e.finalNavigation).status,200);
});
test('6: documento 200 sin anuncios informa DOM vacío',async()=>{
  const main=main200();const result=await simulate({main,responses:[main]});
  assert.equal(result.error,null);assert.equal(result.batches.length,0);
  assert.ok(result.diagnostics.some(e=>e.detail==='dom_no_results'));
});
test('7: anuncio que aparece tras la espera se entrega',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],delayed:adJson});
  assert.equal(result.error,null);assert.equal(result.batches[0].ads.length,1);
});
test('GraphQL 403/429 sin anuncios conserva la causa secundaria',async()=>{
  for (const status of [403,429]) {
    const main=main200();const result=await simulate({main,responses:[main,reply(status,{path:'https://www.facebook.com/api/graphql/'})]});
    assert.ok(result.error instanceof AccessError);assert.equal(result.error.status,status);
    assert.match(result.error.message,/GraphQL secundario/);
  }
});
test('GraphQL 200 posterior no limpia una restricción 403 previa',async()=>{
  const main=main200();const result=await simulate({main,responses:[main,
    reply(403,{path:'https://www.facebook.com/api/graphql/'}),
    reply(200,{path:'https://www.facebook.com/api/graphql/',contentType:'text/plain',body:'{}'})]});
  assert.ok(result.error instanceof AccessError);assert.equal(result.error.status,403);
});
test('403 de recurso estático no invalida documento 200',async()=>{
  const main=main200();const result=await simulate({main,responses:[main,reply(403,{path:'https://www.facebook.com/a.js',resourceType:'script'})],scripts:[adJson]});
  assert.equal(result.error,null);assert.equal(result.batches[0].ads.length,1);
  const empty=await simulate({main,responses:[main,reply(403,{path:'https://www.facebook.com/a.js',resourceType:'script'})]});
  assert.equal(empty.error,null);assert.equal(empty.batches.length,0);
});
test('404 principal se distingue de 404 secundario y registra respuesta final',async()=>{
  const main=reply(404,{navigation:true,resourceType:'document'});
  const result=await simulate({main,responses:[main]});
  assert.match(result.error.message,/HTTP 404 en navegación principal/);
  assert.equal(result.diagnostics.find(e=>e.finalNavigation).status,404);
});
test('una redirección registrada no sustituye la respuesta final',async()=>{
  const redirect=reply(302,{navigation:true,resourceType:'document',path:'https://www.facebook.com/ads/library/?token=secret'});
  redirect.headers=()=>({location:'/ads/library/?other=secret','content-type':'text/html','content-length':'0'});
  const main=main200();const result=await simulate({main,responses:[redirect,main],scripts:[adJson]});
  assert.equal(result.error,null);
  assert.equal(result.diagnostics.find(e=>e.status===302).detail,'redirect_to:https://www.facebook.com/ads/library/');
  assert.equal(result.diagnostics.find(e=>e.finalNavigation).status,200);
});
test('diagnóstico observa respuesta secundaria tardía en la misma sesión sin scroll',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],delayedResponses:[
    reply(404,{path:'https://www.facebook.com/late.css',resourceType:'stylesheet'})],settleMs:10,cards:[card]});
  assert.equal(result.error,null);assert.equal(result.scrolls,0);
  assert.ok(result.diagnostics.some(e=>e.status===404&&e.kind==='secondary'));
  assert.equal(result.batches[0].ads.length,1);
});
test('timeout de espera se registra y permite JSON; página cerrada se propaga',async()=>{
  const main=main200();const timeout=await simulate({main,responses:[main],waitError:Object.assign(new Error('Timeout 10000ms'),{name:'TimeoutError'}),scripts:[adJson]});
  assert.equal(timeout.error,null);assert.equal(timeout.batches[0].ads.length,1);
  assert.ok(timeout.diagnostics.some(e=>e.detail==='content_timeout'));
  const closed=await simulate({main,responses:[main],waitError:Object.assign(new Error('Target page closed'),{name:'TargetClosedError'})});
  assert.equal(closed.error,null);assert.equal(closed.batches.at(-1).outcome,'STALLED');
  assert.ok(closed.diagnostics.some(e=>e.detail==='content_page_closed'));
});
test('JSON inválido se registra sin exponer contenido ni URL sensible',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],scripts:['{"search_results_connection":{malformed}']});
  assert.ok(result.diagnostics.some(e=>e.detail?.startsWith('invalid_json_fragments:')));
  assert.ok(result.diagnostics.every(e=>!JSON.stringify(e).includes('secret')&&!JSON.stringify(e).includes('token=')));
  assert.deepEqual(parseJsonAds('{bad}').ads,[]);
  assert.equal(safeDiagnosticUrl('https://www.facebook.com/api/graphql/?access_token=secret'),'https://www.facebook.com/api/graphql/');
  assert.equal(safeDiagnosticUrl('https://example.org/secret/path'),'[external-resource]');
});
test('estados ACCESS_DENIED, RATE_LIMITED y FAILED devuelven error de proceso',()=>{
  for(const status of ['ACCESS_DENIED','RATE_LIMITED','FAILED']) assert.notEqual(exitCodeForStatus(status),0);
  for(const status of ['COMPLETED','PARTIAL','EXHAUSTED','INTERRUPTED']) assert.equal(exitCodeForStatus(status),0);
});
test('una cancelación previa no abre navegador ni inicia navegación',async()=>{
  let launches=0;
  const controller=new AbortController();controller.abort();
  const extractor=new PlaywrightExtractor('chromium',1,{browserTypes:{chromium:{launch:async()=>{launches++;throw new Error('unexpected launch');}}}});
  const batches=[];
  for await (const batch of extractor.iterate(url,null,controller.signal)) batches.push(batch);
  assert.equal(launches,0);assert.deepEqual(batches,[]);
});
const more={buttons:[{index:2,text:'Ver más',visible:true,belowResults:true}],endOfResults:false};
const another={...card,id:'1234567891'};
test('selector reconoce solo control único debajo de resultados',()=>{
  assert.equal(selectMoreButton(more),2);
  assert.equal(selectMoreButton({buttons:[{...more.buttons[0],belowResults:false}],endOfResults:false}),null);
  assert.equal(selectMoreButton({buttons:[more.buttons[0],{...more.buttons[0],index:3}],endOfResults:false}),null);
  assert.equal(stopReason({newAds:0,moreButton:2,endOfResults:false,restricted:false,cancelled:false,elapsedMs:100,waitLimitMs:1000}),'pagination_pending');
});
test('Ver más carga tarjetas nuevas y diagnóstico pulsa una sola vez',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,paginationDiagnostic:true,maxScrolls:5,
    cardsByCycle:[[card],[card],[card,another]],paginationSnapshots:[more,more]});
  assert.equal(result.error,null);assert.equal(result.clicks,1);
  assert.deepEqual(result.batches.flatMap(b=>b.ads.map(a=>a.id)),[card.id,another.id]);
  assert.ok(result.diagnostics.some(e=>e.detail?.startsWith('pagination_clicked;load_ms:')));
});
test('Ver más sin IDs nuevos termina con motivo concreto y sin repetir clic',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,maxScrolls:5,
    cardsByCycle:[[card],[card],[card]],paginationSnapshots:[more,more],waitNewIdsTimeout:true});
  assert.equal(result.clicks,1);assert.equal(result.batches.at(-1).outcome,'STALLED');
  assert.match(result.batches.at(-1).stopReason,/Ver más no produjo IDs nuevos/);
});
test('carga lenta después de paginar continúa al aparecer IDs durante la espera',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,paginationDiagnostic:true,maxScrolls:5,
    cardsByCycle:[[card],[card],[card],[another]],paginationSnapshots:[more,more],
    watchIdsByCheck:[[],[another.id]],paginationWaitMs:120});
  assert.equal(result.clicks,1);assert.ok(result.batches.some(b=>b.ads.some(a=>a.id===another.id)));
  assert.ok(result.diagnostics.some(e=>e.detail?.startsWith('progress_wait_new_ads;')));
});
test('timeout del clic no descarta tarjetas que llegan después',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,paginationDiagnostic:true,maxScrolls:5,
    cardsByCycle:[[card],[card],[card,another]],paginationSnapshots:[more,more],clickTimeout:true});
  assert.equal(result.error,null);assert.equal(result.clicks,1);
  assert.deepEqual(result.batches.flatMap(b=>b.ads.map(a=>a.id)),[card.id,another.id]);
  assert.ok(result.diagnostics.some(e=>e.detail==='pagination_click_timeout'));
});
test('timeout del clic sin datos termina tras espera acotada y sin segundo clic',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,maxScrolls:5,
    cardsByCycle:[[card],[card],[card]],paginationSnapshots:[more,more],clickTimeout:true});
  assert.equal(result.clicks,1);assert.equal(result.batches.at(-1).outcome,'STALLED');
  assert.match(result.batches.at(-1).stopReason,/Ver más no produjo IDs nuevos/);
});
test('GraphQL 403/429 durante paginación detiene nuevos clics y preserva lote previo',async()=>{
  for(const status of [403,429]) {
    const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,maxScrolls:5,
      cardsByCycle:[[card],[card],[card]],paginationSnapshots:[more,more],
      responseOnClick:reply(status,{path:'https://www.facebook.com/api/graphql/'})});
    assert.ok(result.error instanceof AccessError);assert.equal(result.error.status,status);
    assert.equal(result.clicks,1);assert.equal(result.batches[0].ads[0].id,card.id);
  }
});
test('marca explícita de fin de resultados produce EXHAUSTED sin paginar',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,maxScrolls:4,
    cardsByCycle:[[card],[card]],paginationSnapshots:[{buttons:[],endOfResults:false},{buttons:[],endOfResults:true}]});
  assert.equal(result.error,null);assert.equal(result.clicks,0);
  assert.equal(result.batches.at(-1).exhausted,true);
});
test('cierre durante espera de paginación termina sin volver a leer DOM',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,maxScrolls:5,
    cardsByCycle:[[card],[card]],paginationSnapshots:[more,more],closeOnClick:true});
  assert.equal(result.error,null);assert.equal(result.clicks,1);
  assert.equal(result.bodyReads,2);
  assert.equal(result.batches[0].ads[0].id,card.id);
  assert.equal(result.batches.at(-1).outcome,'STALLED');
  assert.match(result.batches.at(-1).stopReason,/pestaña se cerró/);
});
test('GraphQL de paginación 200 informa tamaño y errores sin registrar cuerpo',async()=>{
  const main=main200();
  const payload='{"errors":[{"message":"sensitive-token-123"}]}';
  const result=await simulate({main,responses:[main],diagnosticOnly:false,maxScrolls:5,
    cardsByCycle:[[card],[card],[card]],paginationSnapshots:[more,more],
    responseOnClick:reply(200,{path:'https://www.facebook.com/api/graphql/?secret=abc',contentType:'application/json',
      body:payload,postData:'fb_api_req_friendly_name=AdLibrarySearchPaginationQuery'}),waitNewIdsTimeout:true});
  assert.equal(result.error,null);assert.equal(result.clicks,1);
  assert.match(result.batches.at(-1).stopReason,/GraphQL devolvió 1 error/);
  const diagnostic=result.diagnostics.find(e=>e.kind==='graphql'&&e.phase==='json'&&e.detail?.startsWith('operation:'));
  assert.match(diagnostic.detail,/operation:AdLibrarySearchPaginationQuery;payload_bytes:\d+;ads_parsed:0;new_ids:0;graphql_errors:true/);
  assert.doesNotMatch(JSON.stringify(result.diagnostics),/sensitive-token|secret=abc/);
});
test('si Ver más desaparece antes del clic no pulsa otro control',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,maxScrolls:4,
    cardsByCycle:[[card],[card]],paginationSnapshotsByRead:[{buttons:[],endOfResults:false},more,{buttons:[],endOfResults:false}]});
  assert.equal(result.clicks,0);assert.equal(result.batches.at(-1).outcome,'STALLED');
  assert.match(result.batches.at(-1).stopReason,/desapareció/);
});
test('keep-open espera el cierre manual antes de cerrar el contexto',async()=>{
  const main=main200();const started=performance.now();
  const result=await simulate({main,responses:[main],cards:[card],keepOpen:true,closeAfterMs:15});
  assert.equal(result.error,null);assert.equal(result.closed,2);
  assert.ok(performance.now()-started>=10);
  assert.ok(result.diagnostics.some(e=>e.detail==='browser_open_until_window_closed_or_ctrl_c'));
});
test('sesión persistente conserva pestaña y procesa GraphQL tardío al reanudar',async()=>{
  const main=main200();
  const later=JSON.stringify({ad_archive_id:'1234567891',page_id:'123456',page_name:'Ejemplo',snapshot:{body:{text:'Más anuncios'}}});
  const result=await simulate({main,responses:[main],diagnosticOnly:false,persistentSession:true,maxScrolls:1,
    cardsByCycle:[[card],[card]],manualLateResponse:reply(200,{path:'https://www.facebook.com/api/graphql/',contentType:'application/json',
      body:later,postData:'AdLibrarySearchPaginationQuery'})});
  assert.equal(result.error,null);
  assert.equal(result.batches[0].ads[0].id,card.id);
  assert.equal(result.batches[1].outcome,'STALLED');
  assert.equal(result.batches[2].ads[0].id,'1234567891');
  assert.equal(result.gotos,1);
  assert.equal(result.closed,2);
});
test('sesión persistente sigue leyendo IDs nuevos al superar el presupuesto inicial de scroll',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,
    persistentSession:true,maxScrolls:1,cardsByCycle:[[card],[another],[another]],stopOnOutcome:'STALLED'});
  assert.equal(result.error,null);
  assert.deepEqual(result.batches.flatMap(batch=>batch.ads.map(ad=>ad.id)),[card.id,another.id]);
  assert.ok(result.scrolls>=1);
});
test('el límite del diagnóstico informa límite y no STALLED',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,paginationDiagnostic:true,maxScrolls:1,cards:[card]});
  assert.equal(result.error,null);
  assert.equal(result.batches.some(batch=>batch.outcome==='STALLED'),false);
  assert.equal(result.diagnostics.at(-1).detail,'diagnostic_limit_reached');
});

test('cinco errores GraphQL HTTP 200 pausan; respuestas tardías no avanzan el contador',async()=>{
  const main=main200();
  const errors=Array.from({length:27},()=>reply(200,{path:'https://www.facebook.com/api/graphql/',
    contentType:'application/json',body:'{"errors":[{"code":42,"message":"Temporal"}]}',
    postData:'AdLibrarySearchPaginationQuery'}));
  const result=await simulate({main,responses:[main],diagnosticOnly:false,persistentSession:true,maxScrolls:5,
    cardsByCycle:[[card],[card]],paginationSnapshots:[more,more],responseOnClick:errors,
    waitNewIdsTimeout:true,stopOnOutcome:'GRAPHQL_ERROR'});
  assert.equal(result.error,null);assert.equal(result.clicks,1);
  assert.equal(result.batches.at(-1).outcome,'GRAPHQL_ERROR');
  assert.equal(result.closedWhilePaused,0);
  assert.equal(result.diagnostics.filter(e=>e.detail?.startsWith('graphql_warning:')).length,1);
  assert.equal(result.diagnostics.filter(e=>e.detail?.startsWith('graphql_pause:')).length,1);
  assert.equal(result.diagnostics.filter(e=>e.detail?.startsWith('operation:AdLibrarySearchPaginationQuery')).length,5);
  assert.ok(result.diagnostics.some(e=>e.detail==='late_response_ignored'));
});

test('pausa manual no hace scroll ni procesa GraphQL tardío; ventana solo cierra al finalizar',async()=>{
  const main=main200();const response=reply(200,{path:'https://www.facebook.com/api/graphql/',
    contentType:'application/json',body:'{"errors":[{"code":42}]}',postData:'AdLibrarySearchPaginationQuery'});
  const result=await simulate({main,responses:[main],diagnosticOnly:false,persistentSession:true,maxScrolls:5,
    cards:[card],pauseAfterFirst:true,pausedResponse:response});
  assert.equal(result.error,null);assert.equal(result.batches[1].outcome,'USER_PAUSED');
  assert.equal(result.scrollsWhilePaused,0);assert.equal(result.closedWhilePaused,0);
  assert.equal(result.gotos,1);
  assert.ok(result.diagnostics.some(e=>e.detail==='late_or_paused_response_ignored'));
  assert.equal(result.diagnostics.some(e=>e.detail?.startsWith('graphql_warning:')),false);
  assert.equal(result.closed,2);
});

// ---- Fase 2.5: regresiones de paginación, poda y anti-detección ----

test('Fase 2.5: snapshot sin etiquetas de resultados desactiva la paginación',async()=>{
  assert.equal(selectMoreButton({buttons:[{index:0,text:'Ver más',visible:true,belowResults:true}],
    endOfResults:false,noResultLabels:true}),null);
  // Con ancla, el control real sigue detectándose.
  assert.equal(selectMoreButton({buttons:[{index:0,text:'Ver más',visible:true,belowResults:true}],
    endOfResults:false,noResultLabels:false}),0);
});

test('Fase 2.5: snapshot con anclas podadas (skeleton) conserva el botón real y rechaza tarjetas',async()=>{
  const real={index:0,text:'Ver más',visible:true,belowResults:true};
  const cardBtn={index:1,text:'Ver más',visible:true,belowResults:false};
  assert.equal(selectMoreButton({buttons:[real,cardBtn],endOfResults:false,noResultLabels:false}),0);
  // El botón de tarjeta (no debajo de resultados) nunca se selecciona.
  assert.equal(selectMoreButton({buttons:[{...real,belowResults:false}],endOfResults:false,noResultLabels:false}),null);
});

test('Fase 2.5: fin de resultados sin control único produce EXHAUSTED sin clic',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,maxScrolls:4,
    cardsByCycle:[[card],[card]],paginationSnapshots:[{buttons:[],endOfResults:true},{buttons:[],endOfResults:true}]});
  assert.equal(result.error,null);assert.equal(result.clicks,0);
  assert.equal(result.batches.at(-1).exhausted,true);
});

test('Fase 2.5: sesión persistente aplica el techo de clics de paginación',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,
    persistentSession:true,maxScrolls:10,maxPaginationClicks:2,
    cardsByCycle:[[card],[card],[card],[card],[card],[card]],
    paginationSnapshots:[more,more,more,more,more,more],waitNewIdsTimeout:true,stopOnOutcome:'USER_PAUSED'});
  assert.equal(result.error,null);
  assert.equal(result.clicks,2);
  assert.equal(result.batches.at(-1).outcome,'USER_PAUSED');
  assert.ok(result.batches.some(b=>b.outcome==='STALLED'&&b.stopReason==='Límite de paginación alcanzado'));
});

test('Fase 2.5: fallo de clic no-timeout se agota tras 3 intentos sin bucle infinito',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,
    persistentSession:true,maxScrolls:10,maxPaginationClicks:50,clickError:'Internal error',
    cardsByCycle:[[card],[card],[card],[card],[card]],
    paginationSnapshots:[more,more,more,more,more],stopOnOutcome:'STALLED'});
  assert.equal(result.error,null);
  assert.equal(result.clicks,3);
  assert.ok(result.diagnostics.some(e=>e.detail?.startsWith('pagination_click_failures')));
  assert.match(result.batches.at(-1).stopReason,/fallos consecutivos/);
});

test('Fase 2.5: la foto de confirmación marca el control único y el clic va por atributo',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,
    paginationDiagnostic:true,maxScrolls:5,
    cardsByCycle:[[card],[card],[card,another]],paginationSnapshots:[more,more]});
  assert.equal(result.error,null);assert.equal(result.clicks,1);
  assert.ok(result.diagnostics.some(e=>e.detail?.startsWith('pagination_clicked;')));
});

test('Fase 2.5: marcado no único aborta el clic en vez de pulsar un control equivocado',async()=>{
  const main=main200();const result=await simulate({main,responses:[main],diagnosticOnly:false,
    paginationDiagnostic:true,maxScrolls:5,markNotUnique:true,
    cardsByCycle:[[card],[card],[card]],paginationSnapshots:[more,more]});
  assert.equal(result.error,null);assert.equal(result.clicks,0);
  assert.equal(result.batches.at(-1).outcome,'STALLED');
});
