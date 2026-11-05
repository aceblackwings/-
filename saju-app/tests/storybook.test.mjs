// 이야기로 읽는 사주(v0.50): 본문에 한자·사주 용어가 없고, 조사·금지어 문제 없고, 같은 문장이 반복되지 않음 · 오늘의 이야기
import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { yearOf } from '../js/period.js';
import { analyzeGyeok } from '../js/gyeokguk.js';
import { computeDaewoon } from '../js/luck.js';
import { computeFortune } from '../js/fortune.js';
import { fiveScores } from '../js/todayfive.js';
import { buildPremiumYear, buildLifeReport } from '../js/premium.js';
import { plainText, GOD_TALE, TODAY_TALE, EL_TALE } from '../js/storybook.js';
import { todayStory, setEmpathy, empathyRate } from '../js/todaystory.js';
import { josaProblems } from '../js/josa.js';
import { toneProblems } from '../js/habit.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const HANJA = /[㐀-鿿]/;
const JARGON = /(?<![가-힣])(편관|정관|식신|상관|겁재|비견|편재|정재|편인|정인|용신|희신|기신|대운|세운|천간|지지|일간|일지|공망|원진|비겁|식상|관성|재성|십신|지장간)(?![가-힣]*없)/;
const clean = (x) => String(x).replace(/편인(?=데|가|지|\s?(?:하루|날|해|달))/g, '').replace(/세운(?=\s?(?:계획|다짐|목표|약속))/g, '');
const PEOPLE = [
  [1992, 5, 14, 9, 30], [1975, 11, 2, 22, 10], [2001, 2, 28, 3, 0], [1964, 8, 19, 13, 45], [1988, 1, 7, 6, 20], [1999, 7, 23, 18, 5],
  [1983, 10, 11, 11, 40], [2008, 4, 3, 15, 15], [1958, 12, 25, 0, 30], [1995, 9, 9, 21, 0], [1970, 3, 17, 8, 50], [2012, 6, 1, 12, 0],
].map(([year, month, day, hour, minute], i) => ({ s: computeSaju({ year, month, day, hour, minute }), g: i % 2 ? 'male' : 'female' }));
const reports = (p) => [
  buildPremiumYear({ y: yearOf(p.s, 2027, p.g), thisYear: yearOf(p.s, 2026, p.g), saju: p.s, gyeok: analyzeGyeok(p.s), name: '은하', gender: p.g, concern: 'money' }),
  buildPremiumYear({ y: yearOf(p.s, 2028, p.g), thisYear: yearOf(p.s, 2027, p.g), saju: p.s, gyeok: analyzeGyeok(p.s), name: '', gender: p.g }),
  buildLifeReport({ saju: p.s, gyeok: analyzeGyeok(p.s), daewoon: computeDaewoon(p.s, p.g), name: '은하', gender: p.g, nowYear: 2026 }),
];
const mainText = (r) => r.sections.filter((s) => !s.appendix).flatMap((s) => [s.h, s.intro || '', ...s.blocks.flatMap((b) => [b.h || '', ...b.paras])]);

t('쉬운 말 바꾸기: 한자 → 한글 · 오행 → 나무·불·흙·쇠·물 · 조사 맞춤', () => {
  assert.equal(plainText('가장 필요한 기운은 土(토)예요.'), '가장 필요한 기운은 흙이에요.');
  assert.equal(plainText('입춘부터 壬寅의 달'), '입춘부터 임인의 달');
  assert.equal(plainText('金(금)이 많으면'), '쇠가 많으면');
  assert.equal(plainText('상관없이 괜찮아요'), '상관없이 괜찮아요');
  assert.match(plainText('그해 지지 未는 내 일주의 공망(空亡, 비어 있는 자리)이에요.'), /비어 있는 자리예요/);
});
t('상세판·정통사주 본문: 한자·사주 용어 없음 · 조사·금지어 문제 없음 · 부록은 따로', () => {
  for (const p of PEOPLE) for (const r of reports(p)) {
    const lines = mainText(r);
    for (const x of lines) {
      assert.ok(!HANJA.test(x), `${r.kind} 한자: ${x}`);
      assert.ok(!JARGON.test(clean(x)), `${r.kind} 용어: ${clean(x).match(JARGON)?.[0]} | ${x}`);
    }
    const all = lines.join('\n');
    assert.deepEqual(josaProblems(all).map((x) => `${x.why} | ${x.text}`), [], `${r.kind} 조사`);
    assert.deepEqual(toneProblems(all), []);
    assert.ok(r.sections.some((s) => s.appendix), '부록이 있음');
  }
});
t('본문 핵심 장: 위험·피할 일·인연·사업 분야·이겨 내는 법·요즘 힘든 이유가 모두 있음', () => {
  for (const p of PEOPLE.slice(0, 6)) {
    const [y, , life] = reports(p);
    for (const k of ['wind', 'why', 'risk', 'people', 'money', 'fix', 'months', 'fields', 'close']) assert.ok(y.sections.some((s) => s.key === k), `상세판 ${k}`);
    for (const k of ['me', 'hard', 'risk', 'people', 'body', 'work', 'fix']) assert.ok(life.sections.some((s) => s.key === k), `정통사주 ${k}`);
    const money = y.sections.find((s) => s.key === 'money').blocks.flatMap((b) => b.paras).join(' ');
    assert.ok((money.match(/· /g) || []).length >= 6, '사업 분야 6개 이상');
  }
});
t('같은 문장이 한 권 안에서 두 번 나오지 않음(20자 이상)', () => {
  for (const p of PEOPLE) for (const r of reports(p)) {
    const seen = new Map();
    for (const x of r.sections.flatMap((s) => s.blocks.flatMap((b) => b.paras))) for (const sen of x.split(/(?<=[.!?요])\s+/)) {
      const k = sen.replace(/\s+/g, ''); if (k.length < 20) continue;
      assert.ok(!seen.has(k), `${r.kind} 반복: ${sen}`); seen.set(k, 1);
    }
  }
});
t('문장 묶음: 십신 10 · 오행 5가 빠짐없이 채워짐', () => {
  for (const g of Object.keys(TODAY_TALE)) {
    const G = GOD_TALE[g]; assert.ok(G.feel && G.why && G.risk.length >= 2 && G.avoid.length >= 2 && G.fix.length >= 3 && G.people && G.work && G.goal, g);
    const T = TODAY_TALE[g]; assert.ok(T.head && T.good && T.watch && T.think.endsWith('?') && T.do.length === 2, g);
  }
  for (const E of EL_TALE) assert.ok(E.biz.length === 6 && E.bring.length >= 4 && E.lack && E.nature);
  const text = JSON.stringify([GOD_TALE, TODAY_TALE, EL_TALE]);
  assert.deepEqual(toneProblems(text), []);
});
t('오늘의 이야기: 좋은 점·조심할 점·생각해 볼 것·할 일 2개 · 한자 없음 · 조사 맞음 (60일 × 4명)', () => {
  for (const p of PEOPLE.slice(0, 4)) for (let d = 0; d < 60; d++) {
    const date = { year: 2026, month: 11 + Math.floor(d / 30), day: (d % 30) + 1 }; if (date.month > 12) { date.year++; date.month -= 12; }
    const f = computeFortune(p.s, date, { gender: p.g }); const x = todayStory(f, p.s, fiveScores(f));
    assert.ok(x.head && x.why && x.good && x.watch && x.think && x.act.length === 2 && x.lucky);
    const n = x.story.split(/(?<=[.!?요])\s+/).length; assert.ok(n >= 4 && n <= 6, `오늘의 한 편 ${n}문장`);
    const all = [x.head, x.mood, x.story, x.why, x.good, x.watch, x.think, ...x.act, x.lucky, x.low].join(' ');
    assert.ok(!HANJA.test(all), all); assert.ok(!JARGON.test(clean(all)), all);
    assert.deepEqual(josaProblems(all), []); assert.deepEqual(toneProblems(all), []);
  }
});
t('공감 기록: 날짜별 저장 · 40일만 · 비율', () => {
  let st = {}; for (let i = 1; i <= 45; i++) st = setEmpathy(st, `2026-${i <= 30 ? 10 : 11}-${i <= 30 ? i : i - 30}`, i % 3 ? 'yes' : 'meh');
  assert.equal(Object.keys(st).length, 40); assert.ok(st['2026-11-15']); assert.ok(!st['2026-10-1']);
  assert.equal(empathyRate({ a: 'yes', b: 'meh' }), 50);
});
console.log(`storybook: ${pass} passed`);
