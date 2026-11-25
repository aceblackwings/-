// 브라우저 판 재사용 검수실을 실제로 열어 영상 파일을 넣고 판정을 확인합니다.
// 사용: node test_web.mjs <폴더>   (폴더에 source.webm·reuse_bad.webm·reuse_good.webm·past_video.webm)
// 폴더가 없으면 ffmpeg로 합성 시험 영상을 만듭니다.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { execFileSync } from "node:child_process";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
let dir = process.argv[2];
if (!dir || !existsSync(join(dir, "source.webm"))) {
  dir = mkdtempSync(join(tmpdir(), "reuse-web-"));
  const ff = (...a) => execFileSync("ffmpeg", ["-v", "error", "-y", ...a]);
  const enc = ["-c:v", "libvpx-vp9", "-b:v", "500k", "-deadline", "realtime", "-cpu-used", "8", "-c:a", "libopus"];
  ff("-f", "lavfi", "-i", "testsrc2=s=640x360:r=30:d=20", "-f", "lavfi", "-i",
    "sine=f=440:d=20,volume='if(lt(mod(t,0.5),0.25),1,0.05)':eval=frame", ...enc, "-shortest", join(dir, "source.webm"));
  ff("-i", join(dir, "source.webm"), "-vf", "hflip,eq=saturation=1.3", ...enc, join(dir, "reuse_bad.webm"));
  ff("-i", join(dir, "source.webm"), "-f", "lavfi", "-i", "cellauto=s=640x360:r=30:rule=110", "-f", "lavfi", "-i",
    "sine=f=220:d=20,volume='if(lt(mod(t,0.3),0.15),1,0.02)':eval=frame", "-filter_complex",
    "[0:v]scale=360:202[p];[1:v][p]overlay=30:40,trim=0:20[v];[0:a]volume=0.05[s];[s][2:a]amix=2:normalize=0[a]",
    "-map", "[v]", "-map", "[a]", "-t", "20", ...enc, join(dir, "reuse_good.webm"));
  ff("-i", join(dir, "reuse_good.webm"), "-t", "8", ...enc, join(dir, "past_video.webm"));
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(pathToFileURL(join(here, "index.html")).href);

async function run(mine, opts = {}) {
  await page.click("#reset");
  await page.setInputFiles("#f-mine", join(dir, mine));
  await page.setInputFiles("#f-src", [join(dir, "source.webm")]);
  if (opts.hist) await page.setInputFiles("#f-hist", [join(dir, "past_video.webm")]);
  else await page.setInputFiles("#f-hist", []);
  await page.click("#go");
  await page.waitForFunction(() => !document.querySelector("#step").textContent.startsWith("끝났어요"));
  await page.waitForFunction(() => document.querySelector("#step").textContent.startsWith("끝났어요") || !document.querySelector("#err").hidden, null, { timeout: 300000 });
  const err = await page.$eval("#err", (e) => (e.hidden ? "" : e.textContent));
  if (err) throw new Error(err);
  return page.evaluate(() => window.__reuse.state.result);
}

const fails = [];
const check = (ok, msg) => { console.log(`${ok ? "✓" : "✗"} ${msg}`); if (!ok) fails.push(msg); };
const bad = await run("reuse_bad.webm");
check(bad.reuse_risk >= 60, `재사용본 재사용 위험 ${bad.reuse_risk} ≥ 60`);
check(bad.metrics.mirrored_ratio > 0.5, `재사용본 반전 비율 ${bad.metrics.mirrored_ratio} > 0.5`);
const good = await run("reuse_good.webm", { hist: true });
check(good.reuse_risk <= bad.reuse_risk - 30, `변형본 재사용 위험 ${good.reuse_risk} ≤ ${bad.reuse_risk - 30}`);
check(good.metrics.source_pip_ratio > 0.3, `변형본 화면 속 화면 비율 ${good.metrics.source_pip_ratio} > 0.3`);
check(good.repeat_risk > 0, `변형본 반복 위험 ${good.repeat_risk} > 0 (지난 영상과 앞부분이 같음)`);
const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
check(scroll <= 390, `390폭 가로 넘침 없음 (${scroll})`);
check(errors.length === 0, `페이지 오류 없음 ${errors.join(" / ")}`);
await page.screenshot({ path: join(dir, "web_result.png"), fullPage: true });
console.log(`화면: ${join(dir, "web_result.png")}`);
await browser.close();
process.exit(fails.length ? 1 : 0);
