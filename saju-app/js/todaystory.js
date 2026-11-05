// 오늘의 이야기(v0.50, 2026-11-05 사용자 의견 「오늘 운세가 숫자로만 나와 와닿지 않는다」)
// 오늘 운세 = 한 줄 제목 → 왜 그런지(오늘 들어온 기운) → 좋은 점 · 조심할 점 · 생각해 볼 것 · 하면 좋은 것 → 행운 → 공감 묻기
// 점수(fortune.js)는 그대로 쓰고 글만 만든다. 같은 날 같은 사람은 늘 같은 글. 순수 로직만(테스트: tests/storybook.test.mjs)
import { TODAY_TALE, PLAIN_GOD, EL_NAME } from './storybook.js';
import { ANIMALS, STEM_ELEMENT } from './saju.js';
import { josa } from './josa.js';

const POS_TODAY = { day: '나와 가장 가까운 사람의 자리', month: '일터와 부모님의 자리', year: '집안과 오랜 인연의 자리', hour: '아랫사람과 앞날의 자리' };
const LOW_TIP = {
  love: '애정운이 가장 낮아요. 오늘은 서운한 말을 꺼내기보다 안부 한마디만 전하세요.',
  money: '금전운이 가장 낮아요. 큰 결제는 내일로 미루면 마음이 편해요.',
  health: '건강운이 가장 낮아요. 물을 자주 마시고 평소보다 일찍 주무세요.',
  work: '직장운이 가장 낮아요. 중요한 결정과 보고는 한 번 더 확인하고 내세요.',
  biz: '사업운이 가장 낮아요. 새 일은 벌이지 말고 숫자와 계약서를 점검하세요.',
};
// 오늘의 한 편(4~5문장). v0.51(2026-11-05 테스터 의견 「비유와 돌려 말하기가 많아 무엇을 해야 하고 무엇을 조심할지 헷갈린다」):
// 비유를 빼고 [오늘 생기기 쉬운 일, 마음·몸 상태, 오늘 할 일(구체), 저녁에 확인할 것]을 그대로 말한다
export const STORY4 = {
  비견: ['오늘은 내 생각대로 밀고 나가고 싶은 마음이 강해지는 날이에요.', '「내가 할게」라는 말이 먼저 나오고, 혼자 다 떠안기 쉬워요.', '오늘 할 일: 혼자 하던 일 하나를 동료나 가족 한 명과 나눠서 하세요.', '저녁에 오늘 누구와 함께 일했는지 확인해 보세요.'],
  겁재: ['오늘은 돈이 계획보다 많이 나가기 쉬운 날이에요.', '「이건 꼭 사야 해」 하는 마음이 들어 충동구매를 하기 쉬워요.', '오늘 할 일: 사고 싶은 물건은 장바구니에만 담고, 결제는 내일 다시 보고 정하세요.', '저녁에 오늘 쓴 돈을 카드 내역으로 한 번 확인해 보세요.'],
  식신: ['오늘은 무언가를 만들거나 표현하면 좋은 반응을 얻는 날이에요.', '마음이 느긋해져 일을 미루거나 많이 먹기 쉬워요.', '오늘 할 일: 만든 것이나 써 둔 글 하나를 한 사람에게 보여 주세요.', '저녁은 가볍게 먹고, 야식은 오늘 하루 쉬어 가세요.'],
  상관: ['오늘은 말실수와 말다툼을 조심해야 하는 날이에요.', '불만이 생기면 바로 말하고 싶어지고, 말투가 날카로워지기 쉬워요.', '오늘 할 일: 말하기 전에 3초 쉬고, 상대의 좋은 점을 먼저 한마디 하세요.', '저녁에 오늘 하지 않고 참은 말이 있었는지 떠올려 보세요.'],
  편재: ['오늘은 새로운 사람이나 장소에서 기회가 생기기 쉬운 날이에요.', '기분이 들떠서 돈을 크게 쓰기 쉬워요.', '오늘 할 일: 새 제안이나 정보는 듣고 메모만 하고, 큰 결제는 하루 미루세요.', '저녁에 오늘 들은 제안을 비용·기간·손해 범위로 적어 보세요.'],
  정재: ['오늘은 꾸준히 해 온 일이 그대로 결과로 돌아오는 날이에요.', '정리하고 마무리하는 일을 할 때 마음이 편해요.', '오늘 할 일: 오늘 끝낼 일 세 가지를 정해서 그것만 끝내세요.', '저녁에 끝낸 일 세 가지를 지우며 확인해 보세요.'],
  편관: ['오늘은 일과 책임이 한꺼번에 몰리는 날이에요.', '마음이 급해지고 목과 어깨가 뻣뻣해지기 쉬워요.', '오늘 할 일: 급한 일과 내일로 미뤄도 되는 일을 나누고, 운전과 계단은 천천히 하세요.', '저녁에는 따뜻한 물로 씻고 평소보다 30분 일찍 주무세요.'],
  정관: ['오늘은 윗사람이나 주변의 평가를 받기 쉬운 날이에요.', '잘해야 한다는 부담에 무리한 약속을 하기 쉬워요.', '오늘 할 일: 약속과 보고는 10분 먼저 하고, 할 수 없는 부탁은 정중하게 거절하세요.', '저녁에 오늘 받은 부탁 중 무리한 것이 없었는지 확인해 보세요.'],
  편인: ['오늘은 생각이 많아지고 작은 일도 마음에 걸리는 날이에요.', '혼자 짐작하고 서운해하거나, 밤에 잠이 늦게 들기 쉬워요.', '오늘 할 일: 궁금하거나 걸리는 일은 짐작하지 말고 당사자에게 바로 물어보세요.', '잠들기 30분 전에는 휴대폰을 내려놓고, 걱정은 종이에 한 줄로 적어 두세요.'],
  정인: ['오늘은 윗사람이나 주변 사람에게 도움을 받기 쉬운 날이에요.', '막혀 있던 일이 누군가의 조언으로 풀리기 쉬워요.', '오늘 할 일: 도와준 사람에게 오늘 안에 고맙다는 메시지를 보내세요.', '저녁에 오늘 배운 것 하나를 다시 떠올려 보세요.'],
};

const MOOD = [
  [80, '흐름이 좋은 하루예요. 미뤄 둔 일을 오늘 시작하세요.'],
  [64, '무난한 하루예요. 하던 일을 그대로 이어 가면 좋아요.'],
  [46, '서두르면 실수가 나기 쉬운 하루예요. 큰 결정은 미루고 하던 일만 하세요.'],
  [0, '쉬어 가는 하루예요. 새 일은 벌이지 말고, 꼭 해야 할 일 하나만 하세요.'],
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
  if (el === saju.yongsin) why += ` 게다가 나에게 가장 필요한 ${EL_NAME[el]} 기운이 들어와 일이 평소보다 잘 풀려요.`;
  else if (el === saju.gisin) why += ` 다만 이미 넉넉한 ${EL_NAME[el]} 기운이 더 들어와, 몸과 마음이 조금 무거울 수 있어요. 덜어 내는 하루로 쓰면 가벼워져요.`;
  else why += ` 오늘 들어오는 오행은 ${EL_NAME[el]} 기운이에요. 평소 하던 대로 차분히 움직이면 돼요.`;
  let good = T.good; let watch = T.watch;
  const animal = ANIMALS[f.pillar.branch];
  const comb = (f.relations || []).find((r) => r.type === 'combine');
  const clash = (f.relations || []).find((r) => r.type !== 'combine');
  if (comb) good += ` 오늘의 ${animal} 기운이 내 사주의 ${POS_TODAY[comb.pillar]}와 짝을 이뤄, 사람 사이의 일이 잘 풀려요.`;
  if (clash) watch += ` 오늘 마음이 괜히 흔들린다면 이유가 있어요. 오늘의 ${animal} 기운이 내 사주의 ${POS_TODAY[clash.pillar]}와 부딪혀서예요. 말은 한 번 더 부드럽게 해 보세요.`;
  const L = f.luck;
  const lucky = `🍀 오늘의 행운: 색은 ${L.color} · 숫자 ${L.number} · 시간은 ${L.time.replace(/\s*\(.*\)$/, '')}`;
  const low = five?.low ? LOW_TIP[five.low.key] : '';
  const [hook, body, spell, night] = STORY4[god];
  const cause = el === saju.yongsin ? `오늘 ${PLAIN_GOD[god]}이 들어온 데다, 나에게 가장 필요한 ${EL_NAME[el]} 기운까지 들어와서 그래요.`
    : clash ? `오늘 ${PLAIN_GOD[god]}이 들어오고, 오늘의 ${animal} 기운이 내 사주와 살짝 부딪혀서 그래요.`
      : `오늘 ${PLAIN_GOD[god]}이 들어와서 그래요.`;
  const story = [hook, `${body} ${cause}`, spell, night].join(' ');
  return { head: T.head, mood, story, why, good, watch, dont: [...T.dont], think: T.think, act: [...T.do], lucky, low };
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
