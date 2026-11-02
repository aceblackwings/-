// 운의 층(Layer) 엔진 — 대운 → 세운(올해) → 월운(절기월) → 일운(오늘), 이번 주
// 원칙
// 1) 모든 기간의 기본 점수는 luck.js scoreParts 하나로 계산한다 (근거도 같은 계산에서 나옴)
// 2) 위 층이 아래 층에 스며든다: 올해 = 세운 70% + 대운 30%, 이달 = 월운 60% + 올해 40%, 오늘 = 일진 70% + 이달 30%
// 3) 무작위 몫이 없다: 같은 사람·같은 날짜는 언제 봐도 같은 결과
// 4) 게임 보너스(승천 능력·개운)는 여기서 다루지 않는다 — 정통 점수만
import { computeSaju, tenGod, STEM_ELEMENT, BRANCHES } from './saju.js';
import { scoreParts, computeDaewoon, daewoonAt } from './luck.js';
import { termDate } from './festivals.js';
import { dateToJdn, jdnToDate } from './lunar.js';

export const LAYER_WEIGHT = { year: 0.7, month: 0.6, day: 0.7 };

/** 절기월이 시작하는 절(節)의 태양 황경: 양력 m월 → 그달 초의 절 */
const JEOL_LON = (m) => (285 + (m - 1) * 30) % 360; // 1월 소한 285 … 2월 입춘 315 … 11월 입동 225
const JEOL_NAME = ['소한', '입춘', '경칩', '청명', '입하', '망종', '소서', '입추', '백로', '한로', '입동', '대설'];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const round = Math.round;
/** 가중 평균을 정수 비율(10분율)로 계산해 부동소수점 오차 없이 반올림: mix(0.7, a, b) = (7a + 3b) / 10 */
export const mix = (w, a, b) => { const k = Math.round(w * 10); return Math.round((k * a + (10 - k) * b) / 10); };
const keyOf = (d) => `${d.year}-${d.month}-${d.day}`;

const pillarCache = new Map();
/**
 * 그 날짜의 연주·월주·일주. 절입일(입춘·입동 등)은 그날 안에 절기가 들어오므로 "그날부터 새 달"로 본다.
 * 그래서 연주·월주는 그날이 끝나는 순간(다음 날 0시) 기준, 일주는 달력 날짜 기준으로 계산한다 (monthPeriod의 시작일과 일치)
 */
export function datePillars(date) {
  const k = keyOf(date);
  if (!pillarCache.has(k)) {
    const end = new Date(Date.UTC(date.year, date.month - 1, date.day + 1)); // 그날이 끝나는 순간 = 다음 날 0시(KST)
    const ym = computeSaju({ year: end.getUTCFullYear(), month: end.getUTCMonth() + 1, day: end.getUTCDate(), hour: 0, minute: 0, timeKnown: true, longitudeCorrection: false }).pillars;
    const d = computeSaju({ year: date.year, month: date.month, day: date.day, timeKnown: false }).pillars.day;
    pillarCache.set(k, { year: ym.year, month: ym.month, day: d });
    if (pillarCache.size > 2000) pillarCache.delete(pillarCache.keys().next().value);
  }
  return pillarCache.get(k);
}

const termCache = new Map();
function termOf(year, m) {
  const k = `${year}-${m}`;
  if (!termCache.has(k)) termCache.set(k, termDate(year, JEOL_LON(m)));
  return termCache.get(k);
}

/** 그 날짜가 속한 절기월: 시작(절입일)·끝·절기 이름 */
export function monthPeriod(date) {
  const today = dateToJdn(date.year, date.month, date.day);
  let y = date.year; let m = date.month;
  let start = termOf(y, m);
  if (dateToJdn(start.year, start.month, start.day) > today) { m -= 1; if (m === 0) { m = 12; y -= 1; } start = termOf(y, m); }
  const ny = m === 12 ? y + 1 : y; const nm = m === 12 ? 1 : m + 1;
  const next = termOf(ny, nm);
  const end = jdnToDate(dateToJdn(next.year, next.month, next.day) - 1);
  return { start, end, term: JEOL_NAME[m - 1], solarMonth: m, nextTerm: JEOL_NAME[nm - 1], nextStart: next };
}

/** 입춘 기준 해: 그 날짜의 사주 해(연주가 바뀌는 입춘일 포함) */
export function sajuYearOf(date) {
  const ip = termOf(date.year, 2);
  return dateToJdn(date.year, date.month, date.day) >= dateToJdn(ip.year, ip.month, ip.day) ? date.year : date.year - 1;
}

const dwCache = new Map();
function daewoonFor(saju, gender, date) {
  if (!gender) return null;
  const k = `${JSON.stringify(saju.input)}|${gender}`;
  if (!dwCache.has(k)) dwCache.set(k, computeDaewoon(saju, gender));
  return daewoonAt(dwCache.get(k), date.year - saju.input.year);
}

/** 한 간지의 점수·근거·십신 */
function layerOf(saju, pillar) {
  const sp = scoreParts(saju, pillar);
  return { pillar, base: sp.score, parts: sp.parts, god: tenGod(saju.dayMaster, pillar.stem) };
}

/**
 * 날짜 하나의 모든 층
 * @returns {daewoon, year, month, day} 각 층 = {pillar, base(그 간지만의 점수), score(위 층이 스며든 점수), parts, god}
 */
export function layersAt(saju, date, gender) {
  const p = datePillars(date);
  const dw = daewoonFor(saju, gender, date);
  const daewoon = dw ? { ...layerOf(saju, dw), score: dw.score, startAge: dw.startAge, endAge: dw.endAge } : null;
  const year = layerOf(saju, p.year);
  year.score = daewoon ? mix(LAYER_WEIGHT.year, year.base, daewoon.score) : year.base;
  const month = layerOf(saju, p.month);
  month.score = mix(LAYER_WEIGHT.month, month.base, year.score);
  const day = layerOf(saju, p.day);
  day.score = mix(LAYER_WEIGHT.day, day.base, month.score);
  return { daewoon, year, month, day };
}

/** 십신별 분야 보정 [총운, 재물, 애정, 직장·학업, 건강, 대인] */
export const TEN_GOD_MOD = {
  비견: [2, -6, 0, 4, 6, 8],
  겁재: [-4, -14, -4, 0, 2, -6],
  식신: [8, 6, 6, 4, 10, 6],
  상관: [0, 4, 8, -8, -2, -10],
  편재: [6, 15, 8, 0, -2, 4],
  정재: [6, 14, 4, 6, 2, 4],
  편관: [-6, -4, 0, -8, -6, -4],
  정관: [6, 2, 6, 14, 2, 6],
  편인: [-2, -4, -4, 6, -2, -6],
  정인: [8, 0, 4, 12, 6, 4],
};
export const CAT_KEYS = ['total', 'wealth', 'love', 'career', 'health', 'social'];

/**
 * 층 점수 → 분야 점수. 총운·분야 모두 같은 식: 층 점수 + 그 층 천간의 십신 보정 + (오늘만) 합·충
 * 문장은 이 점수 구간에서만 고르므로 그래프와 설명이 어긋나지 않는다
 */
export function categoryScores(layerScore, god, extra = {}) {
  const mods = TEN_GOD_MOD[god];
  const out = {};
  CAT_KEYS.forEach((k, i) => {
    const raw = layerScore + mods[i] + (extra[k] || 0);
    out[k] = round(clamp(raw, 5, 98));
  });
  return out;
}

/** 오늘 일진 지지와 원국 지지들의 합·충 → 분야 보정 */
export function dayRelations(saju, dayPillar, relationOf) {
  const relations = [];
  const extra = { total: 0, love: 0, health: 0, social: 0 };
  for (const [key, p] of Object.entries(saju.pillars)) {
    if (!p) continue;
    const r = relationOf(dayPillar.branch, p.branch);
    if (!r) continue;
    const w = key === 'day' ? 1.5 : 1;
    relations.push({ pillar: key, type: r });
    if (r === 'combine') { extra.total += 4 * w; extra.love += 5 * w; extra.social += 5 * w; } else { extra.total -= 5 * w; extra.health -= 5 * w; extra.social -= 3 * w; }
  }
  return { relations, extra };
}

/** 이번 주(월~일) 7일 */
export function weekOf(saju, date, gender) {
  const jd = dateToJdn(date.year, date.month, date.day);
  const dow = (new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() + 6) % 7; // 월=0
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = jdnToDate(jd - dow + i);
    const L = layersAt(saju, d, gender);
    return { date: d, score: L.day.score, god: L.day.god, pillar: L.day.pillar, isToday: i === dow };
  });
  const avg = round(days.reduce((a, b) => a + b.score, 0) / 7);
  const best = days.reduce((a, b) => (b.score > a.score ? b : a));
  const worst = days.reduce((a, b) => (b.score < a.score ? b : a));
  return { days, avg, best, worst };
}

/** 올해(입춘 기준) 12절기월 */
export function yearOf(saju, sajuYear, gender) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = ((i + 1) % 12) + 1; // 2(입춘)…12, 1(소한)
    const y = m === 1 ? sajuYear + 1 : sajuYear;
    const start = termOf(y, m);
    const mid = jdnToDate(dateToJdn(start.year, start.month, start.day) + 10);
    const L = layersAt(saju, mid, gender);
    return { order: i + 1, solarMonth: m, term: JEOL_NAME[m - 1], start, pillar: L.month.pillar, base: L.month.base, score: L.month.score, god: L.month.god };
  });
  const mid = months[0].start;
  const L = layersAt(saju, jdnToDate(dateToJdn(mid.year, mid.month, mid.day) + 30), gender);
  const sorted = [...months].sort((a, b) => b.score - a.score);
  return { sajuYear, year: L.year, daewoon: L.daewoon, months, best: sorted.slice(0, 3), caution: sorted.slice(-2) };
}

/** 근거 문장 (쉬운 말) */
export function explainParts(parts) {
  if (!parts.length) return '내 원국과 크게 부딪치거나 돕는 글자가 없어, 평소 흐름을 그대로 이어 가는 기운이에요.';
  return parts.map((p) => `${p.label} ${p.delta > 0 ? '+' : ''}${p.delta}`).join(' · ');
}

export const branchName = (b) => BRANCHES[b];
export { STEM_ELEMENT };
