// Holding an order lets a cashier serve the next customer and come back to this one. Pure functions.
export function holdOrder(held, cart, note = "", now = new Date()) {
  if (cart.length === 0) return { held, error: "There is nothing to hold." };
  const id = held.reduce((max, h) => Math.max(max, h.id), 0) + 1;
  return { held: [...held, { id, at: now.toISOString(), lines: cart.map((l) => ({ ...l })), note }] };
}

// Bring a held order back. Only possible while the current order is empty, so nothing is overwritten.
export function resumeOrder(held, cart, id) {
  if (cart.length > 0) return { held, cart, note: "", error: "Finish or hold the current order before resuming another." };
  const order = held.find((h) => h.id === id);
  if (!order) return { held, cart, error: "That held order no longer exists." };
  return { held: held.filter((h) => h.id !== id), cart: order.lines.map((l) => ({ ...l })), note: order.note || "" };
}
