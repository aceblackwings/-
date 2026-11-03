// 개운 반영(v0.40, 사용자 컨셉 2026-11-03): 정통 사주·운 점수는 그대로 두고,
// 장착한 부적과 키운 지신(수호신)이 올해운·이달운에 「게임 요소」로 조금씩 힘을 보탠다
// 화면에는 항상 「정통 ○점 · 개운 반영 +n」처럼 나란히 보여 줌(설계 원칙 2). 순수 로직만(테스트: tests/kaiun.test.mjs)

// 부적 종류 → 힘을 보태는 분야 (행운·액막이는 전체에 작게)
export const CHARM_FIELD = { wealth: 'wealth', love: 'love', exam: 'career', health: 'health', luck: 'all', protect: 'all' };
const RARITY_POWER = { common: 1, rare: 1.5, epic: 2, legend: 3, myth: 4 };
// 기간별 반영 비율과 한도 (한 해는 천천히, 한 달은 조금 더 빠르게)
export const PERIOD_RATE = { year: 0.5, month: 0.8 };
export const PERIOD_CAP = { year: 5, month: 8 };
export const FIELDS = ['wealth', 'love', 'career', 'health', 'social'];
const FIELD_KO = { wealth: '재물', love: '애정', career: '직장·학업', health: '건강', social: '대인' };
const TYPE_KO = { protect: '액막이', luck: '행운', wealth: '재물', love: '애정', exam: '합격', health: '건강' };

/**
 * @param equipped 장착한 부적 기록들 · stage 지신 진화 단계(1~14) · yongsin 용신 오행
 * @param opts { pair: 쌍부적 종류|null, five: 오행 완성 여부, fills: { 부적키: 기운 칸 } }
 * @returns { total, fields: {분야: +n}, sources: [{label, amount}] } — 기간 비율 적용 전 「기본 힘」
 */
export function kaiunPower(equipped, stage = 1, yongsin = null, opts = {}) {
  const fields = Object.fromEntries(FIELDS.map((k) => [k, 0]));
  const sources = [];
  for (const r of (equipped || []).filter(Boolean)) {
    let p = RARITY_POWER[r.rarity] || 1;
    if (r.element === yongsin) p += 0.5; // 용신 오행 부적
    const target = CHARM_FIELD[r.type] || 'all';
    if (target === 'all') FIELDS.forEach((k) => { fields[k] += p * 0.6; }); else fields[target] += p;
    sources.push({ label: `${TYPE_KO[r.type] || ''}부`, amount: p, field: target });
  }
  if (opts.pair) { FIELDS.forEach((k) => { fields[k] += k === CHARM_FIELD[opts.pair] ? 1 : 0; }); sources.push({ label: '쌍부적', amount: 1, field: CHARM_FIELD[opts.pair] }); }
  const st = Math.max(0, (stage || 1) - 1) * 0.3; // 지신이 자랄수록 전체에
  if (st) { FIELDS.forEach((k) => { fields[k] += st; }); sources.push({ label: `지신 ${stage}단계`, amount: st, field: 'all' }); }
  if (opts.five) { FIELDS.forEach((k) => { fields[k] += 0.5; }); sources.push({ label: '오행 완성', amount: 0.5, field: 'all' }); }
  // B6 지난해에서 이월된 기운(전체에)
  if (opts.carry) { FIELDS.forEach((k) => { fields[k] += opts.carry / PERIOD_RATE.year; }); sources.push({ label: `지난해 이월 +${opts.carry}`, amount: opts.carry, field: 'all' }); }
  // B2 오행 충전도(쪽지·미션·응원으로 채우는 예전 개운 지수 0~100)도 전체에 조금
  if (opts.charge) { const c = Math.round((opts.charge / 100) * 2 * 10) / 10; if (c) { FIELDS.forEach((k) => { fields[k] += c; }); sources.push({ label: `오행 충전 ${opts.charge}%`, amount: c, field: 'all' }); } }
  const total = FIELDS.reduce((a, k) => a + fields[k], 0) / FIELDS.length;
  return { total, fields, sources };
}

/** 기간 적용: 비율·한도를 걸어 정수로 */
export function kaiunFor(power, period = 'year') {
  const rate = PERIOD_RATE[period]; const cap = PERIOD_CAP[period];
  // 올림: 부적을 하나라도 달면 반드시 +1은 느껴지게(한도는 그대로)
  const r = (v) => Math.min(cap, Math.ceil(Math.round(v * rate * 100) / 100));
  return { total: r(power.total), fields: Object.fromEntries(FIELDS.map((k) => [k, r(power.fields[k])])), cap };
}

/** 정통 점수에 개운을 더한 「개운 반영 점수」(정통 점수는 바꾸지 않고 따로 계산) */
export const withKaiun = (score, plus) => Math.min(98, score + plus);

/** 화면용 한 줄: 「장착한 재물부·지신 3단계 덕분에 올해 개운 +2」 */
export function kaiunLine(power, period = 'year') {
  const k = kaiunFor(power, period);
  const when = period === 'year' ? '올해' : '이달';
  if (!k.total && !Object.values(k.fields).some(Boolean)) return { k, text: `부적을 달고 지신을 키우면 ${when} 운에 개운 기운이 조금씩 더해져요.`, empty: true };
  const names = power.sources.map((x) => x.label).join('·');
  const best = FIELDS.reduce((a, b) => (k.fields[b] > k.fields[a] ? b : a));
  return { k, text: `${names} 덕분에 ${when} 운에 개운 +${k.total}${k.fields[best] > k.total ? ` (특히 ${FIELD_KO[best]} +${k.fields[best]})` : ''}`, empty: false };
}

/** 분야 문장(책자용): 그 분야에 힘을 보태는 부적이 있으면 한 줄 */
export function fieldKaiunSentence(power, field, period = 'year') {
  const k = kaiunFor(power, period);
  if (!k.fields[field]) return '';
  const src = power.sources.filter((x) => (x.field === field || x.field === 'all') && !x.label.startsWith('지신') && !x.label.startsWith('오행')).map((x) => x.label);
  const who = src.length ? `장착한 ${src.join('·')}` : '키운 지신';
  const c = who.charCodeAt(who.length - 1) - 0xac00;
  return `🧧 ${who}${c >= 0 && c % 28 !== 0 ? '이' : '가'} ${FIELD_KO[field]}운에 개운 +${k.fields[field]}만큼 힘을 보태고 있어요(게임 요소).`;
}

// ---------- B1 나의 개운 그래프(v0.41): 날마다 「개운 반영 올해 점수」를 기록해 추이를 보여 줌 ----------
const dn = (k) => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d); };
/** 그날 값 기록(같은 날은 덮어씀), 최근 365일만 */
export function logKaiun(store, dateKey, entry) {
  const s = { ...(store || {}), [dateKey]: entry };
  const keys = Object.keys(s).sort((a, b) => dn(a) - dn(b));
  keys.slice(0, Math.max(0, keys.length - 365)).forEach((k) => delete s[k]);
  return s;
}
/** 추이: 날짜순 점들 + 첫날 대비 */
export function kaiunTrend(store) {
  const pts = Object.entries(store || {}).sort((a, b) => dn(a[0]) - dn(b[0])).map(([k, v]) => ({ dateKey: k, value: v.base + v.plus, plus: v.plus, base: v.base }));
  if (!pts.length) return { pts, first: null, last: null, gain: 0 };
  const first = pts[0]; const last = pts[pts.length - 1];
  return { pts, first, last, gain: last.plus - first.plus, best: pts.reduce((a, b) => (b.plus > a.plus ? b : a)) };
}

// ---------- B6 한도에 닿은 뒤의 목표(v0.41): 가득 참 표시 + 넘친 기운은 다음 해로 이월(최대 +2) ----------
export const CARRY_MAX = 2;
/** 한도 상태: 넘친 양(기간 비율 적용 뒤)과 다음 해 이월값(넘친 3마다 +1, 최대 2) */
export function capState(power, period = 'year') {
  const raw = power.total * PERIOD_RATE[period]; const cap = PERIOD_CAP[period];
  const over = Math.max(0, raw - cap);
  return { capped: raw >= cap, over: Math.round(over * 10) / 10, carry: Math.min(CARRY_MAX, Math.floor(over / 3) + (raw >= cap ? 1 : 0)) };
}
