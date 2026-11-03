import assert from 'node:assert/strict';
import { INTRO_DAYS, FIRST_WEEK_DAYS, emptyFirstWeek, ensureStart, dayIndex, inFirstWeek, todayIntro, markSeen, plainTerms, hasGameTerms, VETERAN_EXP } from '../js/firstweek.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };

t('소개는 7일, 날마다 하나씩 다른 기능', () => {
  assert.equal(INTRO_DAYS.length, FIRST_WEEK_DAYS);
  assert.equal(new Set(INTRO_DAYS.map((d) => d.go)).size, 7);
  INTRO_DAYS.forEach((d, i) => assert.equal(d.day, i + 1));
});

t('첫날 기록, 1~7일차 계산 (달 경계 포함), 8일차부터는 첫 주 아님', () => {
  let f = ensureStart(emptyFirstWeek(), '2026-10-29');
  assert.equal(f.start, '2026-10-29');
  assert.equal(ensureStart(f, '2026-11-5').start, '2026-10-29', '다시 덮어쓰지 않음');
  assert.equal(dayIndex(f, '2026-10-29'), 1);
  assert.equal(dayIndex(f, '2026-11-4'), 7);
  assert.ok(inFirstWeek(f, '2026-11-4'));
  assert.ok(!inFirstWeek(f, '2026-11-5'));
});

t('이미 많이 쓴 사람은 첫 주를 건너뜀', () => {
  const f = ensureStart(emptyFirstWeek(), '2026-11-2', VETERAN_EXP);
  assert.ok(!inFirstWeek(f, '2026-11-2'));
  assert.equal(todayIntro(f, '2026-11-2'), null);
});

t('오늘 소개는 한 번 보면 그날은 다시 안 나옴, 다음 날은 다음 소개', () => {
  let f = ensureStart(emptyFirstWeek(), '2026-11-2');
  assert.equal(todayIntro(f, '2026-11-2').day, 1);
  f = markSeen(f, '2026-11-2');
  assert.equal(todayIntro(f, '2026-11-2'), null);
  assert.equal(todayIntro(f, '2026-11-3').day, 2);
  assert.equal(todayIntro(f, '2026-11-3').go, 'records');
});

t('게임 용어를 쉬운 말로', () => {
  assert.equal(plainTerms('완료할 때마다 +3 EXP'), '완료할 때마다 +3 성장 점수');
  assert.equal(plainTerms('Lv.12 · 아기 수호령'), '성장 12 · 아기 수호령');
  assert.equal(plainTerms('레벨 업! Lv.3 🎉'), '한 뼘 더 자랐어요! 성장 3 🎉');
  assert.equal(plainTerms('40 / 120 EXP'), '40 / 120 성장 점수');
  assert.ok(hasGameTerms('Lv.5 진화 시 해금')); assert.ok(!hasGameTerms(plainTerms('Lv.5 진화 시 해금')));
  assert.equal(plainTerms('EXPLORE'), 'EXPLORE', '다른 단어는 그대로');
});

t('시작일이 아직 없으면 안전하게 아무것도 안 함', () => {
  assert.equal(todayIntro(null, '2026-11-2'), null);
  assert.equal(inFirstWeek(null, '2026-11-2'), false);
  assert.deepEqual(markSeen(null, '2026-11-2'), emptyFirstWeek());
});

console.log(`${pass} passed`);
