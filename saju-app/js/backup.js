// 백업(v0.23): 이 기기에 저장된 앱 기록(unmyeong2099.*)을 파일·글자로 내보내고 다시 가져온다.
// 원칙 5: 서버로 보내지 않는다. 백업 파일 안에는 생년월일이 있으므로 화면에서 "다른 사람에게 보내지 마세요"를 안내한다.
// 순수 로직만 둔다(테스트: tests/backup.test.mjs)

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
export const backupFileName = (b) => `zodiac12-backup-${b.savedAt.slice(0, 10)}.json`;

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
