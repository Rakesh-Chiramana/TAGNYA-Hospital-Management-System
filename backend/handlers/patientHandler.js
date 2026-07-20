const {
  registerPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require("../business/patientBusiness");

// Register a new patient
const createPatient = (req, res) => {
  const patientData = req.body;

  registerPatient(patientData, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error registering patient",
        error: err.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      patient: result,
    });
  });
};

// Get all patients
const getAllPatients = (req, res) => {
  getPatients((err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error fetching patients",
        error: err.message,
      });
    }

    res.json({
      success: true,
      count: result.length,
      patients: result,
    });
  });
};

// Get patient by ID
const getPatient = (req, res) => {
  const { patientId } = req.params;

  getPatientById(patientId, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error fetching patient",
        error: err.message,
      });
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({
      success: true,
      patient: result,
    });
  });
};

// Update patient
const modifyPatient = (req, res) => {
  const { patientId } = req.params;
  const patientData = req.body;

  updatePatient(patientId, patientData, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error updating patient",
        error: err.message,
      });
    }

    res.json({
      success: true,
      message: "Patient updated successfully",
      patient: result,
    });
  });
};

// Delete patient
const removePatient = (req, res) => {
  const { patientId } = req.params;

  deletePatient(patientId, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error deleting patient",
        error: err.message,
      });
    }

    res.json({
      success: true,
      message: "Patient deleted successfully",
    });
  });
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatient,
  modifyPatient,
  removePatient,
};
