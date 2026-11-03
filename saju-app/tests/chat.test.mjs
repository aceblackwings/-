import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { computeFortune } from '../js/fortune.js';
import { PERSONALITIES } from '../js/personality.js';
import { isCrisis, crisisReply, buildInstructions, buildMessages, offlineReply, emptyMemory, normalizeMemory, redact, rememberTurn, memoryDigest, needsSummary, buildSummaryMessages, applySummary, memoryForPrompt, followUp, MEMORY_MAX_NOTES, MEMORY_SUMMARY_MAX } from '../js/chat.js';
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
t('기억: 개인정보는 지우고 저장', () => {
  const r = redact('1998년 5월 20일생이고 010-1234-5678, a.b@x.com, 980520-1234567');
  ['1998', '010', '@', '1234567'].forEach((w) => assert.ok(!r.includes(w), w));
  const m = rememberTurn(emptyMemory(), '면접이 2026-11-10인데 떨려', '2026-11-3');
  assert.equal(m.topics.work, 1); assert.equal(m.notes.length, 1); assert.ok(!m.notes[0].text.includes('2026'));
});
t('기억: 위기 대화는 남기지 않고, 메모는 최대 개수 유지', () => {
  const m0 = rememberTurn(emptyMemory(), '죽고 싶어', '2026-11-3');
  assert.equal(m0.turns, 0); assert.equal(m0.notes.length, 0);
  let m = emptyMemory();
  for (let i = 0; i < 10; i++) m = rememberTurn(m, `회사 일 고민 ${i}번째`, '2026-11-3');
  assert.equal(m.notes.length, MEMORY_MAX_NOTES); assert.equal(m.topics.work, 10);
  assert.ok(needsSummary(m)); assert.ok(memoryDigest(m).includes('일·공부(10번)'));
});
t('기억: 요약 반영·길이 제한·지시문 포함', () => {
  let m = rememberTurn(emptyMemory(), '연애 고민 있어', '2026-11-1');
  const msgs = buildSummaryMessages(m, [{ role: 'user', text: '내 번호 010-1111-2222야' }], '호랑이');
  assert.equal(msgs[0].role, 'user'); assert.ok(!msgs[0].content.includes('010-1111')); assert.ok(msgs[0].content.includes('개인정보'));
  m = applySummary(m, `- 썸 타는 사람이 있음\n- 고백 고민 중\n- 셋째 줄\n- 넷째 줄 ${'가'.repeat(400)}`);
  assert.ok(m.summary.split('\n').length <= 3 && m.summary.length <= MEMORY_SUMMARY_MAX); assert.ok(!needsSummary(m));
  const ins = buildInstructions({ ...ctx, memory: memoryForPrompt(m) });
  assert.ok(ins.includes('수호신의 기억') && ins.includes('고백 고민'));
  assert.ok(!buildInstructions(ctx).includes('수호신의 기억'));
});
t('기억: 지난 메모로 먼저 안부 (오늘·14일 초과는 제외)', () => {
  const m = rememberTurn(emptyMemory(), '내일 면접 있어', '2026-11-2');
  assert.ok(followUp(m, '2026-11-3').startsWith('어제'));
  assert.equal(followUp(m, '2026-11-2'), '');
  assert.equal(followUp(m, '2026-11-30'), '');
  assert.equal(followUp(m, '2026-11-3', 'love'), '');
  assert.ok(offlineReply({ ...ctx, recall: followUp(m, '2026-11-5', 'work') }, '면접 준비 어떻게 해').includes('3일 전에'));
  assert.deepEqual(normalizeMemory('망가진값'), emptyMemory());
});
console.log(`\n${pass} passed`);
