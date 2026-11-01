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
  const { defs, body } = characterMarkup(info, { mood, charms: opts.charms, aura: false });

  const bg = neon ? `
    <rect width="240" height="240" rx="40" fill="#120c2a"/>
    <circle cx="120" cy="118" r="104" fill="url(#${id}-bg)"/>
    <path d="M30 40 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z M206 52 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z M214 168 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z" fill="#ffd166" opacity="0.9"/>` : '';

  const capSize = caption.length > 6 ? 22 : 26;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    ${defs}
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
  <g filter="url(#${id}-sticker)">
    <g transform="translate(14 -10) scale(0.66)">${body}</g>
  </g>
  ${tag ? `<g transform="translate(10 12)"><rect width="${Math.min(130, 22 + tag.length * 10)}" height="26" rx="13" fill="#ffd166" stroke="#241b2f" stroke-width="2.5"/><text x="${Math.min(130, 22 + tag.length * 10) / 2}" y="18" font-size="13" font-weight="800" text-anchor="middle" fill="#241b2f" font-family="'Noto Sans KR', sans-serif">${esc(tag)}</text></g>` : ''}
  <text x="120" y="226" font-size="${capSize}" font-weight="900" text-anchor="middle" fill="#241b2f" stroke="#241b2f" stroke-width="9" stroke-linejoin="round" font-family="'Noto Sans KR', sans-serif">${esc(caption)}</text>
  <text x="120" y="226" font-size="${capSize}" font-weight="900" text-anchor="middle" fill="#ffffff" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" font-family="'Noto Sans KR', sans-serif">${esc(caption)}</text>
  <text x="120" y="226" font-size="${capSize}" font-weight="900" text-anchor="middle" fill="${neon ? '#ff4d8d' : '#ff4d8d'}" font-family="'Noto Sans KR', sans-serif">${esc(caption)}</text>
</svg>`;
}
