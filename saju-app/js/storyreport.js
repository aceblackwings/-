// 이야기로 읽는 상세판·정통사주(v0.50, 2026-11-05 사용자 의견)
// 본문 = 공감 → 원인(어떤 기운이 들어와서) → 위험·피할 일 → 인연 → 돈과 일(사업 분야) → 이겨 내는 법 → 목표
// 어려운 계산 근거는 맨 뒤 「부록」으로 보냄(premium.js). 순수 로직만(테스트: tests/storybook.test.mjs)
import { josa } from './josa.js';
import { GOD_TALE, TODAY_TALE, EL_TALE, EL_NAME, PLAIN_GOD } from './storybook.js';
import { tenGod, BRANCH_MAIN_STEM, STEM_ELEMENT, ANIMALS } from './saju.js';
import { incomingRelations, REL_INFO } from './relations.js';
import { categoryScores } from './period.js';
import { tenGodProfile } from './natal.js';
import { buildIlju } from './ilju.js';

const sentence = (t) => { const x = String(t || '').trim(); return !x ? '' : /[.!?]$/.test(x) ? x : `${x}.`; };
export const GROUP_OF = { 비견: 0, 겁재: 0, 식신: 1, 상관: 1, 편재: 2, 정재: 2, 편관: 3, 정관: 3, 편인: 4, 정인: 4 };

// 지난 시기를 돌아보는 공감 한 줄(과거형)
const PAST = {
  비견: '내 힘으로 해 보고 싶은 마음이 커져, 누군가와 자존심을 겨루거나 돈이 여러 갈래로 나뉘는 일이 있었을 거예요.',
  겁재: '열심히 했는데도 몫이 새어 나가는 것 같고, 경쟁 속에서 억울한 마음이 들었던 순간이 있었을 거예요.',
  식신: '마음은 편했지만 계획이 느슨해지고, 하고 싶은 것과 해야 할 것 사이에서 미루는 일이 늘었을 거예요.',
  상관: '할 말이 많았는데 참아야 했거나, 한마디가 생각보다 크게 번져 마음고생을 한 적이 있었을 거예요.',
  편재: '기회도 많고 지출도 많아, 바쁘게 움직였는데 손에 남은 게 생각보다 적었을 수 있어요.',
  정재: '아끼고 모으느라 마음 편히 쓰지 못했거나, 안정과 변화 사이에서 망설인 일이 있었을 거예요.',
  편관: '해야 할 일과 책임이 한꺼번에 몰려 숨 돌릴 틈이 없었고, 몸이 먼저 지쳤던 때가 있었을 거예요.',
  정관: '잘해야 한다는 마음에 어깨가 무거웠고, 남의 눈과 평가가 유난히 신경 쓰였을 거예요.',
  편인: '생각이 많아 잠 못 든 밤이 있었고, 「나는 왜 이럴까」 하는 마음에 혼자 가라앉은 날이 있었을 거예요.',
  정인: '누군가의 도움으로 버텼지만, 내 힘으로 해야 할 일을 미뤄 두어 마음 한쪽이 무거웠을 수 있어요.',
};
// 돈 버는 방식(타고난 기운 무리별)
const GROUP_MONEY = [
  '내 손으로 직접 뛰어서 버는 방식이 맞아요. 남 밑에서 오래 있기보다 내 이름을 건 일에서 돈이 커져요. 다만 동업과 돈 거래는 꼭 글로 남기세요.',
  '솜씨·말·글·기술처럼 「내가 만든 것」이 돈이 되는 방식이에요. 좋아하는 일을 할 때 수입이 따라오니, 재능을 상품으로 만드는 연습이 곧 재테크예요.',
  '돈의 흐름을 읽는 감각을 타고났어요. 장사·관리·투자처럼 돈을 굴리는 일에 강하지만, 욕심이 앞설 때 한 번 쉬어 가는 습관이 평생 재산을 지켜요.',
  '신용과 자리로 버는 방식이에요. 직장·전문직·공공처럼 믿음이 쌓이는 틀 안에서 오래 갈수록 크게 남아요.',
  '배움과 자격이 돈이 되는 방식이에요. 공부한 만큼 몸값이 오르고, 문서·계약·부동산과 인연이 깊어요.',
];
// 그해 기운 무리별 돈 관리 한 가지
const MONEY_RULE = [
  '올해 돈의 규칙: 함께 쓰는 돈은 처음부터 나누는 비율을 정하고, 빌려주는 돈은 「안 돌아와도 괜찮은 만큼」만.',
  '올해 돈의 규칙: 재능으로 버는 돈이 들쭉날쭉할 수 있으니, 잘 번 달에 석 달 치 생활비를 먼저 떼어 두기.',
  '올해 돈의 규칙: 기회가 많은 해일수록 「얼마까지 잃어도 괜찮은지」를 먼저 정하고 움직이기.',
  '올해 돈의 규칙: 세금·관리비·보험처럼 꼭 나가는 돈을 먼저 정리하면 남는 돈이 또렷해져요.',
  '올해 돈의 규칙: 공부와 자격에 쓰는 돈은 아끼지 말고, 대신 충동적인 쇼핑은 하루 미루기.',
];
const POS_PLAIN = { day: '나와 배우자 자리', month: '일터·부모 자리', year: '집안·어린 시절 자리', hour: '자녀·노후 자리' };
const REL_PLAIN = {
  triple: '크게 한 덩어리로 뭉쳐요', direction: '한 방향으로 뭉쳐요', sixCombine: '찰떡처럼 짝을 이뤄요', stemCombine: '손을 맞잡아요', half: '반쯤 뭉치기 시작해요',
  clash: '정면으로 부딪혀요', punish: '서로를 다듬으려 해요', selfPunish: '같은 글자끼리 겹쳐요', stemClash: '생각이 서로 부딪혀요', break: '살짝 엇나가요', harm: '살짝 어긋나요', wonjin: '살짝 엇갈려요',
};
// 육합 짝(쥐-소, 호랑이-돼지, 토끼-개, 용-닭, 뱀-원숭이, 말-양)과 삼합
const SIX = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
const TRIPLE = [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]];
const tripleOf = (b) => TRIPLE.find((g) => g.includes(b)).filter((x) => x !== b);
const elWord = (e) => `${EL_NAME[e]} 기운`;
const list = (arr) => arr.map((x, i) => `${'①②③④⑤⑥⑦⑧'[i]} ${x}`).join(' ');

/** 그 시기에 들어온 글자가 내 사주와 맺는 관계를 쉬운 말 한 문장으로 */
export function relationPlain(pillars, incoming, label) {
  const r = incomingRelations(pillars, incoming, label)[0]; if (!r) return null;
  const isStem = r.kind === 'stemCombine' || r.kind === 'stemClash';
  const subj = isStem ? `${label}의 겉 기운` : `${label}의 ${ANIMALS[incoming.branch]} 기운`;
  return { kind: r.kind, at: r.at, good: ['triple', 'direction', 'sixCombine', 'stemCombine', 'half'].includes(r.kind),
    text: `${josa(subj, '이/가')} 내 사주의 ${POS_PLAIN[r.at]}와 ${REL_PLAIN[r.kind]}. ${sentence(REL_INFO[r.kind].mean)} ${sentence(REL_INFO[r.kind].act)}` };
}

function fieldOf(m, key) {
  const c = categoryScores(m.score, m.god);
  if (key === 'business') return Math.round((c.wealth + c.career) / 2);
  return c[key];
}
const topMonths = (y, key, n = 2) => y.months.map((m, i) => ({ m, i, v: fieldOf(m, key) })).sort((a, b) => b.v - a.v || a.i - b.i).slice(0, n);
const lowMonths = (y, key, n = 1) => y.months.map((m, i) => ({ m, i, v: fieldOf(m, key) })).sort((a, b) => a.v - b.v || a.i - b.i).slice(0, n);
const mList = (xs) => xs.map((x) => `${x.m.solarMonth}월`).join('과 ');

/**
 * 그해 상세판 이야기 6장
 * @param ctx { y, thisYear, saju, name, gender, checks(yearChecks 결과) }
 */
export function yearStoryChapters(ctx) {
  const { y, thisYear, saju, gender = 'female', checks = [] } = ctx;
  const who = ctx.name ? `${ctx.name} 님` : '당신';
  const Y = y.sajuYear; const god = y.year.god; const T = GOD_TALE[god];
  const inner = tenGod(saju.dayMaster, BRANCH_MAIN_STEM[y.year.pillar.branch]); const I = GOD_TALE[inner];
  const yEl = STEM_ELEMENT[y.year.pillar.stem]; const yong = saju.yongsin; const E = EL_TALE[yong];
  const ranked = y.months.map((m, i) => ({ m, i })).sort((a, b) => b.m.score - a.m.score || a.i - b.i);
  const best = ranked.slice(0, 3); const slow = ranked.slice(-2);
  const out = [];

  // 1장 · 올해 부는 바람
  const elLine = yEl === yong ? `게다가 그해 들어오는 오행이 ${who}에게 가장 필요한 ${elWord(yong)}이라, 몸과 마음이 평소보다 편한 해예요.`
    : yEl === saju.gisin ? `다만 그해 들어오는 오행이 ${who}에게 이미 넉넉한 ${elWord(yEl)}이라, 일을 더 벌이기보다 줄이고 정리할 때 편해져요.`
      : `그해 들어오는 오행은 ${elWord(yEl)}이에요. ${who}에게 가장 필요한 ${elWord(yong)}은 아니어서, 6장의 실천법으로 필요한 기운을 따로 채우면 돼요.`;
  out.push({ key: 'wind', h: `1장 · ${Y}년에 들어오는 기운`, blocks: [
    { h: `🧭 올해 들어오는 기운: ${PLAIN_GOD[god]}`, paras: [T.feel, T.why, elLine] },
    { h: '👀 올해 주변 사람이 보는 나', paras: [observer(GROUP_OF[god], who, '올해 ')] },
    { h: '🤔 올해 스스로 점검할 질문', paras: [`${TODAY_TALE[god].think.replace(/오늘/g, '올해')} 이 질문에 대한 답을 휴대폰 메모에 적어 두고, 6월과 12월에 다시 확인해 보세요.`] },
    { h: '🎁 올해 좋아지는 점', paras: [`${T.gift[0]}. ${T.gift[1]}.`, inner !== god ? `겉으로 드러난 기운과 함께 속에서는 ${PLAIN_GOD[inner]}이 들어와요. 그래서 ${I.gift[0].replace(/요$/, '요.')}` : `겉과 속에 같은 기운이 들어와 올해의 성격이 뚜렷해요. 마음먹은 일은 미루지 말고 시작하세요.`] },
  ] });

  // 2장 · 요즘 힘든 이유
  const why = [];
  if (thisYear) why.push(`${Y - 1}년을 지나오며 이런 일이 있었나요? ${PAST[thisYear.year.god]} 기분 탓이 아니었어요. ${Y - 1}년에는 ${PLAIN_GOD[thisYear.year.god]}이 들어온 해였거든요.`);
  if (y.daewoon) {
    const D = GOD_TALE[y.daewoon.god];
    why.push(`더 큰 흐름도 있어요. ${josa(who, '은/는')} 지금 ${y.daewoon.startAge}~${y.daewoon.endAge}세의 10년 흐름 안에 있고, 이 10년을 끌고 가는 힘은 ${PLAIN_GOD[y.daewoon.god]}이에요. ${D.why}`);
  }
  if (inner !== god) why.push(`올해는 겉으로 드러난 기운과 함께 속에서 ${PLAIN_GOD[inner]}이 들어와요. 그래서 이런 마음도 함께 들 수 있어요. ${GOD_TALE[inner].feel.split('? ')[0].replace(/^요즘 /, '')}? 두 기운이 섞여 마음이 오락가락해도 이상한 게 아니에요.`);
  const rel = relationPlain(saju.pillars, y.year.pillar, '그해');
  if (rel) why.push(rel.good ? `반가운 소식도 있어요. ${rel.text}` : `올해 마음이 흔들릴 수 있는 이유가 하나 더 있어요. ${rel.text}`);
  const weak = saju.weakest; const wpct = saju.elements[weak];
  why.push(`그리고 타고난 사주에 ${elWord(weak)}이 적은 편(${wpct}%)이라, ${EL_TALE[weak].lack} 지칠 때 이 점을 떠올리면 「내가 부족해서가 아니라 기운이 비어서 그렇구나」 하고 스스로를 덜 탓하게 돼요.`);
  why.push(`그래서 ${Y}년은 이렇게 달라져요. ${PLAIN_GOD[god]}이 들어와, ${sentence(T.gift[0])} ${sentence(T.gift[1])} 3장에서는 피할 일을, 4~6장에서는 도움이 되는 사람·맞는 일·실천법을 알려 드려요.`);
  out.push({ key: 'why', h: '2장 · 요즘 마음이 무거웠던 이유', blocks: [{ paras: why }] });

  // 3장 · 위험과 피해야 할 일
  const watch = checks.filter((c) => c.kind === 'watch').slice(0, 3);
  out.push({ key: 'risk', h: '3장 · 올해 조심할 일과 피할 일', intro: '미리 알고 대비하면 손해를 줄일 수 있어요.', blocks: [
    { h: '⚠️ 올해 닥치기 쉬운 위험', paras: [...T.risk.map(sentence), ...(inner !== god ? [sentence(I.risk[0])] : [])] },
    { h: '🚫 올해 피해야 할 일', paras: [list([...T.avoid, ...(inner !== god ? [I.avoid[0]] : [])]) + '. 이 중 하나만 지켜도 한 해가 훨씬 가벼워져요.'] },
    ...watch.map((c) => ({ h: `🔎 ${c.title.replace(/\s*\([^)]*\)$/, '')}`, paras: [sentence(c.text), `👉 이렇게 막아요: ${sentence(c.act)}${c.when ? ` 특히 ${c.when}에 한 번 더 챙겨 보세요.` : ''}`], plain: true })),
    { h: '📅 조심할 달', paras: [`${slow.map((x) => `${x.m.solarMonth}월`).join('과 ')}은 한 해 가운데 점수가 가장 낮은 달이에요. 이때는 새 일·큰 결제·계약을 피하고, 하던 일을 정리하세요. ${sentence(TODAY_TALE[slow[0].m.god].watch.replace(/오늘은?/g, '이 달엔'))}`] },
  ] });

  // 4장 · 좋은 인연
  const myB = saju.pillars.year.branch; const six = SIX[myB]; const tri = tripleOf(myB);
  const spouseGods = gender === 'male' ? ['정재', '편재'] : ['정관', '편관'];
  const loveM = topMonths(y, 'love'); const socM = topMonths(y, 'social');
  const spouseM = y.months.filter((m) => spouseGods.includes(m.god)).map((m) => `${m.solarMonth}월`);
  out.push({ key: 'people', h: '4장 · 올해 도움이 되는 사람과 인연', blocks: [
    { h: '🤝 올해 나를 돕는 사람', paras: [T.people, `특히 ${E.zodiac}처럼 ${elWord(yong)}을 가진 사람, 그리고 내 띠(${ANIMALS[myB]})와 찰떡인 ${ANIMALS[six]}띠, 뜻이 잘 맞는 ${tri.map((b) => ANIMALS[b]).join('·')}띠 사람이 곁에 있으면 일이 술술 풀려요.`] },
    { h: '💗 사랑과 만남', paras: [
      `연애운이 가장 좋은 달은 ${mList(loveM)}이에요.${spouseM.length ? ` 또 ${spouseM.join('·')}은 사주로 보면 「짝의 기운」이 들어오는 달이라, 혼자라면 새 인연을, 함께라면 깊은 약속을 이야기하기 좋아요.` : ''}`,
      `만남은 ${E.place}처럼 ${elWord(yong)}이 흐르는 곳에서 생기기 쉬워요. 혼자라면 이번 달 안에 그런 곳에 한 번 가 보세요. 함께라면 그곳에서 둘만의 시간을 보내면 마음이 가까워져요.`,
    ] },
    { h: '💌 혼자라면, 함께라면', paras: [`혼자라면: ${LOVE_SOLO[GROUP_OF[god]]}`, `함께라면: ${LOVE_PAIR[GROUP_OF[god]]}`] },
    { h: '🫂 사람 사이가 넓어지는 때', paras: [`모임과 부탁, 소개가 잘 풀리는 달은 ${mList(socM)}이에요. 이 달에는 오랜만인 사람에게 먼저 연락하세요. 소개와 부탁이 잘 들어지는 달이에요.`] },
  ] });

  // 5장 · 돈과 일
  const tg = tenGodProfile(saju); const topG = [...tg.groups].sort((a, b) => b.pct - a.pct)[0];
  const H = saju.heesin != null && saju.heesin !== yong ? EL_TALE[saju.heesin] : null;
  const wM = topMonths(y, 'wealth'); const bM = topMonths(y, 'business'); const wLow = lowMonths(y, 'wealth')[0];
  out.push({ key: 'money', h: '5장 · 돈과 일: 나에게 맞는 분야', blocks: [
    { h: '💼 나는 이렇게 버는 사람', paras: [GROUP_MONEY[GROUP_ORDER.indexOf(topG.key)], `올해는 ${T.work}`] },
    { h: `🏪 사업·일을 한다면 이 분야 (${elWord(yong)})`, paras: [
      `${who}에게 가장 필요한 기운은 ${elWord(yong)}이에요. 일도 이 기운이 흐르는 분야를 고르면, 같은 노력으로 더 오래 더 크게 남아요.`,
      ...E.biz.map(([f, r]) => `· ${f} — ${r}`),
      ...(H ? [`곁에서 돕는 ${elWord(saju.heesin)} 쪽 분야도 잘 맞아요: ${H.biz.slice(0, 3).map(([f]) => f).join(', ')}.`] : []),
      '지금 하는 일이 이 분야가 아니어도 괜찮아요. 일하는 방식·장소·함께하는 사람에 이 기운을 더하면 돼요(6장).',
    ] },
    { h: '💰 올해 돈이 움직이는 때', paras: [
      `돈 흐름이 가장 좋은 달은 ${mList(wM)}, 사업·새 일을 꺼내기 좋은 달은 ${mList(bM)}이에요. 큰 결정은 이 달들에 몰아 두세요.`,
      `${wLow.m.solarMonth}월은 지갑을 닫고 점검하는 달이에요. ${MONEY_RULE[GROUP_OF[god]]}`,
    ] },
  ] });

  // 6장 · 이겨 내는 법
  out.push({ key: 'fix', h: '6장 · 운을 좋게 하는 실천법', blocks: [
    { h: `🌱 ${elWord(yong)}을 곁에 두는 법`, paras: [`${elWord(yong)}은 ${E.nature}`, list(E.bring) + '.', `색은 ${E.color}, 장소는 ${E.place}가 힘이 돼요.`] },
    { h: '🛡️ 올해 꼭 할 행동 세 가지', paras: [list(T.fix) + '.', '세 가지를 한꺼번에 하려 하지 말고, 가장 쉬운 하나를 오늘 시작하세요. 한 달 뒤 두 번째를 더하면 돼요.'] },
    { h: '🗓️ 한 달 실천표', paras: [`1주: ${E.bring[0]}. 2주: ${T.fix[0]}. 3주: ${E.bring[1]}. 4주: 한 달 동안 달라진 점 세 가지를 적어 보기. 앱의 「오늘의 좋은 습관」이 날마다 이 흐름에 맞는 작은 일을 하나씩 골라 드려요.`] },
  ] });
  // 장 끝 한 줄: 다음 장에서 무엇을 알려 주는지 그대로(v0.51, 비유 없이 숫자와 내용으로)
  const trapN = T.risk.length + (inner !== god ? 1 : 0) + watch.length;
  const cliffs = [
    `다음 장에서는 ${Y - 1}년에 유난히 힘들었던 이유를 알려 드려요.`,
    `다음 장에서는 올해 조심할 일 ${trapN}가지와 그 대비법을 알려 드려요.`,
    `다음 장에서는 올해 ${who}에게 도움이 되는 사람과 띠, 연애운이 좋은 달을 알려 드려요.`,
    `다음 장에서는 ${who}에게 맞는 일·사업 분야와 돈 흐름이 좋은 달을 알려 드려요.`,
    `다음 장에서는 운을 좋게 하는 실천법과 한 달 실천표를 알려 드려요.`,
    `다음 장에서는 ${y.months[0].solarMonth}월부터 열두 달을 한 달씩 풀어 드려요.`,
  ];
  out.forEach((sec, i) => sec.blocks.push({ cliff: true, paras: [cliffs[i]] }));
  out.unshift(yearBrief(ctx, { T, I, inner, god, best, slow, watch }));
  return out;
}

/** v0.51 한눈에 정리(상세판 맨 앞 · 무료 책자 앞머리): 올해 한 줄 · 꼭 할 일 · 피할 일 · 좋은 달/조심할 달 */
function yearBrief(ctx, { T, I, inner, god, best, slow, watch }) {
  const Y = ctx.y.sajuYear;
  const avoid = [...T.avoid, ...(inner !== god ? [I.avoid[0]] : [])];
  return { key: 'brief', h: `📌 한눈에 정리: ${Y}년에 할 일과 피할 일`, intro: '자세한 이유는 1장부터 차례로 읽으면 돼요.', blocks: [
    { h: '한 줄 요약', paras: [`${Y}년은 ${PLAIN_GOD[god]}이 들어오는 해예요. 올해의 목표는 「${T.goal}」, 이 한 줄이에요.`] },
    { h: '✅ 올해 꼭 할 일', paras: T.fix.map((x) => `· ${x}`) },
    { h: '⛔ 올해 피할 일', paras: [...avoid.map((x) => `· ${x}`), ...watch.map((c) => `· ${c.title.replace(/\s*\([^)]*\)$/, '')} → ${sentence(c.act)}`)], plain: true },
    { h: '📅 언제', paras: [`· 좋은 달: ${best.map((x) => `${x.m.solarMonth}월`).join('·')}. 시작·계약·큰 결정은 이 달에 하세요.`, `· 조심할 달: ${slow.map((x) => `${x.m.solarMonth}월`).join('·')}. 이 달에는 새 일과 큰 결제를 미루세요.`] },
  ] };
}
/** 관찰자 시점: 주변 사람 눈에 비친 나(기운 무리별) */
const OBSERVER = [
  ['제 갈 길이 분명한 사람', '가까운 사람일수록 「한 번쯤은 기대도 되는데」 하고 아쉬워할 수 있어요'],
  ['같이 있으면 분위기가 살아나는 사람', '가끔은 지나가듯 던진 농담 한마디를 하루 종일 곱씹는 사람도 있어요'],
  ['일 처리가 빠르고 현실적인 사람', '중요한 결정 앞에서 먼저 찾으면서도, 속마음은 잘 모르겠다고 느끼기도 해요'],
  ['믿고 맡길 수 있는 사람', '그 믿음이 고마우면서도, 언제 쉬는지 아는 사람은 많지 않아요'],
  ['생각이 깊고 아는 게 많은 사람', '조언을 구하러 오면서도, 혼자 얼마나 오래 고민했는지는 잘 몰라요'],
];
function observer(g, who, pre) {
  const [look, back] = OBSERVER[g];
  return `${pre}주변 사람들은 ${josa(who, '을/를')} 「${look}」으로 봐요. 그런데 ${back}. 그러니 힘들 때는 혼자 버티지 말고, 가까운 사람에게 지금 상태를 말로 알려 주세요.`;
}
const GROUP_ORDER = ['bigeop', 'siksang', 'jaeseong', 'gwanseong', 'inseong'];

/** 그해 상세판 맺음: 목표 세 가지 + 편지 */
export function yearClosing(ctx) {
  const { y, saju } = ctx; const who = ctx.name ? `${ctx.name} 님` : '당신';
  const T = GOD_TALE[y.year.god]; const wM = topMonths(y, 'wealth', 1)[0]; const lM = topMonths(y, 'love', 1)[0];
  return { key: 'close', h: `맺음 · 나의 ${y.sajuYear}년 목표 세 가지`, blocks: [{ paras: [
    `① 마음의 목표: ${T.goal}. ② 돈의 목표: ${wM.m.solarMonth}월에 미뤄 둔 돈 결정 하나를 끝내기. ③ 사람의 목표: ${lM.m.solarMonth}월에 고마운 사람과 마음을 나누기.`,
    `세 가지를 휴대폰 메모나 달력에 적어 두세요. 적어 둔 목표는 잊혀도 다시 돌아와요.`,
    `${who}, 점수가 좋은 달에는 미뤄 둔 일을 시작하고, 점수가 낮은 달에는 새 일을 벌이지 말고 정리하세요. 그리고 한 해 내내 6장의 방법으로 ${EL_NAME[saju.yongsin]} 기운을 곁에 두세요.`,
    `6월과 12월에 이 책 맨 앞의 「한눈에 정리」를 다시 열어, 할 일을 몇 개 지켰는지 확인해 보세요.`,
  ] }] };
}

/** 열두 달 이야기(쉬운 말, 짧게) */
/** 사계절 한눈에(열두 달 이야기 머리) */
export function seasonStory(y) {
  const S = [['🌸 봄', [2, 3, 4]], ['☀️ 여름', [5, 6, 7]], ['🍂 가을', [8, 9, 10]], ['❄️ 겨울', [11, 12, 1]]];
  const rows = S.map(([name, ms]) => {
    const list = y.months.filter((m) => ms.includes(m.solarMonth)); const mid = list[1] || list[0];
    const v = Math.round(list.reduce((a, m) => a + m.score, 0) / list.length);
    return { name, ms, v, line: `${name}(${ms.join('·')}월)은 「${TODAY_TALE[mid.god].head.replace(/날$/, '계절')}」. ${TODAY_TALE[mid.god].good.replace(/오늘/g, '이 계절')}` };
  });
  const bestS = [...rows].sort((a, b) => b.v - a.v)[0]; const slowS = [...rows].sort((a, b) => a.v - b.v)[0];
  return { h: '🗺️ 사계절 한눈에', paras: [...rows.map((r) => r.line), `한 해 가운데 가장 좋은 계절은 ${bestS.name.slice(3)}, 쉬어 가며 정리할 계절은 ${slowS.name.slice(3)}이에요.`] };
}

export function monthStory(y, i, ctx, rank, days) {
  const m = y.months[i]; const { saju } = ctx; const TT = TODAY_TALE[m.god]; const G = GOD_TALE[m.god];
  const inner = tenGod(saju.dayMaster, BRANCH_MAIN_STEM[m.pillar.branch]);
  const keys = ['wealth', 'career', 'love', 'health', 'social']; const KO = { wealth: '돈', career: '일·공부', love: '사랑', health: '건강', social: '사람 사이' };
  const vals = keys.map((k) => ({ k, v: fieldOf(m, k) })).sort((a, b) => b.v - a.v);
  const hi = vals[0]; const lo = vals[vals.length - 1];
  const head = TT.head.replace(/날$/, '달');
  const tone = rank < 3 ? '한 해 가운데 가장 좋은 달 중 하나예요. 시작과 큰 결정은 이 달에 하세요.' : rank >= 10 ? '한 해 가운데 점수가 낮은 달이에요. 새 일은 미루고 정리하세요.' : '';
  const paras = [];
  paras.push(`${m.term}부터 ${PLAIN_GOD[m.god]}이 들어와요. ${TT.good.replace(/오늘/g, '이 달')} ${tone}`.trim());
  if (inner !== m.god) paras.push(`속에서는 ${PLAIN_GOD[inner]}이 함께 흘러요. ${sentence(GOD_TALE[inner].gift[i % 2])}`);
  paras.push(`${KO[hi.k]}에 힘이 실리고(${hi.v}점), ${josa(KO[lo.k], '은/는')} 천천히 가면 좋아요(${lo.v}점).`);
  const rel = relationPlain(saju.pillars, m.pillar, '이 달');
  if (rel) paras.push(rel.text);
  else if (STEM_ELEMENT[m.pillar.stem] === saju.yongsin) paras.push(`이 달은 내게 가장 필요한 ${elWord(saju.yongsin)}이 하늘에서 내려오는 달이라, 미뤄 둔 시작이나 부탁을 꺼내기 좋아요.`);
  paras.push(`🤔 생각해 볼 것: ${TT.think.replace(/오늘/g, '이 달')}`);
  if (days) paras.push(`좋은 날: ${days.good.join(', ')}. 쉬어 갈 날: ${days.slow.join(', ')}.`);
  paras.push(rank >= 10 ? `⚠️ 조심: ${TT.watch.replace(/오늘은?/g, '이 달엔')} 👉 ${sentence(G.fix[i % G.fix.length])}` : `👉 이 달 한 가지: ${sentence(TT.do[i % 2])}`);
  return { h: `${m.solarMonth}월 · ${head} ${rank < 3 ? '🌟' : rank >= 10 ? '🍵' : ''}`.trim(), paras };
}

// ======================================================================
// 평생 정통사주 이야기
// ======================================================================
// v0.51: 일간 성향을 비유 없이(전통 이미지는 괄호로만)
const DM_STORY = [
  '한번 정한 길은 끝까지 가고, 옳지 않은 일을 보면 참지 못하는 사람이에요(전통으로는 「큰 나무」). 그래서 「고집 세다」는 말과 「믿음직하다」는 말을 함께 들어요.',
  '분위기를 잘 읽고 사람 사이를 부드럽게 이어 주는 사람이에요(전통으로는 「꽃과 덩굴」). 겉으로는 순해 보여도 속은 끈질겨요.',
  '밝고 솔직해서 사람들이 모여드는 사람이에요(전통으로는 「태양」). 대신 기분이 얼굴에 그대로 드러나고, 한꺼번에 몰아서 하다 지치기 쉬워요.',
  '겉은 조용해도 속에 열정과 배려가 많은 사람이에요(전통으로는 「촛불」). 한 사람, 한 분야에 오래 마음을 쏟아요.',
  '쉽게 흔들리지 않아 주변이 기대는 사람이에요(전통으로는 「큰 산」). 대신 속마음을 잘 말하지 않아 혼자 오래 고민해요.',
  '꼼꼼히 챙기고 사람과 살림을 잘 돌보는 사람이에요(전통으로는 「기름진 땅」). 남을 챙기느라 나를 뒤로 미루기 쉬워요.',
  '옳고 그름이 분명하고 의리가 있는 사람이에요(전통으로는 「바위와 쇠」). 위기에 강하지만, 말이 직설적이라 오해를 사기도 해요.',
  '감각이 예리하고 좋은 것을 잘 알아보는 사람이에요(전통으로는 「보석」). 자존심이 강하고 완벽을 바라서 스스로에게 가장 엄격해요.',
  '생각의 폭이 넓고 상황 판단이 빠른 사람이에요(전통으로는 「큰 물」). 틀에 갇히면 답답해하고, 속마음을 잘 드러내지 않아요.',
  '섬세하고 눈치가 빨라 사람 마음을 잘 알아차리는 사람이에요(전통으로는 「비와 이슬」). 조용하지만 한번 마음먹으면 끝까지 해내요.',
];
const GROUP_HEAR = [
  '「너는 네 생각이 확실하구나」, 「혼자서도 잘하네」라는 말을 자주 듣지 않나요?',
  '「너랑 있으면 재밌어」, 「말 진짜 잘한다」라는 말을 자주 듣지 않나요?',
  '「너는 현실적이야」, 「계산이 빠르네」라는 말을 자주 듣지 않나요?',
  '「믿고 맡길 수 있어」, 「너무 책임감이 강해」라는 말을 자주 듣지 않나요?',
  '「생각이 깊다」, 「너는 뭘 그렇게 많이 알아?」라는 말을 자주 듣지 않나요?',
];
const GROUP_REP = ['비견', '식신', '편재', '정관', '정인'];
const GROUP_REP_HARD = ['겁재', '상관', '편재', '편관', '편인'];

/**
 * 평생 정통사주 이야기(본문)
 * @param ctx { saju, gyeok, gp(GYEOK_PROFILE), daewoon, name, gender, curAge, watch(natalWatch) }
 */
export function lifeStoryChapters(ctx) {
  const { saju, daewoon, gender = 'female', curAge, watch = [], gp } = ctx;
  const who = ctx.name ? `${ctx.name} 님` : '당신';
  const tg = tenGodProfile(saju); const sorted = [...tg.groups].sort((a, b) => b.pct - a.pct);
  const top = sorted[0]; const low = sorted[4]; const gi = GROUP_ORDER.indexOf(top.key);
  const yong = saju.yongsin; const E = EL_TALE[yong]; const els = saju.elements;
  const over = [0, 1, 2, 3, 4].sort((a, b) => els[b] - els[a])[0]; const weak = saju.weakest;
  const out = [];

  out.push({ key: 'me', h: '1장 · 나는 이런 사람이에요', blocks: [
    { h: '🌳 타고난 성향', paras: [`${josa(who, '은/는')} ${DM_STORY[saju.dayMaster]}`, `${GROUP_HEAR[gi]} 사주에 「${top.mean}」이 가장 많아서(${top.pct}%) 그래요. ${top.strong}`] },
    { h: '🌼 태어난 날이 말해 주는 나', paras: (() => { const ij = buildIlju(saju); return [ij.paras.personality, `사랑할 때: ${ij.paras.love}`, `일할 때: ${ij.paras.work}`]; })() },
    { h: '👀 주변 사람이 보는 나', paras: [observer(gi, who, '')] },
    { h: '🪞 남들은 모르는 속마음', paras: [`${GOD_TALE[GROUP_REP_HARD[gi]].feel.replace(/^요즘 /, '')} 이런 마음이 자주 든다면, 그건 ${who}의 사주가 그렇게 생겼기 때문이에요. 나쁜 성질이 아니라, 2~3장의 방법대로 다루면 장점이 되는 성질이에요.`, ...(gp ? [`${who}의 타고난 그릇은 「${gp.title}」이에요. 강점은 ${gp.strengths.slice(0, 2).join(', ')}.`] : [])] },
  ] });

  const hard = [];
  hard.push(`살다 보면 비슷한 고비가 반복된다고 느낄 때가 있죠. 그건 우연이 아니라, 타고난 기운의 모양 때문이에요.`);
  hard.push(`${who}의 사주에는 ${elWord(over)}이 가장 많고(${els[over]}%), ${elWord(weak)}이 가장 적어요(${els[weak]}%). 넘치는 쪽은 ${EL_OVER[over]} 모자란 쪽은 ${EL_TALE[weak].lack}`);
  for (const w of watch.slice(0, 3)) hard.push(`「${w.title}」 — ${sentence(w.text)} 👉 ${sentence(w.act)}`);
  hard.push(`같은 고비가 다시 오면 위의 👉 대비법부터 하나씩 해 보세요. 고비가 오는 이유를 알면 같은 실수를 덜 하게 돼요.`);
  out.push({ key: 'hard', h: '2장 · 자꾸 같은 고비가 오는 이유', blocks: [{ paras: hard }] });

  const RG = GOD_TALE[GROUP_REP_HARD[gi]];
  out.push({ key: 'risk', h: '3장 · 평생 조심할 일과 피할 일', intro: '타고난 성질의 단점이에요. 미리 알면 피할 수 있어요.', blocks: [
    { h: '⚠️ 빠지기 쉬운 실수', paras: RG.risk.map(sentence) },
    { h: '🚫 평생 피하면 좋은 일', paras: [list([...RG.avoid, '내 기분이 가장 들뜬 날 큰 결정 내리기']) + '.', ...(low.pct <= 8 ? [`그리고 ${who}의 사주에는 「${low.mean}」이 적은 편이에요(${low.pct}%). ${low.fill}`] : [])] },
  ] });

  const myB = saju.pillars.year.branch; const dB = saju.pillars.day.branch;
  const spouseGods = gender === 'male' ? ['정재', '편재'] : ['정관', '편관'];
  const P = saju.pillars; const spots = [];
  for (const k of ['year', 'month', 'day', 'hour']) { if (!P[k]) continue; if (k !== 'day' && spouseGods.includes(tenGod(saju.dayMaster, P[k].stem))) spots.push(k); if (spouseGods.includes(tenGod(saju.dayMaster, BRANCH_MAIN_STEM[P[k].branch]))) spots.push(k); }
  const dayGod = tenGod(saju.dayMaster, BRANCH_MAIN_STEM[dB]);
  out.push({ key: 'people', h: '4장 · 나에게 맞는 사람과 도움이 되는 사람', blocks: [
    { h: '💗 나에게 맞는 짝', paras: [
      `배우자 자리에는 ${PLAIN_GOD[dayGod]}이 앉아 있어요. 그래서 ${SPOUSE_TYPE[dayGod]} 사람과 마음이 잘 맞아요. 이런 사람 곁에서는 ${who}도 가장 나다워져요.`,
      spots.length ? `사주에 「짝의 기운」이 ${new Set(spots).size}곳에 있어요. 인연이 없는 사주가 아니니 서두르지 않아도 돼요. 짝의 기운이 들어오는 해와 달(해마다 나오는 상세판에서 볼 수 있어요)에 마음을 열어 두세요.` : '사주에 「짝의 기운」이 겉으로 드러나 있지 않아요. 인연이 없다는 뜻이 아니라, 10년 흐름이나 어느 해에 짝의 기운이 들어올 때 인연이 또렷해진다는 뜻이에요. 그때를 기다리며 나를 먼저 가꾸면 돼요.',
      `띠로 보면 ${ANIMALS[SIX[myB]]}띠와 찰떡, ${tripleOf(myB).map((b) => ANIMALS[b]).join('·')}띠와 뜻이 잘 맞아요. 태어난 날로 보면 ${ANIMALS[SIX[dB]]}띠 사람이 곁에 있으면 마음이 편해요.`,
    ] },
    { h: '🤝 평생의 귀인', paras: [`${who}에게 가장 필요한 ${elWord(yong)}을 가진 ${E.zodiac} 사람이 귀인이 되기 쉬워요. ${GOD_TALE[GROUP_REP[GROUP_ORDER.indexOf(low.key)]].people}`] },
  ] });

  out.push({ key: 'body', h: '5장 · 건강: 먼저 챙길 곳', intro: '진단이 아니라 기운의 균형으로 보는 생활 습관이에요. 증상이 있으면 병원 진료가 먼저예요.', blocks: [{ paras: [
    `${elWord(over)}이 많은 사주는 ${BODY[over]} 쪽이 쉽게 지치고, ${elWord(weak)}이 적은 사주는 ${BODY[weak]} 쪽이 먼저 신호를 보내기 쉬워요.`,
    `${BODY_CARE[weak]} 넘치는 ${elWord(over)}은 ${BODY_EASE[over]}`,
  ] }] });
  const H = saju.heesin != null && saju.heesin !== yong ? EL_TALE[saju.heesin] : null;
  out.push({ key: 'work', h: '6장 · 나에게 맞는 일과 사업 분야', blocks: [
    { h: '💼 나는 이렇게 버는 사람', paras: [GROUP_MONEY[gi], ...(gp ? [`일하는 방식: ${sentence(gp.work)}`] : [])] },
    { h: `🏪 평생 잘 맞는 분야 (${elWord(yong)})`, paras: [`${elWord(yong)}이 흐르는 일을 하면 같은 노력으로 더 크게 남아요.`, ...E.biz.map(([f, r]) => `· ${f} — ${r}`), ...(H ? [`곁에서 돕는 ${elWord(saju.heesin)} 쪽도 좋아요: ${H.biz.slice(0, 3).map(([f]) => f).join(', ')}.`] : [])] },
    { h: '🧭 일을 고를 때 기준 하나', paras: [`일의 이름보다 「그 일에 ${elWord(yong)}이 흐르는가」를 보세요. ${E.nature.split('. ')[1] || E.nature} 이런 힘을 쓰는 자리라면, 어떤 직업이든 ${who}에게 맞는 일이 돼요.`] },
  ] });

  if (daewoon?.pillars?.length) {
    const ps = daewoon.pillars.slice(0, 9); const curI = Math.max(0, ps.findIndex((d) => curAge >= d.startAge && curAge <= d.endAge));
    const blocks = ps.map((d0, i) => {
      const d = { ...d0, god: d0.god || tenGod(saju.dayMaster, d0.stem) }; const G = GOD_TALE[d.god]; const tag = i < curI ? '지나온 길' : i === curI ? '지금' : i === curI + 1 ? '다음' : '앞날';
      const paras = i < curI ? [`${d.startAge}~${d.endAge}세에는 ${PLAIN_GOD[d.god]}이 흘렀어요. ${PAST[d.god]} 그 시절이 남긴 선물도 있어요. ${sentence(G.gift[1])}`]
        : i === curI ? [`지금 ${josa(who, '은/는')} ${PLAIN_GOD[d.god]}의 10년 안에 있어요. ${G.feel}`, `${G.why}`, `이 10년을 잘 지나는 법: ${list(G.fix)}.`]
          : [`${d.startAge}~${d.endAge}세에는 ${PLAIN_GOD[d.god]}이 불어와요. ${G.gift[0]}. 다만 ${G.risk[0].replace(/요$/, '요.')} 👉 ${sentence(G.fix[0])} ${i === curI + 1 ? `지금부터 ${josa(`「${G.goal}」`, '을/를')} 마음에 두고 준비하면 그 10년이 훨씬 편해져요.` : ''}`.trim()];
      return { h: `${tag} · ${d.startAge}~${d.endAge}세 ${d.score >= 70 ? '🌟' : ''}`.trim(), paras };
    });
    out.push({ key: 'seasons', h: '7장 · 10년마다 바뀌는 흐름: 지나온 때, 지금, 다음', intro: '10년마다 들어오는 기운이 바뀌어요. 지금이 힘들다면 그 이유가 여기 있어요.', blocks });
  }

  out.push({ key: 'fix', h: '8장 · 운을 좋게 하는 습관', blocks: [
    { h: `🌱 ${elWord(yong)}을 곁에 두는 법`, paras: [`${elWord(yong)}은 ${E.nature}`, list(E.bring) + '.', `색은 ${E.color}, 장소는 ${E.place}.`] },
    { h: '🎯 평생의 목표 하나', paras: [`${top.fill} 그리고 「${GOD_TALE[GROUP_REP[gi]].goal}」, 이 한 줄을 휴대폰 메모에 적어 두고 큰 결정을 할 때마다 다시 읽어 보세요.`] },
  ] });
  // 장 끝 한 줄: 다음 장에서 무엇을 알려 주는지 그대로(v0.51)
  const nextCliff = {
    me: `다음 장에서는 ${who}에게 비슷한 고비가 반복되는 이유를 ${elWord(over)}과 ${elWord(weak)}으로 설명해 드려요.`,
    hard: `다음 장에서는 평생 조심할 일 ${RG.risk.length + 1}가지와 피할 일을 알려 드려요.`,
    risk: '다음 장에서는 나에게 맞는 짝과 도움이 되는 사람, 잘 맞는 띠를 알려 드려요.',
    people: `다음 장에서는 ${elWord(weak)}이 적은 사주가 먼저 챙길 건강 부위를 알려 드려요.`,
    body: `다음 장에서는 ${elWord(yong)}이 필요한 ${who}에게 맞는 일과 사업 분야를 알려 드려요.`,
    work: '다음 장에서는 10년마다 바뀌는 흐름과 지금 지나고 있는 10년을 알려 드려요.',
    seasons: '다음 장에서는 어느 때든 쓸 수 있는, 운을 좋게 하는 습관을 알려 드려요.',
  };
  out.unshift(lifeBrief({ who, saju, gi, RG, yong, E, weak, daewoon, curAge }));
  out.forEach((sec) => { if (nextCliff[sec.key]) sec.blocks.push({ cliff: true, paras: [nextCliff[sec.key]] }); });
  return out;
}

/** v0.51 한눈에 정리(정통사주 맨 앞): 나는 어떤 사람 · 평생 할 일 · 피할 일 · 맞는 일 · 챙길 몸 · 지금 10년 */
function lifeBrief({ who, saju, gi, RG, yong, E, weak, daewoon, curAge }) {
  const G = GOD_TALE[GROUP_REP[gi]];
  const cur = daewoon?.pillars?.find((d) => curAge >= d.startAge && curAge <= d.endAge);
  const curGod = cur ? (cur.god || tenGod(saju.dayMaster, cur.stem)) : null;
  return { key: 'brief', h: '📌 한눈에 정리: 평생 기억할 할 일과 피할 일', intro: '자세한 이유는 1장부터 차례로 읽으면 돼요.', blocks: [
    { h: '한 줄 요약', paras: [`${josa(who, '은/는')} 「${GROUP_HEAR_TAG[gi]}」 사람이에요. 가장 필요한 기운은 ${elWord(yong)}이에요.`] },
    { h: '✅ 평생 꾸준히 할 일', paras: [...G.fix.map((x) => `· ${x}`), `· ${E.bring[0]}`] },
    { h: '⛔ 평생 피할 일', paras: RG.avoid.map((x) => `· ${x}`) },
    { h: '💼 잘 맞는 일', paras: [`· ${E.biz.slice(0, 3).map(([f]) => f).join(', ')}`] },
    { h: '🩺 먼저 챙길 몸', paras: [`· ${BODY[weak]} (자세히는 5장)`] },
    ...(curGod ? [{ h: '⏳ 지금 10년', paras: [`· ${cur.startAge}~${cur.endAge}세는 ${PLAIN_GOD[curGod]}이 들어오는 10년이에요. 이 10년에 가장 먼저 할 일: ${sentence(GOD_TALE[curGod].fix[0])}`] }] : []),
  ] };
}
const GROUP_HEAR_TAG = ['내 생각이 뚜렷하고 혼자서도 해내는', '말솜씨와 재주로 사람을 즐겁게 하는', '현실적이고 계산이 빠른', '책임감이 강해 믿고 맡길 수 있는', '생각이 깊고 아는 것이 많은'];

/** 정통사주 여는 문단(첫 장면) · 맺음 */
const LIFE_HOOK = [
  '말끝에 늘 힘이 실려 있고, 한번 정한 일은 누가 말려도 해내고 만다는 것',
  '어색한 자리에서도 먼저 웃음을 꺼내고, 눈이 반짝이는 순간이 유난히 많다는 것',
  '계산이 빠르고, 남들이 망설일 때 「그래서 얼마예요?」를 먼저 묻는다는 것',
  '약속 시간보다 늘 먼저 와 있고, 맡은 일은 끝까지 책임진다는 것',
  '조용히 듣고 있다가 한마디로 핵심을 짚고, 혼자 있는 시간을 꼭 챙긴다는 것',
];
export function lifeOpening(saju, who) {
  const tg = tenGodProfile(saju); const gi = GROUP_ORDER.indexOf([...tg.groups].sort((a, b) => b.pct - a.pct)[0].key);
  return `처음 만난 사람도 ${josa(who, '을/를')} 3분만 지켜보면 알아차리는 게 있어요. ${LIFE_HOOK[gi]}. 그건 우연이 아니라, 태어난 순간의 여덟 글자가 그렇게 짜여 있기 때문이에요.`;
}
export function lifeClosing(saju, who) {
  const yong = saju.yongsin;
  return { key: 'close', h: '맺음 · 정리', blocks: [{ paras: [
    `정리하면, 점수가 높은 10년에는 미뤄 둔 큰 목표를 시작하고, 점수가 낮은 10년에는 새 일을 줄이고 실력과 건강을 다지세요. 어느 때든 ${josa(elWord(yong), '을/를')} 곁에 두는 8장의 습관이 도움이 돼요.`,
    `해마다 생일 무렵에 이 책 맨 앞의 「한눈에 정리」를 다시 열어, 할 일을 지키고 있는지 확인해 보세요.`,
  ] }] };
}
const LOVE_SOLO = [
  '친구 모임·동호회처럼 편하게 어깨를 나란히 하는 자리에서 인연이 와요. 「친구 같은 사람」에게 마음을 열어 보세요.',
  '내가 즐겁게 웃는 모습이 가장 큰 매력이 되는 해예요. 취미 모임이나 배우는 자리에서 자연스럽게 만나요.',
  '활동 범위가 넓어지는 만큼 만남도 많아요. 다만 첫 만남에 너무 많이 쓰지 말고, 진심을 천천히 보여 주세요.',
  '소개나 일터처럼 「믿을 만한 자리」에서 오래 갈 인연이 와요. 성실한 사람에게 눈길을 주세요.',
  '나를 걱정해 주고 이야기를 들어 주는 사람이 인연이 돼요. 공부·상담·배움의 자리에서 만나기 쉬워요.',
];
const LOVE_PAIR = [
  '서로 자존심을 세우기 쉬워요. 이기려 하기보다 같은 편이 되어 주면 사이가 단단해져요.',
  '함께 맛있는 걸 먹고 웃는 시간이 사랑을 키워요. 다만 날카로운 농담은 아껴 두세요.',
  '돈 이야기를 미루지 말고, 함께 쓸 돈과 각자 쓸 돈을 정해 두면 다툼이 줄어들어요.',
  '책임이 커져 바쁜 해예요. 바쁠수록 짧은 연락 한 통이 사이를 지켜 줘요.',
  '기대고 싶은 마음이 커지는 해예요. 서운함은 짐작하지 말고 말로 물어보면 금방 풀려요.',
];
const BODY = ['간·눈·근육', '심장·혈압·잠', '위장·소화', '폐·호흡기·피부', '신장·방광·허리'];
const BODY_CARE = [
  '눈을 자주 쉬게 하고, 아침 스트레칭으로 근육을 풀어 주세요.',
  '밤늦게까지 깨어 있지 말고, 따뜻한 차와 가벼운 걷기로 마음을 데워 주세요.',
  '끼니를 거르지 말고, 천천히 꼭꼭 씹어 드세요. 위장을 지키는 가장 쉬운 방법이에요.',
  '맑은 공기 속에서 깊게 숨 쉬는 시간을 두고, 피부는 촉촉하게 지켜 주세요.',
  '물을 자주 마시고, 허리를 따뜻하게, 잠은 충분히 자 주세요.',
];
const BODY_EASE = [
  '한꺼번에 몰아서 하는 운동보다 꾸준한 산책으로 풀어 주면 좋아요.',
  '흥분하거나 화가 날 때 숨을 길게 내쉬는 연습으로 식혀 주면 좋아요.',
  '걱정을 오래 품지 말고 종이에 적어 내려놓으면 속이 편해져요.',
  '스스로를 다그치는 마음을 내려놓고, 하루 한 번 나를 칭찬해 주면 몸의 긴장이 풀려요.',
  '생각이 많을 때는 몸을 움직여 머리를 비우면 잠이 깊어져요.',
];
const SPOUSE_TYPE = {
  비견: '친구처럼 대등하게 어깨를 나란히 하는', 겁재: '함께 도전하고 서로 자극을 주는', 식신: '함께 맛있는 걸 먹고 편하게 웃는', 상관: '말이 잘 통하고 재치 있는',
  편재: '발이 넓고 활동적이며 나를 새로운 곳으로 데려가는', 정재: '성실하고 살림을 함께 꾸려 가는', 편관: '듬직하고 위기 때 앞장서 주는', 정관: '약속을 잘 지키고 바르게 사는',
  편인: '생각이 깊고 나만의 세계를 이해해 주는', 정인: '따뜻하게 품어 주고 나를 걱정해 주는',
};
const EL_OVER = [
  '한꺼번에 너무 많은 일을 벌이고 끝맺음이 약해지기 쉬워요.',
  '마음이 급해지고 쉽게 타올랐다 쉽게 지치기 쉬워요.',
  '걱정을 오래 품고 변화 앞에서 망설이기 쉬워요.',
  '스스로를 다그치고 말이 날카롭게 나가기 쉬워요.',
  '생각이 많아 결정을 미루고 잠이 얕아지기 쉬워요.',
];

// ======================================================================
// 무료 화면 맛보기(v0.50.2): 신년운세 책자 앞머리 · 내 사주 「이야기로 읽는 나」
// ======================================================================
/** 무료 책자 앞머리: 첫 장면 → 1장 부름(공감·이유·하늘 기운) → 2장 지금 넘고 있는 산(지난해) → 상세판 예고 */
export function bookletStory(ctx) {
  const { y, saju } = ctx; const who = ctx.name ? `${ctx.name} 님` : '당신';
  const ch = yearStoryChapters({ ...ctx, checks: ctx.checks || [] });
  const wind = ch.find((s) => s.key === 'wind'); const why = ch.find((s) => s.key === 'why');
  const best = [...y.months].sort((a, b) => b.score - a.score)[0];
  const trapN = (ch.find((s) => s.key === 'risk')?.blocks.filter((b) => !b.cliff && b.h?.startsWith('🔎')).length || 0) + GOD_TALE[y.year.god].risk.length;
  return {
    scene: `${y.sajuYear}년 12월의 어느 저녁, ${josa(who, '은/는')} 달력을 넘기다 ${best.solarMonth}월 칸의 메모를 보고 웃게 될지도 몰라요. 「그때 시작하길 정말 잘했다.」`,
    hook: `${y.sajuYear}년은 ${PLAIN_GOD[y.year.god]}이 들어오는 해예요. 가장 좋은 달은 ${best.solarMonth}월이니, 미뤄 둔 일은 이 달에 시작하세요.`,
    brief: ch.find((s) => s.key === 'brief'),
    chapters: [
      { h: wind.h, paras: [...wind.blocks[0].paras, ...(wind.blocks.find((b) => b.h?.startsWith('👀'))?.paras || [])] },
      { h: why.h, paras: why.blocks[0].paras.slice(0, 1) },
    ],
    cliff: `여기까지가 무료로 보는 부분이에요. 올해 조심할 일 ${trapN}가지와 대비법, 도움이 되는 사람과 띠, 나에게 맞는 일·사업 분야 6가지, 열두 달 풀이는 상세판 3장부터 볼 수 있어요.`,
    yong: saju.yongsin,
  };
}

/** 내 사주 「이야기로 읽는 나」: 정통사주 1장 + 2장 앞부분 + 예고 */
export function sajuStory(ctx) {
  const ch = lifeStoryChapters(ctx);
  const me = ch.find((s) => s.key === 'me'); const hard = ch.find((s) => s.key === 'hard');
  const who = ctx.name ? `${ctx.name} 님` : '당신';
  return {
    hook: lifeOpening(ctx.saju, who),
    brief: ch.find((s) => s.key === 'brief'),
    blocks: me.blocks.filter((b) => !b.cliff),
    hard: { h: hard.h, paras: hard.blocks[0].paras.slice(0, 2) },
    cliff: `${josa(who, '이/가')} 평생 조심할 일, 나에게 맞는 사람, 잘 맞는 일과 사업 분야, 10년마다 바뀌는 흐름은 「평생 정통사주」에서 볼 수 있어요.`,
  };
}
