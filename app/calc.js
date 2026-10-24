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

  function calculateTravel(travel, context) {
    const source = travel || {};
    const trips = context || {};
    const warnings = [];
    const distance = Number(source.distance);
    const distanceValid = Number.isFinite(distance) && distance > 0;
    const roundTrip = source.roundTrip !== false;
    const totalDistance = distanceValid ? distance * (roundTrip ? 2 : 1) : 0;
    const useCalculatedTrips = source.useCalculatedTrips !== false;
    const rawTrips = useCalculatedTrips
      ? Number(trips.tripsRounded)
      : Number(source.manualTrips);
    const wholeTrips = Number.isFinite(rawTrips) && rawTrips > 0
      ? Math.ceil(rawTrips)
      : 0;
    const tripsExact = wholeTrips;
    const tripsRounded = wholeTrips;
    const totalKm = totalDistance * wholeTrips;
    const usePricePerKm = source.usePricePerKm === true;
    const pricePerKm = positiveNumber(source.pricePerKm);
    const useTruckFuel = source.useTruckFuel !== false;
    const fuelValue = useTruckFuel ? trips.truckFuelConsumption : source.manualFuel;
    const fuelConsumption = usePricePerKm ? null : positiveNumber(fuelValue);
    const includeDieselPrice = usePricePerKm ? false : source.includeDieselPrice !== false;
    const dieselPrice = usePricePerKm ? null : positiveNumber(source.dieselPrice);

    if (!distanceValid) {
      warnings.push({
        code: "travel-missing-distance",
        message: "Enter the travel distance.",
      });
    }

    if (tripsExact <= 0) {
      warnings.push({
        code: "travel-missing-trips",
        message: "Enter the number of truck trips.",
      });
    }

    if (usePricePerKm) {
      if (pricePerKm === null) {
        warnings.push({
          code: "travel-missing-price-per-km",
          message: "Enter the price per kilometre.",
        });
      }
    } else {
      if (fuelConsumption === null) {
        warnings.push({
          code: "travel-missing-fuel",
          message: "Enter fuel consumption in km/L.",
        });
      }

      if (includeDieselPrice && dieselPrice === null) {
        warnings.push({
          code: "travel-missing-diesel",
          message: "Enter the current diesel price.",
        });
      }
    }

    let litresExact = 0;
    let litresRounded = 0;
    let costExact = 0;
    let costRounded = 0;

    if (usePricePerKm) {
      costExact = pricePerKm !== null ? totalKm * pricePerKm : 0;
      costRounded = costExact;
    } else if (fuelConsumption !== null) {
      litresExact = totalKm / fuelConsumption;
      litresRounded = litresExact;
      if (includeDieselPrice && dieselPrice !== null) {
        costExact = litresExact * dieselPrice;
        costRounded = litresRounded * dieselPrice;
      }
    }

    return {
      enabled: true,
      distance: distanceValid ? distance : 0,
      roundTrip,
      totalDistance,
      totalKm,
      tripsExact,
      tripsRounded,
      usePricePerKm,
      pricePerKm: usePricePerKm ? pricePerKm : null,
      fuelConsumption,
      dieselPrice: includeDieselPrice ? dieselPrice : null,
      includeDieselPrice,
      litresExact,
      litresRounded,
      cost: {
        exact: costExact,
        rounded: costRounded,
      },
      warnings,
    };
  }

  function calculateDelivery(delivery, truck, pricePerTruck) {
    const source = delivery || {};
    const spec = truck || {};
    const warnings = [];
    const basis = source.amountBasis === "area" || source.amountBasis === "weight"
      ? source.amountBasis
      : "volume";
    const price = Number(source.price);
    const priceValid = Number.isFinite(price) && price > 0;
    let finishedVolume = null;
    let deliveredVolume = null;
    let weight = null;
    let amountValue = null;

    if (basis === "area") {
      const width = toMetres(source.width, source.widthUnit);
      const length = toMetres(source.length, source.lengthUnit);
      const depth = toMetres(source.depth, source.depthUnit);
      const volume = width * length * depth;

      if (Number.isFinite(volume) && volume > 0) {
        finishedVolume = volume;
        const settling = Number(source.settlingPercent);
        const factor = Number.isFinite(settling) && settling > 0
          ? 1 + settling / 100
          : 1;
        deliveredVolume = finishedVolume * factor;
        amountValue = deliveredVolume;
      }
    } else if (basis === "weight") {
      const amount = Number(source.amount);

      if (Number.isFinite(amount) && amount > 0) {
        weight = amount;
        amountValue = amount;
      }
    } else {
      const amount = Number(source.amount);

      if (Number.isFinite(amount) && amount > 0) {
        if (source.addSettling) {
          const settling = Number(source.settlingPercent);
          const factor = Number.isFinite(settling) && settling > 0
            ? 1 + settling / 100
            : 1;
          finishedVolume = amount;
          deliveredVolume = amount * factor;
        } else {
          deliveredVolume = amount;
        }
        amountValue = deliveredVolume;
      }
    }

    if (amountValue === null || !Number.isFinite(amountValue) || amountValue <= 0) {
      warnings.push({
        code: "material-missing-amount",
        message: "Enter the amount of material to bring in.",
      });
    }

    if (!priceValid) {
      warnings.push({
        code: "material-missing-price",
        message: "Enter a material price.",
      });
    }

    const mode = basis === "weight" ? "weight" : "volume";

    const amount = basis === "weight" ? weight : deliveredVolume;
    const materialCost = amountValue !== null && priceValid && amount !== null
      ? amount * price
      : 0;
    const loads = truckLoads(
      { volume: deliveredVolume, weight },
      {
        capacityMode: mode,
        volumeCapacity: spec.volumeCapacity,
        weightCapacity: spec.weightCapacity,
      }
    );

    if (amountValue !== null && amountValue > 0 && loads.exact <= 0) {
      warnings.push({
        code: "material-missing-truck-capacity",
        message: "Add a truck capacity for the delivery amount.",
      });
    }

    const deliveryMode = source.deliveryMode === "custom" || source.deliveryMode === "included"
      ? source.deliveryMode
      : "truckRate";
    let tripExact = 0;
    let tripRounded = 0;

    if (deliveryMode === "truckRate") {
      const rate = Number(pricePerTruck);
      const validRate = Number.isFinite(rate) && rate > 0 ? rate : 0;
      tripExact = loads.exact * validRate;
      tripRounded = loads.rounded * validRate;
    } else if (deliveryMode === "custom") {
      const fee = Number(source.customFee);
      if (Number.isFinite(fee) && fee > 0) {
        tripExact = loads.exact * fee;
        tripRounded = loads.rounded * fee;
      } else {
        warnings.push({
          code: "material-missing-custom-fee",
          message: "Enter a custom delivery fee.",
        });
      }
    }

    return {
      enabled: true,
      materialName: String(source.materialName || "").trim(),
      amountBasis: basis,
      finishedVolume,
      deliveredVolume,
      weight,
      materialCost,
      trucks: loads,
      tripCost: {
        exact: tripExact,
        rounded: tripRounded,
      },
      total: {
        exact: materialCost + tripExact,
        rounded: materialCost + tripRounded,
      },
      warnings,
    };
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
    const delivery = source.delivery && source.delivery.enabled
      ? calculateDelivery(source.delivery, truck, source.pricePerTruck)
      : null;

    if (delivery) {
      warnings.push(...delivery.warnings);
    }

    const travel = source.travel && source.travel.enabled
      ? calculateTravel(source.travel, {
        tripsExact: loads.exact + (delivery ? delivery.trucks.exact : 0),
        tripsRounded: loads.rounded + (delivery ? delivery.trucks.rounded : 0),
        truckFuelConsumption: truck.fuelConsumption,
      })
      : null;

    if (travel) {
      warnings.push(...travel.warnings);
    }

    const combinedPriceExact = price.exact
      + (delivery ? delivery.total.exact : 0)
      + (travel ? travel.cost.exact : 0);
    const combinedPriceRounded = price.rounded
      + (delivery ? delivery.total.rounded : 0)
      + (travel ? travel.cost.rounded : 0);
    const combinedGstExact = applyGst(combinedPriceExact, gst.mode, gst.rate);
    const combinedGstRounded = applyGst(combinedPriceRounded, gst.mode, gst.rate);

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
        delivery,
        travel,
        combined: {
          trucks: {
            exact: loads.exact + (delivery ? delivery.trucks.exact : 0),
            rounded: loads.rounded + (delivery ? delivery.trucks.rounded : 0),
            limit: delivery ? null : loads.limit,
          },
          price: {
            exact: combinedPriceExact,
            rounded: combinedPriceRounded,
          },
          gst: {
            exact: combinedGstExact,
            rounded: combinedGstRounded,
          },
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
    calculateDelivery,
    calculateTravel,
    calculateJob,
  };
});
