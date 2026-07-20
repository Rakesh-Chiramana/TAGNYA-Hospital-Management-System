const express = require("express");

const {
  createDoctor,
  getAllDoctors,
  getDoctor,
  updateStatus,
  deleteDoctor,
} = require("../handlers/doctorHandler");

const router = express.Router();

// Add Doctor
router.post("/api/doctors", createDoctor);

// Get All Doctors
router.get("/api/doctors", getAllDoctors);

// Get Single Doctor
router.get("/api/doctors/:doctorId", getDoctor);

// Update Doctor Status
router.put("/api/doctors/:doctorId/status", updateStatus);

// Delete Doctor
router.delete("/api/doctors/:doctorId", deleteDoctor);

module.exports = router;