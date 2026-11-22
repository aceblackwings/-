// 궁합(v0.39): 일간 관계 + 일지 관계 + 서로의 용신 채워 주기 + 띠(가볍게). 날마다 바뀌는 무작위 몫 없음
import { STEM_ELEMENT, ELEMENT_KO, ELEMENT_HANJA, ANIMALS, dayPillarIndex, pillarFromIndex } from './saju.js';
import { branchPair } from './relations.js';
import { characterMarkup } from './character.js';
import { josa, iyeyo } from './josa.js';

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

// 일지(배우자·생활 자리)끼리의 관계 (v0.39): 정통 궁합의 핵심
const DAY_REL = {
  sixCombine: { score: 14, label: '일지 육합', text: '생활 자리(일지)끼리 끌어당기는 자석 같은 사이' },
  triple: { score: 10, label: '일지 삼합', text: '생활 리듬이 한 방향으로 모이는 사이' },
  half: { score: 9, label: '일지 반합', text: '생활 리듬이 한 방향으로 모이기 시작하는 사이' },
  same: { score: 4, label: '같은 일지', text: '생활 방식이 닮아 편안한 사이' },
  clash: { score: -8, label: '일지 충', text: '생활 방식이 정반대라 서로 자극이 되는 사이 — 각자의 시간을 존중하면 오히려 단단해져요' },
  punish: { score: -3, label: '일지 형', text: '서로를 다듬어 주지만 잔소리가 늘기 쉬운 사이 — 칭찬을 먼저 건네 보세요' },
  harm: { score: -3, label: '일지 해', text: '작은 말이 오해로 번지기 쉬운 사이 — 중요한 이야기는 글로 한 번 더' },
  wonjin: { score: -4, label: '일지 원진', text: '이유 없이 서운함이 쌓이기 쉬운 사이 — 서운함은 하루 지나 부드럽게' },
  break: { score: -2, label: '일지 파', text: '계획이 자주 바뀌는 사이 — 약속은 글로 남겨 두면 편해요' },
};
export function dayBranchRelation(a, b) {
  const kinds = a === b ? ['same'] : branchPair(a, b).filter((k) => DAY_REL[k]);
  if (!kinds.length) return { kinds: [], label: '무난', score: 0, text: '생활 자리끼리 크게 부딪히거나 묶이지 않는 담백한 사이' };
  const list = kinds.map((k) => DAY_REL[k]);
  const best = list.reduce((x, y) => (Math.abs(y.score) > Math.abs(x.score) ? y : x));
  const score = Math.max(-10, Math.min(16, list.reduce((t, x) => t + x.score, 0)));
  return { kinds, label: list.map((x) => x.label).join('·'), score, text: best.text };
}

/**
 * 궁합(v0.39, 날마다 바뀌지 않음): 일간 관계 + 일지 관계 + 서로의 용신 채워 주기 + 띠(재미, 가볍게)
 * 「오늘의 둘」(today)은 점수와 따로 날마다 바뀌는 한 줄
 * @param me, friend computeSaju 결과 · date {year, month, day} (오늘의 둘에만 씀)
 */
export function computeCompat(me, friend, date) {
  const br = branchRelation(me.pillars.year.branch, friend.pillars.year.branch);
  const st = stemRelation(me.dayMaster, friend.dayMaster);
  // 공유 카드 친구는 일지가 없음(원칙 5: 카드에는 띠·오행 비율까지만) → 일지 항목은 빼고 계산
  const day = me.pillars.day && friend.pillars.day ? dayBranchRelation(me.pillars.day.branch, friend.pillars.day.branch)
    : { kinds: [], label: '정보 없음', score: 0, text: '공유 카드로 받은 친구라 생활 자리(일지)는 빼고 계산했어요', unknown: true };
  // 용신 채워 주기: 상대 사주에 내게 필요한 기운(용신)이 얼마나 있는지 (양방향, 각 0~6)
  const fill = (a, b) => Math.min(6, Math.round(b.elements[a.yongsin] / 4));
  const yongMe = fill(me, friend); const yongFriend = fill(friend, me);
  const complement = yongMe + yongFriend;
  // 가중치(v0.39): 등급 분포를 예전과 비슷하게(천생연분 약 14% · 밀당 약 9%) 맞춤
  const parts = { stem: Math.round(st.score * 1.3), day: Math.round(day.score * 1.5), yong: complement, ddi: Math.round(br.score * 0.7) };
  const score = Math.max(10, Math.min(99, 47 + parts.stem + parts.day + parts.yong + parts.ddi));
  const grade = GRADES.find((g) => score >= g.min);

  const clamp = (v) => Math.max(10, Math.min(99, Math.round(v)));
  const sub = {
    love: clamp(54 + st.score * 1.3 + day.score * 1.2 + complement * 0.6),
    friend: clamp(54 + br.score * 0.8 + day.score * 0.6 + complement),
    work: clamp(54 + complement * 1.8 + (st.type === 'give' || st.type === 'take' ? 10 : st.score * 0.5) + Math.min(0, day.score) * 0.5),
  };
  const tips = {
    destiny: '함께 사진을 찍어 남기면 좋은 기운이 오래가요.',
    perfect: '같이 새로운 걸 시작해 보세요. 프로젝트, 운동, 여행 모두 좋아요.',
    buddy: '고마웠던 일을 한 가지 말로 전해 보세요.',
    spark: '의견이 다를 땐 결론보다 이유를 먼저 들어 주세요.',
    push: '짧은 안부 메시지 하나가 거리를 확 좁혀요.',
  };
  const today = pillarFromIndex(dayPillarIndex(date.year, date.month, date.day));
  return { score, grade, parts, branch: br, stem: st, day, complement, yongMe, yongFriend, todayBonus: 0, sub, tip: tips[grade.key], todayStem: today.stem, todayLine: todayPair(me, friend, today) };
}

/** 오늘의 둘: 그날 일진이 두 사람의 일지와 맺는 관계(점수와 무관, 날마다 바뀌는 재미) */
export function todayPair(me, friend, today) {
  if (!me.pillars.day || !friend.pillars.day) return '오늘은 짧은 안부 한 줄이 둘 사이를 데워 주는 날이에요.';
  const rel = (b) => branchPair(today.branch, b);
  const a = rel(me.pillars.day.branch); const b = rel(friend.pillars.day.branch);
  const good = (r) => r.includes('sixCombine') || r.includes('half');
  const tough = (r) => r.includes('clash');
  if (good(a) && good(b)) return '오늘은 두 사람 모두 기운이 맞아떨어지는 날이에요. 같이 하는 일은 오늘 정하면 좋아요.';
  if (good(a) || good(b)) return `오늘은 ${good(a) ? '내' : '상대'} 쪽 기운이 잘 풀리는 날이에요. ${good(a) ? '먼저 연락해 보세요.' : '상대의 제안에 귀 기울여 보세요.'}`;
  if (tough(a) || tough(b)) return '오늘은 둘 중 한 사람 마음이 바쁜 날이에요. 짧은 안부 한 줄이면 충분해요.';
  return '오늘은 잔잔한 날이에요. 가벼운 수다가 둘 사이를 데워 줘요.';
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

// ======================================================================
// v0.80(2026-11-22 사용자 「궁합도 쉬운 설명으로, 요약식이 아니라 한 문단 + 조심할 점」)
// 점수 근거(일간·일지·용신·띠)를 쉬운 말로 한 문단에 잇고, 가장 신경 쓸 한 가지를 「조심할 점」으로
// ======================================================================
const STEM_PLAIN = {
  hap: '두 사람은 타고난 성격의 뿌리가 서로 짝을 이루는 사이예요. 처음 만나도 오래 알던 사람처럼 마음이 잘 맞는 편이에요.',
  same: '두 사람은 타고난 기운이 같아서 생각하는 방식이 많이 닮았어요. 말하지 않아도 통하는 게 많아요.',
  give: '내가 상대를 북돋아 주는 사이예요. 내가 챙겨 줄수록 상대가 힘을 얻고, 그 모습에 나도 보람을 느껴요.',
  take: '상대가 나를 북돋아 주는 사이예요. 상대 곁에 있으면 내가 힘을 얻고 마음이 편안해져요.',
  clash: '두 사람은 타고난 기운이 서로 다른 방향을 보고 있어요. 그래서 가끔 밀고 당기는 느낌이 들지만, 서로에게 없는 점을 배울 수 있는 사이예요.',
};
const dayPlain = (d) => {
  if (d.unknown) return '';
  const k = d.kinds || [];
  if (k.includes('sixCombine') || k.includes('triple') || k.includes('half')) return '생활하는 리듬도 잘 맞아서 함께 지낼수록 편해져요.';
  if (k.includes('same')) return '생활 방식도 비슷해서 같이 있으면 편안해요.';
  if (k.includes('clash')) return '다만 생활하는 방식은 정반대에 가까워서, 서로의 다른 점이 눈에 잘 띄어요.';
  if (k.length) return '생활 속 작은 습관에서는 서로 다른 점이 조금씩 보일 수 있어요.';
  return '생활 방식은 크게 부딪히지도 묶이지도 않는 담백한 사이예요.';
};
const yongPlain = (n) => (n >= 6 ? '게다가 서로에게 부족한 기운을 채워 주는 힘이 커서, 함께 있으면 둘 다 운이 살아나요.'
  : n >= 3 ? '서로에게 부족한 기운을 조금씩 채워 주는 사이이기도 해요.'
    : '서로의 부족한 기운을 채워 주는 힘은 크지 않으니, 각자의 장점을 먼저 알아봐 주면 더 가까워져요.');
const ddiPlain = (br, a, b) => ({
  samhap: `띠로 봐도 ${a}띠와 ${b}띠는 함께하면 힘이 커지는 좋은 조합이에요.`,
  yukhap: `띠로 봐도 ${a}띠와 ${b}띠는 서로 끌어당기는 좋은 조합이에요.`,
  same: `둘 다 ${b}띠라 통하는 게 많아요.`,
  chung: `띠로 보면 ${a}띠와 ${b}띠는 정반대 자리에 있어서, 부딪히는 만큼 서로 자극을 주는 사이예요.`,
  wonjin: `띠로 보면 ${a}띠와 ${b}띠는 가끔 서운함이 쌓이기 쉬운 조합이에요.`,
  normal: `띠로 보면 ${a}띠와 ${b}띠는 무난하고 편안한 조합이에요.`,
}[br.type]);
const GRADE_PLAIN = {
  destiny: '하늘이 맺어 준 것처럼 잘 맞는 인연이라, 함께 있으면 서로의 운이 커져요.',
  perfect: '손발이 척척 맞아서 같이 하는 일마다 잘 풀리는 사이예요.',
  buddy: '편하고 믿음직해서 오래 함께할수록 더 빛나는 사이예요.',
  spark: '가끔 투닥거려도 결국 서로를 찾게 되는 사이예요. 다툼도 둘이 함께 자라는 재료가 돼요.',
  push: '아직 서로를 알아 가는 중인 사이예요. 먼저 다가가는 쪽이 거리를 좁혀요.',
};
const SUB_KO = { love: '연인', friend: '친구', work: '함께 일하는 사이' };
const WATCH = {
  dayClash: '생활 방식이 정반대라, 서로의 방식을 고치려 들면 다툼이 잦아질 수 있어요. 각자의 시간과 방식을 인정해 주면 오히려 더 단단해져요.',
  stemClash: '서로 자기 생각이 옳다고 고집하면 밀고 당기기가 다툼으로 번질 수 있어요. 의견이 다를 땐 결론보다 상대의 이유를 먼저 들어 주세요.',
  ddiChung: '부딪혔을 때 바로 맞서면 감정이 크게 상할 수 있어요. 화가 날 땐 바로 말하기보다 하루 지나서 이야기해 보세요.',
  wonjin: '작은 서운함을 말하지 않고 쌓아 두면 어느 날 크게 터질 수 있어요. 서운한 일은 하루 지나 부드럽게 말해 주세요.',
  harm: '짧은 메시지 한 줄이 오해로 번지기 쉬워요. 중요한 이야기는 얼굴을 보고 하거나 한 번 더 풀어서 말해 주세요.',
  punish: '잘되라고 한 말이 잔소리로 들리면 마음이 멀어질 수 있어요. 고칠 점보다 잘한 점을 먼저 말해 주세요.',
  break: '약속이 자주 바뀌면 서로 믿음이 흔들릴 수 있어요. 중요한 약속은 글로 남겨 두세요.',
  give: '내가 챙겨 주기만 하다 지치면 서운함이 생길 수 있어요. 나도 필요한 것을 솔직하게 말해 주세요.',
  take: '상대의 배려를 당연하게 여기면 상대가 지칠 수 있어요. 고맙다는 말을 자주 전해 주세요.',
  same: '너무 닮아서 같은 부분에서 고집이 부딪힐 수 있어요. 그럴 땐 한 사람이 먼저 한 발 물러서 주세요.',
  close: '너무 잘 맞는다고 서로에게만 기대면 다른 관계가 소홀해질 수 있어요. 각자의 친구와 시간도 챙겨 주세요.',
  calm: '편한 사이라 표현을 줄이면 마음이 식은 것처럼 느껴질 수 있어요. 가끔은 고마운 마음을 말로 전해 주세요.',
};
/** 가장 신경 쓸 한 가지 */
function compatWatch(c) {
  const k = c.day.kinds || [];
  if (k.includes('clash')) return WATCH.dayClash;
  if (c.stem.type === 'clash') return WATCH.stemClash;
  if (c.branch.type === 'chung') return WATCH.ddiChung;
  if (k.includes('wonjin') || c.branch.type === 'wonjin') return WATCH.wonjin;
  if (k.includes('harm')) return WATCH.harm;
  if (k.includes('punish')) return WATCH.punish;
  if (k.includes('break')) return WATCH.break;
  if (c.stem.type === 'give') return WATCH.give;
  if (c.stem.type === 'take') return WATCH.take;
  if (c.stem.type === 'same') return WATCH.same;
  return c.grade.key === 'destiny' || c.grade.key === 'perfect' ? WATCH.close : WATCH.calm;
}
/**
 * 궁합 한 문단 + 조심할 점
 * @param c computeCompat 결과 · names {me, friend, meAnimal, friendAnimal}
 */
export function compatStory(c, { me = '', friend = '', meAnimal = '', friendAnimal = '' } = {}) {
  const who = `${me ? josa(me, '과/와') : '나와'} ${friend || '상대'}`;
  const best = Object.entries(c.sub).reduce((a, b) => (b[1] > a[1] ? b : a));
  const para = [
    `${who}의 궁합은 ${c.score}점, ${iyeyo(`「${c.grade.label}」`)}. ${GRADE_PLAIN[c.grade.key]}`,
    STEM_PLAIN[c.stem.type],
    dayPlain(c.day),
    yongPlain(c.complement),
    ddiPlain(c.branch, meAnimal, friendAnimal),
    `연인·친구·함께 일하는 사이 가운데에서는 ${josa(SUB_KO[best[0]], '으로/로')} 지낼 때 가장 잘 맞아요(${best[1]}점).`,
    c.todayLine,
    `${c.tip}`,
  ].filter(Boolean).join(' ');
  return { para, watch: compatWatch(c) };
}
