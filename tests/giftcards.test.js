import test from "node:test";
import assert from "node:assert/strict";
import { balanceMessage, chargeCard, findCard, issueCard, refundToCard } from "../src/giftcards.js";
import { settle } from "../src/payments.js";

test("a gift card is issued with the next number and the amount as its balance", () => {
  const first = issueCard([], 2500, new Date("2026-01-01T10:00:00Z"));
  assert.deepEqual(first.card, { code: "GC-0001", balance: 2500, issuedAt: "2026-01-01T10:00:00.000Z" });
  assert.equal(issueCard(first.cards, 1000).card.code, "GC-0002");
});

test("a gift card is between five and five hundred dollars", () => {
  for (const bad of [0, 499, 50001, null, 12.5]) assert.match(issueCard([], bad).error, /between \$5\.00 and \$500\.00/);
});

test("a card is found by its number whatever the capitals or spaces", () => {
  const { cards } = issueCard([], 2500);
  assert.equal(findCard(cards, " gc-0001 ").code, "GC-0001");
  assert.equal(findCard(cards, "GC-0009"), null);
});

test("paying uses up the balance; a card that cannot cover the total is refused", () => {
  const { cards } = issueCard([], 2500);
  const paid = chargeCard(cards, "gc-0001", 1000);
  assert.equal(paid.ok, true);
  assert.equal(paid.cards[0].balance, 1500);
  assert.equal(chargeCard(paid.cards, "GC-0001", 2000).error, "This gift card has $15.00 left, which does not cover the $20.00 total.");
  assert.equal(chargeCard(cards, "", 100).error, "Enter the gift card number.");
  assert.equal(chargeCard(cards, "GC-0099", 100).error, "No gift card with that number.");
});

test("a refund goes back onto the card it was paid with", () => {
  const { cards } = issueCard([], 2500);
  assert.equal(refundToCard(chargeCard(cards, "GC-0001", 1000).cards, "GC-0001", 400)[0].balance, 1900);
});

test("a gift card payment settles for the exact total with no change", () => {
  assert.deepEqual(settle({ method: "giftcard", total: 1500 }), { ok: true, tendered: 1500, change: 0 });
});

test("a cashier can ask what is left on a card before taking payment", () => {
  const { cards } = issueCard([], 2500);
  assert.deepEqual(balanceMessage(cards, " gc-0001 "), { ok: true, text: "GC-0001 has $25.00 left." });
  assert.equal(balanceMessage(cards, "GC-0099").text, "No gift card with that number.");
  assert.equal(balanceMessage(cards, "").text, "Enter the gift card number.");
});
