import test from "node:test";
import assert from "node:assert/strict";
import { filterProducts } from "../src/productsearch.js";

const products = [{ name: "Ceramic Mug" }, { name: "Loose Leaf Tea" }, { name: "Canvas Tote" }];

test("a search keeps the products whose name contains the text, ignoring capitals", () => {
  assert.deepEqual(filterProducts(products, "MUG").map((p) => p.name), ["Ceramic Mug"]);
  assert.deepEqual(filterProducts(products, "a").map((p) => p.name), ["Ceramic Mug", "Loose Leaf Tea", "Canvas Tote"]);
});

test("an empty search shows every product", () => {
  assert.equal(filterProducts(products, "").length, 3);
  assert.equal(filterProducts(products, "   ").length, 3);
});

test("a search that matches nothing shows nothing", () => {
  assert.deepEqual(filterProducts(products, "bicycle"), []);
});
