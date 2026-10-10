import type { Ad, Method } from './types.js';
import { safeHttpUrl } from './security.js';

function string(v: unknown): string | null { return typeof v === 'string' && v.trim() ? v.trim() : null; }
function date(v: unknown): string | null {
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
    const timestamp = v < 100_000_000_000 ? v * 1000 : v;
    const parsed = new Date(timestamp);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  return string(v);
}
function id(v: unknown): string | null {
  if (typeof v === 'number' && !Number.isSafeInteger(v)) return null;
  return (typeof v === 'string' || typeof v === 'number') && /^\d{1,30}$/.test(String(v)) ? String(v) : null;
}

export function normalize(raw: unknown, method: Method, country: string | null): Ad {
  const r = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const adId = id(r.id ?? r.ad_id ?? r.adArchiveID ?? r.archive_id);
  const rawPageId = r.page_id ?? r.pageId;
  const metaPageId = r.page_id_source === 'numeric_facebook_link' ? null : id(rawPageId);
  const pageIdSource = metaPageId ? 'structured_json' : null;
  const pageId = metaPageId ?? (adId ? `provisional:ad:${adId}` : null);
  const advertiserName = string(r.page_name ?? r.pageName ?? r.advertiser_name) ?? '';
  const bodies = r.ad_creative_bodies;
  const description = string(r.description ?? r.body ?? (Array.isArray(bodies) ? bodies[0] : null));
  const ctaUrl = safeHttpUrl(r.cta_url ?? r.link_url ?? r.landing_page_url);
  const libraryUrl = adId ? `https://www.facebook.com/ads/library/?id=${encodeURIComponent(adId)}` : '';
  const rawPlatforms = r.publisher_platforms ?? r.publisher_platform;
  const platforms = Array.isArray(rawPlatforms) ? rawPlatforms.filter((v): v is string => typeof v === 'string') : string(rawPlatforms) ? [string(rawPlatforms)!] : null;
  const missing = [!adId && 'ad_id', !metaPageId && 'page_id_unavailable', !advertiserName && 'advertiser_name', !description && 'description'].filter(Boolean).join(',');
  const quality = !adId ? 'invalid' : missing ? 'partial' : 'valid';
  const qualityReason = missing || null;
  return { adId: adId ?? '', pageId, metaPageId, pageIdSource, advertiserName, description, ctaUrl, libraryUrl, country, platforms,
    adStartDate: date(r.ad_delivery_start_time ?? r.ad_start_date), adStatus: string(r.ad_active_status ?? r.ad_status),
    ctaText: string(r.cta_text), method, quality, qualityReason };
}
