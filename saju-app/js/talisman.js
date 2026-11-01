// 부적 생성 엔진: 오행 보완 + 등급 + 효과 수치 + SVG 렌더링 (전통 / 네온)
import { ELEMENT_KO, ELEMENT_HANJA, STEM_ELEMENT, seededRandom, parentOf } from './saju.js';
import { birthKey } from './fortune.js';

export const TALISMAN_TYPES = [
  { key: 'protect', label: '액막이', hanja: '除災招福', reading: '제재초복', meaning: '재앙을 물리치고 복을 부른다', stat: '액운', sign: -1, sub: '액운 저항' },
  { key: 'luck', label: '행운', hanja: '萬事亨通', reading: '만사형통', meaning: '모든 일이 뜻대로 풀린다', stat: '행운', sign: 1, sub: '기회 포착' },
  { key: 'wealth', label: '재물', hanja: '招財進寶', reading: '초재진보', meaning: '재물을 부르고 보물이 들어온다', stat: '재물운', sign: 1, sub: '지출 방어' },
  { key: 'love', label: '애정', hanja: '月老結緣', reading: '월로결연', meaning: '월하노인이 좋은 인연을 맺어 준다', stat: '매력', sign: 1, sub: '인연 확률' },
  { key: 'exam', label: '합격', hanja: '金榜題名', reading: '금방제명', meaning: '합격자 명단에 이름을 올린다', stat: '집중력', sign: 1, sub: '실수 방지' },
  { key: 'health', label: '건강', hanja: '無病長壽', reading: '무병장수', meaning: '병 없이 오래 건강하다', stat: '체력', sign: 1, sub: '회복력' },
];

export const RARITIES = [
  { key: 'common', label: '일반', base: 5, weight: 60, color: '#9aa3b2' },
  { key: 'rare', label: '희귀', base: 8, weight: 28, color: '#4fc3ff' },
  { key: 'epic', label: '영웅', base: 12, weight: 9, color: '#c77dff' },
  { key: 'legend', label: '전설', base: 16, weight: 2.7, color: '#ffc93c' },
  { key: 'myth', label: '신화', base: 20, weight: 0.3, color: '#ff4d6d' },
];

export const THEMES = [
  { key: 'classic', label: '전통 주사' },
  { key: 'neon', label: '네온 2099' },
];

const NEON = ['#39FF88', '#FF2E63', '#FFC93C', '#E0E0FF', '#00E5FF'];
const CLASSIC_ACCENT = ['#1f6b4f', '#b3201b', '#8a5a14', '#5d5d6b', '#1d2b4f'];

export function rollRarity(r) {
  let acc = 0;
  const total = RARITIES.reduce((s, x) => s + x.weight, 0);
  const target = r * total;
  for (const rar of RARITIES) {
    acc += rar.weight;
    if (target < acc) return rar;
  }
  return RARITIES[0];
}

/** 효과 수치 = 등급 기본값 × 부족 보정 × 오늘 보정 */
export function computeEffect(rarity, elementScore, element, todayElement) {
  const deficit = Math.min(1.5, Math.max(0.5, 1 + (20 - elementScore) / 40));
  let todayMul = 1;
  if (todayElement === element) todayMul = 1.1;
  else if (parentOf(element) === todayElement) todayMul = 1.2; // 오늘 기운이 부적 기운을 생해 줌
  else if ((element + 3) % 5 === todayElement) todayMul = 0.9;  // 오늘 기운이 부적 기운을 극함
  return { value: Math.round(rarity.base * deficit * todayMul), deficit, todayMul };
}

/**
 * @param saju, fortune
 * @param opts {type, theme, element?, reroll?}
 */
export function createTalisman(saju, fortune, opts = {}) {
  const type = TALISMAN_TYPES.find((t) => t.key === opts.type) || TALISMAN_TYPES[0];
  const theme = opts.theme || 'classic';
  const element = opts.element ?? saju.weakest;
  const seedStr = `${birthKey(saju)}|${fortune.dateKey}|${type.key}|${opts.reroll || 0}`;
  const rarity = opts.rarity
    ? RARITIES.find((r) => r.key === opts.rarity)
    : rollRarity(seededRandom(seedStr));
  const main = computeEffect(rarity, saju.elements[element], element, fortune.todayElement);
  const subValue = Math.max(3, Math.round(main.value * 0.6));
  const elementBonus = Math.max(2, Math.round(main.value * 0.5));

  return {
    id: Math.floor(seededRandom(`${seedStr}|id`) * 1e8).toString(36).toUpperCase().padStart(6, '0'),
    type, theme, element, rarity,
    effects: [
      { stat: type.stat, value: main.value * type.sign },
      { stat: type.sub, value: subValue },
      { stat: `${ELEMENT_KO[element]}기(${ELEMENT_HANJA[element]}) 보충`, value: elementBonus },
    ],
    calc: main,
    dateKey: fortune.dateKey,
    dayMasterHanja: ELEMENT_HANJA[STEM_ELEMENT[saju.dayMaster]],
  };
}

const fmt = (v) => `${v > 0 ? '+' : ''}${v}%`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- 오행 문양 ----------

function motif(el, x, y, w, color, strokeW = 2) {
  const s = `fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round"`;
  switch (el) {
    case 0: { // 목: 잎과 줄기
      let p = `<path ${s} d="M${x} ${y + 20} Q${x + w / 2} ${y - 10} ${x + w} ${y + 20}"/>`;
      for (let i = 1; i < 5; i++) {
        const cx = x + (w / 5) * i;
        p += `<path ${s} d="M${cx} ${y + 10} q-6 -12 0 -18 q6 6 0 18"/>`;
      }
      return p;
    }
    case 1: { // 화: 불꽃
      let p = '';
      for (let i = 0; i < 5; i++) {
        const cx = x + (w / 5) * i + w / 10;
        p += `<path ${s} d="M${cx} ${y + 22} q-9 -10 0 -24 q2 10 6 6 q4 10 -6 18"/>`;
      }
      return p;
    }
    case 2: { // 토: 산
      return `<path ${s} d="M${x} ${y + 22} L${x + w * 0.22} ${y} L${x + w * 0.4} ${y + 14} L${x + w * 0.6} ${y - 4} L${x + w * 0.8} ${y + 12} L${x + w} ${y + 22} Z"/>`;
    }
    case 3: { // 금: 별과 검
      let p = '';
      for (let i = 0; i < 4; i++) {
        const cx = x + (w / 4) * i + w / 8; const cy = y + 10;
        p += `<path ${s} d="M${cx} ${cy - 10} L${cx + 3} ${cy - 3} L${cx + 10} ${cy} L${cx + 3} ${cy + 3} L${cx} ${cy + 10} L${cx - 3} ${cy + 3} L${cx - 10} ${cy} L${cx - 3} ${cy - 3} Z"/>`;
      }
      return p;
    }
    default: { // 수: 물결
      let p = '';
      for (let r = 0; r < 2; r++) {
        let d = `M${x} ${y + 6 + r * 12}`;
        for (let i = 0; i < 4; i++) d += ` q${w / 8} -10 ${w / 4} 0`;
        p += `<path ${s} d="${d}"/>`;
      }
      return p;
    }
  }
}

function verticalText(text, cx, top, size, attrs) {
  return [...text].map((ch, i) => `<text x="${cx}" y="${top + i * size * 1.05}" font-size="${size}" text-anchor="middle" dominant-baseline="hanging" ${attrs}>${esc(ch)}</text>`).join('');
}

// ---------- 렌더러 ----------

export function renderTalismanSVG(t) {
  return t.theme === 'neon' ? renderNeon(t) : renderClassic(t);
}

const SIDE_MANTRA = ['急急如律令', '天地玄宗', '奉請神將', '護身保命', '五方鎭宅', '日月同光'];
const SEAL_TEXT = { protect: '辟邪', luck: '大吉', wealth: '進財', love: '和合', exam: '登科', health: '長生' };
let rid = 0;

/** 모서리 구름무늬(운문) */
function cloudCorner(x, y, sx, sy, color, w = 2.2) {
  return `<g transform="translate(${x} ${y}) scale(${sx} ${sy})" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round">
    <path d="M0 34 q0 -34 34 -34"/><path d="M8 34 q0 -12 10 -16 q10 -4 12 6 q2 10 -8 10 q-6 0 -6 -6"/>
    <path d="M34 8 q12 -2 16 8 q2 8 -6 8"/><circle cx="6" cy="6" r="3" fill="${color}"/></g>`;
}

/** 부각(符脚): 부적 아래쪽 휘감기는 붓선 */
function talismanFoot(cx, y, color, w = 3) {
  return `<path d="M${cx} ${y} q-26 10 -6 24 q22 14 -2 26 q-28 12 -4 26 q14 8 30 0" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M${cx - 30} ${y + 40} q30 -8 60 0 M${cx - 24} ${y + 62} q24 -6 48 0" fill="none" stroke="${color}" stroke-width="${w * 0.7}" stroke-linecap="round"/>`;
}

function rarityFrame(t, id, W, H, inset, rx) {
  const k = t.rarity.key;
  if (k === 'legend') {
    return `<rect x="${inset}" y="${inset}" width="${W - inset * 2}" height="${H - inset * 2}" rx="${rx}" fill="none" stroke="url(#${id}-gold)" stroke-width="7"/>
    ${[[inset + 4, inset + 4], [W - inset - 4, inset + 4], [inset + 4, H - inset - 4], [W - inset - 4, H - inset - 4]].map(([x, y]) => `<path d="M${x} ${y - 9} l2.5 6.5 l6.5 2.5 l-6.5 2.5 l-2.5 6.5 l-2.5 -6.5 l-6.5 -2.5 l6.5 -2.5 z" fill="#fff6c8"/>`).join('')}`;
  }
  if (k === 'myth') {
    return `<rect x="${inset}" y="${inset}" width="${W - inset * 2}" height="${H - inset * 2}" rx="${rx}" fill="none" stroke="url(#${id}-holo)" stroke-width="8"/>
    <rect x="${inset}" y="${inset}" width="${W - inset * 2}" height="${H - inset * 2}" rx="${rx}" fill="url(#${id}-sheen)" opacity="0.35"/>`;
  }
  if (k === 'epic') return `<rect x="${inset}" y="${inset}" width="${W - inset * 2}" height="${H - inset * 2}" rx="${rx}" fill="none" stroke="#9d4edd" stroke-width="4"/>`;
  if (k === 'rare') return `<rect x="${inset}" y="${inset}" width="${W - inset * 2}" height="${H - inset * 2}" rx="${rx}" fill="none" stroke="#2f80ed" stroke-width="3"/>`;
  return '';
}

function rarityDefs(id) {
  return `<linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset="0.3" stop-color="#d4a017"/><stop offset="0.55" stop-color="#fff6c8"/><stop offset="0.8" stop-color="#b8860b"/><stop offset="1" stop-color="#ffe680"/></linearGradient>
  <linearGradient id="${id}-holo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4d6d"/><stop offset="0.2" stop-color="#ffc93c"/><stop offset="0.4" stop-color="#39ff88"/><stop offset="0.6" stop-color="#00e5ff"/><stop offset="0.8" stop-color="#7b5cff"/><stop offset="1" stop-color="#ff4d9d"/></linearGradient>
  <linearGradient id="${id}-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0.3" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.8"/><stop offset="0.7" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
}

function renderClassic(t) {
  const W = 300; const H = 540;
  const id = `tc${(rid++).toString(36)}`;
  const ink = '#b0181b';
  const inkDark = '#7d0f12';
  const accent = CLASSIC_ACCENT[t.element];
  const serif = `font-family="'Song Myung','Nanum Myeongjo','Noto Serif KR',serif"`;
  const mantraL = SIDE_MANTRA[(t.element + t.type.key.length) % SIDE_MANTRA.length];
  const mantraR = `${ELEMENT_HANJA[t.element]}德護身`;
  const seal = SEAL_TEXT[t.type.key] || '大吉';
  const effects = t.effects.map((e, i) => {
    const y = 436 + i * 19;
    return `<text x="${W / 2}" y="${y}" font-size="13.5" text-anchor="middle" fill="${inkDark}" ${serif} font-weight="700">${esc(e.stat)} <tspan fill="${ink}" font-weight="800">${fmt(e.value)}</tspan></text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="${id}-paper" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#fbe49a"/><stop offset="0.5" stop-color="#f3d06a"/><stop offset="1" stop-color="#e9bf4f"/></linearGradient>
    <radialGradient id="${id}-burn" cx="50%" cy="50%" r="72%"><stop offset="0.72" stop-color="#7a4a10" stop-opacity="0"/><stop offset="1" stop-color="#7a4a10" stop-opacity="0.55"/></radialGradient>
    <filter id="${id}-fiber" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="3" seed="${t.element + 3}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0 0.05  0 0 0 0.22 0"/></filter>
    <filter id="${id}-brush" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="7" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="2.2"/></filter>
    <filter id="${id}-stamp"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="2" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.6 1.25" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>
    ${rarityDefs(id)}
  </defs>
  <rect width="${W}" height="${H}" rx="4" fill="url(#${id}-paper)"/>
  <rect width="${W}" height="${H}" rx="4" filter="url(#${id}-fiber)"/>
  <rect width="${W}" height="${H}" rx="4" fill="url(#${id}-burn)"/>
  <g filter="url(#${id}-brush)">
    <rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="none" stroke="${ink}" stroke-width="3.2"/>
    <rect x="22" y="22" width="${W - 44}" height="${H - 44}" fill="none" stroke="${ink}" stroke-width="1.2"/>
    ${cloudCorner(26, 26, 1, 1, ink)}${cloudCorner(W - 26, 26, -1, 1, ink)}${cloudCorner(26, H - 26, 1, -1, ink)}${cloudCorner(W - 26, H - 26, -1, -1, ink)}
    <!-- 삼청(三淸) 부두 -->
    <g fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round">
      <circle cx="122" cy="44" r="7"/><circle cx="150" cy="38" r="8"/><circle cx="178" cy="44" r="7"/>
      <path d="M112 56 q38 -14 76 0"/><path d="M104 64 h92"/>
    </g>
    <text x="150" y="96" font-size="24" text-anchor="middle" fill="${ink}" ${serif} font-weight="800" letter-spacing="14">勅令</text>
    ${motif(t.element, 56, 108, 188, accent, 2.4)}
    <!-- 주문 본체 -->
    ${verticalText(t.type.hanja, W / 2, 140, 46, `fill="${ink}" ${serif} font-weight="800"`)}
    <!-- 양옆 주문 기둥 -->
    ${verticalText(mantraL, 62, 160, 17, `fill="${inkDark}" ${serif} opacity="0.85"`)}
    ${verticalText(mantraR, 238, 160, 17, `fill="${inkDark}" ${serif} opacity="0.85"`)}
    <path d="M84 150 q-10 110 2 246 M216 150 q10 110 -2 246" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
    <g transform="translate(150 342) scale(0.72) translate(-150 -342)">${talismanFoot(150, 342, ink, 3.4)}</g>
  </g>
  <line x1="60" y1="420" x2="240" y2="420" stroke="${ink}" stroke-width="1" stroke-dasharray="2 4"/>
  ${effects}
  ${rarityFrame(t, id, W, H, 6, 4)}
  <!-- 낙관 -->
  <g filter="url(#${id}-stamp)" transform="translate(-10 -8) rotate(-4 246 498)">
    <rect x="222" y="474" width="48" height="48" rx="4" fill="${ink}"/>
    <rect x="226" y="478" width="40" height="40" rx="2" fill="none" stroke="#fbe49a" stroke-width="1.5"/>
    <text x="246" y="494" font-size="17" text-anchor="middle" dominant-baseline="central" fill="#fbe49a" ${serif} font-weight="800">${seal[0]}</text>
    <text x="246" y="512" font-size="17" text-anchor="middle" dominant-baseline="central" fill="#fbe49a" ${serif} font-weight="800">${seal[1]}</text>
  </g>
  <text x="66" y="494" font-size="12" fill="${inkDark}" ${serif}>${esc(t.rarity.label)} · ${esc(t.type.label)}부 · ${ELEMENT_HANJA[t.element]}</text>
  <text x="66" y="509" font-size="9.5" fill="${inkDark}" opacity="0.7" font-family="monospace">${esc(t.dateKey)} #${esc(t.id)}</text>
</svg>`;
}

function renderNeon(t) {
  const W = 300; const H = 540;
  const id = `tn${(rid++).toString(36)}`;
  const c = NEON[t.element];
  const c2 = NEON[(t.element + 2) % 5];
  const rc = t.rarity.color;
  const mono = 'font-family="\'JetBrains Mono\',\'Fira Code\',monospace"';
  const serif = `font-family="'Song Myung','Nanum Myeongjo','Noto Serif KR',serif"`;
  // 원근 그리드 (바닥)
  let floor = '';
  for (let i = -6; i <= 6; i++) floor += `<path d="M${150 + i * 10} 400 L${150 + i * 60} 540"/>`;
  for (let j = 0; j < 6; j++) { const y = 400 + (j * j) * 4.2 + j * 6; floor += `<path d="M0 ${y} H${W}"/>`; }
  let scan = '';
  for (let y = 0; y < H; y += 4) scan += `<rect x="0" y="${y}" width="${W}" height="1"/>`;
  const effects = t.effects.map((e, i) => {
    const y = 418 + i * 26;
    const pct = Math.min(100, Math.abs(e.value) * 4);
    return `<g transform="translate(30 ${y})">
      <rect width="240" height="20" rx="4" fill="#05040c" fill-opacity="0.75" stroke="${c}" stroke-opacity="0.45"/>
      <rect x="2" y="2" width="${(236 * pct) / 100}" height="16" rx="3" fill="${c}" opacity="0.18"/>
      <text x="10" y="14" font-size="11.5" fill="${c}" ${mono}>${esc(e.stat)}</text>
      <text x="232" y="14.5" font-size="12.5" fill="#fff" text-anchor="end" ${mono} font-weight="700" filter="url(#${id}-glow)">${fmt(e.value)}</text></g>`;
  }).join('');
  const bracket = (x, y, sx, sy) => `<path transform="translate(${x} ${y}) scale(${sx} ${sy})" d="M0 22 V0 H22" fill="none" stroke="${rc}" stroke-width="3" filter="url(#${id}-glow)"/>`;
  const hanjaGlitch = (dx, color, op) => `<g transform="translate(${dx} 0)" opacity="${op}">${verticalText(t.type.hanja, W / 2, 156, 50, `fill="${color}" ${serif} font-weight="800"`)}</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <filter id="${id}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="${id}-bloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
    <radialGradient id="${id}-core" cx="50%" cy="38%" r="60%"><stop offset="0" stop-color="${c}" stop-opacity="0.22"/><stop offset="1" stop-color="#05040c" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140d33"/><stop offset="0.7" stop-color="#07051a"/><stop offset="1" stop-color="#0b0420"/></linearGradient>
    <linearGradient id="${id}-edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="0.5" stop-color="${rc}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    ${rarityDefs(id)}
  </defs>
  <rect width="${W}" height="${H}" rx="16" fill="url(#${id}-bg)"/>
  <rect width="${W}" height="${H}" rx="16" fill="url(#${id}-core)"/>
  <g stroke="${c}" stroke-opacity="0.16" stroke-width="1">${floor}</g>
  <g fill="#fff" opacity="0.025">${scan}</g>
  <rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="12" fill="none" stroke="url(#${id}-edge)" stroke-width="2.5" filter="url(#${id}-glow)"/>
  ${bracket(18, 18, 1, 1)}${bracket(W - 18, 18, -1, 1)}${bracket(18, H - 18, 1, -1)}${bracket(W - 18, H - 18, -1, -1)}
  <text x="30" y="40" font-size="9.5" fill="${c}" ${mono} opacity="0.9">SYS://TALISMAN.v2099</text>
  <g transform="translate(${W - 30} 30)"><rect x="-58" y="-2" width="58" height="16" rx="8" fill="${rc}" fill-opacity="0.15" stroke="${rc}"/><text x="-29" y="10" font-size="9.5" fill="${rc}" ${mono} text-anchor="middle" font-weight="700">${esc(t.rarity.label)}</text></g>
  <!-- 오행 코어 -->
  <g transform="translate(150 86)">
    <circle r="30" fill="none" stroke="${c}" stroke-width="1" stroke-dasharray="2 5" opacity="0.8"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="18s" repeatCount="indefinite"/></circle>
    <circle r="21" fill="#05040c" stroke="${c}" stroke-width="2" filter="url(#${id}-glow)"/>
    <text y="1" font-size="22" text-anchor="middle" dominant-baseline="central" fill="${c}" ${serif} font-weight="800" filter="url(#${id}-glow)">${ELEMENT_HANJA[t.element]}</text>
  </g>
  <g filter="url(#${id}-glow)">${motif(t.element, 60, 124, 180, c, 1.8)}</g>
  <!-- 주문 본체 (글리치 + 블룸) -->
  <g filter="url(#${id}-bloom)" opacity="0.8">${verticalText(t.type.hanja, W / 2, 156, 50, `fill="${c}" ${serif} font-weight="800"`)}</g>
  ${hanjaGlitch(-2.5, '#00E5FF', 0.55)}${hanjaGlitch(2.5, '#FF2E63', 0.55)}
  <g>${verticalText(t.type.hanja, W / 2, 156, 50, `fill="#ffffff" ${serif} font-weight="800"`)}<animate attributeName="opacity" values="1;1;0.75;1;1;0.9;1" dur="3.2s" repeatCount="indefinite"/></g>
  <!-- 회로선 -->
  <g fill="none" stroke="${c}" stroke-width="1.4" opacity="0.75">
    <path d="M64 160 V250 l-14 14 V380"/><path d="M236 160 V230 l14 14 V380"/>
    <path d="M64 300 h-22 M236 320 h22"/>
  </g>
  <g fill="${c}"><circle cx="64" cy="160" r="3"/><circle cx="50" cy="380" r="3"/><circle cx="236" cy="160" r="3"/><circle cx="250" cy="380" r="3"/><circle cx="42" cy="300" r="2.4"/><circle cx="258" cy="320" r="2.4"/></g>
  ${verticalText(SIDE_MANTRA[t.element % SIDE_MANTRA.length], 40, 170, 12, `fill="${c}" opacity="0.45" ${serif}`)}
  ${verticalText(`${ELEMENT_HANJA[t.element]}德護身`, 260, 186, 12, `fill="${c}" opacity="0.45" ${serif}`)}
  ${effects}
  ${t.rarity.key === 'legend' || t.rarity.key === 'myth' ? rarityFrame(t, id, W, H, 4, 15) : ''}
  <text x="30" y="${H - 26}" font-size="9.5" fill="${c}" opacity="0.7" ${mono}>${esc(t.type.label.toUpperCase())}_CHARM // ${esc(t.dateKey)}</text>
  <g transform="translate(${W - 58} ${H - 44})" fill="${c}" opacity="0.6">${Array.from({ length: 16 }, (_, i) => ((parseInt(t.id, 36) >> i) & 1 ? `<rect x="${(i % 4) * 7}" y="${Math.floor(i / 4) * 7}" width="6" height="6"/>` : '')).join('')}</g>
</svg>`;
}

/** SVG 문자열 → PNG 다운로드 */
export async function downloadSVGAsPNG(svgString, filename, scale = 2) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = img.width * scale; canvas.height = img.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    const png = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(png);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } finally {
    URL.revokeObjectURL(url);
  }
}
