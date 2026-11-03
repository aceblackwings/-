// 🧪 전체 미리보기에 나오는 모든 조합이 깨지지 않고 그려지는지 (NaN·undefined 없음)
import assert from 'node:assert/strict';
import { computeSaju } from '../js/saju.js';
import { computeFortune } from '../js/fortune.js';
import { characterInfo, renderCharacterSVG, ZODIAC, EMOTES } from '../js/character.js';
import { createTalisman, renderTalismanSVG, TALISMAN_TYPES, RARITIES } from '../js/talisman.js';
import { renderEmoticonSVG } from '../js/emoticon.js';
import { SEASON_PACKS } from '../js/season.js';
import { STAGES } from '../js/growth.js';
let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const s0 = computeSaju({ year: 1998, month: 5, day: 20, hour: 9, minute: 30 });
const f = computeFortune(s0, { year: 2026, month: 11, day: 2 }, { gender: 'female' });
const galSaju = (branch, el) => ({ ...s0, dayMaster: el * 2, pillars: { ...s0.pillars, year: { ...s0.pillars.year, branch } } });
const clean = (svg, what) => { assert.ok(svg.startsWith('<svg'), what); assert.ok(!/NaN|undefined/.test(svg), what); };

t(`12지신 캐릭터: 띠 12 × 진화 ${STAGES.length}단계 × 성별 2 × 오행 5 = ${12 * STAGES.length * 10}장`, () => {
  let n = 0;
  for (let b = 0; b < 12; b++) for (const st of STAGES) for (const gender of ['female', 'male']) for (let el = 0; el < 5; el++) {
    clean(renderCharacterSVG(characterInfo(galSaju(b, el), { gender, concern: 'job' }), { stage: st.stage, width: 150, backdrop: true }), `${ZODIAC[b].key}-${st.stage}-${gender}-${el}`); n++;
  }
  assert.equal(n, 12 * STAGES.length * 10);
});
t('부적: 종류 6 × 등급 5 × 테마 2 × 오행 5 = 300장, 고른 등급이 그대로 나옴', () => {
  for (const ty of TALISMAN_TYPES) for (const r of RARITIES) for (const theme of ['classic', 'neon']) for (let el = 0; el < 5; el++) {
    const tl = createTalisman(s0, f, { type: ty.key, rarity: r.key, theme, element: el });
    assert.equal(tl.rarity.key, r.key); clean(renderTalismanSVG(tl), `${ty.key}-${r.key}-${theme}-${el}`);
  }
});
t('이모티콘: 표정 8 × 스타일 2 × 등급 5 × 띠 12 (진화 1·5·14단계)', () => {
  for (const e of EMOTES) for (const style of ['neon', 'sticker']) for (const r of RARITIES) for (let b = 0; b < 12; b++) for (const stage of [1, 5, 14]) {
    clean(renderEmoticonSVG(galSaju(b, 2), f, { mood: e.key, style, rarity: r.key, stage, profile: { gender: 'female', concern: 'job' }, caption: e.label }), `${e.key}-${style}-${r.key}-${b}-${stage}`);
  }
});
t('한정 소품 11종 × 진화 14단계 (배경 효과 포함)', () => {
  for (const k of Object.keys(SEASON_PACKS)) for (const st of STAGES) {
    const svg = renderCharacterSVG(characterInfo(s0, { gender: 'male', concern: 'love' }), { stage: st.stage, width: 150, backdrop: true, season: { key: k, effect: true } });
    clean(svg, `${k}-${st.stage}`); assert.ok(svg.includes('season-acc'));
  }
});
t('등급이 오를수록 그림이 달라짐: 부적 상징·팔괘·날개·12지신 고리', () => {
  for (const theme of ['classic', 'neon']) {
    const svg = (r) => renderTalismanSVG(createTalisman(s0, f, { type: 'wealth', rarity: r, theme, element: 2 }));
    assert.ok(!svg('common').includes('class="emblem"'));
    assert.ok(svg('rare').includes('class="emblem"') && svg('rare').includes('通'));
    assert.ok(svg('epic').match(/stroke-width="2.2"/g).length >= 16); // 팔괘 효
    assert.ok(svg('legend').includes('-gold)') && svg('myth').includes('亥'));
  }
  for (const ty of TALISMAN_TYPES) assert.notEqual(renderTalismanSVG(createTalisman(s0, f, { type: ty.key, rarity: 'rare' })).length, 0);
});
t('이모티콘: 표정마다 다른 소품, 등급마다 장면이 더해짐', () => {
  const e = (mood, rarity) => renderEmoticonSVG(s0, f, { mood, rarity, style: 'neon', stage: 3, noImage: true, profile: { gender: 'female', concern: 'job' } });
  assert.ok(e('fighting', 'common').includes('必勝')); assert.ok(e('sleepy', 'common').includes('Zz')); assert.ok(e('thanks', 'common').includes('福'));
  const sizes = ['common', 'rare', 'epic', 'legend', 'myth'].map((r) => e('love', r).length);
  for (let i = 1; i < sizes.length; i++) assert.ok(sizes[i] > sizes[i - 1], `등급 ${i}`);
  assert.ok(e('love', 'myth').includes('-holo)') && e('love', 'legend').includes('-gold)'));
});
t('한정 소품: 꾸미기 세트는 계절 장면까지, 무료 소품은 소품만', () => {
  const info = characterInfo(s0, { gender: 'female', concern: 'job' });
  for (const k of Object.keys(SEASON_PACKS)) {
    const item = renderCharacterSVG(info, { stage: 3, season: { key: k, effect: false } });
    const set = renderCharacterSVG(info, { stage: 3, season: { key: k, effect: true } });
    assert.ok(set.length > item.length + 500, k);
  }
});
import { CHAR_ASSETS, charImage, EMO_ASSETS, SCENE_ASSETS, sceneImage } from '../js/assets.js';
import fs from 'node:fs';
t('이미지 그림: 띠별 그림은 모든 오행에 쓰고(오행 배지), 없는 띠는 코드 그림 · 파일이 실제로 있음', () => {
  for (const k of CHAR_ASSETS) assert.ok(fs.statSync(new URL(`../assets/char/${k}.webp`, import.meta.url)).size > 1000, k);
  for (const k of EMO_ASSETS) assert.ok(fs.statSync(new URL(`../assets/emo/${k}.webp`, import.meta.url)).size > 1000, k);
  for (const k of SCENE_ASSETS) assert.ok(fs.statSync(new URL(`../assets/scene/${k}.webp`, import.meta.url)).size > 10000, k);
  const tiger = (el, stage, noImage) => renderCharacterSVG(characterInfo(galSaju(2, el), { gender: 'female', concern: 'job' }), { stage, noImage });
  assert.ok(tiger(1, 2).includes('assets/char/tiger_s2.webp') && tiger(1, 2).includes('火'));
  assert.ok(tiger(0, 2).includes('assets/char/tiger_s2.webp') && tiger(0, 2).includes('木')); // 목(木) 호랑이도 그림 + 木 배지
  assert.ok(tiger(1, 9).includes('tiger_s5.webp')); // 승천 단계는 5단계 그림 + 코드 효과
  assert.ok(!tiger(1, 2, true).includes('<image'));
  const rat = renderCharacterSVG(characterInfo(galSaju(0, 1), { gender: 'female', concern: 'job' }), { stage: 2 });
  assert.equal(rat.includes('<image'), CHAR_ASSETS.has('rat_s2'));
  const emo = renderEmoticonSVG(galSaju(2, 3), f, { mood: 'fighting', rarity: 'legend', profile: { gender: 'female', concern: 'job' } });
  assert.ok(emo.includes('assets/emo/tiger_fighting.webp') && !emo.includes('必勝')); // 그림 속 머리띠 → 코드 소품 생략
  assert.ok(emo.includes('-gold)')); // 등급 장면(금메달)은 그대로
});
t('계절 장면 그림 11장: 꾸미기 세트는 그림 장면(전체 배경), 소품만이면 장면 없음', () => {
  assert.equal(SCENE_ASSETS.size, 11);
  const info = characterInfo(galSaju(2, 1), { gender: 'female', concern: 'job' });
  for (const k of Object.keys(SEASON_PACKS)) {
    assert.equal(sceneImage(k), `assets/scene/${k}.webp`, k);
    const set = renderCharacterSVG(info, { stage: 3, season: { key: k, effect: true }, backdrop: true });
    assert.ok(set.includes(`assets/scene/${k}.webp`) && set.includes('xMidYMid slice'), k);
    assert.ok(!renderCharacterSVG(info, { stage: 3, season: { key: k, effect: false } }).includes('assets/scene/'), k);
  }
  assert.equal(sceneImage('nope'), null);
});
console.log(`\n${pass} passed`);
