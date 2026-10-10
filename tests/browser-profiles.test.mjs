import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { prepareProfile, profileStatus, resetProfile, acquireProfileLock } from '../dist/browser-profiles.js';

test('perfiles principal y temporal aislados; restablecer nunca toca SQLite',()=>{
  const project=mkdtempSync(join(tmpdir(),'jeder-profile-'));
  try {
    const db=join(project,'data','meta-scraper.sqlite');mkdirSync(join(project,'data'));writeFileSync(db,'datos de prueba');
    const root=join(project,'profiles');const main=prepareProfile('main',root);const temp=prepareProfile('temp',root);
    writeFileSync(join(main.path,'cookie-test'),'main');writeFileSync(join(temp.path,'cookie-test'),'temp');
    assert.deepEqual(profileStatus(root),{main:true,temporary:1});
    assert.throws(()=>resetProfile('main','sí',root),/RESTABLECER main/);
    const release=acquireProfileLock(root);
    assert.throws(()=>resetProfile('main','RESTABLECER main',root),/sesión visible activa/);
    release();
    assert.equal(resetProfile('main','RESTABLECER main',root),true);
    assert.equal(existsSync(main.path),false);assert.equal(readFileSync(join(temp.path,'cookie-test'),'utf8'),'temp');
    assert.equal(readFileSync(db,'utf8'),'datos de prueba');
    temp.cleanup();assert.deepEqual(profileStatus(root),{main:false,temporary:0});
  } finally {rmSync(project,{recursive:true,force:true});}
});

test('no sigue enlaces simbólicos hacia perfiles externos',()=>{
  const project=mkdtempSync(join(tmpdir(),'jeder-profile-link-'));
  const outside=mkdtempSync(join(tmpdir(),'jeder-profile-outside-'));
  try {
    const root=join(project,'profiles');prepareProfile('main',root);
    rmSync(join(root,'main'),{recursive:true});symlinkSync(outside,join(root,'main'));
    assert.throws(()=>prepareProfile('main',root),/simbólico/);
    assert.throws(()=>resetProfile('main','RESTABLECER main',root),/simbólica/);
    assert.ok(existsSync(outside));
  } finally {rmSync(project,{recursive:true,force:true});rmSync(outside,{recursive:true,force:true});}
});
