import test from "node:test";
import assert from "node:assert/strict";
import { addItem, changeQty, removeItem, totals } from "../src/cart.js";

const mug = { sku: "MUG-01", name: "Ceramic Mug", price: 1200 };
const tea = { sku: "TEA-02", name: "Loose Leaf Tea", price: 850 };

test("adding the same product twice raises its quantity", () => {
  const cart = addItem(addItem([], mug), mug);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].qty, 2);
});

test("tax is rounded once for the whole order, not per line", () => {
  assert.deepEqual(totals(addItem(addItem([], mug), tea)), { subtotal: 2050, discount: 0, tax: 169, total: 2219 });
  // Two notebooks (6.25) and two pens (4.75): rounded line by line the tax is 1.03 + 0.78 = 1.81,
  // but the order's 22.00 at 8.25% is 1.815, which rounds to 1.82.
  const notebook = { sku: "NTB-05", name: "Notebook", price: 625 };
  const pens = { sku: "PEN-06", name: "Gel Pen Set", price: 475 };
  let cart = [];
  for (let i = 0; i < 2; i++) cart = addItem(addItem(cart, notebook), pens);
  assert.equal(totals(cart).tax, 182);
});

test("lowering a quantity to zero removes the line", () => {
  const cart = changeQty(addItem([], mug), "MUG-01", -1);
  assert.deepEqual(cart, []);
});

test("a quantity can never go below zero", () => {
  const cart = changeQty(changeQty(addItem([], mug), "MUG-01", -1), "MUG-01", -1);
  assert.deepEqual(cart, []);
});

test("removing a line leaves the others", () => {
  const cart = removeItem(addItem(addItem([], mug), tea), "MUG-01");
  assert.deepEqual(cart.map((l) => l.sku), ["TEA-02"]);
});
