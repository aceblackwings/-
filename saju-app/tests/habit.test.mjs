import assert from 'node:assert/strict';
import {
  MISSIONS, AREAS, LEVELS, MOODS, REFRAME, band, pickUmbrella, missionById,
  setMood, pickLevel, completeHabit, setAfter, habitDay, habitStats, weekDone, needsCare,
  toneProblems, BANNED_TONE, HABIT_KEEP_DAYS,
} from '../js/habit.js';
import { TEN_GOD_INFO, TIER_TEXT } from '../js/fortune.js';
import { GOD_READING } from '../js/reading.js';
import { YEAR_HEADLINE } from '../js/yearcard.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };

t('미션 라이브러리: 6분야 × 5오행 × 3난이도 = 90개, id 중복 없음', () => {
  assert.equal(MISSIONS.length, 90);
  assert.equal(new Set(MISSIONS.map((m) => m.id)).size, 90);
  for (const a of AREAS) for (let el = 0; el < 5; el++) for (const lv of [1, 2, 3]) {
    assert.ok(MISSIONS.find((m) => m.area === a.key && m.el === el && m.level === lv), `${a.key}-${el}-${lv}`);
  }
  assert.equal(missionById('health-4-1').text, '일어나자마자 물 한 컵 마시기');
});

t('미션 문장: 짧고(45자 이하) 같은 문장 반복 없음, 난이도 3단', () => {
  MISSIONS.forEach((m) => assert.ok(m.text.length <= 45, `${m.id} 너무 김: ${m.text}`));
  assert.equal(new Set(MISSIONS.map((m) => m.text)).size, 90);
  assert.deepEqual(LEVELS.map((l) => l.label), ['30초', '5분', '30분']);
});

t('미션 문장: 대부분 이미 하는 일에 붙인다(앵커: ~뒤에·~전에·~때·아침·점심·저녁·잠들기·~김에)', () => {
  const anchored = MISSIONS.filter((m) => /뒤에|전에|때|아침|점심|저녁|잠들기|김에|자마자|주말|오후|동안|일어난|있으면|나오면|들은|받은/.test(m.text));
  assert.ok(anchored.length / MISSIONS.length >= 0.8, `앵커 비율 ${anchored.length}/90`);
});

t('긍정 해석: 6분야 × 3구간, 낮은 구간은 "~면" 조건문으로 노력과 연결', () => {
  for (const a of AREAS) {
    assert.equal(REFRAME[a.key].length, 3);
    assert.ok(/면 /.test(REFRAME[a.key][0]), `${a.key} 낮은 구간 조건문 없음`);
  }
  assert.equal(band(50), 0); assert.equal(band(65), 1); assert.equal(band(80), 2);
});

const scores = { total: 64, wealth: 52, love: 66, career: 70, health: 61, social: 68 };
t('오늘의 우산: 가장 약한 분야 × 필요한 기운으로 난이도별 3개', () => {
  const u = pickUmbrella({ dateKey: '2026-11-3', scores, yongsin: 4, heesin: 3, mood: 4 });
  assert.equal(u.area, 'wealth'); assert.equal(u.score, 52); assert.equal(u.band, 0);
  assert.deepEqual(u.options.map((o) => o.level), [1, 2, 3]);
  assert.ok(u.options.every((o) => o.area === 'wealth' && o.el === u.el));
  assert.ok(u.frame.includes('지키는 쪽이 이기는 날'));
  assert.deepEqual(pickUmbrella({ dateKey: '2026-11-3', scores, yongsin: 4, heesin: 3, mood: 4 }), u, '같은 날은 같은 우산');
});

t('오늘의 우산: 마음 날씨가 비·천둥이면 마음 분야가 먼저', () => {
  const u = pickUmbrella({ dateKey: '2026-11-3', scores, yongsin: 4, heesin: 3, mood: 2 });
  assert.equal(u.area, 'mind'); assert.equal(u.score, 64); assert.ok(u.byMood);
  const hi = pickUmbrella({ dateKey: '2026-11-3', scores: { ...scores, total: 85 }, yongsin: 4, heesin: 3, mood: 1 });
  assert.equal(hi.band, 0, '점수가 높아도 기분이 비·천둥이면 다독이는 문장'); assert.ok(hi.frame.startsWith('마음이 무거운 날'));
});

t('오늘의 우산: 3일 중 2일은 용신, 1일은 희신 기운 (같은 미션만 반복되지 않게)', () => {
  const els = ['2026-11-1', '2026-11-2', '2026-11-3', '2026-11-4', '2026-11-5', '2026-11-6'].map((dk) => pickUmbrella({ dateKey: dk, scores, yongsin: 4, heesin: 3, mood: null }).el);
  assert.equal(els.filter((e) => e === 4).length, 4); assert.equal(els.filter((e) => e === 3).length, 2);
});

t('저장: 마음 날씨 → 난이도 고르기 → 완료(하루 한 번) → 가벼워졌나요', () => {
  let s = {}; const dk = '2026-11-3';
  s = setMood(s, dk, 2).store; assert.equal(habitDay(s, dk).before, 2);
  assert.equal(setMood(s, dk, 9).changed, false, '없는 값은 무시');
  assert.equal(setAfter(s, dk, 'lighter').changed, false, '완료 전에는 못 답함');
  s = pickLevel(s, dk, 2).store; assert.equal(habitDay(s, dk).level, 2);
  const m = missionById('mind-4-2');
  const r = completeHabit(s, dk, m); assert.ok(r.changed); s = r.store;
  assert.equal(completeHabit(s, dk, m).changed, false, '하루 한 번');
  assert.equal(pickLevel(s, dk, 3).changed, false, '완료 뒤 난이도 변경 불가');
  s = setAfter(s, dk, 'lighter').store; assert.equal(habitDay(s, dk).after, 'lighter');
  assert.equal(setAfter(s, dk, 'same').changed, false, '한 번만');
});

t('통계: 가벼워진 비율·평균 마음·난이도별 횟수', () => {
  let s = {};
  [['2026-11-1', 1, 'lighter'], ['2026-11-2', 2, 'lighter'], ['2026-11-3', 3, 'same']].forEach(([dk, lv, after], i) => {
    s = setMood(s, dk, 3 + i).store;
    s = completeHabit(s, dk, { id: `x${i}`, area: 'mind', el: 0, level: lv }).store;
    s = setAfter(s, dk, after).store;
  });
  s = setMood(s, '2026-11-4', 2).store;
  const st = habitStats(s);
  assert.equal(st.doneDays, 3); assert.equal(st.lighterRate, 67); assert.equal(st.moodDays, 4); assert.equal(st.avgMood, 3.5);
  assert.deepEqual(st.byLevel, [1, 1, 1]);
  assert.equal(habitStats({}).lighterRate, null);
});

t('이번 주 완료 수: 월~일 기준 (2026-11-2 월요일 ~ 11-8 일요일)', () => {
  let s = {};
  ['2026-11-1', '2026-11-2', '2026-11-4', '2026-11-8', '2026-11-9'].forEach((dk) => { s = completeHabit(s, dk, { id: 'a', area: 'mind', el: 0, level: 1 }).store; });
  assert.equal(weekDone(s, '2026-11-5'), 3);
  assert.equal(weekDone(s, '2026-11-9'), 1);
});

t('천둥 마음 3일 연속이면 상담 안내', () => {
  let s = {};
  ['2026-11-1', '2026-11-2', '2026-11-3'].forEach((dk) => { s = setMood(s, dk, 1).store; });
  assert.ok(needsCare(s, '2026-11-3'));
  assert.ok(!needsCare(s, '2026-11-4'));
  s = setMood(s, '2026-11-2', 3).store; assert.ok(!needsCare(s, '2026-11-3'));
});

t(`저장은 최근 ${HABIT_KEEP_DAYS}일만`, () => {
  let s = {};
  for (let i = 1; i <= 100; i++) { const d = new Date(Date.UTC(2026, 0, i)); s = setMood(s, `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`, 3).store; }
  assert.equal(Object.keys(s).length, HABIT_KEEP_DAYS);
});

t('문장 규칙: 금지어가 운세 문장·풀이·미션·해석 어디에도 없음', () => {
  const all = [
    ...MISSIONS.map((m) => m.text), ...Object.values(REFRAME).flat(), ...MOODS.map((m) => m.label),
    ...Object.values(TEN_GOD_INFO).flatMap((x) => Object.values(x)), ...Object.values(TIER_TEXT).flat(),
    JSON.stringify(GOD_READING), JSON.stringify(YEAR_HEADLINE),
  ];
  const bad = all.flatMap((txt) => toneProblems(txt).map((w) => `${w} ← ${String(txt).slice(0, 40)}`));
  assert.deepEqual(bad, []);
  assert.ok(BANNED_TONE.includes('최악'));
});

t('문장 규칙: 오늘 운세의 낮은 구간 문장은 모두 행동으로 끝난다(~세요)', () => {
  Object.entries(TIER_TEXT).forEach(([k, arr]) => assert.ok(/세요\.?$/.test(arr[0].trim()), `${k}: ${arr[0]}`));
});

console.log(`\n${pass} passed`);
