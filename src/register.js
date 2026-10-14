// The Register screen: pick products, adjust the current order.
import { registerScreen, draw } from "./router.js";
import { addItem, changeQty, lineTotal, removeItem, totals } from "./cart.js";
import { money } from "./money.js";
import { holdOrder, resumeOrder } from "./held.js";
import { canAdd, inCart, isLow, stockOf } from "./stock.js";
import { save, state } from "./store.js";

let message = null;

// Add one product to the order unless the shelf cannot cover it. Used by the buttons, the + button and the shortcuts.
function tryAdd(product) {
  const check = canAdd(product, state.cart);
  if (!check.ok) message = check.message;
  else addItem(state.cart, product);
  save();
  draw();
}

function render(root) {
  const t = totals(state.cart, state.discount, state.settings.taxRate);
  const closed = Boolean(state.session.closedAt);
  const shown = message;
  message = null;
  root.innerHTML = `
    ${shown ? `<p class="notice error" role="status" data-testid="register-message">${shown}</p>` : ""}
    ${closed ? '<p class="notice error" role="status" data-testid="session-closed">The session is closed. Start a new session on the Close session screen to keep selling.</p>' : ""}
    <div class="register">
      <section class="panel" aria-label="Products">
        <h2>Products</h2>
        <div class="grid">
          ${state.catalog.filter((p) => p.active).map((p) => `
            <button data-testid="product-${p.sku}" data-sku="${p.sku}" ${closed || stockOf(p) === 0 ? "disabled" : ""} aria-label="Add ${p.name}, ${money(p.price)}">
              <strong>${p.name}</strong><br><span class="muted">${money(p.price)}</span>
              ${stockOf(p) === 0 ? '<br><span class="tag out" data-testid="out-' + p.sku + '">Out of stock</span>'
                : isLow(p, state.settings.lowStock ?? 5) ? '<br><span class="tag low">Only ' + stockOf(p) + ' left</span>' : ""}
            </button>`).join("")}
        </div>
        <p class="muted hint">Shortcuts: <kbd>1</kbd>&ndash;<kbd>${state.catalog.filter((p) => p.active).length}</kbd> add a product, <kbd>P</kbd> go to payment.</p>
      </section>
      <section class="panel" aria-label="Current order">
        <h2>Current order</h2>
        ${state.cart.length === 0 ? '<p class="muted" data-testid="cart-empty">No items yet. Choose a product.</p>' : `
        <table data-testid="cart-lines">
          <tbody>
          ${state.cart.map((l) => `
            <tr data-sku="${l.sku}">
              <td>${l.name}</td>
              <td class="qty">
                <button aria-label="Decrease ${l.name}" data-act="dec" data-sku="${l.sku}">&minus;</button>
                <span data-testid="qty-${l.sku}">${l.qty}</span>
                <button aria-label="Increase ${l.name}" data-act="inc" data-sku="${l.sku}">+</button>
              </td>
              <td class="num">${money(lineTotal(l))}</td>
              <td><button aria-label="Remove ${l.name}" data-act="rm" data-sku="${l.sku}">Remove</button></td>
            </tr>`).join("")}
          </tbody>
        </table>`}
        <dl class="totals">
          <div><dt>Subtotal</dt><dd data-testid="subtotal">${money(t.subtotal)}</dd></div>
          ${t.discount ? `<div><dt>Discount</dt><dd data-testid="discount">&minus;${money(t.discount)}</dd></div>` : ""}
          <div><dt>Tax</dt><dd data-testid="tax">${money(t.tax)}</dd></div>
          <div class="grand"><dt>Total</dt><dd data-testid="total">${money(t.total)}</dd></div>
        </dl>
        <p><label>Order note <input name="note" id="order-note" maxlength="120" size="30" value="${state.orderNote.replace(/"/g, "&quot;")}" placeholder="Optional, shown on the receipt" data-testid="order-note"></label></p>
        <form id="discount-form" class="discount">
          <label>Discount
            <select name="type" data-testid="discount-type"><option value="percent">Percent off</option><option value="amount">Dollars off</option></select>
          </label>
          <input name="value" inputmode="decimal" size="6" aria-label="Discount value" data-testid="discount-value" value="${state.discount ? (state.discount.type === "percent" ? state.discount.value : (state.discount.value / 100).toFixed(2)) : ""}">
          <button type="submit" data-testid="apply-discount" ${state.cart.length === 0 || closed ? "disabled" : ""}>Apply</button>
          ${state.discount ? '<button type="button" data-testid="remove-discount">Remove</button>' : ""}
        </form>
        <p>
        <button data-testid="hold-order" ${state.cart.length === 0 || closed ? "disabled" : ""}>Hold order</button>
        <button class="primary" data-testid="go-to-payment" ${state.cart.length === 0 || closed ? "disabled" : ""}>Go to payment</button></p>
      </section>
    </div>
    ${state.held.length === 0 ? "" : `
    <section class="panel held" aria-label="Held orders">
      <h2>Held orders</h2>
      <ul>
        ${state.held.map((h) => `<li>Held order ${h.id} &middot; ${h.lines.reduce((n, l) => n + l.qty, 0)} items
          <button data-testid="resume-${h.id}" data-resume="${h.id}" ${closed ? "disabled" : ""}>Resume</button></li>`).join("")}
      </ul>
    </section>`}`;

  root.querySelector("#order-note").addEventListener("change", (event) => {
    state.orderNote = event.target.value.trim();
    save();
  });
  root.querySelector("#discount-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const f = event.target;
    const amount = parseFloat(f.value.value);
    if (!(amount > 0)) message = "Enter a discount above zero.";
    else if (f.type.value === "percent" && amount > 100) message = "A percentage discount cannot be more than 100.";
    else state.discount = f.type.value === "percent" ? { type: "percent", value: amount } : { type: "amount", value: Math.round(amount * 100) };
    save();
    draw();
  });
  const removeDiscount = root.querySelector("[data-testid=remove-discount]");
  if (removeDiscount) removeDiscount.addEventListener("click", () => { state.discount = null; save(); draw(); });
  root.querySelector("[data-testid=hold-order]").addEventListener("click", () => {
    const result = holdOrder(state.held, state.cart);
    if (result.error) message = result.error;
    else {
      state.held = result.held;
      state.cart = [];
      state.orderNote = "";
    }
    save();
    draw();
  });
  root.querySelectorAll("[data-resume]").forEach((b) =>
    b.addEventListener("click", () => {
      const result = resumeOrder(state.held, state.cart, Number(b.dataset.resume));
      if (result.error) message = result.error;
      else {
        state.held = result.held;
        state.cart = result.cart;
      }
      save();
      draw();
    }));
  root.querySelector("[data-testid=go-to-payment]").addEventListener("click", () => {
    location.hash = "#/payment";
  });
  root.querySelectorAll("[data-testid^=product-]").forEach((b) =>
    b.addEventListener("click", () => {
      tryAdd(state.catalog.find((p) => p.sku === b.dataset.sku));
    }));
  root.querySelectorAll("[data-act]").forEach((b) =>
    b.addEventListener("click", () => {
      const { act, sku } = b.dataset;
      if (act === "inc") {
        const check = canAdd(state.catalog.find((p) => p.sku === sku), state.cart);
        if (check.ok) state.cart = changeQty(state.cart, sku, 1);
        else message = check.message;
      }
      if (act === "dec") state.cart = changeQty(state.cart, sku, -1);
      if (act === "rm") state.cart = removeItem(state.cart, sku);
      save();
      draw();
    }));
}

// Keyboard shortcuts work only on this screen, and never while typing in a field.
document.addEventListener("keydown", (event) => {
  if (location.hash !== "" && !location.hash.startsWith("#/register")) return;
  if (event.metaKey || event.ctrlKey || event.altKey || state.session.closedAt) return;
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName)) return;
  const active = state.catalog.filter((p) => p.active);
  if (/^[1-9]$/.test(event.key) && active[Number(event.key) - 1]) {
    tryAdd(active[Number(event.key) - 1]);
  } else if (event.key.toLowerCase() === "p" && state.cart.length > 0) {
    location.hash = "#/payment";
  }
});

registerScreen("/register", "Register", render);
