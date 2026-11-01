import {
  computeSaju, tenGod, STEMS, STEMS_KO, BRANCHES, BRANCHES_KO, STEM_ELEMENT, BRANCH_ELEMENT,
  BRANCH_MAIN_STEM, ELEMENT_KO, ELEMENT_HANJA, pillarLabel, pillarLabelKo,
} from './saju.js';
import { computeFortune, CATEGORIES, DAY_MASTER_PROFILE } from './fortune.js';
import {
  createTalisman, renderTalismanSVG, downloadSVGAsPNG, TALISMAN_TYPES, THEMES, RARITIES,
} from './talisman.js';
import { renderEmoticonSVG, EMOTES, todayEmote } from './emoticon.js';
import {
  CONCERNS, characterInfo, renderCharacterSVG, characterStats, STAGE_UNLOCKS,
} from './character.js';
import { computeCompat, renderCompatSVG } from './compat.js';
import { renderStoryCanvas, shareStory, STORY_TEMPLATES } from './story.js';
import {
  STAGES, STREAK_REWARDS, emptyGrowth, checkIn, complete, addExp, evolve, claimStreakReward, summary, stageName,
} from './growth.js';
import {
  lunarToSolar, solarToLunar, leapMonthOf, lunarMonthDays, formatLunar,
} from './lunar.js';

const STORE_KEY = 'unmyeong2099.profile';
const COLLECTION_KEY = 'unmyeong2099.collection';
const MISSION_KEY = 'unmyeong2099.missions';
const EQUIP_KEY = 'unmyeong2099.equip';
const GROWTH_KEY = 'unmyeong2099.growth';
const FRIENDS_KEY = 'unmyeong2099.friends';
const CONCERN_ICONS = { exam: '📝', job: '💼', wealth: '💰', business: '📈', love: '💕', marriage: '💍', health: '🌿', people: '🤝', change: '🧭' };
const EL_COLORS = ['#39FF88', '#FF2E63', '#FFC93C', '#E0E0FF', '#00E5FF'];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const state = {
  profile: null,
  saju: null,
  fortune: null,
  charm: { type: 'protect', theme: 'neon', element: null, reroll: 0, current: null },
  emojiStyle: 'neon',
  storyTemplate: 'fortune',
  storyCanvas: null,
};

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 저장 불가 환경 */ }
}

function toast(msg) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

// ---------- 입력 ----------

/** 예전 형식({date: 'YYYY-MM-DD'})의 저장 정보를 새 형식으로 */
function normalizeProfile(p) {
  if (!p) return null;
  if (p.date && !p.year) {
    const [year, month, day] = p.date.split('-').map(Number);
    return { ...p, calendar: 'solar', year, month, day, leap: false };
  }
  return p;
}

/** 프로필 → 양력 날짜. 음력이면 변환 (오류 시 {error}) */
function solarDateOf(p) {
  if (p.calendar === 'lunar') return lunarToSolar(p.year, p.month, p.day, !!p.leap);
  return { year: p.year, month: p.month, day: p.day };
}

function profileToInput(p) {
  const solar = solarDateOf(p);
  const [hour, minute] = (p.time || '12:00').split(':').map(Number);
  return {
    year: solar.year, month: solar.month, day: solar.day, hour, minute,
    timeKnown: !p.timeUnknown,
    longitudeCorrection: p.lonCorr,
    zasiMode: p.zasi,
  };
}

const solarDaysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const validYear = (y) => Number.isInteger(y) && y >= 1900 && y <= 2100;

function start(profile) {
  state.profile = profile;
  state.saju = computeSaju(profileToInput(profile));
  state.fortune = computeFortune(state.saju);
  state.charm.element = state.saju.weakest;
  state.charm.reroll = 0;
  state.charm.type = (CONCERNS.find((c) => c.key === profile.concern) || CONCERNS[2]).talisman;
  $('#view-input').classList.add('hidden');
  $('#view-result').classList.remove('hidden');
  $('#btn-edit').classList.remove('hidden');
  renderAll();
  selectTab('saju');
  grow((g) => checkIn(g, state.fortune.dateKey));
}

function initForm() {
  const form = $('#birth-form');
  const saved = normalizeProfile(load(STORE_KEY, null));
  const preview = $('#conv-preview');
  const leapRow = $('.leap-row');

  for (let m = 1; m <= 12; m++) form.month.add(new Option(`${m}월`, m));
  $('#concern-grid').innerHTML = CONCERNS.map((c) => `<label><input type="radio" name="concern" value="${c.key}"><span><i>${CONCERN_ICONS[c.key]}</i>${c.label}</span></label>`).join('');

  const readForm = () => ({
    calendar: form.calendar.value,
    year: Number(form.year.value),
    month: Number(form.month.value),
    day: Number(form.day.value),
    leap: form.calendar.value === 'lunar' && form.leap.checked && !leapRow.classList.contains('hidden'),
  });

  // 달력 종류·연·월에 맞춰 윤달 선택과 일수를 갱신하고, 변환 결과를 미리 보여 준다
  function refresh() {
    const f = readForm();
    const lunar = f.calendar === 'lunar';
    const ok = validYear(f.year);

    const hasLeap = lunar && ok && leapMonthOf(f.year) === f.month;
    leapRow.classList.toggle('hidden', !hasLeap);
    $('#leap-label').textContent = hasLeap ? `윤${f.month}월 (${f.year}년은 ${f.month}월 다음에 윤달이 있습니다)` : '윤달';
    if (!hasLeap) form.leap.checked = false;

    let maxDay = 31;
    if (ok) maxDay = lunar ? (lunarMonthDays(f.year, f.month, hasLeap && form.leap.checked) || 30) : solarDaysInMonth(f.year, f.month);
    const keep = Number(form.day.value) || 1;
    form.day.length = 0;
    for (let d = 1; d <= maxDay; d++) form.day.add(new Option(`${d}일`, d));
    form.day.value = String(Math.min(keep, maxDay));

    preview.classList.remove('err');
    if (!ok) { preview.textContent = form.year.value ? '1900~2100년 사이로 입력해 주세요.' : ''; return; }
    const now = readForm();
    if (lunar) {
      const s = lunarToSolar(now.year, now.month, now.day, now.leap);
      if (s.error) { preview.textContent = s.error; preview.classList.add('err'); return; }
      preview.textContent = `→ 양력 ${s.year}년 ${s.month}월 ${s.day}일`;
    } else {
      const l = solarToLunar(now.year, now.month, now.day);
      preview.textContent = l ? `→ ${formatLunar(l)}` : '';
    }
  }

  if (saved) {
    form.name.value = saved.name || '';
    form.calendar.value = saved.calendar || 'solar';
    form.year.value = saved.year;
    form.month.value = String(saved.month);
    form.day.add(new Option(`${saved.day}일`, saved.day));
    form.day.value = String(saved.day);
    form.time.value = saved.time || '12:00';
    form.timeUnknown.checked = !!saved.timeUnknown;
    form.lonCorr.checked = saved.lonCorr !== false;
    form.zasi.value = saved.zasi || 'early';
    if (saved.gender) form.gender.value = saved.gender;
    if (saved.concern) form.concern.value = saved.concern;
  }
  refresh();
  if (saved?.leap) { form.leap.checked = true; refresh(); }

  ['calendar', 'month', 'day', 'leap'].forEach((n) => {
    const els = form.elements[n] instanceof RadioNodeList ? [...form.elements[n]] : [form.elements[n]];
    els.forEach((el) => el.addEventListener('change', refresh));
  });
  form.year.addEventListener('input', refresh);
  form.timeUnknown.addEventListener('change', () => { form.time.disabled = form.timeUnknown.checked; });
  form.time.disabled = form.timeUnknown.checked;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = readForm();
    if (!validYear(f.year)) { toast('1900~2100년 사이로 입력해 주세요'); return; }
    if (!form.gender.value) { toast('성별을 선택해 주세요'); return; }
    if (!form.concern.value) { toast('지금 가장 큰 고민을 하나 골라 주세요'); return; }
    const profile = {
      name: form.name.value.trim(),
      ...f,
      time: form.time.value || '12:00',
      timeUnknown: form.timeUnknown.checked,
      lonCorr: form.lonCorr.checked,
      zasi: form.zasi.value,
      gender: form.gender.value,
      concern: form.concern.value,
    };
    const solar = solarDateOf(profile);
    if (solar.error) { toast(solar.error); return; }
    save(STORE_KEY, profile);
    start(profile);
  });

  $('#btn-edit').addEventListener('click', () => {
    $('#view-result').classList.add('hidden');
    $('#view-input').classList.remove('hidden');
    $('#btn-edit').classList.add('hidden');
  });

  if (saved && saved.gender && saved.concern && !solarDateOf(saved).error && new URLSearchParams(location.search).get('auto') !== '0') start(saved);
}

// ---------- 탭 ----------

function selectTab(name) {
  $$('.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
  $$('.panel').forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== name));
  if (name === 'story') renderStory();
  if (name === 'hero') renderHero(true);
  if (name === 'today' && state.fortune) grow((g) => complete(g, state.fortune.dateKey, 'fortune'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderAll() {
  renderSaju();
  renderToday();
  renderCharm(false);
  renderHero(false);
  renderEmoji();
  renderCompat();
}

// ---------- 사주 분석 ----------

function charCell(stemOrBranch, isStem) {
  const idx = stemOrBranch;
  const el = isStem ? STEM_ELEMENT[idx] : BRANCH_ELEMENT[idx];
  const hanja = isStem ? STEMS[idx] : BRANCHES[idx];
  const ko = isStem ? STEMS_KO[idx] : BRANCHES_KO[idx];
  return `<div class="char el-${el}">${hanja}<small>${ko} · ${ELEMENT_KO[el]}</small></div>`;
}

function radarSVG(scores) {
  const cx = 140; const cy = 140; const R = 100;
  const pt = (i, r) => {
    const a = (-90 + i * 72) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const max = Math.max(40, ...scores);
  let rings = '';
  for (let k = 1; k <= 4; k++) {
    rings += `<polygon points="${[0, 1, 2, 3, 4].map((i) => pt(i, (R * k) / 4).join(',')).join(' ')}" fill="none" stroke="rgba(160,140,255,0.18)"/>`;
  }
  const poly = scores.map((s, i) => pt(i, (R * s) / max).join(',')).join(' ');
  const labels = scores.map((s, i) => {
    const [x, y] = pt(i, R + 22);
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="${EL_COLORS[i]}" font-size="14" font-weight="800">${ELEMENT_HANJA[i]} ${s}</text>`;
  }).join('');
  return `<svg viewBox="0 0 280 280" role="img" aria-label="오행 분포">
    ${rings}
    ${[0, 1, 2, 3, 4].map((i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, R)[0]}" y2="${pt(i, R)[1]}" stroke="rgba(160,140,255,0.15)"/>`).join('')}
    <polygon points="${poly}" fill="rgba(0,229,255,0.18)" stroke="#00e5ff" stroke-width="2" style="filter:drop-shadow(0 0 6px #00e5ff)"/>
    ${labels}
  </svg>`;
}

function renderSaju() {
  const s = state.saju;
  const name = state.profile.name ? `${esc(state.profile.name)}님의` : '나의';
  const order = [['hour', '시주'], ['day', '일주'], ['month', '월주'], ['year', '연주']];
  const pillarsHTML = order.map(([key, cap]) => {
    const p = s.pillars[key];
    if (!p) return `<div class="pillar empty"><div class="cap">${cap}</div><div class="god">-</div><div class="char">?</div><div class="char">?</div><div class="god">시간 모름</div></div>`;
    const stemGod = key === 'day' ? '나 (일간)' : tenGod(s.dayMaster, p.stem);
    const branchGod = tenGod(s.dayMaster, BRANCH_MAIN_STEM[p.branch]);
    return `<div class="pillar ${key === 'day' ? 'me' : ''}">
      <div class="cap">${cap}</div>
      <div class="god">${stemGod}</div>
      ${charCell(p.stem, true)}
      ${charCell(p.branch, false)}
      <div class="god">${branchGod}</div>
    </div>`;
  }).join('');

  const prof = DAY_MASTER_PROFILE[s.dayMaster];
  const me = STEM_ELEMENT[s.dayMaster];
  const bars = s.elements.map((v, i) => `<div class="bar"><span class="el-${i}">${ELEMENT_KO[i]}(${ELEMENT_HANJA[i]})</span><div class="track"><div class="fill" style="width:${v}%;background:${EL_COLORS[i]};color:${EL_COLORS[i]}"></div></div><span class="num">${v}</span></div>`).join('');
  const hero = characterInfo(s, state.profile);
  const i = s.input;

  $('[data-panel="saju"]').innerHTML = `
    <div class="card">
      <h3>${name} 사주 원국 <span class="tag">${i.year}.${i.month}.${i.day}${i.timeKnown ? ` ${String(i.hour).padStart(2, '0')}:${String(i.minute).padStart(2, '0')}` : ''}</span></h3>
      <p class="muted" style="margin-top:-6px">${birthDatesText(state.profile, i)}</p>
      <div class="pillars">${pillarsHTML}</div>
      <p class="muted" style="margin-bottom:0">${s.animal}띠 · 일주 ${pillarLabel(s.pillars.day)}(${pillarLabelKo(s.pillars.day)}) · 사주 연도 ${s.sajuYear}년 기준</p>
    </div>

    <div class="card">
      <h3>타고난 기질 <span class="tag">일간 ${STEMS[s.dayMaster]}</span></h3>
      <p><b class="el-${me}">${prof.name} · ${prof.image}</b><br>${prof.text}</p>
      <p class="muted" style="margin-bottom:0">나의 수호 캐릭터: <b>${hero.title}</b> — <a href="#" data-go="hero" style="color:var(--neon)">캐릭터 탭에서 만나 보세요 →</a></p>
    </div>

    <div class="card">
      <h3>오행 스탯 <span class="tag">ELEMENT STATS</span></h3>
      <div class="split">
        <div class="radar">${radarSVG(s.elements)}</div>
        <div>
          <div class="bars">${bars}</div>
          <div class="stats">
            <div class="stat"><div class="k">신강/신약</div><div class="v">${s.strength}</div></div>
            <div class="stat"><div class="k">용신 (필요한 기운)</div><div class="v el-${s.yongsin}">${ELEMENT_KO[s.yongsin]}(${ELEMENT_HANJA[s.yongsin]})</div></div>
            <div class="stat"><div class="k">가장 부족</div><div class="v el-${s.weakest}">${ELEMENT_KO[s.weakest]}(${ELEMENT_HANJA[s.weakest]})</div></div>
          </div>
        </div>
      </div>
      <p class="muted">${strengthText(s)}</p>
      <button class="primary" type="button" data-go="charm" style="width:100%">부족한 ${ELEMENT_KO[s.weakest]} 기운 부적 만들러 가기 →</button>
    </div>`;
  $$('[data-go]', $('[data-panel="saju"]')).forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); selectTab(b.dataset.go); }));
}

function birthDatesText(p, i) {
  const lunar = solarToLunar(i.year, i.month, i.day);
  const solarText = `양력 ${i.year}년 ${i.month}월 ${i.day}일`;
  const lunarText = lunar ? `${formatLunar(lunar)}` : '';
  return p.calendar === 'lunar'
    ? `입력: <b>${lunarText}</b> → ${solarText}`
    : `입력: <b>${solarText}</b>${lunarText ? ` · ${lunarText}` : ''}`;
}

function strengthText(s) {
  const me = ELEMENT_KO[STEM_ELEMENT[s.dayMaster]];
  const base = s.strength === '신강'
    ? `${me} 기운과 이를 돕는 기운이 ${s.support}%로 강한 편(신강)입니다. 힘을 밖으로 써 주는 기운이 균형을 잡아 줍니다.`
    : s.strength === '신약'
      ? `${me} 기운과 이를 돕는 기운이 ${s.support}%로 약한 편(신약)입니다. 나를 북돋아 주는 기운이 힘이 됩니다.`
      : `${me} 기운과 이를 돕는 기운이 ${s.support}%로 균형 잡힌 편(중화)입니다. 가장 부족한 기운을 채우면 더 좋아집니다.`;
  return `${base} 그래서 용신은 ${ELEMENT_KO[s.yongsin]}(${ELEMENT_HANJA[s.yongsin]})입니다. (프로토타입용 간이 판정)`;
}

// ---------- 오늘의 운세 ----------

function renderToday() {
  const f = state.fortune; const s = state.saju;
  const missions = load(MISSION_KEY, {});
  const done = !!missions[f.dateKey];
  const circumference = 2 * Math.PI * 46;
  const offset = circumference * (1 - f.scores.total / 100);
  const cats = CATEGORIES.slice(1).map((c) => `<div class="cat" style="border-color:${scoreColor(f.scores[c.key])}">
      <div class="top"><span>${c.icon} ${c.label}</span><span class="num" style="color:${scoreColor(f.scores[c.key])}">${f.scores[c.key]}</span></div>
      <p>${f.texts[c.key]}</p></div>`).join('');
  const rel = f.relations.map((r) => `${{ hour: '시지', day: '일지', month: '월지', year: '연지' }[r.pillar]}와 ${r.type === 'combine' ? '합(合)' : '충(沖)'}`).join(', ');

  $('[data-panel="today"]').innerHTML = `
    <div class="card">
      <div class="today-head">
        <div class="score-ring">
          <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="7"/>
          <circle cx="50" cy="50" r="46" fill="none" stroke="${scoreColor(f.scores.total)}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" style="filter:drop-shadow(0 0 4px ${scoreColor(f.scores.total)})"/></svg>
          <div class="label"><div><b>${f.scores.total}</b><br><span>오늘 총운</span></div></div>
        </div>
        <div>
          <p class="muted" style="margin:0">${f.date.year}.${f.date.month}.${f.date.day} · 일진 ${pillarLabel(f.pillar)}(${pillarLabelKo(f.pillar)}) · ${f.tenGod}</p>
          <h3 style="margin:4px 0">${f.info.title}</h3>
          <p style="margin:0">${f.info.desc}</p>
        </div>
      </div>
      <p class="muted">${f.summary}${rel ? ` 오늘은 내 사주의 ${rel} 관계가 생깁니다.` : ''}</p>
    </div>

    ${concernCard()}

    <div class="card">
      <h3>분야별 운세</h3>
      <div class="cats">${cats}</div>
    </div>

    <div class="card">
      <h3>오늘의 행운 키트 <span class="tag">용신 ${ELEMENT_HANJA[s.yongsin]}</span></h3>
      <div class="kit">
        <div><div class="k">행운의 색</div><span class="swatch" style="background:${f.luck.hex};color:${f.luck.hex}"></span>${f.luck.color}</div>
        <div><div class="k">행운의 숫자</div><b>${f.luck.number}</b></div>
        <div><div class="k">행운의 방향</div>${f.luck.direction}</div>
        <div><div class="k">행운의 음식</div>${f.luck.food}</div>
        <div><div class="k">좋은 시간대</div>${f.luck.time}</div>
        <div><div class="k">행운 아이템</div>${f.luck.item}</div>
      </div>
      <p class="muted" style="margin-bottom:0">✅ 추천 행동: ${f.info.lucky} &nbsp;·&nbsp; ⚠️ 주의: ${f.info.caution}</p>
    </div>

    <div class="card">
      <h3>오늘의 액땜 미션</h3>
      <div class="mission ${done ? 'done' : ''}">
        <div style="flex:1"><b>${f.info.mission}</b><br><span class="muted">${done ? '정화 완료! 오늘의 액막이 부적이 한 단계 강해졌습니다.' : '완료하면 액막이 부적이 정화되어 효과가 강해집니다.'}</span></div>
        <button class="${done ? 'ghost' : 'primary'}" type="button" id="btn-mission">${done ? '완료됨 ✓' : '미션 완료'}</button>
      </div>
    </div>
    ${storyButton('fortune', '오늘의 운세를 스토리로 공유')}`;

  $('#btn-mission').addEventListener('click', () => {
    const m = load(MISSION_KEY, {});
    m[f.dateKey] = !m[f.dateKey];
    if (m[f.dateKey]) setTimeout(() => grow((g) => complete(g, f.dateKey, 'mission')), 400);
    save(MISSION_KEY, m);
    renderToday();
    renderCharm(false);
    if (m[f.dateKey]) toast('액땜 완료! 액막이 부적 등급이 한 단계 올랐습니다 ✦');
  });
}

function scoreColor(v) {
  if (v >= 80) return '#39FF88';
  if (v >= 60) return '#00E5FF';
  if (v >= 40) return '#FFC93C';
  return '#FF2E63';
}

// ---------- 부적 공방 ----------

function currentCharm() {
  const c = state.charm;
  const opts = { type: c.type, theme: c.theme, element: c.element, reroll: c.reroll };
  let t = createTalisman(state.saju, state.fortune, opts);
  // 액땜 미션을 끝냈으면 액막이 부적 등급 한 단계 상승
  const missions = load(MISSION_KEY, {});
  if (c.type === 'protect' && missions[state.fortune.dateKey]) {
    const idx = Math.min(RARITIES.length - 1, RARITIES.findIndex((r) => r.key === t.rarity.key) + 1);
    t = createTalisman(state.saju, state.fortune, { ...opts, rarity: RARITIES[idx].key });
    t.purified = true;
  }
  return t;
}

function renderCharm(animate) {
  const c = state.charm; const s = state.saju;
  const t = currentCharm();
  c.current = t;
  const collection = load(COLLECTION_KEY, []);
  const chip = (group, key, label, pressed) => `<button class="chip" type="button" data-${group}="${key}" aria-pressed="${pressed}">${label}</button>`;

  $('[data-panel="charm"]').innerHTML = `
    <div class="card">
      <h3>부적 공방 <span class="tag">TALISMAN FORGE</span></h3>
      <div class="controls">
        <div><div class="muted">종류</div><div class="chips">${TALISMAN_TYPES.map((x) => chip('type', x.key, x.label, x.key === c.type)).join('')}</div></div>
        <div><div class="muted">디자인</div><div class="chips">${THEMES.map((x) => chip('theme', x.key, x.label, x.key === c.theme)).join('')}</div></div>
        <div><div class="muted">보충할 기운 (기본값: 가장 부족한 ${ELEMENT_KO[s.weakest]})</div><div class="chips">${[0, 1, 2, 3, 4].map((e) => chip('el', e, `${ELEMENT_HANJA[e]} ${ELEMENT_KO[e]} · ${s.elements[e]}`, e === c.element)).join('')}</div></div>
      </div>
    </div>

    <div class="card">
      <div class="workshop">
        <div class="charm-stage ${animate ? 'reveal' : ''}" id="charm-stage">${renderTalismanSVG(t)}</div>
        <div>
          <p style="margin-top:0"><span class="rarity-badge" style="color:${t.rarity.color}">${t.rarity.label}</span> ${t.purified ? '<span class="rarity-badge" style="color:#39FF88">정화됨</span>' : ''}</p>
          <h3 style="margin:8px 0 2px">${t.type.label} 부적 · ${t.type.hanja}</h3>
          <p class="muted" style="margin-top:0">${t.type.reading} — ${t.type.meaning}</p>
          <ul>${t.effects.map((e) => `<li><b>${esc(e.stat)}</b> ${e.value > 0 ? '+' : ''}${e.value}%</li>`).join('')}</ul>
          <div class="formula">효과 = 등급 ${t.rarity.base}% × 부족 보정 ${t.calc.deficit.toFixed(2)} × 오늘 보정 ${t.calc.todayMul.toFixed(1)}<br>= ${t.calc.value}% (${ELEMENT_KO[t.element]} 기운 ${s.elements[t.element]}점 기준)</div>
          <div class="actions" style="margin-top:12px">
            <button class="primary" type="button" id="btn-reroll">다시 뽑기 ✦</button>
            <button class="ghost" type="button" id="btn-save">도감에 저장</button>
            <button class="ghost" type="button" id="btn-png">PNG 저장</button>
            <button class="ghost" type="button" data-story="charm">스토리 공유 ↗</button>
          </div>
          <p class="prob">획득 확률: ${RARITIES.map((r) => `<span style="color:${r.color}">${r.label} ${r.weight}%</span>`).join('')}</p>
          <p class="muted" style="font-size:0.78rem">오늘 첫 부적은 하루 동안 고정됩니다. 다시 뽑기 ${c.reroll}회 (실서비스에서는 광고 시청이나 재화 사용)</p>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>나의 부적 도감 <span class="tag">${collection.length}장</span></h3>
      ${collection.length ? `<div class="collection">${collection.map((o, idx) => `<div class="mini" data-idx="${idx}" title="${esc(o.label)}">${renderTalismanSVG(createTalisman(state.saju, { ...state.fortune, dateKey: o.dateKey, todayElement: o.todayElement }, o))}</div>`).join('')}</div>` : '<p class="muted" style="margin:0">아직 저장한 부적이 없습니다. 마음에 드는 부적을 도감에 모아 보세요.</p>'}
    </div>`;

  const panel = $('[data-panel="charm"]');
  $$('[data-type]', panel).forEach((b) => b.addEventListener('click', () => { c.type = b.dataset.type; c.reroll = 0; renderCharm(true); }));
  $$('[data-theme]', panel).forEach((b) => b.addEventListener('click', () => { c.theme = b.dataset.theme; renderCharm(true); }));
  $$('[data-el]', panel).forEach((b) => b.addEventListener('click', () => { c.element = Number(b.dataset.el); renderCharm(true); }));
  $('#btn-reroll').addEventListener('click', () => {
    c.reroll += 1;
    renderCharm(true);
    const r = c.current.rarity;
    if (r.key === 'legend' || r.key === 'myth') toast(`✨ ${r.label} 등급 획득!`);
  });
  $('#btn-save').addEventListener('click', () => {
    const list = load(COLLECTION_KEY, []);
    list.unshift({
      type: t.type.key, theme: t.theme, element: t.element, rarity: t.rarity.key,
      dateKey: t.dateKey, todayElement: state.fortune.todayElement, label: `${t.rarity.label} ${t.type.label}부`,
    });
    save(COLLECTION_KEY, list.slice(0, 60));
    renderCharm(false);
    toast('도감에 저장했습니다');
    grow((g) => complete(g, state.fortune.dateKey, 'charm'));
  });
  $('#btn-png').addEventListener('click', () => downloadSVGAsPNG(renderTalismanSVG(t), `talisman-${t.type.key}-${t.dateKey}.png`, 3));
  $$('.collection .mini', panel).forEach((m) => m.addEventListener('click', () => {
    const o = load(COLLECTION_KEY, [])[Number(m.dataset.idx)];
    if (!o) return;
    const svg = m.innerHTML;
    downloadSVGAsPNG(svg, `talisman-${o.type}-${o.dateKey}.png`, 3);
  }));
}

// ---------- 고민 맞춤 운세 ----------

const CONCERN_ADVICE = {
  exam: ['집중이 흐트러지기 쉬운 날입니다. 새 범위보다 복습에 집중하세요.', '평소 페이스를 지키면 충분합니다. 오답 노트를 정리하세요.', '머리가 맑은 날입니다. 어려운 단원에 도전해 보세요.', '합격 기운이 강합니다. 모의고사나 실전 연습에 최고의 날입니다.'],
  job: ['서류 실수에 주의하세요. 제출 전 한 번 더 확인하세요.', '꾸준히 지원하는 것이 답입니다. 이력서를 다듬어 두세요.', '좋은 소식이 들어올 수 있습니다. 연락에 바로 응답하세요.', '면접운이 강합니다. 자신감 있게 자신을 보여 주세요.'],
  wealth: ['지출이 새는 날입니다. 오늘은 지갑을 닫아 두세요.', '들어오고 나가는 돈이 비슷합니다. 가계부를 점검하세요.', '작은 이익이 생깁니다. 잊고 있던 돈을 챙겨 보세요.', '재물이 들어오는 흐름입니다. 기회를 놓치지 마세요.'],
  business: ['무리한 확장은 피하세요. 지금은 내실을 다질 때입니다.', '현상 유지가 최선입니다. 고객 관리에 신경 쓰세요.', '새 거래처와 인연이 생길 수 있습니다. 미팅을 잡아 보세요.', '사업운이 크게 열립니다. 계약과 협상에 좋은 날입니다.'],
  love: ['감정이 엇갈리기 쉽습니다. 서운한 말은 내일로 미루세요.', '잔잔한 하루입니다. 가벼운 안부가 관계를 데워 줍니다.', '호감을 얻기 쉬운 날입니다. 먼저 연락해 보세요.', '인연의 기운이 강합니다. 고백이나 데이트에 최고의 날입니다.'],
  marriage: ['작은 의견 차이를 키우지 마세요. 한발 양보가 복입니다.', '서두르지 않아도 됩니다. 함께 계획을 세워 보세요.', '가족의 지지가 들어옵니다. 중요한 이야기를 꺼내기 좋습니다.', '백년가약의 기운입니다. 상견례·예식 준비에 좋은 날입니다.'],
  health: ['몸이 신호를 보냅니다. 오늘은 무리하지 말고 푹 쉬세요.', '보통의 컨디션입니다. 물을 자주 마시고 스트레칭하세요.', '몸이 가볍습니다. 가벼운 운동을 시작하기 좋습니다.', '활력이 넘칩니다. 새로운 운동에 도전해 보세요.'],
  people: ['말 한마디가 오해를 부릅니다. 듣는 쪽에 서 보세요.', '무난한 하루입니다. 약속은 꼭 지키세요.', '사람 사이에서 기회가 생깁니다. 모임에 나가 보세요.', '귀인이 나타납니다. 새로운 인연을 반기세요.'],
  change: ['큰 결정은 미루세요. 정보를 더 모으는 날입니다.', '준비 단계에 집중하세요. 체크리스트를 만들어 두세요.', '새 길이 보입니다. 이직·이사 정보를 알아보기 좋습니다.', '변화의 기운이 강합니다. 결단을 내려도 좋은 날입니다.'],
};

function concernCard() {
  const s = state.saju; const f = state.fortune;
  const info = characterInfo(s, state.profile);
  const c = info.concern;
  const v = c.category === 'total' ? f.scores.total : f.scores[c.category];
  const tier = v >= 80 ? 3 : v >= 60 ? 2 : v >= 40 ? 1 : 0;
  return `<div class="card">
      <h3>${CONCERN_ICONS[c.key]} 고민 맞춤 운세 <span class="tag">${c.label}</span></h3>
      <div class="concern-card">
        <div style="display:flex;align-items:baseline;gap:10px"><span class="big" style="color:${scoreColor(v)}">${v}</span><b>오늘의 ${c.stat}</b></div>
        <p style="margin:6px 0 0">${CONCERN_ADVICE[c.key][tier]}</p>
      </div>
      <button class="ghost share-row" type="button" data-go-tab="charm" style="width:100%">${c.label}에 맞는 ${TALISMAN_TYPES.find((t) => t.key === c.talisman).label} 부적 만들기 →</button>
    </div>`;
}

// ---------- 수호 캐릭터 + 장착 ----------

function loadEquip() {
  const e = load(EQUIP_KEY, null);
  return { charms: [null, null], emote: null, ...(e || {}) };
}

function charmFromRecord(rec) {
  if (!rec) return null;
  return createTalisman(state.saju, { ...state.fortune, dateKey: rec.dateKey, todayElement: rec.todayElement }, rec);
}

function recordOf(t) {
  return { type: t.type.key, theme: t.theme, element: t.element, rarity: t.rarity.key, dateKey: t.dateKey, todayElement: state.fortune.todayElement, label: `${t.rarity.label} ${t.type.label}부` };
}

const sameRecord = (a, b) => a && b && a.type === b.type && a.theme === b.theme && a.element === b.element && a.rarity === b.rarity && a.dateKey === b.dateKey;

function heroOptions() {
  const eq = loadEquip();
  const stage = loadGrowth().evolved;
  const unlock = STAGE_UNLOCKS[stage - 1];
  const charms = eq.charms.map((r, i) => (i < unlock.charmSlots ? charmFromRecord(r) : null));
  const emote = unlock.emote ? eq.emote : null;
  return { eq, charms, mood: emote || todayEmote(state.fortune), emote, stage, unlock };
}

function renderHero(animate) {
  const s = state.saju; const f = state.fortune; const p = state.profile;
  const info = characterInfo(s, p);
  const { eq, charms, mood, emote, stage, unlock } = heroOptions();
  info.stage = stage;
  const stats = characterStats(s, f, info, charms);
  const svg = renderCharacterSVG(info, { mood, charms, emote, stage, width: 300, backdrop: true, animate: true });
  const svgStatic = renderCharacterSVG(info, { mood, charms, emote, stage, width: 300, backdrop: true });
  const gs = summary(loadGrowth(), f.dateKey);

  // 장착 후보: 지금 공방의 부적 + 도감
  const today = state.charm.current ? recordOf(state.charm.current) : null;
  const collection = load(COLLECTION_KEY, []);
  const candidates = [today, ...collection].filter(Boolean)
    .filter((r, i, arr) => arr.findIndex((x) => sameRecord(x, r)) === i);

  const slot = (i) => {
    if (i >= unlock.charmSlots) return `<div class="slot locked"><span>🔒 부적 슬롯 ${i + 1}<br>Lv.10 진화 시 해금</span></div>`;
    const t = charms[i];
    return `<div class="slot ${t ? 'filled' : ''}" data-slot="${i}" title="${t ? '눌러서 해제' : ''}">
      ${t ? `${renderTalismanSVG(t)}<span>${t.rarity.label} ${t.type.label}부</span>` : `<span>부적 슬롯 ${i + 1}<br>비어 있음</span>`}</div>`;
  };
  const emoteSlot = !unlock.emote ? '<div class="slot locked"><span>🔒 이모티콘 슬롯<br>Lv.5 진화 시 해금</span></div>' : emote
    ? `<div class="slot emote filled" data-slot="emote">${renderEmoticonSVG(s, f, { stage: heroOptions().stage, profile: p, mood: emote, style: 'sticker', tag: '' })}<span>${EMOTES.find((e) => e.key === emote).label}</span></div>`
    : `<div class="slot emote" data-slot="emote"><span>이모티콘 슬롯<br>비어 있음</span></div>`;

  const bar = (label, v, max, color) => `<div class="bar"><span>${label}</span><div class="track"><div class="fill" style="width:${Math.min(100, (v / max) * 100)}%;background:${color};color:${color}"></div></div><span class="num">${v}</span></div>`;

  $('[data-panel="hero"]').innerHTML = `
    ${growthCard(info, gs)}
    <div class="card">
      <div class="hero-wrap">
        <div class="hero-stage ${animate ? 'reveal' : ''}">${svg}</div>
        <div>
          <p class="muted" style="margin:0">${info.zodiac.name}띠(${info.zodiac.hanja}) · 일간 ${STEMS[s.dayMaster]}(${ELEMENT_KO[info.element]}) · ${info.female ? '여성' : '남성'} · 고민 ${info.concern.label}</p>
          <h3 class="hero-title">${info.title}</h3>
          <p style="margin:0 0 6px"><span class="rarity-badge" style="color:var(--gold)">Lv.${gs.level} · ${stageName(gs.stage, info.female)}</span></p>
          <p class="muted" style="margin-top:0">띠는 동물, 타고난 기운은 한복 색, 성별은 한복 모양, 고민은 손에 든 소품으로 정해졌습니다. 부적과 이모티콘을 장착해 능력치를 올려 보세요.</p>
          <div class="slots">${slot(0)}${slot(1)}${emoteSlot}</div>
          <div class="stats" style="grid-template-columns:1fr 1fr">
            <div class="stat"><div class="k">행운력</div><div class="v" style="color:var(--gold)">${stats.luckPower}</div></div>
            <div class="stat"><div class="k">오늘의 ${stats.concern.label}</div><div class="v" style="color:${scoreColor(stats.concern.value)}">${stats.concern.value}${stats.bonus ? ` <small style="color:var(--wood)">(+${stats.concern.value - stats.concern.baseValue})</small>` : ''}</div></div>
          </div>
          <div class="bars" style="margin-top:12px">${stats.base.map((b, i) => bar(b.label, b.value, 120, EL_COLORS[i])).join('')}</div>
        </div>
      </div>
      <div class="actions" style="margin-top:14px">
        <button class="primary" type="button" id="btn-hero-png">캐릭터 PNG 저장</button>
        <button class="ghost" type="button" data-story="hero">스토리 공유 ↗</button>
      </div>
    </div>

    <div class="card">
      <h3>부적 장착 <span class="tag">${candidates.length}장 보유</span></h3>
      ${candidates.length ? `<div class="equip-list">${candidates.map((r, i) => {
        const on = eq.charms.some((c) => sameRecord(c, r));
        return `<button type="button" data-equip="${i}" class="${on ? 'on' : ''}" title="${esc(r.label)}">${renderTalismanSVG(charmFromRecord(r))}</button>`;
      }).join('')}</div><p class="muted" style="font-size:0.8rem;margin-bottom:0">부적을 누르면 빈 슬롯에 장착되고, 장착된 부적을 다시 누르면 해제됩니다. 슬롯이 다 차면 2번 슬롯과 교체됩니다.</p>`
      : '<p class="muted" style="margin:0">부적 공방에서 부적을 만들고 도감에 저장하면 여기서 장착할 수 있습니다.</p>'}
    </div>

    <div class="card">
      <h3>이모티콘 장착 <span class="tag">표정 + 말풍선</span></h3>
      <div class="emote-chips">${EMOTES.map((e) => `<button type="button" data-emote="${e.key}" aria-pressed="${emote === e.key}">${renderEmoticonSVG(s, f, { stage: heroOptions().stage, profile: p, mood: e.key, style: 'sticker', tag: '', caption: e.label })}</button>`).join('')}</div>
    </div>`;

  const panel = $('[data-panel="hero"]');
  const saveEquip = (next) => { save(EQUIP_KEY, next); renderHero(false); grow((g) => complete(g, f.dateKey, 'equip')); };
  $$('[data-equip]', panel).forEach((b) => b.addEventListener('click', () => {
    const r = candidates[Number(b.dataset.equip)];
    const next = loadEquip();
    const idx = next.charms.findIndex((c) => sameRecord(c, r));
    if (idx >= 0) { next.charms[idx] = null; toast('부적을 해제했습니다'); } else {
      const allowed = unlock.charmSlots;
      const empty = next.charms.slice(0, allowed).findIndex((c) => !c);
      next.charms[empty >= 0 ? empty : allowed - 1] = r;
      toast(`${r.label} 장착! 행운력이 올랐습니다 ✦`);
    }
    saveEquip(next);
  }));
  $$('[data-slot]', panel).forEach((el) => el.addEventListener('click', () => {
    const next = loadEquip();
    if (el.dataset.slot === 'emote') next.emote = null; else next.charms[Number(el.dataset.slot)] = null;
    saveEquip(next);
  }));
  $$('[data-emote]', panel).forEach((b) => b.addEventListener('click', () => {
    if (!unlock.emote) { toast('🔒 Lv.5 견습 수호령으로 진화하면 이모티콘을 장착할 수 있어요'); return; }
    const next = loadEquip();
    next.emote = next.emote === b.dataset.emote ? null : b.dataset.emote;
    saveEquip(next);
  }));
  $('#btn-hero-png').addEventListener('click', () => downloadSVGAsPNG(svgStatic, `character-${info.zodiac.key}.png`, 3));
  bindGrowth(panel, info);
}

// ---------- 성장·진화 ----------

function loadGrowth() {
  return { ...emptyGrowth(), ...(load(GROWTH_KEY, null) || {}) };
}

/** 성장 상태를 바꾸고, 생긴 일(레벨업·진화 가능·스트릭 등)을 알려 준다 */
function grow(fn) {
  const res = fn(loadGrowth());
  save(GROWTH_KEY, res.growth);
  const msgs = [];
  for (const e of res.events || []) {
    if (e.type === 'level-up') msgs.push(`레벨 업! Lv.${e.level} 🎉`);
    if (e.type === 'can-evolve') msgs.push('진화할 수 있어요! 캐릭터 탭에서 진화하기 ✦');
    if (e.type === 'streak-lost') msgs.push(`연속 출석 ${e.count}일이 끊겼어요. 오늘부터 다시 시작!`);
    if (e.type === 'freeze-used') msgs.push('스트릭 보호 부적이 연속 출석을 지켜 줬어요 🛡️');
    if (e.type === 'streak-reward') msgs.push(`연속 ${e.reward.days}일 보상 도착! 캐릭터 탭에서 받기`);
  }
  if (res.gained) msgs.unshift(`+${res.gained} EXP`);
  if (msgs.length) toast(msgs.join(' · '));
  if (state.saju && !$('[data-panel="hero"]').classList.contains('hidden')) renderHero(false);
  return res;
}

function growthCard(info, gs) {
  const pct = Math.round((gs.into / gs.need) * 100);
  const thumbs = STAGES.map((st) => {
    const locked = st.stage > gs.stage;
    const svg = renderCharacterSVG(info, { stage: st.stage, width: 120, aura: false, mood: 'smile' });
    return `<figure class="evo ${locked ? 'locked' : ''} ${st.stage === gs.stage ? 'now' : ''}">${svg}<figcaption>${locked ? `Lv.${st.level}` : stageName(st.stage, info.female)}</figcaption></figure>`;
  }).join('<span class="evo-arrow">›</span>');
  const quests = gs.quests.map((q) => `<li class="${q.done ? 'done' : ''}"><span>${q.icon} ${q.label}</span><b>${q.done ? '완료' : `+${q.exp}`}</b></li>`).join('');
  const rewards = gs.pendingRewards.map((r) => `<button class="primary" type="button" data-claim="${r.days}">🎁 연속 ${r.days}일 보상 받기 · ${r.label}</button>`).join('');
  return `<div class="card growth">
    <div class="growth-head">
      <div>
        <div class="muted" style="font-size:0.8rem">${stageName(gs.stage, info.female)} · 진화 ${gs.stage}/5단계</div>
        <div class="lv">Lv.${gs.level}</div>
      </div>
      <div class="streak" title="연속 출석">🔥 <b>${gs.streak.count}</b>일 연속${gs.freeze ? ` · 🛡️${gs.freeze}` : ''}</div>
    </div>
    <div class="exp"><div class="exp-fill" style="width:${pct}%"></div><span>${gs.into} / ${gs.need} EXP</span></div>
    ${gs.canEvolve ? `<button class="primary evolve-btn" type="button" id="btn-evolve">✦ ${stageName(gs.reachedStage, info.female)}(으)로 진화하기 ✦</button>` : `<p class="muted" style="margin:8px 0 0;font-size:0.85rem">${gs.next ? `다음 진화 <b>${stageName(gs.next.stage, info.female)}</b>까지 ${gs.levelsToNext}레벨 — ${gs.next.desc}` : '최종 진화 완료! 전설의 신수가 되었습니다.'}</p>`}
    ${gs.next ? `<div class="perks"><span class="muted">다음 진화 보상</span>${STAGE_UNLOCKS[gs.next.stage - 1].perks.map((x) => `<em>🎁 ${x}</em>`).join('')}</div>` : ''}
    ${rewards ? `<div class="actions" style="margin-top:10px">${rewards}</div>` : ''}
    <div class="evo-road">${thumbs}</div>
    <h4 style="margin:14px 0 6px">오늘의 퀘스트 <span class="muted" style="font-weight:400;font-size:0.8rem">(${gs.todayExp} / 90 EXP)</span></h4>
    <ul class="quests">${quests}</ul>
    <p class="muted" style="font-size:0.78rem;margin:8px 0 0">${gs.nextReward ? `🔥 ${gs.nextReward.days}일 연속 출석하면: ${gs.nextReward.label}` : '모든 연속 출석 보상을 받았습니다!'}</p>
    <details class="advanced" style="margin-top:10px"><summary>프로토타입 체험 도구</summary>
      <p class="muted" style="font-size:0.8rem;margin:0">실서비스에서는 매일 퀘스트로만 경험치를 얻습니다. 진화 단계를 빨리 보려면 눌러 보세요.</p>
      <button class="ghost" type="button" id="btn-exp-test">경험치 +60 (체험용)</button>
    </details>
  </div>`;
}

function bindGrowth(panel, info) {
  $('#btn-evolve', panel)?.addEventListener('click', () => {
    const before = loadGrowth().evolved;
    const res = evolve(loadGrowth());
    save(GROWTH_KEY, res.growth);
    showEvolution(info, before, res.to);
  });
  $$('[data-claim]', panel).forEach((b) => b.addEventListener('click', () => {
    const res = claimStreakReward(loadGrowth(), Number(b.dataset.claim));
    save(GROWTH_KEY, res.growth);
    if (res.reward) {
      const c = CONCERNS.find((x) => x.key === state.profile.concern) || CONCERNS[2];
      const list = load(COLLECTION_KEY, []);
      const t = createTalisman(state.saju, state.fortune, { type: c.talisman, theme: 'neon', element: state.saju.weakest, rarity: res.reward.rarity });
      list.unshift(recordOf(t));
      save(COLLECTION_KEY, list.slice(0, 60));
      toast(`🎁 ${t.rarity.label} ${t.type.label}부를 도감에 넣었습니다${res.reward.freeze ? ' + 스트릭 보호 부적 1개' : ''}`);
    }
    renderHero(false);
  }));
  $('#btn-exp-test', panel)?.addEventListener('click', () => grow((g) => addExp(g, 60)));
}

function showEvolution(info, from, to) {
  const { charms, emote } = heroOptions();
  const before = renderCharacterSVG(info, { stage: from, width: 260, mood: 'wow', backdrop: true });
  const after = renderCharacterSVG(info, { stage: to, width: 260, mood: 'excited', charms, emote, backdrop: true, animate: true });
  const el = document.createElement('div');
  el.className = 'evo-modal';
  el.innerHTML = `<div class="evo-box">
    <p class="muted" style="margin:0">EVOLUTION</p>
    <div class="evo-stage"><div class="evo-before">${before}</div><div class="evo-after">${after}</div><div class="evo-flash"></div></div>
    <h3>${info.zodiac.name}가 <span style="color:var(--gold)">${stageName(to, info.female)}</span>(으)로 진화했습니다!</h3>
    <p class="muted">${STAGES[to - 1].desc}</p>
    <div class="perks" style="justify-content:center">${STAGE_UNLOCKS[to - 1].perks.map((x) => `<em>✨ ${x}</em>`).join('')}</div>
    <button class="primary" type="button">확인</button></div>`;
  document.body.appendChild(el);
  el.querySelector('button').addEventListener('click', () => { el.remove(); renderHero(true); renderEmoji(); });
}

// ---------- 친구 궁합 ----------

function friendSaju(fr) {
  const solar = fr.calendar === 'lunar' ? lunarToSolar(fr.year, fr.month, fr.day, false) : { year: fr.year, month: fr.month, day: fr.day };
  if (solar.error) return { error: solar.error };
  return computeSaju({ ...solar, timeKnown: false });
}

function renderCompat() {
  const panel = $('[data-panel="compat"]');
  const friends = load(FRIENDS_KEY, []);
  const sel = state.compatIdx ?? (friends.length ? 0 : null);
  const opt = (n, a, b) => Array.from({ length: b - a + 1 }, (_, i) => `<option value="${a + i}">${a + i}${n}</option>`).join('');
  panel.innerHTML = `
    <div class="card">
      <h3>💞 친구 궁합 <span class="tag">COMPATIBILITY</span></h3>
      <p class="muted" style="margin-top:0">친구의 생일만 넣으면 친구의 12지신 캐릭터가 만들어지고, 띠·타고난 기운·오행 보완으로 궁합을 봐 드려요. 친구 정보는 이 기기에만 저장됩니다.</p>
      <form id="friend-form" class="friend-form" autocomplete="off">
        <input name="fname" type="text" maxlength="10" placeholder="친구 이름" required>
        <div class="seg"><label><input type="radio" name="fgender" value="female" checked><span>여성</span></label><label><input type="radio" name="fgender" value="male"><span>남성</span></label></div>
        <div class="seg"><label><input type="radio" name="fcal" value="solar" checked><span>양력</span></label><label><input type="radio" name="fcal" value="lunar"><span>음력</span></label></div>
        <div class="ymd">
          <input name="fyear" type="number" min="1900" max="2100" placeholder="년도" required>
          <select name="fmonth">${opt('월', 1, 12)}</select>
          <select name="fday">${opt('일', 1, 31)}</select>
        </div>
        <button class="primary" type="submit">궁합 보기 ✦</button>
      </form>
      ${friends.length ? `<div class="chips" style="margin-top:12px">${friends.map((fr, i) => `<button class="chip" type="button" data-friend="${i}" aria-pressed="${i === sel}">${esc(fr.name)}</button>`).join('')}</div>` : ''}
    </div>
    <div id="compat-result">${sel !== null && friends[sel] ? compatResultHTML(friends[sel], sel) : '<div class="card"><p class="muted" style="margin:0">친구를 추가하면 두 캐릭터가 함께 나오는 궁합 카드가 만들어집니다.</p></div>'}</div>`;

  const form = $('#friend-form', panel);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fr = { name: form.fname.value.trim() || '친구', gender: form.fgender.value, calendar: form.fcal.value, year: Number(form.fyear.value), month: Number(form.fmonth.value), day: Number(form.fday.value) };
    if (!validYear(fr.year)) { toast('1900~2100년 사이로 입력해 주세요'); return; }
    const fs = friendSaju(fr);
    if (fs.error) { toast(fs.error); return; }
    const list = load(FRIENDS_KEY, []);
    list.unshift(fr);
    save(FRIENDS_KEY, list.slice(0, 12));
    state.compatIdx = 0;
    renderCompat();
    grow((g) => complete(g, state.fortune.dateKey, 'compat'));
  });
  $$('[data-friend]', panel).forEach((b) => b.addEventListener('click', () => { state.compatIdx = Number(b.dataset.friend); renderCompat(); }));
  $('#btn-friend-del', panel)?.addEventListener('click', () => {
    const list = load(FRIENDS_KEY, []);
    list.splice(sel, 1); save(FRIENDS_KEY, list); state.compatIdx = list.length ? 0 : null; renderCompat();
  });
  $('#btn-compat-charm', panel)?.addEventListener('click', () => {
    const c = state.compat;
    const rarity = c.compat.score >= 88 ? 'legend' : c.compat.score >= 75 ? 'epic' : c.compat.score >= 62 ? 'rare' : 'common';
    const t = createTalisman(state.saju, state.fortune, { type: c.friendInfo.female !== state.profile.gender ? 'love' : 'luck', theme: 'neon', element: c.friendSaju.weakest, rarity });
    const list = load(COLLECTION_KEY, []);
    list.unshift({ ...recordOf(t), label: `${c.friendName}와의 ${t.rarity.label} 인연부` });
    save(COLLECTION_KEY, list.slice(0, 60));
    toast(`💞 ${c.friendName}와의 ${t.rarity.label} 인연부를 도감에 넣었어요. 캐릭터 탭에서 장착하세요!`);
    renderCharm(false);
  });
  $('#btn-compat-png', panel)?.addEventListener('click', () => downloadSVGAsPNG(state.compat.svg, `compat-${state.compat.friendName}.png`, 3));
}

function compatResultHTML(fr, idx) {
  const fs = friendSaju(fr);
  if (fs.error) return `<div class="card"><p class="muted">${fs.error}</p></div>`;
  const myInfo = characterInfo(state.saju, state.profile);
  const friendInfo = characterInfo(fs, { gender: fr.gender, concern: 'people' });
  const c = computeCompat(state.saju, fs, state.fortune.date);
  const { charms, stage } = heroOptions();
  const myName = state.profile.name || '나';
  const svg = renderCompatSVG(myInfo, friendInfo, c, { myName, friendName: fr.name, myStage: stage, myCharms: charms });
  state.compat = { myInfo, friendInfo, compat: c, svg, myName, friendName: fr.name, friendSaju: fs, myStage: stage, myCharms: charms };
  const bar = (label, v) => `<div class="bar"><span>${label}</span><div class="track"><div class="fill" style="width:${v}%;background:${scoreColor(v)};color:${scoreColor(v)}"></div></div><span class="num">${v}</span></div>`;
  return `<div class="card">
    <div class="compat-stage">${svg}</div>
    <h3 style="margin:12px 0 4px;color:${c.grade.color}">${c.grade.label} · ${c.score}점</h3>
    <p style="margin-top:0">${c.grade.desc}</p>
    <div class="bars">${bar('💕 연애', c.sub.love)}${bar('🤝 우정', c.sub.friend)}${bar('💼 일', c.sub.work)}</div>
    <ul class="reasons">
      <li><b>띠</b> ${myInfo.zodiac.name}띠 × ${friendInfo.zodiac.name}띠 — ${c.branch.label}: ${c.branch.text} <em>${c.branch.score >= 0 ? '+' : ''}${c.branch.score}</em></li>
      <li><b>타고난 기운</b> ${STEMS[state.saju.dayMaster]} × ${STEMS[fs.dayMaster]} — ${c.stem.label}: ${c.stem.text} <em>${c.stem.score >= 0 ? '+' : ''}${c.stem.score}</em></li>
      <li><b>오행 보완</b> 서로 부족한 기운을 채워 주는 정도 <em>+${c.complement}</em></li>
      <li><b>오늘의 기운</b> 오늘 날짜에 따라 달라지는 보너스 <em>${c.todayBonus >= 0 ? '+' : ''}${c.todayBonus}</em></li>
    </ul>
    <p class="concern-card" style="margin:10px 0 0">💡 오늘의 팁: ${c.tip}</p>
    <div class="actions" style="margin-top:12px">
      <button class="primary" type="button" data-story="compat">📸 궁합 카드 스토리 공유</button>
      <button class="ghost" type="button" id="btn-compat-charm">💞 인연 부적 받기</button>
      <button class="ghost" type="button" id="btn-compat-png">PNG 저장</button>
      <button class="ghost" type="button" id="btn-friend-del">친구 삭제</button>
    </div>
    <p class="muted" style="font-size:0.78rem;margin-bottom:0">친구 캐릭터는 생일만으로 만든 임시 캐릭터입니다. 친구가 직접 가입하면 성별·고민·진화가 반영된 진짜 캐릭터로 바뀌어요.</p>
  </div>`;
}

// ---------- 행운 이모티콘 ----------

function renderEmoji() {
  const s = state.saju; const f = state.fortune; const p = state.profile;
  const info = characterInfo(s, p);
  const style = state.emojiStyle;
  const main = renderEmoticonSVG(s, f, { stage: heroOptions().stage, profile: p, style });
  const set = EMOTES.map((m) => ({ m, svg: renderEmoticonSVG(s, f, { stage: heroOptions().stage, profile: p, mood: m.key, style, tag: '' }) }));

  $('[data-panel="emoji"]').innerHTML = `
    <div class="card">
      <h3>오늘의 행운 이모티콘 <span class="tag">${f.dateKey}</span></h3>
      <div class="emoji-main">
        <div class="stage" id="emoji-stage">${main}</div>
        <div>
          <p style="margin-top:0"><b class="el-${info.element}">${info.title}</b></p>
          <p class="muted">내 수호 캐릭터로 만든 스티커입니다. 표정은 오늘 총운(${f.scores.total}점), 배지는 오늘 가장 좋은 운세(${CATEGORIES.find((c) => c.key === f.best).label})로 매일 바뀝니다.</p>
          <div class="actions">
            <button class="chip" type="button" id="btn-emoji-style" aria-pressed="${style === 'neon'}">${style === 'neon' ? '네온 배경' : '투명 스티커'}</button>
            <button class="primary" type="button" id="btn-emoji-png">PNG 저장</button>
            <button class="ghost" type="button" data-story="hero">스토리 공유 ↗</button>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>이모티콘 세트 8종 <span class="tag">PREMIUM</span></h3>
      <div class="emoji-set">${set.map(({ m, svg }, i) => `<figure data-set="${i}">${svg}<figcaption>${m.label}</figcaption></figure>`).join('')}</div>
      <p class="muted" style="margin-bottom:0">누르면 저장됩니다. 캐릭터 탭에서 이모티콘을 장착하면 캐릭터의 표정과 말풍선이 바뀝니다.</p>
    </div>`;

  $('#btn-emoji-style').addEventListener('click', () => { state.emojiStyle = style === 'neon' ? 'sticker' : 'neon'; renderEmoji(); });
  $('#btn-emoji-png').addEventListener('click', () => downloadSVGAsPNG(main, `lucky-emoji-${f.dateKey}.png`, 3));
  $$('[data-set]').forEach((fig) => fig.addEventListener('click', () => {
    const { m, svg } = set[Number(fig.dataset.set)];
    downloadSVGAsPNG(svg, `emoji-${m.key}.png`, 3);
  }));
}

// ---------- 인스타 스토리 공유 ----------

function storyButton(template, label) {
  return `<button class="primary share-row" type="button" data-story="${template}" style="width:100%">📸 ${label}</button>`;
}

function shareUrl() {
  const path = location.pathname.replace(/index\.html$/, '');
  return `${location.host}${path}`.replace(/\/$/, '');
}

async function renderStory() {
  const panel = $('[data-panel="story"]');
  const tpl = state.storyTemplate;
  panel.innerHTML = `
    <div class="card">
      <h3>인스타 스토리 공유 카드 <span class="tag">1080 × 1920</span></h3>
      <div class="chips">${STORY_TEMPLATES.map((t) => `<button class="chip" type="button" data-tpl="${t.key}" aria-pressed="${t.key === tpl}">${t.label}</button>`).join('')}</div>
    </div>
    <div class="card">
      <div class="story-wrap">
        <div class="story-preview" id="story-preview"><span class="loading">카드 만드는 중…</span></div>
        <div>
          <div class="actions">
            <button class="primary" type="button" id="btn-story-share">📸 스토리에 공유하기</button>
            <button class="ghost" type="button" id="btn-story-save">이미지 저장</button>
            <button class="ghost" type="button" id="btn-story-link">링크 복사</button>
          </div>
          <ol class="howto">
            <li><b>휴대폰</b>: "스토리에 공유하기" → 공유 목록에서 <b>Instagram</b> → <b>스토리</b>를 고르면 바로 올라갑니다.</li>
            <li>공유 목록에 Instagram이 없으면 "이미지 저장" 후, 인스타그램 앱 → 스토리 → 갤러리에서 방금 저장한 이미지를 고르세요.</li>
            <li>"링크 복사"를 눌러 두고, 스토리 편집 화면의 <b>링크 스티커</b>에 붙여 넣으면 친구가 바로 들어올 수 있습니다.</li>
            <li>카드의 위·아래 여백은 인스타 프로필·답장창에 가려지지 않도록 비워 두었습니다.</li>
          </ol>
          ${window.self !== window.top ? '<p class="preview-note">지금은 미리보기 화면이라 공유·저장 버튼이 막혀 있을 수 있습니다. 왼쪽 카드 이미지를 <b>길게 눌러(PC는 오른쪽 클릭) 저장</b>한 뒤 인스타그램 스토리에서 불러오세요.</p>' : ''}
          <p class="muted" style="font-size:0.8rem">부적 카드는 "부적 공방"에서 지금 고른 부적(종류·디자인·등급)이 그대로 들어갑니다.</p>
        </div>
      </div>
    </div>`;

  $$('[data-tpl]', panel).forEach((b) => b.addEventListener('click', () => { state.storyTemplate = b.dataset.tpl; renderStory(); }));
  $('#btn-story-share').addEventListener('click', () => doShare(false));
  $('#btn-story-save').addEventListener('click', () => doShare(true));
  $('#btn-story-link').addEventListener('click', async () => {
    const url = location.href.split('?')[0].split('#')[0];
    try { await navigator.clipboard.writeText(url); toast('링크를 복사했습니다'); } catch { toast(url); }
  });

  if (tpl === 'compat' && !state.compat) {
    $('#story-preview').innerHTML = '<span class="loading">궁합 탭에서 친구를 먼저 추가해 주세요</span>';
    return;
  }
  const canvas = await renderStoryCanvas({
    saju: state.saju,
    fortune: state.fortune,
    talisman: state.charm.current || currentCharm(),
    profile: state.profile,
    template: tpl,
    url: shareUrl(),
    hero: { info: characterInfo(state.saju, state.profile), ...heroOptions() },
    compat: state.compat,
  });
  if (state.storyTemplate !== tpl) return; // 그사이 다른 템플릿을 고른 경우
  state.storyCanvas = canvas;
  const img = new Image();
  img.alt = '스토리 카드 미리보기';
  img.src = canvas.toDataURL('image/png');
  $('#story-preview').replaceChildren(img);
}

async function doShare(downloadOnly) {
  const canvas = state.storyCanvas;
  if (!canvas) { toast('카드를 만드는 중입니다. 잠시 후 다시 눌러 주세요'); return; }
  const filename = `unmyeong-story-${state.storyTemplate}-${state.fortune.dateKey}.png`;
  if (downloadOnly) {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png'); a.download = filename; a.click();
    toast('이미지를 저장했습니다. 인스타그램 스토리에서 불러오세요');
    grow((g) => complete(g, state.fortune.dateKey, 'share'));
    return;
  }
  const result = await shareStory(canvas, {
    title: '운명공방 2099',
    text: `오늘 내 운세는? ${state.fortune.info.title} ✦`,
    filename,
  });
  if (result === 'downloaded') toast('이 기기는 바로 공유를 지원하지 않아 이미지로 저장했습니다');
  if (result !== 'cancelled') grow((g) => complete(g, state.fortune.dateKey, 'share'));
}

// 다른 탭의 "스토리 공유" 버튼
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-story]');
  if (!btn) return;
  state.storyTemplate = btn.dataset.story;
  selectTab('story');
});

// 다른 탭으로 이동하는 버튼
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-go-tab]');
  if (!btn) return;
  selectTab(btn.dataset.goTab);
});

// ---------- 시작 ----------

$$('.tabs button').forEach((b) => b.addEventListener('click', () => selectTab(b.dataset.tab)));
initForm();
