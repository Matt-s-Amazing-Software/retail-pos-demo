// The activity log: who did what, newest kept. Pure functions on a list of entries.
export const CATEGORIES = ["Sales", "Returns", "Voids", "Catalog", "Settings", "Sessions", "Gift cards", "Sign-ins"];
export const MAX_ENTRIES = 500;

export function record(activity, entry) {
  return [...activity, entry].slice(-MAX_ENTRIES);
}

// Newest first, optionally only one category.
export function filterActivity(activity, category) {
  return [...activity].reverse().filter((e) => !category || e.category === category);
}
