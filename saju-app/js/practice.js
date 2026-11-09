// 한 가지 습관과 함께한 기록. 날짜·행동은 기기에만 보관한다.
import { STAGE_POINTS, stageForPoints } from './jisin.js';
export const PRACTICE_KEY = 'unmyeong2099.practice';
export const PRACTICE_POINTS = 4;
export const IDEAS = [
  { id: 'read', icon: '📖', title: '책 한 쪽 읽기', cue: '휴대전화를 충전기에 꽂으면', setup: '충전기 옆에 읽고 싶은 책을 놓아두세요.' },
  { id: 'tidy', icon: '🧺', title: '물건 하나 제자리에 놓기', cue: '집에 들어와 가방을 내려놓으면', setup: '열쇠나 작은 물건을 둘 자리를 하나 정해 보세요.' },
  { id: 'stretch', icon: '🌿', title: '가볍게 몸 펴기', cue: '오래 앉아 있다가 일어나면', setup: '몸이 편한 범위에서 잠깐 펴 보세요.' },
  { id: 'note', icon: '✍️', title: '좋았던 순간 하나 적기', cue: '잠자리에 들기 전', setup: '메모할 종이를 손 닿는 곳에 놓아두세요.' },
];
export const clean = (value, limit = 80) => String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit);
export function validDay(key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key || '')) return false;
  const d = new Date(`${key}T12:00:00Z`);
  return Number.isFinite(+d) && d.toISOString().slice(0, 10) === key;
}
export function shift(key, days) { const d = new Date(`${key}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); }
export function createPractice({ points = 0, stage = 1, legacy = {}, today } = {}) {
  return { version: 1, started: today, baseline: Math.max(0, Number(points) || 0, STAGE_POINTS[stage] || 0), baselineStage: stage,
    current: null, entries: {}, rests: {}, legacy: JSON.parse(JSON.stringify(legacy || {})) };
}
export function choose(store, habit) {
  const title = clean(habit.title, 40); const cue = clean(habit.cue, 60);
  if (!title || !cue) return store;
  return { ...store, current: { id: clean(habit.id || 'custom', 30), title, cue, setup: clean(habit.setup, 100) } };
}
export function completePractice(store, day, note = '') {
  if (!validDay(day) || !store.current || store.entries[day]) return { store, changed: false };
  const entry = { ...store.current, day, points: PRACTICE_POINTS, note: clean(note, 140) };
  const rests = { ...store.rests }; delete rests[day];
  return { store: { ...store, entries: { ...store.entries, [day]: entry }, rests }, changed: true };
}
export function undoPractice(store, day) {
  if (!store.entries[day]) return { store, changed: false };
  const entries = { ...store.entries }; delete entries[day];
  return { store: { ...store, entries }, changed: true };
}
export function restPractice(store, day) {
  if (!validDay(day) || store.entries[day]) return store;
  return { ...store, rests: { ...store.rests, [day]: true } };
}
export const totalPoints = (store) => store.baseline + Object.values(store.entries).reduce((n, e) => n + e.points, 0);
export const practiceStage = (store) => Math.max(store.baselineStage, stageForPoints(totalPoints(store)));
export function weekDays(day) {
  const dow = new Date(`${day}T12:00:00Z`).getUTCDay();
  const monday = shift(day, -((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => shift(monday, i));
}
export function monthDays(month) {
  if (!/^\d{4}-\d{2}$/.test(month) || !validDay(`${month}-01`)) return [];
  const days = []; for (let k = `${month}-01`; k.startsWith(month); k = shift(k, 1)) days.push(k);
  return days;
}
export function monthShift(month, amount) {
  const d = new Date(`${month}-01T12:00:00Z`); d.setUTCMonth(d.getUTCMonth() + amount); return d.toISOString().slice(0, 7);
}
export function habitTotals(store, month) {
  const counts = new Map();
  Object.values(store.entries).filter(e => !month || e.day.startsWith(month)).forEach(e => counts.set(e.title, (counts.get(e.title) || 0) + 1));
  return [...counts].map(([title, days]) => ({ title, days }));
}

/** 현재 유효한 실천만으로 다시 계산해 취소한 기록도 정확히 반영한다. */
export function milestones(store) {
  let points = store.baseline, stage = Math.max(store.baselineStage, stageForPoints(store.baseline)), count = 0;
  const out = [];
  for (const e of Object.values(store.entries).sort((a,b) => a.day.localeCompare(b.day))) {
    points += e.points; count++;
    const next = Math.max(store.baselineStage, stageForPoints(points));
    if (next > stage) out.push({ day: e.day, stage: next, title: e.title, count });
    stage = next;
  }
  return out;
}
