import assert from 'node:assert/strict';
import { analyzeGyeok, GYEOK_PROFILE, strengthMission, gyeokSummary, qualityOf } from '../js/gyeokguk.js';
import { computeSaju } from '../js/saju.js';
import { toneProblems } from '../js/habit.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const S = (c) => '甲乙丙丁戊己庚辛壬癸'.indexOf(c); const B = (c) => '子丑寅卯辰巳午未申酉戌亥'.indexOf(c);
const chart = (y, m, d, h) => { const p = (x) => (x ? { stem: S(x[0]), branch: B(x[1]) } : null); return { pillars: { year: p(y), month: p(m), day: p(d), hour: p(h) } }; };

t('본기가 드러나면 그 십신: 甲일 酉월 + 천간 辛 → 정관격', () => {
  const g = analyzeGyeok(chart('辛未', '丁酉', '甲子', '丙寅'));
  assert.equal(g.name, '정관격'); assert.equal(g.from, '본기'); assert.equal(g.exposed, true);
  assert.ok(g.basisText.includes('辛(정관)이 천간에 드러나'), g.basisText);
});

t('본기가 안 드러나고 중기가 드러나면 중기: 甲일 寅월은 녹 → 건록격 / 丙일 寅월 + 천간 丙 없음·戊 드러남 → 식신격', () => {
  assert.equal(analyzeGyeok(chart('庚午', '戊寅', '甲子', '丙寅')).name, '건록격');
  // 丙일 寅월: 寅 = 戊(여기)·丙(중기)·甲(본기). 甲 안 드러남, 戊 드러남 → 식신격
  const g = analyzeGyeok(chart('戊辰', '庚寅', '丙午', '己亥'));
  assert.equal(g.name, '식신격'); assert.equal(g.from, '여기');
});

t('아무것도 안 드러나면 본기: 庚일 子월(癸 본기) → 상관격(숨은 격)', () => {
  const g = analyzeGyeok(chart('丙寅', '庚子', '庚辰', '戊寅'));
  assert.equal(g.name, '상관격'); assert.equal(g.exposed, false);
});

t('양인격·월겁격: 甲일 卯월 → 양인격, 乙일 寅월(甲 겁재) → 월겁격', () => {
  assert.equal(analyzeGyeok(chart('壬午', '癸卯', '甲辰', '丙寅')).name, '양인격');
  assert.equal(analyzeGyeok(chart('壬午', '壬寅', '乙丑', '丁丑')).name, '월겁격');
});

t('성격·다듬을 점: 편관격에 식신 → 식신제살(좋음), 정관격에 상관만 → 상관견관(다듬기)', () => {
  assert.equal(qualityOf({ name: '편관격' }, ['식신']).check, '식신제살');
  assert.equal(qualityOf({ name: '정관격' }, ['상관']).quality, 'care');
  assert.equal(qualityOf({ name: '정관격' }, ['상관', '정인']).quality, 'good', '인성이 상관을 막아 줌');
});

t('모든 사람에게 격국 하나, 11종 프로필 모두 있음, 문장에 금지어 없음', () => {
  const seen = new Set();
  for (let y = 1950; y < 2010; y += 3) for (let m = 1; m <= 12; m++) {
    const s = computeSaju({ year: y, month: m, day: 11 + (y % 7), hour: 9 + (m % 9), minute: 0 });
    const g = analyzeGyeok(s);
    assert.ok(GYEOK_PROFILE[g.name], g.name); seen.add(g.name);
    assert.deepEqual(toneProblems(gyeokSummary(g) + g.basisText), []);
    const mt = g.basisText.match(/(.)\)([이가을를]) /); // 「(정재)가」「(정관)이」 받침 조사
    if (mt) { const c = mt[1].charCodeAt(0) - 0xac00; const bat = c % 28 !== 0; assert.equal(["이", "을"].includes(mt[2]), bat, g.basisText); }
  }
  assert.ok(seen.size >= 9, [...seen].join());
  Object.values(GYEOK_PROFILE).forEach((p) => { assert.equal(p.strengths.length, 3); assert.equal(p.missions.length, 3); assert.deepEqual(toneProblems(JSON.stringify(p)), []); });
});

t('강점 미션: 같은 날은 같은 미션', () => {
  const g = { name: '정재격' };
  assert.equal(strengthMission(g, '2026-11-3'), strengthMission(g, '2026-11-3'));
  assert.ok(GYEOK_PROFILE.정재격.missions.includes(strengthMission(g, '2026-11-4')));
});

console.log(`\ngyeokguk: ${pass} passed`);
