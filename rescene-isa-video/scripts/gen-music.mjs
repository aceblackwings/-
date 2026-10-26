// sunoapi.org 로 연주곡 BGM 3종 생성 → public/bgm/<cue>.mp3
// 필요: SUNO_API_KEY   선택: SUNO_MODEL (기본 V4_5)
import {writeFileSync, mkdirSync, existsSync} from 'node:fs';

const key = process.env.SUNO_API_KEY;
if (!key) throw new Error('SUNO_API_KEY 를 설정하세요');
const API = 'https://api.sunoapi.org/api/v1';
const model = process.env.SUNO_MODEL || 'V4_5';

const CUES = {
  hope: {
    title: 'Beside the Stage',
    style: 'cinematic documentary, solo felt piano, soft strings, warm, nostalgic, hopeful, 72 bpm, instrumental',
    prompt: 'A gentle, intimate piano theme for the opening and ending of a documentary about friendship and dreams',
  },
  struggle: {
    title: 'Dust on the Field',
    style: 'melancholic ambient, piano and cello, sparse, introspective, slow build, 68 bpm, instrumental',
    prompt: 'Quiet, bittersweet underscore for hard times: empty stages, long waits, people holding each other up',
  },
  rise: {
    title: 'Love Attack Rising',
    style: 'uplifting cinematic pop, building drums, bright synths, strings swell, emotional climax, 118 bpm, instrumental',
    prompt: 'An emotional, triumphant build for a K-pop group finally reaching number one after years of struggle',
  },
};

const outDir = new URL('../public/bgm/', import.meta.url);
mkdirSync(outDir, {recursive: true});
const post = (path, body) => fetch(API + path, {method: 'POST', headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'}, body: JSON.stringify(body)}).then((r) => r.json());
const get = (path) => fetch(API + path, {headers: {Authorization: `Bearer ${key}`}}).then((r) => r.json());
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

for (const [cue, c] of Object.entries(CUES)) {
  const out = new URL(`${cue}.mp3`, outDir);
  if (existsSync(out) && !process.argv.includes('--force')) { console.log(`skip ${cue}`); continue; }
  const job = await post('/generate', {customMode: true, instrumental: true, model, title: c.title, style: c.style, prompt: c.prompt, callBackUrl: 'https://example.com/suno-callback'});
  if (job.code !== 200) throw new Error(`${cue}: ${JSON.stringify(job)}`);
  const taskId = job.data.taskId;
  console.log(`${cue}: task ${taskId} 생성 중...`);
  for (let i = 0; ; i++) {
    await wait(10000);
    const r = await get(`/generate/record-info?taskId=${taskId}`);
    const st = r.data?.status;
    if (st === 'SUCCESS') {
      const track = r.data.response.sunoData[0]; // 후보 2곡 중 첫 곡 (나머지는 _alt 로 저장)
      writeFileSync(out, Buffer.from(await (await fetch(track.audioUrl)).arrayBuffer()));
      const alt = r.data.response.sunoData[1];
      if (alt) writeFileSync(new URL(`${cue}_alt.mp3`, outDir), Buffer.from(await (await fetch(alt.audioUrl)).arrayBuffer()));
      console.log(`ok   ${cue} (${Math.round(track.duration)}s)`);
      break;
    }
    if (/FAIL|ERROR/.test(st || '') || i > 60) throw new Error(`${cue}: ${JSON.stringify(r)}`);
  }
}
console.log('마음에 들지 않으면 *_alt.mp3 를 원래 이름으로 바꾸거나 --force 로 재생성하세요');
