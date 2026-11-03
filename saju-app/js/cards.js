// 12지신 신수 카드(v0.24): 타로 자리를 채우는 우리만의 카드 뽑기
// - 카드 60장 = 12지신 × 오행 5. 모든 카드는 같은 확률(1/60)로 나온다(원칙 4: 확률 공개)
// - 같은 사람·같은 날·같은 질문·같은 뽑기 방식이면 같은 카드 → 좋은 카드가 나올 때까지 다시 뽑는 일이 없다
// - 결과는 기록함에 자동 저장(app.js). 순수 로직만 둔다(테스트: tests/cards.test.mjs)
import { seededRandom } from './saju.js';

export const DECK_SIZE = 60;

/** 띠별 카드 (ZODIAC 순서: 쥐·소·호랑이·토끼·용·뱀·말·양·원숭이·닭·개·돼지) */
export const CARD_ZODIAC = [
  { title: '지혜의 문', keyword: '기회 포착', message: '작은 틈에서 기회를 찾아내는 카드예요. 정보를 모으고 재빠르게 움직이면 길이 열려요.', action: '미뤄 둔 정보 하나를 오늘 확인해 보세요.', caution: '잔꾀보다 정직이 오래가요.' },
  { title: '묵묵한 밭갈이', keyword: '꾸준함', message: '느려 보여도 확실하게 쌓이는 카드예요. 지금 하는 일을 멈추지 않는 것이 가장 큰 힘이에요.', action: '매일 하는 일 하나를 오늘도 끝까지 해 보세요.', caution: '고집으로 굳어지지 않게 다른 의견도 들어 보세요.' },
  { title: '용기의 포효', keyword: '결단', message: '망설이던 일에 첫발을 내디딜 때라는 카드예요. 용기를 낸 만큼 상황이 움직여요.', action: '미뤄 둔 결정 하나를 오늘 내려 보세요.', caution: '힘으로 밀어붙이기보다 때를 살피세요.' },
  { title: '달빛 정원', keyword: '조화와 회복', message: '부드러움이 힘이 되는 카드예요. 관계를 다독이고 마음을 쉬게 하면 흐름이 살아나요.', action: '고마운 사람에게 짧은 안부를 보내 보세요.', caution: '피하기만 하면 작은 문제가 커질 수 있어요.' },
  { title: '구름 위 비상', keyword: '도약', message: '크게 꿈꾸고 멀리 보라는 카드예요. 큰 그림을 그리면 작은 걱정이 작아져요.', action: '1년 뒤 이루고 싶은 모습을 한 줄로 적어 보세요.', caution: '자신감이 자만이 되지 않게 발밑도 살피세요.' },
  { title: '허물 벗기', keyword: '변화와 통찰', message: '낡은 것을 벗고 새로워지는 카드예요. 정리할수록 새로운 기운이 들어와요.', action: '안 쓰는 물건이나 습관 하나를 정리해 보세요.', caution: '의심이 지나치면 좋은 기회도 놓쳐요.' },
  { title: '바람을 달리다', keyword: '추진력', message: '움직일수록 길이 열리는 카드예요. 생각만 하던 일을 몸으로 옮겨 보세요.', action: '평소 안 가던 곳에 한 번 가 보세요.', caution: '속도를 내되 쉬는 시간도 챙기세요.' },
  { title: '따뜻한 울타리', keyword: '배려와 안식', message: '함께할 때 힘이 커지는 카드예요. 나를 돌보고 곁의 사람을 챙기면 마음이 든든해져요.', action: '오늘은 나를 위한 휴식 30분을 꼭 만들어 보세요.', caution: '남의 눈치 때문에 내 마음을 잃지 마세요.' },
  { title: '재주의 나무', keyword: '재치와 해결', message: '새로운 방법이 답이 되는 카드예요. 막힌 일도 다른 각도에서 보면 쉽게 풀려요.', action: '늘 하던 일을 다른 방식으로 한 번 해 보세요.', caution: '여러 일을 벌이기보다 하나를 마무리하세요.' },
  { title: '새벽을 여는 소리', keyword: '시작과 정돈', message: '미리 준비한 사람이 웃는 카드예요. 차근차근 정돈하면 하루가 가벼워져요.', action: '내일 할 일 3가지를 오늘 밤에 적어 두세요.', caution: '완벽하게 하려다 시작을 늦추지 마세요.' },
  { title: '믿음의 약속', keyword: '신뢰', message: '약속을 지키는 사람에게 사람이 모이는 카드예요. 믿음이 가장 큰 재산이 돼요.', action: '미뤄 둔 약속이나 연락 하나를 지켜 보세요.', caution: '걱정이 앞서 미리 지치지 않게 하세요.' },
  { title: '복주머니', keyword: '풍요와 여유', message: '이미 가진 복을 세어 볼 때라는 카드예요. 여유로운 마음이 복을 더 불러와요.', action: '오늘 감사한 일 3가지를 적어 보세요.', caution: '기분 따라 과식·과소비하지 않게 조심하세요.' },
];

/** 오행별 카드 결 */
export const CARD_ELEMENT = [
  { name: '목', hanja: '木', prefix: '싹트는', tone: '새로 시작하는 일에 힘이 실려요.' },
  { name: '화', hanja: '火', prefix: '타오르는', tone: '드러내고 표현할수록 좋은 기운이에요.' },
  { name: '토', hanja: '土', prefix: '다지는', tone: '서두르지 말고 바탕을 다지면 좋은 기운이에요.' },
  { name: '금', hanja: '金', prefix: '다듬는', tone: '정리하고 결단하기 좋은 기운이에요.' },
  { name: '수', hanja: '水', prefix: '흐르는', tone: '유연하게 흐름을 타면 좋은 기운이에요.' },
];

/** 질문 분야 × 오행 한 줄 */
export const CARD_AREAS = [
  { key: 'today', icon: '☀️', label: '오늘 하루', lines: ['오늘은 새로운 일을 하나 시작해 보세요.', '오늘은 하고 싶은 말을 밝게 꺼내 보세요.', '오늘은 하던 일을 차분히 마무리하세요.', '오늘은 미뤄 둔 정리를 끝내기 좋아요.', '오늘은 계획보다 흐름에 맡겨 보세요.'] },
  { key: 'love', icon: '💕', label: '연애·관계', lines: ['새로운 만남이나 대화가 싹틀 수 있어요.', '마음을 솔직하게 표현하면 거리가 가까워져요.', '서두르기보다 믿음을 쌓는 시간이 필요해요.', '애매한 관계는 정리하면 마음이 가벼워져요.', '상대의 속도에 맞춰 주면 자연스럽게 가까워져요.'] },
  { key: 'money', icon: '💰', label: '재물', lines: ['작게 시작하는 부업·저축이 자라나요.', '알리고 보여 줄수록 수입의 기회가 생겨요.', '새는 돈을 막는 것이 가장 큰 벌이예요.', '지출 목록을 정리하면 여유가 생겨요.', '들어온 돈은 바로 나눠 담아 흐름을 만드세요.'] },
  { key: 'work', icon: '💼', label: '일·공부', lines: ['새 과목·새 일을 배우기 좋은 때예요.', '발표·면접처럼 드러내는 자리에 강해요.', '기초를 다시 다지면 실력이 단단해져요.', '할 일을 줄이고 핵심에 집중하세요.', '막히면 방법을 바꿔 돌아가도 괜찮아요.'] },
  { key: 'health', icon: '🌿', label: '건강·마음', lines: ['가벼운 산책과 스트레칭이 기운을 살려요.', '마음의 열을 식히는 휴식이 필요해요.', '규칙적인 식사와 잠이 가장 좋은 약이에요.', '숨을 깊게 쉬고 몸의 긴장을 풀어 주세요.', '물을 충분히 마시고 푹 쉬어 주세요.'] },
  { key: 'choice', icon: '🧭', label: '고민 중인 선택', lines: ['새로 시작하는 쪽에 힘이 실려요.', '마음이 더 뜨거운 쪽을 따라가 보세요.', '지금 가진 것을 지키는 쪽이 안전해요.', '버릴 것을 먼저 정하면 답이 보여요.', '조금 더 지켜보고 흐름이 정해질 때 고르세요.'] },
];

export const SPREADS = {
  one: { label: '오늘의 한 장', positions: ['오늘의 카드'] },
  three: { label: '세 장 흐름', positions: ['지금', '조언', '앞으로'] },
};

/** 카드 id(0~59) → 띠·오행 */
export const cardOf = (id) => ({ id, zodiac: id % 12, element: Math.floor(id / 12) });
export const cardName = (c) => `${CARD_ELEMENT[c.element].prefix} ${CARD_ZODIAC[c.zodiac].title}`;

/** 서로 다른 카드 n장 (seed가 같으면 같은 결과) */
export function drawCards(seed, n) {
  const out = [];
  let i = 0;
  while (out.length < n) {
    const id = Math.floor(seededRandom(`${seed}|card|${i++}`) * DECK_SIZE);
    if (!out.includes(id)) out.push(id);
  }
  return out.map(cardOf);
}

/** 뽑기 seed: 사람 + 날짜 + 질문 + 방식 */
export const drawSeed = (person, dateKey, area, spread) => `${person}|${dateKey}|${area}|${spread}`;

/**
 * 카드 한 장 풀이
 * @param saju {yongsin, gisin} 내 사주와의 관계 한 줄에 사용
 */
export function readCard(card, areaKey, saju, position = '') {
  const Z = CARD_ZODIAC[card.zodiac]; const E = CARD_ELEMENT[card.element];
  const A = CARD_AREAS.find((a) => a.key === areaKey) || CARD_AREAS[0];
  const fit = card.element === saju.yongsin ? 'need' : card.element === saju.gisin ? 'slow' : 'plain';
  const fitLine = fit === 'need' ? `🌿 나에게 꼭 필요한 ${E.name}(${E.hanja}) 기운의 카드예요. 이 카드의 조언을 따르면 힘이 배로 실려요.`
    : fit === 'slow' ? `🍃 나에게 버거운 ${E.name}(${E.hanja}) 기운이 담겨 있어요. 서두르지 말고 한 템포 쉬어 가라는 신호예요.`
      : `✨ ${E.name}(${E.hanja}) 기운의 카드예요. ${E.tone}`;
  return {
    ...card, name: cardName(card), keyword: Z.keyword, position,
    message: Z.message, area: A, areaLine: A.lines[card.element], fit, fitLine, action: Z.action, caution: Z.caution,
  };
}

/** 한 번의 뽑기 결과 전체 */
export function drawReading({ person, dateKey, area, spread, saju }) {
  const sp = SPREADS[spread] || SPREADS.one;
  const cards = drawCards(drawSeed(person, dateKey, area, spread), sp.positions.length);
  const readings = cards.map((c, i) => readCard(c, area, saju, sp.positions[i]));
  const summary = readings.length === 1 ? `${readings[0].name} — ${readings[0].areaLine}`
    : `지금은 「${readings[0].keyword}」, 조언은 「${readings[1].keyword}」, 앞으로는 「${readings[2].keyword}」의 흐름이에요.`;
  return { spread, area, readings, summary };
}
