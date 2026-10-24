"use strict";

const assert = require("node:assert/strict");

function memoryBackend() {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
  };
}


function fakeJsonFetch(handler) {
  const calls = [];

  async function fetchImpl(url, options) {
    const settings = options || {};
    calls.push({
      url,
      method: settings.method || "GET",
      body: settings.body,
    });
    const result = await handler(url, settings, calls.length);
    const status = result.status || 200;

    return {
      ok: status >= 200 && status < 300,
      status,
      async json() {
        return result.body;
      },
    };
  }

  return { fetchImpl, calls };
}

function sampleSharedJob(id, name) {
  return {
    id,
    name,
    savedAt: "2026-10-24T15:00:00.000Z",
    summary: "1 truck · $800",
    data: {
      removalsEnabled: true,
      sections: [],
      truck: { volumeCapacity: "6.5" },
    },
  };
}

function createCases(QuoteStorage) {
  return [
    {
      name: "loads empty truck preset storage",
      run() {
        const store = QuoteStorage.createStore(memoryBackend());
        assert.deepEqual(store.load(), { presets: [], selectedId: null });
      },
    },
    {
      name: "saves and loads truck presets",
      run() {
        const store = QuoteStorage.createStore(memoryBackend());
        const presets = [
          {
            id: "truck-1",
            name: "Tipper",
            volumeCapacity: "6.5",
            weightCapacity: "8",
            fuelConsumption: "8.2",
            pricePerTruck: "800",
          },
        ];
        assert.equal(store.save({ presets, selectedId: "truck-1" }), true);
        assert.deepEqual(store.load(), { presets, selectedId: "truck-1" });
      },
    },
    {
      name: "ignores invalid truck preset JSON",
      run() {
        const backend = memoryBackend();
        backend.setItem(QuoteStorage.KEY, "{not json");
        const store = QuoteStorage.createStore(backend);
        assert.deepEqual(store.load(), { presets: [], selectedId: null });
      },
    },
    {
      name: "ignores an unknown truck preset schema version",
      run() {
        const backend = memoryBackend();
        backend.setItem(QuoteStorage.KEY, JSON.stringify({
          schemaVersion: 99,
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
        }));
        const store = QuoteStorage.createStore(backend);
        assert.deepEqual(store.load(), { presets: [], selectedId: null });
      },
    },
    {
      name: "filters invalid truck presets",
      run() {
        const backend = memoryBackend();
        backend.setItem(QuoteStorage.KEY, JSON.stringify({
          schemaVersion: 1,
          presets: [
            { id: "", name: "No id" },
            { id: "truck-2", name: "" },
            { id: "truck-3", name: "Valid" },
          ],
          selectedId: "truck-3",
        }));
        const store = QuoteStorage.createStore(backend);
        const loaded = store.load();
        assert.equal(loaded.presets.length, 1);
        assert.equal(loaded.presets[0].id, "truck-3");
        assert.equal(loaded.presets[0].name, "Valid");
        assert.equal(loaded.selectedId, "truck-3");
      },
    },
    {
      name: "drops a selected truck id that is not saved",
      run() {
        const backend = memoryBackend();
        backend.setItem(QuoteStorage.KEY, JSON.stringify({
          schemaVersion: 1,
          presets: [],
          selectedId: "missing",
        }));
        const store = QuoteStorage.createStore(backend);
        assert.deepEqual(store.load(), { presets: [], selectedId: null });
      },
    },
    {
      name: "handles unavailable truck preset storage",
      run() {
        const store = QuoteStorage.createStore(null);
        assert.deepEqual(store.load(), { presets: [], selectedId: null });
        assert.equal(store.save({ presets: [], selectedId: null }), false);
      },
    },

    {
      name: "loads shared truck presets from the API",
      async run() {
        const presets = [
          {
            id: "truck-1",
            name: "Tipper",
            volumeCapacity: "6.5",
            weightCapacity: "8",
            fuelConsumption: "8.2",
            pricePerTruck: "800",
          },
        ];
        const { fetchImpl, calls } = fakeJsonFetch(() => ({
          body: { schemaVersion: 1, presets, selectedId: "truck-1" },
        }));
        const store = QuoteStorage.createRemoteStore("/api", fetchImpl);
        assert.deepEqual(await store.load(), { presets, selectedId: "truck-1" });
        assert.equal(calls.length, 1);
        assert.equal(calls[0].method, "GET");
        assert.equal(calls[0].url, "/api/presets");
      },
    },
    {
      name: "saves shared truck presets to the API",
      async run() {
        const presets = [
          {
            id: "truck-1",
            name: "Tipper",
            volumeCapacity: "6.5",
            weightCapacity: "8",
            fuelConsumption: "8.2",
            pricePerTruck: "800",
          },
        ];
        const { fetchImpl, calls } = fakeJsonFetch(() => ({ body: { presets } }));
        const store = QuoteStorage.createRemoteStore("/api", fetchImpl);
        assert.equal(await store.save({ presets, selectedId: "truck-1" }), true);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].method, "PUT");
        assert.equal(calls[0].url, "/api/presets");
        assert.deepEqual(JSON.parse(calls[0].body), {
          schemaVersion: 1,
          presets,
          selectedId: "truck-1",
        });
      },
    },
    {
      name: "falls back when the shared preset API is unavailable",
      async run() {
        const { fetchImpl } = fakeJsonFetch(() => ({ status: 500, body: {} }));
        const store = QuoteStorage.createRemoteStore("/api", fetchImpl);
        assert.deepEqual(await store.load(), { presets: [], selectedId: null });
        assert.equal(await store.save({ presets: [], selectedId: null }), false);
      },
    },
    {
      name: "loads shared jobs from the API",
      async run() {
        const job = sampleSharedJob("job-1", "Front yard");
        const { fetchImpl, calls } = fakeJsonFetch(() => ({ body: { jobs: [job] } }));
        const store = QuoteStorage.createRemoteJobStore("/api/", fetchImpl);
        assert.deepEqual(await store.load(), { jobs: [job] });
        assert.equal(calls.length, 1);
        assert.equal(calls[0].method, "GET");
        assert.equal(calls[0].url, "/api/jobs");
      },
    },
    {
      name: "writes changed shared jobs and deletes removed jobs",
      async run() {
        const first = sampleSharedJob("job-1", "Front yard");
        const second = sampleSharedJob("job-2", "Back yard");
        const third = sampleSharedJob("job-3", "Driveway");
        const { fetchImpl, calls } = fakeJsonFetch(() => ({ body: {} }));
        const store = QuoteStorage.createRemoteJobStore("/api", fetchImpl);

        const loaded = await store.load();
        assert.equal(loaded.jobs.length, 0);
        await store.save({ jobs: [first, second] });
        calls.length = 0;

        const updated = { ...first, name: "Front yard updated" };
        assert.equal(await store.save({ jobs: [updated, third] }), true);

        const putUrls = calls.filter((call) => call.method === "PUT").map((call) => call.url).sort();
        const deleteUrls = calls.filter((call) => call.method === "DELETE").map((call) => call.url);
        assert.deepEqual(putUrls, ["/api/jobs/job-1", "/api/jobs/job-3"]);
        assert.deepEqual(deleteUrls, ["/api/jobs/job-2"]);
        assert.equal(calls.filter((call) => call.url === "/api/jobs/job-2" && call.method === "PUT").length, 0);
      },
    },
    {
      name: "does not rewrite unchanged shared jobs",
      async run() {
        const job = sampleSharedJob("job-1", "Front yard");
        const { fetchImpl, calls } = fakeJsonFetch((url) => (
          url === "/api/jobs" ? { body: { jobs: [job] } } : { body: {} }
        ));
        const store = QuoteStorage.createRemoteJobStore("/api", fetchImpl);

        await store.load();
        calls.length = 0;
        assert.equal(await store.save({ jobs: [job] }), true);
        assert.equal(calls.length, 0);
      },
    },
    {
      name: "reports a failed shared job save",
      async run() {
        const first = sampleSharedJob("job-1", "Front yard");
        const second = sampleSharedJob("job-2", "Back yard");
        const { fetchImpl } = fakeJsonFetch((url, options) => (
          options.method === "PUT" && url.endsWith("/job-2")
            ? { status: 500, body: {} }
            : { body: {} }
        ));
        const store = QuoteStorage.createRemoteJobStore("/api", fetchImpl);

        await store.load();
        assert.equal(await store.save({ jobs: [first, second] }), false);
      },
    },
    {
      name: "loads empty job storage",
      run() {
        const store = QuoteStorage.createJobStore(memoryBackend());
        assert.deepEqual(store.load(), { jobs: [] });
      },
    },
    {
      name: "saves and loads jobs",
      run() {
        const store = QuoteStorage.createJobStore(memoryBackend());
        const jobs = [
          {
            id: "job-1",
            name: "Front yard",
            savedAt: "2026-10-24T15:00:00.000Z",
            summary: "2 trucks · $1,234",
            data: {
              sections: [],
              truck: { volumeCapacity: "6.5" },
            },
          },
        ];
        assert.equal(store.save({ jobs }), true);
        assert.deepEqual(store.load(), { jobs });
      },
    },
    {
      name: "ignores invalid job JSON",
      run() {
        const backend = memoryBackend();
        backend.setItem(QuoteStorage.JOB_KEY, "{not json");
        const store = QuoteStorage.createJobStore(backend);
        assert.deepEqual(store.load(), { jobs: [] });
      },
    },
    {
      name: "ignores an unknown job schema version",
      run() {
        const backend = memoryBackend();
        backend.setItem(QuoteStorage.JOB_KEY, JSON.stringify({
          schemaVersion: 99,
          jobs: [
            { id: "job-1", name: "Front yard", savedAt: "", data: {} },
          ],
        }));
        const store = QuoteStorage.createJobStore(backend);
        assert.deepEqual(store.load(), { jobs: [] });
      },
    },
    {
      name: "filters invalid jobs",
      run() {
        const backend = memoryBackend();
        backend.setItem(QuoteStorage.JOB_KEY, JSON.stringify({
          schemaVersion: 1,
          jobs: [
            { id: "", name: "No id", savedAt: "", data: {} },
            { id: "job-2", name: "", savedAt: "", data: {} },
            { id: "job-3", name: "No data", savedAt: "" },
            { id: "job-4", name: "Valid", savedAt: "", data: {} },
          ],
        }));
        const store = QuoteStorage.createJobStore(backend);
        const loaded = store.load();
        assert.equal(loaded.jobs.length, 1);
        assert.equal(loaded.jobs[0].id, "job-4");
      },
    },
    {
      name: "handles unavailable job storage",
      run() {
        const store = QuoteStorage.createJobStore(null);
        assert.deepEqual(store.load(), { jobs: [] });
        assert.equal(store.save({ jobs: [] }), false);
      },
    },
  ];
}

module.exports = { createCases, memoryBackend };
