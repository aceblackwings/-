// v0.64 100일 소원 등불(2,900원, 돈으로만) — 사용자 결정(2026-11-06):
// 「걱정은 무료, 소원은 유료, 기간이 길면 더 비싸게」 · 소원 부적 990원(복떡 50개로도) · 등불 2,900원(복떡 불가)
// 원칙: 점수와 무관(경험과 기록뿐). 돈을 낸 뒤 매일 느껴지게 = 홈의 등불 D-day + 지신이 매일 다른 한 줄로 빌어 줌
// + 10일마다 한 단계 밝아짐 + 25·50·75일째 편지 + 100일째 금빛 액자(이루어졌어요 / 100일 완주).
// 기록은 소원 부적과 같은 도감 칸(paid: 'lantern', forWho, letters, prayed, lastPray).
import { shiftDay } from './omen.js';
import { josa } from './josa.js';

export const LANTERN_DAYS = 100;
export const LANTERN_PRICE = 2900;
export const WISH_PRICE = 990;
export const LANTERN_STEP = 10;            // 10일마다 한 단계 밝아짐(0~10단계)
export const LETTER_DAYS = [25, 50, 75];   // 지신의 편지가 오는 날
export const FOR_MAX = 8;                  // 「누구를 위한 소원」 이름 글자 수

const dNum = (k) => { const [y, m, d] = String(k).split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
export const isLantern = (r) => r?.paid === 'lantern';
/** 만든 날 = 1일째, 100일째가 마지막 날(dueKey) */
export const lanternDue = (madeKey) => shiftDay(madeKey, LANTERN_DAYS - 1);
export function lanternDay(r, today) {
  const d = Math.round(dNum(today) - dNum(r.madeKey || r.dateKey)) + 1;
  return Math.max(1, Math.min(LANTERN_DAYS, d));
}
export const lanternLeft = (r, today) => LANTERN_DAYS - lanternDay(r, today);
/** 밝기 단계 0~10 (1~9일 0단계, 10일째 1단계 … 100일째 10단계) */
export const lanternStage = (day) => Math.max(0, Math.min(10, Math.floor(day / LANTERN_STEP)));
/** 홈에 보일 등불: 아직 결과가 없는 것(오래된 순) */
export const activeLanterns = (collection) => (collection || []).map((r, i) => ({ r, i })).filter(({ r }) => isLantern(r) && r.wish && !r.result)
  .sort((a, b) => dNum(a.r.madeKey) - dNum(b.r.madeKey));

/** 「누구를 위한 소원」: 빈칸·꺾쇠 정리, 「나」·「저」는 비움 */
export function cleanFor(text) {
  const t = String(text || '').replace(/[<>「」]/g, '').replace(/\s+/g, ' ').trim().slice(0, FOR_MAX);
  return /^(나|저|내|제|본인)$/.test(t) ? '' : t;
}
/** 「엄마를 위한 소원」 */
export const forLabel = (forWho) => (forWho ? `${josa(forWho, '을/를')} 위한 소원` : '');

/** 새 등불 기록(도감에 그대로 들어감) */
export function makeLantern(base, { wish, forWho, by, seal, today }) {
  return { ...base, label: '100일 소원 등불', wish, madeKey: today, dueKey: lanternDue(today), result: null, waited: 0,
    paid: 'lantern', by, seal, forWho: cleanFor(forWho), letters: [], prayed: 0, lastPray: null };
}

/** 오늘 함께 빌기(하루 한 번) */
export function pray(collection, i, today) {
  return (collection || []).map((r, j) => (j === i && isLantern(r) && r.lastPray !== today ? { ...r, prayed: (r.prayed || 0) + 1, lastPray: today } : r));
}
export const prayedToday = (r, today) => r?.lastPray === today;

/** 읽지 않은 편지 번호(1~3), 없으면 0 — 날이 지나도 안 읽었으면 다음에 보임 */
export function letterDue(r, today) {
  const day = lanternDay(r, today); const read = r.letters || [];
  const n = LETTER_DAYS.findIndex((d, k) => day >= d && !read.includes(k + 1));
  return n < 0 ? 0 : n + 1;
}
export function readLetter(collection, i, n) {
  return (collection || []).map((r, j) => (j === i ? { ...r, letters: [...new Set([...(r.letters || []), n])] } : r));
}
/** 100일을 채운 뒤 「100일 완주」로 벽에 걸기(이루어졌어요는 wish.js fulfill) */
export function keepLantern(collection, i, today) {
  return (collection || []).map((r, j) => (j === i && isLantern(r) ? { ...r, result: 'kept', doneKey: today } : r));
}

// ---------- 지신이 매일 빌어 주는 한 줄: 여는 말 5 × 본문 20 = 100일 모두 다른 문장 ----------
// [반말, 존댓말(닭띠)] · {w} = 소원, {f} = 「엄마를 위해」 같은 말(없으면 빈칸)
const OPEN = [
  ['오늘도 등불 앞에서 네 이름을 불렀어.', '오늘도 등불 앞에서 이름을 불러 드렸어요.'],
  ['아침에 등불 심지를 새로 갈았어.', '아침에 등불 심지를 새로 갈아 두었어요.'],
  ['등불에 기름을 조금 더 부어 두었어.', '등불에 기름을 조금 더 부어 두었어요.'],
  ['바람이 불어도 등불은 꺼지지 않았어.', '바람이 불어도 등불은 꺼지지 않았어요.'],
  ['등불 옆에서 조용히 두 손을 모았어.', '등불 옆에서 조용히 두 손을 모았어요.'],
];
const BODY = [
  ['「{w}」, {f}오늘도 한 번 더 빌었어.', '「{w}」, {f}오늘도 한 번 더 빌었어요.'],
  ['소원은 하루에 한 걸음씩 가까워진대. 오늘 걸음도 내가 세어 둘게.', '소원은 하루에 한 걸음씩 가까워진대요. 오늘 걸음도 제가 세어 둘게요.'],
  ['「{w}」를 위해 오늘 할 수 있는 작은 일 하나만 해 보자.', '「{w}」를 위해 오늘 할 수 있는 작은 일 하나만 해 봐요.'],
  ['서두르지 않아도 돼. 등불은 매일 조금씩 밝아지는 거니까.', '서두르지 않아도 돼요. 등불은 매일 조금씩 밝아지니까요.'],
  ['오늘 하루가 소원 쪽으로 기울도록 빌었어.', '오늘 하루가 소원 쪽으로 기울도록 빌었어요.'],
  ['어제보다 불빛이 조금 따뜻해졌어. 너도 느껴져?', '어제보다 불빛이 조금 따뜻해졌어요. 느껴지세요?'],
  ['소원을 마음속으로 한 번 소리 내어 말해 봐. 등불이 더 잘 들어.', '소원을 마음속으로 한 번 말해 보세요. 등불이 더 잘 들어요.'],
  ['{f}「{w}」, 이 한 줄을 오늘도 등불에 비춰 두었어.', '{f}「{w}」, 이 한 줄을 오늘도 등불에 비춰 두었어요.'],
  ['오늘 좋은 일이 하나 있었다면, 그건 등불이 먼저 알아봤을 거야.', '오늘 좋은 일이 하나 있었다면, 등불이 먼저 알아봤을 거예요.'],
  ['쉬어 가는 날도 괜찮아. 그런 날엔 내가 대신 빌어 둘게.', '쉬어 가는 날도 괜찮아요. 그런 날엔 제가 대신 빌어 둘게요.'],
  ['작은 소식 하나가 오면 꼭 기억해 둬. 등불이 보낸 신호일지 몰라.', '작은 소식 하나가 오면 꼭 기억해 두세요. 등불이 보낸 신호일지 몰라요.'],
  ['「{w}」, 오늘은 이 소원이 이루어진 날을 잠깐 떠올려 보자.', '「{w}」, 오늘은 이 소원이 이루어진 날을 잠깐 떠올려 봐요.'],
  ['오늘 만난 사람 중에 소원을 도와줄 사람이 있을지도 몰라.', '오늘 만난 사람 중에 소원을 도와줄 분이 계실지도 몰라요.'],
  ['불빛이 흔들리지 않게 내가 두 손으로 감싸 두었어.', '불빛이 흔들리지 않게 제가 두 손으로 감싸 두었어요.'],
  ['소원을 적던 날의 마음, 오늘도 그대로 등불 안에 있어.', '소원을 적던 날의 마음, 오늘도 그대로 등불 안에 있어요.'],
  ['{f}오늘 밤에도 등불은 켜 둘게. 편히 자.', '{f}오늘 밤에도 등불은 켜 둘게요. 편히 주무세요.'],
  ['오늘 한 일 중에 소원과 닮은 일이 하나쯤 있었을 거야.', '오늘 하신 일 중에 소원과 닮은 일이 하나쯤 있었을 거예요.'],
  ['소원은 잊지 않는 사람에게 먼저 온대. 오늘도 잊지 않았네.', '소원은 잊지 않는 사람에게 먼저 온대요. 오늘도 잊지 않으셨네요.'],
  ['오늘은 등불 둘레에 작은 꽃잎 하나를 놓아 두었어.', '오늘은 등불 둘레에 작은 꽃잎 하나를 놓아 두었어요.'],
  ['「{w}」, 이 소원을 품은 너를 오늘도 응원해.', '「{w}」, 이 소원을 품으신 마음을 오늘도 응원해요.'],
];
/** n일째(1~100) 문장 — 날마다 다르고, 100일 동안 겹치지 않음 */
export function lanternLine(r, day, polite = false) {
  const k = Math.max(0, Math.min(LANTERN_DAYS - 1, day - 1));
  const p = polite ? 1 : 0;
  const f = r.forWho ? `${josa(r.forWho, '을/를')} 위해 ` : '';
  const body = BODY[Math.floor(k / OPEN.length) % BODY.length][p].replace('{w}', r.wish || '').replace('{f}', f);
  // 「{w}」를 → 소원 끝 글자에 맞는 조사
  const fixed = body.replace(/「([^」]*)」를/g, (m, w) => `「${w}」${josa(w, '을/를').slice(w.length)}`);
  return `${OPEN[k % OPEN.length][p]} ${fixed}`;
}
export const ALL_OPEN = OPEN; export const ALL_BODY = BODY;

// ---------- 25·50·75일째 편지 ----------
const LETTERS = [
  [ // 25일째
    ['등불을 켠 지 25일이 됐어.', '처음 「{w}」를 적던 날, 글씨가 조금 떨렸던 거 기억나? 그 마음이 지금도 불빛 한가운데 있어.', '남은 75일도 내가 매일 빌어 둘게. 너는 하루에 한 걸음만 걸어 줘.'],
    ['등불을 켠 지 25일이 됐어요.', '처음 「{w}」를 적으시던 날의 마음, 지금도 불빛 한가운데 있어요.', '남은 75일도 제가 매일 빌어 둘게요. 하루에 한 걸음만 걸어 주세요.'],
  ],
  [ // 50일째
    ['오늘로 꼭 절반이야. 등불이 처음보다 다섯 배쯤 밝아졌어.', '절반쯤 오면 「정말 될까?」 싶은 날이 생겨. 그런 날이 와도 괜찮아. 등불은 그런 날에 더 잘 타거든.', '지금까지 걸어온 50일을 한 번만 돌아봐 줘. 생각보다 많이 왔을 거야.'],
    ['오늘로 꼭 절반이에요. 등불이 처음보다 다섯 배쯤 밝아졌어요.', '절반쯤 오면 「정말 될까?」 싶은 날이 생겨요. 그런 날이 와도 괜찮아요. 등불은 그런 날에 더 잘 타거든요.', '지금까지 걸어온 50일을 한 번만 돌아봐 주세요. 생각보다 많이 오셨을 거예요.'],
  ],
  [ // 75일째
    ['이제 25일 남았어. 등불이 거의 다 찼어.', '「{w}」, 이 소원이 이루어지면 제일 먼저 누구에게 말하고 싶어? 그 사람 얼굴을 한 번 떠올려 봐.', '100일째 되는 날, 내가 먼저 물어볼게. 그날까지 같이 가자.'],
    ['이제 25일 남았어요. 등불이 거의 다 찼어요.', '「{w}」, 이 소원이 이루어지면 제일 먼저 누구에게 말하고 싶으세요? 그분 얼굴을 한 번 떠올려 보세요.', '100일째 되는 날, 제가 먼저 여쭤볼게요. 그날까지 같이 가요.'],
  ],
];
export function lanternLetter(r, n, polite = false) {
  const L = LETTERS[n - 1]; if (!L) return [];
  return L[polite ? 1 : 0].map((s) => s.replace('{w}', r.wish || '').replace(/「([^」]*)」를/g, (m, w) => `「${w}」${josa(w, '을/를').slice(w.length)}`));
}
export const ALL_LETTERS = LETTERS;

/** 100일째 물음 · 완주 문장 */
export function lanternAsk(r, polite = false) {
  const w = r.wish || '';
  return polite ? `100일 동안 하루도 빠짐없이 등불을 지켰어요. 「${w}」, 이루어졌나요?` : `100일 동안 하루도 빠짐없이 등불을 지켰어. 「${w}」, 이루어졌어?`;
}
export const keptLine = (polite = false) => (polite
  ? '100일을 끝까지 함께 걸었어요. 이 등불은 금빛 액자에 걸어 둘게요. 소원은 지금도 자라고 있어요.'
  : '100일을 끝까지 함께 걸었어. 이 등불은 금빛 액자에 걸어 둘게. 소원은 지금도 자라고 있어.');

// ---------- 걱정 태우기: 무료, 하루 한 번(걱정 글은 저장하지 않음 — 날짜만) ----------
export const canBurnToday = (store, today) => (store?.last || '') !== today;
export const markBurned = (store, today) => ({ ...(store || {}), last: today, count: ((store || {}).count || 0) + 1 });
