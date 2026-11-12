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
  assert.ok(bk.includes('a.download'), '백업은 파일로 저장(v0.70.3 사용자 결정)');
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

test('v0.70.3 백업 버튼은 「지금 백업하기」 하나 = 파일로 저장(공유·복사 없음)', () => {
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  const card = app.slice(app.indexOf('function backupCardHTML('), app.indexOf('/** 가져오기 칸'));
  assert.equal((card.match(/data-bk="/g) || []).length, 1, '카드 안 버튼은 지금 백업하기 하나');
  assert.ok(card.includes('data-bk="save"') && !card.includes('data-bk="copy"'), '글자로 복사 없음');
  const save = app.slice(app.indexOf('function saveBackupFile('), app.indexOf('/** 가져오기(파일'));
  assert.ok(save.includes('a.download = name') && !save.includes('navigator.share') && !save.includes('clipboard'), '파일 내려받기만(앱 안 브라우저는 옮기기 창으로)');
  assert.ok(!/act === 'copy'/.test(app), '복사 처리도 없음');
});

test('v0.70.4 카카오톡 안 브라우저: 내려받기 대신 크롬·사파리로 기록 옮기기', async () => {
  assert.equal(B.inAppBrowser('Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36;KAKAOTALK 2410800'), 'kakao');
  assert.equal(B.inAppBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 KAKAOTALK 10.8.0'), 'kakao');
  assert.equal(B.inAppBrowser('Mozilla/5.0 (Linux; Android 14) Chrome/120 Mobile Safari/537.36'), null, '크롬은 그대로 내려받기');
  assert.equal(B.inAppBrowser('Mozilla/5.0 (iPhone) Version/17.0 Mobile/15E148 Safari/604.1'), null, '사파리도');
  assert.ok(B.externalOpenUrl('kakao', 'https://12jisin.ockstar.com/#bk=x').startsWith('kakaotalk://web/openExternal?url=https%3A%2F%2F12jisin'));
  const b = B.makeBackup({ 'unmyeong2099.profile': JSON.stringify({ name: '민지' }), 'unmyeong2099.collection': JSON.stringify([{ paid: 'lantern', wish: '합격' }]) });
  const code = await B.packBackup(b);
  const viaHash = decodeURIComponent(encodeURIComponent(B.MOVE_HASH + code)).slice(B.MOVE_HASH.length);
  assert.equal(B.parseBackup(await B.unpackBackup(viaHash)).ok, true, '주소 # 뒤로 넘겨도 그대로');
  await assert.rejects(B.unpackBackup(code.slice(0, 30)), /잘렸거나/);
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  const save = app.slice(app.indexOf('function saveBackupFile('), app.indexOf('/** 가져오기(파일'));
  assert.ok(save.indexOf('inAppBrowser(') < save.indexOf('a.download'), '앱 안 브라우저면 내려받기 전에 옮기기 창');
  assert.ok(/history\.replaceState\(null, '', location\.pathname \+ location\.search\)/.test(app), '생년월일이 든 주소는 바로 지움');
});
