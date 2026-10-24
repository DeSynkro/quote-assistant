(function () {
  "use strict";

  const sectionsEl = document.getElementById("sections");
  const sectionCountEl = document.getElementById("section-count");
  const addSectionButton = document.getElementById("add-section");
  const newJobButton = document.getElementById("new-job");
  const capacityModeEl = document.getElementById("capacity-mode");
  const capacityButtons = Array.from(capacityModeEl.querySelectorAll("[data-mode]"));
  const truckVolumeInput = document.getElementById("truck-volume");
  const truckWeightInput = document.getElementById("truck-weight");
  const truckPriceInput = document.getElementById("truck-price");
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
      density: "",
    }, overrides);
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
    },
    swell: {
      enabled: false,
      percent: "30",
    },
    gst: {
      mode: "none",
      rate: "10",
    },
    showRounded: true,
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

      <div class="fields one">
        <label class="field">
          <span>Material density (optional)</span>
          <span class="with-unit">
            <input type="number" inputmode="decimal" step="any" data-field="density" placeholder="Leave blank for volume only">
            <span class="unit">t/m³</span>
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

      const density = Number(section.density);
      if (Number.isFinite(density) && density > 0) {
        item.material = { looseDensity: density };
      }

      return item;
    });

    return {
      sections,
      truck: {
        capacityMode: state.truck.capacityMode,
        volumeCapacity: state.truck.volumeCapacity,
        weightCapacity: state.truck.weightCapacity,
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

  function updateMaths(result) {
    const totals = result.totals;
    mathsOutput.innerHTML = "";

    if (result.sections.length === 0) {
      appendMathRow("No sections yet.");
      return;
    }

    for (const section of result.sections) {
      const details = section.area === null
        ? `${format(section.volume)} m³`
        : `${format(section.area)} m² · ${format(section.volume)} m³`;
      appendMathRow(`${section.name}: ${details}`);
    }

    appendMathRow(`Total in ground: ${format(totals.volumeInGround)} m³`);
    appendMathRow(`Loose after swell: ${format(totals.volumeLoose)} m³`);

    if (totals.weight !== null) {
      appendMathRow(`Weight: ${format(totals.weight)} t`);
    }

    appendMathRow(`Trucks: ${format(totals.trucks.exact)} exact · ${totals.trucks.rounded} rounded`);
    appendMathRow(`Price: ${money(totals.price.exact)} exact · ${money(totals.price.rounded)} rounded`);
    appendMathRow(`Charge: ${money(totals.gst.exact.total)} exact · ${money(totals.gst.rounded.total)} rounded`);

    if (state.gst.mode !== "none") {
      appendMathRow(`GST: ${money(totals.gst.exact.gst)} exact · ${money(totals.gst.rounded.gst)} rounded`);
    }
  }

  function updateResults(result) {
    const totals = result.totals;
    const trucks = totals.trucks;
    const gstExact = totals.gst.exact;
    const gstRounded = totals.gst.rounded;
    const showRounded = state.showRounded;

    volumeOutput.textContent = `${format(totals.volumeInGround)} m³`;

    let volumeSub = `${format(totals.volumeLoose)} m³ loose`;
    if (totals.weight !== null) {
      volumeSub += ` · ${format(totals.weight)} t`;
    } else if (state.truck.capacityMode !== "volume") {
      volumeSub += " · weight unknown";
    }
    volumeSubOutput.textContent = volumeSub;

    let truckText = `${format(trucks.exact)} trucks`;
    if (showRounded && trucks.rounded !== trucks.exact) {
      truckText += ` (${trucks.rounded} rounded)`;
    }
    trucksOutput.textContent = truckText;

    if (trucks.limit === "volume") {
      limitOutput.textContent = "Limited by volume";
    } else if (trucks.limit === "weight") {
      limitOutput.textContent = "Limited by weight";
    } else if (totals.volumeInGround <= 0) {
      limitOutput.textContent = "Add valid dimensions";
    } else if (state.truck.capacityMode === "weight" && totals.weight === null) {
      limitOutput.textContent = "Weight unknown";
    } else {
      limitOutput.textContent = "Add a truck capacity";
    }

    priceOutput.textContent = money(gstExact.total);

    const gstAmount = showRounded ? gstRounded.gst : gstExact.gst;
    let gstText = "No GST";
    if (state.gst.mode === "add") {
      gstText = `GST ${display(state.gst.rate)}%: ${money(gstAmount)}`;
    } else if (state.gst.mode === "included") {
      gstText = `Includes ${money(gstAmount)} GST`;
    }

    priceSubOutput.textContent = showRounded
      ? `Rounded: ${money(gstRounded.total)} · ${gstText}`
      : gstText;

    if (totals.volumeInGround <= 0) {
      summaryOutput.textContent = "Add valid job dimensions to see an estimate.";
    } else if (trucks.exact <= 0) {
      summaryOutput.textContent = state.truck.capacityMode === "weight" && totals.weight === null
        ? "Add a material density or use volume capacity to estimate truck loads."
        : "Add a truck capacity and price to see an estimate.";
    } else {
      const charge = money(showRounded ? gstRounded.total : gstExact.total);
      let summary = `Spoil fits in ${format(trucks.exact)} trucks`;
      if (showRounded && trucks.rounded !== trucks.exact) {
        summary += ` (round up to ${trucks.rounded})`;
      }
      summary += `. Estimated charge ${charge}.`;
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

  function syncCapacityButtons() {
    for (const button of capacityButtons) {
      const active = button.dataset.mode === state.truck.capacityMode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    }
  }

  function syncStaticControls() {
    truckVolumeInput.value = state.truck.volumeCapacity;
    truckWeightInput.value = state.truck.weightCapacity;
    truckPriceInput.value = state.truck.pricePerTruck;
    swellEnabledInput.checked = state.swell.enabled;
    swellPercentInput.value = state.swell.percent;
    roundUpInput.checked = state.showRounded;
    gstModeInput.value = state.gst.mode;
    gstRateInput.value = state.gst.rate;
    syncCapacityButtons();
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

  capacityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.truck.capacityMode = button.dataset.mode;
      syncCapacityButtons();
      update();
    });
  });

  truckVolumeInput.addEventListener("input", () => {
    state.truck.volumeCapacity = truckVolumeInput.value;
    update();
  });

  truckWeightInput.addEventListener("input", () => {
    state.truck.weightCapacity = truckWeightInput.value;
    update();
  });

  truckPriceInput.addEventListener("input", () => {
    state.truck.pricePerTruck = truckPriceInput.value;
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
    renderSections();
  });

  syncStaticControls();
  renderSections();
})();
