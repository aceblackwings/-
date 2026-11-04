// 띠별 2027년 운세 검색용 페이지(v0.49): 12띠 · 제목 겹침 없음 · 조사·금지어 · 달 계산 · 만들어 둔 파일과 같음
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { TTI, pageHTML, indexHTML, pageProblems, monthsOf, birthYears, UNSE_CSS } from '../tools/unse_pages.mjs';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const file = (n) => new URL(`../unse/2027/${n}`, import.meta.url);
t('12띠 모두, 띠 순서(子~亥), 제목·설명이 서로 다름', () => {
  assert.deepEqual(TTI.map((x) => x.b), [...Array(12).keys()]);
  const titles = TTI.map((x) => pageHTML(x).match(/<title>(.*?)<\/title>/)[1]);
  assert.equal(new Set(titles).size, 12); titles.forEach((x, i) => assert.ok(x.includes(`2027년 ${TTI[i].name}띠 운세`)));
});
t('조사·금지어 문제 없음', () => assert.deepEqual(pageProblems(), []));
t('달 계산: 쥐띠는 4·8·1월이 힘, 6월(午, 충)은 쉬어 가기 · 소띠는 7월(未, 충)', () => {
  assert.deepEqual(monthsOf(0), { good: [4, 8, 1], slow: [6] });
  assert.deepEqual(monthsOf(1).slow, [7]);
  assert.deepEqual(birthYears(7).slice(-3), [1991, 2003, 2015]);
});
t('만들어 둔 파일이 생성기 결과와 같고(다시 만들기 잊지 않기), 그림·앱 링크가 있음', () => {
  for (const x of TTI) {
    assert.equal(readFileSync(file(`${x.key}.html`), 'utf8'), pageHTML(x), `${x.key}.html — node tools/unse_pages.mjs 로 다시 만들기`);
    assert.ok(existsSync(new URL(`../assets/char/${x.key}_s3.webp`, import.meta.url)));
  }
  assert.equal(readFileSync(file('index.html'), 'utf8'), indexHTML());
  assert.equal(readFileSync(file('unse.css'), 'utf8'), UNSE_CSS);
  assert.ok(pageHTML(TTI[0]).includes('href="../../index.html"'));
});
console.log(`unse: ${pass} passed`);
