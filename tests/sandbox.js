(function () {
  "use strict";

  const modeButtons = Array.from(document.querySelectorAll("[data-mode]"));
  const dimensions = document.getElementById("sandbox-dimensions");
  const depthFields = document.getElementById("sandbox-depth-fields");
  const assumedFields = document.getElementById("sandbox-assumed-fields");
  const manualFields = document.getElementById("sandbox-manual-fields");
  const widthInput = document.getElementById("sandbox-width");
  const widthUnit = document.getElementById("sandbox-width-unit");
  const lengthInput = document.getElementById("sandbox-length");
  const lengthUnit = document.getElementById("sandbox-length-unit");
  const depthInput = document.getElementById("sandbox-depth");
  const depthUnit = document.getElementById("sandbox-depth-unit");
  const assumedInput = document.getElementById("sandbox-assumed-depth");
  const assumedUnit = document.getElementById("sandbox-assumed-depth-unit");
  const manualInput = document.getElementById("sandbox-manual-volume");
  const volumeOutput = document.getElementById("sandbox-volume");
  const sourceOutput = document.getElementById("sandbox-source");
  const formulaOutput = document.getElementById("sandbox-formula");
  const swellEnabled = document.getElementById("sandbox-swell-enabled");
  const swellPercent = document.getElementById("sandbox-swell");
  const capacityMode = document.getElementById("sandbox-capacity-mode");
  const truckVolume = document.getElementById("sandbox-truck-volume");
  const truckWeight = document.getElementById("sandbox-truck-weight");
  const loadWeight = document.getElementById("sandbox-load-weight");
  const trucksOutput = document.getElementById("sandbox-trucks");
  const limitOutput = document.getElementById("sandbox-limit");
  const truckFormulaOutput = document.getElementById("sandbox-truck-formula");

  let mode = "measured";

  function format(value) {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 3,
    }).format(value);
  }

  function display(value) {
    const number = Number(value);
    if (value === "" || !Number.isFinite(number)) {
      return "?";
    }
    return format(number);
  }

  function buildSection() {
    if (mode === "manual") {
      return {
        mode,
        manualVolume: manualInput.value,
      };
    }

    const section = {
      mode,
      width: widthInput.value,
      widthUnit: widthUnit.value,
      length: lengthInput.value,
      lengthUnit: lengthUnit.value,
    };

    if (mode === "assumed") {
      section.assumedDepth = assumedInput.value;
      section.assumedDepthUnit = assumedUnit.value;
    } else {
      section.depth = depthInput.value;
      section.depthUnit = depthUnit.value;
    }

    return section;
  }

  function buildFormula(section, result) {
    if (mode === "manual") {
      return `Manual volume = ${format(result.volume)} m³`;
    }

    const depth = mode === "assumed"
      ? `${display(assumedInput.value)} ${assumedUnit.value} assumed`
      : `${display(depthInput.value)} ${depthUnit.value}`;

    return `${display(widthInput.value)} ${widthUnit.value} × ${display(lengthInput.value)} ${lengthUnit.value} × ${depth} = ${format(result.volume)} m³`;
  }

  function buildTruckFormula(volume, weight, result) {
    const parts = [];

    if (result.byVolume !== null) {
      parts.push(`${format(volume)} m³ ÷ ${display(truckVolume.value)} m³ = ${format(result.byVolume)}`);
    }

    if (result.byWeight !== null) {
      parts.push(`${format(weight)} t ÷ ${display(truckWeight.value)} t = ${format(result.byWeight)}`);
    }

    return parts.length > 0
      ? parts.join(" · ")
      : "Add a truck capacity and load details";
  }

  function update() {
    const section = buildSection();
    const result = Calc.sectionVolume(section);
    const looseVolume = Calc.applySwell(
      result.volume,
      swellEnabled.checked,
      swellPercent.value
    );
    const rawWeight = loadWeight.value === "" ? null : Number(loadWeight.value);
    const weight = Number.isFinite(rawWeight) && rawWeight > 0 ? rawWeight : null;
    const truckResult = Calc.truckLoads(
      { volume: looseVolume, weight },
      {
        capacityMode: capacityMode.value,
        volumeCapacity: truckVolume.value,
        weightCapacity: truckWeight.value,
      }
    );
    const roundedText = truckResult.rounded !== truckResult.exact
      ? ` (${truckResult.rounded} rounded)`
      : "";

    volumeOutput.textContent = `${format(result.volume)} m³`;
    sourceOutput.textContent = result.source === "measured"
      ? "Measured depth"
      : result.source === "assumed"
        ? "Assumed depth"
        : "Manual volume";
    formulaOutput.textContent = buildFormula(section, result);

    trucksOutput.textContent = `${format(truckResult.exact)} trucks${roundedText}`;
    limitOutput.textContent = truckResult.limit === "volume"
      ? "Limited by volume"
      : truckResult.limit === "weight"
        ? "Limited by weight"
        : "Enter a truck capacity";
    truckFormulaOutput.textContent = buildTruckFormula(looseVolume, weight, truckResult);
  }

  function setMode(nextMode) {
    mode = nextMode;

    for (const button of modeButtons) {
      const active = button.dataset.mode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    }

    dimensions.hidden = mode === "manual";
    depthFields.hidden = mode !== "measured";
    assumedFields.hidden = mode !== "assumed";
    manualFields.hidden = mode !== "manual";

    update();
  }

  for (const button of modeButtons) {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  }

  for (const input of [
    widthInput,
    lengthInput,
    depthInput,
    assumedInput,
    manualInput,
    swellPercent,
    truckVolume,
    truckWeight,
    loadWeight,
  ]) {
    input.addEventListener("input", update);
  }

  for (const select of [widthUnit, lengthUnit, depthUnit, assumedUnit, capacityMode]) {
    select.addEventListener("change", update);
  }

  swellEnabled.addEventListener("change", update);

  setMode("measured");
})();
