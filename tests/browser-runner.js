(function () {
  "use strict";

  const results = document.getElementById("results");
  const summary = document.getElementById("summary");
  const cases = window.TestCases.createCases(window.Calc);
  let failed = 0;

  for (const test of cases) {
    const item = document.createElement("li");
    try {
      test.run();
      item.className = "pass";
      item.textContent = `PASS ${test.name}`;
    } catch (error) {
      failed += 1;
      item.className = "fail";
      item.textContent = `FAIL ${test.name}: ${error.message}`;
    }
    results.appendChild(item);
  }

  summary.textContent = `${cases.length - failed} of ${cases.length} passed`;
  summary.className = failed > 0 ? "fail" : "pass";
})();
