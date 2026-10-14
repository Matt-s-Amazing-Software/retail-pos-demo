// The Orders screen: every sale so far, with a search box.
import { registerScreen, draw } from "./router.js";
import { filterOrders, orderStatus } from "./orders.js";
import { ordersToCsv } from "./csv.js";
import { USERS } from "./users.js";
import { money } from "./money.js";
import { methodLabel } from "./payments.js";
import { markVoided, voidProblem } from "./voids.js";
import { applyReturn } from "./stock.js";
import { refundToCard } from "./giftcards.js";
import { noticeHtml } from "./notice.js";
import { save, state } from "./store.js";

function downloadCsv() {
  const blob = new Blob([ordersToCsv(filterOrders(state.sales, ""))], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "orders.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

let query = "";
let voiding = null; // the order number whose void form is open
let message = null;

function render(root) {
  const shown = message;
  message = null;
  const orders = filterOrders(state.sales, query);
  const manager = (USERS.find((u) => u.id === state.currentUser) || {}).role === "manager"; // only managers export
  root.innerHTML = `
    <section class="panel" aria-label="Orders">
      <h2>Orders</h2>
      ${noticeHtml(shown, "orders-message")}
      <form id="order-search"><label>Search <input name="q" value="${query}" placeholder="Order number or product" data-testid="order-search"></label>
        <button type="submit">Search</button>
        ${manager ? '<button type="button" data-testid="export-csv">Export CSV</button>' : ""}</form>
      ${orders.length === 0 ? '<p class="muted" data-testid="no-orders">No orders to show.</p>' : `
      <table data-testid="orders-table">
        <thead><tr><th align="left">Order</th><th align="left">Time</th><th align="left">Items</th><th align="left">Paid by</th><th align="left">Total</th><th align="left">Status</th><th></th></tr></thead>
        <tbody>
        ${orders.map((s) => `
          <tr data-order="${s.id}">
            <td>${s.id}</td><td>${new Date(s.at).toLocaleString("en-US")}</td>
            <td>${s.lines.reduce((n, l) => n + l.qty, 0)}</td><td>${methodLabel(s.method)}</td><td class="num">${money(s.total)}</td>
            <td>${orderStatus(s, state.returns)}</td><td><a href="#/receipt?order=${s.id}">Receipt</a>
              ${manager && !s.voided ? ` <button data-void="${s.id}" data-testid="void-${s.id}">Void</button>` : ""}</td>
          </tr>`).join("")}
        </tbody>
      </table>`}
      ${voiding ? `
      <form id="void-form" class="panel" aria-label="Void order ${voiding}">
        <h3>Void order ${voiding}</h3>
        <p class="muted">Voiding cancels the sale: the items go back on the shelf and the money is taken off the day's figures.</p>
        <p><label>Reason <input name="reason" data-testid="void-reason" size="40"></label></p>
        <button class="primary" type="submit" data-testid="confirm-void">Confirm void</button>
        <button type="button" data-testid="cancel-void">Cancel</button>
      </form>` : ""}
    </section>`;
  root.querySelectorAll("[data-void]").forEach((b) => b.addEventListener("click", () => { voiding = Number(b.dataset.void); draw(); }));
  const voidForm = root.querySelector("#void-form");
  if (voidForm) {
    voidForm.querySelector("[data-testid=cancel-void]").addEventListener("click", () => { voiding = null; draw(); });
    voidForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const sale = state.sales.find((x) => x.id === voiding);
      const user = USERS.find((u) => u.id === state.currentUser);
      const problem = voidProblem(sale, state.returns, state.session, user, voidForm.reason.value);
      if (problem) message = { error: true, text: problem };
      else {
        state.sales = state.sales.map((x) => (x.id === sale.id ? markVoided(x, user, voidForm.reason.value) : x));
        state.catalog = applyReturn(state.catalog, sale.lines);
        if (sale.giftCard) state.giftCards = refundToCard(state.giftCards, sale.giftCard, sale.total);
        message = { error: false, text: `Order ${sale.id} voided.` };
        voiding = null;
        save();
      }
      draw();
    });
  }
  const exportButton = root.querySelector("[data-testid=export-csv]");
  if (exportButton) exportButton.addEventListener("click", downloadCsv);
  root.querySelector("#order-search").addEventListener("submit", (event) => {
    event.preventDefault();
    query = event.target.q.value;
    draw();
  });
}

registerScreen("/orders", "Orders", render);
