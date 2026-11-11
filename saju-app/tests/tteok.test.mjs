import assert from 'node:assert/strict';
import { visit, doTask, isOpen, spend, buy, todayTasks, claimItem, PIECES_PER_ITEM, WELCOME, DAILY_VISIT, ALL_BONUS, SCROLLS, TASKS, tarotPrice, useTarot, TAROT_COST, friendKey, useCompat, compatOpen, grandfatherCompat, useCharmTteok, CHARM_TTEOK } from '../js/tteok.js';
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
t('계절 소품: 할 일 하나 = 조각 1개, 6개면 아직 없는 다음 시즌 소품', () => {
  let s = visit(null, D).store; let ready = false;
  for (const d of [D, D2]) for (const k of ['habit', 'tarot', 'care']) { const r = doTask(s, d, k); s = r.store; ready = r.itemReady; }
  assert.equal(s.pieces, PIECES_PER_ITEM); assert.ok(ready);
  const seasons = [{ id: 'ipdong-2026', key: 'ipdong' }, { id: 'dongji-2026', key: 'dongji' }];
  const r = claimItem(s, seasons, new Set(['ipdong-2026'])); assert.equal(r.item.id, 'dongji-2026'); assert.equal(r.store.pieces, 0);
  assert.equal(claimItem(r.store, seasons, new Set()).item, null, '조각 모자라면 없음');
  assert.equal(claimItem(s, seasons, new Set(['ipdong-2026', 'dongji-2026'])).item, null, '다 가지면 조각 유지');
});
t('타로(v0.65): 무료 없음 · 한 장 복떡 1개 · 세 장 3개(모자라면 못 펼침)', () => {
  let s = { balance: 5, days: {}, log: [], unlocked: {}, pieces: 0 };
  assert.deepEqual(tarotPrice(s, D, 'three'), { free: false, cost: 3 });
  assert.deepEqual(tarotPrice(s, D, 'one'), { free: false, cost: 1 });
  let r = useTarot(s, D, 'three'); assert.ok(r.ok && !r.free); s = r.store; assert.equal(s.balance, 2);
  r = useTarot(s, D, 'one'); assert.ok(r.ok); s = r.store; assert.equal(s.balance, 1);
  r = useTarot(s, D, 'three'); assert.equal(r.ok, false); assert.equal(r.need, 2); assert.equal(r.store.balance, 1);
  assert.equal(tarotPrice(s, D2, 'one').cost, TAROT_COST.one);
});
t('궁합 새 친구 2개(같은 친구는 무료) · 부적 50개', () => {
  let s = { balance: 3, days: {}, log: [], unlocked: {}, pieces: 0 };
  const k = friendKey({ year: 1992, month: 3, day: 4 });
  let r = useCompat(s, k); assert.ok(r.ok && !r.free); s = r.store; assert.equal(s.balance, 1); assert.ok(compatOpen(s, k));
  r = useCompat(s, k); assert.ok(r.ok && r.free); assert.equal(r.store.balance, 1);
  r = useCompat(s, friendKey({ year: 1993, month: 3, day: 4 })); assert.equal(r.ok, false); assert.equal(r.need, 1);
  s = grandfatherCompat(s, ['solar-2000-1-1']); assert.ok(compatOpen(s, 'solar-2000-1-1'));
  assert.equal(useCharmTteok(s, 'wish').ok, false);
  r = useCharmTteok({ ...s, balance: 120 }, 'burn'); assert.ok(r.ok); assert.equal(r.store.balance, 120 - CHARM_TTEOK);
  r = useCharmTteok(r.store, 'wish'); assert.ok(r.ok); assert.equal(r.store.balance, 20, '모으면 또 한 번');
});
console.log(`\ntteok: ${pass} passed`);
