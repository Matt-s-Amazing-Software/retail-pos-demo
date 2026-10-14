// The Returns screen: find a past sale by its order number and refund some or all of it.
import { registerScreen, draw } from "./router.js";
import { money } from "./money.js";
import { noticeHtml } from "./notice.js";
import { REASONS, refundFor, returnableQty, validateReturn } from "./refunds.js";
import { save, state } from "./store.js";

let lookup = ""; // the order number being worked on
let message = null;

function render(root) {
  const shown = message;
  message = null;
  const sale = state.sales.find((s) => String(s.id) === String(lookup).trim());
  const left = sale ? returnableQty(sale, state.returns) : {};
  root.innerHTML = `
    <section class="panel" aria-label="Returns">
      <h2>Returns</h2>
      ${noticeHtml(shown, "return-message")}
      <form id="find-form">
        <label>Order number <input name="order" inputmode="numeric" autocomplete="off" value="${lookup}" data-testid="order-number"></label>
        <button type="submit" data-testid="find-order">Find order</button>
      </form>
      ${lookup && !sale ? '<p class="muted" data-testid="order-not-found">No order with that number.</p>' : ""}
      ${sale ? `
      <form id="return-form">
        <h3>Order ${sale.id} <span class="muted">paid by ${sale.method}</span></h3>
        <table>
          <tbody>
          ${sale.lines.map((l) => `
            <tr>
              <td>${l.name}</td>
              <td class="muted">sold ${l.qty}, returnable ${left[l.sku]}</td>
              <td><input type="number" min="0" max="${left[l.sku]}" value="0" name="qty-${l.sku}" aria-label="Quantity to return, ${l.name}" ${left[l.sku] === 0 ? "disabled" : ""}></td>
            </tr>`).join("")}
          </tbody>
        </table>
        <p><label>Reason <select name="reason" data-testid="return-reason">
          <option value="">Choose a reason</option>
          ${REASONS.map((r) => `<option>${r}</option>`).join("")}</select></label></p>
        <button class="primary" type="submit" data-testid="refund">Refund</button>
      </form>` : ""}
    </section>`;

  root.querySelector("#find-form").addEventListener("submit", (event) => {
    event.preventDefault();
    lookup = event.target.order.value;
    draw();
  });
  const form = root.querySelector("#return-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const items = sale.lines
        .map((l) => ({ sku: l.sku, qty: Number(form[`qty-${l.sku}`].value) }))
        .filter((item) => item.qty > 0);
      const error = validateReturn(sale, state.returns, items, form.reason.value);
      if (error) {
        message = { error: true, text: error };
      } else {
        const refund = refundFor(sale, items);
        state.returns.push({ id: state.nextReturn++, orderId: sale.id, at: new Date().toISOString(),
          items, reason: form.reason.value, method: sale.method, ...refund });
        message = { error: false, text: `Refunded ${money(refund.total)} to the original payment method (${sale.method}).` };
        save();
      }
      draw();
    });
  }
}

registerScreen("/returns", "Returns", render);
