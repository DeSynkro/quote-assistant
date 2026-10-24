(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.Calc = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const UNIT_TO_M = Object.freeze({
    m: 1,
    cm: 0.01,
    mm: 0.001,
  });

  function toMetres(value, unit) {
    if (value === "" || value === null || value === undefined) {
      return NaN;
    }
    const number = Number(value);
    const factor = UNIT_TO_M[String(unit).toLowerCase()];
    if (!Number.isFinite(number) || factor === undefined) {
      return NaN;
    }
    return number * factor;
  }

  function sectionVolume(section) {
    const mode = section.mode || "measured";

    if (mode === "manual") {
      const volume = Number(section.manualVolume);
      return {
        volume: Number.isFinite(volume) && volume > 0 ? volume : 0,
        source: "manual",
      };
    }

    const width = toMetres(section.width, section.widthUnit);
    const length = toMetres(section.length, section.lengthUnit);
    const depthSource = mode === "assumed" ? "assumed" : "measured";
    const depth = depthSource === "assumed"
      ? toMetres(section.assumedDepth, section.assumedDepthUnit)
      : toMetres(section.depth, section.depthUnit);

    const volume = width * length * depth;

    return {
      volume: Number.isFinite(volume) && volume > 0 ? volume : 0,
      source: depthSource,
    };
  }

  function applySwell(volume, enabled, percent) {
    const number = Number(volume);
    if (!Number.isFinite(number) || number <= 0) {
      return 0;
    }
    if (!enabled) {
      return number;
    }
    const swell = Number(percent);
    if (!Number.isFinite(swell) || swell < 0) {
      return number;
    }
    return number * (1 + swell / 100);
  }

  function positiveNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function truckLoads(loads, truck) {
    const data = loads || {};
    const spec = truck || {};
    const volume = Number(data.volume);
    const weight = Number(data.weight);
    const volumeCapacity = positiveNumber(spec.volumeCapacity);
    const weightCapacity = positiveNumber(spec.weightCapacity);
    const mode = spec.capacityMode || "both";
    const useVolume = mode !== "weight"
      && volumeCapacity !== null
      && Number.isFinite(volume)
      && volume > 0;
    const useWeight = mode !== "volume"
      && weightCapacity !== null
      && Number.isFinite(weight)
      && weight > 0;

    const byVolume = useVolume ? volume / volumeCapacity : null;
    const byWeight = useWeight ? weight / weightCapacity : null;
    const values = [byVolume, byWeight].filter((value) => value !== null);
    const exact = values.length > 0 ? Math.max(...values) : 0;
    const rounded = Math.ceil(exact);

    let limit = null;
    if (byVolume !== null && byWeight !== null) {
      limit = byVolume >= byWeight ? "volume" : "weight";
    } else if (byVolume !== null) {
      limit = "volume";
    } else if (byWeight !== null) {
      limit = "weight";
    }

    return {
      exact,
      rounded,
      limit,
      byVolume,
      byWeight,
    };
  }

  return {
    UNIT_TO_M,
    toMetres,
    sectionVolume,
    applySwell,
    truckLoads,
  };
});
