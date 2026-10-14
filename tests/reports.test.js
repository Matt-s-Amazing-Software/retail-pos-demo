import test from "node:test";
import assert from "node:assert/strict";
import { salesSummary } from "../src/reports.js";

const since = "2026-01-01T09:00:00Z";
const sales = [
  { id: 1, at: "2026-01-01T10:00:00Z", method: "cash", subtotal: 2400, discount: 0, tax: 198, total: 2598, lines: [{ sku: "MUG-01", name: "Ceramic Mug", qty: 2 }] },
  { id: 2, at: "2026-01-01T11:00:00Z", method: "card", subtotal: 850, discount: 85, tax: 63, total: 828, lines: [{ sku: "TEA-02", name: "Loose Leaf Tea", qty: 1 }] },
  { id: 3, at: "2025-12-31T11:00:00Z", method: "cash", subtotal: 999, discount: 0, tax: 82, total: 1081, lines: [{ sku: "BAG-03", name: "Canvas Tote", qty: 1 }] },
];
const returns = [{ id: 1, orderId: 1, at: "2026-01-01T12:00:00Z", total: 1299, items: [{ sku: "MUG-01", qty: 1 }] }];

test("the summary counts only this session and subtracts refunds", () => {
  const r = salesSummary(sales, returns, since);
  assert.equal(r.orders, 2);
  assert.equal(r.gross, 3250);
  assert.equal(r.discounts, 85);
  assert.equal(r.tax, 261);
  assert.equal(r.takings, 3426);
  assert.equal(r.refunds, 1299);
  assert.equal(r.net, 2127);
  assert.deepEqual(r.byMethod, { cash: 2598, card: 828 });
});

test("top products count units net of returns", () => {
  assert.deepEqual(salesSummary(sales, returns, since).topProducts, [["Ceramic Mug", 1], ["Loose Leaf Tea", 1]]);
});

test("an empty session summarises to zeros", () => {
  const r = salesSummary([], [], since);
  assert.deepEqual([r.orders, r.net, r.topProducts], [0, 0, []]);
});

test("a voided sale is left out of every figure", () => {
  const voided = { ...sales[0], voided: { at: "2026-01-01T10:30:00Z", by: "morgan", reason: "Wrong customer" } };
  const r = salesSummary([voided, sales[1]], [], since);
  assert.equal(r.orders, 1);
  assert.equal(r.takings, 828);
  assert.deepEqual(r.byMethod, { card: 828 });
  assert.deepEqual(r.topProducts, [["Loose Leaf Tea", 1]]);
});
