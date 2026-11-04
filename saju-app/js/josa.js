// 조사 붙이기 · 맞춤법 검사(2026-11-04, 사용자 의견 「글을 읽다 보면 오타가 가끔 보여요」)
// - 받침 판단: 한글은 마지막 글자, 한자는 바로 뒤 괄호 속 읽기(「火(화)」 → 화), 숫자는 우리말 읽기(8 → 팔)
// - josa(word, '이/가') 처럼 쓰면 받침에 맞는 쪽을 붙여 준다. 「을(를)」 같은 괄호 표기는 쓰지 않는다
// - josaProblems(text): 화면 글에서 틀린 조사(받침 뒤 「예요」, 받침 없는 글자 뒤 「이에요·은·을·으로」, 받침 뒤 「를」)와
//   괄호 조사 표기를 찾아 돌려준다(테스트 tests/josa.test.mjs가 모든 풀이 글을 검사)

const DIGIT_READ = '영일이삼사오육칠팔구';
const HANJA_READ = {
  木: '목', 火: '화', 土: '토', 金: '금', 水: '수',
  甲: '갑', 乙: '을', 丙: '병', 丁: '정', 戊: '무', 己: '기', 庚: '경', 辛: '신', 壬: '임', 癸: '계',
  子: '자', 丑: '축', 寅: '인', 卯: '묘', 辰: '진', 巳: '사', 午: '오', 未: '미', 申: '신', 酉: '유', 戌: '술', 亥: '해',
};

const code = (ch) => ch.charCodeAt(0) - 0xac00;
const isHangul = (ch) => !!ch && code(ch) >= 0 && code(ch) <= 11171;
/** 그 글자에 받침이 있나: true/false, 판단할 수 없으면 null */
function batchimOfChar(ch) {
  if (isHangul(ch)) return code(ch) % 28 !== 0;
  if (/[0-9]/.test(ch)) return batchimOfChar(DIGIT_READ[Number(ch)]);
  if (HANJA_READ[ch]) return batchimOfChar(HANJA_READ[ch]);
  if (/[a-zA-Z]/.test(ch)) return /[lmnr]/i.test(ch);
  return null;
}
const isReading = (t) => /^[가-힣·\s]{1,12}$/.test(t);
const isRieul = (ch) => isHangul(ch) && code(ch) % 28 === 8;

/** 낱말 끝 받침(괄호 속 읽기·따옴표·꺾쇠는 건너뜀) */
export function lastSound(word) {
  let w = String(word).trim().replace(/[」』"'”’》>\]]+$/u, '');
  // 「火(화)」·「庚금」처럼 괄호 속 한글이 읽기이면 그것으로
  const paren = w.match(/\(([^()]*)\)$/);
  // 괄호 속이 읽기(「火(화)」·「(중화)」 같은 한글 낱말)일 때만 그것으로, 날짜·설명이면 괄호 앞 낱말로
  if (paren) { const inner = paren[1].trim(); w = isReading(inner) ? inner : w.slice(0, paren.index); }
  const ch = w[w.length - 1];
  return { ch, batchim: ch ? batchimOfChar(ch) : null, rieul: isRieul(ch) };
}
export const hasBatchim = (word) => !!lastSound(word).batchim;

/** josa('火(화)', '이에요/예요') → '火(화)예요' */
export function josa(word, pair) {
  const [a, b] = pair.split('/');
  const s = lastSound(word);
  if (pair === '으로/로') return `${word}${s.batchim && !s.rieul ? '으로' : '로'}`;
  return `${word}${s.batchim ? a : b}`;
}
export const iyeyo = (w) => josa(w, '이에요/예요');
/** 조사만: tailJosa('수', '이에요/예요') → '예요' (글자를 <b>로 감쌀 때) */
export const tailJosa = (w, pair) => josa(w, pair).slice(String(w).length);

// 받침 없는 글자 뒤에 「은·을」이 와도 맞는 낱말(이름·한자어) — 검사에서 빼 줌
const OK_EUN = /(가을|마을|고을|모을|이을|지을|나을|부을|그을|저을|다은|지은|보은|고은|하은|서은|예은|시은|채은|소은|나은|유은|리은|가은|수은|아은|도은|태은)$/;

/** 틀린 조사 찾기 → [{at, text, why}] */
export function josaProblems(text) {
  const out = [];
  const T = String(text);
  const push = (i, why) => out.push({ at: i, text: T.slice(Math.max(0, i - 12), i + 6), why });
  for (const m of T.matchAll(/(을\(를\)|를\(을\)|이\(가\)|가\(이\)|은\(는\)|는\(은\)|와\(과\)|과\(와\)|\(으\)로|이\)?에요\(예요\))/g)) push(m.index, '괄호 조사 표기');
  for (const m of T.matchAll(/([가-힣0-9木火土金水甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]\)?)(이에요|예요)/gu)) {
    let i = m.index; let ch = m[1].replace(')', '');
    if (m[1].endsWith(')')) { const open = T.lastIndexOf('(', i); const inner = T.slice(open + 1, i + 1).replace(')', ''); ch = isReading(inner) ? inner[inner.length - 1] : T[open - 1]; }
    const b = batchimOfChar(ch); if (b == null) continue;
    if (m[2] === '예요' && b) push(m.index, '받침 뒤에는 「이에요」');
    if (m[2] === '이에요' && !b) push(m.index, '받침 없는 글자 뒤에는 「예요」');
  }
  for (const m of T.matchAll(/([가-힣])(은|을|를|으로)(?=[\s,.!?·」』)]|$)/gu)) {
    const b = batchimOfChar(m[1]);
    const before = T.slice(Math.max(0, m.index - 4), m.index + 1);
    if ((m[2] === '은' || m[2] === '을') && !b && !OK_EUN.test(before + m[2])) push(m.index, `받침 없는 글자 뒤에는 「${m[2] === '은' ? '는' : '를'}」`);
    if (m[2] === '를' && b) push(m.index, '받침 뒤에는 「을」');
    if (m[2] === '으로' && (!b || isRieul(m[1]))) push(m.index, '받침 없는 글자·ㄹ 받침 뒤에는 「로」');
  }
  return out;
}
