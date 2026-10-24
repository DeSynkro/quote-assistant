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
    const shape = section.shape || "rectangle";

    if (shape === "manualVolume") {
      const volume = Number(section.manualVolume);
      return {
        area: null,
        volume: Number.isFinite(volume) && volume > 0 ? volume : 0,
        shape: "manualVolume",
        needsDepth: false,
      };
    }

    let area = 0;

    if (shape === "manualArea") {
      const value = Number(section.area);
      area = Number.isFinite(value) && value > 0 ? value : 0;
    } else if (shape === "unevenEnds") {
      const width = toMetres(section.width, section.widthUnit);
      const left = toMetres(section.leftLength, section.leftLengthUnit);
      const right = toMetres(section.rightLength, section.rightLengthUnit);
      const value = width * (left + right) / 2;
      area = Number.isFinite(value) && value > 0 ? value : 0;
    } else {
      const width = toMetres(section.width, section.widthUnit);
      const length = toMetres(section.length, section.lengthUnit);
      const value = width * length;
      area = Number.isFinite(value) && value > 0 ? value : 0;
    }

    const depth = toMetres(section.depth, section.depthUnit);
    const hasDepth = Number.isFinite(depth) && depth > 0;
    const volume = hasDepth ? area * depth : 0;

    return {
      area,
      volume,
      shape,
      needsDepth: area > 0 && !hasDepth,
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

  function calculatePrice(trucks, pricePerTruck) {
    const count = Number(trucks);
    const rate = Number(pricePerTruck);
    const exactTrucks = Number.isFinite(count) && count > 0 ? count : 0;
    const roundedTrucks = Math.ceil(exactTrucks);
    const price = Number.isFinite(rate) && rate > 0 ? rate : 0;

    return {
      exact: exactTrucks * price,
      rounded: roundedTrucks * price,
      exactTrucks,
      roundedTrucks,
    };
  }

  function applyGst(amount, mode, rate) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0) {
      return { total: 0, gst: 0 };
    }

    if (mode !== "add" && mode !== "included") {
      return { total: value, gst: 0 };
    }

    const gstRate = Number(rate);
    if (!Number.isFinite(gstRate) || gstRate < 0) {
      return { total: value, gst: 0 };
    }

    if (mode === "add") {
      const gst = value * gstRate / 100;
      return { total: value + gst, gst };
    }

    const gst = value - value / (1 + gstRate / 100);
    return { total: value, gst };
  }

  function sectionName(section, index) {
    const name = section && section.name ? String(section.name).trim() : "";
    return name || `Section ${index + 1}`;
  }

  function calculateJob(job) {
    const source = job || {};
    const sections = Array.isArray(source.sections) ? source.sections : [];
    const truck = source.truck || {};
    const swell = source.swell || { enabled: false, percent: 0 };
    const gst = source.gst || { mode: "none", rate: 0 };
    const warnings = [];
    const results = [];
    let totalInGround = 0;
    let totalLoose = 0;
    let totalWeight = 0;
    let weightKnown = sections.length > 0;

    if (sections.length === 0) {
      warnings.push({
        code: "no-sections",
        message: "Add at least one section.",
      });
    }

    for (let index = 0; index < sections.length; index += 1) {
      const section = sections[index] || {};
      const name = sectionName(section, index);
      const volume = sectionVolume(section);
      const looseVolume = applySwell(
        volume.volume,
        swell.enabled,
        swell.percent
      );
      const density = positiveNumber(
        section.material && section.material.looseDensity
      );
      const weight = density !== null ? looseVolume * density : null;

      if (volume.needsDepth) {
        warnings.push({
          code: "missing-depth",
          message: `${name} needs a depth before volume can be calculated.`,
          sectionIndex: index,
        });
      } else if (volume.volume <= 0) {
        warnings.push({
          code: "zero-volume",
          message: `${name} has no volume.`,
          sectionIndex: index,
        });
      }

      if (weight === null) {
        weightKnown = false;
      } else {
        totalWeight += weight;
      }

      totalInGround += volume.volume;
      totalLoose += looseVolume;

      results.push({
        index,
        name,
        shape: volume.shape,
        area: volume.area,
        volume: volume.volume,
        looseVolume,
        weight,
        needsDepth: volume.needsDepth,
      });
    }

    if (!weightKnown) {
      totalWeight = null;
    }

    const mode = truck.capacityMode === "volume"
      || truck.capacityMode === "weight"
      || truck.capacityMode === "both"
      ? truck.capacityMode
      : "both";
    const volumeCapacity = positiveNumber(truck.volumeCapacity);
    const weightCapacity = positiveNumber(truck.weightCapacity);
    const weightNeeded = mode !== "volume";
    const capacityAvailable = mode === "volume"
      ? volumeCapacity !== null
      : mode === "weight"
        ? weightCapacity !== null
        : volumeCapacity !== null || weightCapacity !== null;

    if (!capacityAvailable) {
      warnings.push({
        code: "missing-truck-capacity",
        message: "Add a truck capacity to calculate loads.",
      });
    }

    if (weightNeeded && !weightKnown) {
      warnings.push({
        code: "unknown-weight",
        message: "Weight is unknown because not every section has a material density.",
      });
    }

    const loads = truckLoads(
      { volume: totalLoose, weight: weightKnown ? totalWeight : null },
      {
        capacityMode: mode,
        volumeCapacity,
        weightCapacity,
      }
    );
    const price = calculatePrice(loads.exact, source.pricePerTruck);
    const gstExact = applyGst(price.exact, gst.mode, gst.rate);
    const gstRounded = applyGst(price.rounded, gst.mode, gst.rate);

    return {
      sections: results,
      totals: {
        volumeInGround: totalInGround,
        volumeLoose: totalLoose,
        weight: weightKnown ? totalWeight : null,
        trucks: loads,
        price,
        gst: {
          exact: gstExact,
          rounded: gstRounded,
        },
      },
      warnings,
    };
  }

  return {
    UNIT_TO_M,
    toMetres,
    sectionVolume,
    applySwell,
    truckLoads,
    calculatePrice,
    applyGst,
    calculateJob,
  };
});
