// 재미있게 읽는 기운 카드·타로(v0.50.3, 2026-11-05 사용자 요청 「기운카드와 타로 내용도 재미있게」)
// 오늘의 한 편과 같은 문법: 첫 장면(훅) → 몸의 반응 → 까닭 → 오늘의 주문 → 한마디/질문, 4~6문장
// 같은 카드·같은 날이면 늘 같은 글(무작위 없음). 순수 로직만(테스트: tests/storybook.test.mjs)
import { josa } from './josa.js';
import { ANIMALS } from './saju.js';
import { EL_NAME } from './storybook.js';

// 오행별 문장: [지신이 나타나는 장면 2가지(이야기), 이 기운의 뜻, 오늘 할 일, 오늘 피할 일]
// v0.51(테스터 의견 「비유가 많아 무엇을 할지 헷갈린다」) → v0.51.1 혼합: 장면은 이야기로 한 문장, 바로 뒤에 뜻·할 일·피할 일을 그대로
const KI_QUOTE = [
  '「작게 심어도 돼, 나무는 원래 작게 시작하거든.」',
  '「조금만 비춰도 돼, 촛불 하나로도 방이 환해지잖아.」',
  '「급할 거 없어, 단단한 땅 위에서는 천천히 걸어도 멀리 가.」',
  '「덜어 내면 빛나, 보석도 깎아야 반짝이거든.」',
  '「흘러가도 괜찮아, 물은 막히면 돌아서 가니까.」',
];
/** 지신의 한마디(캐릭터 말투, 비유 허용 — 카드 아래 말풍선으로 따로) */
export const kiQuote = (card) => KI_QUOTE[card.element];
const KI_EL = [
  { hook: ['오늘 지신이 등에 연둣빛 새싹 하나를 꽂고 달려왔어요.', '오늘 지신이 작은 씨앗 주머니를 흔들며 문 앞에 서 있어요.'],
    body: '나무 기운 카드로, 새로 시작하고 배우고 키우는 힘을 뜻해요.',
    spell: '오늘 할 일: 미뤄 둔 일 하나를 10분만 시작하거나, 새 강의 한 편을 들어 보세요.',
    quote: '피할 일: 한꺼번에 여러 일을 벌이고 끝내지 못하는 것이에요.' },
  { hook: ['오늘 지신이 두 손에 작은 등불을 들고 나타났어요.', '오늘 지신이 볼이 발그레한 채로 햇살 한 줌을 쥐고 왔어요.'],
    body: '불 기운 카드로, 표현하고 사람을 만나고 앞에 나서는 힘을 뜻해요.',
    spell: '오늘 할 일: 먼저 웃으며 인사하거나, 칭찬 한마디를 직접 건네 보세요.',
    quote: '피할 일: 들뜬 기분에 말을 세게 하거나 급하게 결정하는 것이에요.' },
  { hook: ['오늘 지신이 따끈한 군고구마를 품에 안고 왔어요.', '오늘 지신이 흙 묻은 손으로 작은 도자기 그릇을 내밀어요.'],
    body: '흙 기운 카드로, 생활을 규칙적으로 지키고 중심을 잡는 힘을 뜻해요.',
    spell: '오늘 할 일: 세 끼를 제때 먹고, 평소 자는 시간에 잠자리에 드세요.',
    quote: '피할 일: 걱정만 하면서 해야 할 결정을 계속 미루는 것이에요.' },
  { hook: ['오늘 지신이 반짝이는 은방울을 목에 걸고 딸랑딸랑 나타났어요.', '오늘 지신이 잘 닦인 작은 거울을 들고 빙그레 웃고 있어요.'],
    body: '쇠 기운 카드로, 정리하고 결정하고 끊을 것을 끊는 힘을 뜻해요.',
    spell: '오늘 할 일: 서랍 한 칸이나 휴대폰 사진 열 장을 정리하고, 미뤄 둔 결정 하나를 내리세요.',
    quote: '피할 일: 남에게 말을 날카롭게 하거나 스스로를 지나치게 다그치는 것이에요.' },
  { hook: ['오늘 지신이 맑은 물방울 하나를 손바닥에 올려 왔어요.', '오늘 지신이 조개껍데기를 귀에 대고 파도 소리를 들려주려 해요.'],
    body: '물 기운 카드로, 쉬고 생각을 정리하고 상황에 맞게 바꾸는 힘을 뜻해요.',
    spell: '오늘 할 일: 물을 자주 마시고, 10분 동안 휴대폰 없이 쉬어 보세요.',
    quote: '피할 일: 쉬지 않고 일정을 몰아 잡는 것이에요.' },
];
const RARITY_LINE = {
  rare: '희귀 카드라 지신 기운이 평소보다 많이 채워져요.',
  epic: '영웅 카드라 지신 기운이 많이 채워져요.',
  legend: '전설 카드라 지신 기운이 아주 많이 채워져요.',
  myth: '가장 드문 신화 카드라 지신 기운이 가장 많이 채워져요.',
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
    : `${josa(el, '은/는')} 오늘 ${who}에게 꼭 모자란 기운은 아니지만, 위의 할 일을 하면 하루가 편해져요.`;
  return [hook, RARITY_LINE[card.rarity], E.body, why, E.spell, E.quote].filter(Boolean).join(' ');
}

// 타로: 카드 성격별 뜻(비유 없이 무엇을 하라는 카드인지) · 주제별 마지막 질문
const TONE_BODY = {
  act: '이 카드는 지금 움직이라는 뜻이에요. 망설이던 일을 시작하기 좋은 때예요.',
  build: '이 카드는 지금 하던 일을 꾸준히 다지라는 뜻이에요. 새 일보다 마무리가 먼저예요.',
  feel: '이 카드는 지금 마음과 관계를 먼저 챙기라는 뜻이에요. 결정보다 대화가 먼저예요.',
  turn: '이 카드는 지금 상황이 바뀌고 있다는 뜻이에요. 예전 방식을 고집하지 않는 것이 좋아요.',
};
const REV_BODY = '그런데 카드가 거꾸로 나왔어요. 지금 바로 움직이기보다 며칠 기다리며 준비하라는 뜻이에요.';
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
  const parts = [`카드 그림: ${firstSentence(c.scene)}`];
  parts.push(key.reversed ? REV_BODY : TONE_BODY[c.tone] || TONE_BODY.act);
  parts.push(`「${r.topic.label}」 질문에 대한 이 카드의 답은 「${c.core}」, 이 한마디예요.`);
  if (r.cards.length === 3) parts.push(`지난 흐름은 「${r.cards[0].card.name}」, 지금은 「${r.cards[1].card.name}」, 앞으로는 「${c.name}」 카드예요. 세 장을 이어 읽은 풀이는 아래에 있어요.`);
  parts.push(TOPIC_Q[r.topic.key] || TOPIC_Q.day);
  return parts.join(' ');
}
