// 사주 엔진: 만세력(절기 기준) → 사주 8글자 → 오행 분포 → 신강/신약 → 용신
// 외부 라이브러리 없이 동작한다. 절기는 태양 황경을 계산해서 판정한다 (오차 약 ±15분).

import { johuStems, stemForElement, johuSentence, stemLabel, presentIn, MONTH_SEASON } from './johu.js';

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const STEMS_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const BRANCHES_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
export const ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];

// 오행 인덱스: 0 목, 1 화, 2 토, 3 금, 4 수 (상생 순서)
export const ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'];
export const ELEMENT_KO = ['목', '화', '토', '금', '수'];
export const ELEMENT_HANJA = ['木', '火', '土', '金', '水'];

export const STEM_ELEMENT = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
export const BRANCH_ELEMENT = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
// 지지의 본기(本氣) 천간: 십신 계산에 쓴다
export const BRANCH_MAIN_STEM = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8];

const mod = (n, m) => ((n % m) + m) % m;

// ---------- 천문 계산 ----------

/** 그레고리력 날짜(UT 기준 시각, 시간은 소수 허용) → 율리우스일 */
export function julianDay(y, m, d, hourUT = 12) {
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5 + hourUT / 24;
}

/** 정수 율리우스 일수 (일주 계산용) */
export function julianDayNumber(y, m, d) {
  return Math.round(julianDay(y, m, d, 12));
}

/** 태양의 겉보기 황경 (도). Meeus 저정밀 공식 */
export function sunLongitude(jd) {
  const T = (jd - 2451545.0) / 36525;
  const rad = Math.PI / 180;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * rad;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
    + 0.000289 * Math.sin(3 * M);
  const omega = (125.04 - 1934.136 * T) * rad;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega);
  return mod(lambda, 360);
}

/**
 * 한국 표준시의 UTC 오프셋(시간). 역사적 변경 반영 (서머타임 제외)
 *  ~1911: UTC+8:30 / 1912~1954.3.20: UTC+9 / 1954.3.21~1961.8.9: UTC+8:30 / 1961.8.10~: UTC+9
 */
export function koreaUtcOffset(jdUT) {
  if (jdUT < 2419402.5) return 8.5; // 1912-01-01
  if (jdUT < 2434822.5) return 9; // 1954-03-21
  if (jdUT < 2437521.5) return 8.5; // 1961-08-10
  return 9;
}

// ---------- 날짜 보조 ----------

function addDays(y, m, d, n) {
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()];
}

/** 날짜 → 일주 인덱스(0~59, 0 = 甲子). 2000-01-01 = 戊午(54) 기준으로 검증됨 */
export function dayPillarIndex(y, m, d) {
  return mod(julianDayNumber(y, m, d) + 49, 60);
}

export function pillarFromIndex(idx60) {
  return { stem: idx60 % 10, branch: idx60 % 12 };
}

// ---------- 사주 계산 ----------

/**
 * @param {object} input
 * @param {number} input.year, input.month, input.day  양력 생년월일
 * @param {number} [input.hour], [input.minute]          출생 시각 (한국 표준시)
 * @param {boolean} [input.timeKnown=true]
 * @param {boolean} [input.longitudeCorrection=true]     한국 경도 보정 (-30분, 진태양시 근사)
 * @param {'early'|'late'} [input.zasiMode='early']       early: 23시에 날짜 변경 / late: 야자시 (0시에 날짜 변경)
 */
export function computeSaju(input, opts = {}) {
  const {
    year, month, day,
    hour = 12, minute = 0,
    timeKnown = true,
    longitudeCorrection = true,
    zasiMode = 'early',
  } = input;

  // 1) 절기 판정: 실제 시각(KST → UT)으로 태양 황경을 구한다
  const h = timeKnown ? hour + minute / 60 : 12;
  const utcOffset = koreaUtcOffset(julianDay(year, month, day, 0));
  const lambda = sunLongitude(julianDay(year, month, day, h - utcOffset));

  // 2) 연주: 입춘(황경 315°) 전이면 전년도
  let sajuYear = year;
  if (month <= 2 && lambda >= 250 && lambda < 315) sajuYear -= 1;
  const yearStem = mod(sajuYear - 4, 10);
  const yearBranch = mod(sajuYear - 4, 12);

  // 3) 월주: 입춘부터 30°마다 寅, 卯, 辰 ...
  const monthOrder = Math.floor(mod(lambda - 315, 360) / 30); // 0 = 寅월
  const monthStem = mod(mod(yearStem, 5) * 2 + 2 + monthOrder, 10);
  const monthBranch = mod(monthOrder + 2, 12);

  // 4) 일주와 시주
  let [dy, dm, dd] = [year, month, day];
  let hourPillar = null;
  let dayIdx;

  if (timeKnown) {
    // 한국 중앙(동경 127.5°)의 태양시 = UTC+8:30. 표준시가 UTC+9인 시기에는 30분을 뺀다
    let mins = hour * 60 + minute - (longitudeCorrection ? Math.round((utcOffset - 8.5) * 60) : 0);
    if (mins < 0) { mins += 1440; [dy, dm, dd] = addDays(dy, dm, dd, -1); }
    const isLateZi = mins >= 23 * 60;
    if (isLateZi && zasiMode === 'early') [dy, dm, dd] = addDays(dy, dm, dd, 1);
    dayIdx = dayPillarIndex(dy, dm, dd);

    const hourBranch = Math.floor((mins / 60 + 1) / 2) % 12;
    // 야자시: 일주는 당일, 시간의 천간은 다음 날 일간 기준
    const stemBaseDay = (isLateZi && zasiMode === 'late')
      ? pillarFromIndex(mod(dayIdx + 1, 60)).stem
      : pillarFromIndex(dayIdx).stem;
    const hourStem = mod(mod(stemBaseDay, 5) * 2 + hourBranch, 10);
    hourPillar = { stem: hourStem, branch: hourBranch };
  } else {
    dayIdx = dayPillarIndex(dy, dm, dd);
  }

  const dayPillar = pillarFromIndex(dayIdx);
  const pillars = {
    hour: hourPillar,
    day: dayPillar,
    month: { stem: monthStem, branch: monthBranch },
    year: { stem: yearStem, branch: yearBranch },
  };

  const elements = elementScores(pillars);
  const chartStems = [pillars.year.stem, pillars.month.stem, ...(hourPillar ? [hourPillar.stem] : [])];
  const strength = analyzeStrength(dayPillar.stem, elements, monthBranch, chartStems, { ...opts, pillars });

  return {
    input: { year, month, day, hour, minute, timeKnown, longitudeCorrection, zasiMode },
    utcOffset,
    sajuYear,
    solarLongitude: lambda,
    pillars,
    dayMaster: dayPillar.stem,
    animal: ANIMALS[yearBranch],
    elements,
    ...strength,
  };
}

/**
 * 지장간 월률분야(v0.37): 지지 속 천간과 30일 중 맡는 날 수 [천간, 날 수] (여기 → 중기 → 본기)
 * 子 壬10 癸20 · 丑 癸9 辛3 己18 · 寅 戊7 丙7 甲16 · 卯 甲10 乙20 · 辰 乙9 癸3 戊18 · 巳 戊7 庚7 丙16
 * 午 丙10 己9 丁11 · 未 丁9 乙3 己18 · 申 戊7 壬7 庚16 · 酉 庚10 辛20 · 戌 辛9 丁3 戊18 · 亥 戊7 甲7 壬16
 */
export const HIDDEN_DAYS = [
  [[8, 10], [9, 20]], [[9, 9], [7, 3], [5, 18]], [[4, 7], [2, 7], [0, 16]], [[0, 10], [1, 20]],
  [[1, 9], [9, 3], [4, 18]], [[4, 7], [6, 7], [2, 16]], [[2, 10], [5, 9], [3, 11]], [[3, 9], [1, 3], [5, 18]],
  [[4, 7], [8, 7], [6, 16]], [[6, 10], [7, 20]], [[7, 9], [3, 3], [4, 18]], [[4, 7], [0, 7], [8, 16]],
];

/**
 * 오행 점수 (합계 100). 천간 1.0, 지지 1.0(월지 1.5)
 * v0.37부터 지지는 지장간 날 수 비율로 나눠 셈(寅 = 戊·丙·甲 7:7:16). opts.basic = 예전 방식(지지 = 본래 오행 하나)
 * opts.stemEl = 합화로 오행이 바뀐 천간 { year: 2, ... }
 */
export function elementScores(pillars, opts = {}) {
  const raw = [0, 0, 0, 0, 0];
  for (const [key, p] of Object.entries(pillars)) {
    if (!p) continue;
    raw[opts.stemEl?.[key] ?? STEM_ELEMENT[p.stem]] += 1;
    const w = key === 'month' ? 1.5 : 1;
    if (opts.basic) { raw[BRANCH_ELEMENT[p.branch]] += w; continue; }
    for (const [st, days] of HIDDEN_DAYS[p.branch]) raw[STEM_ELEMENT[st]] += (w * days) / 30;
  }
  const total = raw.reduce((a, b) => a + b, 0);
  const scores = raw.map((v) => Math.round((v / total) * 100));
  // 반올림 오차 보정
  const diff = 100 - scores.reduce((a, b) => a + b, 0);
  if (diff !== 0) scores[scores.indexOf(Math.max(...scores))] += diff;
  return scores;
}

export const parentOf = (el) => mod(el - 1, 5);   // 나를 생해 주는 오행
export const childOf = (el) => mod(el + 1, 5);    // 내가 생하는 오행
export const controllerOf = (el) => mod(el - 2, 5); // 나를 극하는 오행

/**
 * 조후(調候): 태어난 달의 계절 기온·습도를 맞추는 기운.
 * 궁통보감의 핵심만 간추림 — 한여름(午·未)은 물(水)로 식히고, 한겨울(子·丑)은 불(火)로 데운다.
 * 巳·亥(초여름·초겨울)와 寅(이른 봄 추위)·戌(건조한 늦가을)은 약하게 필요.
 * level: 'urgent'(조후가 억부보다 먼저) · 'mild'(억부가 먼저, 조후는 희신으로 보완) · 'none'
 */
const JOHU_RULES = {
  6: { season: '한여름', need: 4, urgent: 15, mild: 25, why: '불볕더위 달에 태어나 뜨겁고 메마른 기운을 식혀 줄 물(水)이 필요해요' },
  7: { season: '늦여름', need: 4, urgent: 15, mild: 25, why: '무덥고 습한 늦여름 달에 태어나 열기를 식혀 줄 물(水)이 필요해요' },
  5: { season: '초여름', need: 4, urgent: 0, mild: 15, why: '더위가 시작되는 달에 태어나 물(水)이 있으면 균형이 좋아져요' },
  0: { season: '한겨울', need: 1, urgent: 15, mild: 25, why: '얼어붙는 한겨울 달에 태어나 따뜻하게 데워 줄 불(火)이 필요해요' },
  1: { season: '늦겨울', need: 1, urgent: 15, mild: 25, why: '차고 축축한 늦겨울 달에 태어나 언 땅을 녹여 줄 불(火)이 필요해요' },
  11: { season: '초겨울', need: 1, urgent: 0, mild: 15, why: '추위가 시작되는 달에 태어나 불(火)이 있으면 균형이 좋아져요' },
  2: { season: '이른 봄', need: 1, urgent: 0, mild: 10, why: '아직 쌀쌀한 이른 봄 달에 태어나 햇볕 같은 불(火)이 있으면 새싹이 잘 자라요' },
  10: { season: '늦가을', need: 4, urgent: 0, mild: 10, why: '건조한 늦가을 달에 태어나 물(水)이 있으면 메마름이 풀려요' },
};

/** 조후표 처방이 이보다 적으면(%) 봄·가을에도 희신으로 보완 (v0.35, 검증 세트로 조정할 값) */
export const TABLE_MILD = 10;
const EL_NAME = ['나무(木)', '불(火)', '흙(土)', '쇠(金)', '물(水)'];

/**
 * 조후. dayStem을 주면(v0.35) 120 조후표로 천간 단위 처방까지:
 * - 한여름·한겨울 등 기온 규칙(JOHU_RULES)이 걸리면 그 오행(물·불)을 쓰되, 글자는 표에서 그 오행 천간(예: 癸수·壬수)
 * - 기온 규칙이 없거나 이미 맞춰진 달(봄·가을 포함)은 표의 첫 글자. 그 오행이 TABLE_MILD% 미만이면 희신으로 보완
 * chartStems = 사주 천간(연·월·일·시)으로, 처방 글자가 이미 드러나 있는지 문장에 씀
 */
export function analyzeJohu(monthBranch, scores, dayStem = null, chartStems = [], opts = {}) {
  const r = JOHU_RULES[monthBranch];
  const tableMild = opts.tableMild ?? TABLE_MILD;
  const useTable = dayStem != null && monthBranch >= 0 && monthBranch < 12;
  const stems = useTable ? johuStems(dayStem, monthBranch) : [];
  const extra = (stem) => {
    if (!useTable || stem == null) return {};
    const here = presentIn(chartStems, [stem]).length > 0;
    return { stem, stems, present: here, table: johuSentence(dayStem, monthBranch, stem) + (here ? ` 사주 천간에 ${stemLabel(stem)}${'이가'[[0, 3].includes(Math.floor(stem / 2)) ? 0 : 1]} 이미 드러나 있어 든든해요.` : '') };
  };
  if (r) {
    const have = scores[r.need];
    const level = have < r.urgent ? 'urgent' : have < r.mild ? 'mild' : 'none';
    if (level !== 'none') {
      const stem = useTable ? stemForElement(dayStem, monthBranch, r.need) : null;
      return { level, need: r.need, season: r.season, have, text: `${r.why}. 지금 사주에는 ${r.need === 4 ? '물(水)' : '불(火)'} 기운이 ${have}%뿐이에요.`, source: 'season', ...extra(stem) };
    }
    if (!useTable) return { level, need: null, season: r.season, have, text: `${r.season}에 태어났지만 사주에 이미 ${r.need === 4 ? '물(水)' : '불(火)'} 기운이 ${have}% 있어 기후가 맞춰져 있어요.` };
  }
  if (!useTable) return { level: 'none', need: null, season: null, text: '태어난 달의 기후가 온화해 따로 맞출 기온·습도가 없어요.' };
  const key = stems[0]; const el = Math.floor(key / 2); const have = scores[el];
  const season = MONTH_SEASON[monthBranch];
  if (have < tableMild) {
    return { level: 'mild', need: el, season, have, text: `조후표로 보면 ${johuSentence(dayStem, monthBranch, key)} 지금 사주에는 ${EL_NAME[el]} 기운이 ${have}%뿐이라 보태 주면 좋아요.`, source: 'table', ...extra(key), table: johuSentence(dayStem, monthBranch, key) };
  }
  return { level: 'none', need: null, season, have, text: `${season}에 태어났고, 조후표가 꼽는 ${EL_NAME[el]} 기운이 사주에 ${have}% 있어 계절 균형이 맞춰져 있어요.`, source: 'table', ...extra(key) };
}

/** 강약 7단계(v0.37) */
export const STRENGTH_LEVELS = ['극신약', '신약', '중화신약', '중화', '중화신강', '신강', '극신강'];
const STRENGTH_GROUP = { 극신약: '신약', 신약: '신약', 중화신약: '중화', 중화: '중화', 중화신강: '중화', 신강: '신강', 극신강: '신강' };
export const STRENGTH_CUTS = [22, 36, 45, 55, 64, 78]; // 이 점수 미만이면 앞 단계 (중화는 45~55)
export function levelOf(score) {
  const i = STRENGTH_CUTS.findIndex((c, k) => (k < 3 ? score < c : score <= c));
  return STRENGTH_LEVELS[i < 0 ? 6 : i];
}

/**
 * 강약 점수(0~100): 나와 나를 돕는 기운의 비율(지장간 포함)에
 * 득령(태어난 달 본기가 나를 도움) +8 / 실령 -4, 득지(태어난 날 지지 본기가 나를 도움) +4 / 실지 -2,
 * 통근(지지 어디에도 내 오행 뿌리가 없으면) -6 을 더함. 득세(연·월·시 천간 둘 이상이 도움)는 근거로만 표시
 */
export function strengthScore(dayStem, scores, pillars) {
  const me = STEM_ELEMENT[dayStem]; const sup = (e) => e === me || e === parentOf(me);
  let v = scores[me] + scores[parentOf(me)];
  const factors = [];
  const dl = sup(STEM_ELEMENT[BRANCH_MAIN_STEM[pillars.month.branch]]); v += dl ? 8 : -4; factors.push(dl ? '득령' : '실령');
  const dj = sup(STEM_ELEMENT[BRANCH_MAIN_STEM[pillars.day.branch]]); v += dj ? 4 : -2; factors.push(dj ? '득지' : '실지');
  const root = Object.values(pillars).some((p) => p && HIDDEN_DAYS[p.branch].some(([st]) => STEM_ELEMENT[st] === me));
  if (!root) v -= 6; factors.push(root ? '통근' : '뿌리 없음');
  const help = ['year', 'month', 'hour'].filter((k) => pillars[k] && sup(STEM_ELEMENT[pillars[k].stem])).length;
  factors.push(help >= 2 ? '득세' : '실세');
  return { score: Math.max(0, Math.min(100, Math.round(v))), factors };
}

/**
 * 신강/신약(억부) + 조후를 함께 본 용신.
 * - 억부: 나를 돕는 기운 비율로 강약을 나누고, 강하면 빼 주는 기운·약하면 돕는 기운 중 가장 적은 것
 * - 조후가 급하면(urgent) 조후 기운이 용신, 억부 용신은 희신
 * - 조후가 약하게 필요하면(mild) 억부 용신 그대로, 조후 기운은 희신
 * - 그 밖에는 억부 용신, 희신은 용신을 생해 주는 기운
 */
export function analyzeStrength(dayStem, scores, monthBranch = null, chartStems = [], opts = {}) {
  const me = STEM_ELEMENT[dayStem];
  const support = scores[me] + scores[parentOf(me)];
  let strength; let lean; let level = null; let strengthScoreV = null; let factors = [];
  if (opts.pillars) {
    // v0.37 강약 7단계: 돕는 기운 비율 + 득령·득지·통근 점수
    const r = strengthScore(dayStem, scores, opts.pillars);
    strengthScoreV = r.score; factors = r.factors; level = levelOf(r.score);
    strength = STRENGTH_GROUP[level]; lean = r.score < 45 ? 'weak' : r.score > 55 ? 'strong' : 'mid';
  } else {
    if (support >= 50) strength = '신강';
    else if (support <= 35) strength = '신약';
    else strength = '중화';
    lean = strength === '신강' ? 'strong' : strength === '신약' ? 'weak' : 'mid';
  }

  const pickLowest = (cands) => cands.reduce((a, b) => (scores[b] < scores[a] ? b : a));
  let eokbu;
  if (lean === 'strong') eokbu = pickLowest([childOf(me), mod(me + 2, 5), mod(me + 3, 5)]);
  else if (lean === 'weak') eokbu = pickLowest([parentOf(me), me]);
  else eokbu = pickLowest([0, 1, 2, 3, 4]);

  const johu = monthBranch == null ? analyzeJohu(-1, scores) : analyzeJohu(monthBranch, scores, chartStems.length ? dayStem : null, chartStems, opts);
  let yongsin = eokbu; let heesin = parentOf(eokbu); let basis = '억부';
  if (johu.need != null && johu.need === eokbu) basis = '억부·조후 일치';
  else if (johu.level === 'urgent') { yongsin = johu.need; heesin = eokbu; basis = '조후 우선'; }
  else if (johu.level === 'mild') { heesin = johu.need; basis = '억부 + 조후 보완'; }

  const weakest = pickLowest([0, 1, 2, 3, 4]);
  const strongest = [0, 1, 2, 3, 4].reduce((a, b) => (scores[b] > scores[a] ? b : a));
  return { strength, strengthLevel: level || strength, strengthScore: strengthScoreV ?? support, strengthFactors: factors, support, yongsin, gisin: controllerOf(yongsin), heesin, eokbuYongsin: eokbu, yongsinBasis: basis, johu, weakest, strongest };
}

const TEN_GOD_NAMES = [
  ['비견', '겁재'],
  ['식신', '상관'],
  ['편재', '정재'],
  ['편관', '정관'],
  ['편인', '정인'],
];

/** 일간 기준 다른 천간의 십신 */
export function tenGod(dayStem, otherStem) {
  const rel = mod(STEM_ELEMENT[otherStem] - STEM_ELEMENT[dayStem], 5);
  const samePolarity = dayStem % 2 === otherStem % 2;
  return TEN_GOD_NAMES[rel][samePolarity ? 0 : 1];
}

/** 오늘(한국 시간)의 날짜 정보 */
export function todayKST(now = new Date()) {
  const k = new Date(now.getTime() + 9 * 3600 * 1000);
  return { year: k.getUTCFullYear(), month: k.getUTCMonth() + 1, day: k.getUTCDate() };
}

export function pillarLabel(p) {
  return `${STEMS[p.stem]}${BRANCHES[p.branch]}`;
}

export function pillarLabelKo(p) {
  return `${STEMS_KO[p.stem]}${BRANCHES_KO[p.branch]}`;
}

/** 문자열 → 0~1 사이 고정 난수 (같은 입력이면 같은 값) */
export function seededRandom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
