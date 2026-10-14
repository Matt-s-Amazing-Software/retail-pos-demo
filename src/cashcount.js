// Closing the till: pure functions. The cashier counts first and sees the expected amount only afterwards
// (a "blind" count), so the count cannot be nudged toward the number the system expects.
export const DENOMINATIONS = [
  { cents: 10000, label: "$100 bills" }, { cents: 5000, label: "$50 bills" }, { cents: 2000, label: "$20 bills" },
  { cents: 1000, label: "$10 bills" }, { cents: 500, label: "$5 bills" }, { cents: 100, label: "$1 bills" },
  { cents: 25, label: "Quarters" }, { cents: 10, label: "Dimes" }, { cents: 5, label: "Nickels" }, { cents: 1, label: "Pennies" },
];

export const countedTotal = (counts) =>
  DENOMINATIONS.reduce((sum, d) => sum + d.cents * (Number(counts[d.cents]) || 0), 0);

// Cash that should be in the drawer: the opening float, plus cash sales, minus cash refunds, since the session opened.
export function expectedCash(session, sales, returns) {
  const since = (x) => x.at >= session.openedAt;
  const cashIn = sales.filter((s) => since(s) && s.method === "cash").reduce((sum, s) => sum + s.total, 0);
  const cashOut = returns.filter((r) => since(r) && r.method === "cash").reduce((sum, r) => sum + r.total, 0);
  return session.float + cashIn - cashOut;
}

export const variance = (counted, expected) => counted - expected;
