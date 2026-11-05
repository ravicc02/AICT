import { chromium } from "playwright";
import fs from "node:fs/promises";
const base = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.goto(base);
await page.setContent(
  '<html lang="zh-CN"><head><style>@font-face{font-family:Camp;src:url(' +
    base +
    '/fonts/camp-sans.woff2);font-weight:100 900}*{box-sizing:border-box}body{margin:0;background:#f5f5f7;font-family:Camp,sans-serif;color:#1d1d1f}main{width:1200px;height:630px;display:flex;align-items:center;padding:75px;gap:30px}h1{font-size:90px;line-height:1.2;letter-spacing:-5px;margin:24px 0;font-weight:650;white-space:nowrap}h1 span{color:#0066cc}p{font-size:19px;color:#626b76;margin:0}.copy{width:550px;position:relative;z-index:2}.art{width:470px;border-radius:38px;transform:rotate(7deg)}.brand{font-size:21px;color:#0066cc;font-weight:600}</style></head><body><main><div class="copy"><div class="brand">AI 创造营</div><h1>有想法，<br/><span>去创造。</span></h1><p>7–15 岁 · 和 AI 一起创造自己的作品</p></div><img class="art" src="' +
    base +
    '/art/mech.svg" alt="蓝色机甲"/></main></body></html>',
);
await page.evaluate(() => document.fonts.ready);
await page.locator("img").evaluate((i) => i.decode());
await page.screenshot({ path: "public/og-cover.png" });
const icon = await fs.readFile("public/favicon.svg", "utf8");
await page.setViewportSize({ width: 180, height: 180 });
await page.setContent(
  '<body style="margin:0">' +
    icon.replace("<svg ", '<svg width="180" height="180" '),
);
await page.screenshot({ path: "public/apple-touch-icon.png" });
await browser.close();
console.log("Created OG cover and Apple touch icon");
