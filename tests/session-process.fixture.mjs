import { chromium } from 'playwright';
import { Storage } from '../dist/storage.js';
import { startPersistentSession } from '../dist/session-cli.js';
import { browserContextOptions } from '../dist/browser-compat.js';
import { join } from 'node:path';

const dir=process.argv[2];
const context=await chromium.launchPersistentContext(join(dir,'browser'),{...browserContextOptions,headless:true,handleSIGINT:false});
const page=context.pages()[0]??await context.newPage();
await page.goto('about:blank');
const storage=new Storage(join(dir,'data','meta-scraper.sqlite'));
storage.createBase('local');
let release;
process.on('SIGINT',()=>setTimeout(()=>release?.(),50));
const ad=id=>({id:String(id),page_id:'12345',page_name:'Local',description:'Prueba local'});
async function* source(){
  yield {ads:[ad('100001')],cursor:null,exhausted:false};
  console.log('WAITING_FOR_SIGNAL');
  await new Promise(resolve=>{release=resolve;});
  yield {ads:[],cursor:null,exhausted:false,outcome:'USER_PAUSED'};
  yield {ads:[ad('100002')],cursor:null,exhausted:false};
}
try {
  console.log('FIXTURE_READY');
  const alive=setInterval(()=>{if(!page.isClosed()) console.log('BROWSER_ALIVE');},100);
  await startPersistentSession(storage,join(dir,'data'),'local','https://www.facebook.com/ads/library/?country=AR&q=local',2,()=>{},
    {iterator:source(),input:process.stdin,output:process.stdout});
  clearInterval(alive);
  console.log(`FINAL_ADS:${storage.stats('local').ads}`);
} finally {
  await context.close();storage.close();
  console.log('BROWSER_CLOSED');
}
