import { safeHttpUrl } from './security.js';

export interface VisibleCard {
  id: string;
  text: string;
  description: string | null;
  links: Array<{ text: string; href: string }>;
}

export function parseVisibleCard(card: VisibleCard): Record<string, unknown> | null {
  if (!/^\d{5,30}$/.test(card.id)) return null;
  const page = card.links.find(link => {
    try { const u = new URL(link.href); return ['www.facebook.com','facebook.com'].includes(u.hostname) && u.pathname !== '/ads/library/'; }
    catch { return false; }
  });
  const outbound = card.links.find(link => link !== page && !/facebook\.com\/ads\/library\//.test(link.href));
  let ctaUrl: string | null = null;
  if (outbound) {
    try {
      const u = new URL(outbound.href);
      ctaUrl = u.hostname === 'l.facebook.com' ? safeHttpUrl(u.searchParams.get('u')) : safeHttpUrl(u.href);
    } catch { /* malformed link */ }
  }
  const description = card.description?.trim() || null;
  const start = card.text.match(/En circulación desde el ([^\n]+)/i)?.[1]?.trim() ?? null;
  return { id: card.id, page_id: null, page_id_source:null,
    page_name: page?.text.trim() ?? '', description,
    cta_url: ctaUrl, cta_text: outbound?.text.trim().split('\n').at(-1) ?? null,
    ad_delivery_start_time: start, ad_active_status: /\bActivo\b/.test(card.text) ? 'active' : null };
}
