import { randomUUID } from 'node:crypto';
import type { ExtractBatch, Status } from './types.js';
import { AccessError } from './types.js';
import { normalize } from './normalize.js';
import { redact } from './security.js';
import { Storage, type Job } from './storage.js';

export async function runSessionSlice(storage:Storage, jobId:string, iterator:AsyncGenerator<ExtractBatch>,
  signal:AbortSignal, shouldPause:()=>boolean, onProgress?:(job:Job)=>void):Promise<{job:Job;iteratorDone:boolean}> {
  const owner=randomUUID();
  if(!storage.acquire(jobId,owner)) throw new Error('La ejecución ya pertenece a otro proceso');
  let status:Status='PARTIAL';let reason='Sesión pausada';let iteratorDone=false;
  try {
    const job=storage.job(jobId);
    const country=new URL(job.search_url).searchParams.get('country');
    storage.status(jobId,'RUNNING',null);
    while(!signal.aborted) {
      if(shouldPause()) {status='USER_PAUSED';reason='Pausa solicitada por el usuario';break;}
      const next=await iterator.next();
      if(next.done) {iteratorDone=true;status='PARTIAL';reason='El navegador terminó la extracción';break;}
      storage.renew(jobId,owner);
      const batch=next.value;
      const updated=storage.persistBatch(jobId,batch.ads.map(raw=>normalize(raw,'playwright',country)),batch.cursor);
      onProgress?.(updated);
      const achieved=updated.mode==='advertisers'?updated.new_advertisers:updated.unique_ads;
      if(achieved>=updated.target_total) {status='COMPLETED';reason='Objetivo alcanzado; pestaña conservada';break;}
      if(shouldPause() || batch.outcome==='USER_PAUSED') {status='USER_PAUSED';reason='Pausa solicitada por el usuario';break;}
      if(batch.outcome==='GRAPHQL_ERROR') {status='GRAPHQL_ERROR';reason=batch.stopReason??'Errores GraphQL consecutivos';break;}
      if(batch.outcome==='ACCESS_ERROR') {status=batch.accessStatus===429?'RATE_LIMITED':'ACCESS_DENIED';reason=batch.stopReason??'Restricción de acceso';break;}
      if(batch.outcome==='STALLED') {status='STALLED';reason=batch.stopReason??'Sin anuncios nuevos';break;}
      if(batch.exhausted) {status='EXHAUSTED';reason='La fuente indicó fin de resultados';break;}
    }
    if(signal.aborted) {status='USER_STOPPED';reason='Cierre solicitado';}
  } catch(error) {
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
