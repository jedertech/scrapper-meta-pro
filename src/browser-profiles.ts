import { chmodSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createInterface } from 'node:readline';
import { browserContextOptions } from './browser-compat.js';
import { acquireBrowserSessionLock } from './session-lock.js';

export type ProfileKind = 'main' | 'temp';
const markerText='JederTech Meta Scraper profile root v1\n';
export const projectRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const profileRoot=join(projectRoot,'profiles');

function ownedRoot(root:string): void {
  if(existsSync(root) && lstatSync(root).isSymbolicLink()) throw new Error('Ruta de perfiles simbólica rechazada');
  if(!existsSync(root)) {
    mkdirSync(root,{recursive:true,mode:0o700});
    writeFileSync(join(root,'.jedertech-owned'),markerText,{mode:0o600,flag:'wx'});
  }
  if(readFileSync(join(root,'.jedertech-owned'),'utf8')!==markerText)
    throw new Error('La carpeta de perfiles no pertenece a este proyecto');
  chmodSync(root,0o700);
}

export function acquireProfileLock(root=profileRoot):()=>void {ownedRoot(root);return acquireBrowserSessionLock(root);}

export function prepareProfile(kind:ProfileKind,root=profileRoot): {path:string;cleanup:()=>void} {
  ownedRoot(root);
  if(kind==='main') {
    const path=join(root,'main');
    if(existsSync(path) && lstatSync(path).isSymbolicLink()) throw new Error('Perfil principal simbólico rechazado');
    mkdirSync(path,{recursive:true,mode:0o700});
    return {path,cleanup:()=>{}};
  }
  const tempRoot=join(root,'temp');
  if(existsSync(tempRoot) && lstatSync(tempRoot).isSymbolicLink()) throw new Error('Perfiles temporales simbólicos rechazados');
  mkdirSync(tempRoot,{recursive:true,mode:0o700});
  const path=mkdtempSync(join(tempRoot,'session-'));
  chmodSync(path,0o700);
  return {path,cleanup:()=>{if(existsSync(path) && !lstatSync(path).isSymbolicLink()) rmSync(path,{recursive:true,force:true});}};
}

export function profileStatus(root=profileRoot): {main:boolean;temporary:number} {
  if(!existsSync(root)) return {main:false,temporary:0};
  ownedRoot(root);
  const temp=join(root,'temp');
  if(existsSync(temp) && lstatSync(temp).isSymbolicLink()) throw new Error('Perfiles temporales simbólicos rechazados');
  return {main:existsSync(join(root,'main')),
    temporary:existsSync(temp)?readdirSync(temp,{withFileTypes:true}).filter(e=>e.isDirectory()&&!e.isSymbolicLink()).length:0};
}

export function resetProfile(kind:ProfileKind, confirmation:string,root=profileRoot):boolean {
  if(confirmation!==`RESTABLECER ${kind}`) throw new Error(`Escribí RESTABLECER ${kind} para confirmar`);
  if(!existsSync(root)) return false;
  ownedRoot(root);
  const release=acquireProfileLock(root);
  try {
    const target=join(root,kind==='main'?'main':'temp');
    if(!existsSync(target)) return false;
    if(lstatSync(target).isSymbolicLink()) throw new Error('Ruta simbólica rechazada');
    rmSync(target,{recursive:true,force:true});
    return true;
  } finally {release();}
}

/** Opens a project-owned profile on about:blank. Navigation is manual. */
export async function openProfile(kind:ProfileKind):Promise<void> {
  const release=acquireProfileLock();
  let profile:ReturnType<typeof prepareProfile>|null=null;
  let context:Awaited<ReturnType<typeof chromium.launchPersistentContext>>|null=null;
  const io=createInterface({input:process.stdin,output:process.stdout});
  let done!:()=>void;const finished=new Promise<void>(resolve=>{done=resolve;});
  const onSigint=()=>console.log('Chromium sigue abierto. Escribí q para cerrar.');
  const requestClose=()=>{void context?.close().catch(e=>console.error(e instanceof Error?e.message:String(e)));};
  const onSigterm=()=>{requestClose();};
  const onLine=(line:string)=>{if(line.trim().toLowerCase()==='q') requestClose();else console.log('Escribí q para cerrar Chromium.');};
  try {
    profile=prepareProfile(kind);
    context=await chromium.launchPersistentContext(profile.path,{...browserContextOptions,headless:false,handleSIGINT:false});
    context.on('close',done);
    if(!context.pages().length) await context.newPage();
    io.on('line',onLine);io.on('SIGINT',onSigint);
    process.on('SIGINT',onSigint);process.on('SIGTERM',onSigterm);process.on('SIGHUP',onSigterm);
    console.log(`Perfil ${kind} abierto en blanco. Navegá manualmente; q cierra. SQLite permanece independiente.`);
    await finished;
  } finally {
    process.removeListener('SIGINT',onSigint);process.removeListener('SIGTERM',onSigterm);process.removeListener('SIGHUP',onSigterm);
    io.close();
    try {await context?.close();} catch {/* already closed */}
    try {profile?.cleanup();} finally {release();}
  }
}
