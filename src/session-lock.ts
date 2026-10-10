import { closeSync, mkdirSync, openSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function acquireBrowserSessionLock(dataDir:string):()=>void {
  mkdirSync(dataDir,{recursive:true,mode:0o700});
  const path=join(dataDir,'.browser-session.lock');
  const claim=():boolean=>{
    try {const fd=openSync(path,'wx',0o600);writeFileSync(fd,String(process.pid));closeSync(fd);return true;}
    catch(error) {if((error as NodeJS.ErrnoException).code==='EEXIST') return false;throw error;}
  };
  if(!claim()) {
    const pid=Number(readFileSync(path,'utf8').trim());
    let alive=Number.isSafeInteger(pid)&&pid>0;
    if(alive) try {process.kill(pid,0);} catch(error) {alive=(error as NodeJS.ErrnoException).code==='EPERM';}
    if(alive) throw new Error(`Ya existe una sesión visible activa (PID ${pid})`);
    unlinkSync(path);
    if(!claim()) throw new Error('Otra sesión visible tomó el control del navegador');
  }
  return ()=>{try {if(readFileSync(path,'utf8').trim()===String(process.pid)) unlinkSync(path);} catch {/* lock already removed */}};
}
