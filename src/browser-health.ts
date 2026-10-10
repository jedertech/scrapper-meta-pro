import type { DiagnosticEvent } from './diagnostics.js';

export interface BrowserHealthSnapshot {
  process: 'not_started'|'connected'|'closed';
  context: 'not_started'|'available'|'closed';
  page: 'not_started'|'available'|'closed';
  pageState: 'unknown'|'loading'|'loaded'|'verification'|'restricted';
  phase: string;
  httpDocument: number|null;
  graphqlErrors: number;
  pendingRequests: number;
  adsDetected: number;
  lastResponseAt: string|null;
  lastProgressAt: string|null;
  restriction: number|null;
  lastIssue: string|null;
}

/** Event-fed, read-only health summary. It never probes the website. */
export class BrowserHealth {
  private snapshotValue:BrowserHealthSnapshot={process:'not_started',context:'not_started',page:'not_started',pageState:'unknown',
    phase:'idle',httpDocument:null,graphqlErrors:0,pendingRequests:0,adsDetected:0,
    lastResponseAt:null,lastProgressAt:null,restriction:null,lastIssue:null};

  observe(event:DiagnosticEvent):void {
    const h=this.snapshotValue;
    h.phase=event.phase;
    h.adsDetected=Math.max(h.adsDetected,event.adsDetected);
    if(typeof event.pendingRequests==='number') h.pendingRequests=event.pendingRequests;
    if(event.phase==='response') h.lastResponseAt=new Date().toISOString();
    if(event.phase==='navigation'&&event.finalNavigation) h.httpDocument=event.status;
    if(event.phase==='navigation'&&event.finalNavigation) h.pageState=event.status===200?'loading':
      [403,429].includes(event.status??0)?'restricted':'unknown';
    if(event.phase==='response'&&event.kind==='document') h.pageState=event.status===200?'loading':
      [403,429].includes(event.status??0)?'restricted':h.pageState;
    if(event.phase==='wait'&&event.detail==='content_visible') h.pageState='loaded';
    if(event.detail?.startsWith('access_verification_visible')) h.pageState='verification';
    if(event.kind==='graphql'&&event.phase==='json') {
      const match=event.detail?.match(/(?:^|;)consecutive_errors:(\d+)/);
      if(match) h.graphqlErrors=Number(match[1]);
    }
    if(event.detail?.startsWith('cards_new:')) {
      const match=event.detail.match(/(?:^|;)new_ads:(\d+)/);
      if(match&&Number(match[1])>0) h.lastProgressAt=new Date().toISOString();
    }
    if(event.kind==='graphql'&&event.phase==='json'&&event.detail?.includes('new_ids:')) {
      const match=event.detail.match(/(?:^|;)new_ids:(\d+)/);
      if(match&&Number(match[1])>0) h.lastProgressAt=new Date().toISOString();
    }
    if([403,429].includes(event.status??0)&&['document','graphql'].includes(event.kind)) h.restriction=event.status;
    if(event.detail&&(/error|failed|closed|timeout|restricted|rejected|pause/i.test(event.detail))) h.lastIssue=event.detail.slice(0,180);
  }
  setLifecycle(process:BrowserHealthSnapshot['process'],context:BrowserHealthSnapshot['context'],page:BrowserHealthSnapshot['page']):void {
    Object.assign(this.snapshotValue,{process,context,page});
    if(process==='closed'||context==='closed') this.snapshotValue.pendingRequests=0;
  }
  get snapshot():BrowserHealthSnapshot {return {...this.snapshotValue};}
}
