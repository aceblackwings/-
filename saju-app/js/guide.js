// 홈 길잡이(v0.21): 첫 화면은 내년·오늘·올해 3장만, 나머지는 「다음 할 일」 퀘스트로 하나씩 연다.
// 화면과 무관한 순수 로직만 둔다(테스트: tests/guide.test.mjs). 저장 키: unmyeong2099.guide

/** 퀘스트 순서. unlocks = 이 퀘스트를 끝내면 홈에 나타나는 구역 */
export const GUIDE_STEPS = [
  { key: 'next', icon: '🎁', title: (y) => `${y}년 운세 펼쳐 보기`, desc: (y) => `새해 ${y}년의 점수, 좋은 달과 조심할 달을 먼저 확인해 보세요.`, btn: '내년 운세 펼치기', unlocks: [] },
  { key: 'week', icon: '🗓️', title: () => '이번 주 가장 좋은 날 찾기', desc: () => '월요일부터 일요일까지, 어느 날이 가장 좋은지 한눈에 볼 수 있어요.', btn: '이번 주 열기', unlocks: ['week'] },
  { key: 'month', icon: '🌙', title: () => '이달 좋은 날·조심할 날 보기', desc: () => '이번 절기 한 달 동안 힘을 낼 날과 쉬어 갈 날을 알려 드려요.', btn: '이달 열기', unlocks: ['month'] },
  { key: 'mission', icon: '🧧', title: () => '오늘의 액땜 미션 받기', desc: () => '간단한 미션 하나로 오늘의 액막이 부적을 한 단계 강하게 만들어요.', btn: '미션 받기', unlocks: ['mission'] },
  { key: 'draw', icon: '🔮', title: () => '운명 뽑기로 첫 부적 받기', desc: () => '하루 한 번 무료 뽑기로 나에게 맞는 부적을 받아 보세요.', btn: '뽑기 열기', unlocks: ['daily'] },
  { key: 'ask', icon: '💬', title: () => '수호신에게 궁금한 것 물어보기', desc: () => '돈, 연애, 내일 운처럼 궁금한 것을 골라 바로 답을 들어요.', btn: '질문 메뉴 열기', unlocks: ['ask'] },
  { key: 'daewoon', icon: '🏔️', title: () => '나의 10년 대운 보기', desc: () => '지금 어떤 10년을 지나고 있는지, 타고난 기운과 함께 살펴봐요.', btn: '대운 열기', unlocks: ['daewoon', 'natal'] },
  { key: 'journey', icon: '🧭', title: () => '고민 해결 여정 시작하기', desc: () => '내 고민에 맞춘 30일 여정으로 하루 한 걸음씩 풀어 가요.', btn: '여정 열기', unlocks: ['concern', 'journey'] },
  { key: 'todo', icon: '✅', title: () => '매일 할 일 목록 열기', desc: () => '마지막 단계예요. 매일 할 일·계절 이벤트·공유까지 모두 열려요.', btn: '모두 열기', unlocks: ['todo', 'say', 'season', 'festival', 'story'] },
];

export const emptyGuide = () => ({ done: [], all: false });

/** 내년 카드를 보여 줄 시기: 9월 이후, 또는 입춘 전(사주상 해가 아직 지난해) */
export function showNextYear(date, sajuYear) {
  return date.month >= 9 || sajuYear < date.year;
}

/** 이번 사용자에게 해당하는 퀘스트들 (내년 카드가 없는 시기에는 1번을 뺀다) */
export function activeSteps(ctx = {}) {
  return GUIDE_STEPS.filter((s) => s.key !== 'next' || ctx.showNext);
}

export function nextStep(guide, ctx = {}) {
  const g = guide || emptyGuide();
  return activeSteps(ctx).find((s) => !g.done.includes(s.key)) || null;
}

export function progress(guide, ctx = {}) {
  const g = guide || emptyGuide();
  const steps = activeSteps(ctx);
  return { done: steps.filter((s) => g.done.includes(s.key)).length, total: steps.length };
}

/** 홈 구역이 열렸는지 */
export function isUnlocked(guide, section) {
  const g = guide || emptyGuide();
  if (g.all) return true;
  return GUIDE_STEPS.some((s) => s.unlocks.includes(section) && g.done.includes(s.key));
}

/** 구역을 여는 퀘스트 키 */
export const stepFor = (section) => (GUIDE_STEPS.find((s) => s.unlocks.includes(section)) || {}).key || null;

/** 퀘스트 완료 (이미 했으면 그대로). changed = 새로 끝냈는지 */
export function completeStep(guide, key) {
  const g = guide || emptyGuide();
  if (!GUIDE_STEPS.some((s) => s.key === key) || g.done.includes(key)) return { guide: g, changed: false };
  return { guide: { ...g, done: [...g.done, key] }, changed: true };
}

/** 「모든 기능 한 번에 펼치기」 / 「간단히 보기」 */
export const setAll = (guide, all) => ({ ...(guide || emptyGuide()), all: !!all });
