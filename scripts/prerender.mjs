import fs from "node:fs/promises";
import path from "node:path";
import { render } from "../dist-server/entry-server.js";
const routes = [
  "/",
  "/courses",
  "/works",
  "/contact",
  "/works/mech",
  "/works/caravan",
  "/works/formation",
  "/works/racing",
  "/works/maze",
  "/works/fencing",
  "/404",
];
const template = await fs.readFile("dist/index.html", "utf8");
const titles = {
  "/": "AI 创造营 · 有想法，去创造",
  "/courses": "课程与方案 · AI 创造营",
  "/works": "作品墙 · AI 创造营",
  "/contact": "联系我们 · AI 创造营",
  "/404": "页面未找到 · AI 创造营",
};
const site = process.env.SITE_URL || "";
const configuredSite = site.endsWith("/") ? site.slice(0, -1) : site;
for (const route of routes) {
  let html = template.replace("<!--app-html-->", render(route));
  const title =
    titles[route] ||
    {
      mech: "机甲狂澜",
      caravan: "房车人生",
      formation: "星球编队",
      racing: "狂野飙车",
      maze: "动物迷宫",
      fencing: "击剑对决",
    }[route.split("/").pop()] + " · AI 创造营";
  html = html.replace(
    new RegExp("<title>.*?</title>"),
    "<title>" + title + "</title>",
  );
  html = html.replace(
    'content="AI 创造营 · 有想法，去创造"',
    'content="' + title + '"',
  );
  if (configuredSite)
    html = html.replace(
      "</head>",
      '<link rel="canonical" href="' +
        configuredSite +
        route +
        '"/><meta property="og:image" content="' +
        configuredSite +
        '/og-cover.png"/></head>',
    );
  const target =
    route === "/404" ? "dist/404.html" : path.join("dist", route, "index.html");
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, html);
}
await fs.writeFile("dist/.nojekyll", "");
console.log("Prerendered " + routes.length + " pages.");
