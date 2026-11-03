// 신년(내년) 운세 카드(v0.28): 12칸 그래프 대신 "읽으면 끝나는" 신년운세 표준 구성
// ① 한 줄 총평 + 키워드 3개 ② 분야별 연간운(별 1~5) ③ 사계절 4칸 ④ 꼭 기억할 달 3개 ⑤ 행운 키트 ⑥ 다짐 한 줄(연말에 돌아보기)
// 모든 값은 period.js yearOf 결과(같은 엔진)에서 나온다. 별·계절 표시는 같은 점수를 구간으로 바꾼 것
// 순수 로직만 둔다(테스트: tests/yearcard.test.mjs). 다짐 저장 키: unmyeong2099.pledge = {연도: {text, at, review}}
import { GOD_READING } from './reading.js';
import { categoryScores } from './period.js';
import { ELEMENT_LUCK } from './fortune.js';
import { ANIMALS } from './saju.js';

/** 십신별 그해의 한 줄 이름과 키워드 */
export const YEAR_HEADLINE = {
  비견: { title: '내 이름으로 서는 해', tags: ['독립', '자기확신', '든든한_동료'] },
  겁재: { title: '경쟁 속에서 크는 해', tags: ['도전', '승부', '지출_관리'] },
  식신: { title: '재능이 꽃피는 해', tags: ['재능_발휘', '여유', '먹을_복'] },
  상관: { title: '틀을 깨고 표현하는 해', tags: ['표현력', '변화', '아이디어'] },
  편재: { title: '활발하게 벌고 넓히는 해', tags: ['재물_활동', '이동', '새_인연'] },
  정재: { title: '차곡차곡 쌓이는 해', tags: ['저축', '성실', '안정'] },
  편관: { title: '책임 속에 단단해지는 해', tags: ['도전', '리더십', '건강_관리'] },
  정관: { title: '인정받고 자리 잡는 해', tags: ['인정', '승진·합격', '신뢰'] },
  편인: { title: '깊이 파고들어 전문가가 되는 해', tags: ['전문성', '공부', '직감'] },
  정인: { title: '귀인과 배움이 함께하는 해', tags: ['귀인', '문서운', '배움'] },
};

export const FIELD_KEYS = [['wealth', '💰', '재물'], ['love', '💕', '애정'], ['career', '💼', '직장·학업'], ['health', '🌿', '건강'], ['social', '🤝', '대인']];
// 점수 눈금(평균 60점대 중후반)에 맞춘 별 구간: 75+ ★5 · 65+ ★4 · 55+ ★3 · 45+ ★2
export const stars = (score) => (score >= 75 ? 5 : score >= 65 ? 4 : score >= 55 ? 3 : score >= 45 ? 2 : 1);
const firstSentence = (t) => { const i = t.indexOf('. '); return i < 0 ? t : t.slice(0, i + 1); };
const md = (d) => `${d.month}/${d.day}`;
const dayBefore = (d) => { const t = new Date(Date.UTC(d.year, d.month - 1, d.day - 1)); return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() }; };

export const SEASONS = [
  { key: 'spring', icon: '🌸', label: '봄', range: [0, 3] },
  { key: 'summer', icon: '☀️', label: '여름', range: [3, 6] },
  { key: 'autumn', icon: '🍂', label: '가을', range: [6, 9] },
  { key: 'winter', icon: '❄️', label: '겨울', range: [9, 12] },
];
const SEASON_TONE = {
  best: { mark: '🌟', word: '흐름이 가장 좋은 계절', advice: '새 일을 시작하고 넓히기 좋아요.' },
  good: { mark: '🙂', word: '순조로운 계절', advice: '하던 일을 꾸준히 이어 가면 결과가 쌓여요.' },
  slow: { mark: '🍵', word: '쉬어 가는 계절', advice: '큰 결정은 미루고 몸과 지출을 챙겨요.' },
};

/** 달의 기간 (다음 절입 전날까지, 마지막 달은 시작일만) */
export function monthRange(months, i) {
  const m = months[i];
  return i < months.length - 1 ? `${md(m.start)}~${md(dayBefore(months[i + 1].start))}` : `${md(m.start)}~`;
}

/** 사계절 4칸: 계절 평균으로 순위를 매겨 가장 좋은 계절·쉬어 가는 계절을 표시 */
export function seasonsOf(months) {
  const list = SEASONS.map((s) => {
    const ms = months.slice(...s.range);
    const score = Math.round(ms.reduce((a, b) => a + b.score, 0) / ms.length);
    const gods = ms.map((m) => m.god);
    const god = gods.find((g, i) => gods.indexOf(g) !== i) || ms.reduce((a, b) => (b.score > a.score ? b : a)).god;
    return { ...s, score, months: ms.map((m) => m.solarMonth), keyword: GOD_READING[god].keyword };
  });
  const sorted = [...list].sort((a, b) => b.score - a.score);
  return list.map((s) => {
    const tone = s === sorted[0] ? 'best' : s === sorted[3] && sorted[0].score - s.score >= 3 ? 'slow' : 'good';
    return { ...s, tone, ...SEASON_TONE[tone] };
  });
}

/** 꼭 기억할 달 3개: 좋은 달 2 + 조심할 달 1, 기간과 이유 한 줄 */
export function keyMonths(y) {
  const idx = (m) => y.months.indexOf(m);
  const good = y.best.slice(0, 2).map((m) => ({ kind: 'good', month: m.solarMonth, range: monthRange(y.months, idx(m)), score: m.score, keyword: GOD_READING[m.god].keyword, line: `「${GOD_READING[m.god].keyword}」의 기운이 강해요. 중요한 시작·약속은 이때 잡아 보세요.` }));
  const c = y.caution[y.caution.length - 1];
  const caution = { kind: 'caution', month: c.solarMonth, range: monthRange(y.months, idx(c)), score: c.score, keyword: GOD_READING[c.god].keyword, line: `${GOD_READING[c.god].watch[0].replace(/[.。]?$/, '.')} 큰 지출·계약은 한 번 더 확인하세요.` };
  return [...good, caution];
}

/** 그해 힘이 되는 띠: 내 띠와 육합 1 + 삼합 1 */
export function friendlyZodiac(branch) {
  const six = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]].find((p) => p.includes(branch));
  const sixP = six[0] === branch ? six[1] : six[0];
  const tri = [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]].find((g) => g.includes(branch)).filter((b) => b !== branch);
  return [sixP, tri[0]].map((b) => ANIMALS[b]);
}

/**
 * 카드 전체
 * @param y yearOf 결과(내년) · thisYear yearOf 결과(올해) · saju · luck 오행 행운표(기본 ELEMENT_LUCK)
 */
export function yearCard(y, thisYear, saju) {
  const god = y.year.god; const R = GOD_READING[god]; const H = YEAR_HEADLINE[god];
  const diff = y.year.score - thisYear.year.score;
  const cats = categoryScores(y.year.score, god);
  const L = ELEMENT_LUCK[saju.yongsin];
  return {
    year: y.sajuYear, score: y.year.score, god, diff,
    title: H.title, tags: H.tags,
    summary: `${y.sajuYear}년은 「${H.title}」예요. ${firstSentence(R.core)} ${diff > 2 ? '올해보다 흐름이 한결 나아져요.' : diff < -2 ? '올해보다 속도를 조금 늦추면 더 단단해져요.' : '올해와 비슷한 흐름을 차분히 이어 가요.'}`,
    fields: FIELD_KEYS.map(([k, icon, label]) => ({ key: k, icon, label, score: cats[k], stars: stars(cats[k]), line: firstSentence(R.fields[k]) })),
    seasons: seasonsOf(y.months),
    keyMonths: keyMonths(y),
    luck: { color: L.color, hex: L.hex, numbers: L.numbers, direction: L.direction, item: L.item, zodiac: friendlyZodiac(saju.pillars.year.branch) },
  };
}

// ---------- 다짐 한 줄 (연말에 돌아보기) ----------
export const PLEDGE_MAX = 60;
export function savePledge(store, year, text, at = new Date().toISOString().slice(0, 10)) {
  const t = String(text || '').replace(/\s+/g, ' ').trim().slice(0, PLEDGE_MAX);
  if (!t) return { store: store || {}, ok: false };
  const s = store || {};
  return { store: { ...s, [year]: { ...(s[year] || {}), text: t, at } }, ok: true };
}
/** 그해 12월이 되면 돌아보기 (아직 안 했을 때) */
export function pledgeReviewDue(store, date) {
  const p = (store || {})[date.year];
  return date.month === 12 && p && p.text && !p.review ? { year: date.year, text: p.text } : null;
}
export function reviewPledge(store, year, value) {
  const s = store || {};
  if (!s[year] || !['yes', 'half', 'no'].includes(value)) return s;
  return { ...s, [year]: { ...s[year], review: value } };
}
