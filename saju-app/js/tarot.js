// 12지신 타로 (v0.42, 2026-11-04 사용자 요청: 「타로는 12지신 덱으로, 내가 직접 카드를 골라 애정·취업 같은 미래를 점쳐 주기」)
// 덱 = 12지신 12장 × 바로/누운 카드. 누운 카드는 겁주지 않고 「잠깐 쉬어 가라」는 조언으로 읽는다(날씨→우산 문법).
// 카드를 섞는 순서만 무작위(rng를 넘기면 테스트에서 고정), 고르는 것은 사용자. 화면과 무관한 순수 로직(테스트: tests/tarot.test.mjs)

export const TAROT_TOPICS = [
  { key: 'love', icon: '💗', label: '애정운', ask: '그 사람과 나, 앞으로 어떻게 될까?' },
  { key: 'job', icon: '💼', label: '취업·일', ask: '원하는 일이 잘 풀릴까?' },
  { key: 'money', icon: '💰', label: '금전운', ask: '돈 흐름은 어떻게 흘러갈까?' },
  { key: 'day', icon: '🌤️', label: '오늘·궁금한 일', ask: '지금 마음에 걸린 일, 어떻게 하면 좋을까?' },
];

export const TAROT_SPREADS = {
  one: { label: '한 장 뽑기', desc: '지금 내게 필요한 답 한 가지', positions: ['오늘의 답'] },
  three: { label: '세 장 뽑기', desc: '지난 흐름 · 지금 · 앞으로', positions: ['지난 흐름', '지금', '앞으로'] },
};

/** 12지신 덱: 띠마다 하나의 뜻(일반 타로의 큰 카드에 해당) + 분야별 문장 + 오늘 할 한 가지 */
export const TAROT_DECK = [
  { key: 'rat', name: '쥐', title: '새벽의 지혜', keyword: '시작 · 기회 포착', mood: 'smile',
    up: { love: '작은 관심이 인연의 문을 열어요. 먼저 건네는 짧은 안부가 시작이 돼요.', job: '남들보다 먼저 정보를 잡는 때예요. 공고와 소식을 꼼꼼히 살피면 기회가 보여요.', money: '작은 돈이 모여 흐름을 만드는 때예요. 새는 지출 하나를 막으면 여유가 생겨요.', day: '생각만 하던 일을 오늘 아주 작게 시작해 보면 길이 보여요.' },
    rev: '서두르기보다 정보를 한 번 더 모으면 더 좋은 기회가 와요.', act: '오늘 궁금한 것 하나를 메모해 두기' },
  { key: 'ox', name: '소', title: '묵묵한 걸음', keyword: '꾸준함 · 신뢰', mood: 'calm',
    up: { love: '천천히 쌓는 믿음이 가장 단단한 사랑이 돼요. 꾸준한 연락이 마음을 움직여요.', job: '한 걸음씩 쌓은 실력이 인정받는 흐름이에요. 지금 하던 준비를 이어 가면 돼요.', money: '꾸준히 모으는 힘이 커지는 때예요. 적금·저축처럼 오래 가는 방법이 잘 맞아요.', day: '오늘은 속도보다 꾸준함이 이기는 날이에요. 하던 일을 끝까지 마무리해 보세요.' },
    rev: '혼자 짊어진 짐을 조금 나누면 걸음이 훨씬 가벼워져요.', act: '오늘 할 일 하나를 끝까지 마치기' },
  { key: 'tiger', name: '호랑이', title: '용기의 포효', keyword: '용기 · 도전', mood: 'fighting',
    up: { love: '마음을 솔직하게 표현할 용기가 생겨요. 망설이던 한마디를 건네 보세요.', job: '도전할수록 길이 열리는 때예요. 면접·지원·발표에 자신 있게 나서 보세요.', money: '과감한 결정이 힘을 받는 흐름이에요. 다만 큰돈은 하루 생각한 뒤에 움직이면 더 좋아요.', day: '미루던 일에 오늘 먼저 손을 내밀면 생각보다 쉽게 풀려요.' },
    rev: '힘을 잠시 모아 두면 더 멀리 뛸 수 있어요. 오늘은 준비에 집중해요.', act: '미뤄 둔 연락이나 지원 하나 해 보기' },
  { key: 'rabbit', name: '토끼', title: '달빛 속 다정함', keyword: '사랑 · 조화', mood: 'love',
    up: { love: '다정한 기운이 가득한 카드예요. 상대도 나에게 마음을 열 준비가 되어 있어요.', job: '함께 일하는 사람과 손발이 잘 맞는 때예요. 협업과 추천에서 좋은 소식이 와요.', money: '사람을 통해 들어오는 기회가 있어요. 주변의 조언에 귀 기울여 보세요.', day: '부드러운 말 한마디가 오늘 하루를 환하게 바꿔 줘요.' },
    rev: '남을 챙기느라 나를 놓치지 않았나 살펴보세요. 나에게도 다정해지는 날이에요.', act: '고마운 사람에게 짧은 감사 인사 보내기' },
  { key: 'dragon', name: '용', title: '구름 위의 변화', keyword: '큰 흐름 · 전환', mood: 'excited',
    up: { love: '관계가 한 단계 나아가는 흐름이에요. 새로운 장면이 기다리고 있어요.', job: '큰 변화가 좋은 쪽으로 오는 카드예요. 이직·합격 같은 전환점이 가까워요.', money: '흐름이 크게 바뀌는 때예요. 새로운 수입 길을 열어 두면 좋아요.', day: '오늘 생긴 변화는 더 큰 운을 부르는 신호예요. 반갑게 맞아 보세요.' },
    rev: '변화가 오기 전 잠시 고요한 때예요. 마음을 정리해 두면 흐름이 오면 바로 탈 수 있어요.', act: '이루고 싶은 일 한 줄 적어 두기' },
  { key: 'snake', name: '뱀', title: '고요한 통찰', keyword: '직감 · 지혜', mood: 'calm',
    up: { love: '내 직감이 정확한 때예요. 상대의 작은 표정과 말에 답이 들어 있어요.', job: '깊이 파고드는 공부와 분석이 빛나요. 꼼꼼한 준비가 합격을 불러요.', money: '숫자를 꼼꼼히 따져 볼수록 이득이 보여요. 계약서와 영수증을 한 번 더 확인해요.', day: '조용히 생각하는 시간이 오늘의 정답을 알려 줘요.' },
    rev: '생각이 많아지는 날이에요. 고민은 종이에 적고, 결정은 내일로 미뤄도 괜찮아요.', act: '10분 동안 조용히 생각 정리하기' },
  { key: 'horse', name: '말', title: '바람을 가르는 질주', keyword: '자유 · 전진', mood: 'excited',
    up: { love: '설레는 만남과 활기찬 데이트의 기운이에요. 함께 밖으로 나가 보세요.', job: '움직일수록 기회가 따라오는 때예요. 새로운 곳에 지원하고 사람을 만나 보세요.', money: '활발히 움직이는 만큼 돈이 도는 흐름이에요. 발로 뛰는 일에서 수입이 생겨요.', day: '오늘은 몸을 움직이면 마음도 풀려요. 가볍게 걸으며 생각해 보세요.' },
    rev: '너무 빨리 달려왔다면 숨을 고를 때예요. 쉬어 가는 것도 앞으로 가는 방법이에요.', act: '15분 가볍게 걷기' },
  { key: 'sheep', name: '양', title: '포근한 보살핌', keyword: '돌봄 · 치유', mood: 'thanks',
    up: { love: '서로를 아껴 주는 따뜻한 관계의 카드예요. 작은 배려가 마음을 깊게 해요.', job: '사람을 돕고 가르치는 일에서 좋은 평가를 받아요. 친절함이 경쟁력이 돼요.', money: '안정적인 흐름이에요. 나와 가족을 위한 알뜰한 지출이 복을 불러요.', day: '오늘은 나를 돌보는 일이 가장 중요한 일이에요. 따뜻한 차 한 잔 어때요?' },
    rev: '마음이 지쳐 있다는 신호예요. 오늘은 부탁을 조금 줄이고 나를 먼저 챙겨요.', act: '따뜻한 물 한 잔 천천히 마시기' },
  { key: 'monkey', name: '원숭이', title: '재치의 손끝', keyword: '재능 · 아이디어', mood: 'wow',
    up: { love: '유쾌한 대화가 인연을 이어 줘요. 함께 웃는 시간이 마음을 가깝게 해요.', job: '아이디어와 손재주가 빛나는 때예요. 포트폴리오와 자기소개에 나만의 색을 담아 보세요.', money: '재치 있는 방법으로 돈을 아끼고 버는 흐름이에요. 부업·중고 판매도 잘 맞아요.', day: '평소와 다른 방법을 하나 시도해 보면 막혔던 일이 풀려요.' },
    rev: '여러 일을 한꺼번에 잡고 있다면 하나만 골라 집중해 보세요.', act: '오늘 할 일 중 가장 중요한 하나에 동그라미' },
  { key: 'rooster', name: '닭', title: '새벽을 여는 소리', keyword: '결실 · 질서', mood: 'smile',
    up: { love: '관계가 또렷해지는 때예요. 마음을 분명히 말하면 좋은 답이 돌아와요.', job: '노력한 결과가 드러나는 카드예요. 발표·합격 소식에 기대를 걸어 보세요.', money: '정리할수록 돈이 모여요. 가계부 한 줄이 흐름을 바꿔 줘요.', day: '오늘은 정리정돈이 운을 불러요. 책상 위 하나만 치워도 머리가 맑아져요.' },
    rev: '완벽하게 하려다 지치지 않게, 오늘은 80점이면 충분해요.', act: '책상이나 가방 하나 정리하기' },
  { key: 'dog', name: '개', title: '변치 않는 믿음', keyword: '신의 · 지킴', mood: 'thanks',
    up: { love: '믿음직한 사람이 곁에 있는 카드예요. 진심은 반드시 전해져요.', job: '성실함과 책임감이 인정받는 때예요. 맡은 일을 끝까지 지키면 신뢰가 쌓여요.', money: '지키는 힘이 강한 때예요. 보증·충동구매만 피하면 차곡차곡 모여요.', day: '오늘은 약속을 지키는 것만으로도 운이 올라가요.' },
    rev: '남을 지키느라 지쳤다면 나를 지키는 선도 정해 보세요.', act: '오늘 약속 시간보다 5분 먼저 도착하기' },
  { key: 'pig', name: '돼지', title: '넉넉한 복주머니', keyword: '풍요 · 만족', mood: 'excited',
    up: { love: '함께 맛있는 것을 먹고 웃는 행복한 흐름이에요. 소소한 데이트가 사랑을 키워요.', job: '노력한 만큼 보상이 따르는 카드예요. 좋은 조건과 대우를 기대해도 좋아요.', money: '복이 들어오는 카드예요. 들어온 복을 조금 나누면 더 크게 돌아와요.', day: '오늘은 작은 즐거움을 누려도 좋은 날이에요. 나에게 작은 선물을 해 보세요.' },
    rev: '넉넉함을 오래 누리려면 오늘은 한 번 덜 쓰고 한 번 더 모아 봐요.', act: '오늘 쓴 돈 한 줄 적어 보기' },
];

const BY_KEY = Object.fromEntries(TAROT_DECK.map((c) => [c.key, c]));
export const cardOf = (key) => BY_KEY[key];

/** 덱 섞기: 12장의 순서 + 누운 카드(약 25%). rng는 0~1 함수 */
export function shuffleDeck(rng = Math.random) {
  const a = TAROT_DECK.map((c) => ({ key: c.key, reversed: rng() < 0.25 }));
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** 시드로 만드는 고정 난수(테스트·같은 화면 다시 그리기용) */
export function seededRng(seed) {
  let h = 2166136261;
  for (const ch of String(seed)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** 누운 카드에 붙는 분야별 다독임(경고 대신 천천히 가는 방법) */
const TOPIC_REV = { love: '관계는 한 템포 천천히 가도 괜찮아요.', job: '준비를 다지는 시간이 결과를 더 좋게 만들어요.', money: '큰 지출은 잠시 미뤄 두면 마음이 편해요.', day: '오늘은 무리하지 않는 것이 가장 좋은 선택이에요.' };
const POS_LEAD = { '오늘의 답': '', '지난 흐름': '지금까지는', '지금': '지금은', '앞으로': '앞으로는' };

/**
 * 고른 카드 풀이
 * @param topic TAROT_TOPICS의 key · spread 'one'|'three' · picks [{key, reversed}] (자리 순서대로)
 * @returns { topic, spread, cards:[{pos, card, reversed, keyword, line}], summary, act }
 */
export function readTarot({ topic = 'day', spread = 'one', picks, name = '' }) {
  const sp = TAROT_SPREADS[spread]; const tp = TAROT_TOPICS.find((t) => t.key === topic) || TAROT_TOPICS[3];
  if (!sp || !picks || picks.length !== sp.positions.length) throw new Error('카드 수가 맞지 않아요');
  const cards = picks.map((p, i) => {
    const c = BY_KEY[p.key]; const pos = sp.positions[i];
    const body = p.reversed ? `${c.rev} ${TOPIC_REV[tp.key]}` : c.up[tp.key];
    const lead = POS_LEAD[pos] ? `${POS_LEAD[pos]} 「${c.title}」의 기운이에요. ` : '';
    return { pos, card: c, reversed: !!p.reversed, keyword: p.reversed ? `${c.keyword} · 쉬어 가기` : c.keyword, line: `${lead}${body}` };
  });
  const ups = cards.filter((c) => !c.reversed).length;
  const last = cards[cards.length - 1];
  const who = name ? `${name} 님, ` : '';
  const tone = ups === cards.length
    ? `${who}카드가 모두 바로 섰어요. ${tp.label}의 흐름이 밝게 열려 있어요.`
    : ups === 0
      ? `${who}카드가 모두 잠시 누워 있어요. 서두르지 말고 숨을 고르면 흐름이 다시 일어서요.`
      : `${who}밝은 기운과 쉬어 가는 기운이 함께 보여요. 좋은 쪽을 살리고 쉬어 갈 곳은 천천히 가면 돼요.`;
  return { topic: tp, spread: sp, cards, summary: `${tone} 열쇠 카드는 「${last.card.name} · ${last.card.title}」예요.`, act: last.card.act };
}
