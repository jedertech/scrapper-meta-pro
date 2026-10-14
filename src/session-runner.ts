import { randomUUID } from 'node:crypto';
import type { Ad, ExtractBatch, Status } from './types.js';
import { AccessError } from './types.js';
import { normalize } from './normalize.js';
import { redact } from './security.js';
import { Storage, type Job } from './storage.js';
import type { DiagnosticEvent } from './diagnostics.js';
import { FLUSH_BATCH_SIZE } from './runner.js';

export async function runSessionSlice(storage:Storage, jobId:string, iterator:AsyncGenerator<ExtractBatch>,
  signal:AbortSignal, shouldPause:()=>boolean, onProgress?:(job:Job)=>void,
  onDiagnostic?:(event:DiagnosticEvent)=>void):Promise<{job:Job;iteratorDone:boolean}> {
  const owner=randomUUID();
  if(!storage.acquire(jobId,owner)) throw new Error('La ejecución ya pertenece a otro proceso');
  let status:Status='PARTIAL';let reason='Sesión pausada';let iteratorDone=false;
  const buffer:Ad[]=[];
  let cursor:string|null=null;
  const flushChunk = (job:Job):Job => {
    const chunk=buffer.splice(0,FLUSH_BATCH_SIZE);
    const updated=storage.persistBatch(jobId,chunk,cursor);
    if(chunk.length) onDiagnostic?.({phase:'summary',kind:'document',url:job.search_url,resourceType:'sqlite',status:200,finalNavigation:false,
      adsDetected:updated.unique_ads,detail:`[Storage] Flushed ${chunk.length} ads to DB. RAM cleared; pending:${buffer.length}`});
    return updated;
  };
  try {
    let job=storage.job(jobId);
    cursor=job.cursor;
    const country=new URL(job.search_url).searchParams.get('country');
    storage.status(jobId,'RUNNING',null);
    while(!signal.aborted) {
      if(shouldPause()) {status='USER_PAUSED';reason='Pausa solicitada por el usuario';break;}
      const next=await iterator.next();
      if(next.done) {iteratorDone=true;status='PARTIAL';reason='El navegador terminó la extracción';break;}
      storage.renew(jobId,owner);
      const batch=next.value;
      for (const raw of batch.ads) {
        buffer.push(normalize(raw,'playwright',country));
        if (buffer.length >= FLUSH_BATCH_SIZE) job = flushChunk(job);
      }
      // End-of-batch flush: the batch cursor is confirmed only after every ad
      // of the batch reached SQLite. Empty batches still record the cursor.
      cursor=batch.cursor;
      job=flushChunk(job);
      onProgress?.(job);
      const achieved=job.mode==='advertisers'?job.new_advertisers:job.unique_ads;
      if(achieved>=job.target_total) {status='COMPLETED';reason='Objetivo alcanzado; pestaña conservada';break;}
      if(shouldPause() || batch.outcome==='USER_PAUSED') {status='USER_PAUSED';reason='Pausa solicitada por el usuario';break;}
      if(batch.outcome==='GRAPHQL_ERROR') {status='GRAPHQL_ERROR';reason=batch.stopReason??'Errores GraphQL consecutivos';break;}
      if(batch.outcome==='ACCESS_ERROR') {status=batch.accessStatus===429?'RATE_LIMITED':'ACCESS_DENIED';reason=batch.stopReason??'Restricción de acceso';break;}
      if(batch.outcome==='STALLED') {status='STALLED';reason=batch.stopReason??'Sin anuncios nuevos';break;}
      if(batch.exhausted) {status='EXHAUSTED';reason='La fuente indicó fin de resultados';break;}
    }
    if(signal.aborted) {status='USER_STOPPED';reason='Cierre solicitado';}
  } catch(error) {
    // Ads extracted before the failure are confirmed before recording it.
    try { while(buffer.length) flushChunk(storage.job(jobId)); } catch {/* storage unavailable; the last commit keeps partial progress */}
    if(signal.aborted) {status='USER_STOPPED';reason='Cierre solicitado';}
    else if(error instanceof AccessError) {
      status=error.status===429?'RATE_LIMITED':'ACCESS_DENIED';reason=redact(error.message);iteratorDone=true;
    } else {status='FAILED';reason=redact(error instanceof Error?error.message:error).split('\n')[0]!.slice(0,500);iteratorDone=true;}
    storage.addError(jobId,status,reason);
  } finally {
    storage.status(jobId,status,reason);
    storage.release(jobId,owner);
  }
  return {job:storage.job(jobId),iteratorDone};
}
