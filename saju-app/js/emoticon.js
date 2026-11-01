// 오늘의 행운 이모티콘: 일간별 수호령 캐릭터 × 오늘 점수 표정 × 최고 운세 소품
import { STEM_ELEMENT } from './saju.js';
import { CATEGORIES } from './fortune.js';

export const GUARDIANS = [
  { name: '푸른 사슴', ear: 'antler' },
  { name: '새싹 토끼', ear: 'long' },
  { name: '불꽃 여우', ear: 'fox' },
  { name: '촛불 고양이', ear: 'cat' },
  { name: '황토 곰', ear: 'round' },
  { name: '꿀빛 다람쥐', ear: 'tuft' },
  { name: '은빛 매', ear: 'crest' },
  { name: '보석 학', ear: 'plume' },
  { name: '검은 거북', ear: 'shell' },
  { name: '이슬 수달', ear: 'small' },
];

const BODY = ['#5ee6a0', '#ff6b8b', '#ffd166', '#dfe3ff', '#5fd8ff'];
const BODY_DARK = ['#1f8a5a', '#c2304f', '#c79120', '#8e93b8', '#1f7fa8'];

const PROPS = { wealth: '💰', love: '💕', career: '📜', health: '💪', social: '🤝', total: '🍀' };

export const MOODS = [
  { key: 'determined', label: '결연' },
  { key: 'calm', label: '담담' },
  { key: 'smile', label: '미소' },
  { key: 'excited', label: '신남' },
];

export const SET_MOODS = [
  { key: 'excited', label: '기쁨', caption: '오늘 운 최고!' },
  { key: 'fighting', label: '화이팅', caption: '액운 차단 완료' },
  { key: 'thanks', label: '감사', caption: '복 받으세요' },
  { key: 'sleepy', label: '졸림', caption: '기운 충전 중…' },
];

function ears(type, fill, dark) {
  switch (type) {
    case 'antler': return `<g fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round"><path d="M80 70 L66 34 M72 52 L54 46 M66 34 L58 18 M66 34 L78 20"/><path d="M160 70 L174 34 M168 52 L186 46 M174 34 L182 18 M174 34 L162 20"/></g>`;
    case 'long': return `<ellipse cx="92" cy="40" rx="14" ry="38" fill="${fill}" stroke="${dark}" stroke-width="4"/><ellipse cx="148" cy="40" rx="14" ry="38" fill="${fill}" stroke="${dark}" stroke-width="4"/><ellipse cx="92" cy="44" rx="6" ry="24" fill="#fff" opacity="0.6"/><ellipse cx="148" cy="44" rx="6" ry="24" fill="#fff" opacity="0.6"/>`;
    case 'fox': return `<path d="M70 82 L74 26 L112 64 Z M170 82 L166 26 L128 64 Z" fill="${fill}" stroke="${dark}" stroke-width="4" stroke-linejoin="round"/><path d="M78 70 L80 42 L100 62 Z M162 70 L160 42 L140 62 Z" fill="#fff" opacity="0.7"/>`;
    case 'cat': return `<path d="M72 84 L80 40 L110 66 Z M168 84 L160 40 L130 66 Z" fill="${fill}" stroke="${dark}" stroke-width="4" stroke-linejoin="round"/><path d="M120 30 q-6 10 0 18 q6 -8 0 -18" fill="#ffb703"/>`;
    case 'round': return `<circle cx="78" cy="62" r="20" fill="${fill}" stroke="${dark}" stroke-width="4"/><circle cx="162" cy="62" r="20" fill="${fill}" stroke="${dark}" stroke-width="4"/><circle cx="78" cy="62" r="9" fill="${dark}" opacity="0.4"/><circle cx="162" cy="62" r="9" fill="${dark}" opacity="0.4"/>`;
    case 'tuft': return `<path d="M76 76 L78 36 q10 6 4 14 L104 64 Z M164 76 L162 36 q-10 6 -4 14 L136 64 Z" fill="${fill}" stroke="${dark}" stroke-width="4" stroke-linejoin="round"/>`;
    case 'crest': return `<path d="M104 52 q6 -30 16 -36 q-2 16 6 10 q4 -10 14 -10 q-8 14 -2 36 Z" fill="${dark}"/>`;
    case 'plume': return `<path d="M120 54 q-4 -26 -18 -40 M120 54 q4 -28 20 -38 M120 54 v-34" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="120" cy="58" r="8" fill="#ff4d6d"/>`;
    case 'shell': return `<path d="M60 150 q60 -150 120 0" fill="${dark}" opacity="0.35"/><path d="M90 92 l15 -14 h30 l15 14 M120 78 v-10" stroke="${dark}" stroke-width="3" fill="none"/>`;
    default: return `<circle cx="80" cy="74" r="12" fill="${fill}" stroke="${dark}" stroke-width="4"/><circle cx="160" cy="74" r="12" fill="${fill}" stroke="${dark}" stroke-width="4"/>`;
  }
}

function face(mood, dark) {
  const eyeColor = '#1b1b2f';
  switch (mood) {
    case 'excited': return `<path d="M88 120 q10 -14 20 0 M132 120 q10 -14 20 0" stroke="${eyeColor}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M102 140 q18 26 36 0 Z" fill="${eyeColor}"/><path d="M110 148 q10 8 20 0" fill="#ff6b8b"/>`;
    case 'smile': return `<circle cx="98" cy="118" r="7" fill="${eyeColor}"/><circle cx="142" cy="118" r="7" fill="${eyeColor}"/><circle cx="100" cy="115" r="2.5" fill="#fff"/><circle cx="144" cy="115" r="2.5" fill="#fff"/><path d="M106 140 q14 14 28 0" stroke="${eyeColor}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    case 'calm': return `<path d="M90 120 h16 M134 120 h16" stroke="${eyeColor}" stroke-width="5" stroke-linecap="round"/><path d="M110 142 h20" stroke="${eyeColor}" stroke-width="5" stroke-linecap="round"/>`;
    case 'fighting': return `<path d="M86 108 l20 6 M154 108 l-20 6" stroke="${eyeColor}" stroke-width="5" stroke-linecap="round"/><circle cx="98" cy="122" r="6" fill="${eyeColor}"/><circle cx="142" cy="122" r="6" fill="${eyeColor}"/><path d="M106 144 q14 -8 28 0" stroke="${eyeColor}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    case 'thanks': return `<path d="M88 122 q10 -12 20 0 M132 122 q10 -12 20 0" stroke="${eyeColor}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M108 140 q12 12 24 0" stroke="${eyeColor}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M60 170 q10 -20 30 -10 M180 170 q-10 -20 -30 -10" stroke="${dark}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    case 'sleepy': return `<path d="M88 122 q10 8 20 0 M132 122 q10 8 20 0" stroke="${eyeColor}" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="120" cy="146" rx="7" ry="9" fill="${eyeColor}"/><text x="176" y="80" font-size="22" font-weight="800" fill="${dark}" font-family="sans-serif">Z</text><text x="196" y="60" font-size="16" font-weight="800" fill="${dark}" font-family="sans-serif">z</text>`;
    default: return `<path d="M86 112 l20 4 M154 112 l-20 4" stroke="${eyeColor}" stroke-width="5" stroke-linecap="round"/><circle cx="98" cy="124" r="6" fill="${eyeColor}"/><circle cx="142" cy="124" r="6" fill="${eyeColor}"/><path d="M108 146 h24" stroke="${eyeColor}" stroke-width="5" stroke-linecap="round"/>`;
  }
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * @param saju, fortune
 * @param opts {mood?, caption?, neon?}
 */
export function renderEmoticonSVG(saju, fortune, opts = {}) {
  const g = GUARDIANS[saju.dayMaster];
  const el = STEM_ELEMENT[saju.dayMaster];
  const fill = BODY[el]; const dark = BODY_DARK[el];
  const mood = opts.mood || MOODS[fortune.tier].key;
  const best = fortune.best;
  const bestCat = CATEGORIES.find((c) => c.key === best);
  const bonus = Math.max(5, Math.round((fortune.scores[best] - 50) / 2));
  const caption = opts.caption || `${bestCat.label}운 +${bonus}%`;
  const neon = opts.neon ?? true;
  const bg = neon
    ? `<rect width="240" height="240" rx="36" fill="#0d0a1f"/><circle cx="120" cy="128" r="96" fill="${fill}" opacity="0.12"/>`
    : `<rect width="240" height="240" rx="36" fill="#fff6dd"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs><filter id="eg${saju.dayMaster}${mood}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  ${bg}
  <g ${neon ? `filter="url(#eg${saju.dayMaster}${mood})"` : ''}>
    ${ears(g.ear, fill, dark)}
    <ellipse cx="120" cy="128" rx="64" ry="58" fill="${fill}" stroke="${dark}" stroke-width="5"/>
  </g>
  <ellipse cx="86" cy="140" rx="10" ry="6" fill="#ff6b8b" opacity="0.45"/>
  <ellipse cx="154" cy="140" rx="10" ry="6" fill="#ff6b8b" opacity="0.45"/>
  ${face(mood, dark)}
  <text x="190" y="196" font-size="34" text-anchor="middle" dominant-baseline="central">${PROPS[best] || '🍀'}</text>
  <rect x="24" y="196" width="${Math.min(150, 20 + caption.length * 13)}" height="28" rx="14" fill="${neon ? fill : dark}"/>
  <text x="${24 + Math.min(150, 20 + caption.length * 13) / 2}" y="211" font-size="14" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="${neon ? '#0d0a1f' : '#fff'}" font-family="'Pretendard','Apple SD Gothic Neo','Noto Sans KR',sans-serif">${esc(caption)}</text>
</svg>`;
}
