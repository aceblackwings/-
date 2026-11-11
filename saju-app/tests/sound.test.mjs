// v0.65 효과음·짧은 음악: 소리 파일 없이 Web Audio로 만들고, 끄면 소리를 내지 않음
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as S from '../js/sound.js';
const t = (name, fn) => test(name, fn);

t('설정: 기본 켬 · 버튼으로 끄고 켬', () => {
  assert.equal(S.soundOn({}), true); assert.equal(S.soundOn(undefined), true);
  const off = S.toggleSound({}); assert.equal(S.soundOn(off), false);
  assert.equal(S.soundOn(S.toggleSound(off)), true);
});
t('브라우저 소리 장치가 없으면(노드) 조용히 false', () => {
  S.unlockSound();
  for (const k of Object.keys(S.SFX)) assert.equal(S.sfx(k), false);
  for (const k of Object.keys(S.JINGLES)) assert.equal(S.jingle(k), false);
  S.setSoundEnabled(false); assert.equal(S.soundEnabled(), false); S.setSoundEnabled(true);
});
t('짧은 음악: 국악 5음(도·레·미·솔·라)만 · 3초 안쪽', () => {
  for (const [k, seq] of Object.entries(S.JINGLES)) {
    assert.ok(seq.length >= 3, k);
    for (const [n] of seq) assert.match(n, /^[CDEGA][4-6]$/, `${k} ${n}`);
    assert.ok(S.jingleLength(k) <= 3, `${k} ${S.jingleLength(k)}초`);
  }
});
t('앱 연결: 클릭·탭·밥·진화·부적·등불·도장·타로·쿠키·긁기·태우기 · 🔊 끄기 버튼', () => {
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  for (const k of ['tap', 'tab', 'grow', 'sparkle', 'bell', 'stamp', 'flip', 'crack', 'scratch', 'pop', 'fire', 'coin']) assert.ok(app.includes(`sfx('${k}')`), k);
  for (const k of ['evolve', 'charm', 'lantern', 'wish', 'gold']) assert.ok(app.includes(`jingle('${k}')`), k);
  assert.ok(html.includes('id="btn-sound"'));
  const src = readFileSync(new URL('../js/sound.js', import.meta.url), 'utf8');
  assert.ok(!/new Audio\(|\.mp3|\.wav|\.ogg|fetch\(/.test(src), '소리 파일 없음');
});
t('모바일: 긁기 칸은 위아래 스크롤을 막지 않음(touch-action pan-y)', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const rule = css.match(/\.sc-foil \{[^}]*\}/)[0];
  assert.match(rule, /touch-action: pan-y/);
});
