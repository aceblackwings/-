import assert from 'node:assert/strict';
import { emptyRecords, logDay, pendingFeedback, setFeedback, setDayMemo, addItem, hasItem, setItemMemo, removeItem, dayList, stats, streak, prevDay, dayKey, DAY_LIMIT, ITEM_LIMIT, MEMO_MAX } from '../js/records.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const D = (year, month, day) => ({ year, month, day });
const snap = (d, score, title = '날') => ({ dateKey: dayKey(d), title, score, best: 'love', worst: 'wealth' });

t('하루 전 날짜: 달·해 경계', () => {
  assert.deepEqual(prevDay(D(2026, 11, 2)), D(2026, 11, 1));
  assert.deepEqual(prevDay(D(2026, 3, 1)), D(2026, 2, 28));
  assert.deepEqual(prevDay(D(2027, 1, 1)), D(2026, 12, 31));
});

t('어제 기록이 있을 때만 "어제 운세 맞았나요?"를 묻고, 답하면 다시 묻지 않음', () => {
  let r = emptyRecords();
  assert.equal(pendingFeedback(r, D(2026, 11, 3)), null, '기록 없음');
  r = logDay(r, snap(D(2026, 11, 2), 72, '귀인을 만나는 날'));
  const p = pendingFeedback(r, D(2026, 11, 3));
  assert.equal(p.dateKey, '2026-11-2'); assert.equal(p.score, 72); assert.equal(p.title, '귀인을 만나는 날');
  assert.equal(pendingFeedback(r, D(2026, 11, 2)), null, '오늘 것은 묻지 않음');
  assert.equal(pendingFeedback(r, D(2026, 11, 4)), null, '그저께 것은 묻지 않음');
  const s = setFeedback(r, '2026-11-2', 'yes', '  정말   좋은 일이 있었다 ');
  assert.ok(s.changed); r = s.rec;
  assert.equal(r.days['2026-11-2'].memo, '정말 좋은 일이 있었다');
  assert.equal(pendingFeedback(r, D(2026, 11, 3)), null);
  assert.equal(setFeedback(r, '2026-11-2', 'no').changed, false, '두 번째 답은 경험치 없음');
  assert.equal(setFeedback(r, '2026-11-2', 'maybe').changed, false, '없는 답 무시');
});

t('건너뛰기를 누르면 그날은 다시 묻지 않음', () => {
  let r = logDay(emptyRecords(), snap(D(2026, 11, 2), 60));
  r = setFeedback(r, '2026-11-2', 'skip').rec;
  assert.equal(pendingFeedback(r, D(2026, 11, 3)), null);
});

t('같은 날 다시 기록해도 피드백·메모는 지킴, 120일까지만 보관', () => {
  let r = logDay(emptyRecords(), snap(D(2026, 11, 2), 60));
  r = setFeedback(r, '2026-11-2', 'half').rec;
  r = setDayMemo(r, '2026-11-2', 'x'.repeat(500));
  r = logDay(r, snap(D(2026, 11, 2), 61, '바뀐 제목'));
  assert.equal(r.days['2026-11-2'].feedback, 'half');
  assert.equal(r.days['2026-11-2'].memo.length, MEMO_MAX);
  assert.equal(r.days['2026-11-2'].title, '바뀐 제목');
  let d = D(2026, 11, 2);
  for (let i = 0; i < DAY_LIMIT + 20; i++) { r = logDay(r, snap(d, 60)); d = prevDay(d); }
  assert.equal(Object.keys(r.days).length, DAY_LIMIT);
  assert.ok(r.days['2026-11-2'], '최근 날은 남음');
});

t('결과 저장: 같은 결과는 덮어쓰고 메모 유지, 100개 제한, 삭제', () => {
  let r = emptyRecords();
  let a = addItem(r, { kind: 'ask', key: 'money', dateKey: '2026-11-2', title: '돈 들어올까?', score: 71, summary: '좋은 편', lines: ['a', 'b'] });
  assert.ok(a.isNew); r = a.rec;
  assert.ok(hasItem(r, 'ask', '2026-11-2', 'money'));
  r = setItemMemo(r, r.items[0].id, '월급날');
  a = addItem(r, { kind: 'ask', key: 'money', dateKey: '2026-11-2', title: '돈 들어올까?', score: 72 });
  assert.equal(a.isNew, false); r = a.rec;
  assert.equal(r.items.length, 1); assert.equal(r.items[0].memo, '월급날'); assert.equal(r.items[0].score, 72);
  for (let i = 0; i < ITEM_LIMIT + 5; i++) r = addItem(r, { kind: 'card', key: `c${i}`, dateKey: '2026-11-3', title: `카드 ${i}` }).rec;
  assert.equal(r.items.length, ITEM_LIMIT);
  assert.equal(r.items[0].title, `카드 ${ITEM_LIMIT + 4}`, '새것이 앞');
  r = removeItem(r, r.items[0].id);
  assert.equal(r.items.length, ITEM_LIMIT - 1);
});

t('통계: 맞았어요 비율(반쯤 = 0.5), 높은 날·낮은 날 적중, 목록은 새것부터', () => {
  let r = emptyRecords();
  const plan = [[1, 80, 'yes'], [2, 75, 'half'], [3, 50, 'no'], [4, 52, 'yes'], [5, 65, null]];
  for (const [day, score, fb] of plan) { r = logDay(r, snap(D(2026, 11, day), score)); if (fb) r = setFeedback(r, `2026-11-${day}`, fb).rec; }
  const s = stats(r);
  assert.equal(s.logged, 5); assert.equal(s.answered, 4);
  assert.equal(s.hitRate, Math.round((2 + 0.5) / 4 * 100));
  assert.equal(s.highHit, 100); assert.equal(s.lowHit, 50);
  assert.deepEqual(dayList(r, 3).map((d) => d.dateKey), ['2026-11-5', '2026-11-4', '2026-11-3']);
  assert.equal(stats(emptyRecords()).hitRate, null);
});

t('연속으로 본 날 수', () => {
  let r = emptyRecords();
  for (const day of [1, 2, 3, 5]) r = logDay(r, snap(D(2026, 11, day), 60));
  assert.equal(streak(r, D(2026, 11, 5)), 1);
  assert.equal(streak(r, D(2026, 11, 4)), 3, '오늘 아직 안 봤으면 어제부터');
  assert.equal(streak(r, D(2026, 11, 7)), 0);
});

console.log(`${pass} passed`);
