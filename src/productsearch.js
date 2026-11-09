// Finding a product on the register. Pure.
export function filterProducts(products, query) {
  const q = String(query || "").trim().toLowerCase();
  return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
}
