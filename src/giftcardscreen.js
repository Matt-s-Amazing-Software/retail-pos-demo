// The Gift cards screen (manager): issue a gift card and see every card's balance.
import { registerScreen, draw } from "./router.js";
import { issueCard } from "./giftcards.js";
import { money } from "./money.js";
import { noticeHtml } from "./notice.js";
import { parseAmount } from "./payments.js";
import { save, state } from "./store.js";

let message = null;

function render(root) {
  const shown = message;
  message = null;
  root.innerHTML = `
    <section class="panel" aria-label="Gift cards">
      <h2>Gift cards</h2>
      ${noticeHtml(shown, "giftcard-message")}
      <form id="issue-card">
        <label>Amount ($) <input name="amount" inputmode="decimal" size="8" data-testid="giftcard-amount"></label>
        <button class="primary" type="submit" data-testid="issue-giftcard">Issue gift card</button>
      </form>
      ${state.giftCards.length === 0 ? '<p class="muted" data-testid="no-giftcards">No gift cards have been issued.</p>' : `
      <table data-testid="giftcards-table">
        <thead><tr><th align="left">Number</th><th align="left">Balance</th><th align="left">Issued</th></tr></thead>
        <tbody>
        ${[...state.giftCards].reverse().map((c) => `<tr data-card="${c.code}"><td>${c.code}</td><td class="num">${money(c.balance)}</td><td>${new Date(c.issuedAt).toLocaleString("en-US")}</td></tr>`).join("")}
        </tbody>
      </table>`}
    </section>`;
  root.querySelector("#issue-card").addEventListener("submit", (event) => {
    event.preventDefault();
    const result = issueCard(state.giftCards, parseAmount(event.target.amount.value));
    if (result.error) message = { error: true, text: result.error };
    else {
      state.giftCards = result.cards;
      message = { error: false, text: `Gift card ${result.card.code} issued for ${money(result.card.balance)}.` };
      save();
    }
    draw();
  });
}

registerScreen("/giftcards", "Gift cards", render);
