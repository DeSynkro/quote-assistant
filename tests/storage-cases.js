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
  ];
}

module.exports = { createCases, memoryBackend };
