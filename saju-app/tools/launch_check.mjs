// v0.65 출시 전 점검: `node tools/launch_check.mjs` — 빈 사업자 정보·결제 키·사이트맵을 알려 주고, 도메인이 있으면 sitemap.xml을 만든다.
import { writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { BIZ, PAY, payMode, missingBiz } from '../js/site.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const todo = [];
const miss = missingBiz(BIZ);
if (miss.length) todo.push(`js/site.js BIZ에 빈 값: ${miss.join(', ')}`);
const mode = payMode(PAY);
if (mode === 'trial') todo.push('js/site.js PAY.tossClientKey가 비어 있음 → 지금은 체험판(결제 없이 만들어짐)');
if (mode === 'test') todo.push('시험 결제 키(test_ck_)가 들어 있음 → 정식 공개 전 live_ck_ 키로 바꾸고, 호스팅 환경 변수 TOSS_SECRET_KEY도 live_sk_로');
if (BIZ.domain) {
  const base = BIZ.domain.replace(/\/$/, '');
  const pages = ['', 'legal/shop.html', 'legal/terms.html', 'legal/privacy.html', 'legal/refund.html', ...readdirSync(join(root, 'unse/2027')).filter((f) => f.endsWith('.html')).map((f) => `unse/2027/${f}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${base}/${p}</loc></url>`).join('\n')}\n</urlset>\n`;
  writeFileSync(join(root, 'sitemap.xml'), xml);
  console.log(`sitemap.xml 만듦(${pages.length}쪽) — robots.txt 끝에 「Sitemap: ${base}/sitemap.xml」 한 줄을 넣어 주세요`);
}
console.log(todo.length ? `출시 전에 채울 것 ${todo.length}가지:\n${todo.map((t) => ` - ${t}`).join('\n')}` : '출시 준비 값이 모두 채워졌어요.');
