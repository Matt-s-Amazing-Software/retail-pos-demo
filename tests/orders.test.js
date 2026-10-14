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
