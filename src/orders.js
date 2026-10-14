// Looking up past orders. Pure functions.
// An order's status says whether any of it has been returned.
export function orderStatus(sale, returns) {
  if (sale.voided) return "Voided";
  const sold = sale.lines.reduce((n, l) => n + l.qty, 0);
  const back = returns.filter((r) => r.orderId === sale.id).reduce((n, r) => n + r.items.reduce((m, i) => m + i.qty, 0), 0);
  if (back === 0) return "Paid";
  return back >= sold ? "Refunded" : "Partly refunded";
}

// Newest first. A query matches the order number exactly, or a product name or SKU on the order.
// `from` and `to` are optional dates (YYYY-MM-DD, the shop's local days, both included).
export function filterOrders(sales, query, from = "", to = "") {
  const q = String(query || "").trim().toLowerCase();
  const day = (s) => {
    const d = new Date(s.at);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const inRange = (s) => (!from || day(s) >= from) && (!to || day(s) <= to);
  const matches = (s) =>
    !q || String(s.id) === q || s.lines.some((l) => l.name.toLowerCase().includes(q) || l.sku.toLowerCase().includes(q));
  return [...sales].filter((s) => matches(s) && inRange(s)).sort((a, b) => b.id - a.id);
}
