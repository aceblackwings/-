import { inApp } from './site.js';

export const HIT_EVENTS = ['land', 'saju', 'summon'];
const KEY = 'unmyeong2099.hit';

export function cleanHitLabel(value) {
  if (typeof value !== 'string') return '';
  const label = value.replace(/[^a-zA-Z0-9_-]/g, '');
  // Check before truncation and ignore separators used in dates.
  if (/\d{8}/.test(label.replace(/[-_]/g, ''))) return '';
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value.trim()) || /[@:]/.test(value)) return '';
  return label.slice(0, 40);
}

export function readSource(location, referrer = '') {
  const params = new URLSearchParams(location.search);
  const source = cleanHitLabel(params.get('utm_source'));
  let src = source;
  if (!src) {
    src = referrer ? 'other' : 'direct';
    try {
      const host = new URL(referrer).hostname;
      if (host === 'tistory.com' || host.endsWith('.tistory.com')) src = 'tistory';
    } catch { /* A missing or invalid referrer has no host. */ }
  }
  const campaign = cleanHitLabel(params.get('utm_campaign'));
  const post = src === 'tistory' ? cleanHitLabel(params.get('utm_content')) : '';
  return { src, c: post || campaign };
}

export function shouldHit(event, location, native, sent) {
  return HIT_EVENTS.includes(event) && !native
    && !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
    && new URLSearchParams(location.search).get('gallery') !== '1'
    && !sent.includes(event);
}

export function hit(event) {
  try {
    const { location, localStorage, sessionStorage } = window;
    const sent = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!shouldHit(event, location, inApp(), sent)) return;

    const query = new URLSearchParams(location.search);
    const saved = sessionStorage.getItem(KEY);
    const source = query.has('utm_source') || query.has('utm_campaign') || query.has('utm_content') || !saved
      ? readSource(location, document.referrer)
      : JSON.parse(saved);
    sessionStorage.setItem(KEY, JSON.stringify(source));
    if (navigator.sendBeacon('/api/hit', JSON.stringify({ e: event, src: source.src, c: source.c }))) {
      localStorage.setItem(KEY, JSON.stringify([...sent, event]));
    }
  } catch { /* Analytics must not interrupt the app. */ }
}
