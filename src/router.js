// Draws the navigation and the screen for the current #/route.
const ROUTES = {};

// `hidden` screens are reachable by link but do not get a tab in the navigation.
export function registerScreen(path, label, render, { hidden = false } = {}) {
  ROUTES[path] = { label, render, hidden };
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
  document.getElementById("nav").innerHTML = Object.entries(ROUTES)
    .filter(([, r]) => !r.hidden)
    .map(([p, r]) => `<a href="#${p}" ${p === path ? 'aria-current="page"' : ""}>${r.label}</a>`)
    .join("");
  const screen = ROUTES[path];
  app.innerHTML = "";
  if (screen) screen.render(app);
  else app.textContent = "Nothing here yet.";
}

window.addEventListener("hashchange", draw);
window.addEventListener("DOMContentLoaded", draw);
export { draw };
