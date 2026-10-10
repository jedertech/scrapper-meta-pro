const ALLOWED = new Set(['www.facebook.com', 'facebook.com']);
const SENSITIVE = /(?:access_token|token|cookie|password|secret|key)/i;

export function validateSearchUrl(input: string): string {
  let u: URL;
  try { u = new URL(input); } catch { throw new Error('URL inválida'); }
  if (u.protocol !== 'https:' || !ALLOWED.has(u.hostname.toLowerCase()) || u.port || u.username || u.password || u.pathname !== '/ads/library/') {
    throw new Error('Solo se acepta HTTPS de facebook.com/ads/library/');
  }
  for (const k of u.searchParams.keys()) if (SENSITIVE.test(k)) throw new Error('La URL contiene parámetros sensibles');
  u.hash = '';
  u.searchParams.sort();
  return u.toString();
}

export function validateRedirect(input: string): void {
  const u = new URL(input);
  if (u.protocol !== 'https:' || !ALLOWED.has(u.hostname.toLowerCase())) throw new Error('Redirección fuera de Meta');
}

export function safeName(name: string): string {
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(name)) throw new Error('Nombre inválido: use minúsculas, números, _ o -');
  return name;
}

export function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const u = new URL(value);
    if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password) return null;
    return u.toString();
  } catch { return null; }
}

export function redact(message: unknown): string {
  return String(message).replace(/((?:access_token|token|cookie|password|secret|key)\s*[=:]\s*)[^\s&]+/gi, '$1[REDACTED]');
}
