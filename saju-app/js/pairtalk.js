// 띠끼리 만났을 때의 전용 대사 (12 × 12 = 144 조합)
// 1층: 대표 조합 전용 대화 (민담·상징이 있는 20쌍, 양쪽 대사)
// 2층: 관계(같은 띠·삼합·육합·충·원진·평이) × 말하는 띠의 말투 (12 × 6)
// 조사는 받침에 맞춰 자동으로 붙인다: {o:이} → 이/가, {o:은} → 은/는, {o:과} → 과/와, {o:이랑} → 이랑/랑
import { ANIMALS } from './saju.js';
import { branchRelation } from './compat.js';

const REL_LINES = {
  0: { same: '{o}도 쥐띠구나! 우리 정보 나누면서 같이 가자.', samhap: '{o:이랑} 나는 삼합이야. 함께 움직이면 기회가 세 배!', yukhap: '{o}, 우리 생각보다 잘 맞아. 내가 계산해 봤어.', chung: '{o:과} 나는 방식이 달라. 그래서 배울 점이 많아.', wonjin: '{o:이랑} 서운한 거 있었으면 먼저 말해 줘.', normal: '{o}, 반가워! 서로 도우면 좋겠다.' },
  1: { same: '{o}도 소띠구나. 천천히 같이 가자.', samhap: '{o:과} 함께면 수확이 세 배야.', yukhap: '{o:은} 믿음직해. 오래 가자.', chung: '{o:은} 나랑 정반대네. 천천히 맞춰 가 보자.', wonjin: '{o:과} 가끔 삐걱대도 말로 풀면 돼.', normal: '{o}, 반가워. 잘 지내 보자.' },
  2: { same: '{o}도 호랑이네! 우리 같이 대장 하자.', samhap: '{o}, 너라면 내 오른팔로 딱이야!', yukhap: '{o:이랑} 있으면 이상하게 마음이 편해.', chung: '{o}, 우리 한판 붙어 볼까? 농담이야, 같은 편 하자.', wonjin: '{o}, 서운한 게 있었다면 미안해. 그래도 넌 내 사람이야.', normal: '{o}, 반가워! 내가 잘 챙겨 줄게.' },
  3: { same: '{o}도 토끼야? 우리 귀 길이 재 볼까?', samhap: '{o:이랑} 나는 완전 찰떡이야!', yukhap: '{o}, 너랑 얘기하면 시간 가는 줄 몰라.', chung: '{o:이} 조금 어렵지만, 먼저 인사해 볼게.', wonjin: '{o:이랑} 오해가 있었다면 풀고 싶어.', normal: '{o} 안녕! 우리 친구 할래?' },
  4: { same: '{o}도 용이구나. 하늘은 넓으니 함께 날자.', samhap: '{o:과} 내가 만나면 큰일이 시작될 거야.', yukhap: '{o}, 네 곁에선 마음이 편해져.', chung: '{o}, 우리 길이 조금 달라. 그래도 같이 갈 수 있어.', wonjin: '{o:과} 나 사이에 구름이 조금 꼈네. 곧 갤 거야.', normal: '{o}, 반가워. 같이 큰 그림 그려 보자.' },
  5: { same: '{o}도 뱀이구나. 말 안 해도 알 것 같아.', samhap: '{o:과} 나는 좋은 인연의 실로 이어져 있어.', yukhap: '{o:이랑} 있으면 이상하게 편해.', chung: '{o:은} 나와 많이 달라. 그래서 더 흥미로워.', wonjin: '{o}의 마음을 아직 다 모르겠어. 천천히 알아 갈게.', normal: '{o}, 반가워. 너에 대해 더 알고 싶어.' },
  6: { same: '{o}도 말띠! 같이 달려 볼까?', samhap: '{o}, 우리 같이 달리면 어디든 갈 수 있어!', yukhap: '{o:이랑} 발맞추는 게 즐거워!', chung: '{o:과} 나는 속도가 달라. 중간에서 만나자!', wonjin: '{o:이랑} 부딪혔던 거 미안해. 다시 같이 가자!', normal: '{o} 안녕! 같이 산책 갈래?' },
  7: { same: '{o}도 양이구나. 같이 포근하게 쉬자.', samhap: '{o:이랑} 있으면 세상이 따뜻해.', yukhap: '{o}, 너랑 있으면 마음이 편해.', chung: '{o:이} 조금 날카로워도 괜찮아. 내가 감싸 줄게.', wonjin: '{o:이랑} 서운한 게 있으면 차 한잔하며 풀자.', normal: '{o}, 어서 와. 반가워.' },
  8: { same: '{o}도 원숭이? 우리 재주 대결 해 볼까?', samhap: '{o:이랑} 나랑 뭉치면 못 할 게 없지!', yukhap: '{o}, 내 장난을 다 받아 줘서 고마워.', chung: '{o:은} 진지한 편이구나. 그래서 더 웃게 해 주고 싶어.', wonjin: '{o}, 바나나 하나 줄게. 화 풀어 줘.', normal: '{o} 안녕! 재주 하나 보여 줄까?' },
  9: { same: '{o}님도 닭띠시군요! 같이 하루를 열어 봐요.', samhap: '{o}님과는 손발이 척척 맞아요!', yukhap: '{o}님, 늘 약속을 잘 지켜 주셔서 좋아요.', chung: '{o}님과는 일정 조율이 조금 필요해요.', wonjin: '{o}님께 서운했던 점, 차분히 말씀드려 볼게요.', normal: '{o}님, 반가워요! 오늘 일정 같이 볼까요?' },
  10: { same: '{o}도 개띠구나! 같은 냄새가 나.', samhap: '{o}, 너는 내 베프야! 평생 지켜 줄게.', yukhap: '{o:이랑} 산책하면 제일 신나!', chung: '{o}, 아직은 조금 낯설어. 천천히 친해지자.', wonjin: '{o:이랑} 다퉜던 거 미안해. 다시 친하게 지내자!', normal: '{o}, 반가워! 꼬리가 저절로 흔들려.' },
  11: { same: '{o}도 돼지띠구나~ 같이 맛있는 거 먹자.', samhap: '{o:이랑} 있으면 복이 세 배야!', yukhap: '{o}, 맛있는 거 나눠 먹을래?', chung: '{o:이} 조금 까칠해도 괜찮아. 간식 먹으면 풀릴 거야.', wonjin: '{o:이랑} 서운했던 거, 밥 한번 먹고 풀자.', normal: '{o}, 어서 와~ 복 나눠 줄게.' },
};

// 대표 조합: [작은 번호 띠의 대사, 큰 번호 띠의 대사]
const SPECIAL = {
  '0-1': ['소 등에 타고 경주에서 1등 한 거, 아직도 고마워.', '그때 내 등에 탄 거 알고 있었어. 괜찮아, 같이 도착했잖아.'],
  '0-4': ['용아, 네가 찾던 정보 내가 다 모아 왔어.', '역시 쥐야. 너의 정보는 늘 큰 힘이 돼.'],
  '0-6': ['말아, 너무 빨라! 발에 밟힐 뻔했어.', '어? 발밑에 있었구나. 미안 미안, 천천히 갈게.'],
  '1-7': ['양아, 풀은 같이 나눠 먹자.', '소는 덩치는 커도 마음은 제일 따뜻해.'],
  '1-9': ['닭아, 네 덕분에 늘 제때 일어나.', '소님은 근태 만점이에요!'],
  '2-3': ['토끼야, 너 생각보다 용감하구나.', '호랑이, 무서운 척하는 거 다 알아. 사실 다정하잖아.'],
  '2-6': ['말아, 같이 산을 달려 보자!', '좋아, 대장 따라 전력 질주!'],
  '2-8': ['원숭이, 내 꼬리 잡아당긴 거 너지?', '헤헤, 증거 있어? 증거?'],
  '2-11': ['돼지야, 맛있는 냄새가 나는데 어디 가?', '호랑이도 같이 가자! 맛있는 거 나눠 줄게.'],
  '3-7': ['양 언니 털 너무 포근해.', '토끼는 언제 봐도 사랑스러워.'],
  '3-9': ['닭아, 너무 일찍 깨우지 마. 조금만 더 잘래.', '토끼님, 아침을 일찍 시작하면 하루가 길어져요!'],
  '4-5': ['뱀아, 언젠가 너도 하늘을 날게 될 거야.', '비늘 자랑은 그만. 나도 곧 날아오를 거야.'],
  '4-10': ['개야, 하늘 보고 짖지 마. 나야, 나.', '구름 위에 뭔가 반짝여서 그랬어. 너였구나!'],
  '5-8': ['원숭이야, 내 꼬리로 줄넘기할 생각은 하지 마.', '딱 한 번만! 재밌을 것 같단 말이야.'],
  '5-11': ['돼지야, 간식 조금 나눠 줄래?', '앗, 벌써 다 먹었어. 다음엔 꼭 남겨 둘게.'],
  '6-7': ['양아, 같이 초원 가자!', '천천히 가 줘. 털 날린단 말이야.'],
  '8-9': ['닭아, 새벽엔 조금만 조용히 해 줘.', '원숭이님, 지각이 벌써 세 번째예요!'],
  '9-10': ['개님, 오늘은 쫓아오지 말아 주세요!', '닭아 잠깐만! 왜 자꾸 지붕 위로 올라가?'],
  '10-11': ['돼지야, 그 간식 냄새 뭐야? 킁킁.', '반 나눠 줄게. 복도 같이 나누자.'],
  '3-11': ['돼지야, 우리 삼합이래! 같이 놀자.', '토끼랑 놀면 복이 굴러 들어와.'],
};

// 속담 전설: 띠 동물이 나오는 속담을 캐릭터 말투로 비튼 대화 [작은 번호 띠, 큰 번호 띠]
const PROVERBS = {
  '6-10': { proverb: '개 발에 편자', meaning: '격에 맞지 않아 어울리지 않음', lines: ['개야, 내 편자 한번 신어 볼래?', '개 발에 편자라더니… 미끄러워서 못 걷겠어!'] },
  '7-8': { proverb: '원숭이도 나무에서 떨어진다', meaning: '아무리 잘하는 사람도 실수할 때가 있다', lines: ['원숭이야, 괜찮아? 원숭이도 나무에서 떨어질 때가 있대.', '방금 그거 연습한 거야! 진짜야!'] },
  '0-8': { proverb: '쥐뿔도 모른다', meaning: '아무것도 모르면서 아는 체함', lines: ['원숭이, 쥐뿔도 모른다는 말은 나한테 하면 섭섭해. 정보는 내가 1등이야.', '그럼 쥐뿔이 뭔지 먼저 알려 줘 봐!'] },
  '1-3': { proverb: '소 귀에 경 읽기', meaning: '아무리 말해도 알아듣지 못함', lines: ['토끼야, 조금만 천천히 말해 줄래?', '소 귀에 경 읽기야… 벌써 세 번째 설명했는데!'] },
  '4-11': { proverb: '돼지 목에 진주 목걸이', meaning: '값어치를 모르는 이에게 귀한 것은 소용없음', lines: ['여의주를 맡아 준다고? 돼지 목에 진주 목걸이 아닐까?', '진주보다 만두가 좋아. 안 맡아도 돼!'] },
  '1-2': { proverb: '호랑이에게 물려 가도 정신만 차리면 산다', meaning: '위급해도 침착하면 살길이 있음', lines: ['호랑이에게 물려 가도 정신만 차리면 산다더라. 너무 겁주지 마.', '나 안 물어! 대신 정신은 번쩍 들게 해 줄게.'] },
  '3-10': { proverb: '토끼 둘을 잡으려다 하나도 못 잡는다', meaning: '욕심내어 여러 가지를 하다 모두 놓침', lines: ['개야, 나랑 내 쌍둥이 둘 다 쫓지 마!', '토끼 둘 잡으려다 하나도 못 잡는다더니… 둘 다 놓쳤어.'] },
  '9-11': { proverb: '꿩 대신 닭', meaning: '원하는 것 대신 비슷한 것으로 채움', lines: ['꿩 대신 닭이라니요! 저도 충분히 훌륭하답니다.', '나는 꿩보다 닭이 더 좋아. 같이 놀자.'] },
  '2-7': { proverb: '양의 탈을 쓴 늑대', meaning: '겉으론 순해 보이지만 속은 다름', lines: ['양털 좀 빌렸어! 양의 탈을 쓴… 호랑이야.', '털 돌려줘. 그래도 은근 잘 어울린다.'] },
  '6-9': { proverb: '말 한마디로 천 냥 빚을 갚는다', meaning: '말을 잘하면 어려운 일도 풀림', lines: ['말 한마디로 천 냥 빚 갚는다며? 내가 바로 그 말이야!', '말님, 그건 말(言)이에요! 그래도 오늘의 칭찬 한마디는 접수할게요.'] },
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
  if (stage === 1) return `🍼 ${text}`;
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
