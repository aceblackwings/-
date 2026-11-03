// 신년운세 책자(첫 화면 개편 1단계, 2026-11-03): 게이지·별 없이 「읽는」 한 해 풀이
// 총운을 여러 문단으로 자세히(한 해의 기운 → 내 사주와 만나는 방식 → 10년 큰 흐름 속 → 타고난 그릇과 올해 → 한 해의 모양 → 잘 풀리는 점·챙길 점 → 한 해의 열쇠)
// 그 아래 분야별 풀이(재물·직장·애정·건강·대인). 모든 값은 period.js yearOf·saju·격국에서 나온다(같은 날짜면 같은 글)
// 순수 로직만(테스트: tests/booklet.test.mjs)
import { GOD_READING, partsStory } from './reading.js';
import { YEAR_HEADLINE, seasonsOf, keyMonths, monthRange, friendlyZodiac } from './yearcard.js';
import { categoryScores, branchRelation } from './period.js';
import { ELEMENT_LUCK } from './fortune.js';
import { STEMS, BRANCHES, ANIMALS, ELEMENT_KO, ELEMENT_HANJA, STEM_ELEMENT, BRANCH_MAIN_STEM, tenGod } from './saju.js';
import { GYEOK_PROFILE } from './gyeokguk.js';
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
  ['wealth', '재물운'], ['career', '직장·학업운'], ['love', '애정운'], ['health', '건강운'], ['social', '대인운'],
];
const FIELD_ACT = {
  wealth: '저축 계획·지출 정리·중요한 계약은 이 달에 맞춰 보세요.',
  career: '지원·발표·면접·새 업무 제안은 이 달에 꺼내 보세요.',
  love: '고백·기념일·함께 가는 여행은 이 달에 잡아 보세요.',
  health: '운동 시작·건강검진 예약·생활 습관 바꾸기는 이 달에 해 보세요.',
  social: '모임·오랜만의 연락·도움 부탁은 이 달에 해 보세요.',
};
const CONCERN_FIELD = { money: 'wealth', love: 'love', job: 'career', study: 'career', health: 'health', relation: 'social', people: 'social' };

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
  const out = [strengthMeet(saju, y.year.god), ...partsStory(y.year.parts || [], saju)];
  const p = y.year.pillar;
  const rel = branchRelation ? branchRelation(saju.pillars.day.branch, p.branch) : null;
  if (rel === 'combine' && !out.some((t) => t.includes('합'))) out.push(`그해의 ${BRANCHES[p.branch]}가 내 일지 ${BRANCHES[saju.pillars.day.branch]}와 합을 이뤄, 손발이 맞는 사람과 일이 찾아오기 쉬워요.`);
  if (rel === 'clash' && !out.some((t) => t.includes('충'))) out.push(`그해의 ${BRANCHES[p.branch]}가 내 일지 ${BRANCHES[saju.pillars.day.branch]}와 마주 보며 부딪혀(충), 이사·이직·관계처럼 움직임이 생기기 쉬워요. 미리 계획해 두면 좋은 변화로 바뀌어요.`);
  const js = saju.johu?.stems || [];
  if (js.includes(p.stem)) out.push(`게다가 그해 천간 ${stemLabel(p.stem)}(${STEM_IMAGE[p.stem]})${hasBatchim(stemLabel(p.stem)) ? '은' : '는'} 내 사주의 계절 균형을 맞춰 주는 글자(조후)라, 몸과 마음이 한결 편안해져요.`);
  return out;
}

/** 신강·신약과 그해 십신: 힘을 받는 해인지, 힘을 쓰는 해인지 */
function strengthMeet(saju, god) {
  const g = GROUP[god]; const support = g === 0 || g === 4;
  const me = `${saju.strength === '신강' ? '타고난 기운이 센 편(신강)' : saju.strength === '신약' ? '타고난 기운이 여린 편(신약)' : '타고난 기운이 고른 편(중화)'}`;
  if (saju.strength === '신약') return support
    ? `${me}인데, 그해에는 나를 받쳐 주는 ${GROUP_NAME[g]}이 들어와 든든한 뒷배가 생기는 해예요. 혼자 버티던 일에 힘이 실려요.`
    : `${me}인데, 그해에는 ${GROUP_NAME[g]}이 들어와 해야 할 일이 많아지는 해예요. 체력과 시간을 나눠 쓰고, 도움을 청하는 것이 오히려 실력이에요.`;
  if (saju.strength === '신강') return support
    ? `${me}인데, 그해에도 ${GROUP_NAME[g]}이 더해져 힘이 넘치는 해예요. 넘치는 힘을 나누고 베풀수록 운이 돌아와요.`
    : `${me}이라, 그해의 ${GROUP_NAME[g]}이 넘치는 힘을 쓸 곳을 만들어 줘요. 일을 벌이고 결과를 내기 좋은 해예요.`;
  return `${me}이라 그해의 ${GROUP_NAME[g]}을 무리 없이 받아 쓸 수 있어요. 균형을 지키며 꾸준히 가면 돼요.`;
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
export function buildBooklet({ y, thisYear, saju, gyeok, name = '', concern = null }) {
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
        `한 해를 한마디로 하면 「${H.title}」, ${toneOf(y.year.score)} 해예요. ${diff > 2 ? `올해(${thisYear.sajuYear}년)보다 흐름이 한결 나아져요.` : diff < -2 ? `올해(${thisYear.sajuYear}년)보다 속도를 조금 늦추면 더 단단해져요.` : `올해(${thisYear?.sajuYear ?? ''}년)와 비슷한 흐름을 차분히 이어 가요.`}`,
      ],
    },
    { h: '내 사주와 만나는 방식', paras: [meetLines(y, saju).join(' ')] },
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
