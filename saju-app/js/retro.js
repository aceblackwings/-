// 지난 일 맞히기(v0.41 A1): 지나간 해 중 사주로 「변화가 컸을 해」를 골라 「그해쯤 ~ 있었나요?」를 묻는다
// 사람들이 「잘 맞힌다」고 느끼는 순간은 지나간 일을 맞힐 때. 답은 기기에만 저장(unmyeong2099.retro)
// 순수 로직만(테스트: tests/retro.test.mjs)
import { yearPillar } from './luck.js';
import { branchPair } from './relations.js';

const KIND = {
  turn: { score: 3, ask: '생활 환경이나 마음가짐이 크게 바뀌는 일이', why: '10년 큰 흐름(대운)이 바뀐 해' },
  clash: { score: 2, ask: '이사·이직·관계 변화처럼 크게 움직인 일이', why: '그해 글자가 내 일지(생활 자리)와 부딪힌(충) 해' },
  combine: { score: 1, ask: '새로운 인연을 만나거나 누군가와 손잡고 시작한 일이', why: '그해 글자가 내 일지와 합(육합)을 이룬 해' },
};

/**
 * 물어볼 지난 해 2~3개 (최근 12년 안, 만 12세 이후, 서로 2년 이상 떨어지게, 가장 「뚜렷한」 해 먼저)
 * @param saju · daewoon computeDaewoon 결과(없어도 됨) · nowYear 올해
 */
export function retroQuestions(saju, daewoon, nowYear, max = 3) {
  const by = saju.input.year; const db = saju.pillars.day.branch;
  const cands = [];
  for (let y = nowYear - 1; y >= nowYear - 12; y--) {
    const age = y - by; if (age < 12) break;
    const kinds = [];
    if (daewoon?.pillars?.some((p) => (p.turnAge ?? p.startAge) === age)) kinds.push('turn');
    const rel = branchPair(yearPillar(y).branch, db);
    if (rel.includes('clash')) kinds.push('clash');
    if (rel.includes('sixCombine')) kinds.push('combine');
    if (!kinds.length) continue;
    const k = kinds.reduce((a, b) => (KIND[b].score > KIND[a].score ? b : a));
    cands.push({ year: y, age, kind: k, score: KIND[k].score + (nowYear - y <= 6 ? 0.5 : 0) });
  }
  const picked = [];
  for (const c of [...cands].sort((a, b) => b.score - a.score || b.year - a.year)) {
    if (picked.length >= max) break;
    if (picked.every((p) => Math.abs(p.year - c.year) >= 2)) picked.push(c);
  }
  return picked.sort((a, b) => b.year - a.year).map((c) => ({ ...c, q: `${c.year}년(${c.age}세)쯤 ${KIND[c.kind].ask} 있었나요?`, why: KIND[c.kind].why }));
}

export const RETRO_ANSWERS = [['yes', '맞아요'], ['some', '조금'], ['no', '아니요']];

/** 답 모음 → 신뢰 문장 (맞으면 「역시」, 아니어도 다독이며 풀이 방식 설명) */
export function retroSummary(questions, answers) {
  const done = questions.filter((q) => answers?.[q.year]);
  if (!done.length) return null;
  const yes = done.filter((q) => answers[q.year] === 'yes').length; const some = done.filter((q) => answers[q.year] === 'some').length;
  const hit = yes + some * 0.5;
  if (done.length < questions.length) return { done: done.length, total: questions.length, text: `${done.length}개 답해 주셨어요. 나머지도 알려 주시면 내 흐름을 더 또렷하게 읽을 수 있어요.` };
  if (hit >= done.length * 0.6) return { done: done.length, total: questions.length, hit, text: `지나간 해 ${done.length}개 중 ${yes}개가 맞았고 ${some}개가 비슷했어요. 내 사주의 흐름이 실제 삶과 잘 맞는 편이에요. 2027년 풀이도 같은 흐름으로 읽었어요.` };
  return { done: done.length, total: questions.length, hit, text: '사주는 일이 「일어난다」기보다 그런 흐름이 「들어온다」는 뜻이라, 마음이나 주변 사람의 변화로 지나갔을 수도 있어요. 기록해 두면 다음 풀이에 함께 참고할게요.' };
}

/**
 * 개인 보정(2026-11-04 정확도 3단계 ⑦): 답한 지난 해마다 「사주가 짚은 종류(교운·충·합)」가 실제로 맞았는지 모아
 * 그 사람에게 잘 맞는 신호는 앞에, 덜 맞는 신호는 뒤에 보여 준다(점수는 그대로 — 원칙 2, 보이는 순서·강조만).
 * 답이 대부분 「아니요」면 태어난 시간·자시 처리를 다시 보도록 다른 계산 후보를 함께 돌려준다.
 * @param answers { 연도: 'yes'|'some'|'no' } · alt [{ label, saju, daewoon }] 다른 계산 후보(선택)
 * @returns { n, hit, rate, weights:{turn,clash,combine}, text, better? }
 */
export function kindsOfYear(saju, daewoon, year) {
  const age = year - saju.input.year; const kinds = [];
  if (daewoon?.pillars?.some((p) => (p.turnAge ?? p.startAge) === age)) kinds.push('turn');
  const rel = branchPair(yearPillar(year).branch, saju.pillars.day.branch);
  if (rel.includes('clash')) kinds.push('clash');
  if (rel.includes('sixCombine')) kinds.push('combine');
  return kinds;
}
const VAL = { yes: 1, some: 0.5, no: 0 };
/** 한 계산 후보가 답과 얼마나 맞나: 짚은 해에 「맞아요」, 안 짚은 해에 「아니요」면 맞음 */
function fitOf(saju, daewoon, answers) {
  let s = 0; let n = 0;
  for (const [y, a] of Object.entries(answers || {})) {
    if (!(a in VAL)) continue; n++;
    const flagged = kindsOfYear(saju, daewoon, Number(y)).length > 0;
    s += flagged ? VAL[a] : 1 - VAL[a];
  }
  return { s, n };
}
export function retroCalib(saju, daewoon, answers, alt = []) {
  const per = { turn: [0, 0], clash: [0, 0], combine: [0, 0] };
  let n = 0; let hit = 0;
  for (const [y, a] of Object.entries(answers || {})) {
    if (!(a in VAL)) continue;
    const kinds = kindsOfYear(saju, daewoon, Number(y));
    if (!kinds.length) continue;
    n++; hit += VAL[a];
    for (const k of kinds) { per[k][0] += VAL[a]; per[k][1] += 1; }
  }
  // 답 1개는 우연일 수 있어 무게를 작게: (맞은 정도 + 기본 1) / (답 수 + 2) → 0.5 근처에서 출발
  const w = (k) => { const [h, c] = per[k]; const r = (h + 1) / (c + 2); return Math.round((0.6 + r * 0.8) * 100) / 100; };
  const weights = { turn: w('turn'), clash: w('clash'), combine: w('combine') };
  const rate = n ? hit / n : null;
  let better = null;
  if (n >= 2 && rate !== null && rate < 0.4 && alt.length) {
    const base = fitOf(saju, daewoon, answers).s;
    const best = alt.map((x) => ({ ...x, fit: fitOf(x.saju, x.daewoon, answers).s })).sort((a, b) => b.fit - a.fit)[0];
    if (best && best.fit >= base + 1) better = { label: best.label, fit: best.fit, base };
  }
  const text = !n ? '' : rate >= 0.6
    ? `지난 일 ${n}개 중 ${hit % 1 ? hit.toFixed(1) : hit}개가 맞아, 이 흐름이 잘 맞는 신호를 앞에 두었어요.`
    : rate >= 0.4 ? `지난 일 답 ${n}개를 반영해, 나에게 더 잘 맞았던 신호를 앞에 두었어요.`
      : `지난 일 답 ${n}개가 사주가 짚은 해와 잘 맞지 않았어요. ${better ? `「${better.label}」으로 계산하면 지난 일과 더 잘 맞아요. 정보 수정에서 한 번 확인해 보세요.` : '태어난 시간을 정확히 알면 다시 확인해 보세요.'}`;
  return { n, hit, rate, weights, text, better };
}
