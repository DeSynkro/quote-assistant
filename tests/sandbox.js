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

  function update() {
    const section = buildSection();
    const result = Calc.sectionVolume(section);

    volumeOutput.textContent = `${format(result.volume)} m³`;
    sourceOutput.textContent = result.source === "measured"
      ? "Measured depth"
      : result.source === "assumed"
        ? "Assumed depth"
        : "Manual volume";
    formulaOutput.textContent = buildFormula(section, result);
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

  for (const input of [widthInput, lengthInput, depthInput, assumedInput, manualInput]) {
    input.addEventListener("input", update);
  }

  for (const select of [widthUnit, lengthUnit, depthUnit, assumedUnit]) {
    select.addEventListener("change", update);
  }

  setMode("measured");
})();
