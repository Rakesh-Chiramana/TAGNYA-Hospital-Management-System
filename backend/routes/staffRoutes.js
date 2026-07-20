const express = require("express");
const router = express.Router();

const {
  addStaff,
  getStaff,
  getSingleStaff,
  modifyStaff,
  removeStaff,
  changeStatus,
} = require("../handlers/staffHandler");

// GET all staff
router.get("/api/staff", getStaff);

// GET single staff member
router.get("/api/staff/:staffId", getSingleStaff);

// CREATE new staff member
router.post("/api/staff", addStaff);

// UPDATE staff member
router.put("/api/staff/:staffId", modifyStaff);

// DELETE staff member
router.delete("/api/staff/:staffId", removeStaff);

// UPDATE staff status
router.put("/api/staff/:staffId/status", changeStatus);

module.exports = router;
