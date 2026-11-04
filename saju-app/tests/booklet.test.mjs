import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { yearOf } from '../js/period.js';
import { analyzeGyeok } from '../js/gyeokguk.js';
import { buildBooklet, yearName, FIELD_ORDER, todayLetter, ageLine, ageAction, ageStage, quoteLine, monthLines } from '../js/booklet.js';
import { computeFortune } from '../js/fortune.js';
import { toneProblems } from '../js/habit.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const make = (inp, concern, gender = 'female') => { const s = computeSaju(inp); return buildBooklet({ y: yearOf(s, 2027, gender), thisYear: yearOf(s, 2026, gender), saju: s, gyeok: analyzeGyeok(s), name: '은하', concern, gender }); };

t('그해 이름: 丁未 → 붉은 양의 해', () => { assert.equal(yearName({ stem: 3, branch: 7 }), '丁未년 · 붉은 양의 해'); });

t('총운 7구역(대운 먼저) + 분야 8개(사업·자녀 포함), 고민 분야가 맨 앞', () => {
  const b = make({ year: 1968, month: 4, day: 12, hour: 9, minute: 0 }, 'wealth');
  assert.deepEqual(b.general.map((x) => x.h), ['대운 · 10년 큰 흐름 속의 한 해', '한 해의 기운', '내 사주와 만나는 방식', '타고난 그릇과 올해', '한 해의 모양', '잘 풀리는 점 · 챙길 점', '한 해의 열쇠']);
  assert.equal(b.fields.length, FIELD_ORDER.length); assert.equal(b.fields[0].key, 'wealth'); assert.ok(b.fields[0].focus);
  assert.ok(JSON.stringify(b.general).length > 1000, '총운은 자세히(1,000자 이상)');
  assert.ok(b.general.flatMap((x) => x.paras).join(' ').length < 2000, '총운은 첫 화면에 펼쳐 두므로 2,000자 안쪽(2026-11-03 줄임)');
});

t('가족운: 성별에 따라 육친 자리가 다름, 고민 「인간관계」면 대인운이 맨 앞', () => {
  const inp = { year: 1990, month: 8, day: 3, hour: 14, minute: 0 };
  const f = make(inp, 'people', 'female'); const m = make(inp, 'people', 'male');
  assert.equal(f.fields[0].key, 'social');
  const ff = f.fields.find((x) => x.key === 'family'); const mf = m.fields.find((x) => x.key === 'family');
  assert.ok(ff && mf); assert.equal(ff.paras.length, 4); assert.ok(/^⚠️ 조심할 점/.test(ff.paras[3]));
  assert.ok(/육친으로 보면/.test(ff.paras[1]));
});

t('여러 사람: 금지어 없음, 문장 끝 마침표, 빈 문단·undefined 없음, 같은 입력이면 같은 글', () => {
  for (let y = 1950; y < 2012; y += 7) for (const m of [1, 4, 7, 10]) {
    const inp = { year: y, month: m, day: 9 + (y % 13), hour: 6 + (m % 12), minute: 0 };
    const b = make(inp, 'love', y % 2 ? 'male' : 'female'); const txt = JSON.stringify(b);
    assert.deepEqual(toneProblems(txt), [], txt.slice(0, 200));
    assert.ok(!/undefined|NaN|null/.test(txt), txt);
    [...b.general.flatMap((x) => x.paras), ...b.fields.flatMap((f) => f.paras)].forEach((p) => { assert.ok(p.length > 10, p); assert.ok(/[.!?]$/.test(p), p); });
    assert.equal(JSON.stringify(make(inp, 'love', y % 2 ? 'male' : 'female')), txt);
  }
});

t('오늘의 편지 + 세 가지 질문: 반말·존댓말, 금지어 없음, 질문 3개', () => {
  for (let i = 0; i < 60; i++) {
    const sj = computeSaju({ year: 1960 + i, month: 1 + (i % 12), day: 2 + (i % 25), hour: 8, minute: 0 });
    const f = computeFortune(sj, { year: 2026, month: 11, day: 1 + (i % 28) }, { gender: 'female' });
    const c = todayLetter(f, { name: i % 2 ? '은하' : '민준', animal: '말' }); const p = todayLetter(f, { name: '은하', animal: '닭', polite: true });
    const txt = JSON.stringify([c, p]);
    assert.deepEqual(toneProblems(txt), [], txt);
    assert.ok(!/undefined|NaN/.test(txt));
    assert.equal(c.qa.length, 3);
    assert.ok(!/습니다|합니다/.test(c.qa.map((x) => x.a).join(' ')), '질문 답은 해요체');
    assert.ok(/^(은하야|민준아), /.test(c.lines[0]), c.lines[0]);
    assert.ok(/^은하 님, .*(이에요|예요)\.$/.test(p.lines[0]), p.lines[0]);
    assert.ok(!/에요\.$/.test(c.lines[0]) && !/[^이]에요/.test(p.lines[0].replace('예요', '')), p.lines[0]);
  }
});

t('A2 나이 문장·A3 원국 글자 인용', () => {
  assert.equal(ageStage(17).key, 'teen'); assert.equal(ageStage(25).key, 'young'); assert.equal(ageStage(41).key, 'mid'); assert.equal(ageStage(63).key, 'senior');
  assert.ok(ageLine(17, 'career', '정관').includes('학생') && ageLine(17, 'career', '정관').includes('규칙과 평가'));
  assert.ok(ageLine(45, 'wealth', '정재').includes('30~40대'));
  assert.ok(ageAction(63, '편인').startsWith('50대 이후'));
  // 그해 丁未, 원국 월주 丁卯 → 월주 천간 같음
  const sj = { pillars: { year: { stem: 0, branch: 0 }, month: { stem: 3, branch: 3 }, day: { stem: 6, branch: 6 }, hour: null } };
  assert.ok(quoteLine({ year: { pillar: { stem: 3, branch: 7 } } }, sj).includes('월주'));
  assert.ok(quoteLine({ year: { pillar: { stem: 9, branch: 11 } } }, sj).includes('새 글자'));
});

t('A5 달마다 두 줄: 12달, 좋은 달 3·다지는 달 2 표시, 금지어 없음', () => {
  const s2 = computeSaju({ year: 1990, month: 8, day: 3, hour: 14, minute: 0 });
  const ml = monthLines(yearOf(s2, 2027, 'female'));
  assert.equal(ml.length, 12); assert.equal(ml.filter((m) => m.mark === '🌟').length, 3); assert.equal(ml.filter((m) => m.mark === '🍵').length, 2);
  assert.deepEqual(toneProblems(JSON.stringify(ml)), []); ml.forEach((m) => assert.ok(m.flow.endsWith('.') && m.act.startsWith('할 일:')));
});

console.log(`\nbooklet: ${pass} passed`);
