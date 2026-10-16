import { chromium } from 'playwright';

const URL = 'https://www.facebook.com/ads/library/?active_source=page_tab&ad_type=all&search_type=page&ids=11529814247';

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
});
const page = context.pages()[0] ?? await context.newPage();

const responses = [];
page.on('response', async (r) => {
  const url = r.url();
  if (/facebook\.com\/api\/graphql/i.test(url) || /ads\/library/i.test(url)) {
    try {
      const body = await r.text();
      responses.push({ url: url.slice(0, 120), status: r.status(), len: body.length, hasEdges: /"edges"\s*:/.test(body), hasAdArchive: /ad_archive_id|archive_id/.test(body) });
    } catch {}
  }
});

const res = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
console.log('NAV status:', res?.status(), 'url:', page.url().slice(0, 100));
await page.waitForTimeout(5000);

const probe = await page.evaluate(() => {
  const labelRegex = /^(?:Identificador de la biblioteca|Library ID):\s*(\d{5,30})$/i;
  const spans = [...document.querySelectorAll('span')].filter(e => labelRegex.test(e.textContent?.trim() ?? ''));
  const out = [];
  for (const label of spans.slice(0, 10)) {
    const id = label.textContent?.trim().match(labelRegex)?.[1];
    let card = label;
    let depth = 0;
    const trace = [];
    while (card && card.parentElement && card.parentElement !== document.body && depth < 12) {
      const ids = new Set();
      for (const el of card.parentElement.querySelectorAll('span')) {
        const m = el.textContent?.trim().match(labelRegex);
        if (m) ids.add(m[1]);
      }
      trace.push({ tag: card.parentElement.tagName, ids: [...ids], spanCount: card.parentElement.querySelectorAll('span').length, hasFbLink: !!card.parentElement.querySelector('a[href*="facebook.com/"]'), hasImg: !!card.parentElement.querySelector('img'), depth });
      if (ids.size > 1) break;
      card = card.parentElement;
      depth++;
    }
    out.push({ id, trace, finalTag: card?.tagName, finalIdCount: [...new Set([...card?.querySelectorAll('span') ?? []].map(e => e.textContent?.trim().match(labelRegex)?.[1]).filter(Boolean))].length });
  }
  const embedded = [...document.querySelectorAll('script[type="application/json"]')].map(s => ({ len: (s.textContent ?? '').length, hasSearch: (s.textContent ?? '').includes('search_results_connection') }));
  return { totalLabels: spans.length, sample: out, embeddedScripts: embedded.filter(e => e.hasSearch).length, bodyText: (document.body?.innerText ?? '').slice(0, 600) };
});

console.log(JSON.stringify(probe, null, 2));
console.log('RESPONSES:', JSON.stringify(responses.slice(0, 10), null, 2));
await browser.close();