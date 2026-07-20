const db = require("../config/db");

const normalizePurchaseData = (purchaseData = {}) => ({
  medicine_name: purchaseData.medicine_name ?? purchaseData.medicineName ?? "",
  hsn_code: purchaseData.hsn_code ?? purchaseData.hsnCode ?? "",
  company: purchaseData.company ?? purchaseData.companyName ?? "",
  batch_no: purchaseData.batch_no ?? purchaseData.batchNo ?? "",
  qty: Number(purchaseData.qty ?? purchaseData.quantity ?? 0),
  qty_free: Number(purchaseData.qty_free ?? purchaseData.qtyFree ?? 0),
  purchase_price: Number(purchaseData.purchase_price ?? purchaseData.purchasePrice ?? 0),
  mrp: Number(purchaseData.mrp ?? 0),
  expiry_date: purchaseData.expiry_date ?? purchaseData.expiryDate ?? "",
  discount_percent: Number(purchaseData.discount_percent ?? purchaseData.discount ?? 0),
  tax_percent: Number(purchaseData.tax_percent ?? purchaseData.tax ?? 0),
  supplier_name: purchaseData.supplier_name ?? purchaseData.supplierName ?? "",
  invoice_no: purchaseData.invoice_no ?? purchaseData.invoiceNo ?? "",
  invoice_date: purchaseData.invoice_date ?? purchaseData.invoiceDate ?? "",
  payment_mode: purchaseData.payment_mode ?? purchaseData.paymentMode ?? "",
  paid_amount: Number(purchaseData.paid_amount ?? purchaseData.paidAmount ?? 0),
  grand_total: Number(purchaseData.grand_total ?? purchaseData.grandTotal ?? 0),
});

const createPurchase = (purchaseData, callback) => {
  const normalizedData = normalizePurchaseData(purchaseData);

  const sql = `
    INSERT INTO purchases
    (
      medicine_name,
      hsn_code,
      company,
      batch_no,
      qty,
      qty_free,
      purchase_price,
      mrp,
      expiry_date,
      discount_percent,
      tax_percent,
      supplier_name,
      invoice_no,
      invoice_date,
      payment_mode,
      paid_amount,
      grand_total
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      normalizedData.medicine_name,
      normalizedData.hsn_code,
      normalizedData.company,
      normalizedData.batch_no,
      normalizedData.qty,
      normalizedData.qty_free,
      normalizedData.purchase_price,
      normalizedData.mrp,
      normalizedData.expiry_date,
      normalizedData.discount_percent,
      normalizedData.tax_percent,
      normalizedData.supplier_name,
      normalizedData.invoice_no,
      normalizedData.invoice_date,
      normalizedData.payment_mode,
      normalizedData.paid_amount,
      normalizedData.grand_total,
    ],
    callback
  );
};

const getPurchases = (callback) => {
  db.query(
    "SELECT * FROM purchases ORDER BY id DESC",
    callback
  );
};

module.exports = {
  createPurchase,
  getPurchases,
};