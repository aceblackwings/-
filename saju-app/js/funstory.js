// 재미있게 읽는 기운 카드·타로(v0.50.3, 2026-11-05 사용자 요청 「기운카드와 타로 내용도 재미있게」)
// 오늘의 한 편과 같은 문법: 첫 장면(훅) → 몸의 반응 → 까닭 → 오늘의 주문 → 한마디/질문, 4~6문장
// 같은 카드·같은 날이면 늘 같은 글(무작위 없음). 순수 로직만(테스트: tests/storybook.test.mjs)
import { josa } from './josa.js';
import { ANIMALS } from './saju.js';
import { EL_NAME } from './storybook.js';

// 오행별 장면: [첫 장면 2가지, 몸의 반응, 오늘의 주문, 지신의 한마디]
const KI_EL = [
  { hook: ['오늘 지신이 등에 연둣빛 새싹 하나를 꽂고 달려왔어요.', '오늘 지신이 작은 씨앗 주머니를 흔들며 문 앞에 서 있어요.'],
    body: '카드를 뒤집는 순간 코끝에 비 온 뒤 풀 냄새가 스치는 것 같지 않나요?',
    spell: '오늘의 주문은 「새로 하나 시작하기」, 화분에 물 주기든 새 강의 한 편이든 작게 시작해 보세요.',
    quote: '「작게 심어도 돼, 나무는 원래 작게 시작하거든.」 하고 지신이 속삭여요.' },
  { hook: ['오늘 지신이 두 손에 작은 등불을 들고 나타났어요.', '오늘 지신이 볼이 발그레한 채로 햇살 한 줌을 쥐고 왔어요.'],
    body: '카드를 보는 순간 볼이 살짝 따뜻해지고, 괜히 누군가에게 말을 걸고 싶어질 거예요.',
    spell: '오늘의 주문은 「밝게 한마디」, 먼저 웃으며 인사하거나 칭찬 하나를 건네 보세요.',
    quote: '「조금만 비춰도 돼, 촛불 하나로도 방이 환해지잖아.」 하고 지신이 속삭여요.' },
  { hook: ['오늘 지신이 따끈한 군고구마를 품에 안고 왔어요.', '오늘 지신이 흙 묻은 손으로 작은 도자기 그릇을 내밀어요.'],
    body: '카드를 쥐는 순간 발바닥이 땅에 단단히 붙는 것처럼 마음이 차분해질 거예요.',
    spell: '오늘의 주문은 「제때 먹고 제때 자기」, 밥 한 끼를 천천히 꼭꼭 씹어 보세요.',
    quote: '「급할 거 없어, 단단한 땅 위에서는 천천히 걸어도 멀리 가.」 하고 지신이 속삭여요.' },
  { hook: ['오늘 지신이 반짝이는 은방울을 목에 걸고 딸랑딸랑 나타났어요.', '오늘 지신이 잘 닦인 작은 거울을 들고 빙그레 웃고 있어요.'],
    body: '카드를 보는 순간 머릿속이 맑게 개면서, 미뤄 둔 정리 하나가 떠오를 거예요.',
    spell: '오늘의 주문은 「하나 버리고 하나 끝내기」, 서랍 한 칸이나 사진 열 장만 정리해 보세요.',
    quote: '「덜어 내면 빛나, 보석도 깎아야 반짝이거든.」 하고 지신이 속삭여요.' },
  { hook: ['오늘 지신이 맑은 물방울 하나를 손바닥에 올려 왔어요.', '오늘 지신이 조개껍데기를 귀에 대고 파도 소리를 들려주려 해요.'],
    body: '카드를 뒤집는 순간 어깨에 들어간 힘이 스르르 풀리고, 숨이 길어질 거예요.',
    spell: '오늘의 주문은 「물 한 잔과 쉼표 하나」, 물을 자주 마시고 10분만 아무것도 하지 않아 보세요.',
    quote: '「흘러가도 괜찮아, 물은 막히면 돌아서 가니까.」 하고 지신이 속삭여요.' },
];
const RARITY_LINE = {
  rare: '게다가 희귀 카드라, 오늘은 운이 한 뼘 더 가까이 와 있어요.',
  epic: '게다가 영웅 카드라니, 이런 날은 한 달에 몇 번 오지 않아요!',
  legend: '게다가 전설 카드라, 작게 시작한 일도 오늘은 크게 번질 수 있어요!',
  myth: '게다가 백 번에 한 번 나올까 말까 한 신화 카드예요!',
};

/**
 * 오늘의 기운 카드 한 편
 * @param card drawKiCard 결과({zodiac, element, rarity, lack}) · saju · name
 * @returns 4~6문장 한 문단
 */
export function kiStory(card, saju, name = '') {
  const E = KI_EL[card.element]; const el = `${EL_NAME[card.element]} 기운`;
  const who = name ? `${name} 님` : '당신';
  const hook = E.hook[(card.zodiac + card.element) % 2].replace('지신이', `${ANIMALS[card.zodiac]} 지신이`);
  const why = card.lack
    ? `${who}의 사주에 ${josa(el, '이/가')} ${card.element === saju.yongsin ? '가장 필요해서' : '모자라서'} 이 카드가 찾아온 거예요.`
    : `오늘은 반가운 손님처럼 ${josa(el, '이/가')} 찾아와, 뜻밖의 일이 하나쯤 생기기 쉬워요.`;
  return [hook, RARITY_LINE[card.rarity], E.body, why, E.spell, E.quote].filter(Boolean).join(' ');
}

// 타로: 카드 성격별 몸의 반응 · 주제별 마지막 질문
const TONE_BODY = {
  act: '보는 순간 가슴이 두근거리고, 발끝이 먼저 앞으로 나가고 싶어질 거예요.',
  build: '보는 순간 손에 꼭 쥔 돌멩이처럼, 마음이 단단하게 모이는 게 느껴질 거예요.',
  feel: '보는 순간 마음 한쪽이 말랑해지면서, 누군가의 얼굴이 떠오를 수도 있어요.',
  turn: '보는 순간 창문을 활짝 연 것처럼, 가슴속 공기가 바뀌는 느낌이 들 거예요.',
};
const REV_BODY = '그런데 카드가 누워 있어요. 지금은 숨을 한 번 고르라는 신호처럼, 어깨가 살짝 무겁게 느껴질 수 있어요.';
const TOPIC_Q = {
  love: '오늘 밤, 그 사람에게 보내고 싶은 한 줄은 무엇인가요?',
  job: '내일 아침, 가장 먼저 손댈 일 하나는 무엇인가요?',
  money: '이번 주 꼭 지키고 싶은 돈 약속 하나는 무엇인가요?',
  health: '오늘 내 몸이 가장 고마워할 한 가지는 무엇일까요?',
  day: '오늘 하루가 끝날 때, 어떤 장면을 기억하고 싶나요?',
};
const firstSentence = (t) => (String(t).match(/^.*?[.!?](?=\s|$)/) || [String(t)])[0];

/**
 * 타로 결과 한 편(결과 화면 맨 위): 그림 속 첫 장면 → 몸의 반응 → 이 카드가 하는 말 → (세 장이면 흐름 한 줄) → 마지막 질문
 * @param r readTarot 결과
 */
export function tarotTale(r) {
  const key = r.cards.length === 1 ? r.cards[0] : r.cards[2]; const c = key.card;
  const parts = [`카드를 뒤집자 이런 장면이 펼쳐졌어요. ${firstSentence(c.scene)}`];
  parts.push(key.reversed ? REV_BODY : TONE_BODY[c.tone] || TONE_BODY.act);
  parts.push(`「${r.topic.label}」 질문에 이 카드가 건네는 말은 딱 하나예요. 「${c.core}」.`);
  if (r.cards.length === 3) parts.push(`지난 흐름의 「${r.cards[0].card.name}」 카드와 지금의 「${r.cards[1].card.name}」 카드가 손을 잡고, 앞으로의 「${c.name}」 카드로 이어지는 이야기는 아래에 펼쳐 두었어요.`);
  parts.push(TOPIC_Q[r.topic.key] || TOPIC_Q.day);
  return parts.join(' ');
}
