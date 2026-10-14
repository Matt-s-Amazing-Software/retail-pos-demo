import test from "node:test";
import assert from "node:assert/strict";
import { otherTheme, pickTheme } from "../src/theme.js";

test("a remembered choice wins over the device preference", () => {
  assert.equal(pickTheme("light", true), "light");
  assert.equal(pickTheme("dark", false), "dark");
});

test("with no remembered choice the device preference decides", () => {
  assert.equal(pickTheme(null, true), "dark");
  assert.equal(pickTheme(null, false), "light");
  assert.equal(pickTheme("purple", false), "light");
});

test("the toggle switches to the other theme", () => {
  assert.equal(otherTheme("dark"), "light");
  assert.equal(otherTheme("light"), "dark");
});
