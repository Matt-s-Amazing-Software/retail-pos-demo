// Who can sign in and what each role may open. The people and PINs are made up for the demo.
export const USERS = [
  { id: "morgan", name: "Morgan Lee", role: "manager", pin: "1234" },
  { id: "casey", name: "Casey Brooks", role: "cashier", pin: "0000" },
];

// Screens only a manager may open.
export const MANAGER_ONLY = ["/catalog", "/settings", "/reports", "/giftcards"];

export function authenticate(users, id, pin) {
  const user = users.find((u) => u.id === id);
  return user && user.pin === String(pin).trim() ? user : null;
}

export function canOpen(user, path) {
  if (!user) return false;
  return user.role === "manager" || !MANAGER_ONLY.includes(path);
}
