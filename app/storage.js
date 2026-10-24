(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.QuoteStorage = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const KEY = "quote-assistant.trucks";
  const SCHEMA_VERSION = 1;
  const JOB_KEY = "quote-assistant.jobs";
  const JOB_SCHEMA_VERSION = 1;

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

  function createStore(backend) {
    function load() {
      if (!backend) {
        return { presets: [], selectedId: null };
      }

      try {
        const raw = backend.getItem(KEY);
        if (!raw) {
          return { presets: [], selectedId: null };
        }

        const data = JSON.parse(raw);
        if (!data || data.schemaVersion !== SCHEMA_VERSION || !Array.isArray(data.presets)) {
          return { presets: [], selectedId: null };
        }

        const presets = data.presets.map(normalizePreset).filter(Boolean);
        const selectedId = typeof data.selectedId === "string"
          && presets.some((preset) => preset.id === data.selectedId)
          ? data.selectedId
          : null;

        return { presets, selectedId };
      } catch (error) {
        return { presets: [], selectedId: null };
      }
    }

    function save(state) {
      if (!backend) {
        return false;
      }

      try {
        const source = state || {};
        const presets = Array.isArray(source.presets)
          ? source.presets.map(normalizePreset).filter(Boolean)
          : [];
        const selectedId = typeof source.selectedId === "string"
          && presets.some((preset) => preset.id === source.selectedId)
          ? source.selectedId
          : null;

        backend.setItem(KEY, JSON.stringify({
          schemaVersion: SCHEMA_VERSION,
          presets,
          selectedId,
        }));
        return true;
      } catch (error) {
        return false;
      }
    }

    return { load, save };
  }

  function normalizeJob(value) {
    if (!value || typeof value !== "object") {
      return null;
    }

    const id = typeof value.id === "string" ? value.id.trim() : "";
    const name = typeof value.name === "string" ? value.name.trim() : "";
    const savedAt = typeof value.savedAt === "string" ? value.savedAt : "";
    const summary = typeof value.summary === "string" ? value.summary : "";
    const data = value.data && typeof value.data === "object" ? value.data : null;

    if (!id || !name || !data) {
      return null;
    }

    return { id, name, savedAt, summary, data };
  }

  function createJobStore(backend) {
    function load() {
      if (!backend) {
        return { jobs: [] };
      }

      try {
        const raw = backend.getItem(JOB_KEY);
        if (!raw) {
          return { jobs: [] };
        }

        const data = JSON.parse(raw);
        if (!data || data.schemaVersion !== JOB_SCHEMA_VERSION || !Array.isArray(data.jobs)) {
          return { jobs: [] };
        }

        const jobs = data.jobs.map(normalizeJob).filter(Boolean);
        return { jobs };
      } catch (error) {
        return { jobs: [] };
      }
    }

    function save(state) {
      if (!backend) {
        return false;
      }

      try {
        const source = state || {};
        const jobs = Array.isArray(source.jobs)
          ? source.jobs.map(normalizeJob).filter(Boolean)
          : [];

        backend.setItem(JOB_KEY, JSON.stringify({
          schemaVersion: JOB_SCHEMA_VERSION,
          jobs,
        }));
        return true;
      } catch (error) {
        return false;
      }
    }

    return { load, save };
  }

  return {
    KEY,
    SCHEMA_VERSION,
    JOB_KEY,
    JOB_SCHEMA_VERSION,
    createStore,
    createJobStore,
  };
});
