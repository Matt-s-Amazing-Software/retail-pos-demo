// All amounts are whole cents, so adding them up never drifts.
export const money = (cents) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
