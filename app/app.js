(function () {
  "use strict";

  const sectionsEl = document.getElementById("sections");
  const sectionCountEl = document.getElementById("section-count");
  const addSectionButton = document.getElementById("add-section");
  const newJobButton = document.getElementById("new-job");
  const truckVolumeInput = document.getElementById("truck-volume");
  const truckWeightInput = document.getElementById("truck-weight");
  const truckPriceInput = document.getElementById("truck-price");
  const truckFuelInput = document.getElementById("truck-fuel");
  const truckPresetSelect = document.getElementById("truck-preset");
  const saveTruckPresetButton = document.getElementById("save-truck-preset");
  const deleteTruckPresetButton = document.getElementById("delete-truck-preset");
  const presetSaveRow = document.getElementById("preset-save-row");
  const presetNameInput = document.getElementById("preset-name");
  const confirmTruckPresetButton = document.getElementById("confirm-truck-preset");
  const cancelTruckPresetButton = document.getElementById("cancel-truck-preset");
  const truckPresetStatus = document.getElementById("truck-preset-status");
  const truckPresetWarning = document.getElementById("truck-preset-warning");
  const swellEnabledInput = document.getElementById("swell-enabled");
  const swellPercentInput = document.getElementById("swell-percent");
  const roundUpInput = document.getElementById("round-up");
  const gstModeInput = document.getElementById("gst-mode");
  const gstRateInput = document.getElementById("gst-rate");
  const volumeOutput = document.getElementById("result-volume");
  const volumeSubOutput = document.getElementById("result-volume-sub");
  const trucksOutput = document.getElementById("result-trucks");
  const limitOutput = document.getElementById("result-limit");
  const priceOutput = document.getElementById("result-price");
  const priceSubOutput = document.getElementById("result-price-sub");
  const summaryOutput = document.getElementById("summary");
  const warningsOutput = document.getElementById("warnings");
  const mathsOutput = document.getElementById("maths");
  const deliveryEnabledInput = document.getElementById("delivery-enabled");
  const deliveryCard = document.getElementById("delivery-card");
  const deliveryAmountFields = document.getElementById("delivery-amount-fields");
  const deliveryAmountUnit = document.getElementById("delivery-amount-unit");
  const deliveryAreaFields = document.getElementById("delivery-area-fields");
  const deliverySettlingFields = document.getElementById("delivery-settling-fields");
  const deliverySettlingPercentField = document.getElementById("delivery-settling-percent-field");
  const deliveryAddSettlingField = document.getElementById("delivery-add-settling-field");
  const deliveryPriceUnit = document.getElementById("delivery-price-unit");
  const deliveryCustomFeeField = document.getElementById("delivery-custom-fee-field");
  const trucksLabelOutput = document.getElementById("result-trucks-label");
  const materialRow = document.getElementById("result-material-row");
  const materialLabel = document.getElementById("result-material-label");
  const materialVolumeOutput = document.getElementById("result-material-volume");
  const materialSubOutput = document.getElementById("result-material-sub");
  const combinedRow = document.getElementById("result-combined-row");
  const combinedTrucksOutput = document.getElementById("result-combined-trucks");
  const combinedSubOutput = document.getElementById("result-combined-sub");
  const travelEnabledInput = document.getElementById("travel-enabled");
  const travelCard = document.getElementById("travel-card");
  const travelManualTripsField = document.getElementById("travel-manual-trips-field");
  const travelManualFuelField = document.getElementById("travel-manual-fuel-field");
  const travelDieselField = document.getElementById("travel-diesel-field");
  const travelDieselInput = document.getElementById("travel-diesel");
  const travelFuelFields = document.getElementById("travel-fuel-fields");
  const travelPricePerKmField = document.getElementById("travel-price-km-field");
  const travelPricePerKmInput = document.getElementById("travel-price-km");
  const travelPriceNote = document.getElementById("travel-price-note");
  const travelTripsNote = document.getElementById("travel-trips-note");
  const travelFuelNote = document.getElementById("travel-fuel-note");
  const travelRow = document.getElementById("result-travel-row");
  const travelCostOutput = document.getElementById("result-travel-cost");
  const travelSubOutput = document.getElementById("result-travel-sub");

  let nextSectionId = 1;

  function createSection(overrides) {
    return Object.assign({
      id: nextSectionId++,
      name: "",
      shape: "rectangle",
      width: "",
      widthUnit: "m",
      length: "",
      lengthUnit: "m",
      unevenWidth: "",
      unevenWidthUnit: "m",
      leftLength: "",
      leftLengthUnit: "m",
      rightLength: "",
      rightLengthUnit: "m",
      area: "",
      manualVolume: "",
      depth: "",
      depthUnit: "mm",
    }, overrides);
  }

  function createTravel() {
    return {
      enabled: false,
      distance: "",
      useCalculatedTrips: true,
      manualTrips: "",
      roundTrip: true,
      usePricePerKm: false,
      pricePerKm: "",
      useTruckFuel: true,
      manualFuel: "",
      includeDieselPrice: true,
      dieselPrice: "",
    };
  }

  function createDelivery() {
    return {
      enabled: false,
      materialName: "",
      amountBasis: "volume",
      amount: "",
      addSettling: false,
      settlingPercent: "10",
      width: "",
      widthUnit: "m",
      length: "",
      lengthUnit: "m",
      depth: "",
      depthUnit: "mm",
      price: "",
      density: "",
      deliveryMode: "custom",
      customFee: "",
    };
  }

  const state = {
    sections: [
      createSection({
        width: "10",
        length: "3",
        depth: "100",
        unevenWidth: "11",
        leftLength: "7",
        rightLength: "3",
      }),
    ],
    truck: {
      capacityMode: "volume",
      volumeCapacity: "6.5",
      weightCapacity: "8",
      pricePerTruck: "800",
      fuelConsumption: "",
    },
    swell: {
      enabled: false,
      percent: "30",
    },
    gst: {
      mode: "none",
      rate: "10",
    },
    delivery: createDelivery(),
    travel: createTravel(),
    showRounded: true,
  };

  let truckPresets = [];
  let selectedTruckPresetId = null;
  let truckDirty = false;
  let truckPresetCounter = 0;
  let truckStore;

  function getStorageBackend() {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  function createTruckPresetId() {
    truckPresetCounter += 1;
    return `truck-${Date.now()}-${truckPresetCounter}`;
  }

  const storageApi = typeof QuoteStorage !== "undefined" ? QuoteStorage : null;
  truckStore = storageApi
    ? storageApi.createStore(getStorageBackend())
    : {
      load: () => ({ presets: [], selectedId: null }),
      save: () => false,
    };

  function format(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return "0";
    }
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 3,
    }).format(number);
  }

  function money(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return "$0";
    }
    const hasCents = Math.abs(number - Math.round(number)) > 1e-9;
    return `$${new Intl.NumberFormat(undefined, {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(number)}`;
  }

  function display(value) {
    if (value === "" || value === null || value === undefined) {
      return "?";
    }
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return "?";
    }
    return format(number);
  }

  function unitOptions(units) {
    return units
      .map((unit) => `<option value="${unit}">${unit}</option>`)
      .join("");
  }

  function sectionMarkup() {
    return `
      <div class="section-top">
        <input class="section-name" type="text" data-field="name" placeholder="Section name or address (optional)" aria-label="Section name">
        <div class="section-actions">
          <button class="icon-btn" type="button" data-action="duplicate">Duplicate</button>
          <button class="icon-btn" type="button" data-action="remove">Remove</button>
        </div>
      </div>

      <label class="check-row section-toggle">
        <input type="checkbox" data-field="uneven">
        <span>Uneven or odd shape?</span>
      </label>

      <div class="fields one shape-mode-fields" hidden>
        <label class="field">
          <span>Measure by</span>
          <select data-field="shape">
            <option value="unevenEnds">Uneven ends</option>
            <option value="manualArea">Manual area</option>
            <option value="manualVolume">Manual volume</option>
          </select>
        </label>
      </div>

      <div class="fields" data-shape-fields="rectangle">
        <label class="field">
          <span>Width</span>
          <span class="with-unit">
            <input type="number" inputmode="decimal" step="any" data-field="width" placeholder="0">
            <select data-field="widthUnit" aria-label="Width unit">${unitOptions(["m", "cm", "mm"])}</select>
          </span>
        </label>
        <label class="field">
          <span>Length</span>
          <span class="with-unit">
            <input type="number" inputmode="decimal" step="any" data-field="length" placeholder="0">
            <select data-field="lengthUnit" aria-label="Length unit">${unitOptions(["m", "cm", "mm"])}</select>
          </span>
        </label>
      </div>

      <div class="fields three" data-shape-fields="unevenEnds" hidden>
        <label class="field">
          <span>Width across</span>
          <span class="with-unit">
            <input type="number" inputmode="decimal" step="any" data-field="unevenWidth" placeholder="0">
            <select data-field="unevenWidthUnit" aria-label="Uneven width unit">${unitOptions(["m", "cm", "mm"])}</select>
          </span>
        </label>
        <label class="field">
          <span>Left length</span>
          <span class="with-unit">
            <input type="number" inputmode="decimal" step="any" data-field="leftLength" placeholder="0">
            <select data-field="leftLengthUnit" aria-label="Left length unit">${unitOptions(["m", "cm", "mm"])}</select>
          </span>
        </label>
        <label class="field">
          <span>Right length</span>
          <span class="with-unit">
            <input type="number" inputmode="decimal" step="any" data-field="rightLength" placeholder="0">
            <select data-field="rightLengthUnit" aria-label="Right length unit">${unitOptions(["m", "cm", "mm"])}</select>
          </span>
        </label>
      </div>

      <div class="fields one" data-shape-fields="manualArea" hidden>
        <label class="field">
          <span>Manual area</span>
          <span class="with-unit">
            <input type="number" inputmode="decimal" step="any" data-field="area" placeholder="0">
            <span class="unit">m²</span>
          </span>
        </label>
      </div>

      <div class="fields one" data-shape-fields="manualVolume" hidden>
        <label class="field">
          <span>Manual volume</span>
          <span class="with-unit">
            <input type="number" inputmode="decimal" step="any" data-field="manualVolume" placeholder="0">
            <span class="unit">m³</span>
          </span>
        </label>
      </div>

      <div class="fields one" data-depth-field>
        <label class="field">
          <span>Depth</span>
          <span class="with-unit">
            <input type="number" inputmode="decimal" step="any" data-field="depth" placeholder="0">
            <select data-field="depthUnit" aria-label="Depth unit">${unitOptions(["mm", "cm", "m"])}</select>
          </span>
        </label>
      </div>

      <div class="section-foot">
        <span class="chip" data-role="section-result">No volume</span>
        <span class="small muted" data-role="section-formula"></span>
      </div>
    `;
  }

  function syncSectionCard(card, section) {
    for (const element of card.querySelectorAll("[data-field]")) {
      const field = element.dataset.field;

      if (field === "uneven") {
        element.checked = section.shape !== "rectangle";
      } else if (field === "shape") {
        element.value = section.shape === "rectangle" ? "unevenEnds" : section.shape;
      } else {
        element.value = section[field] ?? "";
      }
    }
  }

  function applyShapeVisibility(card, section) {
    const shape = section.shape;
    const shapeModeFields = card.querySelector(".shape-mode-fields");
    const depthField = card.querySelector("[data-depth-field]");

    if (shapeModeFields) {
      shapeModeFields.hidden = shape === "rectangle";
    }

    for (const element of card.querySelectorAll("[data-shape-fields]")) {
      element.hidden = element.dataset.shapeFields !== shape;
    }

    if (depthField) {
      depthField.hidden = shape === "manualVolume";
    }
  }

  function renderSections() {
    sectionsEl.innerHTML = "";

    for (const section of state.sections) {
      const card = document.createElement("div");
      card.className = "section-card";
      card.dataset.sectionId = String(section.id);
      card.innerHTML = sectionMarkup();
      sectionsEl.appendChild(card);
      syncSectionCard(card, section);
      applyShapeVisibility(card, section);
    }

    const count = state.sections.length;
    sectionCountEl.textContent = `${count} section${count === 1 ? "" : "s"}`;
    update();
  }

  function buildJob() {
    const sections = state.sections.map((section) => {
      const item = {
        name: section.name,
        shape: section.shape,
      };

      if (section.shape === "manualVolume") {
        item.manualVolume = section.manualVolume;
      } else if (section.shape === "manualArea") {
        item.area = section.area;
        item.depth = section.depth;
        item.depthUnit = section.depthUnit;
      } else if (section.shape === "unevenEnds") {
        item.width = section.unevenWidth;
        item.widthUnit = section.unevenWidthUnit;
        item.leftLength = section.leftLength;
        item.leftLengthUnit = section.leftLengthUnit;
        item.rightLength = section.rightLength;
        item.rightLengthUnit = section.rightLengthUnit;
        item.depth = section.depth;
        item.depthUnit = section.depthUnit;
      } else {
        item.width = section.width;
        item.widthUnit = section.widthUnit;
        item.length = section.length;
        item.lengthUnit = section.lengthUnit;
        item.depth = section.depth;
        item.depthUnit = section.depthUnit;
      }

      return item;
    });

    return {
      sections,
      truck: {
        capacityMode: state.truck.capacityMode,
        volumeCapacity: state.truck.volumeCapacity,
        weightCapacity: state.truck.weightCapacity,
        fuelConsumption: state.truck.fuelConsumption,
      },
      swell: {
        enabled: state.swell.enabled,
        percent: state.swell.percent,
      },
      pricePerTruck: state.truck.pricePerTruck,
      gst: {
        mode: state.gst.mode,
        rate: state.gst.rate,
      },
      delivery: state.delivery.enabled
        ? {
          enabled: true,
          materialName: state.delivery.materialName,
          amountBasis: state.delivery.amountBasis,
          amount: state.delivery.amount,
          addSettling: state.delivery.addSettling,
          settlingPercent: state.delivery.settlingPercent,
          width: state.delivery.width,
          widthUnit: state.delivery.widthUnit,
          length: state.delivery.length,
          lengthUnit: state.delivery.lengthUnit,
          depth: state.delivery.depth,
          depthUnit: state.delivery.depthUnit,
          price: state.delivery.price,
          density: state.delivery.density,
          deliveryMode: state.delivery.deliveryMode,
          customFee: state.delivery.customFee,
        }
        : { enabled: false },
      travel: state.travel.enabled
        ? {
          enabled: true,
          distance: state.travel.distance,
          useCalculatedTrips: state.travel.useCalculatedTrips,
          manualTrips: state.travel.manualTrips,
          roundTrip: state.travel.roundTrip,
          usePricePerKm: state.travel.usePricePerKm,
          pricePerKm: state.travel.pricePerKm,
          useTruckFuel: state.travel.useTruckFuel,
          manualFuel: state.travel.manualFuel,
          includeDieselPrice: state.travel.includeDieselPrice,
          dieselPrice: state.travel.dieselPrice,
        }
        : { enabled: false },
    };
  }

  function sectionFormula(section, resultSection) {
    if (resultSection.needsDepth) {
      return "Depth needed for volume.";
    }

    if (section.shape === "manualVolume") {
      return resultSection.volume > 0
        ? `Manual volume = ${format(resultSection.volume)} m³`
        : "Enter a volume.";
    }

    if (resultSection.volume <= 0) {
      return "Enter valid dimensions.";
    }

    if (section.shape === "manualArea") {
      return `${display(section.area)} m² × ${display(section.depth)} ${section.depthUnit}`;
    }

    if (section.shape === "unevenEnds") {
      return `${display(section.unevenWidth)} ${section.unevenWidthUnit} × (${display(section.leftLength)} ${section.leftLengthUnit} + ${display(section.rightLength)} ${section.rightLengthUnit}) ÷ 2 × ${display(section.depth)} ${section.depthUnit}`;
    }

    return `${display(section.width)} ${section.widthUnit} × ${display(section.length)} ${section.lengthUnit} × ${display(section.depth)} ${section.depthUnit}`;
  }

  function updateSectionResult(card, section, resultSection) {
    const chip = card.querySelector('[data-role="section-result"]');
    const formula = card.querySelector('[data-role="section-formula"]');

    if (!resultSection) {
      chip.textContent = "No volume";
      chip.classList.add("warn");
      formula.textContent = "";
      return;
    }

    if (resultSection.needsDepth) {
      chip.textContent = `${format(resultSection.area)} m² · depth needed`;
      chip.classList.add("warn");
    } else if (resultSection.volume <= 0) {
      chip.textContent = "No volume";
      chip.classList.add("warn");
    } else if (section.shape === "manualVolume") {
      let text = `${format(resultSection.volume)} m³`;
      if (resultSection.weight !== null) {
        text += ` · ${format(resultSection.weight)} t`;
      }
      chip.textContent = text;
      chip.classList.remove("warn");
    } else {
      let text = `${format(resultSection.area)} m² · ${format(resultSection.volume)} m³`;
      if (resultSection.weight !== null) {
        text += ` · ${format(resultSection.weight)} t`;
      }
      chip.textContent = text;
      chip.classList.remove("warn");
    }

    formula.textContent = sectionFormula(section, resultSection);
  }

  function appendMathRow(text) {
    const row = document.createElement("div");
    const code = document.createElement("code");
    code.textContent = text;
    row.appendChild(code);
    mathsOutput.appendChild(row);
  }

  function truckWord(value) {
    return Number(value) === 1 ? "truck" : "trucks";
  }

  function tripWord(value) {
    return Number(value) === 1 ? "trip" : "trips";
  }

  function truckValueText(trucks, showRounded) {
    const value = showRounded ? trucks.rounded : trucks.exact;
    return `${format(value)} ${truckWord(value)}`;
  }

  function moneyPair(rounded, exact, showRounded) {
    return showRounded && rounded !== exact
      ? `${money(rounded)} rounded · ${money(exact)} exact`
      : money(exact);
  }

  function spoilLimitText(totals) {
    if (totals.trucks.limit === "volume") {
      return "Limited by volume";
    }
    if (totals.trucks.limit === "weight") {
      return "Limited by weight";
    }
    if (totals.volumeInGround <= 0) {
      return "Add valid dimensions";
    }
    if (state.truck.capacityMode === "weight" && totals.weight === null) {
      return "Weight unknown";
    }
    return "Add a truck capacity";
  }

  function materialAmountText(delivery) {
    if (delivery.deliveredVolume !== null) {
      return `${format(delivery.deliveredVolume)} m³`;
    }
    if (delivery.weight !== null) {
      return `${format(delivery.weight)} t`;
    }
    return "0 m³";
  }

  function materialHasAmount(delivery) {
    return delivery.deliveredVolume !== null || delivery.weight !== null;
  }

  function travelSummaryText(travel, showRounded) {
    if (!travel) {
      return "";
    }

    if (travel.usePricePerKm) {
      const cost = showRounded ? travel.cost.rounded : travel.cost.exact;
      return cost > 0 ? `Travel adds ${money(cost)}. ` : "";
    }

    if (!travel.includeDieselPrice) {
      const litres = showRounded ? travel.litresRounded : travel.litresExact;
      return litres > 0
        ? `Fuel ${format(litres)} L, diesel price excluded. `
        : "";
    }

    const cost = showRounded ? travel.cost.rounded : travel.cost.exact;
    return cost > 0 ? `Travel adds ${money(cost)}. ` : "";
  }

  function updateTravelNotes(result) {
    if (!state.travel.enabled) {
      return;
    }

    const trips = result.totals.combined.trucks;

    if (state.travel.useCalculatedTrips) {
      const whole = trips.rounded;

      if (whole > 0) {
        travelTripsNote.textContent = `Using ${format(whole)} job ${tripWord(whole)}.`;
        travelTripsNote.classList.remove("warn");
      } else {
        travelTripsNote.textContent = "No job trips to travel.";
        travelTripsNote.classList.add("warn");
      }
    } else {
      const manual = Number(state.travel.manualTrips);
      const whole = Number.isFinite(manual) && manual > 0 ? Math.ceil(manual) : 0;

      if (whole > 0) {
        travelTripsNote.textContent = `Using ${format(whole)} manual ${tripWord(whole)}.`;
        travelTripsNote.classList.remove("warn");
      } else {
        travelTripsNote.textContent = "Enter the number of manual trips.";
        travelTripsNote.classList.add("warn");
      }
    }

    if (state.travel.usePricePerKm) {
      const price = Number(state.travel.pricePerKm);

      if (Number.isFinite(price) && price > 0) {
        travelPriceNote.textContent = `Using price per km: ${money(price)}/km.`;
        travelPriceNote.classList.remove("warn");
      } else {
        travelPriceNote.textContent = "Enter the price per km.";
        travelPriceNote.classList.add("warn");
      }

      travelFuelNote.textContent = "";
      travelFuelNote.classList.remove("warn");
    } else {
      travelPriceNote.textContent = "";
      travelPriceNote.classList.remove("warn");

      if (state.travel.useTruckFuel) {
        const fuel = Number(state.truck.fuelConsumption);
        if (Number.isFinite(fuel) && fuel > 0) {
          travelFuelNote.textContent = `Using truck preset: ${format(fuel)} km/L.`;
          travelFuelNote.classList.remove("warn");
        } else {
          travelFuelNote.textContent = "The truck has no fuel consumption. Enter one in the truck or use a manual value.";
          travelFuelNote.classList.add("warn");
        }
      } else {
        const manual = Number(state.travel.manualFuel);
        if (Number.isFinite(manual) && manual > 0) {
          travelFuelNote.textContent = `Using manual fuel consumption: ${format(manual)} km/L.`;
          travelFuelNote.classList.remove("warn");
        } else {
          travelFuelNote.textContent = "Enter manual fuel consumption.";
          travelFuelNote.classList.add("warn");
        }
      }
    }
  }

  function updateMaths(result) {
    const totals = result.totals;
    const delivery = totals.delivery;
    const travel = totals.travel;
    const hasExtras = Boolean(delivery || travel);
    const finalGst = hasExtras ? totals.combined.gst : totals.gst;
    mathsOutput.innerHTML = "";

    if (result.sections.length === 0) {
      appendMathRow("No spoil sections.");
    } else {
      for (const section of result.sections) {
        const details = section.area === null
          ? `${format(section.volume)} m³`
          : `${format(section.area)} m² · ${format(section.volume)} m³`;
        appendMathRow(`${section.name}: ${details}`);
      }
      appendMathRow(`Spoil in ground: ${format(totals.volumeInGround)} m³`);
      appendMathRow(`Spoil loose after swell: ${format(totals.volumeLoose)} m³`);

      if (totals.weight !== null) {
        appendMathRow(`Spoil weight: ${format(totals.weight)} t`);
      }

      appendMathRow(`Spoil trucks: ${format(totals.trucks.exact)} exact · ${totals.trucks.rounded} rounded`);
      appendMathRow(`Spoil price: ${money(totals.price.exact)} exact · ${money(totals.price.rounded)} rounded`);
    }

    if (delivery) {
      appendMathRow(`Material: ${delivery.materialName || "material"}`);

      if (delivery.finishedVolume !== null) {
        appendMathRow(`Finished fill volume: ${format(delivery.finishedVolume)} m³`);
      }

      if (delivery.deliveredVolume !== null) {
        appendMathRow(`Delivered volume: ${format(delivery.deliveredVolume)} m³`);
      }

      if (delivery.weight !== null) {
        appendMathRow(`Material weight: ${format(delivery.weight)} t`);
      }

      appendMathRow(`Material cost: ${money(delivery.materialCost)}`);
      appendMathRow(`Delivery trucks: ${format(delivery.trucks.exact)} exact · ${delivery.trucks.rounded} rounded`);
      appendMathRow(`Delivery trips: ${money(delivery.tripCost.exact)} exact · ${money(delivery.tripCost.rounded)} rounded`);
      appendMathRow(`Delivery total: ${money(delivery.total.exact)} exact · ${money(delivery.total.rounded)} rounded`);
    }

    if (travel) {
      appendMathRow(`Travel: ${format(travel.distance)} km ${travel.roundTrip ? "× 2" : "one way"} × ${travel.tripsRounded} ${tripWord(travel.tripsRounded)} = ${format(travel.totalKm)} km`);

      if (travel.usePricePerKm) {
        appendMathRow(`Price per km: ${travel.pricePerKm !== null ? `${money(travel.pricePerKm)}/km` : "not set"}`);
        appendMathRow(`Travel cost: ${money(travel.cost.rounded)}`);
      } else {
        appendMathRow(`Fuel consumption: ${travel.fuelConsumption !== null ? `${format(travel.fuelConsumption)} km/L` : "not set"}`);
        appendMathRow(`Fuel: ${format(travel.litresRounded)} L`);

        if (travel.includeDieselPrice) {
          appendMathRow(`Fuel cost: ${money(travel.cost.rounded)}`);
        } else {
          appendMathRow("Diesel price excluded.");
        }
      }
    }

    if (hasExtras) {
      appendMathRow(`Combined trucks: ${format(totals.combined.trucks.exact)} exact · ${totals.combined.trucks.rounded} rounded`);
      appendMathRow(`Combined price: ${money(totals.combined.price.exact)} exact · ${money(totals.combined.price.rounded)} rounded`);
    }

    appendMathRow(`Charge: ${money(finalGst.exact.total)} exact · ${money(finalGst.rounded.total)} rounded`);

    if (state.gst.mode !== "none") {
      appendMathRow(`GST: ${money(finalGst.exact.gst)} exact · ${money(finalGst.rounded.gst)} rounded`);
    }
  }

  function updateResults(result) {
    const totals = result.totals;
    const delivery = totals.delivery;
    const travel = totals.travel;
    const combined = totals.combined;
    const showRounded = state.showRounded;
    const hasExtras = Boolean(delivery || travel);
    const finalTrucks = hasExtras ? combined.trucks : totals.trucks;
    const finalGst = hasExtras ? combined.gst : totals.gst;

    volumeOutput.textContent = `${format(totals.volumeInGround)} m³`;

    let volumeSub = `${format(totals.volumeLoose)} m³ loose`;
    if (totals.weight !== null) {
      volumeSub += ` · ${format(totals.weight)} t`;
    } else if (state.truck.capacityMode !== "volume") {
      volumeSub += " · weight unknown";
    }
    volumeSubOutput.textContent = volumeSub;

    trucksLabelOutput.textContent = delivery ? "Spoil truck loads" : "Truck loads";
    trucksOutput.textContent = truckValueText(totals.trucks, showRounded);

    const spoilParts = [];
    if (showRounded && totals.trucks.rounded !== totals.trucks.exact) {
      spoilParts.push(`${format(totals.trucks.exact)} exact`);
    }
    spoilParts.push(spoilLimitText(totals));
    spoilParts.push(moneyPair(totals.price.rounded, totals.price.exact, showRounded));
    limitOutput.textContent = spoilParts.join(" · ");

    materialRow.hidden = !delivery;
    combinedRow.hidden = !delivery;
    travelRow.hidden = !travel;

    if (travel) {
      if (travel.usePricePerKm) {
        travelCostOutput.textContent = money(showRounded ? travel.cost.rounded : travel.cost.exact);
        travelSubOutput.textContent = `${format(travel.totalKm)} km · ${travel.tripsRounded} ${tripWord(travel.tripsRounded)} · ${money(travel.pricePerKm)}/km`;
      } else if (travel.includeDieselPrice) {
        travelCostOutput.textContent = money(showRounded ? travel.cost.rounded : travel.cost.exact);
        travelSubOutput.textContent = `${format(showRounded ? travel.litresRounded : travel.litresExact)} L · ${format(travel.totalKm)} km · ${travel.tripsRounded} ${tripWord(travel.tripsRounded)}`;
      } else {
        travelCostOutput.textContent = `${format(showRounded ? travel.litresRounded : travel.litresExact)} L`;
        travelSubOutput.textContent = `Diesel price excluded · ${format(travel.totalKm)} km · ${travel.tripsRounded} ${tripWord(travel.tripsRounded)}`;
      }
    }

    if (delivery) {
      materialLabel.textContent = delivery.materialName
        ? `Material to bring in: ${delivery.materialName}`
        : "Material to bring in";
      materialVolumeOutput.textContent = materialAmountText(delivery);

      if (!materialHasAmount(delivery)) {
        materialSubOutput.textContent = "Enter the amount of material.";
      } else if (delivery.materialCost <= 0) {
        materialSubOutput.textContent = "Enter the material price.";
      } else {
        const parts = [];
        if (delivery.deliveredVolume !== null && delivery.weight !== null) {
          parts.push(`${format(delivery.weight)} t`);
        }
        parts.push(truckValueText(delivery.trucks, showRounded));
        if (showRounded && delivery.trucks.rounded !== delivery.trucks.exact) {
          parts.push(`${format(delivery.trucks.exact)} exact`);
        }
        if (delivery.trucks.limit === "volume") {
          parts.push("volume-limited");
        } else if (delivery.trucks.limit === "weight") {
          parts.push("weight-limited");
        }
        parts.push(moneyPair(delivery.total.rounded, delivery.total.exact, showRounded));
        materialSubOutput.textContent = parts.join(" · ");
      }

      combinedTrucksOutput.textContent = truckValueText(combined.trucks, showRounded);

      const combinedParts = [travel ? "Spoil, delivery and fuel" : "Spoil and delivery trips"];
      if (showRounded && combined.trucks.rounded !== combined.trucks.exact) {
        combinedParts.push(`${format(combined.trucks.exact)} exact`);
      }
      combinedParts.push(moneyPair(combined.price.rounded, combined.price.exact, showRounded));
      combinedSubOutput.textContent = combinedParts.join(" · ");
    }

    priceOutput.textContent = money(showRounded ? finalGst.rounded.total : finalGst.exact.total);

    const gstAmount = showRounded ? finalGst.rounded.gst : finalGst.exact.gst;
    let gstText = "No GST";
    if (state.gst.mode === "add") {
      gstText = `GST ${display(state.gst.rate)}%: ${money(gstAmount)}`;
    } else if (state.gst.mode === "included") {
      gstText = `Includes ${money(gstAmount)} GST`;
    }

    const exactCharge = showRounded && finalGst.rounded.total !== finalGst.exact.total
      ? `Exact ${money(finalGst.exact.total)} · `
      : "";
    priceSubOutput.textContent = `${exactCharge}${gstText}`;

    if (delivery) {
      if (!materialHasAmount(delivery)) {
        summaryOutput.textContent = totals.volumeInGround > 0
          ? "Spoil estimate is ready. Add the material amount and price to include delivery."
          : "Add job dimensions and material details to see an estimate.";
      } else {
        const charge = money(showRounded ? finalGst.rounded.total : finalGst.exact.total);
        let summary = "";

        if (totals.volumeInGround > 0) {
          summary += `Spoil fits in ${format(totals.trucks.exact)} ${truckWord(totals.trucks.exact)}`;
          if (showRounded && totals.trucks.rounded !== totals.trucks.exact) {
            summary += `, rounded up to ${totals.trucks.rounded}`;
          }
          summary += ". ";
        }

        summary += `Bring in ${materialAmountText(delivery)} of material. `;
        summary += travelSummaryText(travel, showRounded);

        if (finalTrucks.exact > 0) {
          summary += `About ${format(finalTrucks.exact)} ${truckWord(finalTrucks.exact)} there and back`;
          if (showRounded && finalTrucks.rounded !== finalTrucks.exact) {
            summary += `, rounded up to ${finalTrucks.rounded}`;
          }
          summary += `. Estimated charge ${charge}.`;
        } else {
          summary += "Add truck capacities to estimate the total.";
        }

        summaryOutput.textContent = summary;
      }
    } else if (totals.volumeInGround <= 0) {
      summaryOutput.textContent = "Add valid job dimensions to see an estimate.";
    } else if (totals.trucks.exact <= 0) {
      summaryOutput.textContent = "Add a truck capacity and price to see an estimate.";
    } else {
      const charge = money(showRounded ? finalGst.rounded.total : finalGst.exact.total);
      let summary = `Spoil fits in ${format(totals.trucks.exact)} ${truckWord(totals.trucks.exact)}`;
      if (showRounded && totals.trucks.rounded !== totals.trucks.exact) {
        summary += `, rounded up to ${totals.trucks.rounded}`;
      }
      summary += ". ";
      summary += travelSummaryText(travel, showRounded);
      summary += `Estimated charge ${charge}.`;
      summaryOutput.textContent = summary;
    }

    warningsOutput.innerHTML = "";
    if (result.warnings.length === 0) {
      warningsOutput.hidden = true;
    } else {
      warningsOutput.hidden = false;
      for (const warning of result.warnings) {
        const item = document.createElement("div");
        item.className = "warning";
        item.textContent = warning.message;
        warningsOutput.appendChild(item);
      }
    }

    updateTravelNotes(result);
    updateMaths(result);
  }

  function update() {
    const result = Calc.calculateJob(buildJob());
    const cards = sectionsEl.querySelectorAll(".section-card");

    cards.forEach((card, index) => {
      const section = state.sections[index];
      if (!section) {
        return;
      }
      applyShapeVisibility(card, section);
      updateSectionResult(card, section, result.sections[index]);
    });

    updateResults(result);
  }

  function getSelectedTruckPreset() {
    return truckPresets.find((preset) => preset.id === selectedTruckPresetId) || null;
  }

  function applyPresetToState(preset) {
    state.truck.volumeCapacity = preset.volumeCapacity;
    state.truck.weightCapacity = preset.weightCapacity;
    state.truck.pricePerTruck = preset.pricePerTruck;
    state.truck.fuelConsumption = preset.fuelConsumption;
  }

  function renderTruckPresetOptions() {
    truckPresetSelect.innerHTML = "";

    const custom = document.createElement("option");
    custom.value = "";
    custom.textContent = "Custom / unsaved";
    truckPresetSelect.appendChild(custom);

    for (const preset of truckPresets) {
      const option = document.createElement("option");
      option.value = preset.id;
      option.textContent = preset.name;
      truckPresetSelect.appendChild(option);
    }

    truckPresetSelect.value = selectedTruckPresetId || "";
    deleteTruckPresetButton.disabled = !selectedTruckPresetId;
  }

  function updateTruckPresetStatus() {
    const preset = getSelectedTruckPreset();

    if (preset) {
      truckPresetStatus.textContent = truckDirty
        ? `Preset: ${preset.name} · unsaved changes`
        : `Preset: ${preset.name}`;
    } else {
      truckPresetStatus.textContent = truckDirty
        ? "Custom truck · unsaved"
        : "Custom truck";
    }
  }

  function setPresetWarning(message) {
    truckPresetWarning.textContent = message || "";
    truckPresetWarning.hidden = !message;
  }

  function markTruckDirty() {
    truckDirty = true;
    updateTruckPresetStatus();
  }

  function openPresetSaveForm() {
    const preset = getSelectedTruckPreset();
    presetNameInput.value = preset ? preset.name : "";
    setPresetWarning("");
    presetSaveRow.hidden = false;
    presetNameInput.focus();
    presetNameInput.select();
  }

  function closePresetSaveForm() {
    presetSaveRow.hidden = true;
  }

  function saveTruckPreset() {
    const name = presetNameInput.value.trim();
    if (!name) {
      setPresetWarning("Enter a preset name.");
      presetNameInput.focus();
      return;
    }

    const selected = getSelectedTruckPreset();
    const existingByName = truckPresets.find(
      (preset) => preset.name.toLowerCase() === name.toLowerCase()
    );
    let existing = null;

    if (selected && selected.name.toLowerCase() === name.toLowerCase()) {
      existing = selected;
    } else if (selected) {
      if (existingByName) {
        setPresetWarning("Another preset already uses that name.");
        presetNameInput.focus();
        return;
      }
    } else if (existingByName) {
      existing = existingByName;
    }

    const preset = {
      id: existing ? existing.id : createTruckPresetId(),
      name,
      volumeCapacity: state.truck.volumeCapacity,
      weightCapacity: state.truck.weightCapacity,
      fuelConsumption: state.truck.fuelConsumption,
      pricePerTruck: state.truck.pricePerTruck,
    };

    if (existing) {
      truckPresets = truckPresets.map((item) => item.id === existing.id ? preset : item);
    } else {
      truckPresets = [...truckPresets, preset];
    }

    selectedTruckPresetId = preset.id;
    truckDirty = false;
    const saved = truckStore.save({
      presets: truckPresets,
      selectedId: selectedTruckPresetId,
    });
    closePresetSaveForm();
    renderTruckPresetOptions();
    updateTruckPresetStatus();
    setPresetWarning(saved
      ? ""
      : "Presets could not be saved in this browser. They will last until you reload.");
  }

  function deleteTruckPreset() {
    const preset = getSelectedTruckPreset();
    if (!preset) {
      return;
    }

    if (!window.confirm(`Delete truck preset "${preset.name}"?`)) {
      return;
    }

    truckPresets = truckPresets.filter((item) => item.id !== preset.id);
    selectedTruckPresetId = null;
    truckDirty = false;
    const saved = truckStore.save({ presets: truckPresets, selectedId: null });
    renderTruckPresetOptions();
    updateTruckPresetStatus();
    setPresetWarning(saved
      ? ""
      : "Presets could not be saved in this browser. They will last until you reload.");
  }

  function handleTruckPresetChange() {
    const id = truckPresetSelect.value;

    if (!id) {
      selectedTruckPresetId = null;
      truckDirty = false;
      deleteTruckPresetButton.disabled = true;
      const saved = truckStore.save({ presets: truckPresets, selectedId: null });
      setPresetWarning(saved
        ? ""
        : "Presets could not be saved in this browser. They will last until you reload.");
      updateTruckPresetStatus();
      return;
    }

    const preset = truckPresets.find((item) => item.id === id);
    if (!preset) {
      return;
    }

    selectedTruckPresetId = preset.id;
    truckDirty = false;
    applyPresetToState(preset);
    const saved = truckStore.save({
      presets: truckPresets,
      selectedId: selectedTruckPresetId,
    });
    setPresetWarning(saved
      ? ""
      : "Presets could not be saved in this browser. They will last until you reload.");
    syncStaticControls();
    renderTruckPresetOptions();
    updateTruckPresetStatus();
    update();
  }

  function initTruckPresets() {
    const stored = truckStore.load();
    truckPresets = stored.presets;
    selectedTruckPresetId = stored.selectedId;
    const preset = getSelectedTruckPreset();

    if (preset) {
      applyPresetToState(preset);
    }

    renderTruckPresetOptions();
    updateTruckPresetStatus();
  }

  function syncDeliveryControls() {
    deliveryEnabledInput.checked = state.delivery.enabled;
    deliveryCard.hidden = !state.delivery.enabled;

    for (const element of deliveryCard.querySelectorAll("[data-delivery-field]")) {
      const field = element.dataset.deliveryField;
      if (element.type === "checkbox") {
        element.checked = Boolean(state.delivery[field]);
      } else {
        element.value = state.delivery[field] ?? "";
      }
    }

    const basis = state.delivery.amountBasis;
    const isWeight = basis === "weight";
    const isArea = basis === "area";

    deliveryAmountFields.hidden = isArea;
    deliveryAreaFields.hidden = !isArea;
    deliverySettlingFields.hidden = isWeight;
    deliverySettlingPercentField.hidden = isWeight;
    deliveryAddSettlingField.hidden = basis !== "volume";
    deliveryAmountUnit.textContent = isWeight ? "t" : "m³";
    deliveryPriceUnit.textContent = isWeight ? "/ t" : "/ m³";
    deliveryCustomFeeField.hidden = state.delivery.deliveryMode !== "custom";
  }

  function syncTravelControls() {
    travelEnabledInput.checked = state.travel.enabled;
    travelCard.hidden = !state.travel.enabled;

    for (const element of travelCard.querySelectorAll("[data-travel-field]")) {
      const field = element.dataset.travelField;
      if (element.type === "checkbox") {
        element.checked = Boolean(state.travel[field]);
      } else {
        element.value = state.travel[field] ?? "";
      }
    }

    travelManualTripsField.hidden = state.travel.useCalculatedTrips;
    travelManualFuelField.hidden = state.travel.useTruckFuel;
    travelDieselField.hidden = !state.travel.includeDieselPrice;
    travelFuelFields.hidden = state.travel.usePricePerKm;
    travelPricePerKmField.hidden = !state.travel.usePricePerKm;
    travelPriceNote.hidden = !state.travel.usePricePerKm;
  }

  function syncStaticControls() {
    truckVolumeInput.value = state.truck.volumeCapacity;
    truckWeightInput.value = state.truck.weightCapacity;
    truckPriceInput.value = state.truck.pricePerTruck;
    truckFuelInput.value = state.truck.fuelConsumption;
    swellEnabledInput.checked = state.swell.enabled;
    swellPercentInput.value = state.swell.percent;
    roundUpInput.checked = state.showRounded;
    gstModeInput.value = state.gst.mode;
    gstRateInput.value = state.gst.rate;
    syncDeliveryControls();
    syncTravelControls();
  }

  function handleDeliveryInput(event) {
    const field = event.target.dataset.deliveryField;
    if (!field) {
      return;
    }

    state.delivery[field] = event.target.type === "checkbox"
      ? event.target.checked
      : event.target.value;

    if (field === "amountBasis" || field === "deliveryMode") {
      syncDeliveryControls();
    }

    update();
  }

  function handleTravelInput(event) {
    const field = event.target.dataset.travelField;
    if (!field) {
      return;
    }

    state.travel[field] = event.target.type === "checkbox"
      ? event.target.checked
      : event.target.value;

    if (
      field === "useCalculatedTrips"
      || field === "useTruckFuel"
      || field === "includeDieselPrice"
      || field === "usePricePerKm"
    ) {
      syncTravelControls();
    }

    update();
  }

  function handleSectionInput(event) {
    const card = event.target.closest(".section-card");
    if (!card) {
      return;
    }

    const id = Number(card.dataset.sectionId);
    const section = state.sections.find((item) => item.id === id);
    const field = event.target.dataset.field;

    if (!section || !field) {
      return;
    }

    if (field === "uneven") {
      if (event.target.checked) {
        if (section.shape === "rectangle") {
          section.shape = "unevenEnds";
        }
      } else {
        section.shape = "rectangle";
      }
    } else if (field === "shape") {
      section.shape = event.target.value;
    } else {
      section[field] = event.target.value;
    }

    if (field === "uneven" || field === "shape") {
      const checkbox = card.querySelector('[data-field="uneven"]');
      const select = card.querySelector('[data-field="shape"]');

      if (checkbox) {
        checkbox.checked = section.shape !== "rectangle";
      }
      if (select) {
        select.value = section.shape === "rectangle" ? "unevenEnds" : section.shape;
      }
      applyShapeVisibility(card, section);
    }

    update();
  }

  function handleSectionAction(event) {
    const button = event.target.closest("[data-action]");
    if (!button) {
      return;
    }

    const card = button.closest(".section-card");
    if (!card) {
      return;
    }

    const id = Number(card.dataset.sectionId);
    const index = state.sections.findIndex((item) => item.id === id);
    const action = button.dataset.action;

    if (index === -1) {
      return;
    }

    if (action === "remove") {
      state.sections = state.sections.filter((item) => item.id !== id);
      if (state.sections.length === 0) {
        state.sections = [createSection()];
      }
      renderSections();
      return;
    }

    if (action === "duplicate") {
      const original = state.sections[index];
      const copy = {
        ...original,
        id: nextSectionId++,
        name: original.name ? `${original.name} copy` : "",
      };
      state.sections.splice(index + 1, 0, copy);
      renderSections();
    }
  }

  truckVolumeInput.addEventListener("input", () => {
    state.truck.volumeCapacity = truckVolumeInput.value;
    markTruckDirty();
    update();
  });

  truckWeightInput.addEventListener("input", () => {
    state.truck.weightCapacity = truckWeightInput.value;
    markTruckDirty();
    update();
  });

  truckPriceInput.addEventListener("input", () => {
    state.truck.pricePerTruck = truckPriceInput.value;
    markTruckDirty();
    update();
  });

  truckFuelInput.addEventListener("input", () => {
    state.truck.fuelConsumption = truckFuelInput.value;
    markTruckDirty();
    update();
  });

  swellEnabledInput.addEventListener("change", () => {
    state.swell.enabled = swellEnabledInput.checked;
    update();
  });

  swellPercentInput.addEventListener("input", () => {
    state.swell.percent = swellPercentInput.value;
    update();
  });

  roundUpInput.addEventListener("change", () => {
    state.showRounded = roundUpInput.checked;
    update();
  });

  gstModeInput.addEventListener("change", () => {
    state.gst.mode = gstModeInput.value;
    update();
  });

  gstRateInput.addEventListener("input", () => {
    state.gst.rate = gstRateInput.value;
    update();
  });

  deliveryEnabledInput.addEventListener("change", () => {
    state.delivery.enabled = deliveryEnabledInput.checked;
    syncDeliveryControls();
    update();
  });

  deliveryCard.addEventListener("input", handleDeliveryInput);
  deliveryCard.addEventListener("change", handleDeliveryInput);

  travelEnabledInput.addEventListener("change", () => {
    state.travel.enabled = travelEnabledInput.checked;
    syncTravelControls();
    update();
  });

  travelCard.addEventListener("input", handleTravelInput);
  travelCard.addEventListener("change", handleTravelInput);

  travelDieselInput.addEventListener("blur", () => {
    if (state.travel.dieselPrice === "") {
      return;
    }

    const value = Number(state.travel.dieselPrice);
    if (!Number.isFinite(value)) {
      return;
    }

    state.travel.dieselPrice = value.toFixed(2);
    travelDieselInput.value = state.travel.dieselPrice;
    update();
  });

  travelPricePerKmInput.addEventListener("blur", () => {
    if (state.travel.pricePerKm === "") {
      return;
    }

    const value = Number(state.travel.pricePerKm);
    if (!Number.isFinite(value)) {
      return;
    }

    state.travel.pricePerKm = value.toFixed(2);
    travelPricePerKmInput.value = state.travel.pricePerKm;
    update();
  });

  truckPresetSelect.addEventListener("change", handleTruckPresetChange);
  saveTruckPresetButton.addEventListener("click", openPresetSaveForm);
  deleteTruckPresetButton.addEventListener("click", deleteTruckPreset);
  confirmTruckPresetButton.addEventListener("click", saveTruckPreset);
  cancelTruckPresetButton.addEventListener("click", closePresetSaveForm);

  presetNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveTruckPreset();
    } else if (event.key === "Escape") {
      closePresetSaveForm();
    }
  });

  sectionsEl.addEventListener("input", handleSectionInput);
  sectionsEl.addEventListener("change", handleSectionInput);
  sectionsEl.addEventListener("click", handleSectionAction);

  addSectionButton.addEventListener("click", () => {
    state.sections.push(createSection());
    renderSections();
    const lastCard = sectionsEl.lastElementChild;
    if (lastCard) {
      lastCard.scrollIntoView({ behavior: "smooth", block: "center" });
      const nameInput = lastCard.querySelector('[data-field="name"]');
      if (nameInput) {
        nameInput.focus();
      }
    }
  });

  newJobButton.addEventListener("click", () => {
    if (!window.confirm("Start a new job? Unsaved changes will be lost.")) {
      return;
    }
    state.sections = [createSection()];
    state.delivery = createDelivery();
    state.travel = createTravel();
    syncDeliveryControls();
    syncTravelControls();
    renderSections();
  });

  initTruckPresets();
  syncStaticControls();
  renderSections();
})();
