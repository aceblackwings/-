// 전문가 보기(v0.25): 지장간·12운성·신살·공망·계산 기준 + 가족·지인 명식 여러 개(기기 보관)
// 순수 로직만 둔다(테스트: tests/expert.test.mjs). 원칙 5: 명식은 이 기기에만 저장하고 공유하지 않는다.
import { BRANCHES, STEMS, tenGod, BRANCH_MAIN_STEM } from './saju.js';

/** 지장간 (여기·중기·정기 순) */
export const HIDDEN_STEMS = [[8, 9], [9, 7, 5], [4, 2, 0], [0, 1], [1, 9, 4], [4, 6, 2], [2, 5, 3], [3, 1, 5], [4, 8, 6], [6, 7], [7, 3, 4], [4, 0, 8]];

export const TWELVE_STAGES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
export const STAGE_NOTE = {
  장생: '새로 태어나 자라는 힘', 목욕: '꾸미고 드러내는 시기', 관대: '자리를 갖추는 힘', 건록: '스스로 서는 힘',
  제왕: '기운이 가장 왕성함', 쇠: '무르익어 차분해짐', 병: '기운이 약해져 돌봄이 필요', 사: '멈추고 정리하는 때',
  묘: '모아 두고 갈무리함', 절: '끊고 새로 준비함', 태: '새 씨앗이 맺힘', 양: '품 안에서 길러짐',
};
// 일간별 장생 자리 (양간은 순행, 음간은 역행)
const CHANGSAENG = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];
const mod = (n, m) => ((n % m) + m) % m;

/** 천간이 지지에서 맞는 12운성 */
export function twelveStage(stem, branch) {
  const start = CHANGSAENG[stem];
  const i = stem % 2 === 0 ? mod(branch - start, 12) : mod(start - branch, 12);
  return TWELVE_STAGES[i];
}

/** 일주 기준 공망 두 지지 */
export function gongmang(dayStem, dayBranch) {
  // 60갑자 순번 → 그 순(旬)의 첫 갑(甲)의 지지 + 10, + 11
  let idx = 0;
  while (!(idx % 10 === dayStem && idx % 12 === dayBranch)) idx++;
  const startBranch = (idx - (idx % 10)) % 12;
  return [mod(startBranch + 10, 12), mod(startBranch + 11, 12)];
}

const TRIAD = (b) => [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]].findIndex((g) => g.includes(b));
const YEOKMA = [2, 8, 11, 5];
const DOHWA = [9, 3, 6, 0];
const HWAGAE = [4, 10, 1, 7];
const CHEONEUL = [[1, 7], [0, 8], [11, 9], [11, 9], [1, 7], [0, 8], [1, 7], [2, 6], [5, 3], [5, 3]];
const MUNCHANG = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
const YANGIN = { 0: 3, 2: 6, 4: 6, 6: 9, 8: 0 };

export const SINSAL_NOTE = {
  천을귀인: '어려울 때 돕는 사람이 나타나는 별',
  문창귀인: '배움·글·시험에 밝은 별',
  역마살: '이동·여행·변화가 많은 기운',
  도화살: '사람을 끄는 매력과 인기',
  화개살: '예술·종교·학문처럼 깊이 파고드는 기운',
  양인살: '강한 추진력과 결단, 다루기에 따라 칼이 되기도 함',
};

/**
 * 원국에 있는 신살
 * @returns [{name, branch, where:['연지',…], note}]
 */
export function sinsalOf(saju) {
  const P = saju.pillars; const ds = saju.dayMaster;
  const spots = [['year', '연지'], ['month', '월지'], ['day', '일지'], ['hour', '시지']].filter(([k]) => P[k]).map(([k, label]) => ({ k, label, b: P[k].branch }));
  const found = [];
  const add = (name, targets) => {
    const where = spots.filter((s) => targets.includes(s.b)).map((s) => s.label);
    if (where.length) found.push({ name, branch: targets.filter((b) => spots.some((s) => s.b === b)).map((b) => BRANCHES[b]).join('·'), where, note: SINSAL_NOTE[name] });
  };
  add('천을귀인', CHEONEUL[ds]);
  add('문창귀인', [MUNCHANG[ds]]);
  if (YANGIN[ds] !== undefined) add('양인살', [YANGIN[ds]]);
  // 삼합 기준 신살: 연지·일지 두 기준(삼합 무리)에서 찾는다
  for (const [name, table] of [['역마살', YEOKMA], ['도화살', DOHWA], ['화개살', HWAGAE]]) {
    add(name, [...new Set(['year', 'day'].map((base) => table[TRIAD(P[base].branch)]))]);
  }
  return found;
}

/** 기둥별 전문가 표 */
export function expertTable(saju) {
  const ds = saju.dayMaster;
  const gm = gongmang(ds, saju.pillars.day.branch);
  return [['hour', '시주'], ['day', '일주'], ['month', '월주'], ['year', '연주']].map(([k, label]) => {
    const p = saju.pillars[k];
    if (!p) return { key: k, label, empty: true };
    return {
      key: k, label, stem: STEMS[p.stem], branch: BRANCHES[p.branch],
      stemGod: k === 'day' ? '일간' : tenGod(ds, p.stem),
      branchGod: tenGod(ds, BRANCH_MAIN_STEM[p.branch]),
      hidden: HIDDEN_STEMS[p.branch].map((h) => ({ stem: STEMS[h], god: tenGod(ds, h) })),
      stage: twelveStage(ds, p.branch),
      gongmang: gm.includes(p.branch),
    };
  });
}

// 한국 서머타임을 쓴 해 (대략 5~9월). 엔진은 자동 반영하지 않으므로 안내만 한다
const DST_YEARS = new Set([1948, 1949, 1950, 1951, 1955, 1956, 1957, 1958, 1959, 1960, 1987, 1988]);
export const dstLikely = (year, month) => DST_YEARS.has(year) && month >= 5 && month <= 9;

/** 계산 기준 설명 줄 */
export function calcBasis(saju) {
  const i = saju.input;
  const tz = saju.utcOffset;
  const tzText = `UTC+${Math.floor(tz)}${tz % 1 ? `:${String(Math.round((tz % 1) * 60)).padStart(2, '0')}` : ''}`;
  const lonMin = i.longitudeCorrection && i.timeKnown ? Math.round((tz - 8.5) * 60) : 0;
  return [
    { k: '태어난 시각의 표준시', v: `${tzText}${tz === 8.5 ? (i.year < 1912 ? ' (1911년 이전 표준시)' : ' (1954~1961 표준시)') : ''}` },
    ...(dstLikely(i.year, i.month) ? [{ k: '서머타임', v: '이 무렵 한국은 여름에 서머타임(시계 +1시간)을 쓴 해예요. 앱은 자동으로 빼지 않으니, 서머타임 기간에 태어났다면 시계 시각에서 1시간을 뺀 시간으로 입력해 주세요.' }] : []),
    { k: '경도 보정', v: !i.timeKnown ? '시간 모름 — 시주 없이 계산' : lonMin ? `동경 127.5° 기준 ${lonMin}분 빼서 계산 (진태양시 근사)` : '보정 안 함 (시계 시각 그대로)' },
    { k: '자시(23~01시)', v: i.zasiMode === 'late' ? '야자시: 0시에 날짜가 바뀜' : '23시에 날짜가 바뀜 (전통)' },
    { k: '연주·월주 기준', v: `태어난 순간의 태양 황경 ${saju.solarLongitude.toFixed(2)}° — 입춘(315°)부터 새해, 절입(30°마다)부터 새 달` },
    { k: '사주 연도', v: `${saju.sajuYear}년 (입춘 기준)` },
  ];
}

// ---------- 여러 명식 ----------
export const CHART_LIMIT = 20;
export const RELATIONS = ['가족', '연인', '친구', '동료', '기타'];
export const emptyCharts = () => ({ list: [], sel: 'me', on: false });

/** 입력 검사 → {ok, chart} 또는 {ok:false, error} */
export function makeChart(form, now = Date.now()) {
  const name = String(form.name || '').trim().slice(0, 12);
  const year = Number(form.year); const month = Number(form.month); const day = Number(form.day);
  if (!name) return { ok: false, error: '이름(별명)을 적어 주세요.' };
  if (!Number.isInteger(year) || year < 1900 || year > 2100) return { ok: false, error: '태어난 해는 1900~2100 사이로 적어 주세요.' };
  if (!(month >= 1 && month <= 12) || !(day >= 1 && day <= 31)) return { ok: false, error: '월·일을 확인해 주세요.' };
  const calendar = form.calendar === 'lunar' ? 'lunar' : 'solar';
  if (calendar === 'solar' && day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return { ok: false, error: '없는 날짜예요.' };
  const timeUnknown = !form.time;
  if (!timeUnknown && !/^\d{2}:\d{2}$/.test(form.time)) return { ok: false, error: '시간 형식을 확인해 주세요.' };
  return {
    ok: true,
    chart: {
      id: `c${now.toString(36)}`, name, relation: RELATIONS.includes(form.relation) ? form.relation : '기타',
      calendar, year, month, day, leap: calendar === 'lunar' && !!form.leap, time: timeUnknown ? '12:00' : form.time, timeUnknown,
      gender: form.gender === 'male' ? 'male' : form.gender === 'female' ? 'female' : '', lonCorr: true, zasi: 'early',
    },
  };
}

export function addChart(store, chart) {
  const s = store || emptyCharts();
  if (s.list.length >= CHART_LIMIT) return { store: s, ok: false, error: `명식은 ${CHART_LIMIT}개까지 저장할 수 있어요.` };
  return { store: { ...s, list: [...s.list, chart], sel: chart.id }, ok: true };
}

export function removeChart(store, id) {
  const s = store || emptyCharts();
  return { ...s, list: s.list.filter((c) => c.id !== id), sel: s.sel === id ? 'me' : s.sel };
}

