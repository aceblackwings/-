import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { computeFortune } from '../js/fortune.js';
import { PERSONALITIES } from '../js/personality.js';
import { isCrisis, crisisReply, buildInstructions, buildMessages, offlineReply } from '../js/chat.js';
import { festivalStatus } from '../js/festivals.js';
let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const s = computeSaju({ year: 1998, month: 5, day: 20, timeKnown: false });
const f = computeFortune(s, { year: 2026, month: 11, day: 1 });
const ctx = { pers: PERSONALITIES[2], zodiacName: '호랑이', stage: 2, stageName: '견습 수호령', userName: '은하', dayMaster: '丁(화)', yongsin: s.yongsin, weakest: s.weakest, strength: s.strength, fortune: f, concern: '취업', journeyStep: '내 강점 3가지 적기', daewoon: null, luckIndex: 30 };
t('위기 신호는 AI 대신 고정 안내 + 109', () => {
  assert.ok(isCrisis('요즘 죽고 싶어')); assert.ok(isCrisis('자 해 하고 싶')); assert.ok(!isCrisis('취업 고민'));
  assert.ok(crisisReply('은하').includes('109'));
});
t('지시문에 띠 말투·사주·안전 규칙 포함', () => {
  const ins = buildInstructions(ctx);
  ['어흥', '용신', '취업', '109', '투자'].forEach((w) => assert.ok(ins.includes(w), w));
});
t('메시지는 user로 시작·끝나고 역할이 번갈아 나옴', () => {
  const hist = [{ role: 'guardian', text: '안녕' }, { role: 'user', text: '면접 걱정돼' }, { role: 'guardian', text: '괜찮아' }];
  const m = buildMessages('INS', hist, '오늘 운세?');
  assert.equal(m[0].role, 'user'); assert.equal(m[m.length - 1].role, 'user');
  for (let i = 1; i < m.length; i++) assert.notEqual(m[i].role, m[i - 1].role);
  assert.equal(buildMessages('INS', [], 'hi').length, 1);
});
t('오프라인 답변: 의도별 사주 근거 + 말버릇', () => {
  const r = offlineReply(ctx, '면접이 내일인데 떨려');
  assert.ok(r.includes('직장·학업운') && r.includes('어흥'));
  assert.ok(offlineReply(ctx, '코인 사도 될까').includes('전문가'));
});
t('축제: 2026-11-07 입동은 진행 중, 11-01은 D-6', () => {
  assert.equal(festivalStatus({ year: 2026, month: 11, day: 7 }).active.name, '입동');
  const st = festivalStatus({ year: 2026, month: 11, day: 1 }); assert.equal(st.active, null); assert.equal(st.daysToNext, 6);
});
console.log(`\n${pass} passed`);
