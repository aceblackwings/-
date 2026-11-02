// 이미지 그림(이미지 생성 도구로 만든 원본 → 배경 제거 → WebP) 목록과 불러오기
// - 목록에 있는 조합만 이미지로 그리고, 없으면 기존 SVG 그림을 쓴다 (조금씩 교체)
// - 스토리 카드·PNG 저장은 SVG를 이미지로 바꿔 그리므로 외부 파일 참조가 안 된다 → 미리 data URL로 불러 둔다
export const EL_NAME = ['wood', 'fire', 'earth', 'metal', 'water'];

/** 들어 있는 캐릭터 그림: `${띠}_s${단계}_${오행}` */
export const CHAR_ASSETS = new Set([
  'tiger_s1_fire', 'tiger_s2_fire', 'tiger_s3_fire', 'tiger_s4_fire', 'tiger_s5_fire',
]);

/** 들어 있는 표정(이모티콘) 그림: `${띠}_${표정}_${오행}` — 그림 안에 표정 소품이 포함돼 있어 코드 소품은 생략 */
export const EMO_ASSETS = new Set(['smile', 'excited', 'fighting', 'love', 'wow', 'thanks', 'calm', 'sleepy'].map((m) => `tiger_${m}_fire`));

const dataCache = new Map();

/** 캐릭터 그림 주소 (없으면 null). 승천 6~14단계는 5단계 그림 + 코드 효과 */
export function charImage(zodiacKey, stage, el) {
  const key = `${zodiacKey}_s${Math.min(5, Math.max(1, stage))}_${EL_NAME[el]}`;
  if (!CHAR_ASSETS.has(key)) return null;
  return dataCache.get(key) || `assets/char/${key}.webp`;
}

/** 표정 그림 주소 (없으면 null) */
export function emoImage(zodiacKey, mood, el) {
  const key = `${zodiacKey}_${mood}_${EL_NAME[el]}`;
  if (!EMO_ASSETS.has(key)) return null;
  return dataCache.get(`emo/${key}`) || `assets/emo/${key}.webp`;
}

/** 앱 시작 때 한 번: 그림을 data URL로 불러 두기 (스토리 카드·PNG 저장용) */
export async function preloadCharImages(keys = [...CHAR_ASSETS, ...[...EMO_ASSETS].map((k) => `emo/${k}`)]) {
  if (typeof fetch !== 'function' || typeof FileReader === 'undefined') return 0;
  let n = 0;
  await Promise.all(keys.map(async (key) => {
    if (dataCache.has(key)) return;
    try {
      const path = key.startsWith('emo/') ? `assets/${key}.webp` : `assets/char/${key}.webp`;
      const blob = await (await fetch(path)).blob();
      const url = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
      dataCache.set(key, url); n++;
    } catch { /* 불러오지 못하면 파일 주소를 그대로 쓴다 */ }
  }));
  return n;
}
