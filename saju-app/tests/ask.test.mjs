import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { computeFortune } from '../js/fortune.js';
import { ASK_MENU, orderedMenu, concernAsk, buildAnswer } from '../js/ask.js';
let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const s = computeSaju({ year: 1998, month: 5, day: 20, timeKnown: false });
const week = Array.from({ length: 7 }, (_, i) => computeFortune(s, { year: 2026, month: 11, day: 1 + i }));

t('메뉴: 질문 10개, 내 고민 질문이 맨 앞', () => {
  assert.equal(ASK_MENU.length, 10);
  assert.equal(orderedMenu('job')[0].key, 'career'); assert.ok(orderedMenu('job')[0].mine);
  assert.equal(orderedMenu('marriage')[0].key, 'love');
  assert.equal(orderedMenu('unknown')[0].key, 'today');
  assert.equal(new Set(orderedMenu('love').map((x) => x.key)).size, 10);
  assert.equal(concernAsk('wealth'), 'wealth');
});
t('답: 점수·풀이·사주 근거·팁·7일 흐름·한 걸음 버튼 하나', () => {
  for (const m of ASK_MENU.filter((x) => !x.go)) {
    const a = buildAnswer(m.key, s, week);
    assert.ok(a.score >= 0 && a.score <= 100, m.key);
    assert.ok(a.text && a.basis.includes('필요한 기운') && a.tip, m.key);
    assert.equal(a.trend.length, 7);
    assert.ok(a.cta.label && a.cta.action, m.key);
  }
  assert.equal(buildAnswer('saju', s, week), null);
});
t('오늘 운세: 가장 약한 운을 짚고, 그 운의 부적으로 연결', () => {
  const a = buildAnswer('today', s, week);
  const f = week[0];
  const min = Math.min(f.scores.wealth, f.scores.love, f.scores.career, f.scores.health, f.scores.social);
  assert.equal(a.weak.score, min);
  assert.equal(a.cta.action, 'charm'); assert.ok(a.cta.label.includes(a.weak.label));
});
t('내일 운세: 내일 점수를 쓰고, 가장 좋은 날은 내일 이후에서 고름', () => {
  const a = buildAnswer('tomorrow', s, week);
  assert.equal(a.score, week[1].scores.total); assert.equal(a.when, '내일');
  assert.notEqual(a.best.short, '오늘');
  assert.equal(a.trend[0].short, '오늘'); assert.equal(a.trend[1].short, '내일');
});
t('건강 팁에는 병원 안내, 재물 답은 단정하지 않음', () => {
  assert.ok(buildAnswer('health', s, week).tip.includes('병원'));
  assert.ok(!/투자하세요|사세요/.test(buildAnswer('wealth', s, week).tip));
});
t('점수 문구는 운세 엔진 기준(80/60/40)과 같음', () => {
  const a = buildAnswer('love', s, week);
  const want = a.score >= 80 ? '아주 좋아요' : a.score >= 60 ? '좋은 편이에요' : a.score >= 40 ? '무난해요' : '쉬어 가는 날이에요';
  assert.equal(a.tone, want);
});
console.log(`\n${pass} passed`);
