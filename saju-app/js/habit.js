// 날씨 → 우산 (v0.30): 운세(날씨)를 보고 5분 안에 할 행동(우산) 하나를 고르고, 마음이 가벼워졌는지 확인한다.
// 근거: docs/together-habit-direction.md 3절(날씨→우산 문법)·5-2절(미션 설계).
// - 마음 날씨: 운세 보기 전 ☀️~⛈️ 한 번 탭, 미션 뒤 "조금 가벼워졌나요?" → 앱이 불안을 덜어 줬는지 재는 지표
// - 우산 미션 라이브러리: 6분야 × 5오행 × 3난이도 = 90개. 모든 문장은 "~한 뒤에"처럼 이미 하는 일에 붙인다(앵커)
// - 문장 규칙: 금지어 없음, 낮은 점수에는 "~하면" 조건문, 경고는 반드시 행동과 함께
// 순수 로직만 둔다(테스트: tests/habit.test.mjs). 저장 키: unmyeong2099.habit = {날짜: {before, area, el, level, done, after}}

export const HABIT_KEEP_DAYS = 90;

/** 마음 날씨 5단계 (v: 5 맑음 → 1 천둥) */
export const MOODS = [
  { v: 5, icon: '☀️', label: '맑음' },
  { v: 4, icon: '🌤️', label: '구름 조금' },
  { v: 3, icon: '☁️', label: '흐림' },
  { v: 2, icon: '🌧️', label: '비' },
  { v: 1, icon: '⛈️', label: '천둥' },
];

/** 난이도 3단: 30초 · 5분 · 30분. 완료 보상 EXP는 난이도만큼 더 준다 */
export const LEVELS = [
  { lv: 1, icon: '🌱', label: '30초', exp: 0 },
  { lv: 2, icon: '🌿', label: '5분', exp: 2 },
  { lv: 3, icon: '🌳', label: '30분', exp: 5 },
];

/** 우산 분야 6개: 운세 5분야 + 마음(마음 날씨가 비·천둥이면 우선) */
export const AREAS = [
  { key: 'wealth', label: '재물', icon: '💰' },
  { key: 'love', label: '애정', icon: '💗' },
  { key: 'career', label: '일·공부', icon: '📚' },
  { key: 'health', label: '건강', icon: '🌿' },
  { key: 'social', label: '사람', icon: '🤝' },
  { key: 'mind', label: '마음', icon: '🕊️' },
];

// [분야][오행 0목 1화 2토 3금 4수] = [30초, 5분, 30분]
// 오행 결: 목 = 자라기·시작 · 화 = 표현·햇볕 · 토 = 다지기·모으기 · 금 = 정리·덜어내기 · 수 = 쉼·흐름
const LIB = {
  wealth: [
    ['통장 앱을 연 김에 저축 목표 한 줄 적기', '점심 먹은 뒤에 이번 달 고정비 3가지 확인하기', '저녁 먹은 뒤에 작은 부수입 아이디어 3개 적어 보기'],
    ['결제 버튼을 누르기 전에 10초 멈추기', '퇴근길에 오늘 쓴 돈을 메모 앱에 한 줄로 적기', '주말 전에 이번 달 아낀 돈으로 나에게 줄 작은 선물 정하기'],
    ['아침 커피를 마시기 전에 오늘 쓸 돈 한도 정하기', '점심 먹은 뒤에 지갑 속 영수증 정리하기', '저녁에 이번 달 가계부를 10줄로 정리하기'],
    ['휴대폰을 켠 김에 안 쓰는 구독 하나 찾아보기', '장바구니를 연 뒤에 꼭 필요 없는 물건 하나 빼기', '잠들기 전에 안 쓰는 물건 하나를 중고 판매 글로 올리기'],
    ['물 한 잔 마신 뒤에 오늘 나갈 돈 하나 떠올리기', '점심 먹은 뒤에 자동이체 날짜를 달력에 적기', '저녁에 저축 방법 두 가지를 비교해 적어 보기(정하는 건 천천히)'],
  ],
  love: [
    ['아침 인사 뒤에 소중한 사람에게 이모티콘 하나 보내기', '점심 먹은 뒤에 상대가 좋아하는 것 3가지 메모하기', '저녁에 함께 걸을 길이나 카페 하나 찾아 제안하기'],
    ['거울을 본 뒤에 나에게 "오늘 괜찮아" 한마디 하기', '점심 먹은 뒤에 고마웠던 일 하나를 문자로 보내기', '저녁에 소중한 사람과 10분 이상 통화하기'],
    ['집에 들어온 뒤에 "다녀왔어" 먼저 말하기', '저녁 먹은 뒤에 상대의 하루를 묻고 끝까지 들어 주기', '주말 전에 함께 먹을 간단한 간식 준비하기'],
    ['말하기 전에 3초 멈추기', '서운했던 말 하나를 부드러운 말로 바꿔 적어 보기', '저녁에 함께 지킬 약속 하나를 정해 달력에 적기'],
    ['잠들기 전에 소중한 사람을 떠올리며 숨 세 번 쉬기', '답장을 기다리는 동안 물 한 잔 마시며 기다려 주기', '잠들기 전에 마음을 담은 긴 메시지 한 단락 써 보기'],
  ],
  career: [
    ['책상에 앉은 뒤에 오늘 꼭 할 일 1개 적기', '점심 먹은 뒤에 배우고 싶은 것 하나 5분 찾아보기', '저녁에 책이나 강의로 30분 공부하기'],
    ['회의나 수업 전에 하고 싶은 말 한 줄 적기', '점심 먹은 뒤에 동료나 친구 한 명에게 좋았던 점 말해 주기', '저녁에 이번 주 내가 해낸 일 하나를 3줄로 정리하기'],
    ['책상에 앉자마자 물건 하나 제자리에 두기', '일을 시작하기 전에 할 일 3개에 순서 매기기', '오후에 미뤄 둔 일 하나 끝내기'],
    ['메일이나 과제를 보내기 전에 한 번 더 읽기', '점심 먹은 뒤에 안 쓰는 파일과 창 5개 정리하기', '저녁에 이번 주 그만둘 일 하나 정하고 정리하기'],
    ['일을 시작하기 전에 물 한 잔 마시기', '막힌 일이 있으면 5분 걷고 와서 다시 보기', '잠들기 전에 오늘 배운 것 3줄 기록하기'],
  ],
  health: [
    ['일어난 뒤에 기지개 한 번 크게 켜기', '점심 먹은 뒤에 5분 스트레칭하기', '저녁 먹은 뒤에 30분 걷기'],
    ['일어난 뒤에 창문 열고 햇볕 30초 쬐기', '점심 먹은 뒤에 햇볕 아래 5분 걷기', '저녁에 땀이 날 만큼 30분 움직이기'],
    ['밥을 먹기 전에 "천천히 씹기" 한 번 다짐하기', '간식이 생각날 때 과일이나 견과류 한 줌으로 바꾸기', '저녁에 채소가 들어간 한 끼 직접 차려 먹기'],
    ['앉은 뒤에 허리 펴고 어깨 한 번 내리기', '점심 먹은 뒤에 1분 심호흡과 목 돌리기', '잠들기 30분 전에 휴대폰 내려놓기'],
    ['일어나자마자 물 한 컵 마시기', '점심 먹은 뒤에 물 한 컵 더 마시기', '저녁에 따뜻한 물로 20분 족욕이나 반신욕하기'],
  ],
  social: [
    ['아침에 만나는 첫 사람에게 먼저 인사하기', '점심 먹은 뒤에 오래 연락 못 한 사람에게 안부 한 줄 보내기', '저녁에 새 모임이나 대화에 10분 얼굴 비추기'],
    ['도움을 받은 뒤에 웃으며 "고마워" 말하기', '점심 먹은 뒤에 누군가의 글이나 사진에 따뜻한 댓글 남기기', '주말에 친구와 밥 먹으며 이야기 들어 주기'],
    ['약속이 있으면 시간을 한 번 더 확인하기', '부탁받은 일 하나를 바로 처리하기', '저녁에 가까운 사람들 생일과 기념일 정리하기'],
    ['남 이야기가 나오면 다른 화제로 바꾸기', '어려운 부탁 하나를 정중하게 거절해 보기', '잠들기 전에 사람 사이에서 지킬 나만의 원칙 3가지 적기'],
    ['상대 말을 끝까지 들은 뒤에 말하기', '저녁에 오늘 만난 사람 한 명의 장점 떠올리기', '고민 있는 친구와 30분 이야기 나누기'],
  ],
  mind: [
    ['창밖을 본 뒤에 초록색 하나 찾아보기', '점심 먹은 뒤에 오늘 기대되는 일 하나 적기', '저녁에 식물을 돌보거나 공원을 30분 걷기'],
    ['좋아하는 노래 한 곡 끝까지 듣기', '잠들기 전에 오늘 잘한 일 3가지 적기', '저녁에 좋아하는 취미를 30분 하기'],
    ['자리에 앉은 뒤에 발바닥을 느끼며 숨 세 번 쉬기', '책상이나 침대 위 한 곳 정리하기', '잠들기 전에 지금 마음을 편지처럼 적어 보기'],
    ['걱정 하나를 종이에 쓰고 접어 두기', '걱정을 "내가 할 수 있는 것"과 "할 수 없는 것"으로 나눠 적기', '저녁에 안 쓰는 물건을 정리하며 마음 비우기'],
    ['눈 감고 4초 들이쉬고 6초 내쉬기', '따뜻한 차 한 잔을 천천히 마시기', '저녁에 휴대폰 없이 30분 쉬기'],
  ],
};

/** 90개 미션 목록 {id, area, el, level, text} */
export const MISSIONS = AREAS.flatMap((a) => LIB[a.key].flatMap((row, el) => row.map((text, i) => ({ id: `${a.key}-${el}-${i + 1}`, area: a.key, el, level: i + 1, text }))));
export const missionById = (id) => MISSIONS.find((m) => m.id === id) || null;

/** 점수 구간: 낮음(<58) · 보통(<72) · 높음 — 운세 평균이 60점대라 그에 맞춘 구간 */
export const band = (score) => (score < 58 ? 0 : score < 72 ? 1 : 2);

// 긍정 해석(날씨 → 우산의 ②). 낮은 구간은 반드시 "~하면" 조건문으로 노력과 연결한다.
export const REFRAME = {
  wealth: ['재물은 "지키는 쪽이 이기는 날"이에요. 작은 습관 하나를 지키면 새는 돈이 막혀요.', '재물은 "다지는 날"이에요. 오늘 정리해 두면 다음 기회에 힘이 돼요.', '재물은 "펼치는 날"이에요. 준비한 만큼 기회가 열리니 하나만 실천해 보세요.'],
  love: ['마음은 "천천히 데우는 날"이에요. 말보다 작은 행동 하나를 건네면 오해가 풀려요.', '마음은 "잔잔히 이어 가는 날"이에요. 가벼운 표현 하나가 관계를 데워 줘요.', '마음은 "다가가기 좋은 날"이에요. 먼저 한 걸음 내밀면 따뜻하게 돌아와요.'],
  career: ['일과 공부는 "한 번 더 확인하는 날"이에요. 하나씩 차근차근 하면 실수 없이 흐름이 바뀌어요.', '일과 공부는 "꾸준히 쌓는 날"이에요. 작은 정리가 내일의 속도를 만들어요.', '일과 공부는 "보여 주는 날"이에요. 준비한 것을 한 가지만 꺼내 보세요.'],
  health: ['몸은 "쉬어 가며 충전하는 날"이에요. 아주 작은 움직임만 챙기면 컨디션이 돌아와요.', '몸은 "가볍게 관리하는 날"이에요. 물과 스트레칭이 오늘의 힘이 돼요.', '몸은 "활기가 도는 날"이에요. 조금 더 움직이면 기분까지 올라가요.'],
  social: ['사람 사이는 "듣는 쪽에 서는 날"이에요. 한 번 더 들어 주면 오해 대신 신뢰가 쌓여요.', '사람 사이는 "약속을 지키는 날"이에요. 작은 성실함이 인연을 단단하게 해요.', '사람 사이는 "인연이 열리는 날"이에요. 먼저 건넨 인사가 기회가 돼요.'],
  mind: ['마음이 무거운 날이에요. 아주 작은 것 하나만 해도 충분해요. 숨 한 번이면 흐름이 바뀌어요.', '마음은 "고르는 날"이에요. 잠깐 멈추는 시간이 하루를 단단하게 해요.', '마음이 맑은 날이에요. 좋은 기운을 하나 더 쌓아 두세요.'],
};

const dayNo = (dk) => { const [y, m, d] = dk.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86400000); };

/**
 * 오늘의 우산: 가장 약한 분야(마음 날씨가 비·천둥이면 마음) × 필요한 기운으로 난이도별 미션 3개
 * @param ctx {dateKey, scores:{total,wealth,love,career,health,social}, yongsin, heesin, mood(1~5|null)}
 */
export function pickUmbrella(ctx) {
  const s = ctx.scores;
  const five = ['wealth', 'love', 'career', 'health', 'social'];
  const byMood = ctx.mood != null && ctx.mood <= 2;
  const area = byMood ? 'mind' : five.reduce((a, b) => (s[b] < s[a] ? b : a));
  const score = area === 'mind' ? s.total : s[area];
  // 마음 날씨가 비·천둥이면 점수가 높아도 마음을 먼저 다독이는 문장(점수와 기분이 어긋나지 않게)
  const bd = byMood ? 0 : band(score);
  // 필요한 기운을 바탕으로 하루씩 번갈아(용신 2일 : 희신 1일) — 같은 미션만 반복되지 않게
  const n = dayNo(ctx.dateKey);
  const el = (n % 3 === 2 && ctx.heesin != null) ? ctx.heesin : ctx.yongsin;
  const options = LIB[area][el].map((text, i) => ({ id: `${area}-${el}-${i + 1}`, area, el, level: i + 1, text }));
  const a = AREAS.find((x) => x.key === area);
  return { area, areaLabel: a.label, areaIcon: a.icon, el, score, byMood, band: bd, frame: REFRAME[area][bd], options };
}

// ---------- 저장 (순수 함수: 새 객체를 돌려준다) ----------

function prune(s) {
  const keys = Object.keys(s).sort((a, b) => dayNo(a) - dayNo(b));
  keys.slice(0, Math.max(0, keys.length - HABIT_KEEP_DAYS)).forEach((k) => delete s[k]);
  return s;
}
const put = (store, dk, patch) => prune({ ...(store || {}), [dk]: { ...((store || {})[dk] || {}), ...patch } });

export const habitDay = (store, dk) => (store || {})[dk] || {};
export function setMood(store, dk, v) {
  if (!MOODS.some((m) => m.v === v)) return { store, changed: false };
  return { store: put(store, dk, { before: v }), changed: true };
}
export function pickLevel(store, dk, level) {
  if (habitDay(store, dk).done || ![1, 2, 3].includes(level)) return { store, changed: false };
  return { store: put(store, dk, { level }), changed: true };
}
/** 우산 완료 (하루 한 번) */
export function completeHabit(store, dk, m) {
  if (habitDay(store, dk).done) return { store, changed: false };
  return { store: put(store, dk, { done: true, id: m.id, area: m.area, el: m.el, level: m.level }), changed: true };
}
/** 미션 뒤 마음: 'lighter' 가벼워졌어요 · 'same' 그대로예요 */
export function setAfter(store, dk, v) {
  const d = habitDay(store, dk);
  if (!d.done || d.after || !['lighter', 'same'].includes(v)) return { store, changed: false };
  return { store: put(store, dk, { after: v }), changed: true };
}

/** 통계: 우산 완료 일수, 마음이 가벼워진 비율, 평균 마음 날씨, 난이도별 횟수 */
export function habitStats(store) {
  const days = Object.values(store || {});
  const done = days.filter((d) => d.done);
  const answered = done.filter((d) => d.after);
  const moods = days.filter((d) => d.before).map((d) => d.before);
  return {
    doneDays: done.length,
    lighterRate: answered.length ? Math.round((answered.filter((d) => d.after === 'lighter').length / answered.length) * 100) : null,
    moodDays: moods.length,
    avgMood: moods.length ? Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10 : null,
    byLevel: [1, 2, 3].map((lv) => done.filter((d) => d.level === lv).length),
  };
}

/** 이번 주(월~일) 우산 완료 횟수 — 주 3회면 "이번 주 지켰어요"(하루 빠져도 끊기지 않는 연속) */
export function weekDone(store, dk) {
  const n = dayNo(dk); const dow = (n + 3) % 7; // 1970-01-01은 목요일 → 월요일 0
  const mon = n - dow;
  return Object.entries(store || {}).filter(([k, d]) => d.done && dayNo(k) >= mon && dayNo(k) <= mon + 6).length;
}

/** 천둥(⛈️) 마음이 오늘까지 3일 이어지면 상담 안내를 부드럽게 보여 준다 */
export function needsCare(store, dk) {
  const n = dayNo(dk);
  const byNo = Object.fromEntries(Object.entries(store || {}).map(([k, d]) => [dayNo(k), d]));
  return [0, 1, 2].every((i) => byNo[n - i] && byNo[n - i].before === 1);
}

// ---------- 문장 규칙 (테스트로 모든 운세 문장을 검사) ----------

/** 쓰지 않는 말: 불안을 키우고 행동으로 이어지지 않는 단정 */
export const BANNED_TONE = ['나쁜 날', '최악', '불길', '흉한', '흉하', '망하', '망한', '재수 없', '불운', '파탄', '저주'];
export function toneProblems(text) {
  return BANNED_TONE.filter((w) => String(text).includes(w));
}
