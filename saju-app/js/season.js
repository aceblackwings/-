// 계절 한정 패키지 (축제 시즌)
// - 축제마다 약 2주 시즌: 축제 7일 전 ~ 축제 3일 후 (앞 시즌과 겹치지 않게 자동 조정)
// - 무료 트랙(노력 보상): 기간 중 미션 4종 → 한정 스티커 → 한정 칭호 → 한정 소품
// - 유료 세트(꾸미기 전용): 한정 소품 즉시 + 계절 배경 효과 + 금빛 칭호. 운·오행 수치에는 영향 없음
// - "다시 안 나옴": 아이템에 연도를 새기고(예: 2026 입동), 시즌이 끝나면 판매 종료
import { festivalsOf } from './festivals.js';
import { dateToJdn, jdnToDate } from './lunar.js';

export const DAYS_BEFORE = 7;
export const DAYS_AFTER = 3;
export const PACK_PRICE = 4900;

/** 축제별 한정 패키지 */
export const SEASON_PACKS = {
  seollal: { theme: '설빔', item: '복주머니', effect: 'lantern', color: '#e63946', sticker: '🧧 복 많이 받아', title: '새해 복 수호자' },
  daeboreum: { theme: '달맞이', item: '보름달 등불', effect: 'moon', color: '#ffd166', sticker: '🌕 소원 성취', title: '보름달 소원 수호자' },
  ipchun: { theme: '새봄', item: '새싹 머리꽂이', effect: 'petal', color: '#39ff88', sticker: '🌱 입춘대길', title: '입춘대길 수호자' },
  chunbun: { theme: '벚꽃', item: '벚꽃 화관', effect: 'petal', color: '#ff8fb3', sticker: '🌸 꽃길만 걷자', title: '봄꽃 수호자' },
  dano: { theme: '창포', item: '창포 비녀', effect: 'leaf', color: '#2ec4b6', sticker: '🌿 액운 물렀거라', title: '단오 창포 수호자' },
  haji: { theme: '한여름', item: '태극 부채', effect: 'firefly', color: '#ff9f1c', sticker: '☀️ 기운 뿜뿜', title: '하지 태양 수호자' },
  chilseok: { theme: '오작교', item: '은하수 별핀', effect: 'star', color: '#8a7dff', sticker: '🌌 우리 인연', title: '오작교 인연 수호자' },
  chubun: { theme: '단풍', item: '단풍잎 머리꽂이', effect: 'leaf', color: '#ff6b35', sticker: '🍁 가을 균형', title: '추분 단풍 수호자' },
  chuseok: { theme: '한가위', item: '송편 바구니', effect: 'moon', color: '#ffc93c', sticker: '🌾 넉넉한 한가위', title: '한가위 풍요 수호자' },
  ipdong: { theme: '눈꽃', item: '눈꽃 목도리', effect: 'snow', color: '#9ad7ff', sticker: '❄️ 따뜻하게 지내', title: '입동 눈꽃 수호자' },
  dongji: { theme: '동지 팥죽', item: '팥죽 털목도리', effect: 'snow', color: '#c0392b', sticker: '🥣 액운 퇴치', title: '동지 팥죽 수호자' },
};

/** 무료 트랙 미션: 시즌 기간 중 "N일" 달성 (하루 한 번씩만 셈) */
export const SEASON_MISSIONS = [
  { key: 'checkin', label: '출석', goal: 5, icon: '📅' },
  { key: 'mission', label: '액땜 미션', goal: 3, icon: '🧧' },
  { key: 'chat', label: '수호신 대화', goal: 2, icon: '💬' },
  { key: 'social', label: '친구 응원', goal: 2, icon: '💌' },
];

/** 무료 트랙 보상 단계: 미션 1개·2개·4개 달성 */
export const FREE_TIERS = [
  { need: 1, reward: 'sticker', label: '한정 스티커' },
  { need: 2, reward: 'title', label: '한정 칭호' },
  { need: 4, reward: 'item', label: '한정 소품' },
];

// ---------- 시즌 일정 ----------

// 겹칠 때 우선순위: 큰 명절 > 다른 명절 > 절기
const PRIORITY = { seollal: 3, chuseok: 3, dano: 2, chilseok: 2, daeboreum: 2 };

/** 해당 연도 전후 시즌 목록 (겹치면 우선순위가 높은 시즌이 자리를 차지하고, 나머지는 줄이거나 생략) */
export function seasonsAround(year) {
  const all = [...festivalsOf(year - 1), ...festivalsOf(year), ...festivalsOf(year + 1)]
    .filter((f) => SEASON_PACKS[f.key])
    .map((f) => ({ f, start: f.jdn - DAYS_BEFORE, end: f.jdn + (f.span || 1) - 1 + DAYS_AFTER, pr: PRIORITY[f.key] || 1 }));
  const placed = [];
  for (const c of [...all].sort((x, y) => y.pr - x.pr || x.f.jdn - y.f.jdn)) {
    let { start, end } = c;
    for (const p of placed) {
      if (p.end < start || p.start > end) continue;
      if (p.f.jdn < c.f.jdn) start = Math.max(start, p.end + 1); else end = Math.min(end, p.start - 1);
    }
    if (start > c.f.jdn || end < c.f.jdn || end - start + 1 < 4) continue;
    placed.push({ ...c, start, end });
  }
  return placed.sort((x, y) => x.start - y.start).map(({ f, start, end }) => ({
    id: `${f.key}-${f.date.year}`, key: f.key, year: f.date.year, name: f.name, icon: f.icon, element: f.element, desc: f.desc,
    festJdn: f.jdn, startJdn: start, endJdn: end, start: jdnToDate(start), end: jdnToDate(end), date: f.date, ...SEASON_PACKS[f.key],
  }));
}

/** 오늘의 시즌 상태: 진행 중 시즌, 다음 시즌 */
export function seasonStatus(date) {
  const today = dateToJdn(date.year, date.month, date.day);
  const list = seasonsAround(date.year);
  const active = list.find((s) => today >= s.startJdn && today <= s.endJdn) || null;
  const next = list.find((s) => s.startJdn > today) || null;
  return {
    active: active ? { ...active, daysLeft: active.endJdn - today, dayOf: today - active.startJdn + 1, length: active.endJdn - active.startJdn + 1, toFest: active.festJdn - today } : null,
    next: next ? { ...next, daysToStart: next.startJdn - today } : null,
  };
}

/** 받침에 맞춘 목적격 조사: 목도리를, 복주머니를, 송편 바구니를 */
export function withEul(word) {
  const c = word.charCodeAt(word.length - 1);
  const has = c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0;
  return `${word}${has ? '을' : '를'}`;
}

/** 아이템 표시 이름 (연도 각인) */
export function itemName(season) {
  return `${season.year} ${season.name} ${season.item}`;
}
export function titleName(season, gold = false) {
  return `${gold ? '✨ ' : ''}${season.year} ${season.title}`;
}

// ---------- 진행·보유 ----------

export function emptySeason() {
  return { progress: {}, owned: {}, equipped: null, effect: true, title: null };
}

/** 미션 하나 기록 (하루 한 번). 새로 열린 보상 목록도 돌려줌 */
export function recordSeason(st, seasonId, questKey, dateKey) {
  if (!SEASON_MISSIONS.some((m) => m.key === questKey)) return { state: st, unlocked: [] };
  const s = structuredClone({ ...emptySeason(), ...st });
  const p = s.progress[seasonId] || (s.progress[seasonId] = {});
  const days = p[questKey] || (p[questKey] = []);
  if (days.includes(dateKey)) return { state: s, unlocked: [] };
  const before = tiersDone(p).length;
  days.push(dateKey);
  const now = tiersDone(p);
  const unlocked = now.slice(before);
  if (unlocked.length) {
    const o = s.owned[seasonId] || (s.owned[seasonId] = {});
    unlocked.forEach((t) => { o[t.reward] = true; });
    if (o.title && !s.title) s.title = seasonId;
  }
  return { state: s, unlocked };
}

export function missionProgress(progress = {}) {
  return SEASON_MISSIONS.map((m) => {
    const n = Math.min(m.goal, (progress[m.key] || []).length);
    return { ...m, n, done: n >= m.goal };
  });
}

export function tiersDone(progress = {}) {
  const done = missionProgress(progress).filter((m) => m.done).length;
  return FREE_TIERS.filter((t) => done >= t.need);
}

/** 유료 세트 구매: 시즌 진행 중에만 가능 */
export function buyPack(st, season, todayJdn) {
  if (!season || todayJdn < season.startJdn || todayJdn > season.endJdn) return { state: st, ok: false, reason: '판매 기간이 끝났어요' };
  const s = structuredClone({ ...emptySeason(), ...st });
  const o = s.owned[season.id] || (s.owned[season.id] = {});
  if (o.set) return { state: s, ok: false, reason: '이미 가지고 있어요' };
  Object.assign(o, { set: true, item: true, sticker: true, title: true });
  s.equipped = season.id; s.title = season.id;
  return { state: s, ok: true };
}

/** 장착 가능한 보유 한정 아이템 목록 */
export function ownedItems(st) {
  return Object.entries(st?.owned || {}).filter(([, o]) => o.item).map(([id, o]) => {
    const [key, year] = id.split('-');
    return { id, key, year: Number(year), set: !!o.set, ...SEASON_PACKS[key] };
  });
}

/** 캐릭터 그리기 옵션 */
export function seasonLook(st) {
  if (!st?.equipped || !st.owned?.[st.equipped]?.item) return null;
  const key = st.equipped.split('-')[0];
  return { key, effect: !!st.owned[st.equipped].set && st.effect !== false };
}

/** 프로필에 붙는 칭호 */
export function activeTitle(st, seasonList) {
  if (!st?.title || !st.owned?.[st.title]?.title) return null;
  const [key, year] = st.title.split('-');
  const s = seasonList?.find((x) => x.id === st.title) || { year, title: SEASON_PACKS[key]?.title };
  return titleName(s, !!st.owned[st.title].set);
}

// ---------- 그림 ----------

/** 한정 소품 SVG (320×400 캐릭터 좌표계) */
export function seasonAccessorySVG(key) {
  switch (key) {
    case 'ipdong':
    case 'dongji': {
      const [a, b] = key === 'ipdong' ? ['#e8f6ff', '#5fb4ff'] : ['#c0392b', '#fff1e6'];
      const stripes = Array.from({ length: 7 }, (_, i) => `<rect x="${104 + i * 16}" y="258" width="8" height="20" fill="${b}" opacity="0.85"/>`).join('');
      return `<g class="season-acc">
        <path d="M100 262 Q160 286 220 262 L222 280 Q160 302 98 280 Z" fill="${a}" stroke="#1a1030" stroke-width="3"/>
        <g clip-path="none">${stripes}</g>
        <path d="M188 280 l6 52 l22 -4 l-10 -50 z" fill="${a}" stroke="#1a1030" stroke-width="3"/>
        <path d="M194 326 l2 10 M200 325 l2 10 M206 324 l2 10 M212 323 l2 10" stroke="${b}" stroke-width="3" stroke-linecap="round"/>
        ${key === 'ipdong' ? '<text x="200" y="306" font-size="14" text-anchor="middle">❄</text>' : '<circle cx="200" cy="300" r="5" fill="#fff1e6"/><circle cx="208" cy="310" r="3" fill="#fff1e6"/>'}
      </g>`;
    }
    case 'seollal':
      return `<g class="season-acc" transform="translate(84 336) scale(1.35)"><path d="M-22 -4 q-6 30 22 30 q28 0 22 -30 q-10 -8 -22 -8 q-12 0 -22 8 z" fill="#e63946" stroke="#7a0f1a" stroke-width="3"/><path d="M-14 -10 q14 10 28 0" fill="none" stroke="#ffd166" stroke-width="4"/><path d="M0 -12 l-6 -12 M0 -12 l6 -12" stroke="#ffd166" stroke-width="3" stroke-linecap="round"/><text y="16" font-size="16" text-anchor="middle" fill="#ffd166" font-weight="800" font-family="serif">福</text></g>`;
    case 'daeboreum':
      return `<g class="season-acc" transform="translate(74 300) scale(1.3)"><path d="M0 -40 v14" stroke="#5a3a1a" stroke-width="3"/><circle r="22" cy="-6" fill="#ffd166" stroke="#c98a00" stroke-width="3"/><circle r="22" cy="-6" fill="#fff6c9" opacity="0.4"/><path d="M-6 16 h12 v10 h-12 z" fill="#c0392b"/><path d="M-2 26 v12 M2 26 v12" stroke="#c0392b" stroke-width="2"/></g>`;
    case 'ipchun':
      return `<g class="season-acc" transform="translate(98 104)"><path d="M0 14 q-2 -18 0 -28" stroke="#2d7a3a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M0 -10 q-22 -6 -24 -22 q20 0 24 18 z" fill="#39ff88" stroke="#1f7a3a" stroke-width="2"/><path d="M0 -14 q18 -12 26 -6 q-8 18 -26 10 z" fill="#7dffb0" stroke="#1f7a3a" stroke-width="2"/></g>`;
    case 'chunbun': {
      const flowers = [[-56, 10], [-30, -6], [0, -12], [30, -6], [56, 10]].map(([x, y]) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((r) => `<ellipse rx="5" ry="8" cy="-7" fill="#ffc2d6" stroke="#e05a8a" stroke-width="1.5" transform="rotate(${r})"/>`).join('')}<circle r="3" fill="#ffd166"/></g>`).join('');
      return `<g class="season-acc" transform="translate(160 108)"><path d="M-62 16 Q0 -22 62 16" fill="none" stroke="#6b8f3a" stroke-width="4"/>${flowers}</g>`;
    }
    case 'dano':
      return `<g class="season-acc" transform="translate(92 112) rotate(-24)"><rect x="-3" y="-34" width="6" height="64" rx="3" fill="#2ec4b6" stroke="#145a54" stroke-width="2"/><path d="M0 -30 q-16 -20 -6 -40 M0 -30 q14 -22 4 -42 M0 -26 q-24 -8 -30 -26" stroke="#3aa64a" stroke-width="5" fill="none" stroke-linecap="round"/><circle cy="30" r="5" fill="#ffd166" stroke="#c98a00" stroke-width="2"/></g>`;
    case 'haji':
      return `<g class="season-acc" transform="translate(76 322) rotate(-18) scale(1.3)"><path d="M0 0 L-34 -46 A58 58 0 0 1 34 -46 Z" fill="#fff6e0" stroke="#5a3a1a" stroke-width="3"/><path d="M0 -40 a12 12 0 0 1 0 24 a6 6 0 0 0 0 -12 a6 6 0 0 1 0 -12" fill="#e63946"/><path d="M0 -40 a12 12 0 0 0 0 24 a6 6 0 0 1 0 -12 a6 6 0 0 0 0 -12" fill="#1d4ed8"/><rect x="-3" y="0" width="6" height="22" rx="2" fill="#8a5a2b"/></g>`;
    case 'chilseok':
      return `<g class="season-acc" transform="translate(96 110)"><path d="M0 -14 l4 9 l10 1 l-8 7 l3 10 l-9 -5 l-9 5 l3 -10 l-8 -7 l10 -1 z" fill="#c7b8ff" stroke="#5b4bd6" stroke-width="2"/><circle cx="18" cy="-16" r="3" fill="#fff"/><circle cx="-16" cy="12" r="2" fill="#fff"/><path d="M6 14 q14 18 4 36" stroke="#8a7dff" stroke-width="3" fill="none" stroke-dasharray="2 4"/></g>`;
    case 'chubun':
      return `<g class="season-acc" transform="translate(96 108) rotate(-14)"><path d="M0 -22 l5 10 l10 -4 l-3 10 l10 4 l-10 6 l4 8 l-10 -2 l-6 10 l-6 -10 l-10 2 l4 -8 l-10 -6 l10 -4 l-3 -10 l10 4 z" fill="#ff6b35" stroke="#9a2d0a" stroke-width="2"/><path d="M0 0 v24" stroke="#9a2d0a" stroke-width="3"/></g>`;
    case 'chuseok':
      return `<g class="season-acc" transform="translate(84 340) scale(1.3)"><path d="M-26 -6 h52 l-6 26 h-40 z" fill="#c9a26b" stroke="#6b4a1f" stroke-width="3"/><path d="M-26 -6 q26 -30 52 0" fill="none" stroke="#6b4a1f" stroke-width="3"/>${[[-12, -10, '#f5f0e1'], [0, -14, '#b5e48c'], [12, -10, '#ffc2d6']].map(([x, y, c]) => `<path d="M${x - 8} ${y + 4} q8 -14 16 0 q-8 6 -16 0 z" fill="${c}" stroke="#6b4a1f" stroke-width="1.5"/>`).join('')}<path d="M-20 4 h40 M-18 12 h36" stroke="#6b4a1f" stroke-width="1.5" opacity="0.6"/></g>`;
    default: return '';
  }
}

/** 계절 배경 효과 (유료 세트 전용, 화면 앞쪽에 얇게) */
export function seasonEffectSVG(effect, animate = false, seed = 1) {
  const n = 16;
  const items = Array.from({ length: n }, (_, i) => {
    const x = (i * 83 + seed * 29) % 320; const y = (i * 47 + seed * 13) % 400; const d = 6 + (i % 5) * 1.4;
    const anim = animate ? `<animateTransform attributeName="transform" type="translate" values="${x} ${y - 40};${x + (i % 2 ? 14 : -14)} ${y + 40}" dur="${d}s" repeatCount="indefinite"/>` : '';
    const at = animate ? '' : ` transform="translate(${x} ${y})"`;
    const shape = {
      snow: `<circle r="${2 + (i % 3)}" fill="#fff" stroke="#7fb8e6" stroke-width="0.8" opacity="0.9"/>`,
      petal: `<ellipse rx="3" ry="5" fill="#ffc2d6" opacity="0.85" transform="rotate(${i * 37})"/>`,
      leaf: `<path d="M0 -5 q5 5 0 10 q-5 -5 0 -10 z" fill="${i % 2 ? '#ff6b35' : '#ffc93c'}" opacity="0.85" transform="rotate(${i * 41})"/>`,
      star: `<path d="M0 -4 l1.2 2.8 l2.8 1.2 l-2.8 1.2 l-1.2 2.8 l-1.2 -2.8 l-2.8 -1.2 l2.8 -1.2 z" fill="#fff" opacity="0.9"/>`,
      firefly: `<circle r="2.4" fill="#fff59d" opacity="0.9"/><circle r="6" fill="#fff59d" opacity="0.2"/>`,
      moon: `<circle r="${i % 4 ? 1.6 : 3}" fill="#ffe08a" opacity="0.8"/>`,
      lantern: `<rect x="-3" y="-4" width="6" height="8" rx="2" fill="#ff4d6d" opacity="0.85"/><rect x="-1" y="4" width="2" height="3" fill="#ffd166"/>`,
    }[effect] || '';
    return `<g${at}>${anim}${shape}</g>`;
  }).join('');
  const glow = effect === 'moon' ? '<circle cx="268" cy="58" r="46" fill="#ffe9a0" opacity="0.18"/><circle cx="268" cy="58" r="28" fill="#fff4c9"/><circle cx="276" cy="50" r="5" fill="#f1dc9a" opacity="0.7"/><circle cx="258" cy="66" r="4" fill="#f1dc9a" opacity="0.6"/>' : '';
  return `<g class="season-fx" pointer-events="none">${glow}${items}</g>`;
}
