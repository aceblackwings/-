// 나레이션 길이를 재서 src/timing.json 에 기록 → 장면 길이가 자동으로 맞춰짐
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const scenes = JSON.parse(readFileSync(new URL('../src/scenes.json', import.meta.url)));
const timing = {};
for (const s of scenes) {
  const f = ['mp3', 'wav'].map((e) => new URL(`../public/narration/${s.id}.${e}`, import.meta.url).pathname).find(existsSync);
  if (!f) continue;
  const sec = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
  timing[s.id] = Math.round(sec * 100) / 100;
}
writeFileSync(new URL('../src/timing.json', import.meta.url), JSON.stringify(timing, null, 1));
const total = scenes.reduce((a, s) => a + Math.max(s.base, timing[s.id] ? timing[s.id] + 2 : 0), 0);
console.log(timing, `\n예상 총 길이 ≈ ${total.toFixed(1)}초`);
