import test from "node:test";
import assert from "node:assert/strict";
import { addProduct, setActive, setPrice, validateProduct } from "../src/catalogrules.js";

const catalog = [{ sku: "MUG-01", name: "Ceramic Mug", price: 1200, stock: 5, active: true }];

test("a new product needs a unique SKU, a name and a price above zero", () => {
  assert.equal(validateProduct(catalog, { sku: "tea-9", name: "Tea", price: 500, stock: 10 }), null);
  assert.match(validateProduct(catalog, { sku: "mug-01", name: "Mug", price: 500, stock: 10 }), /already exists/);
  assert.match(validateProduct(catalog, { sku: "x", name: "Tea", price: 500, stock: 10 }), /SKU/);
  assert.match(validateProduct(catalog, { sku: "tea-9", name: " ", price: 500, stock: 10 }), /name/);
  assert.match(validateProduct(catalog, { sku: "tea-9", name: "Tea", price: 0, stock: 10 }), /price/);
  assert.match(validateProduct(catalog, { sku: "tea-9", name: "Tea", price: 500, stock: -1 }), /Stock/);
  assert.match(validateProduct(catalog, { sku: "tea-9", name: "Tea", price: 500 }), /Stock/);
});

test("adding, switching off and repricing leave the other products alone", () => {
  let c = addProduct(catalog, { sku: " tea-9 ", name: " Tea ", price: 500, stock: 8 });
  assert.deepEqual(c[1], { sku: "TEA-9", name: "Tea", price: 500, stock: 8, active: true });
  c = setActive(c, "TEA-9", false);
  c = setPrice(c, "MUG-01", 1300);
  assert.deepEqual(c.map((p) => [p.sku, p.price, p.active]), [["MUG-01", 1300, true], ["TEA-9", 500, false]]);
});
