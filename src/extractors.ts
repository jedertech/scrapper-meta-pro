import { chromium, firefox, webkit, type Browser, type BrowserContext, type BrowserType, type Page, type Response as PlaywrightResponse } from 'playwright';
import type { ExtractBatch, Extractor } from './types.js';
import { AccessError } from './types.js';
import { redact, validateRedirect } from './security.js';
import { parseVisibleCard, type VisibleCard } from './visible-card.js';
import { browserContextOptions } from './browser-compat.js';
import { errorKind, safeDiagnosticUrl, type DiagnosticEvent, type DiagnosticKind } from './diagnostics.js';
import { inspectLoadedPage } from './dom-inspection.js';
import { selectMoreButton, type PaginationSnapshot } from './pagination.js';
import { GraphqlHealth } from './graphql-health.js';
import { waitForActivity } from './progress-wait.js';

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
const MAX_JSON_BYTES = 5_000_000;

export function graphqlErrorDetail(body: string): string {
  try {
    const line=body.trim().replace(/^for\s*\(;;\)\s*;?\s*/,'').split('\n').find(s=>s.trim().startsWith('{'));
    const root=JSON.parse(line??'{}') as {errors?:Array<{code?:unknown;message?:unknown}>};
    const error=root.errors?.[0];
    if(!error) return '';
    const code=typeof error.code==='number' && Number.isSafeInteger(error.code)?String(error.code):'unknown';
    const message=typeof error.message==='string' ? redact(error.message).replace(/https?:\/\/\S+/gi,'[url]')
      .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,'[email]')
      .replace(/\b[\w-]*(?:token|secret|password|cookie|key)[\w-]*\b/gi,'[redacted]')
      .replace(/[\r\n\t]+/g,' ').slice(0,120) : 'unavailable';
    return `;error_code:${code};error_message:${message}`;
  } catch {return '';} // Diagnostics never retain raw GraphQL payloads.
}

export function shouldCaptureResponse(url: string, contentType: string, contentLength: number): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' || !['facebook.com','www.facebook.com'].includes(u.hostname.toLowerCase())) return false;
    if (!Number.isFinite(contentLength) || contentLength > MAX_JSON_BYTES) return false;
    return contentType.toLowerCase().includes('json') || u.pathname === '/api/graphql/' || u.pathname === '/api/graphql';
  } catch { return false; }
}

export function scrollBudgetForTarget(target: number): number {
  if (!Number.isSafeInteger(target) || target < 1) throw new Error('Objetivo inválido');
  return Math.max(30, Math.ceil(target / 8) + 20);
}

export function collectJsonAds(body: string): unknown[] {
  return parseJsonAds(body).ads;
}

export function parseJsonAds(body: string): {ads: unknown[]; invalidFragments: number; oversized: boolean} {
  if (Buffer.byteLength(body, 'utf8') > MAX_JSON_BYTES) return {ads:[],invalidFragments:0,oversized:true};
  const clean = body.trim().replace(/^for\s*\(;;\)\s*;?\s*/, '');
  try { return {ads:collectAds(JSON.parse(clean)),invalidFragments:0,oversized:false}; }
  catch { /* response can contain multiple JSON lines */ }
  const found: unknown[] = [];
  let invalidFragments = 0;
  for (const line of clean.split('\n')) {
    const json = line.trim().replace(/^for\s*\(;;\)\s*;?\s*/, '');
    if (!json || (json[0] !== '{' && json[0] !== '[')) continue;
    try { found.push(...collectAds(JSON.parse(json))); } catch { invalidFragments++; }
  }
  if (!found.length && !invalidFragments && clean) invalidFragments = 1;
  return {ads:found,invalidFragments,oversized:false};
}

export function collectAds(root: unknown): unknown[] {
  const found: unknown[] = []; const stack: unknown[] = [root]; let visited = 0;
  while (stack.length && visited++ < 50000) {
    const item = stack.pop();
    if (!item || typeof item !== 'object') continue;
    if (Array.isArray(item)) { for (const child of item) stack.push(child); continue; }
    const o = item as Record<string, unknown>;
    const id = o.ad_archive_id ?? o.adArchiveID ?? o.archive_id ?? o.id;
    const snapshot = o.snapshot && typeof o.snapshot === 'object' ? o.snapshot as Record<string,unknown> : {};
    const pageId = o.page_id ?? o.pageId ?? snapshot.page_id;
    const explicitAdId = o.ad_archive_id ?? o.adArchiveID ?? o.archive_id;
    if (id && (pageId || explicitAdId) && (o.page_name || o.pageName || o.snapshot)) {
      const body = snapshot.body && typeof snapshot.body === 'object' ? snapshot.body as Record<string,unknown> : {};
      const directBody = o.body && typeof o.body === 'object' ? o.body as Record<string,unknown> : {};
      found.push({ id, page_id: pageId, page_id_source:pageId?'structured_json':null,
        page_name: o.page_name ?? o.pageName ?? snapshot.page_name,
        description: o.description ?? (typeof o.body === 'string' ? o.body : directBody.text) ?? body.text ?? (typeof snapshot.body === 'string' ? snapshot.body : null),
        cta_url: o.cta_url ?? o.link_url ?? snapshot.link_url,
        cta_text: o.cta_text ?? snapshot.cta_text,
        publisher_platforms: o.publisher_platforms ?? o.publisher_platform,
        ad_delivery_start_time: o.ad_delivery_start_time ?? o.start_date });
      continue;
    }
    for (const child of Object.values(o)) if (child && typeof child === 'object') stack.push(child);
  }
  return found;
}

export interface ExtractorOptions {
  onDiagnostic?: (event: DiagnosticEvent) => void;
  diagnosticOnly?: boolean;
  diagnosticSettleMs?: number;
  headless?: boolean;
  recoveryWaitMs?: number;
  paginationDiagnostic?: boolean;
  maxPaginationClicks?: number;
  keepOpen?: boolean;
  persistentSession?: boolean;
  onPageClosed?: () => void;
  graphqlPauseAfter?: number;
  paginationWaitMs?: number;
  stalledWaitMs?: number;
  profileDir?: string;
  // Injection point for offline response-sequence tests; production uses Playwright.
  browserTypes?: Record<'chromium' | 'firefox' | 'webkit', BrowserType>;
}

export class PlaywrightExtractor implements Extractor {
  method = 'playwright' as const;
  private paused = false;
  private generation = 0;
  private restricted = false;
  private currentPage: Page | null = null;
  private currentContext: BrowserContext | null = null;
  private contextClosed = false;
  private browserDisconnected = false;
  constructor(private browserName: 'chromium' | 'firefox' | 'webkit', private maxScrolls = 30,
    private options: ExtractorOptions = {}) {}
  pause(): void { if (!this.paused) { this.paused=true; this.generation++; } }
  resume(): void { if (this.paused) { this.paused=false; this.generation++; } }
  get accessRestricted(): boolean { return this.restricted; }
  get browserState(): {process:'not_started'|'connected'|'closed';context:'not_started'|'available'|'closed';page:'not_started'|'available'|'closed'} {
    const context=this.currentContext;
    const browser=context?.browser();
    return {process:!context?'not_started':this.contextClosed||this.browserDisconnected||(browser&&!browser.isConnected())?'closed':'connected',
      context:!context?'not_started':this.contextClosed?'closed':'available',
      page:!this.currentPage?'not_started':this.currentPage.isClosed()?'closed':'available'};
  }
  async readyForResume(): Promise<boolean> {
    if(this.restricted || !this.currentPage || this.currentPage.isClosed()) return false;
    try {
      const inspection=await inspectLoadedPage(this.currentPage);
      return !inspection.accessCheckVisible && /^https:\/\/(?:www\.)?facebook\.com\/ads\/library\//.test(inspection.url);
    } catch {return false;}
  }
  async *iterate(url: string, _cursor: string | null, signal: AbortSignal): AsyncGenerator<ExtractBatch> {
    // An already cancelled job must not launch a browser or contact the site.
    if (signal.aborted) return;
    const types = this.options.browserTypes ?? { chromium, firefox, webkit };
    let browser:Browser|null=null;
    let context:BrowserContext;
    if(this.options.profileDir) {
      if(this.browserName!=='chromium') throw new Error('Los perfiles propios requieren Chromium');
      context=await types.chromium.launchPersistentContext(this.options.profileDir,{
        ...browserContextOptions,headless:this.options.headless??true,handleSIGINT:false});
    } else {
      browser=await types[this.browserName].launch({headless:this.options.headless??true,
        handleSIGINT:!this.options.persistentSession});
      try {context=await browser.newContext(browserContextOptions);}
      catch(e) {await browser.close();throw e;}
    }
    let page:Page;
    try {page=context.pages()[0]??await context.newPage();}
    catch(e) {await context.close();await browser?.close();throw e;}
    this.currentPage=page;
    this.currentContext=context;
    this.contextClosed=false;this.browserDisconnected=false;
    context.on('close',()=>{this.contextClosed=true;});
    context.browser()?.on('disconnected',()=>{this.browserDisconnected=true;});
    let adsDetected = 0;
    let outcome = 'partial';
    let activeRequests=0;
    const requestStarted=new WeakMap<object,number>();
    const emit = (event: Omit<DiagnosticEvent,'adsDetected'>) => this.options.onDiagnostic?.({...event,adsDetected,pendingRequests:activeRequests});
    const event = (phase: DiagnosticEvent['phase'], kind: DiagnosticKind, eventUrl: string,
      resourceType: string, status: number | null, detail?: string, finalNavigation = false) =>
      emit({phase,kind,url:safeDiagnosticUrl(eventUrl),resourceType,status,finalNavigation,detail});
    const pending: unknown[] = [];
    const seen = new Set<string>();
    const inflight = new Set<Promise<void>>();
    let graphqlFailure: {status:number;url:string} | null = null;
    let stopNetwork = false;
    let hardStop = false;
    let pageWasClosed = false;
    const graphqlHealth = new GraphqlHealth(this.options.graphqlPauseAfter ?? 5);
    const requestGeneration = new WeakMap<object,{generation:number;paused:boolean}>();
    const isPageClosed = () => pageWasClosed || (page.isClosed?.() ?? false);
    let recoveredDocument: PlaywrightResponse | null = null;
    let resolveRecovery: (response: PlaywrightResponse) => void = () => {};
    const recovery = new Promise<PlaywrightResponse>(resolve => { resolveRecovery=resolve; });
    let graphqlPausePending=false;
    const recordJson = (body: string, responseUrl: string, resourceType: string, kind: DiagnosticKind,
      operation = 'other', status: number | null = null) => {
      const parsed = parseJsonAds(body);
      if (kind === 'graphql') {
        const hasErrors = /"errors"\s*:\s*\[\s*\{/u.test(body);
        const newIds=parsed.ads.filter(raw=>{
          const id=String((raw as Record<string,unknown>).id??'');
          return id && !seen.has(id) && !receivedIds.has(id);
        });
        for(const raw of newIds) receivedIds.add(String((raw as Record<string,unknown>).id));
        const consecutiveErrors = graphqlHealth.observe(operation,hasErrors,newIds.length);
        const errorDetail = hasErrors ? graphqlErrorDetail(body) : '';
        event('json',kind,responseUrl,resourceType,status,
          `operation:${operation};payload_bytes:${Buffer.byteLength(body,'utf8')};ads_parsed:${parsed.ads.length};new_ids:${newIds.length};graphql_errors:${hasErrors};consecutive_errors:${consecutiveErrors};edges:${/"edges"\s*:\s*\[/u.test(body)};cursor:${/"(?:end_cursor|cursor)"\s*:/u.test(body)};invalid_fragments:${parsed.invalidFragments}${errorDetail}`);
        if (graphqlHealth.shouldWarn) event('json',kind,responseUrl,resourceType,status,`graphql_warning:${consecutiveErrors}`);
        if (graphqlHealth.shouldPause) {
          graphqlPausePending=true;
          this.pause();
          event('json',kind,responseUrl,resourceType,status,`graphql_pause:${consecutiveErrors}`);
        }
      }
      pending.push(...parsed.ads);
      if (parsed.invalidFragments) event('json',kind,responseUrl,resourceType,null,`invalid_json_fragments:${parsed.invalidFragments}`);
      if (parsed.oversized) event('json',kind,responseUrl,resourceType,null,'json_oversized');
      if (parsed.ads.length) event('json',kind,responseUrl,resourceType,null,`ads_parsed:${parsed.ads.length}`);
    };
    const receivedIds = new Set<string>();
    const failIfGraphqlRestricted = () => {
      if (!graphqlFailure) return;
      const hit = graphqlFailure as {status:number;url:string};
      stopNetwork = true;
      throw new AccessError(hit.status,`HTTP ${hit.status} en GraphQL secundario ${hit.url}; documento principal correcto, ${adsDetected} anuncios preservados`);
    };
    try {
      page.on('close', () => { pageWasClosed = true; this.options.onPageClosed?.(); });
      page.on('request', request => {requestGeneration.set(request,{generation:this.generation,paused:this.paused});
        requestStarted.set(request,performance.now());activeRequests++;});
      const finishRequest=()=>{activeRequests=Math.max(0,activeRequests-1);};
      page.on('requestfinished',finishRequest);
      page.on('requestfailed',request=>{finishRequest();event('response','unknown',request.url(),request.resourceType(),null,'request_failed');});
      await page.route('**/*', route => {
        if (stopNetwork || hardStop) { void route.abort(); return; }
        const request=route.request();
        if (request.isNavigationRequest()) {
          try { validateRedirect(request.url()); }
          catch { event('navigation','document',request.url(),request.resourceType(),null,'redirect_rejected'); void route.abort(); return; }
        }
        void route.continue();
      });
      page.on('response', r => {
        try {
          const request = r.request();
          const resourceType = request.resourceType();
          const responseUrl = r.url();
          const isGraphql = shouldCaptureResponse(responseUrl,'',0);
          const kind: DiagnosticKind = request.isNavigationRequest() ? 'document' : isGraphql ? 'graphql' : 'secondary';
          const isMeta = safeDiagnosticUrl(responseUrl) !== '[external-resource]';
          let detail: string | undefined;
          if (request.isNavigationRequest() && r.status() >= 300 && r.status() < 400) {
            const location = r.headers()['location'];
            if (location) detail = `redirect_to:${safeDiagnosticUrl(new URL(location,responseUrl).toString())}`;
          }
          if (this.options.diagnosticOnly || kind !== 'secondary' || r.status() >= 400)
            emit({phase:'response',kind,url:safeDiagnosticUrl(responseUrl),resourceType,status:r.status(),finalNavigation:false,
              detail,durationMs:requestStarted.has(request)?Math.round(performance.now()-requestStarted.get(request)!):undefined});
          if (kind === 'document' && r.ok()) {
            recoveredDocument = r;
            resolveRecovery(r);
          }
          if (isMeta && kind === 'graphql') {
            if ([403,429].includes(r.status())) {
              graphqlFailure = {status:r.status(),url:safeDiagnosticUrl(responseUrl)};
              stopNetwork = true;
              this.restricted = true;
            } else if (r.ok() && !graphqlFailure) {
              graphqlFailure = null;
              if (!hardStop) stopNetwork = false;
            }
          }
          if (!r.ok()) return;
          const requestState=requestGeneration.get(request);
          if (this.paused || requestState?.paused || (requestState && requestState.generation!==this.generation)) {
            if(kind==='graphql') event('response',kind,responseUrl,resourceType,r.status(),'late_or_paused_response_ignored');
            return;
          }
          const headers = r.headers();
          if (!shouldCaptureResponse(responseUrl,headers['content-type'] ?? '',Number(headers['content-length'] ?? 0))) return;
          const operation=kind==='graphql' && request.postData?.()?.includes('AdLibrarySearchPaginationQuery') ?
            'AdLibrarySearchPaginationQuery' : 'other';
          const generation=this.generation;
          const task = r.text().then(body => {
            if(this.paused || generation!==this.generation) {
              if(kind==='graphql') event('json',kind,responseUrl,resourceType,r.status(),'late_response_ignored');
              return;
            }
            recordJson(body,responseUrl,resourceType,kind,operation,r.status());
          }).catch(e =>
            event('json',kind,responseUrl,resourceType,r.status(),`read_${errorKind(e)}`));
          inflight.add(task);
          void task.finally(() => inflight.delete(task));
        } catch { event('response','unknown','', 'unknown',null,'response_handler_error'); }
      });
      if (signal.aborted) { outcome = 'cancelled_before_navigation'; return; }
      let response;
      try { response = await page.goto(url, { waitUntil: 'commit', timeout: 30000 }); }
      catch (e) { event('navigation','document',url,'document',null,`navigation_${errorKind(e)}`,true); throw e; }
      if (response?.status() === 403) {
        event('navigation','document',response.url(),'document',403,'initial_rejection;waiting_for_same_tab_recovery');
        const maxWait = Math.min(30000,Math.max(0,this.options.recoveryWaitMs ?? 12000));
        const later = recoveredDocument ?? await Promise.race([recovery,sleep(maxWait).then(()=>null)]);
        if (later && later.ok() && !signal.aborted) {
          response = later;
          event('navigation','document',later.url(),'document',later.status(),'recovered_in_same_tab');
        }
      }
      const finalUrl = response?.url() ?? page.url();
      validateRedirect(finalUrl);
      event('navigation','document',finalUrl,'document',response?.status() ?? null,'final_response',true);
      if (!response) throw new Error('Navegación sin respuesta principal');
      if ([403,429].includes(response.status())) {
        hardStop = true;
        try {
          const inspection = await inspectLoadedPage(page);
          const usable = inspection.ads.length > 0;
          event('dom','document',inspection.url,'document',response.status(),
            `rejected_document;cards:${inspection.visibleCards};unique_ids:${inspection.uniqueIds.length};parsed_ads:${inspection.ads.length};access_check:${inspection.accessCheckVisible};usable:${usable}`);
        } catch (e) { event('dom','document',finalUrl,'document',response.status(),`rejected_document_inspection_${errorKind(e)}`); }
        throw new AccessError(response.status(),
          `HTTP ${response.status()} en navegación principal ${safeDiagnosticUrl(response.url())}`);
      }
      if (!response.ok()) throw new Error(`HTTP ${response.status()} en navegación principal ${safeDiagnosticUrl(response.url())}`);
      try {
        await page.waitForFunction(() => /Identificador de la biblioteca|Library ID|No se encontraron anuncios|No ads match/i.test(document.body?.innerText ?? ''),
          undefined, { timeout: 10000 });
        event('wait','document',finalUrl,'document',response.status(),'content_visible');
      } catch (e) {
        const kind = errorKind(e);
        event('wait','document',finalUrl,'document',response.status(),`content_${kind}`);
        if (kind !== 'timeout') throw e;
      }
      let embedded: string[];
      try { embedded = await page.locator('script[type="application/json"]').evaluateAll((nodes, maxBytes) =>
        nodes.map(n => n.textContent ?? '').filter(s => s.includes('search_results_connection') && s.length <= maxBytes).slice(0, 40), MAX_JSON_BYTES); }
      catch (e) { event('json','document',finalUrl,'document',response.status(),`embedded_${errorKind(e)}`); throw e; }
      for (const body of embedded) recordJson(body,finalUrl,'document','document');
      if (this.options.diagnosticOnly) await sleep(this.options.diagnosticSettleMs ?? 1500);
      let stable = 0;
      let paginationClicks = 0;
      let paginationWaiting = false;
      const maxPaginationClicks = this.options.paginationDiagnostic ? 1 :
        Math.max(0,this.options.maxPaginationClicks ?? (this.options.persistentSession ? Number.MAX_SAFE_INTEGER : 25));
      const paginationSnapshot = async ():Promise<PaginationSnapshot> => {
        const result = await page.evaluate(() => {
          const labels=[...document.querySelectorAll('span')].filter(el=>/^(Identificador de la biblioteca|Library ID):\s*\d{5,30}$/i.test(el.textContent?.trim()??''));
          const lastBottom=labels.length ? Math.max(...labels.map(el=>el.getBoundingClientRect().bottom+window.scrollY)) : 0;
          const controls=[...document.querySelectorAll('button, [role="button"]')];
          const buttons=controls.map((el,index)=>({index,text:(el.textContent??'').trim(),
            visible:el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0,
            belowResults:el.getBoundingClientRect().top+window.scrollY>lastBottom+30}));
          const tail=(document.body?.innerText??'').slice(-1200);
          return {buttons,endOfResults:/no hay más resultados|no se encontraron más anuncios|no more results|end of results/i.test(tail)};
        });
        return result && !Array.isArray(result) && Array.isArray(result.buttons) ? result as PaginationSnapshot : {buttons:[],endOfResults:false};
      };
      const waitForPageActivity = async (watchControl:boolean,limitMs:number) => {
        const started=performance.now();
        event('wait','document',finalUrl,'document',response.status(),`progress_wait_started;max_seconds:${Math.ceil(limitMs/1000)}`);
        const result=await waitForActivity({
          maxWaitMs:limitMs,pollMs:1000,
          cancelled:()=>this.paused||signal.aborted,
          onWindow:elapsed=>event('wait','document',finalUrl,'document',response.status(),
            `progress_wait_elapsed:${Math.floor(elapsed/1000)};remaining:${Math.max(0,Math.ceil((limitMs-elapsed)/1000))}`),
          check:async()=>{
            failIfGraphqlRestricted();
            if(pending.some(raw=>raw&&typeof raw==='object'&& !seen.has(String((raw as Record<string,unknown>).id??'')))) return 'new_ads';
            const visibleIds=await page.evaluate(() => {
              const ids:string[]=[];
              for(const el of document.querySelectorAll('span')) {
                const match=el.textContent?.trim().match(/^(?:Identificador de la biblioteca|Library ID):\s*(\d{5,30})$/i);
                if(match) ids.push(match[1]!);
              }
              return ids;
            });
            if(visibleIds.some(id=>!seen.has(id))) return 'new_ads';
            if(watchControl) {
              const snapshot=await paginationSnapshot();
              if(selectMoreButton(snapshot)!==null) return 'more_button';
              if(snapshot.endOfResults) return 'end_of_results';
            }
            return null;
          }
        });
        event('wait','document',finalUrl,'document',response.status(),
          `progress_wait_${result};elapsed_ms:${Math.round(performance.now()-started)}`);
        return result;
      };
      for (let i=0; (this.options.persistentSession || i<this.maxScrolls) && !signal.aborted; i++) {
        if (this.paused) {
          if(graphqlPausePending) {
            const tail=pending.splice(0).filter((x):x is Record<string,unknown>=>Boolean(x&&typeof x==='object'))
              .filter(x=>{const id=String(x.id??'');if(!id||seen.has(id))return false;seen.add(id);return true;});
            if(tail.length) {adsDetected+=tail.length;yield {ads:tail,cursor:null,exhausted:false};}
            outcome='graphql_payload_error';
            yield {ads:[],cursor:null,exhausted:false,outcome:'GRAPHQL_ERROR',stopReason:`${graphqlHealth.pauseAfter} errores consecutivos de paginación GraphQL sin IDs nuevos`};
            if(!this.options.persistentSession) return;
            graphqlHealth.manualResume();graphqlPausePending=false;paginationWaiting=false;stable=0;
          } else {
            outcome='user_paused';
            yield {ads:[],cursor:null,exhausted:false,outcome:'USER_PAUSED'};
          }
          continue;
        }
        if (isPageClosed()) {
          outcome='page_closed';
          yield {ads:[],cursor:null,exhausted:false,outcome:'STALLED',stopReason:'La pestaña se cerró durante la carga; datos anteriores conservados'};
          return;
        }
        const cycleStart=performance.now();
        if (inflight.size) await Promise.race([Promise.allSettled([...inflight]),sleep(2500)]);
        let text: string;
        try { text = (await page.locator('body').innerText({ timeout: 5000 })).slice(0,5000).toLowerCase(); }
        catch (e) { event('dom','document',finalUrl,'document',response.status(),`body_${errorKind(e)}`); throw e; }
        if (/captcha|security check|verifica tu identidad|verify your identity|temporarily blocked/.test(text)) {
          event('dom','document',finalUrl,'document',response.status(),'access_verification_visible');
          throw new AccessError(403,'Página de verificación o bloqueo');
        }
        let cards: VisibleCard[];
        try { cards = await page.evaluate((knownIds: string[]) => {
          const out: VisibleCard[] = [];
          const known=new Set(knownIds);
          const spans = [...document.querySelectorAll('span')].filter(e => /^Identificador de la biblioteca:\s*\d{5,30}$/.test(e.textContent?.trim() ?? ''));
          for (const label of spans) {
            const id = label.textContent!.match(/\d{5,30}/)![0];
            if (known.has(id)) continue;
            let card: Element | null = label;
            while (card && (!card.querySelector('a[href*="facebook.com/"]') || card.querySelectorAll('span').length < 2)) card=card.parentElement;
            if (!card) continue;
            const ids=[...card.querySelectorAll('span')].filter(e => /^Identificador de la biblioteca:\s*\d{5,30}$/.test(e.textContent?.trim() ?? ''));
            if (ids.length !== 1) continue;
            const description=card.querySelector('div[style*="white-space: pre-wrap"]')?.textContent?.trim() ?? null;
            out.push({id,text:(card as HTMLElement).innerText ?? '',description,
              links:[...card.querySelectorAll('a[href]')].map(a=>({text:(a as HTMLElement).innerText ?? '',href:(a as HTMLAnchorElement).href}))});
          }
          return out;
        }, [...seen]); }
        catch (e) { event('dom','document',finalUrl,'document',response.status(),`cards_${errorKind(e)}`); throw e; }
        const extracted=cards.map(parseVisibleCard).filter((x): x is Record<string,unknown> => x!==null);
        const merged=[...pending.splice(0),...extracted] as Array<Record<string,unknown>>;
        const fresh = merged.filter(x => { const id=String(x.id ?? ''); if (!id || seen.has(id)) return false; seen.add(id); return true; });
        adsDetected += fresh.length;
        if (fresh.length) outcome = 'ads_observed';
        if (fresh.length) graphqlHealth.progress();
        event('dom','document',finalUrl,'document',response.status(),
          `cards_new:${cards.length};new_ads:${fresh.length};cycle:${i};load_ms:${Math.round(performance.now()-cycleStart)}`);
        if (fresh.length) { stable=0; yield { ads:fresh, cursor:null, exhausted:false }; } else stable++;
        failIfGraphqlRestricted();
        if (graphqlHealth.shouldPause) {
          outcome='graphql_payload_error';
          this.pause();
          yield {ads:[],cursor:null,exhausted:false,outcome:'GRAPHQL_ERROR',stopReason:`${graphqlHealth.pauseAfter} errores consecutivos de paginación GraphQL sin IDs nuevos`};
          if (this.options.persistentSession) {graphqlHealth.manualResume();paginationWaiting=false;stable=0;continue;}
          return;
        }
        if (this.paused) {yield {ads:[],cursor:null,exhausted:false,outcome:'USER_PAUSED'};continue;}
        if (paginationWaiting && !fresh.length) {
          const activity=await waitForPageActivity(false,this.options.paginationWaitMs ?? 60000);
          if(activity==='new_ads'||activity==='cancelled') continue;
          outcome='pagination_no_new_results';
          yield {ads:[],cursor:null,exhausted:false,outcome:'STALLED',stopReason:graphqlHealth.consecutiveErrors>0?
            `GraphQL devolvió ${graphqlHealth.consecutiveErrors} error(es) de paginación; sin IDs nuevos`:'El control Ver más no produjo IDs nuevos en 60 segundos'};
          if (this.options.persistentSession) {paginationWaiting=false;stable=0;continue;}
          return;
        }
        paginationWaiting=false;
        if (this.options.paginationDiagnostic && paginationClicks>=1) {
          outcome='pagination_diagnostic_complete';
          return;
        }
        if (this.options.diagnosticOnly) {
          if (!adsDetected) event('dom','document',finalUrl,'document',response.status(),'dom_no_results');
          outcome='diagnostic_complete';
          return;
        }
        if (!fresh.length) {
          const snapshot=await paginationSnapshot();
          const moreIndex=selectMoreButton(snapshot);
          if (snapshot.endOfResults && moreIndex===null) {
            outcome='end_of_results_visible';
            yield {ads:[],cursor:null,exhausted:true};
            return;
          }
          if (moreIndex!==null) {
            if(this.paused) {yield {ads:[],cursor:null,exhausted:false,outcome:'USER_PAUSED'};continue;}
            event('dom','document',finalUrl,'document',response.status(),`pagination_pending;control_index:${moreIndex};clicks:${paginationClicks}`);
            if (paginationClicks>=maxPaginationClicks) {
              outcome='pagination_click_limit';
              yield {ads:[],cursor:null,exhausted:false,outcome:'STALLED',stopReason:'Límite de paginación alcanzado'};
              if (this.options.persistentSession) {paginationClicks=0;stable=0;continue;}
              return;
            }
            const confirmedIndex=selectMoreButton(await paginationSnapshot());
            if(this.paused) {yield {ads:[],cursor:null,exhausted:false,outcome:'USER_PAUSED'};continue;}
            if(confirmedIndex===null) {
              outcome='pagination_control_disappeared';
              yield {ads:[],cursor:null,exhausted:false,outcome:'STALLED',stopReason:'El control Ver más desapareció o dejó de ser único antes del clic'};
              return;
            }
            const started=performance.now();
            try { await page.locator('button, [role="button"]').nth(confirmedIndex).click({timeout:10000}); }
            catch(e) {
              const kind=errorKind(e);
              event('dom','document',finalUrl,'document',response.status(),`pagination_click_${kind}`);
              if(kind!=='timeout') throw e;
              // A re-render can detach the control while a valid pagination
              // response is still in flight. Observe progress before pausing.
              paginationWaiting=true;
              continue;
            }
            paginationClicks++;
            paginationWaiting=true;
            event('dom','document',finalUrl,'document',response.status(),`pagination_control_clicked;control_index:${confirmedIndex}`);
            event('dom','document',finalUrl,'document',response.status(),`pagination_clicked;load_ms:${Math.round(performance.now()-started)}`);
            continue;
          }
        }
        if (stable >= 4) {
          if (!adsDetected) event('dom','document',finalUrl,'document',response.status(),'dom_no_results');
          const activity=await waitForPageActivity(true,this.options.stalledWaitMs ?? 60000);
          if(activity!=='timeout') {stable=0;continue;}
          outcome = 'scroll_no_progress';
          yield { ads:[], cursor:null, exhausted:false, outcome:'STALLED',stopReason:'Sin IDs nuevos ni paginación visible durante 60 segundos' };
          if (this.options.persistentSession) {stable=0;continue;}
          return; // no proof of exhaustion
        }
        if(this.paused) {yield {ads:[],cursor:null,exhausted:false,outcome:'USER_PAUSED'};continue;}
        await page.mouse.wheel(0,1600);
        try { await page.waitForFunction((knownIds:string[]) => {
          const known=new Set(knownIds);
          return [...document.querySelectorAll('span')].some(el=>{
            const match=el.textContent?.trim().match(/^(?:Identificador de la biblioteca|Library ID):\s*(\d{5,30})$/i);
            return match && !known.has(match[1]!);
          });
        }, [...seen], {timeout:4000}); }
        catch(e) {const kind=errorKind(e);event('wait','document',finalUrl,'document',response.status(),`scroll_new_ids_${kind}`);if(kind!=='timeout') throw e;}
      }
      if (this.options.paginationDiagnostic) await sleep(this.options.diagnosticSettleMs ?? 2500);
      if (inflight.size) await Promise.race([Promise.allSettled([...inflight]),sleep(2500)]);
      const tail = pending.splice(0).filter((x): x is Record<string,unknown> => Boolean(x && typeof x === 'object'))
        .filter(x => { const id=String(x.id ?? ''); if (!id || seen.has(id)) return false; seen.add(id); return true; });
      adsDetected += tail.length;
      if (tail.length) outcome = 'ads_observed';
      if (tail.length) yield { ads:tail, cursor:null, exhausted:false };
      if (!adsDetected) event('dom','document',finalUrl,'document',response.status(),'dom_no_results');
      failIfGraphqlRestricted();
      if (this.options.paginationDiagnostic) { outcome='diagnostic_limit_reached'; return; }
      outcome = 'stalled';
      yield { ads:[], cursor:null, exhausted:false, outcome:'STALLED',stopReason:'Límite de desplazamientos alcanzado sin prueba de fin' };
    } catch (e) {
      if (errorKind(e)==='page_closed') {
        outcome='page_closed';
        const tail=pending.splice(0).filter((x):x is Record<string,unknown>=>Boolean(x&&typeof x==='object'))
          .filter(x=>{const id=String(x.id??'');if(!id||seen.has(id))return false;seen.add(id);return true;});
        if(tail.length) yield {ads:tail,cursor:null,exhausted:false};
        yield {ads:[],cursor:null,exhausted:false,outcome:'STALLED',stopReason:'La pestaña se cerró durante la carga; datos anteriores conservados'};
        return;
      }
      if(e instanceof AccessError && this.options.persistentSession) {
        outcome=`access_${e.status}`;
        this.restricted=true;this.pause();stopNetwork=true;
        // The user may resolve a verification in this still-open tab. We do
        // not start another request; an explicit r creates the next attempt.
        try {await page.unroute('**/*');} catch {/* page may already be closing */}
        yield {ads:[],cursor:null,exhausted:false,outcome:'ACCESS_ERROR',accessStatus:e.status,stopReason:redact(e.message)};
        return;
      }
      outcome = e instanceof AccessError ? `access_${e.status}` : `error_${errorKind(e)}`;
      throw e;
    } finally {
      this.currentPage=null;
      event('summary','document',url,'document',null,outcome);
      if (this.options.keepOpen && !isPageClosed() && !signal.aborted) {
        event('summary','document',url,'document',null,'browser_open_until_window_closed_or_ctrl_c');
        await new Promise<void>(resolve => {
          const done=()=>{signal.removeEventListener('abort',done);resolve();};
          page.once('close',done);
          signal.addEventListener('abort',done,{once:true});
          if (isPageClosed() || signal.aborted) done();
        });
      }
      try { await context.close(); } catch(e) { event('summary','document',url,'document',null,`context_close_${errorKind(e)}`); }
      if(browser) try { await browser.close(); } catch(e) { event('summary','document',url,'document',null,`browser_close_${errorKind(e)}`); }
    }
  }
}
