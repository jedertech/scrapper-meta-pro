import test from 'node:test';
import assert from 'node:assert/strict';
import { waitForActivity } from '../dist/progress-wait.js';

test('retorna inmediatamente cuando aparecen anuncios, sin agotar el presupuesto',async()=>{
  let checks=0;
  const started=performance.now();
  const result=await waitForActivity({maxWaitMs:1000,pollMs:50,check:async()=>++checks>=3?'new_ads':null,cancelled:()=>false});
  assert.equal(result,'new_ads');assert.ok(performance.now()-started<500);
});

test('detecta Ver más y no ejecuta ningún clic por sí mismo',async()=>{
  const result=await waitForActivity({maxWaitMs:1000,check:async()=> 'more_button',cancelled:()=>false});
  assert.equal(result,'more_button');
});

test('dos ventanas acotadas notifican a mitad y terminan sin progreso',async()=>{
  const windows=[];
  const result=await waitForActivity({maxWaitMs:140,windowMs:60,pollMs:50,
    check:async()=>null,cancelled:()=>false,onWindow:ms=>windows.push(ms)});
  assert.equal(result,'timeout');assert.ok(windows.length>=1);
});

test('Ctrl+C o p cancelan la espera sin seguir consultando la página',async()=>{
  let cancelled=false,checks=0;
  const task=waitForActivity({maxWaitMs:1000,pollMs:50,check:async()=>{checks++;return null;},cancelled:()=>cancelled});
  setTimeout(()=>{cancelled=true;},30);
  assert.equal(await task,'cancelled');assert.ok(checks<=2);
});
