// 이미지 그림(이미지 생성 도구로 만든 원본 → 배경 제거 → WebP) 목록과 불러오기
// - 목록은 tools/ingest.py가 assets 폴더를 훑어 js/asset-manifest.js로 자동 생성한다
// - 띠마다 대표 한복 1벌(오행과 무관) → 오행은 코드가 오라 빛·배경·오행 배지로 표현
//   나중에 `${띠}_s${단계}_${오행}` 파일을 추가하면 그 오행 사용자에게는 그 그림을 먼저 쓴다
// - 목록에 없으면 기존 SVG 그림. 승천 6~14단계는 5단계 그림 + 코드 효과
// - 스토리 카드·PNG 저장은 외부 파일 참조가 안 되므로 미리 data URL로 불러 둔다
import { CHAR_FILES, EMO_FILES } from './asset-manifest.js';

export const EL_NAME = ['wood', 'fire', 'earth', 'metal', 'water'];
export const CHAR_ASSETS = new Set(CHAR_FILES);
export const EMO_ASSETS = new Set(EMO_FILES);

const dataCache = new Map();
const url = (kind, key) => dataCache.get(`${kind}/${key}`) || `assets/${kind}/${key}.webp`;

/** 캐릭터 그림 주소 (없으면 null) */
export function charImage(zodiacKey, stage, el) {
  const s = Math.min(5, Math.max(1, stage));
  for (const key of [`${zodiacKey}_s${s}_${EL_NAME[el]}`, `${zodiacKey}_s${s}`]) if (CHAR_ASSETS.has(key)) return url('char', key);
  return null;
}

/** 표정 그림 주소 (없으면 null) */
export function emoImage(zodiacKey, mood, el) {
  for (const key of [`${zodiacKey}_${mood}_${EL_NAME[el]}`, `${zodiacKey}_${mood}`]) if (EMO_ASSETS.has(key)) return url('emo', key);
  return null;
}

/** 앱 시작 때 한 번: 내 띠 그림부터 data URL로 불러 두기 (스토리 카드·PNG 저장용) */
export async function preloadCharImages(zodiacKey) {
  if (typeof fetch !== 'function' || typeof FileReader === 'undefined') return 0;
  const pick = (set, kind) => [...set].filter((k) => !zodiacKey || k.startsWith(`${zodiacKey}_`)).map((k) => `${kind}/${k}`);
  const keys = [...pick(CHAR_ASSETS, 'char'), ...pick(EMO_ASSETS, 'emo')];
  let n = 0;
  await Promise.all(keys.map(async (key) => {
    if (dataCache.has(key)) return;
    try {
      const blob = await (await fetch(`assets/${key}.webp`)).blob();
      const data = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
      dataCache.set(key, data); n++;
    } catch { /* 불러오지 못하면 파일 주소를 그대로 쓴다 */ }
  }));
  return n;
}
