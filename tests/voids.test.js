import test from "node:test";
import assert from "node:assert/strict";
import { markVoided, voidProblem } from "../src/voids.js";
import { orderStatus } from "../src/orders.js";
import { expectedCash } from "../src/cashcount.js";
import { validateReturn } from "../src/refunds.js";

const manager = { id: "morgan", role: "manager" };
const cashier = { id: "casey", role: "cashier" };
const session = { openedAt: "2026-01-01T09:00:00Z", closedAt: null, float: 10000 };
const sale = { id: 1001, at: "2026-01-01T10:00:00Z", method: "cash", total: 2598, subtotal: 2400, tax: 198, lines: [{ sku: "MUG-01", name: "Mug", price: 1200, qty: 2 }] };

test("a manager can void an order from the current session, with a reason", () => {
  assert.equal(voidProblem(sale, [], session, manager, "Customer left"), null);
});

test("each way an order cannot be voided has its own message", () => {
  assert.equal(voidProblem(sale, [], session, cashier, "x"), "Only a manager can void an order.");
  assert.equal(voidProblem(sale, [], session, null, "x"), "Only a manager can void an order.");
  assert.equal(voidProblem({ ...sale, voided: {} }, [], session, manager, "x"), "This order was already voided.");
  assert.equal(voidProblem(sale, [{ orderId: 1001 }], session, manager, "x"), "An order that has been returned cannot be voided.");
  assert.equal(voidProblem({ ...sale, at: "2025-12-31T10:00:00Z" }, [], session, manager, "x"), "Only orders from the current session can be voided.");
  assert.equal(voidProblem(sale, [], { ...session, closedAt: "2026-01-01T18:00:00Z" }, manager, "x"), "Only orders from the current session can be voided.");
  assert.equal(voidProblem(sale, [], session, manager, "  "), "Give a reason for voiding the order.");
});

test("a voided order is marked, shows as Voided, and cannot be returned", () => {
  const voided = markVoided(sale, manager, " Wrong customer ", new Date("2026-01-01T11:00:00Z"));
  assert.deepEqual(voided.voided, { at: "2026-01-01T11:00:00.000Z", by: "morgan", reason: "Wrong customer" });
  assert.equal(orderStatus(voided, []), "Voided");
  assert.match(validateReturn(voided, [], [{ sku: "MUG-01", qty: 1 }], "Defective"), /voided and cannot be returned/);
});

test("a voided cash sale is no longer in the drawer", () => {
  assert.equal(expectedCash(session, [markVoided(sale, manager, "x")], []), 10000);
  assert.equal(expectedCash(session, [sale], []), 12598);
});
