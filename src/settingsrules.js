// Reading the Settings form. Pure, so the rules can be tested.
export function parseSettings(input) {
  const storeName = String(input.storeName || "").trim();
  if (!storeName) return { error: "Give the store a name." };
  const taxRate = Number(input.taxPercent);
  if (!Number.isFinite(taxRate) || taxRate < 0) return { error: "Enter a tax rate such as 8.25." };
  const float = Math.round(Number(input.floatDollars) * 100);
  if (!Number.isFinite(float) || float < 0) return { error: "Enter the opening cash float in dollars." };
  return { settings: { storeName, taxRate, float } };
}
