// 고민 해결 여정: 처음 고른 고민을 30일(3장 × 10걸음) 동안 매일 한 걸음씩 함께 해결
// 매 걸음은 "작은 행동 + 사주 근거(용신 오행 팁)"로 구성 → "내 고민을 돕고 있다"는 체감
import { ELEMENT_KO, ELEMENT_HANJA } from './saju.js';

export const JOURNEYS = {
  exam: { chapters: ['기초 다지기', '실력 쌓기', '실전 돌파'], goal: '합격',
    steps: ['오늘 공부할 범위를 3줄로 적기', '25분 집중 + 5분 휴식 2세트', '어제 틀린 문제 3개 다시 풀기', '가장 약한 과목 15분만 손대기', '공부한 내용 1분 설명해 보기', '책상 위 물건 3개 치우기', '모의 문제 10개 시간 재고 풀기', '잠들기 전 오늘 배운 것 떠올리기', '응원해 줄 친구에게 진도 공유하기', '시험장 가는 길 상상하며 심호흡 3번'] },
  job: { chapters: ['나를 정리하기', '문 두드리기', '합격 문 열기'], goal: '취업',
    steps: ['내 강점 3가지 적기', '관심 회사 1곳 찾아 저장하기', '이력서 한 문장 다듬기', '자기소개 30초 소리 내어 말하기', '지원 공고 1개 꼼꼼히 읽기', '면접 예상 질문 1개 답 적기', '포트폴리오 사진 1장 정리하기', '업계 소식 기사 1개 읽기', '선배나 친구에게 조언 1개 구하기', '지원서 1곳 제출하기'] },
  wealth: { chapters: ['새는 돈 막기', '모으는 습관', '불리는 지혜'], goal: '재물',
    steps: ['오늘 지출 모두 적어 보기', '안 쓰는 구독 1개 확인하기', '충동구매 1번 참기', '지갑·통장 정리 5분', '오늘 쓴 돈 중 아낄 수 있던 것 찾기', '소액 저축 1번 하기', '이번 달 목표 금액 정하기', '돈 공부 글 1개 읽기', '지갑에 행운 색 소품 넣기', '감사한 소비 1개 적기'] },
  business: { chapters: ['기반 다지기', '고객 만나기', '확장하기'], goal: '사업',
    steps: ['오늘의 가장 중요한 일 1개 정하기', '고객 후기 1개 다시 읽기', '경쟁자 1곳 살펴보기', '거래처에 안부 연락 1번', '매출·지출 숫자 확인하기', '작은 개선점 1개 바로 실행', '새 아이디어 1개 메모', '협력할 사람 1명 떠올리기', '내 일을 한 문장으로 소개하기', '오늘 잘한 점 1개 칭찬하기'] },
  love: { chapters: ['나를 사랑하기', '마음 열기', '인연 잇기'], goal: '연애',
    steps: ['거울 보고 좋은 점 1개 말하기', '좋아하는 것 3가지 적기', '먼저 웃으며 인사하기', '관심 있는 사람에게 짧은 안부', '새로운 모임·장소 1곳 알아보기', '행운 색 옷이나 소품 걸치기', '칭찬 1번 건네기', '이상형 말고 "함께하고 싶은 하루" 적기', '친구에게 소개팅·모임 이야기 꺼내기', '오늘 설렜던 순간 기록하기'] },
  marriage: { chapters: ['서로 알기', '함께 그리기', '약속 맺기'], goal: '결혼',
    steps: ['상대에게 고마운 점 1개 전하기', '함께하고 싶은 일 3가지 적기', '가족 이야기 하나 나누기', '돈에 대한 생각 1가지 이야기하기', '서로의 하루 10분 들어 주기', '작은 선물이나 메시지 준비', '함께 걷기 20분', '미래 집 모습 같이 상상하기', '서운했던 일 하나 부드럽게 풀기', '"우리"의 목표 1개 정하기'] },
  health: { chapters: ['몸 깨우기', '습관 만들기', '활력 채우기'], goal: '건강',
    steps: ['물 한 잔 더 마시기', '스트레칭 5분', '10분 걷기', '자기 전 휴대폰 30분 내려놓기', '채소 한 접시 먹기', '계단 이용하기', '심호흡 1분', '일찍 잠자리에 들기', '좋아하는 운동 하나 정하기', '몸이 고마웠던 순간 적기'] },
  people: { chapters: ['나를 다잡기', '먼저 다가가기', '인복 키우기'], goal: '인간관계',
    steps: ['오늘 고마운 사람 1명 떠올리기', '먼저 인사 3번 하기', '연락 끊긴 지인 1명에게 안부', '상대 말 끝까지 들어 보기', '칭찬 한마디 건네기', '부탁 하나 들어 주기', '모임 약속 1개 잡기', '불편했던 관계 하나 마음속으로 정리', '단톡방에 좋은 소식 공유', '오늘 만난 사람의 좋은 점 기록'] },
  change: { chapters: ['정보 모으기', '준비하기', '새 길 열기'], goal: '이직·이사',
    steps: ['바꾸고 싶은 이유 3가지 적기', '원하는 조건 우선순위 정하기', '관련 정보 1개 찾아보기', '필요한 비용·서류 확인하기', '지금 자리에서 배운 점 정리', '가고 싶은 곳 1곳 직접 알아보기', '주변에 경험담 1개 듣기', '정리할 물건 5개 고르기', '결정 날짜 정해 두기', '새 시작을 위한 작은 의식 하나'] },
};

const ELEMENT_TIP = [
  { color: '초록', place: '나무가 많은 곳', time: '아침', thing: '식물' },
  { color: '빨강', place: '햇빛 드는 밝은 곳', time: '한낮', thing: '향초' },
  { color: '노랑', place: '안정감 있는 넓은 곳', time: '오후', thing: '도자기' },
  { color: '흰색', place: '정돈된 깔끔한 곳', time: '저녁 무렵', thing: '금속 소품' },
  { color: '남색', place: '물가나 조용한 곳', time: '밤', thing: '물 한 잔' },
];

export const JOURNEY_DAYS = 30;

/**
 * n번째 걸음 (0~29)
 * @returns {chapter, chapterIndex, stepNo, title, why}
 */
export function journeyStep(concern, n, yongsin) {
  const j = JOURNEYS[concern] || JOURNEYS.wealth;
  const ci = Math.min(2, Math.floor(n / 10));
  const title = j.steps[n % 10];
  const tip = ELEMENT_TIP[yongsin];
  const whys = [
    `용신 ${ELEMENT_HANJA[yongsin]}(${ELEMENT_KO[yongsin]}) 기운을 살리려면 ${tip.place}에서 해 보세요.`,
    `${tip.time}에 하면 ${ELEMENT_KO[yongsin]} 기운이 가장 잘 받쳐 줍니다.`,
    `${tip.color}색 소품을 곁에 두면 ${ELEMENT_HANJA[yongsin]} 기운이 함께 차올라요.`,
    `${tip.thing}을(를) 가까이 두고 하면 마음이 한결 안정됩니다.`,
  ];
  return { chapter: j.chapters[ci], chapterIndex: ci, stepNo: n + 1, title, why: whys[n % whys.length], goal: j.goal };
}

export function emptyJourney(concern) {
  return { concern, done: 0, lastDate: null, started: null };
}

/** 하루 한 걸음 */
export function completeStep(j, dateKey) {
  if (j.lastDate === dateKey || j.done >= JOURNEY_DAYS) return { journey: j, advanced: false, chapterDone: false };
  const done = j.done + 1;
  return { journey: { ...j, done, lastDate: dateKey, started: j.started || dateKey }, advanced: true, chapterDone: done % 10 === 0, finished: done >= JOURNEY_DAYS };
}
