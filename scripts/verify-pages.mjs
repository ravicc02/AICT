import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const liveUrl = process.env.PAGES_URL;
const mount = liveUrl ? new URL(liveUrl).pathname.replace(/\/$/, "") : "/AICT";
const root = path.resolve("artifacts/pages-build");
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".json": "application/json",
};
let server;
let origin;
if (liveUrl) origin = liveUrl.replace(/\/$/, "");
else {
  server = http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    if (url.pathname === mount) {
      response.writeHead(301, { Location: mount + "/" + url.search });
      response.end();
      return;
    }
    if (!url.pathname.startsWith(mount + "/")) {
      response.writeHead(404);
      response.end();
      return;
    }
    let file = path.resolve(
      root,
      "." + decodeURIComponent(url.pathname.slice(mount.length)),
    );
    let status = 200;
    if (!file.startsWith(root + path.sep) && file !== root) {
      response.writeHead(403);
      response.end();
      return;
    }
    try {
      const stat = await fs.stat(file);
      if (stat.isDirectory()) {
        if (!url.pathname.endsWith("/")) {
          response.writeHead(301, {
            Location: url.pathname + "/" + url.search,
          });
          response.end();
          return;
        }
        file = path.join(file, "index.html");
      }
      await fs.access(file);
    } catch {
      file = path.join(root, "404.html");
      status = 404;
    }
    response.writeHead(status, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
    });
    response.end(await fs.readFile(file));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}${mount}`;
}
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1387, height: 936 } });
const report = {
  date: new Date().toISOString(),
  site: origin,
  mode: liveUrl ? "live" : "local-subpath",
  routes: [],
  errors: [],
  failedResources: [],
  checks: [],
};
page.on("pageerror", (error) => report.errors.push(error.message));
page.on("response", (response) => {
  if (
    response.status() >= 400 &&
    response.request().resourceType() !== "document"
  )
    report.failedResources.push({
      url: response.url(),
      status: response.status(),
    });
});
try {
  for (const route of [
    "/",
    "/courses/",
    "/works/",
    "/contact/",
    "/works/mech/",
    "/works/caravan/",
    "/works/formation/",
    "/works/racing/",
    "/works/maze/",
    "/works/fencing/",
  ]) {
    const response = await page.goto(origin + route, {
      waitUntil: "networkidle",
    });
    assert.equal(response.status(), 200, route);
    assert.equal(await page.locator("h1").count(), 1, route);
    assert.ok((await page.locator("h1").innerText()).length > 0);
    const wrongPaths = await page
      .locator("a[href],img[src],script[src],link[href]")
      .evaluateAll(
        (elements, prefix) =>
          elements
            .map(
              (element) =>
                element.getAttribute("href") || element.getAttribute("src"),
            )
            .filter(
              (value) =>
                value?.startsWith("/") && value !== prefix && !value.startsWith(prefix + "/"),
            ),
        mount,
      );
    assert.deepEqual(wrongPaths, [], route + " must keep the deployment base");
    report.routes.push({ route, status: response.status() });
  }
  report.checks.push(
    "10 prerendered routes, assets and navigation retain the repository base",
  );
  await page.goto(origin + "/", { waitUntil: "networkidle" });
  await page
    .getByRole("navigation", { name: "主导航", exact: true })
    .getByRole("link", { name: "作品墙", exact: true })
    .click();
  assert.equal(
    new URL(page.url()).pathname.replace(/\/$/, ""),
    mount + "/works",
  );
  await page.locator(".archive-record-link").first().click();
  await page.waitForFunction(
    () => !!document.querySelector("dialog[open] .dossier-title h3"),
  );
  await page.waitForFunction(() => {
    const image = document.querySelector(
      "dialog[open] .dossier-main-photo img",
    );
    return image?.complete && image.naturalWidth > 0;
  });
  assert.ok(new URL(page.url()).pathname.startsWith(mount + "/works/"));
  await page.reload({ waitUntil: "networkidle" });
  assert.ok(await page.locator("dialog[open] .dossier-spread").isVisible());
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector("dialog[open]"));
  report.checks.push(
    "Client navigation, record deep links, reload and close work under the base",
  );
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto(origin + "/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "打开菜单", exact: true }).click();
  await page
    .getByRole("navigation", { name: "主导航", exact: true })
    .getByRole("link", { name: "课程与方案", exact: true })
    .click();
  assert.equal(
    new URL(page.url()).pathname.replace(/\/$/, ""),
    mount + "/courses",
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
    0,
  );
  report.checks.push("Mobile navigation and width are correct");
  const missing = await page.goto(origin + "/not-a-page/", {
    waitUntil: "networkidle",
  });
  assert.equal(missing.status(), 404);
  assert.match(await page.locator("h1").innerText(), /路上/);
  report.checks.push("Custom 404 renders with valid assets");
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.failedResources, []);
  await page.goto(origin + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({
    path: liveUrl
      ? "artifacts/pages-live-mobile.png"
      : "artifacts/pages-subpath-mobile.png",
    fullPage: true,
  });
  report.pass = true;
  console.log(
    JSON.stringify({
      pass: true,
      mode: report.mode,
      site: origin,
      routes: report.routes.length,
      checks: report.checks,
      errors: report.errors,
      failedResources: report.failedResources,
    }),
  );
} catch (error) {
  report.pass = false;
  report.error = error.stack;
  console.error(error);
  process.exitCode = 1;
} finally {
  await fs.writeFile(
    liveUrl
      ? "artifacts/pages-live-verification.json"
      : "artifacts/pages-subpath-verification.json",
    JSON.stringify(report, null, 2),
  );
  await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
}
