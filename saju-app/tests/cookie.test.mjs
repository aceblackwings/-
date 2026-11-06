// v0.59 포춘 쿠키 · 오늘 할 일 · 나만의 습관 2가지
import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { computeFortune } from '../js/fortune.js';
import { isOpened, markOpened, todayTodo, cookieTiles } from '../js/cookie.js';
import { recommendHabits, setHabits, checkTarget, checkHabit, isSet, HABIT_REWARD, ALL_RECOMMEND, recentChecks } from '../js/dailyhabit.js';
import { EL_TALE } from '../js/storybook.js';
import { josaProblems } from '../js/josa.js';

let n = 0; const t = (name, fn) => { fn(); n++; console.log(`ok - ${name}`); };
const saju = computeSaju({ year: 1990, month: 5, day: 17, hour: 9, minute: 30, gender: 'female' });

t('포춘 쿠키: 하루 한 번 열림 기록 · 14일만', () => {
  let s = {}; assert.equal(isOpened(s, '2026-11-6'), false);
  s = markOpened(s, '2026-11-6'); assert.equal(isOpened(s, '2026-11-6'), true); assert.equal(isOpened(s, '2026-11-7'), false);
  for (let d = 1; d <= 30; d++) s = markOpened(s, `2026-10-${d}`);
  assert.equal(Object.keys(s.days).length, 14); assert.equal(isOpened(s, '2026-11-6'), true);
});

t('오늘 할 일: 용신·가장 적은 기운의 채우는 법에서 하루 하나 · 같은 날은 같음 · 조사', () => {
  const seen = new Set();
  for (let d = 1; d <= 60; d++) {
    const k = `2026-${Math.ceil(d / 30) + 10}-${((d - 1) % 30) + 1}`;
    const a = todayTodo(saju, k, 'x'); const b = todayTodo(saju, k, 'x');
    assert.deepEqual(a, b);
    assert.ok([saju.yongsin, saju.weakest].includes(a.el));
    assert.ok(EL_TALE[a.el].bring.includes(a.text));
    assert.deepEqual(josaProblems(a.why), []);
    seen.add(a.text);
  }
  assert.ok(seen.size >= 3, '날마다 바뀜');
});

t('긁는 칸 3개: 색·숫자·오늘 할 일(넓은 칸)', () => {
  const f = computeFortune(saju, { year: 2026, month: 11, day: 6 }, { gender: 'female' });
  const tiles = cookieTiles(f.luck, todayTodo(saju, f.dateKey));
  assert.deepEqual(tiles.map((x) => x.key), ['color', 'number', 'todo']);
  assert.ok(tiles.every((x) => x.value)); assert.ok(tiles[2].wide);
});

t('습관 2가지: 추천 6개 · 첫날은 오늘 2개 체크(떡 4) · 다음 날부터 어제 체크', () => {
  const rec = recommendHabits(saju, '2026-11-6'); assert.equal(rec.length, 6); assert.equal(new Set(rec).size, 6);
  assert.ok(rec.every((r) => ALL_RECOMMEND.includes(r)));
  let s = setHabits({}, ['물 여덟 잔 마시기', ''], '2026-11-6'); assert.equal(isSet(s), false); assert.equal(checkTarget(s, '2026-11-6'), null);
  s = setHabits(s, ['물 여덟 잔 마시기', '책 다섯 쪽 읽기'], '2026-11-6'); assert.equal(isSet(s), true);
  assert.equal(checkTarget(s, '2026-11-6'), '2026-11-6');
  let r = checkHabit(s, '2026-11-6', 0); assert.equal(r.gained, HABIT_REWARD); s = r.store;
  assert.equal(checkHabit(s, '2026-11-6', 0).gained, 0, '같은 칸은 한 번');
  r = checkHabit(s, '2026-11-6', 1); assert.equal(r.gained, 2); assert.equal(r.all, true); s = r.store;
  // 다음 날: 어제(11/6)는 이미 다 했으니 줄 것 없음, 그다음 날은 11/7을 체크
  assert.equal(checkTarget(s, '2026-11-7'), '2026-11-6');
  assert.equal(checkHabit(s, '2026-11-7', 0).gained, 0);
  assert.equal(checkTarget(s, '2026-11-8'), '2026-11-7');
  r = checkHabit(s, '2026-11-8', 1); assert.equal(r.gained, 2); assert.equal(r.target, '2026-11-7');
  // 습관을 바꿔도 첫날은 그대로
  s = setHabits(r.store, ['깊은 숨 열 번 쉬기', '책 다섯 쪽 읽기'], '2026-11-8'); assert.equal(s.start, '2026-11-6');
  assert.equal(recentChecks(s, '2026-11-8').length, 7);
});

console.log(`cookie: ${n} 통과`);
