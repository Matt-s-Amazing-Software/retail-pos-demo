// Cart arithmetic. Pure functions on a cart (a list of lines), so they are easy to test.
export const TAX_RATE = 0.0825;

export const lineTotal = (line) => line.price * line.qty;

export function totals(cart) {
  const subtotal = cart.reduce((sum, line) => sum + lineTotal(line), 0);
  const tax = Math.round(subtotal * TAX_RATE); // rounded once for the whole order, not line by line
  return { subtotal, tax, total: subtotal + tax };
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
