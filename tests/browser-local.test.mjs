import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { browserContextOptions } from '../dist/browser-compat.js';
import { prepareProfile } from '../dist/browser-profiles.js';
import { waitForActivity } from '../dist/progress-wait.js';

test('Chromium real: navegación local, tráfico, persistencia y aislamiento',async()=>{
  const project=mkdtempSync(join(tmpdir(),'jeder-browser-local-'));
  const requests=[];
  const server=createServer((req,res)=>{
    requests.push({method:req.method,path:req.url});
    if(req.url==='/graphql') {res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({data:{edges:[{node:{id:'local-1'}}]}}));return;}
    res.writeHead(200,{'Content-Type':'text/html'});
    res.end('<!doctype html><title>Prueba local</title><button id="more">Ver más</button><script>document.querySelector("#more").onclick=async()=>{const r=await fetch("/graphql");document.body.dataset.count=(await r.json()).data.edges.length}</script>');
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}/`;
  const root=join(project,'profiles');const main=prepareProfile('main',root);const temp=prepareProfile('temp',root);
  let context;
  try {
    context=await chromium.launchPersistentContext(main.path,{...browserContextOptions,headless:true,handleSIGINT:false});
    const page=context.pages()[0]??await context.newPage();
    const responses=[];page.on('response',response=>responses.push({url:new URL(response.url()).pathname,status:response.status()}));
    const navigation=await page.goto(url);
    assert.equal(navigation.status(),200);
    for(let i=0;i<10;i++) {
      const secondary=await context.newPage();await secondary.goto(url);
      await secondary.close();assert.equal(page.isClosed(),false);
      assert.equal(context.pages().length,1);
    }
    await page.locator('#more').click();
    await assert.doesNotReject(()=>page.waitForFunction(()=>document.body.dataset.count==='1'));
    assert.ok(responses.some(row=>row.url==='/graphql'&&row.status===200));
    await page.evaluate(()=>setTimeout(()=>{
      const label=document.createElement('span');
      label.textContent='Identificador de la biblioteca: 1234567890';
      document.body.append(label);
    },200));
    const waitStarted=performance.now();
    const activity=await waitForActivity({maxWaitMs:2000,pollMs:50,cancelled:()=>false,
      check:async()=>await page.locator('span').count()>0?'new_ads':null});
    assert.equal(activity,'new_ads');
    assert.ok(performance.now()-waitStarted<1500);
    const signalHandler=()=>{};process.on('SIGINT',signalHandler);
    try {process.emit('SIGINT');await new Promise(resolve=>setTimeout(resolve,100));assert.equal(page.isClosed(),false);}
    finally {process.removeListener('SIGINT',signalHandler);}
    await page.evaluate(()=>{localStorage.setItem('marker','principal');document.cookie='marker=principal; Max-Age=3600; SameSite=Lax';});
    await context.close();context=null;
    context=await chromium.launchPersistentContext(main.path,{...browserContextOptions,headless:true,handleSIGINT:false});
    const again=context.pages()[0]??await context.newPage();await again.goto(url);
    assert.equal(await again.evaluate(()=>localStorage.getItem('marker')),'principal');
    assert.ok((await context.cookies(url)).some(row=>row.name==='marker'&&row.value==='principal'));
    await context.close();context=null;
    context=await chromium.launchPersistentContext(temp.path,{...browserContextOptions,headless:true,handleSIGINT:false});
    const isolated=context.pages()[0]??await context.newPage();await isolated.goto(url);
    assert.equal(await isolated.evaluate(()=>localStorage.getItem('marker')),null);
    assert.ok(!(await context.cookies(url)).some(row=>row.name==='marker'));
    assert.ok(requests.some(row=>row.path==='/graphql'));
  } finally {
    await context?.close();temp.cleanup();await new Promise(resolve=>server.close(resolve));
    rmSync(project,{recursive:true,force:true});
  }
});

test('proceso Node y Chromium sobreviven SIGINT, aceptan r y cierran con q',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'jeder-session-process-'));
  const child=spawn(process.execPath,['tests/session-process.fixture.mjs',dir],{
    cwd:process.cwd(),env:{...process.env},stdio:['pipe','pipe','pipe']});
  let output='';let errors='';
  child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
  child.stdout.on('data',chunk=>{output+=chunk;});child.stderr.on('data',chunk=>{errors+=chunk;});
  const until=async predicate=>{const end=Date.now()+12000;while(Date.now()<end){if(predicate()) return;
    if(child.exitCode!==null) throw new Error(`El proceso terminó antes de tiempo: ${output} ${errors}`);
    await new Promise(resolve=>setTimeout(resolve,25));}throw new Error(`Tiempo de espera: ${output} ${errors}`);};
  try {
    await until(()=>output.includes('FIXTURE_READY')&&output.includes('WAITING_FOR_SIGNAL'));
    child.kill('SIGINT');
    await until(()=>output.includes('USER_PAUSED:')&&output.includes('BROWSER_ALIVE'));
    assert.equal(child.exitCode,null);
    child.stdin.write('h\n');
    await until(()=>output.includes('"sqlite": "ok"'));
    child.stdin.write('r\n');
    await until(()=>output.includes('TARGET_REACHED:'));
    assert.equal(child.exitCode,null);
    child.stdin.write('q\n');
    const code=await new Promise(resolve=>child.once('close',resolve));
    assert.equal(code,0,`${output} ${errors}`);
    assert.match(output,/FINAL_ADS:2/);
    assert.match(output,/BROWSER_CLOSED/);
    assert.doesNotMatch(errors,/ABORT_ERR|UnhandledPromiseRejection/);
  } finally {
    if(child.exitCode===null) child.kill('SIGKILL');
    rmSync(dir,{recursive:true,force:true});
  }
});
