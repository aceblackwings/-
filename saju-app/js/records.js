// 기록함(v0.22): 날마다 본 운세를 저장하고, 다음 날 "어제 운세 맞았나요?"를 묻는다.
// 질문 답·운세 풀이·신수 카드 같은 결과도 메모와 함께 저장해 다시 볼 수 있다.
// 화면과 무관한 순수 로직만 둔다(테스트: tests/records.test.mjs). 저장 키: unmyeong2099.records
// 원칙 5: 기록은 기기에만 저장. 생년월일·사주 원본은 넣지 않는다.

export const DAY_LIMIT = 120; // 날마다 운세 기록은 최근 120일까지
export const ITEM_LIMIT = 100; // 저장한 결과는 100개까지
export const MEMO_MAX = 200;

export const FEEDBACK = {
  yes: { icon: '🎯', label: '맞았어요' },
  half: { icon: '🤔', label: '반반이에요' },
  no: { icon: '🙅', label: '아니었어요' },
};

export const ITEM_KIND = {
  ask: { icon: '🔮', label: '질문 답' },
  reading: { icon: '📖', label: '운세 풀이' },
  card: { icon: '🃏', label: '신수 카드' },
};

export const emptyRecords = () => ({ days: {}, items: [] });

/** {year, month, day} → 'YYYY-M-D' (fortune.js dateKey와 같은 모양) */
export const dayKey = (d) => `${d.year}-${d.month}-${d.day}`;
const parseKey = (k) => { const [year, month, day] = k.split('-').map(Number); return { year, month, day }; };
const ord = (k) => { const d = parseKey(k); return Date.UTC(d.year, d.month - 1, d.day); };

/** 하루 전 날짜 */
export function prevDay(d) {
  const t = new Date(Date.UTC(d.year, d.month - 1, d.day - 1));
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}

const cleanMemo = (m) => String(m || '').replace(/\s+/g, ' ').trim().slice(0, MEMO_MAX);

/** 오늘 운세를 기록 (같은 날 다시 보면 점수·문장만 갱신하고 피드백·메모는 지킨다) */
export function logDay(rec, snap) {
  const r = rec || emptyRecords();
  const prev = r.days[snap.dateKey] || {};
  const days = { ...r.days, [snap.dateKey]: { ...prev, title: snap.title, score: snap.score, best: snap.best || null, worst: snap.worst || null, mission: snap.mission || null } };
  const keys = Object.keys(days).sort((a, b) => ord(a) - ord(b));
  keys.slice(0, Math.max(0, keys.length - DAY_LIMIT)).forEach((k) => delete days[k]);
  return { ...r, days };
}

/** 오늘 물어볼 "어제 운세" (어제 기록이 있고 아직 답하지 않았을 때만) */
export function pendingFeedback(rec, today) {
  const r = rec || emptyRecords();
  const k = dayKey(prevDay(today));
  const d = r.days[k];
  if (!d || d.feedback || d.skipped) return null;
  return { dateKey: k, ...d };
}

/** 맞았나요? 답 기록. changed = 처음 답했는지 */
export function setFeedback(rec, dateKey, value, memo) {
  const r = rec || emptyRecords();
  const d = r.days[dateKey];
  if (!d || !(value in FEEDBACK || value === 'skip')) return { rec: r, changed: false };
  const first = !d.feedback;
  const next = value === 'skip' ? { ...d, skipped: true } : { ...d, feedback: value, skipped: false, ...(memo !== undefined ? { memo: cleanMemo(memo) } : {}) };
  return { rec: { ...r, days: { ...r.days, [dateKey]: next } }, changed: first && value !== 'skip' };
}

export function setDayMemo(rec, dateKey, memo) {
  const r = rec || emptyRecords();
  if (!r.days[dateKey]) return r;
  return { ...r, days: { ...r.days, [dateKey]: { ...r.days[dateKey], memo: cleanMemo(memo) } } };
}

/** 결과 저장 (같은 날 같은 종류·같은 제목이면 덮어씀) */
export function addItem(rec, item) {
  const r = rec || emptyRecords();
  const id = `${item.kind}|${item.dateKey}|${item.key || item.title}`;
  const old = r.items.find((x) => x.id === id);
  const next = { id, kind: item.kind, dateKey: item.dateKey, title: item.title, score: item.score ?? null, summary: item.summary || '', lines: (item.lines || []).slice(0, 6), memo: cleanMemo(item.memo ?? old?.memo) };
  const items = [next, ...r.items.filter((x) => x.id !== id)].slice(0, ITEM_LIMIT);
  return { rec: { ...r, items }, isNew: !old };
}

export const hasItem = (rec, kind, dateKey, key) => !!(rec || emptyRecords()).items.find((x) => x.id === `${kind}|${dateKey}|${key}`);

export function setItemMemo(rec, id, memo) {
  const r = rec || emptyRecords();
  return { ...r, items: r.items.map((x) => (x.id === id ? { ...x, memo: cleanMemo(memo) } : x)) };
}

export function removeItem(rec, id) {
  const r = rec || emptyRecords();
  return { ...r, items: r.items.filter((x) => x.id !== id) };
}

/** 최근 날 기록 (새것부터) */
export function dayList(rec, limit = 30) {
  const r = rec || emptyRecords();
  return Object.entries(r.days).sort((a, b) => ord(b[0]) - ord(a[0])).slice(0, limit).map(([dateKey, d]) => ({ dateKey, date: parseKey(dateKey), ...d }));
}

/** 맞았어요 비율 등 (반쯤은 0.5로 셈) */
export function stats(rec) {
  const days = Object.values((rec || emptyRecords()).days);
  const answered = days.filter((d) => d.feedback);
  const yes = answered.filter((d) => d.feedback === 'yes').length;
  const half = answered.filter((d) => d.feedback === 'half').length;
  const hitRate = answered.length ? Math.round(((yes + half * 0.5) / answered.length) * 100) : null;
  // 점수가 높았던 날(70+)과 낮았던 날(55 미만)에 각각 얼마나 맞았는지
  const band = (f) => { const a = answered.filter(f); return a.length ? Math.round((a.filter((d) => d.feedback !== 'no').length / a.length) * 100) : null; };
  return { logged: days.length, answered: answered.length, yes, half, no: answered.length - yes - half, hitRate, highHit: band((d) => d.score >= 70), lowHit: band((d) => d.score < 55), items: (rec || emptyRecords()).items.length };
}

/** 연속으로 운세를 본 날 수 (오늘 포함, 오늘 기록이 없으면 어제부터) */
export function streak(rec, today) {
  const r = rec || emptyRecords();
  let d = r.days[dayKey(today)] ? today : prevDay(today);
  let n = 0;
  while (r.days[dayKey(d)]) { n++; d = prevDay(d); }
  return n;
}
