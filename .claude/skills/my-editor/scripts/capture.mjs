#!/usr/bin/env node
// 실제 사이트 캡처: 문장마다 사이트를 열어 스크린샷을 찍고, 강조 문구의 좌표를 "같은 실행에서" 뽑는다.
//
// 사용법:
//   node capture.mjs shots.json [outDir=captures]
//
// shots.json 예시:
//   [{ "id": "s01", "url": "https://example.com", "highlight": ["Example Domain"] }]
//
// 결과: outDir/<id>.png + outDir/<id>.json ({ url, viewport, highlights: [{ text, rects: [{x,y,width,height}] }] })
// 좌표는 스크린샷 픽셀 기준(deviceScaleFactor 반영)이다.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");

const [shotsFile, outDir = "captures"] = process.argv.slice(2);
if (!shotsFile) {
  console.error("usage: node capture.mjs shots.json [outDir]");
  process.exit(1);
}

const candidates = [
  process.env.CHROME_PATH,
  "/opt/pw-browsers/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const executablePath = candidates.find((p) => fs.existsSync(p) && fs.statSync(p).isFile())
  ?? fs.readdirSync("/opt/pw-browsers", { withFileTypes: true })
    .filter((d) => d.name.startsWith("chromium-"))
    .map((d) => path.join("/opt/pw-browsers", d.name, "chrome-linux64", "chrome"))
    .find((p) => fs.existsSync(p));

const viewport = { width: 1280, height: 800, deviceScaleFactor: 2 };
const shots = JSON.parse(fs.readFileSync(shotsFile, "utf8"));
fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--hide-scrollbars", "--lang=ko-KR"],
});
try {
  for (const shot of shots) {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    await page.goto(shot.url, { waitUntil: "networkidle2", timeout: 60000 });
    if (shot.scrollTo) {
      await page.evaluate((t) => {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) if (w.currentNode.textContent.includes(t)) {
          w.currentNode.parentElement.scrollIntoView({ block: "center" });
          return;
        }
      }, shot.scrollTo);
      await new Promise((r) => setTimeout(r, 500));
    }

    // 스크린샷 직전에 같은 페이지 상태에서 좌표를 잰다.
    const highlights = await page.evaluate((texts, dpr) => texts.map((text) => {
      const rects = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) {
        const node = w.currentNode;
        let idx = node.textContent.indexOf(text);
        while (idx !== -1) {
          const range = document.createRange();
          range.setStart(node, idx);
          range.setEnd(node, idx + text.length);
          for (const r of range.getClientRects()) {
            if (r.width && r.height) rects.push({
              x: Math.round(r.x * dpr), y: Math.round(r.y * dpr),
              width: Math.round(r.width * dpr), height: Math.round(r.height * dpr),
            });
          }
          idx = node.textContent.indexOf(text, idx + text.length);
        }
      }
      return { text, rects };
    }), shot.highlight ?? [], viewport.deviceScaleFactor);

    const png = path.join(outDir, `${shot.id}.png`);
    await page.screenshot({ path: png });
    fs.writeFileSync(path.join(outDir, `${shot.id}.json`),
      JSON.stringify({ url: shot.url, viewport, highlights }, null, 2));
    const missing = highlights.filter((h) => !h.rects.length).map((h) => h.text);
    console.log(`${shot.id}: ${png}${missing.length ? `  (못 찾은 문구: ${missing.join(", ")})` : ""}`);
    await page.close();
  }
} finally {
  await browser.close();
}
