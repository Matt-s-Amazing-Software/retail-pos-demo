import test from "node:test";
import assert from "node:assert/strict";
import { parseSettings } from "../src/settingsrules.js";

test("a store needs a name", () => {
  assert.match(parseSettings({ storeName: " ", taxPercent: "8.25", floatDollars: "100" }).error, /name/);
});

test("the opening float is turned into cents", () => {
  assert.equal(parseSettings({ storeName: "Shop", taxPercent: "8.25", floatDollars: "125.50" }).settings.float, 12550);
});
