// 이미지 그림(이미지 생성 도구로 만든 원본 → 배경 제거 → WebP) 목록과 불러오기
// - 목록은 tools/ingest.py가 assets 폴더를 훑어 js/asset-manifest.js로 자동 생성한다
// - 띠마다 대표 한복 1벌(오행과 무관) → 오행은 코드가 오라 빛·배경·오행 배지로 표현
//   나중에 `${띠}_s${단계}_${오행}` 파일을 추가하면 그 오행 사용자에게는 그 그림을 먼저 쓴다
// - 목록에 없으면 기존 SVG 그림. 승천 6~14단계는 5단계 그림 + 코드 효과
// - 스토리 카드·PNG 저장은 외부 파일 참조가 안 되므로 미리 data URL로 불러 둔다
import { CHAR_FILES, EMO_FILES, SCENE_FILES, CHARM_FILES, ITEM_FILES } from './asset-manifest.js';
import { TAROT_FILES } from './tarot-manifest.js';

export const EL_NAME = ['wood', 'fire', 'earth', 'metal', 'water'];
export const CHAR_ASSETS = new Set(CHAR_FILES);
export const EMO_ASSETS = new Set(EMO_FILES);
export const SCENE_ASSETS = new Set(SCENE_FILES || []);
export const CHARM_ASSETS = new Set(CHARM_FILES || []); // 부적 상징 emblem_{종류} · 부적 종이 paper_{classic|neon}
export const ITEM_ASSETS = new Set(ITEM_FILES || []);   // 계절 한정 소품 {시즌키}
export const TAROT_ASSETS = new Set(TAROT_FILES || []); // 타로 메이저 아르카나 m0~m21 (v0.43.1)

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

/** 부적 그림 주소: 'emblem_wealth' · 'paper_classic' (없으면 null → SVG) */
export function charmImage(name) { return CHARM_ASSETS.has(name) ? url('charm', name) : null; }
/** 타로 메이저 아르카나 그림 주소: 'm0'~'m21' (없으면 null → 코드 카드) */
export function tarotImage(key) { return TAROT_ASSETS.has(key) ? url('tarot', key) : null; }
/** 계절 한정 소품 그림 주소 (없으면 null) */
export function itemImage(seasonKey) { return ITEM_ASSETS.has(seasonKey) ? url('item', seasonKey) : null; }

/** 계절 장면 그림 주소 (꾸미기 세트의 배경, 없으면 null → SVG 장면) */
export function sceneImage(seasonKey) {
  return SCENE_ASSETS.has(seasonKey) ? url('scene', seasonKey) : null;
}

/** 스토리 카드처럼 캔버스로 그릴 때: 그 계절 장면만 data URL로 불러 두기 */
export async function preloadScene(seasonKey) {
  const key = `scene/${seasonKey}`;
  if (!SCENE_ASSETS.has(seasonKey) || dataCache.has(key) || typeof fetch !== 'function' || typeof FileReader === 'undefined') return false;
  try {
    const blob = await (await fetch(`assets/${key}.webp`)).blob();
    dataCache.set(key, await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); }));
    return true;
  } catch { return false; }
}

/** 앱 시작 때 한 번: 내 띠 그림부터 data URL로 불러 두기 (스토리 카드·PNG 저장용) */
export async function preloadCharImages(zodiacKey) {
  if (typeof fetch !== 'function' || typeof FileReader === 'undefined') return 0;
  const pick = (set, kind) => [...set].filter((k) => !zodiacKey || k.startsWith(`${zodiacKey}_`)).map((k) => `${kind}/${k}`);
  // 부적·소품 그림은 작아서(합계 약 300KB) 모두 함께 불러 둔다 → 부적 PNG 저장·스토리 카드에도 그림이 들어감
  const keys = [...pick(CHAR_ASSETS, 'char'), ...pick(EMO_ASSETS, 'emo'), ...[...CHARM_ASSETS].map((k) => `charm/${k}`), ...[...ITEM_ASSETS].map((k) => `item/${k}`)];
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
