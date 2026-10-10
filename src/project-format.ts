import { DatabaseSync } from 'node:sqlite';
import { existsSync, lstatSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const removable = ['data', 'exports', 'diagnostics', 'research', 'profiles'] as const;

/** Erases only runtime/historical data inside this package; never source or dependencies. */
export function formatProject(root: string, confirmation: string): string[] {
  if (confirmation !== 'FORMATEAR') throw new Error('Formato cancelado: escribí FORMATEAR exactamente.');
  if (!existsSync(join(root,'package.json')) || !existsSync(join(root,'src','storage.ts')))
    throw new Error('La ruta no corresponde al proyecto JederTech Meta Scraper.');
  for (const name of removable) {
    const path=join(root,name);
    if (existsSync(path) && lstatSync(path).isSymbolicLink()) throw new Error(`Ruta simbólica rechazada: ${name}`);
  }
  const data=join(root,'data');
  for(const lock of [join(data,'.browser-session.lock'),join(root,'profiles','.browser-session.lock')]) {
    if (existsSync(lock)) {
      const pid=Number(readFileSync(lock,'utf8').trim());
      if (Number.isSafeInteger(pid) && pid>0) {
        try { process.kill(pid,0); throw new Error('Hay una sesión visible activa; cerrala con q antes de formatear.'); }
        catch (error) { if ((error as NodeJS.ErrnoException).code==='EPERM') throw new Error('Hay una sesión visible activa; cerrala con q antes de formatear.');
          if ((error as NodeJS.ErrnoException).code!=='ESRCH') throw error; }
      }
    }
  }
  const dbPath=join(data,'meta-scraper.sqlite');
  if (existsSync(dbPath)) {
    const db=new DatabaseSync(dbPath,{readOnly:true});
    try {
      const row=db.prepare('SELECT COUNT(*) AS n FROM job_leases WHERE expires_at>?').get(Date.now()) as {n:number};
      if(row.n>0) throw new Error('Hay un trabajo activo; esperá a que termine antes de formatear.');
    } finally {db.close();}
  }
  const removed:string[]=[];
  for (const name of removable) {
    const path=join(root,name);
    if (existsSync(path)) {rmSync(path,{recursive:true,force:true});removed.push(name);}
  }
  return removed;
}
