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
