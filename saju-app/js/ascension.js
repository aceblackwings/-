// 승천 진화: 지신의 신수(5단계) 이후 → 오방 신수 5종(6~10) → 상위 신 3종(11~13) → 궁극신(14)
// 각 단계는 특별 능력을 주고, 능력은 누적된다. (모든 수치는 재미를 위한 게임 요소)

export const ASCENSION = [
  { stage: 6, key: 'azure', tier: '오방 신수', name: '청룡(靑龍)', element: 0, color: '#39FF88', level: 45, luck: 80, lifetime: 300,
    ability: '푸른 비늘의 성장', desc: '木 기운 충전 +30% · 직장·학업운 +3', charge: { 0: 0.3 }, cat: { career: 3 } },
  { stage: 7, key: 'vermilion', tier: '오방 신수', name: '주작(朱雀)', element: 1, color: '#FF2E63', level: 55, luck: 82, lifetime: 450,
    ability: '불꽃 깃의 인연', desc: '火 기운 충전 +30% · 애정·대인운 +3', charge: { 1: 0.3 }, cat: { love: 3, social: 3 } },
  { stage: 8, key: 'golden', tier: '오방 신수', name: '황룡(黃龍)', element: 2, color: '#FFC93C', level: 65, luck: 84, lifetime: 600,
    ability: '황금 비늘의 풍요', desc: '土 기운 충전 +30% · 재물운 +3', charge: { 2: 0.3 }, cat: { wealth: 3 } },
  { stage: 9, key: 'white', tier: '오방 신수', name: '백호(白虎)', element: 3, color: '#E0E0FF', level: 75, luck: 86, lifetime: 800,
    ability: '백금 발톱의 수호', desc: '金 기운 충전 +30% · 총운 +2 · 액막이 부적 등급 +1', charge: { 3: 0.3 }, cat: { total: 2 }, protect: true },
  { stage: 10, key: 'black', tier: '오방 신수', name: '현무(玄武)', element: 4, color: '#00E5FF', level: 85, luck: 88, lifetime: 1000,
    ability: '북해 등껍질의 장수', desc: '水 기운 충전 +30% · 건강운 +3', charge: { 4: 0.3 }, cat: { health: 3 } },
  { stage: 11, key: 'sky', tier: '상위 신', name: '천광신(天光神)', element: null, color: '#fff6c8', level: 100, luck: 90, lifetime: 1300,
    ability: '하늘빛 축복', desc: '무료 운명 뽑기 희귀 이상 확정 · 모든 운 +2', cat: { all: 2 }, rareFree: true },
  { stage: 12, key: 'earth', tier: '상위 신', name: '지맥신(地脈神)', element: null, color: '#9be36b', level: 115, luck: 92, lifetime: 1600,
    ability: '땅의 맥', desc: '모든 오행 충전 +20%', chargeAll: 0.2 },
  { stage: 13, key: 'fate', tier: '상위 신', name: '명운신(命運神)', element: null, color: '#c77dff', level: 130, luck: 94, lifetime: 2000,
    ability: '운명의 실', desc: '앞으로 5년 개운 보너스 +4 · 궁합 점수 +3', forecast: 4, compat: 3 },
  { stage: 14, key: 'taeguk', tier: '궁극신', name: '태극신(太極神)', element: null, color: '#ff4d8d', level: 150, luck: 96, lifetime: 2500,
    ability: '태극 순환', desc: '매일 가장 낮은 오행 +5 자동 충전 · 모든 능력 1.2배 · 올해 운 +6', autoCharge: 5, amplify: 1.2, yearBonus: 6 },
];

export const MAX_STAGE = 14;

export function ascensionOf(stage) {
  return ASCENSION.find((a) => a.stage === stage) || null;
}

/** 지금 단계까지 누적된 능력 */
export function abilitiesAt(stage) {
  const got = ASCENSION.filter((a) => a.stage <= stage);
  const amp = got.find((a) => a.amplify)?.amplify || 1;
  const chargeMult = [1, 1, 1, 1, 1];
  let weakBoost = 0;
  const cat = { total: 0, wealth: 0, love: 0, career: 0, health: 0, social: 0 };
  let forecast = 0; let compat = 0; let yearBonus = 0; let autoCharge = 0;
  let rareFree = false; let protect = false;
  got.forEach((a) => {
    if (a.charge) Object.entries(a.charge).forEach(([e, v]) => { chargeMult[e] += v * amp; });
    if (a.chargeAll) chargeMult.forEach((_, e) => { chargeMult[e] += a.chargeAll * amp; });
    if (a.tier === '오방 신수') weakBoost += 0.1 * amp;
    if (a.cat) Object.entries(a.cat).forEach(([k, v]) => {
      if (k === 'all') Object.keys(cat).forEach((c) => { cat[c] += v * amp; });
      else cat[k] += v * amp;
    });
    if (a.forecast) forecast += a.forecast * amp;
    if (a.compat) compat += a.compat * amp;
    if (a.yearBonus) yearBonus += a.yearBonus;
    if (a.autoCharge) autoCharge += a.autoCharge;
    if (a.rareFree) rareFree = true;
    if (a.protect) protect = true;
  });
  Object.keys(cat).forEach((k) => { cat[k] = Math.round(cat[k]); });
  return { list: got, chargeMult, weakBoost, cat, forecast: Math.round(forecast), compat: Math.round(compat), yearBonus, autoCharge, rareFree, protect, amp };
}

/** 다음 승천 조건 */
export function nextAscension(stage) {
  return ASCENSION.find((a) => a.stage === stage + 1) || null;
}

// ---------- 승천 시련: 성장 단계(레벨)와 달리, 오방 신수·상위 신은 "행동"으로 증명해야 한다 ----------
// 꾸준함(연속 출석) · 인연(친구·스티커) · 발걸음(풍수 스팟) · 도감이 승천의 열쇠
export const TRIALS = {
  6: { title: '청룡의 시련 · 새싹의 약속', items: [['streakBest', 7, '7일 연속 출석'], ['friends', 1, '친구 1명과 궁합'], ['spots', 1, '풍수 스팟 1곳 방문']] },
  7: { title: '주작의 시련 · 불꽃의 인연', items: [['streakBest', 14, '14일 연속 출석'], ['friends', 2, '친구 2명'], ['stickers', 5, '스티커 5번 보내기']] },
  8: { title: '황룡의 시련 · 대지의 발걸음', items: [['spots', 3, '풍수 스팟 3곳'], ['friends', 3, '친구 3명'], ['journey', 10, '고민 해결 여정 1장 완주']] },
  9: { title: '백호의 시련 · 수호의 맹세', items: [['streakBest', 30, '30일 연속 출석'], ['spots', 5, '풍수 스팟 5곳'], ['stickers', 12, '스티커 12번']] },
  10: { title: '현무의 시련 · 장수의 지혜', items: [['friends', 5, '친구 5명'], ['stickers', 20, '스티커 20번'], ['journey', 30, '고민 해결 여정 완주']] },
  11: { title: '천광의 시련', items: [['dex', 6, '12띠 도감 6칸'], ['spots', 8, '풍수 스팟 8곳']] },
  12: { title: '지맥의 시련', items: [['dex', 9, '12띠 도감 9칸'], ['spots', 12, '풍수 스팟 12곳']] },
  13: { title: '명운의 시련', items: [['dex', 12, '12띠 도감 완성'], ['stickers', 50, '스티커 50번']] },
  14: { title: '태극의 시련', items: [['streakBest', 100, '100일 연속 출석'], ['friends', 10, '친구 10명']] },
};

export function trialProgress(stage, stats) {
  const t = TRIALS[stage];
  if (!t) return { ok: true, items: [], title: '' };
  const items = t.items.map(([k, need, label]) => ({ key: k, need, label, have: stats[k] || 0, ok: (stats[k] || 0) >= need }));
  return { ok: items.every((x) => x.ok), items, title: t.title };
}

/** 성장 가속: 연속 출석 +2%/일(최대 30%) · 친구 +5%/명(최대 30%) */
export function growthBoost(streak, friends) {
  const s = Math.min(0.3, Math.max(0, streak - 1) * 0.02);
  const f = Math.min(0.3, friends * 0.05);
  return { streak: s, friends: f, total: 1 + s + f };
}
