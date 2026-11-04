import assert from 'node:assert/strict';
import { natalWatch } from '../js/natal.js';
import { computeSaju, STEMS, BRANCHES } from '../js/saju.js';
import { ILJU, buildIlju } from '../js/ilju.js';
import { tenGodProfile, pillarReadings, GOD_GROUPS, personSummary } from '../js/natal.js';
import { analyzeGyeok, GYEOK_PROFILE } from '../js/gyeokguk.js';
import { DAY_MASTER_PROFILE } from '../js/fortune.js';
import { sinsalOf, SINSAL_NOTE } from '../js/expert.js';
import { toneProblems } from '../js/habit.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const people = [];
for (let y = 1950; y < 2010; y += 3) for (const m of [1, 5, 9]) people.push(computeSaju({ year: y, month: m, day: 4 + (y % 23), hour: (y * m) % 24, minute: 10 }));

t('③ 60일주: 60개 모두 서로 다른 모습, 갑자=겨울 강가의 큰 나무, 병오=한낮의 태양', () => {
  assert.equal(ILJU.length, 60); assert.equal(new Set(ILJU.map((x) => x[0])).size, 60);
  assert.equal(ILJU[0][0], '겨울 강가의 큰 나무'); assert.equal(ILJU[42][0], '한낮의 태양'); // 42 = 丙午
  for (const s of people) {
    const j = buildIlju(s);
    assert.equal(j.hanja, `${STEMS[s.pillars.day.stem]}${BRANCHES[s.pillars.day.branch]}`);
    assert.deepEqual(toneProblems(JSON.stringify(j)), []);
  }
});

t('④ 십성 분포: 합계 100 근처, 다섯 무리, 유형 이름', () => {
  for (const s of people) {
    const p = tenGodProfile(s);
    const sum = p.groups.reduce((a, g) => a + g.pct, 0);
    assert.ok(sum >= 98 && sum <= 102, sum); assert.equal(p.groups.length, 5);
    assert.ok(GOD_GROUPS.some((g) => p.type.includes(g.type)));
  }
});

t('⑥ 자리별: 시간 있으면 4자리, 모름이면 3자리, 문장 이상 없음', () => {
  assert.equal(pillarReadings(people[0]).length, 4);
  assert.equal(pillarReadings(computeSaju({ year: 1990, month: 3, day: 3, timeKnown: false })).length, 3);
  for (const s of people) { const txt = JSON.stringify(pillarReadings(s)); assert.ok(!/undefined|null/.test(txt)); assert.deepEqual(toneProblems(txt), []); }
});

t('⑤ 신살 확장: 괴강(庚辰일)·홍염, 뜻은 긍정 문장', () => {
  // 庚辰일 찾기
  let s = null; for (let d = 1; d <= 60 && !s; d++) { const x = computeSaju({ year: 2000, month: 3, day: d, hour: 12, minute: 0 }); if (x.pillars.day.stem === 6 && x.pillars.day.branch === 4) s = x; }
  assert.ok(sinsalOf(s).some((x) => x.name === '괴강살'));
  ['괴강살', '백호살', '귀문관살', '현침살', '홍염살'].forEach((k) => assert.ok(SINSAL_NOTE[k] && toneProblems(SINSAL_NOTE[k]).length === 0));
});

t('A4 한 장 요약: 세 문장, 일주 모습·격국 이름·용신, 이상 없음', () => {
  for (const s of people) {
    const g = analyzeGyeok(s); const j = buildIlju(s);
    const r = personSummary(s, DAY_MASTER_PROFILE[s.dayMaster], j, g, GYEOK_PROFILE[g.name]);
    assert.equal(r.lines.length, 3); assert.ok(r.headline.includes(j.image)); assert.ok(r.lines[1].includes(g.name));
    const txt = JSON.stringify(r); assert.ok(!/undefined|NaN|습니다/.test(txt), txt); assert.deepEqual(toneProblems(txt), []);
  }
});

t('타고난 사주에서 조심할 습관: 모든 사람에게 1~3개, 근거·행동 포함', () => {
  for (let y = 1950; y < 2012; y += 3) for (const m of [1, 5, 9]) {
    const s = computeSaju({ year: y, month: m, day: 1 + (y * 7 + m) % 27, hour: (y + m) % 24, minute: 0 });
    const w = natalWatch(s); assert.ok(w.length >= 1 && w.length <= 3);
    for (const c of w) { assert.ok(c.title && c.text && c.act && c.basis); assert.deepEqual(toneProblems(c.text), []); }
  }
});
console.log(`\nnatal: ${pass} passed`);
