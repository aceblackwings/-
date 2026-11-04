import assert from 'node:assert/strict';
import { visit, doTask, isOpen, spend, buy, todayTasks, WELCOME, DAILY_VISIT, ALL_BONUS, SCROLLS, TASKS } from '../js/tteok.js';
let pass = 0; const t = (n, fn) => { fn(); pass++; console.log('ok -', n); };
const D = '2026-11-4'; const D2 = '2026-11-5';
t('첫 방문 환영 선물 + 하루 한 번', () => {
  let { store, gained } = visit(null, D); assert.equal(gained, WELCOME + DAILY_VISIT);
  ({ store, gained } = visit(store, D)); assert.equal(gained, 0);
  ({ store, gained } = visit(store, D2)); assert.equal(gained, DAILY_VISIT); assert.equal(store.balance, WELCOME + 2 * DAILY_VISIT);
});
t('할 일 3가지 → 보너스, 그날만 두루마리 무료', () => {
  let s = visit(null, D).store; const b0 = s.balance;
  for (const k of ['habit', 'tarot']) s = doTask(s, D, k).store;
  assert.equal(isOpen(s, D, 'next'), null);
  const r = doTask(s, D, 'care'); assert.ok(r.allDone && r.first); s = r.store;
  assert.equal(s.balance, b0 + TASKS.reduce((a, x) => a + x.reward, 0) + ALL_BONUS);
  assert.equal(isOpen(s, D, 'next'), 'today'); assert.equal(isOpen(s, D, 'saju'), 'today'); assert.equal(isOpen(s, D2, 'next'), null);
  assert.equal(doTask(s, D, 'care').gained, 0, '두 번 받지 않음');
  assert.equal(todayTasks(s, D).filter((x) => x.done).length, 3);
});
t('떡으로 열기: 모자라면 거절, 열면 계속, 결제는 운 점수와 무관', () => {
  let s = visit(null, D).store;
  const r1 = spend(s, 'next'); assert.equal(r1.ok, false); assert.equal(r1.need, SCROLLS.next.cost - s.balance);
  s = buy(s, 'box').store; const r2 = spend(s, 'next'); assert.ok(r2.ok); s = r2.store;
  assert.equal(isOpen(s, D2, 'next'), 'paid'); assert.ok(spend(s, 'next').already);
  assert.ok(!('score' in s));
});
console.log(`\ntteok: ${pass} passed`);
