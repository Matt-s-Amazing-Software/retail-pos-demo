// The Activity screen (manager): a log of what people did, with a category filter.
import { registerScreen, draw } from "./router.js";
import { CATEGORIES, filterActivity } from "./activity.js";
import { state } from "./store.js";

let category = "";

function render(root) {
  const entries = filterActivity(state.activity, category);
  root.innerHTML = `
    <section class="panel" aria-label="Activity">
      <h2>Activity</h2>
      <form id="activity-filter"><label>Show <select name="category" data-testid="activity-category">
        <option value="">Everything</option>${CATEGORIES.map((c) => `<option ${c === category ? "selected" : ""}>${c}</option>`).join("")}
      </select></label></form>
      ${entries.length === 0 ? '<p class="muted" data-testid="no-activity">No activity to show.</p>' : `
      <table data-testid="activity-table">
        <thead><tr><th align="left">Time</th><th align="left">Person</th><th align="left">Category</th><th align="left">What happened</th></tr></thead>
        <tbody>
        ${entries.map((e) => `<tr><td>${new Date(e.at).toLocaleString("en-US")}</td><td>${e.by}</td><td>${e.category}</td><td>${e.text}</td></tr>`).join("")}
        </tbody>
      </table>`}
    </section>`;
  root.querySelector("[data-testid=activity-category]").addEventListener("change", (event) => {
    category = event.target.value;
    draw();
  });
}

registerScreen("/activity", "Activity", render);
