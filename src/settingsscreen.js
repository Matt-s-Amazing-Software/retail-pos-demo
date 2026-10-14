// The Settings screen (manager): store name, sales tax rate and the opening cash float.
import { registerScreen, draw } from "./router.js";
import { parseSettings } from "./settingsrules.js";
import { save, state } from "./store.js";

let message = null;

function render(root) {
  const shown = message;
  message = null;
  const s = state.settings;
  root.innerHTML = `
    <section class="panel" aria-label="Settings">
      <h2>Settings</h2>
      ${shown ? `<p class="notice ${shown.error ? "error" : ""}" role="status" data-testid="settings-message">${shown.text}</p>` : ""}
      <form id="settings-form">
        <p><label>Store name <input name="storeName" value="${s.storeName}" data-testid="setting-name"></label></p>
        <p><label>Sales tax rate (%) <input name="taxPercent" value="${s.taxRate * 100}" size="6" inputmode="decimal" data-testid="setting-tax"></label></p>
        <p><label>Opening cash float ($) <input name="floatDollars" value="${(s.float / 100).toFixed(2)}" size="8" inputmode="decimal" data-testid="setting-float"></label></p>
        <button class="primary" type="submit" data-testid="save-settings">Save settings</button>
      </form>
    </section>`;
  root.querySelector("#settings-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const f = event.target;
    const result = parseSettings({ storeName: f.storeName.value, taxPercent: f.taxPercent.value, floatDollars: f.floatDollars.value });
    if (result.error) message = { error: true, text: result.error };
    else {
      state.settings = result.settings;
      message = { error: false, text: "Settings saved." };
      save();
    }
    draw();
  });
}

registerScreen("/settings", "Settings", render);
