// 매일 수집하는 스티커: 친구에게 보내는 대화용 문구 + 오행 색
import { seededRandom } from './saju.js';

export const STICKERS = [
  { key: 'hi', text: '굿모닝', icon: '☀️', element: 1, rarity: 'common' },
  { key: 'night', text: '잘 자', icon: '🌙', element: 4, rarity: 'common' },
  { key: 'thanks', text: '고마워', icon: '🙏', element: 2, rarity: 'common' },
  { key: 'fighting', text: '화이팅', icon: '🔥', element: 1, rarity: 'common' },
  { key: 'lol', text: 'ㅋㅋㅋ', icon: '😆', element: 0, rarity: 'common' },
  { key: 'cheer', text: '힘내', icon: '💪', element: 3, rarity: 'common' },
  { key: 'best', text: '최고', icon: '👍', element: 2, rarity: 'common' },
  { key: 'miss', text: '보고 싶어', icon: '🥺', element: 4, rarity: 'rare' },
  { key: 'love', text: '사랑해', icon: '💗', element: 1, rarity: 'rare' },
  { key: 'congrats', text: '축하해', icon: '🎉', element: 0, rarity: 'rare' },
  { key: 'pass', text: '합격 기원', icon: '📜', element: 3, rarity: 'rare' },
  { key: 'health', text: '건강해', icon: '🍑', element: 0, rarity: 'rare' },
  { key: 'luck', text: '대박 나', icon: '🍀', element: 0, rarity: 'epic' },
  { key: 'rich', text: '부자 되세요', icon: '💰', element: 2, rarity: 'epic' },
  { key: 'bless', text: '복 받아', icon: '🧧', element: 1, rarity: 'epic' },
  { key: 'exorcise', text: '액운 퇴치', icon: '⚡', element: 4, rarity: 'legend' },
  { key: 'destiny', text: '천생연분', icon: '💞', element: 1, rarity: 'legend' },
  { key: 'divine', text: '신수 강림', icon: '🐉', element: 3, rarity: 'myth' },
];

const WEIGHT = { common: 58, rare: 27, epic: 11, legend: 3.5, myth: 0.5 };
const COLORS = ['#39FF88', '#FF2E63', '#FFC93C', '#E0E0FF', '#00E5FF'];
const RING = { common: '#ffffff', rare: '#4fc3ff', epic: '#c77dff', legend: '#ffc93c', myth: '#ff4d6d' };

/** 오늘의 스티커 (하루 고정) */
export function dailySticker(seedKey) {
  const r = seededRandom(`${seedKey}|sticker`);
  const total = STICKERS.reduce((s, x) => s + WEIGHT[x.rarity], 0);
  let acc = 0;
  for (const st of STICKERS) {
    acc += WEIGHT[st.rarity];
    if (r * total < acc) return st;
  }
  return STICKERS[0];
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function renderStickerSVG(st, size = 96, locked = false) {
  const c = COLORS[st.element];
  const ring = RING[st.rarity];
  const fs = st.text.length > 4 ? 15 : 19;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}">
    <g ${locked ? 'opacity="0.35" filter="grayscale(1)"' : ''}>
      ${!locked && (st.rarity === 'legend' || st.rarity === 'myth') ? `<g>${Array.from({ length: 12 }, (_, i) => { const a = (i * 30) * Math.PI / 180; const b = ((i + 0.5) * 30) * Math.PI / 180; return `<path d="M60 58 L${60 + Math.cos(a) * 70} ${58 + Math.sin(a) * 70} L${60 + Math.cos(b) * 70} ${58 + Math.sin(b) * 70} Z" fill="${ring}" opacity="0.45"/>`; }).join('')}<animateTransform attributeName="transform" type="rotate" from="0 60 58" to="360 60 58" dur="16s" repeatCount="indefinite"/></g>` : ''}
      <circle cx="60" cy="58" r="52" fill="#ffffff" ${!locked && st.rarity !== 'common' ? `style="filter:drop-shadow(0 0 6px ${ring})"` : ''}/>
      <circle cx="60" cy="58" r="46" fill="${c}" opacity="0.22"/>
      <circle cx="60" cy="58" r="46" fill="none" stroke="${ring}" stroke-width="${st.rarity === 'common' ? 0 : 4}"/>
      <text x="60" y="58" font-size="40" text-anchor="middle" dominant-baseline="central">${locked ? '❔' : st.icon}</text>
      <rect x="14" y="84" width="92" height="28" rx="14" fill="#241b2f"/>
      <text x="60" y="103" font-size="${fs}" font-weight="900" text-anchor="middle" fill="#fff" font-family="'Noto Sans KR', sans-serif">${locked ? '???' : esc(st.text)}</text>
    </g>
  </svg>`;
}
