import test from "node:test";
import assert from "node:assert/strict";
import { applyReturn, applySale, canAdd, isLow, parseStock, setStock, stockOf } from "../src/stock.js";

const mug = { sku: "MUG-01", name: "Ceramic Mug", price: 1200, stock: 2 };

test("a product can be added until the shelf is empty", () => {
  assert.deepEqual(canAdd(mug, []), { ok: true });
  assert.deepEqual(canAdd(mug, [{ sku: "MUG-01", qty: 1 }]), { ok: true });
  assert.equal(canAdd(mug, [{ sku: "MUG-01", qty: 2 }]).message, "Only 2 of Ceramic Mug in stock.");
  assert.equal(canAdd({ ...mug, stock: 0 }, []).message, "Ceramic Mug is out of stock.");
});

test("a product with no stock figure is treated as unlimited", () => {
  const { stock, ...unlimited } = mug;
  assert.equal(stockOf(unlimited), Infinity);
  assert.equal(canAdd(unlimited, [{ sku: "MUG-01", qty: 999 }]).ok, true);
});

test("low stock means above zero and at or below the warning level", () => {
  assert.equal(isLow({ ...mug, stock: 5 }, 5), true);
  assert.equal(isLow({ ...mug, stock: 6 }, 5), false);
  assert.equal(isLow({ ...mug, stock: 0 }, 5), false);
});

test("a sale takes items off the shelf, never below zero, and a return can put them back", () => {
  const catalog = [mug, { sku: "TEA-02", name: "Tea", price: 850, stock: 9 }];
  const sold = applySale(catalog, [{ sku: "MUG-01", qty: 5 }]);
  assert.equal(sold[0].stock, 0);
  assert.equal(sold[1].stock, 9);
  assert.equal(applyReturn(sold, [{ sku: "MUG-01", qty: 1 }])[0].stock, 1);
});

test("a manager's stock entry is a whole number of zero or more", () => {
  assert.equal(parseStock("12"), 12);
  assert.equal(parseStock(" 0 "), 0);
  for (const bad of ["", "-1", "1.5", "abc", "1000000"]) assert.equal(parseStock(bad), null, bad);
  assert.equal(setStock([mug], "MUG-01", 7)[0].stock, 7);
});
