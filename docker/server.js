"use strict";

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const crypto = require("node:crypto");

const BODY_LIMIT = 2 * 1024 * 1024;
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const JOB_SCHEMA_VERSION = 1;
const PRESET_SCHEMA_VERSION = 1;

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function sendJson(response, status, data, extraHeaders) {
  const body = JSON.stringify(data);
  response.writeHead(status, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "x-content-type-options": "nosniff",
    ...extraHeaders,
  });
  response.end(body);
}

function sendError(response, status, message, extraHeaders) {
  sendJson(response, status, { error: message }, extraHeaders);
}

function normalizePreset(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const id = typeof value.id === "string" ? value.id.trim() : "";
  const name = typeof value.name === "string" ? value.name.trim() : "";

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    volumeCapacity: String(value.volumeCapacity ?? ""),
    weightCapacity: String(value.weightCapacity ?? ""),
    fuelConsumption: String(value.fuelConsumption ?? ""),
    pricePerTruck: String(value.pricePerTruck ?? ""),
  };
}

function normalizePresetState(value) {
  const source = value && typeof value === "object" ? value : {};
  const presets = Array.isArray(source.presets)
    ? source.presets.map(normalizePreset).filter(Boolean)
    : [];
  const selectedId = typeof source.selectedId === "string"
    && presets.some((preset) => preset.id === source.selectedId)
    ? source.selectedId
    : null;

  return {
    schemaVersion: PRESET_SCHEMA_VERSION,
    presets,
    selectedId,
  };
}

function normalizeJob(value, expectedId) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "Job must be a JSON object.");
  }

  const id = typeof value.id === "string" ? value.id.trim() : "";
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const data = value.data && typeof value.data === "object" && !Array.isArray(value.data)
    ? value.data
    : null;

  if (!id || !name || !data) {
    throw new HttpError(400, "Job needs an id, name and data.");
  }

  if (!SAFE_ID.test(id)) {
    throw new HttpError(400, "Job id is not valid.");
  }

  if (expectedId && id !== expectedId) {
    throw new HttpError(400, "Job id does not match the URL.");
  }

  return {
    id,
    name,
    savedAt: typeof value.savedAt === "string" ? value.savedAt : "",
    summary: typeof value.summary === "string" ? value.summary : "",
    data,
  };
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooLarge = false;
    const chunks = [];

    request.on("data", (chunk) => {
      if (tooLarge) {
        return;
      }

      size += chunk.length;
      if (size > BODY_LIMIT) {
        tooLarge = true;
        return;
      }

      chunks.push(chunk);
    });

    request.on("end", () => {
      if (tooLarge) {
        reject(new HttpError(413, "Request body is too large."));
        return;
      }

      const text = Buffer.concat(chunks).toString("utf8");
      if (!text.trim()) {
        reject(new HttpError(400, "Request body is empty."));
        return;
      }

      try {
        resolve(JSON.parse(text));
      } catch (error) {
        reject(new HttpError(400, "Request body is not valid JSON."));
      }
    });

    request.on("error", (error) => {
      reject(error);
    });
  });
}

function atomicWrite(filePath, text) {
  const directory = path.dirname(filePath);
  const tempPath = path.join(
    directory,
    `.${path.basename(filePath)}.${crypto.randomUUID()}.tmp`
  );

  return fsp.writeFile(tempPath, text, "utf8")
    .then(() => fsp.rename(tempPath, filePath))
    .catch(async (error) => {
      await fsp.rm(tempPath, { force: true }).catch(() => {});
      throw error;
    });
}

function createServer(options) {
  const settings = options || {};
  const appDir = path.resolve(settings.appDir || path.join(__dirname, "..", "app"));
  const dataDir = path.resolve(settings.dataDir || path.join(__dirname, "data"));
  const jobsDir = path.join(dataDir, "jobs");
  const trashDir = path.join(dataDir, "trash");

  fs.mkdirSync(jobsDir, { recursive: true });
  fs.mkdirSync(trashDir, { recursive: true });

  async function listJobs() {
    const names = await fsp.readdir(jobsDir);
    const jobs = [];

    for (const name of names) {
      if (!name.endsWith(".json")) {
        continue;
      }

      try {
        const raw = await fsp.readFile(path.join(jobsDir, name), "utf8");
        const job = normalizeJob(JSON.parse(raw));
        jobs.push(job);
      } catch (error) {
        continue;
      }
    }

    jobs.sort((left, right) => {
      const byDate = String(right.savedAt).localeCompare(String(left.savedAt));
      return byDate !== 0 ? byDate : left.name.localeCompare(right.name);
    });

    return jobs;
  }

  async function readPresets() {
    try {
      const raw = await fsp.readFile(path.join(dataDir, "presets.json"), "utf8");
      return normalizePresetState(JSON.parse(raw));
    } catch (error) {
      return normalizePresetState(null);
    }
  }

  async function handleJobsApi(request, response, url) {
    if (url.pathname === "/api/jobs") {
      if (request.method !== "GET") {
        sendError(response, 405, "Method not allowed.", { allow: "GET" });
        return;
      }

      sendJson(response, 200, { jobs: await listJobs() });
      return;
    }

    const match = url.pathname.match(/^\/api\/jobs\/([^/]+)$/);
    if (!match) {
      sendError(response, 404, "Not found.");
      return;
    }

    let id;
    try {
      id = decodeURIComponent(match[1]);
    } catch (error) {
      sendError(response, 400, "Job id is not valid.");
      return;
    }

    if (!SAFE_ID.test(id)) {
      sendError(response, 400, "Job id is not valid.");
      return;
    }

    if (request.method === "PUT") {
      const body = await readBody(request);
      const job = normalizeJob(body, id);
      const target = path.join(jobsDir, `${id}.json`);
      await atomicWrite(target, `${JSON.stringify(job, null, 2)}\n`);
      sendJson(response, 200, { job });
      return;
    }

    if (request.method === "DELETE") {
      const target = path.join(jobsDir, `${id}.json`);

      try {
        const stat = await fsp.stat(target);
        if (!stat.isFile()) {
          throw new HttpError(404, "Job not found.");
        }
      } catch (error) {
        if (error.code === "ENOENT") {
          throw new HttpError(404, "Job not found.");
        }
        throw error;
      }

      const trashName = `${id}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.json`;
      await fsp.rename(target, path.join(trashDir, trashName));
      response.writeHead(204, {
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      });
      response.end();
      return;
    }

    sendError(response, 405, "Method not allowed.", { allow: "PUT, DELETE" });
  }

  async function handlePresetsApi(request, response) {
    if (request.method === "GET") {
      sendJson(response, 200, await readPresets());
      return;
    }

    if (request.method === "PUT") {
      const body = await readBody(request);
      if (!body || typeof body !== "object" || !Array.isArray(body.presets)) {
        throw new HttpError(400, "Presets must be a JSON object with a presets array.");
      }

      const presets = normalizePresetState(body);
      await atomicWrite(
        path.join(dataDir, "presets.json"),
        `${JSON.stringify(presets, null, 2)}\n`
      );
      sendJson(response, 200, presets);
      return;
    }

    sendError(response, 405, "Method not allowed.", { allow: "GET, PUT" });
  }

  async function serveStatic(request, response, url) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      sendError(response, 405, "Method not allowed.", { allow: "GET, HEAD" });
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch (error) {
      sendError(response, 400, "Path is not valid.");
      return;
    }

    if (pathname === "/") {
      pathname = "/index.html";
    }

    const segments = pathname.split("/").filter(Boolean);
    if (segments.some((segment) => (
      segment === "."
      || segment === ".."
      || segment.includes("\\")
      || segment.includes("\0")
    ))) {
      sendError(response, 404, "Not found.");
      return;
    }

    const filePath = path.resolve(appDir, ...segments);
    if (filePath !== appDir && !filePath.startsWith(`${appDir}${path.sep}`)) {
      sendError(response, 404, "Not found.");
      return;
    }

    let stat;
    try {
      stat = await fsp.stat(filePath);
    } catch (error) {
      sendError(response, 404, "Not found.");
      return;
    }

    if (!stat.isFile()) {
      sendError(response, 404, "Not found.");
      return;
    }

    const type = CONTENT_TYPES[path.extname(filePath).toLowerCase()]
      || "application/octet-stream";
    const headers = {
      "cache-control": "no-cache",
      "content-type": type,
      "content-length": stat.size,
      "x-content-type-options": "nosniff",
    };

    if (request.method === "HEAD") {
      response.writeHead(200, headers);
      response.end();
      return;
    }

    const body = await fsp.readFile(filePath);
    response.writeHead(200, headers);
    response.end(body);
  }

  async function handler(request, response) {
    try {
      const url = new URL(request.url || "/", "http://localhost");

      if (url.pathname === "/api/health") {
        if (request.method !== "GET") {
          sendError(response, 405, "Method not allowed.", { allow: "GET" });
          return;
        }
        sendJson(response, 200, { ok: true });
        return;
      }

      if (url.pathname === "/api/jobs" || url.pathname.startsWith("/api/jobs/")) {
        await handleJobsApi(request, response, url);
        return;
      }

      if (url.pathname === "/api/presets") {
        await handlePresetsApi(request, response);
        return;
      }

      if (url.pathname.startsWith("/api/")) {
        sendError(response, 404, "Not found.");
        return;
      }

      await serveStatic(request, response, url);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      const message = status === 500 ? "Server error." : error.message;
      if (!response.headersSent) {
        sendError(response, status, message);
      } else {
        response.end();
      }
    }
  }

  return http.createServer(handler);
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 8080;
  const host = process.env.HOST || "0.0.0.0";
  const server = createServer({
    appDir: process.env.APP_DIR,
    dataDir: process.env.DATA_DIR,
  });

  server.listen(port, host, () => {
    console.log(`Quote Assistant listening on http://${host}:${port}`);
  });
}

module.exports = { createServer };
