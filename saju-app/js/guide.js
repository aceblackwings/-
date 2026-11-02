// 홈 길잡이: 「오늘의 미션 3가지」의 세 번째 칸(새 기능 열기)이 이 순서대로 하루 한 가지씩 기능을 소개하고 연다.
// v0.21: 「다음 할 일」 카드 9단계 → v0.27: 미션 ③으로 옮기고, 이달·액땜은 기본으로 보이므로 단계에서 뺌. 탭 기능(신수 카드·기록함·상담·궁합)도 소개
// 화면과 무관한 순수 로직만 둔다(테스트: tests/guide.test.mjs). 저장 키: unmyeong2099.guide

/** 기능 소개 순서. unlocks = 끝내면 홈에 나타나는 구역, go = 버튼을 누르면 갈 곳('home:구역' 또는 탭 이름) */
export const GUIDE_STEPS = [
  { key: 'next', icon: '🎁', title: (y) => `${y}년 운세 펼쳐 보기`, desc: (y) => `새해 ${y}년의 점수, 좋은 달과 조심할 달을 먼저 확인해 보세요.`, btn: '내년 운세 펼치기', unlocks: [], go: 'home:next' },
  { key: 'week', icon: '🗓️', title: () => '이번 주 가장 좋은 날 찾기', desc: () => '월요일부터 일요일까지, 어느 날이 가장 좋은지와 이번 주 재물 흐름을 한눈에 봐요.', btn: '이번 주 열기', unlocks: ['week'], go: 'home:week' },
  { key: 'ask', icon: '🔮', title: () => '궁금한 운세 하나 물어보기', desc: () => '돈, 연애, 시험처럼 궁금한 것을 고르면 점수와 이유, 해 볼 일 하나를 알려 드려요.', btn: '질문 메뉴 열기', unlocks: ['ask'], go: 'ask' },
  { key: 'cards', icon: '🃏', title: () => '12지신 신수 카드 한 장 뽑기', desc: () => '고민을 떠올리고 카드를 뽑아 보세요. 결과는 기록함에 저장돼요.', btn: '카드 뽑으러 가기', unlocks: [], go: 'cards' },
  { key: 'draw', icon: '🎴', title: () => '운명 뽑기로 첫 부적 받기', desc: () => '하루 한 번 무료 뽑기로 나에게 맞는 부적을 받아 보세요. 확률은 모두 공개돼요.', btn: '뽑기 열기', unlocks: ['daily'], go: 'home:#btn-daily' },
  { key: 'records', icon: '📒', title: () => '기록함 둘러보기', desc: () => '본 운세는 자동으로 남아요. 맞았는지 체크한 기록과 저장한 결과를 다시 볼 수 있어요.', btn: '기록함 열기', unlocks: [], go: 'records' },
  { key: 'daewoon', icon: '🏔️', title: () => '나의 10년 대운 보기', desc: () => '지금 어떤 10년을 지나고 있는지, 타고난 기운과 함께 살펴봐요.', btn: '대운 열기', unlocks: ['daewoon', 'natal'], go: 'home:daewoon' },
  { key: 'chat', icon: '💬', title: () => '수호신에게 오늘 이야기하기', desc: () => '오늘 있었던 일이나 걱정을 편하게 말해 보세요. 수호신이 기억해 두었다가 안부를 물어요.', btn: '상담 열기', unlocks: [], go: 'chat' },
  { key: 'journey', icon: '🧭', title: () => '고민 해결 여정 시작하기', desc: () => '내 고민에 맞춘 30일 여정으로 하루 한 걸음씩 풀어 가요.', btn: '여정 열기', unlocks: ['concern', 'journey'], go: 'home:.journey, #btn-journey' },
  { key: 'compat', icon: '💞', title: () => '가족·친구와 궁합 보기', desc: () => '궁합 점수와 함께 서로의 수호신이 나누는 대화도 볼 수 있어요.', btn: '궁합 보러 가기', unlocks: [], go: 'compat' },
  { key: 'todo', icon: '✅', title: () => '모든 기능 열기', desc: () => '마지막 단계예요. 매일 할 일·수호신 한마디·계절 이벤트·공유까지 모두 열려요.', btn: '모두 열기', unlocks: ['todo', 'say', 'season', 'festival', 'story'], go: 'home:.card.todo' },
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
