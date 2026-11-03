import assert from 'node:assert/strict';
import { hourPillars, guessHours, hourClock, HOUR_QUESTIONS } from '../js/hourguess.js';
import { computeSaju, dayPillarIndex } from '../js/saju.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };

t('시주 천간(오자둔): 甲일 子시 = 甲子, 乙일 子시 = 丙子, 엔진과 같음', () => {
  assert.equal(hourPillars(0)[0].stem, 0); assert.equal(hourPillars(1)[0].stem, 2);
  let d = 1; while (dayPillarIndex(2000, 1, d) % 10 !== 0) d++;
  const s = computeSaju({ year: 2000, month: 1, day: d, hour: 12, minute: 30 });
  assert.equal(hourPillars(0)[6].stem, s.pillars.hour.stem);
});

t('후보 3개, 답과 맞는 시진이 위로, 시계 시각은 경도 보정 뒤 그 시진', () => {
  assert.equal(HOUR_QUESTIONS.length, 3);
  const r = guessHours(0, [3, 3, 3]); // 甲일, 관성(金) 답 → 庚·辛 시주
  assert.equal(r.length, 3); assert.ok(['편관', '정관'].includes(r[0].god), r[0].god);
  for (const b of [0, 1, 6, 11]) {
    const [h, m] = hourClock(b).split(':').map(Number);
    const s = computeSaju({ year: 2000, month: 1, day: 10, hour: h, minute: m });
    assert.equal(s.pillars.hour.branch, b);
  }
});

console.log(`\nhourguess: ${pass} passed`);
