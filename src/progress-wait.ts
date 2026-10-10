export type Activity = 'new_ads'|'more_button'|'end_of_results';
export type WaitResult = Activity|'cancelled'|'timeout';

/** Polls only the already loaded page. The caller decides what counts as progress. */
export async function waitForActivity(options:{
  check:()=>Promise<Activity|null>;
  cancelled:()=>boolean;
  maxWaitMs:number;
  pollMs?:number;
  windowMs?:number;
  onWindow?:(elapsedMs:number)=>void;
}):Promise<WaitResult> {
  const started=performance.now();
  const maxWait=Math.max(0,options.maxWaitMs);
  const poll=Math.max(50,options.pollMs??1000);
  const window=Math.max(1,options.windowMs??30000);
  let nextWindow=window;
  while(true) {
    if(options.cancelled()) return 'cancelled';
    const activity=await options.check();
    if(options.cancelled()) return 'cancelled';
    if(activity) return activity;
    const elapsed=performance.now()-started;
    if(elapsed>=maxWait) return 'timeout';
    if(elapsed>=nextWindow) {options.onWindow?.(Math.round(elapsed));nextWindow+=window;}
    await new Promise<void>(resolve=>setTimeout(resolve,Math.min(poll,maxWait-elapsed)));
  }
}
