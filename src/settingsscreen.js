// The Settings screen (manager): store name, sales tax rate and the opening cash float.
import { registerScreen, draw } from "./router.js";
import { parseSettings } from "./settingsrules.js";
import { noticeHtml } from "./notice.js";
import { log } from "./activitylog.js";
import { save, state } from "./store.js";

let message = null;

function render(root) {
  const shown = message;
  message = null;
  const s = state.settings;
  root.innerHTML = `
    <section class="panel" aria-label="Settings">
      <h2>Settings</h2>
      ${noticeHtml(shown, "settings-message")}
      <form id="settings-form">
        <p><label>Store name <input name="storeName" value="${s.storeName}" data-testid="setting-name"></label></p>
        <p><label>Store address <input name="storeAddress" value="${s.storeAddress ?? ""}" size="40" data-testid="setting-address"></label></p>
        <p><label>Store phone <input name="storePhone" value="${s.storePhone ?? ""}" size="20" data-testid="setting-phone"></label></p>
        <p><label>Sales tax rate (%) <input name="taxPercent" value="${Math.round(s.taxRate * 10000) / 100}" size="6" inputmode="decimal" data-testid="setting-tax"></label></p>
        <p><label>Opening cash float ($) <input name="floatDollars" value="${(s.float / 100).toFixed(2)}" size="8" inputmode="decimal" data-testid="setting-float"></label></p>
        <p><label>Low stock warning at (units) <input name="lowStock" value="${s.lowStock ?? 5}" size="5" inputmode="numeric" data-testid="setting-low-stock"></label></p>
        <button class="primary" type="submit" data-testid="save-settings">Save settings</button>
      </form>
    </section>`;
  root.querySelector("#settings-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const f = event.target;
    const result = parseSettings({ storeName: f.storeName.value, taxPercent: f.taxPercent.value, floatDollars: f.floatDollars.value, lowStock: f.lowStock.value, storeAddress: f.storeAddress.value, storePhone: f.storePhone.value });
    if (result.error) message = { error: true, text: result.error };
    else {
      state.settings = result.settings;
      log("Settings", "Settings saved");
      message = { error: false, text: "Settings saved." };
      save();
    }
    draw();
  });
}

registerScreen("/settings", "Settings", render);
