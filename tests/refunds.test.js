import test from "node:test";
import assert from "node:assert/strict";
import { refundFor, returnableQty, validateReturn } from "../src/refunds.js";

const sale = { id: 1001, subtotal: 2400, tax: 198, total: 2598, lines: [{ sku: "MUG-01", name: "Ceramic Mug", price: 1200, qty: 2 }] };

test("a refund includes the item's share of the tax, rounded once", () => {
  assert.deepEqual(refundFor(sale, [{ sku: "MUG-01", qty: 1 }]), { subtotal: 1200, tax: 99, total: 1299 });
});

test("earlier returns reduce what can still be returned", () => {
  const earlier = [{ orderId: 1001, items: [{ sku: "MUG-01", qty: 1 }] }];
  assert.deepEqual(returnableQty(sale, earlier), { "MUG-01": 1 });
  assert.match(validateReturn(sale, earlier, [{ sku: "MUG-01", qty: 2 }], "Defective"), /more than was sold/);
});

test("a return needs a reason and at least one item", () => {
  assert.match(validateReturn(sale, [], [{ sku: "MUG-01", qty: 1 }], ""), /reason/);
  assert.match(validateReturn(sale, [], [], "Defective"), /at least one item/);
});
