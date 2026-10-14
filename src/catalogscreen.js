// The Catalog screen (admin): add products, change prices, switch products on or off.
import { registerScreen, draw } from "./router.js";
import { addProduct, setActive, setPrice, validateProduct } from "./catalogrules.js";
import { money } from "./money.js";
import { noticeHtml } from "./notice.js";
import { parseAmount } from "./payments.js";
import { isLow, parseStock, setStock, stockOf } from "./stock.js";
import { log } from "./activitylog.js";
import { save, state } from "./store.js";

let message = null;

function render(root) {
  const shown = message;
  message = null;
  root.innerHTML = `
    <section class="panel" aria-label="Catalog">
      <h2>Catalog</h2>
      ${noticeHtml(shown, "catalog-message")}
      <table data-testid="catalog-table">
        <thead><tr><th align="left">SKU</th><th align="left">Name</th><th align="left">Price</th><th align="left">Stock</th><th align="left">On sale</th></tr></thead>
        <tbody>
        ${state.catalog.map((p) => `
          <tr data-sku="${p.sku}">
            <td>${p.sku}</td><td>${p.name}</td>
            <td><input class="price" data-price="${p.sku}" value="${(p.price / 100).toFixed(2)}" aria-label="Price of ${p.name}" size="7"></td>
            <td><input class="stock" data-stock="${p.sku}" value="${Number.isFinite(p.stock) ? p.stock : ""}" aria-label="Stock of ${p.name}" size="5" inputmode="numeric">
              ${stockOf(p) === 0 ? '<span class="tag out">Out of stock</span>' : isLow(p, state.settings.lowStock ?? 5) ? '<span class="tag low">Low stock</span>' : ""}</td>
            <td><label><input type="checkbox" data-active="${p.sku}" ${p.active ? "checked" : ""} aria-label="${p.name} is on sale"> On sale</label></td>
          </tr>`).join("")}
        </tbody>
      </table>
      <h3>Add a product</h3>
      <form id="add-product">
        <label>SKU <input name="sku" data-testid="new-sku" size="10"></label>
        <label>Name <input name="name" data-testid="new-name"></label>
        <label>Price <input name="price" data-testid="new-price" size="7" inputmode="decimal"></label>
        <label>Stock <input name="stock" data-testid="new-stock" size="5" inputmode="numeric" value="0"></label>
        <button class="primary" type="submit" data-testid="add-product">Add product</button>
      </form>
    </section>`;
  root.querySelectorAll("[data-active]").forEach((box) =>
    box.addEventListener("change", () => {
      const product = state.catalog.find((p) => p.sku === box.dataset.active);
      state.catalog = setActive(state.catalog, box.dataset.active, box.checked);
      log("Catalog", `${product.name} ${box.checked ? "put on sale" : "taken off sale"}`);
      save();
      draw();
    }));
  root.querySelectorAll("[data-price]").forEach((input) =>
    input.addEventListener("change", () => {
      const price = parseAmount(input.value);
      if (!price) message = { error: true, text: "Enter a price above zero, like 12.50." };
      else {
        const product = state.catalog.find((p) => p.sku === input.dataset.price);
        log("Catalog", `Price of ${product.name} changed from ${money(product.price)} to ${money(price)}`);
        state.catalog = setPrice(state.catalog, input.dataset.price, price);
      }
      save();
      draw();
    }));
  root.querySelectorAll("[data-stock]").forEach((input) =>
    input.addEventListener("change", () => {
      const stock = parseStock(input.value);
      if (stock === null) message = { error: true, text: "Enter a whole number of 0 or more for the stock." };
      else {
        const product = state.catalog.find((p) => p.sku === input.dataset.stock);
        log("Catalog", `Stock of ${product.name} changed from ${product.stock} to ${stock}`);
        state.catalog = setStock(state.catalog, input.dataset.stock, stock);
      }
      save();
      draw();
    }));
  root.querySelector("#add-product").addEventListener("submit", (event) => {
    event.preventDefault();
    const f = event.target;
    const product = { sku: f.sku.value, name: f.name.value, price: parseAmount(f.price.value), stock: parseStock(f.stock.value) };
    const error = validateProduct(state.catalog, product);
    if (error) message = { error: true, text: error };
    else {
      state.catalog = addProduct(state.catalog, product);
      log("Catalog", `Added ${product.name.trim()} (${product.sku.trim().toUpperCase()}) at ${money(product.price)}`);
      message = { error: false, text: `${product.name.trim()} added.` };
      save();
    }
    draw();
  });
}

registerScreen("/catalog", "Catalog", render);
