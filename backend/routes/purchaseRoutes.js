const express = require("express");

const {
  addPurchase,
  getAllPurchases,
} = require("../handlers/purchaseHandler");

const router = express.Router();

router.post("/api/purchases", addPurchase);

router.get("/api/purchases", getAllPurchases);

module.exports = router;