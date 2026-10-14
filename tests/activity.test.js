import test from "node:test";
import assert from "node:assert/strict";
import { CATEGORIES, MAX_ENTRIES, filterActivity, record } from "../src/activity.js";

const entry = (n, category = "Sales") => ({ at: `2026-01-01T10:00:0${n}Z`, by: "Morgan Lee", category, text: `thing ${n}` });

test("entries are listed newest first and can be limited to one category", () => {
  const log = [entry(1, "Sales"), entry(2, "Returns"), entry(3, "Sales")];
  assert.deepEqual(filterActivity(log, "").map((e) => e.text), ["thing 3", "thing 2", "thing 1"]);
  assert.deepEqual(filterActivity(log, "Sales").map((e) => e.text), ["thing 3", "thing 1"]);
  assert.deepEqual(filterActivity(log, "Voids"), []);
});

test("only the most recent entries are kept", () => {
  let log = [];
  for (let i = 0; i < MAX_ENTRIES + 20; i++) log = record(log, { ...entry(1), text: `n${i}` });
  assert.equal(log.length, MAX_ENTRIES);
  assert.equal(log[log.length - 1].text, `n${MAX_ENTRIES + 19}`);
  assert.equal(log[0].text, "n20");
});

test("the categories cover every kind of event the app records", () => {
  assert.deepEqual(CATEGORIES, ["Sales", "Returns", "Voids", "Catalog", "Settings", "Sessions", "Gift cards", "Sign-ins"]);
});
