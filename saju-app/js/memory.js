// AI 수호신 기억 (요약)
// - 대화에서 "고민 주제·다가오는 일정·소중한 사람·좋아하는 것"을 규칙으로 뽑아 기기에만 저장
// - 대화가 길어지면 지난 대화를 3줄 요약(온라인: AI 요약, 오프라인: 규칙 요약)
// - 다음 대화의 지시문에 기억을 넣고, 지난 일정은 "어제 면접 어땠어?"처럼 먼저 안부를 물음
// - 개인정보(전화번호·생년월일·주소·이메일)와 위기 신호 문장은 기억하지 않음
import { josa } from './josa.js';
import { isCrisis } from './chat.js';

export const MEMORY_LIMIT = 12;
export const SUMMARY_EVERY = 10; // 요약하지 않은 메시지가 이만큼 쌓이면 요약

export const TOPICS = [
  { key: 'love', label: '연애', words: ['연애', '사랑', '썸', '고백', '남친', '여친', '애인', '이별', '재회', '소개팅'] },
  { key: 'money', label: '돈 관리', words: ['돈', '월급', '용돈', '저축', '대출', '재테크', '투자'] },
  { key: 'study', label: '공부·시험', words: ['시험', '공부', '수능', '자격증', '성적', '합격'] },
  { key: 'job', label: '취업·일', words: ['취업', '면접', '회사', '직장', '상사', '이직', '알바', '사업', '퇴사'] },
  { key: 'health', label: '건강', words: ['건강', '아파', '피곤', '잠이', '불면', '운동', '다이어트'] },
  { key: 'people', label: '사람 관계', words: ['친구', '관계', '싸웠', '서운', '동료', '가족'] },
  { key: 'mood', label: '마음 상태', words: ['우울', '힘들', '불안', '걱정', '외로', '스트레스', '지쳐'] },
];

export const EVENTS = ['면접', '시험', '발표', '데이트', '고백', '소개팅', '여행', '생일', '이사', '계약', '대회', '공연', '수능', '입학', '졸업', '첫 출근', '출근', '미팅', '병원'];

const WHEN = [
  { words: ['오늘'], days: 0, label: '오늘' },
  { words: ['내일'], days: 1, label: '내일' },
  { words: ['모레'], days: 2, label: '모레' },
  { words: ['이번 주말', '주말'], days: 'weekend', label: '주말' },
  { words: ['다음 주', '다음주'], days: 7, label: '다음 주' },
];

export const PEOPLE = ['엄마', '아빠', '부모님', '할머니', '할아버지', '언니', '오빠', '누나', '형', '동생', '남친', '여친', '남편', '아내', '애인', '상사', '팀장', '동료', '선생님', '절친', '친구', '반려견', '강아지', '고양이'];

const SENSITIVE = [
  /\d{2,3}[-\s.]?\d{3,4}[-\s.]?\d{4}/, // 전화번호
  /(19|20)\d{2}\s*[년./-]\s*\d{1,2}\s*[월./-]\s*\d{1,2}/, // 생년월일
  /\d{6}\s*-\s*[1-4]\d{0,6}/, // 주민번호
  /[\w.+-]+@[\w-]+\.[\w.]+/, // 이메일
  /(시|구|동|로|길)\s*\d+(번지|호|-\d+)/, // 주소
];

export function isSensitive(text) {
  return SENSITIVE.some((re) => re.test(text));
}

// ---------- 날짜 ----------

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
export function toKey(dt) {
  return `${dt.getUTCFullYear()}-${dt.getUTCMonth() + 1}-${dt.getUTCDate()}`;
}
export function addDays(key, n) {
  const dt = parseKey(key); dt.setUTCDate(dt.getUTCDate() + n); return toKey(dt);
}
export function daysBetween(a, b) {
  return Math.round((parseKey(b) - parseKey(a)) / 86400000);
}

// ---------- 추출 ----------

/** 사용자 한 문장에서 기억할 만한 것 뽑기 */
export function extractMemories(text, todayKey) {
  const t = String(text || '').trim();
  if (!t || isSensitive(t) || isCrisis(t)) return [];
  const out = [];
  const flat = t.replace(/\s/g, '');

  const ev = EVENTS.find((e) => flat.includes(e.replace(/\s/g, '')));
  const when = WHEN.find((w) => w.words.some((x) => flat.includes(x.replace(/\s/g, ''))));
  if (ev && when) {
    let days = when.days;
    if (days === 'weekend') { const dow = parseKey(todayKey).getUTCDay(); days = dow === 6 ? 0 : dow === 0 ? 0 : 6 - dow; }
    out.push({ kind: 'event', key: `event:${ev}`, label: ev, text: `${when.label} ${ev} 예정`, due: addDays(todayKey, days) });
  }

  TOPICS.filter((tp) => tp.words.some((w) => flat.includes(w))).slice(0, 2)
    .forEach((tp) => out.push({ kind: 'topic', key: `topic:${tp.key}`, label: tp.label, text: `${tp.label} 고민을 이야기함` }));

  const person = PEOPLE.find((p) => new RegExp(`${p}(이|가|는|은|랑|이랑|하고|한테|께|의|와|과|도|를|을|\\s|$)`).test(t));
  if (person) out.push({ kind: 'person', key: `person:${person}`, label: person, text: `${person} 이야기를 함` });

  const like = t.match(/([가-힣A-Za-z0-9]{1,10})\s*(?:정말|진짜|너무|제일|완전)?\s*좋아(?:해|하|함|요)/);
  if (like) {
    const word = like[1].length > 1 ? like[1].replace(/(을|를|가)$/, '') : like[1];
    if (!['나', '너', '날', '널', '그거', '이거', '저거', '뭐', '정말', '진짜', '너무', '제일', '완전'].includes(word)) {
      out.push({ kind: 'like', key: `like:${word}`, label: word, text: `${word}${batchim(word) ? '을' : '를'} 좋아함` });
    }
  }
  return out;
}

// ---------- 저장소 ----------

export function emptyMemory() {
  return { on: true, items: [], summary: '', pending: 0, asked: [] };
}

const KIND_WEIGHT = { event: 4, like: 3, person: 2, topic: 1 };

/** 새 기억을 합치기 (같은 key면 횟수·날짜 갱신, 한도 넘으면 덜 중요한 것부터 정리) */
export function mergeMemory(mem, found, todayKey) {
  const m = { ...emptyMemory(), ...mem, items: [...(mem?.items || [])] };
  if (!m.on) return m;
  for (const it of found) {
    const i = m.items.findIndex((x) => x.key === it.key);
    if (i >= 0) {
      const old = m.items[i];
      m.items[i] = { ...old, ...it, count: (old.count || 1) + 1, last: todayKey, first: old.first };
      if (it.kind === 'event' && it.due !== old.due) m.asked = (m.asked || []).filter((k) => k !== `${it.key}@${old.due}`);
    } else {
      m.items.push({ ...it, id: `${it.key}@${todayKey}`, count: 1, first: todayKey, last: todayKey });
    }
  }
  // 30일 넘게 지난 일정은 정리
  m.items = m.items.filter((x) => x.kind !== 'event' || daysBetween(x.due, todayKey) <= 30);
  if (m.items.length > MEMORY_LIMIT) {
    const score = (x) => KIND_WEIGHT[x.kind] * 10 + (x.count || 1) * 3 - Math.max(0, daysBetween(x.last, todayKey));
    m.items = [...m.items].sort((a, b) => score(b) - score(a)).slice(0, MEMORY_LIMIT);
  }
  return m;
}

export function forget(mem, id) {
  return { ...mem, items: (mem.items || []).filter((x) => x.id !== id) };
}

export function forgetAll(mem) {
  return { ...emptyMemory(), on: mem?.on !== false };
}

/** 사람이 읽기 쉬운 기억 한 줄 (일정은 오늘 기준으로 다시 표현) */
export function describe(item, todayKey) {
  if (item.kind !== 'event') return item.text;
  const d = daysBetween(todayKey, item.due);
  const when = d === 0 ? '오늘' : d === 1 ? '내일' : d === 2 ? '모레' : d > 0 ? `${d}일 뒤` : d === -1 ? '어제' : `${-d}일 전`;
  return d >= 0 ? `${when} ${item.label} 예정` : `${when} ${josa(item.label, '이/가')} 있었음`;
}

/** 지시문에 넣을 기억 줄 */
export function memoryLines(mem, todayKey) {
  if (!mem || mem.on === false) return [];
  const order = { event: 0, like: 1, person: 2, topic: 3 };
  const lines = [...(mem.items || [])].sort((a, b) => order[a.kind] - order[b.kind] || (b.count || 1) - (a.count || 1))
    .map((x) => `- ${describe(x, todayKey)}${x.count > 1 ? ` (${x.count}번 언급)` : ''}`);
  if (mem.summary) lines.unshift(`- 지난 대화 요약: ${mem.summary}`);
  return lines;
}

/** 지난 일정 안부: 지난 1~3일 사이 일정 중 아직 묻지 않은 것 */
export function followUp(mem, todayKey) {
  if (!mem || mem.on === false) return null;
  const asked = mem.asked || [];
  const ev = (mem.items || []).filter((x) => x.kind === 'event')
    .map((x) => ({ x, ago: daysBetween(x.due, todayKey) }))
    .filter(({ x, ago }) => ago >= 1 && ago <= 3 && !asked.includes(`${x.key}@${x.due}`))
    .sort((a, b) => a.ago - b.ago)[0];
  if (ev) {
    const when = ev.ago === 1 ? '어제' : ev.ago === 2 ? '그저께' : '며칠 전';
    return { mark: `${ev.x.key}@${ev.x.due}`, text: `${when} ${ev.x.label}${batchim(ev.x.label) ? '은' : '는'} 어땠어? 기억하고 있었어.` };
  }
  const today = (mem.items || []).find((x) => x.kind === 'event' && x.due === todayKey && x.first !== todayKey && !asked.includes(`${x.key}@${x.due}:today`));
  if (today) return { mark: `${today.key}@${today.due}:today`, text: `오늘 ${today.label}${batchim(today.label) ? '이' : '가'} 있는 날이지? 내가 기운 꽉 채워 줄게.` };
  return null;
}

export function markAsked(mem, mark) {
  return { ...mem, asked: [...new Set([...(mem.asked || []), mark])].slice(-30) };
}

function batchim(word) {
  const c = word.charCodeAt(word.length - 1);
  return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0;
}

// ---------- 요약 ----------

/** 요약할 때가 됐는지 */
export function needsSummary(mem) {
  return mem?.on !== false && (mem?.pending || 0) >= SUMMARY_EVERY;
}

/** 요약 반영: 요약문 저장 + 대기 카운터 초기화 */
export function applySummary(mem, summary) {
  return { ...mem, summary: clip(summary, 160), pending: 0 };
}

/** 지금 말한 주제를 예전에도 말했다면 "지난번에도…" 한마디 */
export function recallFor(mem, text, todayKey) {
  if (!mem || mem.on === false) return null;
  const found = extractMemories(text, todayKey);
  for (const f of found) {
    const old = (mem.items || []).find((x) => x.key === f.key && x.last !== todayKey);
    if (!old) continue;
    if (old.kind === 'person') return `지난번에 말한 ${old.label} 이야기, 기억하고 있어.`;
    if (old.kind === 'like') return `${old.label} 좋아한다고 했던 거 기억나.`;
    if (old.kind === 'topic') return `지난번에도 ${old.label} 이야기를 했었지? 계속 마음 쓰고 있었구나.`;
  }
  return null;
}

/** AI 요약 요청 메시지 (개인정보 제외 규칙 포함) */
export function summaryMessages(prevSummary, turns) {
  const log = turns.filter((m) => !isSensitive(m.text) && !isCrisis(m.text)).map((m) => `${m.role === 'user' ? '사용자' : '수호신'}: ${m.text}`).join('\n');
  return [{
    role: 'user',
    content: `다음은 사주 앱 수호신과 사용자의 대화다. 수호신이 다음에 이어서 다정하게 챙길 수 있도록 핵심만 한국어 3문장 이내, 120자 이내로 요약해.
- 사용자의 고민, 다가오는 일정, 감정 변화, 수호신이 권한 행동 위주
- 이름·생년월일·전화번호·주소 같은 개인정보와 자해 관련 구체 내용은 적지 않는다
- 요약문만 출력한다
${prevSummary ? `\n[이전 요약]\n${prevSummary}\n` : ''}
[대화]
${log}`,
  }];
}

/** 오프라인 규칙 요약 */
export function offlineSummary(mem, turns, todayKey) {
  const found = turns.filter((m) => m.role === 'user').flatMap((m) => extractMemories(m.text, todayKey));
  const topics = [...new Set(found.filter((x) => x.kind === 'topic').map((x) => x.label))];
  const events = [...new Set(found.filter((x) => x.kind === 'event').map((x) => `${x.due.split('-').slice(1).join('/')} ${x.label}`))];
  const people = [...new Set(found.filter((x) => x.kind === 'person').map((x) => x.label))];
  const parts = [];
  if (topics.length) parts.push(`${topics.slice(0, 3).join('·')} 이야기를 나눔`);
  if (events.length) parts.push(`${events.slice(0, 2).join(', ')}`);
  if (people.length) parts.push(`${people.slice(0, 2).join('·')} 언급`);
  const now = parts.length ? parts.join(' / ') : '가벼운 안부와 오늘 운세를 나눔';
  const merged = mem?.summary ? `${mem.summary.split(' · ').slice(-1)[0]} · ${now}` : now;
  return clip(merged, 120);
}

export function clip(text, n) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
