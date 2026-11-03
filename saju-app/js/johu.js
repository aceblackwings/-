// 120 조후표(v0.35, 로드맵 E1): 일간 10 × 태어난 달(월지) 12 = 120칸마다 『궁통보감』이 먼저 꼽는 천간(조후 용신)
// 널리 쓰이는 「궁통보감 조후용신 요약표」를 옮김. 칸마다 앞 글자일수록 우선. 전문가 감수 전 자료이므로 검증 세트(verify.js)로 확인한다.
// 천간 번호: 0甲 1乙 2丙 3丁 4戊 5己 6庚 7辛 8壬 9癸 · 지지 번호: 0子 1丑 2寅 … 11亥
const S = (txt) => [...txt].map((c) => '甲乙丙丁戊己庚辛壬癸'.indexOf(c));

// 행 = 일간(甲~癸), 열 = 월지 子丑寅卯辰巳午未申酉戌亥
const ROWS = [
  /* 甲 */ ['丁庚丙', '丁庚丙', '丙癸', '庚丙丁戊己', '庚丁壬', '癸丁庚', '癸丁庚', '癸丁庚', '庚丁壬', '庚丁丙', '庚甲丁壬癸', '庚丁丙戊'],
  /* 乙 */ ['丙', '丙', '丙癸', '丙癸', '癸丙戊', '癸', '癸丙', '癸丙', '丙癸己', '癸丙丁', '癸辛', '丙戊'],
  /* 丙 */ ['壬戊己', '壬甲', '壬庚', '壬己', '壬甲', '壬庚癸', '壬庚', '壬庚', '壬戊', '壬癸', '甲壬', '甲戊庚壬'],
  /* 丁 */ ['甲庚', '甲庚', '甲庚', '庚甲', '甲庚', '甲庚', '壬庚癸', '甲壬庚', '甲庚丙戊', '甲庚丙戊', '甲庚戊', '甲庚'],
  /* 戊 */ ['丙甲', '丙甲', '丙甲癸', '丙甲癸', '甲丙癸', '甲丙癸', '壬甲丙', '癸丙甲', '丙癸甲', '丙癸', '甲丙癸', '甲丙'],
  /* 己 */ ['丙甲戊', '丙甲戊', '丙庚甲', '甲癸丙', '丙癸甲', '癸丙', '癸丙', '癸丙', '丙癸', '丙癸', '甲丙癸', '丙甲戊'],
  /* 庚 */ ['丁甲丙', '丙丁甲', '戊甲壬丙丁', '丁甲庚丙', '甲丁壬癸', '壬戊丙丁', '壬癸', '丁甲', '丁甲', '丁甲丙', '甲壬', '丁丙'],
  /* 辛 */ ['丙戊壬甲', '丙壬戊己', '己壬庚', '壬甲', '壬甲', '壬甲癸', '壬己癸', '壬庚甲', '壬甲戊', '壬甲', '壬甲', '壬丙'],
  /* 壬 */ ['戊丙', '丙丁甲', '庚丙戊', '戊辛庚', '甲庚', '壬辛庚癸', '癸庚辛', '辛甲', '戊丁', '甲庚', '甲丙', '戊丙庚'],
  /* 癸 */ ['丙辛', '丙丁', '辛丙', '庚辛', '丙辛甲', '辛', '庚辛壬癸', '庚辛壬癸', '丁', '辛丙', '辛甲壬癸', '庚辛戊丁'],
];

/** JOHU_TABLE[일간][월지] = 천간 번호 목록(우선순위 순) */
export const JOHU_TABLE = ROWS.map((row) => row.map(S));

/** 천간 하나하나의 모습 (풀이 문장에서 오행보다 구체적으로) */
export const STEM_IMAGE = ['큰 나무', '풀과 꽃', '한낮의 태양', '등불', '큰 산', '기름진 논밭', '단단한 바위·쇠', '빛나는 보석', '큰 강물', '단비·이슬'];

/** 태어난 달의 계절 이름 */
export const MONTH_SEASON = ['한겨울', '늦겨울', '이른 봄', '한봄', '늦봄', '초여름', '한여름', '늦여름', '초가을', '한가을', '늦가을', '초겨울'];

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const STEMS_KO = '갑을병정무기경신임계';
const EL_KO = ['목', '화', '토', '금', '수'];
const elOf = (stem) => Math.floor(stem / 2);
const mod = (n, m) => ((n % m) + m) % m;

/** 조후 처방 천간 목록 */
export const johuStems = (dayStem, monthBranch) => JOHU_TABLE[dayStem]?.[monthBranch] || [];

/** 원하는 오행(물·불)에 맞는 처방 천간: 표에서 그 오행 글자를 먼저, 없으면 양간(壬·丙) */
export function stemForElement(dayStem, monthBranch, el) {
  return johuStems(dayStem, monthBranch).find((s) => elOf(s) === el) ?? el * 2;
}

/** 일간과 처방 글자의 관계에 따른 역할 */
function roleOf(dayStem, stem, monthBranch) {
  const el = elOf(stem); const me = elOf(dayStem);
  const summer = [5, 6, 7].includes(monthBranch); const winter = [11, 0, 1].includes(monthBranch);
  if (el === 4 && summer) return '뜨거운 기운을 식혀 주고';
  if (el === 1 && winter) return '차가운 기운을 데워 주고';
  switch (mod(el - me, 5)) {
    case 0: return '곁에서 힘을 보태 주고';
    case 1: return '안에 쌓인 재능을 밖으로 펼쳐 주고';
    case 2: return '노력을 결실로 거두게 해 주고';
    case 3: return '다듬어 쓸모 있게 만들어 주고';
    default: return '뿌리를 받쳐 북돋아 주고';
  }
}

export const stemLabel = (s) => `${STEMS[s]}${EL_KO[elOf(s)]}`; // 예: 壬수
export const stemLabelKo = (s) => `${STEMS_KO[s]}${EL_KO[elOf(s)]}`; // 예: 임수

/** 처방 문장: 「한여름의 甲목(큰 나무)에게는 癸수(단비·이슬)가 뜨거운 기운을 식혀 주고 …」 */
export function johuSentence(dayStem, monthBranch, stem = johuStems(dayStem, monthBranch)[0]) {
  if (stem == null) return '';
  return `${MONTH_SEASON[monthBranch]}의 ${stemLabel(dayStem)}(${STEM_IMAGE[dayStem]})에게는 ${stemLabel(stem)}(${STEM_IMAGE[stem]})${'이가'[elOf(stem) === 0 || elOf(stem) === 3 ? 0 : 1]} ${roleOf(dayStem, stem, monthBranch)} 균형을 잡아 줘요.`;
}

/** 사주 천간에 처방 글자가 있는지 (연·월·시 천간 = 드러난 글자) */
export function presentIn(stems, prescription) {
  return prescription.filter((s) => stems.includes(s));
}
