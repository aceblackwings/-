// 지신 떡방앗간 (v0.42, 2026-11-04 사용자 요청: 「할 일을 하거나 결제한 사람은 2027년 운세·사주를 바로 볼 수 있게, 지신과 관련된 귀여운 결제」)
// 화폐 = 🍡 복떡. 지신이 떡을 먹고 기운을 내면 두루마리(2027년 운세 · 내 사주)를 펼쳐 준다.
// · 오늘 할 일 3가지(좋은 습관 하나 · 12지신 타로 · 지신 꾸미기)를 다 하면 → 그날은 둘 다 무료로 열림 + 복떡 보너스
// · 복떡을 내면 → 그 두루마리는 계속 열림
// · 설계 원칙 3: 결제는 「보는 것」만 열고 운 점수는 올리지 않음
// 저장 unmyeong2099.tteok · 순수 로직(테스트: tests/tteok.test.mjs)

export const TTEOK = '🍡';
export const WELCOME = 10;             // 처음 들어온 날 선물
export const DAILY_VISIT = 1;          // 하루 첫 방문
export const ALL_BONUS = 5;            // 오늘 할 일 3가지를 다 하면
export const TASKS = [
  { key: 'habit', icon: '☂️', label: '좋은 습관 하나 하기', reward: 3, go: 'note' },
  { key: 'tarot', icon: '🔮', label: '12지신 타로 보기', reward: 2, go: 'tarot' },
  { key: 'care', icon: '🐉', label: '지신 꾸미기(부적 달기·쓰다듬기)', reward: 2, go: 'hero' },
];
export const SCROLLS = {
  next: { icon: '📜', label: '2027년 운세', cost: 30, desc: '대운·재물·사업·건강·가족·자녀운까지 한 해를 책처럼' },
  saju: { icon: '🀄', label: '내 사주 풀이', cost: 20, desc: '타고난 기질·그릇·용신·일주까지 자세히' },
};
// 체험판(프로토타입)은 실제 결제 없이 받기만. 가격은 정식 앱용 안내
export const PACKS = [
  { key: 'plate', icon: '🍡', label: '떡 한 접시', tteok: 10, bonus: 0, price: 1100 },
  { key: 'box', icon: '🎁', label: '떡 한 상자', tteok: 30, bonus: 5, price: 3300 },
  { key: 'feast', icon: '🎊', label: '지신 잔칫상', tteok: 100, bonus: 30, price: 9900 },
];

// v0.42.1 계절 소품 보상: 할 일 하나 = 꾸미기 조각 🎀 1개, 6개면 계절 소품 하나(지금·다가오는 시즌 순서로 아직 없는 것)
export const PIECES_PER_ITEM = 6;
export const emptyTteok = () => ({ balance: 0, welcomed: false, unlocked: {}, days: {}, log: [], pieces: 0 });
const norm = (s) => ({ ...emptyTteok(), ...(s || {}), unlocked: { ...(s?.unlocked || {}) }, days: { ...(s?.days || {}) } });
const addLog = (s, text, n) => ({ ...s, balance: s.balance + n, log: [{ text, n }, ...s.log].slice(0, 30) });

/** 하루 첫 방문: 처음이면 환영 선물, 매일 +1. gained = 이번에 받은 떡 */
export function visit(store, dateKey) {
  let s = norm(store); let gained = 0;
  if (!s.welcomed) { s = addLog({ ...s, welcomed: true }, '지신의 환영 선물', WELCOME); gained += WELCOME; }
  if (!s.days[dateKey]?.visited) {
    s = addLog({ ...s, days: { ...s.days, [dateKey]: { ...(s.days[dateKey] || {}), visited: true } } }, '오늘 들러 준 선물', DAILY_VISIT); gained += DAILY_VISIT;
  }
  return { store: pruneDays(s, dateKey), gained };
}

/** 오늘 할 일 완료. 처음 한 번만 보상, 셋 다 하면 보너스 */
export function doTask(store, dateKey, key) {
  const t = TASKS.find((x) => x.key === key); let s = norm(store);
  const day = { ...(s.days[dateKey] || {}) }; const tasks = { ...(day.tasks || {}) };
  if (!t || tasks[key]) return { store: s, gained: 0, allDone: allDoneOf(tasks), first: false };
  tasks[key] = true; day.tasks = tasks;
  s = addLog({ ...s, pieces: (s.pieces || 0) + 1, days: { ...s.days, [dateKey]: day } }, t.label, t.reward); let gained = t.reward;
  const all = allDoneOf(tasks); let first = false;
  if (all && !day.bonus) { first = true; s = addLog({ ...s, days: { ...s.days, [dateKey]: { ...day, bonus: true } } }, '오늘 할 일 모두 완료', ALL_BONUS); gained += ALL_BONUS; }
  return { store: s, gained, allDone: all, first, itemReady: (s.pieces || 0) >= PIECES_PER_ITEM };
}
const allDoneOf = (tasks) => TASKS.every((t) => tasks?.[t.key]);
export const todayTasks = (store, dateKey) => TASKS.map((t) => ({ ...t, done: !!norm(store).days[dateKey]?.tasks?.[t.key] }));
export const doneCount = (store, dateKey) => todayTasks(store, dateKey).filter((t) => t.done).length;

/** 두루마리가 열려 있는지: 떡으로 연 것(계속) 또는 오늘 할 일을 다 한 날 */
export function isOpen(store, dateKey, what) {
  const s = norm(store);
  if (s.unlocked[what]) return 'paid';
  if (allDoneOf(s.days[dateKey]?.tasks)) return 'today';
  return null;
}

/** 떡으로 열기 */
export function spend(store, what) {
  const s = norm(store); const sc = SCROLLS[what];
  if (!sc) return { store: s, ok: false, reason: 'unknown' };
  if (s.unlocked[what]) return { store: s, ok: true, already: true };
  if (s.balance < sc.cost) return { store: s, ok: false, reason: 'short', need: sc.cost - s.balance };
  const next = addLog({ ...s, unlocked: { ...s.unlocked, [what]: true } }, `${sc.label} 열기`, -sc.cost);
  return { store: next, ok: true };
}

/** 떡 받기(체험판: 결제 없이) */
export function buy(store, packKey) {
  const p = PACKS.find((x) => x.key === packKey); const s = norm(store);
  if (!p) return { store: s, gained: 0 };
  const n = p.tteok + p.bonus;
  return { store: addLog(s, `${p.label} 받기`, n), gained: n };
}

/** 상품에 딸린 복떡 받기(v0.48 올인원 패키지 복떡 50개 등) */
export function gift(store, label, n) { return { store: addLog(norm(store), label, n), gained: n }; }

/** 오래된 날 기록은 40일까지만 */
function pruneDays(s, dateKey) {
  const keys = Object.keys(s.days); if (keys.length <= 40) return s;
  const ord = (k) => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  const keep = keys.sort((a, b) => ord(b) - ord(a)).slice(0, 40);
  if (!keep.includes(dateKey)) keep.push(dateKey);
  return { ...s, days: Object.fromEntries(keep.map((k) => [k, s.days[k]])) };
}

/**
 * 조각 6개로 계절 소품 하나 고르기
 * @param seasons 지금·다가오는 시즌 목록(시작 순서, {id, key}) · ownedIds 이미 가진 소품 id 집합
 * @returns { store, item } — 줄 소품이 없으면 item null(조각은 그대로 둠)
 */
export function claimItem(store, seasons, ownedIds) {
  const s = norm(store);
  if ((s.pieces || 0) < PIECES_PER_ITEM) return { store: s, item: null };
  const item = seasons.find((x) => !ownedIds.has(x.id)) || null;
  if (!item) return { store: s, item: null };
  return { store: { ...s, pieces: s.pieces - PIECES_PER_ITEM }, item };
}

// ---------- 타로 이용(v0.46.1, 2026-11-04 사용자 결정): 하루 1회 무료, 그다음부터는 복떡 ----------
// 현금 소액 결제(300원대)는 스토어 수수료와 결제 피로가 커서, 무료로도 모을 수 있는 복떡으로 받는다
// 복떡 꾸러미(10개 1,100원)가 현금 상품이 되고, 매일 들르기·할 일로 모은 복떡으로도 더 볼 수 있음
// v0.59(2026-11-06 사용자 결정): 복떡은 습관 체크(하나에 2개)·코디 별 보상으로만 모으고, 타로는 할 때마다 3개(무료 없음)
export const TAROT_FREE_PER_DAY = 0;
export const TAROT_COST = { one: 3, three: 3 };
export const tarotUsed = (store, dateKey) => norm(store).days[dateKey]?.tarot || 0;
/** 이번 뽑기 값: { free: true } 또는 { free: false, cost } */
export function tarotPrice(store, dateKey, spread) {
  if (tarotUsed(store, dateKey) < TAROT_FREE_PER_DAY) return { free: true, cost: 0 };
  return { free: false, cost: TAROT_COST[spread] ?? TAROT_COST.one };
}
/** 카드를 펼칠 때 한 번 셈: 무료면 횟수만, 아니면 복떡을 씀(모자라면 ok:false, need) */
export function useTarot(store, dateKey, spread) {
  const s = norm(store); const pr = tarotPrice(s, dateKey, spread);
  if (!pr.free && s.balance < pr.cost) return { store: s, ok: false, need: pr.cost - s.balance, cost: pr.cost };
  const day = s.days[dateKey] || {};
  let next = { ...s, days: { ...s.days, [dateKey]: { ...day, tarot: (day.tarot || 0) + 1 } } };
  if (!pr.free) next = addLog(next, `타로 ${spread === 'three' ? '세 장' : '한 장'}`, -pr.cost);
  return { store: next, ok: true, free: pr.free, cost: pr.cost };
}

// ---------- v0.59 궁합·소원 부적·나쁜 기운 태우기 ----------
// 궁합: 새 친구 한 명당 복떡 2개(같은 친구는 다시 무료) · 소원 부적/태우기 부적: 990원 또는 복떡 50개로 한 번(모으면 또 한 번)
export const COMPAT_COST = 2;
export const CHARM_TTEOK = 50;
export const CHARM_PRICE = 990;
export const friendKey = (fr) => `${fr.calendar || 'solar'}-${fr.year}-${fr.month}-${fr.day}`;
export const compatOpen = (store, key) => !!norm(store).compat?.[key];
/** 새 친구 궁합 열기: 이미 연 친구면 무료 */
export function useCompat(store, key) {
  const s = { ...norm(store), compat: { ...(norm(store).compat || {}) } };
  if (s.compat[key]) return { store: s, ok: true, free: true };
  if (s.balance < COMPAT_COST) return { store: s, ok: false, need: COMPAT_COST - s.balance };
  return { store: addLog({ ...s, compat: { ...s.compat, [key]: true } }, '궁합 보기', -COMPAT_COST), ok: true, free: false };
}
/** 예전에 궁합을 본 친구는 열린 것으로(한 번만) */
export function grandfatherCompat(store, keys) {
  const s = norm(store); const compat = { ...(s.compat || {}) };
  for (const k of keys) compat[k] = true;
  return { ...s, compat };
}
/** 소원 부적·태우기 부적을 복떡 50개로 */
export function useCharmTteok(store, kind) {
  const s = norm(store);
  if (s.balance < CHARM_TTEOK) return { store: s, ok: false, need: CHARM_TTEOK - s.balance };
  return { store: addLog(s, kind === 'wish' ? '소원 부적' : '나쁜 기운 태우기 부적', -CHARM_TTEOK), ok: true };
}
