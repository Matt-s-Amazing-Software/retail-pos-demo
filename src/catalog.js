// The shop's products (a made-up gift shop). Prices are in cents.
export const PRODUCTS = [
  { sku: "MUG-01", stock: 24, name: "Ceramic Mug", price: 1200 },
  { sku: "TEA-02", stock: 40, name: "Loose Leaf Tea", price: 850 },
  { sku: "BAG-03", stock: 12, name: "Canvas Tote", price: 1500 },
  { sku: "CND-04", stock: 15, name: "Soy Candle", price: 1800 },
  { sku: "NTB-05", stock: 50, name: "Notebook", price: 625 },
  { sku: "PEN-06", stock: 30, name: "Gel Pen Set", price: 475 },
];

export const productBySku = (sku) => PRODUCTS.find((p) => p.sku === sku);
