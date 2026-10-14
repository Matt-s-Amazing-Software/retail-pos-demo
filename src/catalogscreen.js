// The Catalog screen (admin): add products, change prices, switch products on or off.
import { registerScreen, draw } from "./router.js";
import { addProduct, setActive, setPrice, validateProduct } from "./catalogrules.js";
import { money } from "./money.js";
import { noticeHtml } from "./notice.js";
import { parseAmount } from "./payments.js";
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
        <thead><tr><th align="left">SKU</th><th align="left">Name</th><th align="left">Price</th><th align="left">On sale</th></tr></thead>
        <tbody>
        ${state.catalog.map((p) => `
          <tr data-sku="${p.sku}">
            <td>${p.sku}</td><td>${p.name}</td>
            <td><input class="price" data-price="${p.sku}" value="${(p.price / 100).toFixed(2)}" aria-label="Price of ${p.name}" size="7"></td>
            <td><label><input type="checkbox" data-active="${p.sku}" ${p.active ? "checked" : ""} aria-label="${p.name} is on sale"> On sale</label></td>
          </tr>`).join("")}
        </tbody>
      </table>
      <h3>Add a product</h3>
      <form id="add-product">
        <label>SKU <input name="sku" data-testid="new-sku" size="10"></label>
        <label>Name <input name="name" data-testid="new-name"></label>
        <label>Price <input name="price" data-testid="new-price" size="7" inputmode="decimal"></label>
        <button class="primary" type="submit" data-testid="add-product">Add product</button>
      </form>
    </section>`;
  root.querySelectorAll("[data-active]").forEach((box) =>
    box.addEventListener("change", () => {
      state.catalog = setActive(state.catalog, box.dataset.active, box.checked);
      save();
      draw();
    }));
  root.querySelectorAll("[data-price]").forEach((input) =>
    input.addEventListener("change", () => {
      const price = parseAmount(input.value);
      if (!price) message = { error: true, text: "Enter a price above zero, like 12.50." };
      else state.catalog = setPrice(state.catalog, input.dataset.price, price);
      save();
      draw();
    }));
  root.querySelector("#add-product").addEventListener("submit", (event) => {
    event.preventDefault();
    const f = event.target;
    const product = { sku: f.sku.value, name: f.name.value, price: parseAmount(f.price.value) };
    const error = validateProduct(state.catalog, product);
    if (error) message = { error: true, text: error };
    else {
      state.catalog = addProduct(state.catalog, product);
      message = { error: false, text: `${product.name.trim()} added.` };
      save();
    }
    draw();
  });
}

registerScreen("/catalog", "Catalog", render);
