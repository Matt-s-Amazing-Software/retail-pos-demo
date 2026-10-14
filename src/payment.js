// The Payment screen: amount due beside a read-only summary of the current order.
import { registerScreen, draw } from "./router.js";
import { lineTotal, totals } from "./cart.js";
import { money } from "./money.js";
import { noticeHtml } from "./notice.js";
import { parseAmount, settle } from "./payments.js";
import { save, state } from "./store.js";

let message = null; // the result of the last attempt, shown once

function completeSale(t, method, tendered) {
  if (state.session.closedAt) {
    message = { error: true, text: "The session is closed. Start a new session to keep selling." };
    return;
  }
  const result = settle({ method, total: t.total, tendered });
  if (!result.ok) {
    message = { error: true, text: result.error };
    return;
  }
  const id = state.nextOrder++;
  state.sales = [...state.sales, {
    id, at: new Date().toISOString(), lines: state.cart.map((l) => ({ ...l })), ...t,
    method, tendered: result.tendered, change: result.change,
  }];
  state.cart = [];
  state.discount = null;
  message = { error: false, text: `Sale ${id} complete.` + (method === "cash" ? ` Change due ${money(result.change)}.` : "")
    + ` <a href="#/receipt?order=${id}" data-testid="view-receipt">View receipt</a>` };
}

function render(root) {
  const t = totals(state.cart, state.discount, state.settings.taxRate);
  const shown = message; // a result is displayed once, then forgotten
  message = null;
  root.innerHTML = `
    <div class="register">
      <section class="panel" aria-label="Payment">
        <h2>Payment</h2>
        <p class="due">Amount due <strong data-testid="amount-due">${money(t.total)}</strong></p>
        ${noticeHtml(shown, "payment-message")}
        ${state.cart.length === 0 ? '<p class="muted">There is nothing to pay. Add products on the Register screen.</p>' : `
        <form id="pay-form">
          <fieldset>
            <legend>Payment method</legend>
            <label><input type="radio" name="method" value="cash" checked> Cash</label>
            <label><input type="radio" name="method" value="card"> Card</label>
          </fieldset>
          <p id="cash-row"><label>Cash received <input name="tendered" inputmode="decimal" autocomplete="off" data-testid="cash-received"></label></p>
          <button class="primary" type="submit" data-testid="complete-sale">Complete sale</button>
        </form>`}
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
          ${t.discount ? `<div><dt>Discount</dt><dd>&minus;${money(t.discount)}</dd></div>` : ""}
          <div><dt>Tax</dt><dd>${money(t.tax)}</dd></div>
          <div class="grand"><dt>Total</dt><dd>${money(t.total)}</dd></div>
        </dl>
      </aside>
    </div>`;

  const form = root.querySelector("#pay-form");
  if (form) {
    const cashRow = form.querySelector("#cash-row");
    form.addEventListener("change", () => {
      cashRow.hidden = form.method.value === "card";
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      completeSale(t, form.method.value, parseAmount(form.tendered.value));
      save();
      draw();
    });
  }
}

registerScreen("/payment", "Payment", render);
