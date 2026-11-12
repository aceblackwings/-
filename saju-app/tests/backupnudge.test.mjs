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

test('v0.70.1 카카오톡으로 보낼 수 있게: 백업 파일은 .txt(text/plain), 가져오기는 .txt·.json 둘 다', () => {
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.equal(B.BACKUP_MIME, 'text/plain');
  assert.ok(B.backupFileName(B.makeBackup({})).endsWith('.txt'));
  const save = app.slice(app.indexOf('async function saveBackupFile('), app.indexOf("document.addEventListener('click', async (e) => {", app.indexOf('async function saveBackupFile(')));
  assert.ok(!save.includes('application/json'), '공유하는 파일 형식에 json을 쓰지 않음');
  for (const src of [app, html]) assert.ok(src.includes('accept=".txt,.json,text/plain,application/json"'));
  // 예전 .json 백업 내용도 그대로 읽힘
  const old = B.backupText(B.makeBackup({ 'unmyeong2099.profile': '{"name":"a"}' }));
  assert.equal(B.parseBackup(old).ok, true);
});

test('v0.70.2 카카오톡엔 파일 대신 백업 코드(글자): 줄였다 풀면 그대로, 메시지 통째로 붙여도 됨, 잘리면 안내', async () => {
  const col = Array.from({ length: 30 }, (_, i) => ({ paid: i % 2 ? 'gold' : 'lantern', wish: `소원 ${i}번 꼭 이루어지기`, madeKey: '2026-11-12' }));
  const b = B.makeBackup({ 'unmyeong2099.profile': JSON.stringify({ name: '민지', year: 1992 }), 'unmyeong2099.collection': JSON.stringify(col) });
  const code = await B.packBackup(b);
  assert.ok(code.startsWith(B.CODE_PREFIX)); assert.ok(code.length < B.backupText(b).length, '원래 글자보다 짧음');
  const msg = B.backupMessage(code, b.savedAt);
  assert.ok(msg.includes('다른 사람에게 보내지 마세요'));
  const back = await B.unpackBackup(`카카오톡에서 복사\n${msg}\n오후 3:12`);
  assert.equal(B.parseBackup(back).ok, true); assert.equal(B.backupSummary(JSON.parse(back)), '100일 등불 15개 · 소원 부적 15장');
  assert.equal(await B.unpackBackup(B.backupText(b)), B.backupText(b), '코드가 아니면 예전 백업 글자 그대로');
  await assert.rejects(B.unpackBackup(code.slice(0, 40)), /잘렸거나/);
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  const save = app.slice(app.indexOf('async function saveBackupFile('), app.indexOf('/** 백업 코드 복사'));
  assert.ok(save.includes('navigator.share({ text: msg })') && !save.includes('files:'), '폰 공유는 글자로');
});
