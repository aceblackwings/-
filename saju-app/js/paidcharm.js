// v0.60 유료 부적(소원 부적 · 나쁜 기운 태우기 부적, 각 990원)을 「세상에 하나뿐인 부적」으로.
// A 전용 종이(금박 한지 · 붉은 한지) + 내 글을 붓글씨로 + 이름·만든 날·띠 지신 인장(생년월일 없음)
// B 직접 만드는 의식(먹 갈기 → 이름 따라 쓰기 → 도장 꾹(진동) → 지신이 기운 불어넣기)
// C 그 뒤의 이야기(소원: 중간에 「빛이 진해졌어」 · 태우기: 재가 씨앗으로, 7일 뒤 「마음은 좀 가벼워졌어?」)
// D 9:16 배경화면 저장
// 약속: 걱정 글은 저장하지 않는다(씨앗 기록에는 날짜·기운만). 운세 점수와는 무관.
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
  wish: { head: '所願成就', sub: '소원 부적', ink: '#2b2420', headInk: '#b8382a', subInk: '#7a5a26', seal: '#b8382a', sealInk: '#fff6e6', stops: ['#fbf0cf', '#f1d98f', '#e3bf63'], fiber: 'rgba(150, 105, 30, 0.2)', flake: '#c9962c', border: '#c18f2a', line: '#b8382a' },
  burn: { head: '消災降福', sub: '나쁜 기운 태우기 부적', ink: '#fff1d6', headInk: '#f3d27a', subInk: '#f6d9b0', seal: '#d9ab3d', sealInk: '#7e2418', stops: ['#cf4a32', '#a9321f', '#7c2216'], fiber: 'rgba(255, 220, 180, 0.14)', flake: '#e8c063', border: '#e8c063', line: '#f3d27a' },
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

/**
 * 부적 위 글자 배치(300×480 기준). SVG와 배경화면 캔버스가 같은 배치를 씀.
 * d = { kind: 'wish'|'burn', text, name, madeKey, dueKey, branch, done, doneKey, seal(기본 true) }
 * → [{ t, x, y, size, font, color, anchor, weight, spacing }]
 */
export function charmLayout(d) {
  const P = PAPER[d.kind] || PAPER.wish; const text = String(d.text || '').trim();
  const n = text.replace(/\s/g, '').length;
  const per = n <= 6 ? 6 : n <= 14 ? 7 : 8;
  const size = n <= 4 ? 52 : n <= 6 ? 46 : n <= 14 ? 40 : 33;
  const lines = text ? wrapLines(text, per).slice(0, 5) : [];
  const lh = size * 1.18; const mid = 238;
  const y0 = mid - ((lines.length - 1) * lh) / 2 + size * 0.34;
  const items = [
    { t: P.head, x: 150, y: 70, size: 32, font: HANJA_FONT, color: P.headInk, anchor: 'middle', spacing: 6 },
    { t: P.sub, x: 150, y: 96, size: 13, font: TEXT_FONT, color: P.subInk, anchor: 'middle', spacing: 2 },
    ...lines.map((t, i) => ({ t, x: 150, y: Math.round(y0 + i * lh), size, font: BRUSH_FONT, color: P.ink, anchor: 'middle' })),
  ];
  const who = d.name ? `${d.name} 님의 ${d.kind === 'burn' ? '걱정' : '소원'}` : `나의 ${d.kind === 'burn' ? '걱정' : '소원'}`;
  items.push({ t: who, x: 34, y: 386, size: 14, font: TEXT_FONT, color: P.subInk, anchor: 'start', weight: 700 });
  items.push({ t: `${dotDate(d.madeKey)} 지음`, x: 34, y: 408, size: 12, font: TEXT_FONT, color: P.subInk, anchor: 'start' });
  if (d.kind === 'wish' && d.dueKey) items.push({ t: `이루고 싶은 날 · ${monthDay(d.dueKey)}`, x: 34, y: 428, size: 12, font: TEXT_FONT, color: P.subInk, anchor: 'start' });
  if (d.seal !== false) {
    const [a, b] = sealChars(d.branch);
    items.push({ t: a, x: 246, y: 412, size: 21, font: HANJA_FONT, color: P.sealInk, anchor: 'middle', seal: true });
    items.push({ t: b, x: 246, y: 438, size: 21, font: HANJA_FONT, color: P.sealInk, anchor: 'middle', seal: true });
  }
  if (d.done) items.push({ t: '成就', x: 150, y: 132, size: 15, font: HANJA_FONT, color: '#fff6e6', anchor: 'middle', badge: true });
  return items;
}

/** 작은 난수(같은 글이면 같은 종이 결) */
function rng(seed) { let s = 2166136261; for (const c of String(seed)) s = Math.imul(s ^ c.charCodeAt(0), 16777619); return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296; }
const escX = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let uid = 0;

/** 종이 그림 주소(그림이 들어오면 그림 종이, 없으면 코드 종이) */
export const paperImage = (kind) => (PAID_PAPERS && PAID_PAPERS[kind === 'burn' ? 'red' : 'gold'] ? `assets/paidcharm/${kind === 'burn' ? 'red' : 'gold'}.webp` : null);

/**
 * 유료 부적 SVG. opts.noText = 글자 없이(배경화면 캔버스가 글자를 따로 씀), opts.paperSrc = 종이 그림 주소(data URL 가능)
 */
export function paidCharmSVG(d, opts = {}) {
  const P = PAPER[d.kind] || PAPER.wish; const id = `pc${++uid}`; const r = rng(`${d.kind}|${d.text}|${d.madeKey}`);
  const src = opts.paperSrc !== undefined ? opts.paperSrc : paperImage(d.kind);
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
  const text = opts.noText ? '' : items.map((x) => `<text x="${x.x}" y="${x.y}" font-size="${x.size}" fill="${x.color}" text-anchor="${x.anchor}" font-family="${escX(x.font)}"${x.weight ? ` font-weight="${x.weight}"` : ''}${x.spacing ? ` letter-spacing="${x.spacing}"` : ''}>${escX(x.t)}</text>`).join('');
  const seal = hasSeal ? `<g class="pc-seal"><rect x="214" y="390" width="64" height="62" rx="6" fill="${P.seal}"/><rect x="219" y="395" width="54" height="52" rx="3" fill="none" stroke="${P.sealInk}" stroke-width="1.6" opacity="0.8"/></g>` : '';
  const badge = d.done ? `<circle cx="150" cy="127" r="21" fill="#c9962c" stroke="#fff3c4" stroke-width="2"/>` : '';
  const paper = src
    ? `<image href="${escX(src)}" x="0" y="0" width="300" height="480" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect width="300" height="480" fill="url(#${id}g)"/><g fill="none" stroke="${P.fiber}" stroke-width="0.8">${fiber}</g><g fill="${P.flake}">${flake}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 480" width="${CHARM_W}" height="${CHARM_H}" class="paid-charm pc-${d.kind}" role="img" aria-label="${escX(P.sub)}">
    <defs><linearGradient id="${id}g" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${P.stops[0]}"/><stop offset="0.55" stop-color="${P.stops[1]}"/><stop offset="1" stop-color="${P.stops[2]}"/></linearGradient></defs>
    ${paper}
    <rect x="10" y="10" width="280" height="460" rx="4" fill="none" stroke="${P.border}" stroke-width="3"/>
    <rect x="18" y="18" width="264" height="444" rx="2" fill="none" stroke="${P.line}" stroke-width="1.2" opacity="0.85"/>
    <path d="M60 110 H240" stroke="${P.line}" stroke-width="1" opacity="0.6"/><path d="M60 352 H240" stroke="${P.line}" stroke-width="1" opacity="0.6"/>
    ${[[24, 24], [276, 24], [24, 456], [276, 456]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${P.border}"/>`).join('')}
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
