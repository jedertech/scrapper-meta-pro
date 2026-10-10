import type { BrowserContextOptions } from 'playwright';

// Language and viewport are ordinary browser preferences. Keep Playwright's
// native User-Agent, automation properties, service workers and launch flags.
export const browserContextOptions: BrowserContextOptions = {
  locale: 'es-ES',
  viewport: { width: 1920, height: 1080 },
};
