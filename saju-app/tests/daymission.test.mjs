import assert from 'node:assert/strict';
import { buildMissions, markDone, allDone, claimBonus, ROTATION, DM_KEEP_DAYS } from '../js/daymission.js';
import { GUIDE_STEPS } from '../js/guide.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const month = { term: '입동', start: { month: 11, day: 7 }, end: { month: 12, day: 6 }, theme: '배움과 귀인', best: [{ date: { month: 11, day: 12 }, score: 81 }] };
const base = { dateKey: '2026-11-2', month, today: { mission: '물 한 잔 천천히 마시기', score: 64 }, pending: null, discovery: GUIDE_STEPS[1], nextYear: 2027, progress: { done: 1, total: 11 }, actDone: false, state: {} };

t('항상 3가지: 이달의 실천 · 돌아보기 · 새 기능 열기', () => {
  const ms = buildMissions(base);
  assert.deepEqual(ms.map((m) => m.key), ['act', 'check', 'open']);
  assert.ok(ms[0].tag.includes('입동 11/7~12/6'), '이달 절입일 기간 표기');
  assert.equal(ms[0].title, '물 한 잔 천천히 마시기');
  assert.ok(ms[0].desc.includes('배움과 귀인'));
  assert.equal(ms[2].tag, '새 기능 열기 · 2/11');
  assert.equal(ms[2].action.type, 'guide'); assert.equal(ms[2].action.key, 'week');
});

t('어제 기록이 있으면 ②는 「어제 운세 맞았나요?」', () => {
  const ms = buildMissions({ ...base, pending: { dateKey: '2026-11-1', title: '귀인을 만나는 날', score: 72 } });
  assert.equal(ms[1].action.type, 'feedback'); assert.ok(ms[1].desc.includes('11/1'));
});

t('어제 기록이 없으면 ②는 날마다 이달 좋은 날 / 오늘 근거를 번갈아', () => {
  const a = buildMissions({ ...base, dateKey: '2026-11-2' })[1].action.type;
  const b = buildMissions({ ...base, dateKey: '2026-11-3' })[1].action.type;
  assert.notEqual(a, b);
  assert.ok(['open-month', 'why'].includes(a) && ['open-month', 'why'].includes(b));
});

t('기능을 다 열면 ③은 신수 카드·상담·질문·기록함을 번갈아', () => {
  const seen = new Set();
  for (let d = 1; d <= 8; d++) seen.add(buildMissions({ ...base, dateKey: `2026-11-${d}`, discovery: null })[2].action.tab);
  assert.equal(seen.size, ROTATION.length);
});

t('완료 저장: 중복 없음, ①은 따로 관리, 14일만 보관, 다 하면 보너스 한 번', () => {
  let s = {};
  let r = markDone(s, '2026-11-2', 'check'); assert.ok(r.changed); s = r.store;
  assert.equal(markDone(s, '2026-11-2', 'check').changed, false);
  assert.equal(markDone(s, '2026-11-2', 'act').changed, false, '①은 액땜 저장소');
  s = markDone(s, '2026-11-2', 'open').store;
  const ms = buildMissions({ ...base, actDone: true, state: s['2026-11-2'] });
  assert.ok(allDone(ms));
  r = claimBonus(s, '2026-11-2'); assert.ok(r.changed); s = r.store;
  assert.equal(claimBonus(s, '2026-11-2').changed, false);
  for (let d = 1; d <= 20; d++) s = markDone(s, `2026-12-${d}`, 'check').store;
  assert.equal(Object.keys(s).length, DM_KEEP_DAYS);
});

t('③을 끝낸 날은 다음 단계가 아니라 오늘 연 기능을 그대로 보여 줌', () => {
  const s = markDone({}, '2026-11-2', 'open', 'next').store;
  const ms = buildMissions({ ...base, discovery: GUIDE_STEPS[1], steps: GUIDE_STEPS, progress: { done: 1, total: 11 }, state: s['2026-11-2'] });
  assert.equal(ms[2].title, '2027년 운세 펼쳐 보기'); assert.equal(ms[2].tag, '새 기능 열기 · 1/11'); assert.ok(ms[2].done);
  const r = markDone({}, '2026-11-2', 'open', 'chat').store;
  assert.equal(buildMissions({ ...base, discovery: null, state: r['2026-11-2'] })[2].title, ROTATION.find((x) => x.key === 'chat').title);
});

t('12월에 올해 다짐이 있으면 ②는 다짐 돌아보기가 먼저', () => {
  const ms = buildMissions({ ...base, pledgeReview: { year: 2026, text: '매일 걷기' }, pending: { dateKey: '2026-12-1', title: 'x', score: 60 } });
  assert.equal(ms[1].action.type, 'pledge'); assert.ok(ms[1].desc.includes('매일 걷기'));
});

console.log(`${pass} passed`);
