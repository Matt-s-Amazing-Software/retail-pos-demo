// Entry point: draws the navigation and the screen for the current #/route.
const ROUTES = {};

export function registerScreen(path, label, render) {
  ROUTES[path] = { label, render };
}

function currentPath() {
  return (location.hash.replace(/^#/, "") || "/register").split("?")[0];
}

function draw() {
  const path = currentPath();
  const app = document.getElementById("app");
  document.getElementById("nav").innerHTML = Object.entries(ROUTES)
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
