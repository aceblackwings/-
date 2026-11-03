// 수호신의 쪽지(첫 화면, 2026-11-03 사용자 선택 C안): 오늘의 운세 편지 아래 붙는 할 일 쪽지. 첫 접속부터 보임
// 「관리받는 느낌」: 어제 한 일을 기억하고, 이번 주 가장 좋은 날을 미리 짚고, 그날이 오면 다시 알려 주고, 일요일엔 다음 주를 미리 봄
// 했어요 → 부적 보상(이번 주 도장 수가 많을수록 등급이 오름) + 도장. 순수 로직만(테스트: tests/note.test.mjs)
// 저장 키: unmyeong2099.note = { 'YYYY-M-D': { done: true, charm: '희귀 재물부' } } (40일)
import { GOD_READING } from './reading.js';

const DOW = '일월화수목금토';
const md = (d) => `${d.month}/${d.day}`;
const dowOf = (d) => DOW[new Date(Date.UTC(d.year, d.month - 1, d.day)).getUTCDay()];
const keyOf = (d) => `${d.year}-${d.month}-${d.day}`;
const hasBatchim = (w) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return c >= 0 && c <= 11171 && c % 28 !== 0; };

/** 우산 분야 → 부적 종류 */
export const AREA_CHARM = { wealth: 'wealth', love: 'love', career: 'exam', health: 'health', social: 'luck', mind: 'protect' };

/** 이번 주 도장 수(오늘 포함) → 보상 부적 등급 */
export function stampRarity(n) {
  if (n >= 7) return 'legend';
  if (n >= 5) return 'epic';
  if (n >= 3) return 'rare';
  return 'common';
}
export const RARITY_KO = { common: '일반', rare: '희귀', epic: '영웅', legend: '전설' };
/** 다음 등급까지 남은 도장 */
export function nextTier(n) {
  for (const [need, r] of [[3, 'rare'], [5, 'epic'], [7, 'legend']]) if (n < need) return { left: need - n, rarity: r };
  return null;
}

export const emptyNote = () => ({});
export function markNote(store, dateKey, charmLabel) {
  const s = { ...(store || {}) };
  if (s[dateKey]?.done) return { store: s, changed: false };
  s[dateKey] = { done: true, charm: charmLabel };
  const keys = Object.keys(s).sort((a, b) => toNum(b) - toNum(a));
  keys.slice(40).forEach((k) => delete s[k]);
  return { store: s, changed: true };
}
const toNum = (k) => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d); };

/** 이번 주(월~일) 도장 수 */
export const weekStamps = (store, week) => week.days.filter((d) => store?.[keyOf(d.date)]?.done).length;

const T = {
  casual: {
    first: '오늘부터 내가 매일 쪽지를 남길게. 하나씩만 같이 해 보자.',
    yDone: '어제 쪽지, 해냈더라. 정말 잘했어.',
    yMiss: '어제 건 못 했어도 괜찮아. 오늘 거 하나면 충분해.',
    today: (t) => `오늘 할 일: ${t}`,
    bestToday: (k) => `오늘이 이번 주 가장 좋은 날이야! 「${k}」의 기운이 모이니까 미뤄 둔 중요한 부탁·약속은 오늘 꺼내 봐.`,
    bestAhead: (d, k) => `이번 주는 ${dowOf(d)}요일(${md(d)})이 가장 좋은 날이야. 「${k}」의 기운이 모이는 날이라 중요한 일은 그날로 잡아 봐. 그날 아침에 다시 알려 줄게.`,
    bestPast: '이번 주 가장 좋은 날은 지나갔어. 남은 날은 차분히 마무리하면서 힘을 모아 두자.',
    nextWeek: (d, k) => `다음 주는 ${dowOf(d)}요일(${md(d)})이 가장 좋은 날이야. 「${k}」의 기운이 모이니까 그날 할 일을 지금 하나 정해 둬.`,
    reward: (r, n, nx) => `해내면 ${RARITY_KO[r]} 부적을 줄게. 이번 주 도장 ${n}개${nx ? ` · ${nx.left}개 더 모으면 ${RARITY_KO[nx.rarity]} 부적이야` : ' · 이번 주 도장을 다 모았어'}.`,
    done: (c, n) => `오늘 쪽지 완료! ${withEul(c)} 도감에 넣어 뒀어. 이번 주 도장 ${n}개째야.`,
  },
  polite: {
    first: '오늘부터 제가 매일 쪽지를 남길게요. 하나씩만 같이 해 봐요.',
    yDone: '어제 쪽지, 해내셨더라고요. 정말 잘하셨어요.',
    yMiss: '어제 건 못 하셨어도 괜찮아요. 오늘 거 하나면 충분해요.',
    today: (t) => `오늘 할 일: ${t}`,
    bestToday: (k) => `오늘이 이번 주 가장 좋은 날이에요! 「${k}」의 기운이 모이니까 미뤄 둔 중요한 부탁·약속은 오늘 꺼내 보세요.`,
    bestAhead: (d, k) => `이번 주는 ${dowOf(d)}요일(${md(d)})이 가장 좋은 날이에요. 「${k}」의 기운이 모이는 날이라 중요한 일은 그날로 잡아 보세요. 그날 아침에 다시 알려 드릴게요.`,
    bestPast: '이번 주 가장 좋은 날은 지나갔어요. 남은 날은 차분히 마무리하면서 힘을 모아 두세요.',
    nextWeek: (d, k) => `다음 주는 ${dowOf(d)}요일(${md(d)})이 가장 좋은 날이에요. 「${k}」의 기운이 모이니까 그날 할 일을 지금 하나 정해 두세요.`,
    reward: (r, n, nx) => `해내시면 ${RARITY_KO[r]} 부적을 드릴게요. 이번 주 도장 ${n}개${nx ? ` · ${nx.left}개 더 모으면 ${RARITY_KO[nx.rarity]} 부적이에요` : ' · 이번 주 도장을 다 모으셨어요'}.`,
    done: (c, n) => `오늘 쪽지 완료! ${withEul(c)} 도감에 넣어 두었어요. 이번 주 도장 ${n}개째예요.`,
  },
};

/**
 * 쪽지 내용
 * @param dateKey 오늘 · today {year,month,day} · task 오늘 할 일 문장 · week weekOf(오늘) · nextWeek weekOf(다음 주 월요일, 일요일에만)
 * store 쪽지 저장값 · polite 존댓말(닭띠)
 */
export function buildNote({ today, task, week, nextWeek = null, store = {}, polite = false }) {
  const L = T[polite ? 'polite' : 'casual'];
  const dk = keyOf(today);
  const yd = new Date(Date.UTC(today.year, today.month - 1, today.day - 1));
  const yKey = `${yd.getUTCFullYear()}-${yd.getUTCMonth() + 1}-${yd.getUTCDate()}`;
  const hasAny = Object.keys(store || {}).some((k) => k !== dk);
  const opening = !hasAny ? L.first : store[yKey]?.done ? L.yDone : L.yMiss;
  const best = week.best; const bk = GOD_READING[best.god].keyword;
  const tNum = toNum(dk); const bNum = toNum(keyOf(best.date));
  const isSunday = new Date(tNum).getUTCDay() === 0;
  let weekLine;
  if (bNum === tNum) weekLine = L.bestToday(bk);
  else if (bNum > tNum) weekLine = L.bestAhead(best.date, bk);
  else if (isSunday && nextWeek) weekLine = L.nextWeek(nextWeek.best.date, GOD_READING[nextWeek.best.god].keyword);
  else weekLine = L.bestPast;
  const done = !!store[dk]?.done;
  const stamps = weekStamps(store, week);
  const rarity = stampRarity(stamps + (done ? 0 : 1)); // 오늘 해내면 받을 등급
  return {
    opening, task: L.today(task), weekLine, done,
    stamps, rarity, isBestToday: bNum === tNum,
    reward: done ? L.done(store[dk].charm || '부적', stamps) : L.reward(rarity, stamps, nextTier(stamps + 1)),
    days: week.days.map((d) => ({ dow: dowOf(d.date), done: !!store[keyOf(d.date)]?.done, today: keyOf(d.date) === dk, best: d === best })),
  };
}

/** 부적 이름 조사: 「희귀 재물부를」 */
export const withEul = (w) => `${w}${hasBatchim(w) ? '을' : '를'}`;
