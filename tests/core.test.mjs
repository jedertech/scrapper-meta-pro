import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { Storage } from '../dist/storage.js';
import { normalize } from '../dist/normalize.js';
import { validateSearchUrl } from '../dist/security.js';
import { exportJob, exportBase } from '../dist/exporter.js';
import { compatibleJobs } from '../dist/wizard-choices.js';
import { runJob } from '../dist/runner.js';
import { AccessError } from '../dist/types.js';
import { collectAds, collectJsonAds, scrollBudgetForTarget, shouldCaptureResponse } from '../dist/extractors.js';
import { parseVisibleCard } from '../dist/visible-card.js';
import { pruneVisibleCards } from '../dist/dom-inspection.js';
import { browserContextOptions } from '../dist/browser-compat.js';
import { runSessionSlice } from '../dist/session-runner.js';
import { acquireBrowserSessionLock } from '../dist/session-lock.js';

const url='https://www.facebook.com/ads/library/?country=AR&q=zapatos';
const make=()=>new Storage(join(mkdtempSync(join(tmpdir(),'meta-test-')),'db.sqlite'));
const ad=(id,page='123')=>({id,page_id:page,page_name:'Empresa',ad_creative_bodies:['Hola\n=SUM(1,1) 😀'],cta_url:'https://example.org/?x=1&y=2'});

test('URL admite solo biblioteca HTTPS sin credenciales',()=>{
  assert.equal(validateSearchUrl(url),url);
  for(const bad of ['http://www.facebook.com/ads/library/','https://www.facebook.com.evil.org/ads/library/','https://www.facebook.com/ads/library/next','https://www.facebook.com/ads/library/?access_token=abc'])
    assert.throws(()=>validateSearchUrl(bad));
});
test('perfil de compatibilidad usa preferencias normales sin alterar señales de automatización',()=>{
  assert.equal(browserContextOptions.locale,'es-ES');
  assert.deepEqual(browserContextOptions.viewport,{width:1920,height:1080});
  for (const key of ['userAgent','proxy','serviceWorkers','extraHTTPHeaders','storageState'])
    assert.equal(Object.hasOwn(browserContextOptions,key),false);
});
test('normalización conserva IDs grandes, Unicode, CTA y ausentes',()=>{
  const a=normalize(ad('999999999999999999999'),'playwright','AR');
  assert.equal(a.adId,'999999999999999999999'); assert.match(a.description,/😀/); assert.equal(a.quality,'valid');
  assert.equal(normalize({id:'1',page_name:'X'},'playwright','AR').quality,'partial');
  assert.equal(normalize({id:'1',page_id:'2',page_name:'X'},'playwright','AR').quality,'partial');
  assert.equal(normalize({id:999999999999999999999,page_id:'2',page_name:'X'},'playwright','AR').quality,'invalid');
});
test('captura estructurada encuentra anuncios anidados sin confundir objetos ajenos',()=>{
  const data={payload:{results:[{ad_archive_id:'123456789',page_id:'987654321',snapshot:{page_name:'Marca',body:{text:'Oferta 😀'},link_url:'https://example.org/landing'}},{id:'no-ad',name:'irrelevante'}]}};
  const matches=collectAds(data);assert.equal(matches.length,1);
  const normalized=normalize(matches[0],'playwright','AR');
  assert.equal(normalized.adId,'123456789');assert.equal(normalized.description,'Oferta 😀');
  assert.equal(normalized.ctaUrl,'https://example.org/landing');
});
test('captura estructurada interpreta campos observados en una muestra pública',()=>{
  const raw={data:{ads:[{ad_archive_id:'123456789',page_id:'987654321',page_name:'Marca',
    body:{text:'Oferta pública'},publisher_platform:['facebook','instagram'],start_date:1760000000,
    snapshot:{link_url:'https://example.org/landing',cta_text:'Comprar'}}]}};
  const rows=collectAds(raw);assert.equal(rows.length,1);
  const a=normalize(rows[0],'playwright','AR');
  assert.equal(a.quality,'valid');assert.equal(a.description,'Oferta pública');
  assert.deepEqual(a.platforms,['facebook','instagram']);
  assert.equal(a.adStartDate,'2025-10-09T08:53:20.000Z');
  assert.equal(a.ctaText,'Comprar');assert.equal(a.ctaUrl,'https://example.org/landing');
});
test('primera página embebida y respuestas GraphQL en líneas recuperan anuncios',()=>{
  const edge={data:{ad_library_main:{search_results_connection:{edges:[{node:{collated_results:[
    {ad_archive_id:'501',page_id:'601',page_name:'Tienda',snapshot:{body:{text:'Oferta'},cta_text:'Comprar',link_url:'https://example.org'}}
  ]}}]}}}};
  assert.equal(collectJsonAds(JSON.stringify(edge)).length,1);
  assert.equal(collectJsonAds(JSON.stringify(edge,null,2)).length,1);
  assert.equal(collectJsonAds(`for (;;);${JSON.stringify(edge)}\n{malformed}`).length,1);
  assert.equal(collectJsonAds('x'.repeat(5_000_001)).length,0);
  assert.equal(normalize(collectJsonAds(JSON.stringify(edge))[0],'playwright','AR').ctaText,'Comprar');
});
test('presupuesto de desplazamientos escala con el objetivo sin simular agotamiento',()=>{
  assert.equal(scrollBudgetForTarget(10),30);
  assert.equal(scrollBudgetForTarget(5000),645);
  assert.throws(()=>scrollBudgetForTarget(0));
});
test('captura GraphQL con MIME no JSON solo desde host y HTTPS permitidos',()=>{
  assert.equal(shouldCaptureResponse('https://www.facebook.com/api/graphql/','text/plain',100),true);
  assert.equal(shouldCaptureResponse('https://facebook.com/ads/library/','application/json',100),true);
  assert.equal(shouldCaptureResponse('https://evilfacebook.com/api/graphql/','text/plain',100),false);
  assert.equal(shouldCaptureResponse('http://www.facebook.com/api/graphql/','text/plain',100),false);
  assert.equal(shouldCaptureResponse('https://www.facebook.com/api/graphql/','text/plain',5_000_001),false);
  assert.equal(shouldCaptureResponse('https://www.facebook.com/ads/library/','text/html',100),false);
});
test('tarjeta visible extrae ID, anunciante, texto y URL sin inventar ID numérico',()=>{
  const raw=parseVisibleCard({id:'1715225226410259',text:'Activo\nEn circulación desde el 26 ago 2026',
    description:'Moda para todos: descubre ropa de calidad para cada ocasión.',links:[
      {text:'SHEIN Mexico',href:'https://www.facebook.com/SHEINMexico/'},
      {text:'M.SHEIN.COM.MX\nShop Now',href:'https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.shein.com.mx%2Fproducto'}]});
  assert.equal(raw.id,'1715225226410259'); assert.equal(raw.page_name,'SHEIN Mexico');
  assert.equal(raw.cta_url,'https://www.shein.com.mx/producto');
  const ad=normalize(raw,'playwright','AR');assert.equal(ad.quality,'partial');
  assert.match(ad.qualityReason,/page_id_unavailable/);
});
test('bases independientes, deduplicación, checkpoint y CSV',()=>{
  const s=make(); try {
    s.createBase('a'); s.createBase('b'); s.useBase('a'); assert.equal(s.defaultBase(),'a');
    const ja=s.createJob('a',url,'ads','playwright','chromium',10);
    s.persistBatch(ja.id,[normalize(ad('100'),'playwright','AR'),normalize(ad('101'),'playwright','AR')],null);
    s.persistBatch(ja.id,[normalize(ad('100'),'playwright','AR')],null);
    assert.equal(s.job(ja.id).unique_ads,2); assert.equal(s.job(ja.id).new_advertisers,1);
    assert.equal(s.job(ja.id).observed,3); assert.equal(s.job(ja.id).duplicate_ads,1);
    assert.equal(s.job(ja.id).cursor,null); assert.equal(s.adRows(ja.id).length,2);
    const jb=s.createJob('b',url,'advertisers','playwright','chromium',10);
    s.persistBatch(jb.id,[normalize(ad('100'),'playwright','AR')],null);
    assert.equal(s.job(jb.id).new_advertisers,1); assert.equal(s.stats('a').advertisers,1); assert.equal(s.stats('b').advertisers,1);
    const out=exportJob(s,ja.id,mkdtempSync(join(tmpdir(),'meta-export-')));
    const csv=readFileSync(join(out,'ads.csv'),'utf8');
    assert.match(csv,/"Hola\n=SUM\(1,1\) 😀"/); assert.match(csv,/"'100"/); assert.equal(csv.split("\"'100\"").length,2);
    assert.equal(s.integrity(),'ok');
  } finally { s.close(); }
});
test('exportación completa de base y publicación atómica por carpeta',()=>{
  const s=make();try{
    s.createBase('clientes');const j=s.createJob('clientes',url,'ads','playwright','chromium',2);
    s.persistBatch(j.id,[normalize(ad('100'),'playwright','AR'),normalize(ad('101'),'playwright','AR')],null);
    const root=mkdtempSync(join(tmpdir(),'meta-export-base-'));
    const out=exportBase(s,'clientes',root);
    const content=readFileSync(join(out,'ads.csv'),'utf8');
    assert.match(content,/ad_id,advertiser_name/);assert.match(content,/"'100"/);assert.match(content,/"'101"/);
    assert.equal(readdirSync(out).includes('run_report.json'),true);
    assert.ok(!readdirSync(join(root,readdirSync(root)[0])).some(name=>name.endsWith('.tmp')));
  }finally{s.close();}
});
test('asistente ofrece reanudación solo para misma base y búsqueda',()=>{
  const s=make();try{
    s.createBase('a');s.createBase('b');
    const a=s.createJob('a',url,'ads','playwright','chromium',10);
    s.createJob('b',url,'ads','playwright','chromium',10);
    s.createJob('a','https://www.facebook.com/ads/library/?country=ALL&q=otro','ads','playwright','chromium',10);
    assert.deepEqual(compatibleJobs(s.jobs(),'a',url).map(job=>job.id),[a.id]);
    s.status(a.id,'COMPLETED','meta');
    assert.deepEqual(compatibleJobs(s.jobs(),'a',url),[]);
  }finally{s.close();}
});
test('runner reconoce agotamiento, restricción y reanudación',async()=>{
  const s=make(); try {
    s.createBase('a');
    const j=s.createJob('a',url,'ads','playwright','chromium',2);
    const one={method:'playwright',async *iterate(){yield {ads:[ad('1')],cursor:null,exhausted:false};}};
    assert.equal((await runJob(s,j.id,one,new AbortController().signal)).status,'PARTIAL');
    assert.equal(s.job(j.id).cursor,null);
    const two={method:'playwright',async *iterate(_url,cursor){assert.equal(cursor,null);yield {ads:[ad('2')],cursor:null,exhausted:true};}};
    assert.equal((await runJob(s,j.id,two,new AbortController().signal)).status,'COMPLETED');
    const k=s.createJob('a',url,'ads','playwright','chromium',3);
    const blocked={method:'playwright',async *iterate(){throw new AccessError(429,'rate limit');}};
    assert.equal((await runJob(s,k.id,blocked,new AbortController().signal)).status,'RATE_LIMITED');
    const denied=s.createJob('a',url,'ads','playwright','chromium',3);
    const forbidden={method:'playwright',async *iterate(){throw new AccessError(403,'HTTP 403 en navegación inicial');}};
    assert.equal((await runJob(s,denied.id,forbidden,new AbortController().signal)).status,'ACCESS_DENIED');
  } finally { s.close(); }
});
test('lease impide escritores simultáneos',()=>{
  const s=make(); try { s.createBase('a'); const j=s.createJob('a',url,'ads','playwright','chromium',1);
    assert.equal(s.acquire(j.id,'uno'),true); assert.equal(s.acquire(j.id,'dos'),false);
    s.release(j.id,'uno'); assert.equal(s.acquire(j.id,'dos'),true);
  } finally { s.close(); }
});
test('fallo preserva registros confirmados y marca FAILED',async()=>{
  const s=make(); try { s.createBase('a'); const j=s.createJob('a',url,'ads','playwright','chromium',3);
    const broken={method:'playwright',async *iterate(){yield {ads:[ad('1')],cursor:null,exhausted:false};throw new Error('red caída token=secreto');}};
    const result=await runJob(s,j.id,broken,new AbortController().signal);
    assert.equal(result.status,'FAILED'); assert.equal(result.unique_ads,1); assert.equal(result.cursor,null);
    assert.doesNotMatch(result.reason,/secreto/);
  } finally { s.close(); }
});
test('interrupción conserva checkpoint y permite retomar',async()=>{
  const s=make(); try { s.createBase('a'); const j=s.createJob('a',url,'ads','playwright','chromium',2);
    const controller=new AbortController();
    const interrupt={method:'playwright',async *iterate(){yield {ads:[ad('1')],cursor:null,exhausted:false}; controller.abort();}};
    assert.equal((await runJob(s,j.id,interrupt,controller.signal)).status,'INTERRUPTED');
    assert.equal(s.job(j.id).cursor,null);assert.equal(s.job(j.id).unique_ads,1);
  } finally { s.close(); }
});
test('SIGKILL después de confirmar un lote conserva SQLite y checkpoint',async()=>{
  const path=join(mkdtempSync(join(tmpdir(),'meta-crash-')),'db.sqlite');
  const child=spawn(process.execPath,['--disable-warning=ExperimentalWarning','--input-type=module','-e',
    `import {Storage} from './dist/storage.js';import {normalize} from './dist/normalize.js';
     const s=new Storage(process.argv[1]);s.createBase('a');
     const j=s.createJob('a','${url}','ads','playwright','chromium',2);
     s.persistBatch(j.id,[normalize({id:'880001',page_id:'880',page_name:'Prueba',description:'Dato confirmado'},'playwright','AR')],null);
     process.stdout.write(j.id+'\\n');setInterval(()=>{},1000);`,path],
    {cwd:process.cwd(),stdio:['ignore','pipe','pipe']});
  try {
    const id=await new Promise((resolve,reject)=>{
      let output='',errors='';
      const timeout=setTimeout(()=>reject(new Error(`El proceso no confirmó el lote: ${errors}; salida: ${output}`)),5000);
      child.stdout.on('data',chunk=>{output+=chunk.toString();if(output.includes('\n')) {clearTimeout(timeout);resolve(output.trim());}});
      child.stderr.on('data',chunk=>{errors+=chunk.toString();});
      child.on('exit',code=>{clearTimeout(timeout);reject(new Error(`El proceso terminó ${code}: ${errors}`));});
    });
    child.kill('SIGKILL');await new Promise(resolve=>child.once('exit',resolve));
    const reopened=new Storage(path);
    try {assert.equal(reopened.integrity(),'ok');assert.equal(reopened.job(id).unique_ads,1);
      assert.equal(reopened.adRows(id).length,1);assert.equal(reopened.stats('a').ads,1);}
    finally {reopened.close();}
  } finally {if(child.exitCode===null) child.kill('SIGKILL');}
});
test('CSV protege fórmulas y exporta nuevos y existentes',()=>{
  const s=make(); try { s.createBase('a'); const j=s.createJob('a',url,'ads','playwright','chromium',2);
    s.persistBatch(j.id,[normalize({...ad('1'),page_name:'=HYPERLINK("http://evil")'},'playwright','AR')],null);
    const out=exportJob(s,j.id,mkdtempSync(join(tmpdir(),'meta-export-')));
    assert.match(readFileSync(join(out,'advertisers.csv'),'utf8'),/"'=HYPERLINK/);
    const j2=s.createJob('a',url,'ads','playwright','chromium',2);
    s.persistBatch(j2.id,[normalize(ad('1'),'playwright','AR'),normalize(ad('2'),'playwright','AR')],null);
    assert.equal(s.adRows(j2.id).length,2); assert.equal(s.advertiserRows(j2.id).length,1);
    const out2=exportJob(s,j2.id,mkdtempSync(join(tmpdir(),'meta-export-')));
    const content=readFileSync(join(out2,'ads.csv'),'utf8');
    assert.match(content,/is_new_to_base/);assert.match(content,/"no"/);assert.match(content,/"yes"/);
    assert.match(content,/source_searches/);assert.match(content,/facebook\.com\/ads\/library/);
  } finally { s.close(); }
});
test('CLI crea, selecciona y consulta base; rechaza navegador ausente',t=>{
  const dir=mkdtempSync(join(tmpdir(),'meta-cli-'));
  const cli=(...args)=>execFileSync(process.execPath,['dist/cli.js',...args,'--data-dir',dir],{cwd:process.cwd(),encoding:'utf8',stdio:['ignore','pipe','pipe']});
  let probe;try {probe=cli('doctor');} catch(e) {if(e.code==='EPERM'){t.skip('Sandbox no permite procesos hijo');return;}throw e;}
  if(!probe.trim()){t.skip('Sandbox no permite procesos hijo');return;}
  cli('db','create','clientes'); cli('db','use','clientes');
  assert.match(cli('db','list'),/clientes/); assert.match(cli('db','stats','clientes'),/"ads": 0/);
  const doctor=JSON.parse(cli('doctor'));assert.equal(doctor.sqlite,'ok');
  const plan=JSON.parse(cli('diagnose','--url',url,'--check'));
  assert.equal(plan.metaRequests,0);assert.equal(plan.scrolls,0);assert.equal(plan.requires,'--authorized');
  if(!doctor.browsers.find(x=>x.name==='firefox').installed)
    assert.throws(()=>cli('run','--url',url,'--limit','1','--browser','firefox'),/Navegador firefox no instalado/);
  assert.throws(()=>cli('run','--url',url,'--limit','1','--method','api'),/La opción --method fue retirada/);
  assert.throws(()=>cli('session','--url',url,'--limit','1','--db','clientes','--visible'),/terminal interactiva/);
});
test('migraciones y checkpoint persisten tras reabrir SQLite',()=>{
  const path=join(mkdtempSync(join(tmpdir(),'meta-reopen-')),'db.sqlite');
  let s=new Storage(path);s.createBase('a');const j=s.createJob('a',url,'ads','playwright','chromium',2);
  s.persistBatch(j.id,[normalize(ad('1'),'playwright','AR')],null);s.close();
  s=new Storage(path);try {assert.equal(s.job(j.id).cursor,null);assert.equal(s.job(j.id).unique_ads,1);
    assert.equal(s.db.prepare('SELECT unique_ads FROM checkpoints WHERE job_id=?').get(j.id).unique_ads,1);
    assert.equal(s.db.prepare('SELECT COUNT(*) AS n FROM schema_migrations').get().n,4);
  } finally {s.close();}
});
test('conflicto de identidad de anuncio no contamina la base',()=>{
  const s=make();try{s.createBase('a');const j=s.createJob('a',url,'ads','playwright','chromium',2);
    s.persistBatch(j.id,[normalize(ad('1','123'),'playwright','AR')],null);
    s.persistBatch(j.id,[normalize(ad('1','999'),'playwright','AR')],null);
    assert.equal(s.job(j.id).invalid,1);assert.equal(s.job(j.id).new_advertisers,1);
    assert.equal(s.errors(j.id).at(-1).code,'IDENTITY_CONFLICT');
  }finally{s.close();}
});
test('DOM pruning elimina tarjetas ya extraídas sin alterar scroll ni paginación',async()=>{
  const page={evaluate:async(fn,arg)=>{
    if(String(fn).includes('card.remove()')) return {removed:arg.length,failed:[]};
    return [];
  }};
  assert.deepEqual(await pruneVisibleCards(page,[]),{removed:0,failed:[]});
  const ids=['111','222','333'];
  const result=await pruneVisibleCards(page,ids);
  assert.equal(result.removed,3);assert.deepEqual(result.failed,[]);
});
test('DOM pruning es tolerante a fallos y solo avisa al scraper',async()=>{
  const page={evaluate:async()=>{throw new Error('Target page closed');}};
  let threw=false;
  try { await pruneVisibleCards(page,['1']); } catch { threw=true; }
  assert.ok(threw);
});
test('sin page_id mantiene identidades provisionales separadas y anuncios válidos para la base',()=>{
  const s=make();try {
    s.createBase('nichos');const j=s.createJob('nichos',url,'ads','playwright','chromium',2);
    const first=normalize({id:'711',page_name:'Marca repetida',description:'Texto A'},'playwright','AR');
    const second=normalize({id:'712',page_name:'Marca repetida',description:'Texto B'},'playwright','AR');
    assert.equal(first.metaPageId,null);assert.notEqual(first.pageId,second.pageId);
    s.persistBatch(j.id,[first,second],null);
    assert.equal(s.stats('nichos').ads,2);assert.equal(s.stats('nichos').advertisers,0);
    assert.equal(s.stats('nichos').provisionalAds,2);
    const rows=s.baseAdRows('nichos');assert.equal(rows.length,2);assert.equal(rows[0].meta_page_id,null);
    const out=exportBase(s,'nichos',mkdtempSync(join(tmpdir(),'meta-export-')));
    const content=readFileSync(join(out,'ads.csv'),'utf8');
    assert.match(content,/provisional:ad:711/);assert.match(content,/provisional:ad:712/);
  } finally {s.close();}
});
test('solo JSON estructurado confirma page_id; un enlace numérico no prueba identidad',()=>{
  const structured=normalize(ad('801','123'),'playwright','AR');
  assert.equal(structured.pageIdSource,'structured_json');
  const visible=normalize(parseVisibleCard({id:'12345802',text:'Activo',description:'Oferta',links:[
    {text:'Marca',href:'https://www.facebook.com/456789/'},
    {text:'Comprar',href:'https://example.org/'}]}),'playwright','AR');
  assert.equal(visible.metaPageId,null);assert.equal(visible.pageIdSource,null);
});
test('ID estructurado promueve identidad provisional en todas las bases sin fusionar nombres',()=>{
  const s=make();try {
    s.createBase('a');s.createBase('b');
    const first=s.createJob('a',url,'advertisers','playwright','chromium',1);
    const second=s.createJob('b',url,'advertisers','playwright','chromium',1);
    const card=normalize({id:'980001',page_name:'Marca',description:'Texto'},'playwright','AR');
    s.persistBatch(first.id,[card],null);s.persistBatch(second.id,[card],null);
    assert.equal(s.job(first.id).new_advertisers,0);assert.equal(s.stats('a').provisionalAds,1);
    const promoted=s.createJob('a',url,'advertisers','playwright','chromium',1);
    s.persistBatch(promoted.id,[normalize({id:'980001',page_id:'778899',page_name:'Marca',description:'Texto'},'playwright','AR')],null);
    assert.equal(s.job(promoted.id).new_advertisers,1);
    for(const base of ['a','b']) {assert.equal(s.stats(base).advertisers,1);assert.equal(s.stats(base).provisionalAds,0);}
    assert.equal(s.baseAdRows('a')[0].advertiser_id,'778899');
    assert.equal(s.baseAdRows('a')[0].meta_page_id_source,'structured_json');
  } finally {s.close();}
});
test('conflicto entre IDs estructurados conserva observación y registro previo',()=>{
  const s=make();try {
    s.createBase('a');const original=s.createJob('a',url,'ads','playwright','chromium',1);
    s.persistBatch(original.id,[normalize(ad('980002','123'),'playwright','AR')],null);
    const conflict=s.createJob('a',url,'ads','playwright','chromium',1);
    s.persistBatch(conflict.id,[normalize(ad('980002','999'),'playwright','AR')],null);
    assert.equal(s.job(conflict.id).invalid,1);assert.equal(s.job(conflict.id).duplicate_ads,1);
    assert.equal(s.adRows(conflict.id).length,1);assert.equal(s.adRows(conflict.id)[0].meta_page_id,'123');
    assert.equal(s.errors(conflict.id)[0].code,'IDENTITY_CONFLICT');
  } finally {s.close();}
});
test('base acumulativa conserva búsquedas distintas y deduplica anuncios por ID',()=>{
  const s=make();try {
    s.createBase('nicho');
    const j1=s.createJob('nicho',url,'ads','playwright','chromium',2);
    const other='https://www.facebook.com/ads/library/?country=ALL&q=ropa';
    const j2=s.createJob('nicho',other,'ads','playwright','chromium',2);
    s.persistBatch(j1.id,[normalize(ad('901'),'playwright','AR')],null);
    s.persistBatch(j2.id,[normalize(ad('901'),'playwright','ALL'),normalize(ad('902'),'playwright','ALL')],null);
    assert.equal(s.stats('nicho').ads,2);assert.equal(s.job(j2.id).duplicate_ads,1);
    const runRows=s.adRows(j2.id);assert.equal(runRows.length,2);
    assert.equal(runRows.find(r=>r.id==='901').is_new_to_base,0);
    assert.equal(runRows.find(r=>r.id==='902').is_new_to_base,1);
    const baseRows=s.baseAdRows('nicho');
    assert.deepEqual(JSON.parse(baseRows.find(r=>r.id==='901').source_searches).sort(),[other,url].sort());
  } finally {s.close();}
});
test('migración 3 conserva filas de una base previa y agrega page_id real nullable',()=>{
  const path=join(mkdtempSync(join(tmpdir(),'meta-migrate-')),'db.sqlite');
  let s=new Storage(path);s.createBase('vieja');const j=s.createJob('vieja',url,'ads','playwright','chromium',1);
  s.persistBatch(j.id,[normalize(ad('991'),'playwright','AR')],null);
  s.db.exec('DELETE FROM schema_migrations WHERE version=3; ALTER TABLE ads DROP COLUMN meta_page_id;');s.close();
  s=new Storage(path);try {
    assert.equal(s.integrity(),'ok');assert.equal(s.stats('vieja').ads,1);
    assert.equal(s.baseAdRows('vieja')[0].meta_page_id,'123');
  } finally {s.close();}
});
test('CSV de ejecución parcial conserva anuncios confirmados',async()=>{
  const s=make();try {
    s.createBase('nicho');const j=s.createJob('nicho',url,'ads','playwright','chromium',3);
    const source={method:'playwright',async *iterate(){yield {ads:[ad('301')],cursor:null,exhausted:false};throw new Error('conexión perdida');}};
    const result=await runJob(s,j.id,source,new AbortController().signal);
    assert.equal(result.status,'FAILED');
    const out=exportJob(s,j.id,mkdtempSync(join(tmpdir(),'meta-export-')));
    assert.match(readFileSync(join(out,'ads.csv'),'utf8'),/"'301"/);
  } finally {s.close();}
});
test('una sesión reanuda el mismo iterador en otra corrida sin repetir anuncios',async()=>{
  const s=make();try {
    s.createBase('nicho');
    let advanced=0;
    async function* source(){advanced++;yield {ads:[ad('10001')],cursor:null,exhausted:false};
      advanced++;yield {ads:[ad('10002')],cursor:null,exhausted:false};}
    const iterator=source();const signal=new AbortController().signal;
    const first=s.createJob('nicho',url,'ads','playwright','chromium',1);
    const a=await runSessionSlice(s,first.id,iterator,signal,()=>false);
    assert.equal(a.job.status,'COMPLETED');assert.equal(advanced,1);assert.equal(a.iteratorDone,false);
    const second=s.createJob('nicho',url,'ads','playwright','chromium',1);
    const b=await runSessionSlice(s,second.id,iterator,signal,()=>false);
    assert.equal(b.job.status,'COMPLETED');assert.equal(advanced,2);assert.equal(s.stats('nicho').ads,2);
    assert.equal(s.adRows(first.id).length,1);assert.equal(s.adRows(second.id).length,1);
    await iterator.return();
  }finally{s.close();}
});
test('sesión pausada conserva lote y bloqueo exclusivo de propietario',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'meta-session-lock-'));
  const unlock=acquireBrowserSessionLock(dir);
  try {assert.throws(()=>acquireBrowserSessionLock(dir),/sesión visible activa/);} finally {unlock();}
  const unlockAgain=acquireBrowserSessionLock(dir);unlockAgain();
  const s=make();try {
    s.createBase('nicho');const j=s.createJob('nicho',url,'ads','playwright','chromium',2);
    let pause=false;
    async function* source(){yield {ads:[ad('10003')],cursor:null,exhausted:false};yield {ads:[ad('10004')],cursor:null,exhausted:false};}
    const iterator=source();
    const result=await runSessionSlice(s,j.id,iterator,new AbortController().signal,()=>pause,()=>{pause=true;});
    assert.equal(result.job.status,'USER_PAUSED');assert.equal(result.job.unique_ads,1);assert.equal(s.stats('nicho').ads,1);
    const resumed=await runSessionSlice(s,j.id,iterator,new AbortController().signal,()=>false);
    assert.equal(resumed.job.status,'COMPLETED');assert.equal(resumed.job.unique_ads,2);
    await iterator.return();
  }finally{s.close();}
});
