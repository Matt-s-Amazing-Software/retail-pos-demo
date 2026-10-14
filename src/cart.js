// Cart arithmetic. Pure functions on a cart (a list of lines), so they are easy to test.
export const TAX_RATE = 0.0825;

export const lineTotal = (line) => line.price * line.qty;

// A discount is { type: "percent", value: 10 } (ten percent) or { type: "amount", value: 500 } (five dollars, in cents).
export function discountAmount(subtotal, discount) {
  if (!discount) return 0;
  const raw = discount.type === "percent" ? Math.round((subtotal * discount.value) / 100) : discount.value;
  return Math.min(Math.max(raw, 0), subtotal);
}

export function totals(cart, discount = null) {
  const subtotal = cart.reduce((sum, line) => sum + lineTotal(line), 0);
  const off = discountAmount(subtotal, discount);
  const tax = Math.round((subtotal - off) * TAX_RATE); // on what the customer pays for the goods; rounded once per order
  return { subtotal, discount: off, tax, total: subtotal - off + tax };
}

export function addItem(cart, product) {
  const existing = cart.find((line) => line.sku === product.sku);
  if (existing) existing.qty += 1;
  else cart.push({ sku: product.sku, name: product.name, price: product.price, qty: 1 });
  return cart;
}

// Change a line's quantity. A line that would drop to zero is removed rather than left at zero or below.
export function changeQty(cart, sku, delta) {
  const line = cart.find((l) => l.sku === sku);
  if (line) line.qty += delta;
  return cart.filter((l) => l.qty > 0);
}

export function removeItem(cart, sku) {
  return cart.filter((line) => line.sku !== sku);
}
