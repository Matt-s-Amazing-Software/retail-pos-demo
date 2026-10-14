import test from "node:test";
import assert from "node:assert/strict";
import { parseSettings } from "../src/settingsrules.js";

test("a store needs a name", () => {
  assert.match(parseSettings({ storeName: " ", taxPercent: "8.25", floatDollars: "100" }).error, /name/);
});

test("the opening float is turned into cents", () => {
  assert.equal(parseSettings({ storeName: "Shop", taxPercent: "8.25", floatDollars: "125.50" }).settings.float, 12550);
});

test("the tax rate is typed as a percentage and kept as a fraction", () => {
  assert.equal(parseSettings({ storeName: "Shop", taxPercent: "8.5", floatDollars: "100" }).settings.taxRate, 0.085);
  assert.equal(parseSettings({ storeName: "Shop", taxPercent: "0", floatDollars: "100" }).settings.taxRate, 0);
});

test("a tax rate outside zero to twenty-five percent is refused", () => {
  for (const bad of ["-1", "26", "abc", ""]) {
    assert.match(parseSettings({ storeName: "Shop", taxPercent: bad, floatDollars: "100" }).error, /tax rate/i, bad);
  }
});

test("the low stock warning is a whole number and defaults to 5", () => {
  const ok = (low) => parseSettings({ storeName: "Shop", taxPercent: "8", floatDollars: "100", lowStock: low });
  assert.equal(ok("10").settings.lowStock, 10);
  assert.equal(parseSettings({ storeName: "Shop", taxPercent: "8", floatDollars: "100" }).settings.lowStock, 5);
  assert.match(ok("x").error, /low stock/i);
  assert.match(ok("-2").error, /low stock/i);
});

test("the store address and phone are optional, trimmed, and kept short", () => {
  const ok = parseSettings({ storeName: "Shop", taxPercent: "8", floatDollars: "100", storeAddress: " 12 Main St ", storePhone: "555-0100" }).settings;
  assert.deepEqual([ok.storeAddress, ok.storePhone], ["12 Main St", "555-0100"]);
  assert.deepEqual(parseSettings({ storeName: "Shop", taxPercent: "8", floatDollars: "100" }).settings.storeAddress, "");
  assert.match(parseSettings({ storeName: "Shop", taxPercent: "8", floatDollars: "100", storeAddress: "x".repeat(81) }).error, /under 80/);
});
