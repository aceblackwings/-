import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { weekOf } from '../js/period.js';
import { buildNote, markNote, weekStamps, stampRarity, nextTier, AREA_CHARM } from '../js/note.js';
import { toneProblems } from '../js/habit.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const s = computeSaju({ year: 1998, month: 5, day: 20, hour: 9, minute: 30 });
const D = (m, d) => ({ year: 2026, month: m, day: d });
const W = (dt) => weekOf(s, dt, 'female');

t('도장 수 → 부적 등급: 1·2 일반, 3·4 희귀, 5·6 영웅, 7 전설', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7].map(stampRarity), ['common', 'common', 'rare', 'rare', 'epic', 'epic', 'legend']);
  assert.deepEqual(nextTier(1), { left: 2, rarity: 'rare' }); assert.equal(nextTier(7), null);
  assert.equal(AREA_CHARM.mind, 'protect');
});

t('첫 접속: 「오늘부터 매일 쪽지」, 이번 주 가장 좋은 날 미리 짚기(11/3 → 금 11/6)', () => {
  const n = buildNote({ today: D(11, 3), task: '물 한 컵 마시기', week: W(D(11, 3)) });
  assert.ok(n.opening.startsWith('오늘부터')); assert.ok(n.task.includes('물 한 컵'));
  assert.ok(n.weekLine.includes('금요일(11/6)'), n.weekLine);
  assert.equal(n.rarity, 'common'); assert.equal(n.done, false);
});

t('어제 했으면 칭찬, 안 했으면 다독임 / 좋은 날 당일엔 「오늘이 그날」 / 지나면 마무리', () => {
  let st = markNote({}, '2026-11-2', '일반 재물부').store;
  assert.ok(buildNote({ today: D(11, 3), task: 'x', week: W(D(11, 3)), store: st }).opening.includes('해냈더라'));
  assert.ok(buildNote({ today: D(11, 4), task: 'x', week: W(D(11, 4)), store: st }).opening.includes('괜찮아'));
  assert.ok(buildNote({ today: D(11, 6), task: 'x', week: W(D(11, 6)), store: st }).weekLine.startsWith('오늘이 이번 주 가장 좋은 날'));
  assert.ok(buildNote({ today: D(11, 7), task: 'x', week: W(D(11, 7)), store: st }).weekLine.includes('지나갔어'));
});

t('일요일엔 다음 주 미리보기', () => {
  const n = buildNote({ today: D(11, 8), task: 'x', week: W(D(11, 8)), nextWeek: W(D(11, 9)), store: { '2026-11-1': { done: true } } });
  assert.ok(n.weekLine.startsWith('다음 주는'), n.weekLine);
});

t('완료 저장·도장 세기·완료 문장, 존댓말(닭띠), 금지어 없음', () => {
  let st = {};
  for (const d of [2, 3, 4]) st = markNote(st, `2026-11-${d}`, '희귀 재물부').store;
  assert.equal(markNote(st, '2026-11-4', 'x').changed, false);
  const wk = W(D(11, 4));
  assert.equal(weekStamps(st, wk), 3);
  const n = buildNote({ today: D(11, 4), task: 'x', week: wk, store: st });
  assert.equal(n.done, true); assert.ok(n.reward.includes('희귀 재물부를'), n.reward);
  const p = buildNote({ today: D(11, 5), task: 'x', week: W(D(11, 5)), store: st, polite: true });
  assert.ok(/요[.!]?$/.test(p.opening) && p.reward.includes('드릴게요'), p.reward);
  assert.ok(p.reward.includes('영웅') === false && p.rarity === 'epic' || p.rarity === 'rare');
  assert.deepEqual(toneProblems(JSON.stringify([n, p])), []);
});

t('40일 넘으면 오래된 기록 정리', () => {
  let st = {};
  for (let i = 1; i <= 45; i++) { const d = new Date(Date.UTC(2026, 8, i)); st = markNote(st, `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`, 'x').store; }
  assert.equal(Object.keys(st).length, 40);
});

console.log(`\nnote: ${pass} passed`);
