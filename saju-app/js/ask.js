// 운세 보기: 사용자 질문형 메뉴판과 답
// - 사주앱을 찾는 사람의 질문("연애운 어때?")에서 시작해 답을 주고,
//   답의 끝에 사용자 언어로 된 "한 걸음" 버튼 하나로 12지신 기능에 자연스럽게 연결
import { josa } from './josa.js';
import { ELEMENT_KO, ELEMENT_HANJA } from './saju.js';

export const ASK_MENU = [
  { key: 'today', icon: '🌅', q: '오늘 내 운세는?', sub: '총운 · 행운 색과 숫자', cat: 'total' },
  { key: 'tomorrow', icon: '🌙', q: '내일은 어떨까?', sub: '미리 알고 준비하기', cat: 'total' },
  { key: 'love', icon: '💕', q: '연애·이성운 어때?', sub: '인연 · 썸 · 고백 타이밍', cat: 'love' },
  { key: 'wealth', icon: '💰', q: '돈이 들어올까?', sub: '재물운 · 지출 조심할 날', cat: 'wealth' },
  { key: 'career', icon: '💼', q: '일·시험 잘 풀릴까?', sub: '직장 · 학업 · 면접', cat: 'career' },
  { key: 'people', icon: '🤝', q: '사람 관계는 괜찮을까?', sub: '친구 · 가족 · 동료', cat: 'social' },
  { key: 'health', icon: '🌿', q: '몸과 마음 컨디션은?', sub: '건강운 · 쉬어 갈 날', cat: 'health' },
  { key: 'saju', icon: '📜', q: '내 사주 풀이', sub: '타고난 기운 · 성격 · 용신', go: 'saju' },
  { key: 'year', icon: '📅', q: '올해와 앞으로 5년', sub: '월별 운세 · 대운 흐름', go: 'report' },
  { key: 'direction', icon: '🧭', q: '오늘 좋은 방향·장소', sub: '풍수 기운 스팟', go: 'feng' },
];

/** 처음 고른 고민 → 맨 위에 올릴 질문 */
const CONCERN_TO_ASK = { exam: 'career', job: 'career', business: 'career', change: 'career', wealth: 'wealth', love: 'love', marriage: 'love', health: 'health', people: 'people' };

export function concernAsk(concernKey) {
  return CONCERN_TO_ASK[concernKey] || 'today';
}

/** 내 고민 질문을 맨 앞으로 */
export function orderedMenu(concernKey) {
  const top = concernAsk(concernKey);
  const first = ASK_MENU.find((x) => x.key === top);
  return [{ ...first, mine: true }, ...ASK_MENU.filter((x) => x.key !== top)];
}

const CAT_LABEL = { total: '총운', love: '애정운', wealth: '재물운', career: '직장·학업운', social: '대인운', health: '건강운' };
const CAT_TALISMAN = { total: 'protect', wealth: 'wealth', love: 'love', career: 'exam', health: 'health', social: 'luck' };
const DOW = ['일', '월', '화', '수', '목', '금', '토'];

function dayLabel(d, i) {
  const dow = DOW[new Date(Date.UTC(d.year, d.month - 1, d.day)).getUTCDay()];
  return { short: i === 0 ? '오늘' : i === 1 ? '내일' : `${dow}`, full: `${d.month}/${d.day}(${dow})` };
}

function toneOf(score) {
  // fortune.js tierOf와 같은 기준(80/60/40)
  return score >= 80 ? '아주 좋아요' : score >= 60 ? '좋은 편이에요' : score >= 40 ? '무난해요' : '쉬어 가는 날이에요';
}

/** 주제별 행동 팁: 행운 키트 중 관련 있는 것 */
function tipOf(key, f) {
  const l = f.luck;
  switch (key) {
    case 'love': return `${l.color} 소품을 하나 걸치고, ${l.time}쯤 먼저 짧은 안부를 보내 보세요.`;
    case 'wealth': return `오늘 지출 하나만 적어 두고, 충동구매 한 번만 참아 보세요. 행운 숫자는 ${l.number}입니다.`;
    case 'career': return `${l.time}에 25분만 가장 중요한 일 하나에 집중해 보세요. ${l.direction}쪽 자리가 잘 맞아요.`;
    case 'people': return `고마운 사람 한 명에게 먼저 한마디 건네 보세요. ${josa(l.food, '을/를')} 함께 먹으면 더 좋아요.`;
    case 'health': return `물 한 잔 더, 5분 스트레칭부터 시작해 보세요. 아픈 곳이 계속되면 꼭 병원에 가 보세요.`;
    default: return `행운 색 ${l.color}, 숫자 ${l.number}, 방향 ${l.direction}, 음식 ${josa(l.food, '을/를')} 챙겨 보세요.`;
  }
}

/**
 * 질문에 대한 답
 * @param key ASK_MENU key (go 메뉴 제외)
 * @param saju 내 사주
 * @param week 오늘부터 7일 운세 배열 [computeFortune(...)...]
 */
export function buildAnswer(key, saju, week) {
  const item = ASK_MENU.find((x) => x.key === key);
  if (!item || item.go) return null;
  const f = key === 'tomorrow' ? week[1] : week[0];
  const cat = item.cat;
  const score = f.scores[cat];
  const trend = week.map((w, i) => ({ ...dayLabel(w.date, i), score: w.scores[cat] }));
  const ahead = trend.slice(key === 'tomorrow' ? 1 : 0);
  const best = ahead.reduce((a, b) => (b.score > a.score ? b : a));
  const low = ahead.reduce((a, b) => (b.score < a.score ? b : a));
  const yong = `${ELEMENT_HANJA[saju.yongsin]} ${ELEMENT_KO[saju.yongsin]}`;

  // 오늘 운세에서는 가장 약한 운을 짚어 줌
  const cats = ['wealth', 'love', 'career', 'health', 'social'];
  const weakCat = cats.reduce((a, b) => (f.scores[b] < f.scores[a] ? b : a));

  const cta = {
    today: { label: `가장 약한 ${CAT_LABEL[weakCat]}을 채우는 부적 받기`, action: 'charm', talisman: CAT_TALISMAN[weakCat] },
    tomorrow: { label: '내일을 위해 수호신에게 물어보기', action: 'chat', ask: '내일 운세 미리 알려 주고, 뭘 준비하면 좋을지 알려 줘' },
    love: { label: '마음에 둔 사람과 궁합 보기', action: 'compat' },
    wealth: { label: '올해 돈 흐름 좋은 달 확인하기', action: 'report' },
    career: { label: '이 고민, 30일 해결 여정으로 풀기', action: 'journey' },
    people: { label: '친구에게 응원 한마디 보내기', action: 'compat' },
    health: { label: '오늘 기운 좋은 장소 찾기', action: 'feng' },
  }[key];

  return {
    key, icon: item.icon, q: item.q, cat, catLabel: CAT_LABEL[cat],
    when: key === 'tomorrow' ? '내일' : '오늘',
    score, tone: toneOf(score),
    text: f.texts[cat],
    basis: `${key === 'tomorrow' ? '내일' : '오늘'}은 「${f.tenGod}」의 날(${f.info.title})이에요. 내 사주에 필요한 기운은 ${josa(yong, '이라/라')}, ${ELEMENT_KO[saju.yongsin]} 기운을 가까이하면 흐름이 부드러워져요.`,
    tip: tipOf(key, f),
    weak: key === 'today' ? { cat: weakCat, label: CAT_LABEL[weakCat], score: f.scores[weakCat] } : null,
    trend, best, low: low.score < 45 ? low : null,
    cta,
  };
}
