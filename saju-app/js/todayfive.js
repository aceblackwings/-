// 오늘의 5분야 점수 (v0.42, 2026-11-04 사용자 결정 「가」): 애정·금전·건강·직장·사업
// 정통 계산(fortune.js scores)은 그대로 두고, 첫 화면에 보여 줄 때만 30점대~90점대로 폭을 넓힌다(설계 원칙 2의 눈금은 다른 화면에 그대로).
// 넓히기 = 분야 평균을 64점에 맞추고 평균과의 차이를 1.7배 → 30~96 사이로 자름. 같은 날 같은 사람은 늘 같은 점수(무작위 없음)
// 테스트: tests/todayfive.test.mjs

export const FIVE = [
  { key: 'love', label: '애정운', icon: '💗', from: (s) => s.love, mean: 70 },
  { key: 'money', label: '금전운', icon: '💰', from: (s) => s.wealth, mean: 67 },
  { key: 'health', label: '건강운', icon: '🌿', from: (s) => s.health, mean: 66 },
  { key: 'work', label: '직장운', icon: '💼', from: (s) => s.career, mean: 68.5 },
  { key: 'biz', label: '사업운', icon: '🏪', from: (s, god) => (s.wealth + s.career) / 2 + (BIZ_GOD[god] || 0), mean: 68 },
];
// 사업운 십신 보정: 재능이 돈이 되는 식상·재성은 조금 위, 틀을 다지는 관성·인성은 조금 아래
const BIZ_GOD = { 식신: 3, 상관: 3, 편재: 4, 정재: 2, 비견: 0, 겁재: -1, 편관: -1, 정관: 0, 편인: -2, 정인: -1 };

export const WIDEN = 1.7;
export const FIVE_MIN = 30;
export const FIVE_MAX = 96;
export const widen = (v, mean) => Math.round(Math.min(FIVE_MAX, Math.max(FIVE_MIN, 64 + (v - mean) * WIDEN)));

// 점수대별 한 줄(날씨→우산 문법: 낮은 점수도 「~면」 조건과 행동으로)
const LINES = {
  love: ['마음을 표현하면 그대로 닿는 날이에요.', '다정한 연락 한 번이 사이를 가깝게 해요.', '서두르기보다 상대 이야기를 들어 주면 좋아요.', '오늘은 나를 먼저 아껴 주면 사랑도 따라와요.'],
  money: ['들어오는 기운이 활짝 열린 날이에요.', '작은 이득이 생기기 쉬워요. 영수증을 챙겨요.', '큰 지출은 하루 미루면 마음이 편해요.', '지갑을 닫고 쉬어 가면 내일 더 넉넉해져요.'],
  health: ['몸도 마음도 가벼운 날이에요.', '가볍게 걸으면 기운이 더 올라가요.', '물 한 잔과 스트레칭이 큰 힘이 돼요.', '오늘은 일찍 쉬면 내일 몸이 훨씬 가벼워요.'],
  work: ['맡은 일에서 빛이 나는 날이에요.', '준비한 만큼 인정받기 쉬워요.', '중요한 결정은 한 번 더 확인하면 좋아요.', '오늘은 정리하고 다지는 날로 쓰면 좋아요.'],
  biz: ['새 거래와 손님이 반가운 날이에요.', '아이디어를 꺼내 보면 반응이 좋아요.', '계약·숫자는 꼼꼼히 보면 남는 게 많아요.', '확장보다 점검하면 다음 기회가 더 커져요.'],
};
export function fiveLine(key, v) {
  const L = LINES[key]; return v >= 82 ? L[0] : v >= 64 ? L[1] : v >= 46 ? L[2] : L[3];
}

/** fortune(computeFortune 결과) → [{key,label,icon,score,line}] + total(다섯 평균) · best · low */
export function fiveScores(f) {
  const list = FIVE.map((x) => {
    const score = widen(x.from(f.scores, f.tenGod), x.mean);
    return { key: x.key, label: x.label, icon: x.icon, score, line: fiveLine(x.key, score) };
  });
  const total = Math.round(list.reduce((a, b) => a + b.score, 0) / list.length);
  const sorted = [...list].sort((a, b) => b.score - a.score);
  return { list, total, best: sorted[0], low: sorted[sorted.length - 1] };
}
