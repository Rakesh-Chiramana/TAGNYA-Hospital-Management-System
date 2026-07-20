const express = require("express");

const {
    saveSale,
    listSales,
    fetchSalesItems
} = require("../handlers/salesHandler");

const router = express.Router();

router.post("/api/sales", saveSale);
router.get("/api/sales", listSales);
router.get("/api/sales/items", fetchSalesItems);

module.exports = router;