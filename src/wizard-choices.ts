import type { Job } from './storage.js';

export function compatibleJobs(jobs: Job[], base: string, url: string): Job[] {
  return jobs.filter(job => job.db_name===base && job.search_url===url && job.method==='playwright' &&
    !['RUNNING','COMPLETED','EXHAUSTED'].includes(job.status));
}

export function extractionCommand(visible: boolean, resume: string | null): 'session'|'resume'|'run' {
  return resume ? 'resume' : visible ? 'session' : 'run';
}
