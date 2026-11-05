// v0.58 코디 소품 그림: 자리표 60칸 · 그림 파일 · 몸 안쪽 자리
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { COORDI_ANCHORS, COORDI_CROWN, NECK_SCALE, coordiRect } from '../js/coordi-anchors.js';
import { CHAR_FILES } from '../js/asset-manifest.js';
import { COORDI_IMAGES } from '../js/coordi-manifest.js';
import { WARDROBE } from '../js/coordi.js';
let pass = 0; const t = (n, f) => { f(); pass++; console.log('ok -', n); };
const Z = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'sheep', 'monkey', 'rooster', 'dog', 'pig'];
const IDS = Object.values(WARDROBE).flat().map((x) => x.id);
t('자리표: 12띠 × 5단계, 값은 그림 안(0~100)', () => {
  for (const z of Z) {
    assert.equal(COORDI_ANCHORS[z]?.length, 5, z);
    for (const a of COORDI_ANCHORS[z]) for (const v of [...a.head, ...a.neck, ...a.hand]) assert.ok(v > 0 && v < 100, `${z} ${v}`);
    for (const a of COORDI_ANCHORS[z]) { assert.ok(a.neck[1] > a.head[1] + 20, `${z} 목이 머리보다 아래`); }
  }
});
t('그림 목록: 옷장 id만 · 파일 있음 · 비율 정상', () => {
  for (const [id, r] of Object.entries(COORDI_IMAGES)) {
    assert.ok(IDS.includes(id), id); assert.ok(r > 0.3 && r < 3, id);
    assert.ok(existsSync(new URL(`../assets/coordi/${id}.webp`, import.meta.url)), id);
  }
});
t('자리 계산: 세 칸 모두 캐릭터 화면(320×400) 안 · 6단계 이상은 5단계 자리', () => {
  for (const z of Z) for (let s = 1; s <= 14; s++) for (const slot of ['head', 'neck', 'hand']) {
    const r = coordiRect(z, s, slot, 1.15);
    assert.ok(r && r.w > 10 && r.x > -40 && r.x + r.w < 360 && r.y > 0 && r.y < 400, `${z} ${s} ${slot}`);
    if (s > 5) assert.deepEqual(r, coordiRect(z, 5, slot, 1.15));
  }
});
t('왕관 없는 5단계 그림 12장 · 목걸이는 목도리보다 작게', () => {
  for (const z of Z) { assert.ok(COORDI_CROWN[z], z); assert.ok(CHAR_FILES.includes(`${z}_s5_nocrown`), z); }
  for (const id of ['n2', 'n3', 'n4']) assert.ok(coordiRect('ox', 3, 'neck', 1, NECK_SCALE[id]).w < coordiRect('ox', 3, 'neck', 1).w * 0.8, id);
});
console.log(`coordiart: ${pass} passed`);
