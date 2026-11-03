import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { weekOf } from '../js/period.js';
import { buildNote, markNote, weekStamps, stampRarity, nextTier, AREA_CHARM, monthStamps, MONTH_KEY_NEED, newStoryIndex, storiesOpen, buildStories, STORY_STEPS, weeklyLetter } from '../js/note.js';
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

t('③ 다음 달 열쇠: 이달 도장만 셈(20개)', () => {
  let st = {};
  for (let d = 1; d <= 20; d++) st = markNote(st, `2026-11-${d}`, 'x').store;
  st = markNote(st, '2026-10-31', 'x').store;
  assert.equal(monthStamps(st, 2026, 11), 20); assert.equal(MONTH_KEY_NEED, 20);
  assert.equal(monthStamps(st, 2026, 1), 0, '1월이 11월을 세지 않음');
});

t('② 이야기: 도장 1·3·5…30에서 하나씩 열림, 반말·존댓말 조사', () => {
  assert.equal(STORY_STEPS.length, 8);
  assert.equal(newStoryIndex(0, 1), 0); assert.equal(newStoryIndex(1, 2), -1); assert.equal(newStoryIndex(29, 30), 7);
  assert.equal(storiesOpen(0), 0); assert.equal(storiesOpen(14), 6);
  const f = { name: '민준', animal: '말', dayName: '정화(丁火)', dayImage: '촛불', dayText: '따뜻해요.', gyeokName: '상관격', gyeokTitle: '톡톡 튀는 표현의 사람', strengths: ['남다른 아이디어', '말과 글의 표현력'], johu: '처방.', luck: { color: '흰색', direction: '서쪽', item: '금속 시계' }, sinsal: [], stage: '제왕', stageNote: '기운이 가장 왕성함', nextDaewoon: null };
  const c = buildStories(f); const p = buildStories({ ...f, name: '은하' }, true);
  assert.ok(c[1].text.startsWith('민준은 '), c[1].text); assert.ok(c[0].text.includes('촛불이야'));
  assert.ok(c[3].text.includes('금속 시계야'), c[3].text);
  assert.ok(p.filter((x, i) => i !== 2).every((x) => /요[.!]?$/.test(x.text)), JSON.stringify(p.map((x) => x.text)));
  assert.deepEqual(toneProblems(JSON.stringify([c, p])), []);
});

t('① 주간 편지: 해낸 수·가장 좋은 날·부적·운세 적중·다음 주', () => {
  let st = {};
  for (const d of [2, 3, 6]) st = markNote(st, `2026-11-${d}`, `희귀 재물부`).store;
  const w = weeklyLetter({ week: W(D(11, 8)), store: st, name: '은하', animal: '말', nextBest: { date: D(11, 12), keyword: '배움과 귀인' }, fb: { total: 4, yes: 3 } });
  const txt = w.lines.join(' ');
  assert.equal(w.count, 3);
  assert.ok(txt.startsWith('은하야, 이번 주 쪽지를 3번 해냈어.'));
  assert.ok(txt.includes('금요일(11/6)에도 쪽지를 해냈더라'), txt);
  assert.ok(txt.includes('4번 알려 줬지. 그중 3번'));
  assert.ok(txt.includes('다음 주는 목요일(11/12)'));
  const z = weeklyLetter({ week: W(D(11, 8)), store: {}, polite: true });
  assert.ok(z.lines[0].includes('쉬어 가는 주였네요'));
  assert.deepEqual(toneProblems(JSON.stringify([w, z])), []);
});

console.log(`\nnote: ${pass} passed`);
