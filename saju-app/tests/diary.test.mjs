// v0.55 지신의 기록 · 행운 긁기 · 지신 라디오
import assert from 'node:assert/strict';
import { buildDiary, logVisit, markRead, isRead, hourWord } from '../js/diary.js';
import { scratchTiles, scratchedOn, markScratched, clearedRatio } from '../js/scratch.js';
import { radioScript, cleanForSpeech, speechChunks } from '../js/radio.js';
import { josaProblems } from '../js/josa.js';
let pass = 0; const t = (n, f) => { f(); pass++; console.log('ok -', n); };
const CUTE = /냠|뀨|헤헤|히히|으쌍|룰루|ㅎㅎ|ㅋㅋ|♡|~~|이 몸|해쪄|했쪄/;
const base = { dateKey: '2026-11-4', todayKey: '2026-11-5', visits: [], visitedKnown: false, bowls: 0, tarot: null, habitDone: false, mood: null, moodLabel: '', omen: null, empathy: null, todayHead: '평가받고 인정받기 좋은 날', zodiac: '말', polite: false, second: null };
const all = [];
const check = (d) => {
  for (const l of [...d.lines, d.ps].filter(Boolean)) {
    all.push(l);
    assert.deepEqual(josaProblems(l), [], l);
    assert.ok(!CUTE.test(l), l);
    assert.ok(/[다.]$/.test(l), l);
  }
};

t('시각 낱말', () => { assert.equal(hourWord(0), '자정'); assert.equal(hourWord(8), '오전 8시'); assert.equal(hourWord(12), '낮 12시'); assert.equal(hourWord(22), '오후 10시'); });
t('들른 시각: 처음·마지막 · 늦은 밤 · 이른 아침 · 안 온 날은 다독임', () => {
  let d = buildDiary({ ...base, visits: [7, 13, 23] }); check(d);
  assert.match(d.lines[0], /오전 7시 무렵 처음 왔고, 오후 11시 무렵 다시 왔다\. 하루에 3번/);
  assert.match(d.lines[1], /깨어 있었다는 것, 나는 알고 있다/);
  d = buildDiary({ ...base, visits: [6] }); check(d); assert.match(d.lines.join(' '), /일찍 여는 사람/);
  d = buildDiary({ ...base }); check(d); assert.match(d.lines[0], /보지 못했다.*고맙다/);
  assert.ok(!/(왜|안 왔|실망|서운)/.test(d.lines.join(' ')));
  d = buildDiary({ ...base, visitedKnown: true }); check(d); assert.match(d.lines.join(' '), /조용히 운세만/);
});
t('한 일: 실제 기록만 · 최대 3개 · 누운 카드·마음 날씨·습관·예언·공감', () => {
  const d = buildDiary({ ...base, visits: [9, 21], bowls: 3, mood: 2, moodLabel: '비', habitDone: true, omen: 'no', empathy: 'meh',
    tarot: { topic: '애정운', card: '달', reversed: true, count: 2 } });
  check(d);
  const body = d.lines.join(' ');
  assert.match(body, /「비」로 적었다/); assert.match(body, /2번 섞었다/); assert.match(body, /애정운을 물었고, 「달」 카드가 누운 채로/);
  assert.ok(!/습관/.test(body)); // 3개까지만
  const e = buildDiary({ ...base, visits: [10], habitDone: true, omen: 'yes', empathy: 'yes', tarot: { topic: '일과 취업', card: '태양', reversed: false, count: 1 } });
  check(e); assert.match(e.lines.join(' '), /일과 취업을 물었고/); assert.match(e.lines.join(' '), /아무도 보지 않는 일이지만, 나는 봤다/);
  assert.match(e.lines.at(-2), /오늘은 「평가받고 인정받기 좋은 날」이다\./);
  assert.equal(e.sign, '— 말띠 지신');
});
t('닭띠는 「당신」 · 두 번째 지신 덧붙임', () => {
  const d = buildDiary({ ...base, polite: true, visits: [8], omen: 'no', empathy: 'meh', second: '엄마의 소' });
  check(d); const body = d.lines.join(' ') + d.ps;
  assert.ok(!/너는|너를|네 /.test(body)); assert.match(body, /당신/);
  assert.match(d.ps, /^덧붙임: 엄마의 소는 요즘 당신을/);
  for (let i = 1; i < 28; i++) check(buildDiary({ ...base, todayKey: `2026-11-${i}`, visits: [i % 24], polite: i % 2 === 0 }));
});
t('들른 시각·읽음 기록', () => {
  let s = logVisit({}, '2026-11-5', 9); s = logVisit(s, '2026-11-5', 9); s = logVisit(s, '2026-11-5', 7);
  assert.deepEqual(s.visits['2026-11-5'], [7, 9]);
  assert.equal(logVisit(s, '2026-11-5', 9), s);
  for (let i = 1; i <= 20; i++) s = logVisit(s, `2026-10-${i}`, 8);
  assert.equal(Object.keys(s.visits).length, 14); assert.ok(s.visits['2026-11-5']);
  const r = markRead({}, '2026-11-5'); assert.ok(isRead(r, '2026-11-5')); assert.equal(markRead(r, '2026-11-5'), r);
});
t('행운 긁기: 4칸 · 그날 저장 · 지워진 비율', () => {
  const tiles = scratchTiles({ color: '노랑', number: 5, time: '오후 1시~3시 (未시)', item: '도자기, 황토색 소품' });
  assert.deepEqual(tiles.map((x) => x.key), ['color', 'number', 'time', 'item']); assert.equal(tiles[2].value, '오후 1시~3시');
  let s = markScratched({}, '2026-11-5', 'color'); assert.equal(markScratched(s, '2026-11-5', 'color'), s);
  s = markScratched(s, '2026-11-5', 'item'); assert.deepEqual([...scratchedOn(s, '2026-11-5')], ['color', 'item']);
  assert.equal(scratchedOn(s, '2026-11-6').size, 0);
  const a = new Uint8ClampedArray(4 * 100).fill(255); assert.equal(clearedRatio(a, 1), 0);
  for (let i = 3; i < a.length; i += 4) a[i] = 0; assert.equal(clearedRatio(a, 1), 1);
});
t('라디오 대본: 그림 글자·괄호 없이 · 행운은 긁기로 남김 · 덩어리 120자 안쪽', () => {
  const text = radioScript({ month: 11, day: 5, dow: '목', name: '민지', zodiac: '말', head: '평가받고 인정받기 좋은 날', mood: '무난한 하루예요.', story: '오늘은 윗사람에게 인정받기 쉬워요.', good: '칭찬이 들어와요.', watch: '체면 때문에 무리하지 마세요.', dont: ['큰 약속은 하지 마세요.'], act: ['약속 시간보다 10분 먼저 가세요.'], omen: '숫자 6이 보이면 좋은 신호예요. 바로 시작해 보세요.' });
  assert.match(text, /^말띠 지신의 아침 라디오입니다\. 11월 5일 목요일, 민지 님의 오늘은 평가받고 인정받기 좋은 날입니다\./);
  assert.match(text, /직접 긁어서 확인/);
  const ch = speechChunks(`🍀 ${text} (참고) 「따옴표」 오후 1시~3시`);
  assert.ok(ch.length >= 3); assert.ok(ch.every((c) => c.length <= 140));
  const joined = ch.join(' '); assert.ok(!/[「」🍀()]/u.test(joined)); assert.match(joined, /오후 1시에서 3시/);
  assert.equal(cleanForSpeech('😀 안녕 ✨'), '안녕');
});
console.log(`diary: ${pass} passed (문장 ${all.length}개 검사)`);
