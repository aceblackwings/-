// ElevenLabs 나레이션 생성: src/scenes.json 의 narration → public/narration/<id>.mp3
// 필요: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID (한국어 지원 보이스)
// 선택: ELEVENLABS_MODEL (기본 eleven_v4). 계정에서 해당 모델을 쓸 수 없으면 eleven_v3 → eleven_multilingual_v2 순으로 대체
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';

const key = process.env.ELEVENLABS_API_KEY;
const voice = process.env.ELEVENLABS_VOICE_ID;
if (!key || !voice) throw new Error('ELEVENLABS_API_KEY 와 ELEVENLABS_VOICE_ID 를 설정하세요');
const models = [...new Set([process.env.ELEVENLABS_MODEL || 'eleven_v4', 'eleven_v3', 'eleven_multilingual_v2'])];
const force = process.argv.includes('--force');
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',');

const scenes = JSON.parse(readFileSync(new URL('../src/scenes.json', import.meta.url)));
const outDir = new URL('../public/narration/', import.meta.url);
mkdirSync(outDir, {recursive: true});

let model = models[0];
for (const s of scenes) {
  if (!s.narration || (only && !only.includes(s.id))) continue;
  const out = new URL(`${s.id}.mp3`, outDir);
  if (existsSync(out) && !force) { console.log(`skip ${s.id}`); continue; }
  for (;;) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_192`, {
      method: 'POST',
      headers: {'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg'},
      body: JSON.stringify({
        text: s.narration,
        model_id: model,
        language_code: 'ko',
        // 다큐멘터리 톤: 안정적이되 감정이 묻어나도록
        voice_settings: {stability: 0.5, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: 0.95},
      }),
    });
    if (res.ok) {
      writeFileSync(out, Buffer.from(await res.arrayBuffer()));
      console.log(`ok   ${s.id} (${model})`);
      break;
    }
    const body = await res.text();
    const next = models[models.indexOf(model) + 1];
    if ((res.status === 400 || res.status === 422 || res.status === 404) && /model/i.test(body) && next) {
      console.warn(`model ${model} 사용 불가 → ${next} 로 재시도`);
      model = next;
      continue;
    }
    throw new Error(`${s.id}: HTTP ${res.status} ${body}`);
  }
}
console.log('다음: npm run measure');
