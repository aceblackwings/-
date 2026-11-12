// 백업(v0.23): 이 기기에 저장된 앱 기록(unmyeong2099.*)을 파일·글자로 내보내고 다시 가져온다.
// 원칙 5: 서버로 보내지 않는다. 백업 파일 안에는 생년월일이 있으므로 화면에서 "다른 사람에게 보내지 마세요"를 안내한다.
// 순수 로직만 둔다(테스트: tests/wealthweek.test.mjs · tests/backupnudge.test.mjs)
import { shiftDay } from './omen.js';

export const PREFIX = 'unmyeong2099.';
export const BACKUP_APP = '12지신강림';
export const BACKUP_VERSION = 1;
export const MAX_BYTES = 5 * 1024 * 1024;

/** 저장소 내용(키 → 문자열) → 백업 객체. 앱 키만 담는다 */
export function makeBackup(entries, now = new Date()) {
  const data = {};
  for (const [k, v] of Object.entries(entries)) {
    if (!k.startsWith(PREFIX) || typeof v !== 'string') continue;
    try { data[k] = JSON.parse(v); } catch { data[k] = v; }
  }
  return { app: BACKUP_APP, version: BACKUP_VERSION, savedAt: now.toISOString(), count: Object.keys(data).length, data };
}

export const backupText = (b) => JSON.stringify(b);
// v0.70.1: 카카오톡이 .json 파일을 「지원하지 않는 파일 형식」으로 거절 → 글자 파일(.txt)로 저장(내용은 같은 JSON, 예전 .json도 가져오기 됨)
export const BACKUP_MIME = 'text/plain';
export const backupFileName = (b) => `zodiac12-backup-${b.savedAt.slice(0, 10)}.txt`;

/**
 * 백업 글자 → 복원할 항목. 잘못된 파일이면 {ok:false, error}
 * @returns {ok, entries:{키: 문자열}, count, savedAt, hasProfile}
 */
export function parseBackup(text) {
  if (typeof text !== 'string' || !text.trim()) return { ok: false, error: '백업 내용이 비어 있어요.' };
  if (text.length > MAX_BYTES) return { ok: false, error: '백업 파일이 너무 커요.' };
  let b;
  try { b = JSON.parse(text.trim()); } catch { return { ok: false, error: '백업 파일 형식이 아니에요.' }; }
  if (!b || b.app !== BACKUP_APP || typeof b.data !== 'object' || b.data === null) return { ok: false, error: '12지신 강림 백업 파일이 아니에요.' };
  if (b.version > BACKUP_VERSION) return { ok: false, error: '더 새 버전 앱에서 만든 백업이에요. 앱을 업데이트해 주세요.' };
  const entries = {};
  for (const [k, v] of Object.entries(b.data)) {
    if (!k.startsWith(PREFIX) || /[^\w.\-]/.test(k.slice(PREFIX.length))) continue;
    entries[k] = typeof v === 'string' ? v : JSON.stringify(v);
  }
  const count = Object.keys(entries).length;
  if (!count) return { ok: false, error: '복원할 기록이 없어요.' };
  return { ok: true, entries, count, savedAt: b.savedAt || null, hasProfile: !!entries[`${PREFIX}profile`] };
}

// ---------- v0.70 로그인 없이 기록 지키기(2026-11-12 사용자 결정: 로그인 없음 · 기기 저장 + 백업 안내) ----------
// 산 소원 부적·등불은 이 기기에만 있으므로, 결제 뒤 백업을 안 했거나 마지막 백업이 오래되면 안내한다.
export const BACKUP_INFO_KEY = `${PREFIX}backupinfo`;
export const STALE_DAYS = 30;     // 마지막 백업 뒤 이만큼 지나면 다시 안내(결제한 것이 있을 때)
export const SNOOZE_DAYS = 7;     // 「나중에」를 누르면 이만큼 쉼

const dNum = (k) => { const [y, m, d] = String(k).split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
/** 돈을 내고 만든 기록(소원 부적 'gold' · 100일 등불 'lantern') */
export const paidItems = (collection) => (collection || []).filter((r) => r && (r.paid === 'gold' || r.paid === 'lantern'));

/** 안내가 필요한가: 'paid'(결제한 뒤 아직 백업 안 함) · 'stale'(마지막 백업이 오래됨) · null */
export function backupNeed(info, collection, today) {
  const paid = paidItems(collection); if (!paid.length) return null;
  const i = info || {};
  if (i.snooze && dNum(today) < dNum(i.snooze)) return null;
  const lastPaid = Math.max(...paid.map((r) => dNum(r.madeKey || r.dateKey)));
  if (!i.last || dNum(i.last) < lastPaid) return 'paid';
  if (dNum(today) - dNum(i.last) >= STALE_DAYS) return 'stale';
  return null;
}
export const markBackedUp = (info, today) => ({ ...(info || {}), last: today, snooze: null, count: ((info || {}).count || 0) + 1 });
export const snoozeBackup = (info, today) => ({ ...(info || {}), snooze: shiftDay(today, SNOOZE_DAYS) });
/** 마지막 백업이 며칠 전인지(없으면 null) */
export const daysSinceBackup = (info, today) => (info?.last ? Math.round(dNum(today) - dNum(info.last)) : null);

/** 안내 문장 */
export function backupNudgeLine(need, info, today) {
  if (need === 'paid') return '산 소원 부적·등불은 이 기기에만 저장돼요. 폰을 바꾸거나 앱·사이트 기록을 지우면 사라질 수 있으니, 지금 기록을 백업해 두세요.';
  if (need === 'stale') return `마지막 백업이 ${daysSinceBackup(info, today)}일 전이에요. 그사이 쌓인 기록까지 한 번 더 백업해 두세요.`;
  return '';
}

/** 백업 안에 든 것 한 줄(가져오기 전에 보여 줌) */
export function backupSummary(b) {
  const col = b?.data?.[`${PREFIX}collection`];
  const list = Array.isArray(col) ? col : [];
  const lanterns = list.filter((r) => r?.paid === 'lantern').length;
  const wishes = list.filter((r) => r?.paid === 'gold').length;
  const parts = [];
  if (lanterns) parts.push(`100일 등불 ${lanterns}개`);
  if (wishes) parts.push(`소원 부적 ${wishes}장`);
  return parts.join(' · ');
}

// ---------- v0.70.4 카카오톡 안 브라우저에서 백업 ----------
// 사용자 확인(v0.70.3): 「지금 백업하기」 → 「지원하지 않는 파일 형식」 = 카카오톡 앱 안 브라우저가 내려받기를 막음.
// 게다가 앱 안 브라우저는 저장 공간이 따로라 크롬으로 그냥 열면 기록이 없음
// → 기록을 줄인 「12JISIN1:…」 코드를 주소 # 뒤에 붙여 바깥 브라우저로 넘기고(# 뒤는 서버로 안 감), 거기서 가져온 뒤 파일로 저장.
export const CODE_PREFIX = '12JISIN1:';
const toB64 = (buf) => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); };
const fromB64 = (b64) => { const s = atob(b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
export const canPack = () => typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';

/** 백업 → 「12JISIN1:…」 코드(줄일 수 없는 브라우저면 그냥 백업 글자) */
export async function packBackup(b) {
  const text = backupText(b);
  if (!canPack()) return text;
  const gz = await new Response(new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
  return CODE_PREFIX + toB64(gz);
}
/** 붙여 넣은 글자 → 백업 글자. 코드가 있으면 풀고(앞뒤 안내 문장·줄바꿈은 무시), 없으면 그대로 */
export async function unpackBackup(raw) {
  const s = String(raw || ''); const at = s.indexOf(CODE_PREFIX);
  if (at < 0) return s;
  if (!canPack()) throw new Error('이 브라우저에서는 백업 코드를 풀 수 없어요. 크롬·사파리 최신 버전에서 열어 주세요.');
  const code = s.slice(at + CODE_PREFIX.length).replace(/\s+/g, '').match(/^[A-Za-z0-9+/=]*/)[0];
  try {
    return await new Response(new Blob([fromB64(code)]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  } catch { throw new Error('백업 코드가 중간에 잘렸거나 바뀌었어요. 코드 전체를 다시 복사해 붙여 넣어 주세요.'); }
}
/** 카카오톡 등에 보낼 메시지(맨 앞 안내 한 줄 + 코드) */

/** 내려받기를 막는 앱 안 브라우저 */
export function inAppBrowser(ua = '') {
  const u = String(ua);
  if (/KAKAOTALK/i.test(u)) return 'kakao';
  if (/\bLine\//i.test(u)) return 'line';
  if (/NAVER\(inapp|NAVER/i.test(u) && !/Whale/i.test(u)) return 'naver';
  if (/Instagram/i.test(u)) return 'instagram';
  if (/FBAN|FBAV/i.test(u)) return 'facebook';
  if (/DaumApps|everytimeApp|BAND\//i.test(u)) return 'other';
  return null;
}
export const IN_APP_NAME = { kakao: '카카오톡', line: '라인', naver: '네이버 앱', instagram: '인스타그램', facebook: '페이스북', other: '앱' };
/** 바깥 브라우저로 여는 주소(카카오톡·라인은 앱이 지원하는 방법, 나머지는 null) */
export function externalOpenUrl(kind, url) {
  if (kind === 'kakao') return `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
  if (kind === 'line') { const [base, hash = ''] = String(url).split('#'); return `${base}${base.includes('?') ? '&' : '?'}openExternalBrowser=1${hash ? `#${hash}` : ''}`; }
  return null;
}
export const MOVE_HASH = '#bk=';
