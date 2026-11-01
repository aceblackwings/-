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
  CONCERNS, characterInfo, renderCharacterSVG, characterStats, STAGE_UNLOCKS, characterMarkup, ZODIAC,
} from './character.js';
import { computeCompat, renderCompatSVG } from './compat.js';
import { personalityOf, speak } from './personality.js';
import { pairDialogue, pairLine } from './pairtalk.js';
import { computeDex, emptyDex, recordDiscoveries, claimMilestone } from './dex.js';
import {
  computeDaewoon, daewoonAt, fiveYearForecast, emptyLuck, addCharge, rollYear, luckIndex, luckTierText,
  daewoonComment, pillarTheme, pillarLabelFull, CHARGE_BY_RARITY, STAGE_LUCK_GATE, STAGE_LIFETIME_GATE, chargeTargets, yearPillar, pillarScore,
} from './luck.js';
import { STICKERS, renderStickerSVG } from './stickers.js';
import { RATES, PITY, PRICES, EXTRA_PER_DAY, drawPack, emptyGacha, todayGacha, isSubscribed, drawsLeft, rarityRank } from './gacha.js';
import { ASCENSION, abilitiesAt, nextAscension, ascensionOf, trialProgress, growthBoost, TRIALS } from './ascension.js';
import { journeyStep, emptyJourney, completeStep, JOURNEY_DAYS, JOURNEYS } from './journey.js';
import { dailySpots, distanceM, treasureRarity, bearingName, ARRIVE_RADIUS, DEMO_CENTER, PARTNER_SAMPLES } from './fengshui.js';
import { renderStoryCanvas, shareStory, STORY_TEMPLATES } from './story.js';
import {
  QUESTS, STAGES, STREAK_REWARDS, emptyGrowth, checkIn, complete, addExp, evolve, claimStreakReward, summary, stageName,
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
const DEX_KEY = 'unmyeong2099.dex';
const LUCK_KEY = 'unmyeong2099.luck';
const STICKER_KEY = 'unmyeong2099.stickers';
const EMO_OWN_KEY = 'unmyeong2099.emotes';
const DAILY_KEY = 'unmyeong2099.daily';
const GACHA_KEY = 'unmyeong2099.gacha';
const JOURNEY_KEY = 'unmyeong2099.journey';
const FENG_KEY = 'unmyeong2099.feng';
const SOC_KEY = 'unmyeong2099.social';
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
  setTimeout(() => el.remove(), Math.min(5200, 2000 + msg.length * 35));
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

function start(profile, mode = 'today') {
  state.profile = profile;
  state.saju = computeSaju(profileToInput(profile));
  state.fortune = computeFortune(state.saju);
  state.fortune = applyAbilities(state.fortune);
  state.charm.element = state.saju.weakest;
  state.charm.reroll = 0;
  state.charm.type = (CONCERNS.find((c) => c.key === profile.concern) || CONCERNS[2]).talisman;
  $('#view-input').classList.add('hidden');
  $('#view-result').classList.remove('hidden');
  $('#btn-edit').classList.remove('hidden');
  renderAll();
  selectTab(mode === 'summon' ? 'today' : (state.lastTab || 'today'));
  if (mode === 'summon') setTimeout(showSummon, 200);
  const lastSeen = loadGrowth().streak.last;
  state.backLine = null;
  state.heroLine = null;
  if (lastSeen && lastSeen !== state.fortune.dateKey) {
    const dn = (k) => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
    if (dn(state.fortune.dateKey) - dn(lastSeen) >= 2) state.backLine = say('back');
  }
  grow((g) => checkIn(g, state.fortune.dateKey));
  setTimeout(() => { processDexRewards(); renderCompat(); }, 2600);
  const abS = abilitiesAt(loadGrowth().evolved);
  if (abS.autoCharge) setTimeout(() => { const { fills } = luckNow(); const low = fills.indexOf(Math.min(...fills)); charge(low, abS.autoCharge, 'taeguk', '☯ 태극 순환'); }, 5200);
}

function initForm() {
  const form = $('#birth-form');
  const saved = normalizeProfile(load(STORE_KEY, null));
  const preview = $('#conv-preview');
  const leapRow = $('.leap-row');

  for (let m = 1; m <= 12; m++) form.month.add(new Option(`${m}월`, m));
  $('#concern-grid').innerHTML = CONCERNS.map((c) => `<label><input type="radio" name="concern" value="${c.key}"><span><i>${CONCERN_ICONS[c.key]}</i>${c.label}</span></label>`).join('');
  const goStep = (n) => {
    $$('.step', form).forEach((st) => st.classList.toggle('hidden', st.dataset.step !== String(n)));
    $$('.steps-dots i').forEach((d, i) => d.classList.toggle('on', i < n));
  };
  $$('[data-next]', form).forEach((b) => b.addEventListener('click', () => {
    const n = Number(b.dataset.next);
    if (n === 2) {
      if (!validYear(Number(form.year.value))) { toast('태어난 해를 1900~2100 사이로 입력해 주세요'); return; }
      const sd = solarDateOf(readForm()); if (sd.error) { toast(sd.error); return; }
    }
    if (n === 3) {
      if (!form.concern.value) { toast('지금 가장 큰 고민을 하나 골라 주세요'); return; }
      if (!form.gender.value) { toast('성별을 선택해 주세요'); return; }
    }
    goStep(n);
  }));
  $$('[data-prev]', form).forEach((b) => b.addEventListener('click', () => goStep(Number(b.dataset.prev))));
  $('#btn-skip-time').addEventListener('click', () => { form.timeUnknown.checked = true; form.requestSubmit(); });

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
    const firstTime = !load(GROWTH_KEY, null);
    const prev = load(STORE_KEY, null);
    if (!prev || prev.concern !== profile.concern) save(JOURNEY_KEY, emptyJourney(profile.concern));
    save(STORE_KEY, profile);
    start(profile, firstTime ? 'summon' : 'today');
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
  state.lastTab = name;
  $$('.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
  $$('.panel').forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== name));
  if (name === 'story') renderStory();
  if (name === 'hero') renderHero(true);
  if (name === 'feng') renderFeng();
  if (name === 'today' && state.fortune) grow((g) => complete(g, state.fortune.dateKey, 'fortune', qBonus('fortune')));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderAll() {
  renderSaju();
  renderToday();
  renderCharm(false);
  renderHero(false);
  renderEmoji();
  renderCompat();
  renderReport();
  renderFeng();
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
    </div>
    ${daewoonCardHTML()}`;
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

    ${todaySayCard()}

    ${todoCardHTML()}

    ${journeyCardHTML()}

    ${dailyCardHTML()}

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
    const missionLead = m[f.dateKey] ? `${say('missionDone')} (액막이 부적 등급 +1)` : '';
    save(MISSION_KEY, m);
    renderToday();
    renderCharm(false);
    if (m[f.dateKey]) {
      grow((g) => complete(g, f.dateKey, 'mission', qBonus('mission')), missionLead);
      setTimeout(() => charge(state.saju.yongsin, 4, 'mission', '🧧 액땜 완료'), 2400);
    }
  });
  $('#btn-daily')?.addEventListener('click', claimDaily);
  $('#btn-journey')?.addEventListener('click', doJourneyStep);
  $$('[data-todo]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.todo;
    if (k === 'draw') { const el = $('#btn-daily'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    if (k === 'journey') { const el = $('#btn-journey') || $('.journey'); el?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    if (k === 'friend') selectTab('compat');
    if (k === 'feng') selectTab('feng');
  }));
  $('#btn-buy')?.addEventListener('click', openShop);
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
    grow((g) => complete(g, state.fortune.dateKey, 'charm', qBonus('charm')));
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

function todaySayCard() {
  const s = state.saju; const f = state.fortune; const p = state.profile;
  const info = characterInfo(s, p);
  const pers = personalityOf(zIdx());
  const sticker = renderEmoticonSVG(s, f, { stage: heroOptions().stage, profile: p, style: 'sticker', tag: '', caption: info.zodiac.name });
  return `<div class="card say-card">
      <div class="say-row">
        <div class="say-face" data-go-tab="hero" title="캐릭터 보러 가기">${sticker}</div>
        <div style="flex:1">
          <div class="muted" style="font-size:0.78rem">${info.name} · ${pers.type}</div>
          ${speechBubble(todayLines(), 'left')}
        </div>
      </div>
    </div>`;
}

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
    ${luckCardHTML()}
    ${growthCard(info, gs)}
    ${abilityCardHTML(info)}
    <div class="card">
      <div class="hero-wrap">
        <div style="width:300px;max-width:100%">
          ${speechBubble(state.heroLine ? [state.heroLine] : todayLines().slice(0, 2), 'hero-say')}
          <div class="hero-stage ${animate ? 'reveal' : ''}" id="hero-stage" title="눌러 보세요">${svg}</div>
          <p class="muted" style="font-size:0.75rem;text-align:center;margin:6px 0 0">👆 캐릭터를 눌러 보세요</p>
        </div>
        <div>
          <p class="muted" style="margin:0">${info.zodiac.name}띠(${info.zodiac.hanja}) · 일간 ${STEMS[s.dayMaster]}(${ELEMENT_KO[info.element]}) · ${info.female ? '여성' : '남성'} · 고민 ${info.concern.label}</p>
          <h3 class="hero-title">${info.title}</h3>
          <p style="margin:0 0 6px"><span class="rarity-badge" style="color:var(--gold)">Lv.${gs.level} · ${stageName(gs.stage, info.female)}</span>${currentDex().title ? ` <span class="rarity-badge" style="color:#ff8fb3">📖 ${currentDex().title}</span>` : ''}</p>
          ${personalityCard()}
          <p class="muted" style="margin-top:8px;font-size:0.82rem">띠는 동물과 성격, 타고난 기운은 한복 색, 성별은 한복 모양, 고민은 손에 든 소품으로 정해졌습니다.</p>
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
      <div class="emote-chips">${EMOTES.map((e) => { const own = ownedEmotes().has(e.key); return `<button type="button" data-emote="${e.key}" aria-pressed="${emote === e.key}" class="${own ? '' : 'locked'}">${own ? renderEmoticonSVG(s, f, { stage: heroOptions().stage, profile: p, mood: e.key, style: 'sticker', tag: '', caption: e.label, rarity: emoteRarity(e.key) }) : `<div class="emo-lock">🔒<br>${e.label}</div>`}</button>`; }).join('')}</div>
      <p class="muted" style="font-size:0.78rem;margin:6px 0 0">이모티콘은 운명 뽑기에서 모을 수 있어요. (${EMOTES.filter((e) => ownedEmotes().has(e.key)).length}/8)</p>
    </div>`;

  const panel = $('[data-panel="hero"]');
  const saveEquip = (next, lead = '') => { save(EQUIP_KEY, next); renderHero(false); grow((g) => complete(g, f.dateKey, 'equip', qBonus('equip')), lead); };
  $$('[data-equip]', panel).forEach((b) => b.addEventListener('click', () => {
    const r = candidates[Number(b.dataset.equip)];
    const next = loadEquip();
    const idx = next.charms.findIndex((c) => sameRecord(c, r));
    if (idx >= 0) { next.charms[idx] = null; toast('부적을 해제했습니다'); } else {
      const allowed = unlock.charmSlots;
      const empty = next.charms.slice(0, allowed).findIndex((c) => !c);
      next.charms[empty >= 0 ? empty : allowed - 1] = r;
      saveEquip(next, `${r.label} 장착! ${say('equip')}`);
      return;
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
    if (!ownedEmotes().has(b.dataset.emote)) { toast('🔒 아직 모으지 않은 이모티콘이에요. 운명 뽑기에서 모아 보세요!'); return; }
    const next = loadEquip();
    next.emote = next.emote === b.dataset.emote ? null : b.dataset.emote;
    saveEquip(next);
  }));
  $('#btn-hero-png').addEventListener('click', () => downloadSVGAsPNG(svgStatic, `character-${info.zodiac.key}.png`, 3));
  bindGrowth(panel, info);
  $('#hero-stage', panel).addEventListener('click', () => {
    state.heroLine = say('tap');
    const bubble = $('.hero-say', panel);
    bubble.innerHTML = `<p>${esc(state.heroLine)}</p>`;
    bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
    const st = $('#hero-stage', panel);
    st.classList.remove('jump'); void st.offsetWidth; st.classList.add('jump');
  });
}

// ---------- 캐릭터 말투 ----------

const zIdx = () => state.saju.pillars.year.branch;

function say(situation, opts = {}) {
  return speak(zIdx(), situation, { stage: heroOptions().stage, ...opts, vars: { name: state.profile.name || '주인', ...(opts.vars || {}) } });
}

function catLabel(key) {
  return (CATEGORIES.find((c) => c.key === key) || CATEGORIES[0]).label;
}

/** 오늘의 대사 묶음: (오랜만이면 반가움) + 인사 + 점수 반응 + 최고 운 */
function todayLines() {
  const f = state.fortune;
  const seed = (n) => (Number(f.dateKey.replace(/-/g, '')) * 7 + n) % 97 / 97;
  const lines = [];
  if (state.backLine) lines.push(state.backLine);
  else lines.push(say('greet', { seed: seed(1) }));
  lines.push(say('tier', { tier: f.tier, vars: { score: f.scores.total } }));
  lines.push(say('best', { vars: { cat: catLabel(f.best) } }));
  return lines;
}

function speechBubble(lines, cls = '') {
  return `<div class="speech ${cls}">${lines.map((l) => `<p>${esc(l)}</p>`).join('')}</div>`;
}

// ---------- 개운: 오행 충전 · 대운 · 5년 흐름 ----------

function loadLuck() {
  const l = load(LUCK_KEY, null) || emptyLuck(state.fortune.date.year);
  return rollYear(l, state.fortune.date.year);
}

function luckNow() {
  const l = loadLuck();
  return { luck: l, ...luckIndex(l, state.saju) };
}

/** 오행 충전 + 결과 알림 */
function charge(element, amount, source, lead = '') {
  const before = luckNow().index;
  const ab = abilitiesAt(heroOptions().stage);
  const extraMult = ab.chargeMult[element] + (element === state.saju.weakest ? ab.weakBoost : 0);
  const res = addCharge(loadLuck(), state.saju, { element, amount, source, dateKey: state.fortune.dateKey, extraMult });
  if (!res.added) return 0;
  save(LUCK_KEY, res.luck);
  const after = luckIndex(res.luck, state.saju).index;
  toast(`${lead ? `${lead} · ` : ''}${ELEMENT_HANJA[element]} ${ELEMENT_KO[element]} 기운 +${res.added} 충전! 개운 지수 ${before} → ${after}`);
  return res.added;
}

function forecastNow() {
  const { index } = luckNow();
  const ab = abilitiesAt(heroOptions().stage);
  return fiveYearForecast(state.saju, state.profile.gender, state.fortune.date, index, heroOptions().stage, ab.forecast, ab.yearBonus);
}

function luckCardHTML() {
  const s = state.saju;
  const { index, fills, targets, luck } = luckNow();
  const tier = luckTierText(index);
  const fc = forecastNow();
  const stage = heroOptions().stage;
  const bars = [0, 1, 2, 3, 4].map((e) => {
    const tag = e === s.yongsin ? '<em>용신</em>' : e === s.weakest ? '<em>부족</em>' : '';
    return `<div class="gauge"><span class="el-${e}">${ELEMENT_HANJA[e]} ${ELEMENT_KO[e]}${tag}</span>
      <div class="g-track"><div class="g-fill" style="width:${Math.round(fills[e] * 100)}%;background:${EL_COLORS[e]};color:${EL_COLORS[e]}"></div></div>
      <span class="num">${Math.min(luck.charge[e], targets[e])}/${targets[e]}</span></div>`;
  }).join('');
  const y = fc[0];
  return `<div class="card luck-card">
    <h3>☯ 오행 충전 · 개운 <span class="tag">${state.fortune.date.year}년</span></h3>
    <div class="luck-head">
      <div class="luck-ring" style="--p:${index}"><b>${index}</b><span>개운 지수</span></div>
      <div>
        <div class="luck-tier">${tier.tier}</div>
        <p style="margin:2px 0 0;font-size:0.88rem">${tier.text}</p>
        <p class="muted" style="margin:6px 0 0;font-size:0.82rem">올해 운세: 기본 <b>${y.base}</b> → 개운 반영 <b style="color:var(--gold)">${y.improved}</b>${stage < 5 ? ` · 신수 진화 시 최대 <b style="color:#ff8fb3">${y.target}</b>` : ' · 🐉 신수의 가호 적용 중'}</p>
      </div>
    </div>
    <div class="gauges">${bars}</div>
    <p class="muted" style="font-size:0.78rem;margin:8px 0 0">매일 받는 오늘의 부적, 액땜 미션, 보상 부적이 오행 게이지를 채웁니다. 용신은 1.5배, 가장 부족한 기운은 1.3배로 차올라요. 진화 조건: 수호 무사·선녀 ${STAGE_LUCK_GATE[3]} · 수호신 ${STAGE_LUCK_GATE[4]} · 신수 ${STAGE_LUCK_GATE[5]}</p>
  </div>`;
}

function forecastChartSVG(fc) {
  const W = 340; const H = 170; const L = 30; const R = 12; const T = 16; const B = 30;
  const x = (i) => L + (i * (W - L - R)) / 4;
  const yv = (v) => T + ((100 - v) / 70) * (H - T - B) - ((30) / 70) * (H - T - B) * 0;
  const ys = (v) => T + ((95 - Math.max(25, v)) / 70) * (H - T - B);
  const path = (k) => fc.map((d, i) => `${i ? 'L' : 'M'}${x(i)} ${ys(d[k])}`).join(' ');
  const grid = [30, 50, 70, 90].map((v) => `<line x1="${L}" x2="${W - R}" y1="${ys(v)}" y2="${ys(v)}" stroke="rgba(255,255,255,0.08)"/><text x="${L - 6}" y="${ys(v) + 4}" font-size="9" fill="#9a94c4" text-anchor="end">${v}</text>`).join('');
  const area = `${path('improved')} L${x(4)} ${ys(fc[4].base)} ${fc.slice().reverse().map((d, i) => `L${x(4 - i)} ${ys(d.base)}`).join(' ')} Z`;
  return `<svg viewBox="0 0 ${W} ${H}" class="fc-chart" role="img" aria-label="앞으로 5년 운의 흐름">
    ${grid}
    <path d="${area}" fill="rgba(255,201,60,0.12)"/>
    <path d="${path('target')}" fill="none" stroke="#ff8fb3" stroke-width="1.5" stroke-dasharray="2 4"/>
    <path d="${path('base')}" fill="none" stroke="#9a94c4" stroke-width="2" stroke-dasharray="5 5"/>
    <path d="${path('improved')}" fill="none" stroke="#ffc93c" stroke-width="3" style="filter:drop-shadow(0 0 4px #ffc93c)"/>
    ${fc.map((d, i) => `<circle cx="${x(i)}" cy="${ys(d.improved)}" r="4" fill="#ffc93c"/><text x="${x(i)}" y="${ys(d.improved) - 8}" font-size="10" fill="#fff" text-anchor="middle" font-weight="700">${d.improved}</text><text x="${x(i)}" y="${H - 14}" font-size="10" fill="#cfcaf2" text-anchor="middle">${d.year}</text><text x="${x(i)}" y="${H - 3}" font-size="8.5" fill="#9a94c4" text-anchor="middle">${d.age}세</text>`).join('')}
  </svg>`;
}

function daewoonCardHTML() {
  const s = state.saju; const p = state.profile;
  if (!p.gender) return '';
  const dw = computeDaewoon(s, p.gender);
  const age = state.fortune.date.year - s.input.year;
  const cur = daewoonAt(dw, age);
  const { index } = luckNow();
  const fc = forecastNow();
  const cells = dw.pillars.map((d) => {
    const now = cur && d.startAge === cur.startAge;
    return `<div class="dw ${now ? 'now' : ''}"><small>${d.startAge}세~</small><div class="char el-${STEM_ELEMENT[d.stem]}" style="font-size:1.25rem">${STEMS[d.stem]}</div><div class="char el-${BRANCH_ELEMENT[d.branch]}" style="font-size:1.25rem">${BRANCHES[d.branch]}</div><small>${d.score}</small></div>`;
  }).join('');
  const rows = fc.map((d, i) => {
    const th = pillarTheme(s, d.pillar);
    return `<tr><td>${d.year}<br><small>${d.age}세</small></td><td>${pillarLabelFull(d.pillar)}<br><small>${th.god} · ${th.theme}</small></td><td>${d.base}</td><td style="color:var(--gold);font-weight:800">${d.improved}${d.improved > d.base ? ` <small style="color:var(--wood)">▲${d.improved - d.base}</small>` : ''}</td></tr>`;
  }).join('');
  return `<div class="card">
    <h3>📜 대운 · 앞으로 5년 <span class="tag">정통 사주 + 개운</span></h3>
    <p class="muted" style="margin-top:0;font-size:0.84rem">${dw.forward ? '순행' : '역행'} 대운 · ${dw.startAge}세 시작 (태어난 날부터 절기까지 ${dw.days}일 ÷ 3) · 지금 ${age}세${cur ? `, ${cur.startAge}~${cur.endAge}세 대운 진행 중` : ''}</p>
    <div class="dw-row">${cells}</div>
    ${cur ? `<p class="concern-card" style="margin:10px 0 0">🧭 <b>지금의 대운 ${pillarLabelFull(cur)}</b> — ${daewoonComment(s, cur, index)}</p>` : ''}
    <h4 style="margin:14px 0 4px">앞으로 5년의 흐름</h4>
    ${(() => { const gains = fc.map((d) => d.improved - d.base); const avg = Math.round(gains.reduce((a, b) => a + b, 0) / 5); return index > 0 ? `<p class="five-sum">📈 지금처럼 꾸준히 개운하면 5년 동안 평균 <b>▲${avg}</b>, ${fc[4].year}년에는 <b>▲${gains[4]}</b>까지 개선 폭이 커집니다.</p>` : '<p class="five-sum">오늘의 부적을 받아 오행을 채우면, 아래 금색 개운 곡선이 기본 흐름 위로 올라가기 시작합니다.</p>'; })()}
    ${forecastChartSVG(fc)}
    <div class="fc-legend"><span><i style="background:#9a94c4"></i>정통 기본 흐름</span><span><i style="background:#ffc93c"></i>개운 반영</span><span><i style="background:#ff8fb3"></i>신수 진화·개운 100 목표선</span></div>
    <table class="fc-table"><thead><tr><th>해</th><th>세운</th><th>기본</th><th>개운 반영</th></tr></thead><tbody>${rows}</tbody></table>
    <p class="muted" style="font-size:0.76rem;margin-bottom:0">기본 흐름은 대운·세운을 명리학 규칙(용신·기신·일지와의 합충)으로 계산한 값입니다. 개운 반영 값은 매일의 꾸준한 실천을 응원하기 위한 게임 요소로, 오행 충전이 쌓일수록 해마다 조금씩 더 올라가도록 설계했습니다.</p>
  </div>`;
}

// ---------- 성장 가속 · 시련 통계 ----------

function boostNow() {
  const g = load(GROWTH_KEY, null);
  return growthBoost(g?.streak?.count || 0, load(FRIENDS_KEY, []).length);
}

function qBonus(key) {
  const q = QUESTS.find((x) => x.key === key);
  return q ? Math.round(q.exp * (boostNow().total - 1)) : 0;
}

function trialStats() {
  const g = load(GROWTH_KEY, null) || {};
  return {
    streakBest: g.streak?.best || 0,
    friends: load(FRIENDS_KEY, []).length,
    spots: load(FENG_KEY, { visits: 0 }).visits || 0,
    stickers: load(SOC_KEY, { stickers: 0 }).stickers || 0,
    journey: load(JOURNEY_KEY, { done: 0 }).done || 0,
    dex: state.saju ? currentDex().count : 1,
  };
}

// ---------- 고민 해결 여정 ----------

function loadJourney() {
  const j = load(JOURNEY_KEY, null);
  if (!j || j.concern !== state.profile.concern) return emptyJourney(state.profile.concern);
  return j;
}

function journeyCardHTML() {
  const j = loadJourney();
  const info = characterInfo(state.saju, state.profile);
  const c = info.concern;
  const doneToday = j.lastDate === state.fortune.dateKey;
  const n = Math.min(j.done - (doneToday ? 1 : 0), JOURNEY_DAYS - 1);
  const step = journeyStep(c.key, Math.max(0, doneToday ? j.done - 1 : j.done), state.saju.yongsin);
  const pct = Math.round((j.done / JOURNEY_DAYS) * 100);
  const chapters = JOURNEYS[c.key].chapters;
  if (j.done >= JOURNEY_DAYS) return `<div class="card journey"><h3>🏆 ${c.label} 고민 해결 여정 완주!</h3><p>30일 동안 함께 걸었어요. 수호신이 당신의 ${c.label}을(를) 끝까지 응원합니다. '정보 수정'에서 새 고민을 고르면 새 여정이 시작돼요.</p></div>`;
  return `<div class="card journey">
    <h3>🧭 ${c.label} 고민 해결 여정 <span class="tag">${j.done} / ${JOURNEY_DAYS}일</span></h3>
    <div class="exp"><div class="exp-fill" style="width:${pct}%;background:linear-gradient(90deg,#39ff88,#00e5ff)"></div><span>${chapters.map((ch, i) => (i === step.chapterIndex ? `▶ ${ch}` : ch)).join(' · ')}</span></div>
    <div class="j-step ${doneToday ? 'done' : ''}">
      <small class="muted">${step.chapter} · ${step.stepNo}걸음</small>
      <b>${step.title}</b>
      <p class="muted" style="margin:4px 0 0;font-size:0.84rem">💡 ${step.why}</p>
    </div>
    ${doneToday ? `<p class="muted" style="margin:8px 0 0;text-align:center">✅ 오늘 한 걸음 완료! ${info.zodiac.name}가 내일 다음 걸음을 준비해 둘게요.</p>` : '<button class="primary" type="button" id="btn-journey" style="width:100%;margin-top:10px">했어요! 한 걸음 완료 ✓</button>'}
  </div>`;
}

function doJourneyStep() {
  const res = completeStep(loadJourney(), state.fortune.dateKey);
  if (!res.advanced) return;
  save(JOURNEY_KEY, res.journey);
  const c = characterInfo(state.saju, state.profile).concern;
  const lead = res.finished ? `🏆 ${c.label} 여정 완주!` : res.chapterDone ? `📖 여정 ${res.journey.done / 10}장 완주!` : `🧭 ${c.label} 해결에 한 걸음 더`;
  grow((g) => complete(g, state.fortune.dateKey, 'journey', qBonus('journey')), lead);
  setTimeout(() => charge(state.saju.yongsin, 3, 'journey', '🧭 여정'), 2300);
  if (res.chapterDone) {
    const rarity = res.finished ? 'legend' : res.journey.done >= 20 ? 'epic' : 'rare';
    const t = createTalisman(state.saju, state.fortune, { type: c.talisman, theme: 'classic', element: state.saju.yongsin, rarity });
    const list = load(COLLECTION_KEY, []); list.unshift({ ...recordOf(t), label: `여정 보상 ${t.rarity.label} ${t.type.label}부` }); save(COLLECTION_KEY, list.slice(0, 80));
  }
  renderToday();
}

function todoCardHTML() {
  const g = loadGacha();
  const j = loadJourney();
  const q = (load(GROWTH_KEY, null)?.quests || {})[state.fortune.dateKey] || {};
  const items = [
    { k: 'draw', icon: '🔮', label: '운명 뽑기로 부적 받기', done: g.freeUsed > 0 },
    { k: 'journey', icon: '🧭', label: '고민 해결 한 걸음', done: j.lastDate === state.fortune.dateKey },
    { k: 'friend', icon: '💞', label: '친구에게 스티커·궁합', done: !!(q.social || q.compat) },
    { k: 'feng', icon: '🗺️', label: '오늘의 기운 스팟 (선택)', done: !!q.spot },
  ];
  const doneN = items.slice(0, 3).filter((x) => x.done).length;
  return `<div class="card todo">
    <h3>✅ 오늘 할 일 <span class="tag">${doneN} / 3</span></h3>
    ${items.map((x) => `<button type="button" class="todo-item ${x.done ? 'done' : ''}" data-todo="${x.k}"><span>${x.done ? '✅' : x.icon} ${x.label}</span><b>${x.done ? '완료' : '하러 가기 →'}</b></button>`).join('')}
    ${doneN === 3 ? '<p class="muted" style="margin:8px 0 0;text-align:center">🎉 오늘의 할 일 끝! 수호신이 아주 기뻐해요.</p>' : ''}
  </div>`;
}

function showSummon() {
  const info = characterInfo(state.saju, state.profile);
  const c = info.concern;
  const svg = renderCharacterSVG(info, { stage: 1, width: 240, backdrop: true, animate: true, mood: 'excited' });
  const pers = personalityOf(zIdx());
  const el = document.createElement('div');
  el.className = 'evo-modal';
  el.innerHTML = `<div class="evo-box summon">
    <p class="muted" style="margin:0">12지신 강림</p>
    <div class="summon-stage">${svg}</div>
    <h3 style="margin:6px 0">${info.zodiac.name}띠 수호신 <span style="color:var(--gold)">${info.name}</span> 강림!</h3>
    ${speechBubble([speak(zIdx(), 'greet', { index: 0, stage: 1 }), `${state.profile.name || '주인'}의 ${c.label} 고민, 오늘부터 30일 동안 매일 한 걸음씩 같이 풀어 가자!`])}
    <div class="summon-plan">${JOURNEYS[c.key].chapters.map((ch, i) => `<div><b>${i + 1}장</b><span>${ch}</span><small>${i * 10 + 1}~${i * 10 + 10}일</small></div>`).join('')}</div>
    <p class="muted" style="font-size:0.82rem">매일 할 일은 딱 3가지: <b>뽑기</b> · <b>여정 한 걸음</b> · <b>친구에게 스티커</b></p>
    <button class="primary" type="button" style="width:100%">시작하기 ✦</button></div>`;
  document.body.appendChild(el);
  el.querySelector('button').addEventListener('click', () => { el.remove(); selectTab('today'); });
}

// ---------- 풍수 기운 스팟 ----------

function fengState() { return { visited: {}, visits: 0, ...(load(FENG_KEY, null) || {}) }; }

function renderFeng() {
  const panel = $('[data-panel="feng"]');
  if (!panel || !state.saju) return;
  const center = state.geo?.center || DEMO_CENTER;
  const real = !!state.geo?.real;
  const f = state.fortune; const s = state.saju;
  const spots = dailySpots(center, { direction: f.luck.direction, yongsin: s.yongsin, weakest: s.weakest, seedKey: `${birthKeyOf()}|${f.dateKey}` });
  state.spots = spots;
  const fs = fengState();
  const maxD = 2600;
  const pt = (sp) => { const r = Math.min(1, sp.distance / maxD) * 120; const a = (sp.bearing - 90) * Math.PI / 180; return [150 + Math.cos(a) * r, 150 + Math.sin(a) * r]; };
  const radar = `<svg viewBox="0 0 300 300" class="radar-map">
    <circle cx="150" cy="150" r="140" fill="#0d0a1f" stroke="rgba(0,229,255,0.3)"/>
    ${[40, 80, 120].map((r) => `<circle cx="150" cy="150" r="${r}" fill="none" stroke="rgba(0,229,255,0.15)" stroke-dasharray="3 5"/>`).join('')}
    <line x1="150" y1="10" x2="150" y2="290" stroke="rgba(255,255,255,0.08)"/><line x1="10" y1="150" x2="290" y2="150" stroke="rgba(255,255,255,0.08)"/>
    ${['북', '동', '남', '서'].map((d, i) => { const a = (i * 90 - 90) * Math.PI / 180; return `<text x="${150 + Math.cos(a) * 128}" y="${154 + Math.sin(a) * 128}" font-size="12" fill="${f.luck.direction.startsWith(d) ? '#ffc93c' : '#9a94c4'}" text-anchor="middle" font-weight="800">${d}</text>`; }).join('')}
    <circle cx="150" cy="150" r="7" fill="#00e5ff"><animate attributeName="r" values="6;10;6" dur="1.6s" repeatCount="indefinite"/></circle>
    ${spots.map((sp) => { const [x, y] = pt(sp); return `<g><circle cx="${x}" cy="${y}" r="16" fill="${EL_COLORS[sp.element]}" opacity="${fs.visited[sp.id] ? 0.25 : 0.85}"/><text x="${x}" y="${y + 6}" font-size="16" text-anchor="middle">${fs.visited[sp.id] ? '✅' : sp.icon}</text></g>`; }).join('')}
  </svg>`;
  panel.innerHTML = `
    <div class="card">
      <h3>🗺️ 오늘의 풍수 기운 스팟 <span class="tag">행운 방향 ${f.luck.direction}</span></h3>
      <p class="muted" style="margin-top:0;font-size:0.85rem">오늘은 <b style="color:var(--gold)">${f.luck.direction}</b>이 길하고, 나에게 필요한 기운은 <b class="el-${s.yongsin}">${ELEMENT_HANJA[s.yongsin]} ${ELEMENT_KO[s.yongsin]}</b>이에요. 그 방향의 ${ELEMENT_KO[s.yongsin]} 기운 장소로 가면 <b>보물 상자</b>가 기다려요. 멀수록 좋은 보물!</p>
      <div class="feng-wrap">${radar}
        <div class="feng-loc"><small class="muted">${real ? '📍 내 위치 기준' : `📍 ${DEMO_CENTER.label}`}</small>
          <button class="ghost" type="button" id="btn-geo">${real ? '위치 새로고침' : '내 위치로 찾기'}</button>
          <small class="muted" style="font-size:0.72rem">위치는 이 기기에서만 계산하고 저장·전송하지 않아요.</small></div>
      </div>
    </div>
    <div class="card">
      ${spots.map((sp, i) => `<div class="spot ${fs.visited[sp.id] ? 'done' : ''}">
        <div class="spot-ic" style="background:${EL_COLORS[sp.element]}22;border-color:${EL_COLORS[sp.element]}">${sp.icon}</div>
        <div style="flex:1"><b>${sp.label}</b> <small class="el-${sp.element}">${ELEMENT_HANJA[sp.element]} 기운</small><br><small class="muted">${bearingName(sp.bearing)}쪽 약 ${sp.distance >= 1000 ? `${(sp.distance / 1000).toFixed(1)}km` : `${sp.distance}m`} · 보물 ${['★', '★★', '★★★'][sp.tier]}</small></div>
        ${fs.visited[sp.id] ? '<b class="muted">획득</b>' : `<div class="spot-btns"><a class="ghost" href="https://map.kakao.com/link/to/${encodeURIComponent(sp.label)},${sp.lat.toFixed(6)},${sp.lng.toFixed(6)}" target="_blank" rel="noopener">길찾기</a><button class="primary" type="button" data-arrive="${i}">도착 확인</button></div>`}
      </div>`).join('')}
      ${real ? '' : '<p class="muted" style="font-size:0.75rem;margin:8px 0 0">지금은 체험용 기준 위치예요. "도착 확인"을 누르면 체험용으로 도착 처리됩니다. 실제 앱에서는 150m 안에 들어가야 열려요.</p>'}
    </div>
    <div class="card">
      <h3>🤝 제휴 기운 스팟 <span class="tag">예시</span></h3>
      <p class="muted" style="margin-top:0;font-size:0.82rem">정식 서비스에서는 기운에 맞는 실제 카페·식당·전망대·찻집과 제휴해, 방문 인증 시 한정 부적과 할인 쿠폰을 드려요.</p>
      ${PARTNER_SAMPLES.map((p) => `<div class="spot partner"><div class="spot-ic" style="background:${EL_COLORS[p.element]}22;border-color:${EL_COLORS[p.element]}">${p.icon}</div><div style="flex:1"><b>${p.name}</b><br><small class="muted">${p.perk}</small></div>${p.element === s.yongsin ? '<em class="you">내 용신</em>' : ''}</div>`).join('')}
    </div>`;
  $('#btn-geo', panel).addEventListener('click', () => {
    if (!navigator.geolocation) { toast('이 환경에서는 위치를 쓸 수 없어 체험용 위치로 보여 드려요'); return; }
    navigator.geolocation.getCurrentPosition((pos) => { state.geo = { center: { lat: pos.coords.latitude, lng: pos.coords.longitude }, real: true }; renderFeng(); toast('내 위치 기준으로 기운 스팟을 찾았어요'); },
      () => toast('위치 권한을 받지 못해 체험용 위치로 보여 드려요'), { enableHighAccuracy: true, timeout: 8000 });
  });
  $$('[data-arrive]', panel).forEach((b) => b.addEventListener('click', () => {
    const sp = state.spots[Number(b.dataset.arrive)];
    if (!state.geo?.real) { openTreasure(sp); return; }
    navigator.geolocation.getCurrentPosition((pos) => {
      const d = distanceM({ lat: pos.coords.latitude, lng: pos.coords.longitude }, sp);
      if (d <= ARRIVE_RADIUS) openTreasure(sp); else toast(`아직 ${Math.round(d)}m 남았어요. ${bearingName(sp.bearing)}쪽으로 조금만 더!`);
    }, () => toast('위치를 확인하지 못했어요'), { enableHighAccuracy: true, timeout: 8000 });
  }));
}

function openTreasure(sp) {
  const fs = fengState();
  if (fs.visited[sp.id]) return;
  fs.visited[sp.id] = true; fs.visits = (fs.visits || 0) + 1;
  const keys = Object.keys(fs.visited); if (keys.length > 60) delete fs.visited[keys[0]];
  save(FENG_KEY, fs);
  const rarity = treasureRarity(Math.random(), sp.tier);
  const types = ['luck', 'wealth', 'protect', 'love', 'exam', 'health'];
  const t = createTalisman(state.saju, state.fortune, { type: types[sp.element % types.length], theme: 'classic', element: sp.element, rarity, reroll: Math.random() });
  const list = load(COLLECTION_KEY, []); list.unshift({ ...recordOf(t), label: `풍수 보물 ${t.rarity.label} ${t.type.label}부` }); save(COLLECTION_KEY, list.slice(0, 80));
  const st = STICKERS[Math.floor(Math.random() * STICKERS.length)];
  const own = load(STICKER_KEY, {}); own[st.key] = (own[st.key] || 0) + 1; save(STICKER_KEY, own);
  showReveal(t, { sticker: st, emote: { key: todayEmote(state.fortune), rarity: 'rare' }, best: rarityRank(rarity) > rarityRank(st.rarity) ? rarity : st.rarity, pityHit: false }, () => {
    grow((g) => complete(g, state.fortune.dateKey, 'spot', qBonus('spot')), `🗺️ ${sp.label}의 보물 획득!`);
    setTimeout(() => charge(sp.element, CHARGE_BY_RARITY[rarity] * 1.5, `spot-${sp.id}`, '🗺️ 풍수 기운'), 2300);
    renderFeng(); renderToday(); renderCharm(false);
  });
}

// ---------- 운명 뽑기 (가챠) ----------

function loadGacha() { return todayGacha({ ...emptyGacha(), ...(load(GACHA_KEY, null) || {}) }, state.fortune.dateKey); }

function birthKeyOf() { const i = state.saju.input; return `${i.year}-${i.month}-${i.day}`; }

/** 모은 이모티콘: {key: 최고 등급} (예전 배열 형식도 호환) */
function emoteOwnMap() {
  const raw = load(EMO_OWN_KEY, {});
  const m = Array.isArray(raw) ? Object.fromEntries(raw.map((k) => [k, 'common'])) : { ...raw };
  const t = todayEmote(state.fortune);
  if (!m[t]) m[t] = 'common';
  return m;
}
function ownedEmotes() { return new Set(Object.keys(emoteOwnMap())); }
function emoteRarity(key) { return emoteOwnMap()[key] || 'common'; }

const RARITY_LABEL = { common: '일반', rare: '희귀', epic: '영웅', legend: '전설', myth: '신화' };
const RARITY_COLOR = { common: '#9aa3b2', rare: '#4fc3ff', epic: '#c77dff', legend: '#ffc93c', myth: '#ff4d8d' };

function dailyCardHTML() {
  const g = loadGacha();
  const left = drawsLeft(g, state.fortune.dateKey);
  const sub = isSubscribed(g, state.fortune.dateKey);
  const ab = abilitiesAt(heroOptions().stage);
  const toPity = PITY - (g.pity || 0);
  const lastPack = g.history[0];
  return `<div class="card daily gacha">
    <h3>🔮 운명 뽑기 <span class="tag">부적 · 스티커 · 이모티콘</span></h3>
    <div class="gacha-stage">
      <div class="capsule ${left.free + left.extra ? 'ready' : ''}"><span>✦</span></div>
      <div>
        <p style="margin:0;font-weight:800">한 번 뽑으면 <b style="color:var(--gold)">부적 + 스티커 + 이모티콘</b> 3종!</p>
        <p class="muted" style="margin:4px 0 0;font-size:0.82rem">무료 <b>${left.free}</b>/1 · 추가 <b>${left.extra}</b>/${left.extraAllowed || EXTRA_PER_DAY}${sub ? ' · 👑 수호 구독 중' : g.extraBought ? ' · 오늘 추가권 사용 중' : ''}</p>
        <p class="muted" style="margin:2px 0 0;font-size:0.78rem">⭐ 전설 확정까지 <b>${toPity}</b>회 (천장 ${PITY}회)${ab.rareFree ? ' · ☀️ 천광신의 축복: 무료 뽑기 희귀 이상 확정' : ''}</p>
      </div>
    </div>
    ${left.free ? '<button class="primary" type="button" id="btn-daily" style="width:100%;margin-top:10px">✦ 오늘의 무료 뽑기 ✦</button>'
      : left.extra ? `<button class="primary" type="button" id="btn-daily" style="width:100%;margin-top:10px">✦ 추가 뽑기 (${left.extra}회 남음) ✦</button>`
        : `<button class="ghost" type="button" id="btn-buy" style="width:100%;margin-top:10px">${sub || g.extraBought ? '오늘의 뽑기를 모두 썼어요 · 내일 다시 만나요' : '➕ 추가 뽑기 3회 받기'}</button>`}
    ${lastPack ? `<div class="last-pack muted">최근: ${lastPack.items.map((x) => `<span style="color:${RARITY_COLOR[x.r]}">${RARITY_LABEL[x.r]} ${x.n}</span>`).join(' · ')}</div>` : ''}
    <details class="advanced" style="margin-top:10px"><summary>확률 정보 (공개)</summary>
      <table class="fc-table"><thead><tr><th>등급</th><th>부적</th><th>이모티콘</th><th>오행 충전(무료/추가)</th></tr></thead><tbody>
      ${RATES.map((r) => `<tr><td style="color:${RARITY_COLOR[r.key]}">${r.label}</td><td>${r.rate}%</td><td>${r.rate}%</td><td>${CHARGE_BY_RARITY[r.key]} / ${Math.round(CHARGE_BY_RARITY[r.key] / 2)}</td></tr>`).join('')}
      </tbody></table>
      <p class="muted" style="font-size:0.75rem;margin:6px 0 0">스티커: 일반 58% · 희귀 27% · 영웅 11% · 전설 3.5% · 신화 0.5%. 부적은 전설 이상이 ${PITY}회 연속 나오지 않으면 ${PITY}번째에 전설(10% 확률로 신화) 확정. 추가 뽑기에서 나온 부적은 공정성을 위해 오행 충전량이 절반입니다.</p>
    </details>
  </div>`;
}

function doDraw() {
  let g = loadGacha();
  const left = drawsLeft(g, state.fortune.dateKey);
  if (!left.free && !left.extra) { openShop(); return; }
  const isFree = left.free > 0;
  const s = state.saju;
  const c = CONCERNS.find((x) => x.key === state.profile.concern) || CONCERNS[2];
  const ab = abilitiesAt(heroOptions().stage);
  const pack = drawPack(Math.random, {
    pity: g.pity, minRare: isFree && ab.rareFree,
    emoteKeys: EMOTES.map((e) => e.key),
    types: [c.talisman, c.talisman, 'luck', 'protect', 'wealth', 'love', 'exam', 'health'],
    elements: [s.yongsin, s.yongsin, s.weakest, 0, 1, 2, 3, 4],
  });
  const charm = createTalisman(s, state.fortune, { ...pack.charm, reroll: Math.random() });
  g = { ...g, pity: pack.pity, freeUsed: g.freeUsed + (isFree ? 1 : 0), extraUsed: g.extraUsed + (isFree ? 0 : 1) };
  g.history = [{ date: state.fortune.dateKey, items: [{ r: charm.rarity.key, n: `${charm.type.label}부` }, { r: pack.sticker.rarity, n: pack.sticker.text }, { r: pack.emote.rarity, n: EMOTES.find((e) => e.key === pack.emote.key).label }] }, ...g.history].slice(0, 20);
  save(GACHA_KEY, g);

  const list = load(COLLECTION_KEY, []);
  list.unshift({ ...recordOf(charm), label: `${charm.rarity.label} ${charm.type.label}부` });
  save(COLLECTION_KEY, list.slice(0, 80));
  const st = load(STICKER_KEY, {}); st[pack.sticker.key] = (st[pack.sticker.key] || 0) + 1; save(STICKER_KEY, st);
  const em = emoteOwnMap();
  if (!em[pack.emote.key] || rarityRank(pack.emote.rarity) > rarityRank(em[pack.emote.key])) em[pack.emote.key] = pack.emote.rarity;
  save(EMO_OWN_KEY, em);

  showReveal(charm, pack, () => {
    const amt = CHARGE_BY_RARITY[charm.rarity.key] * (isFree ? 1 : 0.5);
    charge(charm.element, amt, isFree ? 'daily' : `extra-${g.extraUsed}`, isFree ? '🔮 무료 뽑기' : '🔮 추가 뽑기');
    renderToday(); renderCharm(false); renderEmoji(); renderSaju(); renderReport();
  });
}

function showReveal(charm, pack, done) {
  const best = pack.best;
  const el = document.createElement('div');
  el.className = `reveal-modal r-${best}`;
  const emo = renderEmoticonSVG(state.saju, state.fortune, { stage: heroOptions().stage, profile: state.profile, mood: pack.emote.key, style: 'neon', tag: '', rarity: pack.emote.rarity, caption: EMOTES.find((e) => e.key === pack.emote.key).label });
  const card = (inner, r, label, i) => `<div class="rv-card" style="--d:${0.15 + i * 0.25}s;--c:${RARITY_COLOR[r]}"><div class="rv-inner">${inner}</div><b style="color:${RARITY_COLOR[r]}">${RARITY_LABEL[r]}</b><small>${label}</small></div>`;
  el.innerHTML = `<div class="rv-box">
    <div class="rv-capsule"><span>✦</span></div>
    <div class="rv-cards">
      ${card(renderTalismanSVG(charm), charm.rarity.key, `${charm.type.label}부`, 0)}
      ${card(renderStickerSVG(pack.sticker, 110), pack.sticker.rarity, `스티커 「${pack.sticker.text}」`, 1)}
      ${card(emo, pack.emote.rarity, '이모티콘', 2)}
    </div>
    ${rarityRank(best) >= 3 ? `<div class="rv-banner">${best === 'myth' ? '✨ 신화 강림! ✨' : '🌟 전설 등장! 🌟'}${pack.pityHit ? ' (천장 확정)' : ''}</div>` : ''}
    <button class="primary" type="button">받기</button></div>`;
  document.body.appendChild(el);
  el.querySelector('button').addEventListener('click', () => { el.remove(); done(); });
}

function openShop() {
  const g = loadGacha();
  const sub = isSubscribed(g, state.fortune.dateKey);
  const el = document.createElement('div');
  el.className = 'evo-modal';
  el.innerHTML = `<div class="evo-box shop">
    <h3 style="margin-top:0">➕ 추가 뽑기</h3>
    <div class="shop-item"><div><b>추가 뽑기 3회권</b><small>오늘 하루 추가 뽑기 ${EXTRA_PER_DAY}회</small></div><button class="primary" type="button" data-buy="extra" ${g.extraBought || sub ? 'disabled' : ''}>${PRICES.extra.toLocaleString()}원</button></div>
    <div class="shop-item sub"><div><b>👑 12지신 수호 구독</b><small>매일 추가 뽑기 ${EXTRA_PER_DAY}회 · 월별 운세 리포트 상세 · 광고 없음</small></div><button class="primary" type="button" data-buy="sub" ${sub ? 'disabled' : ''}>${sub ? '구독 중' : `월 ${PRICES.subscription.toLocaleString()}원`}</button></div>
    ${sub ? '<button class="ghost" type="button" data-buy="cancel" style="width:100%">구독 해지 (프로토타입)</button>' : ''}
    <p class="muted" style="font-size:0.75rem">※ 프로토타입이라 실제 결제는 일어나지 않습니다. 정식 버전에서는 앱스토어 결제로 처리합니다. 추가 뽑기 부적의 오행 충전은 50%로, 꾸준히 매일 오는 무료 사용자와의 공정성을 지킵니다.</p>
    <button class="ghost" type="button" data-buy="close" style="width:100%">닫기</button></div>`;
  document.body.appendChild(el);
  el.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.buy;
    const cur = loadGacha();
    if (k === 'extra') { save(GACHA_KEY, { ...cur, extraBought: true }); toast('추가 뽑기 3회권을 받았어요 (프로토타입: 결제 없음)'); }
    if (k === 'sub') {
      const d = new Date(Date.UTC(state.fortune.date.year, state.fortune.date.month - 1, state.fortune.date.day + 30));
      save(GACHA_KEY, { ...cur, subUntil: `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}` });
      toast('👑 수호 구독 시작! 매일 추가 뽑기 3회 (프로토타입: 결제 없음)');
    }
    if (k === 'cancel') { save(GACHA_KEY, { ...cur, subUntil: null }); toast('구독을 해지했어요'); }
    el.remove();
    renderToday(); renderReport();
  }));
}

function claimDaily() { doDraw(); }

// ---------- 올해 운세 월별 리포트 ----------

const MONTH_GOD_MOD = {
  비견: [-4, 0, 4, 4], 겁재: [-10, -2, 0, 2], 식신: [4, 4, 2, 8], 상관: [2, 6, -6, -2], 편재: [12, 6, 0, -2],
  정재: [10, 2, 4, 2], 편관: [-2, 0, -6, -6], 정관: [2, 4, 10, 2], 편인: [-2, -2, 4, -2], 정인: [0, 2, 8, 4],
};
const MONTH_CATS = ['재물', '애정', '직장·학업', '건강'];

function monthlyReport() {
  const s = state.saju; const y = state.fortune.date.year;
  const { index } = luckNow();
  const stage = heroOptions().stage;
  const ab = abilitiesAt(stage);
  const yp = yearPillar(y);
  const yScore = pillarScore(s, yp);
  const dw = state.profile.gender ? computeDaewoon(s, state.profile.gender) : null;
  const d = dw ? daewoonAt(dw, y - s.input.year) : null;
  const abAvg = Math.round((ab.cat.total + ab.cat.wealth + ab.cat.love + ab.cat.career + ab.cat.health) / 5);
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const mp = computeSaju({ year: y, month: m, day: 15, timeKnown: false }).pillars.month;
    const base = Math.round(pillarScore(s, mp) * 0.55 + yScore * 0.25 + (d ? d.score : 52) * 0.2);
    const habit = (index / 100) * 12 * (1 + i * 0.03);
    const improved = Math.min(99, Math.round(base + habit + abAvg + (stage >= 5 ? 6 : 0)));
    const god = tenGod(s.dayMaster, mp.stem);
    const cats = MONTH_GOD_MOD[god].map((v) => Math.max(10, Math.min(99, improved + v)));
    const el = STEM_ELEMENT[mp.stem];
    const mission = el === s.yongsin ? `용신 ${ELEMENT_HANJA[el]}의 달! 이달엔 ${ELEMENT_KO[el]} 기운 부적을 장착해 흐름을 타세요.`
      : el === s.gisin ? `${ELEMENT_HANJA[el]} 기운이 강한 달입니다. 용신 ${ELEMENT_HANJA[s.yongsin]} 부적으로 균형을 잡으세요.`
        : `이달의 개운 포인트는 ${ELEMENT_HANJA[s.weakest]} ${ELEMENT_KO[s.weakest]} 기운 채우기입니다.`;
    return { m, pillar: mp, base, improved, god, theme: pillarTheme(s, mp).theme, cats, mission };
  });
  const sorted = [...months].sort((a, b) => b.improved - a.improved);
  return { year: y, yp, yScore, months, best: sorted.slice(0, 3), caution: sorted.slice(-2), avgBase: Math.round(months.reduce((a, b) => a + b.base, 0) / 12), avgImp: Math.round(months.reduce((a, b) => a + b.improved, 0) / 12), index };
}

function monthChartSVG(r, cur) {
  const W = 340; const H = 160; const L = 24; const B = 26; const T = 14;
  const bw = (W - L - 6) / 12;
  const y = (v) => T + ((95 - Math.max(25, v)) / 70) * (H - T - B);
  return `<svg viewBox="0 0 ${W} ${H}" class="fc-chart">
    ${[30, 50, 70, 90].map((v) => `<line x1="${L}" x2="${W - 4}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(255,255,255,0.07)"/><text x="${L - 4}" y="${y(v) + 3}" font-size="8.5" fill="#9a94c4" text-anchor="end">${v}</text>`).join('')}
    ${r.months.map((mo, i) => {
      const x = L + i * bw + 3; const now = mo.m === cur; const past = mo.m < cur;
      return `<rect x="${x}" y="${y(mo.base)}" width="${bw - 6}" height="${H - B - y(mo.base)}" rx="3" fill="rgba(154,148,196,${past ? 0.25 : 0.45})"/>
        <rect x="${x}" y="${y(mo.improved)}" width="${bw - 6}" height="${Math.max(0, y(mo.base) - y(mo.improved))}" rx="3" fill="${now ? '#ff8fb3' : '#ffc93c'}" opacity="${past ? 0.5 : 0.95}"/>
        <text x="${x + (bw - 6) / 2}" y="${y(mo.improved) - 3}" font-size="8.5" fill="#fff" text-anchor="middle">${mo.improved}</text>
        <text x="${x + (bw - 6) / 2}" y="${H - 10}" font-size="9" fill="${now ? '#ff8fb3' : '#cfcaf2'}" text-anchor="middle" font-weight="${now ? 800 : 400}">${mo.m}월</text>`;
    }).join('')}
  </svg>`;
}

function renderReport() {
  const panel = $('[data-panel="report"]');
  if (!panel || !state.saju) return;
  const r = monthlyReport();
  const cur = state.fortune.date.month;
  const sub = isSubscribed(loadGacha(), state.fortune.dateKey);
  const sel = state.reportMonth || cur;
  const mo = r.months[sel - 1];
  const free = sel === cur || sel === cur + 1 || sub;
  const th = pillarTheme(state.saju, r.yp);
  panel.innerHTML = `
    <div class="card">
      <h3>📅 ${r.year}년 운세 리포트 <span class="tag">${pillarLabelFull(r.yp)}년</span></h3>
      <div class="report-head">
        <div class="luck-ring" style="--p:${r.avgImp}"><b>${r.avgImp}</b><span>올해 평균</span></div>
        <div>
          <p style="margin:0"><b>올해의 테마: ${th.god} · ${th.theme}</b></p>
          <p class="muted" style="margin:4px 0 0;font-size:0.84rem">정통 기본 평균 <b>${r.avgBase}</b> → 개운 반영 <b style="color:var(--gold)">${r.avgImp}</b> (개운 지수 ${r.index})</p>
          <p style="margin:6px 0 0;font-size:0.85rem">🌟 좋은 달: ${r.best.map((b) => `<b>${b.m}월</b>`).join(' · ')} &nbsp; ⚠️ 조심할 달: ${r.caution.map((b) => `${b.m}월`).join(' · ')}</p>
        </div>
      </div>
      ${monthChartSVG(r, cur)}
      <div class="fc-legend"><span><i style="background:#9a94c4"></i>정통 기본</span><span><i style="background:#ffc93c"></i>개운으로 더해진 몫</span><span><i style="background:#ff8fb3"></i>이번 달</span></div>
    </div>
    <div class="card">
      <div class="month-grid">${r.months.map((x) => `<button type="button" class="mcell ${x.m === sel ? 'sel' : ''} ${x.m === cur ? 'now' : ''} ${x.m < cur ? 'past' : ''}" data-month="${x.m}" style="--h:${x.improved}"><b>${x.m}월</b><span>${x.improved}</span><small>${STEMS[x.pillar.stem]}${BRANCHES[x.pillar.branch]}</small></button>`).join('')}</div>
    </div>
    <div class="card">
      <h3>${sel}월 상세 <span class="tag">${pillarLabelFull(mo.pillar)}월 · ${mo.god}</span></h3>
      <p style="margin-top:0">${mo.theme}의 기운이 흐르는 달입니다. 기본 <b>${mo.base}</b> → 개운 반영 <b style="color:var(--gold)">${mo.improved}</b>${mo.m < cur ? ' (지난 달)' : mo.m === cur ? ' · 지금 진행 중' : ''}</p>
      ${free ? `<div class="bars">${mo.cats.map((v, i) => `<div class="bar"><span>${MONTH_CATS[i]}</span><div class="track"><div class="fill" style="width:${v}%;background:${scoreColor(v)};color:${scoreColor(v)}"></div></div><span class="num">${v}</span></div>`).join('')}</div>
        <p class="concern-card" style="margin:10px 0 0">🧧 이달의 개운 미션: ${mo.mission}</p>`
      : `<div class="locked-detail"><p>👑 분야별 점수와 이달의 개운 미션은 <b>이번 달·다음 달</b>은 무료, 나머지 달은 수호 구독에서 볼 수 있어요.</p><button class="primary" type="button" id="btn-report-sub">수호 구독 알아보기</button></div>`}
    </div>`;
  $$('[data-month]', panel).forEach((b) => b.addEventListener('click', () => { state.reportMonth = Number(b.dataset.month); renderReport(); }));
  $('#btn-report-sub', panel)?.addEventListener('click', openShop);
}

// ---------- 승천 능력 ----------

/** 단계 능력이 반영된 오늘 운세 점수 */
function applyAbilities(fortune) {
  const ab = abilitiesAt(loadGrowth().evolved);
  const f = { ...fortune, scores: { ...fortune.scores }, abilityBonus: ab.cat };
  Object.entries(ab.cat).forEach(([k, v]) => { if (v && f.scores[k] !== undefined) f.scores[k] = Math.min(98, f.scores[k] + v); });
  return f;
}

/** 진화 가능한 최고 단계 (레벨 + 개운 지수 + 누적 기운) */
function evolvableStage(gs) {
  const { index, luck } = luckNow();
  let best = gs.stage;
  for (let st = gs.stage + 1; st <= gs.reachedStage; st++) {
    if (index >= (STAGE_LUCK_GATE[st] || 0) && (luck.lifetime || 0) >= (STAGE_LIFETIME_GATE[st] || 0) && trialProgress(st, trialStats()).ok) best = st; else break;
  }
  return best;
}

function abilityCardHTML(info) {
  const stage = heroOptions().stage;
  const ab = abilitiesAt(stage);
  const nx = nextAscension(Math.max(stage, 5));
  const { index, luck } = luckNow();
  const ladder = ASCENSION.map((a) => `<div class="asc ${a.stage <= stage ? 'on' : ''}" style="--c:${a.color}" title="${a.ability}"><b>${a.name.split('(')[0]}</b><small>${a.tier}</small></div>`).join('');
  return `<div class="card">
    <h3>🐉 승천의 길 <span class="tag">${stage >= 6 ? `${stageName(stage, info.female)}` : '신수 이후'}</span></h3>
    <div class="asc-row">${ladder}</div>
    ${ab.list.length ? `<ul class="abilities">${ab.list.map((a) => `<li style="--c:${a.color}"><b>${a.name} · ${a.ability}</b><span>${a.desc}</span></li>`).join('')}</ul>`
      : '<p class="muted" style="margin:8px 0 0;font-size:0.85rem">지신의 신수(5단계)가 된 뒤, 오방 신수 → 상위 신 → 궁극신으로 승천하며 특별 능력이 쌓입니다.</p>'}
    ${nx ? `<p class="concern-card" style="margin:10px 0 0">다음 승천 <b style="color:${nx.color}">${nx.name}</b> · ${nx.ability}<br><small class="muted">조건: Lv.${nx.level} · 개운 지수 ${STAGE_LUCK_GATE[nx.stage]} (지금 ${index}) · 누적 기운 ${STAGE_LIFETIME_GATE[nx.stage]} (지금 ${luck.lifetime || 0})</small></p>
      ${(() => { const tp = trialProgress(nx.stage, trialStats()); return `<div class="trial"><b>⚔️ ${tp.title}</b>${tp.items.map((x) => `<div class="${x.ok ? 'ok' : ''}">${x.ok ? '✅' : '⬜'} ${x.label} <small>(${Math.min(x.have, x.need)}/${x.need})</small></div>`).join('')}<small class="muted">성장 단계는 레벨로 오르지만, 오방 신수와 상위 신은 꾸준함·인연·발걸음으로 시련을 넘어야 승천합니다.</small></div>`; })()}` : '<p class="concern-card" style="margin:10px 0 0">🌌 궁극신에 도달했습니다. 모든 능력이 깨어났어요.</p>'}
  </div>`;
}

// ---------- 성장·진화 ----------

function loadGrowth() {
  return { ...emptyGrowth(), ...(load(GROWTH_KEY, null) || {}) };
}

/** 성장 상태를 바꾸고, 생긴 일(레벨업·진화 가능·스트릭 등)을 알려 준다 */
function grow(fn, lead = '') {
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
  if (lead) msgs.unshift(lead);
  if (msgs.length) toast(msgs.join(' · '));
  if (state.saju && !$('[data-panel="hero"]').classList.contains('hidden')) renderHero(false);
  return res;
}

function personalityCard() {
  const pers = personalityOf(zIdx());
  return `<div class="pers">
    <div><b>${pers.type}</b></div>
    <div class="perks" style="margin-top:4px">${pers.traits.map((t) => `<em>#${t}</em>`).join('')}</div>
    <p style="margin:6px 0 0;font-size:0.88rem">${pers.intro}</p>
    <p class="muted" style="margin:4px 0 0;font-size:0.8rem">말투: ${pers.voice} · 자기 호칭: "${pers.me}"${heroOptions().stage === 1 ? ' · 아기 단계라 아직 "뀨!"가 먼저 나와요' : heroOptions().stage >= 5 ? ' · 신수가 되어 말에 위엄(✦)이 생겼어요' : ''}</p>
  </div>`;
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
    ${gs.canEvolve && evolvableStage(gs) === gs.stage ? `<p class="concern-card" style="margin:8px 0 0">🔒 레벨은 충분해요! <b>${stageName(gs.stage + 1, info.female)}</b>(으)로 진화하려면 개운 지수 <b>${STAGE_LUCK_GATE[gs.stage + 1]}</b>${STAGE_LIFETIME_GATE[gs.stage + 1] ? `과 누적 기운 <b>${STAGE_LIFETIME_GATE[gs.stage + 1]}</b>` : ''}이 필요합니다 (지금 ${luckNow().index}${STAGE_LIFETIME_GATE[gs.stage + 1] ? ` / ${luckNow().luck.lifetime || 0}` : ''}). 운명 뽑기와 미션으로 오행을 채워 주세요.</p>` : ''}
    ${gs.canEvolve && evolvableStage(gs) > gs.stage ? `<button class="primary evolve-btn" type="button" id="btn-evolve">✦ ${stageName(evolvableStage(gs), info.female)}(으)로 진화하기 ✦</button>` : gs.canEvolve ? '' : `<p class="muted" style="margin:8px 0 0;font-size:0.85rem">${gs.next ? `다음 진화 <b>${stageName(gs.next.stage, info.female)}</b>까지 ${gs.levelsToNext}레벨 — ${gs.next.desc}` : '최종 진화 완료! 전설의 신수가 되었습니다.'}</p>`}
    ${gs.next ? `<div class="perks"><span class="muted">다음 진화 보상</span>${STAGE_UNLOCKS[gs.next.stage - 1].perks.map((x) => `<em>🎁 ${x}</em>`).join('')}</div>` : ''}
    ${rewards ? `<div class="actions" style="margin-top:10px">${rewards}</div>` : ''}
    <div class="evo-road">${thumbs}</div>
    ${(() => { const b = boostNow(); return `<div class="boost">⚡ 성장 가속 <b>+${Math.round((b.total - 1) * 100)}%</b> <small>🔥 연속 출석 +${Math.round(b.streak * 100)}% · 💞 친구 ${load(FRIENDS_KEY, []).length}명 +${Math.round(b.friends * 100)}%</small><small class="muted">매일 접속과 친구가 성장의 지름길! (각각 최대 +30%)</small></div>`; })()}
    <h4 style="margin:14px 0 6px">오늘의 퀘스트 <span class="muted" style="font-weight:400;font-size:0.8rem">(${gs.todayExp} / ${QUESTS.reduce((a, q) => a + q.exp, 0)} EXP)</span></h4>
    <ul class="quests">${quests}</ul>
    <p class="muted" style="font-size:0.78rem;margin:8px 0 0">${gs.nextReward ? `🔥 ${gs.nextReward.days}일 연속 출석하면: ${gs.nextReward.label}` : '모든 연속 출석 보상을 받았습니다!'}</p>
    <details class="advanced" style="margin-top:10px"><summary>프로토타입 체험 도구</summary>
      <p class="muted" style="font-size:0.8rem;margin:0">실서비스에서는 매일 퀘스트로만 경험치를 얻습니다. 진화 단계를 빨리 보려면 눌러 보세요.</p>
      <button class="ghost" type="button" id="btn-exp-test">경험치 +60 (체험용)</button>
      <button class="ghost" type="button" id="btn-charge-test">오행 충전 +15 (체험용)</button>
    </details>
  </div>`;
}

function bindGrowth(panel, info) {
  $('#btn-evolve', panel)?.addEventListener('click', () => {
    const g = loadGrowth();
    const before = g.evolved;
    const to = evolvableStage(summary(g, state.fortune.dateKey));
    if (to <= before) return;
    save(GROWTH_KEY, { ...g, evolved: to });
    state.fortune = applyAbilities(computeFortune(state.saju));
    showEvolution(info, before, to);
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
      setTimeout(() => charge(t.element, CHARGE_BY_RARITY[t.rarity.key], 'reward', '🎁 연속 출석 보상'), 2200);
    }
    renderHero(false);
  }));
  $('#btn-exp-test', panel)?.addEventListener('click', () => grow((g) => addExp(g, 60)));
  $('#btn-charge-test', panel)?.addEventListener('click', () => { [0, 1, 2, 3, 4].forEach((e) => { const r = addCharge(loadLuck(), state.saju, { element: e, amount: 15, source: 'test', dateKey: state.fortune.dateKey }); save(LUCK_KEY, r.luck); }); toast(`오행 충전 +15 (체험용) · 개운 지수 ${luckNow().index}`); renderHero(false); renderSaju(); });
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
    ${speechBubble([speak(zIdx(), 'evolve', { stage: to })])}
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
    <div id="compat-result">${sel !== null && friends[sel] ? compatResultHTML(friends[sel], sel) : '<div class="card"><p class="muted" style="margin:0">친구를 추가하면 두 캐릭터가 함께 나오는 궁합 카드가 만들어집니다.</p></div>'}</div>
    ${dexHTML()}`;

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
    grow((g) => complete(g, state.fortune.dateKey, 'compat', qBonus('compat')));
    setTimeout(() => { processDexRewards(); renderCompat(); }, 50);
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
    setTimeout(() => charge(t.element, CHARGE_BY_RARITY[t.rarity.key], `bond-${c.friendName}`, '💞 인연부'), 2200);
    renderCharm(false);
  });
  $('#btn-compat-png', panel)?.addEventListener('click', () => downloadSVGAsPNG(state.compat.svg, `compat-${state.compat.friendName}.png`, 3));
  $$('[data-react]', panel).forEach((b) => b.addEventListener('click', () => {
    const list = load(FRIENDS_KEY, []);
    const fr = list[Number(b.dataset.fidx)];
    if (!fr) return;
    fr.reactions = [...(fr.reactions || []), { key: b.dataset.react, date: state.fortune.dateKey, n: (fr.reactions || []).length + 1 }].slice(-6);
    save(FRIENDS_KEY, list);
    renderCompat();
    const soc = load(SOC_KEY, { stickers: 0 }); soc.stickers += 1; save(SOC_KEY, soc);
    grow((g) => complete(g, state.fortune.dateKey, 'social', qBonus('social')), `${STICKERS.find((x) => x.key === b.dataset.react).text} 스티커를 보냈어요! 💞 인연의 기운 +`);
    setTimeout(() => charge(state.saju.yongsin, 2, 'social', '💞 인연의 기운'), 2300);
  }));
  $$('[data-find]', panel).forEach((b) => b.addEventListener('click', async () => {
    const z = ZODIAC[Number(b.dataset.find)];
    const msg = `🐾 ${z.name}띠 친구 구해요! 12지신 강림에서 우리 띠 궁합 보자 ✦ ${location.href.split('?')[0].split('#')[0]}`;
    try { await navigator.clipboard.writeText(msg); toast(`${z.name}띠 친구 찾는 메시지를 복사했어요. 단톡방에 붙여 넣어 보세요!`); } catch { toast(msg); }
  }));
  $$('[data-ms]', panel).forEach((b) => b.addEventListener('click', () => {
    const res = claimMilestone(loadDex(), currentDex(), Number(b.dataset.ms));
    if (!res.reward) return;
    save(DEX_KEY, res.dex);
    const c = CONCERNS.find((x) => x.key === state.profile.concern) || CONCERNS[2];
    const t = createTalisman(state.saju, state.fortune, { type: 'love', theme: res.reward.rarity === 'myth' ? 'neon' : 'classic', element: state.saju.weakest, rarity: res.reward.rarity });
    const list = load(COLLECTION_KEY, []);
    list.unshift({ ...recordOf(t), label: `도감 보상 ${t.rarity.label} 인연부` });
    setTimeout(() => charge(t.element, CHARGE_BY_RARITY[t.rarity.key], 'reward', '📖 도감 보상'), 2200);
    save(COLLECTION_KEY, list.slice(0, 60));
    toast(`📖 칭호 "${res.reward.title}" 획득! ${t.rarity.label} 인연부를 도감에 넣었어요`);
    renderCompat(); renderCharm(false);
  }));
}

/** 캐릭터 얼굴만 잘라 낸 작은 SVG */
function faceSVG(info, stage, mood = 'smile', size = 64) {
  const { defs, body } = characterMarkup(info, { stage, mood, aura: false });
  const vb = { 1: '66 134 188 188', 2: '56 100 208 208', 3: '50 80 220 220' }[stage] || '40 56 240 240';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${size}" height="${size}"><defs>${defs}</defs>${body}</svg>`;
}

function dialogueHTML(aInfo, bInfo, dlg, aStage) {
  const [a, b] = dlg.lines;
  return `<div class="dialogue">
    <div class="dlg-title">${dlg.kind === 'proverb' ? `📜 속담 전설 「${dlg.proverb.text}」 <small class="muted">${dlg.proverb.meaning}</small>` : dlg.special ? '⭐ 전설의 조합 전용 대화' : `${dlg.relation.label} 관계의 대화`}</div>
    <div class="dlg-row"><div class="dlg-face">${faceSVG(aInfo, aStage, 'smile')}<span>${aInfo.zodiac.name}</span></div>${speechBubble([a.text], 'left')}</div>
    <div class="dlg-row right">${speechBubble([b.text], 'right')}<div class="dlg-face">${faceSVG(bInfo, 2, 'smile')}<span>${bInfo.zodiac.name}</span></div></div>
  </div>`;
}

function loadDex() { return { ...emptyDex(), ...(load(DEX_KEY, null) || {}) }; }

function currentDex() {
  const friends = load(FRIENDS_KEY, []).map((fr) => {
    const fs = friendSaju(fr);
    return fs.error ? null : { name: fr.name, branch: fs.pillars.year.branch };
  }).filter(Boolean);
  return computeDex(state.saju.pillars.year.branch, friends, loadDex());
}

/** 새로 발견한 띠·전설의 조합 보상 처리 (각 1회) */
function processDexRewards() {
  const r = currentDex();
  if (!r.expGain) return;
  save(DEX_KEY, recordDiscoveries(loadDex(), r));
  const names = r.newSeen.map((b) => ZODIAC[b].name).join('·');
  const lead = [names ? `🐾 새 띠 발견: ${names}띠!` : '', r.newLegends.length ? `⭐ 전설의 조합 ${r.newLegends.length}개 발견!` : ''].filter(Boolean).join(' ');
  grow((g) => addExp(g, r.expGain), lead);
}

function dexHTML() {
  const r = currentDex();
  const me = state.saju.pillars.year.branch;
  const stage = heroOptions().stage;
  const myInfo = characterInfo(state.saju, state.profile);
  const pct = Math.round((r.count / r.total) * 100);
  const cards = r.entries.map((e) => {
    const z = ZODIAC[e.branch];
    const fake = { pillars: { year: { branch: e.branch } }, dayMaster: (e.branch * 3) % 10 };
    const info = e.isMe ? myInfo : characterInfo(fake, { gender: e.branch % 2 ? 'female' : 'male', concern: 'people' });
    const face = faceSVG(info, e.isMe ? stage : 2, 'smile', 56);
    const tone = { samhap: '#ff4d8d', yukhap: '#ffc93c', same: '#39ff88', normal: '#9a94c4', wonjin: '#c77dff', chung: '#00e5ff' }[e.relation.type];
    const badge = e.isMe ? '<em class="me">나</em>' : `<em style="color:${tone};border-color:${tone}">${e.relation.label}</em>`;
    if (!e.unlocked) {
      return `<div class="dex-card locked">
        <div class="dex-face">${face}</div>
        <b>${z.name}띠</b>${badge}
        ${e.legend ? `<span class="legend-hint">${pairLine(me, e.branch).kind === 'proverb' ? '📜 속담 전설' : '⭐ 전설의 조합'}</span>` : ''}
        <button class="ghost dex-find" type="button" data-find="${e.branch}">🔍 ${z.name}띠 친구 찾기</button>
      </div>`;
    }
    const line = e.isMe ? null : pairLine(me, e.branch, { stage });
    const back = e.isMe ? null : pairLine(e.branch, me, {});
    return `<details class="dex-card ${e.legendFound ? 'legend' : ''} ${e.isMe ? 'mine' : ''}">
      <summary><div class="dex-face">${face}</div><b>${z.name}띠</b>${badge}${e.legendFound ? `<span class="legend-hint on">${pairLine(me, e.branch).kind === 'proverb' ? '📜 속담' : '⭐ 전설'}</span>` : ''}
        <small>${e.isMe ? '내 수호 캐릭터' : e.friends.slice(0, 2).join(', ') + (e.friends.length > 2 ? ` 외 ${e.friends.length - 2}명` : '')}</small></summary>
      ${e.isMe ? `<p>${esc(personalityOf(me).intro)}</p>` : `${line.kind === 'proverb' ? `<p class="proverb">📜 「${line.proverb.text}」 — ${line.proverb.meaning}</p>` : ''}<p><b>${myInfo.zodiac.name}:</b> ${esc(line.text)}</p><p><b>${z.name}:</b> ${esc(back.text)}</p>`}
    </details>`;
  }).join('');
  const milestones = r.milestones.map((m) => `<div class="ms ${m.claimed ? 'done' : m.reached ? 'ready' : ''}">
      <b>${m.count}띠</b><span>${m.title}</span><small>${m.reward}</small>
      ${m.reached && !m.claimed ? `<button class="primary" type="button" data-ms="${m.count}">받기</button>` : m.claimed ? '<i>✓</i>' : '<i>🔒</i>'}</div>`).join('');
  return `<div class="card dex">
    <h3>📖 12띠 수집 도감 <span class="tag">${r.count} / 12</span></h3>
    <div class="exp"><div class="exp-fill" style="width:${pct}%;background:linear-gradient(90deg,#ff4d8d,#c77dff,#00e5ff)"></div><span>${r.count} / 12 띠 · 전설의 조합 ${r.legendsFound} / ${r.legendsTotal}</span></div>
    <div class="rel-badges">${r.relations.map((x) => `<span class="${x.found ? 'on' : ''}" style="--c:${x.color}">${x.found ? '●' : '○'} ${x.label}</span>`).join('')}</div>
    <p class="muted" style="font-size:0.82rem;margin:8px 0">친구를 추가하면 그 친구의 띠 칸이 열립니다. 새 띠 +20 EXP, 전설의 조합 +30 EXP!${r.nextMilestone ? ` 다음 보상까지 <b>${r.nextMilestone.count - r.count}띠</b> 남았어요.` : ' 12띠를 모두 모았습니다!'}</p>
    <div class="ms-row">${milestones}</div>
    <div class="dex-grid">${cards}</div>
  </div>`;
}

function stickerReactHTML(fr, idx) {
  const own = load(STICKER_KEY, {});
  const mine = STICKERS.filter((x) => own[x.key]);
  const last = (fr.reactions || []).slice(-1)[0];
  const lastSt = last && STICKERS.find((x) => x.key === last.key);
  return `<div class="react">
    <div class="dlg-title">🏷️ 스티커로 말 걸기</div>
    ${lastSt ? `<div class="dlg-row right"><div class="sent">${renderStickerSVG(lastSt, 72)}</div></div><div class="dlg-row">${speechBubble([`${esc(fr.name)}의 ${ZODIAC[friendSaju(fr).pillars.year.branch].name}: ${speak(friendSaju(fr).pillars.year.branch, 'tap', { seed: (last.n || 0) / 7 % 1 })}`], 'left')}</div>` : ''}
    ${mine.length ? `<div class="react-row">${mine.map((st) => `<button type="button" data-react="${st.key}" data-fidx="${idx}">${renderStickerSVG(st, 54)}</button>`).join('')}</div>` : '<p class="muted" style="margin:4px 0 0;font-size:0.82rem">운명 뽑기에서 스티커를 모으면 친구에게 보낼 수 있어요.</p>'}
  </div>`;
}

function compatResultHTML(fr, idx) {
  const fs = friendSaju(fr);
  if (fs.error) return `<div class="card"><p class="muted">${fs.error}</p></div>`;
  const myInfo = characterInfo(state.saju, state.profile);
  const friendInfo = characterInfo(fs, { gender: fr.gender, concern: 'people' });
  const c = computeCompat(state.saju, fs, state.fortune.date);
  const abC = abilitiesAt(heroOptions().stage).compat;
  if (abC) c.score = Math.min(99, c.score + abC);
  const { charms, stage } = heroOptions();
  const myName = state.profile.name || '나';
  const svg = renderCompatSVG(myInfo, friendInfo, c, { myName, friendName: fr.name, myStage: stage, myCharms: charms });
  const dialogue = pairDialogue(state.saju.pillars.year.branch, fs.pillars.year.branch, { stageA: stage, stageB: 2 });
  state.compat = { myInfo, friendInfo, compat: c, svg, myName, friendName: fr.name, friendSaju: fs, myStage: stage, myCharms: charms, dialogue };
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
    ${dialogueHTML(myInfo, friendInfo, state.compat.dialogue, stage)}
    <p class="concern-card" style="margin:10px 0 0">💡 오늘의 팁: ${c.tip}</p>
    <div class="actions" style="margin-top:12px">
      <button class="primary" type="button" data-story="compat">📸 궁합 카드 스토리 공유</button>
      <button class="ghost" type="button" id="btn-compat-charm">💞 인연 부적 받기</button>
      <button class="ghost" type="button" id="btn-compat-png">PNG 저장</button>
      <button class="ghost" type="button" id="btn-friend-del">친구 삭제</button>
    </div>
    ${stickerReactHTML(fr, idx)}
    <div style="display:none">
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
  const set = EMOTES.map((m) => ({ m, svg: renderEmoticonSVG(s, f, { stage: heroOptions().stage, profile: p, mood: m.key, style, tag: '', rarity: emoteRarity(m.key) }) }));

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
      <h3>이모티콘 도감 <span class="tag">${EMOTES.filter((e) => ownedEmotes().has(e.key)).length} / 8</span></h3>
      <div class="emoji-set">${set.map(({ m, svg }, i) => ownedEmotes().has(m.key) ? `<figure data-set="${i}">${svg}<figcaption><span style="color:${RARITY_COLOR[emoteRarity(m.key)]}">${RARITY_LABEL[emoteRarity(m.key)]}</span> ${m.label}</figcaption></figure>` : `<figure class="locked"><div class="emo-lock big">🔒</div><figcaption>${m.label}</figcaption></figure>`).join('')}</div>
      <p class="muted" style="margin-bottom:0">운명 뽑기에서 모입니다. 같은 표정을 더 높은 등급으로 뽑으면 등급이 올라가요. 누르면 저장되고, 캐릭터에 장착할 수 있어요.</p>
    </div>
    ${stickerBookHTML()}`;

  $('#btn-emoji-style').addEventListener('click', () => { state.emojiStyle = style === 'neon' ? 'sticker' : 'neon'; renderEmoji(); });
  $('#btn-emoji-png').addEventListener('click', () => downloadSVGAsPNG(main, `lucky-emoji-${f.dateKey}.png`, 3));
  $$('[data-set]').forEach((fig) => fig.addEventListener('click', () => {
    const { m, svg } = set[Number(fig.dataset.set)];
    downloadSVGAsPNG(svg, `emoji-${m.key}.png`, 3);
  }));
}

function stickerBookHTML() {
  const own = load(STICKER_KEY, {});
  const count = STICKERS.filter((x) => own[x.key]).length;
  return `<div class="card">
    <h3>🏷️ 스티커북 <span class="tag">${count} / ${STICKERS.length}</span></h3>
    <div class="sticker-grid">${STICKERS.map((st) => `<figure class="${own[st.key] ? '' : 'locked'}">${renderStickerSVG(st, 76, !own[st.key])}${own[st.key] > 1 ? `<span class="cnt">×${own[st.key]}</span>` : ''}</figure>`).join('')}</div>
    <p class="muted" style="margin-bottom:0;font-size:0.82rem">스티커는 궁합 탭에서 친구 캐릭터에게 보낼 수 있어요. 테두리 색: 희귀 파랑 · 영웅 보라 · 전설 금색 · 신화 빨강</p>
  </div>`;
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
    hero: { info: characterInfo(state.saju, state.profile), ...heroOptions(), quote: say('tier', { tier: state.fortune.tier, vars: { score: state.fortune.scores.total } }) },
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
    grow((g) => complete(g, state.fortune.dateKey, 'share', qBonus('share')));
    return;
  }
  const result = await shareStory(canvas, {
    title: '12지신 강림',
    text: `오늘 내 운세는? ${state.fortune.info.title} ✦`,
    filename,
  });
  if (result === 'downloaded') toast('이 기기는 바로 공유를 지원하지 않아 이미지로 저장했습니다');
  if (result !== 'cancelled') grow((g) => complete(g, state.fortune.dateKey, 'share', qBonus('share')));
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
