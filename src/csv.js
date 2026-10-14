// Turning orders into CSV text for a spreadsheet. Pure.
// A field containing a comma, a quote or a line break is wrapped in quotes, with inner quotes doubled.
export const csvField = (value) => (/[",\n\r]/.test(String(value)) ? `"${String(value).replace(/"/g, '""')}"` : String(value));

export function ordersToCsv(sales) {
  const header = "order,time,items,paid_by,total";
  const rows = sales.map((s) =>
    [s.id, s.at, s.lines.map((l) => `${l.name} x${l.qty}`).join(", "), s.method, (s.total / 100).toFixed(2)].map(csvField).join(","));
  return [header, ...rows].join("\n") + "\n";
}
