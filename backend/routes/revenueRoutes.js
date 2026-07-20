const express = require("express");
const router = express.Router();

const {
  createRevenue,
  getRevenueList,
  markPaid
} = require("../handlers/revenueHandler");

// Create Revenue Entry
router.post("/create", createRevenue);

// Get All Revenue
router.get("/list", getRevenueList);

// Mark Revenue Paid
router.put("/paid/:id", markPaid);

module.exports = router;