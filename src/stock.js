// Stock levels. Pure functions on the catalog (a list of products with a `stock` count) and the cart.
// A product with no stock figure (older saved data) is treated as unlimited.
export const stockOf = (product) => (Number.isFinite(product.stock) ? product.stock : Infinity);

export const inCart = (cart, sku) => (cart.find((l) => l.sku === sku) || { qty: 0 }).qty;

// May one more of this product be added to the order? Returns { ok: true } or { ok: false, message }.
export function canAdd(product, cart) {
  const stock = stockOf(product);
  if (stock <= 0) return { ok: false, message: `${product.name} is out of stock.` };
  if (inCart(cart, product.sku) >= stock) return { ok: false, message: `Only ${stock} of ${product.name} in stock.` };
  return { ok: true };
}

export const isLow = (product, threshold) => stockOf(product) > 0 && stockOf(product) <= threshold;

// Take sold items off the shelf (never below zero).
export const applySale = (catalog, lines) =>
  catalog.map((p) => {
    const sold = lines.filter((l) => l.sku === p.sku).reduce((n, l) => n + l.qty, 0);
    return sold && Number.isFinite(p.stock) ? { ...p, stock: Math.max(0, p.stock - sold) } : p;
  });

// Put returned items back on the shelf.
export const applyReturn = (catalog, items) =>
  catalog.map((p) => {
    const back = items.filter((i) => i.sku === p.sku).reduce((n, i) => n + i.qty, 0);
    return back && Number.isFinite(p.stock) ? { ...p, stock: p.stock + back } : p;
  });

export const setStock = (catalog, sku, stock) => catalog.map((p) => (p.sku === sku ? { ...p, stock } : p));

// What a manager typed into a stock box: a whole number of 0 or more, or null.
export function parseStock(text) {
  const t = String(text ?? "").trim();
  return /^\d{1,6}$/.test(t) ? Number(t) : null;
}
