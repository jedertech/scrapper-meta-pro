export type DestinationKind = 'website' | 'whatsapp' | 'messenger' | 'instagram' | 'internal' | 'unknown';

export function classifyDestination(value: unknown): DestinationKind {
  if (typeof value !== 'string' || !value.trim()) return 'unknown';
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return 'unknown';
    const host = url.hostname.toLowerCase();
    if (host === 'wa.me' || host === 'api.whatsapp.com' || host === 'whatsapp.com' || host.endsWith('.whatsapp.com')) return 'whatsapp';
    if (host === 'm.me' || host === 'messenger.com' || host.endsWith('.messenger.com')) return 'messenger';
    if (host === 'instagram.com' || host.endsWith('.instagram.com')) return 'instagram';
    if (host === 'facebook.com' || host.endsWith('.facebook.com') || host === 'fb.me') return 'internal';
    return 'website'; // Tracking links retain their observed URL; the final landing is unknown.
  } catch { return 'unknown'; }
}
