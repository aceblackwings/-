// 한국 음력(태음태양력) 계산
// 원리: 한국천문연구원 방식과 같은 무중치윤법(無中置閏法)
//  1) 합삭(신월)이 든 날(한국 표준시)이 음력 초하루
//  2) 동지(황경 270°)가 든 달이 11월
//  3) 동지에서 다음 동지까지 달이 13개면, 중기(황경 30°의 배수)가 없는 첫 달이 윤달
// 합삭은 Meeus 알고리즘(오차 수십 초), 중기는 태양 황경 계산(오차 수 분)으로 구한다.
import { sunLongitude, koreaUtcOffset } from './saju.js';

const RAD = Math.PI / 180;
const mod = (n, m) => ((n % m) + m) % m;

// ---------- 시간 보정 ----------

/** ΔT (TT - UT, 초). Espenak & Meeus 다항식 (1900~2150) */
export function deltaT(year) {
  const y = year;
  let t;
  if (y < 1920) { t = y - 1900; return -2.79 + 1.494119 * t - 0.0598939 * t ** 2 + 0.0061966 * t ** 3 - 0.000197 * t ** 4; }
  if (y < 1941) { t = y - 1920; return 21.20 + 0.84493 * t - 0.0761 * t ** 2 + 0.0020936 * t ** 3; }
  if (y < 1961) { t = y - 1950; return 29.07 + 0.407 * t - t ** 2 / 233 + t ** 3 / 2547; }
  if (y < 1986) { t = y - 1975; return 45.45 + 1.067 * t - t ** 2 / 260 - t ** 3 / 718; }
  if (y < 2005) { t = y - 2000; return 63.86 + 0.3345 * t - 0.060374 * t ** 2 + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5; }
  if (y < 2050) { t = y - 2000; return 62.92 + 0.32217 * t + 0.005589 * t ** 2; }
  return -20 + 32 * ((y - 1820) / 100) ** 2 - 0.5628 * (2150 - y);
}

/** 율리우스일(TT) → 한국 날짜의 정수 일 번호(JDN) */
function kstDayNumber(jdTT) {
  const approxYear = 2000 + (jdTT - 2451545) / 365.25;
  const jdUT = jdTT - deltaT(approxYear) / 86400;
  return Math.floor(jdUT + 0.5 + koreaUtcOffset(jdUT) / 24);
}

/** JDN → 그레고리력 날짜 */
export function jdnToDate(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: 100 * b + d - 4800 + Math.floor(m / 10),
  };
}

/** 그레고리력 날짜 → JDN */
export function dateToJdn(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// ---------- 합삭 (Meeus 49장) ----------

const PLANETARY = [
  [299.77, 0.107408, 0.000325], [251.88, 0.016321, 0.000165], [251.83, 26.651886, 0.000164],
  [349.42, 36.412478, 0.000126], [84.66, 18.206239, 0.000110], [141.74, 53.303771, 0.000062],
  [207.14, 2.453732, 0.000060], [154.84, 7.306860, 0.000056], [34.52, 27.261239, 0.000047],
  [207.19, 0.121824, 0.000042], [291.34, 1.844379, 0.000040], [161.72, 24.198154, 0.000037],
  [239.56, 25.513099, 0.000035], [331.55, 3.592518, 0.000023],
];

/** k번째 합삭의 율리우스일(TT). k = 0 → 2000-01-06 */
export function newMoonJDE(k) {
  const T = k / 1236.85;
  let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T ** 2 - 0.00000015 * T ** 3 + 0.00000000073 * T ** 4;
  const E = 1 - 0.002516 * T - 0.0000074 * T ** 2;
  const M = (2.5534 + 29.1053567 * k - 0.0000014 * T ** 2 - 0.00000011 * T ** 3) * RAD;
  const Mp = (201.5643 + 385.81693528 * k + 0.0107582 * T ** 2 + 0.00001238 * T ** 3 - 0.000000058 * T ** 4) * RAD;
  const F = (160.7108 + 390.67050284 * k - 0.0016118 * T ** 2 - 0.00000227 * T ** 3 + 0.000000011 * T ** 4) * RAD;
  const O = (124.7746 - 1.56375588 * k + 0.0020672 * T ** 2 + 0.00000215 * T ** 3) * RAD;
  const s = Math.sin;
  jde += -0.40720 * s(Mp) + 0.17241 * E * s(M) + 0.01608 * s(2 * Mp) + 0.01039 * s(2 * F)
    + 0.00739 * E * s(Mp - M) - 0.00514 * E * s(Mp + M) + 0.00208 * E * E * s(2 * M)
    - 0.00111 * s(Mp - 2 * F) - 0.00057 * s(Mp + 2 * F) + 0.00056 * E * s(2 * Mp + M)
    - 0.00042 * s(3 * Mp) + 0.00042 * E * s(M + 2 * F) + 0.00038 * E * s(M - 2 * F)
    - 0.00024 * E * s(2 * Mp - M) - 0.00017 * s(O) - 0.00007 * s(Mp + 2 * M)
    + 0.00004 * s(2 * Mp - 2 * F) + 0.00004 * s(3 * M) + 0.00003 * s(Mp + M - 2 * F)
    + 0.00003 * s(2 * Mp + 2 * F) - 0.00003 * s(Mp + M + 2 * F) + 0.00003 * s(Mp - M + 2 * F)
    - 0.00002 * s(Mp - M - 2 * F) - 0.00002 * s(3 * Mp + M) + 0.00002 * s(4 * Mp);
  PLANETARY.forEach(([a, b, c], i) => {
    const arg = a + b * k - (i === 0 ? 0.009173 * T ** 2 : 0);
    jde += c * s(arg * RAD);
  });
  return jde;
}

// ---------- 절기 ----------

/** 태양 황경이 target(도)이 되는 율리우스일(TT). guess 근처에서 뉴턴 반복 */
export function solarTermJDE(target, guess) {
  let jd = guess;
  for (let i = 0; i < 8; i++) {
    const diff = mod(target - sunLongitude(jd) + 180, 360) - 180;
    jd += (diff / 360) * 365.2422;
    if (Math.abs(diff) < 1e-6) break;
  }
  return jd;
}

/** 해당 그레고리력 연도의 동지가 든 한국 날짜(JDN) */
function winterSolsticeDay(year) {
  const guess = 2451545 + (year - 2000) * 365.2422 + 355; // 12월 21일 무렵
  return kstDayNumber(solarTermJDE(270, guess));
}

/** 어떤 날 이전(포함) 가장 가까운 합삭일(JDN) */
function newMoonOnOrBefore(dayNum) {
  let k = Math.floor((dayNum - 2451550) / 29.530588861) + 1;
  while (kstDayNumber(newMoonJDE(k)) > dayNum) k--;
  return k;
}

// ---------- 음력 연도 표 ----------

const cache = new Map();

/**
 * 동지(year-1) ~ 동지(year+1) 구간의 음력 달 목록
 * 각 항목: { year, month, leap, start(JDN), days }
 */
function monthTable(year) {
  if (cache.has(year)) return cache.get(year);
  const months = [];
  let lunarYear = year - 1;
  for (const sy of [year - 1, year]) {
    const k0 = newMoonOnOrBefore(winterSolsticeDay(sy));
    const k1 = newMoonOnOrBefore(winterSolsticeDay(sy + 1));
    const starts = [];
    for (let k = k0; k <= k1; k++) starts.push(kstDayNumber(newMoonJDE(k)));
    const count = k1 - k0; // 11월부터 다음 11월 전까지 달의 수 (12 또는 13)
    let leapFound = count !== 13;
    let num = 11;
    for (let i = 0; i < count; i++) {
      const start = starts[i]; const end = starts[i + 1];
      let isLeap = false;
      if (!leapFound && i > 0 && !hasPrincipalTerm(start, end)) { isLeap = true; leapFound = true; }
      if (!isLeap && i > 0) num = num === 12 ? 1 : num + 1;
      if (!isLeap && num === 1) lunarYear += 1;
      months.push({ year: lunarYear, month: num, leap: isLeap, start, days: end - start });
    }
  }
  cache.set(year, months);
  return months;
}

/** [start, end) 날짜 구간에 중기(황경 30°의 배수)가 드는지 */
function hasPrincipalTerm(start, end) {
  // 구간 중앙 근처 태양 황경으로 후보 중기를 찾는다
  const midJD = (start + end) / 2;
  const lon = sunLongitude(midJD);
  const base = Math.floor(lon / 30) * 30;
  for (const target of [base - 30, base, base + 30]) {
    const day = kstDayNumber(solarTermJDE(mod(target, 360), midJD));
    if (day >= start && day < end) return true;
  }
  return false;
}

function findMonth(year, month, leap) {
  return monthTable(year).find((m) => m.year === year && m.month === month && m.leap === leap);
}

// ---------- 공개 API ----------

/** 그 해 윤달 번호 (없으면 0) */
export function leapMonthOf(year) {
  const m = monthTable(year).find((x) => x.year === year && x.leap);
  return m ? m.month : 0;
}

/** 음력 달의 일수 (29 또는 30). 없는 달이면 0 */
export function lunarMonthDays(year, month, leap = false) {
  const m = findMonth(year, month, leap);
  return m ? m.days : 0;
}

/**
 * 음력 → 양력
 * @returns {{year, month, day}} 또는 오류 시 { error }
 */
export function lunarToSolar(year, month, day, leap = false) {
  if (year < 1900 || year > 2100) return { error: '1900~2100년만 지원합니다.' };
  const m = findMonth(year, month, leap);
  if (!m) return { error: leap ? `${year}년에는 윤${month}월이 없습니다.` : '없는 음력 날짜입니다.' };
  if (day < 1 || day > m.days) return { error: `${year}년 음력 ${leap ? '윤' : ''}${month}월은 ${m.days}일까지 있습니다.` };
  return jdnToDate(m.start + day - 1);
}

/** 양력 → 음력 */
export function solarToLunar(year, month, day) {
  const jdn = dateToJdn(year, month, day);
  for (const y of [year, year + 1]) {
    const table = monthTable(y);
    for (const m of table) {
      if (jdn >= m.start && jdn < m.start + m.days) {
        return { year: m.year, month: m.month, day: jdn - m.start + 1, leap: m.leap };
      }
    }
  }
  return null;
}

export function formatLunar(l) {
  return `음력 ${l.year}.${l.leap ? '윤' : ''}${l.month}.${l.day}`;
}
