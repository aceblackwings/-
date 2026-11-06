// 새해 산통 점괘(v0.59, 2026-11-06 사용자 결정): 2027년 운세 맨 위에서 긁어서 확인하는 9단계 점괘
// · 이름 = 「산통 점괘」(점괘 산가지를 넣어 흔들던 통). 일본 오미쿠지처럼 총평 + 항목별 한 줄
// · 무작위로 뽑되 그해에는 한 번만(다시 들어와도 같은 점괘): 대길 10 · 중길 15 · 소길 15 · 길 20 · 반길 12 · 말길 10 · 소흉 8 · 흉 6 · 대흉 4 (%)
// · 흉이 나와도 겁주지 않음: 「바닥이면 이제 오를 일만 남았다」 + 액막이 행동 하나 + 걱정 태우기로 이어 감(원칙 7의 예외는 이 맺음으로 지킴)
// 저장 unmyeong2099.santong = { [사주 해]: { grade, opened } }. 순수 로직만(테스트: tests/santong.test.mjs)

export const SANTONG_KEY = 'unmyeong2099.santong';
export const GRADES = [
  { key: 'daegil', label: '대길', hanja: '大吉', weight: 10, tier: 'good',
    head: '하늘이 활짝 열린 해예요.', body: '마음먹은 일에 바람이 등 뒤에서 불어 줘요. 다만 운이 좋을수록 고마운 사람을 먼저 챙기면 복이 오래가요.', act: '새해 첫 달에 미뤄 둔 큰 계획 하나를 시작하세요.' },
  { key: 'junggil', label: '중길', hanja: '中吉', weight: 15, tier: 'good',
    head: '든든한 복이 차곡차곡 쌓이는 해예요.', body: '한 번에 크게 오기보다 꾸준히 해 온 일이 하나씩 열매를 맺어요. 조급해하지 않는 것이 가장 큰 비결이에요.', act: '매달 1일에 이번 달 목표 하나를 적어 두세요.' },
  { key: 'sogil', label: '소길', hanja: '小吉', weight: 15, tier: 'good',
    head: '작은 기쁨이 자주 찾아오는 해예요.', body: '큰 행운보다 소소하게 웃을 일이 많아요. 작은 기회를 가볍게 넘기지 않으면 연말에 꽤 큰 복이 되어 있어요.', act: '좋은 일이 생긴 날은 한 줄씩 적어 모아 보세요.' },
  { key: 'gil', label: '길', hanja: '吉', weight: 20, tier: 'good',
    head: '순하게 흘러가는 좋은 해예요.', body: '크게 흔들릴 일 없이 하던 대로 가면 좋은 결과가 따라와요. 새로 시작하기보다 지금 가진 것을 다지기에 알맞아요.', act: '지금 하는 일 하나를 끝까지 마무리해 보세요.' },
  { key: 'bangil', label: '반길', hanja: '半吉', weight: 12, tier: 'mid',
    head: '좋은 일과 아쉬운 일이 반반인 해예요.', body: '앞쪽이 조금 더디면 뒤쪽에서 풀리고, 앞쪽이 빠르면 뒤에서 한숨 돌리게 돼요. 반이 좋으니 그 반을 크게 쓰면 돼요.', act: '상반기와 하반기에 한 번씩 계획을 다시 살펴보세요.' },
  { key: 'malgil', label: '말길', hanja: '末吉', weight: 10, tier: 'mid',
    head: '끝에 가서 웃는 해예요.', body: '처음에는 더디고 답답해도 해가 깊어질수록 흐름이 좋아져요. 연말에 받을 복이 기다리고 있으니 중간에 놓지 마세요.', act: '봄에 세운 계획을 가을까지 바꾸지 말고 이어 가세요.' },
  { key: 'sohyung', label: '소흉', hanja: '小凶', weight: 8, tier: 'low',
    head: '작은 돌부리를 조심하면 되는 해예요.', body: '크게 넘어질 일은 아니고, 서두르다 발이 걸리는 정도예요. 한 번 더 확인하는 습관만 있으면 무난히 지나가요.', act: '중요한 약속과 결제는 하루 묵혔다가 정하세요.' },
  { key: 'hyung', label: '흉', hanja: '凶', weight: 6, tier: 'low',
    head: '몸을 낮추고 힘을 모으는 해예요.', body: '앞으로 크게 나가기보다 지키는 쪽이 이익인 해예요. 바닥을 한 번 다져 두면, 그다음 해에 훨씬 높이 올라갈 수 있어요.', act: '새 일을 벌이기보다 건강과 돈 관리부터 단단히 하세요.' },
  { key: 'daehyung', label: '대흉', hanja: '大凶', weight: 4, tier: 'low',
    head: '바닥을 찍었으니 이제 오를 일만 남은 해예요.', body: '산통에서 가장 드문 점괘예요. 옛날에는 대흉이 나오면 오히려 「액을 미리 다 털었다」고 여겼어요. 조심할수록 나쁜 일은 작게 지나가요.', act: '걱정 하나를 적어 태워 보내고, 한 해 동안 무리한 약속은 피하세요.' },
];
/** 항목별 한 줄(오미쿠지처럼): 좋음·보통·낮춤 세 갈래 */
export const ITEMS = [
  ['🌠', '소원', ['이루어져요. 마음에 품은 것을 소리 내어 말해 보세요.', '늦게라도 이루어져요. 서두르지 마세요.', '한 번에 다 바라지 말고 하나씩 이루세요.']],
  ['🚪', '기다리는 사람', ['곧 소식이 와요.', '조금 늦지만 와요. 먼저 안부를 전하면 빨라져요.', '기다리기보다 내가 먼저 찾아가세요.']],
  ['🔍', '잃어버린 물건', ['가까운 곳에서 나와요.', '시간이 지나면 나와요. 늘 두던 자리를 다시 보세요.', '잊고 새것을 들이면 마음이 가벼워져요.']],
  ['🏠', '이사', ['좋아요. 해 드는 쪽이면 더 좋아요.', '서두르지 않으면 괜찮아요.', '올해는 미루고 지금 집을 정리하세요.']],
  ['🧳', '여행', ['좋은 인연을 만나요.', '가까운 곳이 좋아요.', '일정을 넉넉하게 잡으세요.']],
  ['💼', '장사·일', ['넓히면 이익이 있어요.', '하던 대로 가면 이익이 있어요.', '크게 벌이지 말고 지키세요.']],
  ['📚', '공부·시험', ['노력한 만큼 붙어요.', '마지막까지 놓지 않으면 붙어요.', '기초를 다시 다지면 길이 열려요.']],
  ['🤝', '다툼', ['내가 이겨요. 그래도 너그럽게.', '한발 물러서면 풀려요.', '말을 아끼면 크게 번지지 않아요.']],
  ['💗', '연애', ['인연이 가까이 있어요.', '천천히 다가가면 이루어져요.', '나를 먼저 아끼면 좋은 사람이 와요.']],
  ['🌿', '건강', ['기운이 넘쳐요. 그래도 잠은 넉넉히.', '무리만 하지 않으면 괜찮아요.', '작은 신호를 미루지 말고 챙기세요.']],
];
const TIER_IDX = { good: 0, mid: 1, low: 2 };
export const gradeOf = (key) => GRADES.find((g) => g.key === key) || null;

/** 무게대로 하나 뽑기 (rnd = 0~1) */
export function pickGrade(rnd = Math.random()) {
  const total = GRADES.reduce((a, g) => a + g.weight, 0);
  let x = rnd * total;
  for (const g of GRADES) { if (x < g.weight) return g.key; x -= g.weight; }
  return GRADES[GRADES.length - 1].key;
}
/** 그해 점괘: 없으면 뽑아서 저장(그해에는 같은 점괘) → { store, grade, opened, fresh } */
export function drawYear(store, year, rnd = Math.random()) {
  const s = { ...(store || {}) }; const cur = s[year];
  if (cur?.grade && gradeOf(cur.grade)) return { store: s, grade: cur.grade, opened: !!cur.opened, fresh: false };
  const grade = pickGrade(rnd);
  return { store: { ...s, [year]: { grade, opened: false } }, grade, opened: false, fresh: true };
}
export function openYear(store, year) {
  const s = { ...(store || {}) }; if (!s[year]) return s;
  return { ...s, [year]: { ...s[year], opened: true } };
}
/** 점괘 한 장: 총평 + 항목 10줄 + 할 일 */
export function santongCard(key) {
  const g = gradeOf(key); const ti = TIER_IDX[g.tier];
  return { ...g, low: g.tier === 'low', items: ITEMS.map(([icon, label, lines]) => ({ icon, label, line: lines[ti] })) };
}
export const ALL_LINES = [...GRADES.flatMap((g) => [g.head, g.body, g.act]), ...ITEMS.flatMap((x) => x[2])];
