import { chromium } from "playwright";
import fs from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
const results = [];
for (const width of [1440, 375, 768]) {
  const page = await browser.newPage({
    viewport: { width, height: width === 1440 ? 1000 : 844 },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of ["/", "/courses", "/works", "/works/mech", "/contact"]) {
    await page.goto("http://127.0.0.1:4173" + route, {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path:
        "artifacts/" +
        (route === "/" ? "home" : route.slice(1).replaceAll("/", "-")) +
        "-" +
        width +
        ".png",
      fullPage: true,
    });
    results.push({
      width,
      route,
      ...(await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        height: document.documentElement.scrollHeight,
        h1: document.querySelectorAll("h1").length,
        brokenImages: [...document.images].filter(
          (i) => !i.complete || !i.naturalWidth,
        ).length,
      }))),
    });
  }
  await page.close();
}
await fs.writeFile(
  "artifacts/visual-check.json",
  JSON.stringify({ results, errors }, null, 2),
);
console.log(JSON.stringify({ results, errors }));
await browser.close();
