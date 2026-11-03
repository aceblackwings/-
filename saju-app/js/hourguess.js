// 태어난 시간 추정(v0.41 A6): 시간을 모르는 사람에게 성향 질문 3개로 시주(태어난 시진) 후보를 좁혀 준다
// 시주의 천간·지지 본기 십신 무리가 답과 맞을수록 점수. 결과는 「추정」이라고 분명히 표시. 순수 로직만(테스트: tests/hourguess.test.mjs)
import { tenGod, BRANCH_MAIN_STEM, BRANCHES } from './saju.js';

const G = { 비견: 0, 겁재: 0, 식신: 1, 상관: 1, 편재: 2, 정재: 2, 편관: 3, 정관: 3, 편인: 4, 정인: 4 };
export const HOUR_QUESTIONS = [
  { q: '새로운 일을 시작할 때 나는?', a: ['일단 내 뜻대로 밀고 나가요', '아이디어부터 마구 떠올려요', '득실을 먼저 따져 봐요', '규칙과 순서를 먼저 확인해요', '충분히 알아보고 시작해요'] },
  { q: '쉬는 날 나는?', a: ['사람 만나거나 몸을 움직여요', '뭔가 만들거나 수다를 떨어요', '쇼핑하거나 살림을 챙겨요', '밀린 일을 정리해요', '책·영상으로 뭔가 배워요'] },
  { q: '주변에서 자주 듣는 말은?', a: ['고집 있다·주관이 뚜렷하다', '재밌다·센스 있다', '현실적이다·알뜰하다', '책임감 있다·믿음직하다', '생각이 깊다·차분하다'] },
];
// 시진: 지지 번호 → 시계 시각 범위 (경도 보정 전 기준, 표준시 약 30분 늦게 시작)
export const HOUR_RANGES = ['23:30~01:29', '01:30~03:29', '03:30~05:29', '05:30~07:29', '07:30~09:29', '09:30~11:29', '11:30~13:29', '13:30~15:29', '15:30~17:29', '17:30~19:29', '19:30~21:29', '21:30~23:29'];
/** 그 시진을 대표하는 시계 시각(가운데) */
export const hourClock = (b) => `${String((b * 2) % 24).padStart(2, '0')}:30`;

/** 일간에 대한 시진 12개의 시주(천간은 오자둔) */
export function hourPillars(dayStem) {
  return Array.from({ length: 12 }, (_, b) => ({ branch: b, stem: (((dayStem % 5) * 2) + b) % 10 }));
}

/**
 * @param dayStem 일간 · answers [0~4, 0~4, 0~4] (각 질문에서 고른 무리 번호)
 * @returns 점수 높은 순 후보 3개 [{ branch, name, range, clock, score, god }]
 */
export function guessHours(dayStem, answers) {
  const want = answers.filter((x) => x != null);
  return hourPillars(dayStem).map((p) => {
    const sg = tenGod(dayStem, p.stem); const bg = tenGod(dayStem, BRANCH_MAIN_STEM[p.branch]);
    const score = want.reduce((t, g) => t + (G[sg] === g ? 2 : 0) + (G[bg] === g ? 1 : 0), 0);
    return { branch: p.branch, name: `${BRANCHES[p.branch]}시`, range: HOUR_RANGES[p.branch], clock: hourClock(p.branch), score, god: sg };
  }).sort((a, b) => b.score - a.score || a.branch - b.branch).slice(0, 3);
}
