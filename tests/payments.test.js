import test from "node:test";
import assert from "node:assert/strict";
import { parseAmount, settle } from "../src/payments.js";

test("amounts typed by a cashier become cents", () => {
  assert.equal(parseAmount("20"), 2000);
  assert.equal(parseAmount("$20.5"), 2050);
  assert.equal(parseAmount("1,000.00"), 100000);
  assert.equal(parseAmount("abc"), null);
  assert.equal(parseAmount(""), null);
});

test("cash must cover the total and gives change", () => {
  assert.deepEqual(settle({ method: "cash", total: 1500, tendered: 2000 }), { ok: true, tendered: 2000, change: 500 });
  assert.equal(settle({ method: "cash", total: 1500, tendered: 1000 }).ok, false);
});

test("a card approves the exact total", () => {
  assert.deepEqual(settle({ method: "card", total: 1500 }), { ok: true, tendered: 1500, change: 0 });
});
