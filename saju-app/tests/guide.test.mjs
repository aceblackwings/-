import assert from 'node:assert/strict';
import { GUIDE_STEPS, emptyGuide, showNextYear, activeSteps, nextStep, progress, isUnlocked, stepFor, completeStep, setAll } from '../js/guide.js';

// 내년 카드 표시 시기
assert.equal(showNextYear({ year: 2026, month: 11, day: 2 }, 2026), true, '11월은 내년 카드');
assert.equal(showNextYear({ year: 2026, month: 9, day: 1 }, 2026), true, '9월 1일부터');
assert.equal(showNextYear({ year: 2026, month: 8, day: 31 }, 2026), false, '8월은 숨김');
assert.equal(showNextYear({ year: 2027, month: 1, day: 20 }, 2026), true, '입춘 전 1월은 새해 카드');
assert.equal(showNextYear({ year: 2027, month: 3, day: 1 }, 2027), false, '입춘 후 3월은 숨김');

// 퀘스트 순서
assert.equal(activeSteps({ showNext: true }).length, 9);
assert.equal(activeSteps({ showNext: false }).length, 8);
assert.equal(nextStep(emptyGuide(), { showNext: true }).key, 'next');
assert.equal(nextStep(emptyGuide(), { showNext: false }).key, 'week');
assert.equal(GUIDE_STEPS[0].title(2027), '2027년 운세 펼쳐 보기');

// 처음에는 기본 3장 외에는 잠김
for (const sec of ['week', 'month', 'mission', 'daily', 'ask', 'daewoon', 'natal', 'journey', 'todo', 'season']) {
  assert.equal(isUnlocked(emptyGuide(), sec), false, `${sec} 잠김`);
  assert.ok(stepFor(sec), `${sec}을 여는 퀘스트가 있음`);
}

// 하나씩 완료
let g = emptyGuide();
let r = completeStep(g, 'next'); assert.ok(r.changed); g = r.guide;
r = completeStep(g, 'next'); assert.equal(r.changed, false, '중복 완료 없음');
r = completeStep(g, 'nope'); assert.equal(r.changed, false, '없는 키 무시');
assert.equal(nextStep(g, { showNext: true }).key, 'week');
g = completeStep(g, 'week').guide;
assert.equal(isUnlocked(g, 'week'), true);
assert.equal(isUnlocked(g, 'month'), false);
assert.deepEqual(progress(g, { showNext: true }), { done: 2, total: 9 });
assert.deepEqual(progress(g, { showNext: false }), { done: 1, total: 8 });
g = completeStep(g, 'daewoon').guide;
assert.ok(isUnlocked(g, 'daewoon') && isUnlocked(g, 'natal'), '대운 퀘스트는 타고난 나까지 연다');

// 모두 끝내기
for (const s of GUIDE_STEPS) g = completeStep(g, s.key).guide;
assert.equal(nextStep(g, { showNext: true }), null);
assert.equal(isUnlocked(g, 'story'), true);

// 전체 보기 탈출구
assert.equal(isUnlocked(setAll(emptyGuide(), true), 'season'), true);
assert.equal(isUnlocked(setAll(setAll(emptyGuide(), true), false), 'season'), false);

console.log('guide tests ok');
