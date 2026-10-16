import type { Job } from './storage.js';

export function progressLine(job:Job,baseAds:number,baseAdvertisers:number,seconds:number,startingAds=0,startingObserved=0):string {
  const pace=seconds>0 ? (Math.max(0,job.unique_ads-startingAds)*60/seconds).toFixed(1) : '0.0';
  const observedPace=seconds>0 ? (Math.max(0,job.observed-startingObserved)*60/seconds).toFixed(1) : '0.0';
  const achieved=job.mode==='advertisers'?job.new_advertisers:job.unique_ads;
  const metric=job.mode==='advertisers'?'anunciantes confirmados nuevos':'anuncios nuevos';
  return `${job.db_name} | ${achieved}/${job.target_total} ${metric} | ${job.duplicate_ads} anuncios duplicados | ${baseAds} anuncios base | ${baseAdvertisers} anunciantes confirmados base | ${pace} nuevos/min; ${observedPace} observados/min | ${job.status}`;
}

export function progressWriter(): (line:string,force?:boolean)=>void {
  let last=0;
  return (line,force=false)=>{
    const now=Date.now();
    if(!force && now-last<1000) return;
    last=now;
    if(process.stdout.isTTY) process.stdout.write(`\r\x1b[2K${line}${force?'\n':''}`);
    else process.stdout.write(`${line}\n`);
  };
}

export function formatSummary(job: Job, elapsedSeconds: number, speedPerMin: number): string {
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = Math.floor(elapsedSeconds % 60);
  const timeFormatted = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  const achieved = job.mode === 'advertisers' ? job.new_advertisers : job.unique_ads;
  const metric = job.mode === 'advertisers' ? 'anunciantes confirmados' : 'anuncios únicos nuevos';

  return [
    '',
    '\x1b[32m═══════════════════════════════════════════════════════════════\x1b[0m',
    `\x1b[1;32m  RESUMEN DE EJECUCIÓN · [ Base: ${job.db_name} ]\x1b[0m`,
    '\x1b[32m───────────────────────────────────────────────────────────────\x1b[0m',
    `  • \x1b[1mEstado final:\x1b[0m       ${job.status} (${job.reason ?? 'Completado'})`,
    `  • \x1b[1mTiempo transcurrido:\x1b[0m ${timeFormatted}`,
    `  • \x1b[1mTotal extraído:\x1b[0m      ${achieved} / ${job.target_total} ${metric}`,
    `  • \x1b[1mDuplicados:\x1b[0m          ${job.duplicate_ads}`,
    `  • \x1b[1mVelocidad media:\x1b[0m     ${speedPerMin.toFixed(1)} items/min`,
    '\x1b[32m═══════════════════════════════════════════════════════════════\x1b[0m',
    ''
  ].join('\n');
}

export function progressLineGreen(job: Job, lastAction = 'Extrayendo...'): string {
  const achieved = job.mode === 'advertisers' ? job.new_advertisers : job.unique_ads;
  const target = job.target_total;
  const pct = Math.min(100, Math.round((achieved / (target || 1)) * 100));
  const barWidth = 15;
  const filled = Math.min(barWidth, Math.round((pct / 100) * barWidth));
  const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);

  // [ Base: nombre ] ⏳ Extraídos: X/Y [████░░] 40% | Repetidos: Z | Última acción: Scroll...
  return `\x1b[32m[ Base: ${job.db_name} ] ⏳ Extraídos: ${achieved}/${target} [${bar}] ${pct}% | Repetidos: ${job.duplicate_ads} | Última acción: ${lastAction}\x1b[0m`;
}
