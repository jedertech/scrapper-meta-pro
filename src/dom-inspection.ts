import type { Page } from 'playwright';
import { parseVisibleCard, type VisibleCard } from './visible-card.js';

export interface LoadedPageInspection {
  url: string;
  title: string;
  visibleCards: number;
  uniqueIds: string[];
  ads: Record<string, unknown>[];
  accessCheckVisible: boolean;
}

export interface PruneResult {
  removed: number;
  failed: string[];
}

// Removes already-extracted ad card nodes from the live DOM so the browser
// does not retain thousands of heavy nodes (images, text, links) that cause
// OOM during long scrapes. Scroll and pagination selectors are unaffected:
// querySelectorAll returns a static snapshot, and removed labels no longer
// match the card regex, so paginationSnapshot keeps computing the correct
// bottom of the still-visible results.
export async function pruneVisibleCards(page: Pick<Page, 'evaluate'>, ids: string[]): Promise<PruneResult> {
  if (!ids.length) return { removed: 0, failed: [] };
  const result = await page.evaluate((targetIds: string[]) => {
    const removed: string[] = [];
    const failed: string[] = [];
    const known = new Set(targetIds);
    const spans = [...document.querySelectorAll('span')].filter(e =>
      /^Identificador de la biblioteca:\s*\d{5,30}$/.test(e.textContent?.trim() ?? ''));
    for (const label of spans) {
      const id = label.textContent!.match(/\d{5,30}/)![0]!;
      if (!known.has(id)) continue;
      let card: Element | null = label;
      while (card && (!card.querySelector('a[href*="facebook.com/"]') || card.querySelectorAll('span').length < 2))
        card = card.parentElement;
      if (!card) { failed.push(id); continue; }
      try { card.remove(); removed.push(id); } catch { failed.push(id); }
    }
    return { removed: removed.length, failed };
  }, ids);
  return result;
}

// Reads the current DOM only. It never calls goto, reload, scroll or fetch.
export async function inspectLoadedPage(page: Pick<Page, 'evaluate'>): Promise<LoadedPageInspection> {
  const snapshot = await page.evaluate(() => {
    const text = document.body?.innerText ?? '';
    const labels = [...document.querySelectorAll('span')].filter(element =>
      /^(?:Identificador de la biblioteca|Library ID):\s*\d{5,30}$/i.test(element.textContent?.trim() ?? ''));
    const cards: VisibleCard[] = [];
    for (const label of labels) {
      const id = label.textContent?.match(/\d{5,30}/)?.[0];
      if (!id) continue;
      let card: Element | null = label;
      while (card && (!card.querySelector('a[href*="facebook.com/"]') || card.querySelectorAll('span').length < 2))
        card = card.parentElement;
      if (!card) continue;
      const ids = [...card.querySelectorAll('span')].filter(element =>
        /^(?:Identificador de la biblioteca|Library ID):\s*\d{5,30}$/i.test(element.textContent?.trim() ?? ''));
      if (ids.length !== 1) continue;
      cards.push({id,text:(card as HTMLElement).innerText ?? '',
        description:card.querySelector('div[style*="white-space: pre-wrap"]')?.textContent?.trim() ?? null,
        links:[...card.querySelectorAll('a[href]')].map(a=>({text:(a as HTMLElement).innerText ?? '',href:(a as HTMLAnchorElement).href}))});
    }
    return {url:location.href,title:document.title,cards,
      accessCheckVisible:/captcha|security check|verifica tu identidad|verify your identity|temporarily blocked/i.test(text.slice(0,5000))};
  });
  const uniqueIds = [...new Set(snapshot.cards.map(card => card.id))];
  const seen = new Set<string>();
  const ads = snapshot.cards.map(parseVisibleCard).filter((ad): ad is Record<string,unknown> => {
    if (!ad) return false;
    const id = String(ad.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  return {url:snapshot.url,title:snapshot.title,visibleCards:snapshot.cards.length,uniqueIds,ads,
    accessCheckVisible:snapshot.accessCheckVisible};
}
