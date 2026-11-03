// 검증 세트 도구 (v0.35)
//   질문지 만들기:  node tools/verify.mjs sheet  → ../docs/verify/expert-sheet.csv
//   성적 보기:      node tools/verify.mjs report 전문가A.csv [전문가B.csv …]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeSaju as baseSaju } from '../js/saju.js';
import { analyzeGyeok } from '../js/gyeokguk.js';

// 엔진 답에 격국까지 (v0.36)
const computeSaju = (input, opts) => { const s = baseSaju(input, opts); s.gyeok = analyzeGyeok(s); return s; };
import { buildVerifySet, sheetCSV, parseAnswers, compare, engineAnswers, calibrate } from '../js/verify.js';

const here = dirname(fileURLToPath(import.meta.url));
const [cmd, ...files] = process.argv.slice(2);
const set = buildVerifySet(computeSaju);

if (cmd === 'sheet') {
  const dir = join(here, '../../docs/verify'); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'expert-sheet.csv'), `﻿${sheetCSV(set)}\n`);
  console.log(`질문지 ${set.length}명식 → docs/verify/expert-sheet.csv`);
} else if (cmd === 'report' && files.length) {
  const experts = files.map((f) => ({ name: f, a: parseAnswers(readFileSync(f, 'utf8')) }));
  const eng = engineAnswers(set, computeSaju);
  console.log('엔진 vs 전문가 (용신 일치 · 넓게 일치(엔진 용신·희신 중 하나) · 희신 · 격국, %)');
  experts.forEach((e) => console.log(' ', e.name, compare(eng, e.a)));
  if (experts.length >= 2) {
    console.log('전문가끼리 일치(= 엔진이 노릴 수 있는 상한선)');
    for (let i = 0; i < experts.length; i++) for (let j = i + 1; j < experts.length; j++) console.log(' ', experts[i].name, '↔', experts[j].name, compare(experts[i].a, experts[j].a));
  }
  const c = calibrate(set, experts[0].a, computeSaju);
  console.log(`기준값(조후표 보완 %) 맞추기: 앞 절반 최적 ${c.best}% → 뒤 절반 성적`, c.testScore);
} else {
  console.log('사용법: node tools/verify.mjs sheet | report 답.csv [답2.csv …]');
}
