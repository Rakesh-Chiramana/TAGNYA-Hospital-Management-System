const express = require("express");
const router = express.Router();

const {
  createPatient,
  getAllPatients,
  getPatient,
  modifyPatient,
  removePatient,
} = require("../handlers/patientHandler");

// GET all patients
router.get("/api/patients", getAllPatients);

// GET patient by ID
router.get("/api/patients/:patientId", getPatient);

// CREATE (register) new patient
router.post("/api/patients", createPatient);

// UPDATE patient
router.put("/api/patients/:patientId", modifyPatient);

// DELETE patient
router.delete("/api/patients/:patientId", removePatient);

module.exports = router;