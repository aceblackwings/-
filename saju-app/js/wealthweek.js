// 이번 주 재물 흐름(v0.23, 작은 실험) — 기획 docs/core-saju-review-plan.md 4-4
// - 이번 주(월~일) 재물운 = 오늘 운세 재물 점수와 같은 값(period.js weekOf)
// - 재물운이 가장 좋은 날 + 그날의 "재미로 보는 행운 숫자" 6개 (결정적 계산: 다시 봐도 같은 숫자)
// - 안전 장치: 무작위 추첨 안내, 구매 권유·금액·구매처 금지, 만 19세 미만 숨김, 한국도박문제예방치유원 ☎ 1336
import { seededRandom } from './saju.js';

export const MIN_AGE = 19;
export const SAFETY_LINES = [
  '로또는 무작위 추첨이라 운세로 당첨 확률이 달라지지 않아요. 재미로만 봐 주세요.',
  '도박이 걱정된다면 한국도박문제예방치유원 ☎ 1336 (24시간 무료 상담)',
];
/** 화면 문구에 들어가면 안 되는 표현 (테스트로 검사) */
export const BANNED_WORDS = ['당첨 기운', '구매하세요', '사세요', '대박', '판매점', '억원', '만원'];

// 오행별 수(하도): 목 3·8, 화 2·7, 토 5·10, 금 4·9, 수 1·6
const ELEMENT_DIGITS = [[3, 8], [2, 7], [5, 10], [4, 9], [1, 6]];

/** 만 나이(생일 지났는지까지) */
export function ageOn(birth, today) {
  let a = today.year - birth.year;
  if (today.month < birth.month || (today.month === birth.month && today.day < birth.day)) a -= 1;
  return a;
}

/** 1~45 중 6개: 용신 오행 수에서 2개(끝자리가 같은 수) + 나머지 4개, 오름차순 */
export function luckyNumbers(seed, yongsin) {
  const out = new Set();
  const [a, b] = ELEMENT_DIGITS[yongsin];
  const pool = [];
  for (let n = 1; n <= 45; n++) if (n % 10 === a % 10 || n % 10 === b % 10) pool.push(n);
  let i = 0;
  while (out.size < 2) out.add(pool[Math.floor(seededRandom(`${seed}|el|${i++}`) * pool.length)]);
  while (out.size < 6) out.add(1 + Math.floor(seededRandom(`${seed}|n|${i++}`) * 45));
  return [...out].sort((x, y) => x - y);
}

/**
 * @param week period.js weekOf 결과 (days[].scores.wealth)
 * @param ctx {birth:{year,month,day}, today:{year,month,day}, yongsin, seed(사람마다 다른 문자열)}
 */
export function weekWealth(week, ctx) {
  const days = week.days.map((d) => ({ date: d.date, score: d.scores.wealth, isToday: d.isToday }));
  const best = days.reduce((a, b) => (b.score > a.score ? b : a));
  const worst = days.reduce((a, b) => (b.score < a.score ? b : a));
  const avg = Math.round(days.reduce((a, b) => a + b.score, 0) / days.length);
  const eligible = ageOn(ctx.birth, ctx.today) >= MIN_AGE;
  const bk = `${best.date.year}-${best.date.month}-${best.date.day}`;
  return {
    days, best, worst, avg, eligible,
    numbers: eligible ? luckyNumbers(`${ctx.seed}|${bk}`, ctx.yongsin) : null,
    tip: avg >= 70 ? '돈의 흐름이 활발한 주예요. 들어온 돈의 일부를 바로 저축으로 옮겨 두세요.'
      : avg >= 55 ? '무난한 주예요. 고정 지출을 한 번 점검하면 새는 돈을 막을 수 있어요.'
        : '지키는 것이 버는 것인 주예요. 큰 결제는 재물운이 좋은 날로 미뤄 보세요.',
  };
}
