// 캐릭터 성장·진화 시스템 (순수 로직: 저장소는 밖에서 주입)
// 설계 근거
//  - 일일 퀘스트: 매일 다시 올 이유(습관 루프), 하루 상한으로 과몰입 방지
//  - 연속 출석(스트릭): 7일 연속 사용자의 다음 날 재방문이 2.4배 (Duolingo 공개 자료)
//  - 스트릭 보호 부적: 하루 빠져도 기록을 지켜 이탈을 줄임 (Duolingo 스트릭 프리즈 방식)
//  - 진화는 버튼을 눌러 직접 진행: 기대감과 성취감을 사용자가 직접 겪게 함
//  - 다음 단계는 실루엣으로만 공개: 궁금증(호기심 간극)이 목표가 됨

export const STAGES = [
  { stage: 1, level: 1, name: '아기 수호령', desc: '막 알에서 깨어난 아기. 아직은 작고 서툴러요.' },
  { stage: 2, level: 5, name: '견습 수호령', desc: '한복을 갖춰 입고 고민을 돕기 시작해요.' },
  { stage: 3, level: 10, nameM: '수호 무사', nameF: '수호 선녀', desc: '망토와 오행 구슬을 얻어 액운을 막아 내요.' },
  { stage: 4, level: 20, name: '수호신', desc: '머리 위에 광륜이 뜨고 구름을 타고 다녀요.' },
  { stage: 5, level: 35, name: '신수(神獸)', desc: '날개와 금관을 얻은 전설의 존재. 오행이 모두 깨어나요.' },
];

export const QUESTS = [
  { key: 'checkin', label: '출석 체크', exp: 15, icon: '📅' },
  { key: 'fortune', label: '오늘의 운세 확인', exp: 5, icon: '🔮' },
  { key: 'mission', label: '액땜 미션 완료', exp: 25, icon: '🧧' },
  { key: 'charm', label: '부적 만들어 도감에 저장', exp: 10, icon: '📜' },
  { key: 'equip', label: '부적·이모티콘 장착', exp: 5, icon: '🎒' },
  { key: 'share', label: '스토리 카드 공유·저장', exp: 20, icon: '📸' },
];

export const STREAK_REWARDS = [
  { days: 3, label: '희귀 부적 1장', rarity: 'rare' },
  { days: 7, label: '영웅 부적 확정 + 스트릭 보호 부적', rarity: 'epic', freeze: 1 },
  { days: 14, label: '전설 부적 확정', rarity: 'legend' },
  { days: 30, label: '신화 부적 확정 + 한정 칭호', rarity: 'myth' },
];

/** 레벨 L에서 L+1로 가는 데 필요한 경험치 */
export const expToNext = (level) => 20 + 6 * (level - 1);

/** 누적 경험치 → {level, into, need} */
export function levelFromExp(exp) {
  let level = 1; let rest = exp;
  while (rest >= expToNext(level) && level < 99) { rest -= expToNext(level); level += 1; }
  return { level, into: rest, need: expToNext(level) };
}

export function stageForLevel(level) {
  let s = STAGES[0];
  for (const st of STAGES) if (level >= st.level) s = st;
  return s.stage;
}

export function stageName(stage, female) {
  const s = STAGES[stage - 1];
  return s.name || (female ? s.nameF : s.nameM);
}

export function emptyGrowth() {
  return { exp: 0, evolved: 1, quests: {}, streak: { last: null, count: 0, best: 0 }, freeze: 0, claimed: [] };
}

const dayNum = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
};

/**
 * 출석 처리. 하루에 한 번. 연속 출석과 보호 부적을 계산한다.
 * @returns {growth, gained, events[]}
 */
export function checkIn(growth, dateKey) {
  const g = structuredClone(growth);
  const events = [];
  if (g.quests[dateKey]?.checkin) return { growth: g, gained: 0, events };

  const today = dayNum(dateKey);
  const last = g.streak.last ? dayNum(g.streak.last) : null;
  if (last === null) g.streak.count = 1;
  else if (today - last === 1) g.streak.count += 1;
  else if (today - last === 2 && g.freeze > 0) {
    g.freeze -= 1; g.streak.count += 1;
    events.push({ type: 'freeze-used' });
  } else if (today > last) {
    if (g.streak.count > 1) events.push({ type: 'streak-lost', count: g.streak.count });
    g.streak.count = 1;
  }
  g.streak.last = dateKey;
  g.streak.best = Math.max(g.streak.best, g.streak.count);

  const bonus = Math.min(20, (g.streak.count - 1) * 2);
  const res = complete(g, dateKey, 'checkin', bonus);
  events.push(...res.events);
  for (const r of STREAK_REWARDS) {
    if (g.streak.count >= r.days && !res.growth.claimed.includes(r.days)) {
      events.push({ type: 'streak-reward', reward: r });
    }
  }
  return { growth: res.growth, gained: res.gained, events };
}

/** 퀘스트 완료 (하루 한 번). bonus는 추가 경험치 */
export function complete(growth, dateKey, questKey, bonus = 0) {
  const g = structuredClone(growth);
  const events = [];
  const q = QUESTS.find((x) => x.key === questKey);
  if (!q) return { growth: g, gained: 0, events };
  g.quests[dateKey] = g.quests[dateKey] || {};
  if (g.quests[dateKey][questKey]) return { growth: g, gained: 0, events };
  g.quests[dateKey][questKey] = true;
  // 오래된 기록은 정리
  const keys = Object.keys(g.quests).sort((a, b) => dayNum(a) - dayNum(b));
  while (keys.length > 14) delete g.quests[keys.shift()];

  return addExp(g, q.exp + bonus, events);
}

export function addExp(growth, amount, events = []) {
  const g = structuredClone(growth);
  const before = levelFromExp(g.exp).level;
  g.exp += amount;
  const after = levelFromExp(g.exp).level;
  if (after > before) events.push({ type: 'level-up', level: after });
  if (stageForLevel(after) > g.evolved) events.push({ type: 'can-evolve', stage: stageForLevel(after) });
  return { growth: g, gained: amount, events };
}

/** 진화 버튼: 도달한 단계까지 진화 */
export function evolve(growth) {
  const g = structuredClone(growth);
  const target = stageForLevel(levelFromExp(g.exp).level);
  const from = g.evolved;
  g.evolved = Math.max(g.evolved, target);
  return { growth: g, from, to: g.evolved };
}

export function claimStreakReward(growth, days) {
  const g = structuredClone(growth);
  const r = STREAK_REWARDS.find((x) => x.days === days);
  if (!r || g.claimed.includes(days) || g.streak.count < days) return { growth: g, reward: null };
  g.claimed.push(days);
  if (r.freeze) g.freeze += r.freeze;
  return { growth: g, reward: r };
}

export function summary(growth, dateKey) {
  const lv = levelFromExp(growth.exp);
  const reached = stageForLevel(lv.level);
  const next = STAGES.find((s) => s.stage === growth.evolved + 1) || null;
  const done = growth.quests[dateKey] || {};
  return {
    ...lv,
    stage: growth.evolved,
    reachedStage: reached,
    canEvolve: reached > growth.evolved,
    next,
    levelsToNext: next ? Math.max(0, next.level - lv.level) : 0,
    quests: QUESTS.map((q) => ({ ...q, done: !!done[q.key] })),
    todayExp: QUESTS.reduce((s, q) => s + (done[q.key] ? q.exp : 0), 0),
    streak: growth.streak,
    freeze: growth.freeze,
    pendingRewards: STREAK_REWARDS.filter((r) => growth.streak.count >= r.days && !growth.claimed.includes(r.days)),
    nextReward: STREAK_REWARDS.find((r) => growth.streak.count < r.days) || null,
  };
}
