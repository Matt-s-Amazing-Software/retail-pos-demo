// The shop's products (a made-up gift shop). Prices are in cents.
export const PRODUCTS = [
  { sku: "MUG-01", name: "Ceramic Mug", price: 1200 },
  { sku: "TEA-02", name: "Loose Leaf Tea", price: 850 },
  { sku: "BAG-03", name: "Canvas Tote", price: 1500 },
  { sku: "CND-04", name: "Soy Candle", price: 1800 },
  { sku: "NTB-05", name: "Notebook", price: 625 },
  { sku: "PEN-06", name: "Gel Pen Set", price: 475 },
];

export const productBySku = (sku) => PRODUCTS.find((p) => p.sku === sku);
