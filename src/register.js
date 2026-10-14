// The Register screen: pick products, adjust the current order.
import { registerScreen, draw } from "./router.js";
import { PRODUCTS } from "./catalog.js";
import { addItem, changeQty, lineTotal, removeItem, totals } from "./cart.js";
import { money } from "./money.js";
import { save, state } from "./store.js";

function render(root) {
  const t = totals(state.cart);
  const closed = Boolean(state.session.closedAt);
  root.innerHTML = `
    ${closed ? '<p class="notice error" role="status" data-testid="session-closed">The session is closed. Start a new session on the Close session screen to keep selling.</p>' : ""}
    <div class="register">
      <section class="panel" aria-label="Products">
        <h2>Products</h2>
        <div class="grid">
          ${PRODUCTS.map((p) => `
            <button data-testid="product-${p.sku}" data-sku="${p.sku}" ${closed ? "disabled" : ""} aria-label="Add ${p.name}, ${money(p.price)}">
              <strong>${p.name}</strong><br><span class="muted">${money(p.price)}</span>
            </button>`).join("")}
        </div>
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
          <div><dt>Tax</dt><dd data-testid="tax">${money(t.tax)}</dd></div>
          <div class="grand"><dt>Total</dt><dd data-testid="total">${money(t.total)}</dd></div>
        </dl>
        <p><button class="primary" data-testid="go-to-payment" ${state.cart.length === 0 || closed ? "disabled" : ""}>Go to payment</button></p>
      </section>
    </div>`;

  root.querySelector("[data-testid=go-to-payment]").addEventListener("click", () => {
    location.hash = "#/payment";
  });
  root.querySelectorAll("[data-testid^=product-]").forEach((b) =>
    b.addEventListener("click", () => {
      addItem(state.cart, PRODUCTS.find((p) => p.sku === b.dataset.sku));
      save();
      draw();
    }));
  root.querySelectorAll("[data-act]").forEach((b) =>
    b.addEventListener("click", () => {
      const { act, sku } = b.dataset;
      if (act === "inc") state.cart = changeQty(state.cart, sku, 1);
      if (act === "dec") state.cart = changeQty(state.cart, sku, -1);
      if (act === "rm") state.cart = removeItem(state.cart, sku);
      save();
      draw();
    }));
}

registerScreen("/register", "Register", render);
