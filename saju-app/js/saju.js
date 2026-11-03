// 사주 엔진: 만세력(절기 기준) → 사주 8글자 → 오행 분포 → 신강/신약 → 용신
// 외부 라이브러리 없이 동작한다. 절기는 태양 황경을 계산해서 판정한다 (v0.39 VSOP87 요약 급수, 절기 시각 오차 약 1분 안팎).

import { analyzeHwa } from './relations.js';
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

/** 태양의 겉보기 황경 (도). Meeus 저정밀 공식(예전 방식, 오차 약 ±15분) — 비교·검증용 */
export function sunLongitudeLow(jd) {
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
 * ΔT(지구 자전이 느려져 생기는 TT − UT 차이, 초). Espenak·Meeus 다항식(1900~2150)
 */
export function deltaT(year) {
  const y = year;
  if (y < 1920) { const t = y - 1900; return -2.79 + 1.494119 * t - 0.0598939 * t ** 2 + 0.0061966 * t ** 3 - 0.000197 * t ** 4; }
  if (y < 1941) { const t = y - 1920; return 21.2 + 0.84493 * t - 0.0761 * t ** 2 + 0.0020936 * t ** 3; }
  if (y < 1961) { const t = y - 1950; return 29.07 + 0.407 * t - t ** 2 / 233 + t ** 3 / 2547; }
  if (y < 1986) { const t = y - 1975; return 45.45 + 1.067 * t - t ** 2 / 260 - t ** 3 / 718; }
  if (y < 2005) { const t = y - 2000; return 63.86 + 0.3345 * t - 0.060374 * t ** 2 + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5; }
  if (y < 2050) { const t = y - 2000; return 62.92 + 0.32217 * t + 0.005589 * t ** 2; }
  const u = (y - 1820) / 100; return -20 + 32 * u * u - 0.5628 * (2150 - y);
}

// VSOP87 지구 황경 급수(Meeus 『Astronomical Algorithms』 32장 요약표) [A, B, C] → A·cos(B + C·τ)
const VSOP_L = [
  [[175347046, 0, 0], [3341656, 4.6692568, 6283.07585], [34894, 4.6261, 12566.1517], [3497, 2.7441, 5753.3849], [3418, 2.8289, 3.5231], [3136, 3.6277, 77713.7715], [2676, 4.4181, 7860.4194], [2343, 6.1352, 3930.2097], [1324, 0.7425, 11506.7698], [1273, 2.0371, 529.691], [1199, 1.1096, 1577.3435], [990, 5.233, 5884.927], [902, 2.045, 26.298], [857, 3.508, 398.149], [780, 1.179, 5223.694], [753, 2.533, 5507.553], [505, 4.583, 18849.228], [492, 4.205, 775.523], [357, 2.92, 0.067], [317, 5.849, 11790.629], [284, 1.899, 796.298], [271, 0.315, 10977.079], [243, 0.345, 5486.778], [206, 4.806, 2544.314], [205, 1.869, 5573.143], [202, 2.458, 6069.777], [156, 0.833, 213.299], [132, 3.411, 2942.463], [126, 1.083, 20.775], [115, 0.645, 0.98], [103, 0.636, 4694.003], [102, 0.976, 15720.839], [102, 4.267, 7.114], [99, 6.21, 2146.17], [98, 0.68, 155.42], [86, 5.98, 161000.69], [85, 1.3, 6275.96], [85, 3.67, 71430.7], [80, 1.81, 17260.15], [79, 3.04, 12036.46], [75, 1.76, 5088.63], [74, 3.5, 3154.69], [74, 4.68, 801.82], [70, 0.83, 9437.76], [62, 3.98, 8827.39], [61, 1.82, 7084.9], [57, 2.78, 6286.6], [56, 4.39, 14143.5], [56, 3.47, 6279.55], [52, 0.19, 12139.55], [52, 1.33, 1748.02], [51, 0.28, 5856.48], [49, 0.49, 1194.45], [41, 5.37, 8429.24], [41, 2.4, 19651.05], [39, 6.17, 10447.39], [37, 6.04, 10213.29], [37, 2.57, 1059.38], [36, 1.71, 2352.87], [36, 1.78, 6812.77], [33, 0.59, 17789.85], [30, 0.44, 83996.85], [30, 2.74, 1349.87], [25, 3.16, 4690.48]],
  [[628331966747, 0, 0], [206059, 2.678235, 6283.07585], [4303, 2.6351, 12566.1517], [425, 1.59, 3.523], [119, 5.796, 26.298], [109, 2.966, 1577.344], [93, 2.59, 18849.23], [72, 1.14, 529.69], [68, 1.87, 398.15], [67, 4.41, 5507.55], [59, 2.89, 5223.69], [56, 2.17, 155.42], [45, 0.4, 796.3], [36, 0.47, 775.52], [29, 2.65, 7.11], [21, 5.34, 0.98], [19, 1.85, 5486.78], [19, 4.97, 213.3], [17, 2.99, 6275.96], [16, 0.03, 2544.31], [16, 1.43, 2146.17], [15, 1.21, 10977.08], [12, 2.83, 1748.02], [12, 3.26, 5088.63], [12, 5.27, 1194.45], [12, 2.08, 4694], [11, 0.77, 553.57], [10, 1.3, 6286.6], [10, 4.24, 1349.87], [9, 2.7, 242.73], [9, 5.64, 951.72], [8, 5.3, 2352.87], [6, 2.65, 9437.76], [6, 4.67, 4690.48]],
  [[52919, 0, 0], [8720, 1.0721, 6283.0758], [309, 0.867, 12566.152], [27, 0.05, 3.52], [16, 5.19, 26.3], [16, 3.68, 155.42], [10, 0.76, 18849.23], [9, 2.06, 77713.77], [7, 0.83, 775.52], [5, 4.66, 1577.34], [4, 1.03, 7.11], [4, 3.44, 5573.14], [3, 5.14, 796.3], [3, 6.05, 5507.55], [3, 1.19, 242.73], [3, 6.12, 529.69], [3, 0.31, 398.15], [3, 2.28, 553.57], [2, 4.38, 5223.69], [2, 3.75, 0.98]],
  [[289, 5.844, 6283.076], [35, 0, 0], [17, 5.49, 12566.15], [3, 5.2, 155.42], [1, 4.72, 3.52], [1, 5.3, 18849.23], [1, 5.97, 242.73]],
  [[114, 3.142, 0], [8, 4.13, 6283.08], [1, 3.84, 12566.15]],
  [[1, 3.14, 0]],
];

/**
 * 태양의 겉보기 황경 (도). v0.39 정밀 방식: VSOP87 요약 급수 + ΔT + 장동(주요 4항) + 광행차 → 절기 시각 오차 약 1분 안팎
 * @param jd 세계시(UT) 율리우스일
 */
export function sunLongitude(jd) {
  const year = 2000 + (jd - 2451545) / 365.25;
  const jde = jd + deltaT(year) / 86400;
  const tau = (jde - 2451545) / 365250;
  let L = 0;
  VSOP_L.forEach((series, i) => { let sum = 0; for (const [A, B, C] of series) sum += A * Math.cos(B + C * tau); L += sum * tau ** i; });
  L /= 1e8; // 라디안
  const rad = Math.PI / 180;
  let lon = mod(L / rad + 180, 360); // 지구 → 태양
  const T = tau * 10;
  lon -= 0.09033 / 3600; // FK5 보정
  const omega = (125.04452 - 1934.136261 * T) * rad;
  const Ls = (280.4665 + 36000.7698 * T) * rad; const Lm = (218.3165 + 481267.8813 * T) * rad;
  const dPsi = (-17.2 * Math.sin(omega) - 1.32 * Math.sin(2 * Ls) - 0.23 * Math.sin(2 * Lm) + 0.21 * Math.sin(2 * omega)) / 3600;
  lon += dPsi - 20.4898 / 3600; // 장동 + 광행차(거리 1AU 근사)
  return mod(lon, 360);
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

// ---------- 서머타임·출생 지역 (v0.37) ----------

/**
 * 한국 서머타임 기간(IANA 시간대 자료 Asia/Seoul 기준). [시작 연,월,일,분, 끝 연,월,일,분] — 시계(서머타임) 시각, 끝은 포함 안 함
 * 이 기간 시계 시각은 표준시보다 1시간 빠르므로 계산 전에 1시간을 뺀다
 */
export const KOREA_DST = [
  [1948, 6, 1, 0, 1948, 9, 13, 0], [1949, 4, 3, 0, 1949, 9, 11, 0], [1950, 4, 1, 0, 1950, 9, 10, 0], [1951, 5, 6, 0, 1951, 9, 9, 0],
  [1955, 5, 5, 0, 1955, 9, 9, 0], [1956, 5, 20, 0, 1956, 9, 30, 0], [1957, 5, 5, 0, 1957, 9, 22, 0], [1958, 5, 4, 0, 1958, 9, 21, 0],
  [1959, 5, 3, 0, 1959, 9, 20, 0], [1960, 5, 1, 0, 1960, 9, 18, 0], [1987, 5, 10, 120, 1987, 10, 11, 180], [1988, 5, 8, 120, 1988, 10, 9, 180],
];
/** 그 시계 시각이 서머타임 기간인지 */
export function inKoreaDst(y, m, d, mins) {
  const t = Date.UTC(y, m - 1, d) / 60000 + mins;
  return KOREA_DST.some(([a, b, c, e, f, g, h, i]) => t >= Date.UTC(a, b - 1, c) / 60000 + e && t < Date.UTC(f, g - 1, h) / 60000 + i);
}

/** 출생 지역 경도(진태양시 보정용). 고르지 않으면 한국 중앙 127.5° */
export const BIRTH_CITIES = [
  ['', '모름 · 한국 중앙(동경 127.5°)', 127.5],
  ['seoul', '서울', 126.98], ['incheon', '인천', 126.71], ['suwon', '수원·경기 남부', 127.03], ['uijeongbu', '의정부·경기 북부', 127.05],
  ['chuncheon', '춘천', 127.73], ['gangneung', '강릉·동해', 128.9], ['wonju', '원주', 127.92],
  ['cheongju', '청주', 127.49], ['chungju', '충주', 127.93], ['daejeon', '대전·세종', 127.38], ['cheonan', '천안·아산', 127.15], ['hongseong', '홍성·서산', 126.66],
  ['jeonju', '전주', 127.15], ['gunsan', '군산·익산', 126.74], ['gwangju', '광주', 126.85], ['mokpo', '목포', 126.39], ['suncheon', '순천·여수', 127.49],
  ['daegu', '대구', 128.6], ['andong', '안동', 128.73], ['pohang', '포항·경주', 129.36], ['gumi', '구미·김천', 128.34],
  ['busan', '부산', 129.08], ['ulsan', '울산', 129.31], ['changwon', '창원·마산', 128.68], ['jinju', '진주', 128.11],
  ['jeju', '제주', 126.53], ['pyongyang', '평양·북한 서부', 125.75], ['hamhung', '함흥·북한 동부', 127.54],
];
export const cityLon = (key) => (BIRTH_CITIES.find((c) => c[0] === key) || BIRTH_CITIES[0])[2];

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
    timeKnown = true,
    longitudeCorrection = true,
    zasiMode = 'early',
    birthLon = 127.5, // 출생 지역 경도(v0.37). 기본은 한국 중앙
    dst = 'auto', // 서머타임: 'auto' = 기간이면 1시간 빼기, 'off' = 시계 시각 그대로(이미 빼서 입력한 경우)
  } = input;
  let { year, month, day, hour = 12, minute = 0 } = input;
  // 0) 서머타임 기간에 태어났으면 시계 시각에서 1시간을 빼 표준시로
  let dstApplied = false;
  if (timeKnown && dst !== 'off' && inKoreaDst(year, month, day, hour * 60 + minute)) {
    dstApplied = true;
    let mm = hour * 60 + minute - 60;
    if (mm < 0) { mm += 1440; [year, month, day] = addDays(year, month, day, -1); }
    hour = Math.floor(mm / 60); minute = mm % 60;
  }

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
    // 진태양시 근사: 표준시 자오선(UTC+9 = 135°)과 출생지 경도 차이 × 4분. 기본 127.5°면 예전처럼 30분
    let mins = hour * 60 + minute - (longitudeCorrection ? Math.round((utcOffset * 15 - birthLon) * 4) : 0);
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

  const hwa = analyzeHwa(pillars); // v0.37 합화: 바뀐 천간은 그 오행으로 셈
  const elements = elementScores(pillars, { stemEl: hwa.stemEl });
  const chartStems = [pillars.year.stem, pillars.month.stem, ...(hourPillar ? [hourPillar.stem] : [])];
  const strength = analyzeStrength(dayPillar.stem, elements, monthBranch, chartStems, { ...opts, pillars });

  return {
    input: { year: input.year, month: input.month, day: input.day, hour: input.hour ?? 12, minute: input.minute ?? 0, timeKnown, longitudeCorrection, zasiMode, birthLon, dst },
    dstApplied,
    hwa: hwa.list,
    lonMinutes: timeKnown && longitudeCorrection ? Math.round((utcOffset * 15 - birthLon) * 4) : 0,
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

  // ⑦ 종격(v0.39, 보수적): 기운이 한쪽으로 극단적으로 쏠리면 억지로 누르지 않고 그 흐름을 따름
  let special = null;
  if (opts.pillars && strengthScoreV != null) {
    const g = { bi: scores[me], in: scores[parentOf(me)], sik: scores[childOf(me)], jae: scores[mod(me + 2, 5)], gwan: scores[mod(me + 3, 5)] };
    const rooted = factors.includes('통근');
    if (strengthScoreV >= 85 && g.gwan <= 5 && g.jae <= 8) {
      special = { name: '종왕격', follow: me, text: '나와 나를 돕는 기운이 사주를 거의 다 채운 「종왕격」이에요. 이런 사주는 넘치는 힘을 억지로 누르기보다 그 흐름을 따라 쓰는 것이 정통 풀이예요.' };
    } else if (strengthScoreV <= 15 && !rooted && g.bi + g.in <= 10) {
      const k = [['jae', '종재격', '재물·결실'], ['gwan', '종살격', '책임·조직'], ['sik', '종아격', '재능·표현']].reduce((x, y) => (g[y[0]] > g[x[0]] ? y : x));
      const el = { jae: mod(me + 2, 5), gwan: mod(me + 3, 5), sik: childOf(me) }[k[0]];
      special = { name: k[1], follow: el, text: `일간의 뿌리가 없고 ${k[2]}의 기운이 사주를 이끄는 「${k[1]}」이에요. 이런 사주는 나를 억지로 세우기보다 강한 흐름을 따라갈 때 가장 잘 풀린다고 봐요.` };
    }
    if (special) { yongsin = special.follow; heesin = special.name === '종왕격' ? parentOf(me) : parentOf(special.follow); basis = `종격(${special.name})`; }
  }

  // ⑧ 통관: 서로 극하는 두 기운이 맞서면(둘 다 30% 이상) 사이를 이어 주는 기운 / 병약: 가장 넘치는 기운(병)과 그것을 다스리는 기운(약)
  let tonggwan = null; let byeongyak = null;
  if (opts.pillars && !special) {
    for (let x = 0; x < 5 && !tonggwan; x++) {
      const y = mod(x + 2, 5); // x가 y를 극함
      if (scores[x] >= 30 && scores[y] >= 30) {
        const bridge = childOf(x); // x → bridge → y
        if (scores[bridge] < 15) tonggwan = { a: x, b: y, el: bridge };
      }
    }
    if (tonggwan && basis !== '조후 우선' && heesin !== tonggwan.el && yongsin !== tonggwan.el) { heesin = tonggwan.el; basis = `${basis} + 통관`; }
    const top = [0, 1, 2, 3, 4].reduce((a, b) => (scores[b] > scores[a] ? b : a));
    if (scores[top] >= 40) byeongyak = { byeong: top, yak: controllerOf(top), match: controllerOf(top) === yongsin };
  }

  const weakest = pickLowest([0, 1, 2, 3, 4]);
  const strongest = [0, 1, 2, 3, 4].reduce((a, b) => (scores[b] > scores[a] ? b : a));
  return { strength, strengthLevel: level || strength, strengthScore: strengthScoreV ?? support, strengthFactors: factors, support, yongsin, gisin: controllerOf(yongsin), heesin, eokbuYongsin: eokbu, yongsinBasis: basis, johu, weakest, strongest, special, tonggwan, byeongyak };
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
