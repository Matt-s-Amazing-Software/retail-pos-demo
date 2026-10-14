// Settling a sale: pure functions, so the rules are easy to test.
export const METHODS = ["cash", "card", "giftcard"];

// How a payment method is written for people.
export const methodLabel = (method) => ({ cash: "cash", card: "card", giftcard: "gift card" }[method] || method);

// Turn what the cashier typed ("20", "20.5", "$20.00") into cents, or null if it is not an amount.
export function parseAmount(text) {
  const cleaned = String(text ?? "").replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  return Math.round(parseFloat(cleaned) * 100);
}

// Cash must cover the total and gives change; a card (simulated here) always approves the exact total.
// A gift card also pays the exact total; whether it can cover it is checked against its balance before this.
export function settle({ method, total, tendered }) {
  if (!METHODS.includes(method)) return { ok: false, error: "Choose a payment method." };
  if (total <= 0) return { ok: false, error: "There is nothing to pay." };
  if (method === "card" || method === "giftcard") return { ok: true, tendered: total, change: 0 };
  if (tendered === null || tendered === undefined) return { ok: false, error: "Enter the cash received." };
  if (tendered < total) return { ok: false, error: "The cash received is less than the total." };
  return { ok: true, tendered, change: tendered - total };
}
