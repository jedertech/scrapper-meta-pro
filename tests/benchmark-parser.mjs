import { performance } from 'node:perf_hooks';
import { collectJsonAds } from '../dist/extractors.js';
import { normalize } from '../dist/normalize.js';

const count=Number(process.argv[2] ?? 5000);
if (!Number.isSafeInteger(count) || count < 1) throw new Error('Cantidad inválida');
const payloads=[];
for (let offset=0; offset<count; offset+=50) {
  const edges=Array.from({length:Math.min(50,count-offset)},(_,i)=>{
    const n=offset+i+1;
    return {node:{collated_results:[{ad_archive_id:String(n),page_id:String(Math.floor(n/10)+1),page_name:'Marca',
      start_date:1760000000,publisher_platform:['FACEBOOK','INSTAGRAM'],snapshot:{body:{text:`Anuncio ${n}`},cta_text:'Comprar',link_url:'https://example.org'}}]}};
  });
  payloads.push(JSON.stringify({data:{ad_library_main:{search_results_connection:{edges}}}}));
}
const start=performance.now(); let valid=0, cta=0, rows=0;
for (const payload of payloads) for (const raw of collectJsonAds(payload)) {
  const ad=normalize(raw,'playwright','AR'); rows++;
  if (ad.quality==='valid') valid++;
  if (ad.ctaText==='Comprar' && ad.ctaUrl) cta++;
}
const elapsedMs=performance.now()-start;
if (rows!==count || valid!==count || cta!==count) throw new Error('Integridad del benchmark local fallida');
console.log(JSON.stringify({fixture:true,source:'synthetic GraphQL-shaped JSON; no Meta traffic',rows,payloads:payloads.length,
  valid,cta,elapsedMs:Number(elapsedMs.toFixed(2)),rowsPerSecond:Number((rows/elapsedMs*1000).toFixed(1)),
  rssMb:Number((process.memoryUsage().rss/1048576).toFixed(1))},null,2));
