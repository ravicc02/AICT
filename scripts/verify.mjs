import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const errors = [];
const requests = [];
const a11y = [];
const layouts = [];
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => {
  if (r.status() >= 400) requests.push({ url: r.url(), status: r.status() });
});
const check = async (name, fn) => {
  try {
    await fn();
    results.push({ name, pass: true });
    console.log("PASS " + name);
  } catch (e) {
    results.push({ name, pass: false, error: e.message });
    console.error("FAIL " + name + ": " + e.message);
  }
};
const go = async (route) => {
  await page.goto(base + route, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
};
await check("首页画廊：指针与按钮切换", async () => {
  await go("/");
  const before = await page
    .locator(".hero-gallery")
    .evaluate((e) => getComputedStyle(e).transform);
  await page.mouse.move(1150, 600);
  await page.waitForTimeout(220);
  const after = await page
    .locator(".hero-gallery")
    .evaluate((e) => getComputedStyle(e).transform);
  assert.notEqual(before, after);
  await page.getByRole("button", { name: "下一件作品", exact: true }).click();
  await page.waitForTimeout(600);
  assert.match(
    await page.locator(".is-front .art-caption").innerText(),
    /房车人生/,
  );
  await page.getByRole("button", { name: "选择机甲狂澜", exact: true }).click();
  await page.waitForTimeout(500);
  assert.match(
    await page.locator(".is-front .art-caption").innerText(),
    /机甲狂澜/,
  );
});
await check("真实拖动可以切换作品", async () => {
  const r = await page.locator(".is-front img").boundingBox();
  await page.mouse.move(r.x + r.width * 0.7, r.y + r.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(r.x + r.width * 0.2, r.y + r.height * 0.5, {
    steps: 15,
  });
  await page.mouse.up();
  await page.waitForTimeout(650);
  assert.match(
    await page.locator(".is-front .art-caption").innerText(),
    /房车人生/,
  );
  assert.equal(new URL(page.url()).pathname, "/");
});
await check("课程 SOP：左侧目录、记录图片和独立能力总览", async () => {
  assert.equal(
    await page.locator("main > section").nth(1).getAttribute("id"),
    "process",
  );
  assert.equal(await page.locator(".work-selection").count(), 0);
  assert.equal(await page.locator("#process [role=tab]").count(), 10);
  const chart = await page.locator(".sop-growth-diagram").innerHTML();
  const firstImage = await page
    .locator(".sop-record-photo img")
    .getAttribute("src");
  await page
    .getByRole("tab", { name: "第 2 步：加入角色", exact: true })
    .click();
  assert.match(
    await page.locator("#sop-record").innerText(),
    /让角色有自己的规则/,
  );
  assert.notEqual(
    await page.locator(".sop-record-photo img").getAttribute("src"),
    firstImage,
  );
  await page
    .getByRole("tab", { name: "第 2 步：加入角色", exact: true })
    .press("End");
  assert.equal(
    await page
      .getByRole("tab", { name: "第 10 步：作品路演", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  assert.match(await page.locator("#sop-record").innerText(), /讲讲自己的创作/);
  await page
    .getByRole("tab", { name: "第 10 步：作品路演", exact: true })
    .press("Home");
  await page
    .getByRole("button", { name: "下一条创作记录", exact: true })
    .click();
  assert.match(
    await page.locator("#sop-record").innerText(),
    /让角色有自己的规则/,
  );
  assert.equal(await page.locator(".sop-growth-diagram").innerHTML(), chart);
  assert.equal(await page.locator(".sop-growth-profile").count(), 1);
  assert.equal(await page.locator("#process [aria-selected=true]").count(), 1);
  await page.mouse.wheel(0, 250);
  assert.ok((await page.evaluate(() => scrollY)) > 500);
});
await check("课程档位和缺失价格", async () => {
  await go("/courses");
  await page.getByRole("button", { name: "一对二", exact: true }).click();
  assert.match(await page.locator(".plan-term").innerText(), /咨询价格/);
  assert.match(
    await page.locator(".plan-term a").getAttribute("href"),
    /term-two/,
  );
  await page.getByRole("button", { name: "100 次", exact: true }).click();
  assert.match(await page.locator(".plan-year").innerText(), /咨询价格/);
  await page.locator(".plan-year .plan-details").click();
  await page.waitForTimeout(350);
  assert.match(await page.locator("dialog[open]").innerText(), /100 次/);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog[open]").count(), 0);
  assert.equal(
    await page
      .locator(".plan-year .plan-details")
      .evaluate((e) => e === document.activeElement),
    true,
  );
});
await check("常见问题展开收起", async () => {
  const q = page.getByRole("button", { name: "需要准备什么？", exact: true });
  await q.click();
  assert.equal(await q.getAttribute("aria-expanded"), "true");
  assert.match(await page.locator("#faq-1").innerText(), /笔记本电脑/);
  await q.click();
  assert.equal(await page.locator("#faq-1").isVisible(), false);
});
await check("作品分类、搜索、空状态、排序", async () => {
  await go("/works");
  await page.getByRole("button", { name: "创意工具", exact: true }).click();
  await page.waitForTimeout(500);
  assert.equal(await page.locator(".archive-row").count(), 1);
  assert.match(await page.locator(".archive-row").innerText(), /星球编队/);
  await page.getByRole("button", { name: "全部", exact: true }).click();
  await page.getByRole("textbox", { name: "搜索作品" }).fill("机甲");
  await page.waitForTimeout(500);
  assert.equal(await page.locator(".archive-row").count(), 1);
  await page.getByRole("textbox", { name: "搜索作品" }).fill("zzzz-no-work");
  await page.waitForTimeout(500);
  assert.ok(await page.locator(".empty-state").isVisible());
  await page.getByRole("button", { name: "看看全部作品" }).click();
  await page.waitForTimeout(450);
  assert.equal(await page.locator(".archive-row").count(), 6);
  await page.getByRole("combobox", { name: "作品排序" }).selectOption("名称");
  assert.equal(await page.locator(".archive-row").count(), 6);
});
await check("六个作品入口和预览关闭", async () => {
  for (const id of [
    "mech",
    "caravan",
    "formation",
    "racing",
    "maze",
    "fencing",
  ]) {
    await go("/works/" + id);
    await page.getByRole("button", { name: "作品预览", exact: true }).click();
    await page.waitForTimeout(350);
    assert.ok(await page.locator("dialog[open] .preview-note").isVisible());
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog[open]").count(), 0);
    await page.locator(".creation-entry").first().click();
    await page.waitForTimeout(350);
    assert.ok(await page.locator("dialog[open] .dossier-spread").isVisible());
    await page.getByRole("button", { name: "关闭弹窗" }).first().click();
    assert.equal(await page.locator("dialog[open]").count(), 0);
  }
});
await check("预约预览与返回编辑保留填写内容", async () => {
  await go("/contact?plan=year-60");
  assert.equal(await page.locator("#plan").inputValue(), "year-60");
  await page.locator("#parent").fill("预览访客");
  await page.locator("#age").selectOption("9");
  await page.locator("#contact").fill("preview-only");
  await page.locator("#idea").fill("想做一个太空作品");
  await page.getByRole("button", { name: "预览预约" }).click();
  assert.match(await page.locator(".form-success").innerText(), /信息未发送/);
  await page.getByRole("button", { name: "返回编辑" }).click();
  assert.equal(await page.locator("#parent").inputValue(), "预览访客");
  assert.equal(await page.locator("#idea").inputValue(), "想做一个太空作品");
});
await check("桌面与手机 A/AA 自动检查", async () => {
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/courses",
      "/works",
      "/works/mech",
      "/contact",
    ]) {
      await go(route);
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      a11y.push({
        width,
        route,
        violations: scan.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      });
    }
  }
  assert.equal(
    a11y.filter((x) => x.violations.length).length,
    0,
    JSON.stringify(a11y.filter((x) => x.violations.length)),
  );
});
await check("五种屏宽和全部主页面", async () => {
  for (const width of [320, 375, 414, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/courses",
      "/works",
      "/works/mech",
      "/contact",
    ]) {
      await go(route);
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        h1: document.querySelectorAll("h1").length,
        headingOverflow: [...document.querySelectorAll("h1,h2")]
          .filter((e) => e.scrollWidth > e.clientWidth + 2)
          .map((e) => e.textContent),
        controlsOutside: [
          ...document.querySelectorAll(
            "main a.button,main button:not(.hero-art-select),header a,header button",
          ),
        ]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return (
              r.width &&
              r.height &&
              !e.closest("dialog:not([open])") &&
              !e.closest(".creation-track") &&
              (r.right > innerWidth + 1 || r.left < -1)
            );
          })
          .map((e) => e.textContent),
      }));
      layouts.push({ width, route, ...state });
      assert.equal(state.overflow, 0);
      assert.equal(state.h1, 1);
      assert.equal(state.headingOverflow.length, 0);
      assert.equal(
        state.controlsOutside.length,
        0,
        JSON.stringify({ width, route, controls: state.controlsOutside }),
      );
    }
  }
});
await check("手机菜单和导航焦点", async () => {
  await page.setViewportSize({ width: 375, height: 844 });
  await go("/");
  await page.getByRole("button", { name: "打开菜单" }).click();
  assert.ok(await page.getByRole("navigation", { name: "主导航" }).isVisible());
  await page
    .getByRole("navigation", { name: "主导航" })
    .getByRole("link", { name: "课程与方案" })
    .click();
  assert.equal(new URL(page.url()).pathname, "/courses");
  assert.equal(
    await page
      .getByRole("button", { name: "打开菜单" })
      .getAttribute("aria-expanded"),
    "false",
  );
  assert.equal(
    await page.locator("h1").evaluate((e) => e === document.activeElement),
    true,
  );
});
await check("减少动态效果：内容完整、切换有效、无循环", async () => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await go("/");
  await page.getByRole("button", { name: "下一件作品" }).click();
  await page.waitForTimeout(100);
  assert.match(
    await page.locator(".is-front .art-caption").innerText(),
    /房车人生/,
  );
  const transform = await page
    .locator(".hero-gallery")
    .evaluate((e) => getComputedStyle(e).transform);
  await page.mouse.move(1100, 550);
  await page.waitForTimeout(150);
  assert.equal(
    await page
      .locator(".hero-gallery")
      .evaluate((e) => getComputedStyle(e).transform),
    transform,
  );
  assert.equal(
    await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length,
    ),
    0,
  );
  await page
    .getByRole("tab", { name: "第 7 步：调整难度", exact: true })
    .click();
  assert.match(
    await page.locator("#sop-record").innerText(),
    /太难了，就再改一次/,
  );
  await page.waitForTimeout(100);
  assert.equal(
    await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length,
    ),
    0,
  );
  await page.screenshot({
    path: "artifacts/reduced-motion.png",
    fullPage: true,
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
});
await check("无 JavaScript 首屏与真实 404", async () => {
  const ctx = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 844 },
  });
  const p = await ctx.newPage();
  await p.goto(base + "/");
  assert.match(await p.locator("h1").innerText(), /有想法/);
  assert.ok(await p.locator(".hero-art").first().isVisible());
  const r = await p.goto(base + "/not-a-page");
  assert.equal(r.status(), 404);
  assert.match(await p.locator("h1").innerText(), /路上/);
  await ctx.close();
});
assert.equal(errors.length, 0, "Page errors: " + errors.join("; "));
await fs.writeFile(
  "artifacts/browser-check.json",
  JSON.stringify(
    { date: "2026-11-05", results, errors, requests, a11y, layouts },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    passed: results.filter((x) => x.pass).length,
    total: results.length,
    errors,
    layoutCount: layouts.length,
    a11yCount: a11y.length,
  }),
);
await browser.close();
if (results.some((x) => !x.pass)) process.exitCode = 1;
