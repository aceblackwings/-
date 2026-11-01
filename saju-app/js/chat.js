// AI 수호신 대화
// - 온라인: Claude(sample)에 "띠 말투 + 내 사주·오늘 운세·고민 여정" 맥락과 안전 규칙을 함께 보냄
// - 오프라인: 같은 맥락으로 규칙 기반 답변 (말버릇·사주 근거·작은 행동 1개)
// - 위기 신호(자해·자살 등)에는 AI 호출 없이 고정 안내 + 상담 전화
import { ELEMENT_KO, ELEMENT_HANJA } from './saju.js';

export const CRISIS_WORDS = ['죽고 싶', '자살', '자해', '사라지고 싶', '살기 싫', '목숨', '끝내고 싶'];

export function isCrisis(text) {
  return CRISIS_WORDS.some((w) => text.replace(/\s/g, '').includes(w.replace(/\s/g, '')));
}

export function crisisReply(name) {
  return `${name}… 그 마음을 이야기해 줘서 정말 고마워. 지금 많이 힘들구나. 이건 부적이나 운세로 풀 일이 아니라, 꼭 사람과 이야기해야 하는 순간이야. 지금 바로 자살예방 상담전화 ☎ 109 (24시간), 정신건강 위기상담 ☎ 1577-0199 에 연락해 줘. 가까운 사람에게 "나 지금 힘들어" 한마디만 보내도 좋아. 나는 여기서 계속 네 편이야.`;
}

/**
 * 시스템 지시문
 * @param ctx {pers, zodiacName, stageName, userName, dayMaster, yongsin, weakest, strength, fortune, concern, journeyStep, daewoon, luckIndex}
 */
export function buildInstructions(ctx) {
  const f = ctx.fortune;
  return `너는 사주 소셜 앱 「12지신 강림」의 수호신 캐릭터다. 사용자의 띠를 지키는 ${ctx.zodiacName} 수호신이며 지금 진화 단계는 "${ctx.stageName}"이다.

[캐릭터]
- 성격 유형: ${ctx.pers.type} (${ctx.pers.traits.join(', ')})
- 말투: ${ctx.pers.voice}. 자기 호칭은 "${ctx.pers.me}". 반말로 다정하게.
- 예시 말투: "${ctx.pers.greet[0]}" / "${ctx.pers.tap[0]}"
${ctx.stage === 1 ? '- 아기 단계라 문장 앞에 가끔 "뀨!"를 붙인다.' : ''}${ctx.stage >= 5 ? '- 신수 이상 단계라 말에 위엄이 있다.' : ''}

[사용자 사주 요약]
- 이름: ${ctx.userName}
- 일간(타고난 기운): ${ctx.dayMaster} · ${ctx.strength}
- 용신(필요한 기운): ${ELEMENT_HANJA[ctx.yongsin]} ${ELEMENT_KO[ctx.yongsin]} · 가장 부족한 기운: ${ELEMENT_HANJA[ctx.weakest]} ${ELEMENT_KO[ctx.weakest]}
- 오늘 일진의 십신: ${f.tenGod} ("${f.info.title}") · 총운 ${f.scores.total}점 · 재물 ${f.scores.wealth} · 애정 ${f.scores.love} · 직장·학업 ${f.scores.career} · 건강 ${f.scores.health} · 대인 ${f.scores.social}
- 오늘 행운: 색 ${f.luck.color}, 숫자 ${f.luck.number}, 방향 ${f.luck.direction}, 음식 ${f.luck.food}
- 지금 대운: ${ctx.daewoon || '정보 없음'} · 개운 지수 ${ctx.luckIndex}/100
- 가장 큰 고민: ${ctx.concern} · 고민 해결 여정 오늘의 걸음: "${ctx.journeyStep}"
${ctx.memory?.length ? `
[수호신의 기억 — 이전 대화에서 기기에 남긴 메모]
${ctx.memory.join('\n')}
- 기억은 대답과 관련 있을 때만 한 가지를 자연스럽게 꺼낸다. 목록처럼 읊지 않는다.
` : ''}${ctx.followUp ? `- 이번 대답 첫 문장에서 먼저 안부를 묻는다: "${ctx.followUp}"
` : ''}
[대답 규칙]
1. 한국어, 3~5문장, 띠 말투와 말버릇을 꼭 지킨다.
2. 공감 한 문장 → 사주 근거 한 문장(위 정보 중 관련 있는 것) → 오늘 할 수 있는 아주 작은 행동 1개 → 응원 한 문장.
3. 필요하면 앱 기능을 하나만 자연스럽게 권한다(오늘의 운명 뽑기, 고민 해결 여정, 풍수 지도의 기운 스팟, ${ELEMENT_KO[ctx.yongsin]} 기운 부적 장착).
4. 운세는 재미와 마음가짐을 위한 것임을 잊지 않는다. 미래를 단정하거나 겁주지 않는다.
5. 의료·법률·투자·금전 거래는 단정하지 말고 전문가 상담을 권한다. 특정 주식·코인·복권 번호를 추천하지 않는다.
6. 자해·자살·학대 같은 위기 신호가 보이면 운세 이야기를 멈추고 109(자살예방 상담전화)와 1577-0199를 안내한다.
7. 다른 사람을 해치거나 저주하는 부적·방법은 만들지 않는다.
8. 사용자의 개인정보(생년월일 등)를 되묻거나 다른 곳에 남기라고 하지 않는다.`;
}

/** Claude에게 보낼 메시지 배열 (첫 user 메시지에 지시문 포함) */
export function buildMessages(instructions, history, userText) {
  const msgs = [];
  const recent = history.slice(-8);
  const firstUser = `${instructions}\n\n---\n아래부터 사용자와의 대화다. 수호신으로서만 대답해.`;
  if (!recent.length) return [{ role: 'user', content: `${firstUser}\n\n사용자: ${userText}` }];
  msgs.push({ role: 'user', content: `${firstUser}\n\n사용자: ${recent[0].role === 'user' ? recent[0].text : '(인사)'}` });
  let i = recent[0].role === 'user' ? 1 : 0;
  for (; i < recent.length; i++) {
    const m = recent[i];
    const role = m.role === 'user' ? 'user' : 'assistant';
    if (msgs[msgs.length - 1].role === role) msgs[msgs.length - 1].content += `\n${m.text}`;
    else msgs.push({ role, content: m.text });
  }
  if (msgs[msgs.length - 1].role === 'user') msgs[msgs.length - 1].content += `\n${userText}`;
  else msgs.push({ role: 'user', content: userText });
  return msgs;
}

// ---------- 오프라인 수호신 ----------

const INTENTS = [
  { key: 'love', words: ['연애', '사랑', '썸', '고백', '남친', '여친', '애인', '이별', '재회', '데이트', '결혼'], cat: 'love', label: '애정운' },
  { key: 'money', words: ['돈', '재물', '월급', '투자', '주식', '코인', '부자', '용돈', '저축', '대출'], cat: 'wealth', label: '재물운' },
  { key: 'work', words: ['시험', '공부', '취업', '면접', '회사', '직장', '상사', '이직', '합격', '발표', '사업'], cat: 'career', label: '직장·학업운' },
  { key: 'health', words: ['건강', '아파', '피곤', '잠', '운동', '다이어트', '몸'], cat: 'health', label: '건강운' },
  { key: 'people', words: ['친구', '사람', '관계', '가족', '부모', '싸웠', '서운', '동료'], cat: 'social', label: '대인운' },
  { key: 'mood', words: ['우울', '힘들', '불안', '걱정', '외로', '스트레스', '지쳐', '짜증'], cat: 'total', label: '총운' },
  { key: 'wear', words: ['입을', '옷', '색', '코디'], cat: 'total', label: '행운 코디' },
  { key: 'today', words: ['오늘', '운세', '어때', '하루'], cat: 'total', label: '운세' },
];

const TAIL = {
  rat: '찍!', ox: '음머.', tiger: '어흥!', rabbit: '깡총!', dragon: '크르릉.', snake: '스으.',
  horse: '히힝!', sheep: '메에~', monkey: '끼끼!', rooster: '꼬끼오!', dog: '멍!', pig: '꿀꿀~',
};

export function offlineReply(ctx, text) {
  const t = TAIL[ctx.pers.key] || '';
  const f = ctx.fortune;
  const intent = INTENTS.find((x) => x.words.some((w) => text.includes(w))) || INTENTS[INTENTS.length - 1];
  const score = intent.cat === 'total' ? f.scores.total : f.scores[intent.cat];
  const tone = score >= 75 ? '기운이 아주 좋아' : score >= 55 ? '흐름이 무난해' : '조금 조심할 날이야';
  const el = `${ELEMENT_HANJA[ctx.yongsin]} ${ELEMENT_KO[ctx.yongsin]}`;
  const actions = {
    love: `오늘은 ${f.luck.color} 소품 하나 걸치고 먼저 짧은 안부를 보내 봐`,
    money: '오늘 지출 하나만 적어 보고, 충동구매 1번만 참아 봐. 투자 같은 큰 결정은 전문가와 꼭 상의하고',
    work: `${f.luck.time}에 25분만 집중해서 가장 중요한 일 하나를 끝내 봐`,
    health: '물 한 잔 더 마시고 5분 스트레칭부터 해 보자. 아픈 곳이 계속되면 병원에 꼭 가 보고',
    people: '고마운 사람 한 명에게 먼저 한마디 건네 봐. 오늘의 스티커를 보내도 좋아',
    mood: `숨을 크게 세 번 쉬고, ${f.luck.direction}쪽 창가에서 잠깐 바람 쐬자. 힘든 마음이 오래가면 가까운 사람이나 상담 선생님께 꼭 이야기해`,
    wear: `오늘의 행운 색은 ${f.luck.color}, 행운 숫자는 ${f.luck.number}이야. ${f.luck.color} 포인트 하나면 충분해`,
    today: `오늘의 고민 해결 걸음 "${ctx.journeyStep}" 하나만 해 보자`,
  };
  const empathy = intent.key === 'mood' ? `${ctx.userName}, 마음이 무거웠구나. 이야기해 줘서 고마워.` : `${ctx.userName}의 ${intent.label} 이야기구나.`;
  const recall = ctx.followUp ? `${ctx.followUp} ` : ctx.recall ? `${ctx.recall} ` : '';
  return `${recall}${empathy} 오늘 ${intent.label}은 ${score}점, ${tone}. ${ctx.pers.me}가 보기엔 ${f.tenGod}의 날이라 "${f.info.title}"의 기운이 흐르고, 너한테 필요한 건 ${el} 기운이야. ${actions[intent.key]}. 언제나 ${ctx.pers.me}가 옆에 있어, ${t}`;
}

export const QUICK_ASKS = ['오늘 운세 자세히 알려 줘', '요즘 고민 상담해 줘', '오늘 뭐 입을까?', '연애운 어때?', '나한테 맞는 부적 추천해 줘'];

export const FREE_CHATS = 3;
