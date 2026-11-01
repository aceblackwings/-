// 띠끼리 만났을 때의 전용 대사 (12 × 12 = 144 조합)
// 1층: 대표 조합 전용 대화 (민담·상징이 있는 20쌍, 양쪽 대사)
// 2층: 관계(같은 띠·삼합·육합·충·원진·평이) × 말하는 띠의 말투 (12 × 6)
// 조사는 받침에 맞춰 자동으로 붙인다: {o:이} → 이/가, {o:은} → 은/는, {o:과} → 과/와, {o:이랑} → 이랑/랑
import { ANIMALS } from './saju.js';
import { branchRelation } from './compat.js';

const REL_LINES = {
  0: { same: '{o}도 쥐띠? 정보 공유 동맹 맺자찍!', samhap: '{o:과} 나는 삼합! 같이 움직이면 이득이 세 배찍!', yukhap: '{o}! 우리 궁합 계산해 봤는데 딱 맞아찍!', chung: '{o:이랑}은 계산이 안 맞아… 그래도 배울 점은 있찍.', wonjin: '{o:이랑} 서운한 일 있었나? 치즈 하나 줘야겠찍.', normal: '{o}! 반가워찍. 서로 손해 볼 일은 없겠다!' },
  1: { same: '{o}도 소띠군. 같이 밭 갈자. 음머.', samhap: '{o:과} 함께면 수확이 세 배다. 음머.', yukhap: '{o:은} 믿을 만하다. 오래 가자. 음머.', chung: '{o:은} 나와 정반대군… 천천히 맞춰 가자. 음머.', wonjin: '{o:과} 가끔 삐걱대도 말로 풀면 된다. 음머.', normal: '{o}. 반갑다. 음머.' },
  2: { same: '{o}도 호랑이? 산에 대장은 하나다… 공동 대장 하자! 어흥!', samhap: '{o}! 이 몸의 오른팔이 될 자격이 있다! 어흥!', yukhap: '{o:이랑}은 왠지 마음이 편하군. 어흥.', chung: '{o}! 한판 붙어 볼 테냐? …농담이다, 어흥.', wonjin: '흥, {o} 녀석… 그래도 내 사람이면 지킨다. 어흥.', normal: '{o} 녀석, 이 몸 구역에 온 걸 환영한다! 어흥!' },
  3: { same: '{o}도 토끼야? 우리 귀 길이 재 보자 깡총!', samhap: '{o:이랑} 나 완전 찰떡이야! 깡총깡총!', yukhap: '{o}! 너랑 있으면 수다가 안 끝나 깡총!', chung: '{o:이} 조금 무서워… 그래도 먼저 인사해 볼게 깡총.', wonjin: '{o:이랑} 오해 있었으면 풀고 싶어 깡총ㅠ', normal: '{o} 안녕! 토토랑 친구 할래? 깡총!' },
  4: { same: '또 다른 용이여… 하늘은 넓다. 함께 날자. 크르릉.', samhap: '{o:과} 본 용이 만나면 전설이 시작된다. 크르릉!', yukhap: '{o}, 너의 기운이 본 용을 편하게 하는구나. 크르릉.', chung: '{o}여, 본 용의 길을 막지 마라… 아니, 같이 가도 좋다. 크르릉.', wonjin: '{o:과}의 하늘엔 구름이 조금 짙구나. 곧 개일 것이다. 크르릉.', normal: '{o}여, 본 용의 세계에 온 것을 환영한다. 크르릉.' },
  5: { same: '{o}도 뱀이구나… 말 안 해도 알지? 스으.', samhap: '{o:과} 나, 운명의 실로 단단히 묶였어. 스으.', yukhap: '{o:이랑} 있으면 이상하게 편해. 스으.', chung: '{o:은} 너무 시끄러워… 그래도 흥미로워. 스으.', wonjin: '{o}의 속마음, 아직 다 안 보여. 스으.', normal: '{o}… 너에 대해 좀 알아봐도 될까? 스으.' },
  6: { same: '{o}도 말띠! 경주하자! 히힝!', samhap: '{o}! 우리 같이 달리면 세상 끝까지 간다 히힝!', yukhap: '{o:이랑} 발맞추는 거 좋아! 히힝!', chung: '{o:은} 너무 느려~ 아니면 내가 너무 빠른가? 히힝!', wonjin: '{o:이랑} 부딪혔던 거 미안! 다시 달리자 히힝!', normal: '{o} 안녕! 같이 산책 갈래? 히힝!' },
  7: { same: '{o}도 양이구나~ 털 포개고 낮잠 자자~ 메에~', samhap: '{o:이랑} 있으면 세상이 포근해~ 메에~', yukhap: '{o}~ 너랑 있으면 마음이 편해~ 메에~', chung: '{o:이} 조금 날카로워도~ 몽실이가 감싸 줄게~ 메에~', wonjin: '{o:이랑} 서운한 거 있으면~ 차 한잔 하자~ 메에~', normal: '{o} 어서 와~ 몽실몽실 반가워~ 메에~' },
  8: { same: '{o}도 원숭이? 재주 대결 하자! 끼끼!', samhap: '{o:이랑} 나랑 뭉치면 못 할 게 없지! 끼끼!', yukhap: '{o}! 너는 내 장난을 다 받아 줘서 좋아 끼끼!', chung: '{o:은} 장난을 안 받아 줘… 그래서 더 하고 싶어 끼끼!', wonjin: '{o}, 바나나 하나 줄 테니 화 풀어 끼끼!', normal: '{o} 안녕! 재주 하나 보여 줄까? 끼끼!' },
  9: { same: '{o}님도 닭띠시군요! 새벽 합창 하시죠! 꼬끼오!', samhap: '{o}님과는 업무 효율 최상입니다! 꼬끼오!', yukhap: '{o}님, 약속 시간 정확하셔서 좋습니다! 꼬끼오!', chung: '{o}님과는 일정 조율이 필요합니다. 꼬끼오.', wonjin: '{o}님께 서운한 점, 정리해서 말씀드리겠습니다. 꼬끼오.', normal: '{o}님, 반갑습니다! 일정 공유하시죠! 꼬끼오!' },
  10: { same: '{o}도 개띠! 킁킁, 같은 냄새 난다 멍!', samhap: '{o}! 너는 내 베프야! 평생 지켜 줄게 멍!', yukhap: '{o:이랑} 산책하면 제일 신나 멍!', chung: '{o}… 킁킁… 아직 경계 중이야 멍.', wonjin: '{o:이랑} 다퉜던 거 미안해! 꼬리 흔들게 멍!', normal: '{o}! 반가워! 꼬리가 저절로 흔들려 멍!' },
  11: { same: '{o}도 돼지띠~ 같이 먹방 하자~ 꿀꿀~', samhap: '{o:이랑} 있으면 복이 세 배~ 꿀꿀~!', yukhap: '{o}~ 맛있는 거 나눠 먹을래? 꿀꿀~', chung: '{o:이} 까칠해도 괜찮아~ 간식 주면 풀릴 거야~ 꿀꿀~', wonjin: '{o:이랑} 서운했던 거~ 밥 한번 먹고 풀자~ 꿀꿀~', normal: '{o} 어서 와~ 복 나눠 줄게~ 꿀꿀~' },
};

// 대표 조합: [작은 번호 띠의 대사, 큰 번호 띠의 대사]
const SPECIAL = {
  '0-1': ['소 등에 타고 경주 1등 한 거… 아직도 고마워찍!', '…그때 내 등에 탄 거 다 알고 있었다. 괜찮다. 음머.'],
  '0-4': ['용님 여의주 위치 정보, 제가 다 알아요찍!', '꾀 많은 쥐여, 너의 정보는 늘 쓸모 있구나. 크르릉.'],
  '0-6': ['말 너무 빨라찍! 발에 밟힐 뻔했어!', '어? 발밑에 뭐 있었어? 미안 미안, 히힝!'],
  '1-7': ['양아, 풀은 나눠 먹자. 음머.', '소 아저씨 덩치에 깜짝 놀랐어~ 메에~'],
  '1-9': ['닭아, 네 덕에 늘 제때 일어난다. 음머.', '소님은 근태 만점입니다! 꼬끼오!'],
  '2-3': ['토, 토끼 녀석… 귀엽긴 하군. 어흥.', '호랑이 오빠 무서운 척하는 거 다 알아 깡총!'],
  '2-6': ['말아, 이 몸과 함께 산을 달리자! 어흥!', '대장 따라 전력 질주! 히힝!'],
  '2-8': ['원숭이 녀석, 이 몸 꼬리 잡아당긴 거 너지! 어흥!', '끼끼! 증거 있어? 증거?'],
  '2-11': ['돼지 녀석, 맛있는 냄새 풍기며 어딜 가나? 어흥!', '호랑이 형~ 같이 고기 먹자~ 꿀꿀~'],
  '3-7': ['양 언니 털 너무 포근해~ 깡총!', '토토는 언제 봐도 사랑스러워~ 메에~'],
  '3-9': ['닭아 너무 일찍 깨우지 마ㅠ 깡총…', '토끼님, 아침형 인간이 성공합니다! 꼬끼오!'],
  '4-5': ['작은 용이여, 아니 뱀이여. 언젠가 너도 승천하리라. 크르릉.', '스으… 비늘 자랑은 그만. 나도 곧 날 거야.'],
  '4-10': ['개여, 하늘을 보고 짖지 마라. 크르릉.', '구름 위에 뭐가 반짝여서 그랬어 멍!'],
  '5-8': ['원숭이야… 내 꼬리로 줄넘기할 생각은 하지 마. 스으.', '뱀아 놀자! 줄넘기 해 줄래? 끼끼!'],
  '5-11': ['돼지야… 간식 좀 나눠 줄래? 스으.', '꿀꿀~ 벌써 다 먹었는데~ 헤헤~'],
  '6-7': ['양아 같이 초원 가자! 히힝!', '천천히 가 줘~ 털 날린단 말이야~ 메에~'],
  '8-9': ['닭아 새벽엔 좀 조용히 해 줘~ 끼끼!', '원숭이님 지각 3회째입니다! 기상 시간은 6시! 꼬끼오.'],
  '9-10': ['개님! 오늘은 제발 쫓아오지 마십시오! 꼬끼오!', '닭아 잠깐만! 왜 자꾸 지붕 위로 도망가 멍!'],
  '10-11': ['돼지야 그 간식 냄새 뭐야? 킁킁 멍!', '꿀꿀~ 반 나눠 줄게~ 복도 같이 나눠~'],
  '3-11': ['돼지야 우리 삼합이래! 같이 놀자 깡총!', '토토랑 놀면 복이 굴러들어 와~ 꿀꿀~'],
};

// 속담 전설: 띠 동물이 나오는 속담을 캐릭터 말투로 비튼 대화 [작은 번호 띠, 큰 번호 띠]
const PROVERBS = {
  '6-10': { proverb: '개 발에 편자', meaning: '격에 맞지 않아 어울리지 않음', lines: ['개야, 내 편자 한번 신어 볼래? 히힝!', '개 발에 편자라더니… 미끄러워서 못 걷겠어 멍!'] },
  '7-8': { proverb: '원숭이도 나무에서 떨어진다', meaning: '아무리 잘하는 사람도 실수할 때가 있다', lines: ['원숭이야 괜찮아~? 원숭이도 나무에서 떨어진대~ 메에~', '끼… 방금 그거 연습한 거야! 진짜야 끼끼!'] },
  '0-8': { proverb: '쥐뿔도 모른다', meaning: '아무것도 모르면서 아는 체함', lines: ['원숭이! 쥐뿔도 모른다는 말은 나한테 하면 섭하다찍! 정보는 내가 1등!', '끼끼! 그럼 쥐뿔이 뭔지 먼저 알려 줘 봐!'] },
  '1-3': { proverb: '소 귀에 경 읽기', meaning: '아무리 말해도 알아듣지 못함', lines: ['…토끼야, 조금만 천천히 말해라. 음머.', '소 귀에 경 읽기야ㅠ 벌써 세 번째 설명했는데 깡총!'] },
  '4-11': { proverb: '돼지 목에 진주 목걸이', meaning: '값어치를 모르는 이에게 귀한 것은 소용없음', lines: ['여의주를 맡기라고? 돼지 목에 진주 목걸이 아니냐. 크르릉.', '꿀꿀~ 진주보다 만두가 좋아~ 안 맡아도 돼~'] },
  '1-2': { proverb: '호랑이에게 물려 가도 정신만 차리면 산다', meaning: '위급해도 침착하면 살길이 있음', lines: ['호랑이에게 물려 가도 정신만 차리면 산다더라. 그러니 너무 겁주지 마라. 음머.', '이 몸은 안 문다! …정신은 번쩍 차리게 해 주지, 어흥!'] },
  '3-10': { proverb: '토끼 둘을 잡으려다 하나도 못 잡는다', meaning: '욕심내어 여러 가지를 하다 모두 놓침', lines: ['개야, 나랑 내 쌍둥이 둘 다 쫓지 마~ 깡총!', '토끼 둘 잡으려다 하나도 못 잡는다더니… 헥헥, 둘 다 놓쳤어 멍!'] },
  '9-11': { proverb: '꿩 대신 닭', meaning: '원하는 것 대신 비슷한 것으로 채움', lines: ['꿩 대신 닭이라뇨! 저도 충분히 훌륭합니다, 꼬끼오!', '꿀꿀~ 나는 꿩보다 닭이 더 좋아~ 같이 놀자~'] },
  '2-7': { proverb: '양의 탈을 쓴 늑대', meaning: '겉으론 순해 보이지만 속은 다름', lines: ['양털 좀 빌렸다! 양의 탈을 쓴… 호랑이다, 어흥!', '털 돌려줘~ 그래도 은근 잘 어울려~ 메에~'] },
  '6-9': { proverb: '말 한마디로 천 냥 빚을 갚는다', meaning: '말을 잘하면 어려운 일도 풀림', lines: ['말 한마디로 천 냥 빚 갚는다며? 내가 바로 그 말인데! 히힝!', '말님, 그건 말(言)입니다! 그래도 오늘의 칭찬 한마디는 접수합니다, 꼬끼오!'] },
};

const hasBatchim = (word) => {
  const ch = word.charCodeAt(word.length - 1);
  if (ch < 0xac00 || ch > 0xd7a3) return false;
  return (ch - 0xac00) % 28 !== 0;
};
const JOSA = { 이: ['이', '가'], 은: ['은', '는'], 을: ['을', '를'], 과: ['과', '와'], 아: ['아', '야'], 이랑: ['이랑', '랑'] };

export function withJosa(word, josa) {
  const pair = JOSA[josa];
  if (!pair) return word + josa;
  return word + (hasBatchim(word) ? pair[0] : pair[1]);
}

function fillOther(template, otherName) {
  return template.replace(/\{o(?::([^}]+))?\}/g, (_, j) => (j ? withJosa(otherName, j) : otherName));
}

function stageVoice(text, stage) {
  if (stage === 1) return `뀨! ${text}`;
  if (stage >= 5) return `${text} ✦`;
  return text;
}

/** speaker 띠가 listener 띠에게 하는 말 */
export function pairLine(speaker, listener, opts = {}) {
  const rel = branchRelation(speaker, listener);
  const key = speaker < listener ? `${speaker}-${listener}` : `${listener}-${speaker}`;
  let text;
  let special = false;
  let kind = 'relation';
  let proverb = null;
  if (speaker !== listener && SPECIAL[key]) {
    text = SPECIAL[key][speaker < listener ? 0 : 1];
    special = true; kind = 'legend';
  } else if (speaker !== listener && PROVERBS[key]) {
    text = PROVERBS[key].lines[speaker < listener ? 0 : 1];
    special = true; kind = 'proverb';
    proverb = { text: PROVERBS[key].proverb, meaning: PROVERBS[key].meaning };
  } else {
    text = fillOther(REL_LINES[speaker][rel.type], opts.otherName || ANIMALS[listener]);
  }
  return { text: stageVoice(text, opts.stage || 2), relation: rel, special, kind, proverb };
}

/**
 * 두 띠의 대화 한 쌍
 * @returns [{speaker, text}, {speaker, text}], relation, special
 */
export function pairDialogue(a, b, opts = {}) {
  const first = pairLine(a, b, { stage: opts.stageA, otherName: opts.nameB });
  const second = pairLine(b, a, { stage: opts.stageB, otherName: opts.nameA });
  return { lines: [{ speaker: a, text: first.text }, { speaker: b, text: second.text }], relation: first.relation, special: first.special, kind: first.kind, proverb: first.proverb };
}

export const SPECIAL_COUNT = Object.keys(SPECIAL).length + Object.keys(PROVERBS).length;
export const PROVERB_COUNT = Object.keys(PROVERBS).length;
export const LEGEND_STORY_COUNT = Object.keys(SPECIAL).length;

/** 내 띠와 전설의 조합을 이루는 띠 목록 */
export function legendPartners(z) {
  return [...Object.keys(SPECIAL), ...Object.keys(PROVERBS)].map((k) => k.split('-').map(Number)).filter(([a, b]) => a === z || b === z).map(([a, b]) => (a === z ? b : a));
}
