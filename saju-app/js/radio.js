// 지신 라디오(v0.55, 사용자 추천 7번): 오늘 운세를 30초 남짓 소리로 읽어 줌(브라우저 음성 합성 SpeechSynthesis).
// 대본만 여기서 만들고, 읽기는 app.js. 행운 숫자·색은 「직접 긁어서 확인」으로 남겨 둠(긁기와 겹치지 않게). 순수 로직만

/**
 * @param x { month, day, dow, name, zodiac, head, mood, story, good, watch, dont[], act[], omen, polite }
 */
export function radioScript(x) {
  const who = x.name ? `${x.name} 님` : '오늘의 주인공';
  const parts = [
    `${x.zodiac}띠 지신의 아침 라디오입니다.`,
    `${x.month}월 ${x.day}일 ${x.dow}요일, ${who}의 오늘은 ${x.head}입니다.`,
    x.mood,
    x.story,
    `좋은 점부터 전해 드릴게요. ${x.good}`,
    `조심할 점도 있습니다. ${x.watch}`,
    x.dont?.length ? `오늘 하지 말 것은 ${x.dont.length}가지예요. ${x.dont.join(' ')}` : '',
    x.act?.length ? `이렇게 해 보세요. ${x.act.join(' ')}` : '',
    x.omen ? `오늘의 작은 예언 하나. ${x.omen}` : '',
    '행운의 색과 숫자는 화면에서 직접 긁어서 확인해 보세요.',
    `지금까지 ${x.zodiac}띠 지신이었습니다. 오늘 하루도 곁에 있을게요.`,
  ];
  return parts.filter(Boolean).join(' ');
}
/** 읽기 좋게 다듬기: 그림 글자·괄호·따옴표 빼기 */
export function cleanForSpeech(text) {
  return String(text)
    .replace(/\p{Extended_Pictographic}|️|‍/gu, '')
    .replace(/[「」『』"“”]/g, '')
    .replace(/\(([^)]*)\)/g, ', $1, ')
    .replace(/~/g, '에서 ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.?!])/g, '$1')
    .trim();
}
/** 문장 단위로 나눔(긴 한 덩어리는 일부 브라우저가 중간에 끊음): 120자 안쪽 덩어리들 */
export function speechChunks(text, max = 120) {
  const sent = cleanForSpeech(text).split(/(?<=[.?!])\s+/).filter(Boolean);
  const out = []; let cur = '';
  for (const s of sent) {
    if ((cur + ' ' + s).trim().length > max && cur) { out.push(cur); cur = s; } else cur = `${cur} ${s}`.trim();
  }
  if (cur) out.push(cur);
  return out;
}
