// v0.59 포춘 기계 그림 16장: 목록 · 파일 · 비율
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { FORTUNE_IMAGES } from '../js/fortune-manifest.js';
let pass = 0; const t = (n, f) => { f(); pass++; console.log('ok -', n); };
const Z = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'sheep', 'monkey', 'rooster', 'dog', 'pig'];
const IDS = ['machine', 'cookie', 'cookie_l', 'cookie_r', ...Z];
t('16장 모두 연결 · 다른 id 없음', () => {
  assert.deepEqual(Object.keys(FORTUNE_IMAGES).sort(), [...IDS].sort());
});
t('파일 있음 · 비율 정상(띠 그림은 기계+지신이라 가로가 조금 넓거나 비슷)', () => {
  for (const [id, r] of Object.entries(FORTUNE_IMAGES)) {
    assert.ok(existsSync(new URL(`../assets/fortune/${id}.webp`, import.meta.url)), id);
    assert.ok(r > 0.5 && r < 2, `${id} ${r}`);
    if (Z.includes(id)) assert.ok(r > 0.9 && r < 1.4, `${id} ${r}`);
  }
});
console.log(`fortuneart: ${pass} passed`);
