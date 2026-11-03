import {
  computeSaju, tenGod, seededRandom, BIRTH_CITIES, cityLon, STEMS, STEMS_KO, BRANCHES, BRANCHES_KO, STEM_ELEMENT, BRANCH_ELEMENT,
  BRANCH_MAIN_STEM, ELEMENT_KO, ELEMENT_HANJA, pillarLabel, pillarLabelKo,
} from './saju.js';
import { MOODS, LEVELS, pickUmbrella, missionById, habitDay, setMood, pickLevel, completeHabit, setAfter, weekDone, needsCare, habitStats } from './habit.js';
import { computeFortune, CATEGORIES, DAY_MASTER_PROFILE, TEN_GOD_INFO } from './fortune.js';
import {
  createTalisman, renderTalismanSVG, downloadSVGAsPNG, TALISMAN_TYPES, THEMES, RARITIES, EMBLEM_NAME,
} from './talisman.js';
import { renderEmoticonSVG, EMOTES, todayEmote, MOOD_PROP } from './emoticon.js';
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
import { isCrisis, crisisReply, buildInstructions, buildMessages, offlineReply, QUICK_ASKS, FREE_CHATS } from './chat.js';
import { SCENE_NAME } from './season.js';
import { seasonStatus, SEASON_PACKS, SEASON_MISSIONS, FREE_TIERS, PACK_PRICE, emptySeason, recordSeason, missionProgress, tiersDone, buyPack, ownedItems, seasonLook, activeTitle, seasonsAround, itemName, titleName, withEul } from './season.js';
import { dateToJdn } from './lunar.js';
import { layersAt, monthPeriod, explainParts, TEN_GOD_MOD, weekOf, yearOf, monthDays, sajuYearOf, categoryScores } from './period.js';
import { orderedMenu, buildAnswer, concernAsk, ASK_MENU } from './ask.js';
import { buildReading, FIELD_LABEL, closingLine, GOD_READING } from './reading.js';
import { analyzeGyeok, GYEOK_PROFILE, strengthMission } from './gyeokguk.js';
import { buildBooklet, todayLetter } from './booklet.js';
import { natalRelations } from './relations.js';
import { growEquipped, fillOf, replaceCharm, pairType, fiveDone, elementsOwned, setUnlocked, boostRarity, offerUnlocked, offerValue, offerable, removeOffered, equipLine, charmKey, GROW_FULL, RARITY_KO as CC_RARITY_KO, TYPE_KO, OFFER_UNLOCK } from './charmcare.js';
import { buildNote, markNote, weekStamps, stampRarity, AREA_CHARM, RARITY_KO, MONTH_KEY_NEED, monthStamps, STORY_STEPS, newStoryIndex, storiesOpen, buildStories, weeklyLetter } from './note.js';
import { ELEMENT_LUCK } from './fortune.js';
import { preloadCharImages, itemImage } from './assets.js';
/** 계절 한정 소품 그림 (없으면 빈칸) */
const itemThumb = (key, cls = 'item-thumb') => { const u = itemImage(key); return u ? `<img class="${cls}" src="${u}" alt="" loading="lazy">` : ''; };
import { GUIDE_STEPS, emptyGuide, showNextYear, nextStep, progress as guideProgress, isUnlocked, stepFor, completeStep as completeGuideStep, setAll as guideSetAll } from './guide.js';
import { emptyMemory, extractMemories, mergeMemory, memoryLines, followUp, markAsked, recallFor, describe as describeMemory, forget, forgetAll, needsSummary, applySummary, summaryMessages, offlineSummary, SUMMARY_EVERY, MEMORY_LIMIT } from './memory.js';
import { festivalStatus } from './festivals.js';
import { yearCard, monthRange, savePledge, pledgeReviewDue, reviewPledge, PLEDGE_MAX } from './yearcard.js';
import { buildMissions, markDone as dmMarkDone, allDone as dmAllDone, claimBonus as dmClaimBonus, DM_BONUS_EXP } from './daymission.js';
import { ensureStart, inFirstWeek, plainTerms, hasGameTerms } from './firstweek.js';
import { emptyEasy, setEasy, dismissEasy, suggestEasy, easyTerms, hasEasyTerms, parseEasyLink, acceptLink, linkAskText, easyLinkQuery, FROM_MAX } from './easymode.js';
import { expertTable, sinsalOf, calcBasis, STAGE_NOTE, twelveStage, makeChart, addChart, removeChart, emptyCharts, RELATIONS } from './expert.js';
import { CARD_AREAS, SPREADS, drawReading } from './cards.js';
import { weekWealth, SAFETY_LINES } from './wealthweek.js';
import { makeBackup, parseBackup, backupText, backupFileName, PREFIX as BACKUP_PREFIX } from './backup.js';
import { emptyRecords, logDay, pendingFeedback, setFeedback, addItem, hasItem, setItemMemo, removeItem, dayList, stats as recordStats, streak as recordStreak, FEEDBACK, ITEM_KIND, MEMO_MAX } from './records.js';
import { makeCode, normalizeCode, publicCard, cardToSaju, cleanCard, pendingCheers, joinTeamRoom, openMailbox, CHEER_MESSAGES, CHEER_DAILY_LIMIT, CHEER_CHARGE, cheerText, cheerId } from './realtime.js';
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
const HABIT_KEY = 'unmyeong2099.habit'; // v0.30 마음 날씨 + 오늘의 우산
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
const CHAT_KEY = 'unmyeong2099.chat';
const MEM_KEY = 'unmyeong2099.memory';
const SEASON_KEY = 'unmyeong2099.season';
const RT_KEY = 'unmyeong2099.realtime';
const GUIDE_KEY = 'unmyeong2099.guide';
const RECORDS_KEY = 'unmyeong2099.records';
const CHARTS_KEY = 'unmyeong2099.charts';
const FW_KEY = 'unmyeong2099.firstweek';
const EASY_KEY = 'unmyeong2099.easy'; // v0.31 쉬운 모드
const NOTE_KEY = 'unmyeong2099.note'; // 수호신의 쪽지
const NOTESTAT_KEY = 'unmyeong2099.notestat'; // 쪽지 누적 도장 { total }
const CHARMGROW_KEY = 'unmyeong2099.charmgrow'; // v0.38 장착 부적 기운 { 부적 키: 칸 }
const FIVE_KEY = 'unmyeong2099.five'; // 오행 완성 칭호를 받았는지
const DM_KEY = 'unmyeong2099.dmission';
const PLEDGE_KEY = 'unmyeong2099.pledge';
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
    birthLon: cityLon(p.city || ''),
    dst: p.dstAuto === false ? 'off' : 'auto',
  };
}

const solarDaysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const validYear = (y) => Number.isInteger(y) && y >= 1900 && y <= 2100;

function start(profile, mode = 'today') {
  state.profile = profile;
  state.saju = computeSaju(profileToInput(profile));
  state.fortune = computeFortune(state.saju, undefined, { gender: state.profile.gender });
  state.fortune = applyAbilities(state.fortune);
  state.charm.element = state.saju.weakest;
  state.charm.reroll = 0;
  state.charm.type = (CONCERNS.find((c) => c.key === profile.concern) || CONCERNS[2]).talisman;
  $('#view-input').classList.add('hidden');
  $('#view-result').classList.remove('hidden');
  $('#btn-edit').classList.remove('hidden');
  renderAll();
  selectTab(mode === 'summon' ? 'today' : (state.lastTab || 'today'));
  if (mode === 'summon') setTimeout(showSajuCard, 200);
  preloadCharImages(characterInfo(state.saju, profile).zodiac.key).then((n) => { if (n && !$('[data-panel="hero"]').classList.contains('hidden')) renderHero(false); });
  const lastSeen = loadGrowth().streak.last;
  state.backLine = null;
  state.heroLine = null;
  if (lastSeen && lastSeen !== state.fortune.dateKey) {
    const dn = (k) => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
    if (dn(state.fortune.dateKey) - dn(lastSeen) >= 2) state.backLine = say('back');
  }
  grow((g) => checkIn(g, state.fortune.dateKey));
  save(FW_KEY, ensureStart(load(FW_KEY, null), state.fortune.dateKey, loadGrowth().exp));
  setupPlainTerms();
  renderToday();
  setTimeout(() => { processDexRewards(); renderCompat(); }, 2600);
  setTimeout(initRealtime, 900);
  const abS = abilitiesAt(loadGrowth().evolved);
  if (abS.autoCharge) setTimeout(() => { const { fills } = luckNow(); const low = fills.indexOf(Math.min(...fills)); charge(low, abS.autoCharge, 'taeguk', '☯ 태극 순환'); }, 5200);
}

function initForm() {
  const form = $('#birth-form');
  const saved = normalizeProfile(load(STORE_KEY, null));
  const preview = $('#conv-preview');
  const leapRow = $('.leap-row');

  for (let m = 1; m <= 12; m++) form.month.add(new Option(`${m}월`, m));
  BIRTH_CITIES.forEach(([k, label, lon]) => form.city.add(new Option(k ? `${label} (동경 ${lon}°)` : label, k)));
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
    form.city.value = saved.city || '';
    form.dstAuto.checked = saved.dstAuto !== false;
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
      city: form.city.value,
      dstAuto: form.dstAuto.checked,
      gender: form.gender.value,
      concern: form.concern.value,
    };
    const solar = solarDateOf(profile);
    if (solar.error) { toast(solar.error); return; }
    const firstTime = !load(GROWTH_KEY, null);
    if (form.easy && form.easy.checked !== easyOn()) save(EASY_KEY, setEasy(loadEasy(), form.easy.checked, todayKeyNow(), 'self'));
    applyEasyClass();
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

  applyEasyClass();
  const qs = new URLSearchParams(location.search);
  if (saved && saved.gender && saved.concern && !solarDateOf(saved).error && qs.get('auto') !== '0') start(saved);
  else if (qs.has('gallery')) start({ name: '미리보기', calendar: 'solar', year: 1998, month: 5, day: 20, time: '09:30', timeUnknown: false, lonCorr: true, zasi: 'early', gender: 'female', concern: 'job' }); // 저장하지 않는 견본 프로필
  if (qs.has('gallery') && state.saju) selectTab('gallery');
  handleEasyLink();
}

// ---------- 탭 ----------

// 주 탭 5개 + 하위 화면 묶음
const TAB_PARENT = { cards: 'ask', saju: 'ask', report: 'ask', feng: 'ask', charm: 'hero', emoji: 'hero', story: 'hero', gallery: 'hero', records: 'hero' };
const SUBNAV = {
  ask: [['ask', '🔮 질문 메뉴'], ['cards', '🃏 신수 카드'], ['saju', '📜 내 사주'], ['report', '📅 올해·5년'], ['feng', '🧭 풍수 지도']],
  hero: [['hero', '🐉 캐릭터'], ['records', '📒 기록함'], ['charm', '📜 부적 만들기'], ['emoji', '😊 이모티콘'], ['story', '📸 스토리 카드'], ['gallery', '🧪 전체 미리보기']],
};

function selectTab(name) {
  state.lastTab = name;
  const parent = TAB_PARENT[name] || name;
  $$('.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === parent)));
  $$('.panel').forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== name));
  const sub = $('#subnav');
  const items = SUBNAV[parent];
  const showSub = items && (parent === 'hero' || name !== 'ask' || state.askOpen);
  sub.classList.toggle('hidden', !showSub);
  if (showSub) {
    sub.innerHTML = items.map(([k, label]) => `<button type="button" data-sub="${k}" aria-current="${k === name && !(k === 'ask' && state.askOpen) ? 'page' : 'false'}">${label}</button>`).join('');
  }
  if (name === 'ask') renderAsk();
  if (name === 'gallery') renderGallery();
  if (name === 'records') renderRecords();
  if (name === 'cards') renderCards();
  if (name === 'story') renderStory();
  if (name === 'hero') renderHero(true);
  if (name === 'feng') renderFeng();
  if (name === 'chat') { renderChat(); getSample().then(() => renderChat()); }
  if (name === 'today' && state.fortune) grow((g) => complete(g, state.fortune.dateKey, 'fortune', qBonus('fortune')));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$('#subnav').addEventListener('click', (e) => {
  const b = e.target.closest('[data-sub]'); if (!b) return;
  if (b.dataset.sub === 'ask') state.askOpen = null;
  selectTab(b.dataset.sub);
});

// ---------- 운세 보기 (질문형 메뉴판) ----------

function weekFortunes() {
  const key = `${state.fortune.dateKey}|${JSON.stringify(state.saju.input)}`;
  if (state.week?.key === key) return state.week.list;
  const d0 = state.fortune.date;
  const list = Array.from({ length: 7 }, (_, i) => {
    if (i === 0) return state.fortune;
    const dt = new Date(Date.UTC(d0.year, d0.month - 1, d0.day + i));
    return applyAbilities(computeFortune(state.saju, { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() }, { gender: state.profile.gender }));
  });
  state.week = { key, list };
  return list;
}

function openAsk(key) {
  const item = ASK_MENU.find((x) => x.key === key);
  if (!item) return;
  if (item.go) { state.askOpen = null; selectTab(item.go); return; }
  state.askOpen = key;
  selectTab('ask');
}

function renderAsk() {
  const panel = $('[data-panel="ask"]');
  if (!panel || !state.saju) return;
  if (state.askOpen) { panel.innerHTML = askAnswerHTML(state.askOpen); return; }
  const menu = orderedMenu(state.profile.concern);
  panel.innerHTML = `
    <div class="card flow-card"><h3>📅 나의 흐름 <small>이번 주 · 이달 · 올해 · 10년</small></h3>${timelineHTML()}</div>
    <div class="card ask-menu">
      <h3>🔮 무엇이 궁금하세요?</h3>
      <p class="muted" style="margin:-4px 0 12px;font-size:0.84rem">궁금한 것을 누르면 ${characterInfo(state.saju, state.profile).zodiac.name} 수호신이 내 사주로 바로 풀어 드려요.</p>
      <button type="button" class="card-banner" data-sub-go="cards"><span>🃏</span><b>12지신 신수 카드 뽑기</b><small>궁금한 것을 정하고 카드 한 장 · 세 장</small></button>
      <div class="ask-grid">${menu.map((m) => `<button type="button" class="ask-item ${m.mine ? 'mine' : ''}" data-ask-open="${m.key}">
        <span class="ask-ic">${m.icon}</span><b>${m.q}</b><small>${m.sub}</small>${m.mine ? '<em>내 고민</em>' : ''}</button>`).join('')}</div>
    </div>`;
}

function trendSVG(trend, color) {
  const w = 300; const h = 70; const step = w / (trend.length - 1);
  const pts = trend.map((t, i) => [i * step, h - 8 - ((t.score - 20) / 80) * (h - 20)]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return `<svg viewBox="-12 -6 ${w + 24} ${h + 30}" class="ask-trend" role="img" aria-label="7일 흐름">
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
    ${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 0 ? 5 : 3.5}" fill="${color}"/><text x="${x}" y="${y - 9}" font-size="10" text-anchor="middle" fill="#fff">${trend[i].score}</text><text x="${x}" y="${h + 18}" font-size="10" text-anchor="middle" fill="#a9a3d6">${trend[i].short}</text>`).join('')}
  </svg>`;
}

function askAnswerHTML(key) {
  const a = buildAnswer(key, state.saju, weekFortunes());
  const color = scoreColor(a.score);
  const tier = a.score >= 80 ? 3 : a.score >= 60 ? 2 : a.score >= 40 ? 1 : 0;
  const line = speak(zIdx(), 'tier', { tier, stage: heroOptions().stage, vars: { score: a.score } });
  const face = faceSVG(characterInfo(state.saju, state.profile), heroOptions().stage, a.score >= 60 ? 'smile' : 'fighting', 44);
  return `
    <div class="card ask-answer">
      <button class="ghost ask-back" type="button" data-ask-back>← 다른 운세 보기</button>
      <h3 style="margin:10px 0 4px">${a.icon} ${a.q}</h3>
      <div class="ask-score">
        <div class="num" style="color:${color};text-shadow:0 0 12px ${color}">${a.score}<small>점</small></div>
        <div><b>${a.when} ${a.catLabel}, ${a.tone}</b><p>${a.text}</p></div>
      </div>
      <div class="ask-block"><h4>📜 사주로 보면</h4><p>${a.basis}</p></div>
      <div class="ask-block"><h4>✨ 이렇게 해 보세요</h4><p>${a.tip}</p>${a.weak ? `<p class="muted" style="margin:6px 0 0;font-size:0.84rem">오늘 가장 약한 건 <b>${a.weak.label}(${a.weak.score}점)</b>이에요.</p>` : ''}</div>
      <div class="ask-block"><h4>📈 앞으로 7일 ${a.catLabel}</h4>${trendSVG(a.trend, color)}
        <p class="muted" style="margin:0;font-size:0.84rem">가장 좋은 날은 <b style="color:var(--wood)">${a.best.full} ${a.best.score}점</b>${a.low ? `, 조심할 날은 <b style="color:var(--fire)">${a.low.full}</b>` : ''}이에요.</p></div>
      <div class="ask-guardian"><div class="av">${face}</div><p>${esc(line)}</p></div>
      <button class="primary ask-cta" type="button" data-ask-cta="${key}">${a.cta.label} →</button>
      ${saveBtnHTML('ask', key)}
      <p class="muted" style="font-size:0.72rem;margin:8px 0 0;text-align:center">운세는 재미와 마음가짐을 위한 참고예요. 의료·법률·투자 결정은 전문가와 상의하세요.</p>
    </div>`;
}

function runAskCta(key) {
  const a = buildAnswer(key, state.saju, weekFortunes());
  const c = a.cta;
  state.askOpen = null;
  if (c.action === 'charm') { state.charm.type = c.talisman; state.charm.element = state.saju.yongsin; selectTab('charm'); renderCharm(true); return; }
  if (c.action === 'chat') { selectTab('chat'); setTimeout(() => { const i = $('#chat-form input'); if (i) { i.value = c.ask; i.focus(); } }, 50); return; }
  if (c.action === 'journey') { selectTab('today'); ensureUnlocked('journey'); setTimeout(() => ($('#btn-journey') || $('.journey'))?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300); return; }
  selectTab(c.action);
}

document.addEventListener('click', (e) => {
  const open = e.target.closest('[data-ask-open]');
  if (open) { openAsk(open.dataset.askOpen); return; }
  if (e.target.closest('[data-ask-back]')) { state.askOpen = null; selectTab('ask'); return; }
  const cta = e.target.closest('[data-ask-cta]');
  if (cta) runAskCta(cta.dataset.askCta);
});

/** 홈: 무엇이 궁금하세요? (질문 칩 4개) */
function askChipsHTML() {
  const top = concernAsk(state.profile.concern);
  const keys = [...new Set([top, 'tomorrow', 'love', 'saju'])].slice(0, 4);
  return `<div class="card ask-home"><h3>🔮 무엇이 궁금하세요?</h3>
    <div class="ask-chips">${keys.map((k) => { const m = ASK_MENU.find((x) => x.key === k); return `<button type="button" class="chip" data-ask-open="${k}">${m.icon} ${m.q}</button>`; }).join('')}
    <button type="button" class="chip more" data-tab-go="ask">전체 메뉴 →</button></div></div>`;
}
document.addEventListener('click', (e) => { const b = e.target.closest('[data-tab-go]'); if (b) { state.askOpen = null; selectTab(b.dataset.tabGo); } });

function renderAll() {
  renderSaju();
  renderToday();
  renderCharm(false);
  renderHero(false);
  renderEmoji();
  renderCompat();
  renderReport();
  renderFeng();
  renderAsk();
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

    ${gyeokCardHTML()}
    ${relationsCardHTML()}

    <div class="card">
      <h3>오행 스탯 <span class="tag">ELEMENT STATS</span></h3>
      <div class="split">
        <div class="radar">${radarSVG(s.elements)}</div>
        <div>
          <div class="bars">${bars}</div>
          <div class="stats">
            <div class="stat"><div class="k">신강/신약 (7단계)</div><div class="v">${s.strengthLevel || s.strength}</div><small class="muted">강약 점수 ${s.strengthScore ?? s.support}</small></div>
            <div class="stat"><div class="k">용신 (필요한 기운)</div><div class="v el-${s.yongsin}">${ELEMENT_KO[s.yongsin]}(${ELEMENT_HANJA[s.yongsin]})</div><small class="muted">${s.yongsinBasis || '억부'}</small></div>
            <div class="stat"><div class="k">가장 부족</div><div class="v el-${s.weakest}">${ELEMENT_KO[s.weakest]}(${ELEMENT_HANJA[s.weakest]})</div></div>
          </div>
        </div>
      </div>
      <p class="muted">${strengthText(s)}</p>
      <button class="primary" type="button" data-go="charm" style="width:100%">부족한 ${ELEMENT_KO[s.weakest]} 기운 부적 만들러 가기 →</button>
    </div>
    ${daewoonCardHTML()}
    ${expertCardHTML()}`;
  $('[data-panel="saju"]').insertAdjacentHTML('afterbegin', readingCardHTML());
  $$('[data-go]', $('[data-panel="saju"]')).forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); selectTab(b.dataset.go); }));
}

/** 글자들의 관계(v0.37): 원국 안의 합·충·형·파·해·원진 + 천간합의 합화 */
function relationsCardHTML() {
  const s = state.saju; const rels = natalRelations(s.pillars); const hwa = s.hwa || [];
  if (!rels.length && !hwa.length) return `<div class="card rel-card"><h3>글자들의 관계 <span class="tag">합·충·형·파·해</span></h3><p>원국 글자끼리 크게 묶이거나 부딪히는 관계가 없어요. 흐름이 고르고 담백한 사주예요.</p></div>`;
  return `<div class="card rel-card"><h3>글자들의 관계 <span class="tag">합·충·형·파·해</span></h3>
    <p class="muted" style="margin-top:0">사주 여덟 글자가 서로 어떻게 끌어당기고 부딪히는지 보여 드려요. 자리마다 뜻이 달라요(연주 = 어린 시절, 월주 = 일터, 일주 = 나·배우자, 시주 = 자녀·노후).</p>
    <ul class="rel-list">${rels.slice(0, 6).map((r) => `<li><p>${esc(r.text)}</p><small>💡 ${esc(r.act)}</small></li>`).join('')}</ul>
    ${hwa.length ? `<h5>천간합과 합화</h5>${hwa.map((h) => `<p class="rel-hwa">${esc(h.text)}</p>`).join('')}` : ''}
  </div>`;
}

/** 타고난 그릇(격국, v0.36): 근거 → 강점 → 일하는 방식 → 다듬을 점 → 강점 미션 하나 */
function gyeokCardHTML() {
  const g = analyzeGyeok(state.saju); const p = GYEOK_PROFILE[g.name];
  const mark = g.quality === 'good' ? '잘 짜인 그릇' : g.quality === 'care' ? '다듬으면 빛나는 그릇' : '기본 그릇';
  return `<div class="card gyeok-card">
    <h3>타고난 그릇 <span class="tag">격국 · ${g.name}</span></h3>
    <p class="gk-title"><b>「${p.title}」</b> <small>${mark}</small></p>
    <p class="muted gk-basis">${g.basisText}</p>
    <h5>타고난 강점</h5>
    <ul class="gk-list">${p.strengths.map((x) => `<li>${x}</li>`).join('')}</ul>
    <h5>잘 맞는 일하는 방식</h5><p>${p.work}</p>
    <h5>${g.quality === 'good' ? '그릇이 잘 짜인 이유' : '더 빛나게 하는 법'}</h5><p>${g.note}</p>
    <p class="gk-care">💡 ${p.care}</p>
    <p class="gk-mission">🌱 오늘의 강점 키우기: <b>${strengthMission(g, state.fortune.dateKey)}</b></p>
  </div>`;
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
  // v0.37: 지장간까지 센 오행 비율 + 득령·득지·통근으로 강약 7단계
  const F = { 득령: '태어난 달이 나를 도와요(득령)', 실령: '태어난 달은 나를 직접 돕지 않아요(실령)', 득지: '태어난 날의 지지가 나를 받쳐요(득지)', 실지: '태어난 날의 지지는 다른 기운이에요(실지)', 통근: '지지 속에 내 뿌리가 있어요(통근)', '뿌리 없음': '지지 속에 내 뿌리가 없어 바람을 타기 쉬워요', 득세: '천간에 도와주는 글자가 많아요(득세)', 실세: '' };
  const why = (s.strengthFactors || []).map((k) => F[k]).filter(Boolean).join(', ');
  const lv = s.strengthLevel || s.strength;
  const base = `${me} 기운과 이를 돕는 기운이 지장간까지 합쳐 ${s.support}%, ${why ? `${why}. ` : ''}강약 점수 ${s.strengthScore}점으로 7단계 중 「${lv}」입니다. ${s.strength === '신강' ? '힘을 밖으로 써 주는 기운이 균형을 잡아 줍니다.' : s.strength === '신약' ? '나를 북돋아 주는 기운이 힘이 됩니다.' : lv === '중화신약' ? '균형에 가깝지만 조금 여린 쪽이라, 나를 받쳐 주는 기운이 반가워요.' : lv === '중화신강' ? '균형에 가깝지만 조금 센 쪽이라, 힘을 써 줄 기운이 반가워요.' : '가장 부족한 기운을 채우면 더 좋아집니다.'}`;
  const el = (e) => `${ELEMENT_KO[e]}(${ELEMENT_HANJA[e]})`;
  const eul = (e) => ['을', '를', '를', '을', '를'][e]; // 목·금은 받침 있음
  const i = (e) => ['이', '가', '가', '이', '가'][e];
  const j = s.johu || { level: 'none', text: '' };
  const tail = s.yongsinBasis === '조후 우선'
    ? ` 강약으로만 보면 ${el(s.eokbuYongsin)}${i(s.eokbuYongsin)} 필요하지만, ${j.text} 그래서 계절을 맞추는 ${el(s.yongsin)}${eul(s.yongsin)} 용신으로, ${el(s.heesin)}${eul(s.heesin)} 희신(두 번째로 반가운 기운)으로 봅니다.`
    : s.yongsinBasis === '억부 + 조후 보완'
      ? ` 그래서 용신은 ${el(s.yongsin)}입니다. 또 ${j.text} 그래서 ${el(s.heesin)}${eul(s.heesin)} 희신으로 함께 챙기면 좋아요.`
      : s.yongsinBasis === '억부·조후 일치'
        ? ` 그래서 용신은 ${el(s.yongsin)}입니다. ${j.text} 강약과 계절 두 기준이 같은 기운을 가리켜 용신이 더 분명해요.`
        : ` 그래서 용신은 ${el(s.yongsin)}입니다. ${j.text || ''}`;
  const table = j.table && !String(j.text).includes(j.table) ? ` ${j.table}` : ''; // v0.35 천간 단위 처방
  return `${base}${tail}${table} (지장간 오행 · 강약 7단계 · 억부 + 궁통보감 조후표)`;
}

// ---------- 오늘의 운세 ----------

const md2 = (d) => `${d.month}/${d.day}`;

/** 오늘 점수가 어디서 왔는지: 대운 → 올해 → 이달 → 오늘 (모두 같은 엔진) */
function whyTodayHTML(f) {
  const L = f.layers; if (!L) return '';
  const godMod = TEN_GOD_MOD[f.tenGod][0];
  const relSum = f.scores.total - Math.round(L.day.score + godMod);
  const pl = (p) => `${STEMS[p.stem]}${BRANCHES[p.branch]}`;
  const row = (icon, label, val, note) => `<li><span>${icon} ${label}</span><b style="color:${scoreColor(val)}">${val}</b><small>${note}</small></li>`;
  return `<details class="why"><summary>왜 ${f.scores.total}점인가요? <small>근거 보기</small></summary>
    <ul class="why-layers">
      ${L.daewoon ? row('🏔️', `대운 ${pl(L.daewoon.pillar)} (${L.daewoon.startAge}~${L.daewoon.endAge}세)`, L.daewoon.score, `${L.daewoon.god} · ${explainParts(L.daewoon.parts)}`) : ''}
      ${row('📅', `올해 ${pl(L.year.pillar)}년`, L.year.score, `세운 ${L.year.base}${L.daewoon ? ` × 70% + 대운 × 30%` : ''} · ${L.year.god}`)}
      ${row('🌙', `이달 ${pl(L.month.pillar)}월 (${f.period.term} ${md2(f.period.start)}~${md2(f.period.end)})`, L.month.score, `월운 ${L.month.base} × 60% + 올해 × 40% · ${L.month.god}`)}
      ${row('☀️', `오늘 ${pl(L.day.pillar)}일`, L.day.score, `일진 ${L.day.base} × 70% + 이달 × 30%`)}
    </ul>
    <p class="why-calc">오늘 총운 <b>${f.scores.total}</b> = 오늘 층 ${L.day.score} ${godMod >= 0 ? '+' : '−'} 십신(${f.tenGod}) ${Math.abs(godMod)}${relSum ? ` ${relSum > 0 ? '+' : '−'} 원국과의 합·충 ${Math.abs(relSum)}` : ''}</p>
    <p class="why-calc">일진 근거: ${f.why}</p>
    <p class="muted" style="font-size:0.74rem;margin:6px 0 0">같은 생년월일·같은 날짜는 언제 봐도 같은 점수가 나와요. 무작위 요소는 쓰지 않습니다.</p>
  </details>`;
}

// ---------- 운세 풀이: 대운·올해·이달 (읽을거리) ----------

function readingFor(kind) {
  const s = state.saju; const f = state.fortune; const L = f.layers; const g = state.profile.gender;
  const d = timelineData();
  if (kind === 'daewoon') {
    if (!L.daewoon) return null;
    const age = f.date.year - s.input.year;
    const left = L.daewoon.endAge - age + 1;
    const next = d.dw.pillars.find((p) => p.startAge === L.daewoon.endAge + 1);
    return buildReading('daewoon', L.daewoon, {
      saju: s, concern: state.profile.concern, range: `${L.daewoon.startAge}~${L.daewoon.endAge}세 · ${s.input.year + L.daewoon.startAge}~${s.input.year + L.daewoon.endAge}년`,
      highlights: [`지금 ${age}세, 이 대운이 ${left}년 남았어요.`, next ? `다음 대운은 ${next.startAge}세부터 ${STEMS[next.stem]}${BRANCHES[next.branch]}(${pillarTheme(s, next).theme}) — 점수 ${next.score}점이에요.` : ''].filter(Boolean),
    });
  }
  if (kind === 'next') {
    const y = d.next; if (!y) return null;
    const diff = y.year.score - d.year.year.score;
    return buildReading('year', { ...y.year, god: tenGod(s.dayMaster, y.year.pillar.stem) }, {
      saju: s, concern: state.profile.concern, when: `${y.sajuYear}년은`, range: `${y.sajuYear}년 입춘(${y.months[0].start.month}/${y.months[0].start.day})부터 1년`,
      highlights: [`올해(${d.year.sajuYear}년 ${d.year.year.score}점)보다 ${diff === 0 ? '비슷한 흐름이에요' : `${Math.abs(diff)}점 ${diff > 0 ? '올라가요' : '내려가요'}`}.`, `좋은 달: ${y.best.map((m) => `${m.solarMonth}월(${m.score})`).join(', ')}`, `조심할 달: ${y.caution.map((m) => `${m.solarMonth}월(${m.score})`).join(', ')}`].filter(Boolean),
    });
  }
  if (kind === 'year') {
    const y = d.year;
    return buildReading('year', { ...L.year, god: tenGod(s.dayMaster, L.year.pillar.stem) }, {
      saju: s, concern: state.profile.concern, range: `${y.sajuYear}년 입춘(${md2(y.months[0].start)})부터`,
      highlights: [`좋은 달: ${y.best.map((m) => `${m.solarMonth}월(${m.score})`).join(', ')}`, `조심할 달: ${y.caution.map((m) => `${m.solarMonth}월(${m.score})`).join(', ')}`, L.daewoon ? `지금 대운(${STEMS[L.daewoon.pillar.stem]}${BRANCHES[L.daewoon.pillar.branch]})이 올해 점수의 30%를 함께 만들어요.` : ''].filter(Boolean),
    });
  }
  if (kind === 'nextmonth') { // 🔑 쪽지 도장 20개로 여는 다음 달 미리보기
    const per0 = d.month.period; const nd = per0.nextStart;
    const nm = monthDays(s, nd, g); const lay = layersAt(s, nd, g).month;
    return buildReading('month', lay, {
      saju: s, concern: state.profile.concern, when: '다음 달은', range: `${nm.period.term} ${md2(nm.period.start)} ~ ${md2(nm.period.end)} (미리보기)`,
      highlights: [`좋은 날: ${nm.best.map((x) => `${md2(x.date)}(${dowOf(x.date)}) ${x.score}점`).join(', ')}`, `조심할 날: ${nm.caution.map((x) => `${md2(x.date)}(${dowOf(x.date)})`).join(', ')}`, '쪽지 도장 20개로 연 미리보기예요. 좋은 날을 달력에 적어 두세요.'],
    });
  }
  const md = d.month; const per = md.period;
  return buildReading('month', L.month, {
    saju: s, concern: state.profile.concern, range: `${per.term} ${md2(per.start)} ~ ${md2(per.end)}`,
    highlights: [`좋은 날: ${md.best.map((x) => `${md2(x.date)}(${dowOf(x.date)}) ${x.score}점`).join(', ')}`, `조심할 날: ${md.caution.map((x) => `${md2(x.date)}(${dowOf(x.date)})`).join(', ')}`, `70점 이상인 날이 ${md.good}일 있어요. 다음 달(${per.nextTerm})은 ${md2(per.nextStart)}부터예요.`],
  });
}

function readingCardHTML() {
  const nx = timelineData().next;
  const kind = state.readKind === 'next' && !nx ? 'year' : (state.readKind || 'year');
  const kinds = [...(nx ? [['next', `🎁 ${nx.sajuYear}년`]] : []), ['daewoon', '🏔️ 대운'], ['year', '📅 올해'], ['month', '🌙 이달'], ...(kind === 'nextmonth' ? [['nextmonth', '🔑 다음 달']] : [])];
  const r = readingFor(kind);
  const info = characterInfo(state.saju, state.profile);
  const face = faceSVG(info, heroOptions().stage, r && r.score >= 55 ? 'smile' : 'fighting', 40);
  const body = !r ? '<p class="muted">대운은 성별에 따라 순행·역행이 달라져요. 정보 수정에서 성별을 넣으면 풀이가 열려요.</p>' : `
    <div class="rd-head">
      <div class="rd-pillar"><b>${STEMS[r.pillar.stem]}</b><b>${BRANCHES[r.pillar.branch]}</b></div>
      <div><h4>${r.god} · ${r.keyword}</h4><small>${r.range}</small></div>
      <em class="tl-score" style="color:${scoreColor(r.score)};border-color:${scoreColor(r.score)}">${r.score}</em>
    </div>
    ${r.intro.map((t) => `<p class="rd-p">${t}</p>`).join('')}
    <div class="rd-box why-box"><h5>🔍 왜 이런 흐름일까요</h5>${r.why.map((t) => `<p>${t}</p>`).join('')}</div>
    <div class="rd-two">
      <div class="rd-box good"><h5>🌟 살리면 좋은 점</h5><ul>${r.good.map((t) => `<li>${t}</li>`).join('')}</ul></div>
      <div class="rd-box watch"><h5>🌧️ 미리 챙길 점</h5><ul>${r.watch.map((t) => `<li>${t}</li>`).join('')}</ul></div>
    </div>
    ${r.focusLine ? `<div class="rd-box focus"><h5>🎯 내 고민(${info.concern.label})에는</h5><p>${r.focusLine}</p></div>` : ''}
    <div class="rd-fields">${Object.entries(r.fields).map(([k, t]) => `<div class="rd-field ${k === r.focus ? 'mine' : ''}"><b>${FIELD_LABEL[k]}</b><p>${t}</p></div>`).join('')}</div>
    <div class="rd-box when"><h5>📌 실제 흐름</h5><ul>${r.highlights.map((t) => `<li>${t}</li>`).join('')}</ul></div>
    ${monthsTableHTML(kind)}
    <div class="rd-box tips"><h5>✅ 이렇게 해 보세요</h5><ol>${r.tips.map((t) => `<li>${t}</li>`).join('')}</ol></div>
    <div class="ask-guardian"><div class="av">${face}</div><p>${esc(closingLine(r.kind, r.score, personalityOf(zIdx()).key === 'rooster'))}</p></div>
    ${saveBtnHTML('reading', kind)}
    <p class="muted" style="font-size:0.72rem;margin:6px 0 0">풀이는 정통 계산(십신·용신·합충)을 바탕으로 한 참고용 해석이에요. 중요한 결정은 여러 상황을 함께 살펴 주세요.</p>`;
  return `<div class="card reading" id="reading-card">
    <h3>📖 나의 운세 풀이</h3>
    <div class="gal-tabs rd-tabs">${kinds.map(([k, l]) => `<button type="button" data-read="${k}" aria-pressed="${k === kind}">${l}</button>`).join('')}</div>
    ${body}
  </div>`;
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-read]'); if (!b) return;
  state.readKind = b.dataset.read;
  const el = $('#reading-card'); if (!el) return;
  const tmp = document.createElement('div'); tmp.innerHTML = readingCardHTML(); el.replaceWith(tmp.firstElementChild);
});

/** 타임라인 카드에서 풀이로 바로 가기 */
function openReading(kind) {
  state.readKind = kind; selectTab('saju');
  const el = $('#reading-card');
  if (el) { const tmp = document.createElement('div'); tmp.innerHTML = readingCardHTML(); el.replaceWith(tmp.firstElementChild); }
  setTimeout(() => $('#reading-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
}

// ---------- 운의 타임라인 (v0.20) ----------
// 오늘 → 이번 주 → 이달 → 올해 → 대운 → 타고난 나. 모든 숫자는 period.js 한 엔진에서 나온다.
const TL_ORDER = ['today', 'week', 'month', 'year', 'daewoon', 'natal'];
const TL_META = {
  today: { icon: '☀️', label: '오늘' }, week: { icon: '🗓️', label: '이번 주' }, month: { icon: '🌙', label: '이달' },
  year: { icon: '📅', label: '올해' }, daewoon: { icon: '🏔️', label: '대운 (10년)' }, natal: { icon: '🌱', label: '타고난 나' },
};
const DOW_KO = ['월', '화', '수', '목', '금', '토', '일'];
const dowOf = (d) => '일월화수목금토'[new Date(Date.UTC(d.year, d.month - 1, d.day)).getUTCDay()];
const plKo = (p) => `${STEMS[p.stem]}${BRANCHES[p.branch]}(${STEMS_KO[p.stem]}${BRANCHES_KO[p.branch]})`;
const toneWord = (v) => (v >= 80 ? '아주 좋은' : v >= 60 ? '좋은 편인' : v >= 40 ? '무난한' : '쉬어 가는');

/** 타임라인에 필요한 값을 한 번에 계산 (날짜·사람이 같으면 재사용) */
function timelineData() {
  const f = state.fortune; const s = state.saju; const g = state.profile.gender;
  const key = `${f.dateKey}|${JSON.stringify(s.input)}|${g}`;
  if (state.tl?.key === key) return state.tl;
  const week = weekOf(s, f.date, g);
  const month = monthDays(s, f.date, g);
  const sy = sajuYearOf(f.date);
  const year = yearOf(s, sy, g);
  const dw = g ? computeDaewoon(s, g) : null;
  const next = showNextYear(f.date, sy) ? yearOf(s, sy + 1, g) : null;
  state.tl = { key, week, month, year, dw, next };
  return state.tl;
}

// ---------- 홈 길잡이 (v0.21): 처음엔 내년·오늘·올해만, 나머지는 퀘스트로 하나씩 ----------
const loadGuide = () => ({ ...emptyGuide(), ...load(GUIDE_KEY, {}) });
const guideCtx = () => ({ showNext: !!timelineData().next });
const unlocked = (sec) => isUnlocked(loadGuide(), sec);

/** 퀘스트 완료 → 저장·경험치. 새로 끝냈으면 true */
function finishGuide(key) {
  const r = completeGuideStep(loadGuide(), key);
  if (!r.changed) return false;
  save(GUIDE_KEY, r.guide);
  const nx = nextStep(r.guide, guideCtx());
  grow((g) => addExp(g, 3), `🧭 길잡이 완료!${nx ? ` 다음: ${nx.title(timelineData().next?.sajuYear)}` : ' 모든 기능이 열렸어요'}`);
  return true;
}

/** 다른 화면에서 잠긴 구역을 부르면 그 자리에서 열어 준다 (막다른 길 없음) */
function ensureUnlocked(sec) {
  if (unlocked(sec)) return false;
  const k = stepFor(sec); if (!k) return false;
  finishGuide(k); renderToday();
  return true;
}

/** 홈에 보이는 타임라인 순서 (잠긴 층은 뺌) */
// 첫 화면 개편(2026-11-03): 흐름(이번 주·이달·올해·대운·타고난 나)은 「운세 보기」 탭으로. 오늘은 홈의 한 문단
const FLOW_KEYS = ['week', 'month', 'year', 'daewoon', 'natal'];
function tlVisible() { return FLOW_KEYS; }

function tlCard(k, summary, body) {
  const open = (state.tlOpen || new Set(['week'])).has(k);
  const m = TL_META[k];
  const vis = tlVisible().filter((x) => x !== 'next');
  const i = vis.indexOf(k);
  const nav = i < 0 ? '' : `<div class="tl-nav">${i > 0 ? `<button type="button" class="ghost" data-tl-go="${vis[i - 1]}">▲ ${TL_META[vis[i - 1]].label}</button>` : '<span></span>'}${i < vis.length - 1 ? `<button type="button" class="ghost" data-tl-go="${vis[i + 1]}">더 넓게 보기: ${TL_META[vis[i + 1]].label} ▼</button>` : ''}</div>`;
  return `<section class="tl-card ${k === 'next' ? 'tl-next' : k !== 'today' ? 'compact' : ''} ${open ? 'open' : ''}" data-tl="${k}">
    <button type="button" class="tl-head" data-tl-toggle="${k}" aria-expanded="${open}">
      <span class="tl-ic">${m.icon}</span><span class="tl-sum"><b>${m.label}</b>${summary}</span><span class="tl-caret">${open ? '▴' : '▾'}</span>
    </button>
    ${open ? `<div class="tl-body">${body}${nav}</div>` : ''}
  </section>`;
}

const scoreChip = (v, label = '') => `<em class="tl-score" style="color:${scoreColor(v)};border-color:${scoreColor(v)}">${label}${v}</em>`;
const stepBtn = (label, action) => `<button class="primary tl-step" type="button" data-tl-step="${action}">${label} →</button>`;

function catBars(scores) {
  return `<div class="bars tl-bars">${CATEGORIES.slice(1).map((c) => `<div class="bar"><span>${c.icon} ${c.label}</span><div class="track"><div class="fill" style="width:${scores[c.key]}%;background:${scoreColor(scores[c.key])};color:${scoreColor(scores[c.key])}"></div></div><span class="num">${scores[c.key]}</span></div>`).join('')}</div>`;
}

function tlToday() {
  const f = state.fortune;
  const weak = ['wealth', 'love', 'career', 'health', 'social'].reduce((a, b) => (f.scores[b] < f.scores[a] ? b : a));
  const weakLabel = CATEGORIES.find((c) => c.key === weak).label;
  const sum = `<small>${f.date.month}/${f.date.day}(${dowOf(f.date)}) · ${f.info.title}</small>${scoreChip(f.scores.total)}`;
  const body = `
    ${moodRowHTML()}
    <p class="tl-lead"><b>${toneWord(f.scores.total)} 하루예요.</b> ${f.info.desc}</p>
    ${catBars(f.scores)}
    ${umbrellaHTML()}
    <div class="tl-kit"><span>🎨 ${f.luck.color}</span><span>🔢 ${f.luck.number}</span><span>🧭 ${f.luck.direction}</span><span>⏰ ${f.luck.time.split(' (')[0]}</span></div>
    <p class="tl-do">✅ ${f.info.lucky} &nbsp;·&nbsp; ⚠️ ${f.info.caution}</p>
    ${whyTodayHTML(f)}
    ${bonusLineHTML(f)}
    ${stepBtn(`가장 약한 ${weakLabel}운을 채우는 부적 받기`, 'charm-today')}`;
  return tlCard('today', sum, body);
}

function tlWeek(d) {
  const w = d.week;
  const sum = `<small>평균 ${w.avg}점 · 가장 좋은 날 ${dowOf(w.best.date)}요일</small>${scoreChip(w.avg)}`;
  const max = 100;
  const bars = w.days.map((x, i) => `<div class="wk-col ${x.isToday ? 'now' : ''}"><b style="color:${scoreColor(x.score)}">${x.score}</b><i style="height:${Math.max(8, (x.score / max) * 70)}px;background:${scoreColor(x.score)}"></i><span>${DOW_KO[i]}</span><small>${x.date.month}/${x.date.day}</small></div>`).join('');
  const lines = w.days.map((x, i) => `<li class="${x.isToday ? 'now' : ''}"><span>${DOW_KO[i]} ${x.date.month}/${x.date.day}</span><b style="color:${scoreColor(x.score)}">${x.score}</b><small>${TEN_GOD_INFO[x.god].title}</small></li>`).join('');
  const bestCat = (cat) => w.days.reduce((a, b) => (b.scores[cat] > a.scores[cat] ? b : a));
  const body = `
    <div class="wk-bars">${bars}</div>
    <p class="tl-lead">🌟 <b>${w.best.date.month}/${w.best.date.day}(${dowOf(w.best.date)})</b>이 이번 주 가장 좋은 날 — ${TEN_GOD_INFO[w.best.god].title}. ⚠️ <b>${w.worst.date.month}/${w.worst.date.day}(${dowOf(w.worst.date)})</b>은 ${TEN_GOD_INFO[w.worst.god].caution}에 조심하세요.</p>
    <div class="tl-kit">${['wealth', 'love', 'career'].map((c) => { const b = bestCat(c); return `<span>${CATEGORIES.find((x) => x.key === c).icon} ${CATEGORIES.find((x) => x.key === c).label} 최고: ${dowOf(b.date)}요일 ${b.scores[c]}</span>`; }).join('')}</div>
    <details class="why"><summary>요일별 한 줄 보기</summary><ul class="wk-lines">${lines}</ul></details>
    ${stepBtn(`${dowOf(w.best.date)}요일을 어떻게 쓸지 수호신과 계획하기`, 'chat-week')}
    ${wealthWeekHTML(w)}`;
  return tlCard('week', sum, body);
}

/** 이번 주 재물 흐름 (v0.23 작은 실험): 재물 점수 7일 · 가장 좋은 날 · 재미로 보는 행운 숫자(만 19세 이상) */
function wealthWeekHTML(week) {
  const i = state.saju.input;
  const ww = weekWealth(week, { birth: { year: i.year, month: i.month, day: i.day }, today: state.fortune.date, yongsin: state.saju.yongsin, seed: `${i.year}-${i.month}-${i.day}-${i.timeKnown ? i.hour : 'x'}` });
  const cols = ww.days.map((x, k) => `<div class="ww-col ${x.isToday ? 'now' : ''} ${x === ww.best ? 'best' : ''}"><i style="height:${Math.max(6, x.score * 0.5)}px;background:${scoreColor(x.score)}"></i><span>${DOW_KO[k]}</span></div>`).join('');
  const b = ww.best.date;
  return `<div class="ww">
    <h5>💰 이번 주 재물 흐름 <small>평균 ${ww.avg}</small></h5>
    <div class="ww-bars">${cols}</div>
    <p>재물운이 가장 좋은 날은 <b>${b.month}/${b.day}(${dowOf(b)}) ${ww.best.score}점</b>이에요. ${ww.tip}</p>
    ${ww.eligible ? `<details class="ww-num"><summary>🎲 재미로 보는 행운 숫자</summary>
      <div class="ww-balls">${ww.numbers.map((n) => `<span>${n}</span>`).join('')}</div>
      <p class="muted">${b.month}/${b.day} 일진과 필요한 기운(${ELEMENT_KO[state.saju.yongsin]})의 수로 만든 숫자예요. 다시 봐도 같은 숫자가 나와요.</p>
      ${SAFETY_LINES.map((l) => `<p class="ww-safe">${l}</p>`).join('')}
    </details>` : ''}
    ${stepBtn('이번 주 재물운을 채우는 부적 받기', 'charm-wealth')}
  </div>`;
}

function tlMonth(d) {
  const f = state.fortune; const L = f.layers; const md = d.month; const per = md.period;
  const th = pillarTheme(state.saju, L.month.pillar);
  const cats = categoryScores(L.month.score, L.month.god);
  const sum = `<small>${per.term} ${md2(per.start)}~${md2(per.end)} · ${th.theme}</small>${scoreChip(L.month.score)}`;
  const body = `
    <p class="tl-lead"><b>${plKo(L.month.pillar)}월 · ${th.god}</b> — ${th.theme}의 기운이 흐르는 달이에요. 다음 달(${per.nextTerm})은 ${md2(per.nextStart)}부터 시작돼요.</p>
    ${catBars(cats)}
    <div class="tl-kit"><span>🌟 좋은 날 ${md.best.map((x) => `${md2(x.date)}(${x.score})`).join(' · ')}</span><span>⚠️ 조심할 날 ${md.caution.map((x) => `${md2(x.date)}(${x.score})`).join(' · ')}</span><span>70점 이상 ${md.good}일 / ${md.days.length}일</span></div>
    <p class="why-calc">이달 ${L.month.score} = 월운 ${L.month.base} × 60% + 올해 ${L.year.score} × 40% · 근거: ${explainParts(L.month.parts)}</p>
    <button class="ghost tl-read" type="button" data-tl-step="read-month">📖 이달 운세 풀이 자세히 읽기</button>
    ${stepBtn(`이달 부족한 ${ELEMENT_KO[state.saju.yongsin]} 기운 채우기`, 'charm-month')}`;
  return tlCard('month', sum, body);
}

function tlYear(d) {
  const y = d.year; const th = pillarTheme(state.saju, y.year.pillar);
  const cur = state.fortune.period.solarMonth;
  const h1 = Math.round(y.months.slice(0, 6).reduce((a, b) => a + b.score, 0) / 6);
  const h2 = Math.round(y.months.slice(6).reduce((a, b) => a + b.score, 0) / 6);
  const sum = `<small>${y.sajuYear} ${plKo(y.year.pillar)}년 · ${th.theme}</small>${scoreChip(y.year.score)}`;
  const mbars = y.months.map((m) => `<div class="yr-col ${m.solarMonth === cur ? 'now' : ''}" title="${m.term} ${md2(m.start)}~"><i style="height:${Math.max(6, m.score * 0.6)}px;background:${scoreColor(m.score)}"></i><span>${m.solarMonth}</span></div>`).join('');
  const body = `
    <p class="tl-lead"><b>올해는 「${th.god} · ${th.theme}」의 해</b>예요. ${y.year.score >= 60 ? '흐름을 타고 넓혀 가기 좋은 해입니다.' : y.year.score >= 45 ? '무리하지 않고 다지는 만큼 쌓이는 해입니다.' : '속도를 줄이고 내실을 챙기면 다음 흐름이 단단해지는 해입니다.'}</p>
    <div class="yr-bars">${mbars}</div>
    <p class="muted" style="font-size:0.76rem;margin:2px 0 8px">입춘(${md2(y.months[0].start)})부터 12절기월 · 숫자는 양력 기준 달</p>
    <div class="tl-kit"><span>상반기 ${h1} · 하반기 ${h2}</span><span>🌟 좋은 달 ${y.best.map((m) => `${m.solarMonth}월`).join(' · ')}</span><span>⚠️ 조심할 달 ${y.caution.map((m) => `${m.solarMonth}월`).join(' · ')}</span></div>
    <p class="why-calc">올해 ${y.year.score} = 세운 ${y.year.base}${y.daewoon ? ` × 70% + 대운 ${y.daewoon.score} × 30%` : ''} · 근거: ${explainParts(y.year.parts)}</p>
    <button class="ghost tl-read" type="button" data-tl-step="read-year">📖 올해 운세 풀이 자세히 읽기</button>
    <div class="tl-two">${stepBtn('올해 고민, 30일 해결 여정으로 풀기', 'journey')}<button class="ghost" type="button" data-tl-step="report">월별 리포트 자세히</button></div>`;
  return tlCard('year', sum, body);
}

function tlDaewoon(d) {
  const s = state.saju;
  if (!d.dw) return tlCard('daewoon', '<small>성별을 입력하면 대운을 계산해요</small>', '<p class="muted">대운은 성별에 따라 순행·역행이 달라져요. 정보 수정에서 성별을 넣어 주세요.</p>');
  const age = state.fortune.date.year - s.input.year;
  const cur = daewoonAt(d.dw, age);
  const nextStart = cur ? cur.endAge + 1 : d.dw.startAge;
  const sum = cur ? `<small>${plKo(cur)} · ${cur.startAge}~${cur.endAge}세 · 다음 대운까지 ${nextStart - age}년</small>${scoreChip(cur.score)}` : `<small>첫 대운은 ${d.dw.startAge}세부터</small>`;
  const chips = d.dw.pillars.map((p) => `<span class="dw-chip ${cur && p.startAge === cur.startAge ? 'now' : ''}"><b>${p.startAge}세</b>${STEMS[p.stem]}${BRANCHES[p.branch]}<i style="color:${scoreColor(p.score)}">${p.score}</i></span>`).join('');
  const th = cur ? pillarTheme(s, cur) : null;
  const body = `
    ${cur ? `<p class="tl-lead"><b>지금은 「${th.god} · ${th.theme}」의 10년</b>이에요. ${daewoonComment(s, cur, 0)}</p>` : '<p class="tl-lead">아직 첫 대운이 시작되기 전이에요. 타고난 원국의 흐름대로 자라는 시기입니다.</p>'}
    <div class="dw-chips">${chips}</div>
    <p class="why-calc">${d.dw.forward ? '순행' : '역행'} 대운 · ${d.dw.startAge}세 시작 (태어난 날부터 절기까지 ${d.dw.days}일 ÷ 3)${cur ? ` · 근거: ${explainParts(layersAt(s, state.fortune.date, state.profile.gender).daewoon.parts)}` : ''}</p>
    <button class="ghost tl-read" type="button" data-tl-step="read-daewoon">📖 대운 풀이 자세히 읽기</button>
    ${stepBtn('앞으로 5년 흐름 보기', 'five')}`;
  return tlCard('daewoon', sum, body);
}

function tlNatal() {
  const s = state.saju; const prof = DAY_MASTER_PROFILE[s.dayMaster];
  const info = characterInfo(s, state.profile);
  const sum = `<small>${prof.name} · ${prof.image} · ${s.strength}</small>`;
  const els = s.elements.map((v, e) => `<div class="bar"><span>${ELEMENT_HANJA[e]} ${ELEMENT_KO[e]}</span><div class="track"><div class="fill" style="width:${v}%;background:${EL_COLORS[e]};color:${EL_COLORS[e]}"></div></div><span class="num">${v}</span></div>`).join('');
  const body = `
    <p class="tl-lead"><b>${prof.image} 같은 사람</b> — ${prof.text}</p>
    <div class="bars tl-bars">${els}</div>
    <p class="tl-do">💡 필요한 기운(용신): <b>${ELEMENT_HANJA[s.yongsin]} ${ELEMENT_KO[s.yongsin]}</b> · 가장 부족한 기운: ${ELEMENT_HANJA[s.weakest]} ${ELEMENT_KO[s.weakest]} · 띠: ${info.zodiac.name}띠</p>
    <div class="tl-two">${stepBtn(`내 ${info.zodiac.name} 수호신 만나기`, 'hero')}<button class="ghost" type="button" data-tl-step="saju">사주 원국 자세히</button></div>`;
  return tlCard('natal', sum, body);
}

/** 내년 운세 (9월 이후·입춘 전에만, v0.28 신년운세 구성): 총평·키워드 → 분야별 별 → 사계절 → 꼭 기억할 달 → 행운 키트 → 다짐 */
function tlNext(d) {
  const y = d.next; const c = yearCard(y, d.year, state.saju);
  const diffTxt = Math.abs(c.diff) <= 2 ? '올해와 비슷' : `올해보다 ${c.diff > 0 ? '▲' : '▼'}${Math.abs(c.diff)}`;
  const isOpen = (state.tlOpen || new Set(['today'])).has('next');
  const sum = `<span class="ny-title">「${c.title}」</span><small>${plKo(y.year.pillar)}년 · ${diffTxt}<span class="ny-tags">${c.tags.map((t) => `#${t}`).join(' ')}</span>${isOpen ? '' : '<i class="tl-next-hint">👆 눌러서 분야별 운·좋은 달 보기</i>'}</small>${scoreChip(y.year.score)}`;
  const pledge = load(PLEDGE_KEY, {})[c.year];
  const st = '★★★★★';
  const body = `
    <p class="tl-lead">${c.summary}</p>
    <div class="ny-sec"><h5>분야별 ${c.year}년</h5>
      <ul class="ny-fields">${c.fields.map((f) => `<li><span>${f.icon} ${f.label}</span><b class="ny-stars" aria-label="별 ${f.stars}개">${st.slice(0, f.stars)}<i>${st.slice(f.stars)}</i></b><small>${f.line}</small></li>`).join('')}</ul></div>
    <div class="ny-sec"><h5>계절별 흐름</h5>
      <div class="ny-seasons">${c.seasons.map((x) => `<div class="ny-season ${x.tone}"><b>${x.icon} ${x.label}</b><small>${x.months.join('·')}월</small><em>${x.mark} ${x.word}</em><p>${x.advice}</p></div>`).join('')}</div></div>
    <div class="ny-sec"><h5>꼭 기억할 달</h5>
      <ul class="ny-months">${c.keyMonths.map((m) => `<li class="${m.kind}"><span>${m.kind === 'good' ? '🌟' : '⚠️'} <b>${m.month}월</b><small>${m.range}</small></span><p>${m.line}</p></li>`).join('')}</ul></div>
    <div class="ny-sec"><h5>${c.year} 행운 키트</h5>
      <div class="tl-kit"><span><i class="ny-dot" style="background:${c.luck.hex}"></i>${c.luck.color}</span><span>🔢 ${c.luck.numbers.join(' · ')}</span><span>🧭 ${c.luck.direction}</span><span>🤝 힘이 되는 띠 ${c.luck.zodiac.join(' · ')}</span><span>🎁 ${c.luck.item}</span></div></div>
    <div class="ny-sec ny-pledge"><h5>✍️ ${c.year} 다짐 한 줄</h5>
      ${pledge ? `<p class="ny-pledged">「${esc(pledge.text)}」 <button type="button" class="linkish" data-pledge-edit>고치기</button></p><small class="muted">${c.year}년 12월에 수호신이 얼마나 이뤘는지 물어볼게요.</small>`
        : `<form data-pledge="${c.year}" class="ny-pledge-form"><input name="text" maxlength="${PLEDGE_MAX}" placeholder="예: 매일 30분 걷기 · 자격증 하나 따기" aria-label="${c.year} 다짐"><button class="primary" type="submit">저장</button></form><small class="muted">기록함에 저장되고, ${c.year}년 12월에 돌아보기 미션으로 다시 만나요.</small>`}</div>
    <p class="why-calc">${c.year}년 ${y.year.score} = 세운 ${y.year.base}${y.daewoon ? ` × 70% + 대운 ${y.daewoon.score} × 30%` : ''} · 분야 별은 같은 점수의 구간(★5 75+ · ★4 65+ · ★3 55+) · 근거: ${explainParts(y.year.parts)}</p>
    <button class="ghost tl-read" type="button" data-tl-step="read-next">📖 12달 자세히 보기 · ${c.year}년 운세 풀이</button>`;
  TL_META.next = { icon: '🎁', label: `${y.sajuYear}년 운세` };
  return tlCard('next', sum, body);
}

document.addEventListener('submit', (e) => {
  const f = e.target.closest('[data-pledge]'); if (!f) return;
  e.preventDefault();
  const year = Number(f.dataset.pledge); const text = f.text.value;
  const r = savePledge(load(PLEDGE_KEY, {}), year, text);
  if (!r.ok) { toast('다짐을 한 줄 적어 주세요'); return; }
  save(PLEDGE_KEY, r.store);
  save(RECORDS_KEY, addItem(loadRecords(), { kind: 'pledge', key: String(year), dateKey: state.fortune.dateKey, title: `✍️ ${year}년 다짐`, summary: r.store[year].text, lines: [`${year}년 12월에 돌아보기 미션으로 다시 물어볼게요.`] }).rec);
  state.tlOpen = new Set(['next']); refreshTimeline('next');
  toast(`✍️ ${year}년 다짐을 기록함에 저장했어요`);
});
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-pledge-edit]')) {
    const y = timelineData().next?.sajuYear; const st = load(PLEDGE_KEY, {}); const old = st[y]?.text || '';
    delete st[y]; save(PLEDGE_KEY, st); refreshTimeline('next');
    setTimeout(() => { const i = $('[data-pledge] input'); if (i) { i.value = old; i.focus(); } }, 30);
    return;
  }
  const rv = e.target.closest('[data-pledge-rv]');
  if (rv) {
    save(PLEDGE_KEY, reviewPledge(load(PLEDGE_KEY, {}), Number(rv.dataset.year), rv.dataset.pledgeRv));
    dmDone('check');
    grow((g) => addExp(g, 3), rv.dataset.pledgeRv === 'yes' ? '✍️ 다짐을 이뤘군요! 정말 멋져요' : '✍️ 돌아본 것만으로도 한 걸음이에요. 내년 다짐도 함께 세워요');
    renderToday();
  }
});

/** 운세 풀이(내년·올해)의 12달 표: 절기월 기간 · 점수 · 그달 기운 */
function monthsTableHTML(kind) {
  const d = timelineData(); const y = kind === 'next' ? d.next : kind === 'year' ? d.year : null;
  if (!y) return '';
  const km = yearCard(y, d.year, state.saju).keyMonths; // 카드의 「꼭 기억할 달」과 같은 표시
  const top = new Set(km.filter((m) => m.kind === 'good').map((m) => m.month)); const low = new Set(km.filter((m) => m.kind === 'caution').map((m) => m.month));
  return `<div class="rd-box months"><h5>🗓️ 12달 자세히 <small>입춘부터 절기월 · 기간은 양력</small></h5><ul class="rd-months">${y.months.map((m, i) => `<li class="${top.has(m.solarMonth) ? 'good' : low.has(m.solarMonth) ? 'caution' : ''}"><span>${m.solarMonth}월 <small>${monthRange(y.months, i)}</small></span><b style="color:${scoreColor(m.score)}">${m.score}</b><small>${GOD_READING[m.god].keyword}${top.has(m.solarMonth) ? ' 🌟' : low.has(m.solarMonth) ? ' ⚠️' : ''}</small></li>`).join('')}</ul></div>`;
}

function timelineHTML() {
  const d = timelineData();
  const R = { next: () => tlNext(d), today: tlToday, week: () => tlWeek(d), month: () => tlMonth(d), year: () => tlYear(d), daewoon: () => tlDaewoon(d), natal: tlNatal };
  const vis = tlVisible();
  return `<div class="timeline" id="timeline">
    ${vis.map((k) => R[k]()).join('')}
    <p class="tl-hint">카드를 누르면 펼쳐져요 · 모든 점수는 같은 계산으로 이어져요</p>
  </div>`;
}

/** 「오늘의 미션 3가지」(v0.27): 이달 운세에서 이어지는 하루 퀘스트 — 이달의 실천 · 돌아보기 · 새 기능 열기 */
function missionCardHTML() {
  const f = state.fortune; const d = timelineData(); const per = d.month.period;
  const g = loadGuide(); const gctx = guideCtx();
  const ms = buildMissions({
    dateKey: f.dateKey,
    month: { term: per.term, start: per.start, end: per.end, theme: pillarTheme(state.saju, f.layers.month.pillar).theme, best: d.month.best },
    today: { mission: todayUmbrella().pick.text, umbrella: todayUmbrella().u, score: f.scores.total },
    pending: pendingFeedback(loadRecords(), f.date), pledgeReview: pledgeReviewDue(load(PLEDGE_KEY, {}), f.date),
    discovery: g.all ? null : nextStep(g, gctx), steps: GUIDE_STEPS, nextYear: d.next?.sajuYear, progress: guideProgress(g, gctx),
    actDone: !!load(MISSION_KEY, {})[f.dateKey] || !!todayUmbrella().h.done, state: load(DM_KEY, {})[f.dateKey],
  });
  const n = ms.filter((m) => m.done).length;
  const row = (m, i) => {
    let act = '';
    if (!m.done) {
      if (m.action.type === 'pledge') act = `<div class="yday-btns">${[['yes', '🎯 이뤘어요'], ['half', '🤔 절반쯤'], ['no', '🌱 다음 해에']].map(([k, l]) => `<button type="button" class="ghost" data-pledge-rv="${k}" data-year="${m.action.year}">${l}</button>`).join('')}</div>`;
      else if (m.action.type === 'feedback') act = `<div class="yday-btns">${Object.entries(FEEDBACK).map(([k, v]) => `<button type="button" class="ghost" data-fb="${k}" data-fb-day="${m.action.dateKey}">${v.icon} ${v.label}</button>`).join('')}</div>
        <input type="text" class="yday-memo" maxlength="${MEMO_MAX}" placeholder="한 줄 메모 (선택)" aria-label="어제 메모"><button type="button" class="linkish" data-fb-skip="${m.action.dateKey}">기억이 안 나요 · 건너뛰기</button>`;
      else act = `<button type="button" class="${i === ms.findIndex((x) => !x.done) ? 'primary' : 'ghost'} dm-go" data-dm="${m.key}">${m.btn} →</button>`;
    }
    return `<li class="dm-item ${m.done ? 'done' : ''}" ${m.action.type === 'feedback' && !m.done ? 'id="yday"' : ''}>
      <span class="dm-num">${m.done ? '✓' : i + 1}</span>
      <div class="dm-body"><small>${m.icon} ${m.tag}</small><b>${esc(m.title)}</b>${m.done ? '' : `<p>${m.desc}</p>${act}`}</div>
    </li>`;
  };
  let foot = '';
  if (n === 3) {
    const t = new Date(Date.UTC(f.date.year, f.date.month - 1, f.date.day + 1));
    const tm = computeFortune(state.saju, { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() }, { gender: state.profile.gender });
    foot = `<div class="dm-done"><b>🎉 오늘의 미션 완료!</b><p>내일 미리보기 · ${tm.date.month}/${tm.date.day}(${dowOf(tm.date)}) <b style="color:${scoreColor(tm.scores.total)}">${tm.scores.total}점</b> — ${tm.info.title}. 내일도 세 가지가 기다리고 있어요.</p></div>`;
  }
  return `<div class="card dmission" id="dmission">
    <div class="dm-top"><b>✅ 오늘의 미션</b><small>${n} / 3</small></div>
    <div class="guide-track"><i style="width:${Math.round((n / 3) * 100)}%"></i></div>
    <ol class="dm-list">${ms.map(row).join('')}</ol>
    ${foot}
    <div class="guide-foot"><small>${n === 3 ? '내일 새 미션이 열려요' : `세 가지를 모두 하면 +${DM_BONUS_EXP} EXP와 내일 미리보기가 열려요`}</small><button type="button" class="linkish" data-guide-all="${g.all ? 0 : 1}">${g.all ? '처음처럼 간단히 보기' : '모든 기능 한 번에 펼치기'}</button></div>
  </div>`;
}

/** 미션 ②·③ 완료 저장 → 셋 다 했으면 보너스 */
function dmDone(key, openKey) {
  const dk = state.fortune.dateKey;
  const r = dmMarkDone(load(DM_KEY, {}), dk, key, openKey);
  if (r.changed) save(DM_KEY, r.store);
  checkDayBonus();
}
function checkDayBonus() {
  const dk = state.fortune.dateKey;
  const st = load(DM_KEY, {})[dk] || {};
  if (!(load(MISSION_KEY, {})[dk] && st.check && st.open)) return;
  const b = dmClaimBonus(load(DM_KEY, {}), dk);
  if (b.changed) { save(DM_KEY, b.store); setTimeout(() => grow((gg) => addExp(gg, DM_BONUS_EXP), '🎉 오늘의 미션 3가지 완료! 내일 미리보기가 열렸어요'), 900); }
}

/** 미션 ① 이달의 실천 = 오늘의 액땜 미션 (완료하면 액막이 부적 정화 + 용신 충전) */
function completeActMission() {
  const f = state.fortune; const m = load(MISSION_KEY, {});
  // v0.30: 미션 ① = 오늘의 우산. 어디서 완료하든 우산 기록도 함께 남긴다
  const { pick, h } = todayUmbrella();
  if (!h.done) { const r = completeHabit(load(HABIT_KEY, {}), f.dateKey, pick); if (r.changed) save(HABIT_KEY, r.store); }
  if (m[f.dateKey]) return;
  m[f.dateKey] = true; save(MISSION_KEY, m);
  grow((g) => complete(g, f.dateKey, 'mission', qBonus('mission')), `${say('missionDone')} (액막이 부적 등급 +1)`);
  setTimeout(() => charge(state.saju.yongsin, 4, 'mission', '🧧 실천 완료'), 2400);
  renderCharm(false);
  checkDayBonus();
}

// ---------- 마음 날씨 + 오늘의 우산 (v0.30, habit.js): 날씨(운세) → 우산(5분 안에 할 행동 하나) → 확인·보상 ----------

/** 오늘의 우산과 저장 상태. pick = 지금 고른(또는 이미 한) 미션 */
function todayUmbrella() {
  const f = state.fortune; const s = state.saju;
  const h = habitDay(load(HABIT_KEY, {}), f.dateKey);
  const u = pickUmbrella({ dateKey: f.dateKey, scores: f.scores, yongsin: s.yongsin, heesin: s.heesin, mood: h.before ?? null });
  const pick = (h.done && missionById(h.id)) || u.options[(h.level || 1) - 1];
  return { u, h, pick };
}

function moodRowHTML() {
  const f = state.fortune; const st = load(HABIT_KEY, {}); const h = habitDay(st, f.dateKey);
  const care = needsCare(st, f.dateKey)
    ? '<p class="mood-care">요즘 마음에 천둥이 자주 치네요. 혼자 견디지 않아도 괜찮아요. 이야기 나눌 곳이 있어요: ☎ <b>109</b>(24시간 상담) · ☎ <b>1577-0199</b>(정신건강 상담)</p>' : '';
  if (h.before) {
    const m = MOODS.find((x) => x.v === h.before);
    return `<div class="mood-row set"><span>오늘 마음 날씨 <b>${m.icon} ${m.label}</b></span>${h.done ? '' : '<button type="button" class="linkish" data-mood-edit>바꾸기</button>'}</div>${care}`;
  }
  return `<div class="mood-row"><b>지금 마음 날씨는?</b>
    <div class="mood-btns">${MOODS.map((m) => `<button type="button" data-mood="${m.v}" title="${m.label}" aria-label="${m.label}">${m.icon}</button>`).join('')}</div>
    <small>한 번만 눌러 주세요. 마음에 맞춰 오늘의 우산을 골라 드려요.</small></div>${care}`;
}

function umbrellaHTML() {
  const f = state.fortune; const st = load(HABIT_KEY, {}); const { u, h, pick } = todayUmbrella();
  const wk = weekDone(st, f.dateKey);
  const week = `<small class="umb-week">이번 주 우산 ${wk}번${wk >= 3 ? ' · 🔥 이번 주 지켰어요' : ` · ${3 - wk}번 더 하면 이번 주 연속 유지`}</small>`;
  if (h.done) {
    const L = LEVELS[pick.level - 1];
    const after = h.after
      ? `<p class="umb-after-msg">${h.after === 'lighter' ? '🌤️ 마음이 가벼워졌다니 다행이에요.' : '☁️ 괜찮아요. 해낸 것만으로도 어제보다 한 걸음 나아갔어요.'}</p>`
      : `<div class="umb-after"><b>해 보니 마음이 조금 가벼워졌나요?</b><div class="yday-btns"><button type="button" class="ghost" data-umb-after="lighter">🌤️ 가벼워졌어요</button><button type="button" class="ghost" data-umb-after="same">☁️ 그대로예요</button></div></div>`;
    return `<div class="umb done"><h5>☂️ 오늘의 우산 <small>완료</small></h5><p class="umb-doneline">✓ ${L.icon} ${esc(pick.text)}</p>${after}${week}</div>`;
  }
  const sel = h.level || (easyOn() ? loadEasy().level : 1) || 1;
  return `<div class="umb"><h5>☂️ 오늘의 우산 <small>${u.byMood ? `${u.areaIcon} 마음 돌보기` : `${u.areaIcon} ${u.areaLabel} ${u.score}점`} · 필요한 기운 ${ELEMENT_KO[u.el]}(${ELEMENT_HANJA[u.el]})</small></h5>
    <p class="umb-frame">${u.frame}</p>
    <div class="umb-opts">${u.options.map((o) => { const L = LEVELS[o.level - 1]; return `<button type="button" class="umb-opt ${o.level === sel ? 'on' : ''}" data-umb-pick="${o.level}" aria-pressed="${o.level === sel}"><span>${L.icon} ${L.label}${L.exp ? ` <i>+${L.exp} EXP</i>` : ''}</span>${esc(o.text)}</button>`; }).join('')}</div>
    <button type="button" class="primary umb-do" data-umb-done>☂️ 했어요</button>
    ${week}</div>`;
}

document.addEventListener('click', (e) => {
  const mood = e.target.closest('[data-mood]');
  if (mood) {
    const v = Number(mood.dataset.mood); const r = setMood(load(HABIT_KEY, {}), state.fortune.dateKey, v);
    if (r.changed) save(HABIT_KEY, r.store);
    const m = MOODS.find((x) => x.v === v);
    toast(v <= 2 ? `${m.icon} 알려 줘서 고마워요. 오늘은 마음을 돌보는 우산부터 챙겨요` : `${m.icon} 기록했어요. 오늘의 우산을 확인해 보세요`);
    renderToday(); return;
  }
  if (e.target.closest('[data-mood-edit]')) {
    const st = load(HABIT_KEY, {}); const dk = state.fortune.dateKey;
    if (st[dk] && !st[dk].done) { delete st[dk].before; save(HABIT_KEY, st); }
    renderToday(); return;
  }
  const pk = e.target.closest('[data-umb-pick]');
  if (pk) { const r = pickLevel(load(HABIT_KEY, {}), state.fortune.dateKey, Number(pk.dataset.umbPick)); if (r.changed) save(HABIT_KEY, r.store); renderToday(); return; }
  if (e.target.closest('[data-umb-done]')) { completeUmbrella(); return; }
  const af = e.target.closest('[data-umb-after]');
  if (af) {
    const r = setAfter(load(HABIT_KEY, {}), state.fortune.dateKey, af.dataset.umbAfter);
    if (r.changed) { save(HABIT_KEY, r.store); grow((g) => addExp(g, 1), af.dataset.umbAfter === 'lighter' ? '🌤️ 오늘도 나를 잘 돌봤어요' : '☁️ 솔직하게 알려 줘서 고마워요'); }
    renderToday();
  }
});

/** 우산 완료: 미션 ①과 같은 보상(액막이 정화·용신 충전) + 난이도 보너스 */
function completeUmbrella() {
  const { pick, h } = todayUmbrella(); if (h.done) return;
  const L = LEVELS[pick.level - 1];
  completeActMission();
  if (L.exp) setTimeout(() => grow((g) => addExp(g, L.exp), `${L.icon} ${L.label} 우산 보너스`), 1600);
  renderToday();
}

/** 홈 안의 구역으로 가기 ('home:next' · 'home:week' · 'home:.css선택자') */
function goHomeTarget(t) {
  let k = t.slice(5);
  if (FLOW_KEYS.includes(k)) { // 흐름 카드는 「운세 보기」 탭에 있음
    state.tlOpen = new Set([k]); state.askOpen = null; selectTab('ask');
    setTimeout(() => $(`[data-tl="${k}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    return;
  }
  if (k === 'next' || k === 'today') k = k === 'next' ? '#booklet' : '#today-card';
  renderToday(); selectTab('today');
  setTimeout(() => {
    const el = $(k);
    (el?.closest('.card, .tl-card') || el)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 40);
}

document.addEventListener('click', (e) => {
  const all = e.target.closest('[data-guide-all]');
  if (all) { save(GUIDE_KEY, guideSetAll(loadGuide(), all.dataset.guideAll === '1')); renderToday(); return; }
  const b = e.target.closest('[data-dm]'); if (!b) return;
  const key = b.dataset.dm;
  if (key === 'act') { completeUmbrella(); return; }
  // ②·③은 그 화면으로 이동하면 완료
  const f = state.fortune; const g = loadGuide(); const gctx = guideCtx(); const d = timelineData(); const per = d.month.period;
  const ms = buildMissions({ dateKey: f.dateKey, month: { term: per.term, start: per.start, end: per.end, theme: '', best: d.month.best }, today: { mission: '', score: f.scores.total }, pending: pendingFeedback(loadRecords(), f.date), discovery: g.all ? null : nextStep(g, gctx), nextYear: d.next?.sajuYear, progress: guideProgress(g, gctx), state: {} });
  const m = ms.find((x) => x.key === key); if (!m) return;
  const a = m.action;
  dmDone(key, a.type === 'guide' ? a.key : a.type === 'tab' ? a.tab : undefined);
  if (a.type === 'open-month') { goHomeTarget('home:month'); return; }
  if (a.type === 'why') { renderToday(); setTimeout(() => { const w = $('#today-card details.why'); if (w) { w.open = true; w.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, 40); return; }
  if (a.type === 'guide') finishGuide(a.key);
  const go = a.type === 'guide' ? a.go : a.tab;
  if (go.startsWith('home:')) { goHomeTarget(go); return; }
  if (go === 'ask') state.askOpen = null;
  renderToday();
  selectTab(go);
});

// ---------- 기록함 (v0.22): 날마다 본 운세 저장 + "어제 운세 맞았나요?" + 결과 저장·메모 ----------
const loadRecords = () => ({ ...emptyRecords(), ...load(RECORDS_KEY, {}) });

/** 오늘 운세를 기록함에 남김 (홈을 볼 때마다, 같은 날은 덮어씀) */
function logToday() {
  const f = state.fortune; if (!f) return;
  save(RECORDS_KEY, logDay(loadRecords(), { dateKey: f.dateKey, title: f.info.title, score: f.scores.total, best: catLabel(f.best), worst: catLabel(f.worst), mission: todayUmbrella().pick.text }));
}

/** 결과 저장 버튼 (질문 답·운세 풀이·신수 카드) */
function saveBtnHTML(kind, key) {
  const saved = state.fortune && hasItem(loadRecords(), kind, state.fortune.dateKey, key);
  return `<button type="button" class="ghost rec-save ${saved ? 'saved' : ''}" data-rec-save="${kind}" data-rec-key="${key}">${saved ? '📌 기록함에 저장됨 · 보러 가기' : '📌 기록함에 저장'}</button>`;
}

/** 저장할 내용 만들기 (그때 본 문장을 그대로 보관) */
function recordItemFor(kind, key) {
  const dk = state.fortune.dateKey;
  if (kind === 'ask') {
    const a = buildAnswer(key, state.saju, weekFortunes());
    return { kind, key, dateKey: dk, title: `${a.icon} ${a.q}`, score: a.score, summary: `${a.when} ${a.catLabel}, ${a.tone}`, lines: [a.text, a.basis, a.tip, `가장 좋은 날: ${a.best.full} ${a.best.score}점`] };
  }
  if (kind === 'reading') {
    const r = readingFor(key); if (!r) return null;
    const label = { next: `${timelineData().next?.sajuYear}년`, daewoon: '대운', year: '올해', month: '이달' }[key] || '';
    return { kind, key, dateKey: dk, title: `📖 ${label} 운세 풀이 · ${r.god}`, score: r.score, summary: `${r.keyword} · ${r.range}`, lines: [r.intro[0], ...r.highlights.slice(0, 2), ...r.tips.slice(0, 2)] };
  }
  return null;
}

function renderRecords() {
  const panel = $('[data-panel="records"]'); if (!panel || !state.fortune) return;
  const rec = loadRecords(); const st = recordStats(rec); const days = dayList(rec, 30);
  const md = (k) => { const [, m, d] = k.split('-'); return `${m}/${d}`; };
  const filter = state.recFilter || 'all';
  const items = rec.items.filter((x) => filter === 'all' || x.kind === filter);
  panel.innerHTML = `
    <div class="card rec-head">
      <h3>📒 나의 기록함</h3>
      <p class="muted" style="margin:-4px 0 12px;font-size:0.84rem">날마다 본 운세가 자동으로 남고, 다음 날 맞았는지 체크할 수 있어요. 기록은 이 기기에만 저장돼요.</p>
      <div class="rec-stats">
        <div><b>${st.logged}</b><small>기록한 날</small></div>
        <div><b>${recordStreak(rec, state.fortune.date)}</b><small>연속으로 본 날</small></div>
        <div><b>${st.hitRate === null ? '-' : `${st.hitRate}%`}</b><small>맞았어요 비율</small></div>
        <div><b>${st.items}</b><small>저장한 결과</small></div>
      </div>
      ${st.answered >= 5 && st.highHit !== null && st.lowHit !== null ? `<p class="rec-insight">🔎 점수가 높았던 날은 ${st.highHit}%, 낮았던 날은 ${st.lowHit}% "맞았다"고 답했어요.</p>` : st.answered ? `<p class="rec-insight">🔎 ${5 - st.answered > 0 ? `${5 - st.answered}번 더 답하면 점수와 실제 하루가 얼마나 맞는지 분석해 드려요.` : ''}</p>` : ''}
      ${(() => { const hs = habitStats(load(HABIT_KEY, {})); if (!hs.doneDays && !hs.moodDays) return ''; const mood = hs.avgMood == null ? null : MOODS.reduce((x, y) => (Math.abs(y.v - hs.avgMood) < Math.abs(x.v - hs.avgMood) ? y : x));
        return `<div class="rec-stats rec-habit">
        <div><b>${hs.doneDays}</b><small>☂️ 우산 챙긴 날</small></div>
        <div><b>${hs.lighterRate === null ? '-' : `${hs.lighterRate}%`}</b><small>마음이 가벼워진 비율</small></div>
        <div><b>${mood ? mood.icon : '-'}</b><small>평균 마음 날씨</small></div>
        <div><b>${hs.byLevel[2]}</b><small>🌳 30분 도전</small></div>
      </div>`; })()}
    </div>
    <div class="card">
      <h3>🗓️ 날마다 운세 <small class="muted">최근 30일</small></h3>
      ${days.length ? `<ul class="rec-days">${days.map((d) => `<li>
        <span class="rec-date">${md(d.dateKey)}</span>
        <span class="rec-title"><b>${esc(d.title)}</b>${d.memo ? `<small>“${esc(d.memo)}”</small>` : ''}</span>
        <em style="color:${scoreColor(d.score)}">${d.score}</em>
        <span class="rec-fb">${d.feedback ? `${FEEDBACK[d.feedback].icon}` : d.dateKey === state.fortune.dateKey ? '<small>오늘</small>' : `<button type="button" class="linkish" data-rec-ask="${d.dateKey}">체크</button>`}</span>
      </li>`).join('')}</ul>` : '<p class="muted">아직 기록이 없어요. 오늘 탭을 열면 오늘 운세가 자동으로 남아요.</p>'}
    </div>
    <div class="card">
      <h3>📌 저장한 결과</h3>
      <div class="gal-tabs">${[['all', '전체'], ...Object.entries(ITEM_KIND).map(([k, v]) => [k, `${v.icon} ${v.label}`])].map(([k, l]) => `<button type="button" data-rec-filter="${k}" aria-pressed="${k === filter}">${l}</button>`).join('')}</div>
      ${items.length ? items.map((x) => `<details class="rec-item">
        <summary><span class="rec-date">${md(x.dateKey)}</span><span class="rec-title"><b>${esc(x.title)}</b><small>${esc(x.summary)}</small></span>${x.score !== null ? `<em style="color:${scoreColor(x.score)}">${x.score}</em>` : ''}</summary>
        ${x.lines.map((l) => `<p>${esc(l)}</p>`).join('')}
        <div class="rec-memo-row"><input type="text" maxlength="${MEMO_MAX}" value="${esc(x.memo || '')}" placeholder="메모 남기기" data-rec-memo="${esc(x.id)}" aria-label="메모"><button type="button" class="ghost" data-rec-del="${esc(x.id)}">삭제</button></div>
      </details>`).join('') : `<p class="muted">${filter === 'all' ? '운세 보기의 질문 답이나 운세 풀이 아래 「📌 기록함에 저장」을 누르면 여기에 모여요.' : '이 종류로 저장한 결과가 아직 없어요.'}</p>`}
    </div>
    ${backupCardHTML()}`;
}

// ---------- 백업 (v0.23): 이 기기의 기록을 파일·글자로 내보내고 가져오기 ----------
function backupCardHTML() {
  return `<div class="card backup" id="backup">
    <h3>💾 백업</h3>
    <p class="muted" style="margin:-4px 0 10px;font-size:0.84rem">기록·수호신·부적·사주 정보는 이 기기에만 저장돼요. 기기를 바꾸거나 브라우저 기록을 지우기 전에 백업해 두세요.</p>
    <div class="bk-row"><button type="button" class="primary" data-bk="file">📥 파일로 저장</button><button type="button" class="ghost" data-bk="copy">📋 글자로 복사</button></div>
    <details class="bk-in"><summary>📤 백업 가져오기</summary>
      <label class="bk-file">백업 파일 고르기<input type="file" accept=".json,application/json" data-bk-file></label>
      <textarea rows="3" placeholder="또는 복사해 둔 백업 글자를 붙여 넣기" data-bk-text></textarea>
      <button type="button" class="ghost" data-bk="import" style="width:100%">가져오기</button>
    </details>
    <p class="bk-warn">⚠️ 백업에는 생년월일이 들어 있어요. 다른 사람에게 보내거나 공개된 곳에 올리지 마세요.</p>
  </div>`;
}

function currentBackup() {
  const entries = {};
  try { for (let k = 0; k < localStorage.length; k++) { const key = localStorage.key(k); if (key.startsWith(BACKUP_PREFIX)) entries[key] = localStorage.getItem(key); } } catch { /* 저장소 없음 */ }
  return makeBackup(entries);
}

function restoreBackup(text) {
  const r = parseBackup(text);
  if (!r.ok) { toast(`⚠️ ${r.error}`); return; }
  const when = r.savedAt ? r.savedAt.slice(0, 10) : '알 수 없는 날';
  if (!confirm(`${when}에 만든 백업(${r.count}가지 기록)으로 바꿀까요?\n지금 이 기기의 기록은 백업 내용으로 덮어써져요.`)) return;
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(BACKUP_PREFIX)).forEach((k) => localStorage.removeItem(k));
    Object.entries(r.entries).forEach(([k, v]) => localStorage.setItem(k, v));
  } catch { toast('⚠️ 이 브라우저에서는 저장할 수 없어요'); return; }
  toast('💾 백업을 가져왔어요. 다시 불러올게요');
  setTimeout(() => location.reload(), 700);
}

document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-bk]'); if (!b) return;
  const act = b.dataset.bk;
  if (act === 'file') {
    const bk = currentBackup();
    const url = URL.createObjectURL(new Blob([backupText(bk)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = backupFileName(bk); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(`📥 ${bk.count}가지 기록을 파일로 저장했어요`);
  }
  if (act === 'copy') {
    const txt = backupText(currentBackup());
    try { await navigator.clipboard.writeText(txt); toast('📋 백업 글자를 복사했어요. 메모장 등 안전한 곳에 붙여 두세요'); } catch {
      const ta = $('[data-bk-text]'); if (ta) { $('.bk-in').open = true; ta.value = txt; ta.select(); } toast('복사가 막혀 있어요. 아래 칸의 글자를 직접 복사해 주세요');
    }
  }
  if (act === 'import') restoreBackup($('[data-bk-text]')?.value || '');
});
document.addEventListener('change', (e) => {
  const inp = e.target.closest('[data-bk-file]'); if (!inp || !inp.files[0]) return;
  const reader = new FileReader();
  reader.onload = () => restoreBackup(String(reader.result || ''));
  reader.readAsText(inp.files[0]);
  inp.value = '';
});

// ---------- 12지신 신수 카드 (v0.24): 60장(12지신 × 오행) 뽑기, 결과는 기록함에 자동 저장 ----------
const cardPerson = () => { const i = state.saju.input; return `${i.year}-${i.month}-${i.day}-${i.timeKnown ? `${i.hour}:${i.minute}` : 'x'}`; };

function cardFaceHTML(r, i) {
  const info = characterInfo(galSaju(r.zodiac, r.element), state.profile);
  const art = renderCharacterSVG(info, { stage: 3, width: 120, backdrop: false, mood: r.fit === 'slow' ? 'calm' : 'smile' });
  return `<div class="sc-card el-${r.element}" style="--el:${EL_COLORS[r.element]};animation-delay:${i * 0.18}s">
    <small class="sc-pos">${r.position}</small>
    <div class="sc-art">${art}</div>
    <b>${r.name}</b>
    <span>${ZODIAC[r.zodiac].hanja} · ${['木', '火', '土', '金', '水'][r.element]} · ${r.keyword}</span>
  </div>`;
}

function renderCards() {
  const panel = $('[data-panel="cards"]'); if (!panel || !state.fortune) return;
  const c = state.cards = state.cards || { area: 'today', spread: 'one', shown: false };
  const dk = state.fortune.dateKey;
  const res = c.shown ? drawReading({ person: cardPerson(), dateKey: dk, area: c.area, spread: c.spread, saju: state.saju }) : null;
  const A = CARD_AREAS.find((a) => a.key === c.area);
  panel.innerHTML = `
    <div class="card sc-pick">
      <h3>🃏 12지신 신수 카드</h3>
      <p class="muted" style="margin:-4px 0 12px;font-size:0.84rem">궁금한 것을 마음속으로 떠올리고 카드를 뽑아 보세요. 12지신 × 오행 60장이 모두 같은 확률(1/60)로 나오고, 같은 날 같은 질문에는 같은 카드가 나와요.</p>
      <div class="sc-areas">${CARD_AREAS.map((a) => `<button type="button" data-card-area="${a.key}" aria-pressed="${a.key === c.area}">${a.icon} ${a.label}</button>`).join('')}</div>
      <div class="gal-tabs sc-spread">${Object.entries(SPREADS).map(([k, v]) => `<button type="button" data-card-spread="${k}" aria-pressed="${k === c.spread}">${v.label}</button>`).join('')}</div>
      ${res ? '' : `<button type="button" class="primary sc-draw" data-card-draw>${A.icon} ${A.label} 카드 ${c.spread === 'one' ? '한 장' : '세 장'} 뽑기</button>`}
    </div>
    ${res ? `<div class="card sc-result">
      <div class="sc-cards n${res.readings.length}">${res.readings.map(cardFaceHTML).join('')}</div>
      <p class="sc-summary">${A.icon} <b>${A.label}</b> · ${esc(res.summary)}</p>
      ${res.readings.map((r) => `<div class="sc-read">
        <h4>${res.readings.length > 1 ? `<em>${r.position}</em> ` : ''}${r.name}</h4>
        <p>${r.message}</p>
        <p class="sc-area">${A.icon} ${r.areaLine}</p>
        <p class="sc-fit">${r.fitLine}</p>
        <ul><li>✅ ${r.action}</li><li>🌧️ ${r.caution}</li></ul>
      </div>`).join('')}
      <p class="muted" style="font-size:0.78rem;margin:8px 0">📒 이 결과는 기록함에 저장됐어요. 다른 질문을 고르면 새 카드를 뽑을 수 있어요.</p>
      <div class="bk-row"><button type="button" class="ghost" data-card-again>다른 질문 뽑기</button><button type="button" class="ghost" data-sub-go="records">기록함 보기</button></div>
      <p class="muted" style="font-size:0.72rem;margin:8px 0 0;text-align:center">카드는 마음을 정리하는 재미 요소예요. 의료·법률·투자 결정은 전문가와 상의하세요.</p>
    </div>` : ''}`;
  if (res) {
    const item = { kind: 'card', key: `${c.area}|${c.spread}`, dateKey: dk, title: `🃏 ${A.label} · ${res.readings.map((r) => r.name).join(' / ')}`, score: null, summary: res.summary,
      lines: res.readings.flatMap((r) => [`${res.readings.length > 1 ? `[${r.position}] ` : ''}${r.name}: ${r.message}`, `${r.areaLine} ${r.action}`]) };
    const added = addItem(loadRecords(), item);
    save(RECORDS_KEY, added.rec);
    if (added.isNew && state.cards.justDrew) grow((g) => addExp(g, 2), '🃏 신수 카드가 기록함에 저장됐어요');
    state.cards.justDrew = false;
  }
}

document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-sub-go]');
  if (go) { if (go.dataset.subGo === 'records') state.recFilter = 'card'; selectTab(go.dataset.subGo); return; }
  if (!state.cards) return;
  const ar = e.target.closest('[data-card-area]');
  if (ar) { state.cards.area = ar.dataset.cardArea; state.cards.shown = hasItem(loadRecords(), 'card', state.fortune.dateKey, `${state.cards.area}|${state.cards.spread}`); renderCards(); return; }
  const sp = e.target.closest('[data-card-spread]');
  if (sp) { state.cards.spread = sp.dataset.cardSpread; state.cards.shown = hasItem(loadRecords(), 'card', state.fortune.dateKey, `${state.cards.area}|${state.cards.spread}`); renderCards(); return; }
  if (e.target.closest('[data-card-draw]')) { state.cards.shown = true; state.cards.justDrew = true; renderCards(); $('.sc-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  if (e.target.closest('[data-card-again]')) { state.cards.shown = false; renderCards(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
});

// ---------- 전문가 보기 (v0.25): 지장간·12운성·신살·공망·대운표·계산 기준 + 가족·지인 명식 ----------
const loadCharts = () => ({ ...emptyCharts(), ...load(CHARTS_KEY, {}) });

/** 선택한 명식의 {label, profile, saju} */
function chartSubject(cs) {
  const c = cs.list.find((x) => x.id === cs.sel);
  if (!c) return { id: 'me', label: state.profile.name ? `${state.profile.name}(나)` : '나', profile: state.profile, saju: state.saju };
  const solar = solarDateOf(c);
  if (!solar || solar.error) return { id: c.id, label: c.name, profile: c, saju: null, error: '날짜를 변환할 수 없어요.' };
  return { id: c.id, label: c.name, profile: c, saju: computeSaju(profileToInput(c)) };
}

function expertCardHTML() {
  const cs = loadCharts();
  const head = `<div class="ex-head"><h3>🔬 전문가 보기</h3><button type="button" class="ex-switch ${cs.on ? 'on' : ''}" data-ex-toggle aria-pressed="${cs.on}"><i></i>${cs.on ? '켜짐' : '꺼짐'}</button></div>`;
  if (!cs.on) return `<div class="card expert" id="expert">${head}<p class="muted" style="margin:0;font-size:0.84rem">지장간·12운성·신살·공망·대운표와 계산 기준을 한 번에 봐요. 가족·지인 명식도 여러 개 저장할 수 있어요(이 기기에만 보관).</p></div>`;
  const sub = chartSubject(cs);
  const people = [{ id: 'me', name: state.profile.name || '나' }, ...cs.list];
  const chips = `<div class="ex-people">${people.map((p) => `<button type="button" data-ex-sel="${p.id}" aria-pressed="${p.id === sub.id}">${p.id === 'me' ? '🙋 ' : ''}${esc(p.name)}${p.relation ? `<small>${esc(p.relation)}</small>` : ''}</button>`).join('')}<button type="button" data-ex-add>➕ 명식 추가</button></div>`;
  const form = state.exAdd ? `<form class="ex-form" data-ex-form autocomplete="off">
    <div class="ex-grid"><label>이름·별명<input name="name" maxlength="12" required placeholder="예: 엄마"></label>
      <label>관계<select name="relation">${RELATIONS.map((r) => `<option>${r}</option>`).join('')}</select></label></div>
    <div class="ex-grid three"><label>년<input name="year" type="number" inputmode="numeric" min="1900" max="2100" required placeholder="1965"></label>
      <label>월<input name="month" type="number" inputmode="numeric" min="1" max="12" required></label>
      <label>일<input name="day" type="number" inputmode="numeric" min="1" max="31" required></label></div>
    <div class="ex-grid"><label>달력<select name="calendar"><option value="solar">양력</option><option value="lunar">음력</option></select></label>
      <label>태어난 시간 (모르면 비움)<input name="time" type="time"></label></div>
    <div class="ex-grid"><label>성별 (대운용)<select name="gender"><option value="">모름</option><option value="female">여성</option><option value="male">남성</option></select></label>
      <label class="check" style="align-self:end"><input type="checkbox" name="leap"> 음력 윤달</label></div>
    <div class="bk-row"><button type="button" class="ghost" data-ex-cancel>취소</button><button type="submit" class="primary">저장</button></div>
    <p class="muted" style="font-size:0.74rem;margin:6px 0 0">명식은 이 기기에만 저장되고 친구·서버로 보내지 않아요. 본인 동의를 받고 저장해 주세요.</p>
  </form>` : '';
  if (!sub.saju) return `<div class="card expert" id="expert">${head}${chips}${form}<p class="muted">${sub.error}</p></div>`;
  const s = sub.saju; const tb = expertTable(s);
  const cell = (r, f) => (r.empty ? '<td class="ex-empty">-</td>' : `<td>${f(r)}</td>`);
  const table = `<div class="ex-table-wrap"><table class="ex-table">
    <tr><th></th>${tb.map((r) => `<th>${r.label}</th>`).join('')}</tr>
    <tr><th>십신</th>${tb.map((r) => cell(r, (x) => x.stemGod)).join('')}</tr>
    <tr class="ex-big"><th>천간</th>${tb.map((r) => cell(r, (x) => x.stem)).join('')}</tr>
    <tr class="ex-big"><th>지지</th>${tb.map((r) => cell(r, (x) => `${x.branch}${x.gongmang ? '<sup title="공망">空</sup>' : ''}`)).join('')}</tr>
    <tr><th>십신</th>${tb.map((r) => cell(r, (x) => x.branchGod)).join('')}</tr>
    <tr><th>지장간</th>${tb.map((r) => cell(r, (x) => x.hidden.map((h) => `${h.stem}<small>${h.god}</small>`).join('<br>'))).join('')}</tr>
    <tr><th>12운성</th>${tb.map((r) => cell(r, (x) => `<span title="${STAGE_NOTE[x.stage]}">${x.stage}</span>`)).join('')}</tr>
  </table></div>`;
  const ss = sinsalOf(s);
  const gm = tb.find((r) => r.key === 'day');
  const sinsal = `<div class="ex-block"><h5>⭐ 신살 · 공망</h5>${ss.length ? `<ul>${ss.map((x) => `<li><b>${x.name}</b> ${x.branch} <small>(${x.where.join('·')})</small> — ${x.note}</li>`).join('')}</ul>` : '<p class="muted">대표 신살(천을귀인·문창·역마·도화·화개·양인)이 원국에 없어요.</p>'}
    <p class="muted" style="margin:4px 0 0;font-size:0.8rem">공망(空): 일주 ${gm.stem}${gm.branch} 기준 ${(() => { const i = [...Array(60).keys()].find((n) => n % 10 === s.pillars.day.stem && n % 12 === s.pillars.day.branch); const b = (i - (i % 10)) % 12; return `${BRANCHES[(b + 10) % 12]}${BRANCHES[(b + 11) % 12]}`; })()} — 원국에 있으면 표에 空 표시. 신살은 성향을 보는 참고 자료예요.</p></div>`;
  const g = sub.profile.gender;
  const dw = g ? computeDaewoon(s, g) : null;
  const dwHTML = `<div class="ex-block"><h5>🏔️ 대운표 ${dw ? `<small>${dw.forward ? '순행' : '역행'} · ${dw.startAge}세 시작</small>` : ''}</h5>${dw ? `<div class="ex-dw">${dw.pillars.map((p) => `<span><small>${p.startAge}세</small><b>${STEMS[p.stem]}${BRANCHES[p.branch]}</b><i style="color:${scoreColor(p.score)}">${p.score}</i><small>${tenGod(s.dayMaster, p.stem)}</small></span>`).join('')}</div>` : '<p class="muted">성별을 넣으면 대운표가 나와요.</p>'}</div>`;
  const p = sub.profile;
  const basis = `<div class="ex-block"><h5>⚙️ 계산 기준</h5><ul class="ex-basis">${calcBasis(s).map((x) => `<li><b>${x.k}</b><span>${x.v}</span></li>`).join('')}</ul>
    <div class="ex-grid"><label class="check"><input type="checkbox" data-ex-lon ${p.lonCorr !== false ? 'checked' : ''} ${p.timeUnknown ? 'disabled' : ''}> 경도 보정(출생지 기준)</label>
      <label>자시 처리<select data-ex-zasi><option value="early" ${p.zasi !== 'late' ? 'selected' : ''}>23시에 날짜 변경</option><option value="late" ${p.zasi === 'late' ? 'selected' : ''}>야자시(0시)</option></select></label></div>
    <p class="muted" style="font-size:0.76rem;margin:4px 0 0">바꾸면 ${sub.id === 'me' ? '오늘 운세·대운까지 모든 화면이' : '이 명식이'} 바로 다시 계산돼요.</p></div>`;
  const i = s.input;
  return `<div class="card expert" id="expert">${head}${chips}${form}
    <p class="ex-who"><b>${esc(sub.label)}</b> · 양력 ${i.year}.${i.month}.${i.day}${i.timeKnown ? ` ${String(i.hour).padStart(2, '0')}:${String(i.minute).padStart(2, '0')}` : ' (시간 모름)'} · ${s.animal}띠 · 일간 ${STEMS[s.dayMaster]}(${ELEMENT_KO[STEM_ELEMENT[s.dayMaster]]}) · ${s.strengthLevel || s.strength}(${s.strengthScore ?? s.support}) · 용신 ${ELEMENT_KO[s.yongsin]} (${s.yongsinBasis || '억부'}) · 희신 ${ELEMENT_KO[s.heesin]} · 격국 ${analyzeGyeok(s).name}${s.johu && s.johu.season ? ` · 조후 ${s.johu.season}${s.johu.level === 'none' ? ' 충족' : s.johu.level === 'urgent' ? ' 급함' : ' 보완'}${s.johu.stems ? `(조후표 ${s.johu.stems.map((x) => STEMS[x]).join('·')})` : ''}` : ''}</p>
    ${table}${sinsal}${dwHTML}${basis}
    ${sub.id !== 'me' ? `<button type="button" class="ghost" data-ex-del="${sub.id}" style="width:100%;margin-top:8px">이 명식 삭제</button>` : ''}
  </div>`;
}

function refreshExpert() {
  const el = $('#expert'); if (!el) return;
  const tmp = document.createElement('div'); tmp.innerHTML = expertCardHTML(); el.replaceWith(tmp.firstElementChild);
}

/** 내 계산 기준을 바꾸면 모든 화면을 다시 계산 */
function applyMyBasis(patch) {
  const profile = { ...state.profile, ...patch };
  save(STORE_KEY, profile);
  state.profile = profile;
  state.saju = computeSaju(profileToInput(profile));
  state.fortune = applyAbilities(computeFortune(state.saju, undefined, { gender: profile.gender }));
  state.tl = null; state.week = null;
  renderAll();
  toast('⚙️ 계산 기준을 바꿔 모든 화면을 다시 계산했어요');
  setTimeout(() => $('#expert')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('#expert')) return;
  if (e.target.closest('[data-ex-toggle]')) { const cs = loadCharts(); save(CHARTS_KEY, { ...cs, on: !cs.on }); refreshExpert(); return; }
  const sel = e.target.closest('[data-ex-sel]');
  if (sel) { save(CHARTS_KEY, { ...loadCharts(), sel: sel.dataset.exSel }); state.exAdd = false; refreshExpert(); return; }
  if (e.target.closest('[data-ex-add]')) { state.exAdd = true; refreshExpert(); $('#expert input[name=name]')?.focus(); return; }
  if (e.target.closest('[data-ex-cancel]')) { state.exAdd = false; refreshExpert(); return; }
  const del = e.target.closest('[data-ex-del]');
  if (del && confirm('이 명식을 삭제할까요?')) { save(CHARTS_KEY, removeChart(loadCharts(), del.dataset.exDel)); refreshExpert(); toast('명식을 삭제했어요'); }
});
document.addEventListener('submit', (e) => {
  const f = e.target.closest('[data-ex-form]'); if (!f) return;
  e.preventDefault();
  const d = Object.fromEntries(new FormData(f).entries());
  const m = makeChart({ ...d, leap: !!d.leap });
  if (!m.ok) { toast(`⚠️ ${m.error}`); return; }
  const r = addChart(loadCharts(), m.chart);
  if (!r.ok) { toast(`⚠️ ${r.error}`); return; }
  save(CHARTS_KEY, r.store); state.exAdd = false; refreshExpert(); toast(`🔬 ${m.chart.name}님의 명식을 저장했어요`);
});
document.addEventListener('change', (e) => {
  if (!e.target.closest('#expert')) return;
  const lon = e.target.closest('[data-ex-lon]'); const zasi = e.target.closest('[data-ex-zasi]');
  if (!lon && !zasi) return;
  const patch = lon ? { lonCorr: lon.checked } : { zasi: zasi.value };
  const cs = loadCharts();
  if (cs.sel === 'me' || !cs.list.some((c) => c.id === cs.sel)) { applyMyBasis(patch); return; }
  save(CHARTS_KEY, { ...cs, list: cs.list.map((c) => (c.id === cs.sel ? { ...c, ...patch } : c)) });
  refreshExpert();
});

// ---------- 첫 7일 (v0.26): 첫 주에는 EXP·Lv. 대신 쉬운 말 (기능 소개는 v0.27부터 「오늘의 미션」 ③이 맡음) ----------
const firstWeek = () => load(FW_KEY, null);

/** 첫 주에는 화면에 나오는 게임 용어를 쉬운 말로 바꿔 보여 준다 (한 곳에서 처리) */
let plainObserver = null;
let plainMode = null;
function setupPlainTerms() {
  // v0.31: 첫 주 || 쉬운 모드. 쉬운 모드면 사주 용어까지 쉬운 말로(easyTerms)
  const mode = easyOn() ? 'easy' : (state.fortune && inFirstWeek(firstWeek(), state.fortune.dateKey)) ? 'plain' : null;
  if (mode !== plainMode) { plainObserver?.disconnect(); plainObserver = null; plainMode = mode; }
  if (!mode || plainObserver) return;
  const [has, conv] = mode === 'easy' ? [hasEasyTerms, easyTerms] : [hasGameTerms, plainTerms];
  const skip = (n) => n.parentElement?.closest('script, style, textarea, input, [data-raw]');
  const fix = (root) => {
    if (root.nodeType === 3) { if (!skip(root) && has(root.nodeValue)) root.nodeValue = conv(root.nodeValue); return; }
    if (root.nodeType !== 1) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) if (!skip(n) && has(n.nodeValue)) n.nodeValue = conv(n.nodeValue);
  };
  fix(document.body);
  plainObserver = new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach(fix)));
  plainObserver.observe(document.body, { childList: true, subtree: true });
}

function answerFeedback(dateKey, value, memo) {
  const r = setFeedback(loadRecords(), dateKey, value, memo);
  save(RECORDS_KEY, r.rec);
  if (r.changed) grow((g) => addExp(g, 2), value === 'yes' ? '🎯 기록 완료! 수호신이 기뻐해요' : '📒 기록 완료! 솔직한 답이 다음 풀이에 도움이 돼요');
  else if (value === 'skip') toast('오늘은 건너뛸게요');
}

document.addEventListener('click', (e) => {
  const fb = e.target.closest('[data-fb]');
  if (fb) { const memo = $('#yday .yday-memo')?.value; answerFeedback(fb.dataset.fbDay, fb.dataset.fb, memo); dmDone('check'); renderToday(); return; }
  const sk = e.target.closest('[data-fb-skip]');
  if (sk) { answerFeedback(sk.dataset.fbSkip, 'skip'); dmDone('check'); renderToday(); return; }
  const sv = e.target.closest('[data-rec-save]');
  if (sv) {
    const { recSave: kind, recKey: key } = sv.dataset;
    if (sv.classList.contains('saved')) { state.recFilter = kind; selectTab('records'); return; }
    const item = recordItemFor(kind, key); if (!item) return;
    save(RECORDS_KEY, addItem(loadRecords(), item).rec);
    sv.classList.add('saved'); sv.textContent = '📌 기록함에 저장됨 · 보러 가기';
    toast('📒 기록함에 저장했어요 (내 수호신 > 기록함)');
    return;
  }
  const flt = e.target.closest('[data-rec-filter]');
  if (flt) { state.recFilter = flt.dataset.recFilter; renderRecords(); return; }
  const del = e.target.closest('[data-rec-del]');
  if (del) { save(RECORDS_KEY, removeItem(loadRecords(), del.dataset.recDel)); renderRecords(); toast('삭제했어요'); return; }
  const ask = e.target.closest('[data-rec-ask]');
  if (ask) {
    const k = ask.dataset.recAsk; const d = loadRecords().days[k];
    const box = document.createElement('div'); box.className = 'evo-modal';
    box.innerHTML = `<div class="evo-box"><h3 style="margin:0 0 6px">📒 ${k.split('-').slice(1).join('/')} 운세, 맞았나요?</h3>
      <p class="muted" style="margin:0 0 12px">${esc(d.title)} · ${d.score}점</p>
      <div class="yday-btns">${Object.entries(FEEDBACK).map(([v, x]) => `<button type="button" class="ghost" data-fb-modal="${v}">${x.icon} ${x.label}</button>`).join('')}</div>
      <input type="text" class="yday-memo" maxlength="${MEMO_MAX}" placeholder="한 줄 메모 (선택)" value="${esc(d.memo || '')}">
      <button type="button" class="ghost" data-fb-close style="width:100%;margin-top:8px">닫기</button></div>`;
    document.body.appendChild(box);
    box.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-fb-modal]');
      if (b) { answerFeedback(k, b.dataset.fbModal, box.querySelector('.yday-memo').value); box.remove(); renderRecords(); return; }
      if (ev.target.closest('[data-fb-close]') || ev.target === box) box.remove();
    });
  }
});
document.addEventListener('change', (e) => {
  const m = e.target.closest('[data-rec-memo]');
  if (m) { save(RECORDS_KEY, setItemMemo(loadRecords(), m.dataset.recMemo, m.value)); toast('메모를 저장했어요'); }
});

function refreshTimeline(scrollTo) {
  const el = $('#timeline'); if (!el) return;
  const tmp = document.createElement('div'); tmp.innerHTML = timelineHTML();
  el.replaceWith(tmp.firstElementChild);
  if (scrollTo) setTimeout(() => $(`[data-tl="${scrollTo}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
}

document.addEventListener('click', (e) => {
  const tg = e.target.closest('[data-tl-toggle]');
  if (tg) {
    const k = tg.dataset.tlToggle; const set = new Set(state.tlOpen || ['today']);
    if (set.has(k)) set.delete(k); else set.add(k);
    state.tlOpen = set;
    if (k === 'next' && set.has(k) && finishGuide('next')) { renderToday(); return; }
    refreshTimeline(); return;
  }
  const go = e.target.closest('[data-tl-go]');
  if (go) { const k = go.dataset.tlGo; state.tlOpen = new Set([k]); refreshTimeline(k); return; }
  const st = e.target.closest('[data-tl-step]');
  if (!st) return;
  const a = st.dataset.tlStep; const d = timelineData();
  if (a.startsWith('read-')) { openReading(a.slice(5)); return; }
  if (a === 'charm-today') { runAskCta('today'); return; }
  if (a === 'charm-wealth') { state.charm.type = 'wealth'; state.charm.element = state.saju.yongsin; selectTab('charm'); renderCharm(true); return; }
  if (a === 'charm-month') { state.charm.type = 'luck'; state.charm.element = state.saju.yongsin; selectTab('charm'); renderCharm(true); return; }
  if (a === 'chat-week') { const b = d.week.best.date; selectTab('chat'); setTimeout(() => { const i = $('#chat-form input'); if (i) { i.value = `이번 주 ${b.month}/${b.day}(${dowOf(b)})이 좋은 날이래. 그날 뭘 하면 좋을까?`; i.focus(); } }, 50); return; }
  if (a === 'journey') { ensureUnlocked('journey'); setTimeout(() => ($('#btn-journey') || $('.journey'))?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); return; }
  if (a === 'five') { selectTab('report'); setTimeout(() => $('.dw-row')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200); return; }
  selectTab(a);
});

/** 게임 보너스는 정통 점수와 따로 표시 (설계 원칙 2) */
function bonusLineHTML(f) {
  const b = Object.entries(f.abilityBonus || {}).filter(([, v]) => v);
  if (!b.length) return '';
  const label = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));
  return `<p class="bonus-line">🐉 수호신 능력 보너스(게임): ${b.map(([k, v]) => `${label[k]} +${v}`).join(' · ')} <small>— 캐릭터 능력치에만 쓰이고, 위 정통 점수에는 더하지 않았어요</small></p>`;
}

// ---------- 신년운세 책자 (첫 화면 개편 1단계): 게이지·별 없이 글로 읽는 한 해 ----------
function bookletHTML() {
  const d = timelineData(); const y = d.next || d.year; const prev = d.next ? d.year : null;
  const b = buildBooklet({ y, thisYear: prev, saju: state.saju, gyeok: analyzeGyeok(state.saju), name: state.profile.name, concern: state.profile.concern });
  const P = (t) => `<p>${esc(t)}</p>`;
  return `<article class="card booklet" id="booklet">
    <header class="bk-head">
      <small>${b.year} 신년운세</small>
      <h2>「${esc(b.title)}」</h2>
      <p class="bk-sub">${b.name}${state.profile.name ? ` · ${esc(state.profile.name)} 님` : ''}</p>
    </header>
    <p class="bk-lead">${esc(b.lead)}</p>
    <section class="bk-part"><h3>총운</h3>
      ${b.general.map((x) => `<h4>${x.h}</h4>${x.paras.map(P).join('')}`).join('')}
    </section>
    ${b.fields.map((f) => `<section class="bk-part"><h3>${f.label}${f.focus ? ' <small>내 고민</small>' : ''}</h3><h4>${esc(f.title)}</h4>${f.paras.map(P).join('')}</section>`).join('')}
    <button class="ghost bk-more" type="button" data-tl-step="read-${d.next ? 'next' : 'year'}">📖 12달 자세히 보기</button>
  </article>`;
}

// ---------- 쉬운 모드 (v0.31, easymode.js): 큰 글씨 · 쉬운 말 · 카드 3장 홈 ----------
const loadEasy = () => ({ ...emptyEasy(), ...load(EASY_KEY, {}) });
const easyOn = () => !!loadEasy().on;

/** 글씨 크기·대비(html.easy)와 머리줄 버튼을 지금 상태에 맞춤 */
function applyEasyClass() {
  const on = easyOn();
  document.documentElement.classList.toggle('easy', on);
  const b = $('#btn-easy');
  if (b) { b.textContent = on ? '가−' : '가+'; b.setAttribute('aria-pressed', String(on)); b.title = on ? '쉬운 모드 끄기 (원래 글씨로)' : '쉬운 모드 켜기 (글씨를 크게, 말을 쉽게)'; b.setAttribute('aria-label', b.title); }
  const c = $('#birth-form [name="easy"]'); if (c) c.checked = on;
}

/** 켜고 끄기 (가입 체크 상자 · 머리줄 버튼 · 추천 카드 · 링크) */
function setEasyMode(on, by = 'self', quiet = false) {
  const dk = state.fortune?.dateKey || todayKeyNow();
  save(EASY_KEY, setEasy(loadEasy(), on, dk, by));
  applyEasyClass();
  if (state.saju) {
    setupPlainTerms();
    const tab = state.lastTab || 'today';
    renderAll();
    selectTab(tab);
  }
  if (!quiet) toast(on ? '가+ 글씨를 크게, 말을 쉽게 바꿨어요. 위의 「가−」를 누르면 원래대로 돌아가요' : '원래 화면으로 돌아왔어요. 위의 「가+」로 언제든 다시 켤 수 있어요');
}
const todayKeyNow = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

/** 추천 카드: 만 50세 이상·16세 이하에게 한 번만 */
function easySuggestHTML() {
  if (!state.profile) return '';
  const birth = solarDateOf(state.profile); if (birth.error) return '';
  if (!suggestEasy(birth, state.fortune.date, loadEasy())) return '';
  return `<div class="card easy-suggest" id="easy-suggest"><b>가+ 글씨를 크게 볼까요?</b><p>글씨를 크게, 어려운 사주 말은 쉬운 말로 바꿔 보여 드려요. 언제든 위의 「가−」로 되돌릴 수 있어요.</p>
    <div class="yday-btns"><button type="button" class="primary" data-easy-suggest="on">크게 보기</button><button type="button" class="ghost" data-easy-suggest="no">괜찮아요</button></div></div>`;
}

/** 내 수호신 > 쉬운 모드 설정 · 부모님·아이 폰에 켜 주기 링크 */
function easySettingsHTML() {
  const e = loadEasy();
  return `<div class="card easy-set" id="easy-set">
    <h3>가+ 쉬운 모드 <span class="tag">${e.on ? '켜짐' : '꺼짐'}</span></h3>
    <p class="muted" style="margin-top:0">글씨를 1.25배로 크게, 사주 용어는 쉬운 말로, 홈은 카드 3장으로 보여 드려요.</p>
    <button type="button" class="${e.on ? 'ghost' : 'primary'}" data-easy-toggle style="width:100%">${e.on ? '가− 쉬운 모드 끄기' : '가+ 쉬운 모드 켜기'}</button>
    <details class="easy-link-box"><summary>👨‍👩‍👧 부모님·아이 폰에 쉬운 모드 켜 주기</summary>
      <p class="muted">링크를 보내면, 받은 사람이 열 때 「켤까요?」를 물어봐요. 링크에는 생년월일·이름이 들어가지 않아요.</p>
      <form data-easy-link class="easy-link-form">
        <label>나를 부르는 말 (선택)<input name="from" maxlength="${FROM_MAX}" placeholder="예: 큰딸 · 아빠 (이름은 넣지 마세요)"></label>
        <label>아침 알림 시각 <small>(정식 앱에서 쓰여요)</small><input name="remind" type="time" value="08:00"></label>
        <button type="submit" class="primary">링크 만들기</button>
      </form>
      <div class="easy-link-out" id="easy-link-out"></div>
    </details>
  </div>`;
}

document.addEventListener('click', (e) => {
  const sg = e.target.closest('[data-easy-suggest]');
  if (sg) { if (sg.dataset.easySuggest === 'on') setEasyMode(true); else { save(EASY_KEY, dismissEasy(loadEasy())); toast('알겠어요. 위의 「가+」로 언제든 켤 수 있어요'); renderToday(); } return; }
  if (e.target.closest('#btn-easy') || e.target.closest('[data-easy-toggle]')) { setEasyMode(!easyOn()); return; }
  const cp = e.target.closest('[data-easy-copy]');
  if (cp) {
    const url = cp.dataset.easyCopy;
    (navigator.clipboard?.writeText(url) || Promise.reject()).then(() => toast('🔗 링크를 복사했어요. 카톡·문자로 보내 주세요'), () => { const i = $('#easy-link-out input'); i?.select(); toast('링크를 길게 눌러 복사해 주세요'); });
  }
});
document.addEventListener('submit', (e) => {
  const f = e.target.closest('[data-easy-link]'); if (!f) return;
  e.preventDefault();
  const url = `${location.origin}${location.pathname}${easyLinkQuery({ remind: f.remind.value, level: 1, from: f.from.value })}`;
  $('#easy-link-out').innerHTML = `<input type="text" readonly value="${esc(url)}" aria-label="쉬운 모드 링크" data-raw>
    <div class="yday-btns"><button type="button" class="primary" data-easy-copy="${esc(url)}">🔗 복사하기</button>${navigator.share ? `<button type="button" class="ghost" data-easy-share="${esc(url)}">↗ 보내기</button>` : ''}</div>`;
});
document.addEventListener('click', (e) => {
  const sh = e.target.closest('[data-easy-share]'); if (!sh) return;
  navigator.share?.({ title: '12지신 강림 · 쉬운 모드', text: '글씨를 크게, 말을 쉽게 볼 수 있게 쉬운 모드를 추천해요', url: sh.dataset.easyShare }).catch(() => {});
});

/** ?easy=1 링크로 들어오면 확인창. 거절하면 아무것도 바꾸지 않음 */
function handleEasyLink() {
  const link = parseEasyLink(location.search); if (!link) return;
  const clean = () => { const q = new URLSearchParams(location.search); ['easy', 'remind', 'level', 'from'].forEach((k) => q.delete(k)); history.replaceState(null, '', `${location.pathname}${q.toString() ? `?${q}` : ''}${location.hash}`); };
  if (easyOn()) { clean(); return; }
  const box = document.createElement('div'); box.className = 'evo-modal'; box.id = 'easy-link-ask';
  box.innerHTML = `<div class="evo-box"><h3 style="margin:0 0 8px">가+ 쉬운 모드</h3>
    <p style="margin:0 0 6px">${esc(linkAskText(link))}</p>
    <p class="muted" style="margin:0 0 14px">글씨가 커지고, 어려운 말은 쉬운 말로 바뀌어요. 언제든 위의 「가−」로 되돌릴 수 있어요.</p>
    <div class="yday-btns"><button type="button" class="primary" data-link-yes>네, 켤게요</button><button type="button" class="ghost" data-link-no>아니요</button></div></div>`;
  document.body.appendChild(box);
  box.addEventListener('click', (ev) => {
    if (ev.target.closest('[data-link-yes]')) {
      save(EASY_KEY, acceptLink(loadEasy(), link, state.fortune?.dateKey || todayKeyNow()));
      box.remove(); clean(); applyEasyClass();
      if (state.saju) { setupPlainTerms(); renderAll(); selectTab('today'); }
      toast('가+ 쉬운 모드를 켰어요');
      return;
    }
    if (ev.target.closest('[data-link-no]')) { box.remove(); clean(); }
  });
}

/** 여러 날 들어와 익숙해졌는지 (기록된 날 수). 3일째부터 오늘 할 일(미션)·기능 구역을 보여 줌 */
const FAMILIAR_DAYS = 3;
const visitDays = () => Object.keys(loadRecords().days || {}).length;
const familiar = () => visitDays() >= FAMILIAR_DAYS;

/** 수호신의 쪽지: 오늘 할 일(우산 미션 문장) + 이번 주 좋은 날 + 보상 */
function noteData(polite) {
  const f = state.fortune; const d = timelineData(); const { pick } = todayUmbrella();
  let nextWeek = null;
  if (new Date(Date.UTC(f.date.year, f.date.month - 1, f.date.day)).getUTCDay() === 0) {
    const n = new Date(Date.UTC(f.date.year, f.date.month - 1, f.date.day + 1));
    nextWeek = weekOf(state.saju, { year: n.getUTCFullYear(), month: n.getUTCMonth() + 1, day: n.getUTCDate() }, state.profile.gender);
  }
  return buildNote({ today: f.date, task: pick.text, week: d.week, nextWeek, store: load(NOTE_KEY, {}), polite });
}
function noteHTML(polite) {
  const n = noteData(polite);
  return `<div class="td-note ${n.done ? 'done' : ''}" id="td-note">
    <small class="td-from">📝 수호신의 쪽지</small>
    <p>${esc(n.opening)}</p>
    <p class="nt-task"><b>${esc(n.task)}</b></p>
    <p>${esc(n.weekLine)}</p>
    <div class="nt-stamps" aria-label="이번 주 도장 ${n.stamps}개">${n.days.map((x) => `<span class="${x.done ? 'on' : ''} ${x.today ? 'now' : ''}" title="${x.dow}요일${x.best ? ' · 가장 좋은 날' : ''}">${x.done ? '🧧' : x.best ? '🌟' : ''}<i>${x.dow}</i></span>`).join('')}</div>
    <p class="nt-reward">${esc(n.reward)}</p>
    ${monthKeyHTML()}
    ${n.done ? '' : '<button type="button" class="primary nt-do" data-note-done>✓ 오늘 했어요</button>'}
  </div>`;
}

// ---------- 부적 돌보기 (v0.38): A 장착 연출 · C 부적 성장 · D 세트 · E 바치기 ----------
const isRooster = () => characterInfo(state.saju, state.profile).zodiac.key === 'rooster';
/** C: 장착한 부적의 기운 칸 */
function growMeter(rec) {
  if (!rec) return '';
  const n = fillOf(load(CHARMGROW_KEY, {}), rec);
  if (rec.rarity === 'myth') return '<small class="cg-meter">✨ 가장 높은 등급</small>';
  return `<small class="cg-meter" title="쪽지를 해낼 때마다 1칸, ${GROW_FULL}칸이면 등급이 올라요">${'●'.repeat(n)}${'○'.repeat(GROW_FULL - n)}</small>`;
}
/** A: 장착하는 순간 — 빛 + 수호신 대사 + 성장 안내 */
function showEquipMoment(r) {
  const info = characterInfo(state.saju, state.profile); const t = charmFromRecord(r);
  const n = fillOf(load(CHARMGROW_KEY, {}), r);
  const pair = pairType(loadEquip().charms);
  const box = document.createElement('div'); box.className = 'evo-modal';
  box.innerHTML = `<div class="evo-box eq-moment"><div class="eq-glow"><div class="nt-charm">${renderTalismanSVG(t)}</div></div>
    <h3 style="margin:10px 0 4px">${esc(labelForRec(r))} 장착</h3>
    <div class="speech"><p>${esc(equipLine(r.type, isRooster()))}</p></div>
    <p class="muted" style="font-size:0.86rem;margin:8px 0">🌱 이 부적은 쪽지를 해낼 때마다 기운이 한 칸씩 차요. 지금 ${n}/${GROW_FULL}칸 · 다 차면 ${r.rarity === 'myth' ? '이미 가장 높은 등급이에요' : '한 등급 올라가요'}.</p>
    ${pair ? `<p class="eq-pair">🎎 쌍부적 완성! ${TYPE_KO[pair]}부 두 장 — 쪽지 보상 부적이 한 등급 높아져요.</p>` : ''}
    <button type="button" class="primary" data-close-reward style="width:100%">좋아요</button></div>`;
  document.body.appendChild(box);
  box.addEventListener('click', (e) => { if (e.target.closest('[data-close-reward]') || e.target === box) box.remove(); });
  void info;
}
const labelForRec = (r) => `${CC_RARITY_KO[r.rarity]} ${TYPE_KO[r.type]}부`;

/** D·E: 세트 효과·오행 수집·바치기 (조건이 되면 보임) */
function charmCareHTML(eq, collection) {
  const parts = [];
  const pair = pairType(eq.charms);
  if (pair) parts.push(`<p class="cc-line on">🎎 <b>쌍부적</b> · ${TYPE_KO[pair]}부 두 장 — 쪽지 보상 부적 등급 +1</p>`);
  else if (setUnlocked(collection)) parts.push(`<p class="cc-line">🎎 같은 종류 부적 두 장을 함께 달면 <b>쌍부적</b>이 돼요(쪽지 보상 등급 +1).</p>`);
  if (setUnlocked(collection) || fiveDone(collection)) {
    const own = elementsOwned(collection);
    parts.push(fiveDone(collection) ? '<p class="cc-line on">🌈 <b>오행 완성</b> · 목·화·토·금·수 부적을 모두 모았어요</p>'
      : `<p class="cc-line">🌈 오행 수집 ${own.size}/5 · ${[0, 1, 2, 3, 4].map((e) => (own.has(e) ? ELEMENT_HANJA[e] : '·')).join(' ')} — 다 모으면 「오행 완성」 칭호</p>`);
  }
  if (offerUnlocked(collection)) parts.push(`<button type="button" class="ghost cc-offer" data-offer-open>🔥 부적 바치기 · 장착하지 않은 부적으로 수호신 키우기</button>`);
  else if (collection.length >= 5) parts.push(`<p class="cc-line">🔥 부적이 ${OFFER_UNLOCK}장 모이면 수호신에게 바쳐 키울 수 있어요 (${collection.length}/${OFFER_UNLOCK})</p>`);
  return parts.length ? `<div class="cc-box">${parts.join('')}</div>` : '';
}

/** E: 바치기 창 */
function openOffer() {
  const col = load(COLLECTION_KEY, []); const eq = loadEquip(); const gs = load(CHARMGROW_KEY, {});
  const list = offerable(col, eq.charms);
  const box = document.createElement('div'); box.className = 'evo-modal';
  box.innerHTML = `<div class="evo-box"><h3 style="margin:0 0 6px">🔥 부적 바치기</h3>
    <p class="muted" style="margin:0 0 10px;font-size:0.86rem">고른 부적은 도감에서 사라지고 수호신 성장 점수가 돼요. 등급이 높고 기운을 많이 키운 부적일수록 많이 올라요. 장착한 부적은 바칠 수 없어요.</p>
    <div class="offer-list">${list.map(({ r, i }) => `<label><input type="checkbox" value="${i}" data-exp="${offerValue(r, fillOf(gs, r))}"><span class="nt-charm sm">${renderTalismanSVG(charmFromRecord(r))}</span><small>${esc(labelForRec(r))}<br>+${offerValue(r, fillOf(gs, r))}</small></label>`).join('')}</div>
    <p class="offer-sum">고른 부적 0장 · +0</p>
    <div class="yday-btns" style="grid-template-columns:1fr 1fr"><button type="button" class="ghost" data-offer-close>그만두기</button><button type="button" class="primary" data-offer-do>바치기</button></div></div>`;
  document.body.appendChild(box);
  const sum = () => { const c = [...box.querySelectorAll('input:checked')]; box.querySelector('.offer-sum').textContent = `고른 부적 ${c.length}장 · +${c.reduce((a, x) => a + Number(x.dataset.exp), 0)}`; };
  box.addEventListener('change', sum);
  box.addEventListener('click', (e) => {
    if (e.target.closest('[data-offer-close]') || e.target === box) { box.remove(); return; }
    if (!e.target.closest('[data-offer-do]')) return;
    const c = [...box.querySelectorAll('input:checked')]; if (!c.length) { toast('바칠 부적을 골라 주세요'); return; }
    const exp = c.reduce((a, x) => a + Number(x.dataset.exp), 0);
    save(COLLECTION_KEY, removeOffered(load(COLLECTION_KEY, []), c.map((x) => Number(x.value))));
    box.remove();
    grow((g) => addExp(g, exp), isRooster() ? `🔥 부적 ${c.length}장 고마워요. 덕분에 제가 한 뼘 자랐어요 (+${exp})` : `🔥 부적 ${c.length}장 고마워. 덕분에 내가 한 뼘 자랐어 (+${exp})`);
    renderHero(false);
  });
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-offer-open]')) openOffer(); });

/** 같은 종류 부적이 처음 2장 모이면 두 번째 슬롯이 열렸다고 한 번 알림 */
const SLOT2_KEY = 'unmyeong2099.slot2';
function checkPairSlot() {
  if (load(SLOT2_KEY, false) || !setUnlocked(load(COLLECTION_KEY, []))) return false;
  save(SLOT2_KEY, true);
  setTimeout(() => toast(isRooster() ? '🎎 같은 종류 부적이 두 장 모였어요! 두 번째 부적 슬롯이 열렸어요. 함께 달면 쌍부적이에요' : '🎎 같은 종류 부적이 두 장 모였어! 두 번째 부적 슬롯이 열렸어. 함께 달면 쌍부적이야'), 2600);
  return true;
}

/** 오행 완성 칭호: 처음 모았을 때 한 번 알림 */
function checkFive() {
  if (load(FIVE_KEY, false) || !fiveDone(load(COLLECTION_KEY, []))) return;
  save(FIVE_KEY, true);
  setTimeout(() => toast(isRooster() ? '🌈 오행 완성! 목·화·토·금·수 부적을 모두 모으셨어요' : '🌈 오행 완성! 목·화·토·금·수 부적을 모두 모았어'), 3200);
}

/** ③ 다음 달 미리보기 열쇠: 이달 도장 20개 */
function monthKeyHTML() {
  const f = state.fortune; const n = monthStamps(load(NOTE_KEY, {}), f.date.year, f.date.month);
  const per = timelineData().month.period;
  if (n >= MONTH_KEY_NEED) return `<button type="button" class="ghost nt-key" data-next-month>🔑 다음 달(${per.nextTerm}부터) 운세 미리 보기</button>`;
  return `<p class="nt-month">🔑 이달 도장 ${n}/${MONTH_KEY_NEED} · ${MONTH_KEY_NEED}개를 모으면 다음 달 운세를 미리 열어 ${characterInfo(state.saju, state.profile).zodiac.key === 'rooster' ? '드릴게요' : '줄게'}.</p>`;
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-next-month]')) openReading('nextmonth'); });

/** ② 수호신의 이야기에 넣을 사주 사실들 */
function storyFacts() {
  const s = state.saju; const p = DAY_MASTER_PROFILE[s.dayMaster]; const g = analyzeGyeok(s); const P = GYEOK_PROFILE[g.name];
  const L = ELEMENT_LUCK[s.yongsin]; const st = twelveStage(s.dayMaster, s.pillars.day.branch);
  const d = timelineData(); const age = state.fortune.date.year - s.input.year;
  const nd = d.dw?.pillars.find((x) => x.startAge > age);
  return {
    name: state.profile.name, animal: characterInfo(s, state.profile).zodiac.name,
    dayName: p.name, dayImage: p.image, dayText: p.text, gyeokName: g.name, gyeokTitle: P.title, strengths: P.strengths.slice(0, 2),
    johu: s.johu?.table || s.johu?.text || '', luck: { color: L.color, direction: L.direction, item: L.item },
    sinsal: sinsalOf(s).slice(0, 3).map((x) => ({ name: x.name, note: x.note })), stage: st, stageNote: STAGE_NOTE[st],
    nextDaewoon: nd ? `${nd.startAge}세부터 ${STEMS[nd.stem]}${BRANCHES[nd.branch]} 대운 — 「${GOD_READING[tenGod(s.dayMaster, nd.stem)].keyword}」의 10년이 시작되는 문.` : null,
  };
}
const storyList = () => buildStories(storyFacts(), characterInfo(state.saju, state.profile).zodiac.key === 'rooster');

/** 내 수호신 > 수호신의 이야기 */
function storiesCardHTML() {
  const total = load(NOTESTAT_KEY, {}).total || 0; const list = storyList();
  return `<div class="card stories-card" id="stories"><h3>📖 수호신의 이야기 <span class="tag">${storiesOpen(total)} / ${list.length}</span></h3>
    <p class="muted" style="margin-top:0">쪽지 도장이 쌓일 때마다 수호신이 나만 아는 이야기를 하나씩 들려줘요. (지금까지 도장 ${total}개)</p>
    ${list.map((x) => total >= x.need ? `<details class="st-item"><summary>📜 ${esc(x.title)}</summary><p>${esc(x.text)}</p></details>` : `<div class="st-item locked">🔒 도장 ${x.need}개 · ${esc(x.title)}</div>`).join('')}
  </div>`;
}

/** ① 일요일 주간 편지 */
function weeklyLetterHTML() {
  const f = state.fortune;
  if (new Date(Date.UTC(f.date.year, f.date.month - 1, f.date.day)).getUTCDay() !== 0) return '';
  const z = characterInfo(state.saju, state.profile).zodiac; const d = timelineData();
  const nx = new Date(Date.UTC(f.date.year, f.date.month - 1, f.date.day + 1));
  const nw = weekOf(state.saju, { year: nx.getUTCFullYear(), month: nx.getUTCMonth() + 1, day: nx.getUTCDate() }, state.profile.gender);
  const days = loadRecords().days || {}; const keys = new Set(d.week.days.map((x) => `${x.date.year}-${x.date.month}-${x.date.day}`));
  const fbs = Object.entries(days).filter(([k, v]) => keys.has(k) && v.feedback && v.feedback !== 'skip');
  const w = weeklyLetter({ week: d.week, store: load(NOTE_KEY, {}), name: state.profile.name, animal: z.name, polite: z.key === 'rooster', nextBest: { date: nw.best.date, keyword: GOD_READING[nw.best.god].keyword }, fb: { total: fbs.length, yes: fbs.filter(([, v]) => v.feedback === 'yes').length } });
  return `<article class="card weekly-letter"><h3>${w.title}</h3>${w.lines.map((l) => `<p>${esc(l)}</p>`).join('')}<p class="td-sign">${esc(w.sign)}</p></article>`;
}

/** 쪽지 완료 → 부적 보상(이번 주 도장이 많을수록 등급 상승) + 우산 미션 완료(성장 점수·용신 충전) */
function completeNote() {
  const f = state.fortune; const store = load(NOTE_KEY, {});
  if (store[f.dateKey]?.done) return;
  const { u } = todayUmbrella();
  const eqNow = loadEquip(); const pair = pairType(eqNow.charms);
  const rarity = boostRarity(stampRarity(weekStamps(store, timelineData().week) + 1), pair); // D: 쌍부적이면 한 등급 위
  const t = createTalisman(state.saju, f, { type: AREA_CHARM[u.area] || 'luck', element: state.saju.yongsin, rarity });
  const label = `${t.rarity.label} ${t.type.label}부`;
  const list = load(COLLECTION_KEY, []); list.unshift({ ...recordOf(t), label: `쪽지 보상 ${label}` }); save(COLLECTION_KEY, list.slice(0, 80));
  save(NOTE_KEY, markNote(store, f.dateKey, label).store);
  const before = load(NOTESTAT_KEY, {}).total || 0; save(NOTESTAT_KEY, { total: before + 1 });
  // C: 장착한 부적에 기운 1칸, 다 차면 등급 +1 (도감·장착 모두 바꿔 끼움)
  const g = growEquipped(load(CHARMGROW_KEY, {}), eqNow.charms); save(CHARMGROW_KEY, g.store);
  for (const u of g.upgrades) {
    save(COLLECTION_KEY, replaceCharm(load(COLLECTION_KEY, []), u.from, u.to));
    const e2 = loadEquip(); save(EQUIP_KEY, { ...e2, charms: replaceCharm(e2.charms, u.from, u.to) });
  }
  const grownLines = g.upgrades.map((u) => `🌟 장착한 ${labelForRec(u.from)}가 다 자라 ${labelForRec(u.to)}로 올라갔어요!`);
  const fedLines = g.upgrades.length ? [] : eqNow.charms.filter(Boolean).map((r) => `🌱 장착한 ${labelForRec(r)}에 기운 한 칸 (${fillOf(g.store, r)}/${GROW_FULL})`);
  checkFive(); const slotOpened = checkPairSlot();
  const si = newStoryIndex(before, before + 1); const story = si >= 0 ? storyList()[si] : null;
  completeActMission();
  renderToday(); renderHero(false);
  const box = document.createElement('div'); box.className = 'evo-modal';
  box.innerHTML = `<div class="evo-box" style="text-align:center"><h3 style="margin:0 0 6px">🧧 쪽지 보상</h3>
    <div class="nt-charm">${renderTalismanSVG(t)}</div>
    <p style="margin:10px 0 4px"><b>${label}</b>를 받았어요</p>
    <p class="muted" style="margin:0 0 14px;font-size:0.86rem">내 수호신 > 부적 장착에서 수호신에게 달아 줄 수 있어요. 이번 주 도장을 더 모으면 더 높은 등급의 부적을 드려요.</p>
    ${pair ? `<p class="eq-pair">🎎 쌍부적 효과로 한 등급 높은 부적이에요</p>` : ''}
    ${slotOpened ? '<p class="eq-pair">🎎 같은 종류 부적이 두 장 모여 <b>두 번째 부적 슬롯</b>이 열렸어요. 함께 달면 쌍부적!</p>' : ''}
    ${[...grownLines, ...fedLines].map((x) => `<p class="cg-line">${esc(x)}</p>`).join('')}
    ${story ? `<div class="nt-story"><b>📖 새 이야기가 열렸어요 · ${esc(story.title)}</b><p>${esc(story.text)}</p><small>내 수호신 > 수호신의 이야기에서 다시 볼 수 있어요</small></div>` : ''}
    <button type="button" class="primary" data-close-reward style="width:100%">고마워요</button></div>`;
  document.body.appendChild(box);
  box.addEventListener('click', (e) => { if (e.target.closest('[data-close-reward]') || e.target === box) box.remove(); });
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-note-done]')) completeNote(); });

/** 오늘 운세 한 문단 + 근거 + 앱 쓰는 법 한 줄 */
function todayCardHTML() {
  const f = state.fortune; const z = characterInfo(state.saju, state.profile).zodiac;
  const t = todayLetter(f, { name: state.profile.name, animal: z.name, polite: z.key === 'rooster' });
  const left = FAMILIAR_DAYS - visitDays();
  return `<article class="card today-card" id="today-card">
    <h3>오늘의 운세 <small>${t.head}</small></h3>
    <div class="td-letter">
      <small class="td-from">✉️ ${esc(t.from)}</small>
      ${t.lines.map((l) => `<p>${esc(l)}</p>`).join('')}
      <p class="td-sign">${esc(t.sign)}</p>
    </div>
    ${noteHTML(z.key === 'rooster')}
    <h4 class="td-qh">오늘의 세 가지 질문</h4>
    <dl class="td-qa">${t.qa.map((x) => `<dt>Q. ${esc(x.q)}</dt><dd>${esc(x.a)}</dd>`).join('')}</dl>
    <p class="td-why">${esc(t.why)}</p>
    ${whyTodayHTML(f)}
  </article>
  <details class="card howto" id="howto"${familiar() ? '' : ' open'}>
    <summary>처음이신가요? <b>앱 쓰는 법</b></summary>
    <ol>
      <li><b>맨 위 신년운세</b>에서 한 해를 글로 읽어요. 내 고민 분야가 총운 바로 아래에 있어요.</li>
      <li><b>🔮 운세 보기</b>에서 이번 주·이달·올해·10년 흐름과 궁금한 질문의 답을 볼 수 있어요.</li>
      <li><b>💬 상담</b>에서 수호신에게 고민을 편하게 말해 보세요.</li>
      <li><b>💞 궁합·친구</b>, <b>🐉 내 수호신</b>(기록함·부적)은 천천히 둘러보세요.</li>
      <li>${left > 0 ? `${left}일 더 들어오시면 「오늘 할 일」을 추천해 드려요.` : '이제 아래에서 「오늘 할 일」을 추천해 드려요.'}</li>
    </ol>
  </details>`;
}

function renderToday() {
  logToday();
  // 첫 화면 = 신년운세 책자 → 오늘 한 문단 → 앱 쓰는 법. 익숙해지면(3일째) 오늘 할 일·기능 구역
  const sections = [
    ['ask', askChipsHTML], ['season', seasonCardHTML], ['festival', festivalCardHTML], ['say', todaySayCard],
    ['todo', todoCardHTML], ['journey', journeyCardHTML], ['daily', dailyCardHTML], ['concern', concernCard],
    ['story', () => storyButton('fortune', '오늘의 운세를 스토리로 공유')],
  ];
  $('[data-panel="today"]').innerHTML = `
    ${easySuggestHTML()}
    ${bookletHTML()}
    ${weeklyLetterHTML()}
    ${todayCardHTML()}
    ${familiar() ? `${missionCardHTML()}${sections.filter(([k]) => unlocked(k)).map(([, fn]) => fn()).join('\n')}` : ''}`;

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
  // 두 번째 부적 슬롯: 진화 3단계 또는 같은 종류 부적 2장(쌍부적 재료)이 모이면 열림 (2026-11-03 사용자 요청)
  const base = STAGE_UNLOCKS[stage - 1];
  const unlock = { ...base, charmSlots: Math.max(base.charmSlots, setUnlocked(load(COLLECTION_KEY, [])) ? 2 : 1) };
  const charms = eq.charms.map((r, i) => (i < unlock.charmSlots ? charmFromRecord(r) : null));
  const emote = unlock.emote ? eq.emote : null;
  return { eq, charms, mood: emote || todayEmote(state.fortune), emote, stage, unlock, season: seasonLook(loadSeason()) };
}

function renderHero(animate) {
  const s = state.saju; const f = state.fortune; const p = state.profile;
  checkPairSlot(); // 공방·뽑기 등 다른 곳에서 모인 경우도
  const info = characterInfo(s, p);
  const { eq, charms, mood, emote, stage, unlock, season } = heroOptions();
  info.stage = stage;
  const stats = characterStats(s, f, info, charms);
  const svg = renderCharacterSVG(info, { mood, charms, emote, stage, season, width: 300, backdrop: true, animate: true });
  const svgStatic = renderCharacterSVG(info, { mood, charms, emote, stage, season, width: 300, backdrop: true });
  const gs = summary(loadGrowth(), f.dateKey);

  // 장착 후보: 지금 공방의 부적 + 도감
  const today = state.charm.current ? recordOf(state.charm.current) : null;
  const collection = load(COLLECTION_KEY, []);
  const candidates = [today, ...collection].filter(Boolean)
    .filter((r, i, arr) => arr.findIndex((x) => sameRecord(x, r)) === i);

  const slot = (i) => {
    if (i >= unlock.charmSlots) return `<div class="slot locked"><span>🔒 부적 슬롯 ${i + 1}<br>${i === 1 ? '같은 종류 부적 2장을 모으면 열려요' : '더 진화하면 열려요'}</span></div>`;
    const t = charms[i];
    return `<div class="slot ${t ? 'filled' : ''}" data-slot="${i}" title="${t ? '눌러서 해제' : ''}">
      ${t ? `${renderTalismanSVG(t)}<span>${t.rarity.label} ${t.type.label}부</span>${growMeter(eq.charms[i])}` : `<span>부적 슬롯 ${i + 1}<br>비어 있음</span>`}</div>`;
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
          <p style="margin:0 0 6px"><span class="rarity-badge" style="color:var(--gold)">Lv.${gs.level} · ${stageName(gs.stage, info.female)}</span>${currentDex().title ? ` <span class="rarity-badge" style="color:#ff8fb3">📖 ${currentDex().title}</span>` : ''}${seasonTitle() ? ` <span class="rarity-badge season-title">🏮 ${esc(seasonTitle())}</span>` : ''}</p>
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
      ${charmCareHTML(eq, collection)}
    </div>

    ${seasonWardrobeHTML()}

    <div class="card">
      <h3>이모티콘 장착 <span class="tag">표정 + 말풍선</span></h3>
      <div class="emote-chips">${EMOTES.map((e) => { const own = ownedEmotes().has(e.key); return `<button type="button" data-emote="${e.key}" aria-pressed="${emote === e.key}" class="${own ? '' : 'locked'}">${own ? renderEmoticonSVG(s, f, { stage: heroOptions().stage, profile: p, mood: e.key, style: 'sticker', tag: '', caption: e.label, rarity: emoteRarity(e.key) }) : `<div class="emo-lock">🔒<br>${e.label}</div>`}</button>`; }).join('')}</div>
      <p class="muted" style="font-size:0.78rem;margin:6px 0 0">이모티콘은 운명 뽑기에서 모을 수 있어요. (${EMOTES.filter((e) => ownedEmotes().has(e.key)).length}/8)</p>
    </div>
    ${storiesCardHTML()}
    ${easySettingsHTML()}`;

  const panel = $('[data-panel="hero"]');
  bindSeasonWardrobe(panel);
  const saveEquip = (next, lead = '') => { save(EQUIP_KEY, next); renderHero(false); grow((g) => complete(g, f.dateKey, 'equip', qBonus('equip')), lead); };
  $$('[data-equip]', panel).forEach((b) => b.addEventListener('click', () => {
    const r = candidates[Number(b.dataset.equip)];
    const next = loadEquip();
    const idx = next.charms.findIndex((c) => sameRecord(c, r));
    if (idx >= 0) { next.charms[idx] = null; toast('부적을 해제했습니다'); } else {
      const allowed = unlock.charmSlots;
      const empty = next.charms.slice(0, allowed).findIndex((c) => !c);
      next.charms[empty >= 0 ? empty : allowed - 1] = r;
      saveEquip(next);
      showEquipMoment(r);
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

// ---------- 계절 축제 ----------

function festivalCardHTML() {
  const fs = festivalStatus(state.fortune.date);
  if (fs.active) {
    const f = fs.active;
    return `<div class="card fest on"><div class="fest-ic">${f.icon}</div><div><b>🏮 ${f.name} 축제 진행 중!</b><p>${f.desc}</p><small>축제 기간 무료 뽑기 +1 · ${ELEMENT_HANJA[f.element]} 기운 충전 보너스</small></div></div>`;
  }
  if (!fs.next || seasonNow().active || seasonNow().next?.key === fs.next.key) return '';
  return `<div class="card fest"><div class="fest-ic">${fs.next.icon}</div><div><b>다음 축제: ${fs.next.name} · D-${fs.daysToNext}</b><p>${fs.next.desc}</p><small>${fs.next.date.month}월 ${fs.next.date.day}일 전후 무료 뽑기 +1</small></div></div>`;
}

// ---------- 계절 한정 패키지 ----------

const EFFECT_LABEL = { snow: '눈 내림', petal: '꽃잎 흩날림', leaf: '낙엽 흩날림', star: '은하수 별빛', firefly: '반딧불', moon: '보름달빛', lantern: '청사초롱' };
const md = (d) => `${d.month}/${d.day}`;

function loadSeason() {
  return { ...emptySeason(), ...load(SEASON_KEY, {}) };
}

function seasonNow() {
  return seasonStatus(state.fortune.date);
}

function seasonTitle() {
  return activeTitle(loadSeason(), seasonsAround(state.fortune.date.year));
}

/** 퀘스트 완료 → 진행 중 시즌 무료 트랙 기록. 토스트 메시지 목록 반환 */
function seasonTick(questKeys) {
  const ss = seasonNow().active;
  if (!ss || !questKeys.length) return [];
  let st = loadSeason();
  const got = [];
  for (const k of questKeys) {
    const r = recordSeason(st, ss.id, k, state.fortune.dateKey);
    st = r.state; got.push(...r.unlocked);
  }
  save(SEASON_KEY, st);
  if (questKeys.some((k) => SEASON_MISSIONS.some((m) => m.key === k))) setTimeout(refreshSeasonCard, 0);
  return got.map((t) => t.reward === 'item' ? `🏮 ${itemName(ss)} 무료 획득! 캐릭터 탭에서 장착해 보세요` : t.reward === 'title' ? `🏮 한정 칭호 「${titleName(ss)}」 획득!` : `🏮 한정 스티커 「${ss.sticker}」 획득!`);
}

function refreshSeasonCard() {
  const old = $('[data-panel="today"] .card.season');
  if (!old) return;
  const tmp = document.createElement('div'); tmp.innerHTML = seasonCardHTML();
  if (tmp.firstElementChild) old.replaceWith(tmp.firstElementChild);
}

/** mode: 'set'(소품+효과) · 'item'(소품만) · 'none' */
function seasonPreviewSVG(key, width, mode) {
  const info = characterInfo(state.saju, state.profile);
  const { charms, emote, stage } = heroOptions();
  const season = mode === 'none' ? null : { key, effect: mode === 'set' };
  return renderCharacterSVG(info, { stage, charms, emote, mood: 'excited', width, backdrop: true, animate: true, season });
}

function seasonCardHTML() {
  if (!state.saju) return '';
  const { active: ss, next } = seasonNow();
  if (!ss) {
    if (!next) return '';
    return `<div class="card season soon" style="--sc:${next.color}"><div class="season-head"><span class="season-ic">${next.icon}</span><div><b>다음 한정 패키지: ${next.year} ${next.name} · ${next.theme}</b><small>${md(next.start)}~${md(next.end)} · D-${next.daysToStart}</small></div></div><p class="muted" style="margin:6px 0 0;font-size:0.84rem">시즌이 열리면 미션만 해도 「${next.item}」${withEul(next.item).slice(-1)} 무료로 받을 수 있어요.</p></div>`;
  }
  const st = loadSeason();
  const owned = st.owned[ss.id] || {};
  const prog = missionProgress(st.progress[ss.id]);
  const doneN = prog.filter((m) => m.done).length;
  const tiers = FREE_TIERS.map((t) => {
    const got = !!owned[t.reward];
    const what = t.reward === 'sticker' ? ss.sticker : t.reward === 'title' ? ss.title : ss.item;
    return `<li class="${got ? 'got' : ''}"><i>${got ? '✓' : `${t.need}`}</i><span><b>${t.label}</b><small>${t.reward === 'item' ? itemThumb(ss.key) : ''}${esc(what)}</small></span></li>`;
  }).join('');
  const missions = prog.map((m) => `<li class="${m.done ? 'done' : ''}"><span>${m.icon} ${m.label}</span><div class="track"><div class="fill" style="width:${(m.n / m.goal) * 100}%"></div></div><b>${m.n}/${m.goal}일</b></li>`).join('');
  const trying = state.seasonTry;
  const mode = trying || owned.set ? 'set' : owned.item ? 'item' : 'none';
  return `<div class="card season" style="--sc:${ss.color}">
    <div class="season-head"><span class="season-ic">${itemThumb(ss.key, 'season-ic-img') || ss.icon}</span><div><b>${ss.year} ${ss.name} 한정 · ${ss.theme} 패키지</b><small>${md(ss.start)}~${md(ss.end)} · ${ss.toFest > 0 ? `축제까지 D-${ss.toFest}` : ss.toFest === 0 ? '오늘이 축제!' : '축제 여운 기간'} · 판매 종료까지 ${ss.daysLeft}일</small></div></div>
    <div class="season-body">
      <div class="season-preview">${seasonPreviewSVG(ss.key, 150, mode)}
        <button class="ghost" type="button" data-season="try">${trying ? '원래대로' : '👘 입어 보기'}</button></div>
      <div class="season-free">
        <h4>🎁 무료 트랙 <small>미션 ${doneN}/4</small></h4>
        <ul class="season-missions">${missions}</ul>
        <ul class="season-tiers">${tiers}</ul>
      </div>
    </div>
    <div class="shop-item season-set">${itemThumb(ss.key, 'item-thumb lg')}<div><b>👘 ${ss.theme} 꾸미기 세트</b><small>${ss.item} 바로 받기 · 계절 장면(${SCENE_NAME[ss.key]}) · 배경 효과(${EFFECT_LABEL[ss.effect]}) · 금빛 칭호</small></div>
      <button class="primary" type="button" data-season="buy" ${owned.set ? 'disabled' : ''}>${owned.set ? '보유 중' : `${PACK_PRICE.toLocaleString()}원`}</button></div>
    <p class="muted" style="font-size:0.74rem;margin:6px 0 0">꾸미기 전용이라 운세·오행 수치는 변하지 않아요. 무료 트랙 미션 4개를 모두 하면 ${withEul(ss.item)} 무료로 받아요. 모든 아이템에 「${ss.year} ${ss.name}」이 새겨지고, 시즌이 끝나면 같은 디자인은 다시 판매하지 않아요.</p>
  </div>`;
}

function openSeasonShop() {
  const ss = seasonNow().active; if (!ss) return;
  const el = document.createElement('div');
  el.className = 'evo-modal';
  el.innerHTML = `<div class="evo-box shop season-modal" style="--sc:${ss.color}">
    <h3 style="margin-top:0">${ss.icon} ${ss.year} ${ss.name} · ${ss.theme} 꾸미기 세트</h3>
    <div class="season-modal-art">${seasonPreviewSVG(ss.key, 220, 'set')}</div>
    <ul class="season-contents">
      <li>👘 <b>${esc(itemName(ss))}</b> — 바로 장착</li>
      <li>🏞️ 계절 장면 — ${SCENE_NAME[ss.key]}</li>
      <li>✨ 계절 배경 효과 — ${EFFECT_LABEL[ss.effect]} (켜고 끌 수 있어요)</li>
      <li>🏅 금빛 칭호 — ${esc(titleName(ss, true))}</li>
      <li>🏷️ 한정 스티커 — ${esc(ss.sticker)}</li>
    </ul>
    <p class="muted" style="font-size:0.76rem">운세·오행 충전·뽑기 확률에는 영향이 없는 꾸미기 전용 상품입니다. 판매 기간 ${md(ss.start)}~${md(ss.end)} (남은 ${ss.daysLeft}일). ※ 프로토타입이라 실제 결제는 일어나지 않습니다.</p>
    <button class="primary" type="button" data-sbuy="ok" style="width:100%">${PACK_PRICE.toLocaleString()}원 구매하기</button>
    <button class="ghost" type="button" data-sbuy="close" style="width:100%;margin-top:6px">닫기</button></div>`;
  document.body.appendChild(el);
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sbuy]');
    if (!b && e.target !== el) return;
    if (b?.dataset.sbuy === 'ok') {
      const today = dateToJdn(state.fortune.date.year, state.fortune.date.month, state.fortune.date.day);
      const r = buyPack(loadSeason(), ss, today);
      if (r.ok) { save(SEASON_KEY, r.state); state.seasonTry = false; toast(`${ss.icon} ${ss.theme} 꾸미기 세트를 받았어요! 캐릭터가 ${withEul(ss.item)} 장착했어요 (프로토타입: 결제 없음)`); }
      else toast(r.reason);
    }
    el.remove();
    refreshSeasonCard();
    if (!$('[data-panel="hero"]').classList.contains('hidden')) renderHero(false);
  });
}

function seasonWardrobeHTML() {
  const st = loadSeason();
  const items = ownedItems(st);
  const ss = seasonNow().active;
  const titles = Object.entries(st.owned).filter(([, o]) => o.title).map(([id, o]) => ({ id, gold: !!o.set, label: `${id.split('-')[1]} ${SEASON_PACKS[id.split('-')[0]].title}` }));
  if (!items.length && !titles.length) {
    return ss ? `<div class="card"><h3>🏮 한정 꾸미기 <span class="tag">${ss.year} ${ss.name}</span></h3><p class="muted" style="margin:0">홈의 ${ss.name} 패키지 무료 미션을 해내면 「${ss.item}」${withEul(ss.item).slice(-1)} 받아 여기서 장착할 수 있어요.</p></div>` : '';
  }
  const curSet = st.equipped && st.owned[st.equipped]?.set;
  return `<div class="card wardrobe">
    <h3>🏮 한정 꾸미기 <span class="tag">${items.length}개 보유</span></h3>
    ${items.length ? `<div class="chips">${items.map((it) => `<button type="button" class="chip ${st.equipped === it.id ? 'on' : ''}" data-wear="${it.id}" aria-pressed="${st.equipped === it.id}">${it.year} ${esc(it.item)}${it.set ? ' ✨' : ''}</button>`).join('')}</div>` : ''}
    ${curSet ? `<label class="row" style="gap:6px;margin-top:8px;font-size:0.86rem"><input type="checkbox" id="season-fx" ${st.effect !== false ? 'checked' : ''}> 계절 배경 효과 보기</label>` : ''}
    ${titles.length ? `<p class="muted" style="margin:10px 0 4px;font-size:0.8rem">칭호</p><div class="chips">${titles.map((t) => `<button type="button" class="chip ${st.title === t.id ? 'on' : ''}" data-stitle="${t.id}">${t.gold ? '✨ ' : ''}${esc(t.label)}</button>`).join('')}</div>` : ''}
    <p class="muted" style="font-size:0.74rem;margin:8px 0 0">한정 꾸미기는 능력치에 영향이 없어요. 장착한 소품은 스토리 카드에도 함께 나와요.</p>
  </div>`;
}

function bindSeasonWardrobe(panel) {
  $$('[data-wear]', panel).forEach((b) => b.addEventListener('click', () => {
    const st = loadSeason();
    const on = st.equipped === b.dataset.wear;
    save(SEASON_KEY, { ...st, equipped: on ? null : b.dataset.wear });
    toast(on ? '한정 소품을 벗었어요' : '한정 소품을 장착했어요!');
    renderHero(false);
  }));
  $$('[data-stitle]', panel).forEach((b) => b.addEventListener('click', () => {
    const st = loadSeason();
    save(SEASON_KEY, { ...st, title: st.title === b.dataset.stitle ? null : b.dataset.stitle });
    renderHero(false);
  }));
  const fx = $('#season-fx', panel);
  if (fx) fx.addEventListener('change', () => { save(SEASON_KEY, { ...loadSeason(), effect: fx.checked }); renderHero(false); });
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-season]');
  if (!b) return;
  if (b.dataset.season === 'try') { state.seasonTry = !state.seasonTry; refreshSeasonCard(); }
  if (b.dataset.season === 'buy') openSeasonShop();
});

// ---------- AI 수호신 대화 ----------

function chatContext() {
  const s = state.saju; const info = characterInfo(s, state.profile);
  const stage = heroOptions().stage;
  const dw = state.profile.gender ? computeDaewoon(s, state.profile.gender) : null;
  const d = dw ? daewoonAt(dw, state.fortune.date.year - s.input.year) : null;
  const j = loadJourney();
  return {
    pers: personalityOf(zIdx()), zodiacName: info.zodiac.name, stage, stageName: stageName(stage, info.female),
    userName: state.profile.name || '주인', dayMaster: `${STEMS[s.dayMaster]}(${ELEMENT_KO[STEM_ELEMENT[s.dayMaster]]})`,
    yongsin: s.yongsin, weakest: s.weakest, strength: s.strength, fortune: state.fortune,
    concern: info.concern.label, journeyStep: journeyStep(info.concern.key, Math.min(j.done, JOURNEY_DAYS - 1), s.yongsin).title,
    daewoon: d ? `${pillarLabelFull(d)} (${d.startAge}~${d.endAge}세)` : null, luckIndex: luckNow().index,
    memory: memoryLines(loadMemory(), state.fortune.dateKey),
  };
}

function loadMemory() {
  return { ...emptyMemory(), ...load(MEM_KEY, {}) };
}

/** 대화 한 번이 끝난 뒤: 기억 추출·합치기, 필요하면 지난 대화 요약 */
async function rememberTurn(text, history, fuMark) {
  const today = state.fortune.dateKey;
  let mem = loadMemory();
  if (fuMark) mem = markAsked(mem, fuMark);
  if (mem.on === false || isCrisis(text)) { save(MEM_KEY, mem); return; }
  mem = mergeMemory(mem, extractMemories(text, today), today);
  mem.pending = (mem.pending || 0) + 2;
  save(MEM_KEY, mem);
  if (!needsSummary(mem)) return;
  const turns = history.slice(-mem.pending);
  let summary = null;
  try {
    const sample = await getSample();
    if (sample) summary = (await sample(summaryMessages(mem.summary, turns), { modelTier: 'quick', cache: false })).text;
  } catch { summary = null; }
  if (!summary || !summary.trim()) summary = offlineSummary(mem, turns, today);
  save(MEM_KEY, applySummary(loadMemory(), summary.trim()));
  if (!$('[data-panel="chat"]').classList.contains('hidden')) renderChat();
}

function memoryCard() {
  const mem = loadMemory();
  const today = state.fortune.dateKey;
  const icon = { event: '📅', like: '💖', person: '👥', topic: '💭' };
  const items = mem.items || [];
  const list = mem.on === false
    ? '<p class="muted">기억 끄기 상태예요. 수호신이 새로운 이야기를 기억하지 않아요.</p>'
    : !items.length && !mem.summary
      ? '<p class="muted">아직 기억한 이야기가 없어요. "내일 면접 있어"처럼 말해 주면 다음에 먼저 안부를 물어요.</p>'
      : `${mem.summary ? `<div class="mem-sum">📝 ${esc(mem.summary)}</div>` : ''}<ul class="mem-list">${items.map((x) => `<li><span>${icon[x.kind]} ${esc(describeMemory(x, today))}${x.count > 1 ? ` <small>×${x.count}</small>` : ''}</span><button type="button" class="mem-x" data-forget="${esc(x.id)}" aria-label="이 기억 지우기">✕</button></li>`).join('')}</ul>`;
  return `
    <div class="card memory">
      <h3>🧠 수호신의 기억 <span class="tag">${items.length}/${MEMORY_LIMIT}</span></h3>
      ${list}
      <div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap">
        <button class="ghost" type="button" id="btn-mem-toggle">${mem.on === false ? '기억 켜기' : '기억 끄기'}</button>
        <button class="ghost" type="button" id="btn-mem-clear">모두 잊기</button>
      </div>
      <p class="muted" style="font-size:0.74rem;margin:8px 0 0">기억은 이 기기에만 저장돼요. 전화번호·생년월일·주소처럼 민감한 내용은 기억하지 않고, 대화 ${SUMMARY_EVERY}마디마다 짧게 요약해요. 친구와 공유되지 않아요.</p>
    </div>`;
}

function loadChat() {
  const c = load(CHAT_KEY, null) || { date: null, used: 0, history: [] };
  if (c.date !== state.fortune.dateKey) return { ...c, date: state.fortune.dateKey, used: 0 };
  return c;
}

async function getSample() {
  if (state.sample !== undefined) return state.sample;
  try { state.sample = window.claude?.use ? await window.claude.use('sample') : null; } catch { state.sample = null; }
  return state.sample;
}

function renderChat() {
  const panel = $('[data-panel="chat"]');
  if (!panel || !state.saju) return;
  const info = characterInfo(state.saju, state.profile);
  const stage = heroOptions().stage;
  const c = loadChat();
  const sub = isSubscribed(loadGacha(), state.fortune.dateKey);
  const left = sub ? '무제한' : `${Math.max(0, FREE_CHATS - c.used)}/${FREE_CHATS}`;
  const face = faceSVG(info, stage, 'smile', 40);
  const baseHist = c.history.length ? c.history : [{ role: 'guardian', text: `${speak(zIdx(), 'greet', { index: 1, stage })} 무엇이든 물어봐. ${info.concern.label} 고민도 좋고, 오늘 운세도 좋아!` }];
  const fu = followUp(loadMemory(), state.fortune.dateKey);
  const hist = fu ? [...baseHist, { role: 'guardian', text: `💭 ${fu.text}`, recall: true }] : baseHist;
  panel.innerHTML = `
    <div class="card chat">
      <h3>💬 수호신과 대화 <span class="tag">${state.sample ? 'AI 수호신' : '수호신'} · 오늘 ${left}</span></h3>
      <div class="chat-log" id="chat-log">${hist.map((m) => m.role === 'user' ? `<div class="msg me"><p>${esc(m.text)}</p></div>` : `<div class="msg bot"><div class="av">${face}</div><p>${esc(m.text)}</p></div>`).join('')}</div>
      <div class="chips quick">${QUICK_ASKS.map((q) => `<button class="chip" type="button" data-ask="${esc(q)}">${esc(q)}</button>`).join('')}</div>
      <form id="chat-form" class="chat-form"><input name="q" type="text" maxlength="200" placeholder="${info.zodiac.name} 수호신에게 물어보기…" autocomplete="off"><button class="primary" type="submit">보내기</button></form>
      <p class="muted" style="font-size:0.74rem;margin:8px 0 0">무료 하루 ${FREE_CHATS}회 · 👑 수호 구독 무제한. 수호신의 답은 재미와 마음가짐을 위한 것이며, 의료·법률·투자 결정은 전문가와 상의하세요. 힘든 마음이 들면 ☎ 109 (24시간)</p>
      <button class="ghost" type="button" id="btn-chat-clear" style="margin-top:6px">대화 지우기</button>
    </div>
    ${memoryCard()}`;
  const log = $('#chat-log', panel); log.scrollTop = log.scrollHeight;
  $('#chat-form', panel).addEventListener('submit', (e) => { e.preventDefault(); const q = e.target.q.value.trim(); if (q) sendChat(q); });
  $$('[data-ask]', panel).forEach((b) => b.addEventListener('click', () => sendChat(b.dataset.ask)));
  $('#btn-chat-clear', panel).addEventListener('click', () => { save(CHAT_KEY, { ...loadChat(), history: [] }); renderChat(); });
  $$('[data-forget]', panel).forEach((b) => b.addEventListener('click', () => { save(MEM_KEY, forget(loadMemory(), b.dataset.forget)); renderChat(); toast('그 기억은 지웠어요'); }));
  $('#btn-mem-toggle', panel).addEventListener('click', () => { const m = loadMemory(); save(MEM_KEY, { ...m, on: m.on === false }); renderChat(); toast(m.on === false ? '수호신이 다시 이야기를 기억해요' : '이제 새 이야기를 기억하지 않아요'); });
  $('#btn-mem-clear', panel).addEventListener('click', () => { if (confirm('수호신의 기억을 모두 지울까요?')) { save(MEM_KEY, forgetAll(loadMemory())); renderChat(); toast('모든 기억을 지웠어요'); } });
}

async function sendChat(text) {
  if (state.chatBusy) return;
  const c = loadChat();
  const sub = isSubscribed(loadGacha(), state.fortune.dateKey);
  if (!sub && c.used >= FREE_CHATS && !isCrisis(text)) { toast('오늘 무료 대화를 모두 썼어요. 내일 또 만나거나 수호 구독으로 무제한 대화할 수 있어요'); openShop(); return; }
  const ctx = chatContext();
  const mem = loadMemory();
  const fu = followUp(mem, state.fortune.dateKey);
  if (fu) ctx.followUp = fu.text; else ctx.recall = recallFor(mem, text, state.fortune.dateKey);
  const history = [...c.history, { role: 'user', text }];
  save(CHAT_KEY, { ...c, history });
  renderChat();
  const log = $('#chat-log');
  const face = faceSVG(characterInfo(state.saju, state.profile), ctx.stage, 'smile', 40);
  const bubble = document.createElement('div');
  bubble.className = 'msg bot'; bubble.innerHTML = `<div class="av">${face}</div><p class="typing">${ctx.zodiacName} 수호신이 생각하는 중…</p>`;
  log.appendChild(bubble); log.scrollTop = log.scrollHeight;
  const p = bubble.querySelector('p');
  let answer;
  state.chatBusy = true;
  try {
    if (isCrisis(text)) answer = crisisReply(ctx.userName);
    else {
      const sample = await getSample();
      if (sample) {
        const msgs = buildMessages(buildInstructions(ctx), c.history, text);
        const res = await sample(msgs, { modelTier: 'quick', cache: false, onText: ({ text: t }) => { p.classList.remove('typing'); p.textContent = t; log.scrollTop = log.scrollHeight; } });
        answer = res.text;
      } else {
        await new Promise((r) => setTimeout(r, 600));
        answer = offlineReply(ctx, text);
      }
    }
  } catch (err) {
    answer = err?.code === 'rate_limited' ? '잠깐 숨 좀 고를게! 조금 뒤에 다시 물어봐 줘.' : offlineReply(ctx, text);
  }
  state.chatBusy = false;
  const c2 = loadChat();
  const fullHistory = [...history, { role: 'guardian', text: answer }];
  save(CHAT_KEY, { ...c2, used: c2.used + (isCrisis(text) ? 0 : 1), history: fullHistory.slice(-30) });
  rememberTurn(text, fullHistory, fu?.mark);
  renderChat();
  grow((g) => complete(g, state.fortune.dateKey, 'chat', qBonus('chat')));
}

// ---------- 단톡 궁합방 · 응원 · 부적 선물 ----------

function teamMembers() {
  const me = { name: state.profile.name || '나', saju: state.saju, info: characterInfo(state.saju, state.profile), me: true, stage: heroOptions().stage };
  const fr = load(FRIENDS_KEY, []).slice(0, 7).map((x) => { const fs = friendSaju(x); return fs.error ? null : { name: x.name, saju: fs, info: characterInfo(fs, { gender: x.gender, concern: 'people' }), stage: x.card?.stage || 2 }; }).filter(Boolean);
  return [me, ...fr];
}

/** 실시간 방 멤버(공개 카드) → 궁합 지도 멤버 */
function liveMembers() {
  const list = state.rt?.members || [];
  const mine = list.find((m) => m.isMe);
  const others = list.filter((m) => !m.isMe && m.card.code !== myCode()).slice(0, 7);
  const me = { name: state.profile.name || '나', saju: state.saju, info: characterInfo(state.saju, state.profile), me: true, stage: heroOptions().stage, peer: mine?.peer };
  return [me, ...others.map((m) => { const sj = cardToSaju(m.card); return { name: m.card.name, saju: sj, info: characterInfo(sj, { gender: m.card.gender, concern: 'people' }), stage: m.card.stage, code: m.card.code, peer: m.peer, live: true }; })];
}

function teamRoom(mem = teamMembers(), min = 3) {
  if (mem.length < min) return null;
  const pairs = [];
  for (let i = 0; i < mem.length; i++) for (let j = i + 1; j < mem.length; j++) pairs.push({ i, j, score: computeCompat(mem[i].saju, mem[j].saju, state.fortune.date).score });
  pairs.sort((a, b) => b.score - a.score);
  const todayEl = state.fortune.todayElement;
  const lucky = mem.map((m, i) => ({ i, v: (m.saju.yongsin === todayEl ? 30 : 0) + (m.saju.weakest === todayEl ? 15 : 0) + Math.round(seededRandom(`${m.name}|${state.fortune.dateKey}`) * 20) })).sort((a, b) => b.v - a.v)[0];
  const sum = [0, 0, 0, 0, 0]; mem.forEach((m) => m.saju.elements.forEach((v, e) => { sum[e] += v; }));
  const teamWeak = sum.indexOf(Math.min(...sum));
  return { mem, pairs, best: pairs[0], worst: pairs[pairs.length - 1], lucky: lucky.i, teamWeak, sum };
}

function teamSVG(t) {
  const n = t.mem.length; const cx = 200; const cy = 190; const R = 130;
  const pos = t.mem.map((_, i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; });
  const lines = t.pairs.map((p) => {
    const [x1, y1] = pos[p.i]; const [x2, y2] = pos[p.j];
    if (p.score >= 75) return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ff4d8d" stroke-width="3" opacity="0.85"/>`;
    if (p.score < 48) return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#00e5ff" stroke-width="2" stroke-dasharray="6 6" opacity="0.8"/>`;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>`;
  }).join('');
  const nodes = t.mem.map((m, i) => {
    const [x, y] = pos[i];
    const { defs, body } = characterMarkup(m.info, { stage: m.stage, mood: i === t.lucky ? 'excited' : 'smile', aura: false });
    return `<g transform="translate(${x - 36} ${y - 40})"><svg viewBox="40 56 240 240" width="72" height="72"><defs>${defs}</defs>${body}</svg></g>
      ${i === t.lucky ? `<text x="${x}" y="${y - 44}" font-size="18" text-anchor="middle">👑</text>` : ''}
      <text x="${x}" y="${y + 46}" font-size="12" font-weight="800" fill="#fff" text-anchor="middle" font-family="'Noto Sans KR', sans-serif">${esc(m.name)}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400"><rect width="400" height="400" rx="24" fill="#120c2a"/>
    <text x="200" y="28" font-size="15" font-weight="900" fill="#ffc93c" text-anchor="middle" font-family="'Noto Sans KR', sans-serif">12지신 강림 · 단톡 궁합방</text>
    ${lines}${nodes}
    <text x="200" y="388" font-size="10" fill="#9a94c4" text-anchor="middle" font-family="'Noto Sans KR', sans-serif">분홍 실선: 찰떡 · 파란 점선: 티격태격 · 👑 오늘의 행운 멤버</text></svg>`;
}

function teamCardHTML() {
  const rt = state.rt || {};
  const inRoom = !!rt.room;
  const live = inRoom ? liveMembers() : null;
  const t = inRoom ? teamRoom(live, 2) : teamRoom();
  const status = rt.roomCap === false ? '로컬 체험' : inRoom ? `🟢 실시간 ${live.length}명` : '대기';
  const roomBox = inRoom
    ? `<div class="rt-room"><span>방 코드 <b class="code">${esc(rt.room.name)}</b> · 접속 ${live.length}명</span>
        <div class="actions"><button class="ghost" type="button" id="btn-room-invite">초대 문구 복사</button><button class="ghost" type="button" id="btn-room-leave">나가기</button></div></div>`
    : `<form class="rt-join" id="room-form" autocomplete="off">
        <input name="code" type="text" maxlength="8" placeholder="방 코드 6자리" aria-label="방 코드">
        <button class="primary" type="submit">입장</button>
        <button class="ghost" type="button" id="btn-room-new">새 방 만들기</button>
      </form>`;
  const liveList = inRoom ? `<div class="rt-members">${live.map((m, i) => `<div class="rt-mem${m.me ? ' me' : ''}">
      <span class="nm">${m.me ? '⭐ ' : ''}${esc(m.name)}</span><span class="muted">${esc(m.info.zodiac.name)}띠 · ${esc(stageName(m.stage || 1, m.info.female))}</span>
      ${m.me ? '<span class="tag">나</span>' : `<button class="chip" type="button" data-live-cheer="${i}" ${rt.roomCheered?.[m.code] ? 'disabled' : ''}>${rt.roomCheered?.[m.code] ? '응원 완료' : '📣 응원'}</button>`}
    </div>`).join('')}</div>` : '';
  if (t) state.team = t;
  const mapPart = t ? (() => {
    const nm = (k) => t.mem[k].name;
    return `<div class="team-map">${teamSVG(t)}</div>
    <ul class="reasons">
      <li><b>👑 오늘의 행운 멤버</b> ${esc(nm(t.lucky))} — 오늘 점심 메뉴는 ${esc(nm(t.lucky))}가 정해!</li>
      <li><b>💗 찰떡 듀오</b> ${esc(nm(t.best.i))} × ${esc(nm(t.best.j))} <em>${t.best.score}점</em></li>
      ${t.pairs.length > 1 ? `<li><b>⚡ 티격태격 듀오</b> ${esc(nm(t.worst.i))} × ${esc(nm(t.worst.j))} <em>${t.worst.score}점</em></li>` : ''}
      <li><b>☯ 팀에 부족한 기운</b> ${ELEMENT_HANJA[t.teamWeak]} ${ELEMENT_KO[t.teamWeak]} → 팀 부적으로 채워요</li>
    </ul>
    <div class="actions" style="margin-top:10px">
      <button class="primary" type="button" id="btn-team-png">궁합 지도 이미지 저장</button>
      ${inRoom ? '' : '<button class="ghost" type="button" id="btn-team-invite">단톡방 초대 문구 복사</button>'}
      <button class="ghost" type="button" id="btn-team-charm">팀 부적 받기</button>
    </div>`;
  })() : `<p class="muted" style="margin:8px 0 0">${inRoom ? '친구가 같은 방 코드로 들어오면 궁합 지도가 실시간으로 그려져요. 초대 문구를 단톡방에 붙여 넣어 보세요!' : '방 코드로 친구들과 실시간 입장하거나, 친구를 2명 이상 추가하면 단톡 궁합 지도가 만들어져요.'}</p>`;
  return `<div class="card team">
    <h3>👥 단톡 궁합방 <span class="tag">${status}</span></h3>
    ${rt.roomCap === false ? '<p class="muted" style="font-size:0.78rem;margin:0 0 8px">이 화면에서는 실시간 연결을 쓸 수 없어 추가한 친구들로 궁합 지도를 보여 드려요.</p>' : roomBox}
    ${inRoom ? `<label class="rt-msg">응원 메시지 <select id="cheer-msg">${CHEER_MESSAGES.map((m) => `<option value="${m.key}" ${state.cheerMsg === m.key ? 'selected' : ''}>${esc(m.text)}</option>`).join('')}</select></label>` : ''}
    ${liveList}
    ${mapPart}
    <p class="muted" style="font-size:0.74rem;margin:6px 0 0">방에는 이름·띠·오행 비율·캐릭터 단계만 공유돼요. 생년월일과 사주 원본은 이 기기에만 남습니다.</p>
  </div>`;
}

// ---------- 실시간 연결 · 응원 우편함 ----------

function loadRT() { return { code: null, claimed: [], used: { date: null, n: 0 }, inbox: [], sent: {}, ...(load(RT_KEY, null) || {}) }; }
function myCode() {
  const rt = loadRT();
  if (!rt.code) { rt.code = makeCode(); save(RT_KEY, rt); }
  return rt.code;
}
function myCard() { return publicCard(state.saju, state.profile, heroOptions().stage, myCode()); }
function appUrl() { return location.href.split('?')[0].split('#')[0]; }
async function copyText(msg, ok) { try { await navigator.clipboard.writeText(msg); toast(ok); } catch { toast(msg); } }

async function initRealtime() {
  if (!state.saju) return;
  state.rt = state.rt || {};
  myCode();
  // URL ?room=xxxxxx 로 들어오면 바로 입장
  const q = normalizeCode(new URLSearchParams(location.search).get('room'));
  if (q && !state.rt.room) enterRoom(q);
  if (state.rt.mailboxTried) return;
  state.rt.mailboxTried = true;
  const mb = await openMailbox();
  state.rt.mailbox = mb;
  if (!mb) { renderCompat(); return; }
  try { await mb.register(myCard()); state.rt.registered = true; } catch { state.rt.registered = false; }
  state.rt.unlisten?.();
  try {
    state.rt.unlisten = mb.listen(myCode(), (list) => receiveCheers(list.map((c) => ({ ...c, name: c.fromName }))), () => { state.rt.mailboxError = true; });
  } catch { state.rt.mailboxError = true; }
  renderCompat();
}

/** 받은 응원 → 하루 5번까지 부족한 기운 충전 */
function receiveCheers(list) {
  const rt = loadRT();
  const dk = state.fortune.dateKey;
  if (rt.used.date !== dk) rt.used = { date: dk, n: 0 };
  const fresh = pendingCheers(list, rt.claimed, dk, rt.used.n);
  // 한도를 넘은 오늘 응원도 우편함에는 보여 줌
  const extra = list.filter((c) => c.date === dk && !rt.claimed.includes(c.id) && !fresh.includes(c));
  if (!fresh.length && !extra.length) return;
  fresh.forEach((c, i) => {
    rt.claimed.push(c.id); rt.used.n += 1;
    rt.inbox.unshift({ id: c.id, name: c.name, msg: c.msg, date: dk, charged: true });
    setTimeout(() => charge(state.saju.weakest, CHEER_CHARGE, `cheer-in-${c.id}`, `📣 ${c.name}의 응원 "${c.msg}"`), 400 + i * 2600);
  });
  extra.forEach((c) => { rt.claimed.push(c.id); rt.inbox.unshift({ id: c.id, name: c.name, msg: c.msg, date: dk, charged: false }); });
  rt.claimed = rt.claimed.slice(-300); rt.inbox = rt.inbox.slice(0, 20);
  save(RT_KEY, rt);
  if (fresh.length) grow((g) => complete(g, dk, 'social', qBonus('social')));
  renderCompat();
}

async function enterRoom(code) {
  state.rt = state.rt || {};
  if (state.rt.room) { if (state.rt.room.name === code) return; state.rt.room.leave(); state.rt.room = null; }
  toast('단톡 궁합방에 연결하는 중…');
  const room = await joinTeamRoom(code, myCard(), {
    onMembers: (list) => {
      const before = (state.rt.members || []).length;
      state.rt.members = list;
      if (list.length > before && before) toast(`👋 새 친구가 궁합방에 들어왔어요 (${list.length}명)`);
      const typing = document.activeElement?.matches?.('[data-panel="compat"] input, [data-panel="compat"] select');
      if (state.lastTab === 'compat' && !typing) renderCompat();
    },
    onCheer: ({ from, msg }) => receiveCheers([{ id: from.code ? cheerId(myCode(), from.code, state.fortune.dateKey) : `room-${from.name}-${state.fortune.dateKey}`, name: from.name, msg, date: state.fortune.dateKey, at: Date.now() }]),
  });
  if (!room) { state.rt.roomCap = false; toast('이 화면에서는 실시간 방을 열 수 없어요. 추가한 친구들로 궁합 지도를 보여 드릴게요'); renderCompat(); return; }
  state.rt.roomCap = true;
  state.rt.room = room;
  state.rt.roomCheered = {};
  toast(`🟢 방 ${code}에 입장했어요. 초대 문구를 단톡방에 공유해 보세요!`);
  grow((g) => complete(g, state.fortune.dateKey, 'social', qBonus('social')));
  renderCompat();
}

function leaveRoom() {
  state.rt?.room?.leave();
  if (state.rt) { state.rt.room = null; state.rt.members = []; }
  renderCompat();
}

function liveCheer(i) {
  const m = liveMembers()[i];
  if (!m || m.me || !state.rt?.room) return;
  state.rt.roomCheered = state.rt.roomCheered || {};
  if (state.rt.roomCheered[m.code]) return;
  state.rt.roomCheered[m.code] = true;
  const key = state.cheerMsg || CHEER_MESSAGES[0].key;
  state.rt.room.cheer(m.code, key);
  // 방 밖에 있어도 받도록 우편함에도 남김
  state.rt.mailbox?.send(m.code, myCard(), key, state.fortune.dateKey).catch(() => {});
  grow((g) => complete(g, state.fortune.dateKey, 'social', qBonus('social')), `📣 ${m.name}에게 "${cheerText(key)}" 응원이 실시간으로 도착했어요!`);
  setTimeout(() => charge(state.saju.yongsin, 1, 'cheer-out', '💞 베푼 응원의 기운'), 2300);
  renderCompat();
}

function mailboxHTML() {
  const rt = loadRT(); const st = state.rt || {};
  const dk = state.fortune.dateKey;
  const used = rt.used.date === dk ? rt.used.n : 0;
  const online = st.mailbox && st.registered;
  const inbox = rt.inbox.slice(0, 5);
  return `<div class="card mailbox">
    <h3>📮 응원 우편함 <span class="tag">${online ? '🟢 실제 전달' : st.mailboxTried ? '로컬 체험' : '연결 중…'}</span></h3>
    <div class="rt-code">내 수호신 코드 <b class="code">${esc(myCode())}</b> <button class="ghost" type="button" id="btn-code-copy">코드 공유</button></div>
    <form class="rt-join" id="code-friend-form" autocomplete="off">
      <input name="code" type="text" maxlength="8" placeholder="친구의 수호신 코드" aria-label="친구 수호신 코드">
      <button class="primary" type="submit">코드로 친구 추가</button>
    </form>
    <p class="muted" style="font-size:0.78rem;margin:6px 0">받은 응원 오늘 <b>${used}/${CHEER_DAILY_LIMIT}</b> · 응원 1번마다 부족한 기운 ${ELEMENT_HANJA[state.saju.weakest]} ${ELEMENT_KO[state.saju.weakest]} +${CHEER_CHARGE} 충전</p>
    ${inbox.length ? `<ul class="inbox">${inbox.map((c) => `<li><b>${esc(c.name)}</b> ${esc(c.msg)} <span class="muted">${c.date === dk ? (c.charged ? '충전 완료' : '오늘 한도 초과') : esc(c.date)}</span></li>`).join('')}</ul>` : '<p class="muted" style="margin:0;font-size:0.82rem">아직 받은 응원이 없어요. 코드를 친구에게 보내 서로 응원을 주고받아 보세요!</p>'}
    ${online ? '' : '<p class="muted" style="font-size:0.72rem;margin:6px 0 0">실제 전달은 로그인된 미리보기·정식 앱에서 작동해요. 지금은 응원을 보내면 답례 응원을 바로 체험할 수 있어요.</p>'}
  </div>`;
}

async function addFriendByCode(raw) {
  const code = normalizeCode(raw);
  if (!code) { toast('수호신 코드는 6자리예요 (예: k3m9qa)'); return; }
  if (code === myCode()) { toast('내 코드예요. 친구의 코드를 넣어 주세요'); return; }
  const mb = state.rt?.mailbox;
  if (!mb) { toast('지금은 코드 조회를 쓸 수 없어요. 생일로 친구를 추가해 주세요'); return; }
  let card = null;
  try { card = await mb.lookup(code); } catch { /* 아래에서 안내 */ }
  if (!card) { toast('그 코드의 수호신을 찾지 못했어요. 친구가 앱을 한 번 열었는지 확인해 주세요'); return; }
  const list = load(FRIENDS_KEY, []).filter((f) => f.code !== code);
  list.unshift({ name: card.name, gender: card.gender, code, card });
  save(FRIENDS_KEY, list.slice(0, 12));
  state.compatIdx = 0;
  toast(`💞 ${card.name}의 ${ZODIAC[card.branch].name} 수호신과 친구가 되었어요!`);
  renderCompat();
  grow((g) => complete(g, state.fortune.dateKey, 'compat', qBonus('compat')));
  setTimeout(() => { processDexRewards(); renderCompat(); }, 50);
}

function friendSocialHTML(fr, idx) {
  const soc = load(SOC_KEY, { stickers: 0, cheers: {}, gifts: {} });
  const k = `${state.fortune.dateKey}|${fr.name}`;
  const cheered = soc.cheers?.[k]; const gifted = soc.gifts?.[k];
  return `<div class="react">
    <div class="dlg-title">📣 응원 · 🎁 선물</div>
    <div class="actions">
      <button class="${cheered ? 'ghost' : 'primary'}" type="button" data-cheer="${idx}" ${cheered ? 'disabled' : ''}>${cheered ? '오늘 응원 완료' : `📣 ${esc(fr.name)} 응원하기`}</button>
      <button class="ghost" type="button" data-gift="${idx}" ${gifted ? 'disabled' : ''}>${gifted ? '오늘 선물 완료' : '🎁 부적 선물하기'}</button>
    </div>
    ${fr.code && state.rt?.mailbox ? `<label class="rt-msg">응원 메시지 <select id="cheer-msg">${CHEER_MESSAGES.map((m) => `<option value="${m.key}" ${state.cheerMsg === m.key ? 'selected' : ''}>${esc(m.text)}</option>`).join('')}</select></label>
    <p class="muted" style="font-size:0.74rem;margin:6px 0 0">🟢 ${esc(fr.name)}의 우편함으로 <b>실제로 전달</b>돼요. 친구가 응원을 보내 주면 내 부족한 기운이 충전됩니다.</p>`
    : `<p class="muted" style="font-size:0.74rem;margin:6px 0 0">응원을 보내면 친구의 답례 응원이 돌아와 <b>내 부족한 기운이 충전</b>돼요. ${fr.code ? '(지금은 연결이 없어 답례를 바로 체험)' : '(생일로 추가한 친구는 체험 모드 · 📮 수호신 코드로 추가하면 실제 전달)'}</p>`}
  </div>`;
}

function doCheer(idx) {
  const fr = load(FRIENDS_KEY, [])[idx]; if (!fr) return;
  const soc = load(SOC_KEY, { stickers: 0, cheers: {}, gifts: {} }); soc.cheers = soc.cheers || {};
  const k = `${state.fortune.dateKey}|${fr.name}`; if (soc.cheers[k]) return;
  soc.cheers[k] = true; soc.cheerCount = (soc.cheerCount || 0) + 1; save(SOC_KEY, soc);
  const fs = friendSaju(fr);
  const mb = state.rt?.mailbox;
  if (fr.code && mb) {
    const key = state.cheerMsg || CHEER_MESSAGES[0].key;
    mb.send(fr.code, myCard(), key, state.fortune.dateKey)
      .then(() => {
        grow((g) => complete(g, state.fortune.dateKey, 'social', qBonus('social')), `📮 ${fr.name}의 우편함에 "${cheerText(key)}" 응원이 도착했어요!`);
        setTimeout(() => charge(state.saju.yongsin, 1, 'cheer-out', '💞 베푼 응원의 기운'), 2300);
      })
      .catch(() => {
        const s2 = load(SOC_KEY, { stickers: 0, cheers: {}, gifts: {} }); delete s2.cheers[k]; save(SOC_KEY, s2);
        toast('응원 전달에 실패했어요. 잠시 뒤 다시 보내 주세요'); renderCompat();
      });
    renderCompat();
    return;
  }
  grow((g) => complete(g, state.fortune.dateKey, 'social', qBonus('social')), `📣 ${fr.name}에게 응원을 보냈어요!`);
  setTimeout(() => charge(state.saju.weakest, 3, `cheer-${fr.name}`, `💞 ${fr.name}의 ${ZODIAC[fs.pillars.year.branch].name}가 답례 응원`), 2300);
  renderCompat();
}

function giftCardSVG(t, fr) {
  const c = characterInfo(state.saju, state.profile).concern;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 520" width="360" height="520"><rect width="360" height="520" rx="26" fill="#120c2a"/>
    <rect x="10" y="10" width="340" height="500" rx="20" fill="none" stroke="${RARITY_COLOR[t.rarity.key]}" stroke-width="3"/>
    <text x="180" y="46" font-size="16" font-weight="900" fill="#ffc93c" text-anchor="middle" font-family="'Noto Sans KR', sans-serif">🎁 12지신 강림 · 부적 선물</text>
    <g transform="translate(105 64) scale(0.5)">${renderTalismanSVG(t).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>
    <text x="180" y="360" font-size="18" font-weight="900" fill="#fff" text-anchor="middle" font-family="'Noto Sans KR', sans-serif">To. ${esc(fr.name)}</text>
    <text x="180" y="392" font-size="14" fill="#cfcaf2" text-anchor="middle" font-family="'Noto Sans KR', sans-serif">${esc(t.rarity.label)} ${esc(t.type.label)}부 · ${esc(t.type.meaning)}</text>
    <text x="180" y="430" font-size="15" fill="#ffe39a" text-anchor="middle" font-family="'Noto Sans KR', sans-serif">"네 앞길에 좋은 기운만 가득하길!"</text>
    <text x="180" y="470" font-size="13" fill="#9a94c4" text-anchor="middle" font-family="'Noto Sans KR', sans-serif">From. ${esc(state.profile.name || '친구')}</text></svg>`;
}

function doGift(idx) {
  const fr = load(FRIENDS_KEY, [])[idx]; if (!fr) return;
  const list = load(COLLECTION_KEY, []).slice(0, 6);
  if (!list.length) { toast('선물할 부적이 없어요. 운명 뽑기로 먼저 부적을 모아 보세요!'); return; }
  const el = document.createElement('div');
  el.className = 'evo-modal';
  el.innerHTML = `<div class="evo-box"><h3 style="margin-top:0">🎁 ${esc(fr.name)}에게 줄 부적 고르기</h3>
    <div class="equip-list">${list.map((r, i) => `<button type="button" data-pick="${i}">${renderTalismanSVG(charmFromRecord(r))}</button>`).join('')}</div>
    <p class="muted" style="font-size:0.75rem">하루 1번 무료 선물 · 친구 고민에 맞춘 맞춤 부적 선물(990원)은 정식 버전에서 제공</p>
    <button class="ghost" type="button" data-pick="x" style="width:100%">닫기</button></div>`;
  document.body.appendChild(el);
  el.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.pick === 'x') { el.remove(); return; }
    const t = charmFromRecord(list[Number(b.dataset.pick)]);
    const soc = load(SOC_KEY, { stickers: 0, cheers: {}, gifts: {} }); soc.gifts = soc.gifts || {};
    soc.gifts[`${state.fortune.dateKey}|${fr.name}`] = true; soc.giftCount = (soc.giftCount || 0) + 1; save(SOC_KEY, soc);
    el.remove();
    const card = giftCardSVG(t, fr);
    const m = document.createElement('div'); m.className = 'evo-modal';
    m.innerHTML = `<div class="evo-box"><div class="gift-card">${card}</div><div class="actions" style="justify-content:center"><button class="primary" type="button" data-g="png">선물 카드 저장</button><button class="ghost" type="button" data-g="copy">선물 문구 복사</button><button class="ghost" type="button" data-g="close">닫기</button></div></div>`;
    document.body.appendChild(m);
    m.querySelector('[data-g=png]').addEventListener('click', () => downloadSVGAsPNG(card, `gift-${fr.name}.png`, 2));
    m.querySelector('[data-g=copy]').addEventListener('click', async () => { const msg = `🎁 ${fr.name}에게 ${t.rarity.label} ${t.type.label}부(${t.type.hanja})를 선물했어! "${t.type.meaning}" ✦ 12지신 강림 ${location.href.split('?')[0].split('#')[0]}`; try { await navigator.clipboard.writeText(msg); toast('선물 문구를 복사했어요'); } catch { toast(msg); } });
    m.querySelector('[data-g=close]').addEventListener('click', () => { m.remove(); renderCompat(); });
    grow((g) => complete(g, state.fortune.dateKey, 'social', qBonus('social')), `🎁 ${fr.name}에게 부적을 선물했어요!`);
    setTimeout(() => charge(state.saju.yongsin, 2, 'gift', '🎁 베푼 기운'), 2300);
  }));
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

/** 첫 가입 직후: 나의 사주 한 장 요약 → 수호신 소환 (사주앱을 연 이유부터 먼저 해소) */
function showSajuCard() {
  const s = state.saju; const f = state.fortune; const L = f.layers;
  const prof = DAY_MASTER_PROFILE[s.dayMaster];
  const th = (p) => pillarTheme(s, p);
  const order = [['hour', '시'], ['day', '일'], ['month', '월'], ['year', '년']];
  const pillars = order.map(([k, cap]) => { const p = s.pillars[k]; return `<div class="sc-p"><small>${cap}</small>${p ? `<b>${STEMS[p.stem]}</b><b>${BRANCHES[p.branch]}</b>` : '<b>?</b><b>?</b>'}</div>`; }).join('');
  const els = s.elements.map((v, e) => `<i style="flex:${Math.max(v, 3)};background:${EL_COLORS[e]}" title="${ELEMENT_KO[e]} ${v}%"></i>`).join('');
  const el = document.createElement('div');
  el.className = 'evo-modal';
  el.innerHTML = `<div class="evo-box saju-card">
    <p class="muted" style="margin:0">${state.profile.name ? `${esc(state.profile.name)}님의` : '나의'} 사주 한 장 요약</p>
    <div class="sc-pillars">${pillars}</div>
    <h3 style="margin:8px 0 4px">${prof.image} 같은 사람 · ${prof.name}</h3>
    <p style="margin:0 0 8px;font-size:0.88rem;line-height:1.55">${prof.text}</p>
    <div class="sc-els">${els}</div>
    <p class="muted" style="font-size:0.76rem;margin:4px 0 10px">${s.elements.map((v, e) => `${ELEMENT_HANJA[e]}${v}`).join(' · ')} · 필요한 기운 ${ELEMENT_HANJA[s.yongsin]} ${ELEMENT_KO[s.yongsin]}</p>
    <ul class="sc-list">
      ${L.daewoon ? `<li><span>🏔️ 지금 대운</span><b>${L.daewoon.startAge}~${L.daewoon.endAge}세 · ${th(L.daewoon.pillar).theme}의 10년</b></li>` : ''}
      ${(() => { const nx = timelineData().next; return nx ? `<li><span>🎁 ${nx.sajuYear}년</span><b>${th(nx.year.pillar).god} · ${th(nx.year.pillar).theme} (${nx.year.score}점)</b></li>` : ''; })()}
      <li><span>📅 올해</span><b>${th(L.year.pillar).god} · ${th(L.year.pillar).theme} (${L.year.score}점)</b></li>
      <li><span>🌙 이달</span><b>${f.period.term}부터 · ${th(L.month.pillar).theme} (${L.month.score}점)</b></li>
      <li><span>☀️ 오늘</span><b>${f.info.title} (${f.scores.total}점)</b></li>
    </ul>
    <button class="primary" type="button" style="width:100%">🐉 이 사주를 지키는 수호신 만나기</button>
    <p class="muted" style="font-size:0.72rem;margin:8px 0 0">생년월일과 사주 원본은 이 기기에만 저장돼요.</p></div>`;
  document.body.appendChild(el);
  el.querySelector('button').addEventListener('click', () => { el.remove(); showSummon(); });
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

// ---------- 🧪 전체 미리보기 갤러리 (테스트용) ----------
// 12지신 캐릭터(띠 12 × 진화 14단계 × 성별 × 오행), 부적(종류 6 × 등급 5 × 테마 2), 이모티콘(표정 8 × 스타일 × 등급), 한정 소품 11종을 한 화면에서 확인
function galState() {
  state.gal = state.gal || { img: true, set: true, tab: 'char', stage: 2, gender: state.profile.gender || 'female', el: STEM_ELEMENT[state.saju.dayMaster], theme: 'neon', style: 'neon', rarity: 'epic', zodiac: state.saju.pillars.year.branch };
  return state.gal;
}

/** 견본용 사주: 띠(연지)와 오행(일간)만 바꾼 복사본 */
function galSaju(branch, el) {
  const s = state.saju;
  return { ...s, dayMaster: el * 2, pillars: { ...s.pillars, year: { ...s.pillars.year, branch } } };
}

function renderGallery() {
  const panel = $('[data-panel="gallery"]');
  if (!panel || !state.saju) return;
  const g = galState(); const f = state.fortune;
  const chip = (group, val, label, on) => `<button type="button" class="chip" data-gal-${group}="${val}" aria-pressed="${on}">${label}</button>`;
  const profile = { gender: g.gender, concern: state.profile.concern };
  const tabs = [['char', '🐉 12지신'], ['charm', '📜 부적'], ['emote', '😊 이모티콘'], ['season', '🏮 한정소품']];
  const stageChips = `<div class="gal-row"><span>진화</span><div class="chips">${STAGES.map((st) => chip('stage', st.stage, `${st.stage}`, g.stage === st.stage)).join('')}</div></div>`;
  const elChips = `<div class="gal-row"><span>오행</span><div class="chips">${[0, 1, 2, 3, 4].map((e) => chip('el', e, `${ELEMENT_HANJA[e]} ${ELEMENT_KO[e]}`, g.el === e)).join('')}</div></div>`;
  const genderChips = `<div class="gal-row"><span>성별</span><div class="chips">${chip('gender', 'female', '여성', g.gender === 'female')}${chip('gender', 'male', '남성', g.gender === 'male')}</div></div>`;
  const zChips = `<div class="gal-row"><span>띠</span><div class="chips">${ZODIAC.map((z, b) => chip('zodiac', b, z.name, g.zodiac === b)).join('')}</div></div>`;
  let controls = ''; let grid = '';
  if (g.tab === 'char') {
    controls = `<div class="gal-row"><span>그림</span><div class="chips">${chip('img', 'on', '이미지 우선', g.img)}${chip('img', 'off', '코드 그림만', !g.img)}</div></div>${stageChips}${elChips}${genderChips}`;
    grid = ZODIAC.map((z, b) => {
      const info = characterInfo(galSaju(b, g.el), profile);
      return `<figure class="gal-item">${renderCharacterSVG(info, { stage: g.stage, width: 150, backdrop: true, mood: 'smile', noImage: !g.img })}<figcaption><b>${z.name}(${z.hanja})</b><small>${stageName(g.stage, info.female)} · ${info.name}</small></figcaption></figure>`;
    }).join('');
  } else if (g.tab === 'charm') {
    controls = `<div class="gal-row"><span>테마</span><div class="chips">${chip('theme', 'classic', '전통 주사', g.theme === 'classic')}${chip('theme', 'neon', '네온 2099', g.theme === 'neon')}</div></div>${elChips}`;
    grid = TALISMAN_TYPES.map((t) => RARITIES.map((r) => {
      const tl = createTalisman(state.saju, f, { type: t.key, rarity: r.key, theme: g.theme, element: g.el });
      return `<figure class="gal-item charm">${renderTalismanSVG(tl)}<figcaption><b style="color:${r.color}">${r.label}</b><small>${t.label}부 · ${r.key === 'common' ? '글자만' : EMBLEM_NAME[t.key]}${r.key === 'epic' ? '+팔괘' : r.key === 'legend' ? '+금빛 날개' : r.key === 'myth' ? '+12지신 고리' : ''}</small></figcaption></figure>`;
    }).join('')).join('');
  } else if (g.tab === 'emote') {
    controls = `<div class="gal-row"><span>스타일</span><div class="chips">${chip('style', 'neon', '네온', g.style === 'neon')}${chip('style', 'sticker', '스티커', g.style === 'sticker')}</div></div><div class="gal-row"><span>등급</span><div class="chips">${RARITIES.map((r) => chip('rarity', r.key, r.label, g.rarity === r.key)).join('')}</div></div>${zChips}${stageChips}`;
    grid = EMOTES.map((e) => `<figure class="gal-item">${renderEmoticonSVG(galSaju(g.zodiac, g.el), f, { mood: e.key, style: g.style, rarity: g.rarity, stage: g.stage, profile, caption: e.label })}<figcaption><b>${e.label}</b><small>${MOOD_PROP[e.key]}</small></figcaption></figure>`).join('');
  } else {
    controls = `<div class="gal-row"><span>구성</span><div class="chips">${chip('set', 'item', '무료 소품만', !g.set)}${chip('set', 'set', '꾸미기 세트(장면+효과)', g.set)}</div></div>${zChips}${stageChips}${genderChips}`;
    grid = Object.entries(SEASON_PACKS).map(([k, pk]) => {
      const info = characterInfo(galSaju(g.zodiac, g.el), profile);
      return `<figure class="gal-item">${renderCharacterSVG(info, { stage: g.stage, width: 150, backdrop: true, mood: 'excited', season: { key: k, effect: g.set } })}<figcaption><b>${itemThumb(k)}${pk.item}</b><small>${g.set ? `${SCENE_NAME[k]} · ` : ''}${pk.theme}</small></figcaption></figure>`;
    }).join('');
  }
  panel.innerHTML = `
    <div class="card gallery">
      <h3>🧪 전체 미리보기 <span class="tag">테스트용</span></h3>
      <p class="muted" style="margin:-4px 0 10px;font-size:0.82rem">보유 여부와 상관없이 모든 디자인을 확인하는 화면이에요. 여기서 고른 값은 내 캐릭터·저장 데이터에 영향을 주지 않아요. 주소 끝에 <code>?gallery=1</code>을 붙이면 바로 열려요.</p>
      <div class="gal-tabs">${tabs.map(([k, l]) => `<button type="button" data-gal-tab="${k}" aria-pressed="${g.tab === k}">${l}</button>`).join('')}</div>
      <div class="gal-controls">${controls}</div>
      <div class="gal-grid ${g.tab}">${grid}</div>
    </div>`;
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-gal-img],[data-gal-set],[data-gal-tab],[data-gal-stage],[data-gal-el],[data-gal-gender],[data-gal-theme],[data-gal-style],[data-gal-rarity],[data-gal-zodiac]');
  if (!b) return;
  const g = galState(); const d = b.dataset;
  if (d.galImg) g.img = d.galImg === 'on';
  if (d.galSet) g.set = d.galSet === 'set';
  if (d.galTab) g.tab = d.galTab;
  if (d.galStage) g.stage = Number(d.galStage);
  if (d.galEl) g.el = Number(d.galEl);
  if (d.galGender) g.gender = d.galGender;
  if (d.galTheme) g.theme = d.galTheme;
  if (d.galStyle) g.style = d.galStyle;
  if (d.galRarity) g.rarity = d.galRarity;
  if (d.galZodiac) g.zodiac = Number(d.galZodiac);
  renderGallery();
});

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

function freeBonus() {
  const streak = load(GROWTH_KEY, null)?.streak?.count || 0;
  const streakBonus = streak > 0 && streak % 7 === 0 ? 1 : 0;
  const fest = festivalStatus(state.fortune.date).active ? 1 : 0;
  return { total: streakBonus + fest, streakBonus, fest, streak };
}

function dailyCardHTML() {
  const g = loadGacha();
  const fb = freeBonus();
  const left = drawsLeft(g, state.fortune.dateKey, fb.total);
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
        <p class="muted" style="margin:4px 0 0;font-size:0.82rem">무료 <b>${left.free}</b>/${left.freeAllowed}${fb.streakBonus ? ' (🔥 7일 연속 보너스 +1)' : ''}${fb.fest ? ' (🏮 축제 보너스 +1)' : ''} · 추가 <b>${left.extra}</b>/${left.extraAllowed || EXTRA_PER_DAY}${sub ? ' · 👑 수호 구독 중' : g.extraBought ? ' · 오늘 추가권 사용 중' : ''}</p>
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
  const left = drawsLeft(g, state.fortune.dateKey, freeBonus().total);
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
  const abAvg = Math.round((ab.cat.total + ab.cat.wealth + ab.cat.love + ab.cat.career + ab.cat.health) / 5);
  // 정통 기본값은 오늘 운세와 같은 층 엔진(period.js)에서: 이달 = 월운 60% + 올해(세운 70% + 대운 30%) 40%
  const midYear = layersAt(s, { year: y, month: 7, day: 1 }, state.profile.gender);
  const yScore = midYear.year.score;
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const L = layersAt(s, { year: y, month: m, day: 15 }, state.profile.gender);
    const mp = L.month.pillar;
    const per = monthPeriod({ year: y, month: m, day: 15 });
    const base = L.month.score;
    const habit = (index / 100) * 12 * (1 + i * 0.03);
    const improved = Math.min(99, Math.round(base + habit + abAvg + (stage >= 5 ? 6 : 0)));
    const god = tenGod(s.dayMaster, mp.stem);
    const cats = MONTH_GOD_MOD[god].map((v) => Math.max(10, Math.min(99, base + v))); // 분야별도 정통값 기준
    const el = STEM_ELEMENT[mp.stem];
    const mission = el === s.yongsin ? `용신 ${ELEMENT_HANJA[el]}의 달! 이달엔 ${ELEMENT_KO[el]} 기운 부적을 장착해 흐름을 타세요.`
      : el === s.gisin ? `${ELEMENT_HANJA[el]} 기운이 강한 달입니다. 용신 ${ELEMENT_HANJA[s.yongsin]} 부적으로 균형을 잡으세요.`
        : `이달의 개운 포인트는 ${ELEMENT_HANJA[s.weakest]} ${ELEMENT_KO[s.weakest]} 기운 채우기입니다.`;
    return { m, pillar: mp, base, improved, god, theme: pillarTheme(s, mp).theme, cats, mission, start: per.start, end: per.end, term: per.term, why: explainParts(L.month.parts) };
  });
  const sorted = [...months].sort((a, b) => b.base - a.base);
  return { year: y, yp, yScore, yLayer: midYear.year, dwLayer: midYear.daewoon, months, best: sorted.slice(0, 3), caution: sorted.slice(-2), avgBase: Math.round(months.reduce((a, b) => a + b.base, 0) / 12), avgImp: Math.round(months.reduce((a, b) => a + b.improved, 0) / 12), index };
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
        <text x="${x + (bw - 6) / 2}" y="${y(mo.improved) - 3}" font-size="8.5" fill="#fff" text-anchor="middle">${mo.base}</text>
        <text x="${x + (bw - 6) / 2}" y="${H - 10}" font-size="9" fill="${now ? '#ff8fb3' : '#cfcaf2'}" text-anchor="middle" font-weight="${now ? 800 : 400}">${mo.m}월</text>`;
    }).join('')}
  </svg>`;
}

function renderReport() {
  const panel = $('[data-panel="report"]');
  if (!panel || !state.saju) return;
  const r = monthlyReport();
  // 지금 진행 중인 달 = 절기월 (예: 11/2는 아직 입동 전이라 10월·한로월)
  const cur = state.fortune.period?.solarMonth || state.fortune.date.month;
  const sub = isSubscribed(loadGacha(), state.fortune.dateKey);
  const sel = state.reportMonth || cur;
  const mo = r.months[sel - 1];
  const free = sel === cur || sel === cur + 1 || sub;
  const th = pillarTheme(state.saju, r.yp);
  panel.innerHTML = `
    <div class="card">
      <h3>📅 ${r.year}년 운세 리포트 <span class="tag">${pillarLabelFull(r.yp)}년</span></h3>
      <div class="report-head">
        <div class="luck-ring" style="--p:${r.yScore}"><b>${r.yScore}</b><span>올해 운(정통)</span></div>
        <div>
          <p style="margin:0"><b>올해의 테마: ${th.god} · ${th.theme}</b></p>
          <p class="muted" style="margin:4px 0 0;font-size:0.84rem">올해 = 세운 ${r.yLayer.base}${r.dwLayer ? ` × 70% + 대운 ${r.dwLayer.score} × 30%` : ''} · 달 평균 <b>${r.avgBase}</b></p>
          <p class="muted" style="margin:2px 0 0;font-size:0.8rem">🎮 개운 반영(게임) 평균 <b style="color:var(--gold)">${r.avgImp}</b> · 개운 지수 ${r.index}</p>
          <p style="margin:6px 0 0;font-size:0.85rem">🌟 좋은 달: ${r.best.map((b) => `<b>${b.m}월</b>`).join(' · ')} &nbsp; ⚠️ 조심할 달: ${r.caution.map((b) => `${b.m}월`).join(' · ')}</p>
        </div>
      </div>
      ${monthChartSVG(r, cur)}
      <div class="fc-legend"><span><i style="background:#9a94c4"></i>정통 기본 (숫자)</span><span><i style="background:#ffc93c"></i>개운으로 더해진 몫(게임)</span><span><i style="background:#ff8fb3"></i>이번 달</span></div>
    </div>
    <div class="card">
      <div class="month-grid">${r.months.map((x) => `<button type="button" class="mcell ${x.m === sel ? 'sel' : ''} ${x.m === cur ? 'now' : ''} ${x.m < cur ? 'past' : ''}" data-month="${x.m}" style="--h:${x.base}"><b>${x.m}월</b><span>${x.base}</span><small>${STEMS[x.pillar.stem]}${BRANCHES[x.pillar.branch]} · ${x.start.month}/${x.start.day}~</small></button>`).join('')}</div>
    </div>
    <div class="card">
      <h3>${sel}월 상세 <span class="tag">${pillarLabelFull(mo.pillar)}월 · ${mo.god}</span></h3>
      <p class="muted" style="margin:-4px 0 6px;font-size:0.82rem">📆 ${mo.term} ${mo.start.month}/${mo.start.day} ~ ${mo.end.month}/${mo.end.day} (월운은 절입일부터 바뀌어요)</p>
      <p style="margin-top:0">${mo.theme}의 기운이 흐르는 달입니다. 정통 <b>${mo.base}</b>${mo.improved > mo.base ? ` · 🎮 개운 반영 <b style="color:var(--gold)">${mo.improved}</b>` : ''}${mo.m < cur ? ' (지난 달)' : mo.m === cur ? ' · 지금 진행 중' : ''}</p>
      <p class="why-calc" style="margin:0 0 8px">근거: ${mo.why}</p>
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
  // 정통 점수(scores)는 그대로 두고, 게임용 점수(gameScores)에만 능력 보너스를 더한다
  const gameScores = { ...fortune.scores };
  Object.entries(ab.cat).forEach(([k, v]) => { if (v && gameScores[k] !== undefined) gameScores[k] = Math.min(98, gameScores[k] + v); });
  return { ...fortune, gameScores, abilityBonus: ab.cat };
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
  const prev = loadGrowth();
  const res = fn(prev);
  save(GROWTH_KEY, res.growth);
  const msgs = [];
  if (state.fortune) {
    const dk = state.fortune.dateKey;
    const fresh = Object.keys(res.growth.quests?.[dk] || {}).filter((k) => !prev.quests?.[dk]?.[k]);
    msgs.push(...seasonTick(fresh));
  }
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
    <p class="muted" style="margin:4px 0 0;font-size:0.8rem">말투: ${pers.voice} · 자기 호칭: "${pers.me}"${heroOptions().stage === 1 ? ' · 아기 단계라 말 앞에 🍼가 붙어요' : heroOptions().stage >= 5 ? ' · 신수가 되어 말에 위엄(✦)이 생겼어요' : ''}</p>
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
    <p class="muted" style="font-size:0.78rem;margin:8px 0 0">${gs.nextReward ? `🔥 ${gs.nextReward.days}일 연속 출석하면: ${gs.nextReward.label}` : '모든 연속 출석 보상을 받았습니다!'} · 🎁 7일마다(7·14·21일…) 무료 뽑기 +1</p>
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
    state.fortune = applyAbilities(computeFortune(state.saju, undefined, { gender: state.profile.gender }));
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
  const { charms, emote, season } = heroOptions();
  const before = renderCharacterSVG(info, { stage: from, width: 260, mood: 'wow', backdrop: true });
  const after = renderCharacterSVG(info, { stage: to, width: 260, mood: 'excited', charms, emote, season, backdrop: true, animate: true });
  const el = document.createElement('div');
  el.className = 'evo-modal';
  el.innerHTML = `<div class="evo-box">
    <p class="muted" style="margin:0">EVOLUTION</p>
    <div class="evo-stage"><div class="evo-before">${before}</div><div class="evo-after">${after}</div><div class="evo-flash"></div></div>
    <h3>${info.zodiac.name}가 <span style="color:var(--gold)">${stageName(to, info.female)}</span>(으)로 진화했습니다!</h3>
    <p class="muted">${STAGES[to - 1].desc}</p>
    ${speechBubble([speak(zIdx(), 'evolve', { stage: to })])}
    <div class="perks" style="justify-content:center">${STAGE_UNLOCKS[to - 1].perks.map((x) => `<em>✨ ${x}</em>`).join('')}</div>
    <div class="actions" style="justify-content:center"><button class="primary" type="button" data-evo="ok">확인</button><button class="ghost" type="button" data-evo="share">📸 진화 공유 카드</button></div></div>`;
  document.body.appendChild(el);
  el.querySelector('[data-evo=ok]').addEventListener('click', () => { el.remove(); renderHero(true); renderEmoji(); });
  el.querySelector('[data-evo=share]').addEventListener('click', () => { el.remove(); renderHero(false); state.storyTemplate = 'evolve'; selectTab('story'); });
}

// ---------- 친구 궁합 ----------

function friendSaju(fr) {
  if (fr.card) { const c = cleanCard(fr.card); return c ? cardToSaju(c) : { error: '친구 카드 정보가 올바르지 않아요' }; }
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
    ${mailboxHTML()}
    ${teamCardHTML()}
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
  $$('[data-cheer]', panel).forEach((b) => b.addEventListener('click', () => doCheer(Number(b.dataset.cheer))));
  $$('[data-gift]', panel).forEach((b) => b.addEventListener('click', () => doGift(Number(b.dataset.gift))));
  $('#btn-code-copy', panel)?.addEventListener('click', () => copyText(`🐾 내 12지신 수호신 코드: ${myCode()} — 코드로 친구 추가하고 서로 응원 보내자! ✦ 12지신 강림 ${appUrl()}`, '수호신 코드를 복사했어요. 친구에게 보내 보세요!'));
  $('#code-friend-form', panel)?.addEventListener('submit', (e) => { e.preventDefault(); addFriendByCode(e.target.code.value); });
  $('#room-form', panel)?.addEventListener('submit', (e) => { e.preventDefault(); const c = normalizeCode(e.target.code.value); if (!c) { toast('방 코드는 6자리예요'); return; } enterRoom(c); });
  $('#btn-room-new', panel)?.addEventListener('click', () => enterRoom(makeCode()));
  $('#btn-room-leave', panel)?.addEventListener('click', leaveRoom);
  $('#btn-room-invite', panel)?.addEventListener('click', () => copyText(`👥 12지신 강림 단톡 궁합방 열었어! 방 코드 ${state.rt.room.name} — 들어오면 우리 궁합 지도가 실시간으로 그려져 ✦ ${appUrl()}?room=${state.rt.room.name}`, '초대 문구를 복사했어요. 단톡방에 붙여 넣어 보세요!'));
  $$('#cheer-msg', panel).forEach((sel) => sel.addEventListener('change', () => { state.cheerMsg = sel.value; }));
  $$('[data-live-cheer]', panel).forEach((b) => b.addEventListener('click', () => liveCheer(Number(b.dataset.liveCheer))));
  $('#btn-team-png', panel)?.addEventListener('click', () => downloadSVGAsPNG(teamSVG(state.team), 'team-compat.png', 2));
  $('#btn-team-invite', panel)?.addEventListener('click', async () => { const msg = `👥 우리 단톡방 궁합 지도 나왔다! 오늘의 행운 멤버는 ${state.team.mem[state.team.lucky].name} 👑 너도 띠 넣고 들어와 ✦ 12지신 강림 ${location.href.split('?')[0].split('#')[0]}`; try { await navigator.clipboard.writeText(msg); toast('초대 문구를 복사했어요. 단톡방에 붙여 넣어 보세요!'); } catch { toast(msg); } });
  $('#btn-team-charm', panel)?.addEventListener('click', () => {
    const t = createTalisman(state.saju, state.fortune, { type: 'luck', theme: 'neon', element: state.team.teamWeak, rarity: 'rare', reroll: 'team' });
    const added = charge(state.team.teamWeak, 4, 'team', '👥 팀 부적');
    if (!added) { toast('팀 부적은 하루에 한 번 받을 수 있어요'); return; }
    const list = load(COLLECTION_KEY, []); list.unshift({ ...recordOf(t), label: `팀 ${t.rarity.label} 행운부` }); save(COLLECTION_KEY, list.slice(0, 80));
  });
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
    ${friendSocialHTML(fr, idx)}
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
    hero: { info: characterInfo(state.saju, state.profile), ...heroOptions(), stageName: stageName(heroOptions().stage, characterInfo(state.saju, state.profile).female), year: state.fortune.date.year, quote: say('tier', { tier: state.fortune.tier, vars: { score: state.fortune.scores.total } }) },
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
