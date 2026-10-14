// Cart arithmetic. Pure functions on a cart (a list of lines), so they are easy to test.
export const TAX_RATE = 0.0825;

export const lineTotal = (line) => line.price * line.qty;

export function totals(cart) {
  const subtotal = cart.reduce((sum, line) => sum + lineTotal(line), 0);
  const tax = cart.reduce((sum, line) => sum + Math.round(lineTotal(line) * TAX_RATE), 0);
  return { subtotal, tax, total: subtotal + tax };
}

export function addItem(cart, product) {
  const existing = cart.find((line) => line.sku === product.sku);
  if (existing) existing.qty += 1;
  else cart.push({ sku: product.sku, name: product.name, price: product.price, qty: 1 });
  return cart;
}

export function changeQty(cart, sku, delta) {
  const line = cart.find((l) => l.sku === sku);
  if (line) line.qty += delta;
  return cart;
}

export function removeItem(cart, sku) {
  return cart.filter((line) => line.sku !== sku);
}
