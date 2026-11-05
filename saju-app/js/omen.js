// 오늘의 작은 예언 · 내일 맛보기(v0.54, 2026-11-05 사용자 「오늘의 운세를 더 재밌게 해서 매일 보러 오게」 → 추천 ①·②)
// ① 작은 예언: 하루 한 줄 「오늘 ○○이 보이면 좋은 신호예요 → 그때 할 일」. 저녁(17시부터)에 「봤나요?」 체크,
//    다음 날 아침에도 어제 예언을 확인할 수 있음(아침에 다시 올 이유). 봤어요 = 예언 도장 + 복떡 1개
// ② 내일 맛보기: 내일 운세의 한 줄 제목만 미리 보이고 나머지는 내일 열림. 미리 본 날은 다음 날 「어제 예고한 이야기」 표시
// 원칙: 무서운 예언 없음(날씨→우산 문법). 신호는 좋은 쪽만, 안 보여도 괜찮다는 말을 붙임. 같은 사람·같은 날은 늘 같은 예언
// 순수 로직만(테스트: tests/omen.test.mjs). 저장 `unmyeong2099.omen` = { days: {날짜: 'yes'|'no'}, peek: {내일 날짜: true}, shown: {날짜: true} }
import { josa } from './josa.js';

export const CHECK_HOUR = 17;
export const OMEN_REWARD = 1; // 복떡

/** 십신 무리별 「사람 신호」 */
const PEOPLE = {
  비견: ['친구나 동료가 먼저 말을 걸어오면', '그 사람과 오늘 할 일 하나를 같이 나눠 보세요'],
  겁재: ['누군가 「같이 하자」고 제안해 오면', '돈이 드는 일이 아니라면 가볍게 응해 보세요'],
  식신: ['누군가 내 말에 크게 웃어 주면', '그 이야기를 메모해 두세요. 오늘의 좋은 아이디어예요'],
  상관: ['내 의견을 묻는 사람이 생기면', '한 번 더 부드럽게 다듬어서 말해 보세요'],
  편재: ['생각지 못한 덤이나 할인이 생기면', '그 돈은 쓰지 말고 따로 모아 두세요'],
  정재: ['계획한 일이 시간 안에 딱 끝나면', '내일 할 일 하나를 미리 적어 두세요'],
  편관: ['누군가 급한 부탁을 해 오면', '할 수 있는 만큼만 하겠다고 먼저 말해 두세요'],
  정관: ['누군가 나를 칭찬하거나 믿고 맡기면', '「고마워요」라고 분명히 말해 보세요'],
  편인: ['좋은 글귀나 노래가 마음에 콕 박히면', '저장해 두고 잠들기 전에 한 번 더 보세요'],
  정인: ['누군가 쓸 만한 조언을 건네면', '오늘 안에 그 조언 하나를 해 보세요'],
};

const seed = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const COLOR_WORD = { 초록: '초록색', 빨강: '빨간색', 노랑: '노란색', '흰색·은색': '흰색이나 은색', '검정·남색': '검은색이나 남색' };
const plainTime = (t) => String(t || '').replace(/\s*\(.*\)$/, '');

/**
 * 오늘의 작은 예언
 * @param f computeFortune 결과(tenGod·luck{color, number, time}·dateKey) · @param key 사람 구분 글자(띠·일간 등)
 * @returns {kind, sign, act, text}
 */
export function omenOf(f, key = '') {
  const L = f.luck || {}; const god = PEOPLE[f.tenGod] ? f.tenGod : '비견';
  const kinds = ['color', 'number', 'time', 'people'];
  let kind = kinds[seed(`${key}|${f.dateKey}|omen`) % kinds.length];
  // 잠든 시간대(새벽·밤늦게)인 행운 시간은 확인하기 어려우니 사람 신호로
  if (kind === 'time' && /오전 3시|오후 9시/.test(L.time || '')) kind = 'people';
  let sign; let act;
  if (kind === 'color') { sign = `오늘 ${josa(`${COLOR_WORD[L.color] || `${L.color}색`} 물건`, '이/가')} 눈에 먼저 들어오면`; act = '그때 미뤄 둔 연락 하나를 해 보세요'; }
  else if (kind === 'number') { sign = `시계나 영수증에서 숫자 ${josa(String(L.number), '이/가')} 보이면`; act = '그 순간 오늘 할 일 하나를 바로 시작해 보세요'; }
  else if (kind === 'time') { sign = `${plainTime(L.time)} 사이에 반가운 소식이나 말 한마디가 들어오면`; act = '짧게라도 바로 답장해 보세요'; }
  else [sign, act] = PEOPLE[god];
  return { kind, sign, act, text: `${sign} 좋은 신호예요. ${act}.` };
}

const norm = (s) => ({ days: { ...(s?.days || {}) }, peek: { ...(s?.peek || {}) }, shown: { ...(s?.shown || {}) } });
const toNum = (k) => { const [y, m, d] = String(k).split('-').map(Number); return y * 10000 + m * 100 + d; };
const trim = (o, n) => Object.fromEntries(Object.keys(o).sort((a, b) => toNum(b) - toNum(a)).slice(0, n).map((k) => [k, o[k]]));

/** 날짜 하루 앞뒤: 'Y-M-D' */
export function shiftDay(dateKey, n) {
  const [y, m, d] = String(dateKey).split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${t.getUTCMonth() + 1}-${t.getUTCDate()}`;
}
export const dateOfKey = (k) => { const [year, month, day] = String(k).split('-').map(Number); return { year, month, day }; };

/** 지금 확인할 수 있는 예언: 오늘(17시부터) 또는 어제 것(답하지 않았으면) */
export function checkable(store, todayKey, hour) {
  const s = norm(store); const y = shiftDay(todayKey, -1);
  return {
    today: !s.days[todayKey] && hour >= CHECK_HOUR,
    todayWait: !s.days[todayKey] && hour < CHECK_HOUR,
    yesterday: s.shown[y] && !s.days[y] ? y : null,
    answered: s.days[todayKey] || null,
  };
}
/** 예언을 화면에 보여 준 날 기록(본 적 있는 어제 예언만 다음 날 묻기) */
export function markShown(store, dateKey) {
  const s = norm(store); if (s.shown[dateKey]) return store;
  return { ...s, shown: trim({ ...s.shown, [dateKey]: true }, 14) };
}
/** 예언 확인 기록. 반환 {store, reward(복떡 수), already} */
export function markOmen(store, dateKey, v) {
  const s = norm(store); if (s.days[dateKey]) return { store: s, reward: 0, already: true };
  const val = v === 'yes' ? 'yes' : 'no';
  return { store: { ...s, days: trim({ ...s.days, [dateKey]: val }, 60) }, reward: val === 'yes' ? OMEN_REWARD : 0, already: false };
}
/** 예언 도장: 이번 주(월~일) 맞은 수 · 누적 맞은 수 · 답한 수 */
export function omenStats(store, todayKey) {
  const s = norm(store); const [y, m, d] = String(todayKey).split('-').map(Number);
  const dow = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7; // 월요일 0
  const week = Array.from({ length: 7 }, (_, i) => shiftDay(todayKey, i - dow));
  const vals = Object.values(s.days);
  return { week: week.map((k) => ({ key: k, v: s.days[k] || null })), weekHits: week.filter((k) => s.days[k] === 'yes').length, hits: vals.filter((v) => v === 'yes').length, answered: vals.length };
}
/** 내일 맛보기를 봤다고 기록 */
export function markPeek(store, tomorrowKey) {
  const s = norm(store); if (s.peek[tomorrowKey]) return store;
  return { ...s, peek: trim({ ...s.peek, [tomorrowKey]: true }, 14) };
}
/** 오늘이 「어제 미리 본 이야기」가 열리는 날인지 */
export const peekedFor = (store, todayKey) => !!norm(store).peek[todayKey];

/** 내일 맛보기 한 줄(제목만): {head, hint} */
export function tomorrowTeaser(head, total, todayTotal) {
  const d = total - todayTotal;
  const hint = d >= 6 ? '내일은 오늘보다 기운이 올라와요' : d <= -6 ? '내일은 오늘보다 천천히 가면 좋은 하루예요' : '내일도 오늘과 비슷한 흐름이 이어져요';
  return { head, hint };
}
