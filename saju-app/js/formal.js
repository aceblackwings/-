// 합니다체 변환(2026-11-03 사용자 요청): 풀이 글의 「~요」 끝맺음을 일반 사주 앱처럼 「~니다」로
// 예) 좋은 해예요. → 좋은 해입니다. / 기운이 실려요. → 기운이 실립니다. / 쉬워요. → 쉽습니다.
// 수호신의 편지·쪽지·대사(캐릭터 말투)에는 쓰지 않음. 「~세요」(권유)는 그대로 둠. 순수 로직만(테스트: tests/formal.test.mjs)

const BASE = 0xac00;
const parts = (ch) => { const c = ch.charCodeAt(0) - BASE; return c < 0 || c > 11171 ? null : { L: Math.floor(c / 588), V: Math.floor((c % 588) / 28), T: c % 28 }; };
const join = (L, V, T) => String.fromCharCode(BASE + L * 588 + V * 28 + T);
const T_B = 17; const T_L = 8; // 받침 ㅂ·ㄹ
const withB = (ch, V) => { const p = parts(ch); return join(p.L, V ?? p.V, T_B); };
// 모음 번호: ㅏ0 ㅐ1 ㅓ4 ㅕ6 ㅗ8 ㅘ9 ㅙ10 ㅚ11 ㅜ13 ㅝ14 ㅡ18 ㅣ20
const V = { a: 0, ae: 1, eo: 4, yeo: 6, o: 8, wa: 9, wae: 10, oe: 11, u: 13, wo: 14, eu: 18, i: 20 };

// 통째로 바꾸는 말(불규칙·예외)
const WHOLE = {
  거예요: '것입니다', 이어요: '잇습니다', 나아요: '낫습니다',
  그래요: '그렇습니다', 이래요: '이렇습니다', 저래요: '저렇습니다', 모아요: '모읍니다', 있을게요: '있겠습니다', 물어요: '묻습니다', 늘어요: '늘어납니다',
  커요: '큽니다', 써요: '씁니다', 떠요: '뜹니다', 꺼요: '끕니다', 바빠요: '바쁩니다', 기뻐요: '기쁩니다', 예뻐요: '예쁩니다', 아파요: '아픕니다', 슬퍼요: '슬픕니다', 나빠요: '나쁩니다',
};
// ㅂ 불규칙 형용사의 「~워요」 앞 줄기(쉬워요 → 쉽습니다)
const B_IRREG = ['스러', '헐거', '쉬', '반가', '뜨거', '날카로', '풍요로', '가벼', '무거', '어려', '즐거', '아름다', '고마', '새로', '외로', '부드러', '가까', '매워', '귀여', '두려', '서러', '향기로', '평화로', '자유로', '여유로', '지혜로', '슬기로'];

/** 「~요」로 끝나는 한 단어(구두점 앞) → 합니다체. 바꿀 수 없으면 null */
export function formalWord(w) {
  if (!w.endsWith('요') || w.length < 2) return null;
  const EXACT = ['거예요', '물어요', '모아요', '늘어요']; // 근거예요·증거예요는 「거」가 낱말 끝이라 아래 「예요 → 입니다」로
  for (const [k, v] of Object.entries(WHOLE)) if (w.endsWith(k) && (!EXACT.includes(k) || w === k)) return w.slice(0, -k.length) + v;
  const body = w.slice(0, -1); // 「요」를 뗀 부분
  if (/(고|까|니|터|지)$/.test(body) || body.endsWith('부터')) return null; // ~더라고요·~니까요·~이라니요·~것부터요·~지요는 그대로
  if (body.endsWith('대') && body.length >= 2) { // 온대요 → 온다고 합니다(전해 들은 말)
    const q = parts(body[body.length - 2]); if (q && q.T === 4) return `${body.slice(0, -1)}다고 합니다`;
  }
  if (body.endsWith('세')) return null; // ~세요(권유)는 그대로
  if (body.endsWith('이에')) return `${body.slice(0, -2)}입니다`;
  if (body.endsWith('예')) return `${body.slice(0, -1)}입니다`;
  if (body.endsWith('해')) return `${body.slice(0, -1)}합니다`;
  if (/[이]?게$/.test(body) && body.length >= 2) { // ~ㄹ게요 → ~겠습니다
    const pre = body.slice(0, -1); const last = pre[pre.length - 1]; const p = parts(last);
    if (p && p.T === T_L) return `${pre.slice(0, -1)}${join(p.L, p.V, 0)}겠습니다`;
  }
  const last = body[body.length - 1]; const p = parts(last); if (!p) return null;
  const stem = body.slice(0, -1);
  // 따로 떨어진 「아/어」: 좋아요·넓어요·바뀌어요·알아요
  if ((last === '아' || last === '어') && stem.length) {
    const s = stem[stem.length - 1]; const sp = parts(s); if (!sp) return null;
    if (sp.T === T_L) return `${stem.slice(0, -1)}${join(sp.L, sp.V, T_B)}니다`; // 알아요 → 압니다
    if (sp.T) return `${stem}습니다`; // 좋아요 → 좋습니다, 했어요 → 했습니다
    return `${stem.slice(0, -1)}${join(sp.L, sp.V, T_B)}니다`; // 바뀌어요 → 바뀝니다
  }
  // 르 불규칙: 흘러요 → 흐릅니다, 달라요 → 다릅니다
  if ((last === '라' || last === '러') && stem.length) {
    const s = stem[stem.length - 1]; const sp = parts(s);
    if (sp && sp.T === T_L) return `${stem.slice(0, -1)}${join(sp.L, sp.V, 0)}릅니다`;
  }
  // ㅂ 불규칙: 쉬워요 → 쉽습니다
  if (last === '워' && B_IRREG.some((x) => stem.endsWith(x))) {
    const s = stem[stem.length - 1]; const sp = parts(s); return `${stem.slice(0, -1)}${join(sp.L, sp.V, T_B)}습니다`;
  }
  if (p.T) return null; // 받침 있는 마지막 글자 + 요(드묾)
  const map = { [V.a]: V.a, [V.eo]: V.eo, [V.yeo]: V.i, [V.wa]: V.o, [V.wo]: V.u, [V.wae]: V.oe, [V.ae]: V.ae, [V.i]: V.i, [V.u]: V.u, [V.o]: V.o };
  if (map[p.V] === undefined) return null;
  return `${stem}${withB(last, map[p.V])}니다`; // 실려→실립, 가→갑, 와→옵, 줘→줍, 돼→됩, 내→냅
}

/** 문장 안의 「~요.」「~요!」「~요?」를 모두 합니다체로 (구두점이 붙은 끝맺음만) */
export function formal(text) {
  return String(text).replace(/([가-힣]+)요([.!?])/g, (m, w, punct, off) => {
    if (punct === '?') {
      if (w.endsWith('나')) { const st = w.slice(0, -1); return `${st}습니까?`; } // 있었나요? → 있었습니까?
      return m; // 될까요? 등은 그대로
    }
    if (w.endsWith('들어') && /(말|소리|이야기|얘기)[을를]\s*(함께\s*|자주\s*|많이\s*)?$/.test(String(text).slice(Math.max(0, off - 14), off))) return `${w.slice(0, -2)}듣습니다${punct}`; // 말을 들어요 → 듣습니다
    const r = formalWord(`${w}요`);
    return r ? `${r}${punct}` : m;
  });
}
export const hasPoliteYo = (t) => /[가-힣]요[.!]/.test(t);
