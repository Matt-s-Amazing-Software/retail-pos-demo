// The app's state, kept in the browser's local storage. There is no server and no real data.
const KEY = "retail-pos-demo/v1";
import { PRODUCTS } from "./catalog.js";

// A session is one shift on the register: it opens with a cash float and ends with a count of the drawer.
export const newSession = () => ({ openedAt: new Date().toISOString(), float: 10000, closedAt: null, result: null });
const fresh = () => ({ cart: [], sales: [], returns: [], held: [], catalog: PRODUCTS.map((p) => ({ ...p, active: true })), nextOrder: 1001, nextReturn: 1, session: newSession() });

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
