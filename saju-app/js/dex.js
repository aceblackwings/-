// 12띠 관계 수집 도감 (순수 로직)
// - 내 띠 칸은 처음부터 열림: "이미 시작했다"는 느낌(부여된 진척)으로 완성 동기를 만든다
// - 끝이 정해진 12칸: 끝이 보이는 수집이 열린 수집보다 동기가 강하다
// - 마일스톤 보상(3·6·9·12띠), 새 띠 발견 +20 EXP, 전설의 조합 발견 +30 EXP (각 1회)
import { branchRelation } from './compat.js';
import { legendPartners } from './pairtalk.js';

export const RELATION_TYPES = [
  { type: 'samhap', label: '삼합', color: '#ff4d8d' },
  { type: 'yukhap', label: '육합', color: '#ffc93c' },
  { type: 'same', label: '같은 띠', color: '#39ff88' },
  { type: 'normal', label: '평이', color: '#9a94c4' },
  { type: 'wonjin', label: '원진', color: '#c77dff' },
  { type: 'chung', label: '충', color: '#00e5ff' },
];

export const MILESTONES = [
  { count: 3, title: '새싹 인맥러', reward: '희귀 인연부', rarity: 'rare' },
  { count: 6, title: '인맥 수호자', reward: '영웅 인연부', rarity: 'epic' },
  { count: 9, title: '십이지 외교관', reward: '전설 인연부', rarity: 'legend' },
  { count: 12, title: '12지신의 벗', reward: '신화 인연부 + 12지신 완성 칭호', rarity: 'myth' },
];

export function emptyDex() {
  return { seen: [], legends: [], claimed: [] };
}

/**
 * @param me 내 띠(0~11)
 * @param friends [{name, branch}]
 * @param dex 저장된 도감 상태
 */
export function computeDex(me, friends, dex = emptyDex()) {
  const legendSet = new Set(legendPartners(me));
  const byBranch = new Map();
  friends.forEach((f) => {
    if (!byBranch.has(f.branch)) byBranch.set(f.branch, []);
    byBranch.get(f.branch).push(f.name);
  });

  const entries = Array.from({ length: 12 }, (_, b) => {
    const names = byBranch.get(b) || [];
    const unlocked = b === me || names.length > 0;
    return { branch: b, unlocked, isMe: b === me, friends: names, relation: branchRelation(me, b), legend: legendSet.has(b), legendFound: legendSet.has(b) && names.length > 0 };
  });

  const count = entries.filter((e) => e.unlocked).length;
  const relationsFound = new Set(entries.filter((e) => e.friends.length).map((e) => e.relation.type));
  const legendsTotal = legendSet.size;
  const legendsFound = entries.filter((e) => e.legendFound).length;

  const newSeen = entries.filter((e) => e.friends.length && !e.isMe && !dex.seen.includes(e.branch)).map((e) => e.branch);
  const newLegends = entries.filter((e) => e.legendFound && !dex.legends.includes(e.branch)).map((e) => e.branch);
  const milestones = MILESTONES.map((m) => ({ ...m, reached: count >= m.count, claimed: dex.claimed.includes(m.count) }));
  const title = [...milestones].reverse().find((m) => m.claimed)?.title || null;
  const nextMilestone = milestones.find((m) => !m.reached) || null;

  return {
    entries, count, total: 12,
    relations: RELATION_TYPES.map((r) => ({ ...r, found: relationsFound.has(r.type) })),
    legendsTotal, legendsFound,
    newSeen, newLegends,
    milestones, title, nextMilestone,
    expGain: newSeen.length * 20 + newLegends.length * 30,
  };
}

/** 발견 보상을 반영한 새 도감 상태 */
export function recordDiscoveries(dex, result) {
  return {
    ...dex,
    seen: [...new Set([...dex.seen, ...result.newSeen])],
    legends: [...new Set([...dex.legends, ...result.newLegends])],
  };
}

export function claimMilestone(dex, result, count) {
  const m = result.milestones.find((x) => x.count === count);
  if (!m || !m.reached || m.claimed) return { dex, reward: null };
  return { dex: { ...dex, claimed: [...dex.claimed, count] }, reward: m };
}
