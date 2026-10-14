// The Orders screen: every sale so far, with a search box.
import { registerScreen, draw } from "./router.js";
import { filterOrders, orderStatus } from "./orders.js";
import { money } from "./money.js";
import { state } from "./store.js";

let query = "";

function render(root) {
  const orders = filterOrders(state.sales, query);
  root.innerHTML = `
    <section class="panel" aria-label="Orders">
      <h2>Orders</h2>
      <form id="order-search"><label>Search <input name="q" value="${query}" placeholder="Order number or product" data-testid="order-search"></label>
        <button type="submit">Search</button></form>
      ${orders.length === 0 ? '<p class="muted" data-testid="no-orders">No orders to show.</p>' : `
      <table data-testid="orders-table">
        <thead><tr><th align="left">Order</th><th align="left">Time</th><th align="left">Items</th><th align="left">Paid by</th><th align="left">Total</th><th align="left">Status</th><th></th></tr></thead>
        <tbody>
        ${orders.map((s) => `
          <tr data-order="${s.id}">
            <td>${s.id}</td><td>${new Date(s.at).toLocaleString("en-US")}</td>
            <td>${s.lines.reduce((n, l) => n + l.qty, 0)}</td><td>${s.method}</td><td class="num">${money(s.total)}</td>
            <td>${orderStatus(s, state.returns)}</td><td><a href="#/receipt?order=${s.id}">Receipt</a></td>
          </tr>`).join("")}
        </tbody>
      </table>`}
    </section>`;
  root.querySelector("#order-search").addEventListener("submit", (event) => {
    event.preventDefault();
    query = event.target.q.value;
    draw();
  });
}

registerScreen("/orders", "Orders", render);
