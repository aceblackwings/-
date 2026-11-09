import { IDEAS, PRACTICE_POINTS, weekDays, monthDays, habitTotals, milestones } from './practice.js';
export const escapeHTML = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const E = escapeHTML;
export function practiceCard({ store, today, picture, progress, editing = false, notice = '' }) {
  const done = store.entries[today]; const resting = store.rests[today]; const h = store.current;
  let body;
  if (!h || editing) {
    body = `<p class="pr-muted">이미 하는 일 뒤에 작은 행동 하나를 붙여 보세요. 한 가지면 충분해요.</p>
      <div class="pr-ideas">${IDEAS.map(h => `<button class="pr-idea" type="button" data-pr-idea="${h.id}"><span>${h.icon}</span><b>${E(h.title)}</b><small>${E(h.cue)}</small></button>`).join('')}</div>
      ${(store.legacy.list || []).filter(Boolean).length ? `<details class="pr-legacy"><summary>예전에 고른 습관에서 이어가기</summary>${store.legacy.list.filter(Boolean).map((h,i) => `<button type="button" class="ghost" data-pr-legacy="${i}">${E(h)}</button>`).join('')}</details>` : ''}
      <form id="practice-form"><label>언제 할까요?<input name="cue" maxlength="60" required placeholder="예: 휴대전화를 충전기에 꽂으면" value="${E(h?.cue)}"></label>
      <label>아주 작게 무엇을 할까요?<input name="habit" maxlength="40" required placeholder="예: 책 한 쪽 읽기" value="${E(h?.title)}"></label>
      <button type="submit" class="primary">이 습관으로 함께하기</button>${h ? '<button type="button" class="ghost" data-pr-cancel>그대로 두기</button>' : ''}</form>`;
  } else if (done) {
    body = `<div class="pr-finished"><span class="pr-check">✓</span><h3>오늘은 여기까지, 잘했어요.</h3><p>${E(done.title)}</p><p>실천을 기록해서 지신 성장 +${done.points}</p></div>
      <p class="pr-muted">나머지 시간은 편안하게 보내세요.</p><button class="linkish" type="button" data-pr-undo="${today}">잘못 눌렀어요 · 오늘 기록 취소</button>`;
  } else if (resting) {
    body = `<h3>오늘은 편안히 쉬어요.</h3><p>함께 쌓은 시간은 그대로 남아 있어요.</p><button type="button" class="ghost" data-pr-resume>지금 해 볼래요</button>`;
  } else {
    body = `<p class="pr-cue">${E(h.cue)}</p><h3 class="pr-action">${E(h.title)}</h3>${h.setup ? `<p class="pr-muted">${E(h.setup)}</p>` : ''}
      <p class="pr-muted">해 본 뒤 알려 주세요. 오늘 한 번의 실천으로 함께 자라요.</p>
      <div class="pr-actions"><button type="button" class="primary" data-pr-done>했어요 · 함께 자라기</button><button type="button" class="ghost" data-pr-rest>오늘은 쉬기</button></div>`;
  }
  return `<section class="card practice-card" id="practice-card"><div class="pr-heading"><div><small>하루에 하나, 함께 천천히</small><h2>지신과 함께하는 작은 습관</h2></div>${h && !editing ? '<button class="linkish" type="button" data-pr-edit>습관 바꾸기</button>' : ''}</div>
    <div class="pr-companion">${picture}<div>${progress}<p class="pr-muted">내 실천이 지신의 성장으로</p></div></div>
    <div class="pr-notice" role="status" aria-live="polite">${E(notice)}</div>${body}</section>`;
}
export function recordsHTML({ store, today, month, selected, calendarOpen = false }) {
  const week = weekDays(today); const count = week.filter(d => store.entries[d]).length;
  const days = monthDays(month); const offset = (new Date(`${month}-01T12:00:00Z`).getUTCDay() + 6) % 7;
  const entry = store.entries[selected]; const total = Object.keys(store.entries).length;
  const legacyRows = Object.entries(store.legacy.checks || {}).filter(([,r]) => Array.isArray(r) && r.some(Boolean)).sort(([a],[b]) => b.localeCompare(a));
  return `<section class="card practice-records" id="practice-records"><small>함께한 날은 사라지지 않아요</small><h2>함께한 기록</h2><p>이번 주 <b>${count}일</b>, 지금까지 <b>${total}일</b> 실천을 기록했어요.</p>
    <div class="pr-week">${week.map((d,i)=>`<div class="${store.entries[d]?'done':''}"><small>${'월화수목금토일'[i]}</small><span aria-label="${d} ${store.entries[d]?'실천 기록 있음':d>today?'아직 오지 않은 날':'기록 없음'}">${store.entries[d]?'🌱':'·'}</span></div>`).join('')}</div>
    <p class="pr-muted">빈 날은 기록이 없는 날이에요. 쉬어도 성장은 줄지 않아요.</p>
    <details id="practice-calendar" ${calendarOpen?'open':''}><summary>달력으로 보기</summary>
      <div class="pr-month-nav"><button class="ghost" type="button" data-pr-month="-1" aria-label="이전 달">‹</button><h3>${month.slice(0,4)}년 ${Number(month.slice(5))}월</h3><button class="ghost" type="button" data-pr-month="1" aria-label="다음 달" ${month>=today.slice(0,7)?'disabled':''}>›</button></div>
      <div class="pr-calendar">${[...'월화수목금토일'].map(d=>`<small>${d}</small>`).join('')}${'<span></span>'.repeat(offset)}${days.map(d=>`<button type="button" class="pr-day ${store.entries[d]?'done':''} ${d===selected?'selected':''}" data-pr-day="${d}" aria-label="${d}, ${store.entries[d]?'실천 기록 있음':'기록 없음'}" ${d>today?'disabled':''}><span>${Number(d.slice(8))}</span><small>${store.entries[d]?'🌱':'·'}</small></button>`).join('')}</div>
      <div class="pr-day-detail" role="status"><b>${E(selected)}</b>${entry?`<p>${E(entry.cue)} · ${E(entry.title)}</p><p>지신 성장 +${entry.points}</p><button class="linkish" type="button" data-pr-undo="${selected}">이 기록 취소하기</button>`:'<p>이날 남긴 실천 기록이 없어요.</p>'}</div>
      ${habitTotals(store,month).map(h=>`<p class="pr-count">${E(h.title)} <b>${h.days}일</b></p>`).join('')}
    </details>
    ${milestones(store).length ? `<details class="pr-legacy"><summary>지신과 함께 자란 순간</summary>${milestones(store).map(m=>`<p><b>${m.day} · ${m.stage}단계</b><br>${E(m.title)} 실천을 기록한 날이에요. 함께 남긴 실천 ${m.count}일째.</p>`).join('')}</details>` : ''}
    ${legacyRows.length ? `<details class="pr-legacy"><summary>이전 버전의 습관 기록 · ${legacyRows.length}일 보관</summary><p class="pr-muted">이전 방식으로 남긴 기록이에요. 기존 성장은 보존했으며 경험치를 다시 지급하지 않아요. 당시 습관 이름은 확인할 수 없어 체크 수만 표시해요.</p>${legacyRows.map(([d,r])=>`<p>${E(d)} · ${r.filter(Boolean).length}가지 기록</p>`).join('')}</details>`:''}
  </section>`;
}
