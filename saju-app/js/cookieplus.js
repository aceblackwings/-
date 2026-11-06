// 포춘 쿠키 다듬기 1부(v0.61, 2026-11-06 사용자 승인 계획) — 순수 로직만(테스트: tests/cookieplus.test.mjs)
// ① 쿠키가 갈라질 때 지신 표정 + 한마디: 오늘 점수대 4단계 × 12띠 말투 = 48줄(낮은 점수도 겁주지 않기: 날씨 → 우산)
// ② 24절기·명절 6개(설·대보름·단오·칠석·추석·동지) = 쪽지 머리 특별 한 줄 30줄 + 명절 쿠키 모양(동지 팥빛 띠, 설 붉은 끈 …)
//    출시일 2026-12-22 = 동지 특별 쿠키
// ③ 황금 쿠키: 10번에 한 번(10%, 사용자 결정). 운세 점수는 같고 연출만(지신 크게 놀람·반짝임). 확률은 앱 안에 공개
// 소리는 넣지 않음. 진동은 도장(paidcharm)에만 — 이 파일에는 진동 코드 없음(테스트가 검사)
import { lunarToSolar, dateToJdn } from './lunar.js';
import { termDate } from './festivals.js';

const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };

// ---------- ① 지신의 한마디 ----------
/** 오늘 점수(오늘 5분야 총점) → 4단계: 0 흐림 · 1 잔잔 · 2 좋음 · 3 아주 좋음 */
export const TIER_CUT = [55, 68, 80];
export const tierOf = (score) => TIER_CUT.filter((c) => score >= c).length;
/** 단계별 표정(EMOTES key) — 흐린 날도 다독이는 평온한 얼굴 */
export const TIER_MOOD = ['calm', 'smile', 'excited', 'wow'];

export const REACT = {
  rat: ['오늘은 살짝 흐린 날이야. 우산 하나 챙긴다 생각하고 할 일만 콕 집어 하자.', '무난한 쪽지야. 작은 이득 하나만 챙겨도 오늘은 남는 장사야.', '오, 쪽지 느낌 좋은데? 눈에 띄는 기회 하나는 꼭 잡자.', '와, 정말 좋은 쪽지야! 미뤄 둔 일, 오늘 꺼내 보자.'],
  ox: ['구름 낀 날이네. 괜찮아, 천천히 가다 보면 비도 금방 그쳐.', '평소 같은 하루야. 하던 대로 한 걸음씩이면 충분해.', '좋은 쪽지가 나왔어. 애쓴 만큼 돌아오는 날이야.', '이야, 오늘 쪽지 정말 든든하다. 그동안 쌓은 게 빛을 볼 거야.'],
  tiger: ['흐린 날엔 힘을 아끼는 게 진짜 용기야. 내가 우산 들고 옆에 있을게.', '나쁘지 않아! 오늘은 내가 앞에서 바람 막아 줄게.', '기세 좋은 쪽지야! 하고 싶던 말, 오늘은 시원하게 해 보자.', '아주 멋진 쪽지다! 오늘은 마음껏 달려도 돼.'],
  rabbit: ['보슬비 같은 날이야. 따뜻한 차 한잔하고 나랑 천천히 가자.', '잔잔한 쪽지야. 좋아하는 거 하나 챙기면 하루가 포근해질 거야.', '느낌 좋은 쪽지야! 좋은 일 생기면 꼭 나한테 얘기해 줘.', '눈부신 쪽지가 나왔어! 오늘은 많이 웃는 날이야.'],
  dragon: ['구름 낀 날도 하늘은 그대로야. 오늘은 큰 그림만 잡아 두고 쉬어 가자.', '고른 흐름의 쪽지네. 작은 일부터 정리하면 길이 보여.', '좋은 바람이 부는 쪽지야. 오늘 한 걸음 크게 내디뎌 봐.', '하늘이 활짝 열린 쪽지야! 오늘은 네 꿈을 크게 말해도 좋아.'],
  snake: ['흐린 날엔 조용히 지켜보는 것도 지혜야. 서두르지 않으면 돼.', '차분한 쪽지야. 한 번 더 생각하고 움직이면 딱 좋아.', '좋은 기운이 보이는 쪽지야. 오늘은 네 느낌을 믿어 봐.', '보기 드문 좋은 쪽지네. 오늘 떠오르는 생각, 꼭 적어 둬.'],
  horse: ['오늘은 천천히 걷는 날이야. 비 오는 날엔 숨 고르기가 제일 빨라.', '괜찮은 쪽지야! 가볍게 몸 한번 풀고 시작하자.', '달리기 좋은 쪽지야! 하고 싶던 거 오늘 바로 해 보자.', '바람을 가르는 쪽지다! 오늘은 어디든 같이 달려 보자.'],
  sheep: ['포근하게 쉬어 가는 날이야. 이불처럼 따뜻한 하루로 만들어 보자.', '다정한 쪽지야. 좋아하는 사람한테 안부 하나 건네 봐.', '따뜻한 쪽지야. 오늘은 마음 쓴 만큼 돌아올 거야.', '오늘 쪽지 정말 포근하다. 행복한 일이 가득할 거야.'],
  monkey: ['흐린 날엔 재미있는 거 하나 찾아내면 이긴 거야. 같이 찾아보자.', '평범해 보여도 숨은 재미가 있는 쪽지야. 오늘 뭐 하나 새로 해 볼까?', '아이디어가 샘솟는 쪽지야! 떠오르면 바로 메모해 둬.', '대박 쪽지다! 오늘은 뭘 해도 재미있게 풀릴 거야.'],
  rooster: ['오늘은 조금 흐린 날이에요. 우산 챙기듯 할 일 하나만 단정히 해 두면 충분해요.', '고른 쪽지예요. 아침에 정한 순서대로만 가면 하루가 깔끔해요.', '좋은 쪽지가 나왔어요. 계획한 일, 자신 있게 해 보세요.', '정말 좋은 쪽지예요! 오늘은 당신이 빛나는 날이에요.'],
  dog: ['흐린 날이어도 괜찮아. 내가 옆에서 꼭 지키고 있을게.', '무난한 쪽지야! 반가운 사람 한 명한테 연락해 보자.', '좋은 쪽지야! 오늘은 솔직하게 말하면 잘 통할 거야.', '이렇게 좋은 쪽지라니! 오늘 정말 기쁜 날이야.'],
  pig: ['느긋하게 쉬어 가는 날이야. 맛있는 거 하나 먹고 힘내자.', '넉넉한 쪽지야. 작은 행복 하나만 찾아도 충분해.', '복이 굴러오는 쪽지야! 오늘은 나눌수록 더 생길 거야.', '복이 가득한 쪽지다! 오늘은 활짝 웃는 날이야.'],
};
const GOLD_SAY = { formal: '어머, 황금 쿠키가 나왔어요!', casual: '우와, 황금 쿠키가 나왔어!' };

/** 쿠키가 갈라질 때 지신의 반응 { tier, mood, line, big } — 황금 쿠키면 크게 놀람(점수 단계 문장은 그대로) */
export function cookieReaction(score, zodiacKey, gold = false) {
  const tier = tierOf(score);
  const lines = REACT[zodiacKey] || REACT.rat;
  const say = gold ? `${zodiacKey === 'rooster' ? GOLD_SAY.formal : GOLD_SAY.casual} ${lines[tier]}` : lines[tier];
  return { tier, mood: gold ? 'wow' : TIER_MOOD[tier], line: say, big: !!gold };
}

// ---------- ② 24절기 · 명절 6개 ----------
export const TERMS24 = [
  ['ipchun', '입춘', 315, '🌱', '봄이 문을 여는 입춘이에요. 올해 바라는 일 하나를 적어 두기 좋은 날이에요.'],
  ['usu', '우수', 330, '💧', '얼음이 녹아 비가 되는 우수예요. 굳어 있던 마음도 조금씩 풀려요.'],
  ['gyeongchip', '경칩', 345, '🐸', '개구리가 깨어나는 경칩이에요. 미뤄 둔 일을 하나 깨워 보세요.'],
  ['chunbun', '춘분', 0, '🌸', '낮과 밤이 같은 춘분이에요. 일과 쉼의 균형을 맞추기 좋은 날이에요.'],
  ['cheongmyeong', '청명', 15, '🌤️', '하늘이 맑고 밝은 청명이에요. 창문을 열고 방을 한 군데 정리해 보세요.'],
  ['gogu', '곡우', 30, '🌾', '봄비가 곡식을 키우는 곡우예요. 오늘 심은 작은 습관이 잘 자라요.'],
  ['ipha', '입하', 45, '🍃', '여름이 시작되는 입하예요. 몸을 가볍게 움직이기 좋은 날이에요.'],
  ['soman', '소만', 60, '🌿', '만물이 조금씩 차오르는 소만이에요. 작게 채워진 것들을 세어 보세요.'],
  ['mangjong', '망종', 75, '🌱', '씨를 뿌리는 망종이에요. 시작하고 싶던 일의 첫 줄을 써 보세요.'],
  ['haji', '하지', 90, '☀️', '해가 가장 긴 하지예요. 밝은 시간을 넉넉히 누려 보세요.'],
  ['soseo', '소서', 105, '🍉', '더위가 시작되는 소서예요. 물 한 잔을 자주 챙기세요.'],
  ['daeseo', '대서', 120, '🌻', '더위가 가장 깊은 대서예요. 시원한 곳에서 잠깐 쉬어 가도 괜찮아요.'],
  ['ipchu', '입추', 135, '🍂', '가을이 문을 두드리는 입추예요. 여름 동안 애쓴 나를 칭찬해 주세요.'],
  ['cheoseo', '처서', 150, '🌬️', '더위가 물러가는 처서예요. 저녁 바람이 한결 부드러워져요.'],
  ['baengno', '백로', 165, '💠', '풀잎에 이슬이 맺히는 백로예요. 아침 공기를 한 번 깊게 마셔 보세요.'],
  ['chubun', '추분', 180, '🍁', '낮과 밤이 다시 같아지는 추분이에요. 남은 한 해 계획을 한 번 살펴보세요.'],
  ['hallo', '한로', 195, '🧥', '찬 이슬이 내리는 한로예요. 따뜻한 겉옷 하나를 챙기세요.'],
  ['sanggang', '상강', 210, '🍠', '서리가 내리기 시작하는 상강이에요. 올해 거둔 열매를 정리하기 좋아요.'],
  ['ipdong', '입동', 225, '❄️', '겨울이 시작되는 입동이에요. 따뜻한 차로 몸을 데워 보세요.'],
  ['soseol', '소설', 240, '🌨️', '첫눈이 온다는 소설이에요. 고마운 사람에게 안부를 전해 보세요.'],
  ['daeseol', '대설', 255, '☃️', '큰 눈이 온다는 대설이에요. 오늘은 포근하게 쉬어 가도 좋아요.'],
  ['dongji_t', '동지', 270, '🥣', '밤이 가장 긴 동지예요. 내일부터 해가 다시 길어져요.'],
  ['sohan', '소한', 285, '🧣', '작은 추위가 오는 소한이에요. 몸을 든든히 챙기세요.'],
  ['daehan', '대한', 300, '🧤', '가장 춥다는 대한이에요. 이 추위만 지나면 봄이 가까워요.'],
].map(([key, name, lon, icon, line]) => ({ kind: 'term', key, name, lon, icon, line }));

/** 명절 6개 — shape = 쿠키 꾸밈(코드 SVG 덧그림) */
export const HOLIDAYS6 = [
  { key: 'seollal', name: '설날', icon: '🧧', m: 1, d: 1, shape: 'string', line: '새해 첫날, 설날이에요. 붉은 끈을 묶은 복 쿠키로 한 해를 활짝 열어요.' },
  { key: 'daeboreum', name: '정월대보름', icon: '🌕', m: 1, d: 15, shape: 'moon', line: '둥근 달이 뜨는 정월대보름이에요. 달을 보며 소원 하나를 빌어 보세요.' },
  { key: 'dano', name: '단오', icon: '🌿', m: 5, d: 5, shape: 'leaf', line: '창포 향 가득한 단오예요. 몸과 마음의 묵은 기운을 털어 내는 날이에요.' },
  { key: 'chilseok', name: '칠석', icon: '🌌', m: 7, d: 7, shape: 'stars', line: '견우와 직녀가 만나는 칠석이에요. 보고 싶던 사람에게 먼저 연락해 보세요.' },
  { key: 'chuseok', name: '추석', icon: '🌾', m: 8, d: 15, shape: 'ribbon', line: '넉넉한 한가위, 추석이에요. 고마운 마음을 한마디로 전해 보세요.' },
  { key: 'dongji', name: '동지', icon: '🥣', lon: 270, shape: 'redbean', line: '밤이 가장 긴 동지, 팥빛 띠를 두른 쿠키가 나왔어요. 오늘부터 해가 다시 길어져요.' },
].map((h) => ({ kind: 'holiday', ...h }));

/** 모든 특별 한 줄(테스트용) */
export const SPECIAL_LINES = [...TERMS24, ...HOLIDAYS6].map((x) => x.line);

const yearCache = new Map();
function specialsOf(year) {
  if (yearCache.has(year)) return yearCache.get(year);
  const map = new Map();
  for (const t of TERMS24) { const d = termDate(year, t.lon); map.set(dateToJdn(d.year, d.month, d.day), t); }
  for (const h of HOLIDAYS6) {
    const d = h.lon != null ? termDate(year, h.lon) : lunarToSolar(year, h.m, h.d);
    if (!d || d.error) continue;
    const jdn = dateToJdn(d.year, d.month, d.day);
    const term = map.get(jdn);
    map.set(jdn, { ...h, termName: term && term.kind === 'term' && term.name !== h.name ? term.name : null }); // 명절이 절기보다 먼저
  }
  yearCache.set(year, map);
  return map;
}

/** 그날의 특별 쿠키(절기·명절) 또는 null. date = { year, month, day } (양력) */
export function specialOf(date) {
  const jdn = dateToJdn(date.year, date.month, date.day);
  return specialsOf(date.year).get(jdn) || null;
}

// ---------- ③ 황금 쿠키 ----------
/** 10번에 한 번(사용자 결정). 앱 화면에 그대로 공개 */
export const GOLD_RATE = 0.1;
export const GOLD_NOTE = '황금 쿠키는 10번에 한 번(10%) 나와요. 운세 점수는 같고 모양만 특별해요.';
/** 사람 + 날짜로 정해짐(같은 날 다시 굴려도 같음) */
export const isGolden = (dateKey, seed = '') => hash(`gold|${dateKey}|${seed}`) % 100 < GOLD_RATE * 100;
