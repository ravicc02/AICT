import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const discovery = JSON.parse(
  await fs.readFile(
    path.join(root, "artifacts/reference-downloads/discovery.json"),
    "utf8",
  ),
);
const allowedHosts = new Set(["edu.xgteacher.cn", "works.xgteacher.cn"]);
const jobs = [];
const seen = new Map();
const projects = [];
function register(project, sourceUrl, name, type, sourceSequence = null) {
  const url = new URL(sourceUrl);
  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname))
    throw new Error("Unexpected image host: " + url.hostname);
  if (seen.has(sourceUrl)) return seen.get(sourceUrl);
  const extension = path.extname(url.pathname).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(extension))
    throw new Error("Unsupported image: " + sourceUrl);
  const key = project.id + "/" + name;
  const job = {
    key,
    projectId: project.id,
    type,
    sourceSequence,
    sourcePage: project.sourcePage,
    sourceUrl,
    originalPath: `artifacts/reference-downloads/originals/${key}${extension}`,
    localPath: `/images/reference/${key}.webp`,
  };
  seen.set(sourceUrl, key);
  jobs.push(job);
  return key;
}
for (const project of discovery.projects) {
  projects.push({
    id: project.id,
    sourcePage: project.sourcePage,
    previewCount: project.previewCount,
    cover: register(project, project.coverUrl, "cover", "cover"),
    records: project.records.map((record) => ({
      sequence: record.sequence,
      images: [...record.images]
        .sort((a, b) => Number(b.isCover) - Number(a.isCover))
        .map((image, index) =>
          register(
            project,
            image.url,
            `record-${String(record.sequence).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
            "record",
            record.sequence,
          ),
        ),
    })),
  });
}
let next = 0;
let completed = 0;
const failures = [];
async function download(job) {
  const file = path.join(root, job.originalPath);
  await fs.mkdir(path.dirname(file), { recursive: true });
  let data;
  try {
    data = await fs.readFile(file);
  } catch {}
  if (!data?.length) {
    let lastError;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(job.sourceUrl, {
          signal: AbortSignal.timeout(30000),
          headers: {
            "User-Agent": "AICT-local-preview-image-fetch/1.0",
            Accept: "image/*",
          },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!response.headers.get("content-type")?.startsWith("image/"))
          throw new Error("Response is not an image");
        if (Number(response.headers.get("content-length")) > 32 * 1024 * 1024)
          throw new Error("Image exceeds 32 MB");
        data = Buffer.from(await response.arrayBuffer());
        if (data.length > 32 * 1024 * 1024)
          throw new Error("Image exceeds 32 MB");
        await fs.writeFile(file, data);
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!data) throw lastError;
  }
  job.originalBytes = data.length;
  job.sha256 = crypto.createHash("sha256").update(data).digest("hex");
  completed++;
  if (completed % 25 === 0 || completed === jobs.length)
    console.log(`Images downloaded: ${completed}/${jobs.length}`);
}
const workers = await Promise.allSettled(
  Array.from({ length: 3 }, async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      try {
        await download(job);
      } catch (error) {
        failures.push({ sourceUrl: job.sourceUrl, error: error.message });
      }
    }
  }),
);
for (const result of workers)
  if (result.status === "rejected")
    failures.push({ error: String(result.reason) });
const manifest = {
  sourceSite: discovery.sourceSite,
  retrievedAt: new Date().toISOString(),
  scope:
    "Public images only. For local visual preview; not AICT student records. No source text, assessment, student identity or video was imported.",
  projects,
  images: jobs.filter((job) => job.sha256),
  failures,
};
await fs.writeFile(
  path.join(root, "artifacts/reference-downloads/manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log(
  JSON.stringify({
    downloaded: completed,
    uniqueImages: jobs.length,
    sourceBytes: manifest.images.reduce(
      (sum, image) => sum + image.originalBytes,
      0,
    ),
    failures,
  }),
);
if (failures.length) process.exitCode = 1;
