// The Receipt screen: a printable record of one sale.
import { registerScreen, currentQuery } from "./router.js";
import { lineTotal } from "./cart.js";
import { money } from "./money.js";
import { methodLabel } from "./payments.js";
import { state } from "./store.js";

function render(root) {
  const sale = state.sales.find((s) => String(s.id) === currentQuery().order);
  if (!sale) {
    root.innerHTML = '<section class="panel"><h2>Receipt</h2><p class="muted" data-testid="receipt-missing">That order was not found.</p></section>';
    return;
  }
  root.innerHTML = `
    <section class="panel receipt" aria-label="Receipt" data-testid="receipt">
      <h2>${state.settings.storeName}</h2>
      ${sale.voided ? `<p class="notice error" data-testid="receipt-voided">VOIDED &mdash; ${sale.voided.reason}</p>` : ""}
      <p class="muted">Order ${sale.id} &middot; ${new Date(sale.at).toLocaleString("en-US")}</p>
      <table>
        <tbody>
        ${sale.lines.map((l) => `<tr><td>${l.name}</td><td class="num">${l.qty} &times; ${money(l.price)}</td><td class="num">${money(lineTotal(l))}</td></tr>`).join("")}
        </tbody>
      </table>
      <dl class="totals">
        <div><dt>Subtotal</dt><dd>${money(sale.subtotal)}</dd></div>
        ${sale.discount ? `<div><dt>Discount</dt><dd>&minus;${money(sale.discount)}</dd></div>` : ""}
        <div><dt>Tax</dt><dd>${money(sale.tax)}</dd></div>
        <div class="grand"><dt>Total</dt><dd>${money(sale.total)}</dd></div>
        <div><dt>Paid by ${methodLabel(sale.method)}${sale.giftCard ? ` ${sale.giftCard}` : ""}</dt><dd>${money(sale.tendered)}</dd></div>
        ${sale.change ? `<div><dt>Change</dt><dd>${money(sale.change)}</dd></div>` : ""}
        ${sale.giftCard ? `<div data-testid="receipt-gift-balance"><dt>Gift card balance</dt><dd>${money(sale.giftBalance)}</dd></div>` : ""}
      </dl>
      <p class="muted">Thank you for shopping with us.</p>
      <p class="no-print"><button class="primary" data-testid="print-receipt">Print receipt</button></p>
    </section>`;
  root.querySelector("[data-testid=print-receipt]").addEventListener("click", () => window.print());
}

registerScreen("/receipt", "Receipt", render, { hidden: true });
