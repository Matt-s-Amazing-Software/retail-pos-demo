import test from "node:test";
import assert from "node:assert/strict";
import { countedTotal, expectedCash, variance } from "../src/cashcount.js";

test("counted cash adds up every denomination", () => {
  assert.equal(countedTotal({ 2000: 3, 25: 4, 1: 7 }), 6000 + 100 + 7);
});

test("expected cash is the float plus cash sales minus cash refunds since the session opened", () => {
  const session = { openedAt: "2026-01-01T09:00:00Z", float: 10000 };
  const sales = [{ at: "2026-01-01T10:00:00Z", method: "cash", total: 2598 }, { at: "2026-01-01T10:05:00Z", method: "card", total: 999 },
                 { at: "2025-12-31T10:00:00Z", method: "cash", total: 5000 }];
  const returns = [{ at: "2026-01-01T11:00:00Z", method: "cash", total: 1299 }];
  assert.equal(expectedCash(session, sales, returns), 10000 + 2598 - 1299);
});

test("variance is counted minus expected", () => {
  assert.equal(variance(10000, 10250), -250);
});
