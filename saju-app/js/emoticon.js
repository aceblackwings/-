// 오늘의 행운 이모티콘: 12지신 캐릭터 스티커 (흰 테두리 + 굵은 캡션)
import { CATEGORIES } from './fortune.js';
import { characterInfo, characterMarkup, EMOTES } from './character.js';
import { emoImage } from './assets.js';

export { EMOTES };

// 오늘 총운 구간 → 기본 표정
const TIER_MOOD = ['fighting', 'calm', 'smile', 'excited'];

let uid = 0;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- 표정별 소품 · 등급별 장면 (240×240 좌표) ----------
// 표정마다 다른 소품이 붙고(모든 등급), 등급이 오를수록 배경색 → 장면 무늬 → 금메달 → 무지개 날개가 더해진다
export const MOOD_COLOR = { smile: '#39d27a', excited: '#ffc93c', fighting: '#ff4d4d', love: '#ff8fb3', wow: '#ffd166', thanks: '#ff9f43', calm: '#4fd1c5', sleepy: '#7b8cff' };
export const MOOD_PROP = { smile: '네잎클로버', excited: '꽃가루', fighting: '필승 머리띠', love: '하트', wow: '별 폭죽', thanks: '복주머니', calm: '찻잔', sleepy: '수면 모자' };
const INK = '#241b2f';

function glyph(mood, x, y, sc, color, op = 1) {
  const g = (inner) => `<g transform="translate(${x} ${y}) scale(${sc})" opacity="${op}">${inner}</g>`;
  switch (mood) {
    case 'love': return g(`<path d="M0 6 C-12 -2 -8 -12 0 -6 C8 -12 12 -2 0 6 z" fill="${color}"/>`);
    case 'smile': return g([0, 90, 180, 270].map((r) => `<path transform="rotate(${r})" d="M0 0 C-7 -5 -5 -12 0 -8 C5 -12 7 -5 0 0 z" fill="${color}"/>`).join(''));
    case 'fighting': return g(`<path d="M0 8 q-8 -6 -2 -16 q1 6 5 4 q4 6 -3 12 z" fill="${color}"/>`);
    case 'sleepy': return g(`<path d="M3 -7 a8 8 0 1 0 4 13 a6 6 0 1 1 -4 -13 z" fill="${color}"/>`);
    case 'calm': return g(`<path d="M-9 0 q4.5 -5 9 0 t9 0" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`);
    case 'thanks': return g([0, 72, 144, 216, 288].map((r) => `<ellipse transform="rotate(${r})" cy="-5" rx="3" ry="5" fill="${color}"/>`).join('') + '<circle r="2.5" fill="#fff"/>');
    case 'excited': return g(`<rect x="-3" y="-5" width="6" height="10" rx="1" fill="${color}" transform="rotate(25)"/>`);
    default: return g(`<path d="M0 -8 l2.4 5.6 l5.6 2.4 l-5.6 2.4 l-2.4 5.6 l-2.4 -5.6 l-5.6 -2.4 l5.6 -2.4 z" fill="${color}"/>`);
  }
}

/** 캐릭터 뒤쪽 소품 */
function moodBack(mood) {
  switch (mood) {
    case 'wow': return `<path d="${Array.from({ length: 32 }, (_, i) => { const r = i % 2 ? 62 : 104; const a = (i * 11.25 - 90) * Math.PI / 180; return `${i ? 'L' : 'M'}${(120 + Math.cos(a) * r).toFixed(1)} ${(112 + Math.sin(a) * r).toFixed(1)}`; }).join(' ')} Z" fill="#ffd166" opacity="0.45"/>`;
    case 'fighting': return `<g opacity="0.85">${[[34, 196, 1.6], [206, 196, 1.6], [22, 160, 1.1], [218, 160, 1.1]].map(([x, y, k]) => `<path transform="translate(${x} ${y}) scale(${k})" d="M0 14 q-14 -10 -4 -28 q2 10 8 6 q8 12 -4 22 z" fill="#ff7a3d"><animateTransform attributeName="transform" type="scale" additive="sum" values="1 1;1 1.12;1 1" dur="0.9s" repeatCount="indefinite"/></path>`).join('')}</g>`;
    case 'sleepy': return `<path d="M44 26 a16 16 0 1 0 12 26 a12 12 0 1 1 -12 -26 z" fill="#ffe08a"/>${[[190, 30], [214, 54], [26, 80]].map(([x, y]) => glyph('wow', x, y, 0.5, '#fff', 0.8)).join('')}`;
    case 'calm': return `<g fill="none" stroke="#4fd1c5" stroke-width="2" opacity="0.5"><ellipse cx="120" cy="200" rx="92" ry="12"/><ellipse cx="120" cy="200" rx="64" ry="7"/></g>`;
    default: return '';
  }
}

/** 캐릭터 앞쪽 소품 */
function moodFront(mood) {
  switch (mood) {
    case 'smile': return `<path d="M198 196 q-4 -16 2 -30" fill="none" stroke="#1d6b3e" stroke-width="3" stroke-linecap="round"/>${glyph('smile', 200, 160, 1.6, '#39d27a')}<circle cx="200" cy="160" r="2.5" fill="#1d6b3e"/>`;
    case 'excited': return `${['#ff4d6d', '#ffc93c', '#39ff88', '#00e5ff', '#c77dff'].flatMap((c, i) => [[22 + i * 9, 54 + (i % 3) * 14], [200 + (i % 2) * 14, 62 + i * 13], [36 + i * 34, 30 + (i % 2) * 8]].map(([x, y]) => glyph('excited', x, y, 1, c))).join('')}
      <path d="M204 92 l6 -16 M214 98 l12 -10" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
    case 'fighting': return `<path d="M68 84 q52 -18 104 0 l-1 13 q-51 -17 -102 0 z" fill="#e63946" stroke="#7a0f1a" stroke-width="2"/>
      <path d="M170 88 l18 -8 l-4 10 l10 6 l-18 2 z" fill="#e63946" stroke="#7a0f1a" stroke-width="2" stroke-linejoin="round"/>
      <text x="120" y="88" font-size="11" text-anchor="middle" dominant-baseline="central" fill="#fff" font-weight="900" font-family="'Song Myung', serif">必勝</text>`;
    case 'love': return `${glyph('love', 200, 156, 2.6, '#ff4d7d')}${glyph('love', 200, 156, 1.2, '#ffd0dc')}${[[36, 92, 1.1], [212, 70, 0.9], [26, 150, 0.8]].map(([x, y, k], i) => `<g>${glyph('love', x, y, k, '#ff8fb3')}<animateTransform attributeName="transform" type="translate" values="0 6;0 -6;0 6" dur="${1.8 + i * 0.4}s" repeatCount="indefinite"/></g>`).join('')}`;
    case 'wow': return `<text x="202" y="74" font-size="30" font-weight="900" text-anchor="middle" fill="#ffd166" stroke="${INK}" stroke-width="2" font-family="'Noto Sans KR', sans-serif">!?</text>${glyph('wow', 38, 70, 1.2, '#fff')}`;
    case 'thanks': return `<g transform="translate(200 168)"><path d="M-14 -2 q-6 22 14 22 q20 0 14 -22 q-7 -6 -14 -6 q-7 0 -14 6 z" fill="#e63946" stroke="#7a0f1a" stroke-width="2"/><path d="M-10 -6 q10 7 20 0" fill="none" stroke="#ffd166" stroke-width="3"/><text y="9" font-size="11" text-anchor="middle" dominant-baseline="central" fill="#ffd166" font-weight="900" font-family="'Song Myung', serif">福</text></g>${glyph('thanks', 38, 172, 1.6, '#ff9f43')}`;
    case 'calm': return `<g transform="translate(198 172)"><path d="M-14 -6 h28 v6 q0 14 -14 14 q-14 0 -14 -14 z" fill="#fff" stroke="${INK}" stroke-width="2.5"/><path d="M14 -2 q8 0 6 7 q-2 5 -8 3" fill="none" stroke="${INK}" stroke-width="2.5"/><path d="M-12 0 h24" stroke="#4fd1c5" stroke-width="3"/>
      ${[-6, 2].map((x, i) => `<path d="M${x} -12 q-4 -6 0 -12 q4 -6 0 -12" fill="none" stroke="#9aa3b2" stroke-width="2" stroke-linecap="round"><animate attributeName="opacity" values="0.2;0.9;0.2" dur="${2 + i * 0.6}s" repeatCount="indefinite"/></path>`).join('')}</g>`;
    case 'sleepy': return `<path d="M74 70 q46 -20 92 -4 q10 -30 34 -46 q-46 -4 -84 18 q-30 14 -42 32 z" fill="#5b6cff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M72 70 q48 -20 96 -2" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><circle cx="202" cy="20" r="8" fill="#fff" stroke="${INK}" stroke-width="2"/>
      <text x="206" y="108" font-size="18" font-weight="900" fill="#7b8cff" font-family="'Noto Sans KR', sans-serif">Zz</text>`;
    default: return '';
  }
}

/** 등급별 장면: 희귀=표정 색 배경, 영웅=장면 무늬, 전설=금메달, 신화=무지개 날개 */
function rarityScene(rar, mood, id) {
  const c = MOOD_COLOR[mood] || '#ffd166';
  const tier = { common: 0, rare: 1, epic: 2, legend: 3, myth: 4 }[rar] || 0;
  let back = ''; let front = '';
  if (tier >= 1) back += `<circle cx="120" cy="114" r="98" fill="${c}" opacity="0.22"/>`;
  if (tier >= 2) back += [[30, 40], [210, 36], [24, 116], [216, 120], [44, 186], [198, 196], [120, 24]].map(([x, y], i) => glyph(mood, x, y, 1.1 + (i % 3) * 0.3, c, 0.55)).join('');
  if (tier >= 4) {
    const wing = (sx) => `<g transform="translate(120 118) scale(${sx} 1)"><path d="M28 -6 q36 -52 84 -40 q-22 10 -24 24 q26 -14 36 4 q-24 -2 -30 14 q18 4 18 20 q-30 -18 -84 -2 z" fill="url(#${id}-holo)" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" opacity="0.92"/></g>`;
    back += `<g>${wing(1)}${wing(-1)}<animateTransform attributeName="transform" type="translate" values="0 2;0 -3;0 2" dur="2.4s" repeatCount="indefinite"/></g>`;
  }
  if (tier >= 3) {
    front += `<g transform="translate(120 192)"><path d="M-10 -22 l10 12 l10 -12" fill="none" stroke="${tier >= 4 ? `url(#${id}-holo)` : '#e63946'}" stroke-width="5" stroke-linejoin="round"/>
      <circle r="13" fill="${tier >= 4 ? `url(#${id}-holo)` : `url(#${id}-gold)`}" stroke="${INK}" stroke-width="2.5"/>
      <text y="1" font-size="12" text-anchor="middle" dominant-baseline="central" fill="${INK}" font-weight="900" font-family="'Song Myung', serif">${tier >= 4 ? '神' : '福'}</text></g>`;
  }
  return { back, front };
}

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
  // 표정 그림이 있으면 몸·표정·소품을 그림으로 (코드 소품은 생략), 등급 장면·메달·글자는 그대로 덧입힌다
  const emoImg = opts.noImage ? null : emoImage(info.zodiac.key, mood, info.element);

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

  const scene = rarityScene(rar, mood, id);
  const capSize = caption.length > 6 ? 22 : 26;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    ${defs}
    <linearGradient id="${id}-holo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4d6d"/><stop offset="0.25" stop-color="#ffc93c"/><stop offset="0.5" stop-color="#39ff88"/><stop offset="0.75" stop-color="#00e5ff"/><stop offset="1" stop-color="#c77dff"/></linearGradient>
    <linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset="0.45" stop-color="#d4a017"/><stop offset="0.7" stop-color="#fff6c8"/><stop offset="1" stop-color="#b8860b"/></linearGradient>
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
  ${scene.back}
  ${emoImg ? '' : moodBack(mood)}
  <g filter="url(#${id}-sticker)">
    ${emoImg ? `<image href="${emoImg}" x="14" y="2" width="212" height="212" preserveAspectRatio="xMidYMid meet"/>` : `<g transform="translate(14 -10) scale(0.66)">${body}</g>`}
  </g>
  ${emoImg ? '' : moodFront(mood)}
  ${scene.front}
  ${rarFront}
  ${tag ? `<g transform="translate(10 12)"><rect width="${Math.min(130, 22 + tag.length * 10)}" height="26" rx="13" fill="#ffd166" stroke="#241b2f" stroke-width="2.5"/><text x="${Math.min(130, 22 + tag.length * 10) / 2}" y="18" font-size="13" font-weight="800" text-anchor="middle" fill="#241b2f" font-family="'Noto Sans KR', sans-serif">${esc(tag)}</text></g>` : ''}
  <text x="120" y="226" font-size="${capSize}" font-weight="900" text-anchor="middle" fill="#241b2f" stroke="#241b2f" stroke-width="9" stroke-linejoin="round" font-family="'Noto Sans KR', sans-serif">${esc(caption)}</text>
  <text x="120" y="226" font-size="${capSize}" font-weight="900" text-anchor="middle" fill="#ffffff" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" font-family="'Noto Sans KR', sans-serif">${esc(caption)}</text>
  <text x="120" y="226" font-size="${capSize}" font-weight="900" text-anchor="middle" fill="${neon ? '#ff4d8d' : '#ff4d8d'}" font-family="'Noto Sans KR', sans-serif">${esc(caption)}</text>
</svg>`;
}
