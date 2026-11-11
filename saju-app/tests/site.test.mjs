// v0.65 웹 출시: 사업자 정보 채우기 · 약관 페이지 · 바닥글
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BIZ, PAY, payMode, bizValue, missingBiz } from '../js/site.js';
import { legalPage, LEGAL_KEYS } from '../tools/legal_pages.mjs';
import { josaProblems } from '../js/josa.js';

let n = 0; const ok = (name) => { n += 1; console.log(`  ✓ ${name}`); };
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const textOf = (html) => html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

assert.equal(payMode({ tossClientKey: '' }), 'trial');
assert.equal(payMode({ tossClientKey: 'test_ck_abc' }), 'test');
assert.equal(payMode({ tossClientKey: 'live_ck_abc' }), 'live');
assert.ok(!/sk_/.test(PAY.tossClientKey), '클라이언트 키 자리에 시크릿 키를 넣으면 안 됨');
assert.equal(bizValue('name', { name: '' }), '(등록 예정)');
assert.equal(bizValue('mailOrderNo', { mailOrderNo: '' }), '신고 진행 중');
assert.equal(bizValue('privacyOfficer', { owner: '홍길동' }), '홍길동');
assert.equal(bizValue('effective'), '2026년 11월 11일');
assert.deepEqual(missingBiz({ name: 'a', owner: 'b', regNo: 'c', mailOrderNo: 'd', address: 'e', phone: 'f', email: 'g', domain: 'h' }), []);
assert.ok(Array.isArray(missingBiz(BIZ)));
ok('결제 모드(체험·시험·실제) · 빈 사업자 정보 표시');

for (const k of LEGAL_KEYS) {
  const html = read(`legal/${k}.html`);
  assert.equal(html, legalPage(k), `legal/${k}.html — 글을 고쳤으면 node tools/legal_pages.mjs 다시 실행`);
  for (const f of ['name', 'owner', 'regNo', 'mailOrderNo', 'address', 'phone', 'email']) assert.ok(html.includes(`data-biz="${f}"`), `${k}: 사업자 정보 ${f}`);
  assert.deepEqual(josaProblems(textOf(html)), [], `${k}: 조사`);
}
ok('약관 4쪽: 생성기 결과와 같음 · 사업자 정보 칸 · 조사');

{
  const terms = textOf(read('legal/terms.html')); const privacy = textOf(read('legal/privacy.html')); const refund = textOf(read('legal/refund.html')); const shop = read('legal/shop.html');
  assert.ok(terms.includes('오락용 읽을거리') && terms.includes('만 14세') && terms.includes('법정대리인') && terms.includes('109'));
  assert.ok(privacy.includes('서버로 보내지 않습니다') && privacy.includes('토스페이먼츠') && privacy.includes('5년') && privacy.includes('보호책임자') && privacy.includes('국외'));
  assert.ok(refund.includes('전액 환불') && refund.includes('제17조') && refund.includes('3영업일') && refund.includes('id="pay-log"') === false);
  assert.ok(read('legal/refund.html').includes('id="pay-log"'));
  assert.ok(shop.includes('data-price="wish"') && shop.includes('data-price="lantern"'));
}
ok('약관·처리방침·환불 규정에 꼭 들어갈 내용');

{
  const index = read('index.html');
  for (const p of ['legal/terms.html', 'legal/privacy.html', 'legal/refund.html', 'legal/shop.html']) assert.ok(index.includes(`href="${p}"`), `바닥글 링크 ${p}`);
  for (const f of ['name', 'owner', 'regNo', 'mailOrderNo', 'address', 'phone', 'email']) assert.ok(index.includes(`data-biz="${f}"`), `바닥글 ${f}`);
  assert.ok(index.includes('agree-note') && index.includes('만 14세 이상'));
  const app = read('js/app.js');
  assert.ok(app.includes('legal/refund.html') && app.includes('단순 변심 환불이 어려워요') && app.includes('이 기기의 이 브라우저에만'), '결제 창 고지');
  assert.ok(read('robots.txt').includes('Disallow: /api/'));
  JSON.parse(read('manifest.webmanifest'));
}
ok('바닥글 사업자 정보·약관 링크 · 가입 동의 줄 · 결제 창 고지');

console.log(`site.test: ${n}개 통과`);
