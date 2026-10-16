#!/usr/bin/env node
import { createInterface } from 'node:readline/promises';
import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';
import { Storage } from './storage.js';
import { exportBase, exportJob } from './exporter.js';
import { validateSearchUrl, safeName } from './security.js';
import { compatibleJobs, extractionCommand } from './wizard-choices.js';
import { formatProject } from './project-format.js';
import { profileStatus, resetProfile } from './browser-profiles.js';

if (!process.stdin.isTTY) { console.error('El asistente requiere una terminal interactiva.'); process.exitCode=2; }
else {
  const root=resolve(process.cwd());
  const dataDir=join(root,'data');
  let storage=new Storage(join(dataDir,'meta-scraper.sqlite'));
  const io=createInterface({input:process.stdin,output:process.stdout});
  let sessionHandoff=false;
  const onSigint = () => {
    process.stdout.write('\nCerrando programa de forma segura...\n');
    try { io.close(); } catch {}
    try { storage.close(); } catch {}
    process.exit(0);
  };
  process.on('SIGINT', onSigint);
  io.on('SIGINT', onSigint);
  const ask=async (question:string, fallback=''):Promise<string> => {
    try {
      return (await io.question(question)).trim() || fallback;
    } catch (err: any) {
      if (err?.code === 'ERR_USE_AFTER_CLOSE') {
        process.stdout.write('\nCerrando programa de forma segura...\n');
        process.exit(0);
      }
      throw err;
    }
  };
  const runCli=async (args:string[]):Promise<number> => {
    if(args[0]==='session'||(args[0]==='profile'&&args[1]==='open')) {
      // The child owns stdin for the entire visible session. A second readline
      // in this process can consume +N/q or close on EOF and kill the session.
      io.close();storage.close();sessionHandoff=true;
    } else io.pause();
    const child=spawn(process.execPath,['--disable-warning=ExperimentalWarning',join(root,'dist','cli.js'),...args],{cwd:root,stdio:'inherit'});
    const code=await new Promise<number>(done=>{child.once('error',()=>done(1));child.once('close',value=>done(value??1));});
    if(!sessionHandoff) io.resume();
    return code;
  };
  const chooseBase=async (allowNew:boolean):Promise<string> => {
    const bases=storage.listBases() as Array<{name:string;ads:number;advertisers:number}>;
    console.log('\nBases:',bases.length?bases.map(b=>`${b.name} (${b.ads} anuncios; ${b.advertisers} anunciantes confirmados)`).join(', '):'ninguna');
    while(true) {
      try {
        const base=safeName(await ask('Nombre de base: '));
        if (!bases.some(b=>b.name===base)) {
          if (!allowNew) throw new Error('La base no existe.');
          storage.createBase(base);
        }
        return base;
      } catch(error) {console.log((error as Error).message);}
    }
  };
  const extract=async (persistent=false):Promise<void> => {
    let url='';
    while(!url) try {url=validateSearchUrl(await ask('URL de búsqueda: '));} catch(error) {console.log((error as Error).message);}
    let target=0;
    while(!target) {
      const n=Number(await ask('Objetivo de anuncios únicos nuevos: ','100'));
      if(Number.isSafeInteger(n)&&n>0) target=n;
      else console.log('Ingresá un entero positivo.');
    }
    const base=await chooseBase(true);
    const candidates=persistent?[]:compatibleJobs(storage.jobs(),base,url);
    let resume:string|null=null;
    if(candidates.length) {
      console.log('Ejecuciones reanudables:',candidates.slice(0,10).map((j,i)=>`${i+1}. ${j.id} (${j.unique_ads} nuevos)`).join('\n'));
      const answer=await ask('Número para reanudar o Enter para nueva ejecución: ');
      if(answer) {
        const index=Number(answer)-1;
        if(!Number.isInteger(index)||!candidates[index]) throw new Error('Selección inválida');
        resume=candidates[index].id;
      }
    }
    const mode='v';
    const profile='main';
    const browser='chromium';
    // Visible runs belong to the interactive session, so reaching a target never
    // returns to this menu or releases the browser.
    const command=extractionCommand(true,resume);
    const args=command==='session'?['session','--url',url,'--limit',String(target),'--db',base]:
      command==='resume'?['resume','--job',resume!,'--target-total',String(target)]:['run','--url',url,'--limit',String(target),'--db',base,'--browser',browser];
    args.push('--visible');
    if(command==='session') {
      args.push('--profile',profile);
    }
    console.log(`Base: ${base} | Objetivo: ${target} anuncios únicos nuevos | Navegador: visible | Perfil: main.`);
    if((await ask('Iniciar ahora [S/n]: ','s')).toLowerCase()==='n') return;
    const code=await runCli(args);
    if(code) console.log(`La ejecución terminó con código ${code}. Revisá su CSV y el historial.`);
  };
  try {
    while(!sessionHandoff) {
      console.log('\nJederTech · Meta Ads Library\n1. Nueva extracción\n2. Continuar sesión\n3. Bases de datos\n4. Exportar base a CSV\n5. Historial y estadísticas\n6. Diagnóstico y estado\n7. Formatear proyecto\n8. Abrir perfil manualmente\n9. Restablecer perfil\n0. Salir');
      const choice=await ask('Opción: ');
      try {
        if(choice==='1') await extract(false);
        else if(choice==='2') {
          const jobs=storage.jobs().filter(j=>j.method==='playwright').slice(0,20);
          if(!jobs.length) {console.log('No hay trabajos históricos. Iniciá una extracción nueva.');continue;}
          console.log('Trabajo histórico: abre un navegador nuevo; no recupera el cursor visual.');
          jobs.forEach((j,i)=>console.log(`${i+1}. ${j.started_at} | ${j.db_name} | ${j.unique_ads} nuevos | ${j.status} | ${j.search_url}`));
          const index=Number(await ask('Número de trabajo (Enter cancela): '))-1;
          if(!Number.isInteger(index)||!jobs[index]) {console.log('Selección cancelada.');continue;}
          if((await ask('Reanudar con navegador nuevo [s/N]: ','n')).toLowerCase()==='s') await runCli(['resume','--job',jobs[index].id,'--visible']);
        }
        else if(choice==='3') {
          console.log('\n--- Gestión de Bases de Datos ---');
          const bases=storage.listBases() as Array<{name:string;ads:number;advertisers:number}>;
          if(bases.length) console.table(bases);
          else console.log('No hay bases de datos creadas.');
          console.log('Acciones: [c]rear base | [b]orrar base | [s]tatísticas de base | Enter para volver');
          const dbAction=(await ask('Acción: ')).toLowerCase();
          if(dbAction==='c') {
            const name=safeName(await ask('Nombre de la nueva base: '));
            storage.createBase(name);
            console.log(`Base '${name}' creada exitosamente.`);
          } else if(dbAction==='b') {
            const name=safeName(await ask('Nombre de la base a BORRAR: '));
            const confirm=await ask(`¿Estás seguro de que deseas eliminar permanentemente '${name}' y todos sus datos? Escribí BORRAR: `);
            if(confirm==='BORRAR') {
              if(storage.deleteBase(name)) {
                console.log(`Base '${name}' eliminada correctamente.`);
              } else {
                console.log(`No se encontró la base '${name}'.`);
              }
            } else {
              console.log('Borrado cancelado.');
            }
          } else if(dbAction==='s'||dbAction==='ver') {
            const name=await ask('Nombre de base para ver estadísticas (Enter vuelve): ');
            if(name) console.log(storage.stats(name));
          }
        }
        else if(choice==='4') {
          const scope=(await ask('Exportar base o trabajo [b/t]: ','b')).toLowerCase();
          if(scope==='b'){
            const base=await chooseBase(false);
            const path=exportBase(storage,base,join(dataDir,'exports'));
            console.log(`\n✔ Base exportada exitosamente.`);
            console.log(`Archivo CSV generado: ${path}`);
          } else if(scope==='t'){
            const id=await ask('ID del trabajo: ');
            const path=exportJob(storage,id,join(dataDir,'exports'));
            console.log(`\n✔ Trabajo exportado exitosamente.`);
            console.log(`Archivo CSV generado: ${path}`);
          }
        }
        else if(choice==='5') {console.table(storage.jobs().map(j=>({id:j.id,base:j.db_name,status:j.status,nuevos:j.unique_ads,duplicados:j.duplicate_ads,fecha:j.started_at})));const name=await ask('Base para estadísticas (Enter vuelve): ');if(name) console.log(storage.stats(name));}
        else if(choice==='6') {
          console.log(`Perfiles: ${JSON.stringify(profileStatus())}. Salud de la sesión activa: comando h dentro de esa sesión.`);
          const url=await ask('URL para comprobación offline (Enter vuelve): ');
          if(url) await runCli(['diagnose','--url',url,'--check']);
        }
        else if(choice==='7') {
          console.log('Se borrarán todas las bases, respaldos, CSV, sesiones y diagnósticos del proyecto. Código y dependencias se conservan.');
          const answer=await ask('Escribí FORMATEAR para confirmar: ');
          if(answer!=='FORMATEAR') {console.log('Formato cancelado.');continue;}
          storage.close();
          try {console.log(`Eliminado: ${formatProject(root,answer).join(', ') || 'no había datos'}`);sessionHandoff=true;io.close();}
          catch(error) {storage=new Storage(join(dataDir,'meta-scraper.sqlite'));throw error;}
        }
        else if(choice==='8') {
          const kind=(await ask('Perfil principal o temporal [main/temp]: ','main')).toLowerCase();
          if(kind!=='main'&&kind!=='temp') throw new Error('Elegí main o temp');
          await runCli(['profile','open',kind]);
        }
        else if(choice==='9') {
          console.log(`Perfiles: ${JSON.stringify(profileStatus())}. SQLite y trabajos no se borran.`);
          const kind=(await ask('Restablecer principal o temporales [main/temp]: ','main')).toLowerCase();
          if(kind!=='main'&&kind!=='temp') throw new Error('Elegí main o temp');
          const answer=await ask(`Escribí RESTABLECER ${kind} para borrar solo ese perfil: `);
          console.log(resetProfile(kind,answer)?'Perfil restablecido.':'No había perfil.');
        }
        else if(choice==='0') break;
        else console.log('Elegí una opción del 0 al 9.');
      } catch(error) {console.error((error as Error).message);}
    }
  } finally {
    process.removeListener('SIGINT', onSigint);
    if(!sessionHandoff) {
      try { io.close(); } catch {}
      try { storage.close(); } catch {}
    }
  }
}
