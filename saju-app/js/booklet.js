// 신년운세 책자(첫 화면 개편 1단계, 2026-11-03): 게이지·별 없이 「읽는」 한 해 풀이
// 총운을 여러 문단으로 자세히(한 해의 기운 → 내 사주와 만나는 방식 → 10년 큰 흐름 속 → 타고난 그릇과 올해 → 한 해의 모양 → 잘 풀리는 점·챙길 점 → 한 해의 열쇠)
// 그 아래 분야별 풀이(재물·직장·애정·건강·대인). 모든 값은 period.js yearOf·saju·격국에서 나온다(같은 날짜면 같은 글)
// 순수 로직만(테스트: tests/booklet.test.mjs)
import { josa, iyeyo } from './josa.js';
import { GOD_READING, partsStory, crossLine, turnLine } from './reading.js';
import { YEAR_HEADLINE, seasonsOf, keyMonths, monthRange } from './yearcard.js';
import { categoryScores } from './period.js';
import { ELEMENT_LUCK } from './fortune.js';
import { STEMS_KO, BRANCHES_KO, STEMS, BRANCHES, ANIMALS, ELEMENT_KO, ELEMENT_HANJA, STEM_ELEMENT, BRANCH_MAIN_STEM, tenGod } from './saju.js';
import { GYEOK_PROFILE } from './gyeokguk.js';
import { incomingRelations, POS, POS_MEAN } from './relations.js';
import { STEM_IMAGE, stemLabel } from './johu.js';
import { yearChecks, pickChecks } from './yearcheck.js';

const COLOR = ['푸른', '붉은', '노란', '흰', '검은'];
const GROUP = { 비견: 0, 겁재: 0, 식신: 1, 상관: 1, 편재: 2, 정재: 2, 편관: 3, 정관: 3, 편인: 4, 정인: 4 };
const GROUP_NAME = ['나와 같은 기운(비겁)', '재능을 펼치는 기운(식상)', '결실을 거두는 기운(재성)', '책임과 자리의 기운(관성)', '배움과 도움의 기운(인성)'];
const GYEOK_GROUP = { 건록격: 0, 양인격: 0, 월겁격: 0 };
const mod = (n, m) => ((n % m) + m) % m;
const el = (e) => `${ELEMENT_HANJA[e]}(${ELEMENT_KO[e]})`;
const hasBatchim = (w) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return c >= 0 && c <= 11171 && c % 28 !== 0; };
const ro = (w) => (hasBatchim(w) && (w.charCodeAt(w.length - 1) - 0xac00) % 28 !== 8 ? '으로' : '로');
const sentence = (t) => { const x = String(t).trim(); return /[.!?]$/.test(x) ? x : `${x}.`; };
// 같은 뜻 문장이 이어지지 않게: 끝맺음(마지막 두 어절)이 같거나 앞 문장에 이미 들어 있는 뒷문장은 뺀다
const tailOf = (t) => t.replace(/[.!?]+$/, '').split(' ').slice(-2).join(' ');
const sentencesOf = (t) => String(t).split(/(?<=[.!?])\s+/).filter(Boolean);
export function joinDistinct(...texts) {
  const out = [];
  for (const t of texts.flatMap(sentencesOf)) {
    const tl = tailOf(t);
    if (out.some((o) => tailOf(o) === tl || o.includes(t.replace(/[.!?]+$/, '')))) continue;
    out.push(t);
  }
  return out.join(' ');
}

export const FIELD_ORDER = [
  ['wealth', '재물운'], ['business', '사업운'], ['career', '직장·학업운'], ['love', '애정운'], ['family', '가족운'], ['children', '자녀운'], ['health', '건강운'], ['social', '대인운'],
];
// 사업운(v0.42): 그해 십신 무리별 사업 흐름 [비겁·식상·재성·관성·인성]
const BIZ_GROUP = [
  { line: '함께하는 사람의 힘이 커지는 해예요. 동업·협력으로 판을 키우기 좋고, 돈과 역할은 처음부터 글로 정해 두면 오래 갑니다.', act: '함께 일하는 사람과 역할·수익 나누기를 한 장에 적기', mod: 0 },
  { line: '아이디어가 곧 매출이 되는 해예요. 새 상품·새 서비스·온라인 판매처럼 내 솜씨를 드러내는 일이 잘 풀려요.', act: '팔고 싶은 것 하나를 사진과 한 줄 소개로 올려 보기', mod: 4 },
  { line: '돈의 흐름이 활발해지는 해예요. 거래처를 넓히고 판로를 늘리기 좋고, 들어오는 만큼 장부 정리를 꼼꼼히 하면 더 크게 남아요.', act: '이번 달 들어온 돈·나간 돈을 한 표로 정리하기', mod: 3 },
  { line: '틀을 갖추는 해예요. 사업자·허가·계약·규정처럼 공식적인 일을 정비하면 신뢰가 쌓여 큰 거래로 이어져요.', act: '미뤄 둔 서류·신고 하나 처리하기', mod: -1 },
  { line: '배우고 준비하는 힘이 실리는 해예요. 자격증·교육·문서 계약이 사업의 바탕이 되고, 서두르지 않는 준비가 내년의 매출을 만들어요.', act: '사업에 도움 될 공부 하나 신청하기', mod: -1 },
];
// 자녀운(v0.42): 자녀 자리 = 여성은 식상, 남성은 관성. 그해 십신 무리가 자녀 자리와 어떤 관계인지
const CHILD_GROUP = [
  '나와 아이가 친구처럼 나란히 서는 해예요. 함께하는 취미나 운동이 사이를 가깝게 해 줘요.',
  '아이를 챙기고 가르칠 일이 많아지는 해예요. 잔소리 대신 칭찬과 대화가 아이의 재능을 키워요.',
  '아이의 학원·용돈·진로처럼 돈이 드는 계획이 화제가 되는 해예요. 미리 계획을 세우면 오히려 든든해요.',
  '아이가 규칙과 책임을 배우는 해예요. 스스로 정한 약속을 지키도록 믿고 기다려 주면 한 뼘 자라요.',
  '아이가 배우고 생각이 깊어지는 해예요. 책·공부·시험에서 좋은 소식이 오기 쉬워요.',
];
const FIELD_ACT = {
  wealth: '저축 계획·지출 정리·중요한 계약은 이 달에 맞춰 보세요.',
  career: '지원·발표·면접·새 업무 제안은 이 달에 꺼내 보세요.',
  love: '고백·기념일·함께 가는 여행은 이 달에 잡아 보세요.',
  health: '운동 시작·건강검진 예약·생활 습관 바꾸기는 이 달에 해 보세요.',
  social: '모임·오랜만의 연락·도움 부탁은 이 달에 해 보세요.',
};
// 분야별 조심할 점(2026-11-04 사용자 의견 「좋은 말만 하지 말고 조심할 부분도」): 그해 십신 무리 [비겁·식상·재성·관성·인성] → 장면 + 대비
export const FIELD_WATCH = {
  wealth: ['지인·가족과 돈이 오가기 쉬워요. 빌려준 돈은 늦게 돌아오기 쉬우니 금액과 날짜를 글로 남겨 두세요.', '버는 만큼 쓰고 싶은 마음도 커져요. 취미·자기 계발 지출이 쌓이기 쉬우니 한 달 상한을 정해 두세요.', '큰돈이 보이면 서두르기 쉬워요. 「원금 보장·고수익」 제안은 하루 넘겨 다시 보고, 투자는 잃어도 괜찮은 돈으로만 하세요.', '세금·벌금·관리비처럼 의무로 나가는 돈이 늘기 쉬워요. 신고 마감일을 달력에 적어 두면 가산세를 막을 수 있어요.', '돈보다 공부·준비에 마음이 가서 수입이 잠시 줄 수 있어요. 고정비를 먼저 줄여 두면 버틸 힘이 생겨요.'],
  business: ['동업자와 몫을 두고 서운해지기 쉬워요. 수익 배분과 역할은 처음부터 계약서로 남겨 두세요.', '아이디어가 많아 일을 너무 넓히기 쉬워요. 새 상품은 하나만 먼저 시험해 보고 넓히세요.', '매출은 늘어도 외상·미수금이 쌓이기 쉬워요. 받을 돈 목록을 매주 한 번 확인하세요.', '허가·규정·세무 점검이 깐깐해지기 쉬워요. 장부와 영수증을 미리 정리해 두면 걱정 없어요.', '준비만 하다 시기를 놓치기 쉬워요. 「언제까지 준비하고 언제 연다」 날짜를 먼저 정해 두세요.'],
  career: ['같은 자리를 두고 동료와 경쟁하기 쉬워요. 내 성과를 숫자로 적어 두면 평가 때 힘이 돼요.', '맞는 말이라도 세게 하면 윗사람과 부딪히기 쉬워요. 건의는 대안과 함께 글로 전하세요.', '눈앞의 수입 때문에 이직·부업을 서두르기 쉬워요. 옮기기 전에 조건을 글로 나란히 비교해 보세요.', '책임이 커지면서 실수 하나가 크게 보이기 쉬워요. 중요한 보고와 마감은 하루 일찍 끝내 두세요.', '생각이 많아 결정을 미루기 쉬워요. 지원·시험은 접수 마감일부터 달력에 적어 두세요.'],
  love: ['친구나 다른 사람이 끼어들어 마음이 흔들리기 쉬워요. 둘 사이 일은 둘이 먼저 이야기하세요.', '솔직함이 지나쳐 상처가 되기 쉬워요. 서운한 말은 「나는 ~해서 속상했어」처럼 바꿔 말해 보세요.', '선물·데이트 비용으로 마음을 확인하려 하기 쉬워요. 돈보다 함께 보내는 시간이 오래가요.', '책임감이나 체면 때문에 속마음을 숨기기 쉬워요. 하고 싶은 말은 한 번에 한 가지씩 꺼내 보세요.', '상대에게 기대거나, 반대로 혼자 짐작만 길어지기 쉬워요. 궁금한 건 짐작하지 말고 물어보세요.'],
  family: ['형제·친척과 돈이나 역할 문제로 서운해지기 쉬워요. 부모님 일은 형제끼리 분담표를 만들어 두세요.', '아이·아랫사람에게 잔소리가 늘기 쉬워요. 하고 싶은 말은 하루 하나로 줄여 보세요.', '집·살림 지출로 의견이 갈리기 쉬워요. 큰 지출은 가족 회의를 한 번 거쳐 정하세요.', '집안의 책임이 나에게 몰리기 쉬워요. 혼자 떠안지 말고 역할을 나눠 달라고 말하세요.', '부모님·어른의 건강이나 서류 일을 챙길 일이 생기기 쉬워요. 보험과 검진 일정을 미리 확인해 두세요.'],
  children: ['아이와 고집 대결이 되기 쉬워요. 규칙은 함께 정하고, 지키면 바로 칭찬해 주세요.', '기대가 커져 잔소리가 늘기 쉬워요. 결과보다 노력한 과정을 짚어 칭찬해 주세요.', '학원비·용돈 지출이 생각보다 커지기 쉬워요. 1년 교육비 예산을 먼저 정해 두세요.', '성적·규칙 압박이 아이에게 부담이 되기 쉬워요. 아이 이야기를 끝까지 들어 주는 시간을 정해 두세요.', '아이가 혼자 고민을 품기 쉬워요. 일주일에 한 번 둘만의 대화 시간을 만들어 보세요.'],
  health: ['무리한 운동이나 경쟁으로 다치기 쉬워요. 운동 강도는 조금씩 올리세요.', '먹고 즐기는 일이 늘어 체중과 소화가 흔들리기 쉬워요. 야식은 일주일에 두 번 안으로 줄여 보세요.', '바쁘게 움직이다 끼니와 잠을 거르기 쉬워요. 잠드는 시간을 정해 지켜 보세요.', '스트레스와 과로가 쌓이기 쉬워요. 운전·계단·운동 때 서두르지 말고, 몸이 보내는 신호는 미루지 말고 검진받으세요.', '생각이 많아 잠이 얕아지기 쉬워요. 잠들기 30분 전에는 휴대폰을 내려놓아 보세요.'],
  social: ['자존심 싸움이 되기 쉬워요. 이기려 하기보다 같은 편을 만드는 말을 골라 보세요.', '말이 많아지면서 구설에 오르기 쉬워요. 그 자리에 없는 사람 이야기는 하지 않기로 해요.', '사람 사이에 돈이 끼기 쉬워요. 모임 회비와 나눠 낼 돈은 그때그때 정산하세요.', '윗사람·기관과 갈등이 생기기 쉬워요. 감정보다 사실과 기록으로 이야기하세요.', '도움을 받기만 하고 갚을 때를 놓치기 쉬워요. 받은 도움에는 짧게라도 꼭 고맙다고 전하세요.'],
};
// 책자 한 번 만들 때마다 새로(buildBooklet 첫 줄에서 비움) — 같은 입력이면 늘 같은 글
let watchUsed = new Set();
/** 분야 점수가 가장 낮은 달 → 「⚠️ 조심할 점」 문장 */
function watchPara(y, key, g, scoreOf, used = watchUsed) {
  const list = y.months.map((m, i) => ({ v: scoreOf(m), m, i })).sort((a, b) => a.v - b.v || a.i - b.i);
  const w = list.find((x) => !used.has(x.m.solarMonth) && x.v <= list[0].v + 3) || list[0];
  used.add(w.m.solarMonth);
  return `⚠️ 조심할 점: ${FIELD_WATCH[key][g]} 특히 ${w.m.solarMonth}월(${monthRange(y.months, w.i)})에는 한 번 더 챙겨 보세요.`;
}
// 조심할 달에 붙일 대비(그달 십신별)
const WATCH_ACT = {
  비견: '중요한 결정 전에 믿는 사람 한 명에게 반대 의견을 물어보세요.', 겁재: '돈 빌려주기·보증·공동 투자는 이 달엔 미뤄 두세요.',
  식신: '식사량과 군것질을 줄이고, 미룬 일 하나는 끝내 두세요.', 상관: '윗사람에게 할 말은 하룻밤 자고 글로 정리해 전하세요.',
  편재: '큰 지출·투자는 하루 넘겨 다시 보고 결정하세요.', 정재: '새 제안을 바로 거절하지 말고 하루만 생각해 보세요.',
  편관: '일 욕심을 덜고, 운전·운동 때 속도를 줄이세요.', 정관: '지키기 어려운 약속은 정중히 거절하세요.',
  편인: '걱정은 종이에 적고, 그중 하나만 실행해 보세요.', 정인: '도움받은 일도 마무리는 스스로 정해 끝내 보세요.',
};
// 가입 때 고른 고민(character.js CONCERNS) → 분야
const CONCERN_FIELD = { exam: 'career', job: 'career', wealth: 'wealth', business: 'business', love: 'love', marriage: 'love', health: 'health', people: 'social', change: 'career' };

// 가족운: 그해 십신 무리별 집안 흐름(가족 전체) + 육친(성별에 따라 그 기운이 가리키는 가족)
const FAMILY_GROUP = [
  { line: '형제·친구 같은 가족과 어깨를 나란히 하는 해예요. 집안일을 나눠 맡으면 서로 든든해지고, 가족끼리 돈이 오갈 때는 금액과 날짜를 분명히 해 두면 마음이 편해요.', act: '가족 단체방에 이번 달 할 일 하나씩 나눠 적기' },
  { line: '돌보고 챙겨 주는 마음이 커지는 해예요. 자녀·조카·아랫사람에게 신경 쓸 일이 늘지만, 잔소리보다 칭찬 한마디가 훨씬 멀리 가요.', act: '가족 한 명에게 구체적인 칭찬 한마디 하기' },
  { line: '집안 살림과 돈 이야기가 화제가 되기 쉬운 해예요. 이사·가전·저축처럼 함께 정할 일은 가족 회의로 계획을 세우면 오히려 사이가 단단해져요.', act: '가족과 올해 함께 모을 돈 목표 하나 정하기' },
  { line: '집안에서 맡는 책임이 커지는 해예요. 혼자 다 짊어지기보다 역할을 나누면, 가족이 나를 더 믿고 의지하게 돼요.', act: '집안일 하나를 다른 가족에게 정중히 부탁하기' },
  { line: '부모님·어른의 관심과 도움이 커지는 해예요. 집·계약 같은 문서 일이 생기기 쉽고, 어른께 먼저 안부를 여쭈면 뜻밖의 도움이 돌아와요.', act: '부모님·어른께 안부 전화 한 통 드리기' },
];
// 육친: [여성, 남성] 기준 그 십신 무리가 가리키는 가족
const FAMILY_KIN = [
  ['형제자매·친구', '형제자매·친구'],
  ['자녀', '장모·아랫사람'],
  ['아버지', '배우자·아버지'],
  ['배우자', '자녀'],
  ['어머니', '어머니'],
];

/** 점수를 말로 (숫자는 부풀리지 않고 해석만) */
export function toneOf(score) {
  if (score >= 75) return '기운이 시원하게 뻗는';
  if (score >= 65) return '순풍이 부는';
  if (score >= 55) return '차분히 쌓아 가는';
  if (score >= 45) return '숨을 고르며 다지는';
  return '안을 단단히 채우는';
}

/** 그해 이름: 丁未년 → 붉은 양의 해 */
export const yearName = (p) => `${STEMS[p.stem]}${BRANCHES[p.branch]}년 · ${COLOR[STEM_ELEMENT[p.stem]]} ${ANIMALS[p.branch]}의 해`;

/** 격국과 그해 십신의 만남 */
function gyeokMeet(gyeok, god) {
  const g = GYEOK_GROUP[gyeok.name] ?? GROUP[gyeok.god];
  const y = GROUP[god]; const P = GYEOK_PROFILE[gyeok.name];
  const lead = `타고난 그릇은 ${gyeok.name}, 「${P.title}」이에요.`;
  if (g === y) return `${lead} 올해 들어오는 ${god} 기운이 그릇과 같은 성질이라, 타고난 강점인 ${P.strengths[0]}${hasBatchim(P.strengths[0]) ? '이' : '가'} 그대로 드러나는 해예요. 익숙한 방식으로 밀고 나갈 때 결과가 커져요.`;
  if (mod(g - y, 5) === 1) return `${lead} 올해의 ${GROUP_NAME[y]}이 그릇을 키워 주는 자리라, 그릇이 한 뼘 넓어지는 해예요. 새로 배우거나 맡는 일이 나중에 큰 밑천이 돼요.`;
  if (mod(y - g, 5) === 1) return `${lead} 그릇에 담긴 힘이 올해의 ${GROUP_NAME[y]}${ro(GROUP_NAME[y])} 흘러 나가는 해라, 그동안 쌓은 것을 밖으로 펼쳐 결실로 바꾸기 좋아요.`;
  if (mod(y - g, 5) === 2) return `${lead} 올해의 ${GROUP_NAME[y]}이 그릇을 다듬는 자리라, 조금 버겁게 느껴지는 일이 오히려 그릇을 단단하게 만들어 줘요. ${P.care}`;
  return `${lead} 타고난 강점으로 올해의 ${GROUP_NAME[y]}을 다스리는 해라, ${P.strengths[1]}${hasBatchim(P.strengths[1]) ? '을' : '를'} 살리면 일이 손에 잘 잡혀요.`;
}

/** 조심할 달: 그달 십신의 주의점 + 그에 맞는 대비 */
function cautionMonthLine(y, km) {
  const c = km.find((m) => m.kind === 'caution');
  const m = y.months.find((x) => x.solarMonth === c.month);
  return `${c.month}월(${c.range})에는 ${sentence(GOD_READING[m.god].watch[0])} ${WATCH_ACT[m.god]}`;
}

/** 대운(10년 큰 흐름) 속 그해 */
function daewoonLine(y, name, saju, nextDw) {
  const d = y.daewoon; if (!d) return null;
  const age = y.sajuYear - saju.input.year;
  const extra = [crossLine(d.god, y.year.god), turnLine(age, d, nextDw)].filter(Boolean).join(' ');
  const R = GOD_READING[d.god];
  const gap = y.year.score - d.score;
  return `${name}의 지금 10년 큰 흐름(대운, ${d.startAge}~${d.endAge}세)은 「${R.keyword}」의 시기예요. ${sentence(R.core.split('. ')[0])} ${gap >= 5 ? '그 10년 안에서 이 해는 흐름이 한결 밝게 열리는 해라, 미뤄 둔 일을 꺼내기 좋아요.' : gap <= -5 ? '그 10년 안에서 이 해는 잠시 속도를 늦추고 안을 다지는 해라, 서두르지 않을수록 다음 해가 편해져요.' : '그 10년의 흐름을 고르게 이어 가는 해라, 하던 일을 꾸준히 밀고 나가면 돼요.'} ${extra}`.trim();
}

/** 내 사주와 만나는 방식: 용신·기신, 일지와의 합·충, 조후 글자 */
function meetLines(y, saju) {
  const ps = partsStory(y.year.parts || [], saju);
  const out = [strengthMeet(saju, y.year.god), ...(ps.length ? [ps.join(' ')] : [])];
  const p = y.year.pillar;
  // v0.37 그해 글자와 원국의 관계(합·충·형·파·해·원진): 뜻 + 이렇게 쓰면 좋아요. 점수 근거에 이미 나온 일지 합·충은 겹치지 않게
  const scored = new Set((y.year.parts || []).map((x) => x.kind));
  const rels = incomingRelations(saju.pillars, p, '그해')
    .filter((r) => !(r.at === 'day' && ((r.kind === 'sixCombine' && scored.has('combine')) || (r.kind === 'clash' && scored.has('clash')))))
    .slice(0, 1);
  rels.forEach((r) => out.push(`${r.text} ${r.act}`));
  const js = saju.johu?.stems || [];
  if (js.includes(p.stem)) out.push(`게다가 그해 천간 ${stemLabel(p.stem)}(${STEM_IMAGE[p.stem]})${hasBatchim(stemLabel(p.stem)) ? '은' : '는'} 내 사주의 계절 균형을 맞춰 주는 글자(조후)라, 몸과 마음이 한결 편안해져요.`);
  return out;
}

/** A3 원국 글자 인용: 그해 글자가 내 사주의 어느 자리 글자와 같은지 → 그 자리의 일이 다시 화제가 됨 */
export function quoteLine(y, saju) {
  const p = y.year.pillar; const out = [];
  const ks = ['year', 'month', 'day', 'hour'].filter((k) => saju.pillars[k]);
  const sameStem = ks.filter((k) => k !== 'day' && saju.pillars[k].stem === p.stem);
  const sameBr = ks.filter((k) => saju.pillars[k].branch === p.branch);
  if (sameStem.length) out.push(`그해 천간 ${STEMS[p.stem]}${hasBatchim(STEMS_KO[p.stem]) ? '은' : '는'} 내 ${sameStem.map((k) => POS[k]).join('·')}에도 있는 글자라, ${sameStem.map((k) => POS_MEAN[k]).join(', ')}에 관한 일이 다시 화제가 되기 쉬워요.`);
  if (sameBr.length) out.push(`그해 지지 ${BRANCHES[p.branch]}${hasBatchim(BRANCHES_KO[p.branch]) ? '은' : '는'} 내 ${sameBr.map((k) => POS[k]).join('·')}의 지지와 같아(복음), ${sameBr.map((k) => POS_MEAN[k]).join(', ')}의 일이 한 해 내내 두드러져요.`);
  if (!out.length) return `그해의 ${STEMS[p.stem]}${BRANCHES[p.branch]}${hasBatchim(BRANCHES_KO[p.branch]) ? '은' : '는'} 내 사주 여덟 글자에 없는 새 글자들이라, 지금까지와는 다른 새로운 장면이 열리기 쉬운 해예요.`;
  return out.slice(0, 2).join(' ');
}

/** 신강·신약과 그해 십신: 힘을 받는 해인지, 힘을 쓰는 해인지 */
function strengthMeet(saju, god) {
  const g = GROUP[god]; const support = g === 0 || g === 4;
  const LV = { 극신약: '타고난 기운이 아주 여린 편(극신약)', 신약: '타고난 기운이 여린 편(신약)', 중화신약: '타고난 기운이 고른 편이면서 조금 여린 쪽(중화신약)', 중화: '타고난 기운이 고른 편(중화)', 중화신강: '타고난 기운이 고른 편이면서 조금 센 쪽(중화신강)', 신강: '타고난 기운이 센 편(신강)', 극신강: '타고난 기운이 아주 센 편(극신강)' };
  const me = LV[saju.strengthLevel] || LV[saju.strength];
  if (saju.strength === '신약') return support
    ? `${me}인데, 그해에는 나를 받쳐 주는 ${GROUP_NAME[g]}이 들어와 든든한 뒷배가 생기는 해예요. 혼자 버티던 일에 힘이 실려요.`
    : `${me}인데, 그해에는 ${GROUP_NAME[g]}이 들어와 해야 할 일이 많아지는 해예요. 체력과 시간을 나눠 쓰고, 도움을 청하는 것이 오히려 실력이에요.`;
  if (saju.strength === '신강') return support
    ? `${me}인데, 그해에도 ${GROUP_NAME[g]}이 더해져 힘이 넘치는 해예요. 넘치는 힘을 나누고 베풀수록 운이 돌아와요.`
    : `${josa(me, '이라/라')}, 그해의 ${GROUP_NAME[g]}이 넘치는 힘을 쓸 곳을 만들어 줘요. 일을 벌이고 결과를 내기 좋은 해예요.`;
  return `${josa(me, '이라/라')} 그해의 ${GROUP_NAME[g]}을 무리 없이 받아 쓸 수 있어요. 균형을 지키며 꾸준히 가면 돼요.`;
}

/** 가족운: 애정·대인 점수를 함께 본 흐름 + 그해·속 기운의 가족 자리 */
function familyField(y, god, inner, gender, focus, used) {
  const gi = gender === 'male' ? 1 : 0;
  const c = categoryScores(y.year.score, god); const v = Math.round((c.love + c.social) / 2);
  const g = GROUP[god]; const ig = GROUP[inner];
  const kin = FAMILY_KIN[g][gi]; const ikin = FAMILY_KIN[ig][gi];
  const list = y.months.map((m, i) => { const x = categoryScores(m.score, m.god); return { v: x.love + x.social, m, i }; }).sort((a, b) => b.v - a.v || a.i - b.i);
  const best = list.find((x) => !used.has(x.m.solarMonth) && x.v >= list[0].v - 6) || list[0]; used.add(best.m.solarMonth);
  return {
    key: 'family', label: '가족운', focus, title: `${toneOf(v)} 흐름`,
    paras: [
      FAMILY_GROUP[g].line,
      `육친으로 보면 그해 들어오는 ${god} 기운은 ${kin}의 자리예요. 그래서 ${kin}${hasBatchim(kin) ? '과' : '와'}의 일이 한 해의 중심이 되기 쉬워요.${ig !== g ? ` 바탕에는 ${ikin}의 자리인 ${inner} 기운도 흘러, ${ikin}에게도 마음을 써 주면 집안이 고르게 편안해져요.` : ''}`,
      `가족과 함께하기 좋은 달은 ${best.m.solarMonth}월(${monthRange(y.months, best.i)})이에요. 가족 여행·식사·중요한 의논은 이 달에 잡아 보세요. 올해의 작은 실천: ${FAMILY_GROUP[g].act}.`,
      watchPara(y, 'family', g, (m) => { const x = categoryScores(m.score, m.god); return x.love + x.social; }),
    ],
  };
}

/** 사업운: 재물·직장 점수 + 그해 십신 무리 */
function bizField(y, god, focus, used) {
  const g = GROUP[god]; const c = categoryScores(y.year.score, god); const v = Math.round((c.wealth + c.career) / 2 + BIZ_GROUP[g].mod);
  const list = y.months.map((m, i) => { const x = categoryScores(m.score, m.god); return { v: x.wealth + x.career, m, i }; }).sort((a, b) => b.v - a.v || a.i - b.i);
  const best = list.find((x) => !used.has(x.m.solarMonth) && x.v >= list[0].v - 6) || list[0]; used.add(best.m.solarMonth);
  return {
    key: 'business', label: '사업운', focus, title: `${toneOf(v)} 흐름`,
    paras: [
      BIZ_GROUP[g].line,
      `사업에 가장 힘이 실리는 달은 ${best.m.solarMonth}월(${monthRange(y.months, best.i)})이에요. 새 거래·출시·확장은 이 달에 맞춰 보세요. 직장인이라면 부업·사이드 프로젝트로 읽어도 좋아요.`,
      `올해의 작은 실천: ${BIZ_GROUP[g].act}.`,
      watchPara(y, 'business', g, (m) => { const x = categoryScores(m.score, m.god); return x.wealth + x.career; }),
    ],
  };
}

/** 자녀운: 자녀 자리(여성 식상·남성 관성)와 그해 기운 */
function childField(y, god, gender, focus, used) {
  const g = GROUP[god]; const childG = gender === 'male' ? 3 : 1; const c = categoryScores(y.year.score, god);
  const v = Math.round((c.love + c.social) / 2 + (g === childG ? 3 : 0));
  const list = y.months.map((m, i) => ({ v: categoryScores(m.score, m.god).love + (GROUP[m.god] === childG ? 6 : 0), m, i })).sort((a, b) => b.v - a.v || a.i - b.i);
  const best = list.find((x) => !used.has(x.m.solarMonth) && x.v >= list[0].v - 6) || list[0]; used.add(best.m.solarMonth);
  return {
    key: 'children', label: '자녀운', focus, title: `${toneOf(v)} 흐름`,
    paras: [
      CHILD_GROUP[g],
      g === childG
        ? `그해 들어오는 ${god} 기운이 바로 자녀의 자리라, 아이와 관련된 일이 한 해의 중심이 되기 쉬워요. 아이에게 쓰는 시간이 곧 운을 키우는 시간이에요.`
        : `아이와 함께하기 좋은 달은 ${best.m.solarMonth}월(${monthRange(y.months, best.i)})이에요. 여행·체험·진로 이야기는 이 달에 잡아 보세요.`,
      watchPara(y, 'children', g, (m) => categoryScores(m.score, m.god).love),
      '아직 자녀가 없다면 후배·제자처럼 내가 이끄는 사람이나, 내가 키우는 계획으로 읽으면 돼요.',
    ],
  };
}

/** 분야별 그해 가장 힘이 실리는 달 */
function bestMonthFor(y, key, used = new Set()) {
  const list = y.months.map((m, i) => ({ v: categoryScores(m.score, m.god)[key], m, i })).sort((a, b) => b.v - a.v || a.i - b.i);
  // 분야마다 같은 달만 나오지 않게: 1위와 3점 안쪽이면 아직 안 쓴 달을 고름
  const best = list.find((x) => !used.has(x.m.solarMonth) && x.v >= list[0].v - 3) || list[0];
  used.add(best.m.solarMonth);
  return { month: best.m.solarMonth, range: monthRange(y.months, best.i) };
}

/**
 * 책자 전체
 * @param y yearOf(그해) · thisYear yearOf(올해) · saju · gyeok(analyzeGyeok) · name 부를 이름 · concern 고민 키
 */
export function buildBooklet({ y, thisYear, saju, gyeok, name = '', concern = null, gender = 'female', nextDaewoon = null, calib = null }) {
  watchUsed = new Set();
  const who = name ? `${name} 님` : '당신';
  const god = y.year.god; const R = GOD_READING[god]; const H = YEAR_HEADLINE[god];
  const p = y.year.pillar;
  const inner = tenGod(saju.dayMaster, BRANCH_MAIN_STEM[p.branch]); const I = GOD_READING[inner];
  const me = saju.dayMaster;
  const diff = thisYear ? y.year.score - thisYear.year.score : 0;
  const seasons = seasonsOf(y.months); const best = seasons.find((s) => s.tone === 'best'); const slow = seasons.find((s) => s.tone === 'slow');
  const km = keyMonths(y);
  const L = ELEMENT_LUCK[saju.yongsin];

  const general = [
    // v0.42 사용자 요청 「2027년 대운부터」: 10년 큰 흐름을 맨 앞에
    ...(y.daewoon ? [{ h: '대운 · 10년 큰 흐름 속의 한 해', paras: [daewoonLine(y, who, saju, nextDaewoon)] }] : []),
    {
      h: '한 해의 기운',
      paras: [
        `${y.sajuYear}년은 ${yearName(p)}예요. 일간이 ${stemLabel(me)}(${STEM_IMAGE[me]})인 ${who}에게 그해 천간 ${stemLabel(p.stem)}(${STEM_IMAGE[p.stem]})${hasBatchim(stemLabel(p.stem)) ? '은' : '는'} ${god}, 「${R.keyword}」의 기운으로 들어와요. ${R.core}`,
        inner === god
          ? `바탕에 깔린 지지 ${BRANCHES[p.branch]}도 같은 ${god} 기운이라, 겉과 속이 한 방향을 가리켜요. 올해의 성격이 그만큼 또렷하게 드러나요.`
          : `바탕에 깔린 지지 ${BRANCHES[p.branch]}에는 ${inner}, 「${I.keyword}」의 기운이 흘러요. ${sentence(I.core.split('. ')[0])} 겉으로는 ${R.keyword}, 속으로는 ${I.keyword}${hasBatchim(I.keyword) ? '이' : '가'} 함께 움직이는 해예요.`,
        quoteLine(y, saju),
        `한 해를 한마디로 하면 「${H.title}」, ${toneOf(y.year.score)} 해예요. ${diff > 2 ? `올해(${thisYear.sajuYear}년)보다 흐름이 한결 나아져요.` : diff < -2 ? `올해(${thisYear.sajuYear}년)보다 속도를 조금 늦추면 더 단단해져요.` : `올해(${thisYear?.sajuYear ?? ''}년)와 비슷한 흐름을 차분히 이어 가요.`}`,
      ],
    },
    { h: '내 사주와 만나는 방식', paras: meetLines(y, saju) },
    ...(gyeok ? [{ h: '타고난 그릇과 올해', paras: [gyeokMeet(gyeok, god)] }] : []),
    {
      h: '한 해의 모양',
      paras: [
        `계절로 보면 ${best.label}(${best.months.join('·')}월)에 흐름이 가장 좋아요. 「${best.keyword}」의 기운이 모이는 때라 ${best.advice}${slow ? ` ${slow.label}은 ${slow.word}이라 ${slow.advice}` : ' 큰 굴곡 없이 고르게 흘러가는 한 해예요.'}`,
        `꼭 기억할 달은 ${km.filter((m) => m.kind === 'good').map((m) => `${m.month}월(${m.range})`).join('과 ')}이에요. 중요한 시작·약속·지원은 이때 잡아 보세요. ${cautionMonthLine(y, km)}`,
      ],
    },
    {
      h: '잘 풀리는 점 · 챙길 점',
      paras: [
        `잘 풀리는 점: ${R.good.slice(0, 2).map((t) => sentence(t)).join(' ')}`,
        `챙길 점: ${R.watch.slice(0, 2).map((t) => sentence(t)).join(' ')} 미리 알고 있으면 충분히 다룰 수 있는 것들이에요.`,
      ],
    },
    {
      h: '한 해의 열쇠',
      paras: [
        `${who}에게 가장 필요한 기운은 ${iyeyo(el(saju.yongsin))}. ${L.color} 계열의 물건, ${L.direction} 방향이 한 해 내내 힘이 되고, 행운의 숫자는 ${iyeyo(L.numbers.join('·'))}.`,
        `올해의 실천: ${sentence(R.tips[0])}`,
        ageAction(y.sajuYear - saju.input.year, god),
      ],
    },
  ];

  const cats = categoryScores(y.year.score, god); const icats = categoryScores(y.year.score, inner);
  const focus = CONCERN_FIELD[concern];
  const order = focus ? [FIELD_ORDER.find(([k]) => k === focus), ...FIELD_ORDER.filter(([k]) => k !== focus)] : FIELD_ORDER;
  const used = new Set();
  const fields = order.map(([k, label]) => {
    if (k === 'family') return familyField(y, god, inner, gender, k === focus, used);
    if (k === 'business') return bizField(y, god, k === focus, used);
    if (k === 'children') return childField(y, god, gender, k === focus, used);
    const bm = bestMonthFor(y, k, used);
    const v = Math.round((cats[k] * 2 + icats[k]) / 3);
    return {
      key: k, label, focus: k === focus,
      title: `${toneOf(v)} 흐름`,
      paras: [
        joinDistinct(sentence(R.fields[k]), inner !== god ? sentence(I.fields[k].split('. ')[0]) : ''),
        ageLine(y.sajuYear - saju.input.year, k, god),
        `${label.replace('운', '')}에 가장 힘이 실리는 달은 ${bm.month}월(${bm.range})이에요. ${FIELD_ACT[k]}`,
        watchPara(y, k, GROUP[god], (m) => categoryScores(m.score, m.god)[k]),
      ],
    };
  });

  return {
    year: y.sajuYear, name: yearName(p), title: H.title, score: y.year.score, god,
    lead: `${who}의 ${y.sajuYear}년은 「${H.title}」. ${sentence(R.core.split('. ')[0])}`,
    general, fields,
    // 조심할 점 · 참고할 점: 그해 글자 × 내 원국(사람마다 다름) — 화면은 제목·내용·대비·때를 나눠 보여 줌
    checks: pickChecks(yearChecks(y, saju, { gender, calib })),
    calibText: calib?.n ? calib.text : '',
  };
}

/**
 * 오늘의 운세 (첫 화면, 2026-11-03 사용자 선택: A 수호신의 아침 편지 + C 오늘의 세 가지 질문)
 * 편지 = 수호신 말투(닭띠만 존댓말, 나머지 다정한 반말), 질문 3개 = 돈·연락·결정. 숫자는 그대로 두고 해석과 행동만
 */
const FIELD_KO = { wealth: '재물', love: '애정', career: '일·공부', health: '건강', social: '사람 사이' };
const DOW = '일월화수목금토';
const FIELD_NUDGE = {
  casual: { wealth: '작은 기회가 오면 망설이지 말고 잡아 봐.', love: '마음 가는 사람이 있으면 먼저 한마디 건네 봐.', career: '생각해 둔 의견이 있다면 오늘 꺼내 봐.', health: '가볍게 몸을 움직이면 하루가 더 개운할 거야.', social: '오랜만에 떠오르는 사람에게 안부를 보내 봐.' },
  polite: { wealth: '작은 기회가 오면 망설이지 말고 잡아 보세요.', love: '마음 가는 분이 있으면 먼저 한마디 건네 보세요.', career: '생각해 둔 의견이 있다면 오늘 꺼내 보세요.', health: '가볍게 몸을 움직이면 하루가 더 개운할 거예요.', social: '오랜만에 떠오르는 분께 안부를 보내 보세요.' },
};
const callName = (name, polite) => (!name ? '' : polite ? `${name} 님, ` : `${name}${hasBatchim(name) ? '아' : '야'}, `);
const isWa = (w) => (hasBatchim(w) ? '이' : '');

// 세 가지 질문의 덧붙임 말(해요체). 점수 구간은 fortune.js tierOf와 같음(40·60·80)
const tier = (v) => (v >= 80 ? 3 : v >= 60 ? 2 : v >= 40 ? 1 : 0);
const QA_MORE = {
  wealth: ['결제 버튼 앞에서 열까지 세어 보면 새는 돈이 줄어들어요.', '큰 거래보다 가계부 정리 같은 관리에 힘을 쓰면 좋아요.', '작은 이익이 들어오는 흐름이에요. 정산과 받을 돈을 챙겨 보세요.', '재물 기운이 강하게 들어와요. 좋은 기회가 오면 놓치지 마세요.'],
  love: ['말보다 작은 행동으로 마음을 보여 주면 오해가 풀려요.', '가벼운 안부 한 줄이 관계를 따뜻하게 데워 줘요.', '호감을 얻기 쉬운 날이에요. 먼저 웃으며 다가가 보세요.', '매력이 빛나는 날이에요. 데이트나 고백에도 좋은 기운이에요.'],
  social: ['오늘은 내 말보다 상대 말을 끝까지 들어 주는 쪽이 좋아요.', '약속 시간만 잘 지켜도 신뢰가 쌓여요.', '사람 사이에서 기회가 생겨요. 모임에 얼굴을 비춰 보세요.', '귀한 인연이 다가오는 날이에요. 새로운 만남을 반겨 보세요.'],
};

export function todayLetter(f, { name = '', animal = '', polite = false } = {}) {
  const best = ['wealth', 'love', 'career', 'health', 'social'].reduce((a, b) => (f.scores[b] > f.scores[a] ? b : a));
  const dow = DOW[new Date(Date.UTC(f.date.year, f.date.month - 1, f.date.day)).getUTCDay()];
  const time = f.luck.time.split(' (')[0];
  const T = f.info.title; const P = polite;
  const lines = [
    `${callName(name, P)}오늘은 「${T}」${P ? (hasBatchim(T) ? '이에요' : '예요') : `${isWa(T)}야`}.`,
    `오늘은 ${FIELD_KO[best]}에 힘이 실려${P ? '요' : ''}. ${FIELD_NUDGE[P ? 'polite' : 'casual'][best]}`,
    `${time} 사이가 ${P ? '가장 좋은 시간이에요' : '네 시간이야'}. ${f.luck.color} 소품을 하나 챙겨 ${P ? '가세요' : '가'}.`,
    `「${f.info.caution}」만 한 번 더 ${P ? '살펴 주세요' : '살피자'}.${f.scores.total < 55 ? (P ? ' 조금 느린 하루여도 괜찮아요. 천천히 가도 돼요.' : ' 조금 느린 하루여도 괜찮아. 천천히 가도 돼.') : ''}`,
  ];
  const sign = `— 오늘도 ${P ? '곁에 있는' : '네 편인'} ${animal ? `${animal} ` : ''}수호신`;

  const w = f.scores.wealth; const rel = Math.max(f.scores.love, f.scores.social); const relKey = f.scores.love >= f.scores.social ? 'love' : 'social';
  const c = Math.round((f.scores.career + f.scores.total) / 2);
  const qa = [
    { q: '오늘 돈 써도 될까요?', a: `${w >= 70 ? '좋아요. 필요한 곳이라면 시원하게 쓰셔도 돼요.' : w >= 60 ? '필요한 곳이라면 괜찮아요. 쓰기 전에 한 번만 더 따져 보세요.' : '큰 지출은 하루 미뤄도 좋아요. 오늘은 지키는 쪽이 이득이에요.'} ${QA_MORE.wealth[tier(w)]}` },
    { q: '먼저 연락해도 될까요?', a: `${rel >= 68 ? '좋아요. 먼저 다가가면 반가워할 거예요.' : rel >= 58 ? '짧고 가벼운 안부라면 좋아요.' : '오늘은 듣는 쪽이 더 잘 맞아요. 답장을 기다려 주는 여유를 가져 보세요.'} ${QA_MORE[relKey][tier(f.scores[relKey])]}` },
    { q: '중요한 결정, 오늘 해도 될까요?', a: c >= 70 ? `좋은 날이에요. ${time} 사이를 노려 보세요.` : c >= 60 ? '준비가 됐다면 괜찮아요. 마지막으로 한 번만 확인하고 정하세요.' : '오늘은 정리하는 날로 쓰고, 결정은 흐름이 좋은 날로 옮겨 보세요.' },
  ].map((x) => ({ ...x, a: x.a.trim() }));
  return {
    head: `${f.date.month}월 ${f.date.day}일(${dow})`,
    from: `${animal ? `${animal} ` : ''}수호신의 아침 편지`,
    lines, sign, qa,
    why: `왜 그런지: 오늘 일진 ${f.pillar ? `${STEMS[f.pillar.stem]}${BRANCHES[f.pillar.branch]} · ` : ''}${f.tenGod}의 날 · ${toneOf(f.scores.total)} 하루`,
  };
}

// ---------- A2 나이·처지에 맞춘 문장(v0.41): 같은 기운도 나이에 따라 다르게 나타남 ----------
export const AGE_STAGES = [
  { key: 'teen', max: 19, label: '학생' },
  { key: 'young', max: 29, label: '20대' },
  { key: 'mid', max: 49, label: '30~40대' },
  { key: 'senior', max: 200, label: '50대 이후' },
];
export const ageStage = (age) => AGE_STAGES.find((a) => age <= a.max);
const G_WORD = ['경쟁과 독립', '표현과 재능', '결실과 관리', '규칙과 평가', '배움과 도움'];
// 분야별로 그 나이에 그 기운이 나타나는 모습
const AGE_FIELD = {
  teen: {
    wealth: '학생이라면 이 해의 재물 흐름은 용돈 관리와 갖고 싶은 것을 위해 모으는 습관으로 나타나기 쉬워요.',
    career: '학생이라면 「{g}」의 기운은 시험·성적·진로 고민으로 나타나기 쉬워요.',
    love: '학생이라면 애정운은 설레는 감정보다 친구 사이의 믿음과 마음 나누기로 먼저 나타나요.',
    health: '학생이라면 잠과 자세, 공부하는 자리의 습관이 건강을 가장 크게 좌우해요.',
    social: '학생이라면 반·동아리·학원에서의 관계가 한 해의 분위기를 만들어요.',
  },
  young: {
    wealth: '20대라면 첫 월급·아르바이트·자취처럼 내 돈을 처음 굴리는 경험이 이 해의 재물 흐름이에요.',
    career: '20대라면 「{g}」의 기운은 취업·진로 선택·첫 직장 적응으로 나타나기 쉬워요.',
    love: '20대라면 새로운 만남과 관계의 모양을 정하는 일이 애정운의 중심이에요.',
    health: '20대라면 밤샘·불규칙한 식사를 줄이는 것만으로 체력이 크게 달라져요.',
    social: '20대라면 앞으로 오래 갈 인맥이 이 해에 만들어지기 쉬워요.',
  },
  mid: {
    wealth: '30~40대라면 저축·대출·집처럼 가정의 큰 살림이 이 해 재물 흐름의 중심이에요.',
    career: '30~40대라면 「{g}」의 기운은 승진·이직·책임이 커지는 일로 나타나기 쉬워요.',
    love: '30~40대라면 배우자·연인과의 생활 리듬, 함께 정하는 큰 결정이 애정운이에요.',
    health: '30~40대라면 쌓인 피로와 스트레스를 그때그때 푸는 습관이 건강의 열쇠예요.',
    social: '30~40대라면 일터와 집안 사이에서 사람 관계의 균형을 잡는 해예요.',
  },
  senior: {
    wealth: '50대 이후라면 모아 둔 것을 지키고 노후를 준비하는 것이 이 해 재물 흐름의 중심이에요.',
    career: '50대 이후라면 「{g}」의 기운은 경험을 나누는 역할, 새로 배우는 일, 명예로 나타나기 쉬워요.',
    love: '50대 이후라면 오래 함께한 사람과의 대화와 서로를 챙기는 마음이 애정운이에요.',
    health: '50대 이후라면 정기 검진과 꾸준한 걷기가 한 해의 운을 받쳐 줘요.',
    social: '50대 이후라면 자녀·친구·이웃과 주고받는 정이 큰 복이 돼요.',
  },
};
// 나이 × 십신 무리 → 그해 할 일 하나
const AGE_ACT = {
  teen: ['친구와 함께하는 스터디나 운동 모임 하나', '좋아하는 과목·취미로 작품 하나 만들기', '용돈 기입장 쓰기', '시간표대로 공부하는 습관 하나', '모르는 것을 선생님께 묻는 습관'],
  young: ['내 이름으로 해 보는 작은 프로젝트', '포트폴리오나 SNS에 내 작업 올리기', '월급의 일부를 자동 저축으로', '자격증이나 공식 시험 하나 도전', '배우고 싶던 강의 하나 끝까지 듣기'],
  mid: ['믿을 만한 동료와 역할 나누기', '내 전문성을 보여 줄 발표·글 하나', '가계 예산과 고정비 점검', '맡은 자리에서 원칙 하나 세우기', '배움에 투자할 시간 따로 떼어 두기'],
  senior: ['오랜 친구와 함께하는 모임', '경험을 글이나 이야기로 남기기', '자산 정리와 노후 계획 점검', '지역·모임에서 맡을 역할 하나', '새로운 취미나 배움 하나 시작'],
};
const GROUP_OF = { 비견: 0, 겁재: 0, 식신: 1, 상관: 1, 편재: 2, 정재: 2, 편관: 3, 정관: 3, 편인: 4, 정인: 4 };
/** 분야 문단에 붙일 나이 문장 */
export function ageLine(age, field, god) {
  const st = ageStage(age); const t = AGE_FIELD[st.key][field]; if (!t) return '';
  return t.replace('{g}', G_WORD[GROUP_OF[god]]);
}
/** 총운 「한 해의 열쇠」에 붙일 나이별 할 일 */
export const ageAction = (age, god) => `${ageStage(age).label}인 지금 이 해에 맞는 한 걸음: ${AGE_ACT[ageStage(age).key][GROUP_OF[god]]}.`;

// ---------- A5 달마다 두 줄(v0.41): 그해 12절기월마다 흐름 한 줄 + 할 일 한 줄 ----------
export function monthLines(y) {
  const sorted = [...y.months].sort((a, b) => b.score - a.score);
  const top = new Set(sorted.slice(0, 3).map((m) => m.solarMonth)); const low = new Set(sorted.slice(-2).map((m) => m.solarMonth));
  return y.months.map((m, i) => {
    const R = GOD_READING[m.god];
    const tone = top.has(m.solarMonth) ? '흐름이 가장 좋은 달 중 하나라' : low.has(m.solarMonth) ? '속도를 늦추고 다지기 좋은 달이라' : '고르게 흘러가는 달이라';
    return {
      month: m.solarMonth, range: monthRange(y.months, i), keyword: R.keyword, mark: top.has(m.solarMonth) ? '🌟' : low.has(m.solarMonth) ? '🍵' : '',
      flow: `「${R.keyword}」의 기운이 들어오는 ${tone} ${sentence(R.good[0])}`,
      act: `할 일: ${sentence(R.tips[i % R.tips.length])}`,
    };
  });
}
