import assert from 'node:assert/strict';
import { makeCode, normalizeCode, roomName, publicCard, cleanCard, cardToSaju, pendingCheers, cheerId, CHEER_DAILY_LIMIT, cheerText } from '../js/realtime.js';
import { computeSaju } from '../js/saju.js';
import { computeCompat } from '../js/compat.js';
import { characterInfo } from '../js/character.js';

let n = 0; const t = (name, fn) => { fn(); n++; };

t('코드 생성·정리', () => {
  const c = makeCode(() => 0.5);
  assert.equal(c.length, 6);
  assert.equal(normalizeCode(c.toUpperCase()), c);
  assert.equal(normalizeCode(' k3m-9qa '), 'k3m9qa');
  assert.equal(normalizeCode('abc'), null);
  assert.equal(normalizeCode('o0l1ia'), null); // 헷갈리는 글자 제외
  assert.match(roomName(c), /^[a-z0-9][a-z0-9_.-]{0,47}$/);
});

const saju = computeSaju({ year: 1990, month: 5, day: 15, hour: 10, minute: 30, timeKnown: true });
const friend = computeSaju({ year: 1995, month: 11, day: 3, timeKnown: false });

t('공개 카드에는 생년월일이 없다', () => {
  const card = publicCard(saju, { name: '하늘', gender: 'female' }, 4, 'k3m9qa');
  const json = JSON.stringify(card);
  assert.ok(!json.includes('1990') && !json.includes('year') && !json.includes('hour'));
  assert.equal(card.branch, saju.pillars.year.branch);
  assert.ok(json.length < 400);
});

t('받은 카드 검증', () => {
  const card = publicCard(friend, { name: '<b>별</b>‮', gender: 'male' }, 3, 'qwerty');
  const c = cleanCard(card);
  assert.equal(c.name, '<b>별</b>'); // 표시할 때 esc 처리, 제어 문자는 제거
  assert.equal(cleanCard({ ...card, branch: 12 }), null);
  assert.equal(cleanCard({ ...card, elements: [1, 2] }), null);
  assert.equal(cleanCard(null), null);
  assert.equal(cleanCard({ ...card, stage: 99 }).stage, 1);
});

t('카드만으로 궁합·캐릭터 계산이 원본과 같다', () => {
  const card = cleanCard(publicCard(friend, { name: '별', gender: 'male' }, 2, 'qwerty'));
  const fs = cardToSaju(card);
  const d = { year: 2026, month: 11, day: 1 };
  const a = computeCompat(saju, friend, d); const b = computeCompat(saju, fs, d);
  // 오행 비율 반올림 오차 범위 안
  assert.ok(Math.abs(a.score - b.score) <= 2, `${a.score} vs ${b.score}`);
  assert.equal(characterInfo(fs, { gender: 'male' }).zodiac.name, characterInfo(friend, { gender: 'male' }).zodiac.name);
});

t('받은 응원 하루 한도', () => {
  const dk = '2026-11-01';
  const list = Array.from({ length: 8 }, (_, i) => ({ id: `c${i}`, date: dk, at: i }));
  list.push({ id: 'old', date: '2026-10-31', at: 0 });
  assert.equal(pendingCheers(list, [], dk, 0).length, CHEER_DAILY_LIMIT);
  assert.equal(pendingCheers(list, ['c0', 'c1'], dk, 4).length, 1);
  assert.equal(pendingCheers(list, [], dk, 0)[0].id, 'c0');
  assert.equal(pendingCheers(list, [], dk, 9).length, 0);
  assert.equal(cheerId('aaaaaa', 'bbbbbb', dk), 'aaaaaa_bbbbbb_20261101');
  assert.ok(cheerText('nope').length > 0);
});

console.log(`realtime: ${n} tests passed`);
