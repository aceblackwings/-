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
console.log(`\n${pass} passed`);
