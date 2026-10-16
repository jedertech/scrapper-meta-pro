import type { Page } from 'playwright';
import { parseVisibleCard, type VisibleCard } from './visible-card.js';

// Shared label pattern. Meta renders the library id in Spanish
// ("Identificador de la biblioteca: 1234567") or English ("Library ID: 1234567").
// Every DOM pass (live extraction, pagination snapshot, prune, inspection) uses
// this single source, so a non-Spanish UI is never silently skipped. It is a
// string because page.evaluate serializes its callback: outer module variables
// do not exist inside the browser. Functions receive it as an explicit argument.
export const LABEL_PATTERN = '^(?:Identificador de la biblioteca|Library ID):\\s*(\\d{5,30})$';

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

// Frees the heavy payload (images, iframes, text, links) of already-persisted
// ad cards and leaves a height-preserving skeleton in place. Replacing the node
// outright was the root cause of two regressions:
//   1. paginationSnapshot() anchors lastBottom on the bottom of the last result
//      label; deleting every visible card collapsed the anchor to y=0, so
//      advertiser-card "Ver más" buttons passed the belowResults filter and the
//      scraper clicked external links.
//   2. With the anchor gone the loop clicked forever (Phase 2.5 audit).
// The skeleton keeps the anchor alive (the snapshot also measures
// [data-msr-pruned] nodes) while the heavy content is released now.
export async function pruneVisibleCards(page: Pick<Page, 'evaluate'>, ids: string[]): Promise<PruneResult> {
  if (!ids.length) return { removed: 0, failed: [] };
  return await page.evaluate(([pattern, targetIds]: [string, string[]]) => {
    const labelRegex = new RegExp(pattern, 'i');
    const removed: string[] = [];
    const failed: string[] = [];
    const known = new Set(targetIds);
    // `span:not([data-msr-pruned] *)` excludes any span that sits inside a
    // pruned skeleton. The while loop below walks up to the card container;
    // without this the label can be read out of a skeleton whose real card
    // was already replaced, the walk escapes through the parent, and the
    // same ad is extracted again as a duplicate.
    const spans = [...document.querySelectorAll('span:not([data-msr-pruned] *)')].filter(e =>
      labelRegex.test(e.textContent?.trim() ?? ''));
    for (const label of spans) {
      const id = label.textContent?.match(labelRegex)?.[1];
      if (!id || !known.has(id)) continue;
      let card: Element | null = label;
      // ── Fase 1: ID-boundary ────────────────────────────────────────────────
      // Sube mientras el padre tenga ≤ 1 ID único (tolera spans duplicados del
      // mismo ID que Meta inyecta en anuncios Lead Gen/Ebooks). Se detiene
      // cuando el padre ya contiene 2 o más anuncios distintos. Nunca toca body.
      while (card && card.parentElement && card.parentElement !== document.body) {
        const ids = new Set<string>();
        for (const el of card.parentElement.querySelectorAll('span')) {
          const m = el.textContent?.match(labelRegex);
          if (m) ids.add(m[1]!);
        }
        if (ids.size > 1) break;
        card = card.parentElement;
      }
      if (!card) { failed.push(id); continue; }
      // ── Fase 2: Ascenso estructural puro ──────────────────────────────────
      // Sin depender de img/video/a: sube mientras el padre tiene exactamente
      // 1 hijo de tipo elemento (Element). Esto garantiza capturar la tarjeta
      // visual completa aunque los assets gráficos no hayan cargado (scroll
      // masivo con lazy-loading throttling). Se detiene al llegar a un nodo
      // que es sibling real de otras tarjetas (padre con >1 hijo elemento).
      // Nunca asciende al body ni a elementos con role="main"/"feed".
      while (
        card &&
        card.parentElement &&
        card.parentElement !== document.body &&
        !/^(main|feed)$/i.test(card.parentElement.getAttribute('role') ?? '')
      ) {
        const parentEl: HTMLElement = card.parentElement;
        let elementChildCount = 0;
        for (const child of parentEl.children) {
          if (child.nodeType === 1) elementChildCount++;
        }
        if (elementChildCount !== 1) break;
        const parentIds = new Set<string>();
        for (const el of parentEl.querySelectorAll('span')) {
          const m = el.textContent?.match(labelRegex);
          if (m) parentIds.add(m[1]!);
        }
        if (parentIds.size > 1) break;
        card = parentEl;
      }
      if (!card) { failed.push(id); continue; }
      try {

        const rect = (card as HTMLElement).getBoundingClientRect();
        const skeleton = document.createElement('div');
        skeleton.setAttribute('data-msr-pruned', id);
        skeleton.style.display = 'block';
        skeleton.style.background = 'transparent';
        skeleton.style.width = '100%';
        skeleton.style.height = `${Math.max(1, Math.round(rect.height))}px`;
        skeleton.style.minHeight = `${Math.max(1, Math.round(rect.height))}px`;
        skeleton.style.overflow = 'hidden';
        card.replaceWith(skeleton);
        removed.push(id);
      } catch { failed.push(id); }
    }
    return { removed: removed.length, failed };
  }, [LABEL_PATTERN, ids] as [string, string[]]);
}

// Reads the current DOM only. It never calls goto, reload, scroll or fetch.
export async function inspectLoadedPage(page: Pick<Page, 'evaluate'>): Promise<LoadedPageInspection> {
  const snapshot = await page.evaluate((pattern: string) => {
    const labelRegex = new RegExp(pattern, 'i');
    const text = document.body?.innerText ?? '';
    const labels = [...document.querySelectorAll('span:not([data-msr-pruned] *)')].filter(element =>
      labelRegex.test(element.textContent?.trim() ?? ''));
    const cards: VisibleCard[] = [];
    for (const label of labels) {
      const id = label.textContent?.match(labelRegex)?.[1];
      if (!id) continue;
      let card: Element | null = label;
      // ── Fase 1: ID-boundary ──────────────────────────────────────────────
      // Sube mientras el padre tenga ≤ 1 ID único. Tolera spans duplicados
      // del mismo ID (patrón Lead Gen/Ebooks de Meta). Nunca toca body.
      while (card && card.parentElement && card.parentElement !== document.body) {
        const ids = new Set<string>();
        for (const el of card.parentElement.querySelectorAll('span')) {
          const m = el.textContent?.match(labelRegex);
          if (m) ids.add(m[1]!);
        }
        if (ids.size > 1) break;
        card = card.parentElement;
      }
      if (!card) continue;
      if (card.closest('[data-msr-pruned]')) continue;
      // ── Fase 2: Ascenso estructural puro ────────────────────────────────
      // Sin depender de img/video/a: sube mientras el padre tiene exactamente
      // 1 hijo elemento. Captura la tarjeta visual completa aunque los assets
      // gráficos no hayan cargado. Nunca sube a role="main"/"feed".
      while (
        card &&
        card.parentElement &&
        card.parentElement !== document.body &&
        !/^(main|feed)$/i.test(card.parentElement.getAttribute('role') ?? '')
      ) {
        const parentEl: HTMLElement = card.parentElement;
        let elementChildCount = 0;
        for (const child of parentEl.children) {
          if (child.nodeType === 1) elementChildCount++;
        }
        if (elementChildCount !== 1) break;
        const parentIds = new Set<string>();
        for (const el of parentEl.querySelectorAll('span')) {
          const m = el.textContent?.match(labelRegex);
          if (m) parentIds.add(m[1]!);
        }
        if (parentIds.size > 1) break;
        card = parentEl;
      }
      if (!card) continue;
      const ids = new Set<string>();
      for (const el of card.querySelectorAll('span')) {
        const m = el.textContent?.match(labelRegex);
        if (m) ids.add(m[1]!);
      }
      // Fase 4.1: uniqueIds.size !== 1 en lugar de ids.length !== 1.
      if (ids.size !== 1) continue;
      cards.push({
        id, text: (card as HTMLElement).innerText ?? '',
        description: card.querySelector('div[style*="white-space: pre-wrap"]')?.textContent?.trim() ?? null,
        links: [...card.querySelectorAll('a[href]')].map(a => ({ text: (a as HTMLElement).innerText ?? '', href: (a as HTMLAnchorElement).href }))
      });
    }
    return {
      url: location.href, title: document.title, cards,
      accessCheckVisible: /captcha|security check|verifica tu identidad|verify your identity|temporarily blocked/i.test(text.slice(0, 5000))
    };
  }, LABEL_PATTERN);
  const uniqueIds = [...new Set(snapshot.cards.map(card => card.id))];
  const seen = new Set<string>();
  const ads = snapshot.cards.map(parseVisibleCard).filter((ad): ad is Record<string, unknown> => {
    if (!ad) return false;
    const id = String(ad.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  return {
    url: snapshot.url, title: snapshot.title, visibleCards: snapshot.cards.length, uniqueIds, ads,
    accessCheckVisible: snapshot.accessCheckVisible
  };
}