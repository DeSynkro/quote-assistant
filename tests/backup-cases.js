"use strict";

const assert = require("node:assert/strict");

function createCases(Backup) {
  return [
    {
      name: "creates a backup with jobs and presets",
      run() {
        const backup = Backup.createBackup({
          presets: [{ id: "truck-1", name: "Tipper" }],
          jobs: [{ id: "job-1", name: "Front yard", data: {} }],
        });
        assert.equal(backup.schemaVersion, 1);
        assert.equal(typeof backup.exportedAt, "string");
        assert.equal(backup.truckPresets.presets.length, 1);
        assert.equal(backup.jobs.jobs.length, 1);
      },
    },
    {
      name: "parses a valid backup",
      run() {
        const parsed = Backup.parseBackup(JSON.stringify({
          schemaVersion: 1,
          truckPresets: {
            schemaVersion: 1,
            presets: [
              {
                id: "truck-1",
                name: "Tipper",
                volumeCapacity: "6.5",
                weightCapacity: "8",
                fuelConsumption: "8.2",
                pricePerTruck: "800",
              },
            ],
          },
          jobs: {
            schemaVersion: 1,
            jobs: [
              {
                id: "job-1",
                name: "Front yard",
                savedAt: "2026-10-24T15:00:00.000Z",
                summary: "1 truck · $800",
                data: { sections: [] },
              },
            ],
          },
        }));
        assert.equal(parsed.presets.length, 1);
        assert.equal(parsed.jobs.length, 1);
        assert.equal(parsed.jobs[0].data.sections.length, 0);
      },
    },
    {
      name: "rejects invalid backup JSON",
      run() {
        assert.throws(() => Backup.parseBackup("{not json"), /not valid JSON/);
      },
    },
    {
      name: "rejects an unknown backup version",
      run() {
        assert.throws(
          () => Backup.parseBackup(JSON.stringify({ schemaVersion: 99 })),
          /not supported/
        );
      },
    },
    {
      name: "merges presets by id and by name",
      run() {
        const merged = Backup.mergePresets(
          [
            { id: "truck-1", name: "Tipper", pricePerTruck: "800" },
            { id: "truck-2", name: "Big truck", pricePerTruck: "900" },
          ],
          [
            { id: "truck-1", name: "Tipper", pricePerTruck: "850" },
            { id: "truck-3", name: "Big truck", pricePerTruck: "950" },
            { id: "truck-4", name: "New truck", pricePerTruck: "1000" },
          ]
        );
        assert.equal(merged.length, 3);
        assert.equal(merged.find((item) => item.id === "truck-1").pricePerTruck, "850");
        assert.equal(merged.find((item) => item.id === "truck-2").pricePerTruck, "950");
        assert.equal(merged.find((item) => item.name === "New truck").pricePerTruck, "1000");
      },
    },
    {
      name: "merges jobs by id",
      run() {
        const merged = Backup.mergeJobs(
          [{ id: "job-1", name: "Old name" }],
          [
            { id: "job-1", name: "New name" },
            { id: "job-2", name: "Second job" },
          ]
        );
        assert.equal(merged.length, 2);
        assert.equal(merged[0].name, "New name");
        assert.equal(merged[1].name, "Second job");
      },
    },
  ];
}

module.exports = { createCases };
