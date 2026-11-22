// v0.77 오늘의 길잡이: 하루 순서 4가지(쿠키 → 습관 → 타로 → 코디)
import assert from 'node:assert/strict';
import { PATH, dailyPath, nextLabel } from '../js/coach.js';
import { toneProblems } from '../js/habit.js';
let pass = 0; const t = (n, f) => { f(); pass++; console.log('ok -', n); };

t('순서: 쿠키 → 습관 → 타로 → 코디, 다음 할 일은 안 한 것 중 첫째', () => {
  assert.deepEqual(PATH.map((x) => x.key), ['cookie', 'habit', 'tarot', 'coordi']);
  let P = dailyPath({});
  assert.equal(P.next.key, 'cookie'); assert.equal(P.doneN, 0); assert.equal(P.all, false);
  assert.equal(nextLabel(dailyPath({ cookie: true }).next, {}), '습관 2가지 정하기', '안 정했으면 정하기부터');
  P = dailyPath({ cookie: true, habitSet: true, habitLeft: 1 });
  assert.equal(P.next.key, 'habit', '하나라도 남으면 습관');
  assert.equal(nextLabel(P.next, { habitSet: true }), '습관 체크하기');
  P = dailyPath({ cookie: true, habitSet: true, habitLeft: 0 }); assert.equal(P.next.key, 'tarot'); assert.equal(P.next.tab, 'tarot');
  P = dailyPath({ cookie: true, habitSet: true, habitLeft: 0, tarot: true }); assert.equal(P.next.key, 'coordi'); assert.equal(P.next.tab, 'hero');
  P = dailyPath({ cookie: true, habitSet: true, habitLeft: 0, tarot: true, coordi: true }); assert.equal(P.all, true); assert.equal(P.next, null); assert.equal(P.doneN, 4);
  P = dailyPath({ tarot: true }); assert.equal(P.next.key, 'cookie', '순서를 건너뛰어도 앞의 빈칸부터'); assert.equal(P.doneN, 1);
});
t('안내 문장: 금지어 없음', () => {
  for (const x of PATH) assert.deepEqual(toneProblems(`${x.label} ${x.why}`), [], x.key);
});
console.log(`coach: ${pass} 통과`);
