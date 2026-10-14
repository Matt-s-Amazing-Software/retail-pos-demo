import test from "node:test";
import assert from "node:assert/strict";
import { money } from "../src/money.js";
import { noticeHtml } from "../src/notice.js";

test("cents are shown as dollars", () => {
  assert.equal(money(0), "$0.00");
  assert.equal(money(1299), "$12.99");
  assert.equal(money(-500), "-$5.00");
  assert.equal(money(123456789), "$1,234,567.89");
});

test("a notice is announced politely and marked as an error only when it is one", () => {
  assert.equal(noticeHtml(null, "x"), "");
  assert.match(noticeHtml({ error: false, text: "Saved." }, "saved"), /role="status" aria-live="polite" data-testid="saved">Saved\.<\/p>/);
  assert.match(noticeHtml({ error: true, text: "No." }, "bad"), /class="notice error"/);
});
