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
// 오늘의 한 편(4~5문장, v0.50.1 사용자 요청 「재미있게」): 첫 장면(훅) → 몸의 반응 → 까닭 → 오늘의 주문 → 저녁에 떠올릴 것
// 감정 이름 대신 몸의 반응으로, 짧은 문장과 긴 문장을 섞어 이어지게
export const STORY4 = {
  비견: ['오늘은 거울 속 나와 똑 닮은 사람이 옆자리에 앉는 날이에요.', '「내가 해 볼게」라는 말이 먼저 튀어나오고, 어깨가 저절로 쭉 펴질 거예요.', '오늘의 주문은 「같이 하면 두 배」, 혼자 다 들기 전에 한 사람에게 먼저 손을 내밀어 보세요.', '잠들기 전에 오늘 누구와 힘을 합쳤는지 한 사람만 떠올려 보세요.'],
  겁재: ['오늘은 지갑이 저 혼자 열리려고 들썩이는 날이에요.', '「이건 꼭 사야 해」 하는 마음에 손가락이 결제 버튼 위에서 한참 머뭇거릴 수 있어요.', '오늘의 주문은 「장바구니는 하룻밤 재우기」, 내일 아침에도 갖고 싶다면 그때 사도 늦지 않아요.', '오늘 밤, 지켜 낸 돈을 숫자로 한번 세어 보세요. 생각보다 뿌듯할 거예요.'],
  식신: ['오늘은 손끝에서 꿀이 뚝뚝 떨어지는 날이에요.', '무언가를 만들거나 맛있는 걸 먹을 때마다 입가에 웃음이 저절로 번질 거예요.', '오늘의 주문은 「작게라도 꺼내 보이기」, 만든 것 하나를 누군가에게 보여 주면 칭찬이 돌아와요.', '다만 야식 앞에서는 젓가락을 한 번 내려놓고, 내일 아침의 가벼운 몸을 떠올려 보세요.'],
  상관: ['오늘은 입이 마음보다 한 발 먼저 달려 나가는 날이에요.', '대화 중에 할 말이 목끝까지 차올라 손끝이 근질거릴 수 있어요.', '오늘의 주문은 「3초 쉬고 칭찬 먼저」, 그러면 같은 말도 화살이 아니라 꽃다발이 돼요.', '잠들기 전에 오늘 3초를 참았던 순간이 있었는지 떠올려 보세요.'],
  편재: ['오늘은 평소 안 가던 골목에서 행운이 손짓하는 날이에요.', '괜히 발걸음이 가벼워지고, 처음 보는 사람과 이야기하는 게 즐거울 거예요.', '오늘의 주문은 「움직이되 지갑은 반만 열기」, 기회는 잡고 큰 결제는 하루 미뤄 두세요.', '오늘 만난 사람이나 들은 정보 하나를 메모해 두면, 다음 달쯤 그게 기회로 돌아올지도 몰라요.'],
  정재: ['오늘은 작은 벽돌을 하나씩 쌓아 올리는 날이에요.', '책상을 정리하거나 할 일을 하나 지울 때마다 가슴 한쪽이 시원해질 거예요.', '오늘의 주문은 「세 가지만 끝내기」, 거창한 계획보다 오늘 끝낼 세 가지가 더 큰 힘이 돼요.', '저녁에 지운 목록을 보면서 스스로에게 「오늘 잘했다」 한마디 해 주세요.'],
  편관: ['오늘은 누군가 내 어깨에 무거운 가방을 하나 더 얹는 날이에요.', '해야 할 일이 줄지어 서 있어 숨이 짧아지고 목덜미가 뻣뻣해질 수 있어요.', '오늘의 주문은 「깊게 세 번 숨 쉬기」, 급할수록 천천히 걸으면 실수가 사라져요.', '오늘 밤은 따뜻한 물로 씻고 평소보다 30분 일찍 누워, 버텨 낸 나를 토닥여 주세요.'],
  정관: ['오늘은 누군가 나를 조용히 지켜보고 있는 날이에요.', '평소보다 자세가 곧아지고, 약속 시간을 몇 번이나 다시 확인하게 될 거예요.', '오늘의 주문은 「10분 먼저」, 약속도 보고도 10분 먼저 하면 믿음이 한 칸 더 쌓여요.', '다만 할 수 없는 부탁까지 다 받았다면, 내일은 정중하게 「이건 어려워요」 한마디를 연습해 보세요.'],
  편인: ['오늘은 머릿속에 작은 탐정이 한 명 들어와 사는 날이에요.', '사소한 것도 그냥 넘기지 못하고, 생각이 꼬리에 꼬리를 물어 눈이 말똥말똥해질 수 있어요.', '오늘의 주문은 「짐작 말고 물어보기」, 궁금한 건 바로 물으면 마음이 금방 가벼워져요.', '잠들기 30분 전에는 휴대폰을 내려놓고, 떠오른 생각을 종이에 한 줄로 적어 두세요.'],
  정인: ['오늘은 보이지 않는 손이 등을 살짝 밀어 주는 날이에요.', '막혔던 일이 누군가의 한마디로 스르르 풀리면서 어깨의 힘이 툭 빠질 거예요.', '오늘의 주문은 「고마움은 바로 전하기」, 짧은 감사 한 줄이 복을 두 배로 불러와요.', '오늘 배운 것 하나를 잠들기 전에 다시 떠올려 보면, 내일의 내가 한 뼘 더 단단해져요.'],
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
  const [hook, body, spell, night] = STORY4[god];
  const cause = el === saju.yongsin ? `오늘 ${PLAIN_GOD[god]}이 들어온 데다, 나에게 가장 필요한 ${EL_NAME[el]} 기운까지 하늘에서 내려와서 그래요.`
    : clash ? `오늘 ${PLAIN_GOD[god]}이 들어오고, 오늘의 ${animal} 기운이 내 사주와 살짝 부딪혀서 그래요.`
      : `오늘 ${PLAIN_GOD[god]}이 들어와서 그래요.`;
  const story = [hook, `${body} ${cause}`, spell, night].join(' ');
  return { head: T.head, mood, story, why, good, watch, think: T.think, act: [...T.do], lucky, low };
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
