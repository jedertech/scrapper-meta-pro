import { performance } from 'node:perf_hooks';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Storage } from '../dist/storage.js';
import { normalize } from '../dist/normalize.js';

const count=Number(process.argv[2] ?? 5000);
if(!Number.isSafeInteger(count)||count<1) throw new Error('Cantidad inválida');
const s=new Storage(join(mkdtempSync(join(tmpdir(),'meta-bench-')),'db.sqlite'));
try {
  s.createBase('bench');
  const job=s.createJob('bench','https://www.facebook.com/ads/library/?country=AR&q=benchmark','ads','playwright','chromium',count);
  const started=performance.now(); let parseMs=0, writeMs=0;
  for(let offset=0;offset<count;offset+=100){
    const n=Math.min(100,count-offset); const p=performance.now();
    const ads=Array.from({length:n},(_,i)=>normalize({id:String(offset+i+1),page_id:String(Math.floor((offset+i)/10)+1),page_name:'Anunciante',ad_creative_bodies:['Texto de prueba 😀']},'playwright','AR'));
    parseMs+=performance.now()-p;
    const w=performance.now(); s.persistBatch(job.id,ads,null); writeMs+=performance.now()-w;
  }
  const elapsed=performance.now()-started;
  console.log(JSON.stringify({fixture:true,count,unique_ads:s.job(job.id).unique_ads,new_advertisers:s.job(job.id).new_advertisers,
    elapsed_ms:Math.round(elapsed),parse_ms:Math.round(parseMs),sqlite_ms:Math.round(writeMs),ads_per_minute:Math.round(count/elapsed*60000),
    rss_mb:Math.round(process.memoryUsage().rss/1048576),integrity:s.integrity()},null,2));
} finally {s.close();}
