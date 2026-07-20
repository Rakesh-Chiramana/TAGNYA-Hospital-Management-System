const express = require("express");

const router = express.Router();

const expenseHandler = require("../handlers/expenseHandler");

router.post("/save", expenseHandler.saveExpenseBill);

router.get("/all", expenseHandler.getExpenseBills);

router.delete("/delete", expenseHandler.deleteExpenseBill);

router.delete("/delete-by-ids", expenseHandler.deleteExpenseBillsByIds);

module.exports = router;