// 오늘의 이야기(v0.50, 2026-11-05 사용자 의견 「오늘 운세가 숫자로만 나와 와닿지 않는다」)
// 오늘 운세 = 한 줄 제목 → 왜 그런지(오늘 들어온 기운) → 좋은 점 · 조심할 점 · 생각해 볼 것 · 하면 좋은 것 → 행운 → 공감 묻기
// 점수(fortune.js)는 그대로 쓰고 글만 만든다. 같은 날 같은 사람은 늘 같은 글. 순수 로직만(테스트: tests/storybook.test.mjs)
import { TODAY_TALE, PLAIN_GOD, EL_NAME } from './storybook.js';
import { ANIMALS, STEM_ELEMENT } from './saju.js';
import { josa } from './josa.js';

const POS_TODAY = { day: '나와 가장 가까운 사람의 자리', month: '일터와 부모님의 자리', year: '집안과 오랜 인연의 자리', hour: '아랫사람과 앞날의 자리' };
const LOW_TIP = {
  love: '애정운이 가장 낮아요. 오늘은 내 마음을 먼저 아껴 주면 사랑도 따라와요.',
  money: '금전운이 가장 낮아요. 큰 결제는 내일로 미루면 마음이 편해요.',
  health: '건강운이 가장 낮아요. 물 한 잔과 이른 잠이 오늘의 보약이에요.',
  work: '직장운이 가장 낮아요. 중요한 결정은 한 번 더 확인하면 실수가 사라져요.',
  biz: '사업운이 가장 낮아요. 새로 벌이기보다 숫자와 계약서를 점검하면 남는 게 많아요.',
};
const MOOD = [
  [80, '바람이 등을 밀어 주는 하루예요. 미뤄 둔 일을 꺼내 보세요.'],
  [64, '잔잔하게 순한 하루예요. 하던 일을 꾸준히 이어 가면 좋아요.'],
  [46, '한 박자 쉬어 가면 더 좋은 하루예요. 서두르지 않는 것이 오늘의 실력이에요.'],
  [0, '몸을 낮추고 나를 돌보는 하루예요. 작은 일 하나만 해내도 충분해요.'],
];

/**
 * @param f computeFortune 결과 · @param saju computeSaju 결과 · @param five fiveScores(f) 결과
 * @returns { head, mood, why, good, watch, think, act[2], lucky, low }
 */
export function todayStory(f, saju, five) {
  const god = f.tenGod; const T = TODAY_TALE[god];
  const el = STEM_ELEMENT[f.pillar.stem];
  const total = five?.total ?? f.scores.total;
  const mood = MOOD.find(([min]) => total >= min)[1];
  let why = `오늘은 ${PLAIN_GOD[god]}이 들어오는 날이에요.`;
  if (el === saju.yongsin) why += ` 게다가 나에게 가장 필요한 ${EL_NAME[el]} 기운이 하늘에서 내려와 일이 한결 술술 풀려요.`;
  else if (el === saju.gisin) why += ` 다만 이미 넉넉한 ${EL_NAME[el]} 기운이 더 들어와, 몸과 마음이 조금 무거울 수 있어요. 덜어 내는 하루로 쓰면 가벼워져요.`;
  else why += ` 하늘에서는 ${EL_NAME[el]} 기운이 내려와요. 그 흐름에 맞춰 차분히 움직이면 하루가 편해져요.`;
  let good = T.good; let watch = T.watch;
  const animal = ANIMALS[f.pillar.branch];
  const comb = (f.relations || []).find((r) => r.type === 'combine');
  const clash = (f.relations || []).find((r) => r.type !== 'combine');
  if (comb) good += ` 오늘의 ${animal} 기운이 내 사주의 ${POS_TODAY[comb.pillar]}와 짝을 이뤄, 사람 사이의 일이 잘 풀려요.`;
  if (clash) watch += ` 오늘 마음이 괜히 흔들린다면 이유가 있어요. 오늘의 ${animal} 기운이 내 사주의 ${POS_TODAY[clash.pillar]}와 부딪혀서예요. 말은 한 번 더 부드럽게 해 보세요.`;
  const L = f.luck;
  const lucky = `🍀 오늘의 행운: 색은 ${L.color} · 숫자 ${L.number} · 시간은 ${L.time.replace(/\s*\(.*\)$/, '')}`;
  const low = five?.low ? LOW_TIP[five.low.key] : '';
  return { head: T.head, mood, why, good, watch, think: T.think, act: [...T.do], lucky, low };
}

/** 공감 기록: { dateKey: 'yes'|'meh' } (40일만) */
export function setEmpathy(store, dateKey, v) {
  const s = { ...(store || {}), [dateKey]: v };
  const keys = Object.keys(s).sort((a, b) => toNum(b) - toNum(a));
  return Object.fromEntries(keys.slice(0, 40).map((k) => [k, s[k]]));
}
const toNum = (k) => { const [y, m, d] = k.split('-').map(Number); return y * 10000 + m * 100 + d; };
export const empathyRate = (store) => { const v = Object.values(store || {}); return v.length ? Math.round((v.filter((x) => x === 'yes').length / v.length) * 100) : null; };
export const empathyReply = (v, name) => (v === 'yes'
  ? `${name ? josa(`${name} 님`, '이/가') : '당신이'} 공감해 주니 기뻐요. 오늘 저녁, 「하면 좋은 것」을 했는지 한 번만 떠올려 보세요.`
  : '솔직하게 말해 줘서 고마워요. 내일은 더 와닿는 이야기로 찾아올게요. 「어제 운세 맞았나요?」에 답해 주시면 풀이가 더 정확해져요.');
