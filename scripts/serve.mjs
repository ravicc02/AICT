import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
const root = path.resolve("dist");
const args = process.argv;
const port = Number(
  process.env.PORT || args[args.indexOf("--port") + 1] || 4173,
);
const actualPort = args.includes("--port")
  ? port
  : Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".json": "application/json",
};
http
  .createServer(async (req, res) => {
    try {
      if (!["GET", "HEAD"].includes(req.method)) {
        res.writeHead(405);
        res.end();
        return;
      }
      const url = new URL(req.url, "http://localhost");
      let pathname;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        res.writeHead(400);
        res.end();
        return;
      }
      let file = path.resolve(root, "." + pathname);
      if (file !== root && !file.startsWith(root + path.sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      let status = 200;
      try {
        const stat = await fs.stat(file);
        if (stat.isDirectory()) file = path.join(file, "index.html");
        await fs.access(file);
      } catch {
        file = path.join(root, "404.html");
        status = 404;
      }
      const body = await fs.readFile(file);
      res.writeHead(status, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Content-Length": body.length,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": file.includes(path.sep + "assets" + path.sep)
          ? "public,max-age=31536000,immutable"
          : "no-cache",
      });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch {
      res.writeHead(500);
      res.end("Preview unavailable");
    }
  })
  .listen(actualPort, "127.0.0.1", () =>
    console.log("AI 创造营 preview: http://127.0.0.1:" + actualPort),
  );
