// Looking up past orders. Pure functions.
// An order's status says whether any of it has been returned.
export function orderStatus(sale, returns) {
  const sold = sale.lines.reduce((n, l) => n + l.qty, 0);
  const back = returns.filter((r) => r.orderId === sale.id).reduce((n, r) => n + r.items.reduce((m, i) => m + i.qty, 0), 0);
  if (back === 0) return "Paid";
  return back >= sold ? "Refunded" : "Partly refunded";
}

// Newest first. A query matches the order number exactly, or a product name or SKU on the order.
export function filterOrders(sales, query) {
  const q = String(query || "").trim().toLowerCase();
  const matches = (s) =>
    !q || String(s.id) === q || s.lines.some((l) => l.name.toLowerCase().includes(q) || l.sku.toLowerCase().includes(q));
  return [...sales].filter(matches).sort((a, b) => b.id - a.id);
}
