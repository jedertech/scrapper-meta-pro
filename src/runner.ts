import { randomUUID } from 'node:crypto';
import type { Ad, Extractor, Status } from './types.js';
import { AccessError } from './types.js';
import { normalize } from './normalize.js';
import { redact } from './security.js';
import { Storage, type Job as StoredJob } from './storage.js';
import type { DiagnosticEvent } from './diagnostics.js';

// Constant SQLite batching: normalized ads accumulate in RAM only up to this
// size before being persisted in a transaction and cleared. A single huge
// extractor batch is split into chunks of at most this many ads.
export const FLUSH_BATCH_SIZE = 100;

export async function runJob(storage: Storage, jobId: string, extractor: Extractor, signal: AbortSignal,
  onProgress?: (job: StoredJob, elapsedSeconds: number) => void,
  onDiagnostic?: (event: DiagnosticEvent) => void): Promise<StoredJob> {
  const owner = randomUUID();
  const started = performance.now();
  if (!storage.acquire(jobId,owner)) throw new Error('El trabajo ya se ejecuta en otro proceso');
  let status: Status = 'PARTIAL'; let reason = 'La fuente no confirmó agotamiento';
  const buffer: Ad[] = [];
  let cursor: string | null = null;
  const flushChunk = (job: StoredJob): StoredJob => {
    const chunk = buffer.splice(0, FLUSH_BATCH_SIZE);
    const updated = storage.persistBatch(jobId,chunk,cursor);
    if (chunk.length) onDiagnostic?.({phase:'summary',kind:'document',url:job.search_url,resourceType:'sqlite',status:200,finalNavigation:false,
      adsDetected:updated.unique_ads,detail:`[Storage] Flushed ${chunk.length} ads to DB. RAM cleared; pending:${buffer.length}`});
    return updated;
  };
  try {
    let job = storage.job(jobId);
    cursor = job.cursor;
    if ((job.mode === 'ads' ? job.unique_ads : job.new_advertisers) >= job.target_total) {
      status='COMPLETED'; reason='Objetivo ya alcanzado';
    } else {
      storage.status(jobId,'RUNNING',null);
      const country = new URL(job.search_url).searchParams.get('country');
      for await (const batch of extractor.iterate(job.search_url,job.cursor,signal)) {
        storage.renew(jobId,owner);
        for (const raw of batch.ads) {
          buffer.push(normalize(raw,extractor.method,country));
          if (buffer.length >= FLUSH_BATCH_SIZE) job = flushChunk(job);
        }
        // End-of-batch flush: the batch cursor is confirmed only after every
        // ad of the batch reached SQLite. Empty batches still record the cursor.
        cursor = batch.cursor;
        job = flushChunk(job);
        onProgress?.(job,(performance.now()-started)/1000);
        const achieved = job.mode === 'ads' ? job.unique_ads : job.new_advertisers;
        if (achieved >= job.target_total) { status='COMPLETED'; reason='Objetivo alcanzado'; break; }
        if (batch.outcome==='GRAPHQL_ERROR') { status='GRAPHQL_ERROR'; reason=batch.stopReason ?? 'Tres errores GraphQL consecutivos'; break; }
        if (batch.outcome==='STALLED') { status='STALLED'; reason=batch.stopReason ?? 'No aparecieron anuncios nuevos dentro del límite de espera o desplazamientos'; break; }
        if (batch.exhausted) { status='EXHAUSTED'; reason='La fuente indicó fin de resultados'; break; }
        if (signal.aborted) break;
      }
      if (signal.aborted) { status='INTERRUPTED'; reason='Interrupción solicitada'; }
    }
  } catch (e) {
    // Ads extracted before the failure are confirmed before recording it.
    try { while (buffer.length) flushChunk(storage.job(jobId)); } catch {/* storage unavailable; the last commit keeps partial progress */}
    if (signal.aborted) { status='INTERRUPTED'; reason='Interrupción solicitada'; }
    else if (e instanceof AccessError && e.status===403) { status='ACCESS_DENIED'; reason=redact(e.message); }
    else if (e instanceof AccessError && e.status===429) { status='RATE_LIMITED'; reason=redact(e.message); }
    else { status='FAILED'; reason=redact(e instanceof Error ? e.message : e).split('\n')[0]!.slice(0,500); }
    storage.addError(jobId,status,reason);
  } finally {
    storage.status(jobId,status,reason);
    storage.release(jobId,owner);
  }
  return storage.job(jobId);
}
