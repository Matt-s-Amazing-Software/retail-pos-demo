// The Close session screen: count the drawer blind, then see how it compares with what was expected.
import { registerScreen, draw } from "./router.js";
import { DENOMINATIONS, countedTotal, expectedCash, variance } from "./cashcount.js";
import { money } from "./money.js";
import { newSession, save, state } from "./store.js";

function render(root) {
  const s = state.session;
  if (s.closedAt) {
    const v = s.result.variance;
    root.innerHTML = `
      <section class="panel" aria-label="Close session">
        <h2>Session closed</h2>
        <dl class="totals" data-testid="closeout-result">
          <div><dt>Counted</dt><dd>${money(s.result.counted)}</dd></div>
          <div><dt>Expected</dt><dd>${money(s.result.expected)}</dd></div>
          <div class="grand"><dt>Variance</dt><dd data-testid="variance">${v === 0 ? "None" : (v > 0 ? "Over " : "Short ") + money(Math.abs(v))}</dd></div>
        </dl>
        <button class="primary" data-testid="start-session">Start a new session</button>
      </section>`;
    root.querySelector("[data-testid=start-session]").addEventListener("click", () => {
      state.session = newSession();
      save();
      location.hash = "#/register";
      draw();
    });
    return;
  }
  root.innerHTML = `
    <section class="panel" aria-label="Close session">
      <h2>Close session</h2>
      <p class="muted">Count what is in the drawer, including the opening float. The expected amount is shown after you submit.</p>
      <form id="count-form">
        <table>
          <tbody>
          ${DENOMINATIONS.map((d) => `
            <tr><td><label for="d-${d.cents}">${d.label}</label></td>
            <td><input id="d-${d.cents}" name="d-${d.cents}" type="number" min="0" value="0" data-testid="count-${d.cents}"></td></tr>`).join("")}
          </tbody>
        </table>
        <p>Counted so far <strong data-testid="counted-total">${money(0)}</strong></p>
        <button class="primary" type="submit" data-testid="submit-count">Submit count and close</button>
      </form>
    </section>`;
  const form = root.querySelector("#count-form");
  const read = () => Object.fromEntries(DENOMINATIONS.map((d) => [d.cents, form[`d-${d.cents}`].value]));
  form.addEventListener("input", () => {
    root.querySelector("[data-testid=counted-total]").textContent = money(countedTotal(read()));
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const counted = countedTotal(read());
    const expected = expectedCash(s, state.sales, state.returns);
    s.closedAt = new Date().toISOString();
    s.result = { counted, expected, variance: variance(counted, expected) };
    save();
    draw();
  });
}

registerScreen("/closeout", "Close session", render);
