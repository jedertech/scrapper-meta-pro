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
