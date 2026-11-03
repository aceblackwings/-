// 쉬운 모드(v0.31): 큰 글씨 · 쉬운 말 · 카드 3장 홈. 부모님 세대(50대 이상)와 어린 자녀(10대)가 설명 없이 쓰도록.
// 순수 로직만 둔다(테스트: tests/easymode.test.mjs). 저장 키: unmyeong2099.easy
import { plainTerms, hasGameTerms } from './firstweek.js';

export const EASY_MIN_AGE = 50; // 이 나이 이상이면 추천
export const EASY_MAX_YOUTH = 16; // 이 나이 이하이면 추천

/** { on, since, by: 'self'|'link', dismissed, remind, level, from } */
export const emptyEasy = () => ({ on: false, since: null, by: null, dismissed: false, remind: null, level: 1 });

/** 켜기·끄기. 끄면 다시 추천하지 않음(dismissed) */
export function setEasy(store, on, dateKey, by = 'self') {
  const s = { ...emptyEasy(), ...(store || {}) };
  if (on) return { ...s, on: true, since: s.on ? s.since : dateKey, by: s.on ? s.by : by };
  return { ...s, on: false, dismissed: true };
}

/** 추천 카드의 「괜찮아요」 */
export const dismissEasy = (store) => ({ ...emptyEasy(), ...(store || {}), dismissed: true });

/** 만 나이: 숫자(연도)만 주면 연도 차, {year,month,day}면 생일 기준 */
export function ageOf(birth, today) {
  if (typeof birth === 'number' || typeof today === 'number') return Number(today?.year ?? today) - Number(birth?.year ?? birth);
  const a = today.year - birth.year;
  return (today.month < birth.month || (today.month === birth.month && today.day < birth.day)) ? a - 1 : a;
}

/** 만 50세 이상 또는 만 16세 이하이고, 아직 켠 적도·닫은 적도 없으면 추천 */
export function suggestEasy(birthYear, todayYear, store) {
  const s = store || {};
  if (s.on || s.dismissed || s.since) return false;
  const age = ageOf(birthYear, todayYear);
  if (!Number.isFinite(age) || age < 0) return false;
  return age >= EASY_MIN_AGE || age <= EASY_MAX_YOUTH;
}

/** 사주 용어 → 쉬운 말. 원래 용어는 괄호로 남겨 배울 수 있게 */
export const EASY_TERMS = {
  용신: '나에게 필요한 기운',
  희신: '두 번째로 반가운 기운',
  기신: '조심할 기운',
  대운: '10년 큰 흐름',
  세운: '올해 흐름',
  월운: '이달 흐름',
  일진: '오늘 기운',
  일운: '오늘 기운',
  신강: '기운이 센 편',
  신약: '기운이 여린 편',
  중화: '기운이 고른 편',
  조후: '계절 균형',
  비견: '나란히 서는 기운',
  겁재: '겨루며 크는 기운',
  식신: '즐겁게 만들어 내는 기운',
  상관: '톡톡 튀는 표현의 기운',
  편재: '크게 움직이는 재물 기운',
  정재: '차곡차곡 모으는 기운',
  편관: '버텨 내는 기운',
  정관: '바르게 지키는 기운',
  편인: '남다르게 배우는 기운',
  정인: '따뜻하게 돕는 기운',
};

// 사주 용어가 아닌 같은 글자는 건드리지 않음: 「상관없이」, 「세운 다짐」(세우다) 등
// 「좋은 편인 하루」(~한 편이다)의 편인도 사주 용어가 아님
const NOT_TERM_AFTER = { 상관: '(?!없|이 ?없|하지|있)', 세운: '(?!다|\\s?(?:다짐|계획|목표|약속))', 편인: '(?!가|지|데|것|\\s?(?:하루|날|해|달|주))' };
const NOT_TERM_BEFORE = { 편인: '(?<![은는한센큰된진린] )' };
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const done = Object.entries(EASY_TERMS).map(([k, v]) => `${v}(${k})`);
// 이미 바뀐 문장(「쉬운 말(용어)」)을 먼저 맞춰 그대로 두므로 같은 단어를 두 번 바꾸지 않음
const TERM_RE = new RegExp(
  `(${done.map(esc).join('|')})|(?<![가-힣])(${Object.keys(EASY_TERMS).map((k) => `${NOT_TERM_BEFORE[k] || ''}${k}${NOT_TERM_AFTER[k] || ''}`).join('|')})`,
  'g',
);

/** 쉬운 모드 문장: 게임 용어(EXP·Lv.) + 사주 용어 */
export function easyTerms(text) {
  const t = hasGameTerms(String(text)) ? plainTerms(text) : String(text);
  return t.replace(TERM_RE, (m, kept, term) => (kept ? kept : `${EASY_TERMS[term]}(${term})`));
}

/** 바꿀 것이 있는지 (화면 전체를 훑을 때 빠르게 거르기용) */
export function hasEasyTerms(text) {
  const s = String(text);
  if (hasGameTerms(s)) return true;
  TERM_RE.lastIndex = 0;
  for (const m of s.matchAll(TERM_RE)) if (m[2]) return true;
  return false;
}

// ---------- 짝꿍이 대신 켜 주기: 서버 없이 링크로 ----------
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
export const FROM_MAX = 6;

/** 링크 주소 뒤쪽(?easy=1…). 생년월일·이름은 넣지 않음(설계 원칙 5). from = 부르는 말(엄마·큰딸 등, 선택) */
export function easyLinkQuery({ remind = '08:00', level = 1, from = '' } = {}) {
  const q = new URLSearchParams({ easy: '1' });
  if (TIME_RE.test(remind)) q.set('remind', remind);
  q.set('level', String([1, 2, 3].includes(Number(level)) ? Number(level) : 1));
  const f = cleanFrom(from); if (f) q.set('from', f);
  return `?${q.toString()}`;
}

/** 부르는 말 정리: 짧게, 숫자·기호 없이(전화번호·생일이 들어가지 않게) */
export function cleanFrom(from) {
  return String(from || '').replace(/[^가-힣a-zA-Z ]/g, '').trim().slice(0, FROM_MAX);
}

/** 링크 읽기 → 없거나 잘못됐으면 null */
export function parseEasyLink(search) {
  const q = new URLSearchParams(search || '');
  if (q.get('easy') !== '1') return null;
  const remind = TIME_RE.test(q.get('remind') || '') ? q.get('remind') : null;
  const lv = Number(q.get('level'));
  return { remind, level: [1, 2, 3].includes(lv) ? lv : 1, from: cleanFrom(q.get('from')) };
}

/** 확인창 문장 */
export const linkAskText = (link) => `${link?.from ? `${link.from}님이` : '소중한 사람이'} 쉬운 모드를 추천했어요. 켤까요?`;

/** 링크 수락 → 켜고 알림 시각·우산 난이도 저장(알림은 정식 앱의 로컬 알림용, 웹은 저장만) */
export function acceptLink(store, link, dateKey) {
  const s = setEasy(store, true, dateKey, 'link');
  return { ...s, remind: link.remind ?? s.remind, level: link.level || 1 };
}
