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

function renderClassic(t) {
  const W = 300; const H = 540;
  const ink = '#b3201b';
  const accent = CLASSIC_ACCENT[t.element];
  const gold = t.rarity.key === 'legend' || t.rarity.key === 'myth';
  const serif = `font-family="'Song Myung','Nanum Myeongjo','Noto Serif KR',serif"`;
  const effects = t.effects.map((e, i) => `<text x="${W / 2}" y="${438 + i * 20}" font-size="14" text-anchor="middle" fill="${ink}" ${serif} font-weight="700">${esc(e.stat)} ${fmt(e.value)}</text>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="paper-${t.id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7dc82"/><stop offset="1" stop-color="#eec65a"/>
    </linearGradient>
    <filter id="rough-${t.id}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n"/><feColorMatrix in="n" type="saturate" values="0"/><feBlend in="SourceGraphic" in2="n" mode="multiply"/></filter>
  </defs>
  <rect width="${W}" height="${H}" rx="6" fill="url(#paper-${t.id})"/>
  <rect width="${W}" height="${H}" rx="6" fill="#f2d070" opacity="0.25" filter="url(#rough-${t.id})"/>
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" fill="none" stroke="${gold ? '#a07a1c' : ink}" stroke-width="${gold ? 4 : 3}"/>
  <rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="none" stroke="${ink}" stroke-width="1.2"/>
  <!-- 부두(符頭) -->
  <g fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round">
    <path d="M110 46 q40 -22 80 0"/><path d="M120 58 h60"/><circle cx="150" cy="40" r="6"/>
  </g>
  <text x="150" y="70" font-size="20" text-anchor="middle" dominant-baseline="hanging" fill="${ink}" ${serif} font-weight="800" letter-spacing="10">敕令</text>
  ${motif(t.element, 48, 104, 204, accent, 2.2)}
  <!-- 주문 -->
  ${verticalText(t.type.hanja, W / 2, 142, 52, `fill="${ink}" ${serif} font-weight="800"`)}
  <path d="M70 150 q-14 120 4 250 M230 150 q14 120 -4 250" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M82 170 l-10 10 l10 10 M218 170 l10 10 l-10 10 M82 360 l-10 10 l10 10 M218 360 l10 10 l-10 10" fill="none" stroke="${ink}" stroke-width="2"/>
  ${effects}
  <!-- 낙관 -->
  <rect x="226" y="486" width="40" height="40" fill="${ink}" rx="3"/>
  <text x="246" y="507" font-size="24" text-anchor="middle" dominant-baseline="central" fill="#f7dc82" ${serif} font-weight="800">${ELEMENT_HANJA[t.element]}</text>
  <text x="36" y="500" font-size="12" fill="${ink}" ${serif}>${esc(t.rarity.label)} · ${esc(t.type.label)}부</text>
  <text x="36" y="516" font-size="10" fill="${ink}" opacity="0.7" font-family="monospace">${esc(t.dateKey)} #${esc(t.id)}</text>
</svg>`;
}

function renderNeon(t) {
  const W = 300; const H = 540;
  const c = NEON[t.element];
  const rc = t.rarity.color;
  const mono = 'font-family="\'JetBrains Mono\',\'Fira Code\',monospace"';
  const serif = `font-family="'Song Myung','Nanum Myeongjo','Noto Serif KR',serif"`;
  let grid = '';
  for (let x = 0; x <= W; x += 20) grid += `<path d="M${x} 0V${H}"/>`;
  for (let y = 0; y <= H; y += 20) grid += `<path d="M0 ${y}H${W}"/>`;
  const effects = t.effects.map((e, i) => {
    const y = 420 + i * 24;
    return `<rect x="34" y="${y - 14}" width="232" height="20" rx="4" fill="${c}" opacity="0.08" stroke="${c}" stroke-opacity="0.35"/>
    <text x="44" y="${y}" font-size="12" fill="${c}" ${mono}>${esc(e.stat)}</text>
    <text x="256" y="${y}" font-size="13" fill="#fff" text-anchor="end" ${mono} font-weight="700" filter="url(#glow-${t.id})">${fmt(e.value)}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <filter id="glow-${t.id}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="bg-${t.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d0a1f"/><stop offset="1" stop-color="#05040c"/>
    </linearGradient>
    <linearGradient id="holo-${t.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c}"/><stop offset="0.5" stop-color="${rc}"/><stop offset="1" stop-color="${c}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" rx="14" fill="url(#bg-${t.id})"/>
  <g stroke="${c}" stroke-opacity="0.07" stroke-width="1">${grid}</g>
  <rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="10" fill="none" stroke="url(#holo-${t.id})" stroke-width="2.5" filter="url(#glow-${t.id})"/>
  <path d="M10 60 h30 l10 -10 h60 M290 480 h-30 l-10 10 h-60" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.8"/>
  <text x="26" y="36" font-size="10" fill="${c}" ${mono} opacity="0.9">SYS://TALISMAN.v2099</text>
  <text x="274" y="36" font-size="10" fill="${rc}" ${mono} text-anchor="end" filter="url(#glow-${t.id})">[${esc(t.rarity.label)}]</text>
  <g filter="url(#glow-${t.id})">
    <circle cx="150" cy="86" r="18" fill="none" stroke="${c}" stroke-width="2"/>
    <text x="150" y="87" font-size="20" text-anchor="middle" dominant-baseline="central" fill="${c}" ${serif} font-weight="800">${ELEMENT_HANJA[t.element]}</text>
    ${motif(t.element, 54, 118, 192, c, 1.8)}
    ${verticalText(t.type.hanja, W / 2, 152, 50, `fill="#ffffff" stroke="${c}" stroke-width="1" ${serif} font-weight="800"`)}
  </g>
  <path d="M66 160 v220 M234 160 v220" stroke="${c}" stroke-width="1.5" stroke-dasharray="2 6" opacity="0.7"/>
  <circle cx="66" cy="160" r="3" fill="${c}"/><circle cx="234" cy="380" r="3" fill="${c}"/>
  ${effects}
  <text x="26" y="510" font-size="10" fill="${c}" opacity="0.7" ${mono}>${esc(t.type.label.toUpperCase())}_CHARM // ${esc(t.dateKey)}</text>
  <text x="274" y="510" font-size="10" fill="${c}" opacity="0.7" ${mono} text-anchor="end">#${esc(t.id)}</text>
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
