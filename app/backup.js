(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.Backup = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const SCHEMA_VERSION = 1;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
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

  function normalizeJob(value) {
    if (!value || typeof value !== "object") {
      return null;
    }

    const id = typeof value.id === "string" ? value.id.trim() : "";
    const name = typeof value.name === "string" ? value.name.trim() : "";
    const data = value.data && typeof value.data === "object" ? value.data : null;

    if (!id || !name || !data) {
      return null;
    }

    return {
      id,
      name,
      savedAt: typeof value.savedAt === "string" ? value.savedAt : "",
      summary: typeof value.summary === "string" ? value.summary : "",
      data,
    };
  }

  function createBackup(state) {
    const source = state || {};
    return {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      truckPresets: {
        schemaVersion: 1,
        presets: Array.isArray(source.presets) ? clone(source.presets) : [],
      },
      jobs: {
        schemaVersion: 1,
        jobs: Array.isArray(source.jobs) ? clone(source.jobs) : [],
      },
    };
  }

  function parseBackup(text) {
    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error("This file is not valid JSON.");
    }

    if (!data || data.schemaVersion !== SCHEMA_VERSION) {
      throw new Error("This backup version is not supported.");
    }

    const rawPresets = data.truckPresets && Array.isArray(data.truckPresets.presets)
      ? data.truckPresets.presets
      : [];
    const rawJobs = data.jobs && Array.isArray(data.jobs.jobs)
      ? data.jobs.jobs
      : [];

    return {
      presets: rawPresets.map(normalizePreset).filter(Boolean),
      jobs: rawJobs.map(normalizeJob).filter(Boolean),
    };
  }

  function mergePresets(existing, imported) {
    const merged = (Array.isArray(existing) ? existing : []).map(clone);

    for (const preset of Array.isArray(imported) ? imported : []) {
      const byId = merged.findIndex((item) => item.id === preset.id);

      if (byId !== -1) {
        merged[byId] = clone(preset);
        continue;
      }

      const byName = merged.findIndex(
        (item) => item.name.toLowerCase() === preset.name.toLowerCase()
      );

      if (byName !== -1) {
        merged[byName] = { ...mergePresetFields(merged[byName], preset), id: merged[byName].id };
      } else {
        merged.push(clone(preset));
      }
    }

    return merged;
  }

  function mergePresetFields(existing, imported) {
    return {
      ...existing,
      name: imported.name,
      volumeCapacity: imported.volumeCapacity,
      weightCapacity: imported.weightCapacity,
      fuelConsumption: imported.fuelConsumption,
      pricePerTruck: imported.pricePerTruck,
    };
  }

  function mergeJobs(existing, imported) {
    const merged = (Array.isArray(existing) ? existing : []).map(clone);

    for (const job of Array.isArray(imported) ? imported : []) {
      const index = merged.findIndex((item) => item.id === job.id);

      if (index !== -1) {
        merged[index] = clone(job);
      } else {
        merged.push(clone(job));
      }
    }

    return merged;
  }

  return {
    SCHEMA_VERSION,
    createBackup,
    parseBackup,
    mergePresets,
    mergeJobs,
  };
});
