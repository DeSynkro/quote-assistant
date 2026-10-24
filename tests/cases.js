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

    function sampleDelivery(overrides) {
      return Object.assign({
        enabled: true,
        materialName: "Gravel",
        amountBasis: "volume",
        amount: 10,
        price: 45,
        density: 1.5,
        deliveryMode: "truckRate",
        customFee: "",
        addSettling: false,
        settlingPercent: 10,
      }, overrides || {});
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
      {
        name: "calculates direct volume delivery",
        run() {
          const result = Calc.calculateDelivery(
            sampleDelivery(),
            { capacityMode: "both", volumeCapacity: 6.5, weightCapacity: 8 },
            800
          );
          closeTo(result.deliveredVolume, 10, "delivered volume");
          closeTo(result.weight, 15, "weight");
          closeTo(result.materialCost, 450, "material cost");
          closeTo(result.trucks.exact, 1.875, "exact trucks");
          equal(result.trucks.rounded, 2, "rounded trucks");
          equal(result.trucks.limit, "weight", "limit");
          closeTo(result.tripCost.exact, 1500, "exact trip cost");
          closeTo(result.tripCost.rounded, 1600, "rounded trip cost");
          closeTo(result.total.exact, 1950, "exact total");
          closeTo(result.total.rounded, 2050, "rounded total");
          equal(result.warnings.length, 0, "warnings");
        },
      },
      {
        name: "applies settling to direct volume delivery",
        run() {
          const result = Calc.calculateDelivery(
            sampleDelivery({ addSettling: true, settlingPercent: 10 }),
            { capacityMode: "volume", volumeCapacity: 6.5 },
            800
          );
          closeTo(result.finishedVolume, 10, "finished volume");
          closeTo(result.deliveredVolume, 11, "delivered volume");
          closeTo(result.weight, 16.5, "weight");
          closeTo(result.materialCost, 495, "material cost");
        },
      },
      {
        name: "calculates area and depth delivery",
        run() {
          const delivery = sampleDelivery({
            amountBasis: "area",
            width: 10,
            widthUnit: "m",
            length: 5,
            lengthUnit: "m",
            depth: 100,
            depthUnit: "mm",
            settlingPercent: 10,
          });
          const result = Calc.calculateDelivery(
            delivery,
            { capacityMode: "volume", volumeCapacity: 6.5 },
            800
          );
          closeTo(result.finishedVolume, 5, "finished volume");
          closeTo(result.deliveredVolume, 5.5, "delivered volume");
          closeTo(result.weight, 8.25, "weight");
          closeTo(result.materialCost, 247.5, "material cost");
        },
      },
      {
        name: "calculates weight-based delivery",
        run() {
          const result = Calc.calculateDelivery(
            sampleDelivery({ amountBasis: "weight", amount: 10, price: 80 }),
            { capacityMode: "weight", weightCapacity: 8 },
            800
          );
          closeTo(result.weight, 10, "weight");
          closeTo(result.deliveredVolume, 10 / 1.5, "delivered volume");
          closeTo(result.materialCost, 800, "material cost");
        },
      },
      {
        name: "uses weight capacity for direct weight when the main mode is volume",
        run() {
          const result = Calc.calculateDelivery(
            sampleDelivery({
              amountBasis: "weight",
              amount: 8,
              price: 118.75,
              density: undefined,
            }),
            { capacityMode: "volume", volumeCapacity: 6.5, weightCapacity: 8 },
            800
          );
          closeTo(result.materialCost, 950, "material cost");
          closeTo(result.trucks.exact, 1, "exact trucks");
          equal(result.trucks.limit, "weight", "limit");
          equal(result.warnings.length, 0, "warnings");
        },
      },
      {
        name: "uses a custom delivery fee",
        run() {
          const result = Calc.calculateDelivery(
            sampleDelivery({ deliveryMode: "custom", customFee: 500 }),
            { capacityMode: "volume", volumeCapacity: 6.5 },
            800
          );
          closeTo(result.tripCost.exact, 500, "exact trip cost");
          closeTo(result.tripCost.rounded, 500, "rounded trip cost");
          closeTo(result.total.exact, 950, "exact total");
          closeTo(result.total.rounded, 950, "rounded total");
        },
      },
      {
        name: "uses no trip cost when delivery is included",
        run() {
          const result = Calc.calculateDelivery(
            sampleDelivery({ deliveryMode: "included" }),
            { capacityMode: "volume", volumeCapacity: 6.5 },
            800
          );
          closeTo(result.tripCost.exact, 0, "exact trip cost");
          closeTo(result.tripCost.rounded, 0, "rounded trip cost");
          closeTo(result.total.exact, 450, "exact total");
        },
      },
      {
        name: "warns about missing material amount and price",
        run() {
          const result = Calc.calculateDelivery(
            sampleDelivery({ amount: 0, price: 0 }),
            { capacityMode: "volume", volumeCapacity: 6.5 },
            800
          );
          equal(
            result.warnings.some((warning) => warning.code === "material-missing-amount"),
            true,
            "missing amount warning"
          );
          equal(
            result.warnings.some((warning) => warning.code === "material-missing-price"),
            true,
            "missing price warning"
          );
        },
      },
      {
        name: "warns about a missing custom delivery fee",
        run() {
          const result = Calc.calculateDelivery(
            sampleDelivery({ deliveryMode: "custom", customFee: "" }),
            { capacityMode: "volume", volumeCapacity: 6.5 },
            800
          );
          equal(
            result.warnings.some((warning) => warning.code === "material-missing-custom-fee"),
            true,
            "missing custom fee warning"
          );
        },
      },
      {
        name: "warns when delivery weight is unknown",
        run() {
          const result = Calc.calculateDelivery(
            sampleDelivery({ density: undefined }),
            { capacityMode: "both", volumeCapacity: 6.5, weightCapacity: 8 },
            800
          );
          equal(result.weight, null, "weight");
          equal(
            result.warnings.some((warning) => warning.code === "material-weight-unknown"),
            true,
            "unknown weight warning"
          );
        },
      },
      {
        name: "warns when a weight-based delivery has no usable truck capacity",
        run() {
          const result = Calc.calculateDelivery(
            sampleDelivery({
              amountBasis: "weight",
              amount: 10,
              price: 80,
              density: undefined,
            }),
            { capacityMode: "volume", volumeCapacity: 6.5 },
            800
          );
          equal(result.deliveredVolume, null, "delivered volume");
          equal(
            result.warnings.some((warning) => warning.code === "material-missing-truck-capacity"),
            true,
            "missing capacity warning"
          );
        },
      },
      {
        name: "adds delivery to the job totals",
        run() {
          const job = sampleJob();
          job.delivery = sampleDelivery();
          const result = Calc.calculateJob(job);
          closeTo(result.totals.delivery.materialCost, 450, "material cost");
          closeTo(result.totals.delivery.total.exact, 1950, "delivery exact");
          closeTo(result.totals.delivery.total.rounded, 2050, "delivery rounded");
          closeTo(result.totals.combined.trucks.exact, 3.475, "combined exact trucks");
          equal(result.totals.combined.trucks.rounded, 4, "combined rounded trucks");
          closeTo(result.totals.combined.price.exact, 3230, "combined exact price");
          closeTo(result.totals.combined.price.rounded, 3650, "combined rounded price");
          equal(result.warnings.length, 0, "warnings");
        },
      },
      {
        name: "applies GST to the combined job total",
        run() {
          const job = sampleJob();
          job.truck.capacityMode = "both";
          job.delivery = sampleDelivery();
          job.gst = { mode: "add", rate: 10 };
          const result = Calc.calculateJob(job);
          closeTo(result.totals.combined.gst.exact.total, 3553, "combined exact total");
          closeTo(result.totals.combined.gst.exact.gst, 323, "combined exact gst");
          closeTo(result.totals.combined.gst.rounded.total, 4015, "combined rounded total");
          closeTo(result.totals.combined.gst.rounded.gst, 365, "combined rounded gst");
        },
      },
      {
        name: "keeps combined totals equal to spoil when delivery is disabled",
        run() {
          const job = sampleJob();
          job.delivery = { enabled: false };
          const result = Calc.calculateJob(job);
          equal(result.totals.delivery, null, "delivery");
          closeTo(result.totals.combined.trucks.exact, 1.6, "combined exact trucks");
          equal(result.totals.combined.trucks.rounded, 2, "combined rounded trucks");
          closeTo(result.totals.combined.price.exact, 1280, "combined exact price");
          closeTo(result.totals.combined.price.rounded, 1600, "combined rounded price");
        },
      },
    ];
  }

  return { createCases };
});
