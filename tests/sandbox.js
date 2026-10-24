(function () {
  "use strict";

  const sandbox = document.getElementById("sandbox");
  const unevenToggle = document.getElementById("sandbox-uneven");
  const shapeModeFields = document.getElementById("sandbox-shape-mode-fields");
  const shapeMode = document.getElementById("sandbox-shape-mode");
  const rectangleFields = document.getElementById("sandbox-rectangle-fields");
  const unevenFields = document.getElementById("sandbox-uneven-fields");
  const manualAreaFields = document.getElementById("sandbox-manual-area-fields");
  const manualVolumeFields = document.getElementById("sandbox-manual-volume-fields");
  const depthFields = document.getElementById("sandbox-depth-fields");
  const widthInput = document.getElementById("sandbox-width");
  const widthUnit = document.getElementById("sandbox-width-unit");
  const lengthInput = document.getElementById("sandbox-length");
  const lengthUnit = document.getElementById("sandbox-length-unit");
  const unevenWidthInput = document.getElementById("sandbox-uneven-width");
  const unevenWidthUnit = document.getElementById("sandbox-uneven-width-unit");
  const leftInput = document.getElementById("sandbox-left-length");
  const leftUnit = document.getElementById("sandbox-left-length-unit");
  const rightInput = document.getElementById("sandbox-right-length");
  const rightUnit = document.getElementById("sandbox-right-length-unit");
  const manualAreaInput = document.getElementById("sandbox-manual-area");
  const manualVolumeInput = document.getElementById("sandbox-manual-volume");
  const depthInput = document.getElementById("sandbox-depth");
  const depthUnit = document.getElementById("sandbox-depth-unit");
  const densityInput = document.getElementById("sandbox-density");
  const areaBox = document.getElementById("sandbox-area-box");
  const areaOutput = document.getElementById("sandbox-area");
  const shapeLabel = document.getElementById("sandbox-shape-label");
  const areaFormula = document.getElementById("sandbox-area-formula");
  const volumeOutput = document.getElementById("sandbox-volume");
  const depthNote = document.getElementById("sandbox-depth-note");
  const volumeFormula = document.getElementById("sandbox-volume-formula");
  const swellEnabled = document.getElementById("sandbox-swell-enabled");
  const swellPercent = document.getElementById("sandbox-swell");
  const capacityMode = document.getElementById("sandbox-capacity-mode");
  const truckVolume = document.getElementById("sandbox-truck-volume");
  const truckWeight = document.getElementById("sandbox-truck-weight");
  const trucksOutput = document.getElementById("sandbox-trucks");
  const limitOutput = document.getElementById("sandbox-limit");
  const truckFormulaOutput = document.getElementById("sandbox-truck-formula");
  const priceInput = document.getElementById("sandbox-price");
  const gstMode = document.getElementById("sandbox-gst-mode");
  const gstRate = document.getElementById("sandbox-gst-rate");
  const priceExactOutput = document.getElementById("sandbox-price-exact");
  const priceRoundedOutput = document.getElementById("sandbox-price-rounded");
  const priceFormulaOutput = document.getElementById("sandbox-price-formula");
  const gstFormulaOutput = document.getElementById("sandbox-gst-formula");
  const warningsBox = document.getElementById("sandbox-warnings-box");
  const warningsOutput = document.getElementById("sandbox-warnings");

  function format(value) {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 3,
    }).format(value);
  }

  function money(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return "$0";
    }
    return `$${new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(number)}`;
  }

  function display(value) {
    const number = Number(value);
    if (value === "" || !Number.isFinite(number)) {
      return "?";
    }
    return format(number);
  }

  function currentShape() {
    return unevenToggle.checked ? shapeMode.value : "rectangle";
  }

  function buildSection(shape) {
    const section = { shape };

    if (shape === "manualVolume") {
      section.manualVolume = manualVolumeInput.value;
    } else {
      section.depth = depthInput.value;
      section.depthUnit = depthUnit.value;

      if (shape === "unevenEnds") {
        section.width = unevenWidthInput.value;
        section.widthUnit = unevenWidthUnit.value;
        section.leftLength = leftInput.value;
        section.leftLengthUnit = leftUnit.value;
        section.rightLength = rightInput.value;
        section.rightLengthUnit = rightUnit.value;
      } else if (shape === "manualArea") {
        section.area = manualAreaInput.value;
      } else {
        section.width = widthInput.value;
        section.widthUnit = widthUnit.value;
        section.length = lengthInput.value;
        section.lengthUnit = lengthUnit.value;
      }
    }

    const density = Number(densityInput.value);
    if (Number.isFinite(density) && density > 0) {
      section.material = { looseDensity: density };
    }

    return section;
  }

  function buildJob(shape) {
    return {
      sections: [buildSection(shape)],
      truck: {
        capacityMode: capacityMode.value,
        volumeCapacity: truckVolume.value,
        weightCapacity: truckWeight.value,
      },
      swell: {
        enabled: swellEnabled.checked,
        percent: swellPercent.value,
      },
      pricePerTruck: priceInput.value,
      gst: {
        mode: gstMode.value,
        rate: gstRate.value,
      },
    };
  }

  function shapeLabelFor(shape) {
    if (shape === "unevenEnds") {
      return "Uneven ends";
    }
    if (shape === "manualArea") {
      return "Manual area";
    }
    if (shape === "manualVolume") {
      return "Manual volume";
    }
    return "Rectangle";
  }

  function buildAreaFormula(section, result, shape) {
    if (shape === "unevenEnds") {
      return `${display(unevenWidthInput.value)} ${unevenWidthUnit.value} × (${display(leftInput.value)} ${leftUnit.value} + ${display(rightInput.value)} ${rightUnit.value}) ÷ 2 = ${format(result.area)} m²`;
    }

    if (shape === "manualArea") {
      return `Manual area = ${format(result.area)} m²`;
    }

    return `${display(widthInput.value)} ${widthUnit.value} × ${display(lengthInput.value)} ${lengthUnit.value} = ${format(result.area)} m²`;
  }

  function buildVolumeFormula(section, result, shape) {
    if (shape === "manualVolume") {
      return `Manual volume = ${format(result.volume)} m³`;
    }

    if (result.needsDepth) {
      return "Add a depth to calculate volume.";
    }

    if (result.area <= 0) {
      return "Add valid dimensions to calculate volume.";
    }

    const depth = Calc.toMetres(section.depth, section.depthUnit);

    return `${format(result.area)} m² × ${format(depth)} m = ${format(result.volume)} m³`;
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

  function applyLayout(shape) {
    shapeModeFields.hidden = !unevenToggle.checked;
    rectangleFields.hidden = shape !== "rectangle";
    unevenFields.hidden = shape !== "unevenEnds";
    manualAreaFields.hidden = shape !== "manualArea";
    manualVolumeFields.hidden = shape !== "manualVolume";
    depthFields.hidden = shape === "manualVolume";
    areaBox.hidden = shape === "manualVolume";
  }

  function update() {
    const shape = currentShape();
    const job = buildJob(shape);
    const result = Calc.calculateJob(job);
    const section = result.sections[0];
    const truckResult = result.totals.trucks;
    const price = result.totals.price;
    const gstExact = result.totals.gst.exact;
    const gstRounded = result.totals.gst.rounded;
    const roundedText = truckResult.rounded !== truckResult.exact
      ? ` (${truckResult.rounded} rounded)`
      : "";

    applyLayout(shape);

    if (shape !== "manualVolume") {
      areaOutput.textContent = `${format(section.area)} m²`;
      shapeLabel.textContent = shapeLabelFor(shape);
      areaFormula.textContent = buildAreaFormula(job.sections[0], section, shape);
    }

    volumeOutput.textContent = `${format(section.volume)} m³`;

    if (shape === "manualVolume") {
      depthNote.textContent = "Manual volume entered";
      depthNote.classList.remove("warn");
    } else if (section.needsDepth) {
      depthNote.textContent = "Depth needed for volume";
      depthNote.classList.add("warn");
    } else if (section.area <= 0) {
      depthNote.textContent = "Enter valid dimensions";
      depthNote.classList.add("warn");
    } else {
      depthNote.textContent = `Depth ${display(depthInput.value)} ${depthUnit.value}`;
      depthNote.classList.remove("warn");
    }

    volumeFormula.textContent = buildVolumeFormula(job.sections[0], section, shape);

    trucksOutput.textContent = `${format(truckResult.exact)} trucks${roundedText}`;
    limitOutput.textContent = truckResult.limit === "volume"
      ? "Limited by volume"
      : truckResult.limit === "weight"
        ? "Limited by weight"
        : "Enter a truck capacity";
    truckFormulaOutput.textContent = buildTruckFormula(
      section.looseVolume,
      section.weight,
      truckResult
    );

    priceExactOutput.textContent = `${money(gstExact.total)} exact`;
    priceRoundedOutput.textContent = `${money(gstRounded.total)} rounded`;
    priceFormulaOutput.textContent = `${format(price.exactTrucks)} × ${money(priceInput.value)} = ${money(price.exact)} exact · ${price.roundedTrucks} × ${money(priceInput.value)} = ${money(price.rounded)} rounded`;

    if (gstMode.value === "none") {
      gstFormulaOutput.textContent = "GST: none";
    } else {
      const label = gstMode.value === "add" ? "added" : "included";
      gstFormulaOutput.textContent = `GST ${display(gstRate.value)}% ${label}: ${money(gstExact.gst)} exact · ${money(gstRounded.gst)} rounded`;
    }

    warningsBox.hidden = result.warnings.length === 0;
    warningsOutput.textContent = result.warnings
      .map((warning) => warning.message)
      .join("\n");
  }

  for (const element of sandbox.querySelectorAll("input, select")) {
    element.addEventListener("input", update);
    element.addEventListener("change", update);
  }

  update();
})();
