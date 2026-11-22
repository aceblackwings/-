// v0.77(2026-11-22 사용자 「처음 쓰는 사람도 클릭하다 보면 자연스럽게 따라가게」) 오늘의 길잡이
// 하루 순서 4가지(쿠키 → 습관 → 타로 → 코디)와 지금 눌러야 할 곳(손가락 표시)을 정한다.
// 순서는 복떡 흐름에 맞춤: 습관 체크로 받은 복떡으로 타로를 보고, 코디로 다시 복떡을 받는다.

export const PATH = [
  { key: 'cookie', short: '쿠키', icon: '🥠', label: '포춘 쿠키 열기', tab: 'today', why: '오늘의 운세가 나와요 · 지신 아침밥' },
  { key: 'habit', short: '습관', icon: '✅', label: '습관 체크하기', tab: 'today', why: '하나에 복떡 2개 · 지신 저녁밥' },
  { key: 'tarot', short: '타로', icon: '🃏', label: '타로 한 장 보기', tab: 'tarot', why: '복떡 1개 · 지신 간식' },
  { key: 'coordi', short: '코디', icon: '👗', label: '지신 코디하기', tab: 'hero', why: '별 3개부터 복떡 1~3개' },
];

/**
 * 오늘 진행 상황 → {steps:[{...PATH, done}], next(없으면 null), doneN, all}
 * st = { cookie, habitSet, habitLeft, tarot, coordi } (모두 true/false·숫자)
 */
export function dailyPath(st = {}) {
  const done = {
    cookie: !!st.cookie,
    habit: !!st.habitSet && !st.habitLeft,
    tarot: !!st.tarot,
    coordi: !!st.coordi,
  };
  const steps = PATH.map((p) => ({ ...p, done: done[p.key] }));
  const next = steps.find((p) => !p.done) || null;
  const doneN = steps.filter((p) => p.done).length;
  return { steps, next, doneN, all: !next };
}

/** 다음 단계 버튼 글: 습관을 아직 안 정했으면 「정하기」 */
export function nextLabel(next, st = {}) {
  if (!next) return '';
  if (next.key === 'habit' && !st.habitSet) return '습관 2가지 정하기';
  return next.label;
}
