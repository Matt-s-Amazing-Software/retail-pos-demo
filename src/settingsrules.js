// Reading the Settings form. Pure, so the rules can be tested.
export function parseSettings(input) {
  const storeName = String(input.storeName || "").trim();
  if (!storeName) return { error: "Give the store a name." };
  const percent = Number(input.taxPercent);
  if (String(input.taxPercent).trim() === "" || !Number.isFinite(percent) || percent < 0 || percent > 25) return { error: "Enter a tax rate between 0 and 25, such as 8.25." };
  const taxRate = percent / 100; // the form asks for a percentage; the rest of the app uses a fraction
  const float = Math.round(Number(input.floatDollars) * 100);
  if (!Number.isFinite(float) || float < 0) return { error: "Enter the opening cash float in dollars." };
  const lowText = String(input.lowStock ?? "5").trim();
  if (!/^\d{1,4}$/.test(lowText)) return { error: "Enter a whole number for the low stock warning." };
  const storeAddress = String(input.storeAddress ?? "").trim();
  const storePhone = String(input.storePhone ?? "").trim();
  if (storeAddress.length > 80 || storePhone.length > 80) return { error: "Keep the address and phone number under 80 characters." };
  return { settings: { storeName, taxRate, float, lowStock: Number(lowText), storeAddress, storePhone } };
}
