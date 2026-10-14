// Gift cards. Pure functions on the list of cards, each { code, balance, issuedAt } with the balance in cents.
import { money } from "./money.js";

export const MIN_CARD = 500;    // $5.00
export const MAX_CARD = 50000;  // $500.00

export const normalizeCode = (code) => String(code || "").trim().toUpperCase();

export function issueCard(cards, amount, now = new Date()) {
  if (!Number.isInteger(amount) || amount < MIN_CARD || amount > MAX_CARD) {
    return { error: "A gift card must be between $5.00 and $500.00." };
  }
  const card = { code: `GC-${String(cards.length + 1).padStart(4, "0")}`, balance: amount, issuedAt: now.toISOString() };
  return { cards: [...cards, card], card };
}

export const findCard = (cards, code) => cards.find((c) => c.code === normalizeCode(code)) || null;

// Pay a total with a card. The card must cover all of it (paying part by card and part by cash is not supported).
export function chargeCard(cards, code, total) {
  if (!normalizeCode(code)) return { ok: false, error: "Enter the gift card number." };
  const card = findCard(cards, code);
  if (!card) return { ok: false, error: "No gift card with that number." };
  if (card.balance < total) {
    return { ok: false, error: `This gift card has ${money(card.balance)} left, which does not cover the ${money(total)} total.` };
  }
  return { ok: true, code: card.code, cards: cards.map((c) => (c.code === card.code ? { ...c, balance: c.balance - total } : c)) };
}

// Put a refund back on the card it was paid with.
export const refundToCard = (cards, code, amount) =>
  cards.map((c) => (c.code === code ? { ...c, balance: c.balance + amount } : c));
