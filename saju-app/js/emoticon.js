// 오늘의 행운 이모티콘: 12지신 캐릭터 스티커 (흰 테두리 + 굵은 캡션)
import { CATEGORIES } from './fortune.js';
import { characterInfo, characterMarkup, EMOTES } from './character.js';

export { EMOTES };

// 오늘 총운 구간 → 기본 표정
const TIER_MOOD = ['fighting', 'calm', 'smile', 'excited'];

let uid = 0;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function todayEmote(fortune) {
  return TIER_MOOD[fortune.tier];
}

/**
 * @param saju, fortune
 * @param opts {profile, mood?, caption?, style: 'neon'|'sticker', charms?}
 */
export function renderEmoticonSVG(saju, fortune, opts = {}) {
  const id = `e${(uid++).toString(36)}`;
  const info = characterInfo(saju, opts.profile);
  const mood = opts.mood || todayEmote(fortune);
  const emote = EMOTES.find((e) => e.key === mood) || EMOTES[0];
  const best = CATEGORIES.find((c) => c.key === fortune.best);
  const bonus = Math.max(5, Math.round((fortune.scores[fortune.best] - 50) / 2));
  const caption = opts.caption || emote.caption;
  const tag = opts.tag ?? `${best.label}운 +${bonus}%`;
  const neon = (opts.style || 'neon') === 'neon';
  const { defs, body } = characterMarkup(info, { mood, charms: opts.charms, aura: false, stage: opts.stage });

  const rar = opts.rarity || 'common';
  const RC = { common: null, rare: '#4fc3ff', epic: '#c77dff', legend: '#ffd166', myth: '#ff4d8d' }[rar];
  const rays = (n, c, op) => Array.from({ length: n }, (_, i) => { const a = (i * 360 / n) * Math.PI / 180; const b = ((i + 0.5) * 360 / n) * Math.PI / 180; return `<path d="M120 118 L${120 + Math.cos(a) * 200} ${118 + Math.sin(a) * 200} L${120 + Math.cos(b) * 200} ${118 + Math.sin(b) * 200} Z" fill="${c}" opacity="${op}"/>`; }).join('');
  const rarBack = rar === 'legend' ? `<g>${rays(16, '#ffd166', 0.35)}<animateTransform attributeName="transform" type="rotate" from="0 120 118" to="360 120 118" dur="30s" repeatCount="indefinite"/></g>`
    : rar === 'myth' ? `<rect width="240" height="240" rx="40" fill="url(#${id}-holo)" opacity="0.45"/><g>${rays(20, '#ffffff', 0.18)}<animateTransform attributeName="transform" type="rotate" from="0 120 118" to="-360 120 118" dur="24s" repeatCount="indefinite"/></g>`
    : rar === 'epic' ? `<circle cx="120" cy="118" r="110" fill="#c77dff" opacity="0.25"/>` : '';
  const rarFront = !RC ? '' : `<rect x="4" y="4" width="232" height="232" rx="38" fill="none" stroke="${rar === 'myth' ? `url(#${id}-holo)` : RC}" stroke-width="${rar === 'rare' ? 4 : 6}" style="filter:drop-shadow(0 0 6px ${RC})"/>
    ${rar === 'legend' || rar === 'myth' ? `<g transform="translate(212 30)"><circle r="18" fill="#241b2f" stroke="${RC}" stroke-width="3"/><text y="1" font-size="13" text-anchor="middle" dominant-baseline="central" fill="${RC}" font-weight="900" font-family="'Song Myung', serif">${rar === 'myth' ? '神' : '傳'}</text></g>` : ''}
    ${rar !== 'rare' ? [[24, 120], [214, 150], [40, 196]].map(([x, y], i) => `<path d="M${x} ${y - 7} l2.5 5 l5 2 l-5 2 l-2.5 5 l-2.5 -5 l-5 -2 l5 -2 z" fill="${i % 2 ? '#fff' : RC}"><animate attributeName="opacity" values="0.2;1;0.2" dur="${1.6 + i * 0.4}s" repeatCount="indefinite"/></path>`).join('') : ''}`;
  const bg = neon ? `
    <rect width="240" height="240" rx="40" fill="#120c2a"/>
    <circle cx="120" cy="118" r="104" fill="url(#${id}-bg)"/>
    <path d="M30 40 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z M206 52 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z M214 168 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z" fill="#ffd166" opacity="0.9"/>` : '';

  const capSize = caption.length > 6 ? 22 : 26;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    ${defs}
    <linearGradient id="${id}-holo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4d6d"/><stop offset="0.25" stop-color="#ffc93c"/><stop offset="0.5" stop-color="#39ff88"/><stop offset="0.75" stop-color="#00e5ff"/><stop offset="1" stop-color="#c77dff"/></linearGradient>
    <radialGradient id="${id}-bg"><stop offset="0" stop-color="#7b5cff" stop-opacity="0.45"/><stop offset="1" stop-color="#7b5cff" stop-opacity="0"/></radialGradient>
    <filter id="${id}-sticker" x="-20%" y="-20%" width="140%" height="140%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="6" result="d"/>
      <feFlood flood-color="#ffffff"/><feComposite in2="d" operator="in" result="outline"/>
      <feGaussianBlur in="d" stdDeviation="4" result="sb"/><feOffset in="sb" dy="3" result="so"/>
      <feFlood flood-color="#000" flood-opacity="0.35"/><feComposite in2="so" operator="in" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  ${bg}
  ${rarBack}
  <g filter="url(#${id}-sticker)">
    <g transform="translate(14 -10) scale(0.66)">${body}</g>
  </g>
  ${rarFront}
  ${tag ? `<g transform="translate(10 12)"><rect width="${Math.min(130, 22 + tag.length * 10)}" height="26" rx="13" fill="#ffd166" stroke="#241b2f" stroke-width="2.5"/><text x="${Math.min(130, 22 + tag.length * 10) / 2}" y="18" font-size="13" font-weight="800" text-anchor="middle" fill="#241b2f" font-family="'Noto Sans KR', sans-serif">${esc(tag)}</text></g>` : ''}
  <text x="120" y="226" font-size="${capSize}" font-weight="900" text-anchor="middle" fill="#241b2f" stroke="#241b2f" stroke-width="9" stroke-linejoin="round" font-family="'Noto Sans KR', sans-serif">${esc(caption)}</text>
  <text x="120" y="226" font-size="${capSize}" font-weight="900" text-anchor="middle" fill="#ffffff" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" font-family="'Noto Sans KR', sans-serif">${esc(caption)}</text>
  <text x="120" y="226" font-size="${capSize}" font-weight="900" text-anchor="middle" fill="${neon ? '#ff4d8d' : '#ff4d8d'}" font-family="'Noto Sans KR', sans-serif">${esc(caption)}</text>
</svg>`;
}
