import test from "node:test";
import assert from "node:assert/strict";
import { ordersToCsv } from "../src/csv.js";

test("the CSV has a header and one row per order", () => {
  const csv = ordersToCsv([{ id: 1001, at: "2026-01-01T10:00:00Z", method: "cash", total: 2598, lines: [{ name: "Ceramic Mug", qty: 2 }] }]);
  assert.equal(csv, "order,time,items,paid_by,total\n1001,2026-01-01T10:00:00Z,Ceramic Mug x2,cash,25.98\n");
});
