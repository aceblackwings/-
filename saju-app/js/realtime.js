// 실시간 단톡 궁합방(room) · 친구 응원 우편함(db)
// - 공유하는 정보는 "공개 카드"뿐: 이름(닉네임)·띠·일간·오행 비율·용신·약한 기운·성별·진화 단계·수호신 코드
//   (생년월일·사주 원본은 기기 밖으로 나가지 않음)
// - 받은 데이터는 모두 신뢰하지 않고 검증(cleanCard) 후 사용
// - capability가 없으면(null) 앱은 기존 로컬 체험 모드로 동작

const CODE_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';
export const CODE_LEN = 6;
export const CHEER_DAILY_LIMIT = 5; // 하루에 응원으로 충전되는 최대 횟수
export const CHEER_CHARGE = 3;

export const CHEER_MESSAGES = [
  { key: 'fight', text: '오늘도 화이팅! 네 편이야 💪' },
  { key: 'luck', text: '좋은 기운 듬뿍 보낸다 ✨' },
  { key: 'pass', text: '합격 기운 전송! 🎯' },
  { key: 'rest', text: '오늘은 푹 쉬어, 수고했어 🌙' },
  { key: 'love', text: '네 인연운을 응원해 💗' },
  { key: 'money', text: '재물운 가득 들어와라 💰' },
];
export const cheerText = (key) => (CHEER_MESSAGES.find((m) => m.key === key) || CHEER_MESSAGES[0]).text;

/** 수호신 코드 (헷갈리는 글자 0/o/1/l/i 제외) */
export function makeCode(rng = Math.random) {
  let s = '';
  for (let i = 0; i < CODE_LEN; i++) s += CODE_CHARS[Math.floor(rng() * CODE_CHARS.length)];
  return s;
}

/** 사용자가 입력한 코드 정리: 소문자, 허용 글자만. 형식이 틀리면 null */
export function normalizeCode(input) {
  const c = String(input || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (c.length !== CODE_LEN) return null;
  return [...c].every((ch) => CODE_CHARS.includes(ch)) ? c : null;
}

/** 방 코드 → room.join 이름 (^[a-z0-9][a-z0-9_.-]{0,47}$) */
export const roomName = (code) => `team-${code}`;

const int = (v, lo, hi) => { const n = Math.round(Number(v)); return Number.isFinite(n) && n >= lo && n <= hi ? n : null; };
const clip = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯]/g, '').trim().slice(0, n);

/** 내 공개 카드 (생년월일 없음) */
export function publicCard(saju, profile, stage, code) {
  return {
    v: 1,
    code,
    name: clip(profile.name || '나', 10) || '나',
    gender: profile.gender === 'male' ? 'male' : 'female',
    branch: saju.pillars.year.branch,
    dayMaster: saju.dayMaster,
    elements: saju.elements.map((x) => Math.round(x)),
    weakest: saju.weakest,
    yongsin: saju.yongsin,
    stage: stage || 1,
  };
}

/** 받은 카드 검증. 이상하면 null */
export function cleanCard(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const branch = int(raw.branch, 0, 11);
  const dayMaster = int(raw.dayMaster, 0, 9);
  const weakest = int(raw.weakest, 0, 4);
  const yongsin = int(raw.yongsin, 0, 4);
  const stage = int(raw.stage, 1, 14) ?? 1;
  const elements = Array.isArray(raw.elements) && raw.elements.length === 5 ? raw.elements.map((x) => int(x, 0, 100)) : null;
  if (branch === null || dayMaster === null || weakest === null || yongsin === null || !elements || elements.some((x) => x === null)) return null;
  return {
    v: 1,
    code: normalizeCode(raw.code),
    name: clip(raw.name, 10) || '친구',
    gender: raw.gender === 'male' ? 'male' : 'female',
    branch, dayMaster, elements, weakest, yongsin, stage,
  };
}

/** 공개 카드 → 궁합·캐릭터 계산에 필요한 최소 사주 모양 */
export function cardToSaju(card) {
  return {
    fromCard: true,
    pillars: { year: { branch: card.branch } },
    dayMaster: card.dayMaster,
    elements: card.elements,
    weakest: card.weakest,
    yongsin: card.yongsin,
  };
}

/** 받은 응원 중 아직 충전하지 않은 것 고르기 (하루 한도 적용) */
export function pendingCheers(cheers, claimed, dateKey, usedToday) {
  const room = Math.max(0, CHEER_DAILY_LIMIT - usedToday);
  return cheers
    .filter((c) => c && c.id && !claimed.includes(c.id) && c.date === dateKey)
    .sort((a, b) => (a.at || 0) - (b.at || 0))
    .slice(0, room);
}

/** 응원 문서 id: 같은 사람에게 하루 한 번 */
export const cheerId = (to, from, dateKey) => `${to}_${from}_${dateKey.replace(/-/g, '')}`;

// ---------- capability 연결 ----------

async function use(name) {
  try { return window.claude?.use ? await window.claude.use(name) : null; } catch { return null; }
}

/**
 * 단톡 궁합방 입장
 * @param code 방 코드
 * @param card 내 공개 카드
 * @param handlers {onMembers(list), onCheer({from, msg}), onStatus(text)}
 * @returns {leave, cheer(toCode, msgKey), setCard(card)} 또는 null(실시간 불가)
 */
export async function joinTeamRoom(code, card, handlers = {}) {
  const room = await use('room');
  if (!room) return null;
  let r;
  try { r = await room.join(roomName(code)); } catch { return null; }
  const seen = new Map(); // peer → 마지막으로 처리한 cheer.at
  const unsub = r.onPeers(({ peers }) => {
    const list = [];
    peers.forEach((p) => {
      const c = cleanCard(p.presence?.card);
      if (!c) return;
      list.push({ peer: p.peer, isMe: p.isMe && p.sameTab, card: c, guest: p.guest });
      const ch = p.presence?.cheer;
      if (!p.isMe && ch && typeof ch === 'object' && ch.to === card.code && Number(ch.at) > (seen.get(p.peer) || 0)) {
        const first = !seen.has(p.peer);
        seen.set(p.peer, Number(ch.at));
        // 입장 직후 이미 남아 있던 응원은 최근 10분 것만 인정
        if (!first || Date.now() - Number(ch.at) < 600000) handlers.onCheer?.({ from: c, msg: cheerText(ch.msg) });
      } else if (!seen.has(p.peer)) seen.set(p.peer, Number(ch?.at) || 0);
    });
    handlers.onMembers?.(list);
  }, () => handlers.onStatus?.('끊김'));
  try { await r.presence({ card }); } catch { /* 다음 갱신 때 다시 */ }
  return {
    name: code,
    cheer: (toCode, msg) => r.presence({ cheer: { to: toCode, msg, at: Date.now() } }).catch(() => {}),
    setCard: (c) => r.presence({ card: c }).catch(() => {}),
    connected: () => r.connected(),
    leave: () => { unsub(); r.leave().catch(() => {}); },
  };
}

/**
 * 친구 응원 우편함 (db)
 * - guardians/<code>: 공개 카드 (코드로 친구 추가할 때 읽음)
 * - cheers/<to>_<from>_<날짜>: {to, from, fromName, fromBranch, msg, date, at}
 * @returns {register(card), lookup(code), send(...), listen(code, fn)} 또는 null
 */
export async function openMailbox() {
  const db = await use('db');
  if (!db) return null;
  const withTimeout = (p, ms = 10000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
  return {
    async register(card) {
      await withTimeout(db.doc(`guardians/${card.code}`).set({ ...card, updatedAt: Date.now() }));
    },
    async lookup(code) {
      const snap = await withTimeout(db.doc(`guardians/${code}`).get());
      const data = snap && (typeof snap.data === 'function' ? snap.data() : snap.data ?? snap);
      return cleanCard(data);
    },
    async send(toCode, me, msgKey, dateKey) {
      const id = cheerId(toCode, me.code, dateKey);
      await withTimeout(db.doc(`cheers/${id}`).set({ to: toCode, from: me.code, fromName: me.name, fromBranch: me.branch, msg: msgKey, date: dateKey, at: Date.now() }));
      return id;
    },
    listen(code, fn, onError) {
      const q = db.collection('cheers').where('to', '==', code).limit(50);
      return q.onSnapshot((snap) => {
        const docs = snap?.docs || [];
        fn(docs.map((d) => {
          const x = typeof d.data === 'function' ? d.data() : d.data || {};
          return { id: d.id, from: normalizeCode(x.from), fromName: clip(x.fromName, 10) || '친구', fromBranch: int(x.fromBranch, 0, 11), msg: cheerText(x.msg), date: String(x.date || '').slice(0, 10), at: Number(x.at) || 0 };
        }).filter((c) => c.from));
      }, (e) => onError?.(e));
    },
  };
}
