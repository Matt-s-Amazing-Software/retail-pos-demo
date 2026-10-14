// Turning orders into CSV text for a spreadsheet. Pure.
export function ordersToCsv(sales) {
  const header = "order,time,items,paid_by,total";
  const rows = sales.map((s) =>
    [s.id, s.at, s.lines.map((l) => `${l.name} x${l.qty}`).join(", "), s.method, (s.total / 100).toFixed(2)].join(","));
  return [header, ...rows].join("\n") + "\n";
}
