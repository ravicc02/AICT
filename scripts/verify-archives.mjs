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
  revision: "project-creation-archives",
  checks: [],
  layouts: [],
  a11y: [],
  errors: [],
  failedResources: [],
};
page.on("pageerror", (e) => report.errors.push(e.message));
page.on("response", (response) => {
  if (response.status() >= 400) report.failedResources.push(response.url());
});
const check = async (name, run) => {
  try {
    await run();
    report.checks.push({ name, pass: true });
    console.log("PASS " + name);
  } catch (e) {
    report.checks.push({ name, pass: false, error: e.stack || e.message });
    console.error("FAIL " + name + ": " + e.message);
  }
};
const go = async (path) => {
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
};
const waitForPhoto = () =>
  page.waitForFunction(() => {
    const image = document.querySelector(
      "dialog[open] .dossier-main-photo img",
    );
    return image?.complete && image.naturalWidth > 0;
  });
const close = async () => {
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector("dialog[open]"));
};

await check("作品目录是开放横列，项目和过程记录均有独立入口", async () => {
  await go("/works");
  assert.equal(await page.locator(".archive-row").count(), 6);
  assert.equal(await page.locator(".archive-record-link").count(), 18);
  assert.equal(await page.locator(".work-card,.works-grid").count(), 0);
  const styles = await page
    .locator(".archive-row,.archive-project,.archive-record-link")
    .evaluateAll((elements) =>
      elements.map((e) => {
        const s = getComputedStyle(e);
        return [s.borderRadius, s.boxShadow, s.backgroundColor];
      }),
    );
  assert.ok(
    styles.every(
      ([radius, shadow, color]) =>
        radius === "0px" && shadow === "none" && color === "rgba(0, 0, 0, 0)",
    ),
  );
  await page
    .locator(".archive-row")
    .first()
    .locator(".archive-record-link")
    .nth(1)
    .click();
  await waitForPhoto();
  assert.equal(new URL(page.url()).searchParams.get("record"), "record-06");
  assert.equal(await page.locator(".dossier-title h3").innerText(), "首次试玩");
  await close();
  assert.equal(new URL(page.url()).pathname, "/works/mech");
  assert.equal(new URL(page.url()).search, "");
});

await check(
  "六个项目共32条记录都有图片、老师观察、孩子表达与修改结果",
  async () => {
    let inspected = 0;
    for (const [id, count] of [
      ["mech", 10],
      ["caravan", 6],
      ["formation", 4],
      ["racing", 4],
      ["maze", 4],
      ["fencing", 4],
    ]) {
      await go("/works/" + id);
      assert.equal(await page.locator(".creation-entry").count(), count);
      await page.locator(".creation-entry").first().click();
      const titles = new Set();
      for (let i = 0; i < count; i++) {
        await page.waitForFunction(
          (label) =>
            document
              .querySelector(".dossier-navigation [role=status]")
              ?.textContent?.trim() === label,
          `${String(i + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`,
        );
        await waitForPhoto();
        const title = await page.locator(".dossier-title h3").innerText();
        titles.add(title);
        assert.match(
          await page.locator(".dossier-toolbar").innerText(),
          /示例记录/,
        );
        for (const selector of [
          ".dossier-observation p",
          ".dossier-voice blockquote",
          ".dossier-change p",
        ]) {
          assert.ok((await page.locator(selector).innerText()).length > 10);
        }
        const imageCount = await page
          .locator(".dossier-thumbnails button")
          .count();
        assert.ok(imageCount >= 1 && imageCount <= 3);
        assert.equal(
          await page
            .getByRole("button", { name: "查看上一条记录", exact: true })
            .isDisabled(),
          i === 0,
        );
        assert.equal(
          await page
            .getByRole("button", { name: "查看下一条记录", exact: true })
            .isDisabled(),
          i === count - 1,
        );
        assert.equal(
          new URL(page.url()).searchParams.get("record"),
          `record-${String(i + 1).padStart(2, "0")}`,
        );
        inspected++;
        if (i < count - 1)
          await page
            .getByRole("button", { name: "查看下一条记录", exact: true })
            .click();
      }
      assert.equal(titles.size, count);
      await close();
    }
    assert.equal(inspected, 32);
  },
);

await check(
  "图库可鼠标和方向键切换，翻记录重置图片，焦点保持可用",
  async () => {
    await go("/works/mech");
    const trigger = page.locator(".creation-entry").nth(1);
    await trigger.click();
    await waitForPhoto();
    const first = await page
      .locator(".dossier-main-photo img")
      .getAttribute("src");
    await page.locator(".dossier-thumbnails button").nth(1).click();
    await waitForPhoto();
    assert.notEqual(
      await page.locator(".dossier-main-photo img").getAttribute("src"),
      first,
    );
    await page.keyboard.press("ArrowRight");
    assert.equal(
      await page
        .locator(".dossier-thumbnails button")
        .nth(2)
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.keyboard.press("Home");
    assert.equal(
      await page
        .locator(".dossier-thumbnails button")
        .first()
        .getAttribute("aria-pressed"),
      "true",
    );
    await page
      .getByRole("button", { name: "查看下一条记录", exact: true })
      .click();
    assert.equal(
      await page.locator(".dossier-title h3").innerText(),
      "更新地形",
    );
    assert.equal(
      await page
        .locator(".dossier-thumbnails button[aria-pressed=true]")
        .count(),
      1,
    );
    assert.equal(
      await page
        .locator(".dossier-thumbnails button")
        .first()
        .getAttribute("aria-pressed"),
      "true",
    );
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      assert.equal(
        await page.evaluate(
          () => !!document.activeElement.closest("dialog[open]"),
        ),
        true,
      );
    }
    await close();
    assert.equal(
      await trigger.evaluate((element) => element === document.activeElement),
      true,
    );
  },
);

await check("记录链接支持直达、刷新、关闭和浏览器前进后退", async () => {
  await go("/works/caravan?record=record-04#creation-records");
  await waitForPhoto();
  assert.equal(await page.locator(".dossier-title h3").innerText(), "驾驶试玩");
  await page.reload({ waitUntil: "networkidle" });
  await waitForPhoto();
  assert.equal(await page.locator(".dossier-title h3").innerText(), "驾驶试玩");
  await close();
  assert.equal(new URL(page.url()).pathname, "/works/caravan");
  assert.equal(new URL(page.url()).search, "");
  await page.locator(".creation-entry").first().click();
  await waitForPhoto();
  await page.goBack();
  await page.waitForFunction(() => !document.querySelector("dialog[open]"));
  assert.equal(new URL(page.url()).pathname, "/works/caravan");
  await page.goForward();
  await waitForPhoto();
  assert.equal(await page.locator(".dossier-title h3").innerText(), "初次体验");
  await close();
  await go("/works/mech?record=does-not-exist");
  assert.equal(await page.locator("dialog[open]").count(), 0);
  assert.equal(await page.locator(".creation-entry").count(), 10);
});

await check("项目只有一张总览图，六个维度均可追溯对应记录", async () => {
  await go("/works/mech#project-growth");
  assert.equal(await page.locator(".project-radar").count(), 1);
  assert.equal(await page.locator(".radar-point").count(), 6);
  const profile = await page.locator(".radar-profile").getAttribute("points");
  const observations = new Set();
  for (let i = 0; i < 6; i++) {
    const dimension = page.locator(".radar-dimension").nth(i);
    await dimension.click();
    assert.equal(await dimension.getAttribute("aria-pressed"), "true");
    observations.add(await page.locator(".growth-observation").innerText());
    assert.equal(
      await page.locator(".radar-profile").getAttribute("points"),
      profile,
    );
    const evidence = page.locator(".growth-sources button").first();
    const expected = await evidence.locator("strong").innerText();
    await evidence.click();
    await waitForPhoto();
    assert.equal(await page.locator(".dossier-title h3").innerText(), expected);
    await close();
    await page.waitForFunction(
      (label) => document.activeElement?.getAttribute("aria-label") === label,
      await evidence.getAttribute("aria-label"),
    );
    assert.equal(
      await evidence.evaluate((element) => element === document.activeElement),
      true,
      `dimension ${i}: focus returned to ${await page.evaluate(() => document.activeElement.outerHTML.slice(0, 250))}`,
    );
  }
  assert.equal(observations.size, 6);
});

await check(
  "图片时间线可连续浏览，首尾控制准确，键盘能到最后一条",
  async () => {
    await go("/works/mech#creation-records");
    const track = page.locator(".creation-track");
    const next = page.getByRole("button", {
      name: "向后浏览创作记录",
      exact: true,
    });
    assert.equal(
      await page
        .getByRole("button", { name: "向前浏览创作记录", exact: true })
        .isDisabled(),
      true,
    );
    await next.click();
    await page.waitForFunction(
      () => document.querySelector(".creation-track").scrollLeft > 50,
    );
    const bounds = await track.boundingBox();
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 150);
    await page.mouse.wheel(600, 0);
    for (let i = 0; i < 6 && !(await next.isDisabled()); i++) {
      await next.click();
      await page.waitForTimeout(450);
    }
    assert.equal(await next.isDisabled(), true);
    await page.locator(".creation-entry").last().focus();
    await page.keyboard.press("Enter");
    await waitForPhoto();
    assert.equal(
      await page.locator(".dossier-title h3").innerText(),
      "作品路演",
    );
    await close();
  },
);

await check("六种屏宽的目录、详情、雷达及记录弹窗没有水平溢出", async () => {
  for (const width of [320, 375, 768, 1024, 1387, 1440]) {
    await page.setViewportSize({ width, height: 936 });
    for (const path of [
      "/works",
      "/works/mech",
      "/works/mech?record=record-02",
    ]) {
      await go(path);
      if (path.includes("?")) await waitForPhoto();
      const layout = await page.evaluate(() => {
        const outside = [
          ...document.querySelectorAll(
            ".radar-dimension,dialog[open] button,.archive-project,.archive-record-link",
          ),
        ]
          .filter((element) => {
            const r = element.getBoundingClientRect();
            return r.width && (r.left < -1 || r.right > innerWidth + 1);
          })
          .map((element) => element.textContent);
        const dialog = document.querySelector("dialog[open]");
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          dialogOverflow: dialog ? dialog.scrollWidth - dialog.clientWidth : 0,
          outside,
        };
      });
      report.layouts.push({ width, path, ...layout });
      assert.equal(layout.overflow, 0, `${width} ${path}`);
      assert.equal(layout.dialogOverflow, 0, `${width} ${path}`);
      assert.deepEqual(layout.outside, [], `${width} ${path}`);
    }
  }
});

await check("桌面与手机记录弹窗通过A/AA自动可访问性检查", async () => {
  for (const width of [1387, 375]) {
    await page.setViewportSize({ width, height: 936 });
    await go("/works/mech?record=record-01");
    await waitForPhoto();
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    const violations = scan.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((node) => node.target),
    }));
    report.a11y.push({ width, violations });
    assert.deepEqual(violations, []);
  }
});

await check("减少动态效果实时生效，静态详情仍能阅读过程与总览", async () => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await go("/works/mech?record=record-01");
  await page.locator(".dossier-thumbnails button").nth(1).click();
  assert.equal(
    await page
      .locator(".dossier-main-photo")
      .evaluate(
        (e) =>
          e.getAnimations().filter((a) => a.playState === "running").length,
      ),
    0,
  );
  await close();
  await page.locator(".radar-dimension").nth(4).click();
  assert.equal(
    await page
      .locator(".growth-evidence")
      .evaluate(
        (e) =>
          e
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === "running").length,
      ),
    0,
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const staticContext = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 844 },
  });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(base + "/works/mech");
  assert.equal(await staticPage.locator(".creation-entry").count(), 10);
  assert.equal(await staticPage.locator(".radar-profile").count(), 1);
  assert.match(
    await staticPage.locator(".dossier-sample-note").innerText(),
    /视觉占位/,
  );
  await staticContext.close();
});

await check("桌面和手机最终截图及媒体加载", async () => {
  for (const [width, suffix] of [
    [1387, "desktop"],
    [375, "mobile"],
  ]) {
    await page.setViewportSize({ width, height: 936 });
    for (const [route, name] of [
      ["/works", "index"],
      ["/works/mech", "detail"],
    ]) {
      await go(route);
      await page.evaluate(async () => {
        document
          .querySelectorAll("img")
          .forEach((image) => (image.loading = "eager"));
        await Promise.all(
          [...document.images].map((image) => image.decode().catch(() => {})),
        );
        window.scrollTo({ top: 0, behavior: "instant" });
      });
      await page.waitForTimeout(400);
      await page.screenshot({
        path: `artifacts/archive-${name}-${suffix}.png`,
        fullPage: true,
      });
    }
    await page.locator(".creation-entry").first().click();
    await waitForPhoto();
    await page.waitForFunction(() =>
      document
        .querySelector("dialog[open]")
        .getAnimations({ subtree: true })
        .every((animation) => animation.playState !== "running"),
    );
    await page.screenshot({ path: `artifacts/archive-record-${suffix}.png` });
  }
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.failedResources, []);
});

await fs.writeFile(
  "artifacts/archive-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify({
    passed: report.checks.filter((check) => check.pass).length,
    total: report.checks.length,
    layouts: report.layouts.length,
    a11y: report.a11y.length,
    errors: report.errors,
  }),
);
await browser.close();
if (report.checks.some((check) => !check.pass)) process.exitCode = 1;
