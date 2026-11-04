// 개운(開運) 엔진
// 1) 정통 계산: 대운(10년 운)·세운(해마다의 운)을 명리학 규칙대로 계산한 "기본 흐름"
// 2) 오행 충전: 매일 모은 부적이 오행 게이지를 채움 → 개운 지수(0~100)
// 3) 개운 반영 흐름: 기본 흐름 + 개운 지수·진화 단계 보너스 → 앞으로 5년이 좋아지는 곡선
//    ※ 개운 반영 수치는 꾸준한 습관을 응원하기 위한 게임 요소이며, 기본 흐름은 정통 계산 그대로 보여 준다.
import { josa } from './josa.js';
import {
  STEMS, BRANCHES, STEMS_KO, BRANCHES_KO, STEM_ELEMENT, BRANCH_ELEMENT, ELEMENT_KO, ELEMENT_HANJA,
  julianDay, sunLongitude, tenGod, parentOf, childOf,
} from './saju.js';
import { solarTermJDE } from './lunar.js';

const mod = (n, m) => ((n % m) + m) % m;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- 정통: 대운 ----------

/**
 * 대운: 양남음녀는 순행, 음남양녀는 역행. 태어난 날부터 다음(이전) 절기까지 날수 ÷ 3 = 대운 시작 나이
 * @param saju computeSaju 결과, gender 'male'|'female'
 */
export function computeDaewoon(saju, gender) {
  const i = saju.input;
  const h = i.timeKnown ? i.hour + i.minute / 60 : 12;
  const jdBirth = julianDay(i.year, i.month, i.day, h - (saju.utcOffset || 9));
  const yangYear = saju.pillars.year.stem % 2 === 0;
  const forward = (gender === 'male') === yangYear;

  const lon = sunLongitude(jdBirth);
  const k = (lon - 315 + 360) % 360 / 30; // 입춘부터 몇 번째 절인지
  const targetLon = mod(315 + 30 * (forward ? Math.ceil(k + 1e-9) : Math.floor(k)), 360);
  let diff = mod(targetLon - lon, 360);
  if (!forward) diff -= 360;
  const jdTerm = solarTermJDE(targetLon, jdBirth + (diff / 360) * 365.2422);
  const days = Math.abs(jdTerm - jdBirth);
  const startAge = clamp(Math.round(days / 3), 1, 10);

  const m = saju.pillars.month;
  const pillars = Array.from({ length: 8 }, (_, n) => {
    const step = (n + 1) * (forward ? 1 : -1);
    const p = { stem: mod(m.stem + step, 10), branch: mod(m.branch + step, 12) };
    const age = startAge + n * 10;
    return { ...p, startAge: age, endAge: age + 9, startYear: i.year + age, score: pillarScore(saju, p) };
  });
  return { forward, startAge, days: Math.round(days), pillars };
}

/** 나이(만 나이 기준 근사)에 해당하는 대운 */
export function daewoonAt(daewoon, age) {
  if (age < daewoon.startAge) return null;
  return daewoon.pillars.find((p) => age >= p.startAge && age <= p.endAge) || daewoon.pillars[daewoon.pillars.length - 1];
}

// ---------- 정통: 세운 ----------

/** 그해의 간지 (입춘 기준 해. 여기서는 연도 단위 근사) */
export function yearPillar(year) {
  return { stem: mod(year - 4, 10), branch: mod(year - 4, 12) };
}

const COMBINE = new Set(['0-1', '2-11', '3-10', '4-9', '5-8', '6-7']);
const pairKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

/** 한 기둥(대운·세운)이 내 사주에 얼마나 도움이 되는지 0~100 */
/**
 * 한 간지가 내 원국에 주는 영향 (점수 + 근거). 대운·세운·월운·일운 모두 이 함수 하나로 계산한다.
 * 기본 SCORE_BASE + 천간 오행 적합도 + 지지 오행 적합도×0.8 + 일지와의 합(+6)·충(CLASH), 30~95로 제한
 * 점수 눈금(v0.22): 평균 60점대, 50점 밑은 드물게 — 기본값을 올리고 부담 요인(기신·충)은 부드럽게 반영
 */
export const SCORE_BASE = 59;
export const GISIN_DELTA = -7;
export const CLASH_DELTA = -5;
export function scoreParts(saju, p) {
  const parts = [];
  const fitOf = (e) => {
    if (e === saju.yongsin) return [14, '필요한 기운(용신)'];
    if (e === parentOf(saju.yongsin)) return [7, '용신을 돕는 기운'];
    if (e === saju.gisin) return [GISIN_DELTA, '부담이 되는 기운(기신)'];
    if (e === childOf(saju.yongsin)) return [2, '용신이 낳는 기운'];
    return [0, null];
  };
  const [fs, ls] = fitOf(STEM_ELEMENT[p.stem]);
  if (ls) parts.push({ kind: 'stem', element: STEM_ELEMENT[p.stem], delta: fs, label: `천간 ${ls}` });
  const [fb, lb] = fitOf(BRANCH_ELEMENT[p.branch]);
  if (lb) parts.push({ kind: 'branch', element: BRANCH_ELEMENT[p.branch], delta: Math.round(fb * 0.8 * 10) / 10, label: `지지 ${lb}` });
  const dayBranch = saju.pillars.day.branch;
  if (COMBINE.has(pairKey(p.branch, dayBranch))) parts.push({ kind: 'combine', delta: 6, label: '내 일지와 합(合) — 손발이 맞음' });
  if (Math.abs(p.branch - dayBranch) === 6) parts.push({ kind: 'clash', delta: CLASH_DELTA, label: '내 일지와 충(沖) — 변화·마찰' });
  const raw = SCORE_BASE + parts.reduce((a, b) => a + b.delta, 0);
  return { score: Math.round(clamp(raw, 30, 95)), parts };
}

export function pillarScore(saju, p) {
  return scoreParts(saju, p).score;
}

const GOD_THEME = {
  비견: '독립과 자기 확신', 겁재: '경쟁 속 성장', 식신: '재능 발휘와 여유', 상관: '표현력과 변화',
  편재: '활발한 재물 활동', 정재: '안정적인 재물 축적', 편관: '도전과 책임', 정관: '명예와 인정',
  편인: '직감과 전문성', 정인: '배움과 귀인',
};

export function pillarTheme(saju, p) {
  const god = tenGod(saju.dayMaster, p.stem);
  return { god, theme: GOD_THEME[god] };
}

export function pillarLabelFull(p) {
  return `${STEMS[p.stem]}${BRANCHES[p.branch]}(${STEMS_KO[p.stem]}${BRANCHES_KO[p.branch]})`;
}

// ---------- 개운: 오행 충전 ----------

export const CHARGE_BY_RARITY = { common: 3, rare: 5, epic: 8, legend: 12, myth: 20 };

export function emptyLuck(year) {
  return { year, charge: [0, 0, 0, 0, 0], log: {}, total: 0, lifetime: 0 };
}

/** 오행별 목표치: 부족한 기운일수록 더 많이 모아야 하고, 채우면 효과도 크다 */
export function chargeTargets(saju) {
  return saju.elements.map((v) => clamp(Math.round(34 - v * 0.6), 16, 34));
}

/**
 * 충전 (같은 출처는 하루 1번)
 * @param source 'daily' | 'mission' | 'reward' | 'gift' | 'test' 등
 */
export function addCharge(luck, saju, { element, amount, source, dateKey, extraMult }) {
  const l = structuredClone(luck);
  l.log[dateKey] = l.log[dateKey] || {};
  if (source !== 'reward' && source !== 'test' && l.log[dateKey][source]) return { luck: l, added: 0 };
  l.log[dateKey][source] = true;
  const keys = Object.keys(l.log);
  if (keys.length > 40) keys.slice(0, keys.length - 40).forEach((k) => delete l.log[k]);
  const mult = element === saju.yongsin ? 1.5 : element === saju.weakest ? 1.3 : 1;
  const added = Math.round(amount * mult * (extraMult || 1));
  l.charge[element] += added;
  l.total += added;
  l.lifetime = (l.lifetime || 0) + added;
  return { luck: l, added };
}

/** 해가 바뀌면 작년 기운의 30%를 이월 */
export function rollYear(luck, year) {
  if (luck.year === year) return luck;
  return { year, charge: luck.charge.map((c) => Math.round(c * 0.3)), log: {}, total: 0, lifetime: luck.lifetime || 0 };
}

/** 개운 지수 0~100: 용신 2배, 가장 부족한 기운 1.5배 가중 */
export function luckIndex(luck, saju) {
  const targets = chargeTargets(saju);
  const fills = luck.charge.map((c, e) => Math.min(1, c / targets[e]));
  const w = [0, 1, 2, 3, 4].map((e) => (e === saju.yongsin ? 2 : e === saju.weakest ? 1.5 : 1));
  const idx = fills.reduce((s, f, e) => s + f * w[e], 0) / w.reduce((a, b) => a + b, 0);
  return { index: Math.round(idx * 100), fills, targets };
}

// 진화 단계에 필요한 개운 지수
export const STAGE_LUCK_GATE = { 1: 0, 2: 0, 3: 20, 4: 45, 5: 75, 6: 80, 7: 82, 8: 84, 9: 86, 10: 88, 11: 90, 12: 92, 13: 94, 14: 96 };
// 승천 단계(6~14)는 누적 기운도 필요
export const STAGE_LIFETIME_GATE = { 6: 300, 7: 450, 8: 600, 9: 800, 10: 1000, 11: 1300, 12: 1600, 13: 2000, 14: 2500 };

// ---------- 앞으로 5년 ----------

/**
 * @param saju, gender, now {year}, idx 개운 지수, stage 진화 단계
 * @returns [{year, age, pillar, base, improved, target, daewoon}]
 */
export function fiveYearForecast(saju, gender, now, idx, stage, extra = 0, yearBonus = 0) {
  const dw = computeDaewoon(saju, gender);
  const birthYear = saju.input.year;
  const stageBonus = stage >= 5 ? 8 : stage >= 4 ? 4 : stage >= 3 ? 2 : 0;
  return Array.from({ length: 5 }, (_, n) => {
    const year = now.year + n;
    const age = year - birthYear;
    const yp = yearPillar(year);
    const d = daewoonAt(dw, age);
    // 오늘 운세·월별 리포트와 같은 규칙(period.js): 올해 = 세운 70% + 대운 30%
    const base = d ? Math.round((7 * pillarScore(saju, yp) + 3 * d.score) / 10) : pillarScore(saju, yp);
    // 개운 누적 효과: 꾸준히 채운 기운이 해마다 조금씩 더 쌓이는 곡선
    const habit = (idx / 100) * 14 * (1 + n * 0.22);
    const improved = Math.round(clamp(base + habit + stageBonus * (n === 0 ? 1 : 0.6) + extra + (n === 0 ? yearBonus : 0), 0, 99));
    const target = Math.round(clamp(base + 14 * (1 + n * 0.22) + 8 * (n === 0 ? 1 : 0.6), 0, 99));
    return { year, age, pillar: yp, base, improved, target, daewoon: d };
  });
}

/** 개운 단계별 해설 (지수가 오를수록 해석이 한 단계씩 밝아진다) */
export function luckTierText(idx) {
  if (idx >= 90) return { tier: '대길(大吉)', text: '오행이 고르게 차올라 막힌 기운이 시원하게 뚫렸습니다. 올해 운이 최고점을 향해 갑니다.' };
  if (idx >= 75) return { tier: '상승(上昇)', text: '부족했던 기운이 대부분 채워졌습니다. 신수의 기운이 깨어날 준비가 되었습니다.' };
  if (idx >= 45) return { tier: '순풍(順風)', text: '용신의 기운이 자리를 잡아 흐름에 순풍이 붑니다. 꾸준함이 운을 키우고 있어요.' };
  if (idx >= 20) return { tier: '발아(發芽)', text: '개운의 싹이 텄습니다. 매일 모으는 부적이 부족한 기운을 조금씩 채우고 있어요.' };
  return { tier: '시작(始作)', text: '이제 막 개운을 시작했습니다. 오늘의 부적을 받아 부족한 기운부터 채워 보세요.' };
}

export function daewoonComment(saju, d, idx) {
  if (!d) return '아직 첫 대운이 시작되기 전입니다.';
  const { theme } = pillarTheme(saju, d);
  const base = d.score >= 65 ? `${theme}의 기운이 강한 좋은 대운입니다.` : d.score >= 48 ? `${josa(theme, '을/를')} 다지는 무난한 대운입니다.` : `${josa(theme, '을/를')} 위해 내실을 다지는 대운입니다.`;
  const plus = idx >= 75 ? ' 개운이 충분히 쌓여 이 대운의 장점이 크게 살아납니다.'
    : idx >= 45 ? ' 꾸준한 개운으로 아쉬운 부분이 눈에 띄게 보완되고 있습니다.'
      : idx >= 20 ? ' 개운을 시작해 흐름이 조금씩 부드러워지고 있습니다.' : '';
  return base + plus;
}

export { ELEMENT_KO, ELEMENT_HANJA };
