// 풍수 기운 스팟: 오늘의 행운 방향 × 용신 오행에 맞는 장소 유형으로 "기운 스팟" 3곳을 추천
// 위치는 기기 안에서만 계산하고 저장·전송하지 않는다.
import { seededRandom } from './saju.js';

// 오행별 기운을 돋우는 장소 유형 (풍수·오행 상징)
export const ELEMENT_PLACES = [
  [{ type: 'park', label: '숲·공원', icon: '🌳' }, { type: 'cafe', label: '식물 많은 카페', icon: '🪴' }, { type: 'bookstore', label: '서점·도서관', icon: '📚' }],
  [{ type: 'view', label: '전망대·높은 곳', icon: '🌇' }, { type: 'restaurant', label: '매콤한 맛집', icon: '🌶️' }, { type: 'sunny', label: '햇살 좋은 광장', icon: '☀️' }],
  [{ type: 'mountain', label: '산·언덕', icon: '⛰️' }, { type: 'korean', label: '한식당·도자기 공방', icon: '🍚' }, { type: 'field', label: '넓은 들판·운동장', icon: '🏟️' }],
  [{ type: 'temple', label: '종·탑이 있는 곳', icon: '🔔' }, { type: 'bakery', label: '하얀 베이커리', icon: '🥐' }, { type: 'gallery', label: '갤러리·전시관', icon: '🖼️' }],
  [{ type: 'lake', label: '호수·강가', icon: '🌊' }, { type: 'teahouse', label: '찻집', icon: '🍵' }, { type: 'aquarium', label: '분수·수족관', icon: '⛲' }],
];

const DIR_BEARING = { 동쪽: 90, 남쪽: 180, 서쪽: 270, 북쪽: 0, 중앙: null };
export const DEMO_CENTER = { lat: 37.5663, lng: 126.9779, label: '서울시청 (체험용 기준 위치)' };

/** 거리(m) */
export function distanceM(a, b) {
  const R = 6371000; const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad; const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function offset(center, bearingDeg, meters) {
  const rad = Math.PI / 180;
  const dLat = (meters * Math.cos(bearingDeg * rad)) / 111320;
  const dLng = (meters * Math.sin(bearingDeg * rad)) / (111320 * Math.cos(center.lat * rad));
  return { lat: center.lat + dLat, lng: center.lng + dLng };
}

/**
 * 오늘의 기운 스팟 3곳
 * @param center {lat,lng}, direction '동쪽'|'남쪽'|..., yongsin, weakest, seedKey
 */
export function dailySpots(center, { direction, yongsin, weakest, seedKey }) {
  const base = DIR_BEARING[direction];
  const dists = [400, 1000, 2200];
  const elements = [yongsin, weakest, yongsin];
  return dists.map((d, i) => {
    const jitter = (seededRandom(`${seedKey}|spot${i}`) - 0.5) * 60;
    const bearing = base === null ? (i * 120 + jitter + 360) % 360 : (base + jitter + 360) % 360;
    const el = elements[i];
    const places = ELEMENT_PLACES[el];
    const place = places[Math.floor(seededRandom(`${seedKey}|place${i}`) * places.length)];
    const pos = offset(center, bearing, d * (0.85 + seededRandom(`${seedKey}|d${i}`) * 0.3));
    return { id: `${seedKey}-${i}`, ...pos, bearing: Math.round(bearing), distance: Math.round(distanceM(center, pos)), element: el, ...place, tier: i };
  });
}

export const ARRIVE_RADIUS = 150;

/** 보물 상자: 멀수록 좋은 보물이 나올 확률이 높다 */
export function treasureRarity(r, tier) {
  const tables = [
    [['rare', 60], ['epic', 30], ['legend', 9], ['myth', 1]],
    [['rare', 35], ['epic', 45], ['legend', 17], ['myth', 3]],
    [['epic', 50], ['legend', 40], ['myth', 10]],
  ];
  const t = tables[tier] || tables[0];
  const total = t.reduce((s, [, w]) => s + w, 0);
  let acc = 0;
  for (const [k, w] of t) { acc += w; if (r * total < acc) return k; }
  return t[t.length - 1][0];
}

export function bearingName(b) {
  const names = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
  return names[Math.round(b / 45) % 8];
}

// 제휴 기운 스팟 예시 (정식 서비스에서는 제휴 매장 데이터로 대체)
export const PARTNER_SAMPLES = [
  { name: '청목 숲 카페 (예시)', element: 0, icon: '🪴', perk: '방문 인증 시 木 기운 +15 · 음료 10% 할인 쿠폰' },
  { name: '주작 화덕 식당 (예시)', element: 1, icon: '🔥', perk: '방문 인증 시 火 부적 확정 · 세트 메뉴 쿠폰' },
  { name: '황토 도자기 공방 (예시)', element: 2, icon: '🏺', perk: '방문 인증 시 土 기운 +15 · 체험 할인' },
  { name: '백금 종탑 전망대 (예시)', element: 3, icon: '🔔', perk: '방문 인증 시 金 부적 확정 · 입장권 할인' },
  { name: '현무 호수 찻집 (예시)', element: 4, icon: '🍵', perk: '방문 인증 시 水 기운 +15 · 찻값 할인' },
];
