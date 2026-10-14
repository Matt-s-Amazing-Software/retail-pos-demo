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
