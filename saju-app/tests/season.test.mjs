import assert from 'node:assert/strict';
import { seasonsAround, seasonStatus, emptySeason, recordSeason, missionProgress, tiersDone, buyPack, ownedItems, seasonLook, activeTitle, seasonAccessorySVG, seasonEffectSVG, SEASON_PACKS, PACK_PRICE } from '../js/season.js';
import { dateToJdn } from '../js/lunar.js';
import { computeSaju } from '../js/saju.js';
import { characterInfo, renderCharacterSVG } from '../js/character.js';
let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };
const jdn = (y, m, d) => dateToJdn(y, m, d);

t('2026-11-01: 입동 시즌 진행 중 (10/31~11/10), 다음은 동지', () => {
  const st = seasonStatus({ year: 2026, month: 11, day: 1 });
  assert.equal(st.active.id, 'ipdong-2026');
  assert.deepEqual([st.active.start.month, st.active.start.day, st.active.end.month, st.active.end.day], [10, 31, 11, 10]);
  assert.equal(st.active.daysLeft, 9); assert.equal(st.active.toFest, 6);
  assert.equal(st.next.id, 'dongji-2026');
});
t('시즌은 겹치지 않고, 큰 명절(설날·추석)은 절기보다 우선', () => {
  for (const y of [2025, 2026, 2027, 2028]) {
    const list = seasonsAround(y);
    for (let i = 1; i < list.length; i++) assert.ok(list[i].startJdn > list[i - 1].endJdn, `${list[i].id} 겹침`);
    list.forEach((s) => assert.ok(s.festJdn >= s.startJdn && s.festJdn <= s.endJdn, s.id));
    const ids = list.filter((s) => s.year === y).map((s) => s.key);
    assert.ok(ids.includes('seollal') && ids.includes('chuseok'), `${y} 명절 누락`);
  }
});
t('시즌 사이 빈 기간에는 다음 시즌 예고만', () => {
  const st = seasonStatus({ year: 2026, month: 12, day: 30 });
  assert.equal(st.active, null); assert.ok(st.next.daysToStart > 0);
});
t('무료 트랙: 하루 한 번만 셈, 미션 1·2·4개에 스티커·칭호·소품', () => {
  let st = emptySeason(); const id = 'ipdong-2026'; let got = [];
  const rec = (k, d) => { const r = recordSeason(st, id, k, d); st = r.state; got.push(...r.unlocked.map((x) => x.reward)); };
  rec('chat', '2026-11-1'); rec('chat', '2026-11-1');
  assert.equal(missionProgress(st.progress[id]).find((m) => m.key === 'chat').n, 1);
  rec('chat', '2026-11-2'); assert.deepEqual(got, ['sticker']);
  rec('social', '2026-11-2'); rec('social', '2026-11-3'); assert.deepEqual(got, ['sticker', 'title']);
  assert.equal(st.title, id);
  ['2026-11-1', '2026-11-2', '2026-11-3'].forEach((d) => rec('mission', d));
  ['2026-11-1', '2026-11-2', '2026-11-3', '2026-11-4', '2026-11-5'].forEach((d) => rec('checkin', d));
  assert.deepEqual(got, ['sticker', 'title', 'item']);
  assert.equal(tiersDone(st.progress[id]).length, 3);
  rec('equip', '2026-11-6'); assert.equal(got.length, 3); // 시즌 미션이 아닌 퀘스트는 무시
  assert.deepEqual(seasonLook({ ...st, equipped: id }), { key: 'ipdong', effect: false });
});
t('유료 세트: 기간 안에서만 구매, 효과·금빛 칭호 포함, 중복 구매 막음', () => {
  const ss = seasonStatus({ year: 2026, month: 11, day: 1 }).active;
  assert.equal(PACK_PRICE, 4900);
  const late = buyPack(emptySeason(), ss, jdn(2026, 11, 11)); assert.equal(late.ok, false);
  const r = buyPack(emptySeason(), ss, jdn(2026, 11, 1)); assert.ok(r.ok);
  assert.deepEqual(seasonLook(r.state), { key: 'ipdong', effect: true });
  assert.deepEqual(seasonLook({ ...r.state, effect: false }), { key: 'ipdong', effect: false });
  assert.equal(activeTitle(r.state, seasonsAround(2026)), '✨ 2026 입동 눈꽃 수호자');
  assert.equal(ownedItems(r.state)[0].item, '눈꽃 목도리');
  assert.equal(buyPack(r.state, ss, jdn(2026, 11, 2)).ok, false);
});
t('소품·효과 SVG: 11종 모두 그려지고 캐릭터에 합쳐짐', () => {
  Object.keys(SEASON_PACKS).forEach((k) => assert.ok(seasonAccessorySVG(k).includes('season-acc'), k));
  ['snow', 'petal', 'leaf', 'star', 'firefly', 'moon', 'lantern'].forEach((e) => assert.ok(seasonEffectSVG(e, true).includes('animateTransform')));
  const s = computeSaju({ year: 1998, month: 5, day: 20, timeKnown: false });
  const info = characterInfo(s, { gender: 'female', concern: 'job' });
  const plain = renderCharacterSVG(info, { stage: 3 });
  const worn = renderCharacterSVG(info, { stage: 3, season: { key: 'ipdong', effect: true } });
  assert.ok(!plain.includes('season-acc') && worn.includes('season-acc') && worn.includes('season-fx'));
  assert.ok(!renderCharacterSVG(info, { stage: 3, season: { key: 'ipdong', effect: false } }).includes('season-fx'));
});
console.log(`\n${pass} passed`);
