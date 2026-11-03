// 부적 돌보기(v0.38): 장착이 「진짜 보상」처럼 느껴지게
// A 장착 연출·수호신 대사 / C 부적 성장(쪽지를 해낼 때마다 장착한 부적에 기운 1칸, 7칸이면 등급 +1)
// D 세트(같은 종류 2장 = 쌍부적 → 쪽지 보상 등급 +1, 오행 다섯 = 오행 완성 칭호) / E 바치기(장착 안 한 부적 → 수호신 성장 점수)
// 조건이 되면 하나씩 열림: A·C 첫 장착부터, D 같은 종류 2장부터, E 부적 10장부터. 순수 로직만(테스트: tests/charmcare.test.mjs)
// 저장 키: unmyeong2099.charmgrow = { [부적 키]: 기운 칸 수 }

export const GROW_FULL = 7;
export const RARITY_ORDER = ['common', 'rare', 'epic', 'legend', 'myth'];
export const RARITY_KO = { common: '일반', rare: '희귀', epic: '영웅', legend: '전설', myth: '신화' };
export const TYPE_KO = { protect: '액막이', luck: '행운', wealth: '재물', love: '애정', exam: '합격', health: '건강' };
export const OFFER_UNLOCK = 10; // 부적이 이만큼 모이면 바치기 열림
const OFFER_EXP = { common: 5, rare: 10, epic: 20, legend: 40, myth: 80 };

/** 부적 기록의 고유 키 (도감·장착에서 같은 부적을 가리킴) */
export const charmKey = (r) => (r ? `${r.type}|${r.theme}|${r.element}|${r.rarity}|${r.dateKey}` : '');
export const labelOf = (r) => `${RARITY_KO[r.rarity]} ${TYPE_KO[r.type] || ''}부`;
const nextRarity = (r) => RARITY_ORDER[Math.min(RARITY_ORDER.length - 1, RARITY_ORDER.indexOf(r) + 1)];

/**
 * C: 쪽지를 해낸 날, 장착한 부적마다 기운 1칸. 7칸이 차면 등급이 오르고 기운은 0부터
 * @returns { store, upgrades: [{ from: 기록, to: 기록 }] }
 */
export function growEquipped(store, equipped) {
  const s = { ...(store || {}) }; const upgrades = [];
  const seen = new Set();
  for (const r of (equipped || []).filter(Boolean)) {
    const k = charmKey(r); if (seen.has(k)) continue; seen.add(k);
    const fill = (s[k] || 0) + 1;
    if (fill >= GROW_FULL && r.rarity !== 'myth') {
      const to = { ...r, rarity: nextRarity(r.rarity) }; to.label = labelOf(to);
      delete s[k]; s[charmKey(to)] = 0; upgrades.push({ from: r, to });
    } else s[k] = Math.min(fill, GROW_FULL);
  }
  return { store: s, upgrades };
}
export const fillOf = (store, r) => (store || {})[charmKey(r)] || 0;

/** 등급이 오른 부적을 도감·장착 목록에서 바꿔 끼움 */
export function replaceCharm(list, from, to) {
  const k = charmKey(from);
  return (list || []).map((r) => (r && charmKey(r) === k ? { ...r, rarity: to.rarity, label: r.label?.startsWith('쪽지 보상') ? `쪽지 보상 ${to.label}` : to.label } : r));
}

/** D: 같은 종류 두 장을 함께 달면 쌍부적 */
export function pairType(equipped) {
  const t = (equipped || []).filter(Boolean).map((r) => r.type);
  return t.length >= 2 && t[0] === t[1] ? t[0] : null;
}
/** D: 도감에 오행 다섯 가지가 모두 있으면 오행 완성 */
export const elementsOwned = (collection) => new Set((collection || []).map((r) => r.element));
export const fiveDone = (collection) => elementsOwned(collection).size >= 5;
/** D가 열리는 때: 같은 종류 부적이 2장 이상 */
export const setUnlocked = (collection) => {
  const c = {}; for (const r of collection || []) c[r.type] = (c[r.type] || 0) + 1;
  return Object.values(c).some((n) => n >= 2);
};
/** 쌍부적이면 쪽지 보상 등급 한 단계 위(전설까지) */
export function boostRarity(rarity, pair) {
  if (!pair) return rarity;
  return RARITY_ORDER[Math.min(3, RARITY_ORDER.indexOf(rarity) + 1)];
}

/** E: 바치기 — 장착하지 않은 부적만. 등급 + 키운 기운만큼 성장 점수 */
export const offerUnlocked = (collection) => (collection || []).length >= OFFER_UNLOCK;
export function offerValue(r, fill = 0) { return OFFER_EXP[r.rarity] + fill * 2; }
export function offerable(collection, equipped) {
  const eq = new Set((equipped || []).filter(Boolean).map(charmKey));
  return (collection || []).map((r, i) => ({ r, i })).filter(({ r }) => !eq.has(charmKey(r)));
}
/** 바친 부적을 도감에서 뺌 (같은 부적이 여러 장이면 고른 칸만) */
export function removeOffered(collection, indexes) {
  const del = new Set(indexes);
  return (collection || []).filter((_, i) => !del.has(i));
}

/** A: 장착할 때 수호신 대사 (부적 종류별, 닭띠는 존댓말) */
const LINES = {
  protect: ['액막이부 고마워! 오늘 하루 궂은 기운은 내가 앞에서 막아 줄게.', '액막이부 고마워요! 오늘 하루 궂은 기운은 제가 앞에서 막아 드릴게요.'],
  luck: ['행운부를 달아 줬구나. 오늘 좋은 기회가 보이면 내가 먼저 알려 줄게.', '행운부를 달아 주셨군요. 좋은 기회가 보이면 제가 먼저 알려 드릴게요.'],
  wealth: ['재물부 고마워! 새는 돈은 막고 들어올 돈은 잘 챙겨 볼게.', '재물부 고마워요! 새는 돈은 막고 들어올 돈은 잘 챙겨 볼게요.'],
  love: ['애정부를 달았더니 마음이 따뜻해져. 소중한 사람과의 일은 내가 더 신경 쓸게.', '애정부를 다니 마음이 따뜻해져요. 소중한 분과의 일은 제가 더 신경 쓸게요.'],
  exam: ['합격부 고마워! 공부하고 준비하는 시간에 내가 옆에서 힘을 보탤게.', '합격부 고마워요! 준비하는 시간에 제가 옆에서 힘을 보탤게요.'],
  health: ['건강부를 달아 줘서 몸이 가벼워졌어. 쉬어야 할 때는 내가 꼭 말해 줄게.', '건강부 덕분에 몸이 가벼워졌어요. 쉬어야 할 때는 제가 꼭 말씀드릴게요.'],
};
export function equipLine(type, polite = false) {
  return (LINES[type] || LINES.luck)[polite ? 1 : 0];
}
