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
  const DRAFT_KEY = "quote-assistant.draft";
  const DRAFT_SCHEMA_VERSION = 1;
  const PREFERENCES_KEY = "quote-assistant.preferences";
  const PREFERENCES_SCHEMA_VERSION = 1;
  const PREFERENCE_DEFAULTS = Object.freeze({
    theme: "dark",
    decimals: 1,
    reduceMotion: false,
    autosave: true,
  });

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


  function apiUrl(baseUrl, path) {
    return `${String(baseUrl || "").replace(/\/+$/, "")}${path}`;
  }

  function getFetch(fetchImpl) {
    if (typeof fetchImpl === "function") {
      return fetchImpl;
    }

    return typeof fetch === "function" ? fetch.bind(globalThis) : null;
  }

  function createRemoteStore(baseUrl, fetchImpl) {
    const fetcher = getFetch(fetchImpl);

    async function refresh() {
      if (!fetcher) {
        throw new Error("Shared presets are unavailable.");
      }

      const response = await fetcher(apiUrl(baseUrl, "/presets"), {
        cache: "no-store",
        headers: { accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Could not refresh shared presets.");
      }

      const data = await response.json();
      if (!data || data.schemaVersion !== SCHEMA_VERSION || !Array.isArray(data.presets)) {
        throw new Error("Shared presets are not valid.");
      }

      const presets = data.presets.map(normalizePreset).filter(Boolean);
      const selectedId = typeof data.selectedId === "string"
        && presets.some((preset) => preset.id === data.selectedId)
        ? data.selectedId
        : null;

      return { presets, selectedId };
    }

    async function load() {
      try {
        return await refresh();
      } catch (error) {
        return { presets: [], selectedId: null };
      }
    }

    async function save(state) {
      if (!fetcher) {
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

        const response = await fetcher(apiUrl(baseUrl, "/presets"), {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            schemaVersion: SCHEMA_VERSION,
            presets,
            selectedId,
          }),
        });

        return response.ok;
      } catch (error) {
        return false;
      }
    }

    return { load, save, refresh };
  }

  function createRemoteJobStore(baseUrl, fetchImpl) {
    const fetcher = getFetch(fetchImpl);
    let cached = new Map();

    async function refresh() {
      if (!fetcher) {
        throw new Error("Shared jobs are unavailable.");
      }

      const response = await fetcher(apiUrl(baseUrl, "/jobs"), {
        cache: "no-store",
        headers: { accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Could not refresh shared jobs.");
      }

      const data = await response.json();
      const jobs = data && Array.isArray(data.jobs)
        ? data.jobs.map(normalizeJob).filter(Boolean)
        : [];
      cached = new Map(jobs.map((job) => [job.id, JSON.stringify(job)]));
      return { jobs };
    }

    async function load() {
      try {
        return await refresh();
      } catch (error) {
        cached = new Map();
        return { jobs: [] };
      }
    }

    async function save(state) {
      if (!fetcher) {
        return false;
      }

      const source = state || {};
      const jobs = Array.isArray(source.jobs)
        ? source.jobs.map(normalizeJob).filter(Boolean)
        : [];
      const next = new Map(jobs.map((job) => [job.id, JSON.stringify(job)]));
      const changed = jobs.filter((job) => cached.get(job.id) !== next.get(job.id));
      const removed = [...cached.keys()].filter((id) => !next.has(id));

      try {
        for (const job of changed) {
          const response = await fetcher(apiUrl(baseUrl, `/jobs/${encodeURIComponent(job.id)}`), {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(job),
          });

          if (!response.ok) {
            return false;
          }
        }

        for (const id of removed) {
          const response = await fetcher(apiUrl(baseUrl, `/jobs/${encodeURIComponent(id)}`), {
            method: "DELETE",
            headers: { accept: "application/json" },
          });

          if (!response.ok && response.status !== 404) {
            return false;
          }
        }

        cached = next;
        return true;
      } catch (error) {
        return false;
      }
    }

    return { load, save, refresh };
  }

  function createNativeStore(invokeImpl) {
    const invoke = typeof invokeImpl === "function" ? invokeImpl : null;

    async function load() {
      if (!invoke) {
        return { presets: [], selectedId: null };
      }

      try {
        const data = await invoke("load_presets");
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

    async function save(state) {
      if (!invoke) {
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

        await invoke("save_presets", {
          state: {
            schemaVersion: SCHEMA_VERSION,
            presets,
            selectedId,
          },
        });
        return true;
      } catch (error) {
        return false;
      }
    }

    return { load, save };
  }

  function createNativeJobStore(invokeImpl) {
    const invoke = typeof invokeImpl === "function" ? invokeImpl : null;
    let cached = new Map();

    async function load() {
      if (!invoke) {
        return { jobs: [] };
      }

      try {
        const data = await invoke("load_jobs");
        const jobs = Array.isArray(data)
          ? data.map(normalizeJob).filter(Boolean)
          : [];
        cached = new Map(jobs.map((job) => [job.id, JSON.stringify(job)]));
        return { jobs };
      } catch (error) {
        cached = new Map();
        return { jobs: [] };
      }
    }

    async function save(state) {
      if (!invoke) {
        return false;
      }

      const source = state || {};
      const jobs = Array.isArray(source.jobs)
        ? source.jobs.map(normalizeJob).filter(Boolean)
        : [];
      const next = new Map(jobs.map((job) => [job.id, JSON.stringify(job)]));
      const changed = jobs.filter((job) => cached.get(job.id) !== next.get(job.id));
      const removed = [...cached.keys()].filter((id) => !next.has(id));

      try {
        for (const job of changed) {
          await invoke("save_job", { job });
        }

        for (const id of removed) {
          await invoke("delete_job", { id });
        }

        cached = next;
        return true;
      } catch (error) {
        return false;
      }
    }

    return { load, save };
  }

  function normalizePreferences(value) {
    const source = value && typeof value === "object" ? value : {};
    const theme = source.theme === "light" || source.theme === "system"
      ? source.theme
      : "dark";
    const decimals = Number(source.decimals);
    const normalizedDecimals = decimals === 1 || decimals === 2 || decimals === 3
      ? decimals
      : 1;

    return {
      theme,
      decimals: normalizedDecimals,
      reduceMotion: source.reduceMotion === true,
      autosave: source.autosave !== false,
    };
  }

  function createPreferenceStore(backend) {
    function load() {
      if (!backend) {
        return { ...PREFERENCE_DEFAULTS };
      }

      try {
        const raw = backend.getItem(PREFERENCES_KEY);
        if (!raw) {
          return { ...PREFERENCE_DEFAULTS };
        }

        const data = JSON.parse(raw);
        if (!data || data.schemaVersion !== PREFERENCES_SCHEMA_VERSION) {
          return { ...PREFERENCE_DEFAULTS };
        }

        return normalizePreferences(data.preferences);
      } catch (error) {
        return { ...PREFERENCE_DEFAULTS };
      }
    }

    function save(preferences) {
      if (!backend) {
        return false;
      }

      try {
        backend.setItem(PREFERENCES_KEY, JSON.stringify({
          schemaVersion: PREFERENCES_SCHEMA_VERSION,
          preferences: normalizePreferences(preferences),
        }));
        return true;
      } catch (error) {
        return false;
      }
    }

    return {
      load,
      save,
      defaults: PREFERENCE_DEFAULTS,
    };
  }

  function createDraftStore(backend) {
    function load() {
      if (!backend) {
        return null;
      }

      try {
        const raw = backend.getItem(DRAFT_KEY);
        if (!raw) {
          return null;
        }

        const data = JSON.parse(raw);
        if (!data || data.schemaVersion !== DRAFT_SCHEMA_VERSION) {
          return null;
        }

        if (!data.data || typeof data.data !== "object" || Array.isArray(data.data)) {
          return null;
        }

        return {
          name: typeof data.name === "string" ? data.name : "",
          currentJobId: typeof data.currentJobId === "string" && data.currentJobId
            ? data.currentJobId
            : null,
          data: data.data,
          updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : "",
        };
      } catch (error) {
        return null;
      }
    }

    function save(draft) {
      if (!backend) {
        return false;
      }

      try {
        const source = draft || {};
        if (!source.data || typeof source.data !== "object" || Array.isArray(source.data)) {
          return false;
        }

        backend.setItem(DRAFT_KEY, JSON.stringify({
          schemaVersion: DRAFT_SCHEMA_VERSION,
          name: typeof source.name === "string" ? source.name : "",
          currentJobId: typeof source.currentJobId === "string" && source.currentJobId
            ? source.currentJobId
            : null,
          data: source.data,
          updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : "",
        }));
        return true;
      } catch (error) {
        return false;
      }
    }

    function clear() {
      if (!backend) {
        return false;
      }

      try {
        backend.removeItem(DRAFT_KEY);
        return true;
      } catch (error) {
        return false;
      }
    }

    return { load, save, clear };
  }

  return {
    KEY,
    SCHEMA_VERSION,
    JOB_KEY,
    JOB_SCHEMA_VERSION,
    DRAFT_KEY,
    DRAFT_SCHEMA_VERSION,
    PREFERENCES_KEY,
    PREFERENCES_SCHEMA_VERSION,
    PREFERENCE_DEFAULTS,
    createStore,
    createJobStore,
    createDraftStore,
    createPreferenceStore,
    createRemoteStore,
    createRemoteJobStore,
    createNativeStore,
    createNativeJobStore,
  };
});
