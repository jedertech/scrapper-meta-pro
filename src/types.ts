export type Mode = 'ads' | 'advertisers';
export type Method = 'playwright';
export type Status = 'RUNNING' | 'COMPLETED' | 'PARTIAL' | 'STALLED' | 'EXHAUSTED' | 'ACCESS_DENIED' | 'RATE_LIMITED' | 'INTERRUPTED' | 'FAILED' | 'GRAPHQL_ERROR' | 'USER_PAUSED' | 'USER_STOPPED';
export type Quality = 'valid' | 'partial' | 'invalid';

export interface Ad {
  adId: string;
  pageId: string | null; // internal advertiser identity; provisional:ad:<ID> is not a Meta page ID
  metaPageId: string | null;
  pageIdSource: 'structured_json' | 'numeric_facebook_link' | null;
  advertiserName: string;
  description: string | null;
  ctaUrl: string | null;
  libraryUrl: string;
  country: string | null;
  platforms: string[] | null;
  adStartDate: string | null;
  adStatus: string | null;
  ctaText: string | null;
  method: Method;
  quality: Quality;
  qualityReason: string | null;
}

export interface ExtractBatch {
  ads: unknown[];
  cursor: string | null;
  exhausted: boolean;
  outcome?: 'STALLED' | 'GRAPHQL_ERROR' | 'USER_PAUSED' | 'ACCESS_ERROR';
  accessStatus?: number;
  stopReason?: string;
}

export interface Extractor {
  method: Method;
  iterate(url: string, cursor: string | null, signal: AbortSignal): AsyncGenerator<ExtractBatch>;
}

export class AccessError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
