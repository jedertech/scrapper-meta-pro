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
