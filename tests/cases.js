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
    function sampleJob() {
      return {
        sections: [
          {
            shape: "rectangle",
            width: 10,
            widthUnit: "m",
            length: 3,
            lengthUnit: "m",
            depth: 100,
            depthUnit: "mm",
          },
          {
            shape: "rectangle",
            width: 5,
            widthUnit: "m",
            length: 5,
            lengthUnit: "m",
            depth: 200,
            depthUnit: "mm",
          },
        ],
        truck: {
          capacityMode: "volume",
          volumeCapacity: 6.5,
          weightCapacity: 8,
        },
        swell: {
          enabled: true,
          percent: 30,
        },
        pricePerTruck: 800,
        gst: {
          mode: "none",
          rate: 10,
        },
      };
    }

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
        name: "calculates a rectangle area and volume",
        run() {
          const result = Calc.sectionVolume({
            shape: "rectangle",
            width: 10,
            widthUnit: "m",
            length: 3,
            lengthUnit: "m",
            depth: 100,
            depthUnit: "mm",
          });
          closeTo(result.area, 30, "area");
          closeTo(result.volume, 3, "volume");
          equal(result.shape, "rectangle", "shape");
          equal(result.needsDepth, false, "needs depth");
        },
      },
      {
        name: "calculates a second rectangle area and volume",
        run() {
          const result = Calc.sectionVolume({
            shape: "rectangle",
            width: 5,
            widthUnit: "m",
            length: 5,
            lengthUnit: "m",
            depth: 200,
            depthUnit: "mm",
          });
          closeTo(result.area, 25, "area");
          closeTo(result.volume, 5, "volume");
        },
      },
      {
        name: "calculates uneven ends",
        run() {
          const result = Calc.sectionVolume({
            shape: "unevenEnds",
            width: 11,
            widthUnit: "m",
            leftLength: 7,
            leftLengthUnit: "m",
            rightLength: 3,
            rightLengthUnit: "m",
            depth: 100,
            depthUnit: "mm",
          });
          closeTo(result.area, 55, "area");
          closeTo(result.volume, 5.5, "volume");
          equal(result.shape, "unevenEnds", "shape");
          equal(result.needsDepth, false, "needs depth");
        },
      },
      {
        name: "calculates uneven ends with mixed units",
        run() {
          const result = Calc.sectionVolume({
            shape: "unevenEnds",
            width: 1100,
            widthUnit: "cm",
            leftLength: 700,
            leftLengthUnit: "cm",
            rightLength: 3000,
            rightLengthUnit: "mm",
            depth: 10,
            depthUnit: "cm",
          });
          closeTo(result.area, 55, "area");
          closeTo(result.volume, 5.5, "volume");
        },
      },
      {
        name: "calculates manual area",
        run() {
          const result = Calc.sectionVolume({
            shape: "manualArea",
            area: 42,
            depth: 200,
            depthUnit: "mm",
          });
          closeTo(result.area, 42, "area");
          closeTo(result.volume, 8.4, "volume");
          equal(result.shape, "manualArea", "shape");
        },
      },
      {
        name: "uses a manual volume",
        run() {
          const result = Calc.sectionVolume({
            shape: "manualVolume",
            manualVolume: 4.5,
          });
          equal(result.area, null, "area");
          closeTo(result.volume, 4.5, "volume");
          equal(result.shape, "manualVolume", "shape");
          equal(result.needsDepth, false, "needs depth");
        },
      },
      {
        name: "shows rectangle area when depth is missing",
        run() {
          const result = Calc.sectionVolume({
            shape: "rectangle",
            width: 10,
            widthUnit: "m",
            length: 3,
            lengthUnit: "m",
          });
          closeTo(result.area, 30, "area");
          closeTo(result.volume, 0, "volume");
          equal(result.needsDepth, true, "needs depth");
        },
      },
      {
        name: "shows manual area when depth is missing",
        run() {
          const result = Calc.sectionVolume({
            shape: "manualArea",
            area: 42,
          });
          closeTo(result.area, 42, "area");
          closeTo(result.volume, 0, "volume");
          equal(result.needsDepth, true, "needs depth");
        },
      },
      {
        name: "returns zero area for negative dimensions",
        run() {
          const result = Calc.sectionVolume({
            shape: "rectangle",
            width: -10,
            widthUnit: "m",
            length: 3,
            lengthUnit: "m",
            depth: 100,
            depthUnit: "mm",
          });
          closeTo(result.area, 0, "area");
          closeTo(result.volume, 0, "volume");
        },
      },
      {
        name: "returns zero area for a negative uneven side",
        run() {
          const result = Calc.sectionVolume({
            shape: "unevenEnds",
            width: 11,
            widthUnit: "m",
            leftLength: -7,
            leftLengthUnit: "m",
            rightLength: 3,
            rightLengthUnit: "m",
            depth: 100,
            depthUnit: "mm",
          });
          closeTo(result.area, 0, "area");
          closeTo(result.volume, 0, "volume");
        },
      },
      {
        name: "returns zero volume for a zero depth",
        run() {
          const result = Calc.sectionVolume({
            shape: "rectangle",
            width: 10,
            widthUnit: "m",
            length: 3,
            lengthUnit: "m",
            depth: 0,
            depthUnit: "mm",
          });
          closeTo(result.area, 30, "area");
          closeTo(result.volume, 0, "volume");
          equal(result.needsDepth, true, "needs depth");
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
      {
        name: "calculates exact and rounded prices",
        run() {
          const result = Calc.calculatePrice(1.6, 800);
          closeTo(result.exact, 1280, "exact price");
          closeTo(result.rounded, 1600, "rounded price");
          closeTo(result.exactTrucks, 1.6, "exact trucks");
          equal(result.roundedTrucks, 2, "rounded trucks");
        },
      },
      {
        name: "rounds any fractional truck price up",
        run() {
          const result = Calc.calculatePrice(3.01, 100);
          closeTo(result.exact, 301, "exact price");
          closeTo(result.rounded, 400, "rounded price");
          equal(result.roundedTrucks, 4, "rounded trucks");
        },
      },
      {
        name: "returns zero for zero trucks",
        run() {
          const result = Calc.calculatePrice(0, 800);
          closeTo(result.exact, 0, "exact price");
          closeTo(result.rounded, 0, "rounded price");
        },
      },
      {
        name: "returns zero for an invalid price",
        run() {
          const result = Calc.calculatePrice(1.6, "bad");
          closeTo(result.exact, 0, "exact price");
          closeTo(result.rounded, 0, "rounded price");
        },
      },
      {
        name: "leaves the amount unchanged with no GST",
        run() {
          const result = Calc.applyGst(1280, "none", 10);
          closeTo(result.total, 1280, "total");
          closeTo(result.gst, 0, "gst");
        },
      },
      {
        name: "adds GST on top",
        run() {
          const result = Calc.applyGst(1280, "add", 10);
          closeTo(result.total, 1408, "total");
          closeTo(result.gst, 128, "gst");
        },
      },
      {
        name: "extracts GST from an included price",
        run() {
          const result = Calc.applyGst(1100, "included", 10);
          closeTo(result.total, 1100, "total");
          closeTo(result.gst, 100, "gst");
        },
      },
      {
        name: "ignores an invalid GST mode",
        run() {
          const result = Calc.applyGst(1280, "weird", 10);
          closeTo(result.total, 1280, "total");
          closeTo(result.gst, 0, "gst");
        },
      },
      {
        name: "returns zero for a negative GST amount",
        run() {
          const result = Calc.applyGst(-10, "add", 10);
          closeTo(result.total, 0, "total");
          closeTo(result.gst, 0, "gst");
        },
      },
      {
        name: "calculates a complete job",
        run() {
          const result = Calc.calculateJob(sampleJob());
          equal(result.sections.length, 2, "sections");
          closeTo(result.totals.volumeInGround, 8, "volume in ground");
          closeTo(result.totals.volumeLoose, 10.4, "loose volume");
          closeTo(result.totals.trucks.exact, 1.6, "exact trucks");
          equal(result.totals.trucks.rounded, 2, "rounded trucks");
          closeTo(result.totals.price.exact, 1280, "exact price");
          closeTo(result.totals.price.rounded, 1600, "rounded price");
          closeTo(result.totals.gst.exact.total, 1280, "exact total");
          closeTo(result.totals.gst.rounded.total, 1600, "rounded total");
          equal(result.warnings.length, 0, "warnings");
        },
      },
      {
        name: "combines uneven ends and rectangle sections",
        run() {
          const job = sampleJob();
          job.sections = [
            {
              shape: "unevenEnds",
              width: 11,
              widthUnit: "m",
              leftLength: 7,
              leftLengthUnit: "m",
              rightLength: 3,
              rightLengthUnit: "m",
              depth: 100,
              depthUnit: "mm",
            },
            {
              shape: "rectangle",
              width: 5,
              widthUnit: "m",
              length: 5,
              lengthUnit: "m",
              depth: 200,
              depthUnit: "mm",
            },
          ];
          const result = Calc.calculateJob(job);
          closeTo(result.totals.volumeInGround, 10.5, "volume in ground");
          closeTo(result.totals.volumeLoose, 13.65, "loose volume");
          closeTo(result.totals.trucks.exact, 2.1, "exact trucks");
          equal(result.totals.trucks.rounded, 3, "rounded trucks");
          closeTo(result.totals.price.exact, 1680, "exact price");
          closeTo(result.totals.price.rounded, 2400, "rounded price");
        },
      },
      {
        name: "uses weight when every section has a density",
        run() {
          const job = sampleJob();
          job.truck.capacityMode = "both";
          job.sections[0].material = { looseDensity: 1.5 };
          job.sections[1].material = { looseDensity: 1.5 };
          const result = Calc.calculateJob(job);
          closeTo(result.totals.weight, 15.6, "weight");
          closeTo(result.totals.trucks.byVolume, 1.6, "by volume");
          closeTo(result.totals.trucks.byWeight, 1.95, "by weight");
          closeTo(result.totals.trucks.exact, 1.95, "exact trucks");
          equal(result.totals.trucks.limit, "weight", "limit");
          equal(result.warnings.length, 0, "warnings");
        },
      },
      {
        name: "warns when weight is unknown",
        run() {
          const job = sampleJob();
          job.truck.capacityMode = "both";
          const result = Calc.calculateJob(job);
          equal(result.totals.weight, null, "weight");
          closeTo(result.totals.trucks.exact, 1.6, "exact trucks");
          equal(result.totals.trucks.limit, "volume", "limit");
          equal(
            result.warnings.some((warning) => warning.code === "unknown-weight"),
            true,
            "unknown weight warning"
          );
        },
      },
      {
        name: "warns when only some sections have a density",
        run() {
          const job = sampleJob();
          job.truck.capacityMode = "both";
          job.sections[0].material = { looseDensity: 1.5 };
          const result = Calc.calculateJob(job);
          equal(result.totals.weight, null, "weight");
          equal(
            result.warnings.some((warning) => warning.code === "unknown-weight"),
            true,
            "unknown weight warning"
          );
        },
      },
      {
        name: "returns zero trucks in weight mode when weight is unknown",
        run() {
          const job = sampleJob();
          job.truck.capacityMode = "weight";
          const result = Calc.calculateJob(job);
          closeTo(result.totals.trucks.exact, 0, "exact trucks");
          equal(
            result.warnings.some((warning) => warning.code === "unknown-weight"),
            true,
            "unknown weight warning"
          );
        },
      },
      {
        name: "warns when truck capacity is missing",
        run() {
          const job = sampleJob();
          job.truck = {};
          const result = Calc.calculateJob(job);
          closeTo(result.totals.trucks.exact, 0, "exact trucks");
          closeTo(result.totals.price.exact, 0, "exact price");
          equal(
            result.warnings.some((warning) => warning.code === "missing-truck-capacity"),
            true,
            "missing capacity warning"
          );
        },
      },
      {
        name: "keeps area and warns when a section depth is missing",
        run() {
          const job = sampleJob();
          delete job.sections[0].depth;
          const result = Calc.calculateJob(job);
          closeTo(result.sections[0].area, 30, "area");
          closeTo(result.sections[0].volume, 0, "volume");
          equal(result.sections[0].needsDepth, true, "needs depth");
          equal(
            result.warnings.some((warning) => warning.code === "missing-depth"),
            true,
            "missing depth warning"
          );
        },
      },
      {
        name: "warns about a zero-volume section",
        run() {
          const job = sampleJob();
          job.sections[0].width = 0;
          const result = Calc.calculateJob(job);
          equal(
            result.warnings.some((warning) => warning.code === "zero-volume"),
            true,
            "zero volume warning"
          );
        },
      },
      {
        name: "warns when there are no sections",
        run() {
          const job = sampleJob();
          job.sections = [];
          const result = Calc.calculateJob(job);
          equal(result.sections.length, 0, "sections");
          closeTo(result.totals.volumeInGround, 0, "volume in ground");
          equal(result.totals.weight, null, "weight");
          equal(
            result.warnings.some((warning) => warning.code === "no-sections"),
            true,
            "no sections warning"
          );
        },
      },
      {
        name: "applies added GST to exact and rounded totals",
        run() {
          const job = sampleJob();
          job.gst = { mode: "add", rate: 10 };
          const result = Calc.calculateJob(job);
          closeTo(result.totals.gst.exact.total, 1408, "exact total");
          closeTo(result.totals.gst.exact.gst, 128, "exact gst");
          closeTo(result.totals.gst.rounded.total, 1760, "rounded total");
          closeTo(result.totals.gst.rounded.gst, 160, "rounded gst");
        },
      },
      {
        name: "extracts included GST from exact and rounded totals",
        run() {
          const job = sampleJob();
          job.gst = { mode: "included", rate: 10 };
          const result = Calc.calculateJob(job);
          closeTo(result.totals.gst.exact.total, 1280, "exact total");
          closeTo(result.totals.gst.exact.gst, 1280 - 1280 / 1.1, "exact gst");
          closeTo(result.totals.gst.rounded.total, 1600, "rounded total");
          closeTo(result.totals.gst.rounded.gst, 1600 - 1600 / 1.1, "rounded gst");
        },
      },
    ];
  }

  return { createCases };
});
