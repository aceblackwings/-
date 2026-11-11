// 🔔 효과음·짧은 음악(v0.66, 2026-11-11 사용자 「클릭·성장·등불·부적 나타날 때 간단한 효과음과 짧은 음악」)
// 소리 파일 없이 브라우저 Web Audio로 그 자리에서 만든다(용량 0, 내려받기 없음).
// 음계는 국악 5음(궁·상·각·치·우 = 도·레·미·솔·라)으로 맞춰 12지신 앱 분위기에 어울리게.
// 원칙: ① 짧고 작게(효과음 0.05~0.4초, 음악 1~2.5초) ② 머리줄 🔊 버튼으로 언제든 끔(저장 SOUND_KEY)
//       ③ 첫 손가락 누름 전에는 소리를 내지 않음(폰 브라우저 규칙) ④ 소리가 안 되는 기기에서는 조용히 넘어감
export const SOUND_KEY = 'unmyeong2099.sound';

// 도(C5) 기준 5음 + 위아래 옥타브 (Hz)
const N = { C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0, A4: 440.0, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0, C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98 };

/** 효과음 이름 → 설명(테스트·설정 화면용) */
export const SFX = {
  tap: '버튼 누름', tab: '탭 바꾸기', coin: '복떡', grow: '지신 밥', pop: '열림', flip: '카드 뒤집기',
  scratch: '긁기', crack: '쿠키 쪼개짐', stamp: '도장', bell: '등불 종', fire: '태우기', sparkle: '반짝임',
};
/** 짧은 음악 이름 → [음, 박자] 목록(박자 단위 = 0.13초) */
export const JINGLES = {
  evolve: [['C5', 1], ['D5', 1], ['E5', 1], ['G5', 1], ['A5', 1], ['C6', 3], ['G5', 1], ['C6', 4]], // 진화·성장
  charm: [['G5', 1], ['A5', 1], ['C6', 2], ['E6', 4]], // 부적 나타남
  rare: [['C6', 1], ['E6', 1], ['G6', 1], ['E6', 1], ['G6', 4]], // 높은 등급 부적
  lantern: [['A4', 2], ['C5', 2], ['D5', 2], ['E5', 2], ['G5', 2], ['E5', 2], ['G5', 6]], // 등불 켜기
  wish: [['E5', 2], ['G5', 2], ['A5', 2], ['C6', 2], ['D6', 2], ['C6', 6]], // 소원 이룸·100일 완주
  gold: [['G5', 1], ['C6', 1], ['E6', 1], ['G6', 1], ['E6', 1], ['G6', 1], ['C6', 4]], // 황금 쿠키
};

/** 저장된 설정 → { on } (기본 켬) */
export function soundOn(store) { return store?.on !== false; }
export function toggleSound(store) { return { ...(store || {}), on: !soundOn(store) }; }

let ctx = null; let master = null; let enabled = true; let unlocked = false; let lastAt = {};
const AC = () => (typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null);

/** 켜고 끄기(앱이 설정을 읽어 알려 줌) */
export function setSoundEnabled(on) { enabled = !!on; if (!on && ctx?.state === 'running') ctx.suspend?.().catch(() => {}); if (on && ctx?.state === 'suspended' && unlocked) ctx.resume?.().catch(() => {}); }
export function soundEnabled() { return enabled; }

/** 첫 손가락 누름에서 한 번 소리 장치를 깨움(폰은 사용자가 누른 뒤에만 소리를 낼 수 있음) */
export function unlockSound() {
  unlocked = true;
  if (!enabled) return;
  try {
    const A = AC(); if (!A) return;
    if (!ctx) { ctx = new A(); master = ctx.createGain(); master.gain.value = 0.32; master.connect(ctx.destination); }
    if (ctx.state === 'suspended') ctx.resume?.().catch(() => {});
  } catch { ctx = null; }
}

function ready() { if (!enabled || !unlocked) return null; if (!ctx) unlockSound(); return ctx && ctx.state !== 'closed' ? ctx : null; }

/** 음 하나: 종류(sine·triangle·square), 시작 시각, 길이, 크기, 높이 변화 */
function tone(c, { f, f2, at = 0, dur = 0.12, vol = 0.5, type = 'sine', attack = 0.005 }) {
  const t = c.currentTime + at;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
}
/** 종소리: 맑은 배음 셋(1 · 2.76 · 5.4배) */
function bellTone(c, f, at, dur, vol) {
  tone(c, { f, at, dur, vol, type: 'sine' });
  tone(c, { f: f * 2.76, at, dur: dur * 0.6, vol: vol * 0.35, type: 'sine' });
  tone(c, { f: f * 5.4, at, dur: dur * 0.3, vol: vol * 0.15, type: 'sine' });
}
/** 바람·불·종이 소리: 걸러 낸 잡음 */
function noise(c, { at = 0, dur = 0.2, vol = 0.3, freq = 1200, q = 0.8, type = 'bandpass', sweep }) {
  const t = c.currentTime + at; const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = c.createBufferSource(); s.buffer = buf;
  const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(freq, t); fl.Q.value = q;
  if (sweep) fl.frequency.exponentialRampToValueAtTime(sweep, t + dur);
  const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.02);
}

/** 효과음 한 번. 같은 소리는 너무 잦으면 건너뜀(긁기·연타) */
export function sfx(name) {
  const c = ready(); if (!c) return false;
  const gap = name === 'scratch' ? 70 : name === 'tap' ? 40 : 0;
  const now = Date.now(); if (gap && now - (lastAt[name] || 0) < gap) return false; lastAt[name] = now;
  try {
    switch (name) {
      case 'tap': tone(c, { f: 880, f2: 660, dur: 0.05, vol: 0.18, type: 'triangle' }); break;
      case 'tab': tone(c, { f: N.E5, dur: 0.07, vol: 0.2, type: 'triangle' }); tone(c, { f: N.G5, at: 0.05, dur: 0.09, vol: 0.18, type: 'triangle' }); break;
      case 'coin': tone(c, { f: N.A5, dur: 0.06, vol: 0.3, type: 'square' }); tone(c, { f: N.E6, at: 0.06, dur: 0.22, vol: 0.22, type: 'square' }); break;
      case 'grow': tone(c, { f: N.C5, f2: N.G5, dur: 0.18, vol: 0.32, type: 'sine' }); tone(c, { f: N.C6, at: 0.14, dur: 0.18, vol: 0.2, type: 'sine' }); break;
      case 'pop': tone(c, { f: 420, f2: 980, dur: 0.1, vol: 0.32, type: 'sine' }); break;
      case 'flip': noise(c, { dur: 0.12, vol: 0.25, freq: 2400, q: 1.2, sweep: 900 }); tone(c, { f: N.G5, at: 0.06, dur: 0.12, vol: 0.12, type: 'triangle' }); break;
      case 'scratch': noise(c, { dur: 0.06, vol: 0.12, freq: 3200, q: 2 }); break;
      case 'crack': noise(c, { dur: 0.09, vol: 0.5, freq: 1500, q: 1.5 }); noise(c, { at: 0.07, dur: 0.12, vol: 0.35, freq: 900, q: 1.2 }); break;
      case 'stamp': tone(c, { f: 140, f2: 60, dur: 0.16, vol: 0.6, type: 'sine' }); noise(c, { dur: 0.06, vol: 0.3, freq: 600, q: 0.7, type: 'lowpass' }); break;
      case 'bell': bellTone(c, N.A5, 0, 1.4, 0.32); break;
      case 'fire': noise(c, { dur: 0.9, vol: 0.28, freq: 400, q: 0.5, sweep: 1800, type: 'lowpass' }); break;
      case 'sparkle': [N.C6, N.E6, N.G6].forEach((f, i) => tone(c, { f, at: i * 0.06, dur: 0.2, vol: 0.14, type: 'sine' })); break;
      default: return false;
    }
    return true;
  } catch { return false; }
}

/** 짧은 음악 한 소절(가야금 뜯는 소리 느낌: 세모파 + 빠른 줄어듦 + 종 배음) */
export function jingle(name) {
  const c = ready(); const seq = JINGLES[name]; if (!c || !seq) return false;
  try {
    let at = 0; const beat = 0.13;
    for (const [note, len] of seq) {
      const f = N[note]; const dur = Math.max(0.25, len * beat * 2.2);
      tone(c, { f, at, dur, vol: 0.26, type: 'triangle', attack: 0.004 });
      tone(c, { f: f * 2, at, dur: dur * 0.5, vol: 0.06, type: 'sine' });
      at += len * beat;
    }
    if (name === 'lantern' || name === 'wish') bellTone(c, N.C6, at, 1.6, 0.18);
    return true;
  } catch { return false; }
}

/** 음악 전체 길이(초) — 테스트용 */
export const jingleLength = (name) => (JINGLES[name] || []).reduce((a, [, l]) => a + l, 0) * 0.13;
