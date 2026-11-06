// 오늘의 포춘 쿠키(v0.59, 2026-11-06 사용자 「첫 화면 = 지신이 포춘 기계를 돌리고, 쿠키를 쪼개면 오늘의 운세」)
// · 하루 한 번: 지신 누르기 → 기계가 돌고 쿠키가 굴러 나옴 → 쿠키를 눌러 쪼개면 오늘의 운세
// · 다시 들어오면 쪼개진 쿠키와 운세가 바로 보임. 「한 번 더 굴려 보기」는 연출만(운세는 하루 동안 같음)
// · 긁어서 보는 칸 3개 = 행운의 색 · 행운의 숫자 · 오늘 할 일 1가지(내 사주에 모자란 기운을 채우는 일)
// 저장 unmyeong2099.cookie = { days: { dateKey: true } } (14일). 순수 로직만(테스트: tests/cookie.test.mjs)
import { EL_TALE, EL_NAME } from './storybook.js';

export const COOKIE_KEY = 'unmyeong2099.cookie';
const toNum = (k) => { const [y, m, d] = String(k).split('-').map(Number); return y * 10000 + m * 100 + d; };
const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };

export const isOpened = (store, dateKey) => !!(store?.days || {})[dateKey];
export function markOpened(store, dateKey) {
  const days = { ...(store?.days || {}), [dateKey]: true };
  const keep = Object.keys(days).sort((a, b) => toNum(b) - toNum(a)).slice(0, 14);
  return { ...(store || {}), days: Object.fromEntries(keep.map((k) => [k, true])) };
}

/**
 * 오늘 할 일 1가지: 가장 필요한 기운(용신) 이틀 · 가장 적은 기운 하루 꼴로 번갈아, 그 기운을 채우는 생활 습관 하나
 * @returns { el, name, text, why }
 */
export function todayTodo(saju, dateKey, seed = '') {
  const h = hash(`${dateKey}|${seed}`);
  const useWeak = h % 3 === 2 && saju.weakest !== saju.yongsin;
  const el = useWeak ? saju.weakest : saju.yongsin;
  const list = EL_TALE[el].bring;
  const text = list[Math.floor(h / 3) % list.length];
  const why = useWeak ? `내 사주에 가장 적은 ${EL_NAME[el]} 기운을 채워 주는 일이에요.` : `나에게 가장 필요한 ${EL_NAME[el]} 기운을 채워 주는 일이에요.`;
  return { el, name: EL_NAME[el], text, why };
}

/** 긁는 칸 3개: 행운의 색 · 행운의 숫자 · 오늘 할 일(넓은 칸) */
export function cookieTiles(luck, todo) {
  const L = luck || {};
  return [
    { key: 'color', icon: '🎨', label: '행운의 색', value: L.color || '' },
    { key: 'number', icon: '🔢', label: '행운의 숫자', value: String(L.number ?? '') },
    { key: 'todo', icon: '🌱', label: '오늘 할 일', value: todo?.text || '', sub: todo?.why || '', wide: true },
  ];
}
