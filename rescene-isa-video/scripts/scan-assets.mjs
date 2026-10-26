// public/ 안의 실제 파일 목록을 src/assets.json 에 기록 (없는 파일은 대체 그래픽으로 렌더)
import {readdirSync, statSync, writeFileSync} from 'node:fs';
import {join, relative} from 'node:path';
const root = new URL('../public/', import.meta.url).pathname;
const out = [];
const walk = (d) => readdirSync(d).forEach((n) => { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : out.push(relative(root, p)); });
walk(root);
writeFileSync(new URL('../src/assets.json', import.meta.url), JSON.stringify(out.sort(), null, 1));
console.log(`assets: ${out.length} files`);
