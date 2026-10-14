import test from "node:test";
import assert from "node:assert/strict";
import { csvField, ordersToCsv } from "../src/csv.js";

test("the CSV has a header and one row per order", () => {
  const csv = ordersToCsv([{ id: 1001, at: "2026-01-01T10:00:00Z", method: "cash", total: 2598, lines: [{ name: "Ceramic Mug", qty: 2 }] }]);
  assert.equal(csv, "order,time,items,paid_by,total\n1001,2026-01-01T10:00:00Z,Ceramic Mug x2,cash,25.98\n");
});

test("an order with several items stays in one column", () => {
  const csv = ordersToCsv([{ id: 1002, at: "2026-01-01T11:00:00Z", method: "card", total: 2050,
    lines: [{ name: "Ceramic Mug", qty: 1 }, { name: "Loose Leaf Tea", qty: 1 }] }]);
  const row = csv.trim().split("\n")[1];
  assert.equal(row, '1002,2026-01-01T11:00:00Z,"Ceramic Mug x1, Loose Leaf Tea x1",card,20.50');
});

test("quotes and line breaks inside a field are escaped", () => {
  assert.equal(csvField('The "best" mug'), '"The ""best"" mug"');
  assert.equal(csvField("two\nlines"), '"two\nlines"');
  assert.equal(csvField("plain"), "plain");
});
