// Light and dark themes. The choice is remembered on this device (not with the shop's data).
const KEY = "retail-pos-demo/theme";

// Pure: which theme to use given what was stored and what the device prefers.
export const pickTheme = (stored, prefersDark) => (stored === "dark" || stored === "light" ? stored : prefersDark ? "dark" : "light");
export const otherTheme = (theme) => (theme === "dark" ? "light" : "dark");

function stored() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const button = document.getElementById("theme-toggle");
  if (button) {
    button.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    button.setAttribute("aria-pressed", String(theme === "dark"));
  }
}

export function startTheme() {
  applyTheme(pickTheme(stored(), window.matchMedia("(prefers-color-scheme: dark)").matches));
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = otherTheme(document.documentElement.dataset.theme);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* the choice just will not be remembered */
    }
    applyTheme(next);
  });
}
