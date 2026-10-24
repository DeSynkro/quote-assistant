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
      {
        name: "applies swell to loose volume",
        run() {
          closeTo(Calc.applySwell(8, true, 30), 10.4, "swollen volume");
        },
      },
      {
        name: "leaves volume unchanged when swell is disabled",
        run() {
          closeTo(Calc.applySwell(8, false, 30), 8, "volume");
        },
      },
      {
        name: "leaves volume unchanged for an invalid swell percent",
        run() {
          closeTo(Calc.applySwell(8, true, "bad"), 8, "volume");
        },
      },
      {
        name: "calculates truck loads by volume",
        run() {
          const result = Calc.truckLoads(
            { volume: 10.4, weight: null },
            { capacityMode: "both", volumeCapacity: 6.5, weightCapacity: 8 }
          );
          closeTo(result.exact, 1.6, "exact trucks");
          equal(result.rounded, 2, "rounded trucks");
          equal(result.limit, "volume", "limit");
          closeTo(result.byVolume, 1.6, "by volume");
          equal(result.byWeight, null, "by weight");
        },
      },
      {
        name: "calculates truck loads by weight",
        run() {
          const result = Calc.truckLoads(
            { volume: 10.4, weight: 16 },
            { capacityMode: "weight", volumeCapacity: 6.5, weightCapacity: 8 }
          );
          closeTo(result.exact, 2, "exact trucks");
          equal(result.limit, "weight", "limit");
          equal(result.byVolume, null, "by volume");
          closeTo(result.byWeight, 2, "by weight");
        },
      },
      {
        name: "uses the weight limit when it is higher",
        run() {
          const result = Calc.truckLoads(
            { volume: 10.4, weight: 16 },
            { capacityMode: "both", volumeCapacity: 6.5, weightCapacity: 8 }
          );
          closeTo(result.exact, 2, "exact trucks");
          equal(result.limit, "weight", "limit");
          closeTo(result.byVolume, 1.6, "by volume");
          closeTo(result.byWeight, 2, "by weight");
        },
      },
      {
        name: "uses the volume limit when it is higher",
        run() {
          const result = Calc.truckLoads(
            { volume: 10.4, weight: 8 },
            { capacityMode: "both", volumeCapacity: 6.5, weightCapacity: 8 }
          );
          closeTo(result.exact, 1.6, "exact trucks");
          equal(result.limit, "volume", "limit");
          closeTo(result.byWeight, 1, "by weight");
        },
      },
      {
        name: "falls back to volume when weight is unknown",
        run() {
          const result = Calc.truckLoads(
            { volume: 10.4, weight: null },
            { capacityMode: "both", volumeCapacity: 6.5, weightCapacity: 8 }
          );
          closeTo(result.exact, 1.6, "exact trucks");
          equal(result.limit, "volume", "limit");
          equal(result.byWeight, null, "by weight");
        },
      },
      {
        name: "ignores weight in volume-only mode",
        run() {
          const result = Calc.truckLoads(
            { volume: 10.4, weight: 16 },
            { capacityMode: "volume", volumeCapacity: 6.5, weightCapacity: 8 }
          );
          closeTo(result.exact, 1.6, "exact trucks");
          equal(result.byWeight, null, "by weight");
        },
      },
      {
        name: "returns zero when truck capacities are missing",
        run() {
          const result = Calc.truckLoads(
            { volume: 10.4, weight: 16 },
            { capacityMode: "both" }
          );
          closeTo(result.exact, 0, "exact trucks");
          equal(result.rounded, 0, "rounded trucks");
          equal(result.limit, null, "limit");
          equal(result.byVolume, null, "by volume");
          equal(result.byWeight, null, "by weight");
        },
      },
    ];
  }

  return { createCases };
});
