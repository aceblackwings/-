// 조사·맞춤법 검사(2026-11-04): 받침 판단, 틀린 조사 찾기, 여러 사람의 책자·운세 풀이 글 전수 검사
import assert from 'node:assert/strict';
import { josa, iyeyo, josaProblems, lastSound } from '../js/josa.js';
import { computeSaju } from '../js/saju.js';
import { yearOf } from '../js/period.js';
import { analyzeGyeok } from '../js/gyeokguk.js';
import { buildBooklet } from '../js/booklet.js';
import { yearChecks, checkLine } from '../js/yearcheck.js';
import { closingLine } from '../js/reading.js';

let pass = 0; const t = (n, fn) => { fn(); pass++; console.log('ok -', n); };

t('받침 판단: 한글·괄호 속 읽기·숫자·한자', () => {
  assert.equal(iyeyo('火(화)'), '火(화)예요');
  assert.equal(iyeyo('金(금)'), '金(금)이에요');
  assert.equal(iyeyo('3·8'), '3·8이에요');
  assert.equal(iyeyo('4·9'), '4·9예요');
  assert.equal(josa('올해', '은/는'), '올해는');
  assert.equal(josa('이달', '은/는'), '이달은');
  assert.equal(josa('용', '이/가'), '용이');
  assert.equal(josa('토끼', '이/가'), '토끼가');
  assert.equal(josa('未', '이/가'), '未가');
  assert.equal(josa('丑', '과/와'), '丑과');
  assert.equal(josa('서울', '으로/로'), '서울로');
  assert.equal(josa('집', '으로/로'), '집으로');
  assert.equal(josa('기운이 고른 편(중화)', '이라/라'), '기운이 고른 편(중화)라');
  assert.equal(lastSound('「명예와 인정」').batchim, true);
});

t('틀린 조사 찾기', () => {
  assert.equal(josaProblems('올해은 무난해요.').length, 1);
  assert.equal(josaProblems('독립과 자기 확신을(를) 다지는').length, 1);
  assert.equal(josaProblems('필요한 기운은 火(화)이에요.').length, 1);
  assert.equal(josaProblems('행운의 숫자는 3·8예요.').length, 1);
  assert.deepEqual(josaProblems('올해는 무난해요. 가을에는 좋아요. 함께 모을 돈. 水(수)예요. 金(금)이에요.'), []);
});

t('여러 사람 × 해: 책자·조심할 점·마무리 문장에 틀린 조사 없음', () => {
  const bad = [];
  for (let y = 1950; y < 2014; y += 3) for (const m of [1, 4, 7, 10]) {
    const s = computeSaju({ year: y, month: m, day: 3 + (y % 25), hour: (y + m) % 24, minute: 0 });
    for (const yr of [2026, 2027, 2028]) {
      const g = y % 2 ? 'male' : 'female';
      const b = buildBooklet({ y: yearOf(s, yr, g), thisYear: yearOf(s, yr - 1, g), saju: s, gyeok: analyzeGyeok(s), name: '은하', concern: 'love', gender: g });
      const txt = [b.lead, ...b.general.flatMap((x) => x.paras), ...b.fields.flatMap((f) => f.paras), ...b.checks.map(checkLine)].join('\n');
      for (const p of josaProblems(txt)) bad.push(`${p.why}: …${p.text}…`);
    }
  }
  for (const k of ['daewoon', 'year', 'month']) for (const sc of [40, 60, 80]) for (const pol of [true, false]) {
    for (const p of josaProblems(closingLine(k, sc, pol))) bad.push(p.text);
  }
  assert.deepEqual([...new Set(bad)].slice(0, 10), []);
});

console.log(`josa: ${pass} passed`);
