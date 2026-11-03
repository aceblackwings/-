import assert from 'node:assert/strict';
import { branchPair, stemPair, analyzeHwa, natalRelations, incomingRelations, REL_INFO } from '../js/relations.js';
import { computeSaju } from '../js/saju.js';
import { toneProblems } from '../js/habit.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const B = (c) => '子丑寅卯辰巳午未申酉戌亥'.indexOf(c); const S = (c) => '甲乙丙丁戊己庚辛壬癸'.indexOf(c);
const P = (y, m, d, h) => { const p = (x) => (x ? { stem: S(x[0]), branch: B(x[1]) } : null); return { year: p(y), month: p(m), day: p(d), hour: p(h) }; };

t('지지 관계: 육합·충·형·자형·파·해·원진·반합', () => {
  assert.deepEqual(branchPair(B('子'), B('丑')), ['sixCombine']);
  assert.ok(branchPair(B('子'), B('午')).includes('clash'));
  assert.ok(branchPair(B('寅'), B('巳')).includes('punish') && branchPair(B('寅'), B('巳')).includes('harm'));
  assert.ok(branchPair(B('子'), B('卯')).includes('punish'));
  assert.deepEqual(branchPair(B('辰'), B('辰')), ['selfPunish']);
  assert.ok(branchPair(B('子'), B('酉')).includes('break'));
  assert.ok(branchPair(B('子'), B('未')).includes('wonjin') && branchPair(B('子'), B('未')).includes('harm'));
  assert.ok(branchPair(B('申'), B('子')).includes('half')); assert.ok(!branchPair(B('申'), B('辰')).includes('half'), '왕지 없는 두 글자는 반합 아님');
});

t('천간 관계: 甲己합, 甲庚충', () => {
  assert.deepEqual(stemPair(S('甲'), S('己')), ['stemCombine']); assert.deepEqual(stemPair(S('庚'), S('甲')), ['stemClash']);
});

t('합화: 이웃 천간 합 + 월지 본기 오행 같으면 바뀜, 일간이 끼면 일간은 그대로', () => {
  // 甲(연)·己(월) 합토, 월지 辰(토) → 합화
  const h = analyzeHwa(P('甲子', '己辰', '丙寅', '戊子'));
  assert.deepEqual(h.stemEl, { year: 2, month: 2 }); assert.ok(h.list[0].ok);
  // 월지 卯(목)이면 합이불화
  const n = analyzeHwa(P('甲子', '己卯', '丙寅', '戊子'));
  assert.deepEqual(n.stemEl, {}); assert.ok(n.list[0].text.includes('합이불화'));
  // 월·일 합은 일간 그대로
  const d = analyzeHwa(P('丙子', '甲辰', '己丑', '戊辰'));
  assert.deepEqual(d.stemEl, {}); assert.ok(d.list[0].dayIn);
  // 합화되면 오행 비율이 그렇게 반영됨
  const s = computeSaju({ year: 1984, month: 4, day: 20, hour: 9, minute: 0 });
  assert.ok(Array.isArray(s.hwa));
});

t('원국 관계: 삼합이면 반합은 겹치지 않게, 문장에 조사 오류 없음·금지어 없음', () => {
  const r = natalRelations(P('庚申', '丙辰', '壬子', '甲辰'));
  assert.equal(r[0].kind, 'triple'); assert.ok(!r.some((x) => x.kind === 'half'));
  for (let y = 1950; y < 2010; y += 2) for (const m of [1, 5, 9]) {
    const s = computeSaju({ year: y, month: m, day: 3 + (y % 25), hour: (y * m) % 24, minute: 10 });
    const all = [...natalRelations(s.pillars), ...incomingRelations(s.pillars, { stem: (y + m) % 10, branch: (y * 3) % 12 }), ...s.hwa];
    const txt = JSON.stringify(all);
    assert.deepEqual(toneProblems(txt), []);
    assert.ok(!/(甲|丙|丁|庚|辛|壬|乙)와 |(戊|己|癸)과 /.test(txt), '천간 와/과');
    assert.ok(!/(丑|寅|辰|申|戌)가 |(子|卯|巳|午|未|酉|亥)이 /.test(txt), '지지 이/가');
  }
});

t('들어오는 기운: 일지 관계가 맨 앞, 모든 관계에 행동 문장', () => {
  const r = incomingRelations(P('庚申', '丙辰', '壬子', '甲辰'), { stem: S('丁'), branch: B('未') });
  assert.equal(r[0].at, 'day');
  r.forEach((x) => assert.ok(x.act.endsWith('.') && x.act.length > 8));
  Object.values(REL_INFO).forEach((x) => assert.ok(x.mean && x.act));
});

console.log(`\nrelations: ${pass} passed`);
