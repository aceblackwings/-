// v0.70 로그인 없이 기록 지키기: 결제 뒤 백업 안내 · 오래되면 다시 · 나중에 7일 · 가입 화면에서 가져오기
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as B from '../js/backup.js';
import { toneProblems } from '../js/habit.js';
import { josaProblems } from '../js/josa.js';

const lantern = (k) => ({ paid: 'lantern', madeKey: k, wish: '합격' });
const wish = (k) => ({ paid: 'gold', madeKey: k, wish: '건강' });

test('안내 조건: 산 것이 없으면 없음 · 결제 뒤 백업 전 = paid · 백업하면 사라짐 · 30일 뒤 stale', () => {
  assert.equal(B.backupNeed({}, [{ type: 'luck' }], '2026-11-12'), null, '무료 부적만 있으면 안내 안 함');
  assert.equal(B.backupNeed({}, [lantern('2026-11-12')], '2026-11-12'), 'paid');
  let info = B.markBackedUp({}, '2026-11-12');
  assert.equal(B.backupNeed(info, [lantern('2026-11-12')], '2026-11-12'), null, '같은 날 백업하면 끝');
  assert.equal(B.backupNeed(info, [lantern('2026-11-12'), wish('2026-11-20')], '2026-11-20'), 'paid', '그 뒤 또 사면 다시');
  assert.equal(B.backupNeed(info, [lantern('2026-11-12')], '2026-12-11'), null);
  assert.equal(B.backupNeed(info, [lantern('2026-11-12')], '2026-12-12'), 'stale');
  assert.equal(B.daysSinceBackup(info, '2026-12-12'), 30);
  info = B.snoozeBackup(info, '2026-12-12');
  assert.equal(B.backupNeed(info, [lantern('2026-11-12')], '2026-12-18'), null, '나중에 = 7일 쉼');
  assert.equal(B.backupNeed(info, [lantern('2026-11-12')], '2026-12-19'), 'stale');
  assert.equal(B.markBackedUp(info, '2026-12-19').snooze, null);
});

test('안내 문장·백업 요약: 조사·금지어 없음, 생년월일 안 드러남', () => {
  const info = B.markBackedUp({}, '2026-11-12');
  for (const s of [B.backupNudgeLine('paid', {}, '2026-11-12'), B.backupNudgeLine('stale', info, '2026-12-20')]) {
    assert.ok(s.length > 10); assert.deepEqual(josaProblems(s), [], s); assert.deepEqual(toneProblems(s), [], s);
  }
  const bk = B.makeBackup({ 'unmyeong2099.collection': JSON.stringify([lantern('2026-11-12'), wish('2026-11-12'), wish('2026-11-13'), { type: 'luck' }]) });
  assert.equal(B.backupSummary(bk), '100일 등불 1개 · 소원 부적 2장');
  assert.equal(B.backupSummary(B.makeBackup({})), '');
  assert.equal(B.BACKUP_INFO_KEY.startsWith(B.PREFIX), true, '백업 날짜도 백업 안에 같이 옮겨짐');
});

test('화면 연결: 지신 탭 접힘·홈 안내·가입 첫 화면 가져오기·서버로 안 보냄', () => {
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(app.includes("foldHTML('backup', '📦', '기록 백업 · 새 폰으로 옮기기'"));
  assert.equal((app.match(/\$\{backupNudgeHTML\(\)\}/g) || []).length, 2, '홈과 지신 탭');
  assert.ok(/data-bk-file/.test(html) && /data-bk="import"/.test(html), '가입 첫 화면에서 가져오기');
  const bk = app.slice(app.indexOf('// ---------- 백업 (v0.23 → v0.70)'), app.indexOf('// ---------- 12지신 신수 카드'));
  assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon/.test(bk), '백업은 서버로 보내지 않음');
  assert.ok(bk.includes('navigator.share'), '폰은 공유 창');
  assert.ok(bk.includes('생년월일이 들어 있어요'), '다른 사람에게 보내지 말라는 안내');
});
