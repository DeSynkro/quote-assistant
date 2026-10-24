"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

const { createServer } = require("../docker/server.js");

function sampleJob(id, name, savedAt) {
  return {
    id,
    name,
    savedAt,
    summary: "1 truck · $800",
    data: {
      removalsEnabled: true,
      sections: [],
      truck: { volumeCapacity: "6.5" },
    },
  };
}

async function makeFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "quote-assistant-server-"));
  const appDir = path.join(root, "app");
  const dataDir = path.join(root, "data");
  await fs.mkdir(appDir, { recursive: true });
  await fs.writeFile(
    path.join(appDir, "index.html"),
    "<!doctype html><title>Quote Assistant test</title><h1>Quote Assistant</h1>",
    "utf8"
  );

  return { root, appDir, dataDir };
}

async function startServer(t, fixture) {
  const server = createServer({
    appDir: fixture.appDir,
    dataDir: fixture.dataDir,
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(fixture.root, { recursive: true, force: true });
  });

  const { port } = server.address();
  return {
    server,
    base: `http://127.0.0.1:${port}`,
  };
}

async function putJson(url, body) {
  return fetch(url, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("serves the app and reports health", async (t) => {
  const fixture = await makeFixture();
  const { base } = await startServer(t, fixture);

  const page = await fetch(`${base}/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Quote Assistant/);

  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { ok: true });
});

test("does not serve files outside the app directory", async (t) => {
  const fixture = await makeFixture();
  await fs.writeFile(path.join(fixture.root, "secret.txt"), "secret", "utf8");
  const { base } = await startServer(t, fixture);

  const response = await fetch(`${base}/%2e%2e/secret.txt`);
  assert.equal(response.status, 404);
  assert.doesNotMatch(await response.text(), /secret/);
});

test("stores, lists and updates jobs with last save wins", async (t) => {
  const fixture = await makeFixture();
  const { base } = await startServer(t, fixture);

  const first = await putJson(`${base}/api/jobs/job-1`, sampleJob(
    "job-1",
    "Front yard",
    "2026-10-24T15:00:00.000Z"
  ));
  assert.equal(first.status, 200);

  const second = await putJson(`${base}/api/jobs/job-1`, sampleJob(
    "job-1",
    "Front yard updated",
    "2026-10-24T16:00:00.000Z"
  ));
  assert.equal(second.status, 200);

  const response = await fetch(`${base}/api/jobs`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.jobs.length, 1);
  assert.equal(data.jobs[0].name, "Front yard updated");

  const stored = JSON.parse(
    await fs.readFile(path.join(fixture.dataDir, "jobs", "job-1.json"), "utf8")
  );
  assert.equal(stored.name, "Front yard updated");
  assert.match(
    await fs.readFile(path.join(fixture.dataDir, "jobs", "job-1.json"), "utf8"),
    /\n  "id"/
  );
});

test("keeps jobs after a server restart", async (t) => {
  const fixture = await makeFixture();
  const first = await startServer(t, fixture);

  await putJson(`${first.base}/api/jobs/job-1`, sampleJob(
    "job-1",
    "Front yard",
    "2026-10-24T15:00:00.000Z"
  ));

  await new Promise((resolve) => first.server.close(resolve));

  const second = await startServer(t, fixture);
  const response = await fetch(`${second.base}/api/jobs`);
  const data = await response.json();
  assert.equal(data.jobs.length, 1);
  assert.equal(data.jobs[0].name, "Front yard");
});

test("moves deleted jobs to trash", async (t) => {
  const fixture = await makeFixture();
  const { base } = await startServer(t, fixture);

  await putJson(`${base}/api/jobs/job-1`, sampleJob(
    "job-1",
    "Front yard",
    "2026-10-24T15:00:00.000Z"
  ));

  const deleted = await fetch(`${base}/api/jobs/job-1`, { method: "DELETE" });
  assert.equal(deleted.status, 204);

  const jobs = await (await fetch(`${base}/api/jobs`)).json();
  assert.equal(jobs.jobs.length, 0);

  const trash = await fs.readdir(path.join(fixture.dataDir, "trash"));
  assert.equal(trash.length, 1);
  assert.match(trash[0], /^job-1-/);
});

test("rejects unsafe ids, malformed JSON and mismatched ids", async (t) => {
  const fixture = await makeFixture();
  const { base } = await startServer(t, fixture);

  const unsafe = await putJson(
    `${base}/api/jobs/%2e%2e%2fevil`,
    sampleJob("job-1", "Front yard", "2026-10-24T15:00:00.000Z")
  );
  assert.equal(unsafe.status, 400);

  const malformed = await fetch(`${base}/api/jobs/job-1`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: "{not json",
  });
  assert.equal(malformed.status, 400);

  const mismatch = await putJson(
    `${base}/api/jobs/job-1`,
    sampleJob("job-2", "Front yard", "2026-10-24T15:00:00.000Z")
  );
  assert.equal(mismatch.status, 400);
});

test("stores and returns shared truck presets", async (t) => {
  const fixture = await makeFixture();
  const { base } = await startServer(t, fixture);

  const empty = await fetch(`${base}/api/presets`);
  assert.equal(empty.status, 200);
  assert.deepEqual(await empty.json(), {
    schemaVersion: 1,
    presets: [],
    selectedId: null,
  });

  const presets = {
    schemaVersion: 1,
    presets: [
      {
        id: "truck-1",
        name: "Tipper",
        volumeCapacity: "6.5",
        weightCapacity: "8",
        fuelConsumption: "8.2",
        pricePerTruck: "800",
      },
    ],
    selectedId: "truck-1",
  };
  const saved = await putJson(`${base}/api/presets`, presets);
  assert.equal(saved.status, 200);

  const loaded = await (await fetch(`${base}/api/presets`)).json();
  assert.deepEqual(loaded, presets);

  const file = JSON.parse(
    await fs.readFile(path.join(fixture.dataDir, "presets.json"), "utf8")
  );
  assert.deepEqual(file, presets);
});
