// Return rules: pure functions, so they are easy to test.
export const REASONS = ["Defective", "Wrong item", "Customer changed their mind"];

// How many of each product on the sale can still be returned (what was sold, minus earlier returns).
export function returnableQty(sale, returns) {
  const left = Object.fromEntries(sale.lines.map((l) => [l.sku, l.qty]));
  for (const r of returns.filter((x) => x.orderId === sale.id)) {
    for (const item of r.items) left[item.sku] -= item.qty;
  }
  return left;
}

// What goes back to the customer: the price of the returned items plus their share of the order's tax,
// rounded once.
export function refundFor(sale, items) {
  const gross = items.reduce((sum, item) => sum + sale.lines.find((l) => l.sku === item.sku).price * item.qty, 0);
  // An order-level discount is shared across its items, so a returned item gets back what was actually paid for it.
  const subtotal = sale.subtotal === 0 ? 0 : Math.round(gross * (1 - (sale.discount || 0) / sale.subtotal));
  const tax = sale.subtotal === 0 ? 0 : Math.round((sale.tax * gross) / sale.subtotal); // the order's tax is already on the discounted price
  return { subtotal, tax, total: subtotal + tax };
}

// Check a return request. `items` are the lines the cashier wants to return, with quantities above zero.
export function validateReturn(sale, returns, items, reason) {
  if (!REASONS.includes(reason)) return "Choose a reason for the return.";
  if (items.length === 0) return "Choose at least one item to return.";
  const left = returnableQty(sale, returns);
  for (const item of items) {
    if (!(item.qty > 0) || !Number.isInteger(item.qty)) return "Quantities must be whole numbers above zero.";
    if (item.qty > (left[item.sku] ?? 0)) return "You cannot return more than was sold on this order.";
  }
  return null;
}
