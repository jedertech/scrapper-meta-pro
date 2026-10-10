import type { Status } from './types.js';

export type DiagnosticPhase = 'navigation' | 'response' | 'wait' | 'json' | 'dom' | 'summary';
export type DiagnosticKind = 'document' | 'graphql' | 'secondary' | 'unknown';

export interface DiagnosticEvent {
  phase: DiagnosticPhase;
  kind: DiagnosticKind;
  url: string;
  resourceType: string;
  status: number | null;
  finalNavigation: boolean;
  adsDetected: number;
  pendingRequests?: number;
  durationMs?: number;
  jobId?: string;
  detail?: string;
}

// Keep only known public Meta paths. Query strings, fragments, dynamic path
// segments, credentials and URLs from third-party landing pages never enter logs.
export function safeDiagnosticUrl(input: string): string {
  try {
    const url = new URL(input);
    if (!['https:','http:'].includes(url.protocol)) return '[invalid-url]';
    if (!['facebook.com','www.facebook.com'].includes(url.hostname.toLowerCase())) return '[external-resource]';
    const path = url.pathname === '/ads/library/' ? '/ads/library/' :
      /^\/api\/graphql\/?$/.test(url.pathname) ? '/api/graphql/' : '/[secondary-resource]';
    return `${url.origin}${path}`;
  } catch { return '[invalid-url]'; }
}

export function errorKind(error: unknown): 'timeout' | 'page_closed' | 'other' {
  const e = error as { name?: string; message?: string } | null;
  const name = e?.name ?? '';
  const message = e?.message ?? '';
  if (/timeout/i.test(name) || /timeout|timed out/i.test(message)) return 'timeout';
  if (/targetclosed|page.*closed|context.*closed|browser.*closed/i.test(`${name} ${message}`)) return 'page_closed';
  return 'other';
}

export function exitCodeForStatus(status: Status): number {
  return ['ACCESS_DENIED','RATE_LIMITED','FAILED','GRAPHQL_ERROR'].includes(status) ? 1 : status==='STALLED' ? 2 : 0;
}
