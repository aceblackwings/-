// 글자들의 관계(v0.37, 로드맵 E5): 천간합·천간충 + 지지 육합·삼합·반합·충·형·파·해·원진, 천간합의 합화
// 원국 안의 관계(natalRelations)와 들어오는 대운·세운이 원국과 맺는 관계(incomingRelations)
// 문장 규칙(설계 원칙 7): 경고만 두지 않고 「뜻 → 이렇게 쓰면 좋아요(행동 1개)」로 짝지음
// 순수 로직만(테스트: tests/relations.test.mjs)

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
const EL_KO = ['목(木)', '화(火)', '토(土)', '금(金)', '수(水)'];
// 한자 뒤 조사: 읽는 소리의 받침으로 고름
const SK = '갑을병정무기경신임계'; const BK = '자축인묘진사오미신유술해'; const EK = '목화토금수';
const bat = (ch) => { const c = ch.charCodeAt(0) - 0xac00; return c >= 0 && c % 28 !== 0; };
const sJ = (st, a, b) => `${STEMS[st]}${bat(SK[st]) ? a : b}`; // 천간 + 조사
const bJ = (br, a, b) => `${BRANCHES[br]}${bat(BK[br]) ? a : b}`; // 지지 + 조사
const eJ = (el, a, b) => `${EL_KO[el]}${bat(EK[el]) ? a : b}`; // 오행 + 조사
const STEM_EL = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
const BRANCH_MAIN_EL = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4]; // 지지 본기 오행
export const POS = { year: '연주', month: '월주', day: '일주', hour: '시주' };
export const POS_MEAN = { year: '어린 시절·집안 어른', month: '부모·사회·일터', day: '나 자신·배우자', hour: '자녀·아랫사람·노후' };
const ORDER = ['year', 'month', 'day', 'hour'];

// 천간합: [a, b, 합화 오행]
export const STEM_COMBINE = [[0, 5, 2], [1, 6, 3], [2, 7, 4], [3, 8, 0], [4, 9, 1]];
const STEM_CLASH = [[0, 6], [1, 7], [2, 8], [3, 9]];
// 지지
const SIX_COMBINE = [[0, 1, 2], [2, 11, 0], [3, 10, 1], [4, 9, 3], [5, 8, 4], [6, 7, 1]];
const TRIPLE = [[8, 0, 4, 4], [2, 6, 10, 1], [5, 9, 1, 3], [11, 3, 7, 0]]; // [생지, 왕지, 고지, 오행]
const PUNISH3 = [[2, 5, 8], [1, 10, 7]]; // 寅巳申 · 丑戌未
const SELF_PUNISH = [4, 6, 9, 11]; // 辰午酉亥
const BREAK = [[0, 9], [1, 4], [2, 11], [3, 6], [5, 8], [7, 10]];
const HARM = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];
const WONJIN = [[0, 7], [1, 6], [2, 9], [3, 8], [4, 11], [5, 10]];
const has = (list, a, b) => list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

/** 관계 종류별 뜻·행동 (문장은 「~기 쉬워요 → ~면 좋아요」) */
export const REL_INFO = {
  stemCombine: { name: '천간합', mark: '🤝', mean: '마음이 묶이는 약속과 인연이 생기기 쉬워요', act: '함께할 사람에게 먼저 손을 내밀어 보세요' },
  stemClash: { name: '천간충', mark: '⚡', mean: '생각과 생각이 부딪혀 고민이 깊어지기 쉬워요', act: '결정 전에 좋은 점·걱정되는 점을 두 줄씩 적어 보면 길이 보여요' },
  sixCombine: { name: '육합', mark: '🤝', mean: '손발이 맞는 사람과 일이 붙기 쉬워요', act: '협력이나 제안을 먼저 꺼내 보세요' },
  triple: { name: '삼합', mark: '✨', mean: '같은 방향으로 힘이 크게 모여요', act: '오래 미뤄 둔 큰 목표 하나를 꺼내 보세요' },
  half: { name: '반합', mark: '✨', mean: '뜻이 맞는 기운이 하나로 모이기 시작해요', act: '함께할 모임이나 팀을 하나 정해 보세요' },
  clash: { name: '충', mark: '🌊', mean: '이사·이직·관계처럼 움직임과 변화가 생기기 쉬워요', act: '큰 변화는 계획표를 먼저 써 두면 좋은 기회로 바뀌어요' },
  punish: { name: '형', mark: '🔧', mean: '규칙·서류·몸을 한 번 더 다듬게 되는 일이 생기기 쉬워요', act: '계약서·서류는 한 번 더 읽고, 몸이 보내는 신호를 챙기면 충분해요' },
  selfPunish: { name: '자형', mark: '🔧', mean: '스스로를 다그치기 쉬운 기운이에요', act: '하루 하나는 나를 칭찬하는 말을 적어 보세요' },
  break: { name: '파', mark: '🧩', mean: '세워 둔 계획이 한 번쯤 고쳐지기 쉬워요', act: '두 번째 방법(플랜 B)을 하나 준비해 두면 마음이 편해요' },
  harm: { name: '해', mark: '💬', mean: '작은 말이 오해로 번지기 쉬워요', act: '중요한 말은 글로 한 번 더 확인해 보세요' },
  wonjin: { name: '원진', mark: '🌫️', mean: '괜히 서운한 마음이 들기 쉬워요', act: '서운함은 하루 지나 부드럽게 전하면 오히려 가까워져요' },
};
const RANK = ['triple', 'sixCombine', 'stemCombine', 'half', 'clash', 'punish', 'selfPunish', 'stemClash', 'break', 'harm', 'wonjin'];

/** 두 지지 사이 관계 종류들 */
export function branchPair(a, b) {
  const out = [];
  if (has(SIX_COMBINE.map(([x, y]) => [x, y]), a, b)) out.push('sixCombine');
  if (Math.abs(a - b) === 6) out.push('clash');
  if (a !== b && PUNISH3.some((g) => g.includes(a) && g.includes(b))) out.push('punish');
  if ((a === 0 && b === 3) || (a === 3 && b === 0)) out.push('punish'); // 子卯 상형
  if (a === b && SELF_PUNISH.includes(a)) out.push('selfPunish');
  if (has(BREAK, a, b)) out.push('break');
  if (has(HARM, a, b)) out.push('harm');
  if (has(WONJIN, a, b)) out.push('wonjin');
  const tri = TRIPLE.find((g) => g.slice(0, 3).includes(a) && g.slice(0, 3).includes(b) && a !== b);
  if (tri && (a === tri[1] || b === tri[1])) out.push('half'); // 왕지를 낀 두 글자 = 반합
  return out;
}
export function stemPair(a, b) {
  const out = [];
  if (STEM_COMBINE.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) out.push('stemCombine');
  if (has(STEM_CLASH, a, b)) out.push('stemClash');
  return out;
}

/**
 * 합화(合化): 이웃한 천간끼리 합하고, 태어난 달 지지 본기의 오행이 합화 오행과 같으면 그 오행으로 바뀐다고 봄.
 * 일간이 낀 합은 일간을 바꾸지 않음(합만 표시). 반환: { stemEl: { 자리: 오행 }, list: [{ a, b, el, ok, why }] }
 */
export function analyzeHwa(pillars) {
  const mEl = BRANCH_MAIN_EL[pillars.month.branch];
  const stemEl = {}; const list = [];
  for (const [a, b] of [['year', 'month'], ['month', 'day'], ['day', 'hour']]) {
    const pa = pillars[a]; const pb = pillars[b]; if (!pa || !pb) continue;
    const c = STEM_COMBINE.find(([x, y]) => (x === pa.stem && y === pb.stem) || (x === pb.stem && y === pa.stem));
    if (!c) continue;
    const dayIn = a === 'day' || b === 'day';
    const ok = !dayIn && mEl === c[2] && !stemEl[a] && !stemEl[b];
    if (ok) { stemEl[a] = c[2]; stemEl[b] = c[2]; }
    list.push({
      a, b, el: c[2], ok, dayIn,
      text: `${POS[a]} ${sJ(pa.stem, '과', '와')} ${POS[b]} ${sJ(pb.stem, '이', '가')} 합(${STEMS[c[0]]}${STEMS[c[1]]}합 → ${EL_KO[c[2]]})을 이뤄요. ${ok
        ? `태어난 달 ${BRANCHES[pillars.month.branch]}의 기운도 ${eJ(c[2], '이라', '라')} 두 글자가 실제로 ${EL_KO[c[2]]} 기운으로 바뀌어(합화) 오행 비율에 그렇게 반영했어요.`
        : dayIn ? '일간이 낀 합이라 나 자신(일간)은 그대로 보고, 그 글자와 마음이 단단히 묶인 인연으로 풀이해요.'
            : `태어난 달의 기운이 ${eJ(c[2], '이', '가')} 아니라 모양만 합하고 성질은 그대로예요(합이불화).`}`,
    });
  }
  return { stemEl, list };
}

const relText = (k, where) => {
  const R = REL_INFO[k];
  return { kind: k, name: R.name, mark: R.mark, text: `${where} ${R.name}(${R.mark}) — ${R.mean}.`, act: `${R.act}.` };
};

/** 원국 안의 관계 (이웃한 기둥 우선, 중요한 순) */
export function natalRelations(pillars) {
  const out = [];
  const keys = ORDER.filter((k) => pillars[k]);
  for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
    const a = keys[i]; const b = keys[j]; const A = pillars[a]; const B = pillars[b];
    const where = `${POS[a]}(${POS_MEAN[a]})와 ${POS[b]}(${POS_MEAN[b]})의 ${BRANCHES[A.branch]}${BRANCHES[B.branch]}`;
    branchPair(A.branch, B.branch).forEach((k) => out.push({ ...relText(k, where), a, b, near: j - i === 1 }));
    stemPair(A.stem, B.stem).forEach((k) => out.push({ ...relText(k, `${POS[a]}와 ${POS[b]}의 ${STEMS[A.stem]}${STEMS[B.stem]}`), a, b, near: j - i === 1 }));
  }
  // 삼합 세 글자 모두
  TRIPLE.forEach(([x, y, z, el]) => {
    const pos = [x, y, z].map((br) => keys.find((k) => pillars[k].branch === br));
    if (pos.every(Boolean)) out.push({ kind: 'triple', name: '삼합', mark: '✨', text: `${pos.map((k) => POS[k]).join('·')}의 ${BRANCHES[x]}${BRANCHES[y]}${bJ(z, '이', '가')} 삼합 ${EL_KO[el]} 국을 이뤄요 — ${REL_INFO.triple.mean}.`, act: `${REL_INFO.triple.act}.`, near: true });
  });
  // 삼합이 완성되면 그 안의 반합은 겹치므로 뺌
  const full = TRIPLE.filter(([x, y, z]) => [x, y, z].every((br) => keys.some((k) => pillars[k].branch === br)));
  const dup = (r) => r.kind === 'half' && full.some((g) => g.slice(0, 3).includes(pillars[r.a].branch) && g.slice(0, 3).includes(pillars[r.b].branch));
  return out.filter((r) => !dup(r)).sort((p, q) => RANK.indexOf(p.kind) - RANK.indexOf(q.kind) || Number(q.near) - Number(p.near));
}

/**
 * 들어오는 기둥(대운·세운·월운)이 원국과 맺는 관계. label = '그해' 등
 * 일지(나·배우자)와의 관계를 맨 앞에
 */
export function incomingRelations(pillars, incoming, label = '그해') {
  const out = [];
  for (const k of ['day', 'month', 'year', 'hour']) {
    const P = pillars[k]; if (!P) continue;
    const where = `${label}의 ${bJ(incoming.branch, '이', '가')} 내 ${POS[k]}(${POS_MEAN[k]}) ${bJ(P.branch, '과', '와')}`;
    branchPair(incoming.branch, P.branch).forEach((r) => out.push({ ...relText(r, where), at: k }));
    stemPair(incoming.stem, P.stem).forEach((r) => out.push({ ...relText(r, `${label}의 ${sJ(incoming.stem, '이', '가')} 내 ${POS[k]} ${sJ(P.stem, '과', '와')}`), at: k }));
  }
  return out.sort((p, q) => (p.at === 'day' ? -1 : 0) - (q.at === 'day' ? -1 : 0) || RANK.indexOf(p.kind) - RANK.indexOf(q.kind));
}
