// 친구 궁합: 띠(연지) 관계 + 일간 오행 관계 + 오행 보완 + 오늘 기운
import { STEM_ELEMENT, ELEMENT_KO, ELEMENT_HANJA, ANIMALS, seededRandom, dayPillarIndex, pillarFromIndex } from './saju.js';
import { characterMarkup } from './character.js';

const mod = (n, m) => ((n % m) + m) % m;

const SAMHAP = [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]]; // 申子辰, 寅午戌, 巳酉丑, 亥卯未
const YUKHAP = new Set(['0-1', '2-11', '3-10', '4-9', '5-8', '6-7']);
const WONJIN = new Set(['0-7', '1-6', '2-9', '3-8', '4-11', '5-10']);
const STEM_HAP = new Set(['0-5', '1-6', '2-7', '3-8', '4-9']); // 甲己 乙庚 丙辛 丁壬 戊癸

const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

export function branchRelation(a, b) {
  if (a === b) return { type: 'same', label: '같은 띠', score: 6, text: '같은 띠라 말하지 않아도 통하는 사이' };
  if (SAMHAP.some((g) => g.includes(a) && g.includes(b))) return { type: 'samhap', label: '삼합(三合)', score: 20, text: '함께하면 힘이 세 배가 되는 최고의 띠 조합' };
  if (YUKHAP.has(key(a, b))) return { type: 'yukhap', label: '육합(六合)', score: 15, text: '서로 끌어당기는 자석 같은 띠 조합' };
  if (Math.abs(a - b) === 6) return { type: 'chung', label: '충(沖)', score: -10, text: '정반대라 부딪히지만 그만큼 자극이 되는 사이' };
  if (WONJIN.has(key(a, b))) return { type: 'wonjin', label: '원진(怨嗔)', score: -5, text: '가끔 서운함이 쌓이니 표현이 중요한 사이' };
  return { type: 'normal', label: '평이', score: 0, text: '무난하고 편안한 띠 조합' };
}

export function stemRelation(a, b) {
  const ea = STEM_ELEMENT[a]; const eb = STEM_ELEMENT[b];
  if (STEM_HAP.has(key(a, b))) return { type: 'hap', label: '천간합', score: 16, text: '서로의 일간이 짝을 이루는 천생 인연' };
  if (ea === eb) return { type: 'same', label: '같은 기운', score: 6, text: `둘 다 ${ELEMENT_KO[ea]}(${ELEMENT_HANJA[ea]}) 기운이라 닮은꼴` };
  if (mod(eb - ea, 5) === 1) return { type: 'give', label: '내가 도와주는 사이', score: 12, text: `내 ${ELEMENT_KO[ea]} 기운이 상대의 ${ELEMENT_KO[eb]} 기운을 살려 줌` };
  if (mod(ea - eb, 5) === 1) return { type: 'take', label: '상대가 도와주는 사이', score: 12, text: `상대의 ${ELEMENT_KO[eb]} 기운이 내 ${ELEMENT_KO[ea]} 기운을 살려 줌` };
  return { type: 'clash', label: '긴장감 있는 사이', score: -6, text: '기운이 서로 견제해 밀당이 생기는 사이' };
}

export const GRADES = [
  { min: 88, key: 'destiny', label: '천생연분', pose: 'hug', mood: ['love', 'love'], color: '#ff4d8d', desc: '하늘이 정해 준 인연! 함께 있으면 운이 두 배로 올라요.' },
  { min: 75, key: 'perfect', label: '찰떡궁합', pose: 'highfive', mood: ['excited', 'excited'], color: '#ffc93c', desc: '손발이 척척. 같이 하는 일마다 잘 풀려요.' },
  { min: 62, key: 'buddy', label: '든든한 짝꿍', pose: 'side', mood: ['smile', 'smile'], color: '#39ff88', desc: '편하고 믿음직한 사이. 오래 갈수록 빛나요.' },
  { min: 48, key: 'spark', label: '티격태격 케미', pose: 'face', mood: ['fighting', 'fighting'], color: '#00e5ff', desc: '투닥거려도 결국 서로를 찾는 사이. 다툼이 성장의 재료예요.' },
  { min: 0, key: 'push', label: '밀당 중인 사이', pose: 'apart', mood: ['calm', 'wow'], color: '#c77dff', desc: '아직 서로 알아 가는 중. 먼저 다가가는 쪽이 이겨요.' },
];

/**
 * @param me, friend computeSaju 결과
 * @param date {year, month, day}
 */
export function computeCompat(me, friend, date) {
  const br = branchRelation(me.pillars.year.branch, friend.pillars.year.branch);
  const st = stemRelation(me.dayMaster, friend.dayMaster);
  // 오행 보완: 내가 가장 부족한 기운을 상대가 많이 가졌는지 (양방향)
  const fill = (a, b) => Math.min(6, Math.round(b.elements[a.weakest] / 5));
  const complement = fill(me, friend) + fill(friend, me);
  const today = pillarFromIndex(dayPillarIndex(date.year, date.month, date.day));
  const todayBonus = Math.round((seededRandom(`${me.dayMaster}-${friend.dayMaster}-${date.year}-${date.month}-${date.day}`) - 0.5) * 10);
  const score = Math.max(10, Math.min(99, 50 + br.score + st.score + complement + todayBonus));
  const grade = GRADES.find((g) => score >= g.min);

  const clamp = (v) => Math.max(10, Math.min(99, Math.round(v)));
  const sub = {
    love: clamp(50 + st.score * 1.4 + br.score * 0.6 + todayBonus),
    friend: clamp(50 + br.score * 1.3 + complement + todayBonus),
    work: clamp(50 + complement * 2.2 + (st.type === 'give' || st.type === 'take' ? 10 : st.score * 0.5)),
  };
  const tips = {
    destiny: '오늘 함께 사진을 찍어 남기면 좋은 기운이 오래가요.',
    perfect: '같이 새로운 걸 시작해 보세요. 프로젝트, 운동, 여행 모두 좋아요.',
    buddy: '고마웠던 일을 한 가지 말로 전해 보세요.',
    spark: '의견이 다를 땐 결론보다 이유를 먼저 들어 주세요.',
    push: '짧은 안부 메시지 하나가 거리를 확 좁혀요.',
  };
  return { score, grade, branch: br, stem: st, complement, todayBonus, sub, tip: tips[grade.key], todayStem: today.stem };
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** 두 캐릭터가 함께 나오는 궁합 카드 SVG (480 × 360) */
export function renderCompatSVG(meInfo, friendInfo, compat, opts = {}) {
  const g = compat.grade;
  const A = characterMarkup(meInfo, { mood: g.mood[0], stage: opts.myStage || 2, aura: false, charms: opts.myCharms });
  const B = characterMarkup(friendInfo, { mood: g.mood[1], stage: 2, aura: false });
  const pose = {
    hug: { ax: 74, bx: 208, ar: 8, br: -8, s: 0.62 },
    highfive: { ax: 58, bx: 224, ar: 6, br: -6, s: 0.62 },
    side: { ax: 50, bx: 232, ar: 0, br: 0, s: 0.62 },
    face: { ax: 40, bx: 242, ar: 10, br: -10, s: 0.62 },
    apart: { ax: 14, bx: 268, ar: -4, br: 4, s: 0.6 },
  }[g.pose];
  const place = (m, x, r) => `<g transform="translate(${x} 84) rotate(${r} 100 238) scale(${pose.s})">${m.body}</g>`;
  const middle = {
    hug: `<path d="M240 160 l-24 -24 a14 14 0 0 1 24 -14 a14 14 0 0 1 24 14 z" fill="#ff4d8d" stroke="#fff" stroke-width="3"><animateTransform attributeName="transform" type="scale" values="1;1.12;1" dur="1.2s" repeatCount="indefinite" additive="sum"/></path><path d="M204 130 l-10 -10 a6 6 0 0 1 10 -6 a6 6 0 0 1 10 6 z M282 124 l-8 -8 a5 5 0 0 1 8 -5 a5 5 0 0 1 8 5 z" fill="#ff8fb3"/>`,
    highfive: `<g transform="translate(240 190)">${Array.from({ length: 8 }, (_, i) => `<path d="M0 0 L${Math.cos(i * Math.PI / 4) * 34} ${Math.sin(i * Math.PI / 4) * 34}" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/>`).join('')}<circle r="12" fill="#fff6c8"/></g>`,
    side: `<path d="M220 160 q20 -24 40 0" fill="none" stroke="#39ff88" stroke-width="4" stroke-linecap="round"/><text x="240" y="146" font-size="22" text-anchor="middle">🤝</text>`,
    face: `<path d="M244 140 l-14 30 h14 l-10 30 l26 -38 h-14 l10 -22 z" fill="#00e5ff" stroke="#fff" stroke-width="2"/>`,
    apart: `<text x="240" y="190" font-size="40" text-anchor="middle" fill="#c77dff" font-weight="900" font-family="sans-serif">?</text><path d="M200 214 q40 -16 80 0" fill="none" stroke="#c77dff" stroke-width="2" stroke-dasharray="4 6"/>`,
  }[g.pose];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360" width="480" height="360">
  <defs>${A.defs}${B.defs}
    <radialGradient id="cbg${A.id}" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="${g.color}" stop-opacity="0.35"/><stop offset="1" stop-color="#0b0820" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="480" height="360" rx="26" fill="#120c2a"/>
  <rect width="480" height="360" rx="26" fill="url(#cbg${A.id})"/>
  ${place(A, pose.ax, pose.ar)}
  ${place(B, pose.bx, pose.br)}
  ${middle}
  <g transform="translate(240 36)"><rect x="-74" y="-22" width="148" height="44" rx="22" fill="#0b0820" stroke="${g.color}" stroke-width="3"/><text y="9" font-size="26" font-weight="900" text-anchor="middle" fill="${g.color}" font-family="'JetBrains Mono', monospace">${compat.score}점</text></g>
  <text x="240" y="84" font-size="20" font-weight="900" text-anchor="middle" fill="#fff" stroke="#241b2f" stroke-width="6" paint-order="stroke" font-family="'Noto Sans KR', sans-serif">${esc(g.label)}</text>
  <text x="140" y="346" font-size="13" font-weight="700" text-anchor="middle" fill="#cfcaf2" font-family="'Noto Sans KR', sans-serif">${esc(opts.myName || '나')}</text>
  <text x="340" y="346" font-size="13" font-weight="700" text-anchor="middle" fill="#cfcaf2" font-family="'Noto Sans KR', sans-serif">${esc(opts.friendName || '친구')}</text>
</svg>`;
}

export { ANIMALS };
