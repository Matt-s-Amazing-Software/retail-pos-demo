import test from "node:test";
import assert from "node:assert/strict";
import { filterOrders, orderStatus } from "../src/orders.js";

const sales = [
  { id: 1001, lines: [{ sku: "MUG-01", name: "Ceramic Mug", qty: 2 }] },
  { id: 1002, lines: [{ sku: "TEA-02", name: "Loose Leaf Tea", qty: 1 }] },
];

test("orders come newest first and can be found by number or product", () => {
  assert.deepEqual(filterOrders(sales, "").map((s) => s.id), [1002, 1001]);
  assert.deepEqual(filterOrders(sales, "1001").map((s) => s.id), [1001]);
  assert.deepEqual(filterOrders(sales, "mug").map((s) => s.id), [1001]);
  assert.deepEqual(filterOrders(sales, "tea-02").map((s) => s.id), [1002]);
  assert.deepEqual(filterOrders(sales, "zzz"), []);
});

test("an order shows whether any of it was returned", () => {
  const back = (qty) => [{ orderId: 1001, items: [{ sku: "MUG-01", qty }] }];
  assert.equal(orderStatus(sales[0], []), "Paid");
  assert.equal(orderStatus(sales[0], back(1)), "Partly refunded");
  assert.equal(orderStatus(sales[0], back(2)), "Refunded");
});

test("orders can be limited to a range of days, both ends included", () => {
  const at = (day) => new Date(`${day}T12:00:00`).toISOString();
  const dated = [{ id: 1, at: at("2026-01-01"), lines: [] }, { id: 2, at: at("2026-01-02"), lines: [] }, { id: 3, at: at("2026-01-03"), lines: [] }];
  assert.deepEqual(filterOrders(dated, "", "2026-01-02", "2026-01-03").map((s) => s.id), [3, 2]);
  assert.deepEqual(filterOrders(dated, "", "2026-01-03").map((s) => s.id), [3]);
  assert.deepEqual(filterOrders(dated, "", "", "2026-01-01").map((s) => s.id), [1]);
  assert.deepEqual(filterOrders(dated, "").map((s) => s.id), [3, 2, 1]);
});
