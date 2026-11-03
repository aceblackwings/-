// 오늘의 미션 3가지(v0.27): 이달 운세에서 이어지는 하루 퀘스트
// ① 오늘의 우산(v0.30, habit.js): 오늘 가장 약한 분야 × 필요한 기운의 행동 하나 (= 오늘의 액땜 미션, 완료하면 액막이 부적 정화)
// ② 돌아보기: (12월이면) 올해 다짐 돌아보기 → 어제 운세 맞았나요?(기록이 있을 때) → 없으면 이달 좋은 날 확인 / 오늘 점수의 근거 보기를 번갈아
// ③ 새 기능 열기: 길잡이 순서(guide.js)대로 하루 한 가지. 다 열면 신수 카드·상담·질문·기록함을 번갈아
// 세 가지를 다 하면 보너스와 함께 「내일 미리보기」가 열려 다음 날로 자연스럽게 이어진다.
// 리뷰 근거(docs/core-saju-review-plan.md 4장): 짧은 매일 습관, 지난 운세 확인, 월운 절입일 표기, 낮은 날에도 행동 하나
// 순수 로직만 둔다(테스트: tests/daymission.test.mjs). 저장 키: unmyeong2099.dmission = {날짜: {check, open, bonus}}

export const DM_KEEP_DAYS = 14;
export const DM_BONUS_EXP = 5;
export const MISSION_KEYS = ['act', 'check', 'open'];

const md = (d) => `${d.month}/${d.day}`;
const dn = (k) => { const [y, m, d] = k.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86400000); };

/** 다 열린 뒤 ③에서 번갈아 권하는 것 */
export const ROTATION = [
  { key: 'cards', icon: '🃏', title: '오늘의 신수 카드 한 장', desc: '오늘 마음에 걸리는 것을 떠올리고 카드 한 장을 뽑아 보세요.', btn: '카드 뽑기', go: 'cards' },
  { key: 'chat', icon: '💬', title: '수호신에게 오늘 이야기하기', desc: '오늘 있었던 일을 한 줄만 들려주세요. 수호신이 기억해 둘게요.', btn: '상담 열기', go: 'chat' },
  { key: 'ask', icon: '🔮', title: '궁금한 운세 하나 물어보기', desc: '오늘 가장 궁금한 분야를 골라 점수와 해 볼 일을 확인해요.', btn: '질문 메뉴 열기', go: 'ask' },
  { key: 'records', icon: '📒', title: '지난 운세 돌아보기', desc: '기록함에서 지난 일주일의 운세와 맞았는지 기록을 살펴봐요.', btn: '기록함 열기', go: 'records' },
];

/**
 * @param ctx {dateKey, month:{term, start, end, theme, best:[{date,score}]}, today:{mission, score},
 *             pending: 어제 기록|null, discovery: guide 단계|null, nextYear, progress:{done,total}, actDone, state:{check,open}}
 * @returns [{key, icon, tag, title, desc, btn, action:{type,...}, done}]
 */
export function buildMissions(ctx) {
  const st = ctx.state || {};
  const day = dn(ctx.dateKey);
  const m = ctx.month;
  // v0.30: ① = 오늘의 우산(habit.js). 우산 정보가 없으면 예전처럼 이달의 실천 문장
  const u = ctx.today.umbrella;
  const act = u ? {
    key: 'act', icon: '☂️', tag: `오늘의 우산 · ${u.areaIcon} ${u.areaLabel} · ${m.term} ${md(m.start)}~${md(m.end)}`,
    title: ctx.today.mission,
    desc: `${u.frame} 완료하면 액막이 부적이 한 단계 맑아져요. 난이도는 오늘 운세 카드에서 바꿀 수 있어요.`,
    btn: '했어요', action: { type: 'self' }, done: !!ctx.actDone,
  } : {
    key: 'act', icon: '🌙', tag: `이달의 실천 · ${m.term} ${md(m.start)}~${md(m.end)}`,
    title: ctx.today.mission,
    desc: `이번 달은 「${m.theme}」의 기운이 흐르는 달이에요. 오늘은 이것 하나만 해 보세요. 완료하면 액막이 부적이 한 단계 맑아져요.`,
    btn: '했어요', action: { type: 'self' }, done: !!ctx.actDone,
  };
  let check;
  if (ctx.pledgeReview) {
    const pr = ctx.pledgeReview;
    check = { key: 'check', icon: '✍️', tag: `돌아보기 · ${pr.year}년 다짐`, title: `${pr.year}년 다짐, 얼마나 이뤘나요?`, desc: `「${pr.text}」`, btn: null, action: { type: 'pledge', year: pr.year }, done: !!st.check };
  } else if (ctx.pending) {
    const p = ctx.pending; const [, pm, pd] = p.dateKey.split('-');
    check = { key: 'check', icon: '📒', tag: '돌아보기 · 어제', title: '어제 운세, 맞았나요?', desc: `${pm}/${pd} ${p.title} · ${p.score}점`, btn: null, action: { type: 'feedback', dateKey: p.dateKey }, done: !!st.check };
  } else if (day % 2 === 0 && m.best?.length) {
    const b = m.best[0];
    check = { key: 'check', icon: '🗓️', tag: '돌아보기 · 이달', title: `이달 가장 좋은 날은 ${md(b.date)}(${b.score}점)`, desc: '좋은 날과 쉬어 갈 날을 확인하고, 중요한 약속은 좋은 날에 잡아 보세요.', btn: '이달 운세 펼치기', action: { type: 'open-month' }, done: !!st.check };
  } else {
    check = { key: 'check', icon: '🔍', tag: '돌아보기 · 오늘', title: `오늘은 왜 ${ctx.today.score}점일까요?`, desc: '어떤 기운이 오늘 점수를 만들었는지 쉬운 말로 확인해 보세요.', btn: '근거 보기', action: { type: 'why' }, done: !!st.check };
  }
  let open;
  // 오늘 이미 연 기능이 있으면 그 기능을 그대로 보여 준다 (완료 뒤 다음 단계 제목으로 바뀌지 않게)
  const opened = st.open && st.openKey ? (ctx.steps || []).find((x) => x.key === st.openKey) : null;
  if (opened || (ctx.discovery && !st.open)) {
    const g = opened || ctx.discovery; const pr = ctx.progress || { done: 0, total: 0 };
    const no = opened ? (ctx.steps || []).filter((x) => x.key !== 'next' || ctx.nextYear).findIndex((x) => x.key === g.key) + 1 : pr.done + 1;
    open = { key: 'open', icon: g.icon, tag: `새 기능 열기 · ${no}/${pr.total}`, title: g.title(ctx.nextYear), desc: g.desc(ctx.nextYear), btn: g.btn, action: { type: 'guide', key: g.key, go: g.go }, done: !!st.open };
  } else {
    const r = (st.open && ROTATION.find((x) => x.key === st.openKey)) || ROTATION[day % ROTATION.length];
    open = { key: 'open', icon: r.icon, tag: '오늘의 한 가지', title: r.title, desc: r.desc, btn: r.btn, action: { type: 'tab', tab: r.go }, done: !!st.open };
  }
  return [act, check, open];
}

/** 미션 하나 완료 (①은 앱의 액땜 저장소가 관리하므로 여기선 check·open만) */
export function markDone(store, dateKey, key, openKey) {
  const s = store || {};
  const cur = s[dateKey] || {};
  if (!['check', 'open'].includes(key) || cur[key]) return { store: s, changed: false };
  const next = { ...s, [dateKey]: { ...cur, [key]: true, ...(key === 'open' && openKey ? { openKey } : {}) } };
  const keys = Object.keys(next).sort((a, b) => dn(a) - dn(b));
  keys.slice(0, Math.max(0, keys.length - DM_KEEP_DAYS)).forEach((k) => delete next[k]);
  return { store: next, changed: true };
}

/** 세 가지 다 했는지, 보너스를 아직 안 받았는지 */
export function allDone(missions) { return missions.every((x) => x.done); }
export function claimBonus(store, dateKey) {
  const s = store || {}; const cur = s[dateKey] || {};
  if (cur.bonus) return { store: s, changed: false };
  return { store: { ...s, [dateKey]: { ...cur, bonus: true } }, changed: true };
}
