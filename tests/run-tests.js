"use strict";

const Calc = require("../app/calc.js");
const QuoteStorage = require("../app/storage.js");
const { createCases } = require("./cases.js");
const { createCases: createStorageCases } = require("./storage-cases.js");

const cases = [...createCases(Calc), ...createStorageCases(QuoteStorage)];
let failed = 0;

for (const test of cases) {
  try {
    test.run();
    console.log(`PASS ${test.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${test.name}`);
    console.error(`     ${error.message}`);
  }
}

console.log("");
console.log(`${cases.length - failed} of ${cases.length} passed`);

if (failed > 0) {
  process.exitCode = 1;
}
