import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const base = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1387, height: 936 },
});
const page = await context.newPage();
const report = {
  date: "2026-11-05",
  revision: "shared-creation-dossier-and-overall-radar",
  checks: [],
  layouts: [],
  errors: [],
  requests: [],
  screenshots: [],
};
page.on("pageerror", (e) => report.errors.push(e.message));
page.on("response", (r) => {
  if (r.status() >= 400)
    report.requests.push({ url: r.url(), status: r.status() });
});
const check = async (name, fn) => {
  try {
    await fn();
    report.checks.push({ name, pass: true });
    console.log("PASS " + name);
  } catch (e) {
    report.checks.push({ name, pass: false, error: e.message });
    console.error("FAIL " + name + ": " + e.message);
  }
};
const ready = async (p = page) => {
  await p.goto(base + "/", { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
};
const imageReady = async (p = page) => {
  await p.waitForFunction(() => {
    const image = document.querySelector(".sop-record-photo img");
    return image?.complete && image.naturalWidth > 0;
  });
};
await ready();
await check("第二部分是 SOP，Hero 画廊保留，重复作品精选已移除", async () => {
  assert.equal(
    await page.locator("main > section").nth(1).getAttribute("id"),
    "process",
  );
  assert.equal(await page.locator(".hero-gallery").count(), 1);
  assert.equal(
    await page.locator(".work-selection,.featured-work,.duo-works").count(),
    0,
  );
  assert.equal(
    await page.locator("main > section").nth(2).getAttribute("class"),
    "trial-section",
  );
  assert.equal(await page.locator("#process [role=tab]").count(), 10);
});
await check("左侧纵向目录，右侧记录图片和能力总览", async () => {
  const directory = await page.locator(".sop-directory").boundingBox();
  const image = await page.locator(".sop-record-photo").boundingBox();
  const growth = await page.locator(".sop-growth").boundingBox();
  assert.ok(directory.x + directory.width < image.x);
  assert.ok(image.x + image.width < growth.x);
  assert.equal(
    await page.locator(".sop-directory").getAttribute("aria-orientation"),
    "vertical",
  );
  assert.equal(
    await page
      .locator(".sop-step")
      .evaluateAll(
        (nodes) => new Set(nodes.map((e) => e.getBoundingClientRect().x)).size,
      ),
    1,
  );
});
await check("十条记录图片可加载，说明可切换，能力图始终只有一张", async () => {
  const chart = await page.locator(".sop-growth-diagram").innerHTML();
  const headings = new Set();
  const sources = new Set();
  for (let i = 0; i < 10; i++) {
    const tab = page.locator("#sop-tab-" + i);
    await tab.click();
    await page.locator(".sop-record-photo").scrollIntoViewIfNeeded();
    await imageReady();
    assert.equal(await tab.getAttribute("aria-selected"), "true");
    assert.equal(
      await page.locator("#sop-record").getAttribute("aria-labelledby"),
      "sop-tab-" + i,
    );
    headings.add(await page.locator(".sop-record-copy h4").innerText());
    sources.add(
      await page.locator(".sop-record-photo img").getAttribute("src"),
    );
    assert.equal(await page.locator(".sop-growth-diagram").innerHTML(), chart);
  }
  assert.equal(headings.size, 10);
  assert.ok(sources.size >= 4);
  assert.equal(await page.locator(".sop-growth-profile").count(), 1);
  assert.equal(await page.locator(".sop-growth-point").count(), 6);
  assert.equal(await page.locator(".radar-dimension").count(), 6);
  assert.equal(await page.locator(".sop-growth button").count(), 0);
  assert.equal(
    (await page.locator(".sop-growth-profile").getAttribute("points")).split(
      " ",
    ).length,
    6,
  );
});
await check("目录键盘切换与前后按钮的边界状态", async () => {
  assert.equal(
    await page
      .getByRole("button", { name: "下一条创作记录", exact: true })
      .isDisabled(),
    true,
  );
  await page.locator("#sop-tab-9").focus();
  await page.keyboard.press("ArrowDown");
  assert.equal(
    await page
      .locator("#sop-tab-0")
      .evaluate((e) => e === document.activeElement),
    true,
  );
  assert.equal(
    await page
      .getByRole("button", { name: "上一条创作记录", exact: true })
      .isDisabled(),
    true,
  );
  await page.keyboard.press("End");
  assert.equal(
    await page.locator("#sop-tab-9").getAttribute("aria-selected"),
    "true",
  );
  await page.keyboard.press("Home");
  await page
    .getByRole("button", { name: "下一条创作记录", exact: true })
    .click();
  assert.equal(
    await page.locator("#sop-tab-1").getAttribute("aria-selected"),
    "true",
  );
});
await check("布局仍没有卡片底色、圆角或阴影", async () => {
  const styles = await page
    .locator(
      ".sop-directory,.sop-growth,.sop-step,.sop-record,.sop-record-photo",
    )
    .evaluateAll((elements) =>
      elements.map((e) => {
        const s = getComputedStyle(e);
        return {
          radius: s.borderRadius,
          shadow: s.boxShadow,
          background: s.backgroundColor,
        };
      }),
    );
  assert.ok(
    styles.every(
      (s) =>
        s.radius === "0px" &&
        s.shadow === "none" &&
        s.background === "rgba(0, 0, 0, 0)",
    ),
    JSON.stringify(styles),
  );
});
await check("九个屏宽没有溢出，按钮触区与手机目录完整", async () => {
  for (const width of [320, 375, 767, 768, 1023, 1024, 1100, 1387, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(70);
    const state = await page.locator("#process").evaluate((section) => {
      const elements = [
        ...section.querySelectorAll("button,a,h2,h3,h4,p,.radar-dimension"),
      ].filter((e) => !e.closest("dialog:not([open])"));
      const outside = elements
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width && (r.left < -1 || r.right > innerWidth + 1);
        })
        .map((e) => e.textContent);
      const tooSmall = elements
        .filter(
          (e) =>
            e.matches("button,a") && e.getBoundingClientRect().height < 43.9,
        )
        .map((e) => e.textContent);
      const directory = section.querySelector(".sop-directory");
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        outside,
        tooSmall,
        orientation: directory.getAttribute("aria-orientation"),
        columns:
          getComputedStyle(directory).gridTemplateColumns.split(" ").length,
      };
    });
    report.layouts.push({ width, ...state });
    assert.equal(state.overflow, 0, "width " + width);
    assert.deepEqual(state.outside, [], "width " + width);
    assert.deepEqual(state.tooSmall, [], "width " + width);
    assert.equal(state.orientation, width <= 767 ? "horizontal" : "vertical");
    if (width <= 767) assert.equal(state.columns, 5);
  }
});
await check("完整记录和预览弹窗关闭后恢复焦点", async () => {
  for (const [name, placeholder] of [
    ["查看加入角色创作记录", "老师观察"],
    ["体验", "作品体验待补充"],
    ["路演", "路演视频待补充"],
  ]) {
    const trigger = page.getByRole("button", { name, exact: true });
    await trigger.click();
    assert.ok(await page.getByRole("dialog").isVisible());
    assert.match(
      await page.getByRole("dialog").innerText(),
      new RegExp(placeholder),
    );
    await page.waitForFunction(() =>
      [...document.querySelectorAll("dialog[open] img")].every(
        (i) => i.complete && i.naturalWidth > 0,
      ),
    );
    if (name.startsWith("查看")) {
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.equal(
        result.violations.length,
        0,
        JSON.stringify(
          result.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
        ),
      );
      await page.screenshot({ path: "artifacts/sop-v3-record-dialog.png" });
    }
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog[open]").count(), 0);
    assert.equal(
      await trigger.evaluate((e) => e === document.activeElement),
      true,
    );
  }
});
await check("真实触屏点击目录、下一条及完整记录", async () => {
  const touch = await browser.newContext({
    viewport: { width: 375, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const p = await touch.newPage();
  await ready(p);
  await p.locator("#sop-tab-6").tap();
  assert.match(
    await p.locator("#sop-record").innerText(),
    /太难了，就再改一次/,
  );
  await p.getByRole("button", { name: "下一条创作记录", exact: true }).tap();
  assert.equal(
    await p.locator("#sop-tab-7").getAttribute("aria-selected"),
    "true",
  );
  await p
    .getByRole("button", { name: "查看细节打磨创作记录", exact: true })
    .tap();
  assert.ok(await p.getByRole("dialog").isVisible());
  await p.getByRole("button", { name: "关闭弹窗", exact: true }).tap();
  assert.equal(await p.locator("dialog[open]").count(), 0);
  await touch.close();
});
await check("无 JavaScript 仍有首条图片、过程和完整雷达图", async () => {
  const ctx = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 844 },
  });
  const p = await ctx.newPage();
  await ready(p);
  await p.locator(".sop-record-photo").scrollIntoViewIfNeeded();
  await imageReady(p);
  assert.equal(await p.locator(".sop-step").count(), 10);
  assert.equal(
    await p
      .locator(".sop-record-copy")
      .evaluate((e) => getComputedStyle(e).opacity),
    "1",
  );
  assert.equal(await p.locator(".sop-growth-point").count(), 6);
  await ctx.close();
});
await check("实时减少动态效果设置会停止切换动画", async () => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("#sop-tab-3").click();
  await page.waitForTimeout(100);
  assert.match(await page.locator("#sop-record").innerText(), /换一种方式操作/);
  assert.equal(
    await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length,
    ),
    0,
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
});
await check("最终桌面、记录切换、手机和完整首页截图", async () => {
  await page.setViewportSize({ width: 1387, height: 936 });
  await page.locator("#sop-tab-0").click();
  await page.locator(".sop-record-photo").scrollIntoViewIfNeeded();
  await imageReady();
  await page.waitForTimeout(500);
  await page.locator("#process").screenshot({
    path: "artifacts/sop-v3-desktop.png",
    style: ".site-header,.skip-link { visibility: hidden !important; }",
  });
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(350);
  await page.screenshot({
    path: "artifacts/home-sop-v3-desktop.png",
    fullPage: true,
  });
  await page.locator("#sop-tab-1").click();
  await imageReady();
  await page.waitForTimeout(500);
  await page.locator("#process").screenshot({
    path: "artifacts/sop-v3-active-record.png",
    style: ".site-header,.skip-link { visibility: hidden !important; }",
  });
  await page.setViewportSize({ width: 375, height: 844 });
  await page.locator("#sop-tab-0").click();
  await imageReady();
  await page.waitForTimeout(500);
  await page.locator("#process").screenshot({
    path: "artifacts/sop-v3-mobile.png",
    style: ".site-header,.skip-link { visibility: hidden !important; }",
  });
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(350);
  await page.screenshot({
    path: "artifacts/home-sop-v3-mobile.png",
    fullPage: true,
  });
  report.screenshots.push(
    "artifacts/sop-v3-desktop.png",
    "artifacts/sop-v3-active-record.png",
    "artifacts/sop-v3-mobile.png",
    "artifacts/home-sop-v3-desktop.png",
    "artifacts/home-sop-v3-mobile.png",
    "artifacts/sop-v3-record-dialog.png",
  );
});
await check("没有运行时错误或资源失败", async () => {
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.requests, []);
});
await fs.writeFile(
  "artifacts/sop-verification-v3.json",
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify({
    passed: report.checks.filter((c) => c.pass).length,
    total: report.checks.length,
    layouts: report.layouts.length,
  }),
);
await browser.close();
if (report.checks.some((c) => !c.pass)) process.exitCode = 1;
