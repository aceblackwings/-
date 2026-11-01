import {
  computeSaju, tenGod, STEMS, STEMS_KO, BRANCHES, BRANCHES_KO, STEM_ELEMENT, BRANCH_ELEMENT,
  BRANCH_MAIN_STEM, ELEMENT_KO, ELEMENT_HANJA, pillarLabel, pillarLabelKo,
} from './saju.js';
import { computeFortune, CATEGORIES, DAY_MASTER_PROFILE } from './fortune.js';
import {
  createTalisman, renderTalismanSVG, downloadSVGAsPNG, TALISMAN_TYPES, THEMES, RARITIES,
} from './talisman.js';
import { renderEmoticonSVG, GUARDIANS, SET_MOODS } from './emoticon.js';
import { renderStoryCanvas, shareStory, STORY_TEMPLATES } from './story.js';
import {
  lunarToSolar, solarToLunar, leapMonthOf, lunarMonthDays, formatLunar,
} from './lunar.js';

const STORE_KEY = 'unmyeong2099.profile';
const COLLECTION_KEY = 'unmyeong2099.collection';
const MISSION_KEY = 'unmyeong2099.missions';
const EL_COLORS = ['#39FF88', '#FF2E63', '#FFC93C', '#E0E0FF', '#00E5FF'];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const state = {
  profile: null,
  saju: null,
  fortune: null,
  charm: { type: 'protect', theme: 'neon', element: null, reroll: 0, current: null },
  emojiNeon: true,
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
  $('#view-input').classList.add('hidden');
  $('#view-result').classList.remove('hidden');
  $('#btn-edit').classList.remove('hidden');
  renderAll();
  selectTab('saju');
}

function initForm() {
  const form = $('#birth-form');
  const saved = normalizeProfile(load(STORE_KEY, null));
  const preview = $('#conv-preview');
  const leapRow = $('.leap-row');

  for (let m = 1; m <= 12; m++) form.month.add(new Option(`${m}월`, m));

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
    const profile = {
      name: form.name.value.trim(),
      ...f,
      time: form.time.value || '12:00',
      timeUnknown: form.timeUnknown.checked,
      lonCorr: form.lonCorr.checked,
      zasi: form.zasi.value,
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

  if (saved && !solarDateOf(saved).error && new URLSearchParams(location.search).get('auto') !== '0') start(saved);
}

// ---------- 탭 ----------

function selectTab(name) {
  $$('.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
  $$('.panel').forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== name));
  if (name === 'story') renderStory();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderAll() {
  renderSaju();
  renderToday();
  renderCharm(false);
  renderEmoji();
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
  const g = GUARDIANS[s.dayMaster];
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
      <p class="muted" style="margin-bottom:0">나의 수호령: <b>${g.name}</b> (행운 이모티콘 탭에서 만나 보세요)</p>
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
  $('[data-go="charm"]').addEventListener('click', () => selectTab('charm'));
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
  });
  $('#btn-png').addEventListener('click', () => downloadSVGAsPNG(renderTalismanSVG(t), `talisman-${t.type.key}-${t.dateKey}.png`, 3));
  $$('.collection .mini', panel).forEach((m) => m.addEventListener('click', () => {
    const o = load(COLLECTION_KEY, [])[Number(m.dataset.idx)];
    if (!o) return;
    const svg = m.innerHTML;
    downloadSVGAsPNG(svg, `talisman-${o.type}-${o.dateKey}.png`, 3);
  }));
}

// ---------- 행운 이모티콘 ----------

function renderEmoji() {
  const s = state.saju; const f = state.fortune;
  const g = GUARDIANS[s.dayMaster];
  const neon = state.emojiNeon;
  const main = renderEmoticonSVG(s, f, { neon });
  const set = SET_MOODS.map((m) => ({ m, svg: renderEmoticonSVG(s, f, { mood: m.key, caption: m.caption, neon }) }));

  $('[data-panel="emoji"]').innerHTML = `
    <div class="card">
      <h3>오늘의 행운 이모티콘 <span class="tag">${f.dateKey}</span></h3>
      <div class="emoji-main">
        <div class="stage" id="emoji-stage">${main}</div>
        <div>
          <p style="margin-top:0">나의 수호령 <b class="el-${STEM_ELEMENT[s.dayMaster]}">${g.name}</b></p>
          <p class="muted">일간 ${STEMS[s.dayMaster]}(${ELEMENT_KO[STEM_ELEMENT[s.dayMaster]]})의 기운을 닮은 캐릭터입니다. 표정은 오늘 총운(${f.scores.total}점), 소품은 오늘 가장 좋은 운세(${CATEGORIES.find((c) => c.key === f.best).label})로 매일 바뀝니다.</p>
          <div class="actions">
            <button class="chip" type="button" id="btn-emoji-style" aria-pressed="${neon}">${neon ? '네온 스타일' : '파스텔 스타일'}</button>
            <button class="primary" type="button" id="btn-emoji-png">PNG 저장</button>
            <button class="ghost" type="button" data-story="emoji">스토리 공유 ↗</button>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>이모티콘 세트 미리보기 <span class="tag">PREMIUM</span></h3>
      <div class="emoji-set">${set.map(({ m, svg }, i) => `<figure data-set="${i}">${svg}<figcaption>${m.label}</figcaption></figure>`).join('')}</div>
      <p class="muted" style="margin-bottom:0">실서비스에서는 8종 세트를 2,200원에 판매하는 상품으로 기획했습니다. 지금은 눌러서 바로 저장할 수 있습니다.</p>
    </div>`;

  $('#btn-emoji-style').addEventListener('click', () => { state.emojiNeon = !state.emojiNeon; renderEmoji(); });
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

  const canvas = await renderStoryCanvas({
    saju: state.saju,
    fortune: state.fortune,
    talisman: state.charm.current || currentCharm(),
    profile: state.profile,
    template: tpl,
    url: shareUrl(),
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
    return;
  }
  const result = await shareStory(canvas, {
    title: '운명공방 2099',
    text: `오늘 내 운세는? ${state.fortune.info.title} ✦`,
    filename,
  });
  if (result === 'downloaded') toast('이 기기는 바로 공유를 지원하지 않아 이미지로 저장했습니다');
}

// 다른 탭의 "스토리 공유" 버튼
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-story]');
  if (!btn) return;
  state.storyTemplate = btn.dataset.story;
  selectTab('story');
});

// ---------- 시작 ----------

$$('.tabs button').forEach((b) => b.addEventListener('click', () => selectTab(b.dataset.tab)));
initForm();
