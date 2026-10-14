// The Payment screen: amount due beside a read-only summary of the current order.
import { registerScreen } from "./router.js";
import { lineTotal, totals } from "./cart.js";
import { money } from "./money.js";
import { state } from "./store.js";

function render(root) {
  const t = totals(state.cart);
  root.innerHTML = `
    <div class="register">
      <section class="panel" aria-label="Payment">
        <h2>Payment</h2>
        <p class="due">Amount due <strong data-testid="amount-due">${money(t.total)}</strong></p>
        ${state.cart.length === 0 ? '<p class="muted">There is nothing to pay. Add products on the Register screen.</p>' : ""}
      </section>
      <aside class="panel" aria-label="Order summary" data-testid="order-summary">
        <h2>Order summary</h2>
        ${state.cart.length === 0 ? '<p class="muted">The order is empty.</p>' : `
        <table>
          <tbody>
          ${state.cart.map((l) => `
            <tr><td>${l.name}</td><td class="num">${l.qty} &times; ${money(l.price)}</td><td class="num">${money(lineTotal(l))}</td></tr>`).join("")}
          </tbody>
        </table>`}
        <dl class="totals">
          <div><dt>Subtotal</dt><dd>${money(t.subtotal)}</dd></div>
          <div><dt>Tax</dt><dd>${money(t.tax)}</dd></div>
          <div class="grand"><dt>Total</dt><dd>${money(t.total)}</dd></div>
        </dl>
      </aside>
    </div>`;
}

registerScreen("/payment", "Payment", render);
