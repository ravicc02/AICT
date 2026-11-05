import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const base = "http://127.0.0.1:4173";
const b = await chromium.launch({ channel: "chrome", headless: true });
const context = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await context.newPage();
const errors = [];
const missing = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("response", (r) => {
  if (r.status() >= 400) missing.push({ url: r.url(), status: r.status() });
});
const captures = [];
for (const width of [1440, 375]) {
  await p.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
  for (const route of ["/", "/courses", "/works", "/works/mech", "/contact"]) {
    await p.goto(base + route, { waitUntil: "networkidle" });
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
        scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 40));
      }
      await Promise.all(
        [...document.images]
          .filter((i) => i.getClientRects().length)
          .map((i) => i.decode().catch(() => {})),
      );
      scrollTo({ top: 0, behavior: "instant" });
    });
    await p.waitForTimeout(180);
    const file =
      "artifacts/final-" +
      (route === "/" ? "home" : route.slice(1).replaceAll("/", "-")) +
      "-" +
      width +
      ".png";
    await p.screenshot({ path: file, fullPage: true });
    captures.push({
      width,
      route,
      file,
      brokenImages: await p.evaluate(
        () =>
          [...document.images].filter(
            (i) => i.getClientRects().length && !i.naturalWidth,
          ).length,
      ),
    });
  }
}
await p.setViewportSize({ width: 768, height: 1000 });
await p.goto(base + "/courses", { waitUntil: "networkidle" });
await p.screenshot({ path: "artifacts/final-courses-768.png", fullPage: true });
await p.setViewportSize({ width: 1440, height: 1000 });
await p.goto(base, { waitUntil: "networkidle" });
await p.screenshot({ path: "artifacts/final-home-desktop.png" });
const cdp = await context.newCDPSession(p);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await p.bringToFront();
const sample = p.evaluate(
  () =>
    new Promise((resolve) => {
      const intervals = [];
      let prev = 0;
      const tick = (t) => {
        if (prev) intervals.push(t - prev);
        prev = t;
        if (intervals.length < 90) requestAnimationFrame(tick);
        else {
          const sorted = [...intervals].sort((a, b) => a - b);
          resolve({
            samples: intervals.length,
            meanFrameMs:
              intervals.reduce((s, x) => s + x, 0) / intervals.length,
            p95FrameMs: sorted[Math.floor(sorted.length * 0.95)],
            maxFrameMs: sorted.at(-1),
            framesOver33ms: intervals.filter((x) => x > 33.5).length,
          });
        }
      };
      requestAnimationFrame(tick);
    }),
);
const sweep = (async () => {
  for (let i = 0; i < 4; i++) {
    await p.mouse.move(250, 600);
    await p.mouse.move(1200, 650, { steps: 18 });
  }
})();
const perf = await Promise.allSettled([sample, sweep]);
for (const r of perf) if (r.status === "rejected") throw r.reason;
const frameMeasure = perf[0].value;
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
await p.goto(base + "/works/mech", { waitUntil: "networkidle" });
await p.getByRole("button", { name: "作品预览", exact: true }).click();
await p.waitForTimeout(400);
const dialogScan = await new AxeBuilder({ page: p })
  .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
  .analyze();
await p.screenshot({ path: "artifacts/final-work-preview.png" });
assert.equal(dialogScan.violations.length, 0);
const mobile = await b.newContext({
  viewport: { width: 375, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 1,
});
const mp = await mobile.newPage();
await mp.goto(base, { waitUntil: "networkidle" });
const touch = await mobile.newCDPSession(mp);
const rect = await mp.locator(".is-front img").boundingBox();
const sx = rect.x + rect.width * 0.78,
  sy = rect.y + rect.height * 0.55;
await touch.send("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [{ x: sx, y: sy }],
});
for (let i = 1; i <= 12; i++) {
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: sx - i * 13, y: sy }],
  });
  await mp.waitForTimeout(16);
}
await touch.send("Input.dispatchTouchEvent", {
  type: "touchEnd",
  touchPoints: [],
});
await mp.waitForTimeout(650);
const mobileTitle = await mp.locator(".is-front .art-caption").innerText();
assert.match(mobileTitle, /房车人生/);
await mp.getByRole("button", { name: "打开菜单" }).tap();
assert.ok(await mp.getByRole("navigation", { name: "主导航" }).isVisible());
await fs.writeFile(
  "artifacts/final-evidence.json",
  JSON.stringify(
    {
      date: "2026-11-05",
      captures,
      errors,
      missing,
      mobileSwipe: { pass: true, title: mobileTitle },
      dialogAxeViolations: dialogScan.violations,
      performance: {
        environment:
          "Headless Chrome, 1440x1000, CDP CPU slowdown 4x, real pointer sweep; local laboratory only",
        ...frameMeasure,
      },
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    captures: captures.length,
    brokenImages: captures.filter((x) => x.brokenImages),
    errors,
    missing,
    mobileSwipe: true,
    dialogAxeViolations: dialogScan.violations.length,
    frameMeasure,
  }),
);
await b.close();
