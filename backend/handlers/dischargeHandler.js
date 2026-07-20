const dischargeBusiness = require("../business/dischargeBusiness");

// ==============================
// Get All Patients
// ==============================
const getPatients = async (req, res) => {
    try {
        const patients = await dischargeBusiness.getPatients();

        res.status(200).json({
            success: true,
            data: patients
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch patients"
        });

    }
};

// ==============================
// Get Patient By Id
// ==============================
const getPatientById = async (req, res) => {

    try {

        const patient = await dischargeBusiness.getPatientById(req.params.id);

        res.status(200).json({
            success: true,
            data: patient
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch patient"
        });

    }

};

// ==============================
// Save Discharge Summary
// ==============================
const saveDischarge = async (req, res) => {

    if (!req.body || !req.body.patient_id) {
        return res.status(400).json({
            success: false,
            message: "patient_id is required"
        });
    }

    try {

        const result = await dischargeBusiness.saveDischarge(req.body);

        res.status(201).json({
            success: true,
            message: "Discharge Summary Saved Successfully",
            data: result
        });

    } catch (error) {

        console.error("Discharge save error:", error);

        res.status(500).json({
            success: false,
            message: error?.message || "Failed to Save Discharge Summary"
        });

    }

};

// ==============================
// Update Discharge Summary
// ==============================
const updateDischarge = async (req, res) => {

    try {

        const result = await dischargeBusiness.updateDischarge(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Discharge Summary Updated Successfully",
            data: result
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Update Failed"
        });

    }

};

// ==============================
// Delete Discharge Summary
// ==============================
const deleteDischarge = async (req, res) => {

    try {

        const result = await dischargeBusiness.deleteDischarge(req.params.id);

        res.status(200).json({
            success: true,
            message: "Deleted Successfully",
            data: result
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Delete Failed"
        });

    }

};

module.exports = {

    getPatients,
    getPatientById,
    saveDischarge,
    updateDischarge,
    deleteDischarge

};