// Sales summary for the current session. Pure functions on the sales and returns lists.
export function salesSummary(sales, returns, since) {
  const inSession = (x) => x.at >= since;
  const mine = sales.filter(inSession);
  const back = returns.filter(inSession);
  const sum = (list, key) => list.reduce((n, x) => n + (x[key] || 0), 0);
  const byMethod = {};
  for (const s of mine) byMethod[s.method] = (byMethod[s.method] || 0) + s.total;
  const units = {};
  for (const s of mine) for (const l of s.lines) units[l.name] = (units[l.name] || 0) + l.qty;
  for (const r of back) {
    const sale = sales.find((s) => s.id === r.orderId);
    for (const item of r.items) {
      const name = sale.lines.find((l) => l.sku === item.sku).name;
      units[name] = (units[name] || 0) - item.qty;
    }
  }
  const topProducts = Object.entries(units).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const gross = sum(mine, "subtotal");
  const refunds = sum(back, "total");
  return { orders: mine.length, gross, discounts: sum(mine, "discount"), tax: sum(mine, "tax"), takings: sum(mine, "total"),
           refunds, net: sum(mine, "total") - refunds, byMethod, topProducts };
}
