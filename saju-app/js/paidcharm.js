// v0.60 유료 부적(소원 부적 · 나쁜 기운 태우기 부적, 각 990원)을 「세상에 하나뿐인 부적」으로.
// A 전용 종이(금박 한지 · 붉은 한지) + 내 글을 붓글씨로 + 이름·만든 날·띠 지신 인장(생년월일 없음)
// B 직접 만드는 의식(먹 갈기 → 이름 따라 쓰기 → 도장 꾹(진동) → 지신이 기운 불어넣기)
// C 그 뒤의 이야기(소원: 중간에 「빛이 진해졌어」 · 태우기: 재가 씨앗으로, 7일 뒤 「마음은 좀 가벼워졌어?」)
// D 9:16 배경화면 저장
// 약속: 걱정 글은 저장하지 않는다(씨앗 기록에는 날짜·기운만). 운세 점수와는 무관.
import { josa } from './josa.js';
import { PAID_PAPERS } from './paidcharm-manifest.js';

export const BRUSH_FONT = "'Nanum Brush Script', 'Gowun Batang', serif";
export const HANJA_FONT = "'Song Myung', 'Gowun Batang', serif";
export const TEXT_FONT = "'Gowun Batang', 'Noto Sans KR', serif";
export const CHARM_W = 300;
export const CHARM_H = 480;
export const WALL_W = 1080;
export const WALL_H = 1920;

/** 띠 지신 인장: 子(0)=쥐 … 亥(11)=돼지 → 「龍神 / 之印」 */
export const SEAL_ANIMAL = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '鷄', '狗', '猪'];
export const sealChars = (branch) => [`${SEAL_ANIMAL[((Number(branch) % 12) + 12) % 12] || '神'}神`, '之印'];

export const PAPER = {
  wish: { head: '所願成就', sub: '소원 부적', ink: '#2b2420', headInk: '#b8382a', subInk: '#7a5a26', seal: '#b8382a', sealInk: '#fff6e6', headStroke: '#e9c25a', headStrokeW: 1.8, stops: ['#fbf0cf', '#f1d98f', '#e3bf63'], fiber: 'rgba(150, 105, 30, 0.2)', flake: '#c9962c', border: '#c18f2a', line: '#b8382a' },
  burn: { head: '消災降福', sub: '나쁜 기운 태우기 부적', ink: '#fff1d6', headInk: '#f3d27a', subInk: '#f6d9b0', seal: '#d9ab3d', sealInk: '#7e2418', headStroke: '#5a160e', headStrokeW: 3.2, stops: ['#cf4a32', '#a9321f', '#7c2216'], fiber: 'rgba(255, 220, 180, 0.14)', flake: '#e8c063', border: '#e8c063', line: '#f3d27a' },
};

/** 'Y-M-D' → '2026. 11. 6.' */
export const dotDate = (k) => { const [y, m, d] = String(k || '').split('-').map(Number); return y ? `${y}. ${m}. ${d}.` : ''; };
/** 'Y-M-D' → '12월 6일' */
const monthDay = (k) => { const [, m, d] = String(k || '').split('-').map(Number); return m ? `${m}월 ${d}일` : ''; };

/** 붓글씨 줄 나누기: 띄어쓰기를 먼저 살리고, 한 낱말이 길면 자름 */
export function wrapLines(text, per) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const lines = []; let cur = '';
  for (let w of words) {
    while (w.length > per) { if (cur) { lines.push(cur); cur = ''; } lines.push(w.slice(0, per)); w = w.slice(per); }
    if (!w) continue;
    if (!cur) cur = w; else if (cur.length + 1 + w.length <= per) cur += ` ${w}`; else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** 글자·장식 자리표(300×480). base = 코드 종이·v1 그림, gold2·red2 = v2 일러스트 카드(장식을 피해 잼, 2026-11-06 격자로 측정) */
export const LAYOUTS = {
  base: { head: 70, sub: 96, div1: 112, div2: 352, mid: 238, span: 1, x: 34, who: 386, made: 408, due: 428, seal: [214, 390, 64, 62], badge: 127, dueShort: false },
  gold2: { head: 118, sub: 140, div1: 154, div2: 328, mid: 244, span: 0.86, x: 58, who: 350, made: 366, due: 381, seal: [194, 334, 52, 50], badge: 168, dueShort: true, small: true },
  red2: { head: 100, sub: 120, div1: 134, div2: 310, mid: 224, span: 0.92, x: 64, who: 334, made: 352, due: 368, seal: [188, 316, 52, 50], badge: 148, dueShort: true, small: true },
};
const layoutKey = (d) => { const art = d.art ?? isArtPaper(d.kind); return art ? (d.kind === 'burn' ? 'red2' : 'gold2') : 'base'; };
export const layoutOf = (d) => LAYOUTS[layoutKey(d)];

/**
 * 부적 위 글자 배치(300×480 기준). SVG와 배경화면 캔버스가 같은 배치를 씀.
 * d = { kind: 'wish'|'burn', text, name, madeKey, dueKey, branch, done, doneKey, seal(기본 true) }
 * → [{ t, x, y, size, font, color, anchor, weight, spacing }]
 */
export function charmLayout(d) {
  const P = PAPER[d.kind] || PAPER.wish; const L = layoutOf(d); const text = String(d.text || '').trim();
  const n = text.replace(/\s/g, '').length;
  const per = n <= 6 ? 6 : n <= 14 ? 7 : 8;
  const size = Math.round((n <= 4 ? 52 : n <= 6 ? 46 : n <= 14 ? 40 : 33) * L.span);
  const lines = text ? wrapLines(text, per).slice(0, 5) : [];
  const lh = size * 1.18; const mid = L.mid;
  const y0 = mid - ((lines.length - 1) * lh) / 2 + size * 0.34;
  const items = [
    { t: P.head, x: 150, y: L.head, size: L.small ? 30 : 32, font: HANJA_FONT, color: P.headInk, anchor: 'middle', spacing: 6, stroke: P.headStroke, strokeW: P.headStrokeW },
    { t: P.sub, x: 150, y: L.sub, size: L.small ? 12 : 13, font: TEXT_FONT, color: P.subInk, anchor: 'middle', spacing: 2 },
    ...lines.map((t, i) => ({ t, x: 150, y: Math.round(y0 + i * lh), size, font: BRUSH_FONT, color: P.ink, anchor: 'middle' })),
  ];
  // v0.64 등불: 가족을 위한 소원이면 「엄마를 위한 소원」
  const who = d.forWho ? `${josa(d.forWho, '을/를')} 위한 소원` : d.name ? `${d.name} 님의 ${d.kind === 'burn' ? '걱정' : '소원'}` : `나의 ${d.kind === 'burn' ? '걱정' : '소원'}`;
  const fs = L.small ? 11 : 12;
  items.push({ t: who, x: L.x, y: L.who, size: L.small ? 13 : 14, font: TEXT_FONT, color: P.subInk, anchor: 'start', weight: 700 });
  items.push({ t: `${dotDate(d.madeKey)} 지음`, x: L.x, y: L.made, size: fs, font: TEXT_FONT, color: P.subInk, anchor: 'start' });
  if (d.kind === 'wish' && d.dueKey) items.push({ t: d.lantern ? `100일 등불 · ${monthDay(d.dueKey)}까지` : `${L.dueShort ? '이룰 날' : '이루고 싶은 날'} · ${monthDay(d.dueKey)}`, x: L.x, y: L.due, size: fs, font: TEXT_FONT, color: P.subInk, anchor: 'start' });
  if (d.seal !== false) {
    const [a, b] = sealChars(d.branch); const [sx, sy, sw, sh] = L.seal; const cx = sx + sw / 2; const g = Math.round(sh * 0.34);
    items.push({ t: a, x: cx, y: Math.round(sy + sh / 2 - 3), size: Math.round(sh * 0.34), font: HANJA_FONT, color: P.sealInk, anchor: 'middle', seal: true });
    items.push({ t: b, x: cx, y: Math.round(sy + sh / 2 - 3 + g + 4), size: Math.round(sh * 0.34), font: HANJA_FONT, color: P.sealInk, anchor: 'middle', seal: true });
  }
  if (d.done) items.push({ t: '成就', x: 150, y: L.badge + 5, size: 15, font: HANJA_FONT, color: '#fff6e6', anchor: 'middle', badge: true });
  return items;
}

/** 작은 난수(같은 글이면 같은 종이 결) */
function rng(seed) { let s = 2166136261; for (const c of String(seed)) s = Math.imul(s ^ c.charCodeAt(0), 16777619); return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296; }
const escX = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let uid = 0;

/** 종이 그림 주소(그림이 들어오면 그림 종이, 없으면 코드 종이) */
// v2(일러스트 부적 카드, docs/prompts/paid-charm-v2.md) gold2·red2가 있으면 먼저 씀
const paperId = (kind) => { const b = kind === 'burn' ? 'red' : 'gold'; return PAID_PAPERS?.[`${b}2`] ? `${b}2` : PAID_PAPERS?.[b] ? b : null; };
export const paperImage = (kind) => { const id = paperId(kind); return id ? `assets/paidcharm/${id}.webp` : null; };
/** v2 그림 종이(테두리·모서리 장식이 그림에 있음)면 true → 코드 장식은 구분선·반짝임만 */
export const isArtPaper = (kind) => /2$/.test(paperId(kind) || '');

/** 금박 색 띠(어두운 금 → 밝은 금 → 흰 빛 → 금): 테두리·장식에 빛이 도는 느낌 */
export const GOLD_STOPS = [[0, '#8a5a12'], [0.22, '#e9c25a'], [0.42, '#fff3c4'], [0.6, '#d9a83a'], [0.8, '#f7e08a'], [1, '#9a6a1f']];

/** 모서리 구름무늬 한 조각(왼쪽 위 기준) */
const CORNER = (M) => `<path d="M14 70 V26 Q14 14 26 14 H70" fill="none" stroke="${M}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M22 58 V32 Q22 22 32 22 H58" fill="none" stroke="${M}" stroke-width="1.1" opacity="0.9"/>
  <path d="M30 46 q0 -16 16 -16 q10 0 10 9 q0 7 -7 7 q-5 0 -5 -5 q0 -3 3 -3" fill="none" stroke="${M}" stroke-width="2" stroke-linecap="round"/>
  <path d="M36 62 q-8 0 -8 -8" fill="none" stroke="${M}" stroke-width="1.6" stroke-linecap="round"/><path d="M62 36 q0 -8 -8 -8" fill="none" stroke="${M}" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="14" cy="14" r="4.2" fill="${M}"/><circle cx="70" cy="14" r="2.2" fill="${M}"/><circle cx="14" cy="70" r="2.2" fill="${M}"/>`;
/** 작은 구름(제목 양옆) */
const CLOUD = (M, fill) => `<path d="M-20 4 q-6 0 -6 -6 q0 -6 7 -6 q2 -8 11 -7 q5 -7 13 -2 q8 -2 10 6 q7 1 6 8 q-1 6 -7 6 z" fill="${fill}" stroke="${M}" stroke-width="1.4"/>
  <path d="M-12 -3 q3 -4 7 -1 M3 -4 q4 -3 7 1" fill="none" stroke="${M}" stroke-width="1.1" stroke-linecap="round"/>`;
/** 가운데 장식 구분선(마름모 + 점, 양끝은 가늘게) */
const DIVIDER = (M, y) => `<path d="M58 ${y} Q100 ${y - 1.4} 136 ${y}" fill="none" stroke="${M}" stroke-width="1.4"/><path d="M164 ${y} Q200 ${y - 1.4} 242 ${y}" fill="none" stroke="${M}" stroke-width="1.4"/>
  <path d="M150 ${y - 7} l7 7 l-7 7 l-7 -7z" fill="${M}"/><path d="M150 ${y - 3.2} l3.2 3.2 l-3.2 3.2 l-3.2 -3.2z" fill="#fff8e0" opacity="0.85"/>
  <circle cx="139" cy="${y}" r="1.8" fill="${M}"/><circle cx="161" cy="${y}" r="1.8" fill="${M}"/><circle cx="56" cy="${y}" r="1.4" fill="${M}"/><circle cx="244" cy="${y}" r="1.4" fill="${M}"/>`;
/** 반짝이는 별(네 갈래) */
const TWINKLE = (M, x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6 Q0.9 -0.9 6 0 Q0.9 0.9 0 6 Q-0.9 0.9 -6 0 Q-0.9 -0.9 0 -6z" fill="${M}"/>`;

/** 금박 장식 한 벌: 이중 테두리 · 모서리 구름무늬 · 연꽃 문양(글 뒤에 은은하게) · 제목 옆 구름 · 구분선 · 반짝임 */
function ornamentSVG(P, M, kind, lite = false, L = LAYOUTS.base) {
  const lotusOp = kind === 'burn' ? 0.2 : 0.24;
  const petals = Array.from({ length: 12 }, (_, i) => `<path transform="rotate(${i * 30} 150 238)" d="M150 238 Q138 196 150 160 Q162 196 150 238z" fill="none" stroke="${M}" stroke-width="1.2"/>`).join('');
  const petals2 = Array.from({ length: 12 }, (_, i) => `<path transform="rotate(${i * 30 + 15} 150 238)" d="M150 238 Q143 212 150 190 Q157 212 150 238z" fill="${M}" opacity="0.5"/>`).join('');
  const cx = Math.max(44, Math.round(150 - P.sub.length * 7.6 - 26)); // 부제 길이에 맞춰 구름을 바깥으로
  const cloudFill = kind === 'burn' ? 'rgba(120, 25, 14, 0.55)' : 'rgba(255, 248, 224, 0.75)';
  if (lite) return `<g class="pc-orn lite">${DIVIDER(M, L.div1)}${DIVIDER(M, L.div2)}${TWINKLE(M, 96, L.div1 + 26, 0.8)}${TWINKLE(M, 206, L.div2 - 22, 1)}</g>`;
  return `<g class="pc-orn">
    <g opacity="${lotusOp}"><circle cx="150" cy="238" r="96" fill="none" stroke="${M}" stroke-width="1.4"/><circle cx="150" cy="238" r="88" fill="none" stroke="${M}" stroke-width="0.8" stroke-dasharray="2 4"/>${petals}${petals2}<circle cx="150" cy="238" r="10" fill="none" stroke="${M}" stroke-width="1.4"/></g>
    <rect x="8" y="8" width="284" height="464" rx="5" fill="none" stroke="${M}" stroke-width="4.5"/>
    <rect x="8" y="8" width="284" height="464" rx="5" fill="none" stroke="#fff6d0" stroke-width="0.8" opacity="0.55"/>
    <rect x="20" y="20" width="260" height="440" rx="3" fill="none" stroke="${M}" stroke-width="1.2"/>
    <rect x="25" y="25" width="250" height="430" rx="2" fill="none" stroke="${P.line}" stroke-width="0.8" opacity="0.55" stroke-dasharray="1 3"/>
    <rect x="14" y="14" width="272" height="452" rx="4" fill="none" stroke="${M}" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="0.1 6"/>
    <g transform="scale(0.8)">${CORNER(M)}</g><g transform="matrix(-0.8 0 0 0.8 300 0)">${CORNER(M)}</g>
    <g transform="matrix(0.8 0 0 -0.8 0 480)">${CORNER(M)}</g><g transform="matrix(-0.8 0 0 -0.8 300 480)">${CORNER(M)}</g>
    <g transform="translate(${cx} 92) scale(0.62)">${CLOUD(M, cloudFill)}</g><g transform="matrix(-0.62 0 0 0.62 ${300 - cx} 92)">${CLOUD(M, cloudFill)}</g>
    ${DIVIDER(M, 112)}${DIVIDER(M, 352)}
    ${TWINKLE(M, 86, 146, 0.9)}${TWINKLE(M, 222, 322, 1.1)}${TWINKLE(M, 236, 150, 0.6)}${TWINKLE(M, 70, 316, 0.6)}
  </g>`;
}

/**
 * 유료 부적 SVG. opts.noText = 글자 없이(배경화면 캔버스가 글자를 따로 씀), opts.paperSrc = 종이 그림 주소(data URL 가능)
 */
export function paidCharmSVG(d, opts = {}) {
  const P = PAPER[d.kind] || PAPER.wish; const id = `pc${++uid}`; const r = rng(`${d.kind}|${d.text}|${d.madeKey}`);
  const src = opts.paperSrc !== undefined ? opts.paperSrc : paperImage(d.kind);
  const art = !!src && (opts.artPaper ?? d.art ?? isArtPaper(d.kind)); d = { ...d, art }; const L = layoutOf(d);
  let fiber = ''; let flake = '';
  if (!src) {
    for (let i = 0; i < 46; i++) {
      const x = r() * 300; const y = r() * 480; const len = 20 + r() * 60; const a = (r() - 0.5) * 1.2;
      fiber += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} q${(len / 2).toFixed(1)} ${(a * 8).toFixed(1)} ${len.toFixed(1)} ${(a * 4).toFixed(1)}"/>`;
    }
    for (let i = 0; i < 30; i++) {
      const x = 14 + r() * 272; const y = 14 + r() * 452; const s = 1.2 + r() * 3.2;
      flake += `<path d="M${x.toFixed(1)} ${(y - s).toFixed(1)} l${s.toFixed(1)} ${s.toFixed(1)} l${(-s * 0.6).toFixed(1)} ${s.toFixed(1)} l${(-s).toFixed(1)} ${(-s * 0.7).toFixed(1)}z" opacity="${(0.35 + r() * 0.45).toFixed(2)}"/>`;
    }
  }
  const items = charmLayout(d);
  const hasSeal = items.some((x) => x.seal);
  const text = opts.noText ? '' : items.map((x) => `<text x="${x.x}" y="${x.y}" font-size="${x.size}" fill="${x.color}" text-anchor="${x.anchor}" font-family="${escX(x.font)}"${x.weight ? ` font-weight="${x.weight}"` : ''}${x.spacing ? ` letter-spacing="${x.spacing}"` : ''}${x.stroke ? ` stroke="${x.stroke}" stroke-width="${x.strokeW}" paint-order="stroke" stroke-linejoin="round"` : ''}>${escX(x.t)}</text>`).join('');
  const [sx, sy, sw, sh] = L.seal;
  const seal = hasSeal ? `<g class="pc-seal"><rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="6" fill="${P.seal}"/><rect x="${sx + 5}" y="${sy + 5}" width="${sw - 10}" height="${sh - 10}" rx="3" fill="none" stroke="${P.sealInk}" stroke-width="1.6" opacity="0.8"/></g>` : '';
  const badge = d.done ? `<circle cx="150" cy="${L.badge}" r="21" fill="#c9962c" stroke="#fff3c4" stroke-width="2"/>` : '';
  const paper = src
    ? `<image href="${escX(src)}" x="0" y="0" width="300" height="480" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect width="300" height="480" fill="url(#${id}g)"/><g fill="none" stroke="${P.fiber}" stroke-width="0.8">${fiber}</g><g fill="${P.flake}">${flake}</g>`;
  const M = `url(#${id}m)`; // 금박(빛 도는 금색)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 480" width="${CHARM_W}" height="${CHARM_H}" class="paid-charm pc-${d.kind}" role="img" aria-label="${escX(P.sub)}">
    <defs><linearGradient id="${id}g" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${P.stops[0]}"/><stop offset="0.55" stop-color="${P.stops[1]}"/><stop offset="1" stop-color="${P.stops[2]}"/></linearGradient>
      <linearGradient id="${id}m" x1="0" y1="0" x2="1" y2="1">${GOLD_STOPS.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>
      <linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fffbe6" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <clipPath id="${id}c"><rect width="300" height="480" rx="4"/></clipPath></defs>
    ${paper}
    ${ornamentSVG(P, M, d.kind, art, L)}
    <g clip-path="url(#${id}c)"><rect class="pc-sheen" x="-150" y="-60" width="90" height="600" fill="url(#${id}s)" transform="translate(-200 0) rotate(18)"/></g>
    ${seal}${badge}${text}
  </svg>`;
}

// ---------- B 의식 ----------
export const RITUAL_STEPS = [
  { key: 'ink', icon: '🪨', title: '먹 갈기', tip: '벼루 위를 손가락으로 빙글빙글 문질러 먹을 갈아 주세요.' },
  { key: 'trace', icon: '🖌️', title: '이름 따라 쓰기', tip: '흐린 글자를 손가락으로 따라 써 주세요.' },
  { key: 'seal', icon: '🔴', title: '도장 찍기', tip: '인장을 꾹 눌러 찍어 주세요.' },
  { key: 'blow', icon: '✨', title: '기운 불어넣기', tip: '지신이 부적에 기운을 불어넣고 있어요.' },
];
export const INK_NEED = 1400;   // 먹 갈기: 문지른 거리(px)
export const TRACE_NEED = 220;  // 이름 따라 쓰기: 그은 거리(px)
export const SEAL_HOLD = 450;   // 도장: 누르고 있는 시간(ms)
export const STAMP_BUZZ = [18, 40, 70]; // 도장 찍을 때 진동(소리는 없음)
export const inkShare = (dist) => Math.max(0, Math.min(1, dist / INK_NEED));
/** 따라 쓸 글: 이름(앞 4자) 없으면 「소원」 */
export const traceText = (name) => (String(name || '').trim().slice(0, 4) || '소원');

// ---------- 걱정 씨앗(태우기 끝 장면 · 7일 뒤 안부) — 걱정 글은 저장하지 않음 ----------
export const SEED_ASK_DAYS = 7;
export const SEED_MAX = 30;
const dayNum = (k) => { const [y, m, d] = String(k).split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
export const daysBetween = (a, b) => Math.round(dayNum(b) - dayNum(a));
export const emptySeeds = () => ({ list: [] });
/** 씨앗 하나 심기: 날짜와 기운 번호만 */
export function plantSeed(store, dateKey, element) {
  const s = { ...emptySeeds(), ...(store || {}) };
  const seed = { at: dateKey, el: Number.isInteger(element) ? element : null, answer: null };
  return { ...s, list: [seed, ...(s.list || [])].slice(0, SEED_MAX) };
}
/** 오늘 안부를 물을 씨앗(7일 넘은 것 중 가장 오래된, 답하지 않은 것) — 칸 번호 또는 -1 */
export function seedToAsk(store, today) {
  const list = store?.list || []; let best = -1;
  list.forEach((x, i) => { if (!x.answer && daysBetween(x.at, today) >= SEED_ASK_DAYS && (best < 0 || dayNum(x.at) < dayNum(list[best].at))) best = i; });
  return best;
}
export function answerSeed(store, i, answer, today) {
  const list = (store?.list || []).map((x, j) => (j === i ? { ...x, answer, answeredAt: today } : x));
  return { ...emptySeeds(), ...(store || {}), list };
}
/** 씨앗 → 새싹 → 꽃(가벼워졌다고 답한 씨앗) */
export function seedStage(seed, today) {
  if (seed.answer === 'light') return { icon: '🌷', label: '꽃' };
  if (daysBetween(seed.at, today) >= SEED_ASK_DAYS) return { icon: '🌱', label: '새싹' };
  return { icon: '🌰', label: '씨앗' };
}

// ---------- 지신의 말(닭띠 존댓말) — 무섭거나 꾸짖는 말 없음 ----------
const L = {
  blow: ['후— 내 기운을 불어넣었어. 「{w}」, {d}에 내가 먼저 물어볼게.', '후— 제 기운을 불어넣었어요. 「{w}」, {d}에 제가 먼저 여쭤볼게요.'],
  mid: ['소원 부적 빛이 조금 진해졌어. 「{w}」, 반쯤 왔어.', '소원 부적 빛이 조금 진해졌어요. 「{w}」, 반쯤 왔어요.'],
  seed: ['걱정이 탄 자리에 이게 남았어. 작은 씨앗이야, 내가 잘 키워 둘게.', '걱정이 탄 자리에 이게 남았어요. 작은 씨앗이에요, 제가 잘 키워 둘게요.'],
  seedAsk: ['일주일 전에 심은 씨앗에서 새싹이 났어. 요즘 마음은 좀 가벼워졌어?', '일주일 전에 심은 씨앗에서 새싹이 났어요. 요즘 마음은 좀 가벼워지셨어요?'],
  light: ['다행이다. 새싹에 꽃이 피었어. 정원에 잘 심어 둘게.', '다행이에요. 새싹에 꽃이 피었어요. 정원에 잘 심어 둘게요.'],
  heavy: ['그럴 수 있어. 무거운 마음은 천천히 내려놓아도 돼. 내가 옆에 있을게.', '그럴 수 있어요. 무거운 마음은 천천히 내려놓아도 돼요. 제가 옆에 있을게요.'],
};
const fillL = (s, w, d) => s.replace('{w}', w || '').replace('{d}', d || '');
export const ritualLine = (key, polite, w, d) => fillL(L[key][polite ? 1 : 0], w, d);
export const ALL_LINES = Object.values(L).flat();

/** E 결제 창: 받는 것 4줄 */
export const PAY_GETS = {
  wish: ['✨ 금박 한지에 담는 세상에 하나뿐인 소원 부적', '🖌️ 내 소원을 붓글씨로 · 이름·만든 날·지신 인장', '📱 휴대폰 배경화면(고화질 9:16) 저장', '🌠 중간에 한 번, 그날 한 번 지신이 먼저 물어봐요'],
  lantern: ['🏮 소원 부적 + 홈에 100일 등불이 켜져요', '🙏 지신이 100일 동안 매일 다른 한 줄로 빌어 줘요', '💌 25·50·75일째 지신의 편지, 10일마다 등불이 밝아져요', '👪 가족·소중한 사람을 위한 소원도 OK · 100일째 금빛 액자'],
  burn: ['🔥 붉은 한지에 걱정을 붓글씨로 적어 태워요', '🌱 다 탄 재는 지신이 작은 씨앗으로 바꿔 줘요', '💬 7일 뒤 「요즘 마음은 좀 가벼워졌어?」 안부', '🔒 적은 걱정은 어디에도 저장하지 않아요'],
};

// ---------- D 배경화면(9:16) — 브라우저 전용 ----------
/** 부적을 배경화면 캔버스에 그림: 종이(SVG 그림, 글자 없이) → 글자(웹 글꼴) */
export async function drawWallpaper(canvas, d, { paperSrc, title = '12지신 강림' } = {}) {
  canvas.width = WALL_W; canvas.height = WALL_H;
  const ctx = canvas.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, WALL_H);
  if (d.kind === 'burn') { bg.addColorStop(0, '#2a1512'); bg.addColorStop(1, '#4a1d16'); } else { bg.addColorStop(0, '#1f2740'); bg.addColorStop(1, '#2f3e5c'); }
  ctx.fillStyle = bg; ctx.fillRect(0, 0, WALL_W, WALL_H);
  const r = rng(`wall|${d.text}|${d.madeKey}`);
  for (let i = 0; i < 90; i++) { ctx.globalAlpha = 0.25 + r() * 0.5; ctx.fillStyle = '#f3d27a'; const s = 1 + r() * 3; ctx.fillRect(r() * WALL_W, r() * WALL_H, s, s); }
  ctx.globalAlpha = 1;
  try { await Promise.all([`60px ${BRUSH_FONT}`, `30px ${HANJA_FONT}`, `30px ${TEXT_FONT}`].map((f) => document.fonts?.load?.(f))); } catch { /* 글꼴 없으면 기본 글꼴 */ }
  const S = 2.5; const X = (WALL_W - CHARM_W * S) / 2; const Y = 470;
  d = { ...d, art: !!paperSrc && isArtPaper(d.kind) };
  const svg = paidCharmSVG(d, { noText: true, paperSrc });
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image(); await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    ctx.save(); ctx.shadowColor = d.kind === 'burn' ? 'rgba(255, 140, 60, 0.55)' : 'rgba(243, 210, 122, 0.6)'; ctx.shadowBlur = 60;
    ctx.drawImage(img, X, Y, CHARM_W * S, CHARM_H * S); ctx.restore();
  } finally { URL.revokeObjectURL(url); }
  for (const it of charmLayout(d)) {
    ctx.font = `${it.weight || 400} ${it.size * S}px ${it.font}`; ctx.fillStyle = it.color;
    ctx.textAlign = it.anchor === 'middle' ? 'center' : it.anchor === 'end' ? 'right' : 'left'; ctx.textBaseline = 'alphabetic';
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${(it.spacing || 0) * S}px`;
    if (it.stroke) { ctx.strokeStyle = it.stroke; ctx.lineWidth = it.strokeW * S; ctx.lineJoin = 'round'; ctx.strokeText(it.t, X + it.x * S, Y + it.y * S); }
    ctx.fillText(it.t, X + it.x * S, Y + it.y * S);
  }
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(251, 242, 226, 0.85)';
  ctx.font = `600 34px ${TEXT_FONT}`;
  if (d.done) ctx.fillText(`🌟 소원 성취 · ${dotDate(d.doneKey)}`, WALL_W / 2, Y + CHARM_H * S + 110);
  ctx.font = `28px ${TEXT_FONT}`; ctx.fillStyle = 'rgba(251, 242, 226, 0.55)';
  ctx.fillText(title, WALL_W / 2, WALL_H - 90);
  return canvas;
}
