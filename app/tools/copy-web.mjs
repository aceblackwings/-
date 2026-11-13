// 앱(Capacitor)에 넣을 웹 파일 모으기: ../saju-app → ./www
// · 사이트에 올리지 않는 파일(saju-app/.assetsignore 목록)은 앱에도 넣지 않는다.
// · 앱에서는 결제가 없으므로 결제 승인 함수(functions)·사이트맵 등도 빠진다.
import { cpSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', '..', 'saju-app');
const out = join(here, '..', 'www');
const ignore = readFileSync(join(src, '.assetsignore'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
ignore.push('sitemap.xml', 'robots.txt', '_headers', '_redirects');

rmSync(out, { recursive: true, force: true });
cpSync(src, out, {
  recursive: true,
  filter: (p) => {
    const rel = relative(src, p).split('\\').join('/');
    if (!rel) return true;
    return !ignore.some((g) => rel === g || rel.startsWith(g + '/'));
  },
});
if (!existsSync(join(out, 'index.html'))) throw new Error('index.html이 복사되지 않았어요');
console.log('www 준비 완료');
