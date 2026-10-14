// The app's state, kept in the browser's local storage. There is no server and no real data.
const KEY = "retail-pos-demo/v1";
const fresh = () => ({ cart: [], sales: [], returns: [], nextOrder: 1001, nextReturn: 1 });

function load() {
  try {
    return { ...fresh(), ...(JSON.parse(localStorage.getItem(KEY)) || {}) };
  } catch {
    return fresh();
  }
}

export const state = load();

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage can be unavailable (private windows); the app still works for this visit */
  }
}

export function resetAll() {
  Object.assign(state, fresh());
  save();
}
