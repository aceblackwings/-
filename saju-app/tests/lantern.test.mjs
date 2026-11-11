// v0.64 100일 소원 등불(2,900원) · 소원 부적 990원 · 걱정 태우기 무료 하루 한 번
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as L from '../js/lantern.js';
import { josaProblems } from '../js/josa.js';
import { toneProblems } from '../js/habit.js';
import { PAY_GETS, charmLayout } from '../js/paidcharm.js';
import { wallOf, midWish, dueWish } from '../js/wish.js';
import { shiftDay } from '../js/omen.js';

const base = { type: 'luck', theme: 'classic', element: 1, rarity: 'legend', dateKey: '2026-11-6', label: '소원 부적' };
const mk = (o = {}) => L.makeLantern(base, { wish: '자격증 시험 합격', forWho: '', by: '민지', seal: 8, today: '2026-11-6', ...o });

test('100일: 만든 날 1일째, 100일째가 dueKey, 10일마다 한 칸', () => {
  const r = mk();
  assert.equal(r.paid, 'lantern'); assert.equal(r.dueKey, shiftDay('2026-11-6', 99));
  assert.equal(L.lanternDay(r, '2026-11-6'), 1);
  assert.equal(L.lanternDay(r, r.dueKey), 100);
  assert.equal(L.lanternDay(r, shiftDay(r.dueKey, 30)), 100, '100을 넘지 않음');
  assert.deepEqual([1, 9, 10, 55, 100].map(L.lanternStage), [0, 0, 1, 5, 10]);
  assert.equal(dueWish([r], r.dueKey)?.i, 0, '100일째에 홈 맨 위에서 물어봄');
  assert.equal(midWish([r], shiftDay('2026-11-6', 60)), null, '중간 안내 대신 편지');
});

test('매일 한 줄: 100일 동안 모두 다르고, 반말·존댓말 모두 조사·금지어 없음', () => {
  for (const r of [mk(), mk({ forWho: '엄마' }), mk({ wish: '좋은 인연 만나기', forWho: '우리 딸' }), mk({ wish: '이직' })]) {
    for (const polite of [false, true]) {
      const lines = Array.from({ length: 100 }, (_, k) => L.lanternLine(r, k + 1, polite));
      assert.equal(new Set(lines).size, 100);
      for (const s of lines) {
        assert.deepEqual(josaProblems(s), [], s); assert.deepEqual(toneProblems(s), [], s);
        assert.ok(!/\{[wf]\}/.test(s), s);
      }
    }
  }
  assert.ok(L.lanternLine(mk({ forWho: '엄마' }), 1).includes('엄마를 위해'));
});

test('편지 25·50·75일, 읽으면 다음 편지', () => {
  let col = [mk()]; const at = (d) => shiftDay('2026-11-6', d - 1);
  assert.equal(L.letterDue(col[0], at(24)), 0);
  assert.equal(L.letterDue(col[0], at(25)), 1);
  assert.equal(L.letterDue(col[0], at(60)), 1, '안 읽었으면 계속 보임');
  col = L.readLetter(col, 0, 1);
  assert.equal(L.letterDue(col[0], at(60)), 2);
  col = L.readLetter(L.readLetter(col, 0, 2), 0, 3);
  assert.equal(L.letterDue(col[0], at(99)), 0);
  for (let n = 1; n <= 3; n++) for (const p of [false, true]) {
    const ls = L.lanternLetter(col[0], n, p); assert.equal(ls.length, 3);
    ls.forEach((s) => { assert.deepEqual(josaProblems(s), [], s); assert.deepEqual(toneProblems(s), [], s); });
  }
});

test('함께 빌기 하루 한 번 · 100일 완주는 벽에 걸림', () => {
  let col = [mk()];
  col = L.pray(col, 0, '2026-11-7'); col = L.pray(col, 0, '2026-11-7');
  assert.equal(col[0].prayed, 1); assert.ok(L.prayedToday(col[0], '2026-11-7'));
  col = L.pray(col, 0, '2026-11-8'); assert.equal(col[0].prayed, 2);
  assert.equal(L.activeLanterns(col).length, 1);
  col = L.keepLantern(col, 0, col[0].dueKey);
  assert.equal(col[0].result, 'kept'); assert.equal(L.activeLanterns(col).length, 0);
  assert.equal(wallOf(col).length, 1);
  [L.keptLine(false), L.keptLine(true), L.lanternAsk(col[0]), L.lanternAsk(col[0], true)].forEach((s) => assert.deepEqual(toneProblems(s), [], s));
});

test('누구를 위한 소원: 정리·부적 글자', () => {
  assert.equal(L.cleanFor(' 나 '), ''); assert.equal(L.cleanFor('<엄마>'), '엄마'); assert.equal(L.cleanFor('아주아주긴이름입니다'), '아주아주긴이름입');
  const who = charmLayout({ kind: 'wish', text: '건강', name: '민지', madeKey: '2026-11-6', dueKey: '2027-2-13', branch: 8, forWho: '엄마', lantern: true });
  assert.ok(who.some((x) => x.t === '엄마를 위한 소원'));
  assert.ok(who.some((x) => x.t.startsWith('100일 등불')));
  assert.equal(PAY_GETS.lantern.length, 4); PAY_GETS.lantern.forEach((s) => assert.deepEqual(toneProblems(s), []));
});

test('가격: 소원 990(복떡 가능) · 등불 2,900(복떡 불가) · 걱정 태우기 무료 하루 한 번', () => {
  assert.equal(L.WISH_PRICE, 990); assert.equal(L.LANTERN_PRICE, 2900);
  let st = {}; assert.ok(L.canBurnToday(st, '2026-11-6'));
  st = L.markBurned(st, '2026-11-6'); assert.ok(!L.canBurnToday(st, '2026-11-6')); assert.ok(L.canBurnToday(st, '2026-11-7'));
  assert.deepEqual(Object.keys(st).sort(), ['count', 'last'], '걱정 글은 저장하지 않음');
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  assert.ok(!/openCharmPay\('burn'/.test(app), '걱정 태우기에는 결제 창이 없음');
  assert.ok(/if \(lantern\) return;/.test(app), '등불은 복떡 버튼이 눌려도 무료가 되지 않음');
  const pay = app.slice(app.indexOf('function openCharmPay('), app.indexOf('/** 도감에 저장할 기록'));
  assert.ok(pay.includes('lantern ? `<p class="hj-note">100일 등불은 복떡으로는'), '등불 결제 창에는 복떡 버튼 대신 안내');
});
