// 인스타그램 스토리 공유 카드 (1080 × 1920)
// 캔버스에 직접 그려서 페이지에 로드된 웹 폰트를 그대로 쓴다.
// 부적·이모티콘은 기존 SVG를 이미지로 얹는다.
import { CATEGORIES } from './fortune.js';
import { ELEMENT_KO, ELEMENT_HANJA, STEM_ELEMENT, STEMS } from './saju.js';
import { renderTalismanSVG } from './talisman.js';
import { renderCharacterSVG, characterStats } from './character.js';
import { renderCompatSVG } from './compat.js';

export const STORY_W = 1080;
export const STORY_H = 1920;

export const STORY_TEMPLATES = [
  { key: 'fortune', label: '오늘의 운세' },
  { key: 'charm', label: '오늘의 부적' },
  { key: 'hero', label: '수호 캐릭터' },
  { key: 'compat', label: '친구 궁합' },
  { key: 'evolve', label: '진화 인증' },
];

const EL_COLORS = ['#39FF88', '#FF2E63', '#FFC93C', '#E0E0FF', '#00E5FF'];
const SANS = "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif";
const SERIF = "'Song Myung', 'Nanum Myeongjo', serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

const scoreColor = (v) => (v >= 80 ? '#39FF88' : v >= 60 ? '#00E5FF' : v >= 40 ? '#FFC93C' : '#FF2E63');

function svgToImage(svg) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

/** 카드에 쓰는 글자가 담긴 웹 폰트 조각을 미리 불러온다 */
async function ensureFonts(text) {
  if (!document.fonts?.load) return;
  const specs = [`800 64px 'Noto Sans KR'`, `400 40px 'Noto Sans KR'`, `400 64px 'Song Myung'`, `700 32px 'JetBrains Mono'`];
  try {
    await Promise.all(specs.map((s) => document.fonts.load(s, text)));
  } catch { /* 폰트를 못 불러와도 기본 글꼴로 그린다 */ }
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else {
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
}

function glowText(ctx, text, x, y, { font, color = '#fff', glow = null, align = 'left', blur = 24 }) {
  ctx.save();
  ctx.font = font; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = blur; }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** 한글 문장을 폭에 맞춰 줄바꿈 (글자 단위, 공백 우선) */
function wrap(ctx, text, maxW) {
  const lines = []; let line = '';
  for (const word of text.split(/(\s+)/)) {
    const test = line + word;
    if (ctx.measureText(test).width <= maxW) { line = test; continue; }
    if (line.trim()) lines.push(line.trim());
    line = '';
    for (const ch of word.trimStart()) {
      if (ctx.measureText(line + ch).width > maxW) { lines.push(line); line = ch; } else line += ch;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function background(ctx, accent) {
  const g = ctx.createLinearGradient(0, 0, STORY_W, STORY_H);
  g.addColorStop(0, '#120a2e'); g.addColorStop(0.55, '#07060f'); g.addColorStop(1, '#021a24');
  ctx.fillStyle = g; ctx.fillRect(0, 0, STORY_W, STORY_H);

  const blob = (x, y, r, c) => {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, c); rg.addColorStop(1, 'transparent');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, STORY_W, STORY_H);
  };
  blob(900, 160, 620, 'rgba(120,60,255,0.35)');
  blob(120, 1780, 620, 'rgba(0,229,255,0.22)');
  blob(540, 900, 520, `${accent}22`);

  ctx.save();
  ctx.strokeStyle = 'rgba(0,229,255,0.06)'; ctx.lineWidth = 2;
  for (let x = 0; x <= STORY_W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, STORY_H); ctx.stroke(); }
  for (let y = 0; y <= STORY_H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(STORY_W, y); ctx.stroke(); }
  ctx.restore();

  // 네온 테두리
  ctx.save();
  const bg = ctx.createLinearGradient(0, 0, STORY_W, STORY_H);
  bg.addColorStop(0, '#00E5FF'); bg.addColorStop(0.5, '#8a7dff'); bg.addColorStop(1, '#FF2E63');
  ctx.strokeStyle = bg; ctx.lineWidth = 6; ctx.shadowColor = '#00E5FF'; ctx.shadowBlur = 30;
  rr(ctx, 36, 36, STORY_W - 72, STORY_H - 72, 48); ctx.stroke();
  ctx.restore();
}

function header(ctx, { fortune, profile }) {
  // 상단 140px은 인스타 프로필 영역이라 비워 둔다
  ctx.save();
  ctx.strokeStyle = '#FF2E63'; ctx.lineWidth = 5; ctx.shadowColor = '#FF2E63'; ctx.shadowBlur = 20;
  rr(ctx, 90, 190, 96, 96, 24); ctx.stroke();
  ctx.restore();
  glowText(ctx, '符', 138, 262, { font: `64px ${SERIF}`, align: 'center', glow: '#FF2E63' });
  glowText(ctx, '12지신', 214, 248, { font: `800 52px ${SANS}` });
  ctx.font = `800 52px ${SANS}`;
  const brandW = ctx.measureText('12지신').width;
  glowText(ctx, '강림', 214 + brandW + 18, 248, { font: `800 52px ${SANS}`, color: '#00E5FF', glow: '#00E5FF' });
  const d = fortune.date;
  glowText(ctx, `${d.year}.${String(d.month).padStart(2, '0')}.${String(d.day).padStart(2, '0')}`, 990, 236, { font: `700 34px ${MONO}`, color: '#9a94c4', align: 'right' });
  const who = profile.name ? `${profile.name}님의 오늘` : '나의 오늘';
  glowText(ctx, who, 990, 280, { font: `400 30px ${SANS}`, color: '#9a94c4', align: 'right' });
}

function footer(ctx, { url, accent }) {
  // 하단 300px은 인스타 답장창 영역이라 CTA를 그 위에 둔다
  const y = 1500;
  ctx.save();
  rr(ctx, 90, y, 900, 170, 36);
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill();
  ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.shadowColor = accent; ctx.shadowBlur = 24; ctx.stroke();
  ctx.restore();
  glowText(ctx, '나도 오늘의 부적 받기 ✦', 540, y + 76, { font: `800 50px ${SANS}`, align: 'center', glow: accent, blur: 18 });
  glowText(ctx, url, 540, y + 130, { font: `400 30px ${MONO}`, color: '#9a94c4', align: 'center' });
  glowText(ctx, '※ 효과 수치는 재미를 위한 게임 요소입니다', 540, 1730, { font: `400 26px ${SANS}`, color: 'rgba(154,148,196,0.7)', align: 'center' });
}

function scoreRing(ctx, cx, cy, r, score) {
  const c = scoreColor(score);
  ctx.save();
  ctx.lineWidth = 34; ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 40;
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score) / 100); ctx.stroke();
  ctx.restore();
  glowText(ctx, String(score), cx, cy + 50, { font: `700 160px ${MONO}`, align: 'center', glow: c });
  glowText(ctx, '오늘 총운', cx, cy + 112, { font: `400 34px ${SANS}`, color: '#9a94c4', align: 'center' });
}

function chips(ctx, items, y) {
  ctx.font = `600 34px ${SANS}`;
  const pad = 34; const gap = 18;
  const widths = items.map((t) => ctx.measureText(t.text).width + pad * 2 + (t.dot ? 40 : 0));
  let x = (STORY_W - (widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1))) / 2;
  items.forEach((t, i) => {
    ctx.save();
    rr(ctx, x, y, widths[i], 76, 38);
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill();
    ctx.strokeStyle = 'rgba(160,140,255,0.35)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
    let tx = x + pad;
    if (t.dot) {
      ctx.save(); ctx.fillStyle = t.dot; ctx.shadowColor = t.dot; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(tx + 12, y + 38, 12, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      tx += 40;
    }
    glowText(ctx, t.text, tx, y + 50, { font: `600 34px ${SANS}` });
    x += widths[i] + gap;
  });
}

// ---------- 템플릿 ----------

async function drawFortune(ctx, d) {
  const { fortune: f } = d;
  scoreRing(ctx, 540, 560, 190, f.scores.total);

  ctx.font = `800 64px ${SANS}`;
  glowText(ctx, f.info.title, 540, 870, { font: `800 64px ${SANS}`, align: 'center', glow: '#8a7dff', blur: 20 });
  ctx.font = `400 34px ${SANS}`;
  wrap(ctx, f.info.desc, 820).slice(0, 2).forEach((line, i) => {
    glowText(ctx, line, 540, 935 + i * 50, { font: `400 34px ${SANS}`, color: '#cfcaf2', align: 'center' });
  });

  // 분야별 막대
  const cats = CATEGORIES.slice(1);
  cats.forEach((c, i) => {
    const y = 1065 + i * 62;
    const v = f.scores[c.key]; const col = scoreColor(v);
    glowText(ctx, `${c.icon} ${c.label}`, 150, y + 12, { font: `600 32px ${SANS}`, color: '#ece9ff' });
    ctx.save();
    rr(ctx, 420, y - 12, 440, 22, 11); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill();
    rr(ctx, 420, y - 12, Math.max(22, 440 * v / 100), 22, 11); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.fill();
    ctx.restore();
    glowText(ctx, String(v), 930, y + 12, { font: `700 34px ${MONO}`, color: col, align: 'right' });
  });

  chips(ctx, [
    { text: `행운색 ${f.luck.color}`, dot: f.luck.hex },
    { text: `숫자 ${f.luck.number}` },
    { text: f.luck.direction },
  ], 1388);
}

async function drawCharm(ctx, d) {
  const t = d.talisman;
  const img = await svgToImage(renderTalismanSVG(t));
  const w = 520; const h = w * (540 / 300);
  const x = (STORY_W - w) / 2; const y = 330;
  ctx.save();
  ctx.shadowColor = t.rarity.color; ctx.shadowBlur = 60;
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
  glowText(ctx, `[${t.rarity.label}] ${t.type.label} 부적 · ${t.type.hanja}`, 540, 1330, { font: `800 46px ${SANS}`, align: 'center', glow: t.rarity.color, blur: 16 });
  const main = t.effects[0];
  chips(ctx, [
    { text: `${main.stat} ${main.value > 0 ? '+' : ''}${main.value}%`, dot: EL_COLORS[t.element] },
    { text: `${ELEMENT_KO[t.element]}(${ELEMENT_HANJA[t.element]}) 기운 보충` },
  ], 1378);
}

async function drawHero(ctx, d) {
  const { fortune: f } = d;
  const { info, charms, mood, emote, stage } = d.hero;
  const img = await svgToImage(renderCharacterSVG(info, { mood, charms, emote, stage, width: 640 }));
  const w = 640; const h = 800;
  ctx.save();
  ctx.shadowColor = EL_COLORS[info.element]; ctx.shadowBlur = 50;
  ctx.drawImage(img, (STORY_W - w) / 2, 310, w, h);
  ctx.restore();
  glowText(ctx, info.title, 540, 1172, { font: `800 54px ${SANS}`, align: 'center', glow: EL_COLORS[info.element], blur: 18 });
  if (d.hero.quote) {
    ctx.font = `600 32px ${SANS}`;
    const lines = wrap(ctx, `“${d.hero.quote}”`, 840).slice(0, 2);
    lines.forEach((line, i) => glowText(ctx, line, 540, 1232 + i * 44, { font: `600 32px ${SANS}`, color: '#ffe39a', align: 'center' }));
  } else {
    glowText(ctx, `${info.zodiac.name}띠 · ${f.info.title} · 총운 ${f.scores.total}점`, 540, 1236, { font: `400 34px ${SANS}`, color: '#cfcaf2', align: 'center' });
  }
  const equipped = charms.filter(Boolean);
  const stats = characterStats(d.saju, f, info, charms);
  chips(ctx, [
    { text: `${stats.concern.label} ${stats.concern.value}`, dot: EL_COLORS[info.element] },
    equipped.length ? { text: `부적 ${equipped.length}개 장착`, dot: equipped[0].rarity.color } : { text: `행운색 ${f.luck.color}`, dot: f.luck.hex },
  ], 1330);
}

async function drawEvolve(ctx, d) {
  const { info, charms, emote, stage } = d.hero;
  const img = await svgToImage(renderCharacterSVG(info, { mood: 'excited', charms, emote, stage, width: 720, backdrop: true }));
  ctx.save();
  rr(ctx, 120, 320, 840, 1050, 48); ctx.clip();
  ctx.drawImage(img, 120, 320, 840, 1050);
  ctx.restore();
  ctx.save(); ctx.strokeStyle = '#ffc93c'; ctx.lineWidth = 6; ctx.shadowColor = '#ffc93c'; ctx.shadowBlur = 30; rr(ctx, 120, 320, 840, 1050, 48); ctx.stroke(); ctx.restore();
  glowText(ctx, `🐉 ${d.hero.stageName}(으)로 진화!`, 540, 1290, { font: `900 60px ${SANS}`, align: 'center', glow: '#ffc93c', blur: 24 });
  glowText(ctx, stage >= 5 ? `${d.hero.year}년 운 최고점 도달 ✦` : `진화 ${stage}단계 · 신수까지 함께 키워요`, 540, 1350, { font: `700 38px ${SANS}`, color: '#ffe39a', align: 'center' });
  glowText(ctx, `${info.title}`, 540, 1410, { font: `400 32px ${SANS}`, color: '#cfcaf2', align: 'center' });
}

async function drawCompat(ctx, d) {
  const c = d.compat;
  const svg = renderCompatSVG(c.myInfo, c.friendInfo, c.compat, { myName: c.myName, friendName: c.friendName, myStage: c.myStage, myCharms: c.myCharms });
  const img = await svgToImage(svg);
  const w = 960; const h = 720;
  ctx.save();
  ctx.shadowColor = c.compat.grade.color; ctx.shadowBlur = 50;
  rr(ctx, 60, 330, w, h, 40); ctx.clip();
  ctx.drawImage(img, 60, 330, w, h);
  ctx.restore();
  glowText(ctx, `${c.myName} × ${c.friendName}`, 540, 1130, { font: `800 56px ${SANS}`, align: 'center', glow: c.compat.grade.color, blur: 18 });
  ctx.font = `400 34px ${SANS}`;
  if (c.dialogue) {
    ctx.font = `600 30px ${SANS}`;
    const [a, b] = c.dialogue.lines;
    const la = wrap(ctx, `${c.myInfo.zodiac.name}: “${a.text}”`, 900)[0];
    const lb = wrap(ctx, `${c.friendInfo.zodiac.name}: “${b.text}”`, 900)[0];
    glowText(ctx, la, 540, 1194, { font: `600 30px ${SANS}`, color: '#ffe39a', align: 'center' });
    glowText(ctx, lb, 540, 1240, { font: `600 30px ${SANS}`, color: '#bfe9ff', align: 'center' });
  } else {
    wrap(ctx, c.compat.grade.desc, 860).slice(0, 2).forEach((line, i) => glowText(ctx, line, 540, 1196 + i * 48, { font: `400 34px ${SANS}`, color: '#cfcaf2', align: 'center' }));
  }
  chips(ctx, [
    { text: `연애 ${c.compat.sub.love}`, dot: '#ff4d8d' },
    { text: `우정 ${c.compat.sub.friend}`, dot: '#39ff88' },
    { text: `일 ${c.compat.sub.work}`, dot: '#00e5ff' },
  ], 1310);
}

const DRAWERS = { fortune: drawFortune, charm: drawCharm, hero: drawHero, emoji: drawHero, compat: drawCompat, evolve: drawEvolve };

/**
 * @param d {saju, fortune, talisman, profile, template, url}
 * @returns HTMLCanvasElement (1080 × 1920)
 */
export async function renderStoryCanvas(d) {
  const canvas = document.createElement('canvas');
  canvas.width = STORY_W; canvas.height = STORY_H;
  const ctx = canvas.getContext('2d');
  const accent = d.template === 'evolve' ? '#ffc93c' : d.template === 'charm' ? d.talisman.rarity.color : d.template === 'hero' ? EL_COLORS[d.hero.info.element] : d.template === 'compat' ? d.compat.grade?.color || d.compat.compat.grade.color : '#00E5FF';

  await ensureFonts(`12지신강림나도오늘의부적받기✦※효과수치는재미를위한게임요소입니다${d.profile.name || ''}님의${d.fortune.info.title}${d.fortune.info.desc}${CATEGORIES.map((c) => c.label).join('')}총운행운색숫자${d.fortune.luck.color}${d.fortune.luck.direction}${d.talisman.type.label}${d.talisman.type.hanja}${d.talisman.effects.map((e) => e.stat).join('')}기운보충수호캐릭터${d.hero.info.title}${d.hero.info.concern.stat}띠개장착부적일간진화년운최고점도달단계신수까지함께키워요${d.hero.stageName || ''}연애우정일친구궁합×천생연분찰떡궁합든든한짝꿍티격태격케미밀당중인사이${d.compat ? d.compat.myName + d.compat.friendName + d.compat.compat.grade.desc + (d.compat.dialogue ? d.compat.dialogue.lines.map((l) => l.text).join('') + d.compat.myInfo.zodiac.name + d.compat.friendInfo.zodiac.name : '') : ''}${STEMS.join('')}일반희귀영웅전설신화목화토금수木火土金水符0123456789.:/[]+-%()`);

  background(ctx, accent);
  header(ctx, d);
  await DRAWERS[d.template](ctx, d);
  footer(ctx, { url: d.url, accent });
  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

/**
 * 휴대폰: 공유 시트(인스타그램 선택 가능) / PC: PNG 다운로드
 * @returns 'shared' | 'downloaded' | 'cancelled'
 */
export async function shareStory(canvas, { title, text, filename }) {
  const blob = await canvasToBlob(canvas);
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text });
      return 'shared';
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled';
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  return 'downloaded';
}
