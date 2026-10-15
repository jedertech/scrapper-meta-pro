import type { BrowserContextOptions, LaunchOptions } from 'playwright';

// Language and viewport are ordinary browser preferences. The exported context
// stays free of automation signals; the stealth layer is applied at launch
// time through dedicated helpers exported below.
export const browserContextOptions: BrowserContextOptions = {
  locale: 'es-ES',
  viewport: { width: 1920, height: 1080 },
};

// Real Chrome 149 User-Agent (the Chromium bundled with Playwright 1.61 is
// Chrome for Testing 149). Headless Chromium otherwise sends
// "HeadlessChrome/<version>", which Meta flags immediately.
export const chromeUserAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

// Chromium launch flags only (they are rejected by Firefox/WebKit):
//  - AutomationControlled: removes the navigator.webdriver automation signal
//    and keeps the property overridable from the init script.
//  - Background timer / renderer throttling: Chromium otherwise freezes timers
//    and requestIdleCallback when the tab loses focus, stalling extraction in
//    background or occluded windows.
export const stealthLaunchArgs: string[] = [
  '--disable-blink-features=AutomationControlled',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-features=CalculateNativeWinOcclusion',
];

// Applied with context.addInitScript() before any navigation. Removes the
// remaining bot signals and forces the document to report itself visible, so
// Meta never sees the tab as backgrounded.
export const stealthInitScript = `(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined, configurable: true });
  Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
  Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
  if (!window.chrome || typeof window.chrome !== 'object') window.chrome = { runtime: {} };
  if (!navigator.plugins || !navigator.plugins.length) {
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5], configurable: true });
  }
  if (!navigator.languages || !navigator.languages.length) {
    Object.defineProperty(navigator, 'languages', { get: () => ['es-ES', 'es'], configurable: true });
  }
})();`;

// Context options with the real User-Agent. Playwright has no addInitScript
// context option: the init script must be registered with
// `await context.addInitScript(stealthInitScript)` right after the context is
// created and before the first navigation.
export function stealthContextOptions(): BrowserContextOptions {
  return { ...browserContextOptions, userAgent: chromeUserAgent };
}

// Launch options merged with the stealth flags (Chromium only).
export function stealthLaunchOptions<T extends LaunchOptions>(options: T, browserName: 'chromium' | 'firefox' | 'webkit'): T {
  if (browserName !== 'chromium') return options;
  return { ...options, args: [...(options.args ?? []), ...stealthLaunchArgs] };
}