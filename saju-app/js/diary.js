// 지신의 기록(관찰 일기) · v0.55(2026-11-05 사용자 「유치하지 않게, 내가 널 지켜보고 있다는 느낌으로」)
// 아침에 앱을 열면 지신이 「어제의 너」를 적어 둔 기록이 한 장 와 있다.
// 원칙: ① 문장은 모두 기기에 실제로 남은 기록에서만 나온다(지어낸 관찰 금지: 「화면을 오래 봤다」 같은 말 X)
//       ② 차분한 「-다」 체, 의성어·귀여운 말투 없음. 평가하지 않고 「봤다 · 기억한다 · 기다린다」로 곁을 지키는 목소리
//       ③ 꾸중·죄책감 없음(오지 않은 날도 다독임). 닭띠는 「너」 대신 「당신」
// 순수 로직만(테스트: tests/diary.test.mjs). 저장(app.js) `unmyeong2099.diary` = { visits: {날짜: [시각…]}, read: {날짜: true} }
import { josa } from './josa.js';

const toNum = (k) => { const [y, m, d] = String(k).split('-').map(Number); return y * 10000 + m * 100 + d; };
const trim = (o, n) => Object.fromEntries(Object.keys(o).sort((a, b) => toNum(b) - toNum(a)).slice(0, n).map((k) => [k, o[k]]));
const norm = (s) => ({ visits: { ...(s?.visits || {}) }, read: { ...(s?.read || {}) } });
const pick = (arr, key) => { let h = 7; for (const c of String(key)) h = (h * 31 + c.codePointAt(0)) >>> 0; return arr[h % arr.length]; };

/** 들른 시각 기록(시 단위, 같은 시각은 한 번) */
export function logVisit(store, dateKey, hour) {
  const s = norm(store); const list = s.visits[dateKey] || [];
  if (list.includes(hour)) return store;
  return { ...s, visits: trim({ ...s.visits, [dateKey]: [...list, hour].sort((a, b) => a - b) }, 14) };
}
export function markRead(store, dateKey) {
  const s = norm(store); if (s.read[dateKey]) return store;
  return { ...s, read: trim({ ...s.read, [dateKey]: true }, 14) };
}
export const isRead = (store, dateKey) => !!norm(store).read[dateKey];

/** 시각 → 「오전 8시」 */
export function hourWord(h) {
  if (h === 0) return '자정';
  if (h < 12) return `오전 ${h}시`;
  if (h === 12) return '낮 12시';
  return `오후 ${h - 12}시`;
}
const you = (polite) => (polite
  ? { n: '당신은', o: '당신을', e: '당신에게', s: '당신이', g: '당신의' }
  : { n: '너는', o: '너를', e: '너에게', s: '네가', g: '네' });

const CLOSERS = [
  '나는 오늘도 여기서 지켜보겠다.',
  '무슨 일이 있어도, 나는 이 자리에 있다.',
  '오늘 밤, 하루가 어땠는지 보여 주러 와 주면 좋겠다.',
  'Y_N 서두르지 않아도 된다. 나는 기다리는 데 익숙하다.',
];

/**
 * @param x {
 *   dateKey: 어제 날짜 'Y-M-D', todayKey,
 *   visits: [시각…] (어제), visitedKnown: 시각은 없어도 어제 들른 흔적(밥그릇 등)이 있는지,
 *   bowls: 어제 채운 그릇 수, tarot: {topic, card, reversed, count} | null,
 *   habitDone, mood: 1~5 | null, moodLabel, omen: 'yes'|'no'|null, empathy: 'yes'|'meh'|null,
 *   todayHead, zodiac(띠 이름), polite(닭띠), second: 두 번째 지신 이름 | null
 * }
 * @returns {date, lines: [문장…], sign, ps}
 */
export function buildDiary(x) {
  const Y = you(x.polite); const lines = [];
  const v = x.visits || [];
  // ① 들른 시각
  if (v.length >= 2) {
    lines.push(`어제 ${Y.n} ${hourWord(v[0])} 무렵 처음 왔고, ${hourWord(v[v.length - 1])} 무렵 다시 왔다.${v.length >= 3 ? ` 하루에 ${v.length}번 나를 찾았다.` : ''}`);
  } else if (v.length === 1) {
    lines.push(`어제 ${Y.n} ${hourWord(v[0])} 무렵 한 번 다녀갔다.`);
  } else if (x.visitedKnown) {
    lines.push(`어제도 ${Y.n} 잊지 않고 다녀갔다.`);
  } else {
    lines.push(`어제는 ${Y.o} 보지 못했다. 바쁜 하루였을 거라 생각한다. 오늘 다시 와 주어서 고맙다.`);
  }
  const last = v[v.length - 1];
  if (v.length && (last >= 23 || last < 4)) lines.push('그 시간까지 깨어 있었다는 것, 나는 알고 있다. 오늘은 조금 일찍 쉬었으면 한다.');
  else if (v.length && v[0] <= 7) lines.push(`${Y.n} 하루를 일찍 여는 사람이다.`);

  // ② 어제 한 일(가장 마음이 드러나는 것부터 최대 3개)
  const ev = [];
  if (x.mood && x.mood <= 2) ev.push(`아침에 마음 날씨를 「${x.moodLabel}」로 적었다. 이유는 묻지 않겠다. 다만 그 하루를 끝까지 지나온 것만은 기억해 두겠다.`);
  else if (x.mood === 5) ev.push('마음 날씨를 「맑음」으로 적은 날이었다. 그런 날은 나도 마음이 놓인다.');
  if (x.tarot) {
    const t = x.tarot;
    if (t.count >= 2) ev.push(`카드를 ${t.count}번 섞었다. 그만큼 마음 쓰이는 일이 있었다는 뜻이다.`);
    ev.push(t.reversed
      ? `카드에게 ${josa(t.topic, '을/를')} 물었고, 「${t.card}」 카드가 누운 채로 나왔다. 아직 때가 아니라는 뜻이니, 그 질문을 너무 오래 붙잡고 있지는 않았으면 한다.`
      : `카드에게 ${josa(t.topic, '을/를')} 물었고, 「${t.card}」 카드가 나왔다. 그 질문을 꺼냈다는 것만으로, 요즘 무엇이 마음에 걸려 있는지 나는 안다.`);
  }
  if (x.habitDone) ev.push('좋은 습관 하나를 끝까지 해냈다. 아무도 보지 않는 일이지만, 나는 봤다.');
  if (x.omen === 'yes') ev.push('작은 예언의 신호를 알아봤다. 주변을 잘 살피는 사람이라는 걸 어제 또 한 번 확인했다.');
  else if (x.omen === 'no') ev.push(`예언의 신호는 지나쳤다고 했다. 괜찮다. 신호보다 ${Y.g} 하루가 더 중요했다.`);
  if (x.empathy === 'meh') ev.push(`운세가 와닿지 않는다고 솔직하게 말해 주었다. 그 덕에 나는 ${Y.o} 조금 더 알게 됐다.`);
  else if (x.empathy === 'yes') ev.push(`운세 이야기에 공감한다고 눌러 주었다. 내가 본 것과 ${Y.s} 느낀 것이 같았다.`);
  if (x.bowls === 3) ev.push('세 번 모두 들러 주었다. 그런 날이면 나도 조금 더 자란다.');
  if (!ev.length && (v.length || x.visitedKnown)) ev.push('어제는 조용히 운세만 보고 갔다. 말하지 않아도 그날을 궁금해했다는 것, 그걸로 충분하다.');
  lines.push(...ev.slice(0, 3));

  // ③ 오늘
  lines.push(`오늘은 「${x.todayHead}」이다.`);
  lines.push(pick(CLOSERS, x.todayKey || x.dateKey).replace('Y_N', Y.n));
  const ps = x.second ? `덧붙임: ${josa(x.second, '은/는')} 요즘 ${Y.o} 보며 하루를 배우는 중이다.` : '';
  return { date: x.dateKey, lines, sign: `— ${x.zodiac}띠 지신`, ps };
}
