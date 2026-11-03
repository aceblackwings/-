import assert from 'node:assert/strict';
import { JOHU_TABLE, johuStems, stemForElement, johuSentence, STEM_IMAGE, MONTH_SEASON } from '../js/johu.js';
import { analyzeJohu, analyzeStrength, computeSaju, TABLE_MILD } from '../js/saju.js';
import { buildVerifySet, sheetCSV, parseAnswers, compare, engineAnswers, calibrate, elementOf, gyeokOf } from '../js/verify.js';
import { toneProblems } from '../js/habit.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const S = (c) => '甲乙丙丁戊己庚辛壬癸'.indexOf(c);

t('120칸 모두 채워짐, 글자는 0~9', () => {
  assert.equal(JOHU_TABLE.length, 10);
  JOHU_TABLE.forEach((row) => { assert.equal(row.length, 12); row.forEach((c) => { assert.ok(c.length >= 1); c.forEach((s) => assert.ok(s >= 0 && s <= 9)); }); });
  assert.equal(STEM_IMAGE.length, 10); assert.equal(MONTH_SEASON.length, 12);
});

t('대표 칸 확인: 午월 庚 → 壬癸, 子월 甲 → 丁, 卯월 甲 → 庚 먼저, 寅월 丙 → 壬', () => {
  assert.deepEqual(johuStems(S('庚'), 6), [S('壬'), S('癸')]);
  assert.equal(johuStems(S('甲'), 0)[0], S('丁'));
  assert.equal(johuStems(S('甲'), 3)[0], S('庚'));
  assert.equal(johuStems(S('丙'), 2)[0], S('壬'));
});

t('한여름 庚금: 기온 규칙(물)은 그대로, 글자는 표의 壬수', () => {
  assert.equal(stemForElement(S('庚'), 6, 4), S('壬'));
  const j = analyzeJohu(6, [25, 40, 10, 15, 10], S('庚'), [S('丙')]);
  assert.equal(j.level, 'urgent'); assert.equal(j.need, 4); assert.equal(j.stem, S('壬'));
  assert.ok(j.table.includes('壬수(큰 강물)'), j.table);
});

t('봄·가을도 처방: 卯월 甲목, 쇠(金) 5% → 조후표 보완(희신 金)', () => {
  const j = analyzeJohu(3, [45, 20, 20, 5, 10], S('甲'), [S('乙')]);
  assert.equal(j.level, 'mild'); assert.equal(j.need, 3); assert.equal(j.source, 'table');
  assert.ok(j.text.includes('庚금(단단한 바위·쇠)'), j.text);
  const r = analyzeStrength(S('甲'), [45, 20, 20, 5, 10], 3, [S('乙')]);
  assert.equal(r.yongsinBasis === '억부·조후 일치' || r.heesin === 3, true);
});

t('처방 오행이 충분하면 보완 없음, 천간에 이미 있으면 「드러나 있어」', () => {
  const j = analyzeJohu(3, [30, 20, 20, 20, 10], S('甲'), [S('庚')]);
  assert.equal(j.level, 'none'); assert.equal(j.present, true);
  assert.ok(j.table.includes('이미 드러나'));
});

t('일간을 안 넘기면 예전 v0.29 결과와 같음(하위 호환)', () => {
  assert.equal(analyzeJohu(3, [40, 0, 20, 20, 20]).level, 'none');
  assert.equal(analyzeJohu(3, [40, 0, 20, 20, 20]).stem, undefined);
});

t('조후 문장 120개에 금지어 없음, 받침 조사 자연스러움', () => {
  for (let d = 0; d < 10; d++) for (let m = 0; m < 12; m++) {
    const s = johuSentence(d, m);
    assert.deepEqual(toneProblems(s), [], s);
    assert.ok(!/목가|금가|화이 |토이 |수이 /.test(s), s);
  }
});

t('computeSaju: 모든 사람에게 천간 단위 처방, 용신은 v0.29와 같은 규칙', () => {
  for (const [y, m, d] of [[1990, 3, 20], [1985, 9, 10], [2001, 12, 25], [1972, 7, 1]]) {
    const s = computeSaju({ year: y, month: m, day: d, hour: 10, minute: 0 });
    assert.ok(s.johu.stem != null && s.johu.table.length > 10, JSON.stringify(s.johu));
  }
  assert.equal(TABLE_MILD, 10);
});

t('검증 세트: 60명식, 일간 10종이 6개씩, 12달 고르게, 같은 입력이면 같은 세트', () => {
  const set = buildVerifySet(computeSaju);
  assert.equal(set.length, 60);
  const byStem = Array(10).fill(0); const byMonth = Array(12).fill(0);
  set.forEach((v) => { const s = computeSaju(v.input); byStem[s.pillars.day.stem]++; byMonth[s.pillars.month.branch]++; });
  assert.deepEqual(byStem, Array(10).fill(6)); assert.deepEqual(byMonth, Array(12).fill(5));
  assert.deepEqual(buildVerifySet(computeSaju).map((v) => v.pillars), set.map((v) => v.pillars));
  assert.ok(!/이름|name/i.test(sheetCSV(set).split('\n')[0]));
});

t('답 읽기·비교·기준값 맞추기 (가짜 전문가 = 엔진 그대로면 100%)', () => {
  assert.equal(elementOf('水'), 4); assert.equal(elementOf('목'), 0); assert.equal(elementOf('water'), 4); assert.equal(elementOf(''), null);
  assert.equal(gyeokOf('정관'), '정관격'); assert.equal(gyeokOf('칠살격'), '편관격');
  const set = buildVerifySet(computeSaju);
  const eng = engineAnswers(set, computeSaju);
  const EL = '목화토금수';
  const csv = ['번호,양력,시각,연주 월주 일주 시주,용신,희신,격국,메모', ...set.map((v) => `${v.id},,,,${EL[eng[v.id].yongsin]},${EL[eng[v.id].heesin]},,`)].join('\n');
  const ans = parseAnswers(csv);
  const c = compare(eng, ans);
  assert.equal(c.n, 60); assert.equal(c.yongsin, 100); assert.equal(c.heesin, 100);
  const cal = calibrate(set, ans, computeSaju);
  assert.equal(cal.testScore.yongsin, 100);
  assert.ok(cal.tries.length >= 5);
});

console.log(`\njohu: ${pass} passed`);
