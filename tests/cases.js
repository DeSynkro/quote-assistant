(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.TestCases = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function closeTo(actual, expected, label) {
    if (!Number.isFinite(actual) || Math.abs(actual - expected) > 1e-9) {
      throw new Error(`${label}: expected ${expected}, got ${actual}`);
    }
  }

  function equal(actual, expected, label) {
    if (actual !== expected) {
      throw new Error(`${label}: expected ${expected}, got ${actual}`);
    }
  }

  function createCases(Calc) {
    return [
      {
        name: "converts metres to metres",
        run() {
          closeTo(Calc.toMetres(10, "m"), 10, "10 m");
        },
      },
      {
        name: "converts centimetres to metres",
        run() {
          closeTo(Calc.toMetres(100, "cm"), 1, "100 cm");
        },
      },
      {
        name: "converts millimetres to metres",
        run() {
          closeTo(Calc.toMetres(100, "mm"), 0.1, "100 mm");
        },
      },
      {
        name: "rejects non-numeric values",
        run() {
          equal(Number.isNaN(Calc.toMetres("bad", "m")), true, "bad value is NaN");
        },
      },
      {
        name: "rejects unknown units",
        run() {
          equal(Number.isNaN(Calc.toMetres(1, "ft")), true, "unknown unit is NaN");
        },
      },
      {
        name: "calculates a measured section",
        run() {
          const result = Calc.sectionVolume({
            width: 10,
            widthUnit: "m",
            length: 3,
            lengthUnit: "m",
            mode: "measured",
            depth: 100,
            depthUnit: "mm",
          });
          closeTo(result.volume, 3, "volume");
          equal(result.source, "measured", "source");
        },
      },
      {
        name: "calculates a second measured section",
        run() {
          const result = Calc.sectionVolume({
            width: 5,
            widthUnit: "m",
            length: 5,
            lengthUnit: "m",
            mode: "measured",
            depth: 200,
            depthUnit: "mm",
          });
          closeTo(result.volume, 5, "volume");
          equal(result.source, "measured", "source");
        },
      },
      {
        name: "uses an assumed depth",
        run() {
          const result = Calc.sectionVolume({
            width: 10,
            widthUnit: "m",
            length: 3,
            lengthUnit: "m",
            mode: "assumed",
            assumedDepth: 100,
            assumedDepthUnit: "mm",
          });
          closeTo(result.volume, 3, "volume");
          equal(result.source, "assumed", "source");
        },
      },
      {
        name: "uses a manual volume",
        run() {
          const result = Calc.sectionVolume({
            mode: "manual",
            manualVolume: 4.5,
          });
          closeTo(result.volume, 4.5, "volume");
          equal(result.source, "manual", "source");
        },
      },
      {
        name: "returns zero when measured depth is missing",
        run() {
          const result = Calc.sectionVolume({
            width: 10,
            widthUnit: "m",
            length: 3,
            lengthUnit: "m",
            mode: "measured",
          });
          closeTo(result.volume, 0, "volume");
          equal(result.source, "measured", "source");
        },
      },
      {
        name: "returns zero for negative dimensions",
        run() {
          const result = Calc.sectionVolume({
            width: -10,
            widthUnit: "m",
            length: 3,
            lengthUnit: "m",
            mode: "measured",
            depth: 100,
            depthUnit: "mm",
          });
          closeTo(result.volume, 0, "volume");
        },
      },
      {
        name: "returns zero for a zero depth",
        run() {
          const result = Calc.sectionVolume({
            width: 10,
            widthUnit: "m",
            length: 3,
            lengthUnit: "m",
            mode: "measured",
            depth: 0,
            depthUnit: "mm",
          });
          closeTo(result.volume, 0, "volume");
        },
      },
    ];
  }

  return { createCases };
});
