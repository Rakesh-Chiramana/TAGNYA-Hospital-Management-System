const express = require("express");
const router = express.Router();

const {
  fetchMedicines,
  addMedicine,
  fetchVendors,
  createVendor,
  toggleVendor,
  fetchPurchaseOrders,
  recordPurchaseOrder,
  recordPaymentTerm
} = require("../handlers/pharmacyHandler");

router.get("/api/medicines", fetchMedicines);
router.post("/api/medicines", addMedicine);

router.get("/api/vendors", fetchVendors);
router.post("/api/vendors", createVendor);
router.put("/api/vendors/:id/status", toggleVendor);

router.get("/api/purchase-orders", fetchPurchaseOrders);
router.post("/api/purchase-orders", recordPurchaseOrder);
router.post("/api/purchase-orders/:id/payments", recordPaymentTerm);

module.exports = router;