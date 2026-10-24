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

  return {
    UNIT_TO_M,
    toMetres,
    sectionVolume,
  };
});
