import test from "node:test";
import assert from "node:assert/strict";
import { USERS, authenticate, canOpen } from "../src/users.js";

test("the right PIN signs a person in and a wrong one does not", () => {
  assert.equal(authenticate(USERS, "morgan", "1234").role, "manager");
  assert.equal(authenticate(USERS, "morgan", " 1234 ").id, "morgan");
  assert.equal(authenticate(USERS, "morgan", "0000"), null);
  assert.equal(authenticate(USERS, "nobody", "1234"), null);
});

test("only a manager may open manager screens, and nobody may open anything signed out", () => {
  const manager = USERS.find((u) => u.role === "manager");
  const cashier = USERS.find((u) => u.role === "cashier");
  assert.equal(canOpen(manager, "/catalog"), true);
  assert.equal(canOpen(cashier, "/catalog"), false);
  assert.equal(canOpen(cashier, "/register"), true);
  assert.equal(canOpen(null, "/register"), false);
});
