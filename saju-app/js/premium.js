// 유료 상세 풀이(v0.46, 2026-11-04 사용자 결정 「990원 상세판부터, 4,900원 평생 정통사주·궁합 상세도」)
// - 무료 책자(booklet.js, 약 4,500자)에서 다 못 한 이야기를 길게: 그해 상세판(약 1만 5천~2만 자), 평생 정통사주 종합, 궁합 상세
// - 모든 글은 엔진 값(period.js·saju.js·relations.js·yearcheck.js…)에서 만들어 같은 입력이면 늘 같은 글
// - 설계 원칙 3: 결제는 「더 자세히 읽기」만 연다. 점수는 무료 화면과 같은 값(여기서 점수를 바꾸지 않음)
// - 순수 로직만(테스트: tests/premium.test.mjs — 분량·조사·금지어·결정성)
import { josa, iyeyo, hasBatchim } from './josa.js';
import { GOD_READING, crossLine, turnLine, STAGE_PERIOD } from './reading.js';
import { categoryScores, monthDays, yearOf } from './period.js';
import { monthRange, seasonsOf, keyMonths } from './yearcard.js';
import { ELEMENT_LUCK, DAY_MASTER_PROFILE } from './fortune.js';
import { STEMS, BRANCHES, STEMS_KO, BRANCHES_KO, ANIMALS, ELEMENT_KO, ELEMENT_HANJA, STEM_ELEMENT, BRANCH_MAIN_STEM, tenGod } from './saju.js';
import { incomingRelations, natalRelations, REL_INFO } from './relations.js';
import { STEM_IMAGE, stemLabel, johuSentence } from './johu.js';
import { yearChecks, ORGAN } from './yearcheck.js';
import { FIELD_ORDER, FIELD_WATCH, yearName, ageStage, ageLine } from './booklet.js';
import { GYEOK_PROFILE } from './gyeokguk.js';
import { tenGodProfile, pillarReadings, natalWatch } from './natal.js';
import { buildIlju } from './ilju.js';
import { twelveStage, HIDDEN_STEMS, sinsalOf, sinsal12Of, SINSAL12_NOTE } from './expert.js';
import { dateToJdn, jdnToDate } from './lunar.js';

// ---------- 상품 ----------
export const PRODUCTS = {
  year: { kind: 'year', icon: '📜', label: '상세 운세', price: 990, desc: '12달 풀이 · 분야 8개 전략 · 조심할 달 대비 · 나만의 보정' },
  life: { kind: 'life', icon: '🀄', label: '평생 정통사주 종합', price: 2900, desc: '여덟 글자 지도 · 일간·일주 · 오행·용신 · 격국 · 십성 · 신살 · 대운 10년마다' },
  compat: { kind: 'compat', icon: '💞', label: '궁합 상세', price: 990, desc: '두 사람의 본바탕 · 일간·일지 관계 · 서로 채우는 기운 · 다툼과 푸는 말 · 함께할 달' },
  bundle: { kind: 'bundle', icon: '🎁', label: '올인원 패키지', price: 4900, desc: '그해 상세판 + 평생 정통사주 + 궁합 상세 3명 + 복떡 50개' },
};
// v0.48 가격(2026-11-04 사용자 결정): 단품 3개(상세판 990 · 정통사주 2,900 · 궁합 990) + 올인원 4,900
// 옛 「상세판 산 사람 정통사주 1,000원 할인」은 없앰(정통사주가 2,900원으로 내려가 계단이 990 → 2,900 → 4,900으로 고름)
export const BUNDLE_COMPAT = 3;   // 올인원에 든 궁합 상세 이용권
export const BUNDLE_TTEOK = 50;   // 올인원에 든 복떡
/** 올인원을 따로 사면 얼마인지(복떡은 「떡 한 상자」 35개 3,300원 값으로 셈, 100원 단위 반올림) */
export const bundleWorth = (tteokUnit = 3300 / 35) => Math.round((PRODUCTS.year.price + PRODUCTS.life.price + PRODUCTS.compat.price * BUNDLE_COMPAT + BUNDLE_TTEOK * tteokUnit) / 100) * 100;

const GROUP = { 비견: 0, 겁재: 0, 식신: 1, 상관: 1, 편재: 2, 정재: 2, 편관: 3, 정관: 3, 편인: 4, 정인: 4 };
const GROUP_WORD = ['나를 세우는 기운(비겁)', '재능을 펼치는 기운(식상)', '결실을 거두는 기운(재성)', '책임과 자리의 기운(관성)', '배움과 도움의 기운(인성)'];
const mod = (n, m) => ((n % m) + m) % m;
const el = (e) => `${ELEMENT_HANJA[e]}(${ELEMENT_KO[e]})`;
const sentence = (t) => { const x = String(t || '').trim(); return !x ? '' : /[.!?]$/.test(x) ? x : `${x}.`; };
const first = (t) => sentence(String(t).split('. ')[0]);
const pillarName = (p) => `${STEMS[p.stem]}${BRANCHES[p.branch]}`;
const FIELD_KO = { wealth: '재물', business: '사업', career: '일·공부', love: '애정', family: '가족', children: '자녀', health: '건강', social: '사람 사이' };
// 분야 점수(무료 책자와 같은 셈): 사업 = 재물·직장, 가족 = 애정·대인, 자녀 = 애정
function fieldValue(m, key) {
  const c = categoryScores(m.score, m.god);
  if (key === 'business') return Math.round((c.wealth + c.career) / 2);
  if (key === 'family') return Math.round((c.love + c.social) / 2);
  if (key === 'children') return c.love;
  return c[key];
}
// GOD_READING.fields에 없는 분야는 가장 가까운 분야 문장으로
const READ_FIELD = { wealth: 'wealth', business: 'wealth', career: 'career', love: 'love', family: 'social', children: 'love', health: 'health', social: 'social' };
const SEASONS = [['봄', [2, 3, 4]], ['여름', [5, 6, 7]], ['가을', [8, 9, 10]], ['겨울', [11, 12, 1]]];
const avg = (a) => Math.round(a.reduce((x, y) => x + y, 0) / Math.max(1, a.length));
const plusDays = (d, n) => jdnToDate(dateToJdn(d.year, d.month, d.day) + n);
const dayText = (d) => `${d.month}월 ${d.day}일`;

/** 글자 수(공백 포함) */
export const charCount = (rep) => rep.sections.reduce((t, s) => t + sectionChars(s), 0);
function sectionChars(s) {
  return [s.h, s.intro || '', ...s.blocks.flatMap((b) => [b.h || '', ...(b.paras || [])])].join('').length;
}
/** 목차: [{h, chars}] (결제 창에 「무엇을 사는지」 보여 줌) */
export const tocOf = (rep) => rep.sections.map((s) => ({ key: s.key, h: s.h, chars: sectionChars(s) }));

// ======================================================================
// 1) 그해 상세판(990원)
// ======================================================================

/** 달 하나: 흐름 · 분야 · 원국과 만남 · 좋은 날 · 할 일/대비 */
function monthBlock(y, i, ctx, rank) {
  const m = y.months[i]; const { saju, gender } = ctx;
  const R = GOD_READING[m.god]; const P = m.pillar; const me = saju.dayMaster;
  const inner = tenGod(me, BRANCH_MAIN_STEM[P.branch]); const I = GOD_READING[inner];
  const keys = ['wealth', 'career', 'love', 'health', 'social'];
  const vals = keys.map((k) => ({ k, v: fieldValue(m, k) })).sort((a, b) => b.v - a.v);
  const hi = vals[0]; const lo = vals[vals.length - 1];
  const tone = rank < 3 ? '한 해 가운데 흐름이 가장 좋은 달 중 하나예요' : rank >= 10 ? '한 해 가운데 속도를 늦추고 안을 다지기 좋은 달이에요' : '한 해의 흐름을 고르게 이어 가는 달이에요';
  const paras = [];
  paras.push(`${m.term}부터 ${pillarName(P)}의 달이 열려요. 일간 ${stemLabel(me)}에게 이 달의 천간 ${STEMS[P.stem]}${hasBatchim(STEMS_KO[P.stem]) ? '은' : '는'} ${m.god}, 「${R.keyword}」의 기운이에요. ${first(R.core)} ${tone}.`);
  paras.push(inner === m.god
    ? `지지 ${BRANCHES[P.branch]}에도 같은 ${m.god} 기운이 흘러 겉과 속이 한 방향이에요. 이 달의 성격이 또렷하게 드러나니, 마음먹은 일은 망설이지 말고 한 번에 밀고 가 보세요.`
    : `지지 ${BRANCHES[P.branch]}에는 ${inner}, 「${I.keyword}」의 기운이 바탕에 깔려요. 겉으로는 ${R.keyword}, 속으로는 ${josa(I.keyword, '이/가')} 함께 움직이니 ${first(I.good[i % I.good.length])}`);
  paras.push(`이 달 가장 힘이 실리는 분야는 ${FIELD_KO[hi.k]}, ${hi.v}점이에요. ${sentence(R.fields[hi.k])} ${FIELD_KO[lo.k]} 분야(${lo.v}점)는 한 걸음 천천히 가면 좋아요. ${first(R.fields[lo.k])}`);
  // 원국과의 만남: 이 달 글자가 내 사주 글자와 맺는 관계 1개, 없으면 용신·기신
  const rel = incomingRelations(saju.pillars, P, '이 달')[0];
  const stEl = STEM_ELEMENT[P.stem];
  if (rel) paras.push(`${rel.text} ${sentence(rel.act)}`);
  else if (stEl === saju.yongsin) paras.push(`이 달의 천간은 내게 가장 필요한 ${el(stEl)} 기운이라, 몸과 마음이 한결 가벼워지는 때예요. 미뤄 둔 부탁이나 시작은 이 달에 꺼내 보세요.`);
  else if (stEl === saju.gisin) paras.push(`이 달의 천간은 내게 이미 넉넉한 ${el(stEl)} 기운이라, 일을 늘리기보다 정리하고 덜어 낼 때 흐름이 편해져요.`);
  else paras.push(`이 달의 글자는 내 사주와 크게 부딪히거나 묶이지 않아, 평소 리듬을 지키며 꾸준히 가면 되는 달이에요.`);
  // 좋은 날 · 쉬어 갈 날 (오늘 운세와 같은 점수)
  const md = monthDays(saju, plusDays(m.start, 3), gender);
  const byDate = (a, b) => a.date.day - b.date.day + (a.date.month - b.date.month) * 100;
  const good = [...md.best].sort(byDate).map((d) => dayText(d.date)); const slow = [...md.caution].sort(byDate).map((d) => dayText(d.date));
  paras.push(`이 달 특히 좋은 날은 ${good.join(', ')}이에요. 약속·연락·결정은 이날들에 맞춰 보세요. ${slow.join(', ')}은 쉬어 가는 날로 두고 무리한 일정은 피하면 좋아요.`);
  // 할 일 · 대비
  paras.push(rank >= 10
    ? `대비: ${sentence(R.watch[i % R.watch.length])} ${WATCH_ACT[m.god]}`
    : `할 일: ${sentence(R.tips[i % R.tips.length])} 챙길 점은 하나, ${R.watch[0].replace(/[.!?]$/, '')}${R.watch[0].endsWith('요') ? '.' : '는 점이에요.'}`);
  return { h: `${m.solarMonth}월 · ${monthRange(y.months, i)} · ${pillarName(P)}월 ${rank < 3 ? '🌟' : rank >= 10 ? '🍵' : ''}`.trim(), paras };
}
const WATCH_ACT = {
  비견: '중요한 결정 전에 믿는 사람 한 명에게 반대 의견을 물어보세요.', 겁재: '돈 빌려주기·보증·공동 투자는 이 달엔 미뤄 두세요.',
  식신: '식사량과 군것질을 줄이고, 미룬 일 하나는 끝내 두세요.', 상관: '윗사람에게 할 말은 하룻밤 자고 글로 정리해 전하세요.',
  편재: '큰 지출·투자는 하루 넘겨 다시 보고 결정하세요.', 정재: '새 제안을 바로 거절하지 말고 하루만 생각해 보세요.',
  편관: '일 욕심을 덜고, 운전·운동 때 속도를 줄이세요.', 정관: '지키기 어려운 약속은 정중히 거절하세요.',
  편인: '걱정은 종이에 적고, 그중 하나만 실행해 보세요.', 정인: '도움받은 일도 마무리는 스스로 정해 끝내 보세요.',
};

// 분야별 체크리스트(그해 십신 무리 × 분야): 세 가지 중 두 개를 고름
const FIELD_PLAN = {
  wealth: ['한 달 고정비 목록을 만들고 하나를 줄이기', '들어오는 돈의 10%를 다른 통장으로 자동 이체하기', '큰 지출은 하루 넘겨 다시 보기', '받을 돈·줄 돈 목록 정리하기', '재테크 공부 하나를 끝까지 해 보기'],
  business: ['상품 하나를 정해 작게 시험해 보기', '거래처·고객 목록 다시 정리하기', '세무·계약 서류를 한곳에 모으기', '한 달 매출·비용을 표 하나로 보기', '함께할 사람과 역할을 글로 정하기'],
  career: ['한 해 성과를 숫자로 적어 두기', '배우고 싶은 기술 하나 정하기', '윗사람·동료와 한 달에 한 번 짧은 대화', '지원·시험 마감일을 달력에 적기', '내 일을 소개하는 한 문단 다듬기'],
  love: ['한 달에 한 번 둘만의 시간 정하기', '서운함은 하루 지나 부드럽게 말하기', '고마운 일 한 가지씩 말로 전하기', '새 모임 하나에 나가 보기', '상대 이야기를 끝까지 듣는 연습'],
  family: ['가족 단체방에 이번 달 할 일 나눠 적기', '부모님·어른께 한 달에 두 번 안부 드리기', '가족 행사를 미리 달력에 적기', '집안 큰 지출은 가족 회의로 정하기', '가족과 함께하는 식사 한 번'],
  children: ['아이와 일주일에 한 번 둘만의 대화', '규칙은 함께 정하고 지키면 칭찬하기', '1년 교육비 예산 먼저 정하기', '아이가 잘한 과정 짚어 칭찬하기', '함께하는 체험 하나 계획하기'],
  health: ['잠드는 시간을 정해 지키기', '하루 20분 걷기', '정기 검진 날짜 잡기', '야식은 일주일에 두 번 안으로', '스트레칭 5분을 아침 습관으로'],
  social: ['오랜만인 사람에게 안부 한 줄', '받은 도움에 짧게라도 고맙다고 전하기', '모임 회비는 그때그때 정산하기', '그 자리에 없는 사람 이야기는 하지 않기', '새 모임 하나에 얼굴 비추기'],
};

/** 분야 하나: 상·하반기 · 계절별 · 가장 좋은 두 달과 낮은 달 · 체크리스트 */
function fieldBlock(y, key, label, ctx, focus) {
  const { saju } = ctx; const god = y.year.god; const g = GROUP[god];
  const inner = tenGod(saju.dayMaster, BRANCH_MAIN_STEM[y.year.pillar.branch]); const ig = GROUP[inner];
  const series = y.months.map((m, i) => ({ m, i, v: fieldValue(m, key) }));
  const h1 = avg(series.slice(0, 6).map((x) => x.v)); const h2 = avg(series.slice(6).map((x) => x.v));
  const sorted = [...series].sort((a, b) => b.v - a.v || a.i - b.i);
  const top = sorted.slice(0, 2); const low = sorted[sorted.length - 1];
  const rf = READ_FIELD[key];
  const paras = [];
  paras.push(`${label}의 한 해 흐름을 반으로 나누면, 상반기(입춘~${y.months[5].solarMonth}월) 평균 ${h1}점, 하반기(${y.months[6].solarMonth}월~이듬해 1월) 평균 ${h2}점이에요. ${h1 - h2 >= 3 ? '앞쪽에 힘이 실리는 해라, 중요한 시작은 상반기에 당겨 두고 하반기에는 거두고 다지는 쪽이 좋아요.' : h2 - h1 >= 3 ? '뒤로 갈수록 힘이 붙는 해라, 상반기에는 준비하고 하반기에 본격적으로 움직이면 좋아요.' : '한 해 내내 고르게 흐르는 해라, 서두르지 않고 같은 속도로 꾸준히 가는 쪽이 이득이에요.'}`);
  // 계절별: 그 계절 가운데 달의 십신으로 한 줄씩
  const seasonLines = SEASONS.map(([name, ms]) => {
    const list = series.filter((x) => ms.includes(x.m.solarMonth)); const mid = list[1] || list[0];
    const v = avg(list.map((x) => x.v));
    return `${name}(${ms.join('·')}월, 평균 ${v}점)에는 「${GOD_READING[mid.m.god].keyword}」의 기운이 중심이에요. ${first(GOD_READING[mid.m.god].fields[rf])}`;
  });
  paras.push(seasonLines.join(' '));
  paras.push(`가장 힘이 실리는 두 달은 ${top.map((x) => `${x.m.solarMonth}월(${monthRange(y.months, x.i)}, ${x.v}점)`).join('과 ')}이에요. 이 분야의 중요한 일은 이 두 달에 몰아 두면 같은 노력으로 더 큰 결과가 나와요. 반대로 ${low.m.solarMonth}월(${monthRange(y.months, low.i)}, ${low.v}점)은 새로 벌이기보다 지키고 정리하는 달로 쓰세요.`);
  paras.push(`조심할 장면 두 가지. 하나, ${FIELD_WATCH[key][g]}${ig !== g ? ` 둘, ${FIELD_WATCH[key][ig]}` : ` 둘, ${sentence(GOD_READING[god].watch[GOD_READING[god].watch.length - 1])} 미리 알면 충분히 다룰 수 있어요.`}`);
  const age = y.sajuYear - saju.input.year; const al = ['wealth', 'career', 'love', 'health', 'social'].includes(key) ? ageLine(age, key, god) : '';
  const plan = FIELD_PLAN[key]; const pick = [plan[g], plan[(ig + 2) % 5 === g ? (g + 1) % 5 : (ig + 2) % 5]];
  paras.push(`${al ? `${al} ` : ''}올해 ${label} 체크리스트: ① ${pick[0]} ② ${pick[1]} ③ ${top[0].m.solarMonth}월 달력에 「${label} 챙기는 달」이라고 적어 두기.`);
  if (focus) paras.push(`이 분야는 가입할 때 고른 가장 큰 고민이라 한 번 더 짚어요. 올해 ${label}의 열쇠는 「${GOD_READING[god].keyword}」${hasBatchim(GOD_READING[god].keyword) ? '이에요' : '예요'}. 실천 하나: ${sentence(GOD_READING[god].tips[1] || GOD_READING[god].tips[0])} 조급할 때는 ${top[0].m.solarMonth}월을 기다린다고 마음먹으면 한결 편해져요.`);
  return { h: `${label}${focus ? ' · 내 고민' : ''}`, paras };
}

/**
 * 그해 상세판
 * @param ctx { y yearOf(그해), thisYear, saju, gyeok, name, gender, concern, nextDaewoon, calib, booklet(무료 책자 buildBooklet 결과) }
 */
export function buildPremiumYear(ctx) {
  const { y, saju, name = '', concern = null, nextDaewoon = null, calib = null } = ctx;
  const who = name ? `${name} 님` : '당신';
  const god = y.year.god; const R = GOD_READING[god];
  const ranked = [...y.months].map((m, i) => ({ m, i })).sort((a, b) => b.m.score - a.m.score || a.i - b.i);
  const rankOf = (i) => ranked.findIndex((x) => x.i === i);
  const best = ranked.slice(0, 3).map((x) => x.m.solarMonth); const slow = ranked.slice(-2).map((x) => x.m.solarMonth);
  const yong = y.months.filter((m) => STEM_ELEMENT[m.pillar.stem] === saju.yongsin).map((m) => m.solarMonth);
  const L = ELEMENT_LUCK[saju.yongsin];
  const sections = [];

  sections.push({
    key: 'open', h: '열면서 · 이 상세판을 읽는 법',
    blocks: [{ paras: [
      `${who}의 ${y.sajuYear}년, ${yearName(y.year.pillar)} 상세판이에요. 무료 총운에서 한 해의 큰 모양을 봤다면, 여기서는 그 해를 달마다·분야마다 나눠 「언제, 무엇을」까지 짚어요. 모든 문장은 ${who}의 여덟 글자와 그해·그달의 글자가 만나는 방식에서 나왔고, 다시 열어도 같은 내용이에요.`,
      `한 해의 중심 기운은 ${god}, ${iyeyo(`「${R.keyword}」`)}. 흐름이 가장 좋은 세 달은 ${best.join('·')}월, 속도를 늦추고 다지기 좋은 두 달은 ${slow.join('·')}월이에요.${yong.length ? ` 게다가 ${yong.join('·')}월은 천간에 내게 가장 필요한 ${el(saju.yongsin)} 기운이 들어오는 달이라, 몸과 마음이 한결 편해요.` : ''}`,
      '읽는 법: 🌟는 흐름이 가장 좋은 달, 🍵는 쉬어 가며 다지는 달이에요. 점수는 무료 화면과 같은 값이고, 상세판은 해석과 행동만 더 자세히 풀어 써요. 한 번 열면 언제든 다시 볼 수 있어요.',
    ] }],
  });

  sections.push({
    key: 'months', h: '12달 달력 풀이', intro: '입춘부터 이듬해 소한까지, 절기가 바뀌는 날을 달의 시작으로 봐요.',
    blocks: y.months.map((m, i) => monthBlock(y, i, ctx, rankOf(i))),
  });

  const focus = { exam: 'career', job: 'career', wealth: 'wealth', business: 'business', love: 'love', marriage: 'love', health: 'health', people: 'social', change: 'career' }[concern];
  const order = focus ? [FIELD_ORDER.find(([k]) => k === focus), ...FIELD_ORDER.filter(([k]) => k !== focus)] : FIELD_ORDER;
  sections.push({
    key: 'fields', h: '분야 8개 전략', intro: '분야마다 상·하반기, 계절, 가장 좋은 두 달, 조심할 장면, 체크리스트 순서로 봐요.',
    blocks: order.map(([k, label]) => fieldBlock(y, k, label, ctx, k === focus)),
  });

  // 조심할 점 전체(무료 책자는 다섯 개만) + 쉬어 갈 달의 쉬어 갈 날
  const checks = yearChecks(y, saju, { gender: ctx.gender, calib });
  const cautionBlocks = checks.map((c) => ({ h: `${{ watch: '⚠️ 조심', good: '🌟 기회', note: '📌 참고' }[c.kind]} · ${c.title}`, paras: [sentence(c.text), `👉 ${sentence(c.act)}${c.when ? ` 특히 ${c.when}에 한 번 더 챙겨 보세요.` : ''}`] }));
  const slowBlocks = ranked.slice(-2).map(({ m, i }) => {
    const md = monthDays(saju, plusDays(m.start, 3), ctx.gender);
    return { h: `🍵 ${m.solarMonth}월(${monthRange(y.months, i)})을 지나는 법`, paras: [
      `이 달은 ${m.god}, 「${GOD_READING[m.god].keyword}」의 기운이 들어오는 한 해 가운데 가장 차분한 달이에요. ${sentence(GOD_READING[m.god].watch[0])}`,
      `대비: ${WATCH_ACT[m.god]} 큰 결정이 필요하다면 이 달 안에서도 흐름이 좋은 ${md.best.map((d) => dayText(d.date)).join(', ')}에 맞추고, ${md.caution.map((d) => dayText(d.date)).join(', ')}에는 일정을 가볍게 두세요.`,
    ] };
  });
  sections.push({ key: 'care', h: '조심할 달과 대비', intro: '겁주려는 글이 아니라, 미리 알면 다룰 수 있는 것들을 모았어요.', blocks: [...slowBlocks, ...cautionBlocks] });

  // 나만의 보정: 대운 교차·교운기, 지난 일 보정, 용신 쓰는 법(계절별)
  const own = [];
  if (y.daewoon) {
    const age = y.sajuYear - saju.input.year;
    own.push(`지금 10년 큰 흐름(대운 ${pillarName(y.daewoon.pillar)}, ${y.daewoon.startAge}~${y.daewoon.endAge}세)은 ${y.daewoon.god}, 「${GOD_READING[y.daewoon.god].keyword}」의 시기예요. ${[crossLine(y.daewoon.god, god), turnLine(age, y.daewoon, nextDaewoon)].filter(Boolean).join(' ') || '그 흐름 속에서 이 해는 한 해의 기운을 고르게 이어 가는 자리예요.'}`);
  }
  own.push(calib?.n ? `지난 일 맞히기 답으로 맞춘 보정: ${sentence(calib.text)} 그래서 이 상세판의 조심할 점 순서도 ${who}에게 실제로 잘 맞았던 신호부터 보여 드려요.`
    : `지난 일 맞히기(내 사주 > 지난 일과 맞는지 확인)에 답하면, ${who}에게 실제로 잘 맞았던 신호(대운 바뀜·충·합)를 앞에 두도록 이 상세판의 조심할 점 순서가 바뀌어요. 점수는 그대로이고 읽는 순서만 맞춰져요.`);
  own.push(`${who}에게 가장 필요한 기운은 ${iyeyo(el(saju.yongsin))}. 한 해 내내 ${L.color} 계열의 소품, ${L.direction} 방향, ${L.time}가 힘이 되고, 먹을거리는 ${josa(L.food, '이/가')} 잘 맞아요. 행운의 숫자는 ${iyeyo(L.numbers.join('·'))}.`);
  const hs = saju.heesin; if (hs != null && hs !== saju.yongsin) { const H = ELEMENT_LUCK[hs]; own.push(`곁에서 돕는 기운(희신)은 ${iyeyo(el(hs))}. ${H.item}처럼 ${H.color} 계열 물건을 하나 곁에 두면 필요한 기운을 받쳐 줘요.`); }
  own.push(`계절마다 쓰는 법: 봄에는 ${josa(L.item, '으로/로')} 시작을 가볍게, 여름에는 ${L.direction} 쪽 자리에서 중요한 일을, 가을에는 ${josa(String(L.numbers[0]), '이/가')} 들어간 날짜에 정리를, 겨울에는 ${josa(L.food, '으로/로')} 몸을 데우며 다음 해를 준비해 보세요.`);
  sections.push({ key: 'own', h: '나만의 보정 풀이', blocks: [{ paras: own }] });

  const km = keyMonths(y); const goodKm = km.filter((m) => m.kind === 'good').map((m) => m.month);
  const seasons = seasonsOf(y.months); const bs = seasons.find((s) => s.tone === 'best');
  sections.push({ key: 'close', h: '맺음 · 한 해의 다짐 세 가지', blocks: [{ paras: [
    `① ${goodKm.join('월과 ')}월에는 미뤄 둔 일 하나를 꺼내요. ② ${slow.join('월과 ')}월에는 새로 벌이기보다 정리하고 쉬어요. ③ ${sentence(R.tips[0])}`,
    `${bs ? `${bs.label}에 가장 큰 바람이 불어요. ` : ''}운은 정해진 점수가 아니라 쓰는 방식이에요. ${who}가 좋은 달에 한 걸음 더 내딛고 차분한 달에 한 걸음 쉬어 간다면, 이 해는 숫자보다 훨씬 좋은 해로 기억될 거예요.`.replace(`${who}가`, josa(who, '이/가')),
  ] }] });

  const rep = { kind: 'year', year: y.sajuYear, title: `${y.sajuYear}년 상세 운세`, sub: `${yearName(y.year.pillar)} · ${who}`, sections };
  rep.toc = tocOf(rep); rep.chars = charCount(rep);
  return rep;
}

/**
 * 궁합 상세 맛보기(2026-11-04 사용자 요청 「가장 궁금한 지점에서 끊기」):
 * 배우자 기운 — 「상대 사주에 내 배우자 기운이 ○% 있어요」까지 보여 주고 그 뜻(결론)은 흐림,
 * 묻고 답하기 5개는 질문만 보이고 답은 흐림, 함께하기 좋은 달도 흐림
 */
export function compatTeaser(rep) {
  const sp = rep.sections.find((s) => s.key === 'spouse')?.blocks[0].paras[0] || '';
  const ss = sp.split(/(?<=[.])\s+/);
  const qa = rep.sections.find((s) => s.key === 'qa')?.blocks.map((b) => ({ q: b.h, a: b.paras[0] })) || [];
  const mo = rep.sections.find((s) => s.key === 'months')?.blocks[0].paras[0] || '';
  return { open: ss.slice(1, 2).join(' '), blur: ss.slice(2).join(' '), qa, months: mo };
}

/** 무료 책자 끝에서 보여 줄 맛보기: 첫 달 풀이 첫 두 문장(나머지는 흐리게) */
export function premiumTeaser(rep) {
  const b = rep.sections.find((s) => s.key === 'months')?.blocks.find((x) => x.h.includes('🌟')) || rep.sections[1].blocks[0];
  return { h: b.h, open: b.paras[0], blur: b.paras[1] };
}

/**
 * 타로 결과 끝 → 그해 상세판 다리(2026-11-04 사용자 제안).
 * 타로 주제에 맞는 상세판 분야를 골라, 가장 궁금한 곳(힘이 실리는 두 달·조심할 장면)에서 끊는다.
 * 'day'(오늘·궁금한 일)는 분야 대신 12달 달력의 「흐름이 가장 좋은 세 달」로 잇는다.
 * @returns { field, label, sec, block, q:[{q, a}] } — sec·block은 읽기 화면에서 바로 찾아갈 자리
 */
export const TAROT_FIELD = { love: 'love', job: 'career', money: 'wealth', health: 'health', day: null };
export function tarotBridge(rep, topic) {
  const field = TAROT_FIELD[topic] ?? null;
  const fsec = rep.sections.findIndex((s) => s.key === 'fields');
  const label = field ? FIELD_ORDER.find(([k]) => k === field)[1] : null;
  const bi = field && fsec >= 0 ? rep.sections[fsec].blocks.findIndex((b) => b.h.startsWith(label)) : -1;
  if (bi >= 0) {
    const ps = rep.sections[fsec].blocks[bi].paras;
    const two = ps[2].split(/(?<=요\.)\s+/)[0]; const watch = ps[3];
    return { field, label, sec: fsec, block: bi, q: [
      { q: `${label}에 가장 힘이 실리는 두 달은?`, a: two },
      { q: `${label}에서 조심할 장면 두 가지는?`, a: watch },
    ] };
  }
  const open = rep.sections.find((s) => s.key === 'open').blocks[0].paras[1];
  const msec = rep.sections.findIndex((s) => s.key === 'months');
  const mb = Math.max(0, rep.sections[msec].blocks.findIndex((b) => b.h.includes('🌟')));
  return { field: null, label: '12달 흐름', sec: msec, block: mb, q: [
    { q: '흐름이 가장 좋은 세 달은?', a: open },
    { q: '마음에 걸린 일, 몇 월에 움직이면 좋을까?', a: rep.sections[msec].blocks[mb].paras[0] },
  ] };
}

// ======================================================================
// 2) 평생 정통사주 종합(4,900원)
// ======================================================================

const EL_STRONG = [
  '목(木)이 많으면 자라고 뻗으려는 힘이 커요. 계획을 세우고 앞으로 나아가는 추진력이 좋지만, 한꺼번에 너무 많은 일을 벌이기 쉬워요.',
  '화(火)가 많으면 밝고 표현이 시원해요. 사람을 모으는 힘이 있지만, 마음이 급해져 쉽게 지치거나 말이 앞서기 쉬워요.',
  '토(土)가 많으면 믿음직하고 묵직해요. 중심을 잘 잡지만, 변화에 느리고 걱정을 오래 품기 쉬워요.',
  '금(金)이 많으면 결단이 빠르고 원칙이 분명해요. 일을 깔끔하게 끝내지만, 말이 날카롭게 들리거나 스스로를 다그치기 쉬워요.',
  '수(水)가 많으면 생각이 깊고 흐름을 잘 읽어요. 지혜롭지만, 생각이 많아 결정을 미루거나 잠이 얕아지기 쉬워요.',
];
const EL_WEAK = [
  '목(木)이 적으면 새로 시작하는 힘이 약해질 수 있어요. 식물을 기르거나 아침 산책처럼 자라는 기운을 곁에 두면 좋아요.',
  '화(火)가 적으면 표현과 열정이 숨기 쉬워요. 햇볕을 쬐고, 좋아하는 것을 말로 꺼내는 연습이 기운을 살려요.',
  '토(土)가 적으면 마음의 중심이 흔들리기 쉬워요. 규칙적인 식사와 정해진 자리, 정리된 공간이 힘이 돼요.',
  '금(金)이 적으면 맺고 끊기가 어려울 수 있어요. 마감일을 정하고 「여기까지」를 말하는 연습이 도움이 돼요.',
  '수(水)가 적으면 쉬는 법을 잊기 쉬워요. 물을 자주 마시고, 하루 10분 혼자 생각하는 시간을 두면 좋아요.',
];
// 평생 분야(십성 무리 중 가장 많은 쪽 기준)
const LIFE_FIELD = {
  wealth: [
    '나를 세우는 기운이 많아 돈을 「내 힘으로 버는」 쪽에 강해요. 대신 나눠 쓰고 빌려주다 새기 쉬우니, 번 돈의 길을 정해 두는 습관이 평생 재산을 지켜요.',
    '재능이 곧 돈이 되는 사주예요. 솜씨·말·글·기술로 버는 길이 잘 맞고, 하고 싶은 일을 할 때 돈이 따라와요. 수입이 들쭉날쭉할 수 있으니 고정 저축 하나를 꼭 두세요.',
    '현실 감각과 관리 능력이 좋아 돈의 흐름을 타고났어요. 장사·투자·관리 쪽에 감이 있지만, 욕심이 앞설 때를 조심하면 평생 넉넉해요.',
    '자리와 신용으로 돈을 버는 사주예요. 직장·공공·전문직처럼 안정된 틀 안에서 꾸준히 쌓을 때 크게 남아요.',
    '배움과 자격이 돈이 되는 사주예요. 공부한 만큼 수입이 오르고, 문서·계약·부동산과 인연이 있어요. 돈보다 공부에 마음이 가는 때를 미리 계획하면 좋아요.',
  ],
  career: [
    '내 이름으로 하는 일, 독립·창업·프리랜서에 힘이 실려요. 혼자 다 하려 하기보다 믿는 동료 한 명이 있을 때 멀리 가요.',
    '만들고 말하고 보여 주는 일이 잘 맞아요. 기획·교육·콘텐츠·요리·예술처럼 재능이 드러나는 자리에서 빛나요.',
    '사람과 돈의 흐름을 다루는 일, 영업·유통·재무·운영에 감각이 있어요. 성과가 숫자로 보이는 자리가 잘 맞아요.',
    '조직과 규칙 속에서 신뢰를 쌓는 일이 잘 맞아요. 관리·공공·법·의료처럼 책임이 분명한 자리에서 오래 인정받아요.',
    '배우고 가르치고 연구하는 일이 잘 맞아요. 교육·상담·연구·문서처럼 깊이가 필요한 자리에서 실력이 드러나요.',
  ],
  love: [
    '친구 같은 연애를 해요. 대등하게 어깨를 나란히 하는 사람이 잘 맞고, 자존심 싸움만 피하면 오래 가요.',
    '표현이 풍부한 사랑을 해요. 챙기고 웃게 해 주는 데서 행복을 느끼지만, 솔직함이 지나쳐 상처가 되지 않게 말을 고르세요.',
    '현실적이고 든든한 사랑을 해요. 함께 생활을 꾸리는 데서 마음이 깊어지고, 계획을 같이 세우는 사람이 잘 맞아요.',
    '책임감 있는 사랑을 해요. 한번 정하면 오래 지키지만, 체면 때문에 속마음을 숨기지 않도록 해 보세요.',
    '마음으로 품는 사랑을 해요. 기대고 의지할 수 있는 사람이 잘 맞고, 혼자 짐작하는 버릇만 줄이면 편안해요.',
  ],
  health: [
    '활동량이 많은 편이라 근육·관절을 아끼는 운동 습관이 평생 건강을 지켜요.',
    '먹고 즐기는 기운이 있어 소화와 체중 관리가 평생의 숙제예요. 규칙적인 식사가 가장 좋은 약이에요.',
    '바쁘게 움직이다 끼니와 잠을 거르기 쉬워요. 잠드는 시간을 지키는 것만으로 크게 달라져요.',
    '책임과 긴장이 쌓이기 쉬워 스트레스 관리가 중요해요. 주기적으로 쉬는 날을 정해 두세요.',
    '생각이 많아 잠이 얕아지기 쉬워요. 잠들기 전 휴대폰을 내려놓는 습관이 평생 건강을 받쳐 줘요.',
  ],
  social: [
    '동료와 친구가 많은 사주예요. 경쟁보다 협력의 관계로 만들면 평생의 자산이 돼요.',
    '말과 재치로 사람을 모아요. 그 자리에 없는 사람 이야기만 조심하면 어디서나 환영받아요.',
    '사람 사이의 실속을 잘 챙겨요. 돈이 끼는 관계는 그때그때 정산하면 오래 가요.',
    '윗사람과 조직의 신뢰를 얻는 사주예요. 감정보다 기록과 사실로 이야기할 때 힘이 돼요.',
    '도와주는 어른과 스승을 만나는 복이 있어요. 받은 도움에 꼭 고마움을 전하면 인연이 오래 이어져요.',
  ],
};
const LIFE_LABEL = { wealth: '재물', career: '일과 직업', love: '애정과 배우자', health: '건강', social: '사람과 인연' };

/** 대운 하나: 나이·십신·속 기운·분야·한 걸음 */
function daewoonBlock(saju, d, idx, curAge) {
  const me = saju.dayMaster; const god = tenGod(me, d.stem); const inner = tenGod(me, BRANCH_MAIN_STEM[d.branch]);
  const R = GOD_READING[god]; const I = GOD_READING[inner]; const st = twelveStage(me, d.branch);
  const stage = ageStage(d.startAge + 3);
  const now = curAge >= d.startAge && curAge <= d.endAge;
  const tone = d.score >= 70 ? '바람이 시원하게 부는 10년' : d.score >= 62 ? '순풍 속에 쌓아 가는 10년' : d.score >= 55 ? '차분히 다지는 10년' : '안을 단단히 채우는 10년';
  return {
    h: `${d.startAge}~${d.endAge}세 · ${pillarName(d)} 대운 · ${god}${now ? ' · 지금' : ''}`,
    paras: [
      `${d.startDate ? `${d.startDate.year}년 ${d.startDate.month}월쯤부터 ` : ''}${pillarName(d)}의 10년이 열려요. 천간은 ${god}, 「${R.keyword}」, 지지는 ${inner}, 「${I.keyword}」의 기운이에요. ${first(R.core)} 점수로는 ${d.score}점, ${tone}이에요.`,
      `12운성은 「${st}」 — ${STAGE_PERIOD[st].line}. ${sentence(STAGE_PERIOD[st].tip)}`,
      `이 10년의 일: ${sentence(R.fields.career)} 돈: ${sentence(R.fields.wealth)} 마음과 관계: ${first(R.fields.love)}`,
      `${stage.label}의 시기와 겹치니, ${AGE_HINT[stage.key][GROUP[god]]}`,
      `이 10년에 잘 풀리는 것: ${R.good.slice(0, 2).map((t) => sentence(t)).join(' ')} 몸: ${first(R.fields.health)} 사람: ${first(R.fields.social)}`,
      (() => { const rel = incomingRelations(saju.pillars, d, '이 대운')[0]; return rel ? `${rel.text} 👉 ${sentence(rel.act)}` : `이 대운의 글자는 내 사주와 크게 부딪히거나 묶이지 않아, 10년의 흐름이 고르게 이어지는 편이에요.`; })(),
      `챙길 점: ${sentence(R.watch[0])} 이 10년의 한 걸음: ${sentence(R.tips[idx % R.tips.length])}`,
    ],
  };
}
const AGE_HINT = {
  teen: ['친구와 함께 성장하는 경험이 큰 밑천이 돼요.', '좋아하는 것을 마음껏 표현해 본 경험이 재능의 씨앗이 돼요.', '용돈을 스스로 관리해 본 경험이 평생의 돈 감각이 돼요.', '규칙을 지키며 얻는 칭찬이 자신감의 바탕이 돼요.', '좋은 선생님과 책을 만나는 것이 가장 큰 복이에요.'],
  young: ['내 이름으로 해 보는 도전이 길을 열어 줘요.', '재능을 드러낼 무대를 찾는 것이 가장 큰 과제예요.', '첫 돈을 모으고 굴리는 습관이 이후 10년을 바꿔요.', '조직 안에서 신뢰를 쌓는 경험이 큰 자산이 돼요.', '자격과 공부가 진로를 정해 주는 시기예요.'],
  mid: ['함께하는 사람과 역할을 나누는 법이 성패를 가려요.', '전문성을 밖으로 드러내는 일이 다음 자리를 만들어요.', '가정의 큰 살림을 계획적으로 꾸리는 시기예요.', '책임이 커지는 만큼 원칙 하나가 나를 지켜 줘요.', '배움에 다시 투자하면 후반의 힘이 돼요.'],
  senior: ['오랜 친구와 함께하는 시간이 큰 복이에요.', '경험을 나누고 남기는 일이 보람이 돼요.', '그동안 쌓은 것을 지키고 나누는 지혜가 필요한 시기예요.', '모임과 지역에서 맡는 역할이 활력이 돼요.', '새로 배우는 즐거움이 몸과 마음을 젊게 해요.'],
};

const GROUP_SCENE = {
  bigeop: '생활에서는 「내가 직접 해 볼게」라는 말이 자주 나오고, 친구·동료와 함께할 때 힘이 나요.',
  siksang: '생활에서는 먹고 만들고 말하는 즐거움이 크고, 떠오른 생각을 바로 꺼내 보고 싶어 해요.',
  jaeseong: '생활에서는 가계부와 일정표를 잘 챙기고, 결과가 눈에 보일 때 보람을 느껴요.',
  gwanseong: '생활에서는 약속과 규칙을 중요하게 여기고, 맡은 자리에서 인정받을 때 힘이 나요.',
  inseong: '생활에서는 책과 배움, 어른의 조언에서 힘을 얻고, 생각을 오래 품었다가 움직여요.',
};
// 자리별로 그 십신이 앉아 있을 때 가장 크게 드러나는 분야
const POS_FIELD = { year: ['social', '어린 시절과 집안, 넓은 인간관계'], month: ['career', '부모·형제와 사회생활, 일터'], day: ['love', '나 자신과 배우자, 생활'], hour: ['wealth', '자녀·아랫사람과 노후, 인생의 결실'] };
const POS_KO = { year: '연주', month: '월주', day: '일주', hour: '시주' };
const LIFE_AGES = [[15, '10대'], [25, '20대'], [40, '30~40대'], [60, '50대 이후']];
const SPOUSE_GOD = { female: ['정관', '편관'], male: ['정재', '편재'] };
const CHILD_GOD = { female: ['식신', '상관'], male: ['정관', '편관'] };
/** 원국 십신 위치: [{god, k, part}] (천간은 일간 제외, 지지는 본기) */
function godSpots(saju) {
  const out = []; const ds = saju.dayMaster;
  for (const k of ['year', 'month', 'day', 'hour']) {
    const p = saju.pillars[k]; if (!p) continue;
    if (k !== 'day') out.push({ god: tenGod(ds, p.stem), k, part: '천간' });
    out.push({ god: tenGod(ds, BRANCH_MAIN_STEM[p.branch]), k, part: '지지' });
  }
  return out;
}

/**
 * 평생 정통사주 종합
 * @param ctx { saju, gyeok(analyzeGyeok), daewoon(computeDaewoon), name, gender, nowYear }
 */
export function buildLifeReport(ctx) {
  const { saju, gyeok, daewoon, name = '', nowYear } = ctx;
  const who = name ? `${name} 님` : '당신';
  const me = saju.dayMaster; const DP = DAY_MASTER_PROFILE[me]; const P = saju.pillars;
  const ilju = buildIlju(saju); const tg = tenGodProfile(saju); const GP = gyeok ? GYEOK_PROFILE[gyeok.name] : null;
  const sections = [];
  const curAge = (nowYear ?? saju.input.year + 30) - saju.input.year;

  sections.push({ key: 'open', h: '열면서 · 나라는 사람', blocks: [{ paras: [
    `${who}의 사주는 ${['year', 'month', 'day', 'hour'].filter((k) => P[k]).map((k) => pillarName(P[k])).join(' ')}, 여덟 글자${P.hour ? '' : '(태어난 시간을 몰라 여섯 글자)'}로 이루어져 있어요. 이 종합 풀이는 그 글자들이 무엇을 말하는지 처음부터 끝까지, 타고난 바탕부터 10년마다의 큰 흐름까지 차례로 풀어요.`,
    `한 줄로 줄이면, ${josa(who, '은/는')} 「${DP.image}」 같은 일간에 「${ilju.image}」의 일주, ${gyeok ? `「${GP.title}」(${gyeok.name})의 그릇을 가진` : '고른 그릇을 가진'} 사람이에요. 가장 많은 기운은 ${tg.groups.slice().sort((a, b) => b.pct - a.pct)[0].label}(${tg.groups.slice().sort((a, b) => b.pct - a.pct)[0].pct}%), 가장 필요한 기운은 ${iyeyo(el(saju.yongsin))}.`,
  ] }] });

  // 여덟 글자 지도
  const hidden = ['year', 'month', 'day', 'hour'].filter((k) => P[k]).map((k) => `${BRANCHES[P[k].branch]} 속에는 ${HIDDEN_STEMS[P[k].branch].map((s) => `${STEMS[s]}(${tenGod(me, s)})`).join('·')}`).join(', ');
  sections.push({ key: 'map', h: '여덟 글자 지도', intro: '네 기둥은 뿌리(연주)·줄기(월주)·꽃(일주)·열매(시주)예요. 기둥마다 맡은 삶의 자리가 달라요.',
    blocks: [...pillarReadings(saju).map((r) => {
      const p = P[r.key]; const [fk, fw] = POS_FIELD[r.key]; const st = twelveStage(me, p.branch);
      const sg = r.key === 'day' ? null : tenGod(me, p.stem); const bg = tenGod(me, BRANCH_MAIN_STEM[p.branch]);
      const extra = [
        sg ? `${fw}의 겉모습에는 ${sg}, 「${GOD_READING[sg].keyword}」의 기운이 드러나요. ${first(GOD_READING[sg].fields[fk])}` : `일간 ${STEMS[me]} 바로 아래, 배우자와 생활의 자리에는 ${bg}, 「${GOD_READING[bg].keyword}」의 기운이 있어요. ${first(GOD_READING[bg].fields.love)}`,
        `${fw}의 속에는 ${bg}의 기운이 흘러요. ${first(GOD_READING[bg].good[0])} 이 자리의 12운성은 「${st}」, ${sentence(STAGE_PERIOD[st].line)} ${sentence(STAGE_PERIOD[st].tip)}`,
      ];
      return { h: r.head, paras: [r.body, ...extra] };
    }), { h: '지지 속에 숨은 글자(지장간)', paras: [`지지에는 겉으로 보이지 않는 천간이 숨어 있어요. ${hidden}. 숨은 글자는 때가 오면(그해·그달에 같은 글자가 들어오면) 겉으로 드러나 힘을 써요.`] }] });

  // 일간 · 일주
  sections.push({ key: 'self', h: '일간과 일주 · 나의 본바탕', blocks: [
    { h: `일간 ${DP.name} · ${DP.image}`, paras: [DP.text, `일간은 사주의 주인공이에요. 나머지 일곱 글자는 모두 이 일간을 기준으로 「나를 돕는지, 내가 다루는지, 나를 다듬는지」를 따져요. ${who}의 일간은 ${STEM_IMAGE[me]}의 성질이라, ${['곧게 뻗어 오르는', '부드럽게 감고 오르는', '환하게 비추는', '은은하게 밝히는', '묵직하게 받치는', '기르고 가꾸는', '단단하게 다듬는', '반짝이며 다듬어진', '넓게 흐르는', '스며들어 적시는'][me]} 방식으로 세상과 만나요.`] },
    { h: `일주 ${ilju.name}(${ilju.hanja}) · ${ilju.image}`, paras: [ilju.paras.personality, `사랑: ${ilju.paras.love}`, `일: ${ilju.paras.work}`, `${who}의 대표 강점은 「${ilju.keyword}」${hasBatchim(ilju.keyword) ? '이에요' : '예요'}. ${ilju.step}`] },
  ] });

  // 오행
  const els = saju.elements; const order = [0, 1, 2, 3, 4].sort((a, b) => els[b] - els[a]);
  const elParas = [`다섯 기운의 비율은 ${[0, 1, 2, 3, 4].map((e) => `${el(e)} ${els[e]}%`).join(', ')}예요.`, EL_STRONG[order[0]]];
  if (els[order[4]] < 12) elParas.push(EL_WEAK[order[4]]); else elParas.push(`가장 적은 ${el(order[4])}도 ${els[order[4]]}%로 크게 비지 않아, 다섯 기운이 고르게 돌아가는 편이에요. 어느 한쪽에 치우치지 않는 것이 큰 장점이에요.`);
  if (saju.johu?.stems?.length != null) elParas.push(sentence(johuSentence(me, P.month.branch)));
  if (saju.tonggwan) { const t = saju.tonggwan; elParas.push(`${el(t.a)}${hasBatchim(ELEMENT_KO[t.a]) ? '과' : '와'} ${el(t.b)}의 기운이 함께 크게 서로 부딪히는 사주라, 둘 사이를 이어 주는 ${el(t.el)}의 기운(통관)이 큰 도움이 돼요. ${josa(ELEMENT_LUCK[t.el].item, '을/를')} 곁에 두면 마음이 한결 부드러워져요.`); }
  const EL_LIFE = [
    '목(木)은 자라고 시작하는 힘이에요. 계획·배움·새 출발을 맡고, 몸에서는 간과 눈, 근육과 이어져요.',
    '화(火)는 드러내고 퍼뜨리는 힘이에요. 표현·열정·사람 모으기를 맡고, 몸에서는 심장과 혈압, 잠과 이어져요.',
    '토(土)는 받치고 이어 주는 힘이에요. 믿음·중재·살림을 맡고, 몸에서는 위장과 소화와 이어져요.',
    '금(金)은 맺고 다듬는 힘이에요. 결단·원칙·마무리를 맡고, 몸에서는 폐와 호흡기, 피부와 이어져요.',
    '수(水)는 머금고 흐르는 힘이에요. 지혜·휴식·흐름 읽기를 맡고, 몸에서는 신장과 방광, 허리와 이어져요.',
  ];
  const elBlocks = [0, 1, 2, 3, 4].map((e) => ({ h: `${el(e)} ${els[e]}%${e === saju.yongsin ? ' · 용신' : ''}`, paras: [`${EL_LIFE[e]} ${els[e] >= 30 ? `${who}에게는 이 기운이 넉넉해 그 힘을 잘 써요. 다만 넘치면 같은 힘이 부담이 되니 덜어 쓰는 지혜가 필요해요.` : els[e] <= 10 ? `${who}에게는 이 기운이 적은 편이라, 생활에서 일부러 채워 주면 균형이 좋아져요. ${josa(ELEMENT_LUCK[e].item, '이나/나')} ${ELEMENT_LUCK[e].color} 계열이 도움이 돼요.` : `${who}에게는 알맞게 있어, 필요할 때 무리 없이 꺼내 쓸 수 있어요.`}`] }));
  sections.push({ key: 'elements', h: '오행 · 다섯 기운의 균형', blocks: [{ paras: elParas.filter(Boolean) }, ...elBlocks] });

  // 강약 · 용신
  const LY = ELEMENT_LUCK[saju.yongsin]; const LH = saju.heesin != null ? ELEMENT_LUCK[saju.heesin] : null;
  const LV = { 극신약: '아주 여린 편', 신약: '여린 편', 중화신약: '고르면서 조금 여린 쪽', 중화: '고른 편', 중화신강: '고르면서 조금 센 쪽', 신강: '센 편', 극신강: '아주 센 편' };
  sections.push({ key: 'yongsin', h: '강약과 용신 · 내게 필요한 기운', blocks: [{ paras: [
    `${who}의 타고난 기운은 ${iyeyo(`${LV[saju.strengthLevel] || saju.strength}(${saju.strengthLevel || saju.strength})`)}. ${saju.strength === '신약' ? '주변 기운에 영향을 많이 받는 대신 사람을 잘 받아들이고 협력에 강해요. 나를 받쳐 주는 기운이 들어올 때 크게 피어나요.' : saju.strength === '신강' ? '스스로 밀고 가는 힘이 센 대신 넘치는 힘을 쓸 곳이 필요해요. 일과 책임, 베풂이 들어올 때 오히려 운이 트여요.' : '어느 쪽으로도 크게 치우치지 않아 들어오는 기운을 무리 없이 받아 쓸 수 있어요. 균형을 지키는 것이 가장 큰 힘이에요.'}`,
    `용신(가장 필요한 기운)은 ${el(saju.yongsin)}, 근거는 ${iyeyo(saju.yongsinBasis || '억부')}. ${LY.color} 계열의 물건, ${LY.direction} 방향, ${LY.time}, ${LY.food} 같은 먹을거리가 평생 힘이 되고, 행운의 숫자는 ${iyeyo(LY.numbers.join('·'))}.`,
    LH && saju.heesin !== saju.yongsin ? `희신(곁에서 돕는 기운)은 ${iyeyo(el(saju.heesin))}. ${LH.item}처럼 ${LH.color} 계열을 곁에 두면 용신을 받쳐 줘요.` : '',
    `생활 처방: 아침에는 ${LY.food}처럼 ${ELEMENT_KO[saju.yongsin]} 기운의 먹을거리로 시작하고, 중요한 일은 ${LY.time}에, 책상이나 침대 머리는 ${LY.direction} 쪽으로 두어 보세요. ${josa(LY.item, '을/를')} 곁에 두고, 비밀번호나 날짜를 고를 때 ${josa(LY.numbers.join('·'), '을/를')} 넣으면 마음이 든든해져요.`,
    saju.gisin != null ? `기신(이미 넉넉해 덜어 낼 기운)은 ${iyeyo(el(saju.gisin))}. 이 기운이 강하게 들어오는 해·달에는 일을 늘리기보다 정리하는 쪽이 편해요. 나쁜 기운이라는 뜻이 아니라, 이미 충분하다는 뜻이에요.` : '',
  ].filter(Boolean) }] });

  // 격국
  if (gyeok && GP) sections.push({ key: 'gyeok', h: `격국 · ${gyeok.name}, ${GP.title}`, blocks: [{ paras: [
    `${sentence(gyeok.basisText)} ${sentence(gyeok.note)}`,
    `타고난 강점 세 가지: ${GP.strengths.map((s, i) => `${'①②③'[i]} ${s}`).join(' ')}.`,
    `일하는 방식: ${sentence(GP.work)}`,
    `다듬을 점: ${sentence(GP.care)}`,
    `강점을 키우는 습관: ${GP.missions.join(', ')}. 하루 하나만 해도 그릇이 단단해져요.`,
  ] }] });

  // 십성
  sections.push({ key: 'tengods', h: '십성 · 다섯 가지 힘의 비율', blocks: tg.groups.slice().sort((a, b) => b.pct - a.pct).map((g) => ({ h: `${g.icon} ${g.label} ${g.pct}% · ${g.type}`, paras: [`${g.mean}. ${sentence(g.strong)} ${GROUP_SCENE[g.key]}`, g.pct >= 30 ? `이 힘이 ${who}의 중심이에요. 잘 쓰면 가장 큰 무기가 되고, 넘치면 같은 힘이 부담이 돼요.` : g.pct <= 8 ? `이 힘은 적은 편이라 일부러 채워 주면 좋아요. ${sentence(g.fill)}` : `알맞게 있어 필요할 때 꺼내 쓸 수 있어요. ${sentence(g.fill)}`] })) });

  // 십신 하나하나: 원국에 드러난 십신마다 자리와 뜻
  const spots = godSpots(saju); const byGod = {};
  for (const x of spots) (byGod[x.god] ||= []).push(x);
  const godOrder = Object.keys(GOD_READING).filter((g) => byGod[g]);
  sections.push({ key: 'gods', h: '원국에 앉은 십신 하나하나', intro: '천간과 지지(본기)에 드러난 십신을 하나씩 짚어요. 같은 십신이 여러 자리에 있으면 그 성질이 더 또렷해요.',
    blocks: godOrder.map((g) => { const R = GOD_READING[g]; const where = byGod[g].map((x) => `${POS_KO[x.k]} ${x.part}`).join('·');
      return { h: `${g} · ${R.keyword} (${where})`, paras: [`${R.core}`, `이 기운이 주는 힘: ${R.good.map((t) => sentence(t)).join(' ')}`, `${byGod[g].length >= 2 ? `${byGod[g].length}자리에 있어 이 성질이 강하게 드러나는 편이에요. ` : ''}다듬을 점: ${sentence(R.watch[0])} 👉 ${sentence(R.tips[0])}`] }; }) });

  // 배우자 자리 · 자녀와 노후 자리
  const gender = ctx.gender === 'male' ? 'male' : 'female';
  const spouse = spots.filter((x) => SPOUSE_GOD[gender].includes(x.god)); const child = spots.filter((x) => CHILD_GOD[gender].includes(x.god));
  const dayGod = tenGod(me, BRANCH_MAIN_STEM[P.day.branch]);
  sections.push({ key: 'spouse', h: '배우자 자리와 인연', blocks: [{ paras: [
    `배우자 자리(일지 ${BRANCHES[P.day.branch]})에는 ${dayGod}, 「${GOD_READING[dayGod].keyword}」의 기운이 있어요. ${sentence(GOD_READING[dayGod].fields.love)} 이 자리의 기운은 내가 편안해하는 생활 방식이자, 끌리는 사람의 모습이기도 해요.`,
    spouse.length ? `${gender === 'female' ? '여성 사주에서 배우자를 뜻하는 관성' : '남성 사주에서 배우자를 뜻하는 재성'}은 ${spouse.map((x) => `${POS_KO[x.k]} ${x.part}(${x.god})`).join(', ')}에 있어요. ${spouse.some((x) => x.k === 'day' || x.k === 'month') ? '가까운 자리에 있어 인연이 생활 속에서 자연스럽게 이어지는 편이에요.' : '조금 떨어진 자리에 있어 인연이 천천히, 넓은 관계 속에서 찾아오는 편이에요.'} ${spouse.length >= 3 ? '여러 자리에 있어 인연의 기회가 많은 만큼, 마음을 정한 뒤에는 한 사람에게 집중하는 것이 좋아요.' : ''}`.trim()
      : `${gender === 'female' ? '여성 사주에서 배우자를 뜻하는 관성' : '남성 사주에서 배우자를 뜻하는 재성'}이 겉으로 드러나 있지 않아요. 인연이 없다는 뜻이 아니라, 그 기운이 들어오는 해(대운·세운)에 인연이 또렷해진다는 뜻이에요. 그때를 놓치지 않으려면 평소 모임과 배움의 자리를 넓혀 두세요.`,
    `잘 맞는 사람: ${['내 뜻을 존중해 주는 대등한 사람', '내 이야기를 즐겁게 들어 주는 사람', '생활을 함께 꾸려 갈 현실적인 사람', '믿음직하고 약속을 지키는 사람', '마음을 품어 주는 따뜻한 사람'][GROUP[dayGod]]}이 잘 맞아요. 다툼이 생기면 ${['이기려 하기보다 같은 편이 되어 주는 말', '솔직함 대신 부드러운 표현', '계산보다 마음을 먼저 묻는 말', '체면보다 속마음을 꺼내는 말', '짐작보다 직접 묻는 말'][GROUP[dayGod]]}이 관계를 지켜요.`,
  ] }] });
  const hourP = P.hour;
  sections.push({ key: 'child', h: '자녀와 노후 · 인생의 결실', blocks: [{ paras: [
    hourP ? `열매의 자리(시주 ${pillarName(hourP)})에는 ${tenGod(me, hourP.stem)}과 ${tenGod(me, BRANCH_MAIN_STEM[hourP.branch])}의 기운이 있어요. ${first(GOD_READING[tenGod(me, hourP.stem)].core)} 인생 후반에는 이 기운이 결실로 드러나요.`.replace(`${tenGod(me, hourP.stem)}과`, `${josa(tenGod(me, hourP.stem), '과/와')}`) : '태어난 시간을 몰라 열매의 자리(시주)는 비워 두었어요. 시간을 알게 되면 정보 수정에서 넣어 주세요. 이 부분이 함께 채워져요.',
    child.length ? `${gender === 'female' ? '여성 사주에서 자녀를 뜻하는 식상' : '남성 사주에서 자녀를 뜻하는 관성'}은 ${child.map((x) => `${POS_KO[x.k]} ${x.part}`).join(', ')}에 있어요. 자녀나 내가 이끄는 후배·제자와의 인연이 ${child.length >= 2 ? '두텁고, 그들을 통해 보람을 얻는 일이 많아요.' : '분명하고, 함께 성장하는 기쁨이 있어요.'}` : `${gender === 'female' ? '자녀를 뜻하는 식상' : '자녀를 뜻하는 관성'}이 겉으로 드러나 있지 않아, 자녀운은 그 기운이 들어오는 대운에 또렷해져요. 자녀가 없다면 내가 키우는 계획과 후배로 읽으면 돼요.`,
    `노후를 위한 한 가지: ${josa(['함께할 오랜 친구 모임 하나', '경험을 글이나 강의로 남기는 일', '자산을 일찍부터 정리해 두는 습관', '지역·모임에서 맡을 역할 하나', '평생 배울 취미 하나'][GROUP[tenGod(me, BRANCH_MAIN_STEM[(hourP || P.day).branch])]], '을/를')} 마흔 전후에 시작해 두면 후반이 넉넉해져요.`,
  ] }] });

  // 관계 · 신살
  const rels = natalRelations(P);
  sections.push({ key: 'relations', h: '글자들의 관계 · 합과 충', blocks: [{ paras: rels.length ? rels.map((r) => `${r.text} 👉 ${sentence(r.act)}`) : ['여덟 글자끼리 크게 묶이거나 부딪히는 관계가 없어, 마음이 한 방향으로 고르게 흐르는 사주예요. 큰 굴곡보다 꾸준함이 힘이 돼요.'] }] });
  const ss = sinsalOf(saju); const s12 = sinsal12Of(saju);
  const POSK = { year: '연지', month: '월지', day: '일지', hour: '시지' };
  sections.push({ key: 'stars', h: '사주에 숨은 별 · 신살', intro: '신살은 성향을 읽는 보조 도구예요. 좋고 나쁨보다 「이런 기운이 있으니 이렇게 쓰자」로 읽어요.', blocks: [
    { h: '눈에 띄는 별', paras: ss.length ? ss.map((x) => `${x.name}(${x.branch}, ${x.where.join('·')}): ${sentence(x.note)}`) : ['특별히 두드러진 신살이 없어, 한쪽으로 치우치지 않은 담백한 사주예요.'] },
    { h: '12신살(띠 기준)', paras: s12.map((x) => `${POSK[x.k]} ${BRANCHES[x.branch]} · ${x.name}: ${iyeyo(SINSAL12_NOTE[x.name].mean)}. 👉 ${sentence(SINSAL12_NOTE[x.name].act)}`) },
  ] });

  // 평생 분야
  const top = tg.groups.slice().sort((a, b) => b.pct - a.pct)[0]; const gi = ['bigeop', 'siksang', 'jaeseong', 'gwanseong', 'inseong'].indexOf(top.key);
  const second = tg.groups.slice().sort((a, b) => b.pct - a.pct)[1]; const g2 = ['bigeop', 'siksang', 'jaeseong', 'gwanseong', 'inseong'].indexOf(second.key);
  const AF = { wealth: 'wealth', career: 'career', love: 'love', health: 'health', social: 'social' };
  const topGod = top.gods[0];
  sections.push({ key: 'fields', h: '평생 분야별 풀이', blocks: Object.keys(LIFE_FIELD).map((k) => ({ h: LIFE_LABEL[k], paras: [
    LIFE_FIELD[k][gi], `두 번째로 많은 ${second.label}의 힘도 함께 작용해요. ${first(LIFE_FIELD[k][g2])}`,
    `나이대별로 보면 ${LIFE_AGES.map(([a]) => ageLine(a, AF[k], topGod).replace(/이 해/g, '그 시기')).join(' ')}`,
    ...(k === 'health' ? [`몸에서 챙길 곳: 가장 많은 ${el(order[0])} 기운은 ${ORGAN[order[0]]}에 부담을 주기 쉽고, 가장 적은 ${el(order[4])} 기운은 ${ORGAN[order[4]]}의 힘이 약해지기 쉬워요. 진단이 아니라 생활에서 아껴 쓰자는 뜻이에요. 정기 검진은 꼭 챙기세요.`] : []),
    ...(k === 'wealth' ? [`재물에 힘이 되는 기운은 ${iyeyo(el(saju.yongsin))}. ${LY.direction} 방향의 일터나 거래, ${LY.color} 계열의 지갑·소품이 돈의 흐름을 부드럽게 해 줘요.`] : []),
  ] })) });

  // 조심 습관
  sections.push({ key: 'watch', h: '타고난 사주에서 조심할 습관', blocks: natalWatch(saju).map((w) => ({ h: w.title, paras: [sentence(w.text), `👉 ${sentence(w.act)} (근거: ${w.basis})`] })) });

  // 대운
  if (daewoon?.pillars?.length) sections.push({ key: 'daewoon', h: '대운 · 10년마다의 큰 흐름', intro: `대운은 ${daewoon.forward ? '순행' : '역행'}하고, 첫 대운은 만 ${daewoon.startExact ? `${daewoon.startExact.years}세 ${daewoon.startExact.months}개월` : `${daewoon.startAge}세`}에 시작해요.`, blocks: daewoon.pillars.slice(0, 9).map((d, i) => daewoonBlock(saju, d, i, curAge)) });

  if (nowYear) {
    const g = ctx.gender === 'male' ? 'male' : 'female';
    const yrs = Array.from({ length: 10 }, (_, k) => nowYear + k).map((Y) => { const yy = yearOf(saju, Y, g); const R = GOD_READING[yy.year.god]; const b = yy.best[0];
      return `${Y}년(${pillarName(yy.year.pillar)}, ${yy.year.score}점): ${yy.year.god}, 「${R.keyword}」의 해예요. ${first(R.good[0])} 가장 좋은 달은 ${b.solarMonth}월이에요.`; });
    sections.push({ key: 'decade', h: '앞으로 10년 · 해마다 한 줄', intro: '해마다 들어오는 기운(세운)을 한 줄씩 미리 봐요. 그해가 되면 상세 운세로 자세히 볼 수 있어요.', blocks: [{ paras: yrs }] });
  }
  if (daewoon?.pillars?.length) {
    const ps = daewoon.pillars.slice(0, 9); const hiD = [...ps].sort((a, b) => b.score - a.score)[0]; const loD = [...ps].sort((a, b) => a.score - b.score)[0];
    sections.push({ key: 'graph', h: '인생의 계절 · 대운 그래프', blocks: [{ paras: [
      `10년마다의 점수를 이어 보면 ${ps.map((d) => `${d.startAge}세 ${d.score}점`).join(' → ')}이에요.`,
      `가장 바람이 시원한 때는 ${hiD.startAge}~${hiD.endAge}세(${pillarName(hiD)} 대운)예요. 이때는 미뤄 둔 큰 목표를 꺼내 돛을 활짝 펴세요. 가장 차분한 때는 ${loD.startAge}~${loD.endAge}세(${pillarName(loD)} 대운)로, 새로 벌이기보다 안을 다지고 다음 바람을 준비하면 그 10년이 오히려 가장 단단한 밑천이 돼요.`,
      `지금(${curAge}세 무렵)은 ${(ps.find((d) => curAge >= d.startAge && curAge <= d.endAge) || ps[0]).startAge}세부터 이어지는 대운 안에 있어요. 다음 대운으로 넘어가는 해(교운기) 앞뒤 1년은 이사·이직·관계의 변화가 생기기 쉬우니, 큰 결정은 계획표를 먼저 써 두세요.`,
    ] }] });
  }

  sections.push({ key: 'close', h: '맺음', blocks: [{ paras: [`사주는 정해진 운명표가 아니라 타고난 바람의 방향이에요. ${who}에게 맞는 바람은 ${el(saju.yongsin)}에서 불어오고, ${gyeok ? `「${GP.title}」의 그릇` : '고른 그릇'}에 「${ilju.keyword}」의 힘이 담겨 있어요. 좋은 대운에는 돛을 활짝 펴고, 차분한 대운에는 배를 손보며 가면 돼요. 이 풀이가 그 항해의 지도가 되기를 바라요.`] }] });

  const rep = { kind: 'life', title: '평생 정통사주 종합', sub: `${ilju.name} · ${who}`, sections };
  rep.toc = tocOf(rep); rep.chars = charCount(rep);
  return rep;
}

// ======================================================================
// 3) 궁합 상세(4,900원)
// ======================================================================
const STEM_REL_DETAIL = {
  hap: ['두 사람의 일간이 천간합을 이루어요. 처음 만났을 때부터 묘하게 끌리고, 함께 있으면 서로의 모난 곳이 둥글어져요.', '합은 묶이는 힘이라, 너무 붙어 있으면 각자의 일이 밀리기 쉬워요. 따로 또 같이의 균형을 정해 두면 오래 가요.'],
  same: ['두 사람의 일간이 같은 기운이라 생각하는 방식이 닮았어요. 말하지 않아도 통하는 부분이 많고, 편안한 친구 같은 사이예요.', '닮은 만큼 같은 지점에서 고집이 부딪히기 쉬워요. 결정할 일은 「이번엔 네 방식, 다음엔 내 방식」처럼 번갈아 정해 보세요.'],
  give: ['내 기운이 상대를 살려 주는 사이예요. 내가 챙기고 밀어줄 때 상대가 크게 피어나고, 그 모습에서 나도 보람을 느껴요.', '주기만 하면 지칠 수 있어요. 받고 싶은 것도 말로 꺼내야 관계가 고르게 돌아가요.'],
  take: ['상대의 기운이 나를 살려 주는 사이예요. 상대 곁에 있으면 마음이 놓이고 힘이 나요.', '받는 데 익숙해지면 상대가 지칠 수 있어요. 고마움을 자주 표현하고, 작은 것이라도 되돌려 주세요.'],
  clash: ['두 사람의 기운이 서로를 견제하는 사이예요. 처음엔 밀고 당기는 긴장이 있지만, 그만큼 서로를 단단하게 다듬어 줘요.', '의견이 다를 때 이기려 하면 금세 지쳐요. 결론보다 이유를 먼저 들어 주는 규칙 하나가 다툼을 대화로 바꿔요.'],
};
const DAY_KIND_TEXT = {
  sixCombine: '생활 자리(일지)가 육합이라, 함께 사는 리듬이 자연스럽게 맞물려요. 같이 밥 먹고 쉬는 시간이 둘을 가장 가깝게 해요.',
  triple: '생활 자리가 삼합으로 모여, 같은 목표를 향해 힘을 합칠 때 가장 잘 맞아요.',
  half: '생활 자리가 반합을 이루어, 함께 무언가를 시작할 때 힘이 모이기 시작해요.',
  same: '생활 자리가 같은 글자라 생활 방식이 닮았어요. 편하지만 둘 다 같은 것을 양보하지 않을 때가 있어요.',
  clash: '생활 자리가 충이라 생활 방식이 정반대예요. 아침형과 저녁형처럼 다르지만, 각자의 시간을 존중하면 서로에게 없는 것을 채워 줘요.',
  punish: '생활 자리가 형이라 서로를 다듬어 주지만 잔소리가 늘기 쉬워요. 고칠 점 하나를 말하기 전에 좋은 점 둘을 먼저 말해 보세요.',
  harm: '생활 자리가 해라 작은 말이 오해로 번지기 쉬워요. 중요한 약속과 감정은 글로 한 번 더 확인해 보세요.',
  wonjin: '생활 자리가 원진이라 이유 없이 서운함이 쌓이기 쉬워요. 서운함은 하루 지나 부드럽게 전하면 오히려 가까워져요.',
  break: '생활 자리가 파라 함께 세운 계획이 자주 바뀌기 쉬워요. 약속은 글로 남기고 두 번째 방법을 준비해 두세요.',
};
const SUB_LABEL = { love: '연애·결혼', friend: '우정', work: '함께 일하기' };
const SUB_TIP = {
  love: ['서로의 속도를 맞추는 것부터 시작해요. 한 달에 한 번 둘만의 대화 시간을 정해 보세요.', '편안함이 큰 사이예요. 익숙해질수록 고맙다는 말을 아끼지 마세요.', '설렘이 오래가는 사이예요. 기념일보다 평범한 날의 작은 선물이 더 마음에 남아요.'],
  friend: ['서로 다른 점이 많아 배울 것도 많아요. 공통 취미 하나를 만들어 보세요.', '오래 갈 친구예요. 연락이 뜸해져도 다시 만나면 금세 가까워져요.', '서로의 든든한 편이에요. 힘들 때 먼저 손을 내밀어 주는 사이로 지켜 가세요.'],
  work: ['역할이 겹치면 부딪히기 쉬워요. 맡을 일을 처음부터 나눠 적어 두세요.', '손발이 잘 맞는 편이에요. 결정권자만 정해 두면 일이 빨라요.', '함께 일하면 결과가 커지는 사이예요. 공동 목표를 숫자로 정해 보세요.'],
};
const tierOf = (v) => (v >= 75 ? 2 : v >= 60 ? 1 : 0);
const SUB_DO = {
  love: ['좋은 점: 서로의 다름에서 새로운 세상을 배워요. 이렇게 해 보세요: 데이트 코스를 번갈아 정하기. 피할 것: 「너는 왜 늘 그래」처럼 성격을 묶어 말하기.', '좋은 점: 함께 있으면 마음이 편안해요. 이렇게 해 보세요: 한 달에 한 번 새로운 곳 가 보기. 피할 것: 익숙함에 기대 고마움을 말하지 않기.', '좋은 점: 오래 봐도 설렘이 남아요. 이렇게 해 보세요: 둘만의 기념 의식 하나 만들기. 피할 것: 좋은 사이라고 서운함을 덮어 두기.'],
  friend: ['좋은 점: 서로에게 없는 시선을 줘요. 이렇게 해 보세요: 고민이 생기면 의견부터 묻기. 피할 것: 돈이 오가는 부탁을 쉽게 하기.', '좋은 점: 오랜만에 만나도 어색하지 않아요. 이렇게 해 보세요: 계절마다 한 번 만나는 약속. 피할 것: 연락이 뜸하다고 서운해하기.', '좋은 점: 힘들 때 가장 먼저 떠오르는 사이예요. 이렇게 해 보세요: 서로의 좋은 소식을 먼저 축하하기. 피할 것: 비교하는 말.'],
  work: ['좋은 점: 서로 다른 강점으로 빈틈을 메워요. 이렇게 해 보세요: 역할과 마감을 글로 나누기. 피할 것: 말로만 한 약속.', '좋은 점: 손발이 잘 맞아 일이 빨라요. 이렇게 해 보세요: 결정권자를 일마다 정하기. 피할 것: 서로 미루는 일.', '좋은 점: 함께하면 결과가 커져요. 이렇게 해 보세요: 공동 목표를 숫자로 정하기. 피할 것: 성과 나누기를 나중으로 미루기.'],
};
// 오행별 함께하면 좋은 활동
const EL_ACTIVITY = ['숲길 산책·식물 기르기·새 강의 함께 듣기', '공연·전시·햇살 좋은 날의 나들이', '집밥 만들기·텃밭·도자기 공방', '정리 정돈·악기·운동 기록 같이 쓰기', '바다·온천·조용한 카페에서 긴 대화'];
// 궁합 묻고 답하기: [질문, 답(점수 구간 0~2)]
const COMPAT_QA = [
  ['오래 갈 수 있을까요?', ['처음엔 맞춰 가는 시간이 필요해요. 서로의 속도를 인정하는 순간부터 관계가 단단해져요.', '편안함이 큰 사이라 오래 갈 힘이 있어요. 익숙함 속에서도 고마움을 표현하면 더 오래가요.', '서로를 끌어당기는 힘이 큰 사이예요. 다툼이 생겨도 금세 다시 찾게 되는 인연이에요.']],
  ['다투면 누가 먼저 다가가야 할까요?', ['둘 다 고집이 있는 편이라, 「먼저 사과하는 사람이 이긴다」는 규칙을 정해 두면 좋아요.', '말하는 속도가 빠른 쪽이 먼저 한 발 물러나면 대화가 금세 풀려요.', '누가 먼저든 금세 풀리는 사이예요. 다만 서운함을 쌓아 두지만 않으면 돼요.']],
  ['돈 관리는 누가 하면 좋을까요?', ['돈에 대한 생각이 다를 수 있어요. 공동 통장과 각자 통장을 나눠 두면 다툼이 줄어요.', '토·금 기운이 더 많은 쪽이 살림을, 목·화 기운이 더 많은 쪽이 계획과 경험을 맡으면 자연스러워요.', '돈 이야기를 편하게 나눌 수 있는 사이예요. 한 해 목표 금액을 함께 정해 보세요.']],
  ['함께 일하거나 사업해도 될까요?', ['역할이 겹치면 부딪히기 쉬워요. 시작 전에 역할·수익·결정권을 글로 정해 두면 가능해요.', '손발이 맞는 편이라 작은 일부터 함께 해 보면 좋아요. 성과 나누기는 처음부터 정해 두세요.', '서로의 강점이 맞물려 결과가 커지는 사이예요. 공동 목표를 숫자로 정하면 더 멀리 가요.']],
  ['결혼이나 동거처럼 함께 사는 건 어떨까요?', ['생활 방식이 다른 편이라 각자의 시간과 공간을 정해 두면 오히려 편안해요.', '생활 리듬이 무난하게 맞는 편이에요. 집안일을 미리 나눠 두면 다툼이 크게 줄어요.', '생활 리듬이 잘 맞물리는 사이예요. 함께 사는 시간이 길수록 서로를 더 닮아 가요.']],
];
const SPOUSE_LIKE = ['대등하게 어깨를 나란히 하는', '즐겁게 표현하며 챙겨 주는', '현실적으로 생활을 꾸리는', '믿음직하게 약속을 지키는', '따뜻하게 품어 주는'];
// 일간 오행별 말하는 방식
const TALK = [
  '목(木) 일간은 계획과 방향을 먼저 말해요. 「어디로 갈지」가 정해지면 마음이 놓여요.',
  '화(火) 일간은 감정과 생각을 바로 표현해요. 반응이 빨라야 신이 나요.',
  '토(土) 일간은 천천히 듣고 나중에 말해요. 답이 늦어도 마음이 없는 게 아니에요.',
  '금(金) 일간은 결론부터 말해요. 짧은 말투가 차갑게 들려도 뜻은 분명해요.',
  '수(水) 일간은 생각을 오래 품었다가 말해요. 혼자 정리할 시간을 주면 깊은 이야기를 꺼내요.',
];
const EL_PAIR = [
  '목 기운은 계획과 시작을 맡아요.', '화 기운은 분위기와 표현을 맡아요.', '토 기운은 살림과 중재를 맡아요.', '금 기운은 결정과 마무리를 맡아요.', '수 기운은 휴식과 생각 정리를 맡아요.',
];

/**
 * 궁합 상세
 * @param ctx { me, friend (computeSaju), compat(computeCompat 결과), myName, friendName, yMe, yFriend (같은 해 yearOf), year }
 */
export function buildCompatReport(ctx) {
  const { me, friend, compat: c, myName = '나', friendName = '상대', yMe, yFriend } = ctx;
  const A = myName; const B = friendName;
  const sections = [];
  const DA = DAY_MASTER_PROFILE[me.dayMaster]; const DB = DAY_MASTER_PROFILE[friend.dayMaster];
  sections.push({ key: 'open', h: '열면서 · 두 사람의 궁합 한눈에', blocks: [{ paras: [
    `${A}와 ${B}의 궁합은 ${c.score}점, 「${c.grade.label}」이에요. ${sentence(c.grade.desc)}`.replace(`${A}와`, josa(A, '과/와')),
    `점수는 네 가지를 더해 나왔어요. 타고난 기운(일간) ${c.parts.stem >= 0 ? '+' : ''}${c.parts.stem}, 생활 자리(일지) ${c.parts.day >= 0 ? '+' : ''}${c.parts.day}, 필요한 기운 채워 주기 +${c.parts.yong}, 띠 ${c.parts.ddi >= 0 ? '+' : ''}${c.parts.ddi}. 이 상세 풀이는 네 가지를 하나씩 풀고, 다툼이 생기는 장면과 푸는 말, 함께하기 좋은 달까지 짚어요.`,
  ] }] });

  sections.push({ key: 'nature', h: '두 사람의 본바탕', blocks: [
    { h: `${A} · ${DA.name}, ${DA.image}`, paras: [DA.text] },
    { h: `${B} · ${DB.name}, ${DB.image}`, paras: [DB.text] },
    ...[[A, me], [B, friend]].map(([n, sj]) => { const il = buildIlju(sj); return { h: `${n}의 일주 · ${il.name}, ${il.image}`, paras: [il.paras.personality, `사랑: ${il.paras.love}`] }; }),
    { h: '말하는 방식이 다를 때', paras: [`${A}: ${TALK[STEM_ELEMENT[me.dayMaster]]}`, `${B}: ${TALK[STEM_ELEMENT[friend.dayMaster]]}`, STEM_ELEMENT[me.dayMaster] === STEM_ELEMENT[friend.dayMaster] ? '말하는 방식이 닮아 대화가 편해요. 다만 둘 다 같은 순간에 같은 것을 원할 때가 있으니, 순서를 번갈아 양보해 보세요.' : '말하는 방식이 달라, 상대의 속도를 알아 두는 것만으로 오해가 크게 줄어요.'] },
  ] });

  sections.push({ key: 'stem', h: `타고난 기운(일간) · ${c.stem.label}`, blocks: [{ paras: [`${STEMS[me.dayMaster]} × ${STEMS[friend.dayMaster]}: ${sentence(c.stem.text)}`, ...STEM_REL_DETAIL[c.stem.type]] }] });

  const dayParas = c.day.unknown ? [sentence(c.day.text)] : [
    `${BRANCHES[me.pillars.day.branch]} × ${BRANCHES[friend.pillars.day.branch]}: ${sentence(c.day.label)} 일지는 배우자와 생활의 자리라, 정통 궁합에서 가장 무겁게 보는 곳이에요.`,
    ...(c.day.kinds.length ? c.day.kinds.map((k) => DAY_KIND_TEXT[k]).filter(Boolean) : ['생활 자리끼리 크게 묶이거나 부딪히지 않는 담백한 사이예요. 각자의 리듬을 존중하면서 천천히 맞춰 가면 편안해요.']),
  ];
  sections.push({ key: 'day', h: '생활 자리(일지) · 함께 사는 리듬', blocks: [{ paras: dayParas }] });

  const elA = me.elements; const elB = friend.elements;
  sections.push({ key: 'fill', h: '서로 채워 주는 기운', blocks: [{ paras: [
    `${A}의 다섯 기운: ${[0, 1, 2, 3, 4].map((e) => `${ELEMENT_KO[e]} ${elA[e]}%`).join(' · ')}. ${B}의 다섯 기운: ${[0, 1, 2, 3, 4].map((e) => `${ELEMENT_KO[e]} ${elB[e]}%`).join(' · ')}.`,
    `${A}에게 가장 필요한 기운은 ${el(me.yongsin)}이고, ${B}에게는 그 기운이 ${elB[me.yongsin]}% 있어 ${c.yongMe}칸을 채워 줘요. ${B}에게 가장 필요한 기운은 ${el(friend.yongsin)}이고, ${A}에게는 ${elA[friend.yongsin]}% 있어 ${c.yongFriend}칸을 채워 줘요.`,
    ...[0, 1, 2, 3, 4].map((e) => { const d = elA[e] - elB[e]; return `${EL_PAIR[e]} ${Math.abs(d) < 8 ? `둘 다 비슷하게 가지고 있어(${elA[e]}% · ${elB[e]}%) 이 부분은 함께 나눠 맡으면 돼요.` : `${d > 0 ? A : B} 쪽이 더 많이 가지고 있어(${elA[e]}% · ${elB[e]}%) 이 역할은 ${d > 0 ? A : B} 쪽이 맡으면 자연스러워요.`}`; }),
    c.yongMe + c.yongFriend >= 8 ? '서로에게 없는 것을 가진 사이라, 함께 있을 때 둘 다 한결 편안해져요. 지칠 때 서로를 찾게 되는 이유예요.' : c.yongMe + c.yongFriend >= 4 ? '한쪽이 조금 더 채워 주는 사이예요. 받는 쪽이 고마움을 표현하면 균형이 맞춰져요.' : '서로의 빈자리를 채우는 힘은 크지 않아요. 대신 각자의 강점이 뚜렷하니, 함께할 일을 나눠 맡으면 잘 맞아요.',
  ] }] });

  sections.push({ key: 'ddi', h: `띠 · ${ANIMALS[me.pillars.year.branch]}띠와 ${ANIMALS[friend.pillars.year.branch]}띠`, blocks: [{ paras: [`${c.branch.label}: ${sentence(c.branch.text)} 띠는 재미로 가볍게 보는 자리라 점수에 작게 반영했어요.`] }] });

  sections.push({ key: 'sub', h: '관계별 궁합', blocks: Object.entries(c.sub).map(([k, v]) => ({ h: `${SUB_LABEL[k]} ${v}점`, paras: [SUB_TIP[k][tierOf(v)], SUB_DO[k][tierOf(v)]] })) });

  // 다툼과 푸는 말: 두 사람 십성 중심
  const ta = tenGodProfile(me); const tb = tenGodProfile(friend);
  const topA = ta.groups.slice().sort((x, y) => y.pct - x.pct)[0]; const topB = tb.groups.slice().sort((x, y) => y.pct - x.pct)[0];
  const FIGHT = {
    bigeop: ['자기 뜻이 분명해 「내 방식」을 고집하기 쉬워요', '「네 생각도 맞아, 이번엔 이렇게 해 볼까?」'],
    siksang: ['솔직한 말이 날카롭게 들리기 쉬워요', '「내가 하고 싶은 말은 ~인데, 너는 어때?」'],
    jaeseong: ['돈과 실속을 따지다 서운함을 사기 쉬워요', '「계산보다 네 마음이 더 궁금해」'],
    gwanseong: ['규칙과 체면을 앞세우다 속마음을 숨기기 쉬워요', '「사실 나 이게 좀 속상했어」'],
    inseong: ['혼자 짐작하고 기다리다 서운함이 쌓이기 쉬워요', '「궁금한 거 있는데 물어봐도 돼?」'],
  };
  sections.push({ key: 'fight', h: '다툼이 생기는 장면과 푸는 말', blocks: [
    { h: `${A} · ${topA.label} 중심`, paras: [`${A}는 ${topA.label}(${topA.pct}%)이 가장 많아 ${FIGHT[topA.key][0]}. 다툼이 생기면 이렇게 꺼내 보세요: ${FIGHT[topA.key][1]}`.replace(`${A}는`, josa(A, '은/는'))] },
    { h: `${B} · ${topB.label} 중심`, paras: [`${B}는 ${topB.label}(${topB.pct}%)이 가장 많아 ${FIGHT[topB.key][0]}. 다툼이 생기면 이렇게 꺼내 보세요: ${FIGHT[topB.key][1]}`.replace(`${B}는`, josa(B, '은/는'))] },
    { h: '둘만의 규칙', paras: [topA.key === topB.key ? '두 사람의 중심 기운이 같아요. 같은 지점에서 부딪히는 만큼, 한 사람이 먼저 한 발 물러나면 다른 사람도 금세 따라와요. 「먼저 물러나는 사람이 이긴다」를 둘만의 규칙으로 정해 보세요.' : '두 사람의 중심 기운이 달라요. 서로 다른 무기를 가진 한 팀이라, 다툼은 「누가 맞나」가 아니라 「누가 이 일에 더 맞나」로 바꾸면 쉽게 풀려요.'] },
  ] });

  // 배우자 기운: 여성은 나를 다듬는 오행(관성), 남성은 내가 다루는 오행(재성)이 상대에게 얼마나 있는지
  const spouseEl = (sj, g) => (STEM_ELEMENT[sj.dayMaster] + (g === 'male' ? 2 : 3)) % 5;
  const ga = ctx.myGender || 'female'; const gb = ctx.friendGender || (ga === 'female' ? 'male' : 'female');
  const ea = spouseEl(me, ga); const eb = spouseEl(friend, gb);
  const spLine = (who2, pct) => (pct >= 25 ? `${josa(who2, '이/가')} 그 기운을 넉넉히 가져, 배우자 같은 든든함을 주기 쉬워요.` : pct >= 12 ? '알맞게 있어, 함께할수록 그 역할이 자연스럽게 생겨요.' : '많지 않아, 배우자 같은 역할보다 친구 같은 편안함이 먼저 오는 사이예요.');
  const spParas = [
    `정통 궁합에서는 여성에게 나를 다듬어 주는 기운(관성), 남성에게 내가 다루는 기운(재성)을 배우자의 기운으로 봐요. ${A}에게 그 기운은 ${el(ea)}이고, ${B}의 사주에 ${elB[ea]}% 있어요. ${spLine(B, elB[ea])}`,
    `${B}에게 배우자의 기운은 ${el(eb)}이고, ${A}의 사주에 ${elA[eb]}% 있어요. ${spLine(A, elA[eb])}`,
  ];
  if (me.pillars.day && friend.pillars.day) {
    const dgA = tenGod(me.dayMaster, BRANCH_MAIN_STEM[me.pillars.day.branch]); const dgB = tenGod(friend.dayMaster, BRANCH_MAIN_STEM[friend.pillars.day.branch]);
    spParas.push(`배우자 자리(일지)를 보면 ${josa(A, '은/는')} ${dgA}의 기운이라 「${SPOUSE_LIKE[GROUP[dgA]]}」 관계를, ${josa(B, '은/는')} ${dgB}의 기운이라 「${SPOUSE_LIKE[GROUP[dgB]]}」 관계를 편안해해요. ${GROUP[dgA] === GROUP[dgB] ? '원하는 관계의 모습이 같아 서로의 기대가 잘 맞아요.' : '원하는 관계의 모습이 달라, 서로가 바라는 것을 한 번씩 말로 확인해 두면 좋아요.'}`);
  }
  sections.push({ key: 'spouse', h: '서로에게 배우자 기운이 있을까', blocks: [{ paras: spParas }] });

  const LA = ELEMENT_LUCK[me.yongsin]; const LB = ELEMENT_LUCK[friend.yongsin];
  sections.push({ key: 'together', h: '둘에게 힘이 되는 것', blocks: [{ paras: [
    `${A}에게 필요한 ${el(me.yongsin)} 기운의 활동은 ${EL_ACTIVITY[me.yongsin]}, ${B}에게 필요한 ${el(friend.yongsin)} 기운의 활동은 ${iyeyo(EL_ACTIVITY[friend.yongsin])}. ${me.yongsin === friend.yongsin ? '두 사람에게 필요한 기운이 같아, 같은 활동이 둘 모두를 채워 줘요.' : '번갈아 서로의 활동을 함께해 주면, 둘 다 필요한 기운을 받아요.'}`,
    `둘의 행운 색은 ${LA.color}${LA.color === LB.color ? '' : `, ${LB.color}`}, 행운 숫자는 ${[...new Set([...LA.numbers, ...LB.numbers])].join('·')}, 만나기 좋은 방향은 ${LA.direction}${LA.direction === LB.direction ? '' : `, ${LB.direction}`}이에요. 함께 쓰는 물건이나 기념일 장소를 고를 때 떠올려 보세요.`,
  ] }] });

  const qaTier = (k) => tierOf(k === 0 ? c.score : k === 1 ? (c.sub.friend + c.sub.love) / 2 : k === 3 ? c.sub.work : k === 4 ? 55 + c.parts.day * 2 + c.parts.yong : c.sub.love);
  sections.push({ key: 'qa', h: '궁합 묻고 답하기', blocks: COMPAT_QA.map(([q, a], k) => ({ h: q, paras: [a[qaTier(k)]] })) });

  // 함께하기 좋은 달(같은 해)
  if (yMe && yFriend) {
    const both = yMe.months.map((m, i) => ({ m, i, v: Math.round((categoryScores(m.score, m.god).love + categoryScores(yFriend.months[i].score, yFriend.months[i].god).love) / 2) }));
    const s = [...both].sort((a, b) => b.v - a.v || a.i - b.i);
    sections.push({ key: 'months', h: `${yMe.sajuYear}년 · 함께하기 좋은 달`, blocks: [{ paras: [
      `두 사람의 ${yMe.sajuYear}년 애정 흐름을 나란히 놓으면, 함께하기 가장 좋은 달은 ${s.slice(0, 3).map((x) => `${x.m.solarMonth}월(${monthRange(yMe.months, x.i)})`).join(', ')}이에요. 여행·기념일·중요한 이야기는 이 달에 잡아 보세요.`,
      `${s[s.length - 1].m.solarMonth}월(${monthRange(yMe.months, s[s.length - 1].i)})은 둘 다 마음이 바쁘기 쉬운 달이에요. 서운한 일이 생겨도 이 달의 탓으로 돌리고 하루만 넘겨 이야기해 보세요.`,
      ...both.map((x) => { const f = yFriend.months[x.i]; return `${x.m.solarMonth}월(${x.v}점): ${josa(A, '은/는')} 「${GOD_READING[x.m.god].keyword}」, ${josa(B, '은/는')} 「${GOD_READING[f.god].keyword}」의 달이에요. ${x.m.god === f.god ? '같은 기운이 들어와 마음이 한 방향으로 모여요.' : GROUP[x.m.god] === GROUP[f.god] ? '비슷한 기운이라 서로의 사정을 잘 이해해요.' : '들어오는 기운이 달라, 서로의 바쁨을 너그럽게 봐 주면 좋아요.'}`; }),
      `그해 전체로 보면 ${josa(A, '은/는')} ${yMe.year.god}, 「${GOD_READING[yMe.year.god].keyword}」의 해, ${josa(B, '은/는')} ${yFriend.year.god}, 「${GOD_READING[yFriend.year.god].keyword}」의 해예요. ${first(GOD_READING[yMe.year.god].fields.love)} ${first(GOD_READING[yFriend.year.god].fields.love)}`,
      yMe.daewoon && yFriend.daewoon ? `10년 큰 흐름으로는 ${josa(A, '이/가')} 「${GOD_READING[yMe.daewoon.god].keyword}」의 대운, ${josa(B, '이/가')} 「${GOD_READING[yFriend.daewoon.god].keyword}」의 대운을 지나고 있어요. 서로가 지금 어떤 10년을 지나는지 알면, 상대의 선택을 더 너그럽게 응원할 수 있어요.` : '',
    ].filter(Boolean) }] });
  }

  sections.push({ key: 'close', h: '둘을 위한 실천 다섯 가지', blocks: [{ paras: [
    `① ${SUB_TIP.love[tierOf(c.sub.love)]} ② ${STEM_REL_DETAIL[c.stem.type][1]} ③ 다툼이 생기면 서로의 「푸는 말」을 먼저 써 보기. ④ ${c.tip} ⑤ 이 풀이를 함께 읽고, 맞는 부분과 다른 부분을 서로 이야기해 보기.`,
    '궁합은 정해진 성적표가 아니라 두 사람이 서로를 이해하는 지도예요. 점수가 높든 낮든, 서로의 다름을 알고 맞춰 가는 사이가 가장 좋은 궁합이에요.',
  ] }] });

  const rep = { kind: 'compat', title: '궁합 상세', sub: `${A} × ${B}`, sections };
  rep.toc = tocOf(rep); rep.chars = charCount(rep);
  return rep;
}
