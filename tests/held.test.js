import test from "node:test";
import assert from "node:assert/strict";
import { holdOrder, resumeOrder } from "../src/held.js";

const cart = [{ sku: "MUG-01", name: "Ceramic Mug", price: 1200, qty: 2 }];

test("holding an order moves the cart into the held list", () => {
  const result = holdOrder([], cart, "", new Date("2026-01-01T10:00:00Z"));
  assert.equal(result.held.length, 1);
  assert.equal(result.held[0].id, 1);
  assert.deepEqual(result.held[0].lines, cart);
});

test("an empty cart cannot be held", () => {
  assert.match(holdOrder([], []).error, /nothing to hold/);
});

test("resuming brings the lines back and removes the held order", () => {
  const { held } = holdOrder([], cart);
  const result = resumeOrder(held, [], 1);
  assert.deepEqual(result.cart, cart);
  assert.equal(result.held.length, 0);
});

test("resuming is refused while another order is in progress", () => {
  const { held } = holdOrder([], cart);
  assert.match(resumeOrder(held, cart, 1).error, /Finish or hold/);
});

test("a held order keeps its note and brings it back when resumed", () => {
  const { held } = holdOrder([], cart, "Gift wrap please");
  assert.equal(held[0].note, "Gift wrap please");
  assert.equal(resumeOrder(held, [], 1).note, "Gift wrap please");
  assert.equal(resumeOrder(holdOrder([], cart).held, [], 1).note, "");
});
