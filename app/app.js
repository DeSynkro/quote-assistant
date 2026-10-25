(function () {
  "use strict";

  const sectionsEl = document.getElementById("sections");
  const sectionCountEl = document.getElementById("section-count");
  const removalsEnabledInput = document.getElementById("removals-enabled");
  const removalsCard = document.getElementById("removals-card");
  const addSectionButton = document.getElementById("add-section");
  const newJobButton = document.getElementById("new-job");
  const jobNameInput = document.getElementById("job-name");
  const saveJobButton = document.getElementById("save-job");
  const loadJobsButton = document.getElementById("load-jobs");
  const jobStatusOutput = document.getElementById("job-status");
  const jobDirtyPill = document.getElementById("job-dirty");
  const jobStorageNote = document.getElementById("job-storage-note");
  const loadJobsPanel = document.getElementById("load-jobs-panel");
  const closeLoadJobsButton = document.getElementById("close-load-jobs");
  const savedJobsList = document.getElementById("saved-jobs-list");
  const refreshSharedButton = document.getElementById("refresh-shared");
  const jobSearchInput = document.getElementById("job-search");
  const jobListStatus = document.getElementById("job-list-status");
  const storagePill = document.getElementById("storage-pill");
  const savedJobsScope = document.getElementById("saved-jobs-scope");
  const privacyNotice = document.getElementById("privacy-notice");
  const exportDataButton = document.getElementById("export-data");
  const importDataButton = document.getElementById("import-data");
  const importFileInput = document.getElementById("import-file");
  const dataStatusOutput = document.getElementById("data-status");
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
  const copySummaryButton = document.getElementById("copy-summary");
  const mobileEstimateButton = document.getElementById("mobile-estimate");
  const mobileEstimateTrucksOutput = document.getElementById("mobile-estimate-trucks");
  const mobileEstimatePriceOutput = document.getElementById("mobile-estimate-price");
  const resultsEl = document.querySelector(".results");
  const toastsEl = document.getElementById("toasts");
  const warningsOutput = document.getElementById("warnings");
  const mathsOutput = document.getElementById("maths");
  const deliveryEnabledInput = document.getElementById("delivery-enabled");
  const deliveryCard = document.getElementById("delivery-card");
  const deliveriesContainer = document.getElementById("deliveries");
  const addDeliveryButton = document.getElementById("add-delivery");
  const deliveryCountEl = document.getElementById("delivery-count");
  const volumeRow = document.getElementById("result-volume-row");
  const spoilTrucksRow = document.getElementById("result-spoil-trucks-row");
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
  const travelDistanceInput = document.getElementById("travel-distance");
  const travelManualTripsInput = document.getElementById("travel-manual-trips");
  const travelManualFuelInput = document.getElementById("travel-manual-fuel");
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
      swellEnabled: false,
      swellPercent: "5",
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

  function createDeliveryId() {
    deliveryCounter += 1;
    return `delivery-${Date.now()}-${deliveryCounter}`;
  }

  function createDeliveryItem(overrides) {
    return Object.assign({
      id: createDeliveryId(),
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
      deliveryMode: "custom",
      customFee: "",
    }, overrides || {});
  }

  function createTruck() {
    return {
      capacityMode: "volume",
      volumeCapacity: "6.5",
      weightCapacity: "8",
      pricePerTruck: "800",
      fuelConsumption: "",
    };
  }

  let deliveryCounter = 0;

  const state = {
    removalsEnabled: true,
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
    truck: createTruck(),
    gst: {
      mode: "none",
      rate: "10",
    },
    deliveries: [createDeliveryItem()],
    deliveryEnabled: false,
    travel: createTravel(),
    showRounded: true,
  };

  let truckPresets = [];
  let selectedTruckPresetId = null;
  let truckDirty = false;
  let truckPresetCounter = 0;
  let truckStore;
  let savedJobs = [];
  let currentJobId = null;
  let jobCounter = 0;
  let jobStore;
  let draftStore;
  let draftTimer = null;
  let draftPending = false;
  let storageIsShared = false;
  let refreshingShared = false;
  let jobSearchQuery = "";
  let jobDirty = false;
  let lastDeletedJob = null;
  let undoToastDismiss = null;

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

  function createJobId() {
    jobCounter += 1;
    return `job-${Date.now()}-${jobCounter}`;
  }

  const storageApi = typeof QuoteStorage !== "undefined" ? QuoteStorage : null;

  function createLocalStores() {
    const backend = getStorageBackend();
    return {
      truckStore: storageApi
        ? storageApi.createStore(backend)
        : {
          load: () => ({ presets: [], selectedId: null }),
          save: () => false,
        },
      jobStore: storageApi
        ? storageApi.createJobStore(backend)
        : {
          load: () => ({ jobs: [] }),
          save: () => false,
        },
    };
  }

  function updateStorageLabels() {
    if (storageIsShared) {
      storagePill.textContent = "Shared · local network";
      savedJobsScope.textContent = "Newest first · shared on this local network";
      privacyNotice.textContent = "Calculations stay on the local network. No data leaves it.";
      refreshSharedButton.hidden = false;
      jobStorageNote.textContent = "Saved jobs are shared on this network.";
    } else {
      refreshSharedButton.hidden = true;
      storagePill.textContent = "Offline · local only";
      savedJobsScope.textContent = "Newest first · saved on this device only";
      jobStorageNote.textContent = "Saved jobs stay on this device.";
      privacyNotice.textContent = "All calculations stay on this device. No data is sent anywhere.";
    }
  }

  function getApiBase() {
    if (typeof window === "undefined" || typeof fetch !== "function") {
      return null;
    }

    if (window.location.protocol !== "http:" && window.location.protocol !== "https:") {
      return null;
    }

    if (!storageApi || typeof storageApi.createRemoteStore !== "function") {
      return null;
    }

    try {
      return new URL("api", window.location.href).href.replace(/\/+$/, "");
    } catch (error) {
      return null;
    }
  }

  async function detectStores() {
    const apiBase = getApiBase();
    if (!apiBase) {
      return createLocalStores();
    }

    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 2500) : null;

    try {
      const response = await fetch(`${apiBase}/health`, {
        cache: "no-store",
        signal: controller ? controller.signal : undefined,
      });

      if (response.ok) {
        const health = await response.json();
        if (health && health.ok) {
          storageIsShared = true;
          return {
            truckStore: storageApi.createRemoteStore(apiBase),
            jobStore: storageApi.createRemoteJobStore(apiBase),
          };
        }
      }
    } catch (error) {
      storageIsShared = false;
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }

    return createLocalStores();
  }

  const localStores = createLocalStores();
  truckStore = localStores.truckStore;
  jobStore = localStores.jobStore;
  draftStore = storageApi ? storageApi.createDraftStore(getStorageBackend()) : null;

  function writeDraft() {
    if (!draftStore) {
      return;
    }

    draftStore.save({
      name: jobNameInput.value,
      currentJobId,
      data: serializeJobState(),
      updatedAt: new Date().toISOString(),
    });
    draftPending = false;
  }

  function markDraftChanged() {
    if (!draftStore) {
      return;
    }

    draftPending = true;
    if (draftTimer) {
      clearTimeout(draftTimer);
    }

    draftTimer = setTimeout(() => {
      draftTimer = null;
      writeDraft();
    }, 300);
  }

  function flushDraft() {
    if (!draftPending) {
      return;
    }

    if (draftTimer) {
      clearTimeout(draftTimer);
      draftTimer = null;
    }

    writeDraft();
  }

  function clearDraft() {
    if (draftTimer) {
      clearTimeout(draftTimer);
      draftTimer = null;
    }

    draftPending = false;
    if (draftStore) {
      draftStore.clear();
    }
  }

  function restoreDraft() {
    if (!draftStore) {
      return false;
    }

    const draft = draftStore.load();
    if (!draft) {
      return false;
    }

    hydrateJobState(draft.data);
    jobNameInput.value = draft.name || "";
    currentJobId = draft.currentJobId && savedJobs.some((job) => job.id === draft.currentJobId)
      ? draft.currentJobId
      : null;
    return true;
  }

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
        <input class="section-name" type="text" data-field="name" placeholder="Removal name or address (optional)" aria-label="Removal name">
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

      <div class="dimension-fields">
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
      </div>

      <div class="fields one swell-row">
        <label class="field">
          <span>Apply swell</span>
          <span class="check-row">
            <input type="checkbox" data-field="swellEnabled">
            <input type="number" inputmode="decimal" step="any" data-field="swellPercent" value="5" aria-label="Swell percent">
            <span class="muted small">%</span>
          </span>
        </label>
      </div>

      <div class="section-foot">
        <span class="chip" data-role="section-result">No volume</span>
        <span class="small muted" data-role="section-formula"></span>
      </div>
    `;
  }

  function deliveryItemMarkup() {
    return `
      <div class="delivery-top">
        <input class="section-name" type="text" data-delivery-field="materialName" placeholder="Material name or type (optional)" aria-label="Material name">
        <div class="section-actions">
          <button class="icon-btn" type="button" data-action="duplicate-delivery">Duplicate</button>
          <button class="icon-btn" type="button" data-action="remove-delivery">Remove</button>
        </div>
      </div>

      <div class="fields one">
        <label class="field">
          <span>Amount method</span>
          <select data-delivery-field="amountBasis">
            <option value="volume">Direct volume</option>
            <option value="weight">Direct weight</option>
            <option value="area">Area × depth</option>
          </select>
        </label>
      </div>

      <div class="fields one" data-delivery-amount-fields>
        <label class="field">
          <span>Amount to deliver</span>
          <span class="with-unit">
            <input type="number" inputmode="decimal" step="any" data-delivery-field="amount" placeholder="0">
            <span class="unit" data-role="amount-unit">m³</span>
          </span>
        </label>
      </div>

      <div class="fields three" data-delivery-area-fields hidden>
        <label class="field">
          <span>Width</span>
          <span class="with-unit">
            <input type="number" inputmode="decimal" step="any" data-delivery-field="width" placeholder="0">
            <select data-delivery-field="widthUnit" aria-label="Delivery width unit">${unitOptions(["m", "cm", "mm"])}</select>
          </span>
        </label>
        <label class="field">
          <span>Length</span>
          <span class="with-unit">
            <input type="number" inputmode="decimal" step="any" data-delivery-field="length" placeholder="0">
            <select data-delivery-field="lengthUnit" aria-label="Delivery length unit">${unitOptions(["m", "cm", "mm"])}</select>
          </span>
        </label>
        <label class="field">
          <span>Depth</span>
          <span class="with-unit">
            <input type="number" inputmode="decimal" step="any" data-delivery-field="depth" placeholder="0">
            <select data-delivery-field="depthUnit" aria-label="Delivery depth unit">${unitOptions(["mm", "cm", "m"])}</select>
          </span>
        </label>
      </div>

      <div class="fields price-settling-row">
        <label class="field">
          <span>Material price</span>
          <span class="with-unit">
            <input type="number" inputmode="decimal" step="any" data-delivery-field="price" placeholder="0">
            <span class="unit" data-role="price-unit">/ m³</span>
          </span>
        </label>
        <div class="settling-field" data-delivery-settling-fields>
          <label class="field" data-delivery-settling-percent-field>
            <span>Settling allowance</span>
            <span class="with-unit">
              <input type="number" inputmode="decimal" step="any" data-delivery-field="settlingPercent" value="10">
              <span class="unit">%</span>
            </span>
          </label>
          <label class="field" data-delivery-add-settling-field>
            <span>Apply to direct volume</span>
            <span class="check-row">
              <input type="checkbox" data-delivery-field="addSettling">
              <span>Yes</span>
            </span>
          </label>
        </div>
      </div>

      <div class="fields">
        <label class="field">
          <span>Delivery pricing</span>
          <select data-delivery-field="deliveryMode">
            <option value="custom">Custom fee per truck</option>
            <option value="truckRate">Use main truck rate</option>
            <option value="included">Included in material price</option>
          </select>
        </label>
        <label class="field" data-delivery-custom-fee-field hidden>
          <span>Custom fee per truck</span>
          <span class="with-unit">
            <input type="number" inputmode="decimal" step="any" data-delivery-field="customFee" placeholder="0">
            <span class="unit">$</span>
          </span>
        </label>
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

    const swellPercent = card.querySelector('[data-field="swellPercent"]');
    if (swellPercent) {
      swellPercent.disabled = !section.swellEnabled;
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
    sectionCountEl.textContent = `${count} removal${count === 1 ? "" : "s"}`;
    update();
  }

  function buildCalcSection(section) {
    const source = section || {};
    const shape = source.shape || "rectangle";
    const item = {
      name: source.name,
      shape,
      swellEnabled: source.swellEnabled,
      swellPercent: source.swellPercent,
    };

    if (shape === "manualVolume") {
      item.manualVolume = source.manualVolume;
    } else if (shape === "manualArea") {
      item.area = source.area;
      item.depth = source.depth;
      item.depthUnit = source.depthUnit;
    } else if (shape === "unevenEnds") {
      item.width = source.unevenWidth;
      item.widthUnit = source.unevenWidthUnit;
      item.leftLength = source.leftLength;
      item.leftLengthUnit = source.leftLengthUnit;
      item.rightLength = source.rightLength;
      item.rightLengthUnit = source.rightLengthUnit;
      item.depth = source.depth;
      item.depthUnit = source.depthUnit;
    } else {
      item.width = source.width;
      item.widthUnit = source.widthUnit;
      item.length = source.length;
      item.lengthUnit = source.lengthUnit;
      item.depth = source.depth;
      item.depthUnit = source.depthUnit;
    }

    return item;
  }

  function buildJobFromData(data) {
    const source = data || {};
    const sections = Array.isArray(source.sections) ? source.sections : [];
    const truck = source.truck || createTruck();

    return {
      removalsEnabled: source.removalsEnabled !== false,
      sections: sections.map(buildCalcSection),
      truck: {
        capacityMode: truck.capacityMode || "volume",
        volumeCapacity: truck.volumeCapacity,
        weightCapacity: truck.weightCapacity,
        fuelConsumption: truck.fuelConsumption,
      },
      swell: source.swell,
      pricePerTruck: truck.pricePerTruck,
      gst: source.gst || { mode: "none", rate: 0 },
      deliveries: Array.isArray(source.deliveries)
        ? (source.deliveryEnabled === false ? [] : source.deliveries)
        : source.delivery && source.delivery.enabled
          ? [source.delivery]
          : [],
      travel: source.travel || { enabled: false },
    };
  }

  function buildJob() {
    return buildJobFromData(state);
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
      if (resultSection.looseVolume !== resultSection.volume) {
        text += ` · ${format(resultSection.looseVolume)} m³ loose`;
      }
      if (resultSection.weight !== null) {
        text += ` · ${format(resultSection.weight)} t`;
      }
      chip.textContent = text;
      chip.classList.remove("warn");
    } else {
      let text = `${format(resultSection.area)} m² · ${format(resultSection.volume)} m³`;
      if (resultSection.looseVolume !== resultSection.volume) {
        text += ` · ${format(resultSection.looseVolume)} m³ loose`;
      }
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
    return `${delivery.items.length} materials`;
  }

  function deliverySummaryAmount(delivery) {
    if (delivery.deliveredVolume !== null) {
      return `${format(delivery.deliveredVolume)} m³ of material`;
    }
    if (delivery.weight !== null) {
      return `${format(delivery.weight)} t of material`;
    }
    return `${delivery.items.length} materials`;
  }

  function materialHasAmount(delivery) {
    return delivery.items.some(
      (item) => item.deliveredVolume !== null || item.weight !== null
    );
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

    if (!state.removalsEnabled) {
      appendMathRow("Removals disabled.");
    } else if (result.sections.length === 0) {
      appendMathRow("No removal sections.");
    } else {
      for (const section of result.sections) {
        const details = section.area === null
          ? `${format(section.volume)} m³`
          : `${format(section.area)} m² · ${format(section.volume)} m³`;
        const loose = section.looseVolume !== section.volume
          ? ` → ${format(section.looseVolume)} m³ loose`
          : "";
        appendMathRow(`${section.name}: ${details}${loose}`);
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
      for (const item of delivery.items) {
        appendMathRow(`Material: ${item.materialName || "material"}`);

        if (item.finishedVolume !== null) {
          appendMathRow(`Finished fill volume: ${format(item.finishedVolume)} m³`);
        }

        if (item.deliveredVolume !== null) {
          appendMathRow(`Delivered volume: ${format(item.deliveredVolume)} m³`);
        }

        if (item.weight !== null) {
          appendMathRow(`Material weight: ${format(item.weight)} t`);
        }

        appendMathRow(`Material cost: ${money(item.materialCost)}`);
        appendMathRow(`Delivery trucks: ${format(item.trucks.exact)} exact · ${item.trucks.rounded} rounded`);
        appendMathRow(`Delivery trips: ${money(item.tripCost.exact)} exact · ${money(item.tripCost.rounded)} rounded`);
        appendMathRow(`Delivery total: ${money(item.total.exact)} exact · ${money(item.total.rounded)} rounded`);
      }

      if (delivery.items.length > 1) {
        appendMathRow(`Materials total: ${money(delivery.total.exact)} exact · ${money(delivery.total.rounded)} rounded`);
      }
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

  function markWarningField(input) {
    if (!input) {
      return;
    }

    const field = input.closest(".field");
    if (field) {
      field.classList.add("warning-field");
    }
    input.setAttribute("aria-invalid", "true");
  }

  function clearWarningHighlights() {
    for (const element of document.querySelectorAll(".warning-card")) {
      element.classList.remove("warning-card");
    }
    for (const element of document.querySelectorAll(".warning-field")) {
      element.classList.remove("warning-field");
    }
    for (const element of document.querySelectorAll('[aria-invalid="true"]')) {
      element.removeAttribute("aria-invalid");
    }
  }

  function applyWarningHighlights(warnings) {
    const truckCard = truckVolumeInput.closest(".card");

    for (const warning of warnings) {
      if (warning.code === "missing-depth" && Number.isInteger(warning.sectionIndex)) {
        const section = state.sections[warning.sectionIndex];
        const card = section
          ? sectionsEl.querySelector(`.section-card[data-section-id="${section.id}"]`)
          : null;
        if (card) {
          card.classList.add("warning-card");
          markWarningField(card.querySelector('[data-field="depth"]'));
        }
        continue;
      }

      if (warning.code === "zero-volume" && Number.isInteger(warning.sectionIndex)) {
        const section = state.sections[warning.sectionIndex];
        const card = section
          ? sectionsEl.querySelector(`.section-card[data-section-id="${section.id}"]`)
          : null;
        if (card) {
          card.classList.add("warning-card");
        }
        continue;
      }

      if (warning.code === "no-sections") {
        removalsCard.classList.add("warning-card");
        continue;
      }

      if (warning.code === "missing-truck-capacity" || warning.code === "material-missing-truck-capacity") {
        if (truckCard) {
          truckCard.classList.add("warning-card");
        }
        markWarningField(truckVolumeInput);
        markWarningField(truckWeightInput);
        continue;
      }

      if (warning.code.startsWith("material-")) {
        const item = state.deliveries[warning.deliveryIndex];
        const card = item
          ? deliveriesContainer.querySelector(`.delivery-item[data-delivery-id="${item.id}"]`)
          : null;
        if (!card) {
          continue;
        }

        card.classList.add("warning-card");
        if (warning.code === "material-missing-amount") {
          if (item.amountBasis === "area") {
            for (const input of card.querySelectorAll("[data-delivery-area-fields] input")) {
              markWarningField(input);
            }
          } else {
            markWarningField(card.querySelector('[data-delivery-field="amount"]'));
          }
        } else if (warning.code === "material-missing-price") {
          markWarningField(card.querySelector('[data-delivery-field="price"]'));
        } else if (warning.code === "material-missing-custom-fee") {
          markWarningField(card.querySelector('[data-delivery-field="customFee"]'));
        }
        continue;
      }

      if (warning.code.startsWith("travel-")) {
        travelCard.classList.add("warning-card");
        if (warning.code === "travel-missing-distance") {
          markWarningField(travelDistanceInput);
        } else if (warning.code === "travel-missing-trips" && !state.travel.useCalculatedTrips) {
          markWarningField(travelManualTripsInput);
        } else if (warning.code === "travel-missing-price-per-km") {
          markWarningField(travelPricePerKmInput);
        } else if (warning.code === "travel-missing-fuel") {
          markWarningField(state.travel.useTruckFuel ? truckFuelInput : travelManualFuelInput);
        } else if (warning.code === "travel-missing-diesel") {
          markWarningField(travelDieselInput);
        }
      }
    }
  }

  function updateResults(result) {
    clearWarningHighlights();
    const totals = result.totals;
    const delivery = totals.delivery;
    const travel = totals.travel;
    const combined = totals.combined;
    const showRounded = state.showRounded;
    const removalsEnabled = state.removalsEnabled;
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

    volumeRow.hidden = !removalsEnabled;
    spoilTrucksRow.hidden = !removalsEnabled;
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
      const materialNames = delivery.items
        .map((item) => item.materialName)
        .filter(Boolean);

      materialLabel.textContent = delivery.items.length === 1 && materialNames[0]
        ? `Material to bring in: ${materialNames[0]}`
        : `Materials to bring in (${delivery.items.length})`;
      materialVolumeOutput.textContent = materialAmountText(delivery);

      if (!materialHasAmount(delivery)) {
        materialSubOutput.textContent = "Enter the amount of material.";
      } else if (delivery.materialCost <= 0) {
        materialSubOutput.textContent = "Enter the material price.";
      } else {
        const parts = [truckValueText(delivery.trucks, showRounded)];
        if (showRounded && delivery.trucks.rounded !== delivery.trucks.exact) {
          parts.push(`${format(delivery.trucks.exact)} exact`);
        }
        if (delivery.items.length === 1) {
          if (delivery.trucks.limit === "volume") {
            parts.push("volume-limited");
          } else if (delivery.trucks.limit === "weight") {
            parts.push("weight-limited");
          }
        } else {
          parts.push(`${delivery.items.length} materials`);
        }
        parts.push(moneyPair(delivery.total.rounded, delivery.total.exact, showRounded));
        materialSubOutput.textContent = parts.join(" · ");
      }

      combinedTrucksOutput.textContent = truckValueText(combined.trucks, showRounded);

      const combinedParts = [
        travel
          ? (removalsEnabled ? "Spoil, delivery and fuel" : "Delivery and fuel")
          : (removalsEnabled ? "Spoil and delivery trips" : "Delivery trips"),
      ];
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
    mobileEstimateTrucksOutput.textContent = truckValueText(finalTrucks, showRounded);
    mobileEstimatePriceOutput.textContent = priceOutput.textContent;

    if (delivery) {
      if (!materialHasAmount(delivery)) {
        summaryOutput.textContent = !removalsEnabled
          ? "Add the material amount and price to see an estimate."
          : totals.volumeInGround > 0
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

        summary += `Bring in ${deliverySummaryAmount(delivery)}. `;
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
    } else if (!removalsEnabled) {
      summaryOutput.textContent = "Add materials to see an estimate.";
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

    applyWarningHighlights(result.warnings);
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

  function truckValuesMatchPreset(preset) {
    return state.truck.volumeCapacity === preset.volumeCapacity
      && state.truck.weightCapacity === preset.weightCapacity
      && state.truck.pricePerTruck === preset.pricePerTruck
      && state.truck.fuelConsumption === preset.fuelConsumption;
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

  async function saveTruckPreset() {
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
    const saved = storageIsShared
      ? await truckStore.save({ presets: truckPresets, selectedId: selectedTruckPresetId })
      : truckStore.save({ presets: truckPresets, selectedId: selectedTruckPresetId });
    closePresetSaveForm();
    renderTruckPresetOptions();
    updateTruckPresetStatus();
    setPresetWarning(saved ? "" : "Presets could not be saved.");
    showToast(
      saved ? "Truck preset saved." : "Presets could not be saved.",
      { tone: saved ? "success" : "error" }
    );
  }

  async function deleteTruckPreset() {
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
    const saved = storageIsShared
      ? await truckStore.save({ presets: truckPresets, selectedId: null })
      : truckStore.save({ presets: truckPresets, selectedId: null });
    renderTruckPresetOptions();
    updateTruckPresetStatus();
    setPresetWarning(saved ? "" : "Presets could not be saved.");
    showToast(
      saved ? "Truck preset deleted." : "Presets could not be saved.",
      { tone: saved ? "success" : "error" }
    );
  }

  async function handleTruckPresetChange() {
    const id = truckPresetSelect.value;

    if (!id) {
      selectedTruckPresetId = null;
      truckDirty = false;
      deleteTruckPresetButton.disabled = true;
      const saved = storageIsShared
        ? await truckStore.save({ presets: truckPresets, selectedId: null })
        : truckStore.save({ presets: truckPresets, selectedId: null });
      setPresetWarning(saved ? "" : "Presets could not be saved.");
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
    const saved = storageIsShared
      ? await truckStore.save({ presets: truckPresets, selectedId: selectedTruckPresetId })
      : truckStore.save({ presets: truckPresets, selectedId: selectedTruckPresetId });
    setPresetWarning(saved ? "" : "Presets could not be saved.");
    syncStaticControls();
    renderTruckPresetOptions();
    updateTruckPresetStatus();
    update();
  }

  async function initTruckPresets() {
    const stored = storageIsShared ? await truckStore.load() : truckStore.load();
    truckPresets = stored.presets;
    selectedTruckPresetId = stored.selectedId;
    const preset = getSelectedTruckPreset();

    if (preset) {
      applyPresetToState(preset);
    }

    renderTruckPresetOptions();
    updateTruckPresetStatus();
  }

  function setJobStatus(text, warn) {
    jobStatusOutput.textContent = text;
    jobStatusOutput.classList.toggle("warn", Boolean(warn));
  }

  function setJobDirty(dirty) {
    jobDirty = Boolean(dirty);
    jobDirtyPill.hidden = !jobDirty;
  }

  function markJobChanged() {
    setJobDirty(true);
    markDraftChanged();
  }

  function showToast(message, options) {
    const settings = options || {};
    const toast = document.createElement("div");
    toast.className = "toast";
    if (settings.tone === "error") {
      toast.classList.add("error");
    }

    const text = document.createElement("span");
    text.className = "toast-message";
    text.textContent = message;
    toast.appendChild(text);

    let dismissed = false;
    let timer = null;

    function dismiss() {
      if (dismissed) {
        return;
      }

      dismissed = true;
      if (timer) {
        clearTimeout(timer);
      }
      toast.classList.remove("visible");
      toast.classList.add("leaving");
      setTimeout(() => toast.remove(), 220);
    }

    if (settings.actionLabel && typeof settings.onAction === "function") {
      const action = document.createElement("button");
      action.type = "button";
      action.className = "toast-action";
      action.textContent = settings.actionLabel;
      action.addEventListener("click", () => {
        settings.onAction();
        dismiss();
      });
      toast.appendChild(action);
    }

    toastsEl.appendChild(toast);
    while (toastsEl.children.length > 3) {
      toastsEl.firstElementChild.remove();
    }

    requestAnimationFrame(() => toast.classList.add("visible"));
    const duration = Number.isFinite(settings.duration) ? settings.duration : 4000;
    timer = setTimeout(dismiss, duration);
    return dismiss;
  }

  async function copyText(text) {
    let copied = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        copied = false;
      }
    }

    const textarea = document.createElement("textarea");
    textarea.className = "clipboard-fallback";
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }

    textarea.remove();
    return copied;
  }

  async function copySummary() {
    const name = jobNameInput.value.trim() || "Untitled job";
    const text = [
      name,
      `${mobileEstimateTrucksOutput.textContent} · ${priceOutput.textContent}`,
      summaryOutput.textContent.trim(),
    ].join("\n");
    const copied = await copyText(text);
    showToast(
      copied ? "Summary copied." : "Could not copy the summary.",
      { tone: copied ? "success" : "error" }
    );
  }

  function formatDateTime(date) {
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function formatSavedAt(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Unknown date" : formatDateTime(date);
  }

  function serializeJobState() {
    return {
      removalsEnabled: state.removalsEnabled,
      sections: state.sections.map((section) => {
        const copy = { ...section };
        delete copy.id;
        return copy;
      }),
      truck: { ...state.truck },
      gst: { ...state.gst },
      deliveries: state.deliveries.map(({ id, ...item }) => ({ ...item })),
      deliveryEnabled: state.deliveryEnabled,
      travel: { ...state.travel },
      showRounded: state.showRounded,
    };
  }

  function hydrateJobState(data) {
    const source = data || {};
    const savedSections = Array.isArray(source.sections) ? source.sections : [];

    const fallbackSwell = source.swell || { enabled: false, percent: "5" };
    state.removalsEnabled = source.removalsEnabled !== false;
    state.sections = savedSections.length > 0
      ? savedSections.map((saved) => {
        const fields = { ...(saved || {}) };
        delete fields.id;
        if (fields.swellEnabled === undefined) {
          fields.swellEnabled = Boolean(fallbackSwell.enabled);
        }
        if (fields.swellPercent === undefined) {
          fields.swellPercent = fallbackSwell.percent ?? "5";
        }
        return createSection(fields);
      })
      : [createSection()];

    state.truck = {
      ...createTruck(),
      ...(source.truck || {}),
      capacityMode: "volume",
    };
    state.gst = {
      mode: "none",
      rate: "10",
      ...(source.gst || {}),
    };
    if (Array.isArray(source.deliveries)) {
      state.deliveries = source.deliveries.map((saved) => {
        const fields = { ...(saved || {}) };
        delete fields.id;
        delete fields.enabled;
        delete fields.density;
        return createDeliveryItem(fields);
      });
      state.deliveryEnabled = source.deliveryEnabled !== false;
    } else if (source.delivery) {
      const fields = { ...source.delivery };
      delete fields.id;
      delete fields.enabled;
      delete fields.density;
      state.deliveries = [createDeliveryItem(fields)];
      state.deliveryEnabled = source.delivery.enabled === true;
    } else {
      state.deliveries = [createDeliveryItem()];
      state.deliveryEnabled = false;
    }

    if (state.deliveries.length === 0) {
      state.deliveries = [createDeliveryItem()];
    }
    state.travel = {
      ...createTravel(),
      ...(source.travel || {}),
    };
    state.showRounded = source.showRounded !== false;

    selectedTruckPresetId = null;
    truckDirty = false;
  }

  function makeJobSummary() {
    const result = Calc.calculateJob(buildJob());
    const hasExtras = Boolean(result.totals.delivery || result.totals.travel);
    const final = hasExtras ? result.totals.combined : result.totals;
    const count = final.trucks.rounded;
    return `${format(count)} ${truckWord(count)} · ${money(final.gst.rounded.total)}`;
  }

  async function saveJob() {
    let name = jobNameInput.value.trim();

    if (!name) {
      name = `Job - ${formatDateTime(new Date())}`;
      jobNameInput.value = name;
    }

    if (!currentJobId) {
      currentJobId = createJobId();
    }

    const now = new Date();
    const job = {
      id: currentJobId,
      name,
      savedAt: now.toISOString(),
      summary: makeJobSummary(),
      data: serializeJobState(),
    };

    savedJobs = [job, ...savedJobs.filter((item) => item.id !== job.id)];
    const saved = storageIsShared
      ? await jobStore.save({ jobs: savedJobs })
      : jobStore.save({ jobs: savedJobs });
    const savedLabel = storageIsShared ? "Saved to shared storage" : "Saved locally";

    if (saved) {
      clearDraft();
      setJobDirty(false);
    }

    setJobStatus(
      saved
        ? `${savedLabel} · ${formatDateTime(now)}`
        : "Could not save this job.",
      !saved
    );
    showToast(
      saved
        ? (storageIsShared ? "Job saved to shared storage." : "Job saved locally.")
        : "Could not save this job.",
      { tone: saved ? "success" : "error" }
    );
  }

  function jobSummaryText(job) {
    try {
      const result = Calc.calculateJob(buildJobFromData(job.data));
      const hasExtras = Boolean(result.totals.delivery || result.totals.travel);
      const final = hasExtras ? result.totals.combined : result.totals;
      const count = final.trucks.rounded;
      return `${format(count)} ${truckWord(count)} · ${money(final.gst.rounded.total)}`;
    } catch (error) {
      return job.summary || "No estimate";
    }
  }

  function renderSavedJobs() {
    savedJobsList.innerHTML = "";
    const query = jobSearchQuery.trim().toLowerCase();
    const matchingJobs = query
      ? savedJobs.filter((job) => (
        `${job.name} ${job.summary || ""} ${formatSavedAt(job.savedAt)}`
          .toLowerCase()
          .includes(query)
      ))
      : savedJobs;

    if (savedJobs.length === 0) {
      const empty = document.createElement("div");
      empty.className = "job-empty";
      empty.textContent = "No saved jobs yet.";
      savedJobsList.appendChild(empty);
      return;
    }

    if (matchingJobs.length === 0) {
      const empty = document.createElement("div");
      empty.className = "job-empty";
      empty.textContent = "No jobs match your search.";
      savedJobsList.appendChild(empty);
      return;
    }

    for (const job of matchingJobs) {
      const item = document.createElement("div");
      item.className = "job-item";

      const info = document.createElement("div");
      const name = document.createElement("div");
      name.className = "job-item-name";
      name.textContent = job.name;
      const meta = document.createElement("div");
      meta.className = "job-item-meta";
      meta.textContent = `${formatSavedAt(job.savedAt)} · ${jobSummaryText(job)}`;
      info.appendChild(name);
      info.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "job-item-actions";

      const duplicateButton = document.createElement("button");
      duplicateButton.type = "button";
      duplicateButton.className = "btn small";
      duplicateButton.textContent = "Duplicate";
      duplicateButton.dataset.duplicateJob = job.id;

      const loadButton = document.createElement("button");
      loadButton.type = "button";
      loadButton.className = "btn small";
      loadButton.textContent = "Load";
      loadButton.dataset.loadJob = job.id;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "icon-btn";
      deleteButton.textContent = "Delete";
      deleteButton.dataset.deleteJob = job.id;

      actions.appendChild(duplicateButton);
      actions.appendChild(loadButton);
      actions.appendChild(deleteButton);
      item.appendChild(info);
      item.appendChild(actions);
      savedJobsList.appendChild(item);
    }
  }

  async function refreshSharedData() {
    if (!storageIsShared || refreshingShared) {
      return;
    }

    refreshingShared = true;
    refreshSharedButton.disabled = true;
    jobListStatus.textContent = "Refreshing shared data...";
    const failed = [];
    const results = await Promise.allSettled([
      jobStore.refresh(),
      truckStore.refresh(),
    ]);

    if (results[0].status === "fulfilled") {
      savedJobs = results[0].value.jobs;
    } else {
      failed.push("jobs");
    }

    if (results[1].status === "fulfilled") {
      const previousSelectedId = selectedTruckPresetId;
      truckPresets = results[1].value.presets;

      if (previousSelectedId && truckPresets.some((preset) => preset.id === previousSelectedId)) {
        selectedTruckPresetId = previousSelectedId;
        const preset = getSelectedTruckPreset();
        truckDirty = preset ? !truckValuesMatchPreset(preset) : truckDirty;
      } else if (previousSelectedId) {
        selectedTruckPresetId = null;
        truckDirty = true;
      }

      renderTruckPresetOptions();
      updateTruckPresetStatus();
    } else {
      failed.push("presets");
    }

    renderSavedJobs();
    jobListStatus.textContent = failed.length === 0
      ? "Shared data updated."
      : `Could not refresh ${failed.join(" or ")}. Showing the last loaded data.`;
    refreshingShared = false;
    refreshSharedButton.disabled = false;
  }

  async function openLoadJobs() {
    loadJobsPanel.hidden = false;
    jobListStatus.textContent = "";
    renderSavedJobs();

    if (storageIsShared) {
      await refreshSharedData();
    }
  }

  function closeLoadJobs() {
    loadJobsPanel.hidden = true;
  }

  function loadJob(job) {
    hydrateJobState(job.data);
    jobNameInput.value = job.name;
    currentJobId = job.id;
    renderTruckPresetOptions();
    updateTruckPresetStatus();
    syncStaticControls();
    renderSections();
    markDraftChanged();
    setJobDirty(false);
    setJobStatus(`Loaded · ${job.name}`);
    closeLoadJobs();
  }

  function duplicateJob(job) {
    hydrateJobState(job.data);
    jobNameInput.value = `${job.name} copy`;
    currentJobId = null;
    renderTruckPresetOptions();
    updateTruckPresetStatus();
    syncStaticControls();
    renderSections();
    markJobChanged();
    setJobStatus(`Unsaved copy · ${job.name}`);
    showToast("Created an unsaved copy.");
    closeLoadJobs();
  }

  async function undoDelete() {
    if (!lastDeletedJob) {
      return;
    }

    const deleted = lastDeletedJob;
    lastDeletedJob = null;
    undoToastDismiss = null;
    const index = Math.max(0, Math.min(deleted.index, savedJobs.length));
    savedJobs = [
      ...savedJobs.slice(0, index),
      deleted.job,
      ...savedJobs.slice(index),
    ];
    renderSavedJobs();
    const saved = storageIsShared
      ? await jobStore.save({ jobs: savedJobs })
      : jobStore.save({ jobs: savedJobs });

    if (saved) {
      showToast("Job restored.", { tone: "success" });
    } else {
      showToast("Could not restore the job.", { tone: "error" });
    }
  }

  async function deleteJob(job) {
    const index = savedJobs.findIndex((item) => item.id === job.id);
    if (index === -1) {
      return;
    }

    savedJobs = savedJobs.filter((item) => item.id !== job.id);
    const saved = storageIsShared
      ? await jobStore.save({ jobs: savedJobs })
      : jobStore.save({ jobs: savedJobs });

    if (currentJobId === job.id) {
      currentJobId = null;
      clearDraft();
      setJobDirty(true);
      setJobStatus("Unsaved job");
    }

    renderSavedJobs();

    if (!saved) {
      setJobStatus("Could not save this change.", true);
    }

    lastDeletedJob = { job, index };
    if (undoToastDismiss) {
      undoToastDismiss();
    }
    undoToastDismiss = showToast(`Deleted "${job.name}".`, {
      actionLabel: "Undo",
      duration: 10000,
      onAction: undoDelete,
    });
  }

  async function initJobs() {
    const stored = storageIsShared ? await jobStore.load() : jobStore.load();
    savedJobs = stored.jobs;
    setJobStatus("Unsaved job");
  }

  function setDataStatus(text, warn) {
    dataStatusOutput.textContent = text || "";
    dataStatusOutput.classList.toggle("warn", Boolean(warn));
  }

  function countLabel(count, singular, plural) {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  function exportData() {
    if (typeof Backup === "undefined") {
      setDataStatus("Backup support is unavailable.", true);
      return;
    }

    const backup = Backup.createBackup({
      presets: truckPresets,
      jobs: savedJobs,
    });
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    link.href = url;
    link.download = `quote-assistant-backup-${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setDataStatus(`Exported ${countLabel(savedJobs.length, "job", "jobs")} and ${countLabel(truckPresets.length, "preset", "presets")}.`);
    showToast("Backup exported.");
  }

  async function importDataFile(file) {
    if (typeof Backup === "undefined") {
      setDataStatus("Backup support is unavailable.", true);
      return;
    }

    try {
      const text = await file.text();
      const parsed = Backup.parseBackup(text);
      const mergedPresets = Backup.mergePresets(truckPresets, parsed.presets);
      const mergedJobs = Backup.mergeJobs(savedJobs, parsed.jobs);
      const presetsSaved = storageIsShared
        ? await truckStore.save({ presets: mergedPresets, selectedId: selectedTruckPresetId })
        : truckStore.save({ presets: mergedPresets, selectedId: selectedTruckPresetId });
      const jobsSaved = storageIsShared
        ? await jobStore.save({ jobs: mergedJobs })
        : jobStore.save({ jobs: mergedJobs });

      truckPresets = mergedPresets;
      savedJobs = mergedJobs;

      if (selectedTruckPresetId && parsed.presets.length > 0) {
        truckDirty = true;
      }

      renderTruckPresetOptions();
      updateTruckPresetStatus();

      if (!loadJobsPanel.hidden) {
        renderSavedJobs();
      }

      if (parsed.jobs.length === 0 && parsed.presets.length === 0) {
        setDataStatus("No jobs or presets found in that file.", true);
        showToast("No jobs or presets found in that file.", { tone: "error" });
      } else if (!presetsSaved || !jobsSaved) {
        setDataStatus(
          `Imported ${countLabel(parsed.jobs.length, "job", "jobs")} and ${countLabel(parsed.presets.length, "preset", "presets")}, but could not save everything.`,
          true
        );
        showToast("Imported data, but could not save everything.", { tone: "error" });
      } else {
        setDataStatus(`Imported ${countLabel(parsed.jobs.length, "job", "jobs")} and ${countLabel(parsed.presets.length, "preset", "presets")}.`);
        showToast("Import completed.");
      }
    } catch (error) {
      setDataStatus(error.message || "Could not import that file.", true);
      showToast(error.message || "Could not import that file.", { tone: "error" });
    }
  }

  function syncRemovalsControls() {
    removalsEnabledInput.checked = state.removalsEnabled;
    removalsCard.hidden = !state.removalsEnabled;
  }

  function syncDeliveryItem(card, item) {
    for (const element of card.querySelectorAll("[data-delivery-field]")) {
      const field = element.dataset.deliveryField;
      if (element.type === "checkbox") {
        element.checked = Boolean(item[field]);
      } else {
        element.value = item[field] ?? "";
      }
    }

    applyDeliveryLayout(card, item);
  }

  function applyDeliveryLayout(card, item) {
    const basis = item.amountBasis;
    const isWeight = basis === "weight";
    const isArea = basis === "area";

    card.querySelector("[data-delivery-amount-fields]").hidden = isArea;
    card.querySelector("[data-delivery-area-fields]").hidden = !isArea;
    card.querySelector("[data-delivery-settling-fields]").hidden = isWeight;
    card.querySelector("[data-delivery-settling-percent-field]").hidden = isWeight;
    card.querySelector("[data-delivery-add-settling-field]").hidden = basis !== "volume";
    card.querySelector('[data-role="amount-unit"]').textContent = isWeight ? "t" : "m³";
    card.querySelector('[data-role="price-unit"]').textContent = isWeight ? "/ t" : "/ m³";
    card.querySelector("[data-delivery-custom-fee-field]").hidden = item.deliveryMode !== "custom";
  }

  function renderDeliveries() {
    deliveriesContainer.innerHTML = "";

    deliveryCountEl.textContent = `${state.deliveries.length} material${state.deliveries.length === 1 ? "" : "s"}`;

    state.deliveries.forEach((item) => {
      const card = document.createElement("div");
      card.className = "delivery-item";
      card.dataset.deliveryId = item.id;
      card.innerHTML = deliveryItemMarkup();
      deliveriesContainer.appendChild(card);

      const remove = card.querySelector('[data-action="remove-delivery"]');
      if (remove) {
        remove.disabled = state.deliveries.length <= 1;
      }

      syncDeliveryItem(card, item);
    });
  }

  function syncDeliveryControls() {
    deliveryEnabledInput.checked = state.deliveryEnabled;
    deliveryCard.hidden = !state.deliveryEnabled;
    renderDeliveries();
  }

  function handleDeliveryInput(event) {
    const card = event.target.closest(".delivery-item");
    const field = event.target.dataset.deliveryField;

    if (!card || !field) {
      return;
    }

    const item = state.deliveries.find((entry) => entry.id === card.dataset.deliveryId);
    if (!item) {
      return;
    }

    item[field] = event.target.type === "checkbox"
      ? event.target.checked
      : event.target.value;

    if (field === "amountBasis" || field === "deliveryMode") {
      applyDeliveryLayout(card, item);
    }

    update();
  }

  function handleDeliveryAction(event) {
    const duplicate = event.target.closest('[data-action="duplicate-delivery"]');
    if (duplicate) {
      const card = duplicate.closest(".delivery-item");
      if (!card) {
        return;
      }

      const index = state.deliveries.findIndex(
        (item) => item.id === card.dataset.deliveryId
      );
      if (index === -1) {
        return;
      }

      const original = state.deliveries[index];
      state.deliveries.splice(index + 1, 0, {
        ...original,
        id: createDeliveryId(),
        materialName: original.materialName ? `${original.materialName} copy` : "",
      });
      renderDeliveries();
      update();
      markJobChanged();
      return;
    }

    const button = event.target.closest('[data-action="remove-delivery"]');
    if (!button) {
      return;
    }

    const card = button.closest(".delivery-item");
    if (!card || state.deliveries.length <= 1) {
      return;
    }

    state.deliveries = state.deliveries.filter((item) => item.id !== card.dataset.deliveryId);
    renderDeliveries();
    update();
    markJobChanged();
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
    roundUpInput.checked = state.showRounded;
    gstModeInput.value = state.gst.mode;
    gstRateInput.value = state.gst.rate;
    syncRemovalsControls();
    syncDeliveryControls();
    syncTravelControls();
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
      markJobChanged();
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
      markJobChanged();
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

  removalsEnabledInput.addEventListener("change", () => {
    state.removalsEnabled = removalsEnabledInput.checked;
    syncRemovalsControls();
    update();
  });

  deliveryEnabledInput.addEventListener("change", () => {
    state.deliveryEnabled = deliveryEnabledInput.checked;
    syncDeliveryControls();
    update();
  });

  deliveriesContainer.addEventListener("input", handleDeliveryInput);
  deliveriesContainer.addEventListener("change", handleDeliveryInput);
  deliveriesContainer.addEventListener("click", handleDeliveryAction);

  addDeliveryButton.addEventListener("click", () => {
    state.deliveries.push(createDeliveryItem());
    syncDeliveryControls();
    update();
    markJobChanged();
    const last = deliveriesContainer.lastElementChild;
    if (last) {
      last.scrollIntoView({ behavior: "smooth", block: "center" });
      const nameInput = last.querySelector('[data-delivery-field="materialName"]');
      if (nameInput) {
        nameInput.focus();
      }
    }
  });

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

  exportDataButton.addEventListener("click", exportData);
  importDataButton.addEventListener("click", () => importFileInput.click());
  importFileInput.addEventListener("change", async () => {
    const file = importFileInput.files[0];
    if (!file) {
      return;
    }

    await importDataFile(file);
    importFileInput.value = "";
  });

  saveJobButton.addEventListener("click", saveJob);
  copySummaryButton.addEventListener("click", copySummary);
  mobileEstimateButton.addEventListener("click", () => {
    resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  loadJobsButton.addEventListener("click", openLoadJobs);
  closeLoadJobsButton.addEventListener("click", closeLoadJobs);
  refreshSharedButton.addEventListener("click", refreshSharedData);
  jobSearchInput.addEventListener("input", () => {
    jobSearchQuery = jobSearchInput.value;
    renderSavedJobs();
  });

  document.addEventListener("focusin", (event) => {
    if (event.target.matches('input[type="number"]')) {
      event.target.select();
    }
  });

  document.addEventListener("input", (event) => {
    if (
      event.target.closest("#load-jobs-panel")
      || event.target.id === "preset-name"
      || event.target.id === "import-file"
    ) {
      return;
    }
    markJobChanged();
  }, true);
  document.addEventListener("change", (event) => {
    if (
      event.target.closest("#load-jobs-panel")
      || event.target.id === "preset-name"
      || event.target.id === "import-file"
    ) {
      return;
    }
    markJobChanged();
  }, true);
  window.addEventListener("beforeunload", flushDraft);

  loadJobsPanel.addEventListener("click", (event) => {
    if (event.target === loadJobsPanel) {
      closeLoadJobs();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !loadJobsPanel.hidden) {
      closeLoadJobs();
    }
  });

  savedJobsList.addEventListener("click", (event) => {
    const duplicateButton = event.target.closest("[data-duplicate-job]");
    if (duplicateButton) {
      const job = savedJobs.find((item) => item.id === duplicateButton.dataset.duplicateJob);
      if (job) {
        duplicateJob(job);
      }
      return;
    }

    const loadButton = event.target.closest("[data-load-job]");
    if (loadButton) {
      const job = savedJobs.find((item) => item.id === loadButton.dataset.loadJob);
      if (job) {
        loadJob(job);
      }
      return;
    }

    const deleteButton = event.target.closest("[data-delete-job]");
    if (deleteButton) {
      const job = savedJobs.find((item) => item.id === deleteButton.dataset.deleteJob);
      if (job) {
        deleteJob(job);
      }
    }
  });

  addSectionButton.addEventListener("click", () => {
    state.sections.push(createSection());
    renderSections();
    markJobChanged();
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
    clearDraft();
    setJobDirty(false);
    state.removalsEnabled = true;
    state.sections = [createSection()];
    state.deliveries = [createDeliveryItem()];
    state.deliveryEnabled = false;
    state.travel = createTravel();
    currentJobId = null;
    jobNameInput.value = "";
    syncRemovalsControls();
    syncDeliveryControls();
    syncTravelControls();
    renderSections();
    setJobStatus("Unsaved job");
  });

  function setupMobileEstimateObserver() {
    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const visible = Boolean(entries[0] && entries[0].isIntersecting);
      mobileEstimateButton.classList.toggle("is-hidden", visible);
      toastsEl.classList.toggle("with-estimate", !visible);
      mobileEstimateButton.tabIndex = visible ? -1 : 0;
      mobileEstimateButton.setAttribute("aria-hidden", String(visible));
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -72px 0px",
    });

    observer.observe(resultsEl);
  }

  async function init() {
    const stores = await detectStores();
    truckStore = stores.truckStore;
    jobStore = stores.jobStore;
    updateStorageLabels();
    await initJobs();
    await initTruckPresets();
    const restored = restoreDraft();
    syncStaticControls();
    renderSections();

    if (restored) {
      renderTruckPresetOptions();
      updateTruckPresetStatus();
      setJobStatus("Draft restored");
    }
    setJobDirty(restored);

    setupMobileEstimateObserver();
  }

  init();
})();
