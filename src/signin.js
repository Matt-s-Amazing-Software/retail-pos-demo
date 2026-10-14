// The Sign in screen: choose who you are and enter a PIN.
import { registerScreen, draw } from "./router.js";
import { USERS, authenticate } from "./users.js";
import { save, state } from "./store.js";

let error = null;

function render(root) {
  const shown = error;
  error = null;
  root.innerHTML = `
    <section class="panel signin" aria-label="Sign in">
      <h2>Sign in</h2>
      ${shown ? `<p class="notice error" role="alert" data-testid="signin-error">${shown}</p>` : ""}
      <form id="signin-form">
        <p><label>Cashier <select name="user" data-testid="signin-user">${USERS.map((u) => `<option value="${u.id}">${u.name} (${u.role})</option>`).join("")}</select></label></p>
        <p><label>PIN <input name="pin" type="password" inputmode="numeric" autocomplete="off" data-testid="signin-pin"></label></p>
        <button class="primary" type="submit" data-testid="signin-submit">Sign in</button>
      </form>
    </section>`;
  root.querySelector("#signin-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const user = authenticate(USERS, event.target.user.value, event.target.pin.value);
    if (!user) error = "That PIN is not right.";
    else {
      state.currentUser = user.id;
      save();
      location.hash = "#/register";
    }
    draw();
  });
}

registerScreen("/signin", "Sign in", render, { hidden: true, public: true });
