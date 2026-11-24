import test from "node:test";
import assert from "node:assert/strict";
import {
  getFinancialDateKey,
  getFinancialDateRange,
  isDateWithinFinancialRange,
} from "./financialDateFilter.js";

test("year and month filters produce exclusive UTC end dates", () => {
  const year = getFinancialDateRange({ mode: "YEAR", year: 2026 });
  assert.equal(year.start.toISOString(), "2026-01-01T00:00:00.000Z");
  assert.equal(year.endExclusive.toISOString(), "2027-01-01T00:00:00.000Z");

  const month = getFinancialDateRange({ mode: "MONTH", year: 2026, month: 1 });
  assert.equal(month.start.toISOString(), "2026-02-01T00:00:00.000Z");
  assert.equal(month.endExclusive.toISOString(), "2026-03-01T00:00:00.000Z");
});

test("day and custom filters include their selected end date", () => {
  const day = getFinancialDateRange({ mode: "DAY", date: "2026-02-28" });
  assert.equal(day.endExclusive.toISOString(), "2026-03-01T00:00:00.000Z");

  const custom = getFinancialDateRange({
    mode: "CUSTOM",
    from: "2026-02-28",
    to: "2026-03-02",
  });
  assert.equal(custom.endExclusive.toISOString(), "2026-03-03T00:00:00.000Z");
  assert.equal(isDateWithinFinancialRange(new Date("2026-03-02T18:00:00.000Z"), custom), true);
  assert.equal(isDateWithinFinancialRange(new Date("2026-03-03T00:00:00.000Z"), custom), false);
});

test("custom filter validates dates and chooses monthly buckets for long ranges", () => {
  const invalid = getFinancialDateRange({
    mode: "CUSTOM",
    from: "2026-03-02",
    to: "2026-02-28",
  });
  assert.equal(invalid.valid, false);

  const longRange = getFinancialDateRange({
    mode: "CUSTOM",
    from: "2026-01-01",
    to: "2026-03-31",
  });
  assert.equal(longRange.granularity, "month");
});

test("date keys match the chart aggregation granularity", () => {
  const date = new Date("2026-11-24T00:00:00.000Z");
  assert.equal(getFinancialDateKey(date, "day"), "2026-11-24");
  assert.equal(getFinancialDateKey(date, "month"), "2026-11");
});
