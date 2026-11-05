// 오늘의 행운 긁기(v0.55, 사용자 추천 6번): 행운 색·숫자·시간·물건이 은박에 덮여 있고 손가락으로 긁으면 드러남.
// 같은 정보(fortune.luck)를 보여 주는 방법만 바꿈. 긁은 칸은 그날 저장(다시 그려도 열린 채). 순수 로직만(테스트: tests/diary.test.mjs)
const toNum = (k) => { const [y, m, d] = String(k).split('-').map(Number); return y * 10000 + m * 100 + d; };

/** 긁는 칸 4개 */
export function scratchTiles(luck) {
  const L = luck || {};
  return [
    { key: 'color', icon: '🎨', label: '행운의 색', value: L.color || '' },
    { key: 'number', icon: '🔢', label: '행운의 숫자', value: String(L.number ?? '') },
    { key: 'time', icon: '⏰', label: '행운의 시간', value: String(L.time || '').replace(/\s*\(.*\)$/, '') },
    { key: 'item', icon: '🎁', label: '행운의 물건', value: L.item || '' },
  ];
}
/** 그날 긁은 칸 */
export const scratchedOn = (store, dateKey) => new Set((store || {})[dateKey] || []);
export function markScratched(store, dateKey, key) {
  const s = { ...(store || {}) }; const list = s[dateKey] || [];
  if (list.includes(key)) return store;
  s[dateKey] = [...list, key];
  return Object.fromEntries(Object.keys(s).sort((a, b) => toNum(b) - toNum(a)).slice(0, 7).map((k) => [k, s[k]]));
}
/** 지워진 비율(0~1): 알파값 배열(RGBA의 A)을 띄엄띄엄 셈 */
export function clearedRatio(alpha, step = 16) {
  let n = 0; let c = 0;
  for (let i = 3; i < alpha.length; i += 4 * step) { n++; if (alpha[i] < 40) c++; }
  return n ? c / n : 0;
}
