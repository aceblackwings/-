// AI 보조 이미지 생성 (OpenAI Images) → public/ai/<slot>.png
// 필요: OPENAI_API_KEY   선택: OPENAI_IMAGE_MODEL (기본 gpt-image-1)
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
const key = process.env.OPENAI_API_KEY;
if (!key) throw new Error('OPENAI_API_KEY 를 설정하세요');
const cfg = JSON.parse(readFileSync(new URL('../ai-prompts.json', import.meta.url)));
const outDir = new URL('../public/ai/', import.meta.url);
mkdirSync(outDir, {recursive: true});
for (const [slot, prompt] of Object.entries(cfg.images)) {
  const out = new URL(`${slot}.png`, outDir);
  if (existsSync(out) && !process.argv.includes('--force')) { console.log(`skip ${slot}`); continue; }
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1', prompt: `${prompt}. ${cfg.style}`, size: '1536x1024'}),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`${slot}: ${JSON.stringify(j)}`);
  writeFileSync(out, Buffer.from(j.data[0].b64_json, 'base64'));
  console.log(`ok   ${slot}`);
}
