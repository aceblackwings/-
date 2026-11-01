// 12지신 수호 캐릭터 생성기 (SVG)
// 띠(연지) → 동물 / 일간 오행 → 한복 색 / 성별 → 한복 스타일 / 고민 → 소품
// 장착: 부적 2칸(허리·머리 옆), 이모티콘 1칸(표정 + 말풍선)

export const CONCERNS = [
  { key: 'exam', label: '시험·합격', title: '합격을 부르는', category: 'career', talisman: 'exam', stat: '합격운' },
  { key: 'job', label: '취업', title: '취업 문을 여는', category: 'career', talisman: 'luck', stat: '취업운' },
  { key: 'wealth', label: '재물', title: '재물을 모으는', category: 'wealth', talisman: 'wealth', stat: '재물운' },
  { key: 'business', label: '사업', title: '사업을 키우는', category: 'wealth', talisman: 'wealth', stat: '사업운' },
  { key: 'love', label: '연애', title: '인연을 잇는', category: 'love', talisman: 'love', stat: '연애운' },
  { key: 'marriage', label: '결혼', title: '백년가약을 맺는', category: 'love', talisman: 'love', stat: '결혼운' },
  { key: 'health', label: '건강', title: '기운을 북돋는', category: 'health', talisman: 'health', stat: '건강운' },
  { key: 'people', label: '인간관계', title: '사람을 모으는', category: 'social', talisman: 'luck', stat: '인복' },
  { key: 'change', label: '이직·이사', title: '새 길을 여는', category: 'total', talisman: 'protect', stat: '변화운' },
];

export const ZODIAC = [
  { key: 'rat', name: '쥐', hanja: '子', base: '#c9c4dc', dark: '#6f6890', light: '#f1eefa', inner: '#ffb3c7' },
  { key: 'ox', name: '소', hanja: '丑', base: '#f6e7d2', dark: '#7a5236', light: '#fff8ee', inner: '#ffb3a7' },
  { key: 'tiger', name: '호랑이', hanja: '寅', base: '#ffb347', dark: '#9a4f12', light: '#fff4e3', inner: '#ffd2a8' },
  { key: 'rabbit', name: '토끼', hanja: '卯', base: '#fff5f8', dark: '#b07d92', light: '#ffffff', inner: '#ffb7cf' },
  { key: 'dragon', name: '용', hanja: '辰', base: '#7fe0c0', dark: '#1f7a62', light: '#dcfff3', inner: '#bff5e3' },
  { key: 'snake', name: '뱀', hanja: '巳', base: '#a8e878', dark: '#3f7a1f', light: '#ecffd9', inner: '#d6f7b8' },
  { key: 'horse', name: '말', hanja: '午', base: '#d9a06b', dark: '#6b3f1f', light: '#f9e2c8', inner: '#f3c19a' },
  { key: 'sheep', name: '양', hanja: '未', base: '#fffaf0', dark: '#9c8a6e', light: '#ffffff', inner: '#ffd9c2' },
  { key: 'monkey', name: '원숭이', hanja: '申', base: '#c48b5c', dark: '#5f3a1d', light: '#f6dcc0', inner: '#f0b998' },
  { key: 'rooster', name: '닭', hanja: '酉', base: '#fffdf6', dark: '#a08c6a', light: '#ffffff', inner: '#ffe0b0' },
  { key: 'dog', name: '개', hanja: '戌', base: '#efbd7d', dark: '#8a5320', light: '#fff6e8', inner: '#ffe2c4' },
  { key: 'pig', name: '돼지', hanja: '亥', base: '#ffc9d6', dark: '#b4567a', light: '#ffeef3', inner: '#ff9fb8' },
];

// 오행별 한복 색: [저고리, 치마/바지, 네온 트림, 고름]
const OUTFIT = [
  ['#33c27a', '#1d6f53', '#39FF88', '#ffd166'],
  ['#ff5a7a', '#a8233f', '#FF2E63', '#ffd166'],
  ['#f4b740', '#9a6510', '#FFC93C', '#ff5a7a'],
  ['#d6d8ec', '#6e7192', '#E0E0FF', '#4fc3ff'],
  ['#3a7bea', '#1b3c80', '#00E5FF', '#ff5a7a'],
];
export const ELEMENT_COLOR_NAME = ['푸른', '붉은', '황금', '하얀', '검은'];

export const EMOTES = [
  { key: 'smile', label: '행운', caption: '오늘도 럭키 ✦', icon: '🍀' },
  { key: 'excited', label: '기쁨', caption: '운 최고!', icon: '✨' },
  { key: 'fighting', label: '화이팅', caption: '액운 차단!', icon: '🔥' },
  { key: 'love', label: '사랑', caption: '인연 도착', icon: '💗' },
  { key: 'wow', label: '놀람', caption: '대박 예감', icon: '⭐' },
  { key: 'thanks', label: '감사', caption: '복 받으세요', icon: '🙏' },
  { key: 'calm', label: '평온', caption: '마음 평화', icon: '🍵' },
  { key: 'sleepy', label: '졸림', caption: '기운 충전중', icon: '💤' },
];

let uid = 0;
const nextId = () => `c${(uid++).toString(36)}`;

// ---------- 부위별 그리기 ----------

function tail(a, z, id) {
  const s = `stroke="${z.dark}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
  switch (z.key) {
    case 'rat': return `<path d="M214 340 q46 -6 44 -40 q-2 -22 -22 -18" fill="none" stroke="${z.inner}" stroke-width="7" stroke-linecap="round"/>`;
    case 'ox': return `<path d="M214 338 q30 -4 34 -36" fill="none" stroke="${z.dark}" stroke-width="6" stroke-linecap="round"/><path d="M240 300 q14 -6 14 -18 q-12 2 -18 12 z" fill="${z.dark}"/>`;
    case 'tiger': return `<path d="M214 340 q44 4 50 -34 q4 -24 -14 -30" fill="none" stroke="${z.base}" stroke-width="16" stroke-linecap="round"/><path d="M252 318 l14 4 M258 296 l14 0 M250 278 l12 -6" stroke="#3a2412" stroke-width="5" stroke-linecap="round"/>`;
    case 'rabbit': return `<circle cx="214" cy="340" r="16" fill="${z.light}" ${s}/>`;
    case 'dragon': return `<path d="M210 344 q50 10 60 -30 q6 -30 -16 -40" fill="none" stroke="${z.base}" stroke-width="18" stroke-linecap="round"/><path d="M254 274 q-8 -20 6 -32 q2 14 12 16 q-2 12 -18 16 z" fill="#ff8a3d" stroke="#ff5a1f" stroke-width="2"/><path d="M262 322 l10 -4 M268 300 l10 -2" stroke="${z.dark}" stroke-width="3" stroke-linecap="round"/>`;
    case 'snake': return `<path d="M200 352 q70 10 62 -36 q-6 -30 -40 -18 q-26 10 -6 30" fill="none" stroke="${z.base}" stroke-width="20" stroke-linecap="round"/><path d="M200 352 q70 10 62 -36 q-6 -30 -40 -18 q-26 10 -6 30" fill="none" stroke="${z.dark}" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round"/>`;
    case 'horse': return `<path d="M212 330 q40 0 44 40 q-24 -8 -30 -24 q0 20 -12 30 q-8 -26 -2 -46" fill="${z.dark}"/>`;
    case 'sheep': return `<circle cx="216" cy="336" r="14" fill="${z.light}" ${s}/>`;
    case 'monkey': return `<path d="M212 342 q52 6 52 -44 q0 -30 -26 -26 q-18 4 -10 22" fill="none" stroke="${z.base}" stroke-width="9" stroke-linecap="round"/>`;
    case 'rooster': return `<path d="M210 330 q30 -40 54 -36 q-14 16 -16 30 q18 -16 34 -6 q-20 8 -24 26 q-22 -4 -48 -14 z" fill="#ff5a5a"/><path d="M214 334 q34 -22 50 -8 q-20 6 -22 22 z" fill="#3fa9f5"/>`;
    case 'dog': return `<path d="M212 336 q30 -2 34 -26 q2 -18 -16 -16 q-10 2 -6 14" fill="none" stroke="${z.base}" stroke-width="14" stroke-linecap="round"/><path d="M230 296 q-8 2 -6 14" fill="none" stroke="${z.light}" stroke-width="6" stroke-linecap="round"/>`;
    case 'pig': return `<path d="M214 334 q16 -4 14 -16 q-2 -10 -10 -6 q-6 4 2 10 q8 6 16 -2" fill="none" stroke="${z.dark}" stroke-width="4" stroke-linecap="round"/>`;
    default: return '';
  }
}

function earsBehind(z) {
  const s = `stroke="${z.dark}" stroke-width="4" stroke-linejoin="round"`;
  switch (z.key) {
    case 'rat': return `<circle cx="88" cy="104" r="40" fill="${z.base}" ${s}/><circle cx="232" cy="104" r="40" fill="${z.base}" ${s}/><circle cx="88" cy="104" r="24" fill="${z.inner}"/><circle cx="232" cy="104" r="24" fill="${z.inner}"/>`;
    case 'ox': return `<path d="M76 132 q-30 -2 -40 -16 q24 -14 50 0 z" fill="${z.base}" ${s}/><path d="M244 132 q30 -2 40 -16 q-24 -14 -50 0 z" fill="${z.base}" ${s}/><path d="M96 104 q-26 -26 -14 -60 q14 26 40 36 z" fill="#ffe08a" stroke="#b8862b" stroke-width="4" stroke-linejoin="round"/><path d="M224 104 q26 -26 14 -60 q-14 26 -40 36 z" fill="#ffe08a" stroke="#b8862b" stroke-width="4" stroke-linejoin="round"/>`;
    case 'tiger': return `<circle cx="92" cy="106" r="28" fill="${z.base}" ${s}/><circle cx="228" cy="106" r="28" fill="${z.base}" ${s}/><circle cx="92" cy="108" r="14" fill="${z.light}"/><circle cx="228" cy="108" r="14" fill="${z.light}"/>`;
    case 'rabbit': return `<path d="M112 108 q-22 -80 6 -96 q26 16 16 92 z" fill="${z.base}" ${s}/><path d="M208 108 q22 -80 -6 -96 q-26 16 -16 92 z" fill="${z.base}" ${s}/><path d="M118 100 q-12 -58 2 -74 q12 14 8 72 z" fill="${z.inner}"/><path d="M202 100 q12 -58 -2 -74 q-12 14 -8 72 z" fill="${z.inner}"/>`;
    case 'dragon': return `<path d="M110 100 q-14 -40 -2 -70 M108 62 q-18 -6 -24 -22 M110 46 q12 -12 8 -26" fill="none" stroke="#f4c542" stroke-width="9" stroke-linecap="round"/><path d="M210 100 q14 -40 2 -70 M212 62 q18 -6 24 -22 M210 46 q-12 -12 -8 -26" fill="none" stroke="#f4c542" stroke-width="9" stroke-linecap="round"/><path d="M80 150 q-24 -4 -34 -22 q22 -6 40 6 z M240 150 q24 -4 34 -22 q-22 -6 -40 6 z" fill="${z.base}" ${s}/>`;
    case 'snake': return `<path d="M70 150 q90 -130 180 0" fill="${z.dark}" opacity="0.25"/>`;
    case 'horse': return `<path d="M100 112 q-14 -50 4 -66 q18 18 24 56 z" fill="${z.base}" ${s}/><path d="M220 112 q14 -50 -4 -66 q-18 18 -24 56 z" fill="${z.base}" ${s}/><path d="M106 102 q-6 -32 2 -42 q10 14 12 38 z M214 102 q6 -32 -2 -42 q-10 14 -12 38 z" fill="${z.inner}"/>`;
    case 'sheep': return `<path d="M74 140 q-34 6 -44 -8 q20 -18 48 -6 z" fill="${z.base}" ${s}/><path d="M246 140 q34 6 44 -8 q-20 -18 -48 -6 z" fill="${z.base}" ${s}/>`;
    case 'monkey': return `<circle cx="66" cy="168" r="30" fill="${z.base}" ${s}/><circle cx="254" cy="168" r="30" fill="${z.base}" ${s}/><circle cx="66" cy="168" r="17" fill="${z.light}"/><circle cx="254" cy="168" r="17" fill="${z.light}"/>`;
    case 'rooster': return `<path d="M128 98 q-6 -36 18 -40 q4 -26 26 -22 q16 -20 32 2 q22 2 14 34 q-40 -2 -90 26 z" fill="#ff4d4d" stroke="#b81f2f" stroke-width="4" stroke-linejoin="round"/>`;
    case 'dog': return `<path d="M88 132 q-12 -60 18 -76 q24 26 32 56 z" fill="${z.base}" ${s}/><path d="M232 132 q12 -60 -18 -76 q-24 26 -32 56 z" fill="${z.base}" ${s}/><path d="M98 118 q-6 -38 10 -50 q14 18 18 40 z M222 118 q6 -38 -10 -50 q-14 18 -18 40 z" fill="${z.light}"/>`;
    case 'pig': return `<path d="M86 124 q-14 -48 16 -56 q20 18 26 44 z" fill="${z.base}" ${s}/><path d="M234 124 q14 -48 -16 -56 q-20 18 -26 44 z" fill="${z.base}" ${s}/><path d="M96 112 q-6 -28 8 -34 q10 12 14 28 z M224 112 q6 -28 -8 -34 q-10 12 -14 28 z" fill="${z.inner}"/>`;
    default: return '';
  }
}

function headShape(z) {
  const s = `stroke="${z.dark}" stroke-width="4"`;
  if (z.key === 'sheep') {
    // 양털 구름 머리
    const puffs = [[96, 120], [124, 98], [160, 90], [196, 98], [224, 120], [240, 150], [80, 150]];
    return `<ellipse cx="160" cy="180" rx="90" ry="80" fill="${z.base}" ${s}/>${puffs.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="26" fill="#ffffff" ${s}/>`).join('')}<ellipse cx="160" cy="190" rx="70" ry="60" fill="${z.inner}" opacity="0.35"/><path d="M84 130 q-30 10 -20 40 q14 14 26 -2 q8 -14 -6 -18" fill="none" stroke="#c9a77a" stroke-width="9" stroke-linecap="round"/><path d="M236 130 q30 10 20 40 q-14 14 -26 -2 q-8 -14 6 -18" fill="none" stroke="#c9a77a" stroke-width="9" stroke-linecap="round"/>`;
  }
  if (z.key === 'snake') return `<ellipse cx="160" cy="178" rx="98" ry="78" fill="${z.base}" ${s}/>`;
  return `<ellipse cx="160" cy="178" rx="92" ry="82" fill="${z.base}" ${s}/>`;
}

function faceMarks(z) {
  switch (z.key) {
    case 'rat': return `<ellipse cx="160" cy="214" rx="34" ry="22" fill="${z.light}"/>`;
    case 'ox': return `<ellipse cx="104" cy="140" rx="22" ry="16" fill="#8a5a3c" opacity="0.85"/><ellipse cx="160" cy="220" rx="48" ry="28" fill="${z.inner}" stroke="${z.dark}" stroke-width="3"/><ellipse cx="146" cy="220" rx="5" ry="7" fill="${z.dark}"/><ellipse cx="174" cy="220" rx="5" ry="7" fill="${z.dark}"/>`;
    case 'tiger': return `<ellipse cx="160" cy="214" rx="46" ry="30" fill="${z.light}"/><path d="M146 112 h28 M140 126 h40 M146 140 h28 M160 112 v28" stroke="#3a2412" stroke-width="6" stroke-linecap="round"/><path d="M72 170 l22 4 M74 190 l20 0 M248 170 l-22 4 M246 190 l-20 0" stroke="#3a2412" stroke-width="6" stroke-linecap="round"/>`;
    case 'rabbit': return `<ellipse cx="160" cy="212" rx="30" ry="20" fill="${z.light}"/>`;
    case 'dragon': return `<ellipse cx="160" cy="216" rx="44" ry="28" fill="${z.light}"/><path d="M120 108 l10 -22 l10 20 M150 100 l10 -24 l10 24 M180 102 l10 -20 l10 22" fill="#f4c542" stroke="#b8862b" stroke-width="3" stroke-linejoin="round"/><path d="M118 220 q-50 4 -62 30 M202 220 q50 4 62 30" fill="none" stroke="#f4c542" stroke-width="4" stroke-linecap="round"/>`;
    case 'snake': return `<path d="M150 112 l10 -12 l10 12 l-10 12 z M134 132 l8 -8 l8 8 l-8 8 z M170 132 l8 -8 l8 8 l-8 8 z" fill="${z.dark}" opacity="0.55"/><ellipse cx="160" cy="214" rx="40" ry="22" fill="${z.light}"/>`;
    case 'horse': return `<path d="M128 104 q14 -30 40 -24 q-8 10 2 14 q14 -8 26 4 q-20 4 -22 24 q-24 -14 -46 -18 z" fill="${z.dark}"/><ellipse cx="160" cy="220" rx="46" ry="30" fill="${z.light}"/><ellipse cx="146" cy="222" rx="4" ry="6" fill="${z.dark}"/><ellipse cx="174" cy="222" rx="4" ry="6" fill="${z.dark}"/>`;
    case 'monkey': return `<path d="M160 228 q-62 4 -66 -44 q-2 -30 30 -36 q20 -2 36 16 q16 -18 36 -16 q32 6 30 36 q-4 48 -66 44 z" fill="${z.light}"/>`;
    case 'rooster': return `<path d="M150 212 l10 14 l10 -14 z" fill="#ffb627" stroke="#c97a00" stroke-width="3" stroke-linejoin="round"/><path d="M156 228 q4 18 8 0" fill="#ff4d4d"/>`;
    case 'dog': return `<ellipse cx="160" cy="216" rx="46" ry="32" fill="${z.light}"/><circle cx="124" cy="160" r="7" fill="${z.light}"/><circle cx="196" cy="160" r="7" fill="${z.light}"/>`;
    case 'pig': return `<ellipse cx="160" cy="218" rx="30" ry="20" fill="${z.inner}" stroke="${z.dark}" stroke-width="3"/><ellipse cx="150" cy="218" rx="5" ry="7" fill="${z.dark}"/><ellipse cx="170" cy="218" rx="5" ry="7" fill="${z.dark}"/>`;
    default: return '';
  }
}

function noseMouth(z, mood) {
  const ink = '#2a1d2e';
  const hasOwnNose = ['ox', 'horse', 'pig', 'rooster'].includes(z.key);
  const nose = hasOwnNose ? '' : `<path d="M154 204 q6 6 12 0 q-6 -4 -12 0 z" fill="${z.key === 'rat' || z.key === 'rabbit' ? '#ff8fab' : ink}"/>`;
  const my = hasOwnNose ? 240 : 214;
  let mouth;
  switch (mood) {
    case 'excited': mouth = `<path d="M146 ${my} q14 22 28 0 z" fill="#ff6b8b" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>`; break;
    case 'wow': mouth = `<ellipse cx="160" cy="${my + 6}" rx="8" ry="10" fill="#ff6b8b" stroke="${ink}" stroke-width="3"/>`; break;
    case 'fighting': mouth = `<path d="M148 ${my + 4} q12 -8 24 0" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`; break;
    case 'sleepy': mouth = `<ellipse cx="160" cy="${my + 4}" rx="5" ry="6" fill="${ink}"/>`; break;
    case 'calm': mouth = `<path d="M152 ${my + 2} h16" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`; break;
    default: mouth = `<path d="M148 ${my} q6 8 12 0 q6 8 12 0" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  const extra = z.key === 'rabbit' ? `<rect x="154" y="${my + 2}" width="12" height="10" rx="2" fill="#fff" stroke="${ink}" stroke-width="2"/>` : '';
  const tongue = z.key === 'snake' && mood !== 'sleepy' ? `<path d="M160 ${my + 6} v10 l-5 6 M160 ${my + 16} l5 6" stroke="#ff4d6d" stroke-width="3" fill="none" stroke-linecap="round"/>` : '';
  const whiskers = ['rat', 'tiger', 'rabbit'].includes(z.key) ? `<path d="M110 206 l-34 -6 M110 214 l-34 6 M210 206 l34 -6 M210 214 l34 6" stroke="${z.dark}" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>` : '';
  return nose + mouth + extra + tongue + whiskers;
}

function eyes(mood, female) {
  const ink = '#241b2f';
  const L = 124; const R = 196; const Y = 180;
  const lashes = female ? `<path d="M${L - 13} ${Y - 8} l-7 -5 M${L - 10} ${Y - 13} l-4 -7 M${R + 13} ${Y - 8} l7 -5 M${R + 10} ${Y - 13} l4 -7" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>` : '';
  const sparkle = (x) => `<ellipse cx="${x}" cy="${Y}" rx="13" ry="15" fill="${ink}"/><ellipse cx="${x}" cy="${Y + 6}" rx="9" ry="6" fill="#5b4a8a" opacity="0.6"/><circle cx="${x + 5}" cy="${Y - 6}" r="5" fill="#fff"/><circle cx="${x - 4}" cy="${Y + 5}" r="2.5" fill="#fff"/>`;
  switch (mood) {
    case 'excited':
    case 'thanks':
      return `<path d="M${L - 13} ${Y + 4} q13 -18 26 0 M${R - 13} ${Y + 4} q13 -18 26 0" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    case 'calm':
      return `<path d="M${L - 12} ${Y} q12 8 24 0 M${R - 12} ${Y} q12 8 24 0" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round"/>${lashes}`;
    case 'sleepy':
      return `<path d="M${L - 12} ${Y + 2} h24 M${R - 12} ${Y + 2} h24" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`;
    case 'love': {
      const heart = (x) => `<path d="M${x} ${Y + 12} l-13 -13 a7.5 7.5 0 0 1 13 -9 a7.5 7.5 0 0 1 13 9 z" fill="#ff4d7d" stroke="#c2185b" stroke-width="2"/><circle cx="${x - 5}" cy="${Y - 4}" r="2.5" fill="#fff"/>`;
      return heart(L) + heart(R);
    }
    case 'wow': {
      const star = (x) => `<path d="M${x} ${Y - 16} l4.5 10 l11 1 l-8.5 7.5 l2.5 11 l-9.5 -6 l-9.5 6 l2.5 -11 l-8.5 -7.5 l11 -1 z" fill="#ffd166" stroke="#c98a00" stroke-width="2" stroke-linejoin="round"/>`;
      return star(L) + star(R);
    }
    case 'fighting':
      return `${sparkle(L)}${sparkle(R)}<path d="M${L - 16} ${Y - 26} l26 8 M${R + 16} ${Y - 26} l-26 8" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`;
    default:
      return sparkle(L) + sparkle(R) + lashes;
  }
}

function cheeks(z) {
  const c = z.key === 'pig' ? '#ff7fa0' : '#ff8fab';
  return `<ellipse cx="102" cy="206" rx="14" ry="9" fill="${c}" opacity="0.55"/><ellipse cx="218" cy="206" rx="14" ry="9" fill="${c}" opacity="0.55"/>`;
}

function outfit(el, female, id) {
  const [top, bottom, trim, ribbon] = OUTFIT[el];
  const glow = `filter="url(#${id}-glow)"`;
  if (female) {
    return `
    <path d="M100 316 Q160 300 220 316 L238 368 Q160 388 82 368 Z" fill="${bottom}" stroke="#1a1030" stroke-width="3" stroke-linejoin="round"/>
    <path d="M100 316 Q160 300 220 316" fill="none" stroke="${trim}" stroke-width="3" ${glow}/>
    <path d="M86 364 Q160 384 234 364" fill="none" stroke="${trim}" stroke-width="3" ${glow}/>
    <path d="M116 270 Q160 252 204 270 L214 318 Q160 330 106 318 Z" fill="${top}" stroke="#1a1030" stroke-width="3" stroke-linejoin="round"/>
    <path d="M136 262 L160 300 L184 262" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>
    <path d="M160 300 q-6 10 -16 34 M160 300 q10 14 6 42" fill="none" stroke="${ribbon}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="160" cy="300" r="6" fill="${ribbon}"/>`;
  }
  return `
    <path d="M104 272 Q160 252 216 272 L230 356 Q160 376 90 356 Z" fill="${top}" stroke="#1a1030" stroke-width="3" stroke-linejoin="round"/>
    <path d="M136 262 L160 306 L184 262" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round"/>
    <rect x="98" y="318" width="124" height="14" rx="6" fill="${bottom}" stroke="#1a1030" stroke-width="2"/>
    <path d="M98 325 h124" stroke="${trim}" stroke-width="2.5" ${glow}/>
    <path d="M94 352 Q160 372 226 352" fill="none" stroke="${trim}" stroke-width="3" ${glow}/>
    <path d="M168 300 q14 8 10 30 M168 300 q-4 14 -14 22" fill="none" stroke="${ribbon}" stroke-width="6" stroke-linecap="round"/>`;
}

function arms(z, el) {
  const [top] = OUTFIT[el];
  return `
  <path d="M110 282 q-28 18 -26 52" fill="none" stroke="${top}" stroke-width="30" stroke-linecap="round"/>
  <path d="M210 282 q28 18 26 52" fill="none" stroke="${top}" stroke-width="30" stroke-linecap="round"/>
  <path d="M84 326 q8 6 16 2 M236 326 q-8 6 -16 2" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/>
  <circle cx="88" cy="340" r="14" fill="${z.base}" stroke="${z.dark}" stroke-width="3.5"/>
  <circle cx="232" cy="340" r="14" fill="${z.base}" stroke="${z.dark}" stroke-width="3.5"/>`;
}

function feet(z) {
  return `<ellipse cx="134" cy="372" rx="20" ry="12" fill="${z.base}" stroke="${z.dark}" stroke-width="3.5"/><ellipse cx="186" cy="372" rx="20" ry="12" fill="${z.base}" stroke="${z.dark}" stroke-width="3.5"/>`;
}

function prop(concern) {
  const x = 232; const y = 330;
  switch (concern) {
    case 'exam': return `<g transform="translate(${x} ${y}) rotate(18)"><rect x="-4" y="-46" width="8" height="54" rx="3" fill="#8a5a2b" stroke="#4a2c12" stroke-width="2"/><path d="M-6 -46 q6 -20 12 0 z" fill="#1d1d2b"/><rect x="-6" y="0" width="12" height="6" fill="#d4a017"/></g>`;
    case 'job': return `<g transform="translate(${x + 4} ${y + 10})"><rect x="-22" y="-14" width="44" height="30" rx="5" fill="#8b5a2b" stroke="#4a2c12" stroke-width="3"/><path d="M-8 -14 v-6 h16 v6" fill="none" stroke="#4a2c12" stroke-width="3"/><rect x="-5" y="-2" width="10" height="6" rx="1" fill="#ffd166"/></g>`;
    case 'wealth': return `<g transform="translate(${x + 2} ${y + 6})"><path d="M-20 -6 q-6 26 20 26 q26 0 20 -26 q-8 -6 -20 -6 q-12 0 -20 6 z" fill="#e63946" stroke="#8d1b25" stroke-width="3"/><path d="M-12 -12 q12 8 24 0" fill="none" stroke="#ffd166" stroke-width="4"/><text x="0" y="12" font-size="16" text-anchor="middle" fill="#ffd166" font-weight="800" font-family="serif">福</text><circle cx="22" cy="-18" r="7" fill="#ffd166" stroke="#c98a00" stroke-width="2"/><rect x="19.5" y="-20.5" width="5" height="5" fill="#c98a00"/></g>`;
    case 'business': return `<g transform="translate(${x + 2} ${y + 6})"><path d="M-24 4 q4 -16 24 -16 q20 0 24 16 q-24 12 -48 0 z" fill="#ffd166" stroke="#c98a00" stroke-width="3"/><ellipse cx="0" cy="-6" rx="12" ry="7" fill="#ffe8a3" stroke="#c98a00" stroke-width="2"/><path d="M-30 -18 l6 4 M28 -20 l-5 5 M0 -30 v6" stroke="#ffd166" stroke-width="3" stroke-linecap="round"/></g>`;
    case 'love': return `<g transform="translate(${x + 2} ${y - 4})"><path d="M0 26 v-18" stroke="#8a5a2b" stroke-width="4"/><path d="M0 18 l-28 -28 a14 14 0 0 1 28 -12 a14 14 0 0 1 28 12 z" fill="#ff6b9d" stroke="#c2185b" stroke-width="3"/><path d="M0 12 l-16 -18 M0 12 l0 -24 M0 12 l16 -18" stroke="#ffd1e0" stroke-width="2"/></g>`;
    case 'marriage': return `<g transform="translate(${x + 2} ${y - 6})"><path d="M0 -34 v8" stroke="#4a2c12" stroke-width="3"/><rect x="-14" y="-26" width="28" height="22" rx="4" fill="#e63946" stroke="#8d1b25" stroke-width="2.5"/><rect x="-14" y="-4" width="28" height="22" rx="4" fill="#2d6cdf" stroke="#1b3c80" stroke-width="2.5"/><path d="M-6 18 v10 M0 18 v12 M6 18 v10" stroke="#ffd166" stroke-width="2.5"/><circle cx="0" cy="-4" r="16" fill="#fff3b0" opacity="0.35"/></g>`;
    case 'health': return `<g transform="translate(${x + 2} ${y + 2})"><path d="M0 18 q-22 -2 -20 -20 q2 -16 20 -14 q18 -2 20 14 q2 18 -20 20 z" fill="#ffb3c1" stroke="#e05780" stroke-width="3"/><path d="M0 -14 q2 16 0 30" stroke="#e05780" stroke-width="2" fill="none"/><path d="M0 -14 q10 -16 22 -10 q-10 12 -22 10 z" fill="#52b788" stroke="#2d6a4f" stroke-width="2"/></g>`;
    case 'people': return `<g transform="translate(${x + 2} ${y})"><path d="M0 -24 v8" stroke="#8d1b25" stroke-width="3"/><path d="M0 -16 l12 12 l-12 12 l-12 -12 z" fill="#e63946" stroke="#8d1b25" stroke-width="3"/><path d="M-6 -4 h12 M0 -10 v12" stroke="#ffd166" stroke-width="2.5"/><path d="M-6 8 q-4 18 -2 26 M0 8 v28 M6 8 q4 18 2 26" stroke="#e63946" stroke-width="3" fill="none"/></g>`;
    case 'change': return `<g transform="translate(${x + 2} ${y + 4})"><circle r="20" fill="#ffd166" stroke="#c98a00" stroke-width="3"/><circle r="14" fill="#fff8e1"/><path d="M0 -12 l5 12 l-5 12 l-5 -12 z" fill="#e63946"/><path d="M0 0 l5 12 l-5 -12" fill="#2d6cdf"/><circle r="2.5" fill="#4a2c12"/></g>`;
    default: return '';
  }
}

function headAccessory(concern, female, el, z) {
  let out = '';
  if (female) {
    // 뒤꽂이 꽃 장식 + 댕기
    out += `<g transform="translate(232 112)"><circle r="12" fill="#ff8fab" stroke="#c2185b" stroke-width="2"/><circle cx="-12" cy="-6" r="9" fill="#ffd166" stroke="#c98a00" stroke-width="2"/><circle r="4" fill="#fff"/><path d="M6 10 q10 30 -4 50" stroke="${OUTFIT[el][3]}" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
  } else {
    // 작은 상투 관(冠)
    out += `<g transform="translate(160 ${z.key === 'sheep' ? 70 : 96})"><path d="M-14 6 q14 -30 28 0 z" fill="#1d1d2b" stroke="#000" stroke-width="2"/><rect x="-16" y="4" width="32" height="6" rx="3" fill="${OUTFIT[el][2]}"/></g>`;
  }
  if (concern === 'exam') {
    out += `<path d="M70 150 q90 -34 180 0" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/><path d="M70 150 q90 -34 180 0" fill="none" stroke="#e63946" stroke-width="2" stroke-dasharray="0" opacity="0.4"/><text x="160" y="140" font-size="18" font-weight="800" text-anchor="middle" fill="#e63946" font-family="'Song Myung', serif">合 格</text>`;
  }
  return out;
}

// ---------- 장착 아이템 ----------

const RARITY_GLOW = { common: '#9aa3b2', rare: '#4fc3ff', epic: '#c77dff', legend: '#ffc93c', myth: '#ff4d6d' };

function miniCharm(t, x, y, rot, scale = 1) {
  if (!t) return '';
  const neon = t.theme === 'neon';
  const paper = neon ? '#0d0a1f' : '#f5d572';
  const ink = neon ? (['#39FF88', '#FF2E63', '#FFC93C', '#E0E0FF', '#00E5FF'][t.element]) : '#b3201b';
  const glow = RARITY_GLOW[t.rarity.key] || '#fff';
  const ch = t.type.hanja;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${scale})">
    <path d="M0 -26 v-14" stroke="#c9a77a" stroke-width="2"/>
    <rect x="-15" y="-26" width="30" height="54" rx="3" fill="${paper}" stroke="${glow}" stroke-width="3" style="filter:drop-shadow(0 0 6px ${glow})"/>
    <rect x="-11" y="-22" width="22" height="46" fill="none" stroke="${ink}" stroke-width="1.2"/>
    <text x="0" y="-8" font-size="13" text-anchor="middle" fill="${ink}" font-weight="800" font-family="'Song Myung', serif">${ch[0]}</text>
    <text x="0" y="9" font-size="13" text-anchor="middle" fill="${ink}" font-weight="800" font-family="'Song Myung', serif">${ch[1]}</text>
    <path d="M-6 16 q6 6 12 0" stroke="${ink}" stroke-width="1.5" fill="none"/>
  </g>`;
}

function emoteBubble(emote) {
  if (!emote) return '';
  return `<g transform="translate(262 70)">
    <path d="M-34 -26 h68 a12 12 0 0 1 12 12 v24 a12 12 0 0 1 -12 12 h-40 l-14 14 l2 -14 h-16 a12 12 0 0 1 -12 -12 v-24 a12 12 0 0 1 12 -12 z" fill="#fff" stroke="#241b2f" stroke-width="3"/>
    <text x="0" y="8" font-size="26" text-anchor="middle">${emote.icon}</text>
  </g>`;
}

// ---------- 진화 단계 장식 ----------

function eggShell() {
  return `<path d="M98 384 l10 -18 l10 12 l12 -16 l10 14 l12 -14 l10 16 l12 -12 l10 14 l10 -16 l10 20 q-58 14 -116 0 z" fill="#fffaf0" stroke="#c9b48a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M60 372 l8 -10 l8 8 l-4 8 z M252 368 l10 -8 l6 10 l-8 6 z" fill="#fffaf0" stroke="#c9b48a" stroke-width="2.5"/>`;
}

function bib(el) {
  return `<path d="M136 272 q24 30 48 0 q4 26 -24 34 q-28 -8 -24 -34 z" fill="#fff" stroke="#d9d3ef" stroke-width="2.5"/><circle cx="160" cy="292" r="5" fill="${OUTFIT[el][2]}"/>`;
}

function cape(el, id) {
  const [, bottom, trim] = OUTFIT[el];
  return `<path d="M100 264 Q160 242 220 264 Q266 320 290 390 Q248 378 226 392 Q192 372 160 380 Q128 372 94 392 Q72 378 30 390 Q54 320 100 264 Z" fill="${bottom}" stroke="#1a1030" stroke-width="3" stroke-linejoin="round"/>
  <path d="M30 390 Q72 378 94 392 Q128 372 160 380 Q192 372 226 392 Q248 378 290 390" fill="none" stroke="${trim}" stroke-width="3" filter="url(#${id}-glow)"/>
  <path d="M108 280 Q70 330 52 380 M212 280 Q250 330 268 380" fill="none" stroke="${trim}" stroke-width="1.5" opacity="0.5"/>`;
}

function orbs(stage, el, id) {
  const neon = ['#39FF88', '#FF2E63', '#FFC93C', '#E0E0FF', '#00E5FF'];
  const hanja = ['木', '火', '土', '金', '水'];
  const spots = stage >= 4
    ? [[34, 250], [286, 250], [52, 160], [268, 160], [160, 30]]
    : [[38, 252], [282, 252]];
  const order = stage >= 4 ? [0, 1, 2, 3, 4] : [el, (el + 1) % 5];
  return spots.map(([x, y], i) => {
    const e = order[i];
    return `<g transform="translate(${x} ${y})"><circle r="15" fill="#0d0a1f" stroke="${neon[e]}" stroke-width="2.5" filter="url(#${id}-glow)"/><text y="1" font-size="15" text-anchor="middle" dominant-baseline="central" fill="${neon[e]}" font-family="'Song Myung', serif" font-weight="800">${hanja[e]}</text>
    <animateTransform attributeName="transform" type="translate" values="${x} ${y};${x} ${y - 6};${x} ${y}" dur="${2.4 + i * 0.3}s" repeatCount="indefinite"/></g>`;
  }).join('');
}

function halo(id) {
  return `<ellipse cx="160" cy="84" rx="64" ry="13" fill="none" stroke="#ffd166" stroke-width="6" filter="url(#${id}-glow)"/><ellipse cx="160" cy="84" rx="64" ry="13" fill="none" stroke="#fff6c8" stroke-width="2"/>`;
}

function cloud() {
  const puffs = [[96, 382, 22], [124, 390, 26], [160, 392, 28], [196, 390, 26], [224, 382, 22], [70, 386, 14], [250, 386, 14]];
  return `<g>${puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" stroke="#c9d6ff" stroke-width="3"/>`).join('')}${puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y + 2}" r="${r - 4}" fill="#ffffff"/>`).join('')}</g>`;
}

function wings(el, id) {
  const trim = OUTFIT[el][2];
  const feather = (side) => {
    const sx = side === 'L' ? -1 : 1;
    let f = '';
    for (let i = 0; i < 4; i++) {
      f += `<path transform="translate(160 270) scale(${sx} 1)" d="M30 ${-10 + i * 16} q${70 + i * 6} ${-60 + i * 22} ${118 - i * 14} ${-40 + i * 30} q${-40 + i * 6} ${30} ${-118 + i * 14} ${50 - i * 6} z" fill="url(#${id}-wing)" stroke="${trim}" stroke-width="2" opacity="${0.95 - i * 0.12}"/>`;
    }
    return f;
  };
  return `<g filter="url(#${id}-glow)">${feather('L')}${feather('R')}</g>`;
}

function crown() {
  return `<g transform="translate(160 ${88})"><path d="M-26 10 l-4 -24 l14 12 l16 -22 l16 22 l14 -12 l-4 24 z" fill="#ffd166" stroke="#b8860b" stroke-width="3" stroke-linejoin="round"/><circle cy="-2" r="5" fill="#ff4d6d" stroke="#8d1b25" stroke-width="2"/><circle cx="-16" cy="4" r="3" fill="#4fc3ff"/><circle cx="16" cy="4" r="3" fill="#39ff88"/></g>`;
}

// ---------- 진화 강화 장식 ----------

const STAGE_SCALE = { 1: 0.7, 2: 0.86, 3: 0.94, 4: 1, 5: 1 };

/** 단계별 배경 무대 */
export function stageBackdrop(stage, el, id) {
  const trim = OUTFIT[el][2];
  const stars = (n, seed, color, maxY = 400) => Array.from({ length: n }, (_, i) => {
    const x = (i * 97 + seed * 31) % 320; const y = (i * 53 + seed * 17) % maxY; const r = (i % 3) * 0.6 + 0.8;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${0.4 + (i % 4) * 0.15}"/>`;
  }).join('');
  switch (stage) {
    case 1: return `<rect width="320" height="400" fill="url(#${id}-bg1)"/>${[[50, 70], [270, 90], [70, 300], [260, 320]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="#fff" opacity="0.25"/>`).join('')}<text x="40" y="120" font-size="18" opacity="0.5">⭐</text><text x="250" y="200" font-size="16" opacity="0.5">🌙</text>`;
    case 2: return `<rect width="320" height="400" fill="url(#${id}-bg2)"/>${stars(18, 2, '#ffffff', 300)}`;
    case 3: return `<rect width="320" height="400" fill="url(#${id}-bg3)"/>${stars(24, 3, trim, 300)}
      <path d="M40 330 L40 250 L70 230 L100 250 L100 330 M220 330 L220 250 L250 230 L280 250 L280 330" fill="#1a0f2e" stroke="${trim}" stroke-width="1.5" opacity="0.7"/>
      <path d="M30 252 L70 222 L110 252 M210 252 L250 222 L290 252" fill="none" stroke="${trim}" stroke-width="2" opacity="0.8"/>`;
    case 4: return `<rect width="320" height="400" fill="url(#${id}-bg4)"/>
      ${[[40, 330, 40], [110, 350, 50], [210, 345, 55], [290, 330, 40], [60, 120, 26], [270, 150, 30]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="0.35"/>`).join('')}
      <g transform="translate(160 170)" opacity="0.35"><polygon points="${Array.from({ length: 8 }, (_, i) => { const a = (i * 45 + 22.5) * Math.PI / 180; return `${Math.cos(a) * 140},${Math.sin(a) * 140}`; }).join(' ')}" fill="none" stroke="#ffd166" stroke-width="2"/><animateTransform attributeName="transform" type="rotate" from="0 160 170" to="360 160 170" dur="40s" repeatCount="indefinite" additive="sum"/></g>`;
    default: return `<rect width="320" height="400" fill="url(#${id}-bg5)"/>${stars(46, 5, '#ffffff')}
      <ellipse cx="160" cy="200" rx="170" ry="60" fill="none" stroke="url(#${id}-rainbow)" stroke-width="2" opacity="0.5" transform="rotate(-18 160 200)"/>
      <circle cx="270" cy="70" r="26" fill="#fff6c8" opacity="0.8"/><circle cx="280" cy="64" r="22" fill="url(#${id}-bg5)"/>`;
  }
}

function backdropDefs(id) {
  return `<linearGradient id="${id}-bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3ef"/><stop offset="1" stop-color="#d9e8ff"/></linearGradient>
  <linearGradient id="${id}-bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1240"/><stop offset="1" stop-color="#0b0820"/></linearGradient>
  <linearGradient id="${id}-bg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0f3f"/><stop offset="0.7" stop-color="#140826"/><stop offset="1" stop-color="#0a0514"/></linearGradient>
  <linearGradient id="${id}-bg4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf7a"/><stop offset="0.55" stop-color="#ff9fb0"/><stop offset="1" stop-color="#9b8cff"/></linearGradient>
  <radialGradient id="${id}-bg5" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#3b1a78"/><stop offset="0.6" stop-color="#140a33"/><stop offset="1" stop-color="#05030f"/></radialGradient>`;
}

function eggCap() {
  return `<path d="M96 120 q64 -84 128 0 l-12 -10 l-12 12 l-14 -14 l-12 14 l-14 -14 l-12 14 l-14 -14 l-12 12 l-12 -10 z" fill="#fffaf0" stroke="#c9b48a" stroke-width="3.5" stroke-linejoin="round"/><circle cx="140" cy="80" r="5" fill="#ffd1dc"/><circle cx="182" cy="88" r="4" fill="#cde7ff"/>`;
}

function magicCircle(el, id) {
  const trim = OUTFIT[el][2];
  return `<g transform="translate(160 384)" opacity="0.9"><ellipse rx="112" ry="20" fill="none" stroke="${trim}" stroke-width="2.5" filter="url(#${id}-glow)"/><ellipse rx="88" ry="15" fill="none" stroke="${trim}" stroke-width="1.2" stroke-dasharray="6 6"/>
  ${['木', '火', '土', '金', '水'].map((h, i) => { const a = (i * 72 - 90) * Math.PI / 180; return `<text x="${Math.cos(a) * 100}" y="${Math.sin(a) * 17 + 4}" font-size="11" text-anchor="middle" fill="${trim}" font-family="'Song Myung', serif">${h}</text>`; }).join('')}</g>`;
}

function pauldrons() {
  return `<path d="M84 276 q24 -22 48 -4 q-6 16 -26 20 q-16 0 -22 -16 z M236 276 q-24 -22 -48 -4 q6 16 26 20 q16 0 22 -16 z" fill="#ffd166" stroke="#b8860b" stroke-width="3" stroke-linejoin="round"/><path d="M92 278 q14 -8 30 -2 M228 278 q-14 -8 -30 -2" stroke="#fff6c8" stroke-width="2" fill="none"/>`;
}

function emblem(el) {
  return `<g transform="translate(160 326)"><circle r="11" fill="#ffd166" stroke="#b8860b" stroke-width="2.5"/><text y="1" font-size="12" text-anchor="middle" dominant-baseline="central" fill="#8d1b25" font-weight="800" font-family="'Song Myung', serif">${['木', '火', '土', '金', '水'][el]}</text></g>`;
}

function goldTrim(female) {
  return female
    ? `<path d="M116 270 Q160 252 204 270 M88 366 Q160 386 232 366" fill="none" stroke="#ffd166" stroke-width="3"/>`
    : `<path d="M104 272 Q160 252 216 272 M94 354 Q160 374 226 354" fill="none" stroke="#ffd166" stroke-width="3"/>`;
}

function spiritTails(el, id) {
  const trim = OUTFIT[el][2];
  return `<g filter="url(#${id}-glow)" opacity="0.85">${[-30, 0, 30].map((r) => `<path transform="rotate(${r} 200 330)" d="M200 330 q60 -10 78 -60 q8 -26 -10 -40 q18 30 -6 56 q-20 22 -62 44 z" fill="${trim}" fill-opacity="0.35" stroke="${trim}" stroke-width="2"/>`).join('')}</g>`;
}

function foreheadGem() {
  return `<g transform="translate(160 128)"><path d="M0 -10 l8 10 l-8 10 l-8 -10 z" fill="#ff4d6d" stroke="#ffd166" stroke-width="2.5"/><circle cx="-2" cy="-3" r="2" fill="#fff"/></g>`;
}

function particles(id) {
  return Array.from({ length: 10 }, (_, i) => {
    const x = 30 + ((i * 67) % 260); const y = 60 + ((i * 41) % 260);
    return `<path d="M${x} ${y - 6} l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z" fill="${i % 2 ? '#ffd166' : '#fff'}"><animate attributeName="opacity" values="0.2;1;0.2" dur="${1.6 + (i % 4) * 0.4}s" repeatCount="indefinite"/></path>`;
  }).join('');
}

function headShine() {
  return `<ellipse cx="124" cy="128" rx="30" ry="16" fill="#ffffff" opacity="0.28" transform="rotate(-20 124 128)"/><ellipse cx="160" cy="250" rx="70" ry="10" fill="#000" opacity="0.06"/>`;
}

// ---------- 공개 API ----------

/**
 * 캐릭터 정보
 * @param saju computeSaju 결과, profile {gender, concern}
 */
export function characterInfo(saju, profile) {
  const z = ZODIAC[saju.pillars.year.branch];
  const el = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4][saju.dayMaster];
  const concern = CONCERNS.find((c) => c.key === profile?.concern) || CONCERNS[2];
  const female = profile?.gender === 'female';
  return {
    zodiac: z,
    element: el,
    concern,
    female,
    name: `${ELEMENT_COLOR_NAME[el]} ${z.name}`,
    title: `${concern.title} ${ELEMENT_COLOR_NAME[el]} ${z.name}`,
  };
}

/**
 * 캐릭터 SVG 내부(320×400 좌표계)와 defs를 만든다
 * @param info characterInfo 결과
 * @param opts {mood, charms: [talisman, talisman], emote, aura}
 */
export function characterMarkup(info, opts = {}) {
  const id = nextId();
  const { zodiac: z, element: el, female, concern } = info;
  const mood = opts.mood || 'smile';
  const emote = opts.emote ? EMOTES.find((e) => e.key === opts.emote) : null;
  const charms = opts.charms || [];
  const trim = OUTFIT[el][2];
  const aura = opts.aura !== false;
  const stage = opts.stage || 2;

  const defs = `
    <filter id="${id}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <linearGradient id="${id}-wing" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${trim}" stop-opacity="0.85"/></linearGradient>
    <linearGradient id="${id}-rainbow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4d6d"/><stop offset="0.25" stop-color="#ffc93c"/><stop offset="0.5" stop-color="#39ff88"/><stop offset="0.75" stop-color="#00e5ff"/><stop offset="1" stop-color="#c77dff"/></linearGradient>
    ${opts.backdrop ? backdropDefs(id) : ''}
    <radialGradient id="${id}-aura" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${trim}" stop-opacity="0.35"/><stop offset="0.7" stop-color="${trim}" stop-opacity="0.08"/><stop offset="1" stop-color="${trim}" stop-opacity="0"/></radialGradient>`;

  const auraMarkup = aura ? `
    <circle cx="160" cy="220" r="150" fill="url(#${id}-aura)"/>
    <circle cx="160" cy="220" r="128" fill="none" stroke="${stage >= 5 ? `url(#${id}-rainbow)` : trim}" stroke-width="${stage >= 5 ? 4 : 1.5}" stroke-dasharray="${stage >= 5 ? '0' : '3 9'}" opacity="${stage >= 5 ? 0.9 : 0.6}"/>
    ${stage >= 4 ? '' : `<text x="160" y="58" font-size="20" text-anchor="middle" fill="${trim}" opacity="0.5" font-family="'Song Myung', serif">${z.hanja}</text>`}` : '';

  const blinkEyes = opts.animate
    ? `<g transform="translate(0 180)"><g><animateTransform attributeName="transform" type="scale" values="1 1;1 1;1 0.1;1 1" keyTimes="0;0.9;0.95;1" dur="4.2s" repeatCount="indefinite"/><g transform="translate(0 -180)">${eyes(mood, female)}</g></g></g>`
    : eyes(mood, female);

  const figure = `
    ${stage >= 5 ? wings(el, id) : ''}
    ${stage >= 5 ? spiritTails(el, id) : ''}
    ${stage >= 3 ? cape(el, id) : ''}
    ${stage === 3 ? magicCircle(el, id) : ''}
    <ellipse cx="160" cy="384" rx="76" ry="10" fill="#000" opacity="0.28"/>
    ${stage >= 4 ? cloud() : ''}
    ${tail(z, el, id)}
    ${feet(z)}
    ${outfit(el, female, id)}
    ${stage >= 4 ? goldTrim(female) : ''}
    ${stage >= 3 ? emblem(el) : ''}
    ${stage === 1 ? bib(el) : ''}
    ${arms(z, el)}
    ${stage >= 3 ? pauldrons() : ''}
    ${miniCharm(charms[0], 112, 352, -10)}
    ${stage >= 2 ? prop(concern.key) : ''}
    ${stage >= 4 ? halo(id) : ''}
    ${earsBehind(z)}
    ${headShape(z)}
    ${faceMarks(z)}
    ${headShine()}
    ${cheeks(z)}
    ${blinkEyes}
    ${noseMouth(z, mood)}
    ${stage >= 5 ? foreheadGem() : ''}
    ${stage === 1 ? eggCap() : stage >= 5 ? crown() : headAccessory(concern.key, female, el, z)}
    ${miniCharm(charms[1], 48, 96, -14, 0.9)}
    ${emoteBubble(emote)}
    ${mood === 'sleepy' ? `<text x="236" y="120" font-size="26" font-weight="800" fill="${z.dark}" font-family="sans-serif">z</text><text x="252" y="96" font-size="20" font-weight="800" fill="${z.dark}" font-family="sans-serif">z</text>` : ''}
    ${mood === 'fighting' ? `<path d="M262 160 q8 -14 4 -24 q12 8 8 22 z" fill="#4fc3ff" opacity="0.9"/>` : ''}
    ${mood === 'smile' || mood === 'excited' ? `<path d="M52 230 l4 8 l8 4 l-8 4 l-4 8 l-4 -8 l-8 -4 l8 -4 z M270 238 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3 z" fill="#ffd166"/>` : ''}
    ${stage === 1 ? eggShell() : ''}`;
  const sc = STAGE_SCALE[stage] || 1;
  const bounce = opts.animate ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="${stage === 1 ? 1.4 : 2.4}s" repeatCount="indefinite" additive="sum"/>` : '';
  const scaled = `<g transform="translate(160 384) scale(${sc}) translate(-160 -384)"><g>${bounce}${figure}</g></g>`;
  const backdrop = opts.backdrop ? stageBackdrop(stage, el, id) : '';
  const body = `${backdrop}${auraMarkup}${scaled}${stage >= 3 ? orbs(stage, el, id) : ''}${stage >= 5 ? particles(id) : ''}`;
  return { id, defs, body };
}

/** 진화 단계별 해금: 부적 슬롯 수, 이모티콘 슬롯 */
export const STAGE_UNLOCKS = [
  { stage: 1, charmSlots: 1, emote: false, perks: ['부적 슬롯 1칸'] },
  { stage: 2, charmSlots: 1, emote: true, perks: ['이모티콘 슬롯 해금', '고민 소품 장착'] },
  { stage: 3, charmSlots: 2, emote: true, perks: ['부적 슬롯 2칸', '망토·어깨갑옷', '오행 구슬 2개', '능력치 +12'] },
  { stage: 4, charmSlots: 2, emote: true, perks: ['광륜·구름', '오행 구슬 5개', '금빛 한복 테두리', '능력치 +18'] },
  { stage: 5, charmSlots: 2, emote: true, perks: ['날개·금관·영험한 꼬리', '무지개 오라', '우주 배경', '능력치 +24'] },
];

export function renderCharacterSVG(info, opts = {}) {
  const { defs, body } = characterMarkup(info, opts);
  const w = opts.width || 320;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 400" width="${w}" height="${(w * 400) / 320}"><defs>${defs}</defs>${body}</svg>`;
}

/** 캐릭터 스탯: 오행 + 고민 + 장착 효과 */
export function characterStats(saju, fortune, info, charms = []) {
  const e = saju.elements;
  const base = [
    { key: 'growth', label: '성장(木)', value: 40 + e[0] },
    { key: 'passion', label: '열정(火)', value: 40 + e[1] },
    { key: 'stable', label: '안정(土)', value: 40 + e[2] },
    { key: 'resolve', label: '결단(金)', value: 40 + e[3] },
    { key: 'wisdom', label: '지혜(水)', value: 40 + e[4] },
  ];
  let bonus = 0;
  const stage = info.stage || 2;
  base.forEach((b) => { b.value += (stage - 1) * 6; });
  charms.filter(Boolean).forEach((t) => {
    const main = t.effects[0];
    bonus += Math.abs(main.value);
    const target = base[t.element];
    target.value += t.effects[2].value;
  });
  const concernScore = fortune.scores[info.concern.category] ?? fortune.scores.total;
  return {
    base: base.map((b) => ({ ...b, value: Math.min(120, b.value) })),
    concern: { label: info.concern.stat, value: Math.min(99, concernScore + Math.round(bonus / 2)), baseValue: concernScore },
    luckPower: Math.round(base.reduce((s, b) => s + b.value, 0) / 5 + bonus + (stage - 1) * 10),
    stageBonus: (stage - 1) * 6,
    bonus,
  };
}
