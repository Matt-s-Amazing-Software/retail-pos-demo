// The Reports screen (manager): what this session has sold so far.
import { registerScreen } from "./router.js";
import { salesSummary } from "./reports.js";
import { money } from "./money.js";
import { methodLabel } from "./payments.js";
import { state } from "./store.js";

function render(root) {
  const r = salesSummary(state.sales, state.returns, state.session.openedAt);
  root.innerHTML = `
    <section class="panel" aria-label="Reports">
      <h2>Sales this session</h2>
      <dl class="totals" data-testid="report-totals">
        <div><dt>Orders</dt><dd data-testid="report-orders">${r.orders}</dd></div>
        <div><dt>Gross sales</dt><dd>${money(r.gross)}</dd></div>
        <div><dt>Discounts</dt><dd>&minus;${money(r.discounts)}</dd></div>
        <div><dt>Tax collected</dt><dd>${money(r.tax)}</dd></div>
        <div><dt>Refunds</dt><dd>&minus;${money(r.refunds)}</dd></div>
        <div class="grand"><dt>Net takings</dt><dd data-testid="report-net">${money(r.net)}</dd></div>
      </dl>
      <h3>By payment method</h3>
      ${Object.keys(r.byMethod).length === 0 ? '<p class="muted">No sales yet.</p>' : `<ul>${Object.entries(r.byMethod).map(([m, c]) => `<li>${methodLabel(m)}: ${money(c)}</li>`).join("")}</ul>`}
      <h3>Top products</h3>
      ${r.topProducts.length === 0 ? '<p class="muted">Nothing sold yet.</p>' : `<ol data-testid="top-products">${r.topProducts.slice(0, 5).map(([name, n]) => `<li>${name} &times; ${n}</li>`).join("")}</ol>`}
    </section>`;
}

registerScreen("/reports", "Reports", render);
