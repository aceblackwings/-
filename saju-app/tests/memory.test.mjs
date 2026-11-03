import assert from 'node:assert/strict';
import { extractMemories, mergeMemory, emptyMemory, memoryLines, followUp, markAsked, recallFor, forget, forgetAll, needsSummary, applySummary, summaryMessages, offlineSummary, isSensitive, addDays, describe, MEMORY_LIMIT, SUMMARY_EVERY } from '../js/memory.js';
import { buildInstructions, offlineReply } from '../js/chat.js';
import { computeSaju } from '../js/saju.js';
import { computeFortune } from '../js/fortune.js';
import { PERSONALITIES } from '../js/personality.js';
let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const D = '2026-11-1';

t('날짜 계산: 월말·연말 넘김', () => {
  assert.equal(addDays('2026-10-31', 1), '2026-11-1');
  assert.equal(addDays('2026-12-31', 1), '2027-1-1');
});
t('일정 추출: "내일 면접" → 다음 날 예정', () => {
  const m = extractMemories('나 내일 면접 있어 너무 떨려', D);
  const ev = m.find((x) => x.kind === 'event');
  assert.equal(ev.label, '면접'); assert.equal(ev.due, '2026-11-2');
  assert.ok(m.some((x) => x.key === 'topic:job'));
});
t('주말 일정: 일요일(11/1) 기준 주말은 오늘', () => {
  assert.equal(extractMemories('주말에 데이트해', D).find((x) => x.kind === 'event').due, D);
  assert.equal(extractMemories('주말에 데이트해', '2026-11-4').find((x) => x.kind === 'event').due, '2026-11-7');
});
t('사람·좋아하는 것 추출', () => {
  const m = extractMemories('엄마랑 싸웠어. 나 떡볶이 진짜 좋아해', D);
  assert.ok(m.some((x) => x.key === 'person:엄마'));
  assert.ok(m.some((x) => x.key === 'like:떡볶이'));
});
t('민감 정보·위기 문장은 기억하지 않음', () => {
  assert.ok(isSensitive('내 번호 010-1234-5678')); assert.ok(isSensitive('1998년 5월 20일생'));
  assert.equal(extractMemories('내일 면접인데 번호 010-1234-5678로 연락와', D).length, 0);
  assert.equal(extractMemories('내일 시험인데 죽고 싶어', D).length, 0);
});
t('합치기: 같은 기억은 횟수 증가, 한도 유지', () => {
  let mem = emptyMemory();
  mem = mergeMemory(mem, extractMemories('연애 고민', D), D);
  mem = mergeMemory(mem, extractMemories('썸 타는 중', '2026-11-2'), '2026-11-2');
  assert.equal(mem.items.find((x) => x.key === 'topic:love').count, 2);
  const many = Array.from({ length: 20 }, (_, i) => ({ kind: 'like', key: `like:x${i}`, label: `x${i}`, text: 'x' }));
  assert.equal(mergeMemory(mem, many, D).items.length, MEMORY_LIMIT);
  assert.equal(mergeMemory({ ...mem, on: false }, many, D).items.length, mem.items.length);
});
t('지난 일정 안부: 다음 날 "어제 면접은 어땠어?" 한 번만', () => {
  let mem = mergeMemory(emptyMemory(), extractMemories('내일 면접 있어', D), D);
  assert.equal(followUp(mem, D), null);
  const today = followUp(mem, '2026-11-2'); assert.ok(today.text.includes('오늘 면접이'));
  mem = markAsked(mem, today.mark);
  const fu = followUp(mem, '2026-11-3');
  assert.ok(fu.text.startsWith('어제 면접은 어땠어'));
  mem = markAsked(mem, fu.mark);
  assert.equal(followUp(mem, '2026-11-3'), null);
  assert.equal(describe(mem.items.find((x) => x.kind === 'event'), '2026-11-3'), '어제 면접이 있었음');
});
t('예전에 말한 주제면 "지난번에도"', () => {
  const mem = mergeMemory(emptyMemory(), extractMemories('연애가 어려워', D), D);
  assert.equal(recallFor(mem, '고백할까?', D), null); // 같은 날은 생략
  assert.ok(recallFor(mem, '고백할까?', '2026-11-5').includes('연애'));
});
t('지우기·모두 잊기', () => {
  const mem = mergeMemory(emptyMemory(), extractMemories('엄마 생일이 내일이야', D), D);
  const id = mem.items[0].id;
  assert.equal(forget(mem, id).items.length, mem.items.length - 1);
  const off = forgetAll({ ...mem, on: false });
  assert.equal(off.items.length, 0); assert.equal(off.on, false);
});
t('요약 주기와 요약 요청', () => {
  assert.ok(!needsSummary({ pending: SUMMARY_EVERY - 2 })); assert.ok(needsSummary({ pending: SUMMARY_EVERY }));
  assert.equal(applySummary({ pending: 10 }, '요약').pending, 0);
  const msg = summaryMessages('', [{ role: 'user', text: '내 번호 010-1111-2222' }, { role: 'user', text: '시험 걱정돼' }])[0].content;
  assert.ok(!msg.includes('010-1111') && msg.includes('시험 걱정돼') && msg.includes('개인정보'));
  const s = offlineSummary(emptyMemory(), [{ role: 'user', text: '내일 시험이라 불안해' }], D);
  assert.ok(s.includes('공부·시험') && s.includes('11/2 시험') && s.length <= 120);
});
t('지시문·오프라인 답변에 기억 반영', () => {
  const sj = computeSaju({ year: 1998, month: 5, day: 20, timeKnown: false });
  const f = computeFortune(sj, { year: 2026, month: 11, day: 1 });
  const mem = mergeMemory(emptyMemory(), extractMemories('내일 면접 있어', D), D);
  const ctx = { pers: PERSONALITIES[2], zodiacName: '호랑이', stage: 2, stageName: '견습', userName: '은하', dayMaster: '丁(화)', yongsin: sj.yongsin, weakest: sj.weakest, strength: sj.strength, fortune: f, concern: '취업', journeyStep: '강점 적기', daewoon: null, luckIndex: 30, memory: memoryLines(mem, D) };
  assert.ok(buildInstructions(ctx).includes('내일 면접 예정'));
  assert.ok(!buildInstructions({ ...ctx, memory: [] }).includes('수호신의 기억'));
  assert.ok(offlineReply({ ...ctx, followUp: '어제 면접은 어땠어?' }, '오늘 운세').startsWith('어제 면접은 어땠어?'));
});
console.log(`\n${pass} passed`);
