// Rules for the product catalog an admin edits. Pure functions on a list of products.
export function validateProduct(catalog, product, { isNew = true } = {}) {
  const sku = String(product.sku || "").trim().toUpperCase();
  if (!/^[A-Z0-9-]{3,12}$/.test(sku)) return "The SKU must be 3 to 12 letters, digits or dashes.";
  if (isNew && catalog.some((p) => p.sku === sku)) return "A product with that SKU already exists.";
  if (!String(product.name || "").trim()) return "Give the product a name.";
  if (!Number.isInteger(product.price) || product.price <= 0) return "The price must be above zero.";
  if (!Number.isInteger(product.stock) || product.stock < 0) return "Stock must be a whole number of 0 or more.";
  return null;
}

export function addProduct(catalog, product) {
  return [...catalog, { sku: product.sku.trim().toUpperCase(), name: product.name.trim(), price: product.price, stock: product.stock, active: true }];
}

export const setActive = (catalog, sku, active) => catalog.map((p) => (p.sku === sku ? { ...p, active } : p));
export const setPrice = (catalog, sku, price) => catalog.map((p) => (p.sku === sku ? { ...p, price } : p));
