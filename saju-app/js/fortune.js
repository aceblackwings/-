// 오늘의 운세 엔진: 운의 층(대운→올해→이달→오늘, period.js) × 내 사주 → 6개 카테고리 점수 + 문장 + 행운 키트
// 점수에는 무작위 몫이 없고, 문장은 같은 점수 구간에서만 고른다(그래프와 설명이 어긋나지 않게).
import {
  STEM_ELEMENT, BRANCH_ELEMENT, ELEMENT_KO, ELEMENT_HANJA,
  dayPillarIndex, pillarFromIndex, tenGod, seededRandom, todayKST, childOf,
} from './saju.js';
import { layersAt, categoryScores, dayRelations, monthPeriod, explainParts } from './period.js';

export const CATEGORIES = [
  { key: 'total', label: '총운', icon: '✦' },
  { key: 'wealth', label: '재물', icon: '◈' },
  { key: 'love', label: '애정', icon: '♥' },
  { key: 'career', label: '직장·학업', icon: '▲' },
  { key: 'health', label: '건강', icon: '✚' },
  { key: 'social', label: '대인', icon: '◎' },
];

// 십신별 카테고리 보정 [총운, 재물, 애정, 직장, 건강, 대인]

export const TEN_GOD_INFO = {
  비견: { title: '어깨를 나란히 하는 날', desc: '나와 같은 기운이 들어와 자신감이 오릅니다. 혼자 밀어붙이기보다 동료와 함께할 때 힘이 배가됩니다.', mission: '오늘 동료 한 명에게 먼저 도움을 제안하기', caution: '고집으로 부딪히기 쉬움', lucky: '함께 운동하거나 팀 작업 마무리하기' },
  겁재: { title: '지갑을 단단히 여미는 날', desc: '경쟁의 기운이 강해 돈과 기회가 새어 나가기 쉽습니다. 지키는 것이 곧 버는 것입니다.', mission: '오늘 하루 충동구매 0회 지키기', caution: '금전 손실, 보증·대여 주의', lucky: '가계부 정리, 구독 서비스 점검' },
  식신: { title: '재능이 꽃피는 날', desc: '표현력과 여유가 살아납니다. 맛있는 음식, 창작, 취미 활동이 운을 키웁니다.', mission: '오늘 떠오른 아이디어 3개를 메모하기', caution: '과식과 게으름', lucky: '새로운 맛집 가기, 글·그림 창작' },
  상관: { title: '말에 날개가 달린 날', desc: '아이디어와 말솜씨가 빛나지만, 날카로운 한마디가 화를 부를 수 있습니다.', mission: '말하기 전에 3초 멈추고, 칭찬 3번 먼저 하기', caution: '윗사람과의 언쟁, 구설', lucky: '발표, 콘텐츠 제작, 영업' },
  편재: { title: '뜻밖의 기회가 오는 날', desc: '움직이는 만큼 재물이 따라옵니다. 새로운 사람과 장소에서 기회가 열립니다.', mission: '평소 안 가던 곳에 들러 새로운 경험 하나 하기', caution: '큰 베팅과 과시성 소비', lucky: '네트워킹, 협상, 부업 아이디어 실행' },
  정재: { title: '차곡차곡 쌓이는 날', desc: '성실함이 그대로 보상으로 돌아옵니다. 계획한 일을 꾸준히 처리하기 좋습니다.', mission: '오늘 할 일 3가지를 정하고 모두 완료하기', caution: '지나친 계산으로 인색해 보임', lucky: '저축, 정리정돈, 마감 처리' },
  편관: { title: '시험대에 오르는 날', desc: '압박과 책임이 몰려오지만, 버텨 낸 만큼 단단해집니다. 무리한 일정은 피하세요.', mission: '보고나 중요한 대화 전에 심호흡 3번 하기', caution: '과로, 사고, 상사의 압박', lucky: '운동으로 스트레스 해소, 원칙 지키기' },
  정관: { title: '인정받는 날', desc: '책임감과 신뢰가 돋보입니다. 승진, 평가, 공식적인 자리에서 좋은 결과가 기대됩니다.', mission: '약속 시간보다 10분 먼저 도착하기', caution: '체면 때문에 무리한 약속', lucky: '면접, 계약, 공식 발표' },
  편인: { title: '직감이 날카로운 날', desc: '번뜩이는 영감이 찾아오지만 생각이 많아질 수 있습니다. 혼자만의 시간이 도움이 됩니다.', mission: '잠들기 전 10분 동안 휴대폰 없이 생각 정리하기', caution: '의심과 변덕, 계획 변경', lucky: '공부, 연구, 명상, 독서' },
  정인: { title: '귀인이 돕는 날', desc: '윗사람과 주변의 도움이 자연스럽게 들어옵니다. 배우고 받아들이는 자세가 복을 부릅니다.', mission: '도움을 준 사람에게 감사 메시지 보내기', caution: '의존하는 마음', lucky: '자격증 공부, 멘토 만나기, 문서 작업' },
};

const TIER_TEXT = {
  total: ['기운이 가라앉는 날입니다. 큰 결정은 미루고 컨디션을 지키세요.', '평범하지만 안정적인 하루입니다. 작은 일부터 차근차근 처리하세요.', '흐름이 좋습니다. 미뤄 둔 일을 시작하기에 알맞습니다.', '오늘은 운의 파도가 높습니다. 과감하게 도전해도 좋습니다.'],
  wealth: ['지출이 새기 쉬운 날입니다. 결제 버튼 앞에서 한 번 더 생각하세요.', '수입과 지출이 균형을 이룹니다. 큰 거래보다 관리에 집중하세요.', '작은 이익이 들어오는 흐름입니다. 정산과 수금을 챙기세요.', '재물운이 강하게 들어옵니다. 기회가 오면 놓치지 마세요.'],
  love: ['오해가 생기기 쉬우니 말보다 행동으로 마음을 보여 주세요.', '잔잔한 하루입니다. 가벼운 안부 연락이 관계를 데워 줍니다.', '호감을 얻기 쉬운 날입니다. 먼저 다가가 보세요.', '매력이 빛나는 날입니다. 고백이나 데이트에 좋은 기운입니다.'],
  career: ['실수가 생기기 쉬우니 확인을 두 번 하세요.', '맡은 일을 꾸준히 처리하면 무난합니다.', '능력을 보여 줄 기회가 있습니다. 적극적으로 의견을 내세요.', '성과가 눈에 띄는 날입니다. 중요한 발표나 시험에 유리합니다.'],
  health: ['피로가 쌓였습니다. 일찍 잠자리에 들고 무리한 운동은 피하세요.', '보통의 컨디션입니다. 물을 자주 마시고 스트레칭을 해 주세요.', '몸이 가볍습니다. 가벼운 운동을 시작하기 좋습니다.', '활력이 넘칩니다. 새로운 운동이나 도전에 좋은 날입니다.'],
  social: ['말 한마디가 오해를 부를 수 있습니다. 듣는 쪽에 서 보세요.', '무난한 관계 흐름입니다. 약속은 꼭 지키세요.', '사람 사이에서 기회가 생깁니다. 모임에 얼굴을 비춰 보세요.', '귀인이 나타나는 날입니다. 새로운 인연을 반기세요.'],
};

export const DAY_MASTER_PROFILE = [
  { name: '갑목(甲木)', image: '큰 나무', text: '곧게 뻗어 오르는 큰 나무처럼 추진력과 리더십이 강합니다. 정의감이 뚜렷하고, 한번 정한 목표를 끝까지 밀고 나갑니다.' },
  { name: '을목(乙木)', image: '덩굴과 꽃', text: '부드럽게 휘어지며 어디서든 뿌리내리는 꽃과 덩굴처럼 적응력과 친화력이 뛰어납니다. 섬세하고 현실 감각이 좋습니다.' },
  { name: '병화(丙火)', image: '태양', text: '세상을 비추는 태양처럼 밝고 열정적입니다. 사람을 끌어당기는 힘이 있고, 숨김없이 솔직합니다.' },
  { name: '정화(丁火)', image: '촛불', text: '어둠을 밝히는 촛불처럼 따뜻하고 집중력이 깊습니다. 배려심이 많고, 한 분야를 깊게 파고드는 장인 기질이 있습니다.' },
  { name: '무토(戊土)', image: '큰 산', text: '묵직한 산처럼 믿음직하고 포용력이 큽니다. 쉽게 흔들리지 않으며, 주변을 든든하게 지켜 주는 중심 역할을 합니다.' },
  { name: '기토(己土)', image: '기름진 들판', text: '곡식을 길러 내는 들판처럼 실속 있고 다정합니다. 꼼꼼하게 챙기고 가꾸는 능력이 뛰어납니다.' },
  { name: '경금(庚金)', image: '단단한 원석', text: '단단한 바위와 쇠처럼 결단력과 의리가 강합니다. 옳고 그름이 분명하고, 위기에서 오히려 강해집니다.' },
  { name: '신금(辛金)', image: '빛나는 보석', text: '정교하게 다듬어진 보석처럼 감각이 예리하고 미적 센스가 뛰어납니다. 완벽을 추구하며 자존심이 강합니다.' },
  { name: '임수(壬水)', image: '큰 바다', text: '넓은 바다처럼 스케일이 크고 지혜롭습니다. 자유를 사랑하고, 새로운 흐름을 빠르게 읽어 냅니다.' },
  { name: '계수(癸水)', image: '이슬비', text: '만물을 적시는 이슬비처럼 섬세하고 직관이 뛰어납니다. 조용하지만 깊은 통찰력으로 사람을 이해합니다.' },
];

export const ELEMENT_LUCK = [
  { color: '초록', hex: '#39FF88', numbers: [3, 8], direction: '동쪽', food: '녹색 채소, 새싹 비빔밥', time: '오전 3시~7시 (寅卯시)', item: '식물, 나무 소품' },
  { color: '빨강', hex: '#FF2E63', numbers: [2, 7], direction: '남쪽', food: '매콤한 음식, 토마토', time: '오전 9시~오후 1시 (巳午시)', item: '향초, 붉은 액세서리' },
  { color: '노랑', hex: '#FFC93C', numbers: [5, 10], direction: '중앙', food: '고구마, 단호박, 곡물', time: '오후 1시~3시 (未시)', item: '도자기, 황토색 소품' },
  { color: '흰색·은색', hex: '#E0E0FF', numbers: [4, 9], direction: '서쪽', food: '무, 배, 흰살생선', time: '오후 3시~7시 (申酉시)', item: '은 액세서리, 금속 시계' },
  { color: '검정·남색', hex: '#00E5FF', numbers: [1, 6], direction: '북쪽', food: '해산물, 검은콩, 미역국', time: '오후 9시~새벽 1시 (亥子시)', item: '물병, 어항, 유리 소품' },
];

const COMBINE = new Set(['0-1', '2-11', '3-10', '4-9', '5-8', '6-7']); // 육합

function branchRelation(a, b) {
  const key = a < b ? `${a}-${b}` : `${b}-${a}`;
  if (COMBINE.has(key)) return 'combine';
  if (Math.abs(a - b) === 6) return 'clash';
  return null;
}

function tierOf(score) {
  if (score >= 80) return 3;
  if (score >= 60) return 2;
  if (score >= 40) return 1;
  return 0;
}

export function birthKey(saju) {
  const i = saju.input;
  return `${i.year}-${i.month}-${i.day}-${i.timeKnown ? `${i.hour}:${i.minute}` : 'x'}`;
}

/**
 * @param saju computeSaju() 결과
 * @param date {year, month, day} 기본값: 오늘(KST)
 */
export function computeFortune(saju, date = todayKST(), opts = {}) {
  const L = layersAt(saju, date, opts.gender);
  const today = L.day.pillar;
  const god = L.day.god;
  const todayEl = STEM_ELEMENT[today.stem];
  const { relations, extra } = dayRelations(saju, today, branchRelation);
  const scores = categoryScores(L.day.score, god, extra);
  const dateKey = `${date.year}-${date.month}-${date.day}`;
  const bk = birthKey(saju);

  const texts = {};
  CATEGORIES.forEach((c) => { texts[c.key] = TIER_TEXT[c.key][tierOf(scores[c.key])]; });

  const sorted = CATEGORIES.slice(1).map((c) => c.key).sort((a, b) => scores[b] - scores[a]);
  const luck = ELEMENT_LUCK[saju.yongsin];
  const luckyNumber = luck.numbers[Math.floor(seededRandom(`${bk}|${dateKey}|num`) * 2)];

  return {
    date, dateKey,
    pillar: today,
    tenGod: god,
    info: TEN_GOD_INFO[god],
    todayElement: todayEl,
    relations,
    scores,
    tier: tierOf(scores.total),
    texts,
    best: sorted[0],
    worst: sorted[sorted.length - 1],
    luck: { ...luck, number: luckyNumber, element: saju.yongsin },
    yongsinMatch: todayEl === saju.yongsin,
    summary: buildSummary(saju, god, todayEl),
    // 운의 층: 오늘 점수가 어디서 왔는지 (오늘 = 일진 70% + 이달 30%)
    layers: L,
    period: monthPeriod(date),
    why: explainParts(L.day.parts),
  };
}

function buildSummary(saju, god, todayEl) {
  const me = STEM_ELEMENT[saju.dayMaster];
  let line;
  if (todayEl === saju.yongsin) line = `오늘은 나에게 필요한 ${ELEMENT_KO[todayEl]}(${ELEMENT_HANJA[todayEl]}) 기운이 들어오는 날입니다. 평소보다 일이 술술 풀립니다.`;
  else if (todayEl === saju.gisin) line = `오늘은 나와 잘 맞지 않는 ${ELEMENT_KO[todayEl]}(${ELEMENT_HANJA[todayEl]}) 기운이 강합니다. 부적과 미션으로 액운을 덜어 내세요.`;
  else if (todayEl === childOf(me)) line = '내 기운이 밖으로 흘러나가는 날입니다. 표현하고 베푸는 만큼 돌아옵니다.';
  else line = `오늘의 기운은 ${ELEMENT_KO[todayEl]}(${ELEMENT_HANJA[todayEl]})입니다. 흐름에 맞춰 차분하게 움직이면 좋습니다.`;
  return line;
}
