// 신년운세 책자(첫 화면 개편 1단계, 2026-11-03): 게이지·별 없이 「읽는」 한 해 풀이
// 총운을 여러 문단으로 자세히(한 해의 기운 → 내 사주와 만나는 방식 → 10년 큰 흐름 속 → 타고난 그릇과 올해 → 한 해의 모양 → 잘 풀리는 점·챙길 점 → 한 해의 열쇠)
// 그 아래 분야별 풀이(재물·직장·애정·건강·대인). 모든 값은 period.js yearOf·saju·격국에서 나온다(같은 날짜면 같은 글)
// 순수 로직만(테스트: tests/booklet.test.mjs)
import { GOD_READING, partsStory, stageLine } from './reading.js';
import { YEAR_HEADLINE, seasonsOf, keyMonths, monthRange, friendlyZodiac } from './yearcard.js';
import { categoryScores } from './period.js';
import { ELEMENT_LUCK } from './fortune.js';
import { STEMS, BRANCHES, ANIMALS, ELEMENT_KO, ELEMENT_HANJA, STEM_ELEMENT, BRANCH_MAIN_STEM, tenGod } from './saju.js';
import { GYEOK_PROFILE } from './gyeokguk.js';
import { incomingRelations } from './relations.js';
import { STEM_IMAGE, stemLabel } from './johu.js';

const COLOR = ['푸른', '붉은', '노란', '흰', '검은'];
const GROUP = { 비견: 0, 겁재: 0, 식신: 1, 상관: 1, 편재: 2, 정재: 2, 편관: 3, 정관: 3, 편인: 4, 정인: 4 };
const GROUP_NAME = ['나와 같은 기운(비겁)', '재능을 펼치는 기운(식상)', '결실을 거두는 기운(재성)', '책임과 자리의 기운(관성)', '배움과 도움의 기운(인성)'];
const GYEOK_GROUP = { 건록격: 0, 양인격: 0, 월겁격: 0 };
const mod = (n, m) => ((n % m) + m) % m;
const el = (e) => `${ELEMENT_HANJA[e]}(${ELEMENT_KO[e]})`;
const hasBatchim = (w) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return c >= 0 && c <= 11171 && c % 28 !== 0; };
const ro = (w) => (hasBatchim(w) && (w.charCodeAt(w.length - 1) - 0xac00) % 28 !== 8 ? '으로' : '로');
const sentence = (t) => { const x = String(t).trim(); return /[.!?]$/.test(x) ? x : `${x}.`; };

export const FIELD_ORDER = [
  ['wealth', '재물운'], ['career', '직장·학업운'], ['love', '애정운'], ['family', '가족운'], ['health', '건강운'], ['social', '대인운'],
];
const FIELD_ACT = {
  wealth: '저축 계획·지출 정리·중요한 계약은 이 달에 맞춰 보세요.',
  career: '지원·발표·면접·새 업무 제안은 이 달에 꺼내 보세요.',
  love: '고백·기념일·함께 가는 여행은 이 달에 잡아 보세요.',
  health: '운동 시작·건강검진 예약·생활 습관 바꾸기는 이 달에 해 보세요.',
  social: '모임·오랜만의 연락·도움 부탁은 이 달에 해 보세요.',
};
// 가입 때 고른 고민(character.js CONCERNS) → 분야
const CONCERN_FIELD = { exam: 'career', job: 'career', wealth: 'wealth', business: 'wealth', love: 'love', marriage: 'love', health: 'health', people: 'social', change: 'career' };

// 가족운: 그해 십신 무리별 집안 흐름(가족 전체) + 육친(성별에 따라 그 기운이 가리키는 가족)
const FAMILY_GROUP = [
  { line: '형제·친구 같은 가족과 어깨를 나란히 하는 해예요. 집안일을 나눠 맡으면 서로 든든해지고, 가족끼리 돈이 오갈 때는 금액과 날짜를 분명히 해 두면 마음이 편해요.', act: '가족 단체방에 이번 달 할 일 하나씩 나눠 적기' },
  { line: '돌보고 챙겨 주는 마음이 커지는 해예요. 자녀·조카·아랫사람에게 신경 쓸 일이 늘지만, 잔소리보다 칭찬 한마디가 훨씬 멀리 가요.', act: '가족 한 명에게 구체적인 칭찬 한마디 하기' },
  { line: '집안 살림과 돈 이야기가 화제가 되기 쉬운 해예요. 이사·가전·저축처럼 함께 정할 일은 가족 회의로 계획을 세우면 오히려 사이가 단단해져요.', act: '가족과 올해 함께 모을 돈 목표 하나 정하기' },
  { line: '집안에서 맡는 책임이 커지는 해예요. 혼자 다 짊어지기보다 역할을 나누면, 가족이 나를 더 믿고 의지하게 돼요.', act: '집안일 하나를 다른 가족에게 정중히 부탁하기' },
  { line: '부모님·어른의 관심과 도움이 커지는 해예요. 집·계약 같은 문서 일이 생기기 쉽고, 어른께 먼저 안부를 여쭈면 뜻밖의 도움이 돌아와요.', act: '부모님·어른께 안부 전화 한 통 드리기' },
];
// 육친: [여성, 남성] 기준 그 십신 무리가 가리키는 가족
const FAMILY_KIN = [
  ['형제자매·친구', '형제자매·친구'],
  ['자녀', '장모·아랫사람'],
  ['아버지', '배우자·아버지'],
  ['배우자', '자녀'],
  ['어머니', '어머니'],
];

/** 점수를 말로 (숫자는 부풀리지 않고 해석만) */
export function toneOf(score) {
  if (score >= 75) return '기운이 시원하게 뻗는';
  if (score >= 65) return '순풍이 부는';
  if (score >= 55) return '차분히 쌓아 가는';
  if (score >= 45) return '숨을 고르며 다지는';
  return '안을 단단히 채우는';
}

/** 그해 이름: 丁未년 → 붉은 양의 해 */
export const yearName = (p) => `${STEMS[p.stem]}${BRANCHES[p.branch]}년 · ${COLOR[STEM_ELEMENT[p.stem]]} ${ANIMALS[p.branch]}의 해`;

/** 격국과 그해 십신의 만남 */
function gyeokMeet(gyeok, god) {
  const g = GYEOK_GROUP[gyeok.name] ?? GROUP[gyeok.god];
  const y = GROUP[god]; const P = GYEOK_PROFILE[gyeok.name];
  const lead = `타고난 그릇은 ${gyeok.name}, 「${P.title}」이에요.`;
  if (g === y) return `${lead} 올해 들어오는 ${god} 기운이 그릇과 같은 성질이라, 타고난 강점인 ${P.strengths[0]}${hasBatchim(P.strengths[0]) ? '이' : '가'} 그대로 드러나는 해예요. 익숙한 방식으로 밀고 나갈 때 결과가 커져요.`;
  if (mod(g - y, 5) === 1) return `${lead} 올해의 ${GROUP_NAME[y]}이 그릇을 키워 주는 자리라, 그릇이 한 뼘 넓어지는 해예요. 새로 배우거나 맡는 일이 나중에 큰 밑천이 돼요.`;
  if (mod(y - g, 5) === 1) return `${lead} 그릇에 담긴 힘이 올해의 ${GROUP_NAME[y]}${ro(GROUP_NAME[y])} 흘러 나가는 해라, 그동안 쌓은 것을 밖으로 펼쳐 결실로 바꾸기 좋아요.`;
  if (mod(y - g, 5) === 2) return `${lead} 올해의 ${GROUP_NAME[y]}이 그릇을 다듬는 자리라, 조금 버겁게 느껴지는 일이 오히려 그릇을 단단하게 만들어 줘요. ${P.care}`;
  return `${lead} 타고난 강점으로 올해의 ${GROUP_NAME[y]}을 다스리는 해라, ${P.strengths[1]}${hasBatchim(P.strengths[1]) ? '을' : '를'} 살리면 일이 손에 잘 잡혀요.`;
}

/** 대운(10년 큰 흐름) 속 그해 */
function daewoonLine(y, name) {
  const d = y.daewoon; if (!d) return null;
  const R = GOD_READING[d.god];
  const gap = y.year.score - d.score;
  return `${name}의 지금 10년 큰 흐름(대운, ${d.startAge}~${d.endAge}세)은 「${R.keyword}」의 시기예요. ${sentence(R.core.split('. ')[0])} ${gap >= 5 ? '그 10년 안에서 이 해는 흐름이 한결 밝게 열리는 해라, 미뤄 둔 일을 꺼내기 좋아요.' : gap <= -5 ? '그 10년 안에서 이 해는 잠시 속도를 늦추고 안을 다지는 해라, 서두르지 않을수록 다음 해가 편해져요.' : '그 10년의 흐름을 고르게 이어 가는 해라, 하던 일을 꾸준히 밀고 나가면 돼요.'}`;
}

/** 내 사주와 만나는 방식: 용신·기신, 일지와의 합·충, 조후 글자 */
function meetLines(y, saju) {
  const ps = partsStory(y.year.parts || [], saju);
  const out = [strengthMeet(saju, y.year.god), ...(ps.length ? [ps.join(' ')] : [])];
  const p = y.year.pillar;
  // v0.37 그해 글자와 원국의 관계(합·충·형·파·해·원진): 뜻 + 이렇게 쓰면 좋아요. 점수 근거에 이미 나온 일지 합·충은 겹치지 않게
  const scored = new Set((y.year.parts || []).map((x) => x.kind));
  const rels = incomingRelations(saju.pillars, p, '그해')
    .filter((r) => !(r.at === 'day' && ((r.kind === 'sixCombine' && scored.has('combine')) || (r.kind === 'clash' && scored.has('clash')))))
    .slice(0, 2);
  rels.forEach((r) => out.push(`${r.text} ${r.act}`));
  const js = saju.johu?.stems || [];
  if (js.includes(p.stem)) out.push(`게다가 그해 천간 ${stemLabel(p.stem)}(${STEM_IMAGE[p.stem]})${hasBatchim(stemLabel(p.stem)) ? '은' : '는'} 내 사주의 계절 균형을 맞춰 주는 글자(조후)라, 몸과 마음이 한결 편안해져요.`);
  return out;
}

/** 신강·신약과 그해 십신: 힘을 받는 해인지, 힘을 쓰는 해인지 */
function strengthMeet(saju, god) {
  const g = GROUP[god]; const support = g === 0 || g === 4;
  const LV = { 극신약: '타고난 기운이 아주 여린 편(극신약)', 신약: '타고난 기운이 여린 편(신약)', 중화신약: '타고난 기운이 고른 편이면서 조금 여린 쪽(중화신약)', 중화: '타고난 기운이 고른 편(중화)', 중화신강: '타고난 기운이 고른 편이면서 조금 센 쪽(중화신강)', 신강: '타고난 기운이 센 편(신강)', 극신강: '타고난 기운이 아주 센 편(극신강)' };
  const me = LV[saju.strengthLevel] || LV[saju.strength];
  if (saju.strength === '신약') return support
    ? `${me}인데, 그해에는 나를 받쳐 주는 ${GROUP_NAME[g]}이 들어와 든든한 뒷배가 생기는 해예요. 혼자 버티던 일에 힘이 실려요.`
    : `${me}인데, 그해에는 ${GROUP_NAME[g]}이 들어와 해야 할 일이 많아지는 해예요. 체력과 시간을 나눠 쓰고, 도움을 청하는 것이 오히려 실력이에요.`;
  if (saju.strength === '신강') return support
    ? `${me}인데, 그해에도 ${GROUP_NAME[g]}이 더해져 힘이 넘치는 해예요. 넘치는 힘을 나누고 베풀수록 운이 돌아와요.`
    : `${me}이라, 그해의 ${GROUP_NAME[g]}이 넘치는 힘을 쓸 곳을 만들어 줘요. 일을 벌이고 결과를 내기 좋은 해예요.`;
  return `${me}이라 그해의 ${GROUP_NAME[g]}을 무리 없이 받아 쓸 수 있어요. 균형을 지키며 꾸준히 가면 돼요.`;
}

/** 가족운: 애정·대인 점수를 함께 본 흐름 + 그해·속 기운의 가족 자리 */
function familyField(y, god, inner, gender, focus, used) {
  const gi = gender === 'male' ? 1 : 0;
  const c = categoryScores(y.year.score, god); const v = Math.round((c.love + c.social) / 2);
  const g = GROUP[god]; const ig = GROUP[inner];
  const kin = FAMILY_KIN[g][gi]; const ikin = FAMILY_KIN[ig][gi];
  const list = y.months.map((m, i) => { const x = categoryScores(m.score, m.god); return { v: x.love + x.social, m, i }; }).sort((a, b) => b.v - a.v || a.i - b.i);
  const best = list.find((x) => !used.has(x.m.solarMonth) && x.v >= list[0].v - 6) || list[0]; used.add(best.m.solarMonth);
  return {
    key: 'family', label: '가족운', focus, title: `${toneOf(v)} 흐름`,
    paras: [
      FAMILY_GROUP[g].line,
      `육친으로 보면 그해 들어오는 ${god} 기운은 ${kin}의 자리예요. 그래서 ${kin}${hasBatchim(kin) ? '과' : '와'}의 일이 한 해의 중심이 되기 쉬워요.${ig !== g ? ` 바탕에는 ${ikin}의 자리인 ${inner} 기운도 흘러, ${ikin}에게도 마음을 써 주면 집안이 고르게 편안해져요.` : ''}`,
      `가족과 함께하기 좋은 달은 ${best.m.solarMonth}월(${monthRange(y.months, best.i)})이에요. 가족 여행·식사·중요한 의논은 이 달에 잡아 보세요. 올해의 작은 실천: ${FAMILY_GROUP[g].act}.`,
    ],
  };
}

/** 분야별 그해 가장 힘이 실리는 달 */
function bestMonthFor(y, key, used = new Set()) {
  const list = y.months.map((m, i) => ({ v: categoryScores(m.score, m.god)[key], m, i })).sort((a, b) => b.v - a.v || a.i - b.i);
  // 분야마다 같은 달만 나오지 않게: 1위와 3점 안쪽이면 아직 안 쓴 달을 고름
  const best = list.find((x) => !used.has(x.m.solarMonth) && x.v >= list[0].v - 3) || list[0];
  used.add(best.m.solarMonth);
  return { month: best.m.solarMonth, range: monthRange(y.months, best.i) };
}

/**
 * 책자 전체
 * @param y yearOf(그해) · thisYear yearOf(올해) · saju · gyeok(analyzeGyeok) · name 부를 이름 · concern 고민 키
 */
export function buildBooklet({ y, thisYear, saju, gyeok, name = '', concern = null, gender = 'female' }) {
  const who = name ? `${name} 님` : '당신';
  const god = y.year.god; const R = GOD_READING[god]; const H = YEAR_HEADLINE[god];
  const p = y.year.pillar;
  const inner = tenGod(saju.dayMaster, BRANCH_MAIN_STEM[p.branch]); const I = GOD_READING[inner];
  const me = saju.dayMaster;
  const diff = thisYear ? y.year.score - thisYear.year.score : 0;
  const seasons = seasonsOf(y.months); const best = seasons.find((s) => s.tone === 'best'); const slow = seasons.find((s) => s.tone === 'slow');
  const km = keyMonths(y);
  const L = ELEMENT_LUCK[saju.yongsin];

  const general = [
    {
      h: '한 해의 기운',
      paras: [
        `${y.sajuYear}년은 ${yearName(p)}예요. 일간이 ${stemLabel(me)}(${STEM_IMAGE[me]})인 ${who}에게 그해 천간 ${stemLabel(p.stem)}(${STEM_IMAGE[p.stem]})${hasBatchim(stemLabel(p.stem)) ? '은' : '는'} ${god}, 「${R.keyword}」의 기운으로 들어와요. ${R.core}`,
        inner === god
          ? `바탕에 깔린 지지 ${BRANCHES[p.branch]}도 같은 ${god} 기운이라, 겉과 속이 한 방향을 가리켜요. 올해의 성격이 그만큼 또렷하게 드러나요.`
          : `바탕에 깔린 지지 ${BRANCHES[p.branch]}에는 ${inner}, 「${I.keyword}」의 기운이 흘러요. ${sentence(I.core.split('. ')[0])} 겉으로는 ${R.keyword}, 속으로는 ${I.keyword}${hasBatchim(I.keyword) ? '이' : '가'} 함께 움직이는 해예요.`,
        stageLine(me, p.branch, god, '그해에는').text,
        `한 해를 한마디로 하면 「${H.title}」, ${toneOf(y.year.score)} 해예요. ${diff > 2 ? `올해(${thisYear.sajuYear}년)보다 흐름이 한결 나아져요.` : diff < -2 ? `올해(${thisYear.sajuYear}년)보다 속도를 조금 늦추면 더 단단해져요.` : `올해(${thisYear?.sajuYear ?? ''}년)와 비슷한 흐름을 차분히 이어 가요.`}`,
      ],
    },
    { h: '내 사주와 만나는 방식', paras: meetLines(y, saju) },
    ...(y.daewoon ? [{ h: '10년 큰 흐름 속의 한 해', paras: [daewoonLine(y, who)] }] : []),
    ...(gyeok ? [{ h: '타고난 그릇과 올해', paras: [gyeokMeet(gyeok, god)] }] : []),
    {
      h: '한 해의 모양',
      paras: [
        `계절로 보면 ${best.label}(${best.months.join('·')}월)에 흐름이 가장 좋아요. 「${best.keyword}」의 기운이 모이는 때라 ${best.advice}${slow ? ` ${slow.label}은 ${slow.word}이라 ${slow.advice}` : ' 큰 굴곡 없이 고르게 흘러가는 한 해예요.'}`,
        `꼭 기억할 달은 ${km.filter((m) => m.kind === 'good').map((m) => `${m.month}월(${m.range})`).join('과 ')}이에요. 중요한 시작·약속·지원은 이때 잡아 보세요. ${km.find((m) => m.kind === 'caution').month}월(${km.find((m) => m.kind === 'caution').range})에는 ${sentence(km.find((m) => m.kind === 'caution').line).replace(/^./, (c) => c)}`,
      ],
    },
    {
      h: '잘 풀리는 점 · 챙길 점',
      paras: [
        `잘 풀리는 점: ${R.good.map((t) => sentence(t)).join(' ')}`,
        `챙길 점: ${R.watch.map((t) => sentence(t)).join(' ')} 미리 알고 있으면 충분히 다룰 수 있는 것들이에요.`,
      ],
    },
    {
      h: '한 해의 열쇠',
      paras: [
        `${who}에게 가장 필요한 기운은 ${el(saju.yongsin)}이에요. ${L.color} 계열의 물건, ${L.direction} 방향이 한 해 내내 힘이 되고, 행운의 숫자는 ${L.numbers.join('·')}예요. 힘이 되는 띠는 ${friendlyZodiac(saju.pillars.year.branch).join('·')}띠예요.`,
        `올해의 실천: ${R.tips.map((t) => sentence(t)).join(' ')}`,
      ],
    },
  ];

  const cats = categoryScores(y.year.score, god); const icats = categoryScores(y.year.score, inner);
  const focus = CONCERN_FIELD[concern];
  const order = focus ? [FIELD_ORDER.find(([k]) => k === focus), ...FIELD_ORDER.filter(([k]) => k !== focus)] : FIELD_ORDER;
  const used = new Set();
  const fields = order.map(([k, label]) => {
    if (k === 'family') return familyField(y, god, inner, gender, k === focus, used);
    const bm = bestMonthFor(y, k, used);
    const v = Math.round((cats[k] * 2 + icats[k]) / 3);
    return {
      key: k, label, focus: k === focus,
      title: `${toneOf(v)} 흐름`,
      paras: [
        `${sentence(R.fields[k])} ${inner !== god ? sentence(I.fields[k].split('. ')[0]) : ''}`.trim(),
        `${label.replace('운', '')}에 가장 힘이 실리는 달은 ${bm.month}월(${bm.range})이에요. ${FIELD_ACT[k]}`,
      ],
    };
  });

  return {
    year: y.sajuYear, name: yearName(p), title: H.title, score: y.year.score, god,
    lead: `${who}의 ${y.sajuYear}년은 「${H.title}」. ${sentence(R.core.split('. ')[0])}`,
    general, fields,
  };
}

/**
 * 오늘의 운세 (첫 화면, 2026-11-03 사용자 선택: A 수호신의 아침 편지 + C 오늘의 세 가지 질문)
 * 편지 = 수호신 말투(닭띠만 존댓말, 나머지 다정한 반말), 질문 3개 = 돈·연락·결정. 숫자는 그대로 두고 해석과 행동만
 */
const FIELD_KO = { wealth: '재물', love: '애정', career: '일·공부', health: '건강', social: '사람 사이' };
const DOW = '일월화수목금토';
const FIELD_NUDGE = {
  casual: { wealth: '작은 기회가 오면 망설이지 말고 잡아 봐.', love: '마음 가는 사람이 있으면 먼저 한마디 건네 봐.', career: '생각해 둔 의견이 있다면 오늘 꺼내 봐.', health: '가볍게 몸을 움직이면 하루가 더 개운할 거야.', social: '오랜만에 떠오르는 사람에게 안부를 보내 봐.' },
  polite: { wealth: '작은 기회가 오면 망설이지 말고 잡아 보세요.', love: '마음 가는 분이 있으면 먼저 한마디 건네 보세요.', career: '생각해 둔 의견이 있다면 오늘 꺼내 보세요.', health: '가볍게 몸을 움직이면 하루가 더 개운할 거예요.', social: '오랜만에 떠오르는 분께 안부를 보내 보세요.' },
};
const callName = (name, polite) => (!name ? '' : polite ? `${name} 님, ` : `${name}${hasBatchim(name) ? '아' : '야'}, `);
const isWa = (w) => (hasBatchim(w) ? '이' : '');

// 세 가지 질문의 덧붙임 말(해요체). 점수 구간은 fortune.js tierOf와 같음(40·60·80)
const tier = (v) => (v >= 80 ? 3 : v >= 60 ? 2 : v >= 40 ? 1 : 0);
const QA_MORE = {
  wealth: ['결제 버튼 앞에서 열까지 세어 보면 새는 돈이 줄어요.', '큰 거래보다 가계부 정리 같은 관리에 힘을 쓰면 좋아요.', '작은 이익이 들어오는 흐름이에요. 정산과 받을 돈을 챙겨 보세요.', '재물 기운이 강하게 들어와요. 좋은 기회가 오면 놓치지 마세요.'],
  love: ['말보다 작은 행동으로 마음을 보여 주면 오해가 풀려요.', '가벼운 안부 한 줄이 관계를 따뜻하게 데워 줘요.', '호감을 얻기 쉬운 날이에요. 먼저 웃으며 다가가 보세요.', '매력이 빛나는 날이에요. 데이트나 고백에도 좋은 기운이에요.'],
  social: ['오늘은 내 말보다 상대 말을 끝까지 들어 주는 쪽이 좋아요.', '약속 시간만 잘 지켜도 신뢰가 쌓여요.', '사람 사이에서 기회가 생겨요. 모임에 얼굴을 비춰 보세요.', '귀한 인연이 다가오는 날이에요. 새로운 만남을 반겨 보세요.'],
};

export function todayLetter(f, { name = '', animal = '', polite = false } = {}) {
  const best = ['wealth', 'love', 'career', 'health', 'social'].reduce((a, b) => (f.scores[b] > f.scores[a] ? b : a));
  const dow = DOW[new Date(Date.UTC(f.date.year, f.date.month - 1, f.date.day)).getUTCDay()];
  const time = f.luck.time.split(' (')[0];
  const T = f.info.title; const P = polite;
  const lines = [
    `${callName(name, P)}오늘은 「${T}」${P ? (hasBatchim(T) ? '이에요' : '예요') : `${isWa(T)}야`}.`,
    `오늘은 ${FIELD_KO[best]}에 힘이 실려${P ? '요' : ''}. ${FIELD_NUDGE[P ? 'polite' : 'casual'][best]}`,
    `${time} 사이가 ${P ? '가장 좋은 시간이에요' : '네 시간이야'}. ${f.luck.color} 소품을 하나 챙겨 ${P ? '가세요' : '가'}.`,
    `「${f.info.caution}」만 한 번 더 ${P ? '살펴 주세요' : '살피자'}.${f.scores.total < 55 ? (P ? ' 조금 느린 하루여도 괜찮아요. 천천히 가도 돼요.' : ' 조금 느린 하루여도 괜찮아. 천천히 가도 돼.') : ''}`,
  ];
  const sign = `— 오늘도 ${P ? '곁에 있는' : '네 편인'} ${animal ? `${animal} ` : ''}수호신`;

  const w = f.scores.wealth; const rel = Math.max(f.scores.love, f.scores.social); const relKey = f.scores.love >= f.scores.social ? 'love' : 'social';
  const c = Math.round((f.scores.career + f.scores.total) / 2);
  const qa = [
    { q: '오늘 돈 써도 될까요?', a: `${w >= 70 ? '좋아요. 필요한 곳이라면 시원하게 쓰셔도 돼요.' : w >= 60 ? '필요한 곳이라면 괜찮아요. 쓰기 전에 한 번만 더 따져 보세요.' : '큰 지출은 하루 미뤄도 좋아요. 오늘은 지키는 쪽이 이득이에요.'} ${QA_MORE.wealth[tier(w)]}` },
    { q: '먼저 연락해도 될까요?', a: `${rel >= 68 ? '좋아요. 먼저 다가가면 반가워할 거예요.' : rel >= 58 ? '짧고 가벼운 안부라면 좋아요.' : '오늘은 듣는 쪽이 더 잘 맞아요. 답장을 기다려 주는 여유를 가져 보세요.'} ${QA_MORE[relKey][tier(f.scores[relKey])]}` },
    { q: '중요한 결정, 오늘 해도 될까요?', a: c >= 70 ? `좋은 날이에요. ${time} 사이를 노려 보세요.` : c >= 60 ? '준비가 됐다면 괜찮아요. 마지막으로 한 번만 확인하고 정하세요.' : '오늘은 정리하는 날로 쓰고, 결정은 흐름이 좋은 날로 옮겨 보세요.' },
  ].map((x) => ({ ...x, a: x.a.trim() }));
  return {
    head: `${f.date.month}월 ${f.date.day}일(${dow})`,
    from: `${animal ? `${animal} ` : ''}수호신의 아침 편지`,
    lines, sign, qa,
    why: `왜 그런지: 오늘 일진 ${f.pillar ? `${STEMS[f.pillar.stem]}${BRANCHES[f.pillar.branch]} · ` : ''}${f.tenGod}의 날 · ${toneOf(f.scores.total)} 하루`,
  };
}
