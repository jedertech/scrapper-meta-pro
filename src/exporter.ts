import { mkdirSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Storage } from './storage.js';
import { safeName } from './security.js';
import { classifyDestination } from './destination.js';

function cell(value: unknown, forceText=false): string {
  if (value === null || value === undefined) return '';
  let s = String(value);
  if (forceText || /^[\s\u0000-\u001f]*[=+@-]/u.test(s)) s = `'${s}`;
  return `"${s.replaceAll('"','""')}"`;
}
function csv(rows: Record<string, unknown>[], columns: string[]): string {
  return '\uFEFF' + columns.join(',') + '\r\n' + rows.map(row => columns.map(key => cell(row[key],['ad_id','advertiser_page_id','advertiser_id'].includes(key))).join(',')).join('\r\n') + '\r\n';
}
const adColumns=['ad_id','advertiser_name','advertiser_page_id','advertiser_page_id_source','advertiser_identity','ad_text','cta','destination_url','ad_library_url',
  'destination_kind','needs_enrichment','platforms','started_running','keyword','country','source_search_url','source_searches','is_new_to_base','first_seen_at','last_seen_at','run_id','extraction_status','quality_reason'];
function preparedAds(rows: Record<string,unknown>[], runId?: string): Record<string,unknown>[] {
  return rows.map(row=>{
    const search=new URL(String(row.search_url));
    return {ad_id:row.id,advertiser_name:row.advertiser_name,advertiser_page_id:row.meta_page_id,
      advertiser_page_id_source:row.meta_page_id_source,
      advertiser_identity:row.advertiser_id,
      ad_text:row.description,cta:row.cta_text,destination_url:row.cta_url,ad_library_url:row.library_url,
      destination_kind:classifyDestination(row.cta_url),needs_enrichment:classifyDestination(row.cta_url)==='unknown'?'yes':'no',
      platforms:row.platforms,started_running:row.ad_start_date,keyword:search.searchParams.get('q'),
      country:row.country,source_search_url:row.search_url,source_searches:row.source_searches,
      is_new_to_base:row.is_new_to_base===1?'yes':'no',first_seen_at:row.first_seen_at,last_seen_at:row.last_seen_at,
      run_id:runId??row.run_id,extraction_status:row.extraction_status,quality_reason:row.quality_reason};
  });
}
function argentinaStamp(): {date:string;time:string} {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
  const get=(key:string)=>parts.find(p=>p.type===key)!.value;
  return {date:`${get('year')}-${get('month')}-${get('day')}`,time:`${get('hour')}-${get('minute')}-${get('second')}`};
}
function atomicDirectory(root:string,label:string,files:Record<string,string>):string {
  const stamp=argentinaStamp();
  const dated=resolve(root,stamp.date);mkdirSync(dated,{recursive:true,mode:0o700});
  const nonce=randomUUID().slice(0,8);
  const safe=safeName(label);
  const final=join(dated,`${stamp.time}_${safe}_${nonce}`);
  const staging=join(dated,`.${stamp.time}_${safe}_${nonce}.tmp`);
  mkdirSync(staging,{mode:0o700});
  try {
    for(const [name,content] of Object.entries(files)) writeFileSync(join(staging,name),content,{flag:'wx',mode:0o600});
    renameSync(staging,final);
    return final;
  } catch(e) { rmSync(staging,{recursive:true,force:true}); throw e; }
}
export function exportJob(storage: Storage, id: string, root: string): string {
  const job=storage.job(id);
  const rows=storage.adRows(id) as Record<string,unknown>[];
  const advertisers=storage.advertiserRows(id) as Record<string,unknown>[];
  const parseUtc=(value:string)=>Date.parse(value.includes('T')?value:value.replace(' ','T')+'Z');
  const elapsed=Math.max(0,(parseUtc(job.finished_at??new Date().toISOString())-parseUtc(job.started_at))/1000);
  const path=atomicDirectory(root,id,{
    'ads.csv':csv(preparedAds(rows,id),adColumns),
    'advertisers.csv':csv(advertisers,['advertiser_id','advertiser_name','ads_observed','landing_domains']),
    'run_report.json':JSON.stringify({job,rows:{ads:rows.length,advertisers:advertisers.length},elapsed_seconds:elapsed,
      ads_per_minute:elapsed>0&&job.unique_ads>0?job.unique_ads/(elapsed/60):null,
      coverage:'La cobertura de la biblioteca web no es exhaustiva ni verificable.'},null,2)+'\n',
    'errors.jsonl':storage.errors(id).map(x=>JSON.stringify(x)).join('\n')+'\n'
  });
  storage.recordExport(id,path);
  return path;
}
export function exportBase(storage: Storage, base: string, root: string): string {
  const rows=storage.baseAdRows(base) as Record<string,unknown>[];
  return atomicDirectory(root,`base_${safeName(base)}`,{
    'ads.csv':csv(preparedAds(rows),adColumns),
    'run_report.json':JSON.stringify({base,scope:'all_base',ads:rows.length,generated_at:new Date().toISOString()},null,2)+'\n'
  });
}
