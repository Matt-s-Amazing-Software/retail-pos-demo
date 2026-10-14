// Voiding a completed sale. Pure functions.
// Who may void it, and whether it still can be: a manager, once, before anything was returned,
// and only while the session it was sold in is still open.
export function voidProblem(sale, returns, session, user, reason) {
  if (!user || user.role !== "manager") return "Only a manager can void an order.";
  if (sale.voided) return "This order was already voided.";
  if (returns.some((r) => r.orderId === sale.id)) return "An order that has been returned cannot be voided.";
  if (session.closedAt || sale.at < session.openedAt) return "Only orders from the current session can be voided.";
  if (!String(reason || "").trim()) return "Give a reason for voiding the order.";
  return null;
}

export const markVoided = (sale, user, reason, now = new Date()) =>
  ({ ...sale, voided: { at: now.toISOString(), by: user.id, reason: String(reason).trim() } });
