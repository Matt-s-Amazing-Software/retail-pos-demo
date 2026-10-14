import { USERS, canOpen } from "./users.js";
import { log } from "./activitylog.js";
import { save, state } from "./store.js";

// Draws the navigation and the screen for the current #/route.
const ROUTES = {};

// `hidden` screens are reachable by link but do not get a tab in the navigation.
export function registerScreen(path, label, render, { hidden = false, public: isPublic = false } = {}) {
  ROUTES[path] = { label, render, hidden, isPublic };
}

// The query part of the address, such as #/receipt?order=1001 -> { order: "1001" }.
export function currentQuery() {
  return Object.fromEntries(new URLSearchParams(location.hash.split("?")[1] || ""));
}

function currentPath() {
  return (location.hash.replace(/^#/, "") || "/register").split("?")[0];
}

function draw() {
  const path = currentPath();
  const app = document.getElementById("app");
  const user = USERS.find((u) => u.id === state.currentUser) || null;
  const screen = ROUTES[path];
  if (!user && !(screen && screen.isPublic)) {
    location.hash = "#/signin"; // everything except signing in needs a signed-in person
    return;
  }
  document.getElementById("whoami").innerHTML = user
    ? `<span data-testid="whoami">${user.name} (${user.role})</span> <button id="signout" data-testid="signout">Sign out</button>`
    : "";
  const signout = document.getElementById("signout");
  if (signout) signout.addEventListener("click", () => { log("Sign-ins", "Signed out"); state.currentUser = null; save(); draw(); });
  document.getElementById("nav").innerHTML = Object.entries(ROUTES)
    .filter(([p, r]) => !r.hidden && canOpen(user, p))
    .map(([p, r]) => `<a href="#${p}" ${p === path ? 'aria-current="page"' : ""}>${r.label}</a>`)
    .join("");
  app.innerHTML = "";
  if (!screen) app.textContent = "Nothing here yet.";
  else if (!screen.isPublic && !canOpen(user, path)) app.innerHTML = '<section class="panel"><h2>Managers only</h2><p class="muted" data-testid="managers-only">Ask a manager to open this screen.</p></section>';
  else screen.render(app);
}

window.addEventListener("hashchange", draw);
window.addEventListener("DOMContentLoaded", draw);
export { draw };
