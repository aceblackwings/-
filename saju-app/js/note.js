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

// ---------- ③ 다음 달 미리보기 열쇠: 이달(양력) 도장 20개 ----------
export const MONTH_KEY_NEED = 20;
export const monthStamps = (store, year, month) => Object.entries(store || {}).filter(([k, v]) => v?.done && k.startsWith(`${year}-${month}-`)).length;

// ---------- ② 수호신의 이야기: 쌓인 도장(전체) 수로 하나씩 열림 ----------
export const STORY_STEPS = [1, 3, 5, 7, 10, 14, 20, 30];
/** 도장 수가 before → after로 늘 때 새로 열린 이야기 번호(0부터), 없으면 -1 */
export function newStoryIndex(before, after) {
  return STORY_STEPS.findIndex((n) => before < n && after >= n);
}
export const storiesOpen = (total) => STORY_STEPS.filter((n) => total >= n).length;

/**
 * 이야기 8편. facts는 앱이 사주에서 뽑아 넘김(이 모듈은 문장만 만듦)
 * facts = { name, animal, dayName, dayImage, dayText, gyeokName, gyeokTitle, strengths[], johu, luck{color,direction,item}, sinsal[{name,note}], stage, stageNote, nextDaewoon }
 */
export function buildStories(f, polite = false) {
  const y = (c, p) => (polite ? p : c);
  const J = (w, a, b) => `${w}${hasBatchim(w) ? a : b}`; // 받침 조사
  const cop = (w) => (polite ? J(w, '이에요', '예요') : J(w, '이야', '야')); // ~이야/~예요
  const who = f.name ? (polite ? `${f.name} 님` : f.name) : y('너', '당신');
  const str = f.strengths.join(', ');
  return [
    { need: 1, title: `${f.animal} 수호신이 찾아온 이유`, text: `${J(who, '의', '의')} 일간은 ${f.dayName}, ${cop(f.dayImage)}. ${f.dayText} ${y(`그래서 내가 ${who} 곁에 왔어.`, '그래서 제가 곁에 왔어요.')}` },
    { need: 3, title: '타고난 그릇', text: `${J(who, '은', '는')} ${f.gyeokName}, 「${f.gyeokTitle}」${y('이야', '이에요')}. ${y('특히', '특히')} ${J(str, '이', '가')} ${y('내가 제일 자랑하고 싶은 점이야.', '제가 가장 자랑하고 싶은 점이에요.')}` },
    { need: 5, title: '계절이 건네는 처방', text: `${y(`이건 옛 책 『궁통보감』이 ${who}에게 남긴 처방이야.`, '옛 책 『궁통보감』이 남긴 처방이에요.')} ${f.johu}` },
    { need: 7, title: '나만의 행운 주머니', text: `${y('힘이 되는 색은', '힘이 되는 색은')} ${f.luck.color}, ${y('방향은', '방향은')} ${f.luck.direction}, ${y('곁에 두면 좋은 물건은', '곁에 두면 좋은 물건은')} ${cop(f.luck.item)}. ${y('일주일 동안 쪽지를 챙긴 선물이야.', '일주일 동안 쪽지를 챙기신 선물이에요.')}` },
    { need: 10, title: '사주에 숨은 별', text: f.sinsal.length ? `${y('사주에 숨은 별이 있어.', '사주에 숨은 별이 있어요.')} ${f.sinsal.map((x) => `「${x.name}」 — ${x.note}`).join(' / ')}. ${y('잘 쓰면 큰 힘이 되는 별들이야.', '잘 쓰면 큰 힘이 되는 별들이에요.')}` : y('사주에 한쪽으로 치우친 별이 없어. 그만큼 어떤 길로든 고르게 뻗을 수 있다는 뜻이야.', '사주에 한쪽으로 치우친 별이 없어요. 그만큼 어떤 길로든 고르게 뻗을 수 있다는 뜻이에요.') },
    { need: 14, title: '태어난 날의 힘', text: `${y('태어난 날은 12운성으로', '태어난 날은 12운성으로')} 「${f.stage}」 ${y('자리야.', '자리예요.')} 「${f.stageNote}」, ${y('그 힘이 늘 바탕에 흐르고 있어.', '그 힘이 늘 바탕에 흐르고 있어요.')}` },
    { need: 20, title: '다음 10년의 문', text: f.nextDaewoon ? `${y('비밀 하나 알려 줄게.', '비밀 하나 알려 드릴게요.')} ${f.nextDaewoon} ${y('미리 알고 준비하면 그 문이 훨씬 가볍게 열려.', '미리 알고 준비하면 그 문이 훨씬 가볍게 열려요.')}` : y('성별을 알려 주면 다음 10년의 문을 함께 열어 볼 수 있어.', '성별을 알려 주시면 다음 10년의 문을 함께 열어 볼 수 있어요.') },
    { need: 30, title: '수호신의 고백', text: y('서른 번이나 쪽지를 함께했네. 사실 운은 정해진 게 아니라 이렇게 매일 한 걸음씩 바뀌는 거야. 그걸 보여 줘서 고마워.', '서른 번이나 쪽지를 함께하셨네요. 사실 운은 정해진 게 아니라 이렇게 매일 한 걸음씩 바뀌는 거예요. 그걸 보여 주셔서 고마워요.') },
  ];
}

// ---------- ① 주간 편지 (일요일) ----------
/** week = weekOf(이번 주), store 쪽지, nextBest = { date, keyword } 다음 주 가장 좋은 날, fb = { yes, total } 이번 주 「어제 운세 맞았나요?」 */
export function weeklyLetter({ week, store = {}, name = '', animal = '', polite = false, nextBest = null, fb = null }) {
  const y = (c, p) => (polite ? p : c);
  const call = name ? y(`${name}${hasBatchim(name) ? '아' : '야'}, `, `${name} 님, `) : '';
  const done = week.days.filter((d) => store[keyOf(d.date)]?.done);
  const n = done.length;
  const lines = [];
  lines.push(`${call}${y(`이번 주 쪽지를 ${n}번 해냈어.`, `이번 주 쪽지를 ${n}번 해내셨어요.`)} ${n >= 7 ? y('일주일을 꽉 채웠어. 정말 대단해.', '일주일을 꽉 채우셨어요. 정말 대단해요.') : n >= 5 ? y('거의 매일 함께했네. 든든했어.', '거의 매일 함께해 주셔서 든든했어요.') : n >= 3 ? y('절반 가까이 해냈어. 습관이 자라고 있어.', '절반 가까이 해내셨어요. 습관이 자라고 있어요.') : n >= 1 ? y('바쁜 한 주였지? 그래도 해낸 날은 분명히 남아.', '바쁜 한 주였죠? 그래도 해낸 날은 분명히 남아요.') : y('이번 주는 쉬어 가는 주였네. 괜찮아, 다음 주에 하나부터 다시 해 보자.', '이번 주는 쉬어 가는 주였네요. 괜찮아요, 다음 주에 하나부터 다시 해 봐요.')}`);
  const b = week.best;
  lines.push(store[keyOf(b.date)]?.done
    ? y(`이번 주 가장 좋은 날이었던 ${dowOf(b.date)}요일(${md(b.date)})에도 쪽지를 해냈더라. 좋은 날을 잘 쓴 거야.`, `이번 주 가장 좋은 날이었던 ${dowOf(b.date)}요일(${md(b.date)})에도 해내셨어요. 좋은 날을 잘 쓰셨어요.`)
    : y(`${dowOf(b.date)}요일(${md(b.date)})이 이번 주 가장 좋은 날이었어. 다음엔 그날 같이 챙겨 보자.`, `${dowOf(b.date)}요일(${md(b.date)})이 이번 주 가장 좋은 날이었어요. 다음엔 그날 함께 챙겨 봐요.`));
  const charms = done.map((d) => store[keyOf(d.date)].charm).filter(Boolean);
  if (charms.length) lines.push(y(`이번 주에 모은 부적: ${charms.join(', ')}.`, `이번 주에 모으신 부적: ${charms.join(', ')}.`));
  if (fb && fb.total) lines.push(y(`운세가 맞았는지 ${fb.total}번 알려 줬지. 그중 ${fb.yes}번은 맞았다고 했어. 덕분에 내 풀이도 더 정확해지고 있어.`, `운세가 맞았는지 ${fb.total}번 알려 주셨죠. 그중 ${fb.yes}번은 맞았다고 하셨어요. 덕분에 풀이가 더 정확해지고 있어요.`));
  if (nextBest) lines.push(y(`다음 주는 ${dowOf(nextBest.date)}요일(${md(nextBest.date)})이 가장 좋은 날이야. 「${nextBest.keyword}」의 기운이 모이니까 그날 할 일을 하나 정해 둬.`, `다음 주는 ${dowOf(nextBest.date)}요일(${md(nextBest.date)})이 가장 좋은 날이에요. 「${nextBest.keyword}」의 기운이 모이니까 그날 할 일을 하나 정해 두세요.`));
  lines.push(y('다음 주도 내가 매일 쪽지 남길게.', '다음 주도 제가 매일 쪽지를 남길게요.'));
  return { title: '💌 이번 주 편지', lines, sign: `— ${y('네 편인', '곁에 있는')} ${animal ? `${animal} ` : ''}수호신`, count: n };
}
